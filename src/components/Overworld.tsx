import type { ReactNode } from 'react';
import type { Island, Region } from '../types';

/* ------------------------------------------------------------------ */
/* deterministic randomness                                            */
/* ------------------------------------------------------------------ */

export function rng(seed: string) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/** Smooth closed path through points using quadratic midpoints. */
function smoothClosed(pts: [number, number][]) {
  const mid = (a: number[], b: number[]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const start = mid(pts[pts.length - 1], pts[0]);
  let d = `M${start[0].toFixed(1)},${start[1].toFixed(1)}`;
  pts.forEach((p, i) => {
    const m = mid(p, pts[(i + 1) % pts.length]);
    d += ` Q${p[0].toFixed(1)},${p[1].toFixed(1)} ${m[0].toFixed(1)},${m[1].toFixed(1)}`;
  });
  return d + 'Z';
}

/** A rectangle with a wobbly, coastline-like edge. */
export function coastline(x: number, y: number, w: number, h: number, amp: number, seed: string) {
  const rand = rng(seed);
  const pts: [number, number][] = [];
  const step = 70;
  const jit = () => (rand() - 0.5) * 2 * amp;
  for (let i = 0; i <= w; i += step) pts.push([x + i, y + jit()]);
  for (let i = step; i <= h; i += step) pts.push([x + w + jit(), y + i]);
  for (let i = w - step; i >= 0; i -= step) pts.push([x + i, y + h + jit()]);
  for (let i = h - step; i > 0; i -= step) pts.push([x + jit(), y + i]);
  return smoothClosed(pts);
}

/** World size in map units. */
export const WORLD = { W: 2800, H: 1900 };

export function regionAt(x: number, y: number): Region {
  if (x < 650) return 'polyglot';
  if (y < 600) return 'ai';
  if (x > 2140 && y > 640) return 'stacks';
  return 'core';
}

/* ------------------------------------------------------------------ */
/* landmarks                                                           */
/* ------------------------------------------------------------------ */

export type Landmark = 'village' | 'castle' | 'tower' | 'cave' | 'shrine' | 'camp' | 'peak' | 'forge';

const KIND: Record<string, Landmark> = {
  web: 'village', 'html-css': 'village', mern: 'village', mobile: 'village', php: 'village', vue: 'village',
  typescript: 'castle', angular: 'castle', csharp: 'castle', cloud: 'castle', security: 'castle',
  architecture: 'tower', llm: 'tower', agents: 'tower', 'ai-production': 'tower', jamstack: 'tower',
  databases: 'cave', go: 'cave', realtime: 'cave', ruby: 'cave', rag: 'cave',
  'ai-fundamentals': 'shrine', testing: 'shrine', svelte: 'shrine',
  frontend: 'camp', python: 'camp', java: 'camp', git: 'camp', backend: 'camp',
  javascript: 'peak', summit: 'peak', rust: 'peak', ml: 'peak',
  docker: 'forge', finetune: 'forge', 'ai-apps': 'forge', cicd: 'forge', nextjs: 'forge',
};
export const landmarkOf = (island: Island): Landmark => KIND[island.id] ?? 'village';

/** Approximate sprite height above the ground line, used to place markers. */
export const LANDMARK_HEIGHT: Record<Landmark, number> = {
  village: 60,
  castle: 112,
  tower: 132,
  cave: 56,
  shrine: 74,
  camp: 56,
  peak: 118,
  forge: 92,
};

const INK = '#3b2a1e';
const WALL = '#f1e2c2';
const STONE = '#c9c2b4';

function Roof({ pts, c }: { pts: string; c: string }) {
  return <polygon points={pts} fill={c} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />;
}

function House({ x, y, w, h, c }: { x: number; y: number; w: number; h: number; c: string }) {
  return (
    <g>
      <rect x={x} y={y - h} width={w} height={h} fill={WALL} stroke={INK} strokeWidth="2.5" />
      <Roof pts={`${x - 5},${y - h} ${x + w / 2},${y - h - w * 0.62} ${x + w + 5},${y - h}`} c={c} />
      <rect x={x + w / 2 - 4} y={y - 12} width="8" height="12" fill={INK} />
      <rect x={x + 4} y={y - h + 7} width="6" height="6" fill="#ffd66b" stroke={INK} strokeWidth="1.5" />
    </g>
  );
}

function Pine({ x, y, s = 1, snow = false }: { x: number; y: number; s?: number; snow?: boolean }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x="-3" y="-8" width="6" height="10" fill="#6b4a2b" />
      <polygon points="-16,-6 0,-34 16,-6" fill="#2f6b3a" stroke="#1d4426" strokeWidth="2" />
      <polygon points="-12,-20 0,-46 12,-20" fill="#3c8146" stroke="#1d4426" strokeWidth="2" />
      {snow && <polygon points="-6,-34 0,-46 6,-34" fill="#fff" />}
    </g>
  );
}

