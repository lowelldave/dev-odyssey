import { ISLANDS, ISLAND_MAP } from '../data';
import type { Quest } from '../types';
import { INN_HP, INN_MP } from './battle';
// type-only: game.ts re-exports this module, so a value import would be a cycle
import type { Completed } from './game';

export type ItemId = 'potion' | 'ether' | 'shield' | 'tent';
export type Inventory = Record<ItemId, number>;

export const EMPTY_INVENTORY: Inventory = { potion: 0, ether: 0, shield: 0, tent: 0 };

export const ITEMS: Record<ItemId, { name: string; price: number; max: number; desc: string }> = {
  potion: { name: 'Potion', price: 200, max: 3, desc: 'Drink in battle: +30 HP. One per question.' },
  ether: { name: 'Ether', price: 150, max: 3, desc: 'Drink in or out of battle: +30 MP. One per question.' },
  shield: { name: 'Auto-shield', price: 100, max: 1, desc: 'Deflects the first enemy attack in a battle.' },
  tent: { name: 'Tent', price: 400, max: 3, desc: 'Rest outside battle: +50 HP, +30 MP.' },
};

export const ITEM_ORDER: ItemId[] = ['potion', 'ether', 'shield', 'tent'];

export const POTION_HP = 30;
export const ETHER_MP = 30;
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

/** Bonus gold on a first clear. */
export const GOLD_PERFECT = 100;
export const GOLD_STREAK = 50;
export const STREAK_BONUS_DAYS = 3;

export interface GoldAward {
  base: number;
  perfect: number;
  streak: number;
  streakDays: number;
  total: number;
}

/** Gold for a first clear: the base roll, +100 for a flawless quiz and +50 at a 3+ day streak. */
export function goldAward(quest: Quest, opts: { perfect: boolean; streakDays: number }, rng: () => number = Math.random): GoldAward {
  const base = rollQuestGold(quest, rng);
  const perfect = opts.perfect && quest.checkpoint.type === 'quiz' ? GOLD_PERFECT : 0;
  const streak = opts.streakDays >= STREAK_BONUS_DAYS ? GOLD_STREAK : 0;
  return { base, perfect, streak, streakDays: opts.streakDays, total: base + perfect + streak };
}

/** The travelling merchant: 25% off, for 48 hours, at the newest purified area. */
export const MERCHANT_MS = 48 * 3_600_000;
export const MERCHANT_OFF = 25;
export type Seller = 'shop' | 'merchant';
export interface Merchant {
  islandId: string;
  arrivedAt: number;
}

/** Integer maths that rounds in the player's favour: 200 -> 150, 150 -> 112, 100 -> 75, 400 -> 300. */
export const merchantPrice = (price: number) => price - Math.ceil((price * MERCHANT_OFF) / 100);
export const priceOf = (id: ItemId, seller: Seller = 'shop') => (seller === 'merchant' ? merchantPrice(ITEMS[id].price) : ITEMS[id].price);

/** A negative elapsed time (clock moved back) counts as active; loading clamps it. */
export const merchantActive = (m: Merchant | null | undefined, now: number): m is Merchant =>
  !!m && !!ISLAND_MAP[m.islandId] && now - m.arrivedAt < MERCHANT_MS;
export const merchantLeftMs = (m: Merchant, now: number) => Math.max(0, MERCHANT_MS - (now - m.arrivedAt));

export function formatLeaves(ms: number): string {
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return 'under a minute';
  const h = Math.floor(mins / 60);
  if (h >= 24) {
    const d = Math.floor(h / 24);
    return `${d} day${d === 1 ? '' : 's'} ${h % 24} h`;
  }
  return h >= 1 ? `${h} h ${mins % 60} min` : `${mins} min`;
}

export const canBuy = (gold: number, inv: Inventory, id: ItemId, price: number = ITEMS[id].price): 'ok' | 'poor' | 'max' =>
  inv[id] >= ITEMS[id].max ? 'max' : gold < price ? 'poor' : 'ok';

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
