import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ISLANDS, ISLAND_MAP } from './data';
import { computeBadges } from './lib/badges';
import {
  type Completed,
  type Inventory,
  type ItemId,
  EMPTY_INVENTORY,
  GOLD_CAP,
  HINT_COST,
  HP_MAX,
  HP_REVIVE,
  INN_HP,
  INN_MP,
  MAX_SESSION_MINUTES,
  REST_TOKENS_MAX,
  ITEMS,
  POTION_HP,
  XP,
  campfireDays,
  canBuy,
  isIslandComplete,
  levelInfo,
  maxMp,
  newlyUnlockedBy,
  parseInventory,
  questKey,
  questXp,
  regenNow,
  retroGold,
  rollInn,
  rollMissDamage,
  rollQuestGold,
  today,
  toDay,
} from './lib/game';
import type { Island } from './types';

export interface QuizAttempt {
  key: string;
  score: number; // percent
  passed: boolean;
  at: string;
}

export interface Submission {
  key: string;
  repo: string;
  score: number;
  passed: boolean;
  at: string;
}

export interface Celebration {
  islandId: string;
  questId: string;
  questTitle: string;
  xp: number;
  /** gold found for this first clear */
  gold: number;
  islandCompleted?: Island;
  unlocked: Island[];
  levelUp?: number;
  /** the area was purified, so HP was restored to full */
  hpRestored?: boolean;
  /** a wayside Inn was rolled for this clear */
  inn?: boolean;
}

/** A stored wayside Inn offer: rolled once on a passed quiz, never re-rolled on refresh. */
export interface InnOffer {
  islandId: string;
  afterQuestId: string;
  rolledAt: string;
}

export interface Toast {
  id: number;
  text: string;
}

export type UiSkin = 'classic' | 'pixel';
export type SpriteStyle = 'auto' | 'vector' | 'pixel';

/** Chest state: an unopened chest, or the ISO time it was opened. One chest per purified area. */
export const CHEST_CLOSED = 'closed';

interface State {
  name: string;
  avatar: string;
  xp: number;
  completed: Completed;
  quizAttempts: QuizAttempt[];
  submissions: Submission[];
  /** day -> minutes studied (0 means active but no timed minutes) */
  activity: Record<string, number>;
  notes: Record<string, string>;
  githubToken: string;
  timer: { key: string; startedAt: number } | null;
  celebration: Celebration | null;
  sound: boolean;
  /** areas whose purification animation has already played on the map */
  purifiedSeen: Record<string, true>;

  /** HP and its regeneration timestamp; `hpAt` is null while a battle pauses regeneration. */
  hp: number;
  hpAt: number | null;
  mp: number;
  mpAt: number;
  /** the battle in progress, kept so a refresh mid-battle can be detected */
  battle: { key: string; startedAt: number; shield: boolean } | null;
  /** coins and carried items */
  gold: number;
  items: Inventory;
  /** questKey -> pool indices of the last attempt, so a retake prefers other questions */
  lastDraw: Record<string, number[]>;
  innOffer: InnOffer | null;
  lastBackupAt: string | null;
  /** islandId -> CHEST_CLOSED or the ISO time it was opened */
  chests: Record<string, string>;
  /** Campfire: rest tokens (max REST_TOKENS_MAX) and the days they bridged */
  restTokens: number;
  restDays: Record<string, true>;
  badgesSeen: Record<string, true>;
  dialoguesSeen: Record<string, true>;
  uiSkin: UiSkin;
  spriteStyle: SpriteStyle;

  /* session only: never persisted */
  menuCursor: string | null;
  /** hint keys ("island/quest#poolIndex") paid for in the current battle */
  hintsBought: Record<string, true>;
  toast: Toast | null;

  startBattle: (key: string, drawn: number[]) => void;
  takeHit: () => { damage: number; hp: number; defeated: boolean; deflected: boolean };
  drinkPotion: () => { result: 'ok' | 'none' | 'full' | 'no-battle'; healed: number; hp: number };
  restInTent: () => 'ok' | 'none' | 'in-battle' | 'full';
  buyItem: (id: ItemId) => 'ok' | 'poor' | 'max';
  endBattle: () => void;
  spendMp: (cost: number) => boolean;
  buyHint: (hintKey: string) => 'ok' | 'owned' | 'no-mp';
  redeemInn: () => boolean;
  openChest: (islandId: string) => boolean;
  applyCampfire: () => string[];
  setMenuCursor: (id: string | null) => void;
  showToast: (text: string) => void;
  dismissToast: () => void;
  markBadgesSeen: (ids: string[]) => void;
  markDialogueSeen: (id: string) => void;
  setUiSkin: (skin: UiSkin) => void;
  setSpriteStyle: (style: SpriteStyle) => void;
  noteBackup: () => void;

