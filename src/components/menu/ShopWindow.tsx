import { ISLAND_MAP } from '../../data';
import { ITEMS, ITEM_ORDER, type ItemId, type Seller, canBuy, formatGold, formatLeaves, priceOf } from '../../lib/game';
import { sfx } from '../../lib/sound';
import { useMerchant } from '../../lib/useMerchant';
import { useStore } from '../../store';
import { GoldCoinIcon, PotionIcon, Portrait, ShieldIcon, TentIcon } from '../art';

const ICONS = {
  potion: <PotionIcon size={28} />,
  ether: <PotionIcon size={28} tone="ether" />,
  shield: <ShieldIcon size={28} />,
  tent: <TentIcon size={28} />,
} as const;

/** The merchant's stall. Buttons use aria-disabled so focus stays on them and the reason is read out. */
export default function ShopWindow({ seller = 'shop' }: { seller?: Seller }) {
  const gold = useStore((s) => s.gold);
  const items = useStore((s) => s.items);
  const buyItem = useStore((s) => s.buyItem);
  const showToast = useStore((s) => s.showToast);
  const merchant = useMerchant();
  const ownsNothing = ITEM_ORDER.every((id) => items[id] === 0);
  const packedUp = seller === 'merchant' && !merchant;

  const reasonFor = (id: ItemId) => {
    const r = canBuy(gold, items, id, priceOf(id, seller));
    if (r === 'max') return id === 'shield' ? 'You already carry one' : `You can carry only ${ITEMS[id].max}`;
    if (r === 'poor') return `Not enough gold (need ${formatGold(priceOf(id, seller) - gold)} more)`;
    return undefined;
  };

  const buy = (id: ItemId) => {
    const why = reasonFor(id);
    if (why) {
      sfx('error');
      showToast(why);
      return;
    }
    // the store re-checks against fresh state (and the merchant's clock), so a rapid double click can never overspend
    const res = buyItem(id, seller);
    if (res === 'gone') {
      sfx('error');
      showToast('The merchant has packed up and moved on.');
      return;
    }
    if (res === 'ok') {
      sfx('coin');
      const st = useStore.getState();
      let text = `Bought ${/^[aeiou]/i.test(ITEMS[id].name) ? 'an' : 'a'} ${ITEMS[id].name}. ${formatGold(st.gold)} gold left.`;
      if (st.purchases === 1 && !st.badgesSeen['first-purchase']) {
        st.markBadgesSeen(['first-purchase']);
        text += ' Achievement: 🛍️ First Purchase!';
      }
      showToast(text);
    }
  };

  if (packedUp) {
    return (
      <div className="shop">
        <div className="shop-greet">
          <Portrait who="merchant" size={48} />
          <p role="status">The merchant has packed up and moved on. The Item Shop near Web Village is always open.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shop">
      <div className="shop-greet">
        <Portrait who="merchant" size={48} />
        {seller === 'merchant' && merchant ? (
          <p>
            Fresh from the road! Everything 25% off while I camp at {ISLAND_MAP[merchant.islandId]?.name}. I leave in {formatLeaves(merchant.leftMs)}.
          </p>
        ) : (
          <p>
            Welcome, traveller! Coin earned by study, spent on survival.
            {gold === 0 && ownsNothing && ' Clear quests to earn gold.'}
          </p>
        )}
      </div>
      <p className="shop-gold" role="status">
        <GoldCoinIcon size={18} /> <strong>{formatGold(gold)}</strong> gold
      </p>
      <ul className="items-list shop-list" aria-label="Items for sale">
        {ITEM_ORDER.map((id, i) => {
          const why = reasonFor(id);
          const price = priceOf(id, seller);
          const sale = seller === 'merchant';
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
                aria-label={sale ? `Buy ${ITEMS[id].name} for ${price} gold, 25% off, usually ${ITEMS[id].price}` : `Buy ${ITEMS[id].name} for ${price} gold`}
                data-sfx="none"
                data-autofocus={i === 0 ? '' : undefined}
                onClick={() => buy(id)}
              >
                {sale && <s aria-hidden="true">{ITEMS[id].price}</s>} <GoldCoinIcon size={14} /> {price}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
