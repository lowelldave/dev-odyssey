import type { ReactNode } from 'react';
import type { Island, Region } from '../types';

/* ================================================================== */
/* World space, isometric projection and layout                        */
/* ================================================================== */

/**
 * World scale: island `pos` values are authored on a 2800x1900 plane and
 * stretched by WS so every area gets room for its monsters and scenery.
 */
export const WS = 1.6;
/** Ground-plane world size (top-down units). */
export const WORLD = { W: 2800 * WS, H: 1900 * WS };

/** 2:1 isometric projection from world (x, y) to screen pixels. */
const KX = 0.72;
const KY = 0.36;
const OX = WORLD.H * KX + 180;
const OY = 180;
export const SCREEN = {
  W: Math.round((WORLD.W + WORLD.H) * KX + 360),
  H: Math.round((WORLD.W + WORLD.H) * KY + OY + 170),
};
export const project = (x: number, y: number) => ({ x: (x - y) * KX + OX, y: (x + y) * KY + OY });

export function rng(seed: string) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function regionAt(wx: number, wy: number): Region {
  const x = wx / WS;
  const y = wy / WS;
  if (x < 650) return 'polyglot';
  if (y < 600) return 'ai';
  if (x > 2140 && y > 640) return 'stacks';
  return 'core';
}

/** Where each region's areas may sit (world units), so jitter never crosses borders. */
const REGION_BOX = Object.fromEntries(
  Object.entries({
    polyglot: [110, 630, 640, 1800],
    ai: [720, 2380, 130, 560],
    stacks: [2190, 2690, 720, 1780],
    core: [720, 2100, 680, 1780],
  }).map(([k, v]) => [k, v.map((n) => n * WS)]),
) as Record<Region, [number, number, number, number]>;

/**
 * Natural-looking layout: every area is nudged by a fixed pseudo-random amount
 * (same on every visit), then nearby areas are pushed apart so labels never collide.
 */
const unproject = (sx: number, sy: number) => {
  const d = (sx - OX) / KX; // x - y
  const s = (sy - OY) / KY; // x + y
  return { x: (s + d) / 2, y: (s - d) / 2 };
};

export function layoutPositions(islands: Island[]): Record<string, { x: number; y: number }> {
  const pts = islands.map((i) => {
    const r = rng(`jitter-${i.id}`);
    return { id: i.id, region: i.region, x: (i.pos.x + (r() - 0.5) * 260) * WS, y: (i.pos.y + (r() - 0.5) * 220) * WS };
  });
  // Spacing is checked on screen (an ellipse: wide for labels, tall for sprites),
  // because the isometric view can stack points that look far apart in world space.
  const RX = 340;
  const RY = 270;
  for (let iter = 0; iter < 120; iter++) {
    const sp = pts.map((p) => project(p.x, p.y));
    for (let a = 0; a < pts.length; a++) {
      for (let b = a + 1; b < pts.length; b++) {
        const dx = (sp[b].x - sp[a].x) / RX;
        const dy = (sp[b].y - sp[a].y) / RY;
        const d = Math.hypot(dx, dy);
        if (d < 1) {
          const push = (1 - d) / 2 + 0.01;
          const ux = d ? dx / d : 1;
          const uy = d ? dy / d : 0;
          sp[a] = { x: sp[a].x - ux * push * RX, y: sp[a].y - uy * push * RY };
          sp[b] = { x: sp[b].x + ux * push * RX, y: sp[b].y + uy * push * RY };
        }
      }
    }
    pts.forEach((p, i) => {
      const w = unproject(sp[i].x, sp[i].y);
      const [x0, x1, y0, y1] = REGION_BOX[p.region];
      p.x = Math.min(x1, Math.max(x0, w.x));
      p.y = Math.min(y1, Math.max(y0, w.y));
    });
  }
  return Object.fromEntries(pts.map((p) => [p.id, { x: p.x, y: p.y }]));
}

