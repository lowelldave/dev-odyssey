import { type RefObject, useEffect, useRef } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal focus handling: Escape calls `onClose`, Tab stays inside `ref`, focus moves in on open and
 * returns to where it was when the dialog closes (or to `fallbackId` / main if that element is gone).
 */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, open: boolean, onClose: () => void, fallbackId?: string) {
  // the last element focused outside the dialog, so focus can go back there on close
  const lastOutside = useRef<HTMLElement | null>(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      if (e.target instanceof HTMLElement && !ref.current?.contains(e.target)) lastOutside.current = e.target;
    };
    document.addEventListener('focusin', onFocusIn);
    return () => document.removeEventListener('focusin', onFocusIn);
  }, [ref]);

  useEffect(() => {
    if (!open) return;
    // remember what had focus (the opener) so closing can give it back, even if focusin never reported it
    const opener = document.activeElement instanceof HTMLElement && !ref.current?.contains(document.activeElement) ? document.activeElement : null;
    if (opener) lastOutside.current = opener;
    // an explicit [data-autofocus] wins over the first link or button (which may be a close button)
    const target = ref.current?.querySelector<HTMLElement>('[data-autofocus]') ?? ref.current?.querySelector<HTMLElement>('a[href], button:not([disabled])');
    target?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const nodes = ref.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!nodes?.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      if (!ref.current?.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      const previous = lastOutside.current;
      if (previous?.isConnected) {
        previous.focus();
        return;
      }
      const fallback = (fallbackId ? document.getElementById(fallbackId) : null) ?? document.querySelector<HTMLElement>('main');
      if (fallback) {
        if (!fallback.hasAttribute('tabindex')) fallback.setAttribute('tabindex', '-1');
        fallback.focus({ preventScroll: true });
      }
    };
  }, [open, ref, fallbackId]);
}
