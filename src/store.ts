import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ISLANDS, ISLAND_MAP } from './data';
import { type Completed, MAX_SESSION_MINUTES, XP, isIslandComplete, levelInfo, newlyUnlockedBy, questKey, questXp, today, toDay } from './lib/game';
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
  islandCompleted?: Island;
  unlocked: Island[];
  levelUp?: number;
}

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

  setSound: (on: boolean) => void;
  markPurified: (ids: string[]) => void;
  setProfile: (p: { name?: string; avatar?: string }) => void;
  setToken: (t: string) => void;
  setNote: (key: string, text: string) => void;
  recordQuiz: (a: Omit<QuizAttempt, 'at'>) => void;
  recordSubmission: (s: Omit<Submission, 'at'>) => void;
  completeQuest: (islandId: string, questId: string, extra?: { score?: number; repo?: string }) => void;
  startTimer: (key: string) => void;
  stopTimer: () => void;
  addMinutes: (minutes: number) => void;
  dismissCelebration: () => void;
  importData: (json: string) => void;
  reset: () => void;
}

/** Persisted-store version; exports carry it too so older files stay importable. */
const STORE_VERSION = 2;

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

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown, fallback: string) => (typeof v === 'string' ? v : fallback);

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
  return {
    name: str(data.name, initial.name).slice(0, 30),
    avatar: str(data.avatar, initial.avatar),
    xp: typeof data.xp === 'number' && Number.isFinite(data.xp) && data.xp >= 0 ? data.xp : 0,
    completed,
    quizAttempts,
    submissions,
    activity,
    notes,
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
        if (s.completed[key]) return;
        const island = ISLAND_MAP[islandId];
        const quest = island.quests.find((q) => q.id === questId)!;
        const before = s.completed;
        const after: Completed = { ...before, [key]: { at: new Date().toISOString(), ...extra } };
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
        set({
          completed: after,
          xp: s.xp + gained,
          activity: bump(s.activity),
          celebration: {
            islandId,
            questId,
            questTitle: quest.title,
            xp: gained,
            islandCompleted,
            unlocked,
            levelUp: newLevel > oldLevel ? newLevel : undefined,
          },
        });
      },

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
        // githubToken and sound are not part of a save, so they stay as they are
        set((s) => {
          // areas already cleared in the file must not replay their purification animation
          const purifiedSeen = { ...s.purifiedSeen };
          for (const i of ISLANDS) if (isIslandComplete(save.completed, i)) purifiedSeen[i.id] = true;
          return { ...save, purifiedSeen, timer: null, celebration: null };
        });
      },
      reset: () => set((s) => ({ ...initial, sound: s.sound })),
    }),
    {
      name: 'dev-odyssey-save',
      version: STORE_VERSION,
      // v2: adventure theme; the old sea-themed default name becomes "Hero"
      migrate: (persisted, version) => {
        const s = persisted as Partial<State>;
        if (version < 2 && s.name === 'Voyager') s.name = 'Hero';
        return s as State;
      },
      partialize: ({ celebration: _c, ...rest }) => rest,
    },
  ),
);

export function exportSave(): string {
  const { name, avatar, xp, completed, quizAttempts, submissions, activity, notes } = useStore.getState();
  return JSON.stringify(
    { app: 'dev-odyssey', version: STORE_VERSION, name, avatar, xp, completed, quizAttempts, submissions, activity, notes },
    null,
    2,
  );
}
