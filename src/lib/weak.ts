import { ISLAND_MAP } from '../data';
import type { Island, Quest } from '../types';
import { questionId } from './quiz';

/** Per-question miss tracking: a small weight that rises on a miss and falls on a correct answer. */
export interface WeakStat {
  seen: number;
  missed: number;
  /** weight 0..WEAK_MAX; above 0 means "missed before and not yet mastered" */
  w: number;
  at: number;
}

export const WEAK_MAX = 4;
export const WEAK_MISS = 2;
export const WEAK_HIT = 1;
const MAX_ENTRIES = 5000;

export const weakKey = (questKey: string, qid: string) => `${questKey}#${qid}`;

/** A correct answer after buying a hint leaves the weight alone: it was not recalled unaided. */
export function applyAnswer(s: WeakStat | undefined, right: boolean, hinted: boolean, now: number): WeakStat {
  const prev = s ?? { seen: 0, missed: 0, w: 0, at: now };
  let w = prev.w;
  if (!right) w = Math.min(WEAK_MAX, w + WEAK_MISS);
  else if (!hinted) w = Math.max(0, w - WEAK_HIT);
  return { seen: prev.seen + 1, missed: prev.missed + (right ? 0 : 1), w, at: now };
}

export const isWeak = (s?: WeakStat) => !!s && s.w > 0;

export interface WeakItem {
  qid: string;
  question: string;
  stat: WeakStat;
}
export interface WeakQuest {
  quest: Quest;
  /** filled in by the caller from `completed` */
  cleared?: boolean;
  items: WeakItem[];
}
export interface WeakArea {
  island: Island;
  quests: WeakQuest[];
  count: number;
}

const qidCache = new Map<string, Map<string, string>>();
/** qid -> question text for one quest's pool (memoised: hashing 20 questions is cheap, but this runs on render). */
function poolIds(islandId: string, quest: Quest): Map<string, string> {
  const k = `${islandId}/${quest.id}`;
  let m = qidCache.get(k);
  if (!m) {
    m = new Map();
    if (quest.checkpoint.type === 'quiz') for (const q of quest.checkpoint.questions) m.set(questionId(q.question), q.question);
    qidCache.set(k, m);
  }
  return m;
}

/** Weak questions grouped by area and quest, most weak spots first. Keys for removed content are skipped. */
export function weakSpots(weak: Record<string, WeakStat>): WeakArea[] {
  const byQuest = new Map<string, WeakItem[]>();
  for (const [key, stat] of Object.entries(weak)) {
    if (stat.w <= 0) continue;
    const [qk, qid] = key.split('#');
    const [islandId, questId] = qk.split('/');
    const island = ISLAND_MAP[islandId];
    const quest = island?.quests.find((q) => q.id === questId);
    const question = quest ? poolIds(islandId, quest).get(qid) : undefined;
    if (!quest || question === undefined) continue;
    const list = byQuest.get(qk) ?? [];
    list.push({ qid, question, stat });
    byQuest.set(qk, list);
  }
  const out: WeakArea[] = [];
  for (const island of Object.values(ISLAND_MAP)) {
    const quests: WeakQuest[] = [];
    for (const quest of island.quests) {
      const items = byQuest.get(`${island.id}/${quest.id}`);
      if (items?.length) quests.push({ quest, items: items.sort((a, b) => b.stat.w - a.stat.w) });
    }
    if (quests.length) out.push({ island, quests, count: quests.reduce((n, q) => n + q.items.length, 0) });
  }
  return out.sort((a, b) => b.count - a.count);
}

/** Number of weak questions in one quest's pool. */
export function weakCountFor(weak: Record<string, WeakStat>, questKey: string, quest: Quest): number {
  const [islandId] = questKey.split('/');
  let n = 0;
  for (const qid of poolIds(islandId, quest).keys()) if ((weak[weakKey(questKey, qid)]?.w ?? 0) > 0) n++;
  return n;
}

const int = (v: unknown, lo: number, hi: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(hi, Math.max(lo, Math.floor(v))) : null);

/** Validated weak-spot map: well-formed keys, finite clamped integers, at most MAX_ENTRIES. */
export function parseWeak(v: unknown): Record<string, WeakStat> {
  const out: Record<string, WeakStat> = {};
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return out;
  let n = 0;
  for (const [k, raw] of Object.entries(v)) {
    if (n >= MAX_ENTRIES) break;
    if (!/^[\w-]+\/[\w-]+#[0-9a-z]+$/.test(k) || typeof raw !== 'object' || raw === null) continue;
    const r = raw as Record<string, unknown>;
    const seen = int(r.seen, 0, 1_000_000);
    const missed = int(r.missed, 0, 1_000_000);
    const w = int(r.w, 0, WEAK_MAX);
    const at = int(r.at, 0, Number.MAX_SAFE_INTEGER);
    if (seen === null || missed === null || w === null || at === null) continue;
    out[k] = { seen, missed: Math.min(missed, seen), w, at };
    n++;
  }
  return out;
}
