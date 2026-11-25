import { useEffect, useState } from 'react';

/**
 * A re-render clock for countdowns. It ticks on the boundary of `periodMs` (so a minute clock changes
 * on the minute). Values still come from stored timestamps: this only makes the display refresh.
 */
export function useNow(periodMs = 60_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    let id = 0;
    const schedule = () => {
      id = window.setTimeout(() => {
        setNow(Date.now());
        schedule();
      }, periodMs - (Date.now() % periodMs) + 5);
    };
    setNow(Date.now());
    schedule();
    // a hidden tab throttles timers: catch up as soon as it is visible again
    const onVisible = () => {
      if (document.visibilityState === 'visible') setNow(Date.now());
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [periodMs]);
  return now;
}
