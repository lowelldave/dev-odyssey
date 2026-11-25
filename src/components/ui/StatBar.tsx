import type { ReactNode } from 'react';
import { Bar, type BarProps } from '../art';

/** A labelled stat row: "HP 35/100" with a meter underneath and optional trailing status text. */
export default function StatBar({
  title,
  status,
  icon,
  showValue = true,
  ...bar
}: BarProps & { title: string; status?: ReactNode; icon?: ReactNode; showValue?: boolean }) {
  return (
    <div className="statbar">
      <div className="statbar-head">
        <span className="statbar-title">
          {icon}
          {title}
        </span>
        {showValue && (
          <span className="statbar-value">
            {Math.round(bar.value)}/{bar.max}
          </span>
        )}
      </div>
      <Bar {...bar} label={bar.label ?? title} />
      {status && <div className="statbar-status">{status}</div>}
    </div>
  );
}
