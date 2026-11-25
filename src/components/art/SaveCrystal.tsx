import { Svg, GroundShadow, Box, facesOf, EDGE, INK } from './util';

export interface SaveCrystalProps {
  /** a backup is overdue: warmer, pulsing glow */
  due?: boolean;
}

/** Save crystal on a small stone plinth, drawn around ground point (0,0). About 46px tall. Place on purified areas only. */
export function SaveCrystalBody({ due = false }: SaveCrystalProps) {
  const core = due ? '#ffb347' : '#5fd0f0';
  const hi = due ? '#ffe3a8' : '#c8f4ff';
  const lo = due ? '#c4631a' : '#2a8fb0';
  return (
    <g className={`jr-crystal${due ? ' is-due' : ''}`}>
      <GroundShadow rx={15} ry={6} />
      <Box cx={0} cy={0} a={12} h={6} c={facesOf('#bdb4a6')} />
      <ellipse className="jr-crystal-glow" cx="0" cy="-30" rx="14" ry="18" fill={due ? 'rgba(255,190,90,0.35)' : 'rgba(110,220,255,0.28)'} />
      <g className="jr-crystal-gem">
        <polygon points="0,-48 9,-34 0,-12 -9,-34" fill={core} stroke={EDGE} strokeWidth="1" strokeLinejoin="round" />
        <polygon points="0,-48 -9,-34 0,-30" fill={hi} />
        <polygon points="0,-48 9,-34 0,-30" fill={core} />
        <polygon points="-9,-34 0,-30 0,-12" fill={shade2(core)} />
        <polygon points="9,-34 0,-30 0,-12" fill={lo} />
        <polygon points="0,-48 9,-34 0,-12 -9,-34" fill="none" stroke={INK} strokeOpacity="0.45" strokeWidth="1" strokeLinejoin="round" />
      </g>
    </g>
  );
}
const shade2 = (c: string) => (c === '#ffb347' ? '#ffd48a' : '#8fe3fa');

/** Height above the ground point, for marker placement. */
export const SAVE_CRYSTAL_HEIGHT = 50;

/** Standalone, e.g. in the Save dialog header. */
export function SaveCrystal({ due = false, size = 56, className, title }: SaveCrystalProps & { size?: number; className?: string; title?: string }) {
  return (
    <Svg w={size} h={size} vb="-22 -54 44 62" className={className ?? 'jr-crystal-svg'} title={title}>
      <SaveCrystalBody due={due} />
    </Svg>
  );
}
