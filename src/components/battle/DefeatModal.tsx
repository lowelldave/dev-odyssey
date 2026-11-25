import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useFocusTrap } from '../../lib/focus';
import { HeroDefeatedArt } from '../art';

/**
 * Shown when the hero's HP hits 0 in battle. The only way on is to wake up (25 HP) and go back to the lesson,
 * so Escape does the same. Rendered into <body> so a pixel-skinned window's clip-path can't cut it off.
 */
export default function DefeatModal({
  monsterName,
  correct,
  answered,
  total,
  innIslandId,
  onWake,
}: {
  monsterName: string;
  correct: number;
  answered: number;
  total: number;
  innIslandId?: string;
  onWake: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true, onWake, 'checkpoint');

  return createPortal(
    <div className="modal-backdrop defeat-backdrop">
      <div ref={ref} className="modal window defeat-modal" role="alertdialog" aria-modal="true" aria-labelledby="defeat-title" aria-describedby="defeat-text">
        <div className="defeat-art" aria-hidden="true">
          <HeroDefeatedArt size={168} />
        </div>
        <p className="defeat-title" id="defeat-title">
          DEFEATED…
        </p>
        <div className="battle-log" id="defeat-text">
          <p>The {monsterName} knocked you out.</p>
          <p>
            You answered {correct} of {answered} correctly before falling, with {total - answered} {total - answered === 1 ? 'question' : 'questions'} left. No EXP this time.
          </p>
          <p>You will wake with 25 HP, and it keeps refilling at 1 per minute.</p>
        </div>
        <div className="next-choices">
          <button className="btn btn-primary" onClick={onWake} data-autofocus data-sfx="back">
            Wake up and return to the lesson
          </button>
          {innIslandId && (
            <Link className="btn" to={`/island/${innIslandId}`} data-sfx="confirm">
              🛏️ Rest at the wayside Inn
            </Link>
          )}
        </div>
        <p className="muted small">Review the lesson, then begin again with new questions.</p>
      </div>
    </div>,
    document.body,
  );
}
