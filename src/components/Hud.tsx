import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { MAX_SESSION_MINUTES, levelInfo, streak, titleFor } from '../lib/game';
import { useStore } from '../store';

export default function Hud() {
  const { xp, avatar, name, activity, timer, stopTimer, sound, setSound } = useStore();
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
        <button
          className="chip chip-btn"
          data-sfx="toggle"
          onClick={() => setSound(!sound)}
          aria-pressed={sound}
          aria-label={sound ? 'Mute sound effects' : 'Turn sound effects on'}
          title={sound ? 'Sound on (click to mute)' : 'Sound off (click to unmute)'}
        >
          {sound ? '🔊' : '🔇'}
        </button>
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
  if (secs >= MAX_SESSION_MINUTES * 60) {
    return (
      <button className="chip chip-timer" onClick={onStop} title={`Only the first ${MAX_SESSION_MINUTES / 60} hours of a session are logged`}>
        ⏱️ {MAX_SESSION_MINUTES / 60}h+ (capped) ■
      </button>
    );
  }
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  return (
    <button className="chip chip-timer" onClick={onStop} title="Stop study timer">
      ⏱️ {mm}:{ss} ■
    </button>
  );
}
