import type { ReactNode } from 'react';
import { monstersOf, type Family } from '../data/monsters';
import { type Completed, isQuestDone, islandState } from '../lib/game';
import type { Island } from '../types';
import { D, EDGE, GROUND, GroundTile, LANDMARK_HEIGHT, LandmarkBody, landmarkOf, rng, shade } from './Overworld';

/** Half-width of the plot of land each area stands on. */
export const PLOT = 120;

/* ================================================================== */
/* Shared SVG defs (filters + gradients). Render once inside <defs>.   */
/* ================================================================== */

const ID = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0];
/** Ashen, scorched look: desaturated, darker and warm (no purple). */
const ASH = [0.26, 0.36, 0.1, 0, 0.03, 0.2, 0.3, 0.08, 0, 0.015, 0.17, 0.25, 0.08, 0, 0.01, 0, 0, 0, 1, 0];
const mix = (t: number) => ID.map((v, i) => (v * (1 - t) + ASH[i] * t).toFixed(3)).join(' ');

export function SceneDefs() {
  return (
    <>
      <filter id="corrupt-3">
        <feColorMatrix type="matrix" values={mix(1)} />
      </filter>
      <filter id="corrupt-2">
        <feColorMatrix type="matrix" values={mix(0.68)} />
      </filter>
      <filter id="corrupt-1">
        <feColorMatrix type="matrix" values={mix(0.36)} />
      </filter>
      <filter id="sealed">
        <feColorMatrix type="matrix" values="0.1 0.12 0.04 0 0.02  0.08 0.1 0.04 0 0.015  0.08 0.09 0.05 0 0.02  0 0 0 1 0" />
      </filter>
      <filter id="fog" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="7" />
      </filter>
      <radialGradient id="blight-grad">
        <stop offset="0" stopColor="#3b3230" stopOpacity="0.92" />
        <stop offset="0.55" stopColor="#4a3e39" stopOpacity="0.7" />
        <stop offset="1" stopColor="#4a3e39" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="ember-grad">
        <stop offset="0" stopColor="#ff6a2a" stopOpacity="0.55" />
        <stop offset="1" stopColor="#ff6a2a" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="purify-grad">
        <stop offset="0" stopColor="#fffbe0" stopOpacity="0.95" />
        <stop offset="0.5" stopColor="#ffe27a" stopOpacity="0.5" />
        <stop offset="1" stopColor="#ffe27a" stopOpacity="0" />
      </radialGradient>
    </>
  );
}

export const EYE = '#ff4a2a';

const BOSS_EYE = '#ffcf3a';
const glint = (x: number, y: number, r = 0.8) => <circle cx={x} cy={y} r={r} fill="#fff" opacity="0.9" />;
const eye = (x: number, y: number, r: number, c: string) => <circle cx={x} cy={y} r={r} fill={c} />;
/** both eyes: base circles + one merged halo path and one merged glint path (detail) */
const eyes = (x1: number, y1: number, x2: number, y2: number, r: number, c: string) => (
  <g>
    {eye(x1, y1, r, c)}
    {eye(x2, y2, r, c)}
    <D>
      <path d={`M${x1},${y1} h.1 M${x2},${y2} h.1`} stroke={c} strokeWidth={r * 4.4} strokeLinecap="round" opacity="0.15" />
      <path d={`M${x1 - r * 0.35},${y1 - r * 0.35} h.1 M${x2 - r * 0.35},${y2 - r * 0.35} h.1`} stroke="#fff" strokeWidth={r * 0.8} strokeLinecap="round" />
    </D>
  </g>
);

const TOP: Record<Family, number> = { slime: -16, specter: -31, golem: -33, hydra: -31, mimic: -31, drake: -32, imp: -32, wraith: -34 };

