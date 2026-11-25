import { exportSave, useStore } from '../store';
import { countCompleted } from './game';
import type { Completed } from './game';

const WEEK_MS = 7 * 86_400_000;

/** Write a Save Scroll (the JSON backup) to disk and remember when. */
export function downloadSave() {
  const blob = new Blob([exportSave()], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `dev-odyssey-save-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  // revoke after the browser has started the download
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  useStore.getState().noteBackup();
}

/**
 * The save crystal glows when a backup is due: never backed up with 3 or more quests cleared,
 * or more than 7 days since the last backup with new clears since.
 */
export function isBackupDue(completed: Completed, lastBackupAt: string | null, now = Date.now()): boolean {
  if (!lastBackupAt) return countCompleted(completed) >= 3;
  const last = Date.parse(lastBackupAt);
  if (!Number.isFinite(last)) return countCompleted(completed) >= 3;
  if (now - last <= WEEK_MS) return false;
  return Object.values(completed).some((c) => Date.parse(c.at) > last);
}
