import { Link, Navigate, useParams } from 'react-router-dom';
import { AreaScene, SceneDefs } from '../components/AreaScene';
import { LANDMARK_HEIGHT, landmarkOf } from '../components/Overworld';
import QuestBoard from '../components/QuestBoard';
import { ISLAND_MAP, REGIONS } from '../data';
import { monstersOf } from '../data/monsters';
import { isIslandComplete, isQuestDone, islandDoneCount, islandState } from '../lib/game';
import { useStore } from '../store';

export default function IslandPage() {
  const { islandId = '' } = useParams();
  const completed = useStore((s) => s.completed);
  const island = ISLAND_MAP[islandId];
  if (!island) return <Navigate to="/" replace />;

  const state = islandState(completed, island);
  const done = islandDoneCount(completed, island);
  const mons = monstersOf(island.id);
  const leadsTo =Object.values(ISLAND_MAP).filter((i) => i.requires.includes(island.id));

  return (
    <div className="island-page" style={{ ['--c' as string]: island.color }}>
      <Link to="/" className="back">
        ◀ Back to world map
      </Link>
      <section className="island-hero window">
        <svg
          className="island-hero-scene"
          viewBox={`-150 ${-LANDMARK_HEIGHT[landmarkOf(island)] - 120} 300 ${LANDMARK_HEIGHT[landmarkOf(island)] + 195}`}
          role="img"
          aria-label={`${island.name}: ${state === 'complete' ? 'purified' : state === 'locked' ? 'shrouded in fog' : 'corrupted by monsters'}`}
        >
          <defs>
            <SceneDefs />
          </defs>
          <AreaScene island={island} completed={completed} />
        </svg>
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
          {state !== 'locked' && (
            <div className="bestiary">
              <span className="eyebrow">{state === 'complete' ? 'Defeated here' : 'Monsters here'}</span>
              <div className="chips">
                {island.quests.map((q) => {
                  const beaten = isQuestDone(completed, island.id, q.id);
                  const name = q.boss ? mons.boss.name : mons.minion.name;
                  return (
                    <span key={q.id} className={`chip monster-chip ${beaten ? 'beaten' : ''} ${q.boss ? 'boss' : ''}`} title={`Guarding: ${q.title}`}>
                      {beaten ? '💀' : q.boss ? '👑' : '👾'} {name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
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

      <QuestBoard island={island} completed={completed} />

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