function body(family: Family, c: string, ec: string): ReactNode {
  const light = shade(c, 0.3);
  const dark = shade(c, -0.4);
  switch (family) {
    case 'slime':
      return (
        <>
          <ellipse cx="-12" cy="-1" rx="4" ry="1.6" fill={c} opacity="0.7" />
          <path d="M-11,0 Q-12,-15 0,-16 Q12,-15 11,0 Z" fill={c} />
          <path d="M0,-16 Q12,-15 11,0 L0,0 Z" fill={dark} opacity="0.35" />
          <path d="M-6,-11 Q-2,-14 3,-13" stroke={light} strokeWidth="2" fill="none" strokeLinecap="round" />
          <D>
            <path d="M-11,0 Q-12,-6 -10,-9 L-9,0Z" fill={light} opacity="0.35" />
            <path d="M-11,-0.5 Q0,2 11,-0.5" stroke={dark} strokeWidth="1.4" fill="none" opacity="0.5" />
            <circle cx="6" cy="-12" r="1.6" fill={light} opacity="0.7" />
            <circle cx="-8" cy="-4" r="1.2" fill={light} opacity="0.6" />
            <path d="M-2,-3 Q0,-1.4 2,-3" stroke={dark} strokeWidth="1.1" fill="none" />
          </D>
          {eyes(-4, -7, 4, -7, 2.2, ec)}
        </>
      );
    case 'specter':
      return (
        <g className="m-float">
          <path d="M-10,-6 Q-11,-30 0,-31 Q11,-30 10,-6 L7,-9 L4,-5 L1,-9 L-2,-5 L-5,-9 L-8,-5 Z" fill={light} opacity="0.88" />
          <D>
            <path d="M0,-31 Q11,-30 10,-6 L7,-9 L4,-5 L1,-9 Z" fill={c} opacity="0.35" />
            <path d="M-8,-24 Q-9,-16 -7,-10" stroke="#fff" strokeWidth="1.4" fill="none" opacity="0.55" strokeLinecap="round" />
            <path d="M-10,-16 q-5,2 -6,7 M10,-16 q5,2 6,7" stroke={light} strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.8" />
            <circle cx="14" cy="-24" r="1.4" fill={light} opacity="0.6" />
            <circle cx="-13" cy="-28" r="1" fill={light} opacity="0.5" />
          </D>
          <ellipse cx="-4" cy="-20" rx="1.9" ry="2.8" fill={ec} />
          <ellipse cx="4" cy="-20" rx="1.9" ry="2.8" fill={ec} />
          
          <ellipse cx="0" cy="-13" rx="2.2" ry="3" fill={dark} />
        </g>
      );
    case 'golem':
      return (
        <>
          <ellipse cx="-14" cy="0" rx="4" ry="1.6" fill="#7a7468" />
          <rect x="-9" y="-8" width="7" height="8" fill={dark} />
          <rect x="2" y="-8" width="7" height="8" fill={dark} />
          <rect x="-11" y="-25" width="22" height="18" rx="3" fill={c} />
          <rect x="0" y="-25" width="11" height="18" rx="3" fill={dark} opacity="0.4" />
          <rect x="-17" y="-23" width="6" height="15" rx="2" fill={dark} />
          <rect x="11" y="-23" width="6" height="15" rx="2" fill={dark} />
          <rect x="-7" y="-33" width="14" height="10" rx="2" fill={light} />
          <rect x="-4.5" y="-30" width="3" height="2.4" fill={ec} />
          <rect x="1.5" y="-30" width="3" height="2.4" fill={ec} />
          <path d="M-5,-21 L-1,-17 L-3,-13" stroke={ec} strokeWidth="1.3" fill="none" />
          <D>
            <path d="M-11,-18 H11 M-11,-12 H11 M-4,-25 V-18 M4,-18 V-12" stroke={dark} strokeWidth="0.9" opacity="0.55" fill="none" />
            <path d="M-11,-25 H11 M-7,-33 H7" stroke="rgba(255,255,255,0.4)" strokeWidth="1.1" />
            <rect x="-17" y="-23" width="6" height="3" rx="1" fill={light} opacity="0.55" />
            <ellipse cx="-5" cy="-24.5" rx="4.5" ry="1.8" fill="#5f9a4a" />
            <circle cx="-8.5" cy="-21" r="0.9" fill={light} /><circle cx="8.5" cy="-21" r="0.9" fill={light} />
            <circle cx="-3" cy="-29" r="3.6" fill={ec} opacity="0.15" /><circle cx="3" cy="-29" r="3.6" fill={ec} opacity="0.15" />
          </D>
        </>
      );
    case 'hydra':
      return (
        <>
          <path d="M10,-4 Q20,-2 22,-9" stroke={c} strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="0" cy="-6" rx="13" ry="7" fill={c} />
          <path d="M-6,-10 Q-12,-16 -12,-26 M0,-11 Q0,-20 0,-30 M6,-10 Q12,-16 12,-26" stroke={c} strokeWidth="4.5" fill="none" strokeLinecap="round" />
          {[[-13, -27], [0, -31], [13, -27]].map(([x, y]) => (
            <g key={x}>
              <ellipse cx={x} cy={y} rx="5" ry="3.8" fill={dark} />
              <circle cx={x + (x < 0 ? -1.5 : 1.5)} cy={y - 1} r="1.2" fill={ec} />
              <D>
                <path d={`M${x - 3},${y + 2.6} l1,2 l1,-2 l1,2 l1,-2 l1,2`} stroke="#f4eee0" strokeWidth="0.9" fill="none" />
                {glint(x + (x < 0 ? -1.8 : 1.2), y - 1.6, 0.5)}
              </D>
            </g>
          ))}
          <D>
            <ellipse cx="0" cy="-3" rx="9" ry="3.4" fill={shade(c, 0.45)} opacity="0.55" />
            <path d="M-12,-8 q2,-2 4,0 M6,-8 q2,-2 4,0 M-4,-12 q2,-2 4,0" stroke={dark} strokeWidth="1" fill="none" opacity="0.6" />
            <path d="M-7,-16 v-3 M-1,-20 v-3 M1,-20 v-3 M7,-16 v-3" stroke={dark} strokeWidth="1" opacity="0.5" />
            <path d="M-7,-9 Q0,-5 8,-9" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" fill="none" />
          </D>
        </>
      );
    case 'mimic':
      return (
        <>
          <rect x="-12" y="-14" width="24" height="14" rx="2" fill="#7a4a26" />
          <rect x="-12" y="-14" width="24" height="3" fill={c} />
          <path d="M-12,-17 Q0,-31 12,-17 Z" fill="#8f5a2e" />
          <path d="M-12,-17 L12,-17" stroke={c} strokeWidth="2.5" />
          <path d="M-10,-14 L-7,-10 L-4,-14 L-1,-10 L2,-14 L5,-10 L8,-14" fill="#f4eee0" />
          <path d="M-9,-16 L-6,-19 L-3,-16 L0,-19 L3,-16 L6,-19 L9,-16" fill="#f4eee0" />
          <path d="M-2,-12 Q4,-6 9,-8" stroke="#d9465a" strokeWidth="3" fill="none" strokeLinecap="round" />
          {eyes(-5, -23, 5, -23, 1.8, ec)}
          <D>
            <path d="M-12,-5 H12 M-12,-14 V0 M12,-14 V0" stroke={c} strokeWidth="1.6" opacity="0.9" />
            <path d="M-8,-27 Q0,-31 8,-27" stroke="rgba(255,255,255,0.35)" strokeWidth="1.3" fill="none" />
            <path d="M-12,-17 Q-6,-26 -3,-29 M12,-17 Q6,-26 3,-29" stroke={c} strokeWidth="2" fill="none" />
            <rect x="-2" y="-9" width="4" height="4" rx="1" fill="#ffd34d" stroke={EDGE} strokeWidth="0.5" />
            <path d="M-12,0 l-3,3 M12,0 l3,3" stroke="#7a4a26" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="-9" cy="-9" r="0.9" fill={c} /><circle cx="9" cy="-9" r="0.9" fill={c} />
          </D>
        </>
      );
    case 'drake':
      return (
        <>
          <path d="M-8,-6 Q-18,-4 -20,-12" stroke={c} strokeWidth="4" fill="none" strokeLinecap="round" />
          <polygon points="-4,-12 -16,-30 4,-16" fill={dark} />
          <rect x="-6" y="-5" width="4" height="5" fill={dark} />
          <rect x="3" y="-5" width="4" height="5" fill={dark} />
          <ellipse cx="0" cy="-8" rx="10" ry="6" fill={c} />
          <path d="M5,-11 Q8,-18 10,-20" stroke={c} strokeWidth="5" fill="none" strokeLinecap="round" />
          <ellipse cx="12" cy="-21" rx="6" ry="4.2" fill={c} />
          <polygon points="9,-24 7,-31 12,-25" fill={light} />
          {eye(13, -22, 1.4, ec)}
          <polygon points="4,-12 10,-32 14,-14" fill={dark} opacity="0.85" />
          <D>
            <path d="M-4,-12 L-12,-24 M0,-13 L-8,-22 M4,-12 L10,-32 M8,-13 L12,-26" stroke={light} strokeWidth="0.9" opacity="0.5" fill="none" />
            <path d="M-20,-12 l-3,-3 l1,5Z" fill={light} />
            <path d="M-6,-5 Q0,-2 7,-5" stroke={shade(c, 0.5)} strokeWidth="2.4" fill="none" opacity="0.7" strokeLinecap="round" />
            <path d="M-4,-9 h.1 M0,-10 h.1 M4,-9 h.1" stroke={dark} strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
            <path d="M17,-21 h4" stroke="#bdb5a6" strokeWidth="2" strokeLinecap="round" opacity="0.6" className="smoke" />
            <path d="M-6,0 l-1.4,2.4 M-4,0 l0,2.6 M3,0 l-1,2.4 M6,0 l0,2.6" stroke="#f4eee0" strokeWidth="1" />
            <path d="M8,-24 l-1,-4" stroke={shade(c, 0.5)} strokeWidth="1.2" />
          </D>
        </>
      );
    case 'imp':
      return (
        <>
          <path d="M-5,-4 Q-14,-2 -12,-12" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" />
          <line x1="9" y1="0" x2="12" y2="-28" stroke="#3a2a20" strokeWidth="2" />
          <path d="M8,-28 L9,-32 M12,-28 L12,-33 M16,-28 L15,-32 M8,-28 L16,-28" stroke="#3a2a20" strokeWidth="1.6" strokeLinecap="round" />
          <D>
            <path d="M-6,-10 L-16,-20 L-11,-8Z M6,-10 L12,-17 L10,-6Z" fill={dark} opacity="0.85" />
            <polygon points="-12,-12 -16,-9 -13,-14" fill={light} />
          </D>
          <ellipse cx="0" cy="-8" rx="7" ry="8" fill={c} />
          <circle cx="0" cy="-20" r="6" fill={c} />
          <polygon points="-5,-23 -8,-31 -2,-25" fill={light} />
          <polygon points="5,-23 8,-31 2,-25" fill={light} />
          {eyes(-2.2, -20, 2.2, -20, 1.4, ec)}
          <path d="M-2,-16 Q0,-14 2,-16" stroke={dark} strokeWidth="1" fill="none" />
          <D>
            <ellipse cx="0" cy="-6" rx="3.6" ry="4.6" fill={light} opacity="0.55" />
            <path d="M-1.6,-15.4 v1.6 M1.6,-15.4 v1.6" stroke="#f4eee0" strokeWidth="1" />
            <path d="M-6,-10 Q-6,-4 -5,0 M7,-3 l3,0" stroke={dark} strokeWidth="1.1" fill="none" opacity="0.5" />
            <path d="M-4,-5 l-1.4,5 M4,-5 l1.4,5" stroke={dark} strokeWidth="2.4" strokeLinecap="round" />
            <path d="M-13,-12 l-2,-3 l4,0Z" fill="#3a2a20" />
            <path d="M-3,-25 Q0,-27 3,-25" stroke="rgba(255,255,255,0.35)" strokeWidth="1" fill="none" />
          </D>
        </>
      );
    case 'wraith':
      return (
        <g className="m-float">
          <path d="M-11,-2 L-8,-20 Q0,-34 8,-20 L11,-2 L7,-6 L3,-2 L-1,-6 L-5,-2 L-8,-6 Z" fill={dark} />
          <path d="M0,-34 Q8,-30 8,-20 L11,-2 L7,-6 L3,-2 Z" fill="#000" opacity="0.2" />
          <ellipse cx="0" cy="-21" rx="5" ry="6" fill="#0e0a0c" />
          {eyes(-2, -22, 2, -22, 1.4, ec)}
          <path d="M-9,-14 L-15,-8 M9,-14 L15,-9" stroke={dark} strokeWidth="2.5" strokeLinecap="round" />
          <D>
            <path d="M-8,-20 Q0,-34 8,-20" stroke="rgba(255,255,255,0.28)" strokeWidth="1.3" fill="none" />
            <path d="M-4,-12 V-4 M2,-12 V-5 M7,-14 L8,-6" stroke="#000" strokeWidth="1" opacity="0.35" />
            <rect x="-17" y="-9" width="2" height="5" fill="#3a2a20" />
            <circle cx="-16" cy="-11" r="3" fill="#ff9b3d" className="flicker" />
            <circle cx="-16" cy="-11" r="6.5" fill="#ff9b3d" opacity="0.2" className="flicker" />
            <circle cx="12" cy="-26" r="1" fill={shade(dark, 0.5)} /><circle cx="-12" cy="-28" r="0.8" fill={shade(dark, 0.5)} />
          </D>
        </g>
      );
  }
}

