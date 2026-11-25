import { ISLANDS, ISLAND_MAP } from '../data';
import type { QuizAttempt, Submission } from '../store';
import { type Completed, countCompleted, isIslandComplete, streak } from './game';

export interface Badge {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  earned: boolean;
}

interface Input {
  completed: Completed;
  quizAttempts: QuizAttempt[];
  submissions: Submission[];
  activity: Record<string, number>;
  /** Campfire-bridged days; they count towards the streak badges */
  restDays?: Record<string, true>;
}

const done = (c: Completed, id: string) => !!ISLAND_MAP[id] && isIslandComplete(c, ISLAND_MAP[id]);
const regionDone = (c: Completed, region: string) =>
  ISLANDS.filter((i) => i.region === region && isIslandComplete(c, i)).length;

export function computeBadges({ completed, quizAttempts, submissions, activity, restDays }: Input): Badge[] {
  const s = streak(activity, restDays);
  const minutes = Object.values(activity).reduce((a, b) => a + b, 0);
  const passedQuizzes = new Set(quizAttempts.filter((a) => a.passed).map((a) => a.key)).size;
  const passedProjects = new Set(submissions.filter((x) => x.passed).map((x) => x.key)).size;
  const islandsDone = ISLANDS.filter((i) => isIslandComplete(completed, i)).length;
  const coreTotal = ISLANDS.filter((i) => i.region === 'core').length;

  const list: (Omit<Badge, 'earned'> & { test: boolean })[] = [];
  const add = (id: string, emoji: string, name: string, desc: string, test: boolean) =>
    list.push({ id, emoji, name, desc, test });

  add('first-quest', '🥾', 'First Steps', 'Complete your first quest.', countCompleted(completed) > 0);
  add('first-island', '🗺️', 'Explorer', 'Clear your first area.', islandsDone >= 1);
  add('perfect', '🎯', 'Critical Hit', 'Score 100% on a quiz.', quizAttempts.some((a) => a.score === 100));
  add('quizmaster', '🧠', 'Sage of Trials', 'Pass 25 quizzes.', passedQuizzes >= 25);
  add('shipwright', '⚔️', 'First Boss Down', 'Pass your first project review.', passedProjects >= 1);
  add('portfolio', '💼', 'Guild Master', 'Pass 5 portfolio projects.', passedProjects >= 5);
  add('fullstack', '🥞', 'Full-Stack Forged', 'Clear Frontend Forest and Backend Badlands.', done(completed, 'frontend') && done(completed, 'backend'));
  add('container', '🐳', 'Containerized', 'Clear Container Quarry.', done(completed, 'docker'));
  add('pipeline', '🟢', 'Green Pipeline', 'Clear Pipeline Falls.', done(completed, 'cicd'));
  add('cloud', '☁️', 'Cloud Walker', 'Clear Cloud Citadel.', done(completed, 'cloud'));
  add('guardian', '🛡️', 'Guardian', 'Clear Security Bastion.', done(completed, 'security'));
  add('polyglot', '🗣️', 'Polyglot', 'Clear 2 areas in the Polyglot Kingdoms.', regionDone(completed, 'polyglot') >= 2);
  add('stackmaster', '🧱', 'Stack Master', 'Clear 2 areas on the Stack Frontier.', regionDone(completed, 'stacks') >= 2);
  add('ai-whisperer', '🔮', 'AI Whisperer', 'Clear Oracle Tower.', done(completed, 'llm'));
  add('agent', '🤖', 'Agent Architect', 'Clear Agent Academy.', done(completed, 'agents'));
  add('streak7', '🔥', 'On Fire', 'Keep a 7-day streak.', s.best >= 7);
  add('streak30', '🌋', 'Unstoppable', 'Keep a 30-day streak.', s.best >= 30);
  add('scholar', '📚', 'Scholar', 'Log 10 hours of study.', minutes >= 600);
  add('sage', '🦉', 'Sage', 'Log 100 hours of study.', minutes >= 6000);
  add('summit', '🏔️', 'Summit Reached', 'Clear every area in the Heartlands.', regionDone(completed, 'core') === coreTotal);
  add('legend', '👑', 'Living Legend', 'Clear every area in the realm.', islandsDone === ISLANDS.length);

  return list.map(({ test, ...b }) => ({ ...b, earned: test }));
}
