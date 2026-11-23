import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { type Completed, isQuestDone, isQuestUnlocked, questXp } from '../lib/game';
import type { Island, Quest } from '../types';

const PIN_COLORS = ['#e8564a', '#3f8fe0', '#f2b632', '#4fb36a', '#b06ad9'];

function hash(s: string) {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}

function kindLabel(quest: Quest) {
  if (quest.boss) return quest.tutorial ? 'Guided project + review' : 'Project review';
  return quest.tutorial ? 'Tutorial + trial' : 'Trial';
}

export default function QuestBoard({ island, completed }: { island: Island; completed: Completed }) {
  const firstOpen = island.quests.findIndex((q, i) => isQuestUnlocked(completed, island, i) && !isQuestDone(completed, island.id, q.id));
  const regular = island.quests.filter((q) => !q.boss).length;

  return (
    <section className="board-wrap" aria-labelledby="board-title">
      <div className="board-sign">
        <h2 id="board-title">📋 {island.name} quest board</h2>
      </div>
      <div className="board-frame">
        <div className="board-cork" style={{ ['--rows' as string]: Math.max(1, Math.ceil(regular / 2)) }}>
          {island.quests.map((quest, i) => {
            const done = isQuestDone(completed, island.id, quest.id);
            const unlocked = isQuestUnlocked(completed, island, i);
            const h = hash(island.id + quest.id);
            const style = {
              '--tilt': `${((h % 70) / 10 - 3.5).toFixed(1)}deg`,
              '--pin': PIN_COLORS[h % PIN_COLORS.length],
            } as CSSProperties;
            const cls = ['note', quest.boss ? 'note-boss' : '', done ? 'is-done' : '', !unlocked ? 'is-sealed' : '', i === firstOpen ? 'is-next' : '']
              .filter(Boolean)
              .join(' ');

            const body = quest.boss ? (
              <>
                <span className="pin" aria-hidden />
                <span className="wanted">WANTED</span>
                <span className="wanted-art" aria-hidden>
                  🐉
                </span>
                <span className="note-title">{quest.title.replace(/^Boss:\s*/, '')}</span>
                <span className="note-summary">{quest.summary}</span>
                <span className="note-kind">{kindLabel(quest)}</span>
                <span className="note-reward">Reward: {questXp(quest)} EXP</span>
                {done && <span className="stamp">DEFEATED</span>}
                {!unlocked && <span className="seal" aria-hidden>🔒</span>}
              </>
            ) : (
              <>
                <span className="pin" aria-hidden />
                <span className="note-kicker">Quest {i + 1}</span>
                <span className="note-title">{quest.title}</span>
                <span className="note-summary">{unlocked ? quest.summary : `Sealed until you clear quest ${i}.`}</span>
                <span className="note-foot">
                  <span className="note-kind">{kindLabel(quest)}</span>
                  <span className="note-reward">+{questXp(quest)} EXP</span>
                </span>
                {done && <span className="stamp">CLEARED</span>}
                {!unlocked && <span className="seal" aria-hidden>🔒</span>}
                {i === firstOpen && <span className="ribbon">NEW</span>}
              </>
            );

            return unlocked ? (
              <Link
                key={quest.id}
                to={`/island/${island.id}/quest/${quest.id}`}
                className={cls}
                style={style}
                data-sfx="confirm"
                aria-label={`${quest.boss ? 'Boss battle' : `Quest ${i + 1}`}: ${quest.title}${done ? ' (cleared)' : ''}`}
              >
                {body}
              </Link>
            ) : (
              <div key={quest.id} className={cls} style={style} aria-disabled="true" aria-label={`${quest.title} (sealed)`}>
                {body}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