export function Monster({ family, c, boss = false, name, x, y, delay = 0 }: { family: Family; c: string; boss?: boolean; name: string; x: number; y: number; delay?: number }) {
  const s = boss ? 1.85 : 1;
  return (
    <g transform={`translate(${x},${y})`} className={`monster ${boss ? 'monster-boss' : ''}`}>
      <title>{boss ? `${name} (boss)` : name}</title>
      {boss && <ellipse cx="0" cy="1" rx="26" ry="9" fill="none" stroke="#ff4a2a" strokeWidth="2" className="boss-ring" />}
      <ellipse cx="0" cy="1" rx={11 * s} ry={3.6 * s} fill="rgba(0,0,0,0.3)" />
      <D><ellipse cx="0" cy="1" rx={6.5 * s} ry={2.2 * s} fill="rgba(0,0,0,0.25)" /></D>
      <g transform={`scale(${s})`}>
        <g className="m-body" style={{ animationDelay: `${delay}s` }}>
          {body(family, c, boss ? BOSS_EYE : EYE)}
          {boss && (
            <D>
              <path d={`M-6,${TOP[family] + 1} l-1.5,-5 l3,2.6 l2.5,-4.4 l2.5,4.4 l3,-2.6 l-1.5,5Z`} fill="#ffd34d" stroke={EDGE} strokeWidth="0.6" />
              <circle cx="0" cy={TOP[family] - 4.6} r="0.9" fill="#ff4a2a" />
            </D>
          )}
        </g>
      </g>
    </g>
  );
}

