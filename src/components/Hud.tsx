import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { MAX_SESSION_MINUTES, levelInfo, streak, titleFor } from '../lib/game';
import { useStore } from '../store';
import { Cursor } from './art';
import Purse from './Purse';

const NAV = [
  { to: '/', icon: '🗺️', label: 'World' },
  { to: '/dashboard', icon: '📜', label: 'Adventure Log' },
  { to: '/profile', icon: '🛡️', label: 'Status' },
];

/**
 * Desktop: brand, nav, party bars, timer, sound, gold, streak and the player chip in one bar.
 * Phones (≤680px): a Menu button, gold, streak and level/EXP stay in the bar; nav, sound and the timer move into
 * a collapsible drawer under it. HP and MP are not in the phone top bar (the party panels show them). The two layouts are swapped with CSS (.hud-desk / .hud-mobile).
 */
export default function Hud() {
  const { xp, avatar, name, activity, restDays, timer, stopTimer, sound, setSound } = useStore();
  const lv = levelInfo(xp);
  const st = streak(activity, restDays);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLElement>(null);

  // close on navigation
  useEffect(() => setOpen(false), [location.pathname]);

  // Esc closes and returns focus to the toggle; a click outside the bar closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('pointerdown', onDown);
    drawerRef.current?.querySelector<HTMLElement>('a, button')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  const soundBtn = (
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
  );
  const goldChip = (
    <span className="chip chip-gold" title="Your gold. Spend it at the Item Shop.">
      <Purse variant="chip" />
    </span>
  );
  const streakChip = (
    <span
      className="chip"
      title={`Current streak: ${st.current} days (best ${st.best}). Nights bridged by the Campfire count towards it.`}
      aria-label={`Streak: ${st.current} days`}
    >
      🔥 {st.current}
    </span>
  );
  const player = (
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
  );
  const navLinks = NAV.map((n) => (
    <NavLink key={n.to} to={n.to} end={n.to === '/'}>
      <span className="nav-cursor" aria-hidden="true">
        <Cursor size={12} />
      </span>
      {n.icon} <span>{n.label}</span>
    </NavLink>
  ));

  return (
    <header className={`hud ${open ? 'is-open' : ''}`} ref={wrapRef}>
      {/* ---------- desktop ---------- */}
      <Link to="/" className="brand hud-desk">
        <span className="brand-icon">⚔️</span>
        <span className="brand-name">Dev Odyssey</span>
      </Link>
      <nav className="hud-nav hud-desk" aria-label="Main">
        {navLinks}
      </nav>
      <div className="hud-stats hud-desk">
        {timer && <TimerChip startedAt={timer.startedAt} onStop={stopTimer} />}
        {soundBtn}
        {goldChip}
        {streakChip}
        {player}
      </div>

      {/* ---------- phones ---------- */}
      <div className="hud-mobile">
        <button
          ref={toggleRef}
          type="button"
          className="chip chip-btn hud-menu-btn"
          aria-expanded={open}
          aria-controls="hud-drawer"
          aria-label={`${open ? 'Close' : 'Open'} menu${timer ? ' (study timer running)' : ''}`}
          data-sfx="toggle"
          onClick={() => setOpen((o) => !o)}
        >
          <span aria-hidden="true">{open ? '✕' : '☰'}</span> Menu
          {timer && <span className="hud-menu-dot" aria-hidden="true" />}
        </button>
        <div className="hud-mobile-stats">
          {goldChip}
          {streakChip}
          {player}
        </div>
      </div>
      <div id="hud-drawer" ref={drawerRef} className="hud-drawer" hidden={!open}>
        <nav className="hud-drawer-nav" aria-label="Main">
          {navLinks}
        </nav>
        <div className="hud-drawer-row">
          {soundBtn}
          {timer && <TimerChip startedAt={timer.startedAt} onStop={stopTimer} />}
        </div>
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
