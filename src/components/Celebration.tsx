import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { titleFor } from '../lib/game';
import { useStore } from '../store';

export default function Celebration() {
  const c = useStore((s) => s.celebration);
  const dismiss = useStore((s) => s.dismissCelebration);

  const confetti = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        color: ['#f2c94c', '#4fb3bf', '#e8875b', '#7cc576', '#c792ea'][i % 5],
        rot: Math.random() * 360,
      })),
    // regenerate per celebration
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [c],
  );

  if (!c) return null;
  return (
    <div className="modal-backdrop" onClick={dismiss}>
      <div className="confetti" aria-hidden>
        {confetti.map((p, i) => (
          <i key={i} style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, background: p.color, rotate: `${p.rot}deg` }} />
        ))}
      </div>
      <div className="modal celebrate" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="celebrate-icon">{c.islandCompleted ? '🏆' : '⭐'}</div>
        <h2>{c.islandCompleted ? 'Island Conquered!' : 'Quest Complete!'}</h2>
        <p className="muted">{c.questTitle}</p>
        <div className="xp-gain">+{c.xp} XP</div>
        {c.levelUp && (
          <p className="levelup">
            ⬆️ Level up! You are now <strong>Level {c.levelUp}</strong> — {titleFor(c.levelUp)}
          </p>
        )}
        {c.islandCompleted && (
          <p>
            You conquered <strong>{c.islandCompleted.emoji} {c.islandCompleted.name}</strong>.
          </p>
        )}
        {c.unlocked.length > 0 && (
          <div className="unlocked">
            <p className="eyebrow">New islands unlocked</p>
            {c.unlocked.map((i) => (
              <Link key={i.id} to={`/island/${i.id}`} className="unlock-pill" onClick={dismiss} style={{ borderColor: i.color }}>
                {i.emoji} {i.name}
              </Link>
            ))}
          </div>
        )}
        <button className="btn btn-primary" onClick={dismiss}>
          Onward!
        </button>
      </div>
    </div>
  );
}
