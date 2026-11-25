import { type ReactNode, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../../lib/focus';

/**
 * A window that slides up from the bottom on phones and sits centred on larger screens.
 * Escape and the backdrop close it; focus is trapped inside and returned afterwards.
 */
export default function BottomSheet({ open, onClose, title, children, focusKey }: { open: boolean; onClose: () => void; title: string; children: ReactNode; focusKey?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useFocusTrap(ref, open, onClose);
  // when the content swaps to another view the focused control unmounts: move focus to the new view's primary control
  useEffect(() => {
    if (!open) return;
    const el = ref.current?.querySelector<HTMLElement>('[data-autofocus]');
    if (el) el.focus({ preventScroll: true });
    else ref.current?.focus({ preventScroll: true });
  }, [open, focusKey]);
  if (!open) return null;
  // portalled to <body>: an ancestor's clip-path (the pixel skin's stepped corners on .card/.window) clips fixed descendants too
  return createPortal(
    <div className="sheet-backdrop" onClick={onClose}>
      <div ref={ref} className="jr-sheet sheet" tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label={`Close ${title}`} data-sfx="back">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
