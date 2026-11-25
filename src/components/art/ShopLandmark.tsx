import { Svg, GroundShadow, Box, facesOf, shade, EDGE, INK } from './util';

/** Height above the ground point, for marker/label placement (matches ~SaveCrystal scale). */
export const SHOP_HEIGHT = 58;

/**
 * Merchant stall drawn around ground point (0,0), about 66 wide and 58 tall. Origin = centre of the ground footprint.
 * Wooden counter, striped red/cream awning on two posts, flask crate on the left, hanging gold sign on the right.
 * Wrap in <g className="shop-node" ...> for the hover/focus glow.
 */
export function ShopLandmarkBody() {
  const wood = '#a8662f';
  const stripe = ['#d9452a', '#fff3d6'];
  // awning: a slanted roof of 4 stripes from back (high) to front (low), iso-parallelogram bands
  const bands = [0, 1, 2, 3].map((i) => {
    const x0 = -18 + i * 9, x1 = x0 + 9;
    const yTop = (x: number) => -50 + (x + 18) * 0.5 * 0.5; // follows the iso edge slope
    const pts = `${x0},${yTop(x0) - 6} ${x1},${yTop(x1) - 6} ${x1},${yTop(x1) + 6} ${x0},${yTop(x0) + 6}`;
    return <polygon key={i} points={pts} fill={i % 2 ? shade(stripe[1], -0.06) : stripe[0]} stroke={EDGE} strokeWidth="1" strokeLinejoin="round" />;
  });
  return (
    <g className="jr-shop">
      <GroundShadow rx={26} ry={10} />
      {/* counter */}
      <Box cx={2} cy={2} a={16} h={12} c={facesOf(wood)} />
      {/* back posts */}
      <path d="M-16 -4 L-16 -42" stroke={INK} strokeWidth="3.6" strokeLinecap="round" />
      <path d="M-16 -4 L-16 -42" stroke="#7a4a22" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 8 L18 -34" stroke={INK} strokeWidth="3.6" strokeLinecap="round" />
      <path d="M18 8 L18 -34" stroke="#5e3a1a" strokeWidth="2" strokeLinecap="round" />
      {/* goods on the counter */}
      <circle cx="-4" cy="-16" r="3.4" fill="#ef4a6a" stroke={INK} strokeWidth="0.9" />
      <rect x="-5.4" y="-22" width="2.8" height="3" fill="#b8742a" stroke={INK} strokeWidth="0.7" />
      <circle cx="4" cy="-14" r="3" fill="#4aa8ff" stroke={INK} strokeWidth="0.9" />
      <rect x="2.8" y="-19.4" width="2.4" height="2.8" fill="#b8742a" stroke={INK} strokeWidth="0.7" />
      {/* flask crate (left foreground) */}
      <Box cx={-22} cy={8} a={7} h={6} c={facesOf('#c08a4a')} />
      <circle cx="-23" cy="-3" r="2.2" fill="#6fe08c" stroke={INK} strokeWidth="0.8" />
      <circle cx="-19" cy="-2" r="2" fill="#ef4a6a" stroke={INK} strokeWidth="0.8" />
      {/* awning */}
      <g className="jr-shop-awning">{bands}</g>
      {/* hanging coin sign */}
      <g className="jr-shop-sign">
        <path d="M18 -34 H30" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M27 -34 V-30" stroke={INK} strokeWidth="1" />
        <circle cx="27" cy="-25" r="5.4" fill="#ffd34d" stroke={INK} strokeWidth="1.1" />
        <circle cx="27" cy="-25" r="3.6" fill="none" stroke="#a8671a" strokeWidth="0.8" />
        <path d="M28.6 -26.6 Q27.8 -27.6 26.8 -27.6 Q25 -27.6 25 -25 Q25 -22.6 26.8 -22.6 Q28.4 -22.6 28.4 -24.6 H26.8" fill="none" stroke="#7a4a12" strokeWidth="1" strokeLinecap="round" />
      </g>
    </g>
  );
}

/** Standalone preview/dialog use. */
export function ShopLandmark({ size = 72, className, title }: { size?: number; className?: string; title?: string }) {
  return (
    <Svg w={size} h={Math.round(size * 1.12)} vb="-34 -62 68 76" className={className ?? 'jr-shop-svg'} title={title}>
      <ShopLandmarkBody />
    </Svg>
  );
}
