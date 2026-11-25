import { ISLANDS } from '../data';
import type { Quest } from '../types';
import { INN_HP, INN_MP } from './battle';
// type-only: game.ts re-exports this module, so a value import would be a cycle
import type { Completed } from './game';

export type ItemId = 'potion' | 'shield' | 'tent';
export type Inventory = Record<ItemId, number>;

export const EMPTY_INVENTORY: Inventory = { potion: 0, shield: 0, tent: 0 };

export const ITEMS: Record<ItemId, { name: string; price: number; max: number; desc: string }> = {
  potion: { name: 'Potion', price: 200, max: 3, desc: 'Drink in battle: +30 HP. One per question.' },
  shield: { name: 'Auto-shield', price: 100, max: 1, desc: 'Deflects the first enemy attack in a battle.' },
  tent: { name: 'Tent', price: 400, max: 3, desc: 'Rest outside battle: +50 HP, +30 MP.' },
};

export const ITEM_ORDER: ItemId[] = ['potion', 'shield', 'tent'];

export const POTION_HP = 30;
export const TENT_HP = INN_HP;
export const TENT_MP = INN_MP;

export const GOLD_REGULAR = [100, 200, 300] as const;
export const GOLD_BOSS = 500;
/** gold granted per already-cleared regular quest when a v3 save upgrades */
export const GOLD_RETRO_REGULAR = 200;
export const GOLD_CAP = 9_999_999;

/** Gold for a first clear: 100/200/300 for a regular quest, 500 for a boss. */
export const rollQuestGold = (quest: Quest, rng: () => number = Math.random): number =>
  quest.boss ? GOLD_BOSS : GOLD_REGULAR[Math.min(2, Math.floor(rng() * 3))];

/** Gold owed for progress made before gold existed. Stale keys are ignored. */
export function retroGold(completed: Completed): number {
  let total = 0;
  for (const island of ISLANDS) {
    for (const q of island.quests) {
      if (completed[`${island.id}/${q.id}`]) total += q.boss ? GOLD_BOSS : GOLD_RETRO_REGULAR;
    }
  }
  return total;
}

export const canBuy = (gold: number, inv: Inventory, id: ItemId): 'ok' | 'poor' | 'max' =>
  inv[id] >= ITEMS[id].max ? 'max' : gold < ITEMS[id].price ? 'poor' : 'ok';

/** Integers clamped to 0..max per item; anything else becomes 0. */
export function parseInventory(v: unknown): Inventory {
  const out: Inventory = { ...EMPTY_INVENTORY };
  if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
    const rec = v as Record<string, unknown>;
    for (const id of ITEM_ORDER) {
      const n = rec[id];
      if (typeof n === 'number' && Number.isFinite(n)) out[id] = Math.min(ITEMS[id].max, Math.max(0, Math.floor(n)));
    }
  }
  return out;
}

export const formatGold = (n: number) => n.toLocaleString();
const trim1 = (v: number) => v.toFixed(1).replace(/\.0$/, '');
export const shortGold = (n: number) =>
  n >= 999_950 ? `${trim1(n / 1_000_000)}M` : n >= 10_000 ? `${trim1(n / 1000)}k` : n.toLocaleString();
