import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Decoration, Hero, LANDMARK_HEIGHT, LandmarkSprite, WORLD, coastline, landmarkOf, scatterDecorations } from '../components/Overworld';
import { ISLANDS, ISLAND_MAP, REGIONS } from '../data';
import { type IslandState, TOTAL_QUESTS, islandDoneCount, islandState, nextQuests } from '../lib/game';
import { useStore } from '../store';
import type { Island, Region } from '../types';

const { W, H } = WORLD;
const DEFAULT_SCALE = 0.8;
const MAX_SCALE = 1.6;

const REGION_LABELS: { region: Region; x: number; y: number }[] = [
  { region: 'ai', x: 1700, y: 90 },
  { region: 'polyglot', x: 320, y: 640 },
  { region: 'stacks', x: 2450, y: 650 },
  { region: 'core', x: 1380, y: 1855 },
];

const STATE_LABEL: Record<IslandState, string> = {
  locked: 'Sealed',
  open: 'New area',
  active: 'In progress',
  complete: 'Cleared',
};

/** Road between two areas as a gentle curve. */
function roadPath(a: Island, b: Island) {
  const { x: x1, y: y1 } = a.pos;
  const { x: x2, y: y2 } = b.pos;
  const mx = (x1 + x2) / 2 + (y2 - y1) * 0.12;
  const my = (y1 + y2) / 2 - (x2 - x1) * 0.12;
  return { d: `M${x1},${y1} Q${mx},${my} ${x2},${y2}`, x1, y1, mx, my, x2, y2 };
}

const ROADS = ISLANDS.flatMap((island) =>
  island.requires.filter((id) => ISLAND_MAP[id]).map((id) => ({ from: ISLAND_MAP[id], to: island, ...roadPath(ISLAND_MAP[id], island) })),
);

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
      <section className="world-head window">
        <div>
          <p className="eyebrow">Welcome back, {name}</p>
          <h1>The Realm of Devoria</h1>
          <p className="muted">
            {ISLANDS.length} areas · {TOTAL_QUESTS} quests · {doneQuests} completed. Clear every quest in an area, including its boss battle, to
            open the roads to new lands.
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
              🗺️ World
            </button>
            <button className={view === 'list' ? 'on' : ''} onClick={() => setViewSaved('list')}>
              📋 List
            </button>
          </div>
        </div>
      </section>

      {view === 'map' ? <MapView heroAt={next?.island ?? ISLAND_MAP.summit} /> : <ListView />}

      <div className="legend">
        <span>
          <i className="dot complete" /> Cleared
        </span>
        <span>
          <i className="dot active" /> In progress
        </span>
        <span>
          <i className="dot open" /> New area (look for the ! marker)
        </span>
        <span>
          <i className="dot locked" /> Sealed (clear the areas its roads come from)
        </span>
      </div>
    </div>
  );
}

