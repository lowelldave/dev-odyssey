/* Pure battle-economy rules: HP, MP, regeneration and the wayside Inn. The store only applies them. */

export const HP_MAX = 100;
/** HP a knocked-out hero wakes up with when the defeat screen closes. */
export const HP_REVIVE = 25;
/** A miss deals a whole number in this inclusive range. */
export const MISS_DAMAGE_MIN = 10;
export const MISS_DAMAGE_MAX = 20;
export const HINT_COST = 10;
/** One point of HP or MP per real minute. */
export const REGEN_MS = 60_000;
export const INN_CHANCE = 0.25;
export const INN_HP = 50;
export const INN_MP = 30;
export const REST_TOKENS_MAX = 2;

export const maxMp = (level: number) => 100 + 10 * Math.floor(level / 10);

export interface Regen {
  value: number;
  at: number | null;
}

/**
 * Value + timestamp -> current value. `at === null` means paused (in battle).
 * Returns the normalised `at` to store; a partial minute is kept.
 */
export function regenNow(value: number, at: number | null, max: number, now: number): Regen {
  const base = Math.max(0, Math.min(value, max));
  if (at === null) return { value: base, at: null };
  const elapsed = now - at;
  if (!Number.isFinite(elapsed) || elapsed < 0) return { value: base, at: now }; // clock moved back
  const gained = Math.floor(elapsed / REGEN_MS);
  const v = Math.min(max, base + gained);
  return { value: v, at: v >= max ? now : at + gained * REGEN_MS };
}

/** Milliseconds until `value` reaches `target`; null when paused or already there. */
export function msUntil(value: number, at: number | null, target: number, now: number): number | null {
  if (at === null) return null;
  const current = regenNow(value, at, Number.MAX_SAFE_INTEGER, now);
  if (current.value >= target || current.at === null) return null;
  return (target - current.value) * REGEN_MS - (now - current.at);
}

/** Whole-number miss damage, uniform over MISS_DAMAGE_MIN..MISS_DAMAGE_MAX. */
export const rollMissDamage = (rng: () => number = Math.random) =>
  MISS_DAMAGE_MIN + Math.floor(rng() * (MISS_DAMAGE_MAX - MISS_DAMAGE_MIN + 1));

/** Misses that are guaranteed survivable (the worst case is the maximum damage every time). */
export const safeMisses = (hp: number) => Math.max(0, Math.ceil(hp / MISS_DAMAGE_MAX) - 1);

export const rollInn = (rng: () => number = Math.random) => rng() < INN_CHANCE;