/** Smooth closed path through screen points. */
export function smoothClosed(pts: { x: number; y: number }[]) {
  const mid = (a: { x: number; y: number }, b: { x: number; y: number }) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const start = mid(pts[pts.length - 1], pts[0]);
  let d = `M${start.x.toFixed(1)},${start.y.toFixed(1)}`;
  pts.forEach((p, i) => {
    const m = mid(p, pts[(i + 1) % pts.length]);
    d += ` Q${p.x.toFixed(1)},${p.y.toFixed(1)} ${m.x.toFixed(1)},${m.y.toFixed(1)}`;
  });
  return d + 'Z';
}

/** A wobbly coastline around the world rectangle, projected to screen. */
export function continentPath(inset: number, amp: number, seed: string) {
  const rand = rng(seed);
  const { W, H } = WORLD;
  const pts: { x: number; y: number }[] = [];
  const step = 120;
  const jit = () => (rand() - 0.5) * 2 * amp;
  for (let i = inset; i <= W - inset; i += step) pts.push({ x: i, y: inset + jit() });
  for (let i = inset + step; i <= H - inset; i += step) pts.push({ x: W - inset + jit(), y: i });
  for (let i = W - inset - step; i >= inset; i -= step) pts.push({ x: i, y: H - inset + jit() });
  for (let i = H - inset - step; i > inset; i -= step) pts.push({ x: inset + jit(), y: i });
  return smoothClosed(pts.map((p) => project(p.x, p.y)));
}

/** A world-space ellipse, projected (for biome tints). */
export function isoEllipse(cx: number, cy: number, rx: number, ry: number) {
  const pts = Array.from({ length: 40 }, (_, i) => {
    const a = (i / 40) * Math.PI * 2;
    return project(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry);
  });
  return smoothClosed(pts);
}

/* ================================================================== */
/* Colour helpers and iso primitives                                   */
/* ================================================================== */

export function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(amt > 0 ? c + (255 - c) * amt : c * (1 + amt))));
  const r = f((n >> 16) & 255);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

const pt = (x: number, y: number) => `${x.toFixed(1)},${y.toFixed(1)}`;
const EDGE = 'rgba(40,28,20,0.55)';

interface Faces {
  top: string;
  left: string;
  right: string;
}

/** Isometric box standing on ground point (cx, cy): half-width a, height h. */
function IsoBox({ cx, cy, a, h, c, b = a / 2 }: { cx: number; cy: number; a: number; h: number; c: Faces; b?: number }) {
  const N = [cx, cy - b];
  const E = [cx + a, cy];
  const S = [cx, cy + b];
  const W = [cx - a, cy];
  const up = (p: number[]) => [p[0], p[1] - h];
  const poly = (ps: number[][], fill: string) => (
    <polygon points={ps.map((p) => pt(p[0], p[1])).join(' ')} fill={fill} stroke={EDGE} strokeWidth="1" strokeLinejoin="round" />
  );
  return (
    <g>
      {poly([W, S, up(S), up(W)], c.left)}
      {poly([S, E, up(E), up(S)], c.right)}
      {poly([up(N), up(E), up(S), up(W)], c.top)}
    </g>
  );
}

/** Pyramid roof on top of a box (base at height h). */
function IsoPyramid({ cx, cy, a, h, ph, color, b = a / 2 }: { cx: number; cy: number; a: number; h: number; ph: number; color: string; b?: number }) {
  const top = cy - h;
  const apex = [cx, top - ph];
  const W = [cx - a, top];
  const S = [cx, top + b];
  const E = [cx + a, top];
  return (
    <g>
      <polygon points={[W, S, apex].map((p) => pt(p[0], p[1])).join(' ')} fill={shade(color, 0.12)} stroke={EDGE} strokeWidth="1" strokeLinejoin="round" />
      <polygon points={[S, E, apex].map((p) => pt(p[0], p[1])).join(' ')} fill={shade(color, -0.28)} stroke={EDGE} strokeWidth="1" strokeLinejoin="round" />
    </g>
  );
}