  setSound: (on: boolean) => void;
  markPurified: (ids: string[]) => void;
  setProfile: (p: { name?: string; avatar?: string }) => void;
  setToken: (t: string) => void;
  setNote: (key: string, text: string) => void;
  recordQuiz: (a: Omit<QuizAttempt, 'at'>) => void;
  recordSubmission: (s: Omit<Submission, 'at'>) => void;
  /** returns the gold awarded (0 for a replay) */
  completeQuest: (islandId: string, questId: string, extra?: { score?: number; repo?: string }) => number;
  startTimer: (key: string) => void;
  stopTimer: () => void;
  addMinutes: (minutes: number) => void;
  dismissCelebration: () => void;
  importData: (json: string) => void;
  reset: () => void;
}

/** Persisted-store version; exports carry it too so older files stay importable. */
const STORE_VERSION = 4;

const initial = {
  name: 'Hero',
  avatar: '🧑‍💻',
  xp: 0,
  completed: {} as Completed,
  quizAttempts: [] as QuizAttempt[],
  submissions: [] as Submission[],
  activity: {} as Record<string, number>,
  notes: {} as Record<string, string>,
  githubToken: '',
  timer: null,
  celebration: null,
  sound: true,
  purifiedSeen: {} as Record<string, true>,
  // a 0 timestamp means "long ago", which regenerates to full
  hp: HP_MAX,
  hpAt: 0 as number | null,
  mp: maxMp(1),
  mpAt: 0,
  battle: null as { key: string; startedAt: number; shield: boolean } | null,
  gold: 0,
  items: { ...EMPTY_INVENTORY } as Inventory,
  lastDraw: {} as Record<string, number[]>,
  innOffer: null as InnOffer | null,
  lastBackupAt: null as string | null,
  chests: {} as Record<string, string>,
  restTokens: 0,
  restDays: {} as Record<string, true>,
  badgesSeen: {} as Record<string, true>,
  dialoguesSeen: {} as Record<string, true>,
  uiSkin: 'classic' as UiSkin,
  spriteStyle: 'auto' as SpriteStyle,
  menuCursor: null as string | null,
  hintsBought: {} as Record<string, true>,
  toast: null as Toast | null,
};

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown, fallback: string) => (typeof v === 'string' ? v : fallback);

/** HP right now, including regeneration since `hpAt`. Pure: does not write to the store. */
export const hpNow = (s: Pick<State, 'hp' | 'hpAt'>, now = Date.now()) => regenNow(s.hp, s.hpAt, HP_MAX, now);
export const mpMaxFor = (xp: number) => maxMp(levelInfo(xp).level);
/** MP right now, including regeneration since `mpAt`. */
export const mpNow = (s: Pick<State, 'mp' | 'mpAt' | 'xp'>, now = Date.now()) => regenNow(s.mp, s.mpAt, mpMaxFor(s.xp), now);

/** One closed chest for every purified area that has none yet (retroactive). */
const withChests = (chests: Record<string, string>, completed: Completed) => {
  const out = { ...chests };
  for (const i of ISLANDS) if (isIslandComplete(completed, i) && !(i.id in out)) out[i.id] = CHEST_CLOSED;
  return out;
};

const earnedBadges = (s: {
  completed: Completed;
  quizAttempts: QuizAttempt[];
  submissions: Submission[];
  activity: Record<string, number>;
}) =>
  Object.fromEntries(
    computeBadges(s)
      .filter((b) => b.earned)
      .map((b) => [b.id, true as const]),
  );

const trueMap = (v: unknown): Record<string, true> => {
  const out: Record<string, true> = {};
  if (isRecord(v)) for (const [k, x] of Object.entries(v)) if (x === true) out[k] = true;
  return out;
};

/** Bump the streak/heatmap for today; only real study actions call this. */
const bump = (activity: Record<string, number>, minutes = 0) => {
  const d = today();
  return { ...activity, [d]: (activity[d] ?? 0) + minutes };
};

