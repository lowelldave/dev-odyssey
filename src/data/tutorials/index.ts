import type { Tutorial } from '../../types';
import { GIT } from './git';
import { HTML_CSS } from './htmlCss';
import { JAVASCRIPT } from './javascript';
import { TYPESCRIPT } from './typescript';
import { WEB } from './web';

/** Step-by-step tutorials keyed by `islandId/questId`. */
export const TUTORIALS: Record<string, Tutorial> = {
  ...prefix('web', WEB),
  ...prefix('html-css', HTML_CSS),
  ...prefix('javascript', JAVASCRIPT),
  ...prefix('git', GIT),
  ...prefix('typescript', TYPESCRIPT),
};

function prefix(islandId: string, map: Record<string, Tutorial>) {
  return Object.fromEntries(Object.entries(map).map(([questId, t]) => [`${islandId}/${questId}`, t]));
}
