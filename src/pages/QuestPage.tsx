import { useEffect } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import ProjectChecker from '../components/ProjectChecker';
import QuizRunner from '../components/QuizRunner';
import Paper from '../components/Paper';
import TutorialView from '../components/TutorialView';
import { ISLAND_MAP } from '../data';
import { isQuestUnlocked, questKey, questXp } from '../lib/game';
import { useStore } from '../store';

export default function QuestPage() {
  const { islandId = '', questId = '' } = useParams();
  const location = useLocation();
  const returning = !!(location.state as { focusCheckpoint?: boolean } | null)?.focusCheckpoint;
  const island = ISLAND_MAP[islandId];
  const index = island?.quests.findIndex((q) => q.id === questId) ?? -1;
  const completed = useStore((s) => s.completed);
  const notes = useStore((s) => s.notes);
  const setNote = useStore((s) => s.setNote);
  const timer = useStore((s) => s.timer);
  const startTimer = useStore((s) => s.startTimer);
  const stopTimer = useStore((s) => s.stopTimer);

  // coming back from a battle: land on the checkpoint, after App has reset the scroll position
  useEffect(() => {
    if (!returning) return;
    const id = window.setTimeout(() => {
      const el = document.getElementById('checkpoint');
      if (!el) return;
      el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
      el.scrollIntoView({ block: 'start' });
    }, 60);
    return () => window.clearTimeout(id);
  }, [returning, location.key]);

  if (!island || index < 0) return <Navigate to="/" replace />;
  const quest = island.quests[index];
  const key = questKey(island.id, quest.id);
  if (!isQuestUnlocked(completed, island, index)) return <Navigate to={`/island/${island.id}`} replace />;

  const done = completed[key];
  const nextQuest = island.quests[index + 1];
  const next = nextQuest
    ? { href: `/island/${island.id}/quest/${nextQuest.id}`, label: `Next quest: ${nextQuest.title}` }
    : { href: `/island/${island.id}`, label: 'Back to the quest board' };

  // timer can be running here, on another quest, or not at all
  const timerHere = timer?.key === key;
  const otherQuest = timer && !timerHere ? describeQuest(timer.key) : null;

  const tutorial = quest.tutorial;

  return (
    <div className="quest-page" style={{ ['--c' as string]: island.color }}>
      <Link to={`/island/${island.id}`} className="back" data-sfx="back">
        ◀ {island.emoji} {island.name} quest board
      </Link>

      <header className="quest-head window paper">
        <Paper tape="both" />
        <p className="eyebrow">
          {quest.boss ? '🐉 Boss battle' : `Quest ${index + 1} of ${island.quests.length}`} · +{questXp(quest)} EXP
          {tutorial && ` · ${tutorial.steps.length}-step ${quest.boss ? 'guided project' : 'tutorial'}`}
        </p>
        <h1>{quest.title}</h1>
        <p className="lead">{quest.summary}</p>
        {done && (
          <div className="done-row">
            <p className="done-banner">
              ✅ Cleared {new Date(done.at).toLocaleDateString()}
              {done.score !== undefined && ` · score ${done.score}%`}
            </p>
            <Link className="btn btn-primary" to={next.href} data-sfx="confirm">
              ▶ {next.label}
            </Link>
          </div>
        )}
      </header>

      <div className="quest-grid">
        <div className="quest-main">
          {tutorial ? (
            <TutorialView tutorial={tutorial} />
          ) : (
            <>
              <section className="card paper">
                <Paper tape="left" />
                <h2>📖 Quest briefing</h2>
                <ul className="lessons">
                  {quest.lessons.map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              </section>
              <section className="card paper">
                <Paper tape="right" />
                <h2>🗡️ Training</h2>
                <p>{quest.practice}</p>
              </section>
            </>
          )}

          <section id="checkpoint" className={`card paper checkpoint ${quest.boss ? 'boss-window' : ''}`}>
            <Paper tape="left" seal={quest.boss ? 'gold' : 'red'} />
            <p className="eyebrow">{tutorial ? 'Final step' : 'Checkpoint'}</p>
            <h2>{quest.checkpoint.type === 'quiz' ? '⚔️ Trial: prove what you learned' : '🐉 Boss battle: project review'}</h2>
            {quest.checkpoint.type === 'quiz' ? (
              <QuizRunner key={key} island={island} quest={quest} checkpoint={quest.checkpoint} next={next} />
            ) : (
              <ProjectChecker key={key} island={island} quest={quest} checkpoint={quest.checkpoint} next={next} />
            )}
          </section>

          <section className="card paper">
            <Paper tape="right" />
            <h2>📚 Ancient tomes</h2>
            <p className="muted small">Go deeper with these free references.</p>
            <ul className="resources">
              {quest.resources.map((r) => (
                <li key={r.url}>
                  <a href={r.url} target="_blank" rel="noreferrer noopener">
                    {r.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="quest-side">
          <section className="card paper">
            <Paper tape="right" />
            <h3>⏱️ Study timer</h3>
            {timerHere ? (
              <>
                <p className="muted small">The timer is running for this quest.</p>
                <button className="btn btn-warn" onClick={stopTimer}>
                  ■ Stop & log time
                </button>
              </>
            ) : otherQuest ? (
              <>
                <p className="muted small">
                  A timer is already running for{' '}
                  {otherQuest.href ? <Link to={otherQuest.href}>{otherQuest.title}</Link> : otherQuest.title}.
                </p>
                <div className="btn-col">
                  <button className="btn" onClick={() => startTimer(key)} title="Logs the time so far, then starts timing this quest">
                    ⇄ Switch to this quest
                  </button>
                  <button className="btn btn-warn" onClick={stopTimer}>
                    ■ Stop & log time
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="muted small">Log focused time on this quest. It feeds your adventure log and streak.</p>
                <button className="btn" onClick={() => startTimer(key)}>
                  ▶ Start timer
                </button>
              </>
            )}
          </section>
          <section className="card paper">
            <Paper tape="left" />
            <h3>📝 Adventurer’s journal</h3>
            <textarea
              className="notes"
              placeholder="What did you learn? Links, snippets, questions…"
              value={notes[key] ?? ''}
              onChange={(e) => setNote(key, e.target.value)}
              rows={9}
            />
            <p className="muted small">Saved automatically on this device.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function describeQuest(key: string) {
  const [iid, qid] = key.split('/');
  const quest = ISLAND_MAP[iid]?.quests.find((q) => q.id === qid);
  return quest ? { title: quest.title, href: `/island/${iid}/quest/${qid}` } : { title: 'another quest', href: '' };
}
