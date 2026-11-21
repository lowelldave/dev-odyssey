import type { Checkpoint, ProjectCheckpoint, Quest, QuizCheckpoint, QuizQuestion, Resource, Rule } from '../types';

/* ---------- content helpers (keep island files compact) ---------- */

export const q = (question: string, options: string[], answer: number, explain?: string): QuizQuestion => ({
  question,
  options,
  answer,
  explain,
});

export const quiz = (...questions: QuizQuestion[]): QuizCheckpoint => ({ type: 'quiz', questions, passPercent: 75 });

export const r = (label: string, url: string): Resource => ({ label, url });

export const quest = (
  id: string,
  title: string,
  summary: string,
  lessons: string[],
  resources: Resource[],
  practice: string,
  checkpoint: Checkpoint,
): Quest => ({ id, title, summary, lessons, resources, practice, checkpoint });

export const boss = (
  id: string,
  title: string,
  summary: string,
  lessons: string[],
  resources: Resource[],
  checkpoint: ProjectCheckpoint,
): Quest => ({
  id,
  title,
  summary,
  lessons,
  resources,
  practice: 'Build it in a public GitHub repository, set the repo description and website (live demo) fields, then submit the repo URL below.',
  checkpoint,
  boss: true,
});

export const project = (
  title: string,
  brief: string,
  requirements: string[],
  rules: Rule[],
  passPercent = 80,
): ProjectCheckpoint => ({ type: 'project', title, brief, requirements, rules, passPercent });

/* ---------- rule helpers ---------- */

type Opt = { hint?: string; optional?: boolean };

export const file = (label: string, path: RegExp, o: Opt = {}): Rule => ({ kind: 'file', label, path, ...o });

export const has = (label: string, path: RegExp, pattern: RegExp, o: Opt = {}): Rule => ({
  kind: 'contains',
  label,
  path,
  pattern,
  ...o,
});

export const count = (label: string, path: RegExp, min: number, o: Opt = {}): Rule => ({
  kind: 'fileCount',
  label,
  path,
  min,
  ...o,
});

/** Any package.json in the repo lists one of these dependencies. */
export const dep = (label: string, names: string[], o: Opt = {}): Rule => ({ kind: 'dep', label, names, ...o });

const manifest = (re: RegExp) => (label: string, pattern: RegExp, o: Opt = {}) => has(label, re, pattern, o);
export const pyDep = manifest(/(^|\/)(requirements[^/]*\.txt|pyproject\.toml|Pipfile|setup\.py)$/);
export const goDep = manifest(/(^|\/)go\.mod$/);
export const javaDep = manifest(/(^|\/)(pom\.xml|build\.gradle(\.kts)?)$/);
export const csDep = manifest(/\.csproj$/);
export const phpDep = manifest(/(^|\/)composer\.json$/);
export const rustDep = manifest(/(^|\/)Cargo\.toml$/);

export const JS = /\.(m?[jt]sx?|cjs)$/;
export const TEST_FILE = /(\.(test|spec)\.[jt]sx?$|(^|\/)(__tests__|tests?)\/.+\.[jt]sx?$)/;

export const dockerfile = (o: Opt = {}) => file('Has a Dockerfile', /(^|\/)Dockerfile$/, o);
export const ciWorkflow = (o: Opt = {}) =>
  file('Has a GitHub Actions workflow', /^\.github\/workflows\/[^/]+\.ya?ml$/, {
    hint: 'Add .github/workflows/ci.yml that runs on push / pull_request.',
    ...o,
  });
export const envExample = (o: Opt = {}) =>
  file('Documents config in .env.example', /(^|\/)\.env\.(example|sample|template)$/, {
    hint: 'Never commit secrets. Commit a .env.example listing required variables.',
    ...o,
  });

/** The baseline every portfolio project must meet. */
export const portfolio = (minCommits = 10): Rule[] => [
  {
    kind: 'readme',
    label: 'README is portfolio-ready (overview, setup, screenshot)',
    minLength: 800,
    hint: 'Include: what it is, tech stack, features, setup/run steps, and a screenshot or GIF (![...](...)).',
  },
  { kind: 'description', label: 'Repository has a description', hint: 'Set it in the repo "About" panel on GitHub.' },
  {
    kind: 'homepage',
    label: 'Live demo link set in repo "Website" field',
    hint: 'Deploy (GitHub Pages, Vercel, Netlify, Render, Fly…) and paste the URL into the About panel.',
    optional: true,
  },
  {
    kind: 'commits',
    label: `At least ${minCommits} commits (shows real progress)`,
    min: minCommits,
    hint: 'Commit in small, meaningful steps with clear messages.',
  },
  file('Has a .gitignore', /(^|\/)\.gitignore$/),
];
