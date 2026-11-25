import type { ReactNode } from 'react';
import { Portrait } from './Portrait';
import { HintBulbIcon } from './Icons';

/** Hint card shown after a hint is bought: mini Sage portrait + text. Style: .jr-hint-card (works on paper and on blue windows). */
export function HintCard({ children }: { children: ReactNode }) {
  return (
    <div className="jr-hint-card" role="note">
      <Portrait who="sage" size={32} />
      <p>{children}</p>
    </div>
  );
}

export type HintButtonState = 'ready' | 'bought' | 'no-hint' | 'no-mp';
/** Visual-only hint button. The caller owns onClick/aria-disabled logic; `reason` is rendered as visible helper text. */
export function HintButtonFace({ state, cost = 10, reason }: { state: HintButtonState; cost?: number; reason?: string }) {
  return (
    <>
      <HintBulbIcon size={16} />
      <span>{state === 'bought' ? 'Hint shown' : `Hint (${cost} MP)`}</span>
      {state !== 'ready' && state !== 'bought' && reason && <span className="jr-hint-reason">{reason}</span>}
    </>
  );
}
