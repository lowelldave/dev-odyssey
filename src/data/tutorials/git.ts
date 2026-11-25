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
      q('Which command moves changes into the staging area?', ['git commit', 'git push', 'git add', 'git stage-all'], 2, '`git add` stages changes so the next commit includes them; `git commit` then records what is staged.', 'It is the step before committing.'),
      q('Which file tells Git which files to ignore?', ['.gitkeep', '.gitignore', '.ignore', 'git.config'], 1, '`.gitignore` lists patterns for files Git should not track, such as `node_modules/` and build output.', 'The file name literally says what it does.'),
      q('What does `git status` show?', ['The remote URL', 'Branch protection rules and reviewers', 'Commit authors', 'Changed, staged and untracked files'], 3, 'It summarises the state of your working directory and staging area.', 'Run it whenever you are unsure what state you are in.'),
      q('Which is the best commit message?', ['stuff', 'fixed the thing that was broken yesterday', 'Add email validation to signup form', 'asdf'], 2, 'A good message is short, in the imperative and says what changed, so history reads like a changelog.', 'Would a teammate understand it six months later?'),
      q('Which command shows staged changes that are not yet committed?', ['git diff --staged', 'git log --stat --oneline -1', 'git log', 'git show'], 0, 'Plain `git diff` shows unstaged edits; `--staged` (or `--cached`) shows what is queued for the next commit.', 'You need a flag to look at the staging area.'),
      q('What does `git init` do?', ['Downloads a copy of a remote repository to your local disk', 'Installs Git', 'Creates a GitHub account', 'Creates a new Git repository in the current folder'], 3, 'It sets up the hidden `.git` directory that stores history for the project.', 'It is the very first command in a new project.'),
      q('What does `git commit -m "message"` do?', ['Uploads the changes to GitHub straight away', 'Records the staged changes as a new commit with that message', 'Stages every modified file automatically', 'Deletes all of the changes in the working directory after saving them'], 1, 'A commit saves a snapshot of what is staged locally. Nothing reaches a remote until you push.', 'It records locally and does not upload.'),
      q('What is a Git commit?', ['A copy of the whole repository on GitHub', 'A snapshot of the project with a message, author and link to its parent', 'A temporary note kept only in your editor', 'A movable name that always points at the latest work on a branch of the repo'], 1, 'Each commit identifies a project state and points to its parent commit(s), forming the history.', 'It is a point in history.'),
      q('Which command shows history with one line per commit?', ['git show --all --stat', 'git history', 'git status -s', 'git log --oneline'], 3, '`git log --oneline` prints a short hash and message for each commit.', 'It is a flag on the history command.'),
      q('You edited a file but have not staged it. Which command shows what changed?', ['git diff', 'git status --diff', 'git log -p --staged', 'git blame'], 0, 'Plain `git diff` compares the working directory with the staging area.', 'Compare, without any flags.'),
      q('Which command unstages a file but keeps your edits?', ['git restore <file> --hard now', 'git rm <file>', 'git restore --staged <file>', 'git clean -f'], 2, '`git restore --staged` moves the file back out of the staging area without touching the working copy.', 'It restores the staging area, not the file contents.'),
      q('Which command discards uncommitted edits to a tracked file (irreversibly)?', ['git commit --amend', 'git add <file>', 'git stash pop', 'git restore <file>'], 3, '`git restore <file>` resets the working copy to the last committed or staged version, so the edits are lost.', 'It restores the file to a known state.'),
      q('You made a typo in your latest commit message and have not pushed. What is the simplest fix?', ['git revert HEAD', 'git commit --amend', 'git reset --hard', 'Delete the repository'], 1, '`git commit --amend` rewrites the most recent commit, which is safe while it is still local.', 'You want to modify the last commit rather than add one.'),
      q('Which command copies an existing remote repository to your machine?', ['git copy', 'git fetch', 'git clone', 'git init'], 2, '`git clone <url>` downloads the full history and sets up the `origin` remote.', 'It creates a duplicate on your computer.'),
      q('What is `HEAD`?', ['A pointer to the commit (usually via a branch) you currently have checked out', 'The very first commit that was ever made in the whole repository history', 'The remote repository that you cloned from', 'The most recent tag that was created'], 0, 'HEAD says where you are in history; new commits are added on top of it.', 'It marks your current position.'),
      q('You add `dist/` to `.gitignore` after `dist/` was already committed. What happens to the tracked files?', ['They stay tracked until removed with `git rm --cached`', 'They are untracked automatically on the next commit', 'Git deletes them', 'Git refuses to commit'], 0, '.gitignore only affects untracked files. Remove already tracked ones from the index with `git rm -r --cached dist`.', 'Ignoring only applies to files Git is not yet tracking.'),
      q('What does `git add -p` let you do?', ['Push all of your local branches in one go to the remote', 'Add a plugin to extend Git’s features', 'Choose which chunks (hunks) of a file to stage', 'Publish a package to the npm registry'], 2, 'Patch mode steps through changes so you can build focused commits from messy edits.', 'The flag stands for a word that describes partial changes.'),
      q('What does `git stash` do?', ['Deletes all uncommitted work permanently', 'Temporarily shelves uncommitted changes so you can return to a clean state', 'Pushes the changes you have made on to the remote repository straight away', 'Creates a new branch from the current one'], 1, 'Use `git stash` before switching context and `git stash pop` to bring the changes back.', 'Think of putting work in a drawer for later.'),
      q('How do Git and GitHub relate?', ['They are the same tool', 'Git only works with GitHub', 'GitHub is the command-line tool, while Git is the website that hosts repositories, together', 'Git is the version-control tool; GitHub is a hosting service built around Git repositories'], 3, 'Git works entirely offline on your machine. GitHub (like GitLab or Bitbucket) hosts remotes and adds collaboration features.', 'One runs on your computer; the other is a website.'),
      q('Which file should never be committed to a public repository?', ['README.md', 'package.json with its scripts', '.env containing real API keys', 'LICENSE'], 2, 'Secrets in history are exposed to everyone and are hard to remove, so keep them out and commit a `.env.example` instead.', 'Which file might unlock someone’s account?'),
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
      q('Which command creates and switches to a new branch?', ['git switch -c x', 'git branch -d x', 'git merge x', 'git fetch x'], 0, '`git switch -c x` creates the branch and checks it out in one step (the older equivalent is `git checkout -b x`).', 'The flag stands for “create”.'),
      q('What does rebase do?', ['Deletes a branch once it has been merged', 'Undoes the last commit and keeps its changes', 'Pushes your commits to the remote repository', 'Replays your commits on top of another base'], 3, 'Rebase re-applies your commits one by one onto a new starting point, producing a linear history.', 'Your commits get a new base.'),
      q('The golden rule of rebasing is…', ['Always rebase main', 'Never rebase public/shared history', 'Rebase only on Fridays', 'Rebase deletes all conflicts for you'], 1, 'Rebasing rewrites commits, which causes trouble for anyone who already based work on the old ones.', 'Rewriting history affects collaborators.'),
      q('After fixing a conflict in a file you should…', ['git reset --hard', 'git add the file and continue the merge/rebase', 'Delete the repo', 'git push --force immediately afterwards, without any checks'], 1, 'Staging the resolved file tells Git it is fixed; then complete the merge commit or run `git rebase --continue`.', 'Git needs to be told the conflict is resolved.'),
      q('What is a Git branch, technically?', ['A full copy of the project folder', 'A remote server', 'A zip file', 'A movable pointer to a commit'], 3, 'Branches are lightweight references, which is why creating them is nearly instant.', 'It is tiny; it is not a copy of anything.'),
      q('Which command lists your local branches?', ['git branch', 'git list', 'git remote -v', 'git log --branches-only'], 0, '`git branch` prints local branches and marks the current one with an asterisk.', 'The same noun as the thing being listed.'),
      q('When can Git merge with a fast-forward?', ['When both branches changed the same files differently', 'Only when the merge produces conflicts that need resolving', 'When the target branch has not diverged, so its tip is an ancestor of the branch being merged', 'Only when the two branches have completely different names from each other, or no common ancestor'], 2, 'A fast-forward just moves the branch pointer forward, creating no merge commit.', 'It depends on whether histories have split.'),
      q('What do the lines `<<<<<<<`, `=======` and `>>>>>>>` in a file mean?', ['Syntax errors reported by the compiler in that file', 'Debug logging written by a running application', 'Comments that Git adds to document the file’s full history', 'Conflict markers separating the two competing versions'], 3, 'Git writes both versions into the file; you edit it to the final result and delete the markers.', 'They appear only after a merge goes wrong.'),
      q('Which command abandons a merge that is in progress and returns to the pre-merge state?', ['git reset --soft HEAD~1', 'git merge --abort', 'git stash drop', 'git revert HEAD'], 1, 'It restores your branch to how it was before you began the merge.', 'The flag says to stop.'),
      q('Which command deletes a local branch that has already been merged?', ['git rm feature', 'git switch -d feature', 'git branch -d feature', 'git delete feature'], 2, '`-d` refuses to delete unmerged work; `-D` forces it.', 'The flag is the first letter of the action.'),
      q('What does `git merge --no-ff feature` do?', ['Forces a merge commit even when a fast-forward is possible', 'Skips the merge and leaves both branches unchanged, with a warning', 'Deletes the feature branch after merging it', 'Rebases the feature branch onto the current branch'], 0, 'It keeps an explicit merge commit so the feature’s history stays visible as a group.', 'The flag opposes the usual shortcut.'),
      q('You are on `feature`. Which command replays its commits on top of the latest `main`?', ['git rebase main', 'git merge --squash', 'git checkout main', 'git reset main'], 0, '`git rebase main` moves your branch’s commits so they start from the tip of `main`.', 'The branch you name is the new base.'),
      q('Which command copies a single commit from another branch onto the current branch?', ['git rebase <hash> onto it', 'git copy <hash>', 'git cherry-pick <hash>', 'git stash <hash>'], 2, 'Cherry-picking applies one commit’s changes as a new commit on your branch.', 'It involves selecting one item from a bunch.'),
      q('What does `git switch main` do?', ['Deletes main', 'Changes your working directory to the `main` branch', 'Merges main into whichever branch you are currently on', 'Pushes to main'], 1, 'It checks out `main`, updating files to match that branch’s latest commit.', 'You are moving, not merging.'),
      q('Why are short-lived feature branches preferred?', ['They keep the repository’s disk usage low', 'GitHub requires branches to be deleted within a week', 'Git limits how long a branch may exist before merging', 'They reduce merge conflicts and make reviews easier'], 3, 'The longer a branch lives, the further it drifts from main and the harder it is to integrate.', 'Think about how far the branches can drift apart.'),
      q('You are on `main` and run `git merge feature`. What happens?', ['`main` changes are copied into `feature`', '`feature`’s changes are brought into `main`', 'Both branches are deleted', 'Nothing, merging needs a remote'], 1, 'You merge into the branch you are currently on.', 'The checked-out branch receives the changes.'),
      q('What does `git rebase -i HEAD~3` let you do?', ['Download the three most recent commits from a remote', 'Delete the last three branches you created', 'Reorder, squash or edit the last three commits', 'Revert the repository to its state three days ago'], 2, 'Interactive rebase opens a list of commits so you can tidy local history before sharing it.', 'The `-i` stands for “interactive”.'),
      q('What does `git log --graph --oneline --all` show?', ['A text diagram of branches and merges across all refs', 'Only the commits on the branch you are currently on, not remote ones', 'The size of every file in the repository', 'The URLs of all configured remotes'], 0, 'It is a handy way to visualise how branches diverge and merge.', 'The `--graph` flag is the clue.'),
      q('What is `origin/main`?', ['A branch on your remote that you must edit directly with a text editor or an IDE', 'A merge strategy', 'A tag', 'Your local, read-only copy of where `main` was on the remote at the last fetch'], 3, 'Remote-tracking branches record the remote’s state and update when you fetch or pull.', 'It is local knowledge about the remote.'),
      q('What is a “detached HEAD”?', ['A corrupted repository that has to be cloned again from the remote server to recover it', 'HEAD points straight at a commit instead of a branch, so new commits can be lost unless you create a branch', 'A branch that has been deleted from the remote', 'A remote repository that has no commits yet'], 1, 'It happens when you check out a commit or tag directly. Run `git switch -c name` to keep any work you do.', 'HEAD is not on any branch.'),
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
      q('What does `git pull` do?', ['Uploads commits', 'Fetches and integrates remote changes', 'Creates a PR', 'Deletes remote branches that have merged'], 1, '`git pull` is `git fetch` followed by merging (or rebasing) the fetched commits into your branch.', 'It brings changes down to your branch.'),
      q('What is a fork?', ['A branch that exists only on your own machine and nowhere else', 'A named label attached to a particular commit', 'A conflict between two merged branches', 'Your own copy of someone else’s repo on GitHub'], 3, 'Forking gives you a copy you can push to, from which you can open pull requests back to the original.', 'You get a repo under your own account.'),
      q('A good pull request is…', ['Small, focused and explains why', 'As large as possible', 'Without any description at all given', 'Merged without review'], 0, 'Small, well-described PRs are reviewed faster and are easier to revert.', 'Reviewers are humans with limited time.'),
      q('What does `git push -u origin main` set up?', ['A brand new remote repository on GitHub', 'A tag', 'Upstream tracking for the branch', 'A fork'], 2, 'After `-u`, plain `git push` and `git pull` know which remote branch to use.', 'It links your local branch to a remote one.'),
      q('How do you respond to review feedback on an open PR?', ['Close the pull request and open a new one', 'Force-push to main', 'Email the reviewer a zip', 'Push more commits to the same branch'], 3, 'New commits on the PR branch update the existing pull request automatically.', 'The PR follows the branch it is built from.'),
      q('What does `git remote add origin <url>` do?', ['Pushes your local code to a remote server', 'Registers a remote repository under the name origin', 'Creates a brand-new repository on GitHub for you', 'Makes a full copy of the remote repository locally on disk'], 1, 'It stores the URL so later commands can refer to it by name; creating the repo itself happens on GitHub.', 'It records a name for a URL.'),
      q('What is the difference between `git fetch` and `git pull`?', ['They are identical and used interchangeably', 'Fetch uploads your commits to the server and pull downloads those of others', 'Fetch downloads remote changes without merging; pull also integrates them', 'Pull only works on repositories that are forks'], 2, 'Fetch is the safe way to look at what changed before deciding how to integrate it.', 'One of them stops short of changing your branch.'),
      q('What is the standard flow for contributing to an open-source project you cannot push to?', ['Fork the repo, create a branch, push, then open a pull request', 'Email a patch file to the owner and wait for them', 'Edit the main branch of the original repository', 'Commit directly to the original repository’s default branch'], 0, 'Forking gives you write access to your own copy, and a PR proposes the change upstream.', 'You first need somewhere you are allowed to push.'),
      q('What is a draft pull request?', ['A PR marked as work in progress that cannot be merged until it is marked ready', 'A PR that was closed and deleted by its author before anyone reviewed it or merged it', 'A PR that comes from a fork of the repository', 'A PR that has no commits and no description'], 0, 'Drafts let you share work early without requesting final review.', 'It signals that the work is not finished.'),
      q('Which text in a PR description automatically closes issue #12 when the PR is merged?', ['See #12', 'Issue-12', 'Fixes #12', 'Re: 12'], 2, 'Keywords like “Fixes”, “Closes” and “Resolves” link and close the issue on merge into the default branch.', 'Use a verb that says the problem is solved.'),
      q('Which file conventionally explains how to contribute to a project?', ['CHANGELOG.md', 'CONTRIBUTING.md', 'LICENSE', '.gitattributes file'], 1, 'GitHub surfaces `CONTRIBUTING.md` to people opening issues or PRs.', 'The file name is a verb in -ing form.'),
      q('What can branch protection rules enforce?', ['Faster builds on every pull request', 'Free hosting for the repository’s documentation and wiki pages', 'Automatic code formatting on each push', 'Required reviews and passing status checks before merging'], 3, 'They can also block force pushes and direct pushes to important branches.', 'They guard important branches before changes land.'),
      q('What are GitHub Issues mainly for?', ['Hosting files and large binary assets', 'Running automated tests on every push', 'Tracking bugs, tasks and feature requests', 'Deploying the site to production servers directly'], 2, 'Issues give a discussion thread and status for each piece of work and can be linked to PRs.', 'Think of a to-do list that everyone can see.'),
      q('What does “Squash and merge” do?', ['Combines all of the PR’s commits into one commit on the base branch', 'Deletes the branch’s history from the repository after the merge completes', 'Rebases the main branch onto the pull request', 'Closes the pull request without merging anything'], 0, 'It keeps the base branch history tidy at the cost of the PR’s individual commits.', 'Many commits become a single one.'),
      q('`git push` is rejected because the remote has commits you do not have. What should you do?', ['Force push at once so that the remote is overwritten by your local branch', 'Create a new repository and push there instead', 'Delete the remote branch and recreate it', 'Pull (fetch and integrate) the remote changes, then push again'], 3, 'Integrate the remote work first so you do not overwrite your teammates’ commits.', 'You are behind the remote.'),
      q('GitHub no longer accepts account passwords for Git over HTTPS. What do you use instead?', ['Your GitHub email address and a short PIN', 'A personal access token, SSH key or credential manager', 'Nothing, because public repos need no authentication to push', 'A browser cookie copied from your logged-in session'], 1, 'Tokens and SSH keys can be scoped and revoked without changing your account password.', 'Authentication moved away from passwords entirely.'),
      q('Which is the most helpful kind of code review comment?', ['A blunt comment such as “This is bad.”', 'A specific, respectful suggestion that explains why', 'Approving it without reading the diff', 'Telling the author to rewrite everything from scratch'], 1, 'Actionable, kind feedback helps authors improve and keeps reviews productive.', 'Good feedback is something the author can act on.'),
      q('How does `git push --force-with-lease` differ from `--force`?', ['It is slower but behaves identically to force on any remote', 'It skips authentication on the remote', 'It also deletes the remote branch afterwards', 'It refuses to overwrite remote commits you have not seen'], 3, 'It aborts if someone else pushed in the meantime, so you do not destroy their work.', 'It adds a safety check about the remote’s state.'),
      q('What does a `CODEOWNERS` file do?', ['Automatically requests reviews from the owners of the changed paths', 'Lists the licence the project is published under', 'Blocks forks of the repository from being created by outside contributors', 'Grants admin rights to everyone who contributes'], 0, 'Matching owners are requested as reviewers on PRs that touch their files.', 'It maps files to people who should look at them.'),
      q('A PR shows a merge conflict. What does that mean?', ['The pull request has too many commits to be merged into the base branch at all, ever', 'The repository has been made private', 'The base branch and the PR changed the same lines in different ways and a person must resolve it', 'The automated tests failed on the PR'], 2, 'Resolve by merging or rebasing the base branch into your branch, fixing the conflict markers and pushing.', 'Two sets of edits overlap.'),
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
      q('Where should a tool like ESLint be listed?', ['dependencies', 'scripts', 'peerDependencies', 'devDependencies'], 3, 'Tools only needed during development, testing and building belong in `devDependencies`.', 'Is it needed when the app runs for users?'),
      q('In semver "^1.4.2", which updates are allowed?', ['Any 1.x or 2.x version of it', '1.x.x (minor and patch)', 'Only 1.4.x', 'Only 1.4.2'], 1, 'The caret allows updates that do not change the left-most non-zero number, so 1.4.2 can become 1.9.0 but not 2.0.0.', 'It keeps the major version fixed.'),
      q('Why commit package-lock.json?', ['Git requires it', 'It speeds up the browser’s page loads and caching', 'For reproducible installs across machines', 'To hide dependencies'], 2, 'The lockfile records exact resolved versions so everyone and CI install the same tree.', 'Think about “works on my machine”.'),
      q('Prettier is mainly a…', ['Code formatter', 'Bundler', 'Test runner', 'Package manager'], 0, 'Prettier rewrites code to a consistent style so reviews focus on logic instead of formatting.', 'The name hints at making code look nice.'),
      q('Which command runs a script named "lint"?', ['npm run lint', 'npm lint', 'node lint', 'npx run lint'], 0, 'Custom scripts run with `npm run <name>`; only a few built-ins (`start`, `test`) have shortcuts.', 'Custom script names need a keyword in front.'),
      q('What does `npm install lodash` do?', ['Installs it globally for every project on the machine, not the current project', 'Removes it from node_modules and package.json', 'Downloads it, adds it to dependencies and updates the lockfile', 'Runs the package’s main script once'], 2, 'Packages are saved to `node_modules`, recorded in package.json and pinned in the lockfile.', 'Three files or folders change.'),
      q('Which command installs a package as a development-only dependency?', ['npm install --prod vitest', 'npm install -D vitest', 'npm dev vitest', 'npm add-dev vitest'], 1, '`-D` (or `--save-dev`) records it under `devDependencies`.', 'The flag is short for “development”.'),
      q('Which command installs exactly what the lockfile says and fails if it is out of sync, ideal for CI?', ['npm start', 'npm update', 'npm audit fix', 'npm ci'], 3, '`npm ci` does a clean, reproducible install and deletes `node_modules` first.', 'It stands for “clean install”.'),
      q('In semver, what does "~1.4.2" allow?', ['Any version', 'Any minor update at all, including breaking ones', 'Patch updates only (1.4.x)', 'Only 1.4.2'], 2, 'The tilde allows patch-level changes but not a new minor version.', 'It is stricter than the caret.'),
      q('Should the `node_modules` folder be committed?', ['No, it is regenerated from package.json and the lockfile and belongs in .gitignore', 'Yes, so that installs are faster for new contributors who join the team later on, too', 'Only on the main branch, never on feature branches', 'Only in CI, where the folder is needed for builds'], 0, 'It is huge and reproducible, so keep it out of version control.', 'It can be rebuilt from other files.'),
      q('What does `npx` do?', ['Uninstalls any packages in the project that you no longer use at all', 'Starts the project’s development server', 'Publishes your package to the npm registry', 'Runs a package’s command, downloading it temporarily if needed'], 3, 'It is handy for one-off tools like `npx create-vite` without installing globally.', 'The x stands for something like execute.'),
      q('Which command checks installed dependencies for known security vulnerabilities?', ['npm verify', 'npm audit', 'npm lint', 'npm safe'], 1, '`npm audit` compares your dependency tree to an advisory database.', 'A financial-sounding review.'),
      q('What does `npm run dev` look for?', ['A file named dev.js in the project root folder or in src', 'An entry named "dev" in the `scripts` of package.json', 'A globally installed command called dev', 'A branch named dev in the repository'], 1, 'Scripts are named commands defined in package.json that npm runs with your local binaries available.', 'It is configured in a JSON file.'),
      q('What does `npm outdated` show?', ['Failed tests', 'Deprecated Node versions installed here', 'Unused files', 'Packages with a newer version available'], 3, 'It compares your installed versions to the latest and the range allowed by package.json.', 'It tells you where you have fallen behind.'),
      q('According to semver, what does a MAJOR version bump (2.0.0 to 3.0.0) signal?', ['Backwards-incompatible changes', 'Only bug fixes', 'New features that are compatible', 'A faster build'], 0, 'Major releases may break existing usage, so read the changelog before upgrading.', 'It is the number that can break your code.'),
      q('Before adding a new dependency, which check is most useful?', ['Whether it was published this week', 'Whether its name is easy to remember and its logo looks professional', 'Whether it is maintained, widely used and free of known vulnerabilities', 'Whether the project has a nice logo'], 2, 'Every dependency is code you are trusting; unmaintained or tiny packages add supply-chain and upgrade risk.', 'You are trusting someone else’s code.'),
      q('What does ESLint do?', ['Formats whitespace, quotes and line breaks across the whole code base', 'Runs your unit tests in watch mode', 'Bundles your JavaScript for the browser', 'Statically analyses code for likely bugs and rule violations'], 3, 'ESLint catches problems such as unused variables or unsafe patterns before the code runs.', 'It reads your code without executing it.'),
      q('What does `"type": "module"` in package.json do?', ['Installs modules automatically on every run', 'Makes `.js` files load as ES modules', 'Disables imports', 'Marks the package as private'], 1, 'In Node it makes `.js` files use `import`/`export` instead of CommonJS `require`.', 'It chooses between two module systems.'),
      q('What does `npm init -y` do?', ['Installs every package that most projects use', 'Initialises a Git repository', 'Creates a package.json with default answers', 'Publishes the package'], 2, 'The `-y` flag accepts all defaults so you can start immediately.', 'The flag means “yes to all prompts”.'),
      q('What does `npm uninstall <pkg>` do?', ['Removes the package from node_modules and package.json', 'Deletes the whole project folder from your disk and the lockfile', 'Only hides it from the editor’s search', 'Clears the npm cache on your machine'], 0, 'It also updates the lockfile so the dependency is gone for everyone.', 'It reverses installing.'),
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
