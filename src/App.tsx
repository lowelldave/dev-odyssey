import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Celebration from './components/Celebration';
import Hud from './components/Hud';
import Onboarding from './components/Onboarding';
import ToastHost from './components/ui/Toast';
import BattlePage from './pages/BattlePage';
import Dashboard from './pages/Dashboard';
import IslandPage from './pages/IslandPage';
import Profile from './pages/Profile';
import QuestPage from './pages/QuestPage';
import WorldMap from './pages/WorldMap';
import { type Sfx, sfx } from './lib/sound';
import { useStore } from './store';

export default function App() {
  const { pathname } = useLocation();

  // RPG menu sounds: any button/link/option click blips; elements can pick a
  // different sound with data-sfx="confirm|back|toggle|none".
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      // clicking a <label> also fires a synthetic click on its <input>: count it once
      if ((e.target as Element | null)?.tagName === 'INPUT') return;
      const el = (e.target as Element | null)?.closest<HTMLElement>('[data-sfx], button, a, label.option, [role="link"], summary');
      if (!el || (el as HTMLButtonElement).disabled) return;
      const name = el.dataset.sfx ?? 'click';
      if (name !== 'none') sfx(name as Sfx);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  // a battle still open on load was abandoned by a refresh: close it without recording anything
  // (HP already lost stays lost; a knockout revives), and never leave regeneration paused
  useEffect(() => {
    useStore.getState().endBattle();
  }, []);
  // Campfire: on load and whenever the tab comes back, bridge a short gap in the streak with rest tokens
  useEffect(() => {
    const rest = () => {
      const days = useStore.getState().applyCampfire();
      if (days.length) {
        useStore.getState().showToast('You rested by the campfire. Your streak is safe.');
        sfx('campfire');
      }
    };
    rest();
    const onVisible = () => {
      if (document.visibilityState === 'visible') rest();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);
  // the opt-in pixel window skin
  const uiSkin = useStore((s) => s.uiSkin);
  useEffect(() => {
    document.documentElement.classList.toggle('skin-pixel', uiSkin === 'pixel');
    return () => document.documentElement.classList.remove('skin-pixel');
  }, [uiSkin]);
  useEffect(() => {
    window.scrollTo(0, 0);
    useStore.getState().dismissCelebration();
  }, [pathname]);

  return (
    <div className="app">
      <Hud />
      <main className="page">
        <Routes>
          <Route path="/" element={<WorldMap />} />
          <Route path="/island/:islandId" element={<IslandPage />} />
          <Route path="/island/:islandId/quest/:questId" element={<QuestPage />} />
          <Route path="/island/:islandId/quest/:questId/battle" element={<BattlePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Celebration />
      <Onboarding />
      <ToastHost />
    </div>
  );
}
