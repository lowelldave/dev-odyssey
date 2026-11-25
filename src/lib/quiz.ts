import type { QuizQuestion } from '../types';

/** Questions asked per battle, and the pool size every quiz quest is working towards. */
export const QUIZ_DRAW = 10;
export const QUIZ_POOL_TARGET = 20;
export const QUIZ_PASS_PERCENT = 75;

export const quizScore = (correct: number, n: number) => (n > 0 ? Math.round((correct / n) * 100) : 0);

/** Correct answers needed out of `n` to reach `pass` percent (10 @ 75 -> 8, 5 @ 75 -> 4, 4 @ 75 -> 3). */
// the epsilon keeps float noise (e.g. 4 * 75 / 100) from rounding a whole number up
export const neededToPass = (n: number, pass: number = QUIZ_PASS_PERCENT) => Math.ceil((n * pass) / 100 - 1e-9);

/** The single pass test: the battle, the quiz runner and the stored attempt all use it. */
export const quizPasses = (correct: number, n: number, pass: number = QUIZ_PASS_PERCENT) =>
  n > 0 && correct >= neededToPass(n, pass);

/** Question text compared case-, spacing- and punctuation-insensitively. */
export const normaliseQuestion = (text: string) =>
  text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

/** Stable, content-derived question id: FNV-1a of the normalised text, base36. */
export function questionId(text: string): string {
  let h = 0x811c9dc5;
  const s = normaliseQuestion(text);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

/** A question as asked in one attempt: options shuffled, `answer` remapped. */
export interface BattleQuestion {
  /** index into the quest's pool, remembered so a retake can avoid it */
  poolIndex: number;
  /** content-derived id, the key for weak-spot stats */
  qid: string;
  /** snapshot at draw time: missed before and not yet mastered */
  weak: boolean;
  question: string;
  options: string[];
  answer: number;
  explain?: string;
  hint?: string;
}

export function shuffle<T>(arr: readonly T[], rng: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Shuffle one question's options and remap the answer index. */
export function prepareQuestion(q: QuizQuestion, poolIndex: number, rng: () => number = Math.random, weak = false): BattleQuestion {
  const order = shuffle(
    q.options.map((_, i) => i),
    rng,
  );
  const options = order.map((i) => q.options[i]);
  const answer = order.indexOf(q.answer);
  if (import.meta.env.DEV && options[answer] !== q.options[q.answer]) {
    console.error(`[dev-odyssey] option shuffle lost the answer: "${q.question}"`);
  }
  return { poolIndex, qid: questionId(q.question), weak, question: q.question, options, answer, explain: q.explain, hint: q.hint };
}

export interface DrawOptions {
  /** weak-spot weight of a question id (0 = not weak) */
  weightOf?: (qid: string) => number;
  /** most weak questions to include (default ceil(n/2)) */
  weakCap?: number;
  /** include every weak question (training), up to the cap */
  forceWeak?: boolean;
}

/** Chance that a weak question is picked, by weight: w1 .50, w2 .65, w4 .95. */
export const weakChance = (w: number) => Math.min(0.95, 0.35 + 0.15 * w);

/**
 * Draw min(n, pool) distinct questions in random order. Weak questions (weight > 0) are exempt from `avoid`
 * and are included first, up to a cap. The rest come from fresh questions, then from those in `avoid`
 * (the previous attempt), which are used only when there are not enough fresh ones.
 */
export function drawQuestions(
  pool: readonly QuizQuestion[],
  n: number = QUIZ_DRAW,
  avoid: readonly number[] = [],
  rng: () => number = Math.random,
  opts: DrawOptions = {},
): BattleQuestion[] {
  const weightOf = opts.weightOf ?? (() => 0);
  const weights = pool.map((q) => weightOf(questionId(q.question)));
  const m = Math.min(n, pool.length);
  const indexes = pool.map((_, i) => i);
  const build = (picked: number[]) => shuffle(picked, rng).map((i) => prepareQuestion(pool[i], i, rng, weights[i] > 0));
  // a pool no bigger than the draw asks everything; weights don't matter
  if (pool.length <= n) return build(indexes);

  const skip = new Set(avoid);
  const weakIdx = indexes.filter((i) => weights[i] > 0);
  const fresh = shuffle(
    indexes.filter((i) => weights[i] <= 0 && !skip.has(i)),
    rng,
  );
  const stale = shuffle(
    indexes.filter((i) => weights[i] <= 0 && skip.has(i)),
    rng,
  );
  const cap = Math.min(opts.weakCap ?? Math.ceil(m / 2), m);
  const chosen = weakIdx
    .filter((i) => opts.forceWeak || rng() < weakChance(weights[i]))
    // heaviest first; the random tiebreak keeps equal weights from always picking the same ones
    .map((i) => ({ i, w: weights[i], r: rng() }))
    .sort((a, b) => b.w - a.w || a.r - b.r)
    .slice(0, cap)
    .map((x) => x.i);
  const left = shuffle(
    weakIdx.filter((i) => !chosen.includes(i)),
    rng,
  );
  const rest = [...fresh, ...stale, ...left].slice(0, m - chosen.length);
  if (opts.forceWeak) {
    // training leads with the weak spots: shuffle within each group, weak group first
    return [...shuffle(chosen, rng), ...shuffle(rest, rng)].map((i) => prepareQuestion(pool[i], i, rng, weights[i] > 0));
  }
  // the final shuffle in `build` hides which questions were weak or reused
  return build([...chosen, ...rest]);
}
