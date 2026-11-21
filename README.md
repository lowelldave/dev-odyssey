# ⚔️ Dev Odyssey

A JRPG-style adventure for leveling up as a web developer. Explore the **Realm of Devoria**: **38 areas** (subjects) and **158 quests**. Each quest has a briefing, study links, a training task, and a checkpoint: either a **trial** (quiz) or a **boss battle**, a portfolio project that is checked automatically against your public GitHub repository. Clear every quest in an area to open the roads to new lands.

## Lands

| Land | Areas |
|---|---|
| **The Heartlands** | How the Web Works → HTML & CSS → JavaScript → Git & Tooling → TypeScript → React → Node/APIs → Databases → Testing → Security → Docker → CI/CD → Cloud → (Realtime/GraphQL) → System Design → Capstone SaaS |
| **Polyglot Kingdoms** | Python (FastAPI/Django), Go, Java (Spring Boot), C# (ASP.NET Core), PHP (Laravel), Ruby on Rails, Rust (Axum/WASM) |
| **Stack Frontier** | MERN, Next.js (T3), Vue + Nuxt, SvelteKit, Angular + NestJS, Astro/Jamstack/Serverless, React Native + Expo |
| **Arcane Highlands** | AI/ML Fundamentals → Deep Learning (PyTorch) → LLMs & Prompting → AI Apps (streaming, tools) → RAG & Vector DBs → Agents & MCP → Fine-tuning & Local Models → LLMOps (evals, guardrails) |

## Features

- **Overworld map**: forests, grasslands, desert and snowy highlands, with villages, castles, towers, caves, shrines and forges. Sealed areas hide in fog, roads get paved as you clear areas, a pixel-art hero shows where you are, and "!" markers flag open quests. A list view covers small screens.
- **JRPG menu windows**, trials with a battle-command answer menu (shuffled every attempt, 75% to pass), and boss battles
- **Rule-based GitHub checker**: reads your repo's file tree, dependencies, file contents, commit count, README quality and repo metadata, then shows a pass/fail report with a hint for each failed check
- **Portfolio standards** on every project: a README with a screenshot and setup steps, a repo description, a live demo link, a real commit history and a `.gitignore`
- **EXP, levels, titles (Novice → Living Legend), 21 achievements and a daily streak**
- **Adventure Log**: stats, region progress, an activity heatmap, topics to review, quiz history and your portfolio projects
- Per-quest **study timer** and **notes**
- Progress stays in your browser, with **export/import** as JSON

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
```

## GitHub rate limits

Unauthenticated GitHub API calls are limited to 60 per hour, and each project check uses roughly 3–10 of them. To raise the limit to 5,000, add a fine-grained, read-only personal access token in **Status → Settings**. The token is stored only in your browser.

## Editing content

All islands live in `src/data/` (`core.ts`, `polyglot.ts`, `stacks.ts`, `ai.ts`) and use the compact helpers in `src/data/helpers.ts`. A dev-mode check logs content problems, such as bad answer indexes or unknown prerequisites, to the browser console.
