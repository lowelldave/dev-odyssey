import { Svg, INK, shade } from './util';

export type PortraitWho = 'sage' | 'hero' | 'innkeeper' | 'campfire' | 'crystal';
export interface PortraitProps {
  who: PortraitWho;
  /** px; 48 default, 32 for the mini hint portrait, 64+ for dialogue */
  size?: number;
  /** hero only: knocked-out look (closed eyes, washed-out tones) */
  ko?: boolean;
  className?: string;
  title?: string;
}

const FRAME: Record<PortraitWho, string> = { sage: '#2f5aa8', hero: '#a8321f', innkeeper: '#b8742a', campfire: '#c2511a', crystal: '#2a8fb0' };

function Face({ who, ko }: { who: PortraitWho; ko: boolean }) {
  const skin = '#f0c79a';
  const eye = (x: number, y: number) =>
    ko ? (
      <path d={`M${x - 2} ${y} L${x + 2} ${y}`} stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
    ) : (
      <rect x={x - 1} y={y - 1.5} width="2.2" height="3" rx="0.8" fill={INK} />
    );
  switch (who) {
    case 'sage':
      return (
        <g>
          <path d="M6 48 L8 34 Q24 26 40 34 L42 48 Z" fill="#3b6fb6" stroke={INK} strokeWidth="1.2" />
          <path d="M10 22 Q10 6 24 6 Q38 6 38 22 L38 36 Q24 30 10 36 Z" fill="#2f5aa8" stroke={INK} strokeWidth="1.2" />
          <ellipse cx="24" cy="22" rx="9" ry="10" fill={skin} stroke={INK} strokeWidth="1.2" />
          <path d="M15 26 Q24 46 33 26 Q24 30 15 26 Z" fill="#f4f0e6" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M14 16 Q24 10 34 16 Q24 14 14 16 Z" fill="#f4f0e6" stroke={INK} strokeWidth="1" />
          {eye(20, 21)}
          {eye(28, 21)}
          <path d="M20 8 L22 11 L26 11 L28 8" fill="none" stroke="#ffd34d" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    case 'hero':
      return (
        <g opacity={ko ? 0.8 : 1}>
          <path d="M8 48 L10 36 Q24 30 38 36 L40 48 Z" fill={ko ? '#7a6a6a' : '#d9452a'} stroke={INK} strokeWidth="1.2" />
          <path d="M16 36 Q24 42 32 36 L30 40 Q24 44 18 40 Z" fill="#ffd34d" stroke={INK} strokeWidth="1" />
          <ellipse cx="24" cy="22" rx="9.5" ry="10.5" fill={ko ? '#d8c4b0' : skin} stroke={INK} strokeWidth="1.2" />
          <path d="M13 22 Q12 8 24 8 Q36 8 35 22 Q33 14 24 14 Q15 14 13 22 Z" fill="#6b3d1f" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M26 8 L33 4 L31 11 Z" fill="#6b3d1f" stroke={INK} strokeWidth="1" strokeLinejoin="round" />
          {eye(20, 23)}
          {eye(28, 23)}
          <path d={ko ? 'M21 30 Q24 28 27 30' : 'M21 29 Q24 31.5 27 29'} fill="none" stroke={INK} strokeWidth="1.2" strokeLinecap="round" />
        </g>
      );
    case 'innkeeper':
      return (
        <g>
          <path d="M6 48 L8 36 Q24 30 40 36 L42 48 Z" fill="#e8dcc0" stroke={INK} strokeWidth="1.2" />
          <path d="M14 48 L16 38 L32 38 L34 48 Z" fill="#b8742a" stroke={INK} strokeWidth="1" />
          <ellipse cx="24" cy="23" rx="11" ry="11" fill="#f2c9a0" stroke={INK} strokeWidth="1.2" />
          <path d="M12 14 Q24 2 36 14 L35 17 Q24 11 13 17 Z" fill="#f7f1e0" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
          <circle cx="19.5" cy="26" r="3.2" fill="#e58d78" opacity="0.55" />
          <circle cx="28.5" cy="26" r="3.2" fill="#e58d78" opacity="0.55" />
          {eye(19.5, 22)}
          {eye(28.5, 22)}
          <path d="M17 28 Q24 25 31 28 Q24 33 17 28 Z" fill="#8a4a1c" stroke={INK} strokeWidth="1" strokeLinejoin="round" />
        </g>
      );
    case 'campfire':
      return (
        <g>
          <path d="M8 42 L40 36" stroke="#6b4423" strokeWidth="5" strokeLinecap="round" />
          <path d="M8 36 L40 42" stroke="#8a5a2c" strokeWidth="5" strokeLinecap="round" />
          <path d="M24 6 Q36 18 33 30 Q31 38 24 38 Q16 38 15 30 Q13 22 20 16 Q20 22 24 24 Q22 14 24 6 Z" fill="#ff6a2a" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M24 20 Q31 28 29 33 Q27 37 24 37 Q20 37 19 33 Q18 28 24 20 Z" fill="#ffc83d" />
          <path d="M24 29 Q27 32 26 35 Q25 37 24 37 Q22 37 22 35 Q21 32 24 29 Z" fill="#fff3b0" />
        </g>
      );
    case 'crystal':
      return (
        <g>
          <path d="M24 4 L36 18 L30 42 L18 42 L12 18 Z" fill="#5fd0f0" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M24 4 L18 18 L18 42 L12 18 Z" fill="#a8ecff" stroke={INK} strokeWidth="1" strokeLinejoin="round" />
          <path d="M24 4 L36 18 L24 22 L18 18 Z" fill="#d6f6ff" stroke={INK} strokeWidth="1" strokeLinejoin="round" />
          <path d="M30 42 L36 18 L24 22 L24 42 Z" fill="#2a8fb0" stroke={INK} strokeWidth="1" strokeLinejoin="round" />
          <path d="M10 46 L38 46" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        </g>
      );
  }
}

/** Framed bust. The mini (32px) hint portrait is the same art scaled. Frame colour identifies the speaker. */
export function Portrait({ who, size = 48, ko = false, className, title }: PortraitProps) {
  const fc = FRAME[who];
  const id = `jr-pclip-${who}`;
  const bg = who === 'campfire' ? '#3a2a38' : who === 'crystal' ? '#1d3a66' : shade(fc, 0.55);
  return (
    <Svg w={size} h={size} vb="0 0 56 56" className={className ?? 'jr-portrait'} title={title}>
      <defs>
        <clipPath id={id}>
          <rect x="4" y="4" width="48" height="48" rx="3" />
        </clipPath>
      </defs>
      <rect x="1" y="1" width="54" height="54" rx="5" fill={INK} />
      <rect x="3" y="3" width="50" height="50" rx="4" fill={fc} />
      <rect x="4" y="4" width="48" height="48" rx="3" fill={bg} />
      <g clipPath={`url(#${id})`} transform="translate(4 4)">
        <Face who={who} ko={ko} />
      </g>
      <rect x="4" y="4" width="48" height="48" rx="3" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
    </Svg>
  );
}
