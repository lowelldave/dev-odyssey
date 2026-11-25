import { useEffect, useState } from 'react';
import { useReducedMotion } from '../../lib/motion';
import { sfx } from '../../lib/sound';
import { Portrait, type PortraitWho } from '../art';

/**
 * A classic dialogue box: speaker name plate, portrait and a typewriter line. The full text is mirrored in a
 * polite live region, so screen readers get it at once. With reduced motion the line appears in full.
 * Activating the text skips the typing first, then advances.
 */
export default function DialogueBox({
  speaker,
  who,
  text,
  last = false,
  onNext,
  onSkip,
  step,
}: {
  speaker: string;
  who: PortraitWho;
  text: string;
  /** the last box: the advance button reads "Done" */
  last?: boolean;
  onNext: () => void;
  onSkip?: () => void;
  /** "1 / 4" style progress */
  step?: string;
}) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(reduced ? text.length : 0);

  useEffect(() => {
    if (reduced) {
      setShown(text.length);
      return;
    }
    setShown(0);
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      setShown(n);
      if (n % 2 === 0) sfx('text');
      if (n >= text.length) window.clearInterval(id);
    }, 28);
    return () => window.clearInterval(id);
  }, [text, reduced]);

  const done = shown >= text.length;
  const advance = () => (done ? onNext() : setShown(text.length));

  return (
    <div className="jr-dlg dlg">
      <span className="jr-dlg-name">{speaker}</span>
      <Portrait who={who} size={56} />
      <div className="dlg-body">
        <p className="jr-dlg-text" aria-hidden="true">
          {text.slice(0, shown)}
        </p>
        <p className="sr-only" aria-live="polite">
          {text}
        </p>
        <div className="dlg-actions">
          {step && <span className="dlg-step">{step}</span>}
          {onSkip && !last && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={onSkip} data-sfx="back">
              Skip
            </button>
          )}
          <button type="button" className="btn btn-primary btn-sm" onClick={advance} data-autofocus data-sfx="confirm">
            {done ? (last ? 'Done' : 'Next ▶') : 'Skip text'}
          </button>
        </div>
      </div>
      {!done && <span className="jr-dlg-more" aria-hidden="true" />}
    </div>
  );
}
