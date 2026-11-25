import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import * as game from './lib/game';
import { ISLAND_MAP } from './data';
import { useStore } from './store';
import './styles.css';
import './styles/jrpg.css';
import './styles/game.css';

if (import.meta.env.DEV) {
  const day = (offset: number) => game.toDay(new Date(Date.now() - offset * 86_400_000));
  /** Dev-only helpers so a tester can reach any state without grinding. */
  const dev = {
    /** set HP now (regeneration restarts from this moment) */
    setHp: (hp: number) => useStore.setState({ hp, hpAt: Date.now(), battle: null }),
    setMp: (mp: number) => useStore.setState({ mp, mpAt: Date.now() }),
    /** put a wayside Inn on the board after a quest (defaults to the first quiz quest of 'web') */
    forceInn: (islandId = 'web', afterQuestId?: string) => {
      const island = ISLAND_MAP[islandId];
      const q = island?.quests.find((x) => x.id === afterQuestId) ?? island?.quests[0];
      if (island && q) useStore.setState({ innOffer: { islandId, afterQuestId: q.id, rolledAt: new Date().toISOString() } });
    },
    /** make the next quiz clears always (true) or never (false) roll the Inn; null restores the 25% roll */
    stubInnRoll: (always: boolean | null) => {
      const w = window as unknown as { __realRandom?: () => number };
      w.__realRandom ??= Math.random.bind(Math);
      Math.random = always === null ? w.__realRandom : () => (always ? 0 : 0.999);
    },
    giveTokens: (restTokens: number) => useStore.setState({ restTokens }),
    /** mark every quest of an area cleared (with a closed chest) without a celebration */
    completeIsland: (islandId: string) => {
      const island = ISLAND_MAP[islandId];
      if (!island) return;
      const at = new Date().toISOString();
      useStore.setState((s) => ({
        completed: { ...s.completed, ...Object.fromEntries(island.quests.map((q) => [game.questKey(islandId, q.id), { at }])) },
        chests: { ...s.chests, [islandId]: 'closed' },
      }));
    },
    /** a streak run of `run` days that ended `gap` days ago (gap 0 = today), no rest days */
    setStreak: (run: number, gap: number) =>
      useStore.setState({
        activity: Object.fromEntries(Array.from({ length: run }, (_, i) => [day(gap + i), 10])),
        restDays: {},
      }),
    resetIntro: () => useStore.setState({ dialoguesSeen: {} }),
  };
  Object.assign(window, { __store: useStore, __game: game, __dev: dev });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </HashRouter>
  </React.StrictMode>,
);