/** Split a timed session into minutes per calendar day, capped at MAX_SESSION_MINUTES. */
function splitSession(startedAt: number, now: number): Record<string, number> {
  const end = Math.min(now, startedAt + MAX_SESSION_MINUTES * 60_000);
  // a clock change can put `end` before the start: still count the start day as active
  if (end <= startedAt) return { [toDay(new Date(startedAt))]: 0 };
  const out: Record<string, number> = {};
  let cursor = startedAt;
  while (cursor < end) {
    const d = new Date(cursor);
    const nextMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
    const segEnd = Math.min(end, nextMidnight);
    const day = toDay(d);
    out[day] = (out[day] ?? 0) + (segEnd - cursor) / 60_000;
    cursor = segEnd;
  }
  for (const day of Object.keys(out)) out[day] = Math.round(out[day]);
  return out;
}

/** Gold granted by the v4 migration, shown once by App as a toast. */
let pendingRetroGrant = 0;
export const consumeRetroGrant = () => {
  const g = pendingRetroGrant;
  pendingRetroGrant = 0;
  return g;
};

/** The Inn's rest, shared with tents: +INN_HP/+INN_MP capped at max; regeneration stays paused in a battle. */
const innRestore = (s: State, now: number) => {
  const h = hpNow(s, now);
  const m = mpNow(s, now);
  return {
    hp: Math.min(HP_MAX, h.value + INN_HP),
    hpAt: s.hpAt === null ? null : now,
    mp: Math.min(mpMaxFor(s.xp), m.value + INN_MP),
    mpAt: now,
  };
};

