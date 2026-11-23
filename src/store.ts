import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ISLAND_MAP } from './data';
import { type Completed, XP, isIslandComplete, levelInfo, newlyUnlockedBy, questKey, questXp, today } from './lib/game';
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
  markActive: () => void;
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

const bump = (activity: Record<string, number>, minutes = 0) => {
  const d = today();
  return { ...activity, [d]: (activity[d] ?? 0) + minutes };
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...initial,

      setSound: (sound) => set({ sound }),
      markPurified: (ids) => set((s) => ({ purifiedSeen: { ...s.purifiedSeen, ...Object.fromEntries(ids.map((id) => [id, true as const])) } })),
      setProfile: (p) => set(p),
      setToken: (githubToken) => set({ githubToken: githubToken.trim() }),
      setNote: (key, text) => set((s) => ({ notes: { ...s.notes, [key]: text } })),
      markActive: () => set((s) => ({ activity: bump(s.activity) })),

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
        const minutes = Math.max(0, Math.round((Date.now() - t.startedAt) / 60_000));
        set((s) => ({ timer: null, activity: bump(s.activity, minutes) }));
      },
      addMinutes: (minutes) => set((s) => ({ activity: bump(s.activity, Math.max(0, minutes)) })),
      dismissCelebration: () => set({ celebration: null }),

      importData: (json) => {
        const data = JSON.parse(json);
        if (typeof data !== 'object' || !data || typeof data.completed !== 'object') {
          throw new Error('This file does not look like a Dev Odyssey save.');
        }
        set({ ...initial, ...data, timer: null, celebration: null });
      },
      reset: () => set((s) => ({ ...initial, sound: s.sound })),
    }),
    {
      name: 'dev-odyssey-save',
      version: 2,
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
    { app: 'dev-odyssey', version: 1, name, avatar, xp, completed, quizAttempts, submissions, activity, notes },
    null,
    2,
  );
}
