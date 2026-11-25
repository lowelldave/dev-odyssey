import { Svg, Box, GroundShadow, facesOf, shade, INK, EDGE } from './util';

export type ChestState = 'closed' | 'open' | 'spent';

/** Chest drawn around ground point (0,0): a small iso box with a gold band; open shows the lid up and a glow. */
export function ChestBody({ state = 'closed' }: { state?: ChestState }) {
  const wood = '#a8662f';
  const f = facesOf(wood);
  const open = state !== 'closed';
  const spent = state === 'spent';
  const gold = spent ? '#9a8f78' : '#ffd34d';
  return (
    <g className={`jr-chest is-${state}`}>
      <GroundShadow rx={13} ry={5} />
      <Box cx={0} cy={0} a={11} h={8} c={f} />
      {/* iron/gold bands on both faces */}
      <path d="M-4 5.5 L-4 -2.5" stroke={gold} strokeWidth="2" />
      <path d="M5 2 L5 -6.4" stroke={shade(gold, -0.25)} strokeWidth="2" />
      {open ? (
        <>
          {/* dark interior + glowing loot, lid tipped back */}
          <polygon points="0,-13 11,-8 0,-3 -11,-8" fill={spent ? '#2a1c14' : '#3a2410'} stroke={EDGE} strokeWidth="1" />
          {!spent && <ellipse className="jr-chest-glow" cx="0" cy="-9" rx="7" ry="3.2" fill="#ffe27a" />}
          <polygon points="-11,-8 0,-13 0,-20 -11,-15" fill={shade(wood, 0.1)} stroke={EDGE} strokeWidth="1" strokeLinejoin="round" />
          <polygon points="0,-13 11,-8 11,-15 0,-20" fill={shade(wood, -0.3)} stroke={EDGE} strokeWidth="1" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <polygon points="-11,-8 0,-3 0,-9 -11,-14" fill={shade(wood, 0.22)} stroke={EDGE} strokeWidth="1" strokeLinejoin="round" />
          <polygon points="0,-3 11,-8 11,-14 0,-9" fill={shade(wood, -0.2)} stroke={EDGE} strokeWidth="1" strokeLinejoin="round" />
          <polygon points="0,-14.5 11,-14 0,-9 -11,-14" fill={shade(wood, 0.35)} stroke={EDGE} strokeWidth="1" strokeLinejoin="round" />
          <rect x="-2" y="-8" width="4" height="4.4" rx="0.8" fill="#ffd34d" stroke={INK} strokeWidth="0.9" />
        </>
      )}
    </g>
  );
}

export interface ChestProps {
  state?: ChestState;
  /** 'sm' ~32px for lists, 'lg' ~72px for the victory screen */
  scale?: 'sm' | 'lg';
  className?: string;
  title?: string;
}
/** Standalone chest. `state="closed"` gently bobs via .jr-chest-closed when the container has class `jr-chest-bob`. */
export function Chest({ state = 'closed', scale = 'sm', className, title }: ChestProps) {
  const k = scale === 'lg' ? 2.6 : 1.3;
  const w = Math.round(32 * k), h = Math.round(34 * k);
  return (
    <Svg w={w} h={h} vb="-16 -26 32 34" className={className ?? 'jr-chest-svg'} title={title}>
      <ChestBody state={state} />
    </Svg>
  );
}

/** Map sprite: a chest next to an area's landmark. Wrap in <g transform="translate(x y)">. Hover/focus handled by the caller. */
export const ChestSprite = ChestBody;
