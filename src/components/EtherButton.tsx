import { useId } from 'react';
import { sfx } from '../lib/sound';
import { useNow } from '../lib/useNow';
import { mpMaxFor, mpNow, useStore } from '../store';
import { PotionIcon } from './art';

/** Drink an Ether outside battle: +30 MP. Uses aria-disabled so keyboard focus stays put and the reason is announced. */
export default function EtherButton({ compact = false }: { compact?: boolean }) {
  const ethers = useStore((s) => s.items.ether);
  const mp = useStore((s) => s.mp);
  const mpAt = useStore((s) => s.mpAt);
  const xp = useStore((s) => s.xp);
  const drinkEther = useStore((s) => s.drinkEther);
  const showToast = useStore((s) => s.showToast);
  const now = useNow(1000);
  const reasonId = useId();

  const full = mpNow({ mp, mpAt, xp }, now).value >= mpMaxFor(xp);
  const reason = ethers === 0 ? 'No ethers. Buy them at the shop' : full ? 'MP is already full' : undefined;

  const use = () => {
    if (reason) {
      sfx('error');
      return;
    }
    const res = drinkEther();
    if (res.result === 'ok') {
      sfx('potion');
      showToast(`You drank an Ether: +${res.restored} MP.`);
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
        <PotionIcon size={16} tone="ether" /> Use ether (×{ethers})
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
