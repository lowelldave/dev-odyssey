import { Svg, INK, EDGE, shade, Box, Pyramid, GroundShadow, facesOf } from './util';

/** Hanging Inn sign (a bracket, two chains and a board with a bed-and-moon glyph). Drawn around its bracket point (0,0). */
export function InnSignBody({ w = 30 }: { w?: number }) {
  const h = w * 0.62;
  return (
    <g className="jr-inn-sign">
      <path d={`M${-w / 2 - 4} 0 H${w / 2 + 2}`} stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
      <path d={`M${-w / 2 + 4} 0 V4 M${w / 2 - 4} 0 V4`} stroke={INK} strokeWidth="1.2" />
      <g className="jr-inn-swing">
        <rect x={-w / 2} y="4" width={w} height={h} rx="2" fill="#f1c14a" stroke={INK} strokeWidth="1.3" />
        <rect x={-w / 2 + 2} y="6" width={w - 4} height={h - 4} rx="1" fill="none" stroke="#a8671a" strokeWidth="0.9" />
        {/* crescent moon + bed */}
        <path d={`M${-w * 0.18} ${4 + h * 0.34} a3.4 3.4 0 1 1 3 -3.2 a2.6 2.6 0 1 0 -3 3.2Z`} fill="#fff3b0" stroke={INK} strokeWidth="0.7" />
        <rect x={-w * 0.3} y={4 + h * 0.62} width={w * 0.6} height="2.4" fill="#c0482c" stroke={INK} strokeWidth="0.8" />
        <rect x={-w * 0.3} y={4 + h * 0.5} width={w * 0.16} height="4.4" fill="#f4f0e6" stroke={INK} strokeWidth="0.7" />
      </g>
    </g>
  );
}

/** Quest-board note art: a tiny inn with its sign on warm paper. 56x40. */
export function InnNoteArt({ size = 56, className, title }: { size?: number; className?: string; title?: string }) {
  return (
    <Svg w={size} h={Math.round(size * 0.72)} vb="-30 -34 60 46" className={className ?? 'jr-inn-note-art'} title={title}>
      <g transform="translate(0 6)">
        <GroundShadow rx={22} ry={6} />
        <Box cx={0} cy={0} a={16} h={14} c={facesOf('#f1d9a8')} />
        <Pyramid cx={0} cy={0} a={18} h={14} ph={14} color="#c0482c" />
        <path d="M-8 0 L-8 -8 L-4 -10 L-4 -2Z" fill="#7a4a22" stroke={EDGE} strokeWidth="0.8" />
        <rect x="3" y="-9" width="4" height="4" fill="#ffd36b" stroke={EDGE} strokeWidth="0.8" />
      </g>
      <g transform="translate(18 -24) scale(0.55)">
        <InnSignBody w={30} />
      </g>
    </Svg>
  );
}

/** Victory-prompt illustration: the inn at dusk with lit windows, a lantern and a road. 120x84. */
export function InnScene({ className, title }: { className?: string; title?: string }) {
  return (
    <Svg w={120} h={84} vb="0 0 120 84" className={className ?? 'jr-inn-scene'} title={title}>
      <rect width="120" height="84" rx="6" fill="#2a3a7a" />
      <rect y="40" width="120" height="44" rx="0" fill="#3f6f3a" />
      <path d="M0 70 Q60 52 120 70 V84 H0Z" fill="#c9a96a" />
      <circle cx="98" cy="16" r="8" fill="#fff3b0" />
      <circle cx="102" cy="14" r="7" fill="#2a3a7a" />
      {[[14, 10], [30, 24], [52, 8], [78, 18], [110, 36]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1" fill="#fff" opacity="0.8" />
      ))}
      <g transform="translate(52 62)">
        <GroundShadow rx={34} ry={9} />
        <Box cx={0} cy={0} a={26} h={26} c={facesOf('#f1d9a8')} />
        <Pyramid cx={0} cy={0} a={30} h={26} ph={22} color="#c0482c" />
        <polygon points="-14,-2 -14,-14 -6,-18 -6,-6" fill="#ffd36b" stroke={EDGE} strokeWidth="1" />
        <polygon points="8,-8 8,-18 16,-14 16,-4" fill="#ffd36b" stroke={EDGE} strokeWidth="1" />
        <polygon points="-1,1 -1,-9 3,-7 3,3" fill="#7a4a22" stroke={EDGE} strokeWidth="0.8" />
      </g>
      <g transform="translate(30 38)"><InnSignBody w={26} /></g>
      <g transform="translate(18 66)">
        <path d="M0 0 V-14" stroke={INK} strokeWidth="2" />
        <circle cx="0" cy="-16" r="4" fill="#ffd34d" stroke={INK} strokeWidth="1" />
        <circle cx="0" cy="-16" r="8" fill="rgba(255,211,77,0.25)" />
      </g>
      <rect x="0.5" y="0.5" width="119" height="83" rx="5.5" fill="none" stroke={shade('#2a3a7a', -0.5)} />
    </Svg>
  );
}
