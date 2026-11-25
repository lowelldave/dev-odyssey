import type { ReactNode } from 'react';
import { Svg, INK } from './util';

export interface IconProps {
  size?: number;
  className?: string;
  title?: string;
}
const I = (p: IconProps, children: ReactNode) => (
  <Svg w={p.size ?? 20} h={p.size ?? 20} vb="0 0 20 20" className={p.className ?? 'jr-icon'} title={p.title}>
    {children}
  </Svg>
);
const S = { stroke: INK, strokeWidth: 1.2, strokeLinejoin: 'round' as const };

/** Campfire rest token: a coin stamped with a flame. */
export const RestTokenIcon = (p: IconProps) =>
  I(
    p,
    <>
      <circle cx="10" cy="10" r="8" fill="#e8a71c" {...S} />
      <circle cx="10" cy="10" r="5.6" fill="#ffd34d" stroke="#a8671a" strokeWidth="0.8" />
      <path d="M10 4.8 Q14 9 12.4 12.2 Q11.4 14.2 10 14.2 Q8.4 14.2 7.8 12.4 Q7.2 10 9 8.4 Q9 10.2 10.2 10.6 Q9.4 7.6 10 4.8Z" fill="#ff5a2a" {...S} strokeWidth={0.8} />
    </>,
  );

/** Tome: a recap book with a gold clasp. `locked` greys it out. */
export const TomeIcon = (p: IconProps & { locked?: boolean }) =>
  I(
    p,
    <>
      <path d="M3 3.5 L15 3.5 L17 5 L17 17 L5 17 L3 15.5 Z" fill={p.locked ? '#7c7468' : '#2f6f9f'} {...S} />
      <path d="M3 3.5 L5 5 L17 5 M5 5 L5 17" fill="none" stroke={INK} strokeWidth="1" />
      <rect x="7.5" y="7" width="7" height="3.4" rx="0.8" fill="#f6ecd0" stroke={INK} strokeWidth="0.8" />
      <rect x="14.6" y="9.4" width="2.4" height="3.4" fill="#ffd34d" stroke={INK} strokeWidth="0.8" />
    </>,
  );

export const HeartIcon = (p: IconProps & { empty?: boolean }) =>
  I(p, <path d="M10 17 Q2 11.5 2.6 6.8 Q3.4 3 6.6 3 Q9 3 10 5.4 Q11 3 13.4 3 Q16.6 3 17.4 6.8 Q18 11.5 10 17Z" fill={p.empty ? 'rgba(0,0,0,0.25)' : '#ef4a4a'} {...S} />);

export const MpCrystalIcon = (p: IconProps) =>
  I(
    p,
    <>
      <path d="M10 2 L16 8 L10 18 L4 8 Z" fill="#4aa8ff" {...S} />
      <path d="M10 2 L4 8 L10 8 Z" fill="#a8d8ff" stroke={INK} strokeWidth="0.8" strokeLinejoin="round" />
      <path d="M10 8 L16 8 L10 18 Z" fill="#2a64c4" stroke={INK} strokeWidth="0.8" strokeLinejoin="round" />
    </>,
  );

export const LockIcon = (p: IconProps) =>
  I(
    p,
    <>
      <path d="M6 9 V6.4 Q6 3 10 3 Q14 3 14 6.4 V9" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M6 9 V6.4 Q6 3 10 3 Q14 3 14 6.4 V9" fill="none" stroke="#c8ccd8" strokeWidth="1.2" strokeLinecap="round" />
      <rect x="4" y="9" width="12" height="8" rx="1.6" fill="#8a8ea0" {...S} />
      <circle cx="10" cy="12.6" r="1.3" fill={INK} />
    </>,
  );

