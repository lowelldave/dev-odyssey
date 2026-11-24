import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AreaScene, PLOT, SceneDefs, type SceneInfo, sceneInfo } from '../components/AreaScene';
import {
  type Deco,
  Decoration,
  Hero,
  LANDMARK_HEIGHT,
  SCREEN,
  WS,
  continentPath,
  corruptKind,
  isoEllipse,
  landmarkOf,
  layoutPositions,
  project,
  scatterDecorations,
} from '../components/Overworld';
import { sfx } from '../lib/sound';
import { ISLANDS, ISLAND_MAP, REGIONS } from '../data';
import { type IslandState, TOTAL_QUESTS, countCompleted, islandDoneCount, islandState, nextQuests } from '../lib/game';
import { useStore } from '../store';
import type { Island, Region } from '../types';

/** Camera works in projected screen space. */
const { W, H } = SCREEN;
const DEFAULT_SCALE = 0.7;
const MAX_SCALE = 1.6;
/** Below this zoom the fine-detail layer (class "d") is hidden to keep the map light. */
const LOD_SCALE = 0.5;
/** Things this far outside the view stay rendered; bounds snap to CULL_STEP so panning rarely changes the set. */
const CULL_MARGIN = 300;
const CULL_STEP = 200;

/** World-space positions (with the natural jitter) and their projected screen points. */
const POS = layoutPositions(ISLANDS);
const SP: Record<string, { x: number; y: number }> = Object.fromEntries(Object.entries(POS).map(([id, p]) => [id, project(p.x, p.y)]));

/** Land banners float just off each land's coast (world space, outside the continent). */
const REGION_LABELS: { region: Region; x: number; y: number }[] = [
  { region: 'ai', x: 1650 * WS, y: -110 * WS },
  { region: 'polyglot', x: -110 * WS, y: 1050 * WS },
  { region: 'stacks', x: 2910 * WS, y: 1250 * WS },
  { region: 'core', x: 1450 * WS, y: 2150 * WS },
];

const STATE_LABEL: Record<IslandState, string> = {
  locked: 'Sealed',
  open: 'New area',
  active: 'In progress',
  complete: 'Cleared',
};

