import type { Island, QuizQuestion, Region } from '../types';
import { QUIZ_POOL_TARGET, normaliseQuestion, questionId } from '../lib/quiz';
import { AI } from './ai';
import { CORE } from './core';
import { POLYGLOT } from './polyglot';
import { STACKS } from './stacks';
import { TUTORIALS } from './tutorials';

export { normaliseQuestion };

/** Union of two question lists, de-duplicated by normalised text; the first list's wording wins. */
function mergePools(preferred: QuizQuestion[], others: QuizQuestion[]): QuizQuestion[] {
  const seen = new Set<string>();
  const out: QuizQuestion[] = [];
  for (const question of [...preferred, ...others]) {
    const key = normaliseQuestion(question.question);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(question);
  }
  return out;
}

/** Attach step-by-step tutorials; a tutorial's quiz is added to the quest's question pool. */
function withTutorials(islands: Island[]): Island[] {
  return islands.map((island) => ({
    ...island,
    quests: island.quests.map((quest) => {
      const tutorial = TUTORIALS[`${island.id}/${quest.id}`];
      if (!tutorial) return quest;
      const checkpoint =
        tutorial.quiz && quest.checkpoint.type === 'quiz'
          ? { ...quest.checkpoint, questions: mergePools(tutorial.quiz, quest.checkpoint.questions) }
          : quest.checkpoint;
      return { ...quest, tutorial, checkpoint };
    }),
  }));
}

export const ISLANDS: Island[] = withTutorials([...CORE, ...POLYGLOT, ...STACKS, ...AI]);

export const ISLAND_MAP: Record<string, Island> = Object.fromEntries(ISLANDS.map((i) => [i.id, i]));

/** Dev-only sanity checks for hand-written content. */
if (import.meta.env.DEV) {
  const problems: string[] = [];
  // pools are still being filled, so these are warnings, not errors
  const warnings: string[] = [];
  const ids = new Set<string>();
  for (const island of ISLANDS) {
    if (ids.has(island.id)) problems.push(`duplicate island id ${island.id}`);
    ids.add(island.id);
    for (const req of island.requires) if (!ISLAND_MAP[req]) problems.push(`${island.id} requires unknown ${req}`);
    const qids = new Set<string>();
    island.quests.forEach((quest) => {
      if (qids.has(quest.id)) problems.push(`${island.id}: duplicate quest ${quest.id}`);
      qids.add(quest.id);
      if (quest.checkpoint.type === 'quiz') {
        const where = `${island.id}/${quest.id}`;
        const pool = quest.checkpoint.questions;
        if (pool.length < QUIZ_POOL_TARGET) warnings.push(`${where}: pool has ${pool.length} of ${QUIZ_POOL_TARGET} questions`);
        const texts = new Set<string>();
        const byId = new Map<string, { text: string; n: number }>();
        pool.forEach((q, i) => {
          if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) warnings.push(`${where} q${i + 1}: bad answer index`);
          if (!q.hint) warnings.push(`${where} q${i + 1}: missing hint`);
          if (!q.explain) warnings.push(`${where} q${i + 1}: missing explain`);
          const key = normaliseQuestion(q.question);
          if (texts.has(key)) warnings.push(`${where} q${i + 1}: duplicate question text`);
          texts.add(key);
          // weak-spot stats are keyed by this id, so two different questions must not share one
          const id = questionId(q.question);
          const other = byId.get(id);
          if (other && other.text !== key) problems.push(`${where} q${i + 1}: question id collision with q${other.n}`);
          else byId.set(id, { text: key, n: i + 1 });
        });
      }
    });
    if (!island.quests.at(-1)?.boss) problems.push(`${island.id}: last quest should be a boss`);
  }
  for (const key of Object.keys(TUTORIALS)) {
    const [iid, qid] = key.split('/');
    if (!ISLAND_MAP[iid]?.quests.some((q) => q.id === qid)) problems.push(`tutorial for unknown quest ${key}`);
  }
  if (problems.length) console.error('[dev-odyssey] content problems:\n' + problems.join('\n'));
  else console.info(`[dev-odyssey] content OK: ${ISLANDS.length} islands`);
  if (warnings.length) {
    // one grouped, collapsed entry: with unfinished pools this list is long
    console.groupCollapsed(`[dev-odyssey] content warnings: ${warnings.length}`);
    console.warn(warnings.join('\n'));
    console.groupEnd();
  }
}

export const REGIONS: Record<Region, { name: string; desc: string; color: string }> = {
  core: { name: 'The Heartlands', desc: 'The main quest line, from web basics to production systems.', color: '#5fae4e' },
  polyglot: { name: 'Polyglot Kingdoms', desc: 'Forest kingdoms of other languages and their flagship frameworks.', color: '#2f7d4f' },
  stacks: { name: 'Stack Frontier', desc: 'Desert outposts where popular stacks are built end to end.', color: '#d39b3a' },
  ai: { name: 'Arcane Highlands', desc: 'The magic of AI, from first principles to production agents.', color: '#8b6fd6' },
};
