import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { blobPath } from '../components/IslandShape';
import { ISLANDS, ISLAND_MAP, REGIONS } from '../data';
import { type IslandState, TOTAL_QUESTS, islandDoneCount, islandState, nextQuests } from '../lib/game';
import { useStore } from '../store';
import type { Island, Region } from '../types';

const W = 1820;
const H = 1300;

const REGION_LABELS: { region: Region; x: number; y: number }[] = [
  { region: 'ai', x: 1000, y: 40 },
  { region: 'polyglot', x: 225, y: 360 },
  { region: 'stacks', x: 1600, y: 500 },
  { region: 'core', x: 1000, y: 1280 },
];

const STATE_LABEL: Record<IslandState, string> = {
  locked: 'Locked',
  open: 'Unlocked',
  active: 'In progress',
  complete: 'Conquered',
};

export default function WorldMap() {
  const completed = useStore((s) => s.completed);
  const name = useStore((s) => s.name);
  const [view, setView] = useState<'map' | 'list'>(() => {
    try {
      return (localStorage.getItem('do-view') as 'map' | 'list') ?? 'map';
    } catch {
      return 'map';
    }
  });
  const setViewSaved = (v: 'map' | 'list') => {
    setView(v);
    try {
      localStorage.setItem('do-view', v);
    } catch {
      /* ignore */
    }
  };

  const doneQuests = Object.keys(completed).length;
  const next = nextQuests(completed, 1)[0];

  return (
    <div className="world">
      <section className="world-head">
        <div>
          <p className="eyebrow">Ahoy, {name}</p>
          <h1>The Developer Archipelago</h1>
          <p className="muted">
            {ISLANDS.length} islands · {TOTAL_QUESTS} quests · {doneQuests} completed. Clear every quest on an island, including its boss
            project, to open the routes to new islands.
          </p>
        </div>
        <div className="world-actions">
          {next && (
            <Link className="btn btn-primary" to={`/island/${next.island.id}/quest/${next.quest.id}`}>
              ▶ Continue: {next.quest.title}
            </Link>
          )}
          <div className="seg">
            <button className={view === 'map' ? 'on' : ''} onClick={() => setViewSaved('map')}>
              🗺️ Map
            </button>
            <button className={view === 'list' ? 'on' : ''} onClick={() => setViewSaved('list')}>
              📋 List
            </button>
          </div>
        </div>
      </section>

      {view === 'map' ? <MapView /> : <ListView />}

      <div className="legend">
        <span>
          <i className="dot complete" /> Conquered
        </span>
        <span>
          <i className="dot active" /> In progress
        </span>
        <span>
          <i className="dot open" /> Unlocked
        </span>
        <span>
          <i className="dot locked" /> Locked (finish the islands its routes come from)
        </span>
      </div>
    </div>
  );
}

