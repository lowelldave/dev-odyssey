import { ITEMS, ITEM_ORDER, type ItemId, canBuy, formatGold } from '../../lib/game';
import { sfx } from '../../lib/sound';
import { useStore } from '../../store';
import { GoldCoinIcon, PotionIcon, Portrait, ShieldIcon, TentIcon } from '../art';

const ICONS = {
  potion: <PotionIcon size={28} />,
  shield: <ShieldIcon size={28} />,
  tent: <TentIcon size={28} />,
} as const;

/** The merchant's stall. Buttons use aria-disabled so focus stays on them and the reason is read out. */
export default function ShopWindow() {
  const gold = useStore((s) => s.gold);
  const items = useStore((s) => s.items);
  const buyItem = useStore((s) => s.buyItem);
  const showToast = useStore((s) => s.showToast);
  const ownsNothing = ITEM_ORDER.every((id) => items[id] === 0);

  const reasonFor = (id: ItemId) => {
    const r = canBuy(gold, items, id);
    if (r === 'max') return id === 'shield' ? 'You already carry one' : `You can carry only ${ITEMS[id].max}`;
    if (r === 'poor') return `Not enough gold (need ${formatGold(ITEMS[id].price - gold)} more)`;
    return undefined;
  };

  const buy = (id: ItemId) => {
    const why = reasonFor(id);
    if (why) {
      sfx('error');
      showToast(why);
      return;
    }
    // the store re-checks against fresh state, so a rapid double click can never overspend
    if (buyItem(id) === 'ok') {
      sfx('coin');
      showToast(`Bought ${/^[aeiou]/i.test(ITEMS[id].name) ? 'an' : 'a'} ${ITEMS[id].name}. ${formatGold(useStore.getState().gold)} gold left.`);
    }
  };

  return (
    <div className="shop">
      <div className="shop-greet">
        <Portrait who="merchant" size={48} />
        <p>
          Welcome, traveller! Coin earned by study, spent on survival.
          {gold === 0 && ownsNothing && ' Clear quests to earn gold.'}
        </p>
      </div>
      <p className="shop-gold" role="status">
        <GoldCoinIcon size={18} /> <strong>{formatGold(gold)}</strong> gold
      </p>
      <ul className="items-list shop-list" aria-label="Items for sale">
        {ITEM_ORDER.map((id, i) => {
          const why = reasonFor(id);
          return (
            <li key={id}>
              {ICONS[id]}
              <div>
                <strong>{ITEMS[id].name}</strong>
                <p className="muted small">{ITEMS[id].desc}</p>
                <p className="small">
                  Owned {items[id]}/{ITEMS[id].max}
                </p>
                {why && (
                  <p id={`why-${id}`} className="muted small">
                    {why}
                  </p>
                )}
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm shop-buy"
                aria-disabled={why ? true : undefined}
                aria-describedby={why ? `why-${id}` : undefined}
                aria-label={`Buy ${ITEMS[id].name} for ${ITEMS[id].price} gold`}
                data-sfx="none"
                data-autofocus={i === 0 ? '' : undefined}
                onClick={() => buy(id)}
              >
                <GoldCoinIcon size={14} /> {ITEMS[id].price}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
