import { Svg, GroundShadow, INK } from './util';

export interface CampfireProps {
  /** lit fire; unlit shows embers only (no tokens left / empty state) */
  lit?: boolean;
}

/** Campfire around ground point (0,0): ring of stones, crossed logs, two-layer flame. About 34px tall. Flicker is CSS (.jr-flame). */
export function CampfireBody({ lit = true }: CampfireProps) {
  return (
    <g className={`jr-campfire${lit ? '' : ' is-out'}`}>
      <GroundShadow rx={17} ry={7} />
      {[-14, -8, 0, 8, 14].map((x, i) => (
        <ellipse key={i} cx={x} cy={Math.abs(x) > 10 ? 1 : 4.4} rx="4.2" ry="2.6" fill={i % 2 ? '#a89f94' : '#c4bcb0'} stroke="rgba(40,28,20,0.6)" strokeWidth="1" />
      ))}
      <path d="M-11 1 L10 -3" stroke={INK} strokeWidth="5.6" strokeLinecap="round" />
      <path d="M-11 1 L10 -3" stroke="#7a4a22" strokeWidth="3.6" strokeLinecap="round" />
      <path d="M-10 -3 L11 1" stroke={INK} strokeWidth="5.6" strokeLinecap="round" />
      <path d="M-10 -3 L11 1" stroke="#9a6430" strokeWidth="3.6" strokeLinecap="round" />
      {lit ? (
        <g className="jr-flame">
          <path d="M0 -34 Q11 -20 9 -9 Q7.6 -2 0 -2 Q-8 -2 -9 -9 Q-10.6 -17 -4 -23 Q-4 -17 0 -15 Q-3 -26 0 -34Z" fill="#ff6a2a" stroke="rgba(40,28,20,0.7)" strokeWidth="1" strokeLinejoin="round" />
          <path d="M0 -22 Q6.6 -14 5.4 -8 Q4.4 -3.4 0 -3.4 Q-4.6 -3.4 -5.2 -8 Q-5.8 -14 0 -22Z" fill="#ffc83d" />
          <path d="M0 -12 Q2.6 -8 2 -5.4 Q1 -3.8 0 -3.8 Q-1.4 -3.8 -2 -5.4 Q-2.4 -8 0 -12Z" fill="#fff3b0" />
        </g>
      ) : (
        <>
          <ellipse cx="0" cy="-3" rx="6" ry="2.2" fill="#3a2a28" />
          <circle cx="-2" cy="-3.6" r="1.1" fill="#ff5a2a" />
          <circle cx="2.4" cy="-3" r="0.9" fill="#ff8a3a" />
        </>
      )}
    </g>
  );
}
export const CAMPFIRE_HEIGHT = 36;

/** Standalone campfire for the Campfire window / dialogue. Add class `jr-flicker` on a parent to animate. */
export function Campfire({ lit = true, size = 64, className, title }: CampfireProps & { size?: number; className?: string; title?: string }) {
  return (
    <Svg w={size} h={Math.round(size * 0.8)} vb="-24 -38 48 44" className={className ?? 'jr-campfire-svg'} title={title}>
      <CampfireBody lit={lit} />
    </Svg>
  );
}
