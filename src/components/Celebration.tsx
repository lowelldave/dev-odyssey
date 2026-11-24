import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ISLAND_MAP } from '../data';
import { monstersOf } from '../data/monsters';
import { titleFor } from '../lib/game';
import { sfx } from '../lib/sound';
import { useStore } from '../store';

export default function Celebration() {
  const c = useStore((s) => s.celebration);
  const dismiss = useStore((s) => s.dismissCelebration);

  const sparkles = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        color: ['#ffd34d', '#7fd8ff', '#6ee59a', '#ff9fb1', '#ffffff'][i % 5],
      })),
    [c],
  );

  useEffect(() => {
    if (!c) return;
    sfx('victory');
    if (c.levelUp) sfx('levelup');
  }, [c]);

  const dialogRef = useRef<HTMLDivElement>(null);
  const open = !!c;

  // Escape closes, Tab stays inside the dialog, and focus returns to where it was on close.
  // remember the last element focused outside the dialog, so focus can go back there on close
  const lastOutside = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      if (e.target instanceof HTMLElement && !dialogRef.current?.contains(e.target)) lastOutside.current = e.target;
    };
    document.addEventListener('focusin', onFocusIn);
    return () => document.removeEventListener('focusin', onFocusIn);
  }, []);

  useEffect(() => {
    if (!open) return;
    // React's autoFocus ignores links, so move focus to the primary choice ourselves
    dialogRef.current?.querySelector<HTMLElement>('a[href], button:not([disabled])')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        dismiss();
        return;
      }
      if (e.key !== 'Tab') return;
      const nodes = dialogRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!nodes?.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      if (!dialogRef.current?.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      // the trigger may be gone (the quiz swaps to its result view): fall back to the checkpoint section, then <main>
      const previous = lastOutside.current;
      if (previous?.isConnected) {
        previous.focus();
        return;
      }
      const fallback = document.getElementById('checkpoint') ?? document.querySelector<HTMLElement>('main');
      if (fallback) {
        if (!fallback.hasAttribute('tabindex')) fallback.setAttribute('tabindex', '-1');
        fallback.focus({ preventScroll: true });
      }
    };
  }, [open, dismiss]);

  if (!c) return null;

  const island = ISLAND_MAP[c.islandId];
  const index = island.quests.findIndex((q) => q.id === c.questId);
  const nextQuest = island.quests[index + 1];
  const mons = monstersOf(island.id);
  const defeated = island.quests[index]?.boss ? `You defeated the ${mons.boss.name}!` : `A ${mons.minion.name} was vanquished!`;

  return (
    <div className="modal-backdrop" onClick={dismiss}>
      <div className="confetti" aria-hidden>
        {sparkles.map((p, i) => (
          <i key={i} style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, background: p.color }} />
        ))}
      </div>
      <div ref={dialogRef} className="modal window" role="dialog" aria-modal="true" aria-labelledby="victory-title" onClick={(e) => e.stopPropagation()}>
        <div className="celebrate-icon">{c.islandCompleted ? '🏆' : '⚔️'}</div>
        <p className="victory" id="victory-title">
          {c.islandCompleted ? 'AREA PURIFIED!' : 'VICTORY!'}
        </p>
        <p className="muted">{c.questTitle}</p>
        <div className="battle-log">
          <p>{defeated}</p>
          <p className="exp">Gained {c.xp} EXP!</p>
          {c.levelUp && (
            <p className="lvl">
              Level up! You reached LV {c.levelUp}: {titleFor(c.levelUp)}.
            </p>
          )}
          {c.islandCompleted && (
            <p>
              The corruption lifts from {c.islandCompleted.emoji} {c.islandCompleted.name}. Its people return!
            </p>
          )}
          {c.unlocked.length > 0 && <p>New roads have opened!</p>}
        </div>

        <p className="eyebrow">What next?</p>
        <div className="next-choices">
          {nextQuest ? (
            <Link className="btn btn-primary" to={`/island/${island.id}/quest/${nextQuest.id}`} data-sfx="confirm">
              ▶ Next quest: {nextQuest.title}
            </Link>
          ) : (
            c.unlocked.map((u, i) => (
              <Link key={u.id} className={`btn ${i === 0 ? 'btn-primary' : ''}`} to={`/island/${u.id}`} data-sfx="confirm">
                ▶ Travel to {u.emoji} {u.name}
              </Link>
            ))
          )}
          <Link className="btn" to={nextQuest ? `/island/${island.id}` : '/'} data-sfx="back">
            {nextQuest ? '📋 Back to the quest board' : '🗺️ Return to the world map'}
          </Link>
          <button className="btn btn-ghost" onClick={dismiss} data-sfx="back">
            Stay here
          </button>
        </div>
      </div>
    </div>
  );
}
