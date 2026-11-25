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

/** A question as asked in one attempt: options shuffled, `answer` remapped. */
export interface BattleQuestion {
  /** index into the quest's pool, remembered so a retake can avoid it */
  poolIndex: number;
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
export function prepareQuestion(q: QuizQuestion, poolIndex: number, rng: () => number = Math.random): BattleQuestion {
  const order = shuffle(
    q.options.map((_, i) => i),
    rng,
  );
  const options = order.map((i) => q.options[i]);
  const answer = order.indexOf(q.answer);
  if (import.meta.env.DEV && options[answer] !== q.options[q.answer]) {
    console.error(`[dev-odyssey] option shuffle lost the answer: "${q.question}"`);
  }
  return { poolIndex, question: q.question, options, answer, explain: q.explain, hint: q.hint };
}

/**
 * Draw min(n, pool) distinct questions in random order. Questions whose pool index is in `avoid`
 * (the previous attempt) are used only when there are not enough fresh ones.
 */
export function drawQuestions(
  pool: readonly QuizQuestion[],
  n: number = QUIZ_DRAW,
  avoid: readonly number[] = [],
  rng: () => number = Math.random,
): BattleQuestion[] {
  const skip = new Set(avoid);
  const indexes = pool.map((_, i) => i);
  const fresh = shuffle(
    indexes.filter((i) => !skip.has(i)),
    rng,
  );
  const stale = shuffle(
    indexes.filter((i) => skip.has(i)),
    rng,
  );
  const picked = [...fresh, ...stale].slice(0, Math.min(n, pool.length));
  // fresh ones come first in `picked`; shuffle again so the order carries no hint of which were reused
  return shuffle(picked, rng).map((i) => prepareQuestion(pool[i], i, rng));
}
