/**
 * The monsters that corrupt each area. Every normal quest holds back one minion,
 * the boss quest holds back the area's boss. Clearing a quest defeats its monster.
 */
export type Family = 'slime' | 'specter' | 'golem' | 'hydra' | 'mimic' | 'drake' | 'imp' | 'wraith';

export interface AreaMonsters {
  minion: { family: Family; name: string };
  boss: { family: Family; name: string };
}

const m = (minion: Family, minionName: string, boss: Family, bossName: string): AreaMonsters => ({
  minion: { family: minion, name: minionName },
  boss: { family: boss, name: bossName },
});

export const MONSTERS: Record<string, AreaMonsters> = {
  // The Heartlands
  web: m('slime', 'Lag Slime', 'drake', 'Timeout Drake'),
  'html-css': m('imp', 'Div Imp', 'golem', 'Overflow Golem'),
  javascript: m('slime', 'Bug Slime', 'hydra', 'Callback Hydra'),
  git: m('imp', 'Stray Commit Imp', 'golem', 'Merge Conflict Golem'),
  typescript: m('wraith', 'Implicit Wraith', 'specter', 'Any-type Specter'),
  frontend: m('imp', 'Re-render Imp', 'hydra', 'Prop-drill Hydra'),
  backend: m('slime', 'Memory Leak Slime', 'drake', 'Bottleneck Drake'),
  databases: m('specter', 'Orphan Row Ghost', 'hydra', 'N+1 Hydra'),
  testing: m('imp', 'Flaky Test Imp', 'mimic', 'False-Green Mimic'),
  security: m('wraith', 'Injection Wraith', 'drake', 'Cross-Site Wyvern'),
  docker: m('slime', 'Layer Bloat Slime', 'mimic', 'Orphan Container Mimic'),
  cicd: m('imp', 'Red Build Imp', 'hydra', 'Pipeline Hydra'),
  cloud: m('specter', 'Surprise Bill Specter', 'drake', 'Outage Storm Drake'),
  realtime: m('wraith', 'Dropped Packet Wraith', 'hydra', 'Race Condition Hydra'),
  architecture: m('imp', 'Tight Coupling Imp', 'golem', 'Big Ball of Mud'),
  summit: m('wraith', 'Burnout Wraith', 'drake', 'Impostor Drake'),
  // Polyglot Kingdoms
  python: m('slime', 'Indentation Slime', 'hydra', 'Dependency Hydra'),
  go: m('imp', 'Nil Pointer Imp', 'specter', 'Goroutine Leak Specter'),
  java: m('slime', 'NullPointer Slime', 'golem', 'Boilerplate Golem'),
  csharp: m('imp', 'Null Reference Imp', 'golem', 'Deadlock Golem'),
  php: m('slime', 'Spaghetti Slime', 'hydra', 'Legacy Hydra'),
  ruby: m('imp', 'Monkey-patch Imp', 'mimic', 'Magic Method Mimic'),
  rust: m('wraith', 'Dangling Reference Wraith', 'golem', 'Borrow Checker Golem'),
  // Stack Frontier
  mern: m('slime', 'Callback Slime', 'hydra', 'Unindexed Query Hydra'),
  nextjs: m('specter', 'Hydration Specter', 'drake', 'Waterfall Drake'),
  vue: m('imp', 'Reactivity Imp', 'mimic', 'Stale Watcher Mimic'),
  svelte: m('slime', 'Store Slime', 'specter', 'Phantom Update'),
  angular: m('imp', 'Zone Imp', 'golem', 'Injector Golem'),
  jamstack: m('wraith', 'Stale Cache Wraith', 'drake', 'Build-time Drake'),
  mobile: m('imp', 'Jank Imp', 'mimic', 'Store Review Mimic'),
  // Arcane Highlands
  'ai-fundamentals': m('wraith', 'Noise Wraith', 'specter', 'Bias Specter'),
  ml: m('slime', 'Overfit Slime', 'hydra', 'Exploding Gradient Hydra'),
  llm: m('wraith', 'Hallucination Wraith', 'specter', 'Prompt Injection Specter'),
  'ai-apps': m('imp', 'Token Burner Imp', 'drake', 'Rate-limit Drake'),
  rag: m('slime', 'Bad Chunk Slime', 'mimic', 'Irrelevant Retriever Mimic'),
  agents: m('imp', 'Infinite Loop Imp', 'hydra', 'Runaway Agent Hydra'),
  finetune: m('wraith', 'Data Drift Wraith', 'golem', 'Catastrophic Forgetting Golem'),
  'ai-production': m('imp', 'Latency Imp', 'specter', 'Silent Regression Specter'),
};

const FALLBACK = m('slime', 'Glitch Slime', 'drake', 'Glitch Drake');
export const monstersOf = (islandId: string) => MONSTERS[islandId] ?? FALLBACK;