/** Pick only known save fields, with basic type checks. */
function parseSave(data: Record<string, unknown>) {
  const completed: Completed = {};
  if (isRecord(data.completed)) {
    for (const [k, v] of Object.entries(data.completed)) {
      if (isRecord(v) && typeof v.at === 'string') {
        completed[k] = {
          at: v.at,
          ...(typeof v.score === 'number' ? { score: v.score } : {}),
          ...(typeof v.repo === 'string' ? { repo: v.repo } : {}),
        };
      }
    }
  }
  const activity: Record<string, number> = {};
  if (isRecord(data.activity)) {
    for (const [k, v] of Object.entries(data.activity)) {
      if (typeof v === 'number' && Number.isFinite(v) && v >= 0) activity[k] = v;
    }
  }
  const notes: Record<string, string> = {};
  if (isRecord(data.notes)) {
    for (const [k, v] of Object.entries(data.notes)) if (typeof v === 'string') notes[k] = v;
  }
  const quizAttempts = Array.isArray(data.quizAttempts)
    ? data.quizAttempts.filter(
        (a): a is QuizAttempt =>
          isRecord(a) && typeof a.key === 'string' && typeof a.score === 'number' && typeof a.passed === 'boolean' && typeof a.at === 'string',
      )
    : [];
  const submissions = Array.isArray(data.submissions)
    ? data.submissions.filter(
        (a): a is Submission =>
          isRecord(a) &&
          typeof a.key === 'string' &&
          typeof a.repo === 'string' &&
          typeof a.score === 'number' &&
          typeof a.passed === 'boolean' &&
          typeof a.at === 'string',
      )
    : [];

  const xp = typeof data.xp === 'number' && Number.isFinite(data.xp) && data.xp >= 0 ? data.xp : 0;
  const now = Date.now();
  const num = (v: unknown, lo: number, hi: number, fallback: number) =>
    typeof v === 'number' && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : fallback;
  // a missing, null or future timestamp becomes "now" (a v2 file has none of the battle fields)
  const stamp = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v <= now ? v : now);
  const mpMax = mpMaxFor(xp);
  const chests: Record<string, string> = {};
  if (isRecord(data.chests)) {
    for (const [k, v] of Object.entries(data.chests)) if (ISLAND_MAP[k] && typeof v === 'string') chests[k] = v;
  }
  const restDays: Record<string, true> = {};
  for (const k of Object.keys(trueMap(data.restDays))) if (/^\d{4}-\d{2}-\d{2}$/.test(k)) restDays[k] = true;
  let innOffer: InnOffer | null = null;
  const o = data.innOffer;
  if (isRecord(o) && typeof o.islandId === 'string' && typeof o.afterQuestId === 'string' && typeof o.rolledAt === 'string') {
    const afterQuestId = o.afterQuestId;
    if (ISLAND_MAP[o.islandId]?.quests.some((q) => q.id === afterQuestId)) {
      innOffer = { islandId: o.islandId, afterQuestId, rolledAt: o.rolledAt };
    }
  }
  return {
    name: str(data.name, initial.name).slice(0, 30),
    avatar: str(data.avatar, initial.avatar),
    xp,
    completed,
    quizAttempts,
    submissions,
    activity,
    notes,
    hp: Math.round(num(data.hp, 0, HP_MAX, HP_MAX)),
    hpAt: stamp(data.hpAt),
    mp: Math.round(num(data.mp, 0, mpMax, mpMax)),
    mpAt: stamp(data.mpAt),
    innOffer,
    // a file from before gold existed gets the same retroactive grant as an upgraded save
    gold:
      typeof data.gold === 'number' && Number.isFinite(data.gold) && data.gold >= 0
        ? Math.min(GOLD_CAP, Math.round(data.gold))
        : retroGold(completed),
    items: parseInventory(data.items),
    chests: withChests(chests, completed),
    restTokens: Math.round(num(data.restTokens, 0, REST_TOKENS_MAX, 0)),
    restDays,
  };
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...initial,

      setSound: (sound) => set({ sound }),
      markPurified: (ids) => set((s) => ({ purifiedSeen: { ...s.purifiedSeen, ...Object.fromEntries(ids.map((id) => [id, true as const])) } })),
      setProfile: (p) => set(p),
      setToken: (githubToken) => set({ githubToken: githubToken.trim() }),
      setNote: (key, text) => set((s) => ({ notes: { ...s.notes, [key]: text } })),

      recordQuiz: (a) =>
        set((s) => ({
          quizAttempts: [...s.quizAttempts, { ...a, at: new Date().toISOString() }].slice(-500),
          activity: bump(s.activity),
        })),

      recordSubmission: (sub) =>
        set((s) => ({
          submissions: [...s.submissions, { ...sub, at: new Date().toISOString() }].slice(-300),
          activity: bump(s.activity),
        })),

      completeQuest: (islandId, questId, extra) => {
        const s = get();
        const key = questKey(islandId, questId);
        const island = ISLAND_MAP[islandId];
        const quest = island.quests.find((q) => q.id === questId)!;
        const isQuiz = quest.checkpoint.type === 'quiz';
        const now = Date.now();
        if (s.completed[key]) {
          // a passed replay of a cleared quiz also rolls the Inn (project bosses never do)
          if (isQuiz && extra?.score !== undefined && rollInn()) {
            set({ innOffer: { islandId, afterQuestId: questId, rolledAt: new Date(now).toISOString() } });
          }
          return 0;
        }
        const before = s.completed;
        const after: Completed = { ...before, [key]: { at: new Date(now).toISOString(), ...extra } };
        let gained = questXp(quest);
        let islandCompleted: Island | undefined;
        let unlocked: Island[] = [];
        if (isIslandComplete(after, island)) {
          islandCompleted = island;
          gained += XP.islandBonus;
          unlocked = newlyUnlockedBy(before, after, islandId);
        }
        const oldLevel = levelInfo(s.xp).level;
        const newLevel = levelInfo(s.xp + gained).level;
        // purifying an area is the only full heal; the Inn roll is skipped on that clear
        const inn = isQuiz && !islandCompleted && rollInn();
        const gold = rollQuestGold(quest);
        set({
          completed: after,
          xp: s.xp + gained,
          gold: Math.min(GOLD_CAP, s.gold + gold),
          activity: bump(s.activity),
          ...(islandCompleted
            ? {
                hp: HP_MAX,
                // regeneration stays paused if a battle is somehow still open
                hpAt: s.hpAt === null ? null : now,
                chests: withChests(s.chests, after),
              }
            : {}),
          ...(inn ? { innOffer: { islandId, afterQuestId: questId, rolledAt: new Date(now).toISOString() } } : {}),
          celebration: {
            islandId,
            questId,
            questTitle: quest.title,
            xp: gained,
            gold,
            islandCompleted,
            unlocked,
            levelUp: newLevel > oldLevel ? newLevel : undefined,
            ...(islandCompleted ? { hpRestored: true } : {}),
            ...(inn ? { inn: true } : {}),
          },
        });
        return gold;
      },

      startBattle: (key, drawn) => {
        const s = get();
        const now = Date.now();
        // "no minimum HP", but HP never sits at 0 outside a battle; revive defensively
        const hp = hpNow(s, now).value || HP_REVIVE;
        set({
          hp,
          hpAt: null,
          battle: { key, startedAt: now, shield: s.items.shield > 0 },
          innOffer: null, // the Inn expires when the next quiz battle starts
          lastDraw: { ...s.lastDraw, [key]: drawn },
          hintsBought: {}, // D13a: hints are paid for again on every attempt
        });
      },

      takeHit: () => {
        const s = get();
        if (s.battle?.shield && s.items.shield > 0) {
          // the shield is spent only when it actually deflects; no damage is rolled
          set({ items: { ...s.items, shield: s.items.shield - 1 }, battle: { ...s.battle, shield: false } });
          return { damage: 0, hp: hpNow(s).value, defeated: false, deflected: true };
        }
        const damage = rollMissDamage();
        const hp = Math.max(0, hpNow(s).value - damage);
        // persisted straight away so a refresh can't undo or re-roll the damage
        set({ hp, hpAt: s.hpAt === null ? null : Date.now() });
        return { damage, hp, defeated: hp <= 0, deflected: false };
      },

      drinkPotion: () => {
        const s = get();
        const hp = hpNow(s).value;
        if (!s.battle) return { result: 'no-battle' as const, healed: 0, hp };
        if (s.items.potion <= 0) return { result: 'none' as const, healed: 0, hp };
        if (hp >= HP_MAX) return { result: 'full' as const, healed: 0, hp };
        const next = Math.min(HP_MAX, hp + POTION_HP);
        // hpAt stays null while the battle pauses regeneration
        set({ hp: next, hpAt: s.hpAt === null ? null : Date.now(), items: { ...s.items, potion: s.items.potion - 1 } });
        return { result: 'ok' as const, healed: next - hp, hp: next };
      },

      restInTent: () => {
        const s = get();
        if (s.battle || s.hpAt === null) return 'in-battle';
        if (s.items.tent <= 0) return 'none';
        const now = Date.now();
        if (hpNow(s, now).value >= HP_MAX && mpNow(s, now).value >= mpMaxFor(s.xp)) return 'full';
        set({ ...innRestore(s, now), items: { ...s.items, tent: s.items.tent - 1 } });
        return 'ok';
      },

      buyItem: (id) => {
        const s = get();
        const r = canBuy(s.gold, s.items, id);
        if (r !== 'ok') return r;
        set({ gold: s.gold - ITEMS[id].price, items: { ...s.items, [id]: s.items[id] + 1 } });
        return 'ok';
      },

      endBattle: () => {
        const s = get();
        if (!s.battle && s.hpAt !== null && s.hp > 0) return; // nothing to close
        // a knockout wakes up at 25 HP; regeneration continues from there
        set({ hp: s.hp > 0 ? s.hp : HP_REVIVE, hpAt: Date.now(), battle: null });
      },

      spendMp: (cost) => {
        const s = get();
        const m = mpNow(s);
        if (m.value < cost) return false;
        set({ mp: m.value - cost, mpAt: m.at ?? Date.now() });
        return true;
      },

      buyHint: (hintKey) => {
        if (get().hintsBought[hintKey]) return 'owned';
        if (!get().spendMp(HINT_COST)) return 'no-mp';
        set((s) => ({ hintsBought: { ...s.hintsBought, [hintKey]: true } }));
        return 'ok';
      },

      redeemInn: () => {
        const s = get();
        if (!s.innOffer) return false;
        set({ ...innRestore(s, Date.now()), innOffer: null });
        return true;
      },

      openChest: (islandId) => {
        const s = get();
        if (s.chests[islandId] !== CHEST_CLOSED) return false;
        // the area's Tome is read from the island's content; the chest only records that it was opened
        set({
          chests: { ...s.chests, [islandId]: new Date().toISOString() },
          restTokens: Math.min(REST_TOKENS_MAX, s.restTokens + 1),
        });
        return true;
      },

      applyCampfire: () => {
        const s = get();
        const days = campfireDays(s.activity, s.restDays, s.restTokens);
        if (!days.length) return [];
        set({
          restTokens: s.restTokens - days.length,
          restDays: { ...s.restDays, ...Object.fromEntries(days.map((d) => [d, true as const])) },
        });
        return days;
      },

      setMenuCursor: (menuCursor) => set({ menuCursor }),
      showToast: (text) => set({ toast: { id: Date.now(), text } }),
      dismissToast: () => set({ toast: null }),
      markBadgesSeen: (ids) => set((s) => ({ badgesSeen: { ...s.badgesSeen, ...Object.fromEntries(ids.map((id) => [id, true as const])) } })),
      markDialogueSeen: (id) => set((s) => ({ dialoguesSeen: { ...s.dialoguesSeen, [id]: true } })),
      setUiSkin: (uiSkin) => set({ uiSkin }),
      setSpriteStyle: (spriteStyle) => set({ spriteStyle }),
      noteBackup: () => set({ lastBackupAt: new Date().toISOString() }),

      startTimer: (key) => {
        if (get().timer) get().stopTimer();
        set({ timer: { key, startedAt: Date.now() } });
      },
      stopTimer: () => {
        const t = get().timer;
        if (!t) return;
        const perDay = splitSession(t.startedAt, Date.now());
        set((s) => {
          const activity = { ...s.activity };
          for (const [day, m] of Object.entries(perDay)) activity[day] = (activity[day] ?? 0) + m;
          return { timer: null, activity };
        });
      },
      addMinutes: (minutes) => set((s) => ({ activity: bump(s.activity, Math.max(0, minutes)) })),
      dismissCelebration: () => set({ celebration: null }),

      importData: (json) => {
        let data: unknown;
        try {
          data = JSON.parse(json);
        } catch {
          throw new Error('This file does not look like a Dev Odyssey save.');
        }
        if (!isRecord(data) || !isRecord(data.completed)) {
          throw new Error('This file does not look like a Dev Odyssey save.');
        }
        const save = parseSave(data);
        // githubToken, sound, skins and dialogues are not part of a save, so they stay as they are
        set((s) => {
          // areas already cleared in the file must not replay their purification animation
          const purifiedSeen = { ...s.purifiedSeen };
          for (const i of ISLANDS) if (isIslandComplete(save.completed, i)) purifiedSeen[i.id] = true;
          return {
            ...save,
            purifiedSeen,
            // badges earned in the file are not news
            badgesSeen: earnedBadges(save),
            battle: null,
            lastDraw: {},
            hintsBought: {},
            timer: null,
            celebration: null,
          };
        });
      },
      reset: () => set((s) => ({ ...initial, sound: s.sound, uiSkin: s.uiSkin, spriteStyle: s.spriteStyle })),
    }),
    {
      name: 'dev-odyssey-save',
      version: STORE_VERSION,
      migrate: (persisted, version) => {
        const s = persisted as Partial<State>;
        // v2: adventure theme; the old sea-themed default name becomes "Hero"
        if (version < 2 && s.name === 'Voyager') s.name = 'Hero';
        // v3: classic JRPG layer (HP/MP, Inn, chests, Campfire, seen-flags)
        if (version < 3) {
          const completed = s.completed ?? {};
          const now = Date.now();
          s.badgesSeen = earnedBadges({
            completed,
            quizAttempts: s.quizAttempts ?? [],
            submissions: s.submissions ?? [],
            activity: s.activity ?? {},
          });
          // players with progress have already met the world: skip the intro
          s.dialoguesSeen = Object.keys(completed).length ? { intro: true } : {};
          s.hp = HP_MAX;
          s.hpAt = now;
          s.mp = mpMaxFor(s.xp ?? 0);
          s.mpAt = now;
          s.battle = null;
          s.innOffer = null;
          s.lastDraw = {};
          s.lastBackupAt = null;
          s.chests = withChests({}, completed);
          s.restTokens = 0;
          s.restDays = {};
          s.uiSkin = 'classic';
          s.spriteStyle = 'auto';
        }
        // v4: gold and items; progress made before gold existed is paid out once
        if (version < 4) {
          const grant = retroGold(s.completed ?? {});
          s.gold = grant;
          s.items = { ...EMPTY_INVENTORY };
          s.battle = null; // a v3 battle has no shield flag
          pendingRetroGrant = grant;
        }
        return s as State;
      },
      // session-only fields stay out of localStorage
      partialize: ({ celebration: _c, menuCursor: _m, hintsBought: _h, toast: _t, ...rest }) => rest,
    },
  ),
);

export function exportSave(): string {
  const s = useStore.getState();
  const { name, avatar, xp, completed, quizAttempts, submissions, activity, notes, hp, mp, mpAt, innOffer, chests, restTokens, restDays, gold, items } = s;
  return JSON.stringify(
    {
      app: 'dev-odyssey',
      version: STORE_VERSION,
      name,
      avatar,
      xp,
      completed,
      quizAttempts,
      submissions,
      activity,
      notes,
      hp,
      // null (paused in battle) is exported as "now"
      hpAt: s.hpAt ?? Date.now(),
      mp,
      mpAt,
      innOffer,
      chests,
      restTokens,
      restDays,
      gold,
      items,
    },
    null,
    2,
  );
}
