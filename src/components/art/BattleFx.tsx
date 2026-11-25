import { Svg, INK, shade } from './util';

/* ---------------- damage number ---------------- */
export interface DamageNumberProps {
  /** shown as "-N" for hurt/hit, "+N" for heal */
  amount: number;
  kind?: 'hit' | 'hurt' | 'heal' | 'block';
  /** change to retrigger the animation */
  fxKey?: number | string;
  className?: string;
}
/** HTML overlay number. kind 'block' ignores `amount` and shows "Deflected!". Position it with the parent (absolute). Rises and fades via transform/opacity only (.jr-dmg). */
export function DamageNumber({ amount, kind = 'hit', fxKey, className }: DamageNumberProps) {
  if (kind === 'block') {
    return (
      <span key={fxKey} className={`jr-dmg jr-dmg-block${className ? ` ${className}` : ''}`} aria-hidden="true">
        Deflected!
      </span>
    );
  }
  const sign = kind === 'heal' ? '+' : '-';
  return (
    <span key={fxKey} className={`jr-dmg jr-dmg-${kind}${className ? ` ${className}` : ''}`} aria-hidden="true">
      {sign}
      {Math.abs(amount)}
    </span>
  );
}

/** Slash across a target for the "Finishing blow!" and for hits. Draws on via a CSS class on the root (.jr-slash). */
export function SlashFx({ fxKey, size = 96, finishing = false }: { fxKey?: number | string; size?: number; finishing?: boolean }) {
  return (
    <Svg key={fxKey} w={size} h={size} vb="0 0 96 96" className={`jr-slash${finishing ? ' is-finishing' : ''}`}>
      <path d="M12 82 L84 14" stroke={INK} strokeWidth={finishing ? 11 : 8} strokeLinecap="round" />
      <path d="M12 82 L84 14" stroke={finishing ? '#ffd34d' : '#ffffff'} strokeWidth={finishing ? 6 : 4} strokeLinecap="round" />
      {finishing && <path d="M24 84 L88 28" stroke="#fff3b0" strokeWidth="3" strokeLinecap="round" opacity="0.9" />}
    </Svg>
  );
}

/** Full-cover flash layer. Put inside a position:relative stage. kind 'hit' = white on the monster, 'hurt' = red on the hero stage, 'deflect' = white-blue (shield block). */
export function HitFlash({ kind = 'hit', fxKey }: { kind?: 'hit' | 'hurt' | 'deflect'; fxKey?: number | string }) {
  return <span key={fxKey} className={`jr-flash jr-flash-${kind}`} aria-hidden="true" />;
}

/* ---------------- backdrops ---------------- */
export type BackdropKind = 'core' | 'polyglot' | 'stacks' | 'ai' | 'lair';
const SKY: Record<BackdropKind, [string, string, string]> = {
  core: ['#7fc8ff', '#d7f0ff', '#8fd06f'],
  polyglot: ['#8ad6c4', '#e0f6df', '#6fbf62'],
  stacks: ['#ffcf8a', '#fff0cf', '#e7cf8e'],
  ai: ['#9fb4ff', '#e4e8ff', '#b8acdc'],
  lair: ['#2b1c1c', '#4a2a22', '#3a2a28'],
};

/**
 * 300x150 battle stage backdrop (sky, distant hills, ground band). Scales to its container; keep preserveAspectRatio slice.
 * Region backdrops are bright; `lair` is the boss backdrop (ashen with ember glow).
 */
export function BattleBackdrop({ kind = 'core', className }: { kind?: BackdropKind; className?: string }) {
  const [top, mid, ground] = SKY[kind];
  const lair = kind === 'lair';
  return (
    <svg className={className ?? 'jr-backdrop'} viewBox="0 0 300 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <rect width="300" height="150" fill={top} />
      <rect y="40" width="300" height="60" fill={mid} opacity={lair ? 0.35 : 0.7} />
      {lair ? (
        <>
          <circle cx="232" cy="38" r="22" fill="#ff5a2a" opacity="0.35" />
          <circle cx="232" cy="38" r="12" fill="#ff8a3a" opacity="0.55" />
        </>
      ) : (
        <>
          <ellipse cx="60" cy="30" rx="30" ry="8" fill="#fff" opacity="0.85" />
          <ellipse cx="82" cy="26" rx="20" ry="7" fill="#fff" opacity="0.85" />
          <ellipse cx="238" cy="42" rx="26" ry="7" fill="#fff" opacity="0.7" />
        </>
      )}
      <path d="M0 96 Q40 62 84 90 Q120 66 170 92 Q220 60 300 94 V150 H0Z" fill={lair ? '#2e2220' : shade(ground, -0.18)} />
      <path d="M0 104 Q60 88 130 104 Q200 90 300 106 V150 H0Z" fill={ground} />
      <path d="M0 122 Q90 112 190 124 Q250 116 300 126 V150 H0Z" fill={lair ? '#241a1a' : shade(ground, -0.1)} />
      {!lair && <path d="M20 118 q4 -8 8 0 M60 130 q4 -8 8 0 M240 120 q4 -8 8 0" stroke={shade(ground, -0.35)} strokeWidth="1.4" fill="none" strokeLinecap="round" />}
      {lair && <path d="M30 120 l8 -4 M200 126 l10 -3 M120 134 l9 -4" stroke="#ff5a2a" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />}
    </svg>
  );
}

