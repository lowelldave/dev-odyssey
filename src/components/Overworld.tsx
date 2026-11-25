import type { ReactNode } from 'react';
import type { Island, Region } from '../types';
import { DUNGEON_HEIGHT, DungeonBody, TOWN_HEIGHT, TownBody } from './art';

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
export const EDGE = 'rgba(40,28,20,0.55)';

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
const STONE: Faces = { top: '#f7f4fc', left: '#e9e4f3', right: '#bfb7d4' };
const PLASTER: Faces = { top: '#fff7e6', left: '#fbefd5', right: '#dcc69d' };
const WOOD: Faces = { top: '#c98f58', left: '#b07a43', right: '#7f5129' };

type Pt = [number, number];
export const D = ({ children }: { children: ReactNode }) => <g className="d">{children}</g>;
const f = (n: number) => n.toFixed(1);
const M = (p: Pt) => `M${f(p[0])},${f(p[1])}`;
const Ln = (p: Pt) => `L${f(p[0])},${f(p[1])}`;
const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const up = (p: Pt, k: number): Pt => [p[0], p[1] - k];
const T = -14;

/** Soft two-layer contact shadow. */
export function Shadow({ cx, cy, rx, ry }: { cx: number; cy: number; rx: number; ry: number }) {
  return (
    <g>
      <ellipse cx={cx + 3} cy={cy + 2} rx={rx} ry={ry} fill="rgba(0,0,0,0.13)" />
      <D><ellipse cx={cx + 1} cy={cy + 1} rx={rx * 0.62} ry={ry * 0.62} fill="rgba(0,0,0,0.16)" /></D>
    </g>
  );
}

/** IsoBox plus stone courses / brick joints / half-timber, contact AO and a rim light. */
export function BoxD({ cx, cy, a, h, c, b = a / 2, rows = 0, brick = false, timber = false, ao = true }: { cx: number; cy: number; a: number; h: number; c: Faces; b?: number; rows?: number; brick?: boolean; timber?: boolean; ao?: boolean }) {
  const W: Pt = [cx - a, cy], S: Pt = [cx, cy + b], E: Pt = [cx + a, cy], N: Pt = [cx, cy - b];
  let lines = '';
  for (let i = 1; i < rows; i++) {
    const k = (h * i) / rows;
    lines += M(up(W, k)) + Ln(up(S, k)) + Ln(up(E, k));
  }
  if (brick && rows)
    for (let i = 0; i < rows; i++) {
      const k0 = (h * i) / rows, k1 = (h * (i + 1)) / rows;
      for (const u of i % 2 ? [0.25, 0.75] : [0.5]) {
        const pl = lerp(W, S, u), pr = lerp(S, E, u);
        lines += M(up(pl, k0)) + Ln(up(pl, k1)) + M(up(pr, k0)) + Ln(up(pr, k1));
      }
    }
  let wood = '';
  if (timber) {
    for (const u of [0.04, 0.5, 0.96]) wood += M(lerp(W, S, u)) + Ln(up(lerp(W, S, u), h)) + M(lerp(S, E, u)) + Ln(up(lerp(S, E, u), h));
    wood += M(up(W, h * 0.5)) + Ln(up(S, h * 0.5)) + Ln(up(E, h * 0.5));
  }
  const q = (p: Pt, r: Pt, k: number) => `${M(p)}${Ln(r)}${Ln(up(r, k))}${Ln(up(p, k))}Z`;
  return (
    <g>
      <IsoBox cx={cx} cy={cy} a={a} h={h} c={c} b={b} />
      <D>
        {lines && <path d={lines} stroke="rgba(40,28,20,0.16)" strokeWidth="0.8" fill="none" />}
        {wood && <path d={wood} stroke="#7a4a24" strokeWidth="1.5" fill="none" opacity="0.75" />}
        {ao && <path d={q(W, S, 3) + q(S, E, 3)} fill="rgba(0,0,0,0.16)" />}
        <path d={`${M(W)}${Ln(up(W, h))}${Ln(up(N, h))}`} stroke="rgba(255,255,255,0.5)" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      </D>
    </g>
  );
}

/** Pyramid roof with tile courses, ridge highlight and eave shadow line. */
export function RoofD({ cx, cy, a, h, ph, color, b = a / 2, tiles = 3 }: { cx: number; cy: number; a: number; h: number; ph: number; color: string; b?: number; tiles?: number }) {
  const top = cy - h;
  const apex: Pt = [cx, top - ph], W: Pt = [cx - a, top], S: Pt = [cx, top + b], E: Pt = [cx + a, top];
  let courses = '';
  for (let i = 1; i <= tiles; i++) {
    const t = i / (tiles + 1);
    courses += M(lerp(W, apex, t)) + Ln(lerp(S, apex, t)) + Ln(lerp(E, apex, t));
  }
  return (
    <g>
      <IsoPyramid cx={cx} cy={cy} a={a} h={h} ph={ph} color={color} b={b} />
      <D>
        <path d={courses} stroke="rgba(40,20,10,0.24)" strokeWidth="0.8" fill="none" />
        <path d={`${M(W)}${Ln(apex)}`} stroke="rgba(255,255,255,0.4)" strokeWidth="1.1" fill="none" />
        <path d={`${M(S)}${Ln(apex)}`} stroke={shade(color, 0.4)} strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <path d={`${M(W)}${Ln(S)}${Ln(E)}`} stroke="rgba(30,20,15,0.4)" strokeWidth="1.6" fill="none" transform="translate(0,1)" />
      </D>
    </g>
  );
}

/** Window with frame, mullion and sill. side: R = right face, L = left face. */
export function WinD({ side, x, y, w = 6, h = 9, glass = '#ffd36b' }: { side: 'L' | 'R'; x: number; y: number; w?: number; h?: number; glass?: string }) {
  const s = side === 'R' ? -w / 2 : w / 2;
  const A: Pt = [x, y], B: Pt = [x + w, y + s], C: Pt = [x + w, y + s - h], Dd: Pt = [x, y - h];
  const pts = [A, B, C, Dd].map((p) => `${f(p[0])},${f(p[1])}`).join(' ');
  const mullion = M(lerp(A, B, 0.5)) + Ln(lerp(Dd, C, 0.5)) + M(lerp(A, Dd, 0.5)) + Ln(lerp(B, C, 0.5));
  return (
    <g>
      <polygon points={pts} fill={glass} stroke="#5a3a1e" strokeWidth="1.2" strokeLinejoin="round" className="win" />
      <D>
        <polygon points={[Dd, lerp(Dd, C, 0.5), lerp(A, B, 0.5), lerp(A, Dd, 0.5)].map((p) => `${f(p[0])},${f(p[1])}`).join(' ')} fill="rgba(255,255,255,0.35)" />
        <path d={mullion} stroke="#5a3a1e" strokeWidth="0.9" />
        <polygon points={`${f(x - 1.2)},${f(y + 0.4)} ${f(x + w + 1.2)},${f(y + s + 0.4)} ${f(x + w + 1.2)},${f(y + s + 2.2)} ${f(x - 1.2)},${f(y + 2.2)}`} fill="#ece4d2" stroke={EDGE} strokeWidth="0.6" />
      </D>
    </g>
  );
}

