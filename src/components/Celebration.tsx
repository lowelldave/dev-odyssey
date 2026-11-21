import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { titleFor } from '../lib/game';
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

  if (!c) return null;
  return (
    <div className="modal-backdrop" onClick={dismiss}>
      <div className="confetti" aria-hidden>
        {sparkles.map((p, i) => (
          <i key={i} style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, background: p.color }} />
        ))}
      </div>
      <div className="modal window" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="celebrate-icon">{c.islandCompleted ? '🏆' : '⚔️'}</div>
        <p className="victory">{c.islandCompleted ? 'AREA CLEARED!' : 'VICTORY!'}</p>
        <p className="muted">{c.questTitle}</p>
        <div className="battle-log">
          <p className="exp">Gained {c.xp} EXP!</p>
          {c.levelUp && (
            <p className="lvl">
              Level up! You reached LV {c.levelUp}: {titleFor(c.levelUp)}.
            </p>
          )}
          {c.islandCompleted && (
            <p>
              {c.islandCompleted.emoji} {c.islandCompleted.name} is now safe.
            </p>
          )}
          {c.unlocked.length > 0 && (
            <>
              <p>New roads have opened:</p>
              <div className="unlocked">
                {c.unlocked.map((i) => (
                  <Link key={i.id} to={`/island/${i.id}`} className="unlock-pill" onClick={dismiss} style={{ borderColor: i.color }}>
                    {i.emoji} {i.name}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
        <button className="btn btn-primary" onClick={dismiss}>
          ▶ Continue
        </button>
      </div>
    </div>
  );
}