/** Window on the right-hand face of a box (follows the face slope). */
function RightWindow({ x, y, w = 6, h = 9 }: { x: number; y: number; w?: number; h?: number }) {
  return <polygon points={`${pt(x, y)} ${pt(x + w, y - w / 2)} ${pt(x + w, y - w / 2 - h)} ${pt(x, y - h)}`} fill="#ffd36b" className="win" />;
}
function LeftWindow({ x, y, w = 6, h = 9 }: { x: number; y: number; w?: number; h?: number }) {
  return <polygon points={`${pt(x, y)} ${pt(x + w, y + w / 2)} ${pt(x + w, y + w / 2 - h)} ${pt(x, y - h)}`} fill="#ffd36b" className="win" />;
}

const STONE: Faces = { top: '#f7f4fc', left: '#e9e4f3', right: '#bfb7d4' };
const PLASTER: Faces = { top: '#fff7e6', left: '#fbefd5', right: '#dcc69d' };
const WOOD: Faces = { top: '#c98f58', left: '#b07a43', right: '#7f5129' };

/** Raised grass tile each landmark stands on. */
export function GroundTile({ a = 74, grass = '#8fd06f' }: { a?: number; grass?: string }) {
  return (
    <>
      <ellipse cx="6" cy="22" rx={a + 10} ry={a / 2 + 4} fill="rgba(0,0,0,0.18)" />
      <IsoBox cx={0} cy={0} a={a} h={14} c={{ top: grass, left: '#a5733f', right: '#7c5229' }} />
      <polygon points={`${pt(-a * 0.55, -14 - a * 0.05)} ${pt(0, -14 + a * 0.22)} ${pt(a * 0.4, -14 + a * 0.02)}`} fill="rgba(255,255,255,0.08)" />
    </>
  );
}

/* ================================================================== */
/* Landmarks                                                           */
/* ================================================================== */

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

/** Approximate sprite height above the ground point, used to place markers. */
export const LANDMARK_HEIGHT: Record<Landmark, number> = {
  village: 78,
  castle: 140,
  tower: 168,
  cave: 82,
  shrine: 96,
  camp: 80,
  peak: 150,
  forge: 120,
};

export const GROUND: Record<Region, string> = { core: '#8fd06f', polyglot: '#6fbf62', stacks: '#e7cf8e', ai: '#b8acdc' };

export function LandmarkSprite({ kind, c, region }: { kind: Landmark; c: string; region: Region }) {
  return (
    <g className="landmark">
      <GroundTile grass={GROUND[region]} />
      <LandmarkBody kind={kind} c={c} />
    </g>
  );
}

