import { Link, Navigate, useParams } from 'react-router-dom';
import ProjectChecker from '../components/ProjectChecker';
import QuizRunner from '../components/QuizRunner';
import { ISLAND_MAP } from '../data';
import { isQuestUnlocked, questKey, questXp } from '../lib/game';
import { useStore } from '../store';

export default function QuestPage() {
  const { islandId = '', questId = '' } = useParams();
  const island = ISLAND_MAP[islandId];
  const index = island?.quests.findIndex((q) => q.id === questId) ?? -1;
  const completed = useStore((s) => s.completed);
  const notes = useStore((s) => s.notes);
  const setNote = useStore((s) => s.setNote);
  const timer = useStore((s) => s.timer);
  const startTimer = useStore((s) => s.startTimer);
  const stopTimer = useStore((s) => s.stopTimer);

  if (!island || index < 0) return <Navigate to="/" replace />;
  const quest = island.quests[index];
  const key = questKey(island.id, quest.id);
  if (!isQuestUnlocked(completed, island, index)) return <Navigate to={`/island/${island.id}`} replace />;

  const done = completed[key];
  const next = island.quests[index + 1];
  const timing = timer?.key === key;

  return (
    <div className="quest-page" style={{ ['--c' as string]: island.color }}>
      <Link to={`/island/${island.id}`} className="back">
        ◀ {island.emoji} {island.name}
      </Link>

      <header className="quest-head window">
        <p className="eyebrow">
          {quest.boss ? '🐉 Boss battle' : `Quest ${index + 1} of ${island.quests.length}`} · +{questXp(quest)} EXP
        </p>
        <h1>{quest.title}</h1>
        <p className="lead">{quest.summary}</p>
        {done && (
          <p className="done-banner">
            ✅ Completed {new Date(done.at).toLocaleDateString()}
            {done.score !== undefined && ` · score ${done.score}%`}
            {next && (
              <>
                {' · '}
                <Link to={`/island/${island.id}/quest/${next.id}`}>Next: {next.title} →</Link>
              </>
            )}
          </p>
        )}
      </header>

      <div className="quest-grid">
        <div className="quest-main">
          <section className="card">
            <h2>📖 Quest briefing</h2>
            <ul className="lessons">
              {quest.lessons.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          </section>

          <section className="card">
            <h2>📚 Ancient tomes</h2>
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

          <section className="card">
            <h2>🗡️ Training</h2>
            <p>{quest.practice}</p>
          </section>

          <section className={`card checkpoint ${quest.boss ? 'boss-window' : ''}`}>
            <h2>{quest.checkpoint.type === 'quiz' ? '⚔️ Trial: answer to advance' : '🐉 Boss battle: project review'}</h2>
            {quest.checkpoint.type === 'quiz' ? (
              <QuizRunner key={key} island={island} quest={quest} checkpoint={quest.checkpoint} />
            ) : (
              <ProjectChecker key={key} island={island} quest={quest} checkpoint={quest.checkpoint} />
            )}
          </section>
        </div>

        <aside className="quest-side">
          <section className="card">
            <h3>⏱️ Study timer</h3>
            <p className="muted small">Log focused time on this quest. It feeds your adventure log and streak.</p>
            {timing ? (
              <button className="btn btn-warn" onClick={stopTimer}>
                Stop & log time
              </button>
            ) : (
              <button className="btn" onClick={() => startTimer(key)}>
                ▶ Start timer
              </button>
            )}
          </section>
          <section className="card">
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
