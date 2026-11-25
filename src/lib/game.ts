import { ISLANDS, ISLAND_MAP } from '../data';
import type { Island, Quest } from '../types';

// the quiz and battle rules live in their own pure modules; `game` stays the one place to import them from
export * from './battle';
export * from './quiz';
export * from './items';
export * from './weak';
import { HP_MAX, REGEN_MS, maxMp, regenNow } from './battle';

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

/** Completed quests that still exist in the content (ignores stale keys from imports/old saves). */
export const countCompleted = (c: Completed) =>
  Object.keys(c).filter((k) => {
    const i = k.indexOf('/');
    const island = ISLAND_MAP[k.slice(0, i)];
    return i > 0 && !!island && island.quests.some((q) => q.id === k.slice(i + 1));
  }).length;

export const TOTAL_QUESTS = ISLANDS.reduce((n, i) => n + i.quests.length, 0);

/* ---------- dates / streak ---------- */

export const today = () => toDay(new Date());
export const toDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** A single timed session is capped so a forgotten timer can't log a whole day. */
export const MAX_SESSION_MINUTES = 180;

/**
 * Current and best streak. `rest` days (Campfire) bridge a gap and count towards the run,
 * but are not study days themselves.
 */
export function streak(
  activeDays: Record<string, number>,
  rest: Record<string, unknown> = {},
): { current: number; best: number } {
  const all: Record<string, unknown> = { ...rest, ...activeDays };
  const days = Object.keys(all).sort();
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
  if (all[toDay(cursor)] === undefined) cursor.setDate(cursor.getDate() - 1);
  while (all[toDay(cursor)] !== undefined) {
    current++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { current, best };
}

/** A gap of at most this many missed days can be bridged, and the saved streak must be at least this long. */
export const CAMPFIRE_MAX_GAP = 2;
export const CAMPFIRE_MIN_STREAK = 3;

/**
 * Which missed days the Campfire would bridge on this visit, or [] when it does not apply:
 * the gap is 1-2 days, the tokens cover all of it, and the streak being saved is at least 3 days.
 */
export function campfireDays(
  activeDays: Record<string, number>,
  rest: Record<string, unknown>,
  tokens: number,
  now: Date = new Date(),
): string[] {
  const all: Record<string, unknown> = { ...rest, ...activeDays };
  const todayKey = toDay(now);
  const last = Object.keys(all).filter((d) => d < todayKey).sort().at(-1);
  if (!last) return [];
  const missed: string[] = [];
  const cursor = new Date(`${last}T12:00:00`);
  for (cursor.setDate(cursor.getDate() + 1); toDay(cursor) < todayKey; cursor.setDate(cursor.getDate() + 1)) {
    missed.push(toDay(cursor));
    if (missed.length > CAMPFIRE_MAX_GAP) return [];
  }
  if (!missed.length || tokens < missed.length) return [];
  // length of the run that ends on `last`
  let run = 0;
  const back = new Date(`${last}T12:00:00`);
  while (all[toDay(back)] !== undefined) {
    run++;
    back.setDate(back.getDate() - 1);
  }
  return run >= CAMPFIRE_MIN_STREAK ? missed : [];
}

/* ---------- party panel ---------- */

/** Below this, HP is shown as "Wounded" (amber). It never blocks a battle: there is no minimum HP. */
export const WOUNDED_HP = 50;

export interface PartyInput {
  hp: number;
  hpAt: number | null;
  mp: number;
  mpAt: number;
  xp: number;
}

/** Seconds until the next whole point of a regenerating value, or null when full or paused. */
function nextPointSec(value: number, at: number | null, max: number, now: number): number | null {
  if (at === null || value >= max) return null;
  return Math.max(1, Math.ceil((REGEN_MS - (now - at)) / 1000));
}

/** Everything the party panel shows, derived from stored timestamps. Pure; never writes. */
export function partyStats(s: PartyInput, now: number) {
  const hp = regenNow(s.hp, s.hpAt, HP_MAX, now);
  const mpMax = maxMp(levelInfo(s.xp).level);
  const mp = regenNow(s.mp, s.mpAt, mpMax, now);
  const hpNext = nextPointSec(hp.value, hp.at, HP_MAX, now);
  const mpNext = nextPointSec(mp.value, mp.at, mpMax, now);
  const lv = levelInfo(s.xp);
  return {
    hp: {
      value: hp.value,
      max: HP_MAX,
      state: hp.value <= 0 ? ('ko' as const) : hp.value < WOUNDED_HP ? ('wounded' as const) : ('healthy' as const),
      paused: s.hpAt === null,
      nextInSec: hpNext,
      fullInSec: hpNext === null ? null : hpNext + (HP_MAX - hp.value - 1) * 60,
    },
    mp: { value: mp.value, max: mpMax, nextInSec: mpNext, fullInSec: mpNext === null ? null : mpNext + (mpMax - mp.value - 1) * 60 },
    exp: { level: lv.level, value: s.xp - lv.floor, max: lv.next - lv.floor, progress: lv.progress },
  };
}

/** 75 -> "1:15", 3725 -> "1:02:05" */
export function formatDuration(sec: number): string {
  const t = Math.max(0, Math.round(sec));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const ss = String(t % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}
