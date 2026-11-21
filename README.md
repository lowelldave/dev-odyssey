# 🧭 Dev Odyssey

A game-like roadmap for leveling up as a web developer. Sail an archipelago of **38 islands** (subjects) and **158 quests**. Each quest has a briefing, study links, a practice task, and a checkpoint: either a **quiz** or a **portfolio project** that is checked automatically against your public GitHub repository. Clear every quest on an island, including its boss project, to unlock the routes to new islands.

## Regions

| Region | Islands |
|---|---|
| **Core Archipelago** | How the Web Works → HTML & CSS → JavaScript → Git & Tooling → TypeScript → React → Node/APIs → Databases → Testing → Security → Docker → CI/CD → Cloud → (Realtime/GraphQL) → System Design → Capstone SaaS |
| **Polyglot Isles** | Python (FastAPI/Django), Go, Java (Spring Boot), C# (ASP.NET Core), PHP (Laravel), Ruby on Rails, Rust (Axum/WASM) |
| **Stack Isles** | MERN, Next.js (T3), Vue + Nuxt, SvelteKit, Angular + NestJS, Astro/Jamstack/Serverless, React Native + Expo |
| **AI Frontier** | AI/ML Fundamentals → Deep Learning (PyTorch) → LLMs & Prompting → AI Apps (streaming, tools) → RAG & Vector DBs → Agents & MCP → Fine-tuning & Local Models → LLMOps (evals, guardrails) |

## Features

- **World map** with fog over locked islands, routes that light up as you conquer islands, and a list view for small screens
- **Quest trails** with quizzes (shuffled every attempt, 75% to pass) and boss projects
- **Rule-based GitHub checker**: reads your repo's file tree, dependencies, file contents, commit count, README quality and repo metadata, then shows a pass/fail report with a hint for each failed check
- **Portfolio standards** on every project: a README with a screenshot and setup steps, a repo description, a live demo link, a real commit history and a `.gitignore`
- **XP, levels, titles, 21 badges and a daily streak**
- **Captain's Logbook**: stats, region progress, an activity heatmap, topics to review, quiz history and your portfolio projects
- Per-quest **study timer** and **notes**
- Progress stays in your browser, with **export/import** as JSON

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
```

## GitHub rate limits

Unauthenticated GitHub API calls are limited to 60 per hour, and each project check uses roughly 3–10 of them. To raise the limit to 5,000, add a fine-grained, read-only personal access token in **Profile → Settings**. The token is stored only in your browser.

## Editing content

All islands live in `src/data/` (`core.ts`, `polyglot.ts`, `stacks.ts`, `ai.ts`) and use the compact helpers in `src/data/helpers.ts`. A dev-mode check logs content problems, such as bad answer indexes or unknown prerequisites, to the browser console.
