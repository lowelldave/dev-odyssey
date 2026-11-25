/**
 * A battle page only runs when the "Begin battle" button opened it. Router state survives a refresh
 * (it lives in history.state), so it cannot tell a refresh from a fresh start; this module variable can,
 * because it is reset whenever the page reloads.
 */
let armed: { key: string; nonce: number } | null = null;
let counter = 0;

export function armBattle(key: string): number {
  counter += 1;
  armed = { key, nonce: counter };
  return counter;
}

export const isBattleArmed = (key: string, nonce: unknown) => armed !== null && armed.key === key && armed.nonce === nonce;

export function disarmBattle() {
  armed = null;
}
