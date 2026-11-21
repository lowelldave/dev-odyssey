import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { levelInfo, streak, titleFor } from '../lib/game';
import { useStore } from '../store';

export default function Hud() {
  const { xp, avatar, name, activity, timer, stopTimer } = useStore();
  const lv = levelInfo(xp);
  const st = streak(activity);

  return (
    <header className="hud">
      <Link to="/" className="brand">
        <span className="brand-icon">⚔️</span>
        <span className="brand-name">Dev Odyssey</span>
      </Link>
      <nav className="hud-nav">
        <NavLink to="/" end>
          🗺️ <span>World</span>
        </NavLink>
        <NavLink to="/dashboard">
          📜 <span>Adventure Log</span>
        </NavLink>
        <NavLink to="/profile">
          🛡️ <span>Status</span>
        </NavLink>
      </nav>
      <div className="hud-stats">
        {timer && <TimerChip startedAt={timer.startedAt} onStop={stopTimer} />}
        <span className="chip" title={`Current streak: ${st.current} days (best ${st.best})`}>
          🔥 {st.current}
        </span>
        <Link to="/profile" className="hud-player" title={`${name} — ${titleFor(lv.level)}`}>
          <span className="hud-avatar">{avatar}</span>
          <span className="hud-level">
            <strong>
              <em>LV</em> {lv.level} <span className="muted">EXP</span>
            </strong>
            <span className="xpbar">
              <span style={{ width: `${Math.round(lv.progress * 100)}%` }} />
            </span>
          </span>
        </Link>
      </div>
    </header>
  );
}

function TimerChip({ startedAt, onStop }: { startedAt: number; onStop: () => void }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const secs = Math.floor((Date.now() - startedAt) / 1000);
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  return (
    <button className="chip chip-timer" onClick={onStop} title="Stop study timer">
      ⏱️ {mm}:{ss} ■
    </button>
  );
}
