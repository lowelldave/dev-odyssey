import type { Island, Quest, QuizCheckpoint } from '../types';
import BattleQuiz from './battle/BattleQuiz';

/** The quiz checkpoint. It keeps its old props and export; the battle lives in `battle/BattleQuiz`. */
export default function QuizRunner(props: {
  island: Island;
  quest: Quest;
  checkpoint: QuizCheckpoint;
  next: { href: string; label: string };
}) {
  return <BattleQuiz {...props} />;
}
