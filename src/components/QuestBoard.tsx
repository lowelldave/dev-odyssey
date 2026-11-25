import { Fragment, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { type Completed, GOLD_BOSS, GOLD_REGULAR, isQuestDone, isQuestUnlocked, questXp } from '../lib/game';
import { sfx } from '../lib/sound';
import { useStore } from '../store';
import type { Island, Quest } from '../types';
import { GoldCoinIcon, InnNoteArt } from './art';

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

/** The gold a quest pays on its first clear; once cleared it reads "claimed", since replays don't pay. */
function Gold({ quest, done }: { quest: Quest; done: boolean }) {
  const amount = quest.boss ? `${GOLD_BOSS}` : `${GOLD_REGULAR[0]}–${GOLD_REGULAR[GOLD_REGULAR.length - 1]}`;
  return (
    <span className={`note-gold${done ? ' is-claimed' : ''}`} title={done ? 'Gold already claimed: replays pay no gold' : 'Gold paid on the first clear'}>
      <GoldCoinIcon size={14} /> {amount} G
      {done && <span className="sr-only"> (claimed)</span>}
    </span>
  );
}

export default function QuestBoard({ island, completed }: { island: Island; completed: Completed }) {
  const firstOpen = island.quests.findIndex((q, i) => isQuestUnlocked(completed, island, i) && !isQuestDone(completed, island.id, q.id));
  const innOffer = useStore((s) => s.innOffer);
  const redeemInn = useStore((s) => s.redeemInn);
  const showToast = useStore((s) => s.showToast);
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
                <span className="note-reward">
                  Reward: {questXp(quest)} EXP <Gold quest={quest} done={done} />
                </span>
                {done && <span className="stamp">DEFEATED</span>}
                {!unlocked && <span className="seal" aria-hidden>🔒</span>}
              </>
            ) : (
              <>
                <span className="pin" aria-hidden />
                <span className="note-kicker">Quest {i + 1}</span>
                <span className="note-title">{quest.title}</span>
                <span className="note-summary">{unlocked ? quest.summary : i === 0 ? 'Sealed — clear the roads to this area first.' : `Sealed until you clear quest ${i}.`}</span>
                <span className="note-foot">
                  <span className="note-kind">{kindLabel(quest)}</span>
                  <span className="note-reward">
                    +{questXp(quest)} EXP <Gold quest={quest} done={done} />
                  </span>
                </span>
                {done && <span className="stamp">CLEARED</span>}
                {!unlocked && <span className="seal" aria-hidden>🔒</span>}
                {i === firstOpen && <span className="ribbon">NEW</span>}
              </>
            );

            const noteEl = unlocked ? (
              <Link
                to={`/island/${island.id}/quest/${quest.id}`}
                className={cls}
                style={style}
                data-sfx="confirm"
                aria-label={`${quest.boss ? 'Boss battle' : `Quest ${i + 1}`}: ${quest.title}${done ? ' (cleared, gold claimed)' : ''}. Reward: ${questXp(quest)} EXP${done ? '' : quest.boss ? `, ${GOLD_BOSS} gold` : `, ${GOLD_REGULAR[0]} to ${GOLD_REGULAR[GOLD_REGULAR.length - 1]} gold`}.`}
              >
                {body}
              </Link>
            ) : (
              <div className={cls} style={style} aria-disabled="true" aria-label={`${quest.title} (sealed)`}>
                {body}
              </div>
            );
            // a wayside Inn sits on the board right after the quest that rolled it
            const innHere = innOffer && innOffer.islandId === island.id && innOffer.afterQuestId === quest.id;
            return (
              <Fragment key={quest.id}>
                {noteEl}
                {innHere && (
                  <button
                    type="button"
                    className="jr-inn-note inn-note-wrap"
                    data-sfx="none"
                    aria-label="Wayside Inn. Rest to restore 50 HP and 30 MP. Open until your next battle."
                    onClick={() => {
                      if (redeemInn()) {
                        sfx('inn');
                        showToast('You rested at the wayside inn. HP and MP restored.');
                      }
                    }}
                  >
                    <InnNoteArt size={56} />
                    <span>
                      <strong>Wayside Inn</strong>
                      <small>Rest: +50 HP, +30 MP · open until your next battle</small>
                    </span>
                  </button>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