/** The landmark building itself, standing on a ground tile whose top is at y = -14. */
export function LandmarkBody({ kind, c }: { kind: Landmark; c: string }) {
  const T = -14; // top of the ground tile
  let body: ReactNode;
  switch (kind) {
    case 'village':
      body = (
        <>
          <IsoTree x={-44} y={T - 10} s={0.9} />
          <IsoBox cx={-22} cy={T - 4} a={18} h={20} c={PLASTER} />
          <IsoPyramid cx={-22} cy={T - 4} a={21} h={20} ph={18} color={c} />
          <RightWindow x={-16} y={T - 4} />
          <IsoBox cx={18} cy={T + 12} a={22} h={24} c={PLASTER} />
          <IsoPyramid cx={18} cy={T + 12} a={26} h={24} ph={22} color={c} />
          <RightWindow x={26} y={T + 12} />
          <LeftWindow x={1} y={T + 7} w={5} h={11} />
          <IsoTree x={46} y={T - 4} s={0.75} />
        </>
      );
      break;
    case 'castle':
      body = (
        <>
          <IsoBox cx={0} cy={T} a={44} h={44} c={STONE} />
          <IsoBox cx={-44} cy={T} a={12} h={82} c={STONE} />
          <IsoPyramid cx={-44} cy={T} a={15} h={82} ph={30} color={c} />
          <IsoBox cx={44} cy={T} a={12} h={82} c={STONE} />
          <IsoPyramid cx={44} cy={T} a={15} h={82} ph={30} color={c} />
          <IsoBox cx={0} cy={T - 10} a={15} h={78} c={STONE} />
          <IsoPyramid cx={0} cy={T - 10} a={18} h={78} ph={34} color={c} />
          <line x1="0" y1={T - 122} x2="0" y2={T - 140} stroke="#4a3528" strokeWidth="2" />
          <polygon points={`0,${T - 140} 16,${T - 134} 0,${T - 128}`} fill="#ffcf3d" className="flag" />
          <path d={`M-20,${T + 12} L-20,${T - 6} Q-12,${T - 16} -4,${T + 2} L-4,${T + 20} Z`} fill="#4a2f1f" />
          <LeftWindow x={-50} y={T - 52} />
          <RightWindow x={46} y={T - 52} />
          <RightWindow x={4} y={T - 52} w={6} h={11} />
        </>
      );
      break;
    case 'tower':
      body = (
        <>
          <IsoBox cx={0} cy={T} a={30} h={12} c={STONE} />
          <IsoBox cx={0} cy={T - 4} a={17} h={104} c={{ top: '#f3effa', left: '#e4def0', right: '#b7aecd' }} />
          <IsoPyramid cx={0} cy={T - 4} a={21} h={104} ph={40} color={c} />
          <circle cx="0" cy={T - 154} r="7" fill="#ffe27a" className="glow" />
          <circle cx="0" cy={T - 154} r="14" fill="#ffe27a" opacity="0.25" className="glow" />
          <LeftWindow x={-12} y={T - 40} w={6} h={12} />
          <RightWindow x={4} y={T - 72} w={6} h={12} />
          <LeftWindow x={-12} y={T - 88} w={6} h={10} />
          <path d={`M-12,${T + 2} L-12,${T - 14} Q-7,${T - 22} -2,${T - 10} L-2,${T + 8} Z`} fill="#4a2f1f" />
        </>
      );
      break;
    case 'cave':
      body = (
        <>
          <polygon points={`-62,${T + 6} -48,${T - 34} -18,${T - 62} 2,${T - 30} 0,${T + 30}`} fill="#a79f93" stroke={EDGE} strokeWidth="1" />
          <polygon points={`0,${T + 30} 2,${T - 30} -18,${T - 62} 24,${T - 58} 50,${T - 30} 64,${T + 6}`} fill="#7c7468" stroke={EDGE} strokeWidth="1" />
          <polygon points={`-18,${T - 62} 24,${T - 58} 8,${T - 74}`} fill="#c2bbae" stroke={EDGE} strokeWidth="1" />
          <path d={`M-40,${T + 14} L-40,${T - 6} Q-26,${T - 34} -10,${T - 4} L-10,${T + 24} Z`} fill="#1c1714" />
          <rect x="-48" y={T - 22} width="4" height="24" fill="#6b4a2b" />
          <circle cx="-46" cy={T - 26} r="5" fill={c} className="flicker" />
          <circle cx="-46" cy={T - 26} r="10" fill={c} opacity="0.3" className="flicker" />
          <polygon points={`30,${T - 4} 36,${T - 20} 42,${T - 6}`} fill="#8ce0ff" className="glow" />
        </>
      );
      break;
    case 'shrine':
      body = (
        <>
          <IsoBox cx={0} cy={T} a={44} h={7} c={STONE} />
          <IsoBox cx={0} cy={T - 7} a={36} h={7} c={STONE} />
          {[
            [-26, -2],
            [0, -15],
            [0, 11],
            [26, -2],
          ].map(([x, y]) => (
            <IsoBox key={`${x}${y}`} cx={x} cy={T - 14 + y} a={4} h={40} c={{ top: '#fff', left: '#f1ece2', right: '#cfc7b6' }} />
          ))}
          <IsoBox cx={0} cy={T - 54} a={36} h={6} c={STONE} />
          <IsoPyramid cx={0} cy={T - 54} a={40} h={6} ph={22} color={c} />
          <circle cx="0" cy={T - 34} r="9" fill={shade(c, 0.35)} className="glow" />
          <circle cx="0" cy={T - 34} r="17" fill={shade(c, 0.35)} opacity="0.25" className="glow" />
        </>
      );
      break;
    case 'camp':
      body = (
        <>
          <IsoPine x={-44} y={T - 8} s={1} />
          <IsoPine x={40} y={T - 14} s={0.85} />
          <polygon points={`-30,${T + 6} 0,${T + 20} 2,${T - 48}`} fill={shade(c, 0.1)} stroke={EDGE} strokeWidth="1" strokeLinejoin="round" />
          <polygon points={`0,${T + 20} 30,${T + 4} 2,${T - 48}`} fill={shade(c, -0.3)} stroke={EDGE} strokeWidth="1" strokeLinejoin="round" />
          <polygon points={`-8,${T + 16} 0,${T + 20} 1,${T - 6}`} fill="#3a281c" />
          <line x1="2" y1={T - 48} x2="2" y2={T - 60} stroke="#4a3528" strokeWidth="2" />
          <g transform={`translate(30,${T + 18})`}>
            <ellipse cx="0" cy="2" rx="10" ry="5" fill="#5a4030" />
            <path d="M-6,0 Q0,-18 6,0Z" fill="#ff9b3d" className="flicker" />
            <path d="M-3,0 Q0,-10 3,0Z" fill="#ffe27a" className="flicker" />
          </g>
        </>
      );
      break;
    case 'peak':
      body = (
        <>
          <polygon points={`-70,${T + 8} -36,${T - 58} -6,${T + 22}`} fill="#a19bb3" stroke={EDGE} strokeWidth="1" strokeLinejoin="round" />
          <polygon points={`-6,${T + 22} -36,${T - 58} 4,${T + 4}`} fill="#7b7590" stroke={EDGE} strokeWidth="1" strokeLinejoin="round" />
          <polygon points={`-46,${T + 14} 8,${T - 110} 8,${T + 34}`} fill="#b3adc4" stroke={EDGE} strokeWidth="1" strokeLinejoin="round" />
          <polygon points={`8,${T + 34} 8,${T - 110} 66,${T + 8}`} fill="#837d98" stroke={EDGE} strokeWidth="1" strokeLinejoin="round" />
          <polygon points={`-10,${T - 72} 8,${T - 110} 8,${T - 66} 0,${T - 74}`} fill="#ffffff" />
          <polygon points={`8,${T - 110} 30,${T - 70} 20,${T - 74} 8,${T - 66}`} fill="#dfe4f2" />
          <line x1="8" y1={T - 110} x2="8" y2={T - 134} stroke="#4a3528" strokeWidth="2" />
          <polygon points={`8,${T - 134} 25,${T - 128} 8,${T - 122}`} fill={c} className="flag" />
        </>
      );
      break;
    case 'forge':
      body = (
        <>
          <IsoBox cx={24} cy={T - 20} a={7} h={64} c={{ top: '#8f8478', left: '#9d9286', right: '#6f655b' }} />
          <circle cx="26" cy={T - 92} r="8" fill="#e2e2e2" opacity="0.7" className="smoke" />
          <circle cx="34" cy={T - 108} r="10" fill="#e2e2e2" opacity="0.5" className="smoke s2" />
          <IsoBox cx={-4} cy={T + 4} a={34} h={30} c={WOOD} />
          <IsoPyramid cx={-4} cy={T + 4} a={38} h={30} ph={20} color={c} />
          <polygon points={`-30,${T - 1} -14,${T + 7} -14,${T - 9} -30,${T - 17}`} fill="#ff8a2a" className="flicker" />
          <RightWindow x={6} y={T + 2} w={8} h={10} />
          <path d={`M34,${T + 24} l12,-6 l8,4 l-12,6 Z`} fill="#5b5b66" stroke={EDGE} strokeWidth="1" />
        </>
      );
      break;
  }
  return <g className="landmark">{body}</g>;
}