/** Badge slot: dashed empty medallion, or a gold star medallion when earned. */
export const BadgeSlotIcon = (p: IconProps & { earned?: boolean }) =>
  I(
    p,
    <>
      <circle cx="10" cy="10" r="7.5" fill={p.earned ? '#ffd34d' : 'rgba(0,0,0,0.22)'} stroke={p.earned ? INK : 'currentColor'} strokeWidth="1.2" strokeDasharray={p.earned ? undefined : '2.4 2'} />
      {p.earned && <path d="M10 5.4 L11.5 8.6 L15 9 L12.4 11.4 L13.1 14.8 L10 13.1 L6.9 14.8 L7.6 11.4 L5 9 L8.5 8.6Z" fill="#e8a71c" stroke={INK} strokeWidth="0.8" strokeLinejoin="round" />}
    </>,
  );

export const HintBulbIcon = (p: IconProps) =>
  I(
    p,
    <>
      <path d="M10 2.4 Q15.6 2.4 15.6 8 Q15.6 10.8 13.4 12.4 L13.4 14 L6.6 14 L6.6 12.4 Q4.4 10.8 4.4 8 Q4.4 2.4 10 2.4Z" fill="#ffe27a" {...S} />
      <rect x="7" y="14.6" width="6" height="2.6" rx="1" fill="#8a8ea0" stroke={INK} strokeWidth="1" />
      <path d="M8 7.4 Q9 5.8 10.6 6" fill="none" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
    </>,
  );

/** Wayside Inn menu icon: gabled house with a hanging sign. */
export const InnIcon = (p: IconProps) =>
  I(
    p,
    <>
      <rect x="3" y="9" width="11" height="8" fill="#f1d9a8" {...S} />
      <path d="M1.6 9.4 L8.5 3 L15.4 9.4Z" fill="#c0482c" {...S} />
      <rect x="6.6" y="12" width="3.4" height="5" fill="#7a4a22" stroke={INK} strokeWidth="0.8" />
      <path d="M14 8 H18" stroke={INK} strokeWidth="1.2" />
      <rect x="15" y="9" width="4" height="3.4" rx="0.6" fill="#ffd34d" stroke={INK} strokeWidth="0.8" />
    </>,
  );

export const CampfireIcon = (p: IconProps) =>
  I(
    p,
    <>
      <path d="M3 17 L17 14.6" stroke="#6b4423" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M3 14.6 L17 17" stroke="#8a5a2c" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M10 2 Q16 8 14.6 12.8 Q13.6 15.4 10 15.4 Q6.4 15.4 5.6 12.8 Q4.8 9.6 8 6.8 Q8 9.4 10 10.2 Q9 6 10 2Z" fill="#ff6a2a" {...S} />
      <path d="M10 9 Q13 12 12 14 Q11 15 10 15 Q8.6 15 8.2 14 Q8 12 10 9Z" fill="#ffc83d" />
    </>,
  );

/** Save menu icon: the save crystal. */
export const SaveIcon = (p: IconProps) =>
  I(
    p,
    <>
      <path d="M10 1.6 L15 7 L12.6 17.4 L7.4 17.4 L5 7 Z" fill="#5fd0f0" {...S} />
      <path d="M10 1.6 L7.4 7 L7.4 17.4 L5 7Z" fill="#a8ecff" stroke={INK} strokeWidth="0.8" strokeLinejoin="round" />
    </>,
  );

/** Gold: a two-coin stack with a stamped G and a bright rim. Distinct from RestTokenIcon (single coin, flame). */
export const GoldCoinIcon = (p: IconProps) =>
  I(
    p,
    <>
      <ellipse cx="12.2" cy="6.6" rx="5.4" ry="3.2" fill="#e8a71c" {...S} />
      <path d="M2.6 11 V14 Q2.6 17.6 9 17.6 Q15.4 17.6 15.4 14 V11 Z" fill="#c4841a" {...S} />
      <ellipse cx="9" cy="11" rx="6.4" ry="3.6" fill="#ffe27a" {...S} />
      <ellipse cx="9" cy="11" rx="4.6" ry="2.5" fill="#ffd34d" stroke="#a8671a" strokeWidth="0.7" />
      <path d="M10.8 9.9 Q10 9 8.9 9 Q7.2 9 7.2 11 Q7.2 13 8.9 13 Q10.4 13 10.5 11.6 H8.9" fill="none" stroke="#7a4a12" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.2 9.6 Q5 8.6 6.4 8.2" fill="none" stroke="#fff8d0" strokeWidth="0.9" strokeLinecap="round" />
    </>,
  );