export function Villager({ x, y, shirt, skin, hair, delay }: { x: number; y: number; shirt: string; skin: string; hair: string; delay: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx="0" cy="1" rx="6" ry="2.5" fill="rgba(0,0,0,0.25)" />
      <g className="villager" style={{ animationDelay: `${delay}s` }}>
        <rect x="-3" y="-4" width="2.6" height="4" rx="1" fill="#4a3a2a" />
        <rect x="0.4" y="-4" width="2.6" height="4" rx="1" fill="#3a2d20" />
        <rect x="-4" y="-12" width="8" height="9" rx="2.5" fill={shirt} />
        <D>
          <path d="M0,-12 h4 v9 h-4Z" fill="rgba(0,0,0,0.18)" />
          <rect x="-4" y="-5.4" width="8" height="1.6" fill="rgba(0,0,0,0.3)" />
          <circle cx="-5" cy="-7" r="1.7" fill={skin} /><circle cx="5" cy="-7" r="1.7" fill={skin} />
        </D>
        <circle cx="0" cy="-16" r="4.2" fill={skin} />
        <path d="M-4.2,-17 Q0,-23 4.2,-17 Z" fill={hair} />
        <D>
          <circle cx="-1.6" cy="-15.6" r="0.6" fill="#1c1c2e" /><circle cx="1.6" cy="-15.6" r="0.6" fill="#1c1c2e" />
          <path d="M-1.2,-13.6 q1.2,0.8 2.4,0" stroke="#7a3e1d" strokeWidth="0.5" fill="none" />
        </D>
      </g>
    </g>
  );
}

