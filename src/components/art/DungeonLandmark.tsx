import { GroundShadow, shade, EDGE, INK } from './util';

/** Approximate sprite height above the ground point. Add to LANDMARK_HEIGHT: dungeon: 92 */
export const DUNGEON_HEIGHT = 92;

/**
 * Dungeon entrance: a rocky hill with a carved stone gate, stairs descending into darkness, two braziers,
 * and a pair of faint red lamps in the doorway (the "null" eyes). `c` tints the gate keystone.
 * Drawn around the ground point (0,0). Flicker classes: .jr-flame (braziers).
 */
export function DungeonBody({ c }: { c: string }) {
  const rock = '#8c8478';
  return (
    <g className="jr-dungeon">
      <GroundShadow rx={60} ry={24} />
      {/* hill */}
      <path d="M-58 6 Q-52 -30 -22 -52 Q0 -64 22 -52 Q52 -30 58 6 Q0 30 -58 6Z" fill={rock} stroke={EDGE} strokeWidth="1" strokeLinejoin="round" />
      <path d="M-58 6 Q-52 -30 -22 -52 Q-18 -30 -26 -8 Q-40 4 -58 6Z" fill={shade(rock, 0.14)} />
      <path d="M58 6 Q52 -30 22 -52 Q18 -26 26 -6 Q40 6 58 6Z" fill={shade(rock, -0.28)} />
      {/* ridge rocks */}
      <path d="M-30 -48 L-22 -62 L-12 -50Z" fill={shade(rock, 0.1)} stroke={EDGE} strokeWidth="1" strokeLinejoin="round" />
      <path d="M14 -52 L24 -64 L32 -48Z" fill={shade(rock, -0.2)} stroke={EDGE} strokeWidth="1" strokeLinejoin="round" />
      {/* gate frame */}
      <path d="M-22 14 V-14 Q-22 -34 0 -34 Q22 -34 22 -14 V14Z" fill="#cfc7b6" stroke={EDGE} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M-22 14 V-14 Q-22 -34 0 -34 Q-8 -30 -12 -14 V14Z" fill="#e6dfd0" />
      <path d="M-14 14 V-12 Q-14 -26 0 -26 Q14 -26 14 -12 V14Z" fill="#14101c" stroke={EDGE} strokeWidth="1" />
      {/* descending steps */}
      <path d="M-14 14 H14 L11 10 H-11Z" fill="#a89f94" stroke={EDGE} strokeWidth="0.8" strokeLinejoin="round" />
      <path d="M-11 10 H11 L8 6 H-8Z" fill="#7d756a" />
      <path d="M-8 6 H8 L5 2 H-5Z" fill="#524b44" />
      {/* red lamps in the dark */}
      <circle cx="-5" cy="-10" r="2" fill="#ff3b30" />
      <circle cx="5" cy="-10" r="2" fill="#ff3b30" />
      <circle cx="-5" cy="-10" r="0.8" fill="#ffd0c8" />
      <circle cx="5" cy="-10" r="0.8" fill="#ffd0c8" />
      {/* keystone with braces glyph */}
      <rect x="-6" y="-38" width="12" height="9" rx="1.4" fill={c} stroke={EDGE} strokeWidth="1" />
      <path d="M-2 -36.4 q-2 0 -2 2 q0 1 -1 1 q1 0 1 1 q0 2 2 2 M2 -36.4 q2 0 2 2 q0 1 1 1 q-1 0 -1 1 q0 2 -2 2" fill="none" stroke={INK} strokeWidth="0.9" strokeLinecap="round" transform="translate(0 0.4)" />
      {/* braziers */}
      {[-34, 34].map((x) => (
        <g key={x} transform={`translate(${x} 10)`}>
          <path d="M-4 0 L-2 -10 H2 L4 0Z" fill="#4a4036" stroke={EDGE} strokeWidth="1" strokeLinejoin="round" />
          <path d="M-5 -10 H5 L3 -13 H-3Z" fill="#6a5f52" stroke={EDGE} strokeWidth="1" strokeLinejoin="round" />
          <g className="jr-flame">
            <path d="M0 -26 Q5 -20 4 -15 Q3 -12 0 -12 Q-3.4 -12 -4 -15 Q-5 -19 0 -26Z" fill="#ff6a2a" stroke="rgba(40,28,20,0.7)" strokeWidth="0.8" strokeLinejoin="round" />
            <path d="M0 -20 Q2.6 -17 2 -14 Q1 -12.6 0 -12.6 Q-1.4 -12.6 -2 -14 Q-2.4 -17 0 -20Z" fill="#ffc83d" />
          </g>
        </g>
      ))}
    </g>
  );
}
