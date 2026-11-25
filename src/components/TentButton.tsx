import { useId } from 'react';
import { HP_MAX } from '../lib/game';
import { sfx } from '../lib/sound';
import { useNow } from '../lib/useNow';
import { hpNow, mpMaxFor, mpNow, useStore } from '../store';
import { TentIcon } from './art';

/** Pitch a tent outside battle: +50 HP and +30 MP. Uses aria-disabled so keyboard focus stays put and the reason is announced. */
export default function TentButton({ compact = false }: { compact?: boolean }) {
  const tents = useStore((s) => s.items.tent);
  const inBattle = useStore((s) => s.battle !== null || s.hpAt === null);
  const hp = useStore((s) => s.hp);
  const hpAt = useStore((s) => s.hpAt);
  const mp = useStore((s) => s.mp);
  const mpAt = useStore((s) => s.mpAt);
  const xp = useStore((s) => s.xp);
  const restInTent = useStore((s) => s.restInTent);
  const showToast = useStore((s) => s.showToast);
  const now = useNow(1000);
  const reasonId = useId();

  const full = hpNow({ hp, hpAt }, now).value >= HP_MAX && mpNow({ mp, mpAt, xp }, now).value >= mpMaxFor(xp);
  const reason = inBattle ? "Can't rest during a battle" : tents === 0 ? 'No tents. Buy them at the shop' : full ? 'HP and MP are already full' : undefined;

  const use = () => {
    if (reason) {
      sfx('error');
      return;
    }
    if (restInTent() === 'ok') {
      sfx('inn');
      showToast('You pitched a tent and rested. HP and MP restored.');
    }
  };

  return (
    <span className={`tent-use ${compact ? 'is-compact' : ''}`}>
      <button
        type="button"
        className="btn btn-sm"
        aria-disabled={reason ? true : undefined}
        aria-describedby={reason ? reasonId : undefined}
        data-sfx="none"
        onClick={use}
      >
        <TentIcon size={16} /> Use tent (×{tents})
      </button>
      {reason && !compact && (
        <span id={reasonId} className="muted small">
          {reason}
        </span>
      )}
      {reason && compact && (
        <span id={reasonId} className="sr-only">
          {reason}
        </span>
      )}
    </span>
  );
}