/* ================================================================== */
/* Scenery                                                             */
/* ================================================================== */

function IsoPine({ x, y, s = 1, snow = false }: { x: number; y: number; s?: number; snow?: boolean }) {
  const cone = (w: number, top: number, base: number, k: string) => (
    <g key={k}>
      <polygon points={`${-w},${base} 0,${top} 0,${base + w * 0.25}`} fill="#3f8f4c" />
      <polygon points={`0,${base + w * 0.25} 0,${top} ${w},${base}`} fill="#2b6b38" />
    </g>
  );
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <ellipse cx="4" cy="2" rx="14" ry="6" fill="rgba(0,0,0,0.18)" />
      <rect x="-2.5" y="-8" width="5" height="10" fill="#6b4a2b" />
      {cone(17, -34, -6, 'a')}
      {cone(13, -50, -22, 'b')}
      {cone(9, -62, -38, 'c')}
      {snow && <polygon points="-5,-54 0,-62 5,-54 0,-52" fill="#fff" />}
    </g>
  );
}

function IsoTree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <ellipse cx="4" cy="2" rx="16" ry="7" fill="rgba(0,0,0,0.18)" />
      <rect x="-3" y="-12" width="6" height="14" fill="#7a4f2c" />
      <circle cx="0" cy="-26" r="16" fill="#58a64b" />
      <path d="M0,-42 A16,16 0 0 1 0,-10 A12,16 0 0 0 0,-42Z" fill="#3f8a3a" />
      <circle cx="-6" cy="-31" r="6" fill="#7dc76a" />
    </g>
  );
}

