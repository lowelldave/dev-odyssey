import type { Island, Region } from '../types';
import { AI } from './ai';
import { CORE } from './core';
import { POLYGLOT } from './polyglot';
import { STACKS } from './stacks';

export const ISLANDS: Island[] = [...CORE, ...POLYGLOT, ...STACKS, ...AI];

export const ISLAND_MAP: Record<string, Island> = Object.fromEntries(ISLANDS.map((i) => [i.id, i]));

/** Dev-only sanity checks for hand-written content. */
if (import.meta.env.DEV) {
  const problems: string[] = [];
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
        quest.checkpoint.questions.forEach((q, i) => {
          if (q.answer < 0 || q.answer >= q.options.length) problems.push(`${island.id}/${quest.id} q${i + 1}: bad answer index`);
        });
      }
    });
    if (!island.quests.at(-1)?.boss) problems.push(`${island.id}: last quest should be a boss`);
  }
  if (problems.length) console.error('[dev-odyssey] content problems:\n' + problems.join('\n'));
  else console.info(`[dev-odyssey] content OK: ${ISLANDS.length} islands`);
}

export const REGIONS: Record<Region, { name: string; desc: string; color: string }> = {
  core: { name: 'The Core Archipelago', desc: 'The main voyage from web basics to production systems.', color: '#4fb3bf' },
  polyglot: { name: 'Polyglot Isles', desc: 'Other languages and their flagship frameworks.', color: '#9b59b6' },
  stacks: { name: 'Stack Isles', desc: 'Popular stack combinations, each built end to end.', color: '#e67e22' },
  ai: { name: 'The AI Frontier', desc: 'AI from first principles to production agents.', color: '#d97757' },
};
