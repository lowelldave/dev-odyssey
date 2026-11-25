import { EDGE } from './util';

/**
 * The hero knocked out: sprawled face-down on the ground, head to the RIGHT (towards the monster),
 * cape draped over the back, sword dropped beside him, swirly X eyes.
 * Drawn around ground point (0,0), body resting on y = 0.
 * Local box: x -23..23, y -15..3. Head centre (16,-7).
 */
export function HeroDefeated({ x = 0, y = 0 }: { x?: number; y?: number }) {
  return (
    <g transform={`translate(${x}, ${y})`} className="hero-ko" aria-label="Defeated">
      {/* flat ground shadow */}
      <ellipse cx="0" cy="1.5" rx="23" ry="3.4" fill="rgba(0,0,0,0.26)" />
      <ellipse cx="0" cy="1.5" rx="13" ry="1.8" fill="rgba(0,0,0,0.2)" />
      {/* dust puff (fades out, motion only) */}
      <g className="jr-ko-dust" fill="#e8dcc4">
        <circle cx="-24" cy="-2" r="2.2" opacity="0.7" />
        <circle cx="-21" cy="-5" r="1.6" opacity="0.55" />
        <circle cx="24" cy="-1.5" r="1.6" opacity="0.5" />
      </g>
      {/* fallen sword, lying in front of the body */}
      <line x1="-4" y1="2" x2="20" y2="2.2" stroke="#e6eef8" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="-3" y1="1.6" x2="19" y2="1.8" stroke="#fff" strokeWidth="0.7" strokeLinecap="round" opacity="0.8" />
      <line x1="-5" y1="-0.6" x2="-5" y2="4.2" stroke="#e8b33d" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="-8.2" cy="2" r="1.5" fill="#7fd8ff" stroke={EDGE} strokeWidth="0.4" />

      <g className="jr-ko-breathe">
        {/* boots and legs */}
        <rect x="-16" y="-7" width="11" height="6" rx="2" fill="#3a2f4a" />
        <rect x="-23" y="-6.5" width="8" height="5.5" rx="2" fill="#5a3a22" stroke={EDGE} strokeWidth="0.5" />
        {/* tunic torso */}
        <rect x="-8" y="-12" width="17" height="11" rx="3.5" fill="#2f5fc4" />
        <path d="M0,-12 h6.5 a3.5,3.5 0 0 1 2.5,3.5 v7.5 h-9z" fill="#244a9c" />
        <rect x="-5" y="-12" width="3.4" height="11" fill="#e8b33d" />
        <rect x="-4.4" y="-7.4" width="2.2" height="2.2" rx="0.6" fill="#ffe27a" stroke={EDGE} strokeWidth="0.4" />
        {/* arm reaching forward + hand */}
        <rect x="6" y="-5" width="11" height="4.2" rx="2" fill="#4a7ae0" stroke={EDGE} strokeWidth="0.4" />
        <circle cx="18.5" cy="-2.8" r="2.1" fill="#ffd2a6" />
        {/* cape draped over the back and legs */}
        <path d="M-19,-1 Q-17,-9 -10,-12.5 Q-2,-15 7,-11.5 Q9,-8 7,-1 Z" fill="#c8332f" />
        <path d="M-19,-1 Q-17,-6 -13,-8 Q-12,-4 -9,-1 Z" fill="#a22822" />
        <path d="M-6,-13.4 Q-1,-14.4 4,-12.6" stroke="rgba(255,255,255,0.35)" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M-2,-12 Q0,-6 -1,-1 M3,-11.5 Q4.5,-6 3.5,-1" stroke="#8a1f1a" strokeWidth="0.8" fill="none" />
        {/* head, turned to the viewer, face towards the monster */}
        <circle cx="16" cy="-7" r="7.4" fill="#ffd2a6" />
        <path d="M8.6,-8 Q8,-14.6 15,-14.6 Q23.5,-14 23,-8 Q20,-11.6 16,-10.8 Q11,-10.6 8.6,-8Z" fill="#7a3e1d" />
        <path d="M9.4,-11.5 Q12,-14 16,-13.8" stroke="#a15a2c" strokeWidth="1" fill="none" />
        <ellipse cx="12" cy="-3.6" rx="1.8" ry="1" fill="#ff9a8a" opacity="0.55" />
        <ellipse cx="21" cy="-3.6" rx="1.8" ry="1" fill="#ff9a8a" opacity="0.55" />
        {/* X eyes + small wobbly mouth */}
        <path d="M12.3,-8.4 l3,3 M15.3,-8.4 l-3,3 M17.7,-8.4 l3,3 M20.7,-8.4 l-3,3" stroke="#1c1c2e" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M14.6,-2.6 q1.4,-1 2.8,0" stroke="#a24a2a" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      </g>
      {/* dizzy stars above the head */}
      <g className="jr-ko-stars" fill="#ffd34d">
        <path d="M13,-19 l1,2.2 2.3,.3 -1.7,1.5 .5,2.3 -2.1,-1.2 -2.1,1.2 .5,-2.3 -1.7,-1.5 2.3,-.3z" transform="translate(0 0) scale(0.7)" />
        <circle cx="21" cy="-18" r="1.2" />
        <circle cx="8" cy="-17.5" r="1" />
      </g>
    </g>
  );
}

/** Standalone wrapper for the defeat modal. */
export function HeroDefeatedArt({ size = 120 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * (28 / 56)}
      viewBox="-28 -24 56 28"
      role="img"
      aria-label="The hero lies defeated"
      style={{ overflow: 'visible' }}
    >
      <HeroDefeated x={0} y={0} />
    </svg>
  );
}