function MapView() {
  const completed = useStore((s) => s.completed);
  const navigate = useNavigate();
  const [hover, setHover] = useState<string | null>(null);

  const states = useMemo(() => Object.fromEntries(ISLANDS.map((i) => [i.id, islandState(completed, i)])), [completed]);

  return (
    <div className="map-wrap">
      <svg className="map" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="World map of islands">
        <defs>
          <radialGradient id="sea" cx="50%" cy="45%" r="75%">
            <stop offset="0%" stopColor="var(--sea-1)" />
            <stop offset="100%" stopColor="var(--sea-2)" />
          </radialGradient>
          <pattern id="waves" width="120" height="60" patternUnits="userSpaceOnUse">
            <path d="M0 30 Q15 22 30 30 T60 30 T90 30 T120 30" fill="none" stroke="var(--wave)" strokeWidth="2" />
          </pattern>
          <filter id="gray">
            <feColorMatrix type="saturate" values="0.05" />
          </filter>
          <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>
        <rect width={W} height={H} fill="url(#sea)" />
        <rect width={W} height={H} fill="url(#waves)" opacity="0.55" />

        {REGION_LABELS.map(({ region, x, y }) => (
          <text key={region} x={x} y={y} className="region-label" textAnchor="middle">
            {REGIONS[region].name.toUpperCase()}
          </text>
        ))}

        {/* routes */}
        {ISLANDS.flatMap((island) =>
          island.requires.map((reqId) => {
            const from = ISLAND_MAP[reqId];
            if (!from) return null;
            const open = states[reqId] === 'complete';
            const { x: x1, y: y1 } = from.pos;
            const { x: x2, y: y2 } = island.pos;
            const mx = (x1 + x2) / 2 + (y2 - y1) * 0.12;
            const my = (y1 + y2) / 2 - (x2 - x1) * 0.12;
            const lit = hover === island.id || hover === reqId;
            return (
              <path
                key={`${reqId}-${island.id}`}
                d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`}
                className={`route ${open ? 'route-open' : ''} ${lit ? 'route-lit' : ''}`}
              />
            );
          }),
        )}

        {/* islands */}
        {ISLANDS.map((island) => (
          <IslandNode
            key={island.id}
            island={island}
            state={states[island.id]}
            done={islandDoneCount(completed, island)}
            onHover={setHover}
            onOpen={() => navigate(`/island/${island.id}`)}
          />
        ))}
      </svg>
    </div>
  );
}

function IslandNode({
  island,
  state,
  done,
  onHover,
  onOpen,
}: {
  island: Island;
  state: IslandState;
  done: number;
  onHover: (id: string | null) => void;
  onOpen: () => void;
}) {
  const total = island.quests.length;
  const R = 50;
  const ringR = 66;
  const circ = 2 * Math.PI * ringR;
  const label = island.name;
  const labelW = Math.max(120, label.length * 12 + 28);

  return (
    <g
      className={`island island-${state}`}
      transform={`translate(${island.pos.x}, ${island.pos.y})`}
      onMouseEnter={() => onHover(island.id)}
      onMouseLeave={() => onHover(null)}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()}
      tabIndex={0}
      role="link"
      aria-label={`${island.name}: ${island.subject}. ${STATE_LABEL[state]}, ${done} of ${total} quests.`}
    >
      <title>{`${island.name} — ${island.subject}\n${STATE_LABEL[state]} · ${done}/${total} quests`}</title>
      <ellipse rx={R + 22} ry={(R + 22) * 0.72} fill="var(--shallows)" opacity="0.55" filter="url(#soft)" />
      <g filter={state === 'locked' ? 'url(#gray)' : undefined}>
        <path d={blobPath(island.id, R + 10)} fill="var(--sand)" />
        <path d={blobPath(island.id + 'x', R - 2, 9, 0.28)} fill={island.color} />
        <path d={blobPath(island.id + 'y', R - 20, 7, 0.3)} fill="#fff" opacity="0.14" />
      </g>
      {state !== 'locked' && (
        <circle
          r={ringR}
          className="island-ring"
          strokeDasharray={`${(done / total) * circ} ${circ}`}
          transform="rotate(-90)"
          stroke={state === 'complete' ? 'var(--gold)' : 'var(--accent)'}
        />
      )}
      {(state === 'open' || state === 'active') && <circle r={ringR + 8} className="island-pulse" />}
      <text className="island-emoji" y="14" textAnchor="middle" filter={state === 'locked' ? 'url(#gray)' : undefined}>
        {island.emoji}
      </text>
      {state === 'locked' && (
        <text className="island-lock" x="34" y="-26" textAnchor="middle">
          🔒
        </text>
      )}
      {state === 'complete' && (
        <text className="island-flag" x="30" y="-30" textAnchor="middle">
          🚩
        </text>
      )}
      <g transform={`translate(0, ${R + 34})`}>
        <rect x={-labelW / 2} y={-18} width={labelW} height={36} rx={18} className="island-label-bg" />
        <text className="island-label" y="7" textAnchor="middle">
          {label}
        </text>
      </g>
    </g>
  );
}

function ListView() {
  const completed = useStore((s) => s.completed);
  return (
    <div className="region-list">
      {(Object.keys(REGIONS) as Region[]).map((region) => {
        const islands = ISLANDS.filter((i) => i.region === region);
        return (
          <section key={region} className="region-block">
            <h2>{REGIONS[region].name}</h2>
            <p className="muted">{REGIONS[region].desc}</p>
            <div className="card-grid">
              {islands.map((island) => {
                const state = islandState(completed, island);
                const done = islandDoneCount(completed, island);
                return (
                  <Link key={island.id} to={`/island/${island.id}`} className={`island-card state-${state}`} style={{ ['--c' as string]: island.color }}>
                    <span className="island-card-emoji">{state === 'locked' ? '🔒' : island.emoji}</span>
                    <span className="island-card-body">
                      <strong>{island.name}</strong>
                      <span className="muted small">{island.subject}</span>
                      <span className="bar">
                        <span style={{ width: `${(done / island.quests.length) * 100}%` }} />
                      </span>
                      <span className="small">
                        {STATE_LABEL[state]} · {done}/{island.quests.length} · {island.tier}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
