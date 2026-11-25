import { type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { sfx } from '../../lib/sound';
import { useStore } from '../../store';
import { Cursor } from '../art';

export interface CommandItem {
  id: string;
  label: ReactNode;
  /** small text under the label */
  detail?: ReactNode;
  /** badge shown after the label, for example "!" */
  badge?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  /** explains why it is disabled; announced with the item */
  reason?: string;
  /** extra class for the row (correct / wrong styling in a quiz) */
  className?: string;
}

/**
 * A classic command list: a pointing cursor on the active row, a roving tabindex, arrow keys, Home/End,
 * Enter/Space (native button), number keys, Esc, and a cursor position that is remembered per `memoryKey`.
 */
export default function CommandMenu({
  items,
  onSelect,
  onCancel,
  label,
  role = 'menu',
  numberKeys = false,
  memoryKey,
  autoFocus = false,
  className = '',
}: {
  items: CommandItem[];
  onSelect: (id: string) => void;
  onCancel?: () => void;
  /** accessible name of the list */
  label: string;
  /** 'menu' for commands; 'group' for answer buttons */
  role?: 'menu' | 'group';
  numberKeys?: boolean;
  memoryKey?: string;
  autoFocus?: boolean;
  className?: string;
}) {
  const setMenuCursor = useStore((s) => s.setMenuCursor);
  const [active, setActive] = useState(() => {
    if (!memoryKey) return 0;
    const saved = useStore.getState().menuCursor;
    const i = saved?.startsWith(`${memoryKey}:`) ? items.findIndex((it) => `${memoryKey}:${it.id}` === saved) : -1;
    return i >= 0 ? i : 0;
  });
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = Math.min(active, Math.max(0, items.length - 1));

  useEffect(() => {
    if (autoFocus) refs.current[current]?.focus({ preventScroll: true });
    // only on mount: later cursor moves focus explicitly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const move = (to: number, focus = true) => {
    if (!items.length) return;
    const i = ((to % items.length) + items.length) % items.length;
    if (i !== current) sfx('cursor');
    setActive(i);
    if (memoryKey) setMenuCursor(`${memoryKey}:${items[i].id}`);
    if (focus) refs.current[i]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        move(current + 1);
        return;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        move(current - 1);
        return;
      case 'Home':
        e.preventDefault();
        move(0);
        return;
      case 'End':
        e.preventDefault();
        move(items.length - 1);
        return;
      case 'Escape':
        if (onCancel) {
          e.preventDefault();
          onCancel();
        }
        return;
    }
    if (numberKeys && /^[1-9]$/.test(e.key)) {
      const i = Number(e.key) - 1;
      const it = items[i];
      if (it && !it.disabled) {
        e.preventDefault();
        move(i, false);
        onSelect(it.id);
      }
    }
  };

  return (
    <div className={`cmd ${className}`} role={role} aria-label={label} onKeyDown={onKeyDown}>
      {items.map((it, i) => {
        const on = i === current;
        return (
          <button
            key={it.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role={role === 'menu' ? 'menuitem' : undefined}
            className={`cmd-item ${on ? 'is-active' : ''} ${it.className ?? ''}`}
            tabIndex={on ? 0 : -1}
            aria-disabled={it.disabled || undefined}
            aria-describedby={it.disabled && it.reason ? `cmd-${it.id}-why` : undefined}
            data-sfx="none"
            data-autofocus={autoFocus && on ? '' : undefined}
            onMouseEnter={() => !it.disabled && move(i, false)}
            onFocus={() => i !== current && setActive(i)}
            onClick={() => {
              if (it.disabled) return;
              move(i, false);
              onSelect(it.id);
            }}
          >
            <span className="cmd-cursor" aria-hidden="true" style={{ visibility: on ? 'visible' : 'hidden' }}>
              <Cursor size={14} className={`jr-cursor${on ? ' jr-cursor-nudge' : ''}`} />
            </span>
            {numberKeys && <span className="cmd-num" aria-hidden="true">{i + 1}</span>}
            {it.icon}
            <span className="cmd-label">
              {it.label}
              {it.detail && <small>{it.detail}</small>}
            </span>
            {it.badge && <span className="cmd-badge">{it.badge}</span>}
            {it.disabled && it.reason && (
              <span id={`cmd-${it.id}-why`} className="sr-only">
                {it.reason}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
