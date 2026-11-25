import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/** Non-hook read, for timers and one-shot effects. */
export const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches;

/** True while the user asks for reduced motion; JS-driven effects (typewriter, timed fx) check this. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}
