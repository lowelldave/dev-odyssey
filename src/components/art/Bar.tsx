export type BarKind = 'hp' | 'mp' | 'exp' | 'monster';
export interface BarProps {
  kind: BarKind;
  value: number;
  max: number;
  /** Draw quarter notches (HP). Default true for hp. */
  notches?: boolean;
  /** hp below the fight threshold: amber */
  wounded?: boolean;
  /** hp at 0 */
  ko?: boolean;
  /** regeneration paused (in battle): hatched overlay */
  paused?: boolean;
  /** red damage flash; change `flashKey` to retrigger */
  flash?: boolean;
  flashKey?: number | string;
  label?: string;
  className?: string;
}

/** Presentational stat bar. Classes live in jrpg.css (`.jb*`). Fill uses transform: scaleX only. */
export function Bar({ kind, value, max, notches, wounded, ko, paused, flash, flashKey, label, className }: BarProps) {
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  const cls = ['jb', `jb-${kind}`, wounded && 'is-wounded', ko && 'is-ko', paused && 'is-paused', (notches ?? kind === 'hp') && 'has-notches', className].filter(Boolean).join(' ');
  return (
    <div className={cls} role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.round(value)} aria-label={label ?? kind.toUpperCase()}>
      <span className="jb-fill" style={{ transform: `scaleX(${pct})` }} />
      {flash && <span key={flashKey} className="jb-flash" />}
      <span className="jb-notches" aria-hidden="true" />
    </div>
  );
}