/** Arched plank door on a wall face (flat drawing skewed onto the face). */
export function DoorD({ side, x, y, w = 10, h = 16, grid = false }: { side: 'L' | 'R'; x: number; y: number; w?: number; h?: number; grid?: boolean }) {
  const m = side === 'L' ? '1 .5 0 1' : '1 -.5 0 1';
  const arch = `M0,0 V${-h + w / 2} Q${w / 2},${-h - w / 4} ${w},${-h + w / 2} V0Z`;
  let bars = '';
  if (grid) {
    for (let i = 1; i < 4; i++) bars += `M${(w * i) / 4},0 V${-h + w / 3}`;
    for (let k = 3; k < h - 2; k += 5) bars += `M0,${-k} H${w}`;
  }
  return (
    <g transform={`translate(${x},${y}) matrix(${m} 0 0)`}>
      <path d={arch} fill="#4a2f1f" stroke="#2b1a10" strokeWidth="1.1" />
      <D>
        <path d={bars || `M${w / 2},0 V${-h - 1 + w / 2 + 1}`} stroke={grid ? '#9aa3ad' : '#2b1a10'} strokeWidth={grid ? 1.1 : 0.8} fill="none" />
        {!grid && <circle cx={w * 0.78} cy={-h * 0.42} r="1" fill="#ffd34d" />}
        <path d={`M-1.5,0 h${w + 3} v2.6 h${-(w + 3)}Z`} fill="#d8cfbd" stroke={EDGE} strokeWidth="0.6" />
        <path d={`M-1,${-h + w / 2 + 0.5} Q${w / 2},${-h - w / 4 - 1.5} ${w + 1},${-h + w / 2 + 0.5}`} stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" fill="none" />
      </D>
    </g>
  );
}

function Chimney({ x, y, smoke = true }: { x: number; y: number; smoke?: boolean }) {
  return (
    <g>
      <BoxD cx={x} cy={y} a={4} h={13} c={{ top: '#8a6a5a', left: '#a98877', right: '#6a4e41' }} rows={4} brick />
      <IsoBox cx={x} cy={y - 13} a={5} h={2} c={{ top: '#b9a79a', left: '#a79588', right: '#7a685c' }} />
      {smoke && <circle cx={x + 1} cy={y - 22} r="3.4" fill="#e6e2dc" opacity="0.7" className="smoke" />}
    </g>
  );
}

function Torch({ x, y, c = '#ffb04a' }: { x: number; y: number; c?: string }) {
  return (
    <g>
      <rect x={x - 1} y={y - 9} width="2" height="9" fill="#5a3a22" stroke={EDGE} strokeWidth="0.5" />
      <circle cx={x} cy={y - 12} r="5.5" fill={c} opacity="0.3" className="flicker" />
      <path d={`M${x - 2.4},${y - 9} Q${x},${y - 17} ${x + 2.4},${y - 9}Z`} fill={c} className="flicker" />
    </g>
  );
}

function Barrel({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <ellipse cx={x + 1} cy={y + 1} rx="6" ry="2.4" fill="rgba(0,0,0,0.2)" />
      <path d={`M${x - 4.5},${y} Q${x - 6},${y - 6} ${x - 4.5},${y - 11} H${x + 4.5} Q${x + 6},${y - 6} ${x + 4.5},${y}Z`} fill="#a8693a" stroke={EDGE} strokeWidth="0.7" />
      <path d={`M${x + 0.5},${y - 11} H${x + 4.5} Q${x + 6},${y - 6} ${x + 4.5},${y} H${x + 0.5}Z`} fill="#7f5129" />
      <path d={`M${x - 5.2},${y - 7.5} H${x + 5.2} M${x - 5.2},${y - 3.2} H${x + 5.2}`} stroke="#4a3a2a" strokeWidth="1" />
      <ellipse cx={x} cy={y - 11} rx="4.5" ry="1.8" fill="#c98f58" stroke={EDGE} strokeWidth="0.6" />
    </g>
  );
}

export function TreeV2({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <ellipse cx="4" cy="2" rx="16" ry="7" fill="rgba(0,0,0,0.16)" />
      <path d="M-4,3 Q-3,-6 -2.8,-14 H2.8 Q3,-6 4.5,3Z" fill="#7a4f2c" />
      <D>
        <path d="M-18.5,-23 a10.5,10.5 0 1 0 21,0 a10.5,10.5 0 1 0 -21,0Z" fill="#4a9441" />
        <path d="M-1.5,-24 a10.5,10.5 0 1 0 21,0 a10.5,10.5 0 1 0 -21,0Z" fill="#3f8a3a" />
      </D>
      <circle cx="0" cy="-27" r="16" fill="#58a64b" />
      <path d="M0,-43 A16,16 0 0 1 0,-11 A12,16 0 0 0 0,-43Z" fill="#3f8a3a" />
      <circle cx="-6" cy="-32" r="6" fill="#7dc76a" />
      <D>
        <path d="M0.4,-14 H2.8 Q3,-6 4.5,3 H1Z" fill="#5d3b1f" />
        <path d="M5,-34 h.1 M9,-26 h.1 M-2,-20 h.1 M12,-30 h.1" stroke="#2f6e2f" strokeWidth="2.6" strokeLinecap="round" />
      </D>
    </g>
  );
}

export function PineV2({ x, y, s = 1, snow = false }: { x: number; y: number; s?: number; snow?: boolean }) {
  const cones: [number, number, number][] = [[17, -34, -6], [13, -50, -22], [9, -62, -38]];
  const cone = ([w, top, base]: [number, number, number], k: number) => (
    <g key={k}>
      <polygon points={`${-w},${base} 0,${top} 0,${base + w * 0.25}`} fill="#3f8f4c" />
      <polygon points={`0,${base + w * 0.25} 0,${top} ${w},${base}`} fill="#2b6b38" />
    </g>
  );
  const hi = cones.map(([w, top, base]) => `M${-w},${base} L0,${top}`).join('');
  const hem = cones.map(([w, , base]) => `M${-w * 0.7},${base - 1} q${w * 0.18},3 ${w * 0.35},0 q${w * 0.18},3 ${w * 0.35},0 q${w * 0.18},3 ${w * 0.35},0 q${w * 0.18},3 ${w * 0.35},0`).join('');
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <ellipse cx="4" cy="2" rx="14" ry="6" fill="rgba(0,0,0,0.16)" />
      <path d="M-3.4,3 Q-2.6,-3 -2.5,-8 H2.5 Q2.6,-3 3.6,3Z" fill="#6b4a2b" />
      {cones.map(cone)}
      {snow && <polygon points="-5,-54 0,-62 5,-54 0,-52" fill="#fff" />}
      <D>
        <ellipse cx="3" cy="2" rx="7" ry="3" fill="rgba(0,0,0,0.16)" />
        <path d={hi} stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
        <path d={hem} stroke="rgba(0,0,0,0.22)" strokeWidth="1" fill="none" />
        {snow && <path d="M-11,-23 L-4,-34 L0,-30 L5,-35 L12,-23 L6,-25 L0,-22 L-6,-25Z M-14,-7 L-5,-17 L0,-12 L6,-18 L15,-7 L8,-9 L0,-5 L-8,-9Z" fill="#fff" opacity="0.9" />}
      </D>
    </g>
  );
}

function BushV2({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <ellipse cx="2" cy="1" rx="14" ry="4" fill="rgba(0,0,0,0.15)" />
      <ellipse cx="0" cy="-5" rx="13" ry="8" fill="#55a24b" />
      <path d="M0,-13 A13,8 0 0 1 13,-5 A13,8 0 0 1 0,3Z" fill="#3e8538" />
      <D>
        <ellipse cx="-4" cy="-8" rx="5" ry="2.6" fill="#7dc76a" />
        <path d="M-7,-3 h.1 M3,-9 h.1 M7,-2 h.1" stroke="#e8505b" strokeWidth="2.4" strokeLinecap="round" />
      </D>
    </g>
  );
}

/* ================================================================== */
/* Landmarks                                                           */
/* ================================================================== */

export type Landmark = 'village' | 'castle' | 'tower' | 'cave' | 'shrine' | 'camp' | 'peak' | 'forge' | 'town' | 'dungeon';

