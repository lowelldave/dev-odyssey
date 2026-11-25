import { useStore } from '../store';
import { merchantActive, merchantLeftMs } from './items';
import { useNow } from './useNow';

/** The travelling merchant if he is still camped (re-checked every minute), else null. */
export function useMerchant() {
  const m = useStore((s) => s.merchant);
  const now = useNow(60_000);
  return merchantActive(m, now) ? { ...m, leftMs: merchantLeftMs(m, now) } : null;
}
