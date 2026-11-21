import { ISLANDS, ISLAND_MAP } from '../data';
import type { QuizAttempt, Submission } from '../store';
import { type Completed, isIslandComplete, streak } from './game';

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
}

const done = (c: Completed, id: string) => !!ISLAND_MAP[id] && isIslandComplete(c, ISLAND_MAP[id]);
const regionDone = (c: Completed, region: string) =>
  ISLANDS.filter((i) => i.region === region && isIslandComplete(c, i)).length;

export function computeBadges({ completed, quizAttempts, submissions, activity }: Input): Badge[] {
  const s = streak(activity);
  const minutes = Object.values(activity).reduce((a, b) => a + b, 0);
  const passedQuizzes = quizAttempts.filter((a) => a.passed).length;
  const passedProjects = new Set(submissions.filter((x) => x.passed).map((x) => x.key)).size;
  const islandsDone = ISLANDS.filter((i) => isIslandComplete(completed, i)).length;
  const coreTotal = ISLANDS.filter((i) => i.region === 'core').length;

  const list: (Omit<Badge, 'earned'> & { test: boolean })[] = [];
  const add = (id: string, emoji: string, name: string, desc: string, test: boolean) =>
    list.push({ id, emoji, name, desc, test });

  add('first-quest', '🥾', 'First Steps', 'Complete your first quest.', Object.keys(completed).length > 0);
  add('first-island', '🏝️', 'Island Hopper', 'Conquer your first island.', islandsDone >= 1);
  add('perfect', '🎯', 'Bullseye', 'Score 100% on a quiz.', quizAttempts.some((a) => a.score === 100));
  add('quizmaster', '🧠', 'Quizmaster', 'Pass 25 quizzes.', passedQuizzes >= 25);
  add('shipwright', '⚓', 'Shipwright', 'Pass your first project review.', passedProjects >= 1);
  add('portfolio', '💼', 'Portfolio Captain', 'Pass 5 portfolio projects.', passedProjects >= 5);
  add('fullstack', '🥞', 'Full-Stack Forged', 'Conquer Frontend Forest and Backend Badlands.', done(completed, 'frontend') && done(completed, 'backend'));
  add('container', '🐳', 'Containerized', 'Conquer Container Docks.', done(completed, 'docker'));
  add('pipeline', '🟢', 'Green Pipeline', 'Conquer Pipeline Falls.', done(completed, 'cicd'));
  add('cloud', '☁️', 'Cloud Walker', 'Conquer Cloud Citadel.', done(completed, 'cloud'));
  add('guardian', '🛡️', 'Guardian', 'Conquer Security Bastion.', done(completed, 'security'));
  add('polyglot', '🗣️', 'Polyglot', 'Conquer 2 language islands.', regionDone(completed, 'polyglot') >= 2);
  add('stackmaster', '🧱', 'Stack Master', 'Conquer 2 stack islands.', regionDone(completed, 'stacks') >= 2);
  add('ai-whisperer', '🔮', 'AI Whisperer', 'Conquer LLM Lighthouse.', done(completed, 'llm'));
  add('agent', '🤖', 'Agent Architect', 'Conquer Agent Atoll.', done(completed, 'agents'));
  add('streak7', '🔥', 'On Fire', 'Keep a 7-day streak.', s.best >= 7);
  add('streak30', '🌋', 'Unstoppable', 'Keep a 30-day streak.', s.best >= 30);
  add('scholar', '📚', 'Scholar', 'Log 10 hours of study.', minutes >= 600);
  add('sage', '🦉', 'Sage', 'Log 100 hours of study.', minutes >= 6000);
  add('summit', '🏔️', 'Summit Reached', 'Conquer every core island.', regionDone(completed, 'core') === coreTotal);
  add('legend', '👑', 'Odyssey Legend', 'Conquer every island in the archipelago.', islandsDone === ISLANDS.length);

  return list.map(({ test, ...b }) => ({ ...b, earned: test }));
}