export function Butterfly({ x, y, c, delay }: { x: number; y: number; c: string; delay: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <g className="butterfly" style={{ animationDelay: `${delay}s` }}>
        <path d="M0,0 l-5,-4 l0,7 Z M0,0 l5,-4 l0,7 Z" fill={c} />
        <D>
          <path d="M0,0 l-4,2 l-1,3.5 Z M0,0 l4,2 l1,3.5 Z" fill={shade(c, -0.2)} />
          <circle cx="-3" cy="-1" r="0.9" fill="#fff" opacity="0.8" /><circle cx="3" cy="-1" r="0.9" fill="#fff" opacity="0.8" />
          <path d="M0,-2 v5 M0,-2 l-1.4,-2 M0,-2 l1.4,-2" stroke="#3a2a20" strokeWidth="0.7" />
        </D>
      </g>
    </g>
  );
}

export function StormCloud({ y, strength, lightning }: { y: number; strength: number; lightning: boolean }) {
  return (
    <g transform={`translate(0,${y})`} opacity={strength} aria-hidden className="storm">
      {lightning && <polyline points="-30,8 -40,26 -30,26 -42,46" stroke="#ffd84a" strokeWidth="3" fill="none" className="lightning" />}
      <ellipse cx="-26" cy="0" rx="34" ry="13" fill="#3b3432" />
      <ellipse cx="14" cy="-6" rx="34" ry="16" fill="#4a423e" />
      <ellipse cx="0" cy="8" rx="46" ry="11" fill="#2f2827" />
      <D>
        <ellipse cx="-30" cy="-6" rx="18" ry="6" fill="#6b605a" opacity="0.75" />
        <ellipse cx="10" cy="-14" rx="20" ry="7" fill="#7a6e66" opacity="0.7" />
        <ellipse cx="0" cy="16" rx="34" ry="4" fill="#ff5a2a" opacity="0.28" className="glow" />
        <path d="M-34,16 l-2,7 M-12,18 l-2,7 M14,18 l-2,7 M34,15 l-2,7" stroke="#8fb6d9" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      </D>
    </g>
  );
}

