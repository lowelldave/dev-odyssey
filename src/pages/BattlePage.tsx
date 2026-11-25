import { useEffect, useRef } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import BattleQuiz from '../components/battle/BattleQuiz';
import Paper from '../components/Paper';
import { ISLAND_MAP } from '../data';
import { disarmBattle, isBattleArmed } from '../lib/battleNav';
import { isQuestUnlocked, questKey } from '../lib/game';
import { useStore } from '../store';

/**
 * A focused battle screen. It only runs when the "Begin battle" button opened it; a refresh, a pasted URL or
 * a Back/Forward visit goes to the lesson page instead (a refresh mid-battle therefore abandons the battle).
 */
export default function BattlePage() {
  const { islandId = '', questId = '' } = useParams();
  const location = useLocation();
  const completed = useStore((s) => s.completed);
  const island = ISLAND_MAP[islandId];
  const index = island?.quests.findIndex((q) => q.id === questId) ?? -1;
  const quest = island?.quests[index];
  const key = questKey(islandId, questId);
  const nonce = (location.state as { nonce?: unknown } | null)?.nonce;
  const training = (location.state as { mode?: unknown } | null)?.mode === 'training';
  const valid = !!quest && quest.checkpoint.type === 'quiz' && isBattleArmed(key, nonce);

  // leaving for real disarms the page, so Forward cannot restart a battle; a strict-mode remount keeps it armed
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      window.setTimeout(() => {
        if (!mounted.current) disarmBattle();
      }, 0);
    };
  }, []);

  if (!island || !quest || quest.checkpoint.type !== 'quiz') return <Navigate to={island ? `/island/${island.id}` : '/'} replace />;
  const lesson = `/island/${island.id}/quest/${quest.id}`;
  if (!isQuestUnlocked(completed, island, index) || !valid) return <Navigate to={lesson} replace />;
  // training is practice on a cleared quest only
  if (training && !completed[key]) return <Navigate to={lesson} replace />;

  const nextQuest = island.quests[index + 1];
  const next = nextQuest
    ? { href: `/island/${island.id}/quest/${nextQuest.id}`, label: `Next quest: ${nextQuest.title}` }
    : { href: `/island/${island.id}`, label: 'Back to the quest board' };

  return (
    <div className="quest-page battle-page" style={{ ['--c' as string]: island.color }}>
      <header className="quest-head window paper">
        <Paper tape="both" />
        <p className="eyebrow">
          {island.emoji} {island.name} · {training ? 'training' : 'battle'}
        </p>
        <h1>{quest.title}</h1>
      </header>
      <section id="battle" className="card paper checkpoint">
        <Paper tape="left" seal="red" />
        <BattleQuiz key={location.key} island={island} quest={quest} checkpoint={quest.checkpoint} next={next} lessonPath={lesson} mode={training ? 'training' : 'battle'} />
      </section>
    </div>
  );
}
