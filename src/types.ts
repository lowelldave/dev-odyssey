export type Region = 'core' | 'polyglot' | 'stacks' | 'ai';
export type Tier = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface Resource {
  label: string;
  url: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  /** index into options */
  answer: number;
  explain?: string;
}

export interface QuizCheckpoint {
  type: 'quiz';
  questions: QuizQuestion[];
  passPercent: number;
}

/** A single automated check run against a GitHub repository. */
export type Rule =
  | { kind: 'file'; label: string; path: RegExp; hint?: string; optional?: boolean }
  | { kind: 'contains'; label: string; path: RegExp; pattern: RegExp; hint?: string; optional?: boolean }
  | { kind: 'dep'; label: string; names: string[]; hint?: string; optional?: boolean }
  | { kind: 'readme'; label: string; minLength: number; hint?: string; optional?: boolean }
  | { kind: 'commits'; label: string; min: number; hint?: string; optional?: boolean }
  | { kind: 'homepage'; label: string; hint?: string; optional?: boolean }
  | { kind: 'description'; label: string; hint?: string; optional?: boolean }
  | { kind: 'fileCount'; label: string; path: RegExp; min: number; hint?: string; optional?: boolean };

export interface ProjectCheckpoint {
  type: 'project';
  title: string;
  brief: string;
  requirements: string[];
  rules: Rule[];
  /** percent of rules (by count) that must pass, in addition to every required rule */
  passPercent: number;
}

export type Checkpoint = QuizCheckpoint | ProjectCheckpoint;

export interface TutorialStep {
  title: string;
  /** Short paragraphs separated by blank lines; `inline code` is supported. */
  body: string;
  code?: { lang: string; src: string; caption?: string };
  /** A small hands-on task for this step. */
  tryIt?: string;
}

export interface Tutorial {
  /** One or two sentences: what you will be able to do afterwards. */
  goal: string;
  steps: TutorialStep[];
  mistakes?: string[];
  recap?: string[];
  /** Replaces the quest's original quiz questions (tutorial quests end with 5). */
  quiz?: QuizQuestion[];
}

export interface Quest {
  id: string;
  title: string;
  summary: string;
  lessons: string[];
  resources: Resource[];
  practice: string;
  checkpoint: Checkpoint;
  boss?: boolean;
  tutorial?: Tutorial;
}

export interface Island {
  id: string;
  name: string;
  subject: string;
  region: Region;
  tier: Tier;
  emoji: string;
  color: string;
  pos: { x: number; y: number };
  requires: string[];
  blurb: string;
  stack?: string[];
  quests: Quest[];
}