function Flowers({ seed }: { seed: string }) {
  const r = rng(seed);
  const colors = ['#ffe36b', '#ff8fb1', '#ffffff', '#a9d4ff', '#ffb36b'];
  const dots: ReactNode[] = [];
  for (let i = 0; i < 26; i++) {
    const x = (r() - 0.5) * PLOT * 1.7;
    const y = -14 + (r() - 0.5) * PLOT * 0.8;
    if (Math.abs(x) / PLOT + Math.abs(y + 14) / (PLOT / 2) > 0.9) continue;
    if (Math.abs(x) < 52 && y > -50 && y < 24) continue; // keep clear of the building
    dots.push(<circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r="2.4" fill={colors[i % colors.length]} />);
  }
  return <g aria-hidden>{dots}</g>;
}

/** Glowing cracks scorched into a corrupted plot. */
function Cracks({ seed, opacity }: { seed: string; opacity: number }) {
  const r = rng(seed);
  const paths: string[] = [];
  for (let i = 0; i < 6; i++) {
    let x = (r() - 0.5) * PLOT * 1.4;
    let y = -14 + (r() - 0.5) * PLOT * 0.55;
    if (Math.abs(x) < 50 && y > -50 && y < 20) x += x < 0 ? -55 : 55;
    let d = `M${x.toFixed(1)},${y.toFixed(1)}`;
    for (let k = 0; k < 3; k++) {
      x += (r() - 0.5) * 26;
      y += (r() - 0.3) * 10;
      d += ` L${x.toFixed(1)},${y.toFixed(1)}`;
    }
    paths.push(d);
  }
  return (
    <g opacity={opacity} aria-hidden className="cracks">
      {paths.map((d, i) => (
        <path key={i} d={d} stroke="#ff5a2a" strokeWidth="1.8" fill="none" strokeLinejoin="round" />
      ))}
    </g>
  );
}

/* ================================================================== */
/* The scene                                                           */
/* ================================================================== */

/** Minion spots on the plot (avoids the building and the boss's spot). */
const SLOTS: [number, number][] = [
  [-92, -8],
  [-46, 26],
  [-50, -44],
  [44, -46],
  [6, 36],
  [-98, 20],
];
const BOSS_SLOT: [number, number] = [78, 6];

export interface SceneInfo {
  state: ReturnType<typeof islandState>;
  done: number;
  total: number;
  /** 0 purified … 3 fully corrupted; 4 sealed */
  level: 0 | 1 | 2 | 3 | 4;
}

export function sceneInfo(island: Island, completed: Completed): SceneInfo {
  const state = islandState(completed, island);
  const total = island.quests.length;
  const done = island.quests.filter((q) => isQuestDone(completed, island.id, q.id)).length;
  const p = done / total;
  const level = state === 'complete' ? 0 : state === 'locked' ? 4 : p < 1 / 3 ? 3 : p < 2 / 3 ? 2 : 1;
  return { state, done, total, level };
}