const KIND: Record<string, Landmark> = {
  web: 'town', 'html-css': 'village', mern: 'town', mobile: 'village', php: 'village', vue: 'village',
  typescript: 'castle', angular: 'castle', csharp: 'castle', cloud: 'castle', security: 'dungeon',
  architecture: 'tower', llm: 'tower', agents: 'tower', 'ai-production': 'tower', jamstack: 'tower',
  databases: 'dungeon', go: 'cave', realtime: 'dungeon', ruby: 'cave', rag: 'cave',
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
  town: TOWN_HEIGHT,
  dungeon: DUNGEON_HEIGHT,
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

/* ================================================================== */
/* Landmarks                                                           */
/* ================================================================== */
const STN: Faces = STONE;

export function LandmarkBody({ kind, c }: { kind: Landmark; c: string }) {
  let body: ReactNode;
  switch (kind) {
    case 'village':
      body = (
        <>
          <TreeV2 x={-44} y={T - 10} s={0.9} />
          <Shadow cx={-22} cy={T - 2} rx={27} ry={9} />
          <BoxD cx={-22} cy={T - 4} a={18} h={20} c={PLASTER} timber />
          <RoofD cx={-22} cy={T - 4} a={21} h={20} ph={18} color={c} />
          <Chimney x={-13} y={T - 29} />
          <WinD side="R" x={-16} y={T - 4} />
          <D>
            <path d={`M-38,${T + 1} q3,-6 2,-12 M-35,${T + 3} q5,-4 4,-9 M-32,${T + 3.5} q2,-2 4,-3`} stroke="#4f9a45" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <ellipse cx="-30" cy={T + 4} rx="4" ry="1.6" fill="#5aa04a" />
          </D>
          <Shadow cx={18} cy={T + 14} rx={31} ry={11} />
          <BoxD cx={18} cy={T + 12} a={22} h={24} c={PLASTER} timber />
          <RoofD cx={18} cy={T + 12} a={26} h={24} ph={22} color={c} tiles={4} />
          <WinD side="R" x={26} y={T + 12} />
          <WinD side="L" x={1} y={T + 7} w={5} h={11} />
          <DoorD side="L" x={10} y={T + 19} w={9} h={15} />
          <D>
            <polygon points={`0,${T + 9} 6,${T + 12} 6,${T + 14} 0,${T + 11}`} fill="#8a5a30" stroke={EDGE} strokeWidth="0.5" />
            <path d={`M1,${T + 9.5} h.1 M3,${T + 10.6} h.1 M5,${T + 11.6} h.1`} stroke="#ff7ea8" strokeWidth="2" strokeLinecap="round" />
          </D>
          <Barrel x={44} y={T + 22} />
          <D>
            <rect x="-2.6" y={T + 24} width="1.8" height="12" fill="#5a3a22" />
            <circle cx="-1.7" cy={T + 22} r="2.2" fill="#ffd36b" className="glow" />
            <circle cx="-1.7" cy={T + 22} r="6" fill="#ffd36b" opacity="0.18" />
          </D>
          <TreeV2 x={46} y={T - 4} s={0.75} />
        </>
      );
      break;
    case 'castle':
      body = (
        <>
          <Shadow cx={0} cy={T + 12} rx={62} ry={18} />
          <BoxD cx={0} cy={T} a={44} h={44} c={STN} rows={6} brick />
          <D>
            <path d={`${[0.08, 0.28, 0.48, 0.68, 0.88].map((u) => { const p: Pt = lerp([-44, T - 44], [0, T - 44 + 22], u); return `M${f(p[0])},${f(p[1])} v-5 h6 v5Z`; }).join('')}`} fill={STN.left} stroke={EDGE} strokeWidth="0.7" />
            <path d={`${[0.08, 0.28, 0.48, 0.68, 0.88].map((u) => { const p: Pt = lerp([0, T - 44 + 22], [44, T - 44], u); return `M${f(p[0])},${f(p[1])} v-5 h6 v5Z`; }).join('')}`} fill={STN.right} stroke={EDGE} strokeWidth="0.7" />
          </D>
          <BoxD cx={-44} cy={T} a={12} h={82} c={STN} rows={9} brick />
          <RoofD cx={-44} cy={T} a={15} h={82} ph={30} color={c} tiles={4} />
          <BoxD cx={44} cy={T} a={12} h={82} c={STN} rows={9} brick />
          <RoofD cx={44} cy={T} a={15} h={82} ph={30} color={c} tiles={4} />
          <BoxD cx={0} cy={T - 10} a={15} h={78} c={STN} rows={8} brick />
          <RoofD cx={0} cy={T - 10} a={18} h={78} ph={34} color={c} tiles={4} />
          <line x1="0" y1={T - 122} x2="0" y2={T - 140} stroke="#4a3528" strokeWidth="2" />
          <polygon points={`0,${T - 140} 16,${T - 134} 0,${T - 128}`} fill="#ffcf3d" stroke={EDGE} strokeWidth="0.6" className="flag" />
          <D>
            <polygon points={`-52,${T - 60} -44,${T - 56} -44,${T - 38} -48,${T - 42} -52,${T - 38}`} fill="#c8453a" stroke={EDGE} strokeWidth="0.6" />
            <circle cx="-48" cy={T - 52} r="1.6" fill="#ffd34d" />
          </D>
          <DoorD side="L" x={-20} y={T + 12} w={16} h={26} grid />
          <Torch x={-26} y={T + 12} />
          <Torch x={-1} y={T + 24} />
          <WinD side="L" x={-50} y={T - 52} />
          <WinD side="R" x={46} y={T - 52} />
          <WinD side="R" x={4} y={T - 52} w={6} h={11} />
          <D>
            <polygon points={`-30,${T - 14} -27,${T - 12.5} -27,${T - 26} -30,${T - 27.5}`} fill="#241a16" />
            <polygon points={`16,${T - 6} 19,${T - 7.5} 19,${T - 21} 16,${T - 19.5}`} fill="#241a16" />
            <path d={`M-24,${T + 34} q2,-5 7,-4 M30,${T + 20} q3,-4 7,-3`} stroke="#4f9a45" strokeWidth="2" fill="none" strokeLinecap="round" />
          </D>
        </>
      );
      break;
    case 'tower':
      body = (
        <>
          <Shadow cx={2} cy={T + 12} rx={36} ry={12} />
          <BoxD cx={0} cy={T} a={30} h={12} c={STN} rows={2} brick />
          <BoxD cx={0} cy={T - 4} a={17} h={104} c={{ top: '#f3effa', left: '#e4def0', right: '#b7aecd' }} rows={13} brick />
          <BoxD cx={0} cy={T - 4 - 56} a={19} h={4} c={STN} ao={false} />
          <BoxD cx={0} cy={T - 4 - 100} a={21} h={4} c={STN} ao={false} />
          <RoofD cx={0} cy={T - 4} a={21} h={104} ph={40} color={c} tiles={4} />
          <circle cx="0" cy={T - 154} r="7" fill="#ffe27a" className="glow" />
          <circle cx="0" cy={T - 154} r="14" fill="#ffe27a" opacity="0.25" className="glow" />
          <D>
            <path d={Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return `M${f(Math.cos(a) * 17)},${f(T - 154 + Math.sin(a) * 17)} L${f(Math.cos(a) * 22)},${f(T - 154 + Math.sin(a) * 22)}`; }).join('')} stroke="#ffe27a" strokeWidth="1.4" className="glow" strokeLinecap="round" />
            <path d={`M-8,${T + 34} q2,-6 6,-4 M12,${T + 32} q4,-3 7,-1`} stroke="#4f9a45" strokeWidth="2" fill="none" strokeLinecap="round" />
          </D>
          <WinD side="L" x={-12} y={T - 40} w={6} h={12} />
          <WinD side="R" x={4} y={T - 72} w={6} h={12} />
          <WinD side="L" x={-12} y={T - 88} w={6} h={10} />
          <DoorD side="L" x={-13} y={T + 3} w={11} h={17} />
          <BushV2 x={-26} y={T + 18} s={0.8} />
          <BushV2 x={26} y={T + 14} s={0.7} />
        </>
      );
      break;
    case 'cave':
      body = (
        <>
          <Shadow cx={0} cy={T + 22} rx={66} ry={14} />
          <polygon points={`-62,${T + 6} -48,${T - 34} -18,${T - 62} 2,${T - 30} 0,${T + 30}`} fill="#a79f93" stroke={EDGE} strokeWidth="1" />
          <polygon points={`0,${T + 30} 2,${T - 30} -18,${T - 62} 24,${T - 58} 50,${T - 30} 64,${T + 6}`} fill="#7c7468" stroke={EDGE} strokeWidth="1" />
          <polygon points={`-18,${T - 62} 24,${T - 58} 8,${T - 74}`} fill="#c2bbae" stroke={EDGE} strokeWidth="1" />
          <D>
            <path d={`M-58,${T - 4} L-30,${T - 14} L0,${T - 6} M-52,${T - 22} L-26,${T - 30} L1,${T - 20} M-40,${T - 44} L-18,${T - 48} L2,${T - 40}`} stroke="rgba(40,28,20,0.22)" strokeWidth="1" fill="none" />
            <path d={`M4,${T - 2} L34,${T - 12} L62,${T + 2} M6,${T - 22} L30,${T - 32} L48,${T - 28}`} stroke="rgba(30,20,15,0.25)" strokeWidth="1" fill="none" />
            <path d={`M-18,${T - 62} L-48,${T - 34} M-18,${T - 62} L24,${T - 58}`} stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" fill="none" />
            <ellipse cx="-12" cy={T - 62} rx="9" ry="3" fill="#6fae58" />
            <ellipse cx="16" cy={T - 59} rx="6" ry="2.4" fill="#5c9a4a" />
          </D>
          <path d={`M-40,${T + 14} L-40,${T - 6} Q-26,${T - 34} -10,${T - 4} L-10,${T + 24} Z`} fill="#1c1714" />
          <D>
            <path d={`M-35,${T + 15} L-35,${T - 3} Q-26,${T - 24} -15,${T - 2} L-15,${T + 20}Z`} fill="#0e0a08" />
            <polygon points={`-44,${T + 16} -44,${T - 8} -40,${T - 8} -40,${T + 14}`} fill="#7a5230" stroke={EDGE} strokeWidth="0.6" />
            <polygon points={`-10,${T + 24} -10,${T - 4} -6,${T - 6} -6,${T + 24}`} fill="#5d3b1f" stroke={EDGE} strokeWidth="0.6" />
            <path d={`M-46,${T - 10} Q-26,${T - 40} -6,${T - 8}`} stroke="#7a5230" strokeWidth="3" fill="none" />
          </D>
          <rect x="-48" y={T - 22} width="4" height="24" fill="#6b4a2b" />
          <circle cx="-46" cy={T - 26} r="5" fill={c} className="flicker" />
          <circle cx="-46" cy={T - 26} r="10" fill={c} opacity="0.3" className="flicker" />
          <polygon points={`30,${T - 4} 36,${T - 20} 42,${T - 6}`} fill="#8ce0ff" className="glow" />
          <D>
            <polygon points={`40,${T - 4} 45,${T - 14} 50,${T - 3}`} fill="#5fc2ea" className="glow" />
            <polygon points={`33,${T - 6} 36,${T - 20} 38,${T - 8}`} fill="rgba(255,255,255,0.55)" />
            <polygon points={`-60,${T + 22} -54,${T + 14} -46,${T + 20} -48,${T + 27} -58,${T + 27}`} fill="#9a9285" stroke={EDGE} strokeWidth="0.7" />
            <polygon points={`22,${T + 30} 28,${T + 22} 38,${T + 26} 36,${T + 32}`} fill="#8a8275" stroke={EDGE} strokeWidth="0.7" />
          </D>
        </>
      );
      break;
    case 'shrine':
      body = (
        <>
          <Shadow cx={0} cy={T + 14} rx={54} ry={16} />
          <BoxD cx={0} cy={T + 2} a={48} h={5} c={STN} />
          <BoxD cx={0} cy={T} a={44} h={7} c={STN} rows={2} />
          <BoxD cx={0} cy={T - 7} a={36} h={7} c={STN} rows={2} />
          <D>
            <path d={`M0,${T - 14 - 8} l8,4 l-8,4 l-8,-4Z M-9,${T - 14 - 3} h4 M5,${T - 14 - 3} h4`} stroke="#8ce0ff" strokeWidth="1" fill="rgba(140,224,255,0.25)" className="glow" />
          </D>
          {[
            [-26, -2],
            [0, -15],
            [0, 11],
            [26, -2],
          ].map(([x, y]) => (
            <g key={`${x}${y}`}>
              <IsoBox cx={x} cy={T - 14 + y} a={4} h={40} c={{ top: '#fff', left: '#f1ece2', right: '#cfc7b6' }} />
              <D>
                <path d={`M${x - 1.5},${T - 14 + y + 1.4} v-39 M${x + 1.6},${T - 14 + y + 1.4} v-39`} stroke="rgba(120,100,70,0.3)" strokeWidth="0.7" />
                <IsoBox cx={x} cy={T - 14 + y} a={5.6} h={3} c={{ top: '#fff', left: '#e6dfd0', right: '#bdb3a0' }} />
                <IsoBox cx={x} cy={T - 14 + y - 38} a={5.6} h={3} c={{ top: '#fff', left: '#e6dfd0', right: '#bdb3a0' }} />
              </D>
            </g>
          ))}
          <BoxD cx={0} cy={T - 54} a={36} h={6} c={STN} ao={false} />
          <RoofD cx={0} cy={T - 54} a={40} h={6} ph={22} color={c} tiles={2} />
          <circle cx="0" cy={T - 34} r="9" fill={shade(c, 0.35)} className="glow" />
          <circle cx="0" cy={T - 34} r="17" fill={shade(c, 0.35)} opacity="0.25" className="glow" />
          <D>
            <ellipse cx="0" cy={T - 34} rx="15" ry="5" fill="none" stroke={shade(c, 0.5)} strokeWidth="1.2" />
            <path d={`M0,${T - 47} l1.6,3.4 l-1.6,3.4 l-1.6,-3.4Z`} fill="#fff" className="tw" />
            <circle cx="-14" cy={T - 30} r="1.4" fill="#fff" className="glow" />
            <circle cx="14" cy={T - 38} r="1.4" fill="#fff" className="glow" />
            <rect x="-47" y={T + 4} width="3" height="7" fill="#5a3a22" /><circle cx="-45.5" cy={T + 2} r="3" fill="#ffd36b" className="glow" />
            <rect x="44" y={T + 4} width="3" height="7" fill="#5a3a22" /><circle cx="45.5" cy={T + 2} r="3" fill="#ffd36b" className="glow" />
            <path d={`M-38,${T + 16} q3,-6 2,-9 M36,${T + 14} q3,-5 2,-8`} stroke="#4f9a45" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          </D>
        </>
      );
      break;
    case 'camp':
      body = (
        <>
          <PineV2 x={-44} y={T - 8} s={1} />
          <PineV2 x={40} y={T - 14} s={0.85} />
          <Shadow cx={0} cy={T + 14} rx={36} ry={10} />
          <polygon points={`-30,${T + 6} 0,${T + 20} 2,${T - 48}`} fill={shade(c, 0.1)} stroke={EDGE} strokeWidth="1" strokeLinejoin="round" />
          <polygon points={`0,${T + 20} 30,${T + 4} 2,${T - 48}`} fill={shade(c, -0.3)} stroke={EDGE} strokeWidth="1" strokeLinejoin="round" />
          <polygon points={`-8,${T + 16} 0,${T + 20} 1,${T - 6}`} fill="#3a281c" />
          <D>
            <polygon points={`-9,${T + 15} -3,${T + 18} 1,${T - 14} -2,${T - 2}`} fill={shade(c, 0.2)} stroke={EDGE} strokeWidth="0.6" />
            <path d={`M-22,${T + 1} L2,${T - 40} M-12,${T + 5} L2,${T - 26} M16,${T + 9} L2,${T - 32}`} stroke="rgba(40,28,20,0.3)" strokeWidth="0.9" strokeDasharray="2 1.6" fill="none" />
            <path d={`M2,${T - 48} L-30,${T + 6}`} stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
            <path d={`M-30,${T + 6} L-44,${T + 14} M30,${T + 4} L46,${T + 10}`} stroke="#6b4a2b" strokeWidth="0.9" />
            <path d={`M-44,${T + 14} v3 M46,${T + 10} v3`} stroke="#4a3528" strokeWidth="2" strokeLinecap="round" />
            <polygon points={`2,${T - 60} 12,${T - 57} 2,${T - 54}`} fill="#ffd34d" stroke={EDGE} strokeWidth="0.5" />
            <rect x="-26" y={T + 22} width="14" height="4.5" rx="2" fill="#8a5a30" stroke={EDGE} strokeWidth="0.6" />
            <rect x="-22" y={T + 14} width="10" height="9" rx="2" fill="#b0603a" stroke={EDGE} strokeWidth="0.6" /><path d={`M-20,${T + 14} v9 M-14,${T + 14} v9`} stroke="#5a2a14" strokeWidth="1" />
          </D>
          <g transform={`translate(30,${T + 18})`}>
            <ellipse cx="0" cy="2" rx="10" ry="5" fill="#5a4030" />
            <D>
              <path d="M-9,1 h.1 M-6,4 h.1 M0,5.4 h.1 M6,4 h.1 M9,1 h.1 M-6,-1.6 h.1 M6,-1.6 h.1" stroke="#8a8478" strokeWidth="3" strokeLinecap="round" />
              <circle cx="0" cy="-6" r="14" fill="#ffb04a" opacity="0.2" className="flicker" />
              <path d="M-7,5 L7,0 M7,5 L-7,0" stroke="#4a3020" strokeWidth="2.4" strokeLinecap="round" />
            </D>
            <path d="M-6,0 Q0,-18 6,0Z" fill="#ff9b3d" className="flicker" />
            <path d="M-3,0 Q0,-10 3,0Z" fill="#ffe27a" className="flicker" />
          </g>
        </>
      );
      break;
    case 'peak':
      body = (
        <>
          <ellipse cx="2" cy={T + 26} rx="70" ry="13" fill="rgba(0,0,0,0.15)" />
          <polygon points={`-70,${T + 8} -36,${T - 58} -6,${T + 22}`} fill="#a19bb3" stroke={EDGE} strokeWidth="1" strokeLinejoin="round" />
          <polygon points={`-6,${T + 22} -36,${T - 58} 4,${T + 4}`} fill="#7b7590" stroke={EDGE} strokeWidth="1" strokeLinejoin="round" />
          <polygon points={`-46,${T + 14} 8,${T - 110} 8,${T + 34}`} fill="#b3adc4" stroke={EDGE} strokeWidth="1" strokeLinejoin="round" />
          <polygon points={`8,${T + 34} 8,${T - 110} 66,${T + 8}`} fill="#837d98" stroke={EDGE} strokeWidth="1" strokeLinejoin="round" />
          <polygon points={`-10,${T - 72} 8,${T - 110} 8,${T - 66} 0,${T - 74}`} fill="#ffffff" />
          <polygon points={`8,${T - 110} 30,${T - 70} 20,${T - 74} 8,${T - 66}`} fill="#dfe4f2" />
          <D>
            <polygon points={`-14,${T - 66} -10,${T - 72} -4,${T - 70} -2,${T - 62} 0,${T - 70} 4,${T - 66} 8,${T - 62} 8,${T - 66} 0,${T - 74}`} fill="#fff" />
            <polygon points={`8,${T - 66} 12,${T - 62} 16,${T - 70} 20,${T - 74}`} fill="#dfe4f2" />
            <path d={`M8,${T - 110} L-46,${T + 14} M-36,${T - 58} L-70,${T + 8}`} stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" fill="none" />
            <path d={`M-30,${T - 30} L-10,${T - 10} M-20,${T - 50} L-4,${T - 36} M20,${T - 40} L40,${T - 14} M14,${T - 20} L30,${T + 6}`} stroke="rgba(30,20,40,0.22)" strokeWidth="1" fill="none" />
            <polygon points={`16,${T - 30} 24,${T - 26} 20,${T - 18}`} fill="rgba(30,20,40,0.2)" />
            <path d={`M-4,${T + 26} L-16,${T + 14} L-4,${T + 4} L-14,${T - 8}`} stroke="#d9c9a0" strokeWidth="1.6" strokeDasharray="3 2.4" fill="none" />
            <polygon points={`-60,${T + 22} -54,${T + 14} -46,${T + 20} -48,${T + 27} -58,${T + 27}`} fill="#a79f93" stroke={EDGE} strokeWidth="0.7" />
            <polygon points={`44,${T + 22} 50,${T + 15} 58,${T + 19} 56,${T + 26}`} fill="#7c7468" stroke={EDGE} strokeWidth="0.7" />
            <ellipse cx="16" cy={T - 102} rx="4" ry="1.8" fill="#c9c1b3" stroke={EDGE} strokeWidth="0.5" />
          </D>
          <PineV2 x={-58} y={T + 20} s={0.5} snow />
          <line x1="8" y1={T - 110} x2="8" y2={T - 134} stroke="#4a3528" strokeWidth="2" />
          <polygon points={`8,${T - 134} 25,${T - 128} 8,${T - 122}`} fill={c} stroke={EDGE} strokeWidth="0.6" className="flag" />
        </>
      );
      break;
    case 'forge':
      body = (
        <>
          <Shadow cx={0} cy={T + 22} rx={46} ry={12} />
          <BoxD cx={24} cy={T - 20} a={7} h={64} c={{ top: '#8f8478', left: '#9d9286', right: '#6f655b' }} rows={9} brick />
          <D>
            <IsoBox cx={24} cy={T - 84} a={8.6} h={3} c={{ top: '#aaa093', left: '#8e8478', right: '#675d53' }} />
            <circle cx="24" cy={T - 88} r="5" fill="#ff8a2a" opacity="0.35" className="flicker" />
          </D>
          <circle cx="26" cy={T - 92} r="8" fill="#e2e2e2" opacity="0.7" className="smoke" />
          <circle cx="34" cy={T - 108} r="10" fill="#e2e2e2" opacity="0.5" className="smoke s2" />
          <BoxD cx={-4} cy={T + 4} a={34} h={30} c={WOOD} rows={5} />
          <RoofD cx={-4} cy={T + 4} a={38} h={30} ph={20} color={c} tiles={4} />
          <polygon points={`-30,${T - 1} -14,${T + 7} -14,${T - 9} -30,${T - 17}`} fill="#ff8a2a" className="flicker" />
          <D>
            <polygon points={`-27,${T - 2} -17,${T + 3} -17,${T - 6} -27,${T - 11}`} fill="#ffd36b" className="flicker" />
            <polygon points={`-31,${T - 0.5} -13,${T + 8.5} -13,${T + 10} -31,${T + 1}`} fill="#5b5b66" stroke={EDGE} strokeWidth="0.6" />
          </D>
          <WinD side="R" x={6} y={T + 2} w={8} h={10} />
          <path d={`M34,${T + 24} l12,-6 l8,4 l-12,6 Z`} fill="#5b5b66" stroke={EDGE} strokeWidth="1" />
          <D>
            <path d={`M36,${T + 23} l10,-5 l5,2.6`} stroke="rgba(255,255,255,0.45)" strokeWidth="1" fill="none" />
            <rect x="38" y={T + 25} width="8" height="5" fill="#44444e" stroke={EDGE} strokeWidth="0.6" />
            <path d={`M30,${T + 27} l-8,-6`} stroke="#7a5230" strokeWidth="2" strokeLinecap="round" />
            <rect x="19" y={T + 17} width="6" height="3.6" rx="1" fill="#6b6b76" stroke={EDGE} strokeWidth="0.5" transform={`rotate(-30 22 ${T + 19})`} />
            <ellipse cx="-34" cy={T + 20} rx="7" ry="2.8" fill="#2a2420" /><path d={`M-38,${T + 19} h.1 M-34,${T + 21} h.1 M-30,${T + 19} h.1`} stroke="#ff7a2a" strokeWidth="2.2" strokeLinecap="round" className="flicker" />
            <path d={`M-20,${T - 22} h.1 M-26,${T - 28} h.1 M-14,${T - 30} h.1`} stroke="#ffb04a" strokeWidth="1.8" strokeLinecap="round" className="flicker" />
          </D>
          <Barrel x={-44} y={T + 16} />
          <D>
            <path d={`M-14,${T - 22} v-5 M-14,${T - 27} h9`} stroke="#4a3528" strokeWidth="1.4" fill="none" />
            <path d={`M-9,${T - 27} a3,3 0 1 1 -6,0`} stroke="#c9d3e2" strokeWidth="1.3" fill="none" />
          </D>
        </>
      );
      break;
    case 'town':
      body = <TownBody c={c} />;
      break;
    case 'dungeon':
      body = <DungeonBody c={c} />;
      break;
  }
  return <g className="landmark">{body}</g>;
}