/** Potion flask. `empty` shows a hollow, greyed flask (none owned). */
export const PotionIcon = (p: IconProps & { empty?: boolean }) =>
  I(
    p,
    <>
      <path d="M7.6 2.8 H12.4 V7 Q16.4 9 16.4 13 Q16.4 17.6 10 17.6 Q3.6 17.6 3.6 13 Q3.6 9 7.6 7 Z" fill={p.empty ? 'rgba(255,255,255,0.12)' : '#ef4a6a'} stroke={INK} strokeWidth="1.2" strokeLinejoin="round" strokeDasharray={p.empty ? '2.4 1.8' : undefined} />
      {!p.empty && <path d="M4.2 12 Q10 10 15.8 12 Q16 17 10 17 Q4 17 4.2 12Z" fill="#ff8aa0" />}
      {!p.empty && <path d="M6 12.4 Q6 10.6 7.8 9.6" fill="none" stroke="#fff" strokeWidth="1" strokeLinecap="round" />}
      <rect x="7.2" y="1.4" width="5.6" height="2.4" rx="0.8" fill="#b8742a" stroke={INK} strokeWidth="1" />
    </>,
  );

/** Guard shield. `broken` shows a cracked, greyed shield (already used). */
export const ShieldIcon = (p: IconProps & { broken?: boolean }) =>
  I(
    p,
    <>
      <path d="M10 2 L16.6 4.4 V10 Q16.6 15 10 18 Q3.4 15 3.4 10 V4.4 Z" fill={p.broken ? '#8a8ea0' : '#4aa8ff'} {...S} />
      <path d="M10 2 L3.4 4.4 V10 Q3.4 15 10 18 Z" fill={p.broken ? '#a6a9b8' : '#a8d8ff'} stroke={INK} strokeWidth="0.8" strokeLinejoin="round" />
      <path d="M10 5 V14.4 M6.4 8.6 H13.6" stroke={p.broken ? '#c8ccd8' : '#fff'} strokeWidth="1.6" strokeLinecap="round" />
      {p.broken && <path d="M12 2.6 L9.6 8 L12.2 10 L9 17.6" fill="none" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />}
    </>,
  );

/** Tent: canvas A-frame with an open flap. */
export const TentIcon = (p: IconProps) =>
  I(
    p,
    <>
      <path d="M10 2.6 L18 16.6 H2 Z" fill="#f1d9a8" {...S} />
      <path d="M10 2.6 L2 16.6 H10 Z" fill="#fff0cc" stroke={INK} strokeWidth="0.8" strokeLinejoin="round" />
      <path d="M10 8 L13.6 16.6 H6.4 Z" fill="#7a3a22" stroke={INK} strokeWidth="1" strokeLinejoin="round" />
      <path d="M10 2.6 V1.2 M10 1.4 H12.6 V3 H10" fill="#e8a71c" stroke={INK} strokeWidth="0.9" strokeLinejoin="round" />
      <path d="M1 17.6 H19" stroke={INK} strokeWidth="1.2" strokeLinecap="round" />
    </>,
  );

/** Item Shop menu icon: market stall with striped awning. */
export const ShopIcon = (p: IconProps) =>
  I(
    p,
    <>
      <rect x="3.6" y="9" width="12.8" height="8.4" fill="#d9b277" {...S} />
      <rect x="5" y="11.4" width="3.6" height="6" fill="#7a4a22" stroke={INK} strokeWidth="0.8" />
      <circle cx="13" cy="13.4" r="2.2" fill="#ffd34d" stroke={INK} strokeWidth="0.9" />
      <path d="M2 9.4 L3.6 3.4 H16.4 L18 9.4 Z" fill="#fff" {...S} />
      <path d="M5.6 3.4 L5 9.4 H8 L8.2 3.4Z M11.8 3.4 L12 9.4 H15 L14.4 3.4Z" fill="#d9452a" />
      <path d="M2 9.4 L3.6 3.4 H16.4 L18 9.4 Z" fill="none" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
    </>,
  );