export function AreaScene({ island, completed, purifying = false }: { island: Island; completed: Completed; purifying?: boolean }) {
  const { level } = sceneInfo(island, completed);
  const kind = landmarkOf(island);
  const H = LANDMARK_HEIGHT[kind];
  const sealed = level === 4;
  const filter = level ? `url(#${sealed ? 'sealed' : `corrupt-${level}`})` : undefined;
  const mons = monstersOf(island.id);
  const monsters: { y: number; node: ReactNode }[] = [];
  if (!sealed) {
    const mc = shade(island.color, -0.2);
    let slot = 0;
    island.quests.forEach((q, i) => {
      const alive = !isQuestDone(completed, island.id, q.id);
      if (q.boss) {
        if (alive) monsters.push({ y: BOSS_SLOT[1], node: <Monster key={q.id} family={mons.boss.family} c={shade(island.color, -0.5)} boss name={mons.boss.name} x={BOSS_SLOT[0]} y={BOSS_SLOT[1]} /> });
        return;
      }
      const [x, y] = SLOTS[slot++ % SLOTS.length];
      if (alive) monsters.push({ y, node: <Monster key={q.id} family={mons.minion.family} c={mc} name={mons.minion.name} x={x} y={y} delay={i * 0.23} /> });
    });
  }
  const layers = [...monsters, { y: 0, node: <g key="landmark" filter={filter}><LandmarkBody kind={kind} c={island.color} /></g> }].sort((a, b) => a.y - b.y);
  return (
    <g className={`scene scene-l${level} ${purifying ? 'scene-purifying' : ''}`}>
      {level > 0 && level < 4 && <ellipse cx="0" cy="-10" rx={PLOT * 0.9} ry={PLOT * 0.4} fill="url(#ember-grad)" opacity={level / 3} aria-hidden />}
      <g filter={filter}>
        <GroundTile a={PLOT} grass={GROUND[island.region]} level={level} />
      </g>
      {level > 0 && level < 4 && <Cracks seed={`cracks-${island.id}`} opacity={0.35 + level * 0.22} />}
      {level === 0 && <Flowers seed={`flowers-${island.id}`} />}
      {layers.map((l) => l.node)}
      {level > 0 && level < 4 && (
        <>
          <g className="smoke-plume" aria-hidden>
            <circle cx="10" cy={-H * 0.8} r="9" fill="#2f2827" opacity="0.6" className="smoke" />
            <circle cx="18" cy={-H * 0.8 - 18} r="12" fill="#2f2827" opacity="0.45" className="smoke s2" />
          </g>
          <StormCloud y={-H - 66} strength={0.35 + level * 0.2} lightning={level >= 2} />
        </>
      )}
      {level === 0 && (
        <g aria-hidden>
          <Villager x={-78} y={18} shirt="#d9534f" skin="#f2c9a0" hair="#5a3a22" delay={0} />
          <Villager x={60} y={28} shirt="#3c7fd0" skin="#c99b6e" hair="#2a1d14" delay={0.5} />
          <Villager x={-26} y={40} shirt="#e8b33d" skin="#ffd2a6" hair="#c9803a" delay={0.9} />
          <Butterfly x={-40} y={-H * 0.55} c="#ff9ad5" delay={0} />
          <Butterfly x={52} y={-H * 0.35} c="#fff36b" delay={0.8} />
        </g>
      )}
      {sealed && (
        <g aria-hidden>
          <g filter="url(#fog)" opacity="0.85">
            <ellipse cx="-50" cy="-30" rx="70" ry="30" fill="#1b1618" />
            <ellipse cx="40" cy="-56" rx="70" ry="34" fill="#221c1d" />
            <ellipse cx="0" cy="-6" rx="110" ry="36" fill="#171314" />
            <ellipse cx="10" cy={-H * 0.7} rx="60" ry="30" fill="#1b1618" />
          </g>
          {[[-70, -20, 0], [64, -8, 1.3], [-16, 22, 2.1]].map(([x, y, d]) => (
            <g key={x} className="red-eyes" style={{ animationDelay: `${d}s` }}>
              <circle cx={x - 3} cy={y} r="2" fill={EYE} />
              <circle cx={x + 3} cy={y} r="2" fill={EYE} />
              <circle cx={x} cy={y} r="7" fill={EYE} opacity="0.12" />
            </g>
          ))}
        </g>
      )}
      {purifying && (
        <g aria-hidden>
          <g filter="url(#corrupt-3)" className="purify-fade">
            <GroundTile a={PLOT} grass={GROUND[island.region]} />
            <LandmarkBody kind={kind} c={island.color} />
          </g>
          <ellipse cx="0" cy={-H * 0.4} rx="40" ry="40" fill="url(#purify-grad)" className="purify-burst" />
          <ellipse cx="0" cy="-10" rx={PLOT} ry={PLOT / 2} fill="none" stroke="#fff3b0" strokeWidth="4" className="purify-ring" />
        </g>
      )}
    </g>
  );
}
