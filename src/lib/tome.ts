import type { Island } from '../types';

export interface TomeSection {
  quest: string;
  points: string[];
}

/**
 * An area's Tome: a recap page built from its content. A tutorial's recap wins; other quests
 * fall back to their first lessons. Nothing here is stored, so content edits show up immediately.
 */
export function tomeOf(island: Island): TomeSection[] {
  return island.quests.map((q) => ({
    quest: q.title,
    points: (q.tutorial?.recap?.length ? q.tutorial.recap : q.lessons).slice(0, 4),
  }));
}
