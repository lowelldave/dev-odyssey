import { useEffect, useMemo } from 'react';
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
      <div className="modal window" role="dialog" aria-modal="true" aria-labelledby="victory-title" onClick={(e) => e.stopPropagation()}>
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
            <Link className="btn btn-primary" to={`/island/${island.id}/quest/${nextQuest.id}`} data-sfx="confirm" autoFocus>
              ▶ Next quest: {nextQuest.title}
            </Link>
          ) : (
            c.unlocked.map((u, i) => (
              <Link key={u.id} className={`btn ${i === 0 ? 'btn-primary' : ''}`} to={`/island/${u.id}`} data-sfx="confirm" autoFocus={i === 0}>
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