function MapView({ heroAt }: { heroAt: Island }) {
  const completed = useStore((s) => s.completed);
  const navigate = useNavigate();
  const [hover, setHover] = useState<string | null>(null);

  const states = useMemo(() => Object.fromEntries(ISLANDS.map((i) => [i.id, islandState(completed, i)])), [completed]);

  const decorations = useMemo(() => {
    const avoid: { x: number; y: number; r: number }[] = ISLANDS.map((i) => ({ x: i.pos.x, y: i.pos.y + 20, r: 110 }));
    for (const r of ROADS) {
      for (let t = 0; t <= 1; t += 0.05) {
        const x = (1 - t) ** 2 * r.x1 + 2 * (1 - t) * t * r.mx + t ** 2 * r.x2;
        const y = (1 - t) ** 2 * r.y1 + 2 * (1 - t) * t * r.my + t ** 2 * r.y2;
        avoid.push({ x, y: y + 10, r: 34 });
      }
    }
    for (const l of REGION_LABELS) avoid.push({ x: l.x, y: l.y + 10, r: 120 });
    return scatterDecorations(W, H, avoid);
  }, []);

  const continent = useMemo(() => coastline(34, 24, W - 68, H - 48, 22, 'continent'), []);

  /* ---------- camera: drag to pan, zoom with buttons / ctrl+wheel / keys ---------- */
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [cam, setCam] = useState<{ cx: number; cy: number; scale: number } | null>(null);
  const drag = useRef<{ id: number; x: number; y: number; cx: number; cy: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [dragging, setDragging] = useState(false);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // zooming all the way out fits the whole world in the frame
  const minScale = size.w ? Math.min(size.w / W, size.h / H) : 0.3;
  const [hasDragged, setHasDragged] = useState(false);

  /** Keep the camera inside the world and the zoom within limits. */
  const clamp = useCallback(
    (c: { cx: number; cy: number; scale: number }) => {
      const scale = Math.min(MAX_SCALE, Math.max(minScale, c.scale));
      const vw = size.w / scale;
      const vh = size.h / scale;
      const cx = vw >= W ? W / 2 : Math.min(W - vw / 2, Math.max(vw / 2, c.cx));
      const cy = vh >= H ? H / 2 : Math.min(H - vh / 2, Math.max(vh / 2, c.cy));
      return { cx, cy, scale };
    },
    [minScale, size.w, size.h],
  );

  const centerOn = useCallback(
    (x: number, y: number, scale?: number) => setCam((c) => clamp({ cx: x, cy: y, scale: scale ?? c?.scale ?? DEFAULT_SCALE })),
    [clamp],
  );

  // first layout: start on the hero; afterwards re-clamp when the viewport resizes
  useEffect(() => {
    if (!size.w) return;
    setCam((c) => clamp(c ?? { cx: heroAt.pos.x, cy: heroAt.pos.y - 80, scale: DEFAULT_SCALE }));
  }, [size.w, size.h, clamp, heroAt]);

  const zoomAt = useCallback(
    (factor: number, mx?: number, my?: number) => {
      setCam((c) => {
        if (!c) return c;
        const px = mx ?? size.w / 2;
        const py = my ?? size.h / 2;
        // keep the world point under the cursor fixed while zooming
        const wx = c.cx + (px - size.w / 2) / c.scale;
        const wy = c.cy + (py - size.h / 2) / c.scale;
        const scale = Math.min(MAX_SCALE, Math.max(minScale, c.scale * factor));
        return clamp({ cx: wx - (px - size.w / 2) / scale, cy: wy - (py - size.h / 2) / scale, scale });
      });
    },
    [clamp, minScale, size.w, size.h],
  );

  // ctrl/cmd + wheel zooms (plain wheel keeps scrolling the page)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const r = el.getBoundingClientRect();
      zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || !cam || (e.target as Element).closest('.map-controls')) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, cx: cam.cx, cy: cam.cy, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId || !cam) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) > 5) {
      d.moved = true;
      setDragging(true);
      setHasDragged(true);
      // capture only once it is really a drag, so plain clicks still reach the areas
      wrapRef.current?.setPointerCapture(e.pointerId);
    }
    if (d.moved) setCam(clamp({ cx: d.cx - dx / cam.scale, cy: d.cy - dy / cam.scale, scale: cam.scale }));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (d.moved) {
      suppressClick.current = true;
      setTimeout(() => (suppressClick.current = false), 0);
    }
    drag.current = null;
    setDragging(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!cam || e.target !== wrapRef.current) return;
    const step = 140 / cam.scale;
    const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[e.key]) {
      e.preventDefault();
      setCam(clamp({ ...cam, cx: cam.cx + moves[e.key][0], cy: cam.cy + moves[e.key][1] }));
    } else if (e.key === '+' || e.key === '=') zoomAt(1.2);
    else if (e.key === '-') zoomAt(1 / 1.2);
  };

  /** When tabbing to an area that is off screen, pan to it. */
  const revealArea = (island: Island) => {
    if (!cam) return;
    const vw = size.w / cam.scale;
    const vh = size.h / cam.scale;
    const { x, y } = island.pos;
    if (Math.abs(x - cam.cx) > vw / 2 - 120 || Math.abs(y - cam.cy) > vh / 2 - 120) centerOn(x, y);
  };

  const view = cam ? { w: size.w / cam.scale, h: size.h / cam.scale } : { w: W, h: H };
  const viewBox = cam ? `${cam.cx - view.w / 2} ${cam.cy - view.h / 2} ${view.w} ${view.h}` : `0 0 ${W} ${H}`;

  return (
    <div
      className={`map-wrap ${dragging ? 'dragging' : ''}`}
      ref={wrapRef}
      tabIndex={0}
      aria-label="World map. Drag or use arrow keys to explore, plus and minus to zoom."
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      onClickCapture={(e) => {
        if (suppressClick.current) {
          e.stopPropagation();
          e.preventDefault();
        }
      }}
    >
      <div className="map-controls">
        <button className="map-btn" onClick={() => zoomAt(1.25)} aria-label="Zoom in" title="Zoom in">
          +
        </button>
        <button className="map-btn" onClick={() => zoomAt(1 / 1.25)} aria-label="Zoom out" title="Zoom out">
          −
        </button>
        <button className="map-btn" onClick={() => centerOn(W / 2, H / 2, minScale)} aria-label="Show whole world" title="Show whole world">
          ⤢
        </button>
        <button className="map-btn" onClick={() => centerOn(heroAt.pos.x, heroAt.pos.y - 80, Math.max(cam?.scale ?? 0, DEFAULT_SCALE))} aria-label="Find hero" title="Find your hero">
          📍
        </button>
      </div>
      {!hasDragged && <p className="map-hint">Drag to explore · Ctrl + scroll to zoom</p>}
      <svg className="map" viewBox={viewBox} preserveAspectRatio="xMidYMid slice" role="img" aria-label="World map of the Realm of Devoria">
        <defs>
          <pattern id="sea-waves" width="90" height="40" patternUnits="userSpaceOnUse">
            <path d="M8 22 q8 -8 16 0 q8 8 16 0" fill="none" stroke="#bfe6ff" strokeOpacity="0.55" strokeWidth="2.5" />
          </pattern>
          <pattern id="grass" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M10 30 l3 -7 l3 7 M32 12 l3 -7 l3 7" fill="none" stroke="#5e9f45" strokeOpacity="0.45" strokeWidth="2" />
          </pattern>
          <filter id="blur-xl" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="38" />
          </filter>
          <filter id="sealed">
            <feColorMatrix type="matrix" values="0.2 0.2 0.2 0 0.02  0.2 0.2 0.25 0 0.03  0.25 0.25 0.3 0 0.08  0 0 0 1 0" />
          </filter>
          <filter id="fog" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <clipPath id="land-clip">
            <path d={continent} />
          </clipPath>
        </defs>

        {/* sea and continent */}
        <rect width={W} height={H} fill="#3d86c6" />
        <rect width={W} height={H} fill="url(#sea-waves)" />
        <path d={continent} fill="#e8d39a" stroke="#b89b5e" strokeWidth="6" transform="translate(0,6)" />
        <path d={continent} fill="#8fcb68" />
        <g clipPath="url(#land-clip)">
          <ellipse cx="300" cy="1250" rx="420" ry="900" fill="#3f8a45" filter="url(#blur-xl)" />
          <ellipse cx="2470" cy="1260" rx="430" ry="720" fill="#e3c98a" filter="url(#blur-xl)" />
          <ellipse cx="1550" cy="250" rx="1100" ry="340" fill="#a497cc" filter="url(#blur-xl)" />
          <rect width={W} height={H} fill="url(#grass)" />
        </g>

        {/* roads */}
        {ROADS.map((r) => {
          const open = states[r.from.id] === 'complete';
          const lit = hover === r.to.id || hover === r.from.id;
          return (
            <g key={`${r.from.id}-${r.to.id}`} className={`road ${open ? 'road-open' : 'road-sealed'} ${lit ? 'road-lit' : ''}`}>
              {open ? (
                <>
                  <path d={r.d} className="road-edge" />
                  <path d={r.d} className="road-fill" />
                </>
              ) : (
                <path d={r.d} className="road-trail" />
              )}
            </g>
          );
        })}

        {/* scenery */}
        <g className="scenery" aria-hidden>
          {decorations.map((d, i) => (
            <Decoration key={i} {...d} />
          ))}
        </g>

        {/* land banners */}
        {REGION_LABELS.map(({ region, x, y }) => {
          const label = REGIONS[region].name.toUpperCase();
          const w = label.length * 21 + 50;
          return (
            <g key={region} transform={`translate(${x},${y})`} className="region-banner">
              <path d={`M${-w / 2 - 22},-6 L${-w / 2},-20 L${-w / 2},16 Z M${w / 2 + 22},-6 L${w / 2},-20 L${w / 2},16 Z`} fill="#c9a86a" stroke="#5c4124" strokeWidth="3" />
              <rect x={-w / 2} y={-24} width={w} height={40} rx="4" fill="#f4e4bb" stroke="#5c4124" strokeWidth="3" />
              <text y="5" textAnchor="middle" className="region-label">
                {label}
              </text>
            </g>
          );
        })}

        {/* areas, back to front */}
        {[...ISLANDS]
          .sort((a, b) => a.pos.y - b.pos.y)
          .map((island) => (
            <AreaNode
              key={island.id}
              island={island}
              state={states[island.id]}
              done={islandDoneCount(completed, island)}
              onHover={setHover}
              onOpen={() => navigate(`/island/${island.id}`)}
              onFocus={() => revealArea(island)}
            />
          ))}

        <Hero x={heroAt.pos.x - 70} y={heroAt.pos.y + 14} />
      </svg>
    </div>
  );
}