/** Knocked-out marker: closed-eye "x x" star ring above a hero. Place in the battle SVG near the hero's head. */
export function KoMarks({ x = 0, y = 0 }: { x?: number; y?: number }) {
  return (
    <g className="jr-ko" transform={`translate(${x} ${y})`} aria-hidden="true">
      {[-8, 0, 8].map((dx, i) => (
        <path key={i} d={`M${dx} -2 l2 4 l4 0.6 l-3 3 l0.8 4 l-3.8 -2 l-3.8 2 l0.8 -4 l-3 -3 l4 -0.6Z`} transform={`scale(0.5) translate(${dx * 1.2} 0)`} fill="#ffd34d" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
      ))}
    </g>
  );
}

/* ---------------- shield + heal effects (SVG, drop inside the battle SVG at the hero's centre) ---------------- */
const HEX = (r: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r * 0.9).toFixed(1)}`;
  }).join(' ');

/** Faint blue ring around the hero while a shield is equipped. Centre it on the hero (x, y). Gentle pulse via .jr-aura-ring. */
export function ShieldAura({ x = 0, y = 0, r = 26 }: { x?: number; y?: number; r?: number }) {
  return (
    <g transform={`translate(${x} ${y})`} aria-hidden="true">
      <g className="jr-aura-ring">
        <ellipse cx="0" cy="0" rx={r} ry={r * 0.92} fill="rgba(110,190,255,0.10)" stroke="#8fd0ff" strokeOpacity="0.75" strokeWidth="1.6" strokeDasharray="5 3" />
      </g>
    </g>
  );
}

/** Hex bubble flare and crack when the shield blocks a hit. Re-keyed by fxKey. Centre on the hero. */
export function ShieldDeflectFx({ fxKey, x = 0, y = 0, r = 28 }: { fxKey?: number | string; x?: number; y?: number; r?: number }) {
  const crack = `M${(r * 0.3).toFixed(1)} ${(-r * 0.8).toFixed(1)} L${(-r * 0.1).toFixed(1)} ${(-r * 0.2).toFixed(1)} L${(r * 0.25).toFixed(1)} ${(r * 0.1).toFixed(1)} L${(-r * 0.2).toFixed(1)} ${(r * 0.75).toFixed(1)}`;
  return (
    <g key={fxKey} transform={`translate(${x} ${y})`} aria-hidden="true">
      <g className="jr-deflect">
        <polygon points={HEX(r)} fill="rgba(168,216,255,0.35)" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <polygon points={HEX(r)} fill="none" stroke="#e8f6ff" strokeWidth="2" strokeLinejoin="round" />
        <polygon points={HEX(r * 0.6)} fill="none" stroke="#a8d8ff" strokeWidth="1.2" opacity="0.8" strokeLinejoin="round" />
      </g>
      <g className="jr-deflect-crack">
        <path d={crack} fill="none" stroke={INK} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d={crack} fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  );
}

const PLUS = 'M-1.6 -5 H1.6 V-1.6 H5 V1.6 H1.6 V5 H-1.6 V1.6 H-5 V-1.6 H-1.6Z';
const SPARKS: [number, number, number, number][] = [
  [-14, 6, 1, 0],
  [12, 8, 0.8, 120],
  [-4, -4, 1.2, 60],
  [16, -8, 0.7, 200],
  [-18, -10, 0.7, 260],
];
/** Green plus-sparkles that rise around the hero when a potion heals. Re-keyed by fxKey. Centre on the hero. */
export function HealSparkle({ fxKey, x = 0, y = 0 }: { fxKey?: number | string; x?: number; y?: number }) {
  return (
    <g key={fxKey} transform={`translate(${x} ${y})`} aria-hidden="true">
      {SPARKS.map(([dx, dy, k, d], i) => (
        <g key={i} transform={`translate(${dx} ${dy}) scale(${k})`}>
          <g className="jr-heal-spark" style={{ animationDelay: `${d}ms` }}>
            <path d={PLUS} fill="#7dffa8" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
          </g>
        </g>
      ))}
    </g>
  );
}