export function GroundTile({ a = 74, grass = '#8fd06f', level = 0, path = true }: { a?: number; grass?: string; level?: number; path?: boolean }) {
  const r = rng(`tile-${a}-${grass}`);
  const b = a / 2;
  const W: Pt = [-a, 0], S: Pt = [0, b], E: Pt = [a, 0], N: Pt = [0, -b];
  const tuftN = Math.round(a / 8);
  let tufts = '', stones = '', pebbles = '';
  for (let i = 0; i < tuftN * 3 && tufts.split('M').length <= tuftN; i++) {
    const x = (r() - 0.5) * a * 1.7, y = T + (r() - 0.5) * a * 0.85;
    if (Math.abs(x) / a + Math.abs(y - T) / b > 0.82) continue;
    if (Math.abs(x) < a * 0.5 && y > T - 40 && y < T + 22) continue;
    tufts += `M${f(x)},${f(y)} l-1.6,-3.2 M${f(x)},${f(y)} v-3.8 M${f(x)},${f(y)} l1.6,-3.2 `;
  }
  const ptop = (p: Pt): Pt => [p[0], p[1] + T];
  for (const [p0, p1] of [[W, S], [S, E]] as [Pt, Pt][])
    for (let t = 0.1; t < 0.95; t += 0.8 / Math.max(5, Math.round(a / 12))) {
      const p = ptop(lerp(p0, p1, t));
      const w = 2 + ((t * 37) % 1.4);
      stones += `M${f(p[0] - w)},${f(p[1] - 1.2)} l${f(w)},-1.6 l${f(w)},1.6 l${f(-w)},1.6Z `;
    }
  for (let i = 0; i < 3; i++) {
    const t = 0.2 + i * 0.3;
    const p = lerp(W, S, t);
    pebbles += `M${f(p[0])},${f(p[1] - 5)} l3,-1.5 l2.5,1.5 l-2,1.6Z `;
    const p2 = lerp(S, E, t + 0.05);
    pebbles += `M${f(p2[0])},${f(p2[1] - 5)} l3,-1.5 l2.5,1.5 l-2,1.6Z `;
  }
  const cliffL = (k: number) => `M${f(W[0])},${f(T + k)} L${f(S[0])},${f(T + b + k)}`;
  const cliffR = (k: number) => `M${f(S[0])},${f(T + b + k)} L${f(E[0])},${f(T + k)}`;
  return (
    <g>
      <ellipse cx="6" cy="22" rx={a + 10} ry={a / 2 + 4} fill="rgba(0,0,0,0.18)" />
      <D><ellipse cx="3" cy="19" rx={a + 2} ry={a / 2} fill="rgba(0,0,0,0.12)" /></D>
      <IsoBox cx={0} cy={0} a={a} h={14} c={{ top: grass, left: '#a5733f', right: '#7c5229' }} />
      <polygon points={`${f(-a * 0.55)},${f(T - a * 0.05)} 0,${f(T + a * 0.22)} ${f(a * 0.4)},${f(T + a * 0.02)}`} fill="rgba(255,255,255,0.08)" />
      <D>
        <path d={`${cliffL(4.5)} ${cliffL(9)} ${cliffR(4.5)} ${cliffR(9)}`} stroke="rgba(40,24,12,0.28)" strokeWidth="1" fill="none" />
        <path d={`M${f(W[0])},0 L0,${f(b)} L${f(E[0])},0 L${f(E[0])},-3 L0,${f(b - 3)} L${f(W[0])},-3Z`} fill="rgba(0,0,0,0.14)" />
        <path d={pebbles} fill="rgba(0,0,0,0.16)" />
        <path d={`M${f(W[0])},${f(T)} L${f(N[0])},${f(T - b)}`} stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" fill="none" />
        <path d={stones} fill="#cfc7b6" stroke="rgba(40,28,20,0.5)" strokeWidth="0.6" />
        <path d={tufts} stroke={shade(grass, -0.32)} strokeWidth="1" strokeLinecap="round" fill="none" />
        {path && (
          <path
            d={`M-3,${f(T + 6)} Q8,${f(T + b * 0.45)} -4,${f(T + b * 0.78)} L${f(-4 + a * 0.16)},${f(T + b * 0.96)} Q${f(a * 0.2)},${f(T + b * 0.5)} 9,${f(T + 6)}Z`}
            fill={level ? '#8a7a66' : '#dcb982'}
            stroke="rgba(40,28,20,0.35)"
            strokeWidth="0.7"
            opacity="0.95"
          />
        )}
        {level > 0 && (
          <>
            <ellipse cx="0" cy={T + 2} rx={a * 0.34} ry={a * 0.15} fill="rgba(30,15,10,0.2)" />
            <path d={Array.from({ length: 6 + level * 2 }, () => { const x = (r() - 0.5) * a * 1.2, y = T + (r() - 0.5) * a * 0.55; return `M${f(x)},${f(y)} h.1`; }).join('')} stroke="#ff7a2a" strokeWidth="2.2" strokeLinecap="round" className="glow" />
          </>
        )}
      </D>
    </g>
  );
}

