import type { ReactNode } from 'react';

/** Local copies of the Overworld helpers so art/ never imports Overworld (avoids an import cycle). */
export function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(amt > 0 ? c + (255 - c) * amt : c * (1 + amt))));
  return `#${((1 << 24) | (f((n >> 16) & 255) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).slice(1)}`;
}
export const EDGE = 'rgba(40,28,20,0.55)';
export const INK = '#2a1c14';
const p = (x: number, y: number) => `${x.toFixed(1)},${y.toFixed(1)}`;

export interface Faces { top: string; left: string; right: string }
export const facesOf = (c: string): Faces => ({ top: shade(c, 0.28), left: shade(c, 0.12), right: shade(c, -0.28) });

/** 2:1 isometric box standing on ground point (cx, cy). Light from the upper left. */
export function Box({ cx, cy, a, h, c, b = a / 2 }: { cx: number; cy: number; a: number; h: number; c: Faces; b?: number }) {
  const N = [cx, cy - b], E = [cx + a, cy], S = [cx, cy + b], W = [cx - a, cy];
  const up = (q: number[]) => [q[0], q[1] - h];
  const poly = (ps: number[][], fill: string) => (
    <polygon points={ps.map((q) => p(q[0], q[1])).join(' ')} fill={fill} stroke={EDGE} strokeWidth="1" strokeLinejoin="round" />
  );
  return <g>{poly([W, S, up(S), up(W)], c.left)}{poly([S, E, up(E), up(S)], c.right)}{poly([up(N), up(E), up(S), up(W)], c.top)}</g>;
}

/** Pyramid roof; base sits at height h above (cx, cy). */
export function Pyramid({ cx, cy, a, h, ph, color, b = a / 2 }: { cx: number; cy: number; a: number; h: number; ph: number; color: string; b?: number }) {
  const t = cy - h;
  const apex = [cx, t - ph], W = [cx - a, t], S = [cx, t + b], E = [cx + a, t];
  const poly = (ps: number[][], fill: string) => (
    <polygon points={ps.map((q) => p(q[0], q[1])).join(' ')} fill={fill} stroke={EDGE} strokeWidth="1" strokeLinejoin="round" />
  );
  return <g>{poly([W, S, apex], shade(color, 0.12))}{poly([S, E, apex], shade(color, -0.28))}</g>;
}

export function GroundShadow({ rx, ry, cx = 0, cy = 0 }: { rx: number; ry: number; cx?: number; cy?: number }) {
  return <ellipse cx={cx + 2} cy={cy + 2} rx={rx} ry={ry} fill="rgba(0,0,0,0.18)" />;
}

export interface ArtProps { className?: string; title?: string }
export function Svg({ w, h, children, className, title, vb }: { w: number; h: number; children: ReactNode; className?: string; title?: string; vb?: string }) {
  return (
    <svg width={w} height={h} viewBox={vb ?? `0 0 ${w} ${h}`} className={className} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true} focusable="false">
      {children}
    </svg>
  );
}
