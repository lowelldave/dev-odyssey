import type { ReactNode } from 'react';
import { monstersOf, type Family } from '../data/monsters';
import { type Completed, isQuestDone, islandState } from '../lib/game';
import type { Island } from '../types';
import { GROUND, GroundTile, LANDMARK_HEIGHT, LandmarkBody, landmarkOf, rng, shade } from './Overworld';

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

/* ================================================================== */
/* Monsters: 8 families, tinted per area                               */
/* ================================================================== */

const EYE = '#ff4a2a';
const BOSS_EYE = '#ffcf3a';

function body(family: Family, c: string, eye: string): ReactNode {
  const light = shade(c, 0.3);
  const dark = shade(c, -0.4);
  switch (family) {
    case 'slime':
      return (
        <>
          <path d="M-11,0 Q-12,-15 0,-16 Q12,-15 11,0 Z" fill={c} />
          <path d="M0,-16 Q12,-15 11,0 L0,0 Z" fill={dark} opacity="0.35" />
          <path d="M-6,-11 Q-2,-14 3,-13" stroke={light} strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="-4" cy="-7" r="2.2" fill={eye} />
          <circle cx="4" cy="-7" r="2.2" fill={eye} />
        </>
      );
    case 'specter':
      return (
        <g className="m-float">
          <path d="M-10,-6 Q-11,-30 0,-31 Q11,-30 10,-6 L7,-9 L4,-5 L1,-9 L-2,-5 L-5,-9 L-8,-5 Z" fill={light} opacity="0.88" />
          <ellipse cx="-4" cy="-20" rx="1.9" ry="2.8" fill={eye} />
          <ellipse cx="4" cy="-20" rx="1.9" ry="2.8" fill={eye} />
          <ellipse cx="0" cy="-13" rx="2.2" ry="3" fill={dark} />
        </g>
      );
    case 'golem':
      return (
        <>
          <rect x="-9" y="-8" width="7" height="8" fill={dark} />
          <rect x="2" y="-8" width="7" height="8" fill={dark} />
          <rect x="-11" y="-25" width="22" height="18" rx="3" fill={c} />
          <rect x="0" y="-25" width="11" height="18" rx="3" fill={dark} opacity="0.4" />
          <rect x="-17" y="-23" width="6" height="15" rx="2" fill={dark} />
          <rect x="11" y="-23" width="6" height="15" rx="2" fill={dark} />
          <rect x="-7" y="-33" width="14" height="10" rx="2" fill={light} />
          <rect x="-4.5" y="-30" width="3" height="2.4" fill={eye} />
          <rect x="1.5" y="-30" width="3" height="2.4" fill={eye} />
          <path d="M-5,-21 L-1,-17 L-3,-13" stroke={eye} strokeWidth="1.3" fill="none" />
        </>
      );
    case 'hydra':
      return (
        <>
          <ellipse cx="0" cy="-6" rx="13" ry="7" fill={c} />
          <path d="M-6,-10 Q-12,-16 -12,-26 M0,-11 Q0,-20 0,-30 M6,-10 Q12,-16 12,-26" stroke={c} strokeWidth="4.5" fill="none" strokeLinecap="round" />
          {[
            [-13, -27],
            [0, -31],
            [13, -27],
          ].map(([x, y]) => (
            <g key={x}>
              <ellipse cx={x} cy={y} rx="5" ry="3.8" fill={dark} />
              <circle cx={x + (x < 0 ? -1.5 : 1.5)} cy={y - 1} r="1.2" fill={eye} />
            </g>
          ))}
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
          <circle cx="-5" cy="-23" r="1.8" fill={eye} />
          <circle cx="5" cy="-23" r="1.8" fill={eye} />
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
          <circle cx="13" cy="-22" r="1.4" fill={eye} />
          <polygon points="4,-12 10,-32 14,-14" fill={dark} opacity="0.85" />
        </>
      );
    case 'imp':
      return (
        <>
          <path d="M-5,-4 Q-14,-2 -12,-12" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" />
          <line x1="9" y1="0" x2="12" y2="-28" stroke="#3a2a20" strokeWidth="2" />
          <path d="M8,-28 L9,-32 M12,-28 L12,-33 M16,-28 L15,-32 M8,-28 L16,-28" stroke="#3a2a20" strokeWidth="1.6" strokeLinecap="round" />
          <ellipse cx="0" cy="-8" rx="7" ry="8" fill={c} />
          <circle cx="0" cy="-20" r="6" fill={c} />
          <polygon points="-5,-23 -8,-31 -2,-25" fill={light} />
          <polygon points="5,-23 8,-31 2,-25" fill={light} />
          <circle cx="-2.2" cy="-20" r="1.4" fill={eye} />
          <circle cx="2.2" cy="-20" r="1.4" fill={eye} />
          <path d="M-2,-16 Q0,-14 2,-16" stroke={dark} strokeWidth="1" fill="none" />
        </>
      );
    case 'wraith':
      return (
        <g className="m-float">
          <path d="M-11,-2 L-8,-20 Q0,-34 8,-20 L11,-2 L7,-6 L3,-2 L-1,-6 L-5,-2 L-8,-6 Z" fill={dark} />
          <path d="M0,-34 Q8,-30 8,-20 L11,-2 L7,-6 L3,-2 Z" fill="#000" opacity="0.2" />
          <ellipse cx="0" cy="-21" rx="5" ry="6" fill="#0e0a0c" />
          <circle cx="-2" cy="-22" r="1.4" fill={eye} />
          <circle cx="2" cy="-22" r="1.4" fill={eye} />
          <path d="M-9,-14 L-15,-8 M9,-14 L15,-9" stroke={dark} strokeWidth="2.5" strokeLinecap="round" />
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
      <ellipse cx="0" cy="1" rx={11 * s} ry={3.6 * s} fill="rgba(0,0,0,0.35)" />
      <g transform={`scale(${s})`}>
        <g className="m-body" style={{ animationDelay: `${delay}s` }}>
          {body(family, c, boss ? BOSS_EYE : EYE)}
        </g>
      </g>
    </g>
  );
}

/* ================================================================== */
/* Purified-area extras                                                */
/* ================================================================== */

function Villager({ x, y, shirt, skin, delay }: { x: number; y: number; shirt: string; skin: string; delay: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx="0" cy="1" rx="6" ry="2.5" fill="rgba(0,0,0,0.25)" />
      <g className="villager" style={{ animationDelay: `${delay}s` }}>
        <rect x="-4" y="-12" width="8" height="11" rx="2.5" fill={shirt} />
        <circle cx="0" cy="-16" r="4.2" fill={skin} />
        <path d="M-4.2,-17 Q0,-23 4.2,-17 Z" fill="#5a3a22" />
      </g>
    </g>
  );
}

function Butterfly({ x, y, c, delay }: { x: number; y: number; c: string; delay: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <g className="butterfly" style={{ animationDelay: `${delay}s` }}>
        <path d="M0,0 l-5,-4 l0,7 Z M0,0 l5,-4 l0,7 Z" fill={c} />
      </g>
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

function StormCloud({ y, strength, lightning }: { y: number; strength: number; lightning: boolean }) {
  return (
    <g transform={`translate(0,${y})`} opacity={strength} aria-hidden className="storm">
      {lightning && <polyline points="-30,8 -40,26 -30,26 -42,46" stroke="#ffd84a" strokeWidth="3" fill="none" className="lightning" />}
      <ellipse cx="-26" cy="0" rx="34" ry="13" fill="#3b3432" />
      <ellipse cx="14" cy="-6" rx="34" ry="16" fill="#4a423e" />
      <ellipse cx="0" cy="8" rx="46" ry="11" fill="#2f2827" />
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

  // one monster per uncleared quest
  const monsters: { y: number; node: ReactNode }[] = [];
  if (!sealed) {
    const mc = shade(island.color, -0.2);
    let slot = 0;
    island.quests.forEach((q, i) => {
      const alive = !isQuestDone(completed, island.id, q.id);
      if (q.boss) {
        if (alive)
          monsters.push({
            y: BOSS_SLOT[1],
            node: <Monster key={q.id} family={mons.boss.family} c={shade(island.color, -0.5)} boss name={mons.boss.name} x={BOSS_SLOT[0]} y={BOSS_SLOT[1]} />,
          });
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
        <GroundTile a={PLOT} grass={GROUND[island.region]} />
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
          <Villager x={-78} y={18} shirt="#d9534f" skin="#f2c9a0" delay={0} />
          <Villager x={60} y={28} shirt="#3c7fd0" skin="#c99b6e" delay={0.5} />
          <Villager x={-26} y={40} shirt="#e8b33d" skin="#ffd2a6" delay={0.9} />
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
          {[
            [-70, -20, 0],
            [64, -8, 1.3],
            [-16, 22, 2.1],
          ].map(([x, y, d]) => (
            <g key={x} className="red-eyes" style={{ animationDelay: `${d}s` }}>
              <circle cx={x - 3} cy={y} r="2" fill={EYE} />
              <circle cx={x + 3} cy={y} r="2" fill={EYE} />
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
