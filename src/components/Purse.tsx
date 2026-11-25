import { ITEMS, ITEM_ORDER, formatGold, shortGold } from '../lib/game';
import { useStore } from '../store';
import { GoldCoinIcon, PotionIcon, ShieldIcon, TentIcon } from './art';

const ICONS = {
  potion: <PotionIcon size={16} />,
  ether: <PotionIcon size={16} tone="ether" />,
  shield: <ShieldIcon size={16} />,
  tent: <TentIcon size={16} />,
} as const;

/** Gold and carried items. `row` lists the items too; `chip` is gold only (HUD-sized). */
export default function Purse({ variant = 'row' }: { variant?: 'row' | 'chip' }) {
  const gold = useStore((s) => s.gold);
  const items = useStore((s) => s.items);

  if (variant === 'chip') {
    return (
      <span className="purse purse-chip" aria-label={`${formatGold(gold)} gold`}>
        <GoldCoinIcon size={16} />
        <span aria-hidden="true">{shortGold(gold)}</span>
      </span>
    );
  }
  return (
    <div className="purse" role="group" aria-label="Purse">
      <span className="purse-gold">
        <GoldCoinIcon size={18} /> <strong>{formatGold(gold)}</strong> gold
      </span>
      <ul className="purse-items" aria-label="Carried items">
        {ITEM_ORDER.map((id) => (
          <li key={id} className={items[id] === 0 ? 'is-empty' : ''} aria-label={`${ITEMS[id].name}: ${items[id]} of ${ITEMS[id].max}`}>
            <span aria-hidden="true">
              {ICONS[id]} {items[id]}/{ITEMS[id].max}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