/* ================================================================== */
/* Scenery                                                             */
/* ================================================================== */

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

const shadow2 = (x: number, y: number, rx: number, ry: number) => <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="rgba(0,0,0,0.16)" />;

export function Decoration({ kind, x, y, s }: { kind: string; x: number; y: number; s: number }) {
  const g = (children: ReactNode, cls?: string) => (
    <g transform={`translate(${x},${y}) scale(${s})`} className={cls}>
      {children}
    </g>
  );
  switch (kind) {
    case 'pine':
      return <PineV2 x={x} y={y} s={s} />;
    case 'snowpine':
      return <PineV2 x={x} y={y} s={s} snow />;
    case 'tree':
      return <TreeV2 x={x} y={y} s={s} />;
    case 'bush':
      return g(
        <>
          <ellipse cx="2" cy="1" rx="14" ry="4" fill="rgba(0,0,0,0.15)" />
          <ellipse cx="0" cy="-5" rx="13" ry="8" fill="#55a24b" />
          <path d="M0,-13 A13,8 0 0 1 13,-5 A13,8 0 0 1 0,3Z" fill="#3e8538" />
          <D>
            <ellipse cx="-4" cy="-8" rx="5" ry="2.6" fill="#7dc76a" />
            <path d="M-7,-3 h.1 M3,-9 h.1 M7,-2 h.1" stroke="#e8505b" strokeWidth="2.4" strokeLinecap="round" />
          </D>
        </>,
      );
    case 'flowers':
      return g(
        <>
          <circle cx="-6" cy="-2" r="2.6" fill="#ffe36b" />
          <circle cx="1" cy="-4" r="2.6" fill="#ff8fb1" />
          <circle cx="7" cy="0" r="2.6" fill="#fff" />
          <circle cx="-1" cy="2" r="2.6" fill="#a9d4ff" />
          <D>
            <path d="M-6,-2 v4 M1,-4 v6 M7,0 v3 M-1,2 v2 M-4,2 q2,-3 4,0 M3,1 q2,-3 4,0" stroke="#3e8538" strokeWidth="0.9" fill="none" />
            <path d="M-6,-2 h.1 M1,-4 h.1 M7,0 h.1 M-1,2 h.1" stroke="#e8a71c" strokeWidth="1.4" strokeLinecap="round" />
          </D>
        </>,
      );
    case 'hill':
      return g(
        <>
          <path d="M-40,4 Q-6,-34 2,-30 L4,14 Z" fill="#86c466" />
          <path d="M2,-30 Q14,-30 40,4 L4,14Z" fill="#6aa94e" />
          <D>
            {shadow2(4, 12, 38, 6)}
            <path d="M-34,0 Q-14,-26 0,-28" stroke="rgba(255,255,255,0.35)" strokeWidth="1.3" fill="none" />
            <path d="M-14,-4 l-1.6,-3.2 M-14,-4 v-3.8 M-14,-4 l1.6,-3.2 M14,-2 l-1.6,-3.2 M14,-2 v-3.8 M14,-2 l1.6,-3.2 M-26,2 v-3 M24,2 v-3" stroke="#3f8a3a" strokeWidth="1" strokeLinecap="round" fill="none" />
            <path d="M-6,-14 h.1 M2,-8 h.1 M8,-16 h.1" stroke="#ffe36b" strokeWidth="2" strokeLinecap="round" />
          </D>
        </>,
      );
    case 'mountain':
      return g(
        <>
          <ellipse cx="6" cy="6" rx="40" ry="12" fill="rgba(0,0,0,0.15)" />
          <polygon points="-38,4 2,-62 2,16" fill="#a29bba" />
          <polygon points="2,16 2,-62 40,2" fill="#7a7392" />
          <polygon points="-12,-40 2,-62 2,-36 -4,-42" fill="#fff" />
          <polygon points="2,-62 16,-40 9,-43 2,-36" fill="#dde2f1" />
          <D>
            <path d="M-12,-40 L-9,-42 L-6,-35 L-3,-43 L0,-37 L2,-36Z" fill="#fff" />
            <path d="M2,-62 L-38,4 M-26,-6 L-10,-16 M-18,-22 L-4,-28 M10,-18 L28,-4 M8,-34 L20,-22" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
            <path d="M-34,4 L-28,-2 L-22,4 L-24,8 L-32,8Z M26,6 L31,0 L38,4 L35,8Z" fill="#7a7392" stroke={EDGE} strokeWidth="0.6" />
          </D>
        </>,
      );
    case 'crystal':
      return g(
        <>
          <polygon points="-8,4 -10,-14 -3,-28 0,-14 -1,6" fill="#c9a2ff" />
          <polygon points="-1,6 0,-14 -3,-28 4,-14 3,4" fill="#8a5ad9" />
          <polygon points="3,4 6,-10 12,-18 12,4" fill="#9fe7ff" />
          <polygon points="12,4 12,-18 16,-8 15,3" fill="#4fa7c9" />
          <D>
            <circle cx="1" cy="-10" r="16" fill="#c9a2ff" opacity="0.14" />
            <path d="M-3,-28 L-8,-8 M12,-18 L7,-2" stroke="#fff" strokeWidth="1.1" opacity="0.75" fill="none" />
            <path d="M-14,4 L-12,-3 L-9,4Z M-9,6 L4,6 L2,3 L-7,3Z" fill="#8a8298" stroke={EDGE} strokeWidth="0.5" />
          </D>
        </>,
        'glow',
      );
    case 'cactus':
      return g(
        <>
          <ellipse cx="3" cy="2" rx="10" ry="4" fill="rgba(0,0,0,0.15)" />
          <rect x="-5" y="-32" width="5" height="34" rx="2" fill="#5bb062" />
          <rect x="0" y="-32" width="5" height="34" rx="2" fill="#3d8a45" />
          <path d="M-5,-14 H-11 V-24" fill="none" stroke="#4c9f53" strokeWidth="5" strokeLinecap="round" />
          <path d="M5,-18 H11 V-27" fill="none" stroke="#3d8a45" strokeWidth="5" strokeLinecap="round" />
          <D>
            <path d="M0,-31 V1 M-2.5,-30 V0 M2.5,-30 V0" stroke="rgba(0,60,20,0.3)" strokeWidth="0.8" fill="none" />
            <path d="M-4,-24 h.1 M3,-20 h.1 M-3,-10 h.1 M4,-8 h.1 M-11,-24 h.1 M11,-27 h.1" stroke="#f4eee0" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="0" cy="-33.5" r="2.4" fill="#ff8fb1" />
          </D>
        </>,
      );
    case 'rock':
      return g(
        <>
          <polygon points="-13,4 -10,-8 1,-13 2,6" fill="#b6a68e" />
          <polygon points="2,6 1,-13 12,-6 13,3" fill="#8a7a62" />
          <D>
            {shadow2(3, 5, 14, 4)}
            <path d="M-10,-8 L1,-13 L12,-6" stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none" />
            <ellipse cx="-6" cy="-9" rx="3.4" ry="1.4" fill="#7fae58" />
          </D>
        </>,
      );
    case 'mesa':
      return g(
        <>
          <ellipse cx="6" cy="10" rx="44" ry="14" fill="rgba(0,0,0,0.15)" />
          <IsoBox cx={0} cy={0} a={36} h={28} c={{ top: '#f0b47a', left: '#d98a4e', right: '#a85f2c' }} />
          <polygon points="-36,-14 0,4 36,-14 36,-18 0,0 -36,-18" fill="rgba(255,255,255,0.18)" />
          <D>
            <path d="M-36,-6 L0,12 L36,-6 M-36,-21 L0,-3 L36,-21 M-36,-26 L0,-8" stroke="rgba(120,50,20,0.28)" strokeWidth="1.1" fill="none" />
            <path d="M-36,-28 L0,-46 L36,-28" stroke="rgba(255,255,255,0.4)" strokeWidth="1.1" fill="none" />
            <path d="M-42,10 L-37,6 L-32,10 L-34,13 L-40,13Z M30,14 L35,10 L41,13 L38,16Z" fill="#b87a48" stroke={EDGE} strokeWidth="0.5" />
          </D>
        </>,
      );
    /* corrupted variants */
    case 'deadtree':
      return g(
        <>
          <ellipse cx="3" cy="2" rx="12" ry="5" fill="rgba(0,0,0,0.22)" />
          <path d="M0,2 L0,-34 M0,-16 L-11,-27 M0,-24 L9,-36 M0,-34 L-5,-44 M-11,-27 L-15,-25 M9,-36 L14,-38" stroke="#2c211c" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M0,2 L0,-34" stroke="#3d2f28" strokeWidth="1.5" fill="none" />
          <D>
            <path d="M-4,3 Q-2,-1 0,-3 Q2,-1 5,3 M-1.6,-30 V-4" stroke="#2c211c" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            <ellipse cx="0.4" cy="-12" rx="1.6" ry="2.6" fill="#120d0b" />
            <circle cx="-14" cy="-24" r="1.2" fill="#ff5a2a" />
          </D>
        </>,
      );
    case 'thorns':
      return g(
        <>
          <path d="M-12,2 Q-10,-12 -2,-6 Q0,-16 6,-8 Q12,-12 12,2 Z" fill="#3a2e2a" />
          <path d="M-8,-4 l-4,-5 M2,-10 l1,-6 M8,-6 l5,-4 M-2,-6 l-2,-6" stroke="#5a4038" strokeWidth="1.6" strokeLinecap="round" />
          <D>
            {shadow2(2, 3, 14, 3)}
            <path d="M-11,-9 l-2,-1 M3,-16 l2,-2 M13,-10 l2,0 M-4,-12 l-2,-3" stroke="#7a5448" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="-2" cy="-6" r="1.4" fill="#ff5a2a" />
          </D>
        </>,
      );
    case 'bones':
      return g(
        <>
          <ellipse cx="0" cy="-3" rx="5" ry="4" fill="#d9d0bd" />
          <circle cx="-2" cy="-4" r="1" fill="#2c211c" />
          <circle cx="2" cy="-4" r="1" fill="#2c211c" />
          <path d="M5,1 L14,-2" stroke="#d9d0bd" strokeWidth="2" strokeLinecap="round" />
          <D>
            <ellipse cx="3" cy="2" rx="14" ry="3.4" fill="rgba(0,0,0,0.2)" />
            <path d="M-3,0 h6 M-2,0 v2 M0,0 v2 M2,0 v2" stroke="#bdb2a0" strokeWidth="1" fill="none" />
            <path d="M-8,1 L-15,3 M-8,3 L-13,5" stroke="#d9d0bd" strokeWidth="1.8" strokeLinecap="round" />
          </D>
        </>,
      );
    case 'ashhill':
      return g(
        <>
          <path d="M-40,4 Q-6,-34 2,-30 L4,14 Z" fill="#6c605a" />
          <path d="M2,-30 Q14,-30 40,4 L4,14Z" fill="#544a45" />
          <path d="M-14,-6 l6,4 l-2,6" stroke="#ff6a2a" strokeWidth="1.5" fill="none" opacity="0.7" />
          <D>
            {shadow2(4, 12, 38, 6)}
            <path d="M12,-8 l-4,5 l3,3 l-2,5 M-26,0 l5,-3 l-1,4" stroke="#ff6a2a" strokeWidth="1.3" fill="none" opacity="0.8" />
            <circle cx="3" cy="-36" r="3" fill="#8a807a" opacity="0.5" className="smoke" />
          </D>
        </>,
      );
    case 'darkcrystal':
      return g(
        <>
          <polygon points="-8,4 -10,-14 -3,-28 0,-14 -1,6" fill="#8a3a3a" />
          <polygon points="-1,6 0,-14 -3,-28 4,-14 3,4" fill="#5a2020" />
          <polygon points="3,4 6,-10 12,-18 12,4" fill="#c2553a" />
          <D>
            <circle cx="1" cy="-10" r="15" fill="#ff5a2a" opacity="0.15" />
            <path d="M-3,-28 L-8,-8 M12,-18 L7,-2 M-4,-18 l2,6 l-2,5" stroke="#ffb090" strokeWidth="1" opacity="0.8" fill="none" />
            <path d="M-14,4 L-12,-2 L-9,4Z M-9,6 L4,6 L2,3 L-7,3Z" fill="#4a423e" stroke={EDGE} strokeWidth="0.5" />
          </D>
        </>,
        'glow',
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

const glint = (x: number, y: number, r = 0.8) => <circle cx={x} cy={y} r={r} fill="#fff" opacity="0.9" />;

/* ================================================================== */
/* Hero                                                                */
/* ================================================================== */

export function Hero({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`} className="hero" aria-label="You are here">
      <ellipse cx="0" cy="2" rx="18" ry="7" fill="rgba(0,0,0,0.25)" />
      <ellipse cx="0" cy="2" rx="10" ry="3.6" fill="rgba(0,0,0,0.2)" />
      <g className="hero-bob">
        <path d="M-10,-30 Q-20,-8 -14,-2 L10,-2 Q8,-20 6,-30 Z" fill="#c8332f" />
        <D>
          <path d="M-18,-8 Q-17,-3 -14,-2 L-2,-2 Q-10,-6 -12,-14Z" fill="#a22822" />
          <path d="M-10,-30 Q-16,-18 -17,-9" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" fill="none" />
        </D>
        <rect x="-8" y="-12" width="6" height="12" rx="2" fill="#3a2f4a" />
        <rect x="2" y="-12" width="6" height="12" rx="2" fill="#2a2238" />
        <D>
          <rect x="-9" y="-4" width="8" height="5" rx="2" fill="#5a3a22" /><rect x="1" y="-4" width="8" height="5" rx="2" fill="#4a2f1b" />
        </D>
        <rect x="-10" y="-34" width="20" height="20" rx="4" fill="#2f5fc4" />
        <path d="M0,-34 h10 v20 h-10z" fill="#244a9c" />
        <rect x="-10" y="-20" width="20" height="4" fill="#e8b33d" />
        <D>
          <rect x="-2.4" y="-20.4" width="4.8" height="4.8" rx="1" fill="#ffe27a" stroke={EDGE} strokeWidth="0.5" />
          <path d="M-10,-30 q3,-3 6,0 M4,-31 l4,0" stroke="rgba(255,255,255,0.4)" strokeWidth="1.1" fill="none" />
          <path d="M-8,-34 q8,5 16,0" stroke="#e8b33d" strokeWidth="2" fill="none" strokeLinecap="round" />
          <rect x="-10" y="-34" width="4" height="7" rx="2" fill="#4a7ae0" />
        </D>
        <circle cx="0" cy="-44" r="11" fill="#ffd2a6" />
        <path d="M-11,-46 Q-10,-58 0,-58 Q12,-58 11,-44 Q6,-52 -2,-50 Q-8,-50 -11,-46Z" fill="#7a3e1d" />
        <D>
          <path d="M-3,-59 q-2,-4 2,-5 q1,3 -1,5Z" fill="#7a3e1d" />
          <path d="M-9,-53 Q-4,-58 2,-57" stroke="#a15a2c" strokeWidth="1.2" fill="none" />
          <ellipse cx="-7" cy="-41" rx="2" ry="1.2" fill="#ff9a8a" opacity="0.55" /><ellipse cx="7" cy="-41" rx="2" ry="1.2" fill="#ff9a8a" opacity="0.55" />
          <path d="M-6,-47 l3,-0.8 M3,-47.8 l3,0.8" stroke="#5a2e12" strokeWidth="1" strokeLinecap="round" />
          <path d="M-1.6,-38 q1.6,1.2 3.2,0" stroke="#a24a2a" strokeWidth="0.9" fill="none" />
        </D>
        <circle cx="-4" cy="-43" r="1.6" fill="#1c1c2e" />
        <circle cx="4" cy="-43" r="1.6" fill="#1c1c2e" />
        <D>{glint(-4.5, -43.6, 0.5)}{glint(3.5, -43.6, 0.5)}</D>
        <line x1="13" y1="-18" x2="22" y2="-46" stroke="#e6eef8" strokeWidth="3" strokeLinecap="round" />
        <line x1="10" y1="-20" x2="17" y2="-17" stroke="#e8b33d" strokeWidth="3" strokeLinecap="round" />
        <D>
          <line x1="14" y1="-21" x2="22.5" y2="-46" stroke="#fff" strokeWidth="0.9" strokeLinecap="round" opacity="0.85" />
          <circle cx="13" cy="-17" r="1.6" fill="#7fd8ff" stroke={EDGE} strokeWidth="0.4" />
          <circle cx="12" cy="-15" r="2" fill="#ffd2a6" />
        </D>
      </g>
    </g>
  );
}
