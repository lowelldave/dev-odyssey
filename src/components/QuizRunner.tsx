import type { Island, Quest, QuizCheckpoint } from '../types';
import BattlePrep from './battle/BattlePrep';

/** The quiz checkpoint on the quest page: the fight preview. The battle itself lives on its own page (`pages/BattlePage`). */
export default function QuizRunner(props: {
  island: Island;
  quest: Quest;
  checkpoint: QuizCheckpoint;
  next: { href: string; label: string };
}) {
  return <BattlePrep island={props.island} quest={props.quest} checkpoint={props.checkpoint} />;
}
