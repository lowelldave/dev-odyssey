import { Box, Pyramid, GroundShadow, facesOf, shade, EDGE, INK } from './util';

/** Approximate sprite height above the ground point. Add to LANDMARK_HEIGHT: town: 104 */
export const TOWN_HEIGHT = 104;

/**
 * Walled market town: a low curtain wall with a gate tower, a clock keep, two houses and a market awning.
 * Drawn around the ground point (0,0) on a GroundTile like the other landmarks. `c` is the area accent (roof/banner colour).
 */
export function TownBody({ c }: { c: string }) {
  const stone = facesOf('#d9d2c4');
  const plaster = facesOf('#fbefd5');
  const wall = facesOf('#c9c1b2');
  return (
    <g className="jr-town">
      <GroundShadow rx={64} ry={26} />
      {/* back wall segments */}
      <Box cx={-34} cy={-16} a={22} h={14} c={wall} />
      <Box cx={34} cy={-16} a={22} h={14} c={wall} />
      {/* clock keep, centre back */}
      <Box cx={0} cy={-18} a={16} h={46} c={stone} />
      <Pyramid cx={0} cy={-18} a={18} h={46} ph={22} color={c} />
      <circle cx="-8" cy="-48" r="5.4" fill="#fff7e6" stroke={EDGE} strokeWidth="1" />
      <path d="M-8 -48 V-51 M-8 -48 H-5.6" stroke={INK} strokeWidth="1.1" strokeLinecap="round" />
      {/* houses */}
      <Box cx={-36} cy={6} a={18} h={20} c={plaster} />
      <Pyramid cx={-36} cy={6} a={21} h={20} ph={16} color="#c0482c" />
      <polygon points="-46,10 -46,0 -41,-2 -41,8" fill="#ffd36b" stroke={EDGE} strokeWidth="0.9" />
      <Box cx={36} cy={8} a={16} h={16} c={plaster} />
      <Pyramid cx={36} cy={8} a={19} h={16} ph={14} color={shade(c, -0.1)} />
      <polygon points="28,12 28,3 32,1 32,10" fill="#ffd36b" stroke={EDGE} strokeWidth="0.9" />
      {/* gate tower front */}
      <Box cx={0} cy={22} a={14} h={26} c={stone} />
      <polygon points="-3,22 -3,8 3,4 3,18" fill="none" />
      <polygon points="-8,26 -8,12 0,8 0,22" fill="#3a2a22" stroke={EDGE} strokeWidth="1" />
      {[-12, -4, 4, 12].map((x) => (
        <rect key={x} x={x - 2} y={-16 + 0} width="4" height="4" fill={shade('#d9d2c4', -0.1)} stroke={EDGE} strokeWidth="0.8" transform="translate(0 8)" />
      ))}
      {/* banner on gate */}
      <path d="M11 0 V-20" stroke={INK} strokeWidth="1.4" />
      <path d="M11 -20 L22 -17 L11 -13Z" fill={c} stroke={EDGE} strokeWidth="1" strokeLinejoin="round" />
      {/* market awning */}
      <polygon points="14,34 30,42 38,38 22,30" fill="#f4f0e6" stroke={EDGE} strokeWidth="1" strokeLinejoin="round" />
      <path d="M17 32 L33 40 M21 30.4 L37 38.4" stroke="#d9452a" strokeWidth="2.2" />
    </g>
  );
}
