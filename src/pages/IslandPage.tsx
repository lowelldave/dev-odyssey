import { Link, Navigate, useParams } from 'react-router-dom';
import { ISLAND_MAP, REGIONS } from '../data';
import { isIslandComplete, isQuestDone, isQuestUnlocked, islandDoneCount, islandState, questXp } from '../lib/game';
import { useStore } from '../store';

export default function IslandPage() {
  const { islandId = '' } = useParams();
  const completed = useStore((s) => s.completed);
  const island = ISLAND_MAP[islandId];
  if (!island) return <Navigate to="/" replace />;

  const state = islandState(completed, island);
  const done = islandDoneCount(completed, island);
  const leadsTo = Object.values(ISLAND_MAP).filter((i) => i.requires.includes(island.id));

  return (
    <div className="island-page" style={{ ['--c' as string]: island.color }}>
      <Link to="/" className="back">
        ◀ Back to world map
      </Link>
      <section className="island-hero window">
        <div className="island-hero-emoji">{island.emoji}</div>
        <div>
          <p className="eyebrow">
            {REGIONS[island.region].name} · {island.tier}
          </p>
          <h1>{island.name}</h1>
          <p className="subject">{island.subject}</p>
          <p>{island.blurb}</p>
          {island.stack && (
            <div className="chips">
              {island.stack.map((s) => (
                <span key={s} className="chip">
                  {s}
                </span>
              ))}
            </div>
          )}
          <div className="hero-progress">
            <span className="bar big">
              <span style={{ width: `${(done / island.quests.length) * 100}%` }} />
            </span>
            <span>
              {done}/{island.quests.length} quests
            </span>
          </div>
        </div>
      </section>

      {state === 'locked' && (
        <div className="callout window">
          <strong>🔒 A strange fog seals the road to this area.</strong>
          <p>Clear these areas first to open the way:</p>
          <div className="chips">
            {island.requires.map((id) => {
              const req = ISLAND_MAP[id];
              const ok = isIslandComplete(completed, req);
              return (
                <Link key={id} to={`/island/${id}`} className={`chip ${ok ? 'chip-ok' : ''}`}>
                  {ok ? '✅' : req.emoji} {req.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <section className="trail">
        <h2>Quest board</h2>
        <ol className="trail-list">
          {island.quests.map((quest, i) => {
            const qDone = isQuestDone(completed, island.id, quest.id);
            const unlocked = isQuestUnlocked(completed, island, i);
            const kind = quest.checkpoint.type === 'quiz' ? 'Trial' : 'Project';
            const icon = qDone ? '✅' : !unlocked ? '🔒' : quest.boss ? '🐉' : quest.checkpoint.type === 'quiz' ? '📜' : '🛠️';
            const inner = (
              <>
                <span className="trail-node">{icon}</span>
                <span className="trail-body">
                  <span className="trail-top">
                    <span className="eyebrow">{quest.boss ? 'Boss battle' : `Quest ${i + 1}`}</span>
                    <span className={`tag tag-${quest.checkpoint.type}`}>{kind}</span>
                    <span className="tag tag-xp">+{questXp(quest)} EXP</span>
                  </span>
                  <strong>{quest.title}</strong>
                  <span className="muted small">{quest.summary}</span>
                </span>
              </>
            );
            return (
              <li key={quest.id} className={`trail-item ${i % 2 ? 'right' : 'left'} ${qDone ? 'done' : ''} ${quest.boss ? 'boss' : ''}`}>
                {unlocked ? (
                  <Link to={`/island/${island.id}/quest/${quest.id}`} className="trail-card window">
                    {inner}
                  </Link>
                ) : (
                  <div className="trail-card window disabled" aria-disabled>
                    {inner}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      {leadsTo.length > 0 && (
        <section className="leads-to window">
          <h3>Roads leading onward</h3>
          <div className="chips">
            {leadsTo.map((i) => (
              <Link key={i.id} to={`/island/${i.id}`} className="chip">
                {i.emoji} {i.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
