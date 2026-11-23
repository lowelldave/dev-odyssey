import type { Tutorial } from '../../types';
import { q } from '../helpers';

export const GIT: Record<string, Tutorial> = {
  'git-basics': {
    goal: 'Track a project with Git: stage, commit and read history, and keep junk out with .gitignore.',
    steps: [
      {
        title: 'Install and introduce yourself',
        body: `Install Git from git-scm.com, then tell it who you are. This name and email appear on every commit.`,
        code: {
          lang: 'shell',
          src: `git --version
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main`,
        },
      },
      {
        title: 'The three areas',
        body: `Git has three places your changes live:

- Working directory: the files you are editing.
- Staging area: changes you have chosen for the next commit (\`git add\`).
- Repository: committed snapshots (\`git commit\`).

Staging lets you commit related changes together, even if you edited many files.`,
        code: {
          lang: 'shell',
          src: `mkdir quest-log && cd quest-log
git init
echo "# Quest log" > README.md
git status            # README.md is untracked
git add README.md     # stage it
git commit -m "Add README"`,
        },
      },
      {
        title: 'Reading history',
        body: `\`git log\` shows commits; \`git diff\` shows what changed and has not been staged yet.`,
        code: {
          lang: 'shell',
          src: `git log --oneline --graph
git diff              # unstaged changes
git diff --staged     # staged changes
git show HEAD         # the latest commit`,
        },
        tryIt: 'Make three small commits (edit README, add a file, edit again) and view them with `git log --oneline`.',
      },
      {
        title: 'Ignore what does not belong',
        body: `\`.gitignore\` lists files Git should never track: dependencies, build output, secrets and OS clutter.

Write commit messages in the imperative, like a command: "Add login form", not "added stuff".`,
        code: {
          lang: 'gitignore',
          caption: '.gitignore',
          src: `node_modules/
dist/
.env
.DS_Store
*.log`,
        },
      },
    ],
    mistakes: [
      'Committing `node_modules` or `.env` files.',
      'Vague messages like "fix" or "update": your future self needs to know why.',
      'Huge commits that mix unrelated changes.',
    ],
    recap: [
      'Working directory → `git add` → staging → `git commit` → repository.',
      '`git status`, `log`, and `diff` show where things are.',
      '`.gitignore` keeps junk and secrets out.',
    ],
    quiz: [
      q('Which command moves changes into the staging area?', ['git commit', 'git add', 'git push', 'git stage-all'], 1),
      q('Which file tells Git which files to ignore?', ['.gitkeep', '.gitignore', '.ignore', 'git.config'], 1),
      q('What does `git status` show?', ['The remote URL', 'Changed, staged and untracked files', 'Commit authors', 'Branch protection rules'], 1),
      q('Which is the best commit message?', ['stuff', 'fixed it', 'Add email validation to signup form', 'asdf'], 2),
      q('Which command shows staged changes that are not yet committed?', ['git diff', 'git diff --staged', 'git log', 'git show'], 1),
    ],
  },

  branching: {
    goal: 'Work on features in branches, merge them back, resolve conflicts, and know when to rebase.',
    steps: [
      {
        title: 'Branches are cheap pointers',
        body: `A branch is just a movable pointer to a commit. Create one per feature so \`main\` always stays working.`,
        code: {
          lang: 'shell',
          src: `git switch -c feature/dark-mode   # create and switch
# ...edit files, commit...
git switch main                   # go back
git branch                        # list branches`,
        },
      },
      {
        title: 'Merging',
        body: `Merging brings another branch's commits into the current one. If \`main\` has not moved, Git simply fast-forwards; otherwise it creates a merge commit joining both histories.`,
        code: {
          lang: 'shell',
          src: `git switch main
git merge feature/dark-mode
git branch -d feature/dark-mode   # delete the merged branch`,
        },
      },
      {
        title: 'Resolving a conflict',
        body: `A conflict happens when both branches changed the same lines. Git marks the file; you decide what the final version is, delete the markers, then stage and commit.`,
        code: {
          lang: 'text',
          src: `<<<<<<< HEAD
<h1>Welcome, hero</h1>
=======
<h1>Welcome, adventurer</h1>
>>>>>>> feature/copy

# keep the line you want (or combine them), delete the markers, then:
git add index.html
git commit`,
        },
        tryIt: 'Create two branches that edit the same line of a file, merge them, and resolve the conflict.',
      },
      {
        title: 'Rebase: replaying your work',
        body: `\`git rebase main\` replays your branch's commits on top of the latest \`main\`, giving a straight history. The golden rule: never rebase commits that other people already pulled, because it rewrites history.`,
        code: {
          lang: 'shell',
          src: `git switch feature/search
git fetch origin
git rebase origin/main
# fix any conflicts, then: git add <file> && git rebase --continue`,
        },
      },
    ],
    mistakes: [
      'Working directly on `main` for everything.',
      'Committing files that still contain `<<<<<<<` conflict markers.',
      'Rebasing a shared branch and force-pushing over teammates’ work.',
    ],
    recap: [
      'One branch per feature; `git switch -c` creates it.',
      'Merge joins histories; conflicts are edited, staged and committed.',
      'Rebase only your own, unshared commits.',
    ],
    quiz: [
      q('Which command creates and switches to a new branch?', ['git branch -d x', 'git switch -c x', 'git merge x', 'git fetch x'], 1),
      q('What does rebase do?', ['Deletes a branch', 'Replays your commits on top of another base', 'Pushes to the remote', 'Undoes the last commit'], 1),
      q('The golden rule of rebasing is…', ['Always rebase main', 'Never rebase public/shared history', 'Rebase only on Fridays', 'Rebase deletes conflicts'], 1),
      q('After fixing a conflict in a file you should…', ['git reset --hard', 'git add the file and continue the merge/rebase', 'Delete the repo', 'git push --force immediately'], 1),
      q('What is a Git branch, technically?', ['A full copy of the project', 'A movable pointer to a commit', 'A zip file', 'A remote server'], 1),
    ],
  },

  github: {
    goal: 'Push your work to GitHub, open a pull request, review it, and contribute to someone else’s project.',
    steps: [
      {
        title: 'Connect a remote and push',
        body: `Create an empty repository on GitHub (no README), then connect your local repo and push. \`-u\` remembers the link so later you just type \`git push\`.`,
        code: {
          lang: 'shell',
          src: `git remote add origin https://github.com/<you>/quest-log.git
git push -u origin main

# later
git pull      # fetch + merge others' changes
git push`,
        },
      },
      {
        title: 'Open a pull request',
        body: `Push a feature branch and GitHub offers to open a pull request (PR). A PR proposes merging your branch and is where code review happens.

A good PR is small and focused, has a clear title, and explains what changed, why, and how to test it.`,
        code: {
          lang: 'markdown',
          caption: 'A PR description template',
          src: `## What
Adds a dark-mode toggle to the header.

## Why
Players asked for a night theme (#12).

## How to test
1. Run \`npm run dev\`
2. Click the 🌙 button: colours switch and persist after reload`,
        },
      },
      {
        title: 'Review and merge',
        body: `Reviewers leave comments on lines, suggest changes, and approve. You push more commits to the same branch to address feedback; the PR updates automatically. Then merge (squash merge keeps \`main\` tidy) and delete the branch.`,
        tryIt: 'Open a PR on your own repo from a feature branch, review it yourself with at least two comments, then merge it.',
      },
      {
        title: 'Contributing to open source',
        body: `For repos you cannot push to: fork → clone your fork → branch → commit → push to your fork → open a PR to the original. Look for issues labelled "good first issue".`,
        code: {
          lang: 'shell',
          src: `git clone https://github.com/<you>/<their-repo>.git
git remote add upstream https://github.com/<owner>/<their-repo>.git
git fetch upstream && git rebase upstream/main   # stay up to date`,
        },
      },
    ],
    mistakes: [
      'Giant PRs that touch everything: nobody can review them properly.',
      'Pushing secrets: GitHub scans for them, but rotate any key that leaks.',
    ],
    recap: [
      '`git remote add origin` + `git push -u origin main` publishes a repo.',
      'PRs are small, described, reviewed, then merged.',
      'Open source: fork, branch, PR.',
    ],
    quiz: [
      q('What does `git pull` do?', ['Uploads commits', 'Fetches and integrates remote changes', 'Creates a PR', 'Deletes remote branches'], 1),
      q('What is a fork?', ['A branch on your machine', 'Your own copy of someone else’s repo on GitHub', 'A merge conflict', 'A tag'], 1),
      q('A good pull request is…', ['As large as possible', 'Small, focused and explains why', 'Without a description', 'Merged without review'], 1),
      q('What does `git push -u origin main` set up?', ['A new remote', 'Upstream tracking for the branch', 'A tag', 'A fork'], 1),
      q('How do you respond to review feedback on an open PR?', ['Close it and open a new one', 'Push more commits to the same branch', 'Email the reviewer a zip', 'Force-push to main'], 1),
    ],
  },

  npm: {
    goal: 'Set up a JavaScript project with npm: dependencies, scripts, semantic versions, and automatic linting and formatting.',
    steps: [
      {
        title: 'package.json',
        body: `\`npm init -y\` creates \`package.json\`, the project's manifest: name, scripts and dependencies. Install Node.js (LTS) first; npm comes with it.`,
        code: {
          lang: 'shell',
          src: `mkdir toolkit && cd toolkit
npm init -y
npm install chalk              # runtime dependency
npm install -D eslint prettier # dev-only tools`,
        },
      },
      {
        title: 'Dependencies and semantic versioning',
        body: `Versions are MAJOR.MINOR.PATCH: breaking changes, new features, bug fixes. \`^1.4.2\` accepts any \`1.x.x\` at or above 1.4.2; \`~1.4.2\` accepts only \`1.4.x\`.

Commit \`package-lock.json\`: it pins exact versions so everyone installs the same tree. Never commit \`node_modules\`.`,
        code: {
          lang: 'json',
          src: `{
  "dependencies": { "chalk": "^5.3.0" },
  "devDependencies": { "eslint": "^9.0.0", "prettier": "^3.3.0" }
}`,
        },
      },
      {
        title: 'Scripts',
        body: `Scripts give your team the same commands. Run them with \`npm run <name>\` (\`npm test\` and \`npm start\` work without "run").`,
        code: {
          lang: 'json',
          src: `{
  "scripts": {
    "start": "node src/index.js",
    "lint": "eslint .",
    "format": "prettier --write .",
    "test": "node --test"
  }
}`,
        },
        tryIt: 'Add the scripts above and run `npm run lint` and `npm run format`.',
      },
      {
        title: 'Linting and formatting',
        body: `ESLint finds bugs and bad patterns; Prettier formats code consistently. Running both in CI keeps the codebase clean without arguments over style.`,
        code: {
          lang: 'js',
          caption: 'eslint.config.js',
          src: `import js from '@eslint/js';

export default [
  js.configs.recommended,
  { rules: { 'no-unused-vars': 'warn' } },
];`,
        },
      },
    ],
    mistakes: [
      'Putting build tools in `dependencies` instead of `devDependencies`.',
      'Deleting the lockfile to "fix" problems: it hides the real cause.',
    ],
    recap: [
      '`package.json` lists scripts and dependencies; the lockfile pins exact versions.',
      'Semver: MAJOR.MINOR.PATCH; `^` allows minor updates.',
      'ESLint finds problems, Prettier formats.',
    ],
    quiz: [
      q('Where should a tool like ESLint be listed?', ['dependencies', 'devDependencies', 'peerDependencies', 'scripts'], 1),
      q('In semver "^1.4.2", which updates are allowed?', ['Any version', '1.x.x (minor and patch)', 'Only 1.4.x', 'Only 1.4.2'], 1),
      q('Why commit package-lock.json?', ['Git requires it', 'For reproducible installs across machines', 'It speeds up the browser', 'To hide dependencies'], 1),
      q('Prettier is mainly a…', ['Bundler', 'Code formatter', 'Test runner', 'Package manager'], 1),
      q('Which command runs a script named "lint"?', ['npm lint', 'npm run lint', 'node lint', 'npx run lint'], 1),
    ],
  },

  boss: {
    goal: 'Publish a genuinely useful Node.js command-line tool with a professional Git history: branches, pull requests, linting, a changelog and a license.',
    steps: [
      {
        title: 'Choose a tool and scaffold',
        body: `Ideas: a markdown link checker, a project scaffolder, a git-stats reporter, or a TODO-comment finder. Create the repo, run \`npm init -y\`, and set \`"type": "module"\`.`,
      },
      {
        title: 'Make it executable',
        body: `A \`bin\` entry plus a shebang line turns your script into a command. \`npm link\` installs it globally on your machine for testing.`,
        code: {
          lang: 'js',
          caption: 'bin/todo-finder.js',
          src: `#!/usr/bin/env node
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const dir = process.argv[2] ?? '.';
for (const file of await readdir(dir, { recursive: true })) {
  if (!file.endsWith('.js')) continue;
  const text = await readFile(path.join(dir, file), 'utf8');
  text.split('\\n').forEach((line, i) => {
    if (line.includes('TODO')) console.log(\`\${file}:\${i + 1}  \${line.trim()}\`);
  });
}`,
        },
      },
      {
        title: 'Wire up package.json',
        body: `Add the \`bin\`, scripts, and ESLint + Prettier as dev dependencies.`,
        code: {
          lang: 'json',
          src: `{
  "name": "todo-finder",
  "version": "1.0.0",
  "type": "module",
  "bin": { "todo-finder": "bin/todo-finder.js" },
  "scripts": {
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}`,
        },
      },
      {
        title: 'Work like a team',
        body: `Build every feature on its own branch (\`feature/ignore-node-modules\`, \`feature/json-output\`…) and merge each one through a pull request with a description. Aim for 15+ meaningful commits.`,
        tryIt: 'Add a `--json` flag on a feature branch, open a PR, review it, and merge it.',
      },
      {
        title: 'Release-ready files',
        body: `Add \`CHANGELOG.md\` (list what changed per version), a \`LICENSE\` (MIT is common, and GitHub can generate it), and a README with install and usage examples plus a terminal screenshot or GIF. Then submit the repo.`,
        code: {
          lang: 'markdown',
          caption: 'CHANGELOG.md',
          src: `# Changelog

## 1.1.0
- Add \`--json\` output flag

## 1.0.0
- First release: find TODO comments in .js files`,
        },
      },
    ],
    mistakes: [
      'Forgetting the `#!/usr/bin/env node` shebang, so the command does not run.',
      'Committing straight to main: the review looks for real branch + PR history.',
    ],
    recap: [
      'A `bin` entry + shebang makes a CLI.',
      'Lint/format scripts, lockfile, CHANGELOG and LICENSE.',
      'Features merged through pull requests.',
    ],
  },
};