export function LandmarkSprite({ kind, c }: { kind: Landmark; c: string }) {
  let body: ReactNode;
  switch (kind) {
    case 'village':
      body = (
        <>
          <House x={-48} y={0} w={30} h={24} c={c} />
          <House x={-8} y={2} w={38} h={32} c={c} />
          <circle cx="44" cy="-14" r="12" fill="#4f9a48" stroke="#25541f" strokeWidth="2" />
          <rect x="42" y="-4" width="5" height="8" fill="#6b4a2b" />
        </>
      );
      break;
    case 'castle':
      body = (
        <>
          <rect x="-42" y="-34" width="84" height="36" fill={STONE} stroke={INK} strokeWidth="2.5" />
          {[-40, -26, -12, 2, 16, 30].map((x) => (
            <rect key={x} x={x} y="-41" width="8" height="8" fill={STONE} stroke={INK} strokeWidth="2" />
          ))}
          <rect x="-56" y="-58" width="18" height="60" fill={STONE} stroke={INK} strokeWidth="2.5" />
          <rect x="38" y="-58" width="18" height="60" fill={STONE} stroke={INK} strokeWidth="2.5" />
          <Roof pts="-60,-58 -47,-82 -34,-58" c={c} />
          <Roof pts="34,-58 47,-82 60,-58" c={c} />
          <rect x="-14" y="-68" width="28" height="36" fill={STONE} stroke={INK} strokeWidth="2.5" />
          <Roof pts="-19,-68 0,-96 19,-68" c={c} />
          <line x1="0" y1="-96" x2="0" y2="-112" stroke={INK} strokeWidth="2" />
          <polygon points="0,-112 14,-107 0,-102" fill={c} stroke={INK} strokeWidth="1.5" />
          <path d="M-10,2 L-10,-14 Q0,-26 10,-14 L10,2Z" fill={INK} />
          <rect x="-51" y="-46" width="6" height="8" fill="#ffd66b" />
          <rect x="45" y="-46" width="6" height="8" fill="#ffd66b" />
        </>
      );
      break;
    case 'tower':
      body = (
        <>
          <rect x="-26" y="-14" width="52" height="16" fill={STONE} stroke={INK} strokeWidth="2.5" />
          <rect x="-15" y="-90" width="30" height="78" fill="#ddd6c8" stroke={INK} strokeWidth="2.5" />
          <Roof pts="-22,-90 0,-124 22,-90" c={c} />
          <circle cx="0" cy="-128" r="5" fill="#ffe27a" stroke={INK} strokeWidth="1.5" className="glow" />
          <rect x="-5" y="-78" width="10" height="12" rx="5" fill="#ffd66b" stroke={INK} strokeWidth="1.5" />
          <rect x="-5" y="-52" width="10" height="12" rx="5" fill="#ffd66b" stroke={INK} strokeWidth="1.5" />
          <path d="M-7,2 L-7,-12 Q0,-20 7,-12 L7,2Z" fill={INK} />
        </>
      );
      break;
    case 'cave':
      body = (
        <>
          <polygon points="-58,4 -44,-30 -20,-52 8,-56 36,-38 58,4" fill="#8f877b" stroke="#4a433b" strokeWidth="2.5" strokeLinejoin="round" />
          <polygon points="-30,-36 -12,-50 4,-40 -14,-28" fill="#a9a194" />
          <path d="M-18,4 L-18,-14 Q0,-36 18,-14 L18,4Z" fill="#1b1714" />
          <rect x="-28" y="-22" width="4" height="22" fill="#6b4a2b" />
          <rect x="24" y="-22" width="4" height="22" fill="#6b4a2b" />
          <circle cx="-26" cy="-26" r="5" fill={c} className="flicker" />
          <circle cx="26" cy="-26" r="5" fill={c} className="flicker" />
        </>
      );
      break;
    case 'shrine':
      body = (
        <>
          <rect x="-40" y="-6" width="80" height="8" fill={STONE} stroke={INK} strokeWidth="2" />
          <rect x="-34" y="-12" width="68" height="7" fill={STONE} stroke={INK} strokeWidth="2" />
          {[-28, -10, 6, 22].map((x) => (
            <rect key={x} x={x} y="-50" width="7" height="38" fill="#eee7d8" stroke={INK} strokeWidth="2" />
          ))}
          <Roof pts="-40,-50 0,-74 40,-50" c={c} />
          <circle cx="0" cy="-32" r="8" fill={c} stroke={INK} strokeWidth="2" className="glow" />
        </>
      );
      break;
    case 'camp':
      body = (
        <>
          <Pine x={-40} y={-4} s={1.1} />
          <Pine x={42} y={-8} s={0.9} />
          <polygon points="-24,2 0,-44 24,2" fill={c} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <polygon points="-6,2 0,-16 6,2" fill={INK} />
          <line x1="0" y1="-44" x2="0" y2="-54" stroke={INK} strokeWidth="2" />
          <g transform="translate(24,4)">
            <rect x="-8" y="-2" width="16" height="4" fill="#6b4a2b" />
            <path d="M-5,-2 Q0,-16 5,-2Z" fill="#ff9b3d" className="flicker" />
          </g>
        </>
      );
      break;
    case 'peak':
      body = (
        <>
          <polygon points="-62,4 -30,-50 2,4" fill="#7f7a8c" stroke="#3f3b4a" strokeWidth="2.5" strokeLinejoin="round" />
          <polygon points="-34,4 6,-96 52,4" fill="#9590a3" stroke="#3f3b4a" strokeWidth="2.5" strokeLinejoin="round" />
          <polygon points="-6,-66 6,-96 19,-66 11,-72 4,-64" fill="#fff" />
          <line x1="6" y1="-96" x2="6" y2="-118" stroke={INK} strokeWidth="2" />
          <polygon points="6,-118 22,-112 6,-106" fill={c} stroke={INK} strokeWidth="1.5" />
        </>
      );
      break;
    case 'forge':
      body = (
        <>
          <rect x="18" y="-62" width="12" height="30" fill="#8a7f72" stroke={INK} strokeWidth="2" />
          <circle cx="26" cy="-72" r="7" fill="#d8d8d8" opacity="0.7" className="smoke" />
          <circle cx="32" cy="-86" r="9" fill="#d8d8d8" opacity="0.5" className="smoke s2" />
          <rect x="-40" y="-30" width="76" height="32" fill={WALL} stroke={INK} strokeWidth="2.5" />
          <Roof pts="-46,-30 -2,-56 42,-30" c={c} />
          <rect x="-30" y="-20" width="18" height="14" fill="#ff8a2a" stroke={INK} strokeWidth="2" className="flicker" />
          <rect x="4" y="-18" width="12" height="20" fill={INK} />
          <path d="M-58,2 L-56,-8 L-42,-8 L-46,-2 L-44,2Z" fill="#555" stroke={INK} strokeWidth="1.5" />
        </>
      );
      break;
  }
  return <g className="landmark">{body}</g>;
}