/** What a piece of scenery turns into while the area next to it is corrupted. */
const CORRUPTED: Record<string, string> = {
  pine: 'deadtree',
  snowpine: 'deadtree',
  tree: 'deadtree',
  cactus: 'deadtree',
  bush: 'thorns',
  flowers: 'bones',
  hill: 'ashhill',
  crystal: 'darkcrystal',
};
export const corruptKind = (kind: string) => CORRUPTED[kind] ?? kind;

export function Decoration({ kind, x, y, s }: { kind: string; x: number; y: number; s: number }) {
  switch (kind) {
    case 'deadtree':
      return (
        <g transform={`translate(${x},${y}) scale(${s})`}>
          <ellipse cx="3" cy="2" rx="12" ry="5" fill="rgba(0,0,0,0.22)" />
          <path d="M0,2 L0,-34 M0,-16 L-11,-27 M0,-24 L9,-36 M0,-34 L-5,-44 M-11,-27 L-15,-25 M9,-36 L14,-38" stroke="#2c211c" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M0,2 L0,-34" stroke="#3d2f28" strokeWidth="1.5" fill="none" />
        </g>
      );
    case 'thorns':
      return (
        <g transform={`translate(${x},${y}) scale(${s})`}>
          <path d="M-12,2 Q-10,-12 -2,-6 Q0,-16 6,-8 Q12,-12 12,2 Z" fill="#3a2e2a" />
          <path d="M-8,-4 l-4,-5 M2,-10 l1,-6 M8,-6 l5,-4 M-2,-6 l-2,-6" stroke="#5a4038" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      );
    case 'bones':
      return (
        <g transform={`translate(${x},${y}) scale(${s})`}>
          <ellipse cx="0" cy="-3" rx="5" ry="4" fill="#d9d0bd" />
          <circle cx="-2" cy="-4" r="1" fill="#2c211c" />
          <circle cx="2" cy="-4" r="1" fill="#2c211c" />
          <path d="M5,1 L14,-2" stroke="#d9d0bd" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case 'ashhill':
      return (
        <g transform={`translate(${x},${y}) scale(${s})`}>
          <path d="M-40,4 Q-6,-34 2,-30 L4,14 Z" fill="#6c605a" />
          <path d="M2,-30 Q14,-30 40,4 L4,14Z" fill="#544a45" />
          <path d="M-14,-6 l6,4 l-2,6" stroke="#ff6a2a" strokeWidth="1.5" fill="none" opacity="0.7" />
        </g>
      );
    case 'darkcrystal':
      return (
        <g transform={`translate(${x},${y}) scale(${s})`} className="glow">
          <polygon points="-8,4 -10,-14 -3,-28 0,-14 -1,6" fill="#8a3a3a" />
          <polygon points="-1,6 0,-14 -3,-28 4,-14 3,4" fill="#5a2020" />
          <polygon points="3,4 6,-10 12,-18 12,4" fill="#c2553a" />
        </g>
      );
    case 'pine':
      return <IsoPine x={x} y={y} s={s} />;
    case 'snowpine':
      return <IsoPine x={x} y={y} s={s} snow />;
    case 'tree':
      return <IsoTree x={x} y={y} s={s} />;
    case 'bush':
      return (
        <g transform={`translate(${x},${y}) scale(${s})`}>
          <ellipse cx="0" cy="-5" rx="13" ry="8" fill="#55a24b" />
          <path d="M0,-13 A13,8 0 0 1 13,-5 A13,8 0 0 1 0,3Z" fill="#3e8538" />
        </g>
      );
    case 'flowers':
      return (
        <g transform={`translate(${x},${y}) scale(${s})`}>
          <circle cx="-6" cy="-2" r="2.6" fill="#ffe36b" />
          <circle cx="1" cy="-4" r="2.6" fill="#ff8fb1" />
          <circle cx="7" cy="0" r="2.6" fill="#fff" />
          <circle cx="-1" cy="2" r="2.6" fill="#a9d4ff" />
        </g>
      );
    case 'hill':
      return (
        <g transform={`translate(${x},${y}) scale(${s})`}>
          <path d="M-40,4 Q-6,-34 2,-30 L4,14 Z" fill="#86c466" />
          <path d="M2,-30 Q14,-30 40,4 L4,14Z" fill="#6aa94e" />
        </g>
      );
    case 'mountain':
      return (
        <g transform={`translate(${x},${y}) scale(${s})`}>
          <ellipse cx="6" cy="6" rx="40" ry="12" fill="rgba(0,0,0,0.15)" />
          <polygon points="-38,4 2,-62 2,16" fill="#a29bba" />
          <polygon points="2,16 2,-62 40,2" fill="#7a7392" />
          <polygon points="-12,-40 2,-62 2,-36 -4,-42" fill="#fff" />
          <polygon points="2,-62 16,-40 9,-43 2,-36" fill="#dde2f1" />
        </g>
      );
    case 'crystal':
      return (
        <g transform={`translate(${x},${y}) scale(${s})`} className="glow">
          <polygon points="-8,4 -10,-14 -3,-28 0,-14 -1,6" fill="#c9a2ff" />
          <polygon points="-1,6 0,-14 -3,-28 4,-14 3,4" fill="#8a5ad9" />
          <polygon points="3,4 6,-10 12,-18 12,4" fill="#9fe7ff" />
          <polygon points="12,4 12,-18 16,-8 15,3" fill="#4fa7c9" />
        </g>
      );
    case 'cactus':
      return (
        <g transform={`translate(${x},${y}) scale(${s})`}>
          <ellipse cx="3" cy="2" rx="10" ry="4" fill="rgba(0,0,0,0.15)" />
          <rect x="-5" y="-32" width="5" height="34" rx="2" fill="#5bb062" />
          <rect x="0" y="-32" width="5" height="34" rx="2" fill="#3d8a45" />
          <path d="M-5,-14 H-11 V-24" fill="none" stroke="#4c9f53" strokeWidth="5" strokeLinecap="round" />
          <path d="M5,-18 H11 V-27" fill="none" stroke="#3d8a45" strokeWidth="5" strokeLinecap="round" />
        </g>
      );
    case 'rock':
      return (
        <g transform={`translate(${x},${y}) scale(${s})`}>
          <polygon points="-13,4 -10,-8 1,-13 2,6" fill="#b6a68e" />
          <polygon points="2,6 1,-13 12,-6 13,3" fill="#8a7a62" />
        </g>
      );
    case 'mesa':
      return (
        <g transform={`translate(${x},${y}) scale(${s})`}>
          <ellipse cx="6" cy="10" rx="44" ry="14" fill="rgba(0,0,0,0.15)" />
          <IsoBox cx={0} cy={0} a={36} h={28} c={{ top: '#f0b47a', left: '#d98a4e', right: '#a85f2c' }} />
          <polygon points="-36,-14 0,4 36,-14 36,-18 0,0 -36,-18" fill="rgba(255,255,255,0.18)" />
        </g>
      );
    default:
      return null;
  }
}

const PALETTE: Record<Region, [string, number][]> = {
  polyglot: [['pine', 0.72], ['tree', 0.9], ['bush', 1]],
  core: [['tree', 0.34], ['bush', 0.58], ['flowers', 0.8], ['hill', 1]],
  stacks: [['cactus', 0.42], ['rock', 0.76], ['mesa', 0.88], ['bush', 1]],
  ai: [['mountain', 0.42], ['crystal', 0.72], ['snowpine', 1]],
};
const DENSITY: Record<Region, number> = { polyglot: 1, core: 0.36, stacks: 0.42, ai: 0.72 };

/** Scenery scattered in world space (deterministic), returned in screen coords sorted back-to-front. */
export interface Deco {
  kind: string;
  x: number;
  y: number;
  s: number;
  /** nearest area within its sphere of influence */
  near?: string;
  /** 0..1: this piece recovers once the area is at least this far along */
  roll: number;
}

export function scatterDecorations(avoid: { x: number; y: number; r: number }[], areas: { id: string; x: number; y: number }[] = []): Deco[] {
  const { W, H } = WORLD;
  const rand = rng('dev-odyssey-terrain');
  const placed: { x: number; y: number }[] = [];
  const out: Deco[] = [];
  const INFLUENCE = 520;
  const attempts = Math.round((W * H) / 1600);
  for (let i = 0; i < attempts; i++) {
    const x = 80 + rand() * (W - 160);
    const y = 80 + rand() * (H - 160);
    const region = regionAt(x, y);
    if (rand() > DENSITY[region]) continue;
    if (avoid.some((p) => (p.x - x) ** 2 + (p.y - y) ** 2 < p.r * p.r)) continue;
    if (placed.some((d) => (d.x - x) ** 2 + (d.y - y) ** 2 < 44 * 44)) continue;
    placed.push({ x, y });
    const roll = rand();
    const kind = PALETTE[region].find(([, t]) => roll <= t)![0];
    const s = project(x, y);
    let near: string | undefined;
    let best = INFLUENCE * INFLUENCE;
    for (const a of areas) {
      const d = (a.x - x) ** 2 + (a.y - y) ** 2;
      if (d < best) {
        best = d;
        near = a.id;
      }
    }
    out.push({ kind, x: s.x, y: s.y, s: 0.85 + rand() * 0.4, near, roll: rand() });
  }
  return out.sort((a, b) => a.y - b.y);
}

/* ================================================================== */
/* Hero                                                                */
/* ================================================================== */

export function Hero({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`} className="hero" aria-label="You are here">
      <ellipse cx="0" cy="2" rx="18" ry="7" fill="rgba(0,0,0,0.25)" />
      <g className="hero-bob">
        <path d="M-10,-30 Q-20,-8 -14,-2 L10,-2 Q8,-20 6,-30 Z" fill="#c8332f" />
        <rect x="-8" y="-12" width="6" height="12" rx="2" fill="#3a2f4a" />
        <rect x="2" y="-12" width="6" height="12" rx="2" fill="#2a2238" />
        <rect x="-10" y="-34" width="20" height="20" rx="4" fill="#2f5fc4" />
        <path d="M0,-34 h10 v20 h-10z" fill="#244a9c" />
        <rect x="-10" y="-20" width="20" height="4" fill="#e8b33d" />
        <circle cx="0" cy="-44" r="11" fill="#ffd2a6" />
        <path d="M-11,-46 Q-10,-58 0,-58 Q12,-58 11,-44 Q6,-52 -2,-50 Q-8,-50 -11,-46Z" fill="#7a3e1d" />
        <circle cx="-4" cy="-43" r="1.6" fill="#1c1c2e" />
        <circle cx="4" cy="-43" r="1.6" fill="#1c1c2e" />
        <line x1="13" y1="-18" x2="22" y2="-46" stroke="#e6eef8" strokeWidth="3" strokeLinecap="round" />
        <line x1="10" y1="-20" x2="17" y2="-17" stroke="#e8b33d" strokeWidth="3" strokeLinecap="round" />
      </g>
    </g>
  );
}