function AreaNode({
  island,
  state,
  done,
  onHover,
  onOpen,
  onFocus,
}: {
  island: Island;
  state: IslandState;
  done: number;
  onHover: (id: string | null) => void;
  onOpen: () => void;
  onFocus: () => void;
}) {
  const total = island.quests.length;
  const label = `${state === 'locked' ? '???' : island.name}`;
  const labelW = Math.max(130, label.length * 12.5 + 70);
  const sealed = state === 'locked';

  return (
    <g
      className={`area area-${state}`}
      transform={`translate(${island.pos.x}, ${island.pos.y + 14})`}
      onFocus={onFocus}
      onMouseEnter={() => onHover(island.id)}
      onMouseLeave={() => onHover(null)}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()}
      tabIndex={0}
      role="link"
      aria-label={`${island.name}: ${island.subject}. ${STATE_LABEL[state]}, ${done} of ${total} quests.`}
    >
      <title>{`${island.name} — ${island.subject}\n${STATE_LABEL[state]} · ${done}/${total} quests`}</title>
      <ellipse cx="0" cy="6" rx="62" ry="20" fill={sealed ? '#6f7b63' : '#c9a46a'} stroke={sealed ? 'none' : '#8a6a3f'} strokeWidth="2" opacity="0.9" />
      <g filter={sealed ? 'url(#sealed)' : undefined} className="area-sprite">
        <LandmarkSprite kind={landmarkOf(island)} c={island.color} />
      </g>

      {sealed && (
        <g filter="url(#fog)" opacity="0.5" aria-hidden>
          <ellipse cx="-30" cy="-30" rx="38" ry="20" fill="#eef1f6" />
          <ellipse cx="26" cy="-50" rx="40" ry="22" fill="#eef1f6" />
          <ellipse cx="6" cy="-14" rx="46" ry="18" fill="#e3e8ef" />
        </g>
      )}
      {sealed && (
        <text y="-28" textAnchor="middle" className="area-mystery">
          ?
        </text>
      )}

      {(state === 'open' || state === 'active') && (
        <g transform={`translate(0, ${-LANDMARK_HEIGHT[landmarkOf(island)] - 22})`}>
          <g className="quest-marker">
            <path d="M-14,-22 h28 v26 h-8 l-6,8 l-6,-8 h-8z" fill="#ffd34d" stroke="#5c3b10" strokeWidth="3" strokeLinejoin="round" />
            <text y="-1" textAnchor="middle" className="marker-text">
              !
            </text>
          </g>
        </g>
      )}

      {state === 'complete' && (
        <g transform="translate(44,-70)" aria-hidden>
          <line x1="0" y1="0" x2="0" y2="40" stroke="#3b2a1e" strokeWidth="3" />
          <path d="M0,0 L26,7 L0,14Z" fill="#ffcf3d" stroke="#3b2a1e" strokeWidth="2" />
          <text x="10" y="11" className="flag-star">
            ★
          </text>
        </g>
      )}

      <g transform="translate(0, 44)">
        <rect x={-labelW / 2} y={-19} width={labelW} height={38} rx="6" className="area-label-bg" />
        <text className="area-label" x={-labelW / 2 + 16} y="7">
          {sealed ? '🔒' : island.emoji}
        </text>
        <text className="area-label" x={14} y="7" textAnchor="middle">
          {label}
        </text>
        {!sealed && (
          <g transform={`translate(${-labelW / 2 + 12}, 24)`}>
            {island.quests.map((q, i) => (
              <rect key={q.id} x={i * ((labelW - 24) / total)} y="0" width={(labelW - 24) / total - 3} height="6" rx="2" className={i < done ? 'pip pip-on' : 'pip'} />
            ))}
          </g>
        )}
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
                  <Link key={island.id} to={`/island/${island.id}`} className={`window island-card state-${state}`} style={{ ['--c' as string]: island.color }}>
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