/* ------------------------------------------------------------------ */
/* terrain decorations                                                 */
/* ------------------------------------------------------------------ */

export function Decoration({ kind, x, y, s }: { kind: string; x: number; y: number; s: number }) {
  switch (kind) {
    case 'pine':
      return <Pine x={x} y={y} s={s} />;
    case 'snowpine':
      return <Pine x={x} y={y} s={s} snow />;
    case 'tree':
      return (
        <g transform={`translate(${x},${y}) scale(${s})`}>
          <rect x="-3" y="-10" width="6" height="12" fill="#6b4a2b" />
          <circle cx="0" cy="-20" r="14" fill="#5aa64c" stroke="#2c5e25" strokeWidth="2" />
          <circle cx="-5" cy="-24" r="5" fill="#7cc46a" />
        </g>
      );
    case 'bush':
      return (
        <g transform={`translate(${x},${y}) scale(${s})`}>
          <ellipse cx="0" cy="-5" rx="12" ry="8" fill="#4f9a48" stroke="#2c5e25" strokeWidth="2" />
        </g>
      );
    case 'flowers':
      return (
        <g transform={`translate(${x},${y}) scale(${s})`}>
          <circle cx="-6" cy="-2" r="3" fill="#ffe36b" />
          <circle cx="2" cy="-5" r="3" fill="#ff8fb1" />
          <circle cx="7" cy="0" r="3" fill="#fff" />
        </g>
      );
    case 'hill':
      return (
        <g transform={`translate(${x},${y}) scale(${s})`}>
          <path d="M-34,4 Q0,-36 34,4Z" fill="#79b85b" stroke="#3f7a34" strokeWidth="2" />
        </g>
      );
    case 'mountain':
      return (
        <g transform={`translate(${x},${y}) scale(${s})`}>
          <polygon points="-36,4 0,-56 36,4" fill="#8c84a6" stroke="#463f5c" strokeWidth="2.5" strokeLinejoin="round" />
          <polygon points="-11,-38 0,-56 11,-38 4,-42 -3,-36" fill="#fff" />
        </g>
      );
    case 'crystal':
      return (
        <g transform={`translate(${x},${y}) scale(${s})`}>
          <polygon points="-6,4 -9,-14 -2,-26 4,-14 2,4" fill="#b98cff" stroke="#5b3a99" strokeWidth="2" className="glow" />
          <polygon points="2,4 6,-10 12,-16 13,4" fill="#8be0ff" stroke="#2f6f8f" strokeWidth="2" />
        </g>
      );
    case 'cactus':
      return (
        <g transform={`translate(${x},${y}) scale(${s})`}>
          <rect x="-4" y="-30" width="8" height="32" rx="4" fill="#4c9a52" stroke="#285c2c" strokeWidth="2" />
          <path d="M-4,-14 H-11 V-22" fill="none" stroke="#285c2c" strokeWidth="6" strokeLinecap="round" />
          <path d="M4,-18 H11 V-26" fill="none" stroke="#285c2c" strokeWidth="6" strokeLinecap="round" />
        </g>
      );
    case 'rock':
      return (
        <g transform={`translate(${x},${y}) scale(${s})`}>
          <polygon points="-12,4 -9,-8 2,-12 12,-4 10,4" fill="#a3937c" stroke="#5c5040" strokeWidth="2" />
        </g>
      );
    case 'mesa':
      return (
        <g transform={`translate(${x},${y}) scale(${s})`}>
          <polygon points="-40,4 -30,-30 28,-30 40,4" fill="#cf8a4f" stroke="#7a4a24" strokeWidth="2.5" />
          <rect x="-30" y="-30" width="58" height="6" fill="#e3a46a" />
        </g>
      );
    default:
      return null;
  }
}

