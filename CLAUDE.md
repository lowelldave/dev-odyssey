# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Dev Odyssey is a JRPG-styled, client-only learning roadmap: 38 "areas" (islands) of sequential quests across 4 regions. Each quest ends in a quiz or a boss project, and the boss project is graded rule-by-rule against a public GitHub repo. There is no backend: all progress lives in `localStorage`. The app is deployed to GitHub Pages at https://lowelldave.github.io/dev-odyssey/.

## Commands

```bash
npm install
npm run dev        # Vite dev server on http://localhost:5173 (.claude/launch.json entry "dev-odyssey")
npm run build      # tsc -b && vite build, outputs the static site to dist/
npm run typecheck  # tsc -b --noEmit
npm run preview    # serve the built dist/
```

There is no test runner and no linter. Verify changes with `npm run typecheck` and `npm run build`, plus the dev-mode content check (below) in the browser console. Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`.

Stack: Vite 5, React 18, TypeScript 5 (strict), react-router-dom 6 (`HashRouter`, required for Pages), zustand 5 with `persist`, and plain CSS. `vite.config.ts` uses `base: './'`, so assets resolve relative to the page.

## Architecture

### Content is data (`src/data/`)
- `core.ts`, `polyglot.ts`, `stacks.ts`, `ai.ts` export the islands, written with the compact builders in `helpers.ts`:
  - Quests and checkpoints: `quest`, `boss`, `quiz`/`q`, `project`.
  - Rule helpers: `file`, `has`, `dep`, `pyDep`, `dockerfile`, `ciWorkflow`, `portfolio(minCommits)`, etc.
- Island `pos` coordinates are authored on a 2800×1900 plane. `requires` lists prerequisite island ids, which form the unlock graph and the roads on the map.
- The last quest of every island must be a `boss`.
- `tutorials/*.ts` holds step-by-step tutorial content keyed `"islandId/questId"`. `index.ts` merges these into quests (`withTutorials`), and a tutorial's `quiz` **replaces** the quest's checkpoint questions. Only the first 5 Heartlands areas have tutorials so far; other quests fall back to `lessons`/`practice`.
- `monsters.ts` names each area's minion and boss (one of 8 sprite families). Each normal quest holds back one minion and the boss quest holds back the boss.
- `index.ts` runs **dev-only content validation** that logs to the console:
  - duplicate ids
  - unknown prerequisites
  - bad quiz answer indexes
  - a missing boss
  - tutorials keyed to unknown quests

  Check the console after editing content.

### Game state and rules
- `src/lib/items.ts` holds the gold and item rules (prices, carry limits, `rollQuestGold`, `retroGold`). The store keeps `gold` and `items` (persist v4 grants past clears gold once via `consumeRetroGrant`), and the auto-shield flag lives on the persisted `battle`.
- `src/store.ts` is the single zustand store, persisted under the localStorage key `dev-odyssey-save` (`version` + `migrate`; `celebration` is excluded from persistence).
  - `completed` is keyed by `questKey(islandId, questId)` = `"island/quest"`.
  - `completeQuest()` computes XP, area completion, newly unlocked areas and level-ups, and raises the `celebration` modal.
  - `purifiedSeen` records which areas have already played their map purification animation.
  - Adding a new field: add it to `initial`. Persisted state is shallow-merged, so old saves pick up the default.
- `src/lib/game.ts` holds the progression rules:
  - XP values and levels.
  - Quest and island state: `islandState` → `locked | open | active | complete`.
  - Unlocking (`isIslandUnlocked`, `newlyUnlockedBy`) and the streak.
- `src/lib/github.ts` runs boss-project checks against the GitHub REST API: the repo meta, a recursive tree, raw file contents and a commit count from the `Link` header. An optional user token comes from the store. Rule kinds are defined in `types.ts` (`file`, `contains`, `dep`, `readme`, `commits`, `homepage`, `description`, `fileCount`).
- `src/lib/sound.ts` synthesises RPG sound effects with Web Audio (no audio files) and respects `store.sound`. `App.tsx` installs one global click listener that plays a sound for buttons and links. Elements choose a sound with `data-sfx="confirm|back|toggle|none"`.

### The world map (isometric SVG)
- `components/Overworld.tsx`: world space, projection and layout.
  - **Scale and projection:** the world is scaled by `WS` (1.6). The projection is `project(x, y)`: sx = (x−y)·0.72 + OX, sy = (x+y)·0.36 + OY.
  - **Layout:** `layoutPositions` jitters each island deterministically with a seeded `rng`. It then relaxes them apart in **screen space** using an ellipse, clamped to per-region boxes.
  - **Sprites:** landmark sprites (`LandmarkBody`, `GroundTile`), scenery (`scatterDecorations`, each piece tagged with its nearest area) and corrupted scenery variants (`corruptKind`).
- `components/AreaScene.tsx`: one area's plot, rendered from its progress.
  - **Corruption level:** `sceneInfo` → `level` 0 (purified) … 3 (fully corrupted), 4 (sealed). Corruption is an ashen `feColorMatrix` filter (`corrupt-1..3`).
  - **Overlays:** cracks, smoke, storm cloud and one `Monster` per uncleared quest. Purified areas get villagers and flowers. Sealed areas get dark fog with red eyes.
  - **Filters and gradients:** `SceneDefs` must be rendered inside the `<defs>` of any SVG that uses `AreaScene`.
  - **Where it's used:** both on the map and in the `IslandPage` hero.
- `pages/WorldMap.tsx`: the map page.
  - **Camera:** works in screen space by changing the SVG `viewBox`. It supports drag-to-pan (pointer capture only after 5px), Ctrl+wheel zoom (a native non-passive listener) and the zoom buttons.
  - **Blight and scenery:** draws a blight gradient around each unpurified area. Nearby scenery shows dead variants until the area's progress catches up.
  - **Purification:** plays the one-time purification animation for newly completed areas.

### Pages and UI
- Routes are defined in `App.tsx`:
  - `/` is the map.
  - `/island/:id` is the quest board.
  - `/island/:id/quest/:qid` is the quest page.
  - `/dashboard` is the Adventure Log.
  - `/profile` is the Status page and settings.
- **Island page:** `components/QuestBoard.tsx` renders the quests as pinned paper notes.
- **Quest page:**
  - `TutorialView` renders tutorial content, falling back to the briefing and training when a quest has none.
  - The checkpoint uses `QuizRunner` or `ProjectChecker`, and both take a `next` link shown on a pass.
  - The study timer handles a timer that is already running for another quest.
- **Notebook pages:** quest page sections use the `paper` class plus a `<Paper />` child (`components/Paper.tsx`).
  - Only the backing sheet is rotated (`--tilt`), never the content.
  - `.paper` redefines the colour tokens (`--text`, `--muted`, `--gold`, `--line`, `--slot`, …) to ink-on-paper values, so nested components re-theme automatically. `.code-block` inside a paper restores the dark palette.
- **Styling:**
  - All styling is in `src/styles.css`, built on CSS custom properties.
  - "Windows" (`.window` / `.card`) use the blue JRPG menu look in both themes. The page background switches with `prefers-color-scheme`.
  - Fonts are Quantico (`--pixel`, used for UI and headings), Inter (body), JetBrains Mono (code) and Caveat (paper headings), loaded in `index.html`.

## Agent team (`.claude/agents/`)

For feature work, use the project agents in this order:
1. **planner** (Opus, read-only): researches comparable apps and writes the implementation plan.
2. **designer** (Sonnet): gathers references in Canva (mood boards and generated concept images, kept in the Canva folder `Dev Odyssey references`), then creates original SVG and CSS assets. It shows a preview in `design-previews/` (git-ignored) for approval first.
3. **coder** (Sonnet): implements the plan and the assets.
4. **tester** (Sonnet): tests everything in the plan, plus actions, error paths, input edge cases and refresh/persistence, in the running app. It never edits app code.

Subagents can't call each other, so the main session orchestrates. After the coder finishes, run the **`qa-loop`** skill (`.claude/skills/qa-loop/`). It sends the tester's bug reports to the coder and re-tests, looping until all pass. It stops after 5 rounds, or when a bug repeats, and asks the user.
