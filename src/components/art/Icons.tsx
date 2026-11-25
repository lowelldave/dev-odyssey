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
