import { ISLANDS, ISLAND_MAP } from '../data';
import type { Island, Quest } from '../types';

export const XP = { quiz: 50, project: 150, boss: 300, islandBonus: 200 } as const;

export const questKey = (islandId: string, questId: string) => `${islandId}/${questId}`;

export const questXp = (quest: Quest) =>
  quest.boss ? XP.boss : quest.checkpoint.type === 'project' ? XP.project : XP.quiz;

/* ---------- levels ---------- */

/** XP needed to *reach* level n (level 1 = 0 XP). */
export const xpForLevel = (n: number) => Math.round(60 * (n - 1) ** 1.6);

export function levelInfo(xp: number) {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  const floor = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return { level, floor, next, progress: (xp - floor) / (next - floor) };
}

const TITLES: [number, string][] = [
  [1, 'Novice'],
  [4, 'Apprentice'],
  [8, 'Adventurer'],
  [13, 'Knight of Code'],
  [19, 'Paladin'],
  [26, 'Archmage'],
  [34, 'Hero of the Web'],
  [43, 'Living Legend'],
];
export const titleFor = (level: number) => [...TITLES].reverse().find(([l]) => level >= l)![1];

/* ---------- progression ---------- */

export type Completed = Record<string, { at: string; score?: number; repo?: string }>;

export const isQuestDone = (c: Completed, islandId: string, questId: string) => !!c[questKey(islandId, questId)];

export const islandDoneCount = (c: Completed, island: Island) =>
  island.quests.filter((q) => isQuestDone(c, island.id, q.id)).length;

export const isIslandComplete = (c: Completed, island: Island) => islandDoneCount(c, island) === island.quests.length;

export const isIslandUnlocked = (c: Completed, island: Island) =>
  island.requires.every((id) => {
    const req = ISLAND_MAP[id];
    return req ? isIslandComplete(c, req) : true;
  });

export const isQuestUnlocked = (c: Completed, island: Island, index: number) =>
  isIslandUnlocked(c, island) && (index === 0 || isQuestDone(c, island.id, island.quests[index - 1].id));

export type IslandState = 'locked' | 'open' | 'active' | 'complete';

export function islandState(c: Completed, island: Island): IslandState {
  if (isIslandComplete(c, island)) return 'complete';
  if (!isIslandUnlocked(c, island)) return 'locked';
  return islandDoneCount(c, island) > 0 ? 'active' : 'open';
}

/** Islands that become unlocked purely because `islandId` was just completed. */
export function newlyUnlockedBy(before: Completed, after: Completed, islandId: string): Island[] {
  return ISLANDS.filter(
    (i) => i.requires.includes(islandId) && !isIslandUnlocked(before, i) && isIslandUnlocked(after, i),
  );
}

export function nextQuests(c: Completed, limit = 4): { island: Island; quest: Quest; index: number }[] {
  const out: { island: Island; quest: Quest; index: number }[] = [];
  for (const island of ISLANDS) {
    if (!isIslandUnlocked(c, island) || isIslandComplete(c, island)) continue;
    const index = island.quests.findIndex((q) => !isQuestDone(c, island.id, q.id));
    out.push({ island, quest: island.quests[index], index });
  }
  // active islands (some progress) first
  out.sort((a, b) => b.index - a.index);
  return out.slice(0, limit);
}

export const TOTAL_QUESTS = ISLANDS.reduce((n, i) => n + i.quests.length, 0);

/* ---------- dates / streak ---------- */

export const today = () => toDay(new Date());
export const toDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function streak(activeDays: Record<string, number>): { current: number; best: number } {
  const days = Object.keys(activeDays).sort();
  if (!days.length) return { current: 0, best: 0 };
  let best = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    const diff = (Date.parse(days[i]) - Date.parse(days[i - 1])) / 86_400_000;
    run = Math.round(diff) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }
  // current streak counts back from today (or yesterday, so it isn't lost before you study today)
  let current = 0;
  const cursor = new Date();
  if (!activeDays[toDay(cursor)]) cursor.setDate(cursor.getDate() - 1);
  while (activeDays[toDay(cursor)]) {
    current++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { current, best };
}