const PALETTE: Record<Region, [string, number][]> = {
  polyglot: [['pine', 0.75], ['tree', 0.9], ['bush', 1]],
  core: [['tree', 0.35], ['bush', 0.6], ['flowers', 0.8], ['hill', 1]],
  stacks: [['cactus', 0.4], ['rock', 0.75], ['mesa', 0.88], ['bush', 1]],
  ai: [['mountain', 0.45], ['crystal', 0.72], ['snowpine', 1]],
};
const DENSITY: Record<Region, number> = { polyglot: 1, core: 0.38, stacks: 0.45, ai: 0.75 };

export function scatterDecorations(
  W: number,
  H: number,
  avoidPoints: { x: number; y: number; r: number }[],
): { kind: string; x: number; y: number; s: number }[] {
  const rand = rng('dev-odyssey-terrain');
  const out: { kind: string; x: number; y: number; s: number }[] = [];
  const attempts = Math.round((W * H) / 1700);
  for (let i = 0; i < attempts; i++) {
    const x = 60 + rand() * (W - 120);
    const y = 60 + rand() * (H - 120);
    const region = regionAt(x, y);
    if (rand() > DENSITY[region]) continue;
    if (avoidPoints.some((p) => (p.x - x) ** 2 + (p.y - y) ** 2 < p.r * p.r)) continue;
    if (out.some((d) => (d.x - x) ** 2 + (d.y - y) ** 2 < 34 * 34)) continue;
    const roll = rand();
    const kind = PALETTE[region].find(([, t]) => roll <= t)![0];
    out.push({ kind, x, y, s: 0.8 + rand() * 0.45 });
  }
  return out.sort((a, b) => a.y - b.y);
}

/* ------------------------------------------------------------------ */
/* hero                                                                */
/* ------------------------------------------------------------------ */

// 10 x 13 pixel adventurer. Each letter maps to a colour below.
const HERO = [
  '...HHHH...',
  '..HHHHHH..',
  '.HHSSSSHH.',
  '..SESSES..',
  '...SSSS...',
  '..CTTTTC.W',
  '.CCTTTTCCW',
  '.CTTbbTTCW',
  '.CTTTTTTCG',
  '..TT..TT..',
  '..LL..LL..',
  '..LL..LL..',
  '.BBB..BBB.',
];
const HERO_COLORS: Record<string, string> = {
  H: '#7a3e1d',
  S: '#ffd2a6',
  E: '#1c1c2e',
  C: '#c8332f',
  T: '#2f5fc4',
  b: '#e8b33d',
  W: '#e6eef8',
  G: '#e8b33d',
  L: '#3a2f4a',
  B: '#5a3a22',
};

export function Hero({ x, y }: { x: number; y: number }) {
  const px = 4;
  return (
    <g transform={`translate(${x - 30}, ${y - 78}) scale(1.5)`} className="hero" aria-label="You are here">
      <ellipse cx="20" cy="53" rx="16" ry="5" fill="#000" opacity="0.25" />
      <g className="hero-bob" shapeRendering="crispEdges">
        {HERO.flatMap((row, ry) =>
          [...row].map((ch, rx) =>
            ch === '.' ? null : <rect key={`${rx}-${ry}`} x={rx * px} y={ry * px} width={px} height={px} fill={HERO_COLORS[ch]} />,
          ),
        )}
      </g>
    </g>
  );
}
