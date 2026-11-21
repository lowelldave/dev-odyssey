import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Celebration from './components/Celebration';
import Hud from './components/Hud';
import Dashboard from './pages/Dashboard';
import IslandPage from './pages/IslandPage';
import Profile from './pages/Profile';
import QuestPage from './pages/QuestPage';
import WorldMap from './pages/WorldMap';
import { useStore } from './store';

export default function App() {
  const markActive = useStore((s) => s.markActive);
  const { pathname } = useLocation();

  useEffect(() => {
    markActive();
  }, [markActive]);
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Celebration />
    </div>
  );
}
