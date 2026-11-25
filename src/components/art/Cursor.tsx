import { Svg } from './util';

/** Pointing-hand style menu cursor: a gold arrowhead with dark outline. Works on blue windows and on paper. */
export function Cursor({ size = 16, className = 'jr-cursor' }: { size?: number; className?: string }) {
  return (
    <Svg w={size} h={size} vb="0 0 16 16" className={className}>
      <path d="M2 2 L14 8 L2 14 L5 8 Z" fill="#ffd34d" stroke="#2a1c14" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M3.2 3.6 L10 7.2 L5 7.4 Z" fill="#fff3b0" />
    </Svg>
  );
}

/** Same cursor as a data URI, for `content:`/`background-image`/`cursor:`. */
export const CURSOR_DATA_URI =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M2 2L14 8L2 14L5 8Z' fill='%23ffd34d' stroke='%232a1c14' stroke-width='1.4' stroke-linejoin='round'/%3E%3Cpath d='M3.2 3.6L10 7.2L5 7.4Z' fill='%23fff3b0'/%3E%3C/svg%3E";