/** Road between two areas: a gentle curve in world space, sampled and projected. */
function roadPath(a: Island, b: Island) {
  const { x: x1, y: y1 } = POS[a.id];
  const { x: x2, y: y2 } = POS[b.id];
  const mx = (x1 + x2) / 2 + (y2 - y1) * 0.14;
  const my = (y1 + y2) / 2 - (x2 - x1) * 0.14;
  const world: { x: number; y: number }[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    world.push({
      x: (1 - t) ** 2 * x1 + 2 * (1 - t) * t * mx + t ** 2 * x2,
      y: (1 - t) ** 2 * y1 + 2 * (1 - t) * t * my + t ** 2 * y2,
    });
  }
  const d = world
    .map((p, i) => {
      const s = project(p.x, p.y);
      return `${i ? 'L' : 'M'}${s.x.toFixed(1)},${s.y.toFixed(1)}`;
    })
    .join(' ');
  return { d, world };
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

  const doneQuests = countCompleted(completed);
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
  const infos = useMemo(() => Object.fromEntries(ISLANDS.map((i) => [i.id, sceneInfo(i, completed)])), [completed]);

  const decorations = useMemo(() => {
    // keep scenery off each area's plot, its label, the roads and the banners
    const avoid: { x: number; y: number; r: number }[] = ISLANDS.map((i) => ({ ...POS[i.id], r: 235 }));
    // labels sit below each area on screen, which is +x/+y in world space
    for (const i of ISLANDS) avoid.push({ x: POS[i.id].x + 150, y: POS[i.id].y + 150, r: 130 });
    for (const r of ROADS) for (const p of r.world) avoid.push({ ...p, r: 46 });
    for (const l of REGION_LABELS) avoid.push({ x: l.x, y: l.y, r: 260 });
    return scatterDecorations(
      avoid,
      ISLANDS.map((i) => ({ id: i.id, ...POS[i.id] })),
    );
  }, []);

  const continent = useMemo(() => continentPath(50, 40, 'continent'), []);
  const biomes = useMemo(
    () => ({
      polyglot: isoEllipse(280 * WS, 1250 * WS, 440 * WS, 900 * WS),
      stacks: isoEllipse(2470 * WS, 1260 * WS, 440 * WS, 720 * WS),
      ai: isoEllipse(1550 * WS, 250 * WS, 1150 * WS, 360 * WS),
    }),
    [],
  );
  const heroSP = SP[heroAt.id];

  /* ---------- purification: plays once per area, the first time the map sees it cleared ---------- */
  const seen = useStore((s) => s.purifiedSeen);
  const markPurified = useStore((s) => s.markPurified);
  const [purifying, setPurifying] = useState<string[]>([]);
  const [firstFresh] = useState(() => ISLANDS.find((i) => states[i.id] === 'complete' && !seen[i.id])?.id);
  useEffect(() => {
    const fresh = ISLANDS.filter((i) => states[i.id] === 'complete' && !seen[i.id]).map((i) => i.id);
    if (!fresh.length) return;
    setPurifying(fresh);
    markPurified(fresh);
    const chime = setTimeout(() => sfx('purify'), 250);
    const done = setTimeout(() => setPurifying([]), 2800);
    return () => {
      clearTimeout(chime);
      clearTimeout(done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [states]);

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
    const focus = firstFresh ? SP[firstFresh] : heroSP;
    setCam((c) => clamp(c ?? { cx: focus.x, cy: focus.y - 80, scale: DEFAULT_SCALE }));
  }, [size.w, size.h, clamp, heroSP, firstFresh]);

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
    const { x, y } = SP[island.id];
    if (Math.abs(x - cam.cx) > vw / 2 - 120 || Math.abs(y - cam.cy) > vh / 2 - 120) centerOn(x, y);
  };

  const view = cam ? { w: size.w / cam.scale, h: size.h / cam.scale } : { w: W, h: H };
  const viewBox = cam ? `${cam.cx - view.w / 2} ${cam.cy - view.h / 2} ${view.w} ${view.h}` : `0 0 ${W} ${H}`;
  const lodLow = !!cam && cam.scale < LOD_SCALE;

  // Snapped view bounds: primitives, so the memos below only recompute after a pan of ~CULL_STEP.
  const snapLo = (v: number) => Math.floor((v - CULL_MARGIN) / CULL_STEP) * CULL_STEP;
  const snapHi = (v: number) => Math.ceil((v + CULL_MARGIN) / CULL_STEP) * CULL_STEP;
  const bx0 = cam ? snapLo(cam.cx - view.w / 2) : 0;
  const bx1 = cam ? snapHi(cam.cx + view.w / 2) : -1;
  const by0 = cam ? snapLo(cam.cy - view.h / 2) : 0;
  const by1 = cam ? snapHi(cam.cy + view.h / 2) : -1;

  /** Indices (into the y-sorted decorations) that are inside the snapped bounds. */
  const visibleDecos = useMemo(() => {
    let lo = 0;
    let hi = decorations.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (decorations[mid].y < by0) lo = mid + 1;
      else hi = mid;
    }
    const out: number[] = [];
    for (let i = lo; i < decorations.length && decorations[i].y <= by1; i++) {
      if (decorations[i].x >= bx0 && decorations[i].x <= bx1) out.push(i);
    }
    return out;
  }, [decorations, bx0, bx1, by0, by1]);

  /** Areas outside the bounds keep their focusable node but skip the heavy scene. */
  const culledAreas = useMemo(() => {
    const out = new Set<string>();
    for (const i of ISLANDS) {
      const { x, y } = SP[i.id];
      if (x < bx0 || x > bx1 || y < by0 || y > by1) out.add(i.id);
    }
    return out;
  }, [bx0, bx1, by0, by1]);

  // stable callbacks so memoised area nodes don't re-render on every drag frame
  const revealRef = useRef(revealArea);
  revealRef.current = revealArea;
  const onAreaFocus = useCallback((island: Island) => revealRef.current(island), []);
  const onAreaOpen = useCallback((id: string) => navigate(`/island/${id}`), [navigate]);

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
        <button className="map-btn" onClick={() => centerOn(heroSP.x, heroSP.y - 80, Math.max(cam?.scale ?? 0, DEFAULT_SCALE))} aria-label="Find hero" title="Find your hero">
          📍
        </button>
      </div>
      {!hasDragged && <p className="map-hint">Drag to explore · Ctrl + scroll to zoom</p>}
      <svg className={`map ${lodLow ? 'lod-low' : ''}`} viewBox={viewBox} preserveAspectRatio="xMidYMid slice" role="group" aria-label="World map of the Realm of Devoria">
        <defs>
          <pattern id="sea-waves" width="90" height="40" patternUnits="userSpaceOnUse">
            <path d="M8 22 q8 -8 16 0 q8 8 16 0" fill="none" stroke="#bfe6ff" strokeOpacity="0.55" strokeWidth="2.5" />
          </pattern>
          <pattern id="iso-grid" width="72" height="36" patternUnits="userSpaceOnUse">
            <path d="M0 18 L36 0 L72 18 L36 36 Z" fill="none" stroke="#ffffff" strokeOpacity="0.09" strokeWidth="1.2" />
          </pattern>
          <pattern id="grass" width="60" height="44" patternUnits="userSpaceOnUse">
            <path d="M12 30 l3 -7 l3 7 M40 14 l3 -7 l3 7" fill="none" stroke="#3f7d2f" strokeOpacity="0.28" strokeWidth="2" />
          </pattern>
          <linearGradient id="sea-depth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4c9ad6" />
            <stop offset="1" stopColor="#2f6fb0" />
          </linearGradient>
          <filter id="blur-xl" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="38" />
          </filter>
          <SceneDefs />
          <clipPath id="land-clip">
            <path d={continent} />
          </clipPath>
        </defs>

        {/* sea, then the continent as a raised plateau with layered cliffs */}
        <g aria-hidden>
        <rect x={-W} y={-H} width={W * 3} height={H * 3} fill="#3f86c6" />
        <rect width={W} height={H} fill="url(#sea-depth)" />
        <rect x={-W} y={-H} width={W * 3} height={H * 3} fill="url(#sea-waves)" />
        <path d={continent} fill="#2a5f96" opacity="0.45" transform="translate(14,70)" />
        <path d={continent} fill="#6b4524" transform="translate(0,52)" />
        <path d={continent} fill="#8a5a2e" transform="translate(0,34)" />
        <path d={continent} fill="#a7733f" transform="translate(0,16)" />
        <path d={continent} fill="#e8d39a" transform="translate(0,6)" />
        <path d={continent} fill="#8fcb68" />
        <g clipPath="url(#land-clip)">
          <path d={biomes.polyglot} fill="#3f8a45" filter="url(#blur-xl)" />
          <path d={biomes.stacks} fill="#e3c98a" filter="url(#blur-xl)" />
          <path d={biomes.ai} fill="#a497cc" filter="url(#blur-xl)" />
          <rect width={W} height={H} fill="url(#grass)" />
          <rect width={W} height={H} fill="url(#iso-grid)" />
          {/* corruption spreading from every area that is not yet purified */}
          {ISLANDS.map((i) => {
            const info = infos[i.id];
            const fading = purifying.includes(i.id);
            if (info.level === 0 && !fading) return null;
            const strength = fading ? 0.95 : info.level === 4 ? 1 : 0.35 + (1 - info.done / info.total) * 0.65;
            return (
              <ellipse
                key={i.id}
                cx={SP[i.id].x}
                cy={SP[i.id].y}
                rx={520}
                ry={260}
                fill="url(#blight-grad)"
                opacity={strength}
                className={fading ? 'blight-fade' : undefined}
              />
            );
          })}
        </g>

        </g>

        {/* roads */}
        {ROADS.map((r) => {
          const open = states[r.from.id] === 'complete';
          const lit = hover === r.to.id || hover === r.from.id;
          return (
            <g key={`${r.from.id}-${r.to.id}`} aria-hidden className={`road ${open ? 'road-open' : 'road-sealed'} ${lit ? 'road-lit' : ''}`}>
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
        <Scenery decorations={decorations} indices={visibleDecos} infos={infos} />

        {/* land banners */}
        {REGION_LABELS.map(({ region, x: wx, y: wy }) => {
          const label = REGIONS[region].name.toUpperCase();
          const w = label.length * 21 + 50;
          const { x, y } = project(wx, wy);
          return (
            <g key={region} transform={`translate(${x},${y})`} className="region-banner" aria-hidden>
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
          .sort((a, b) => SP[a.id].y - SP[b.id].y)
          .map((island) => (
            <AreaNode
              key={island.id}
              island={island}
              at={SP[island.id]}
              state={states[island.id]}
              done={islandDoneCount(completed, island)}
              purifying={purifying.includes(island.id)}
              culled={culledAreas.has(island.id)}
              onHover={setHover}
              onOpen={onAreaOpen}
              onFocus={onAreaFocus}
            />
          ))}

        <g aria-hidden>
          <Hero x={heroSP.x - PLOT - 24} y={heroSP.y + 34} />
        </g>
      </svg>
    </div>
  );
}

/** One piece of scenery; memoised so a changed visible set only renders the newcomers. */
const DecoItem = memo(function DecoItem({ kind, x, y, s }: { kind: string; x: number; y: number; s: number }) {
  return <Decoration kind={kind} x={x} y={y} s={s} />;
});

/** The scenery layer: re-renders only when the visible set or area progress changes, not on every pan frame. */
const Scenery = memo(function Scenery({ decorations, indices, infos }: { decorations: Deco[]; indices: number[]; infos: Record<string, SceneInfo> }) {
  return (
    <g className="scenery" aria-hidden>
      {indices.map((i) => {
        const d = decorations[i];
        const info = d.near ? infos[d.near] : undefined;
        const progress = !info ? 1 : info.level === 4 ? 0 : info.done / info.total;
        const blighted = !!info && info.level !== 0 && d.roll >= progress;
        return <DecoItem key={i} kind={blighted ? corruptKind(d.kind) : d.kind} x={d.x} y={d.y} s={d.s} />;
      })}
    </g>
  );
});

const AreaNode = memo(function AreaNode({
  island,
  at,
  state,
  done,
  purifying,
  culled,
  onHover,
  onOpen,
  onFocus,
}: {
  island: Island;
  at: { x: number; y: number };
  state: IslandState;
  done: number;
  purifying: boolean;
  /** off screen: stays focusable and labelled, but skips the (expensive) scene */
  culled: boolean;
  onHover: (id: string | null) => void;
  onOpen: (id: string) => void;
  onFocus: (island: Island) => void;
}) {
  const total = island.quests.length;
  const label = `${state === 'locked' ? '???' : island.name}`;
  const labelW = Math.max(130, label.length * 12.5 + 70);
  const sealed = state === 'locked';
  const completed = useStore((s) => s.completed);

  return (
    <g
      className={`area area-${state}`}
      transform={`translate(${at.x.toFixed(1)}, ${at.y.toFixed(1)})`}
      data-sfx="confirm"
      onFocus={() => onFocus(island)}
      onMouseEnter={() => onHover(island.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onOpen(island.id)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen(island.id)}
      tabIndex={0}
      role="link"
      aria-label={`${island.name}: ${island.subject}. ${STATE_LABEL[state]}, ${done} of ${total} quests.`}
    >
      <title>{`${island.name} — ${island.subject}\n${STATE_LABEL[state]} · ${done}/${total} quests`}</title>
      <g className="area-sprite">
        {!culled && <AreaScene island={island} completed={completed} purifying={purifying} />}
      </g>

      {sealed && (
        <text y="-60" textAnchor="middle" className="area-mystery">
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
        <g transform={`translate(${PLOT - 22},-54)`} aria-hidden>
          <line x1="0" y1="0" x2="0" y2="40" stroke="#3b2a1e" strokeWidth="3" />
          <path d="M0,0 L26,7 L0,14Z" fill="#ffcf3d" stroke="#3b2a1e" strokeWidth="2" />
          <text x="10" y="11" className="flag-star">
            ★
          </text>
        </g>
      )}

      <g transform={`translate(0, ${PLOT / 2 + 40})`}>
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
});

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
