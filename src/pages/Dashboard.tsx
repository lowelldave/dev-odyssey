import { Link } from 'react-router-dom';
import { ISLANDS, ISLAND_MAP, REGIONS } from '../data';
import { TOTAL_QUESTS, countCompleted, isIslandComplete, islandDoneCount, levelInfo, nextQuests, streak, titleFor, toDay } from '../lib/game';
import { useStore } from '../store';
import type { Region } from '../types';

const WEEKS = 26;

export default function Dashboard() {
  const { xp, completed, quizAttempts, submissions, activity, restDays } = useStore();
  const lv = levelInfo(xp);
  const st = streak(activity, restDays);
  const totalMinutes = Object.values(activity).reduce((a, b) => a + b, 0);
  const islandsDone = ISLANDS.filter((i) => isIslandComplete(completed, i)).length;
  const questsDone = countCompleted(completed);

  const weekMinutes = (() => {
    let m = 0;
    const d = new Date();
    for (let i = 0; i < 7; i++) {
      m += activity[toDay(d)] ?? 0;
      d.setDate(d.getDate() - 1);
    }
    return m;
  })();

  // weakest islands by average quiz score
  const byIsland = new Map<string, number[]>();
  for (const a of quizAttempts) {
    const id = a.key.split('/')[0];
    byIsland.set(id, [...(byIsland.get(id) ?? []), a.score]);
  }
  const weakest = [...byIsland.entries()]
    .map(([id, scores]) => ({ island: ISLAND_MAP[id], avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length), n: scores.length }))
    .filter((x) => x.island)
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 5);

  const recentQuizzes = [...quizAttempts].reverse().slice(0, 8);
  const recentProjects = [...submissions].reverse().slice(0, 8);
  const next = nextQuests(completed, 4);

  return (
    <div className="dashboard">
      <header className="page-title window">
        <h1>Adventure Log</h1>
        <p className="muted">Your progress, study habits and what to tackle next.</p>
      </header>

      <section className="tiles">
        <Tile icon="⭐" label="Level" value={`${lv.level}`} sub={titleFor(lv.level)} />
        <Tile icon="✨" label="Total EXP" value={xp.toLocaleString()} sub={`${lv.next - xp} EXP to LV ${lv.level + 1}`} />
        <Tile icon="📜" label="Quests" value={`${questsDone}/${TOTAL_QUESTS}`} sub={`${Math.round((questsDone / TOTAL_QUESTS) * 100)}% of the realm`} />
        <Tile icon="🗺️" label="Areas" value={`${islandsDone}/${ISLANDS.length}`} sub="cleared" />
        <Tile icon="🔥" label="Streak" value={`${st.current}d`} sub={`best ${st.best} days`} />
        <Tile icon="⏱️" label="Study time" value={fmtHours(totalMinutes)} sub={`${fmtHours(weekMinutes)} this week`} />
      </section>

      <div className="dash-grid">
        <section className="card">
          <h2>🧭 Continue your adventure</h2>
          {next.length ? (
            <ul className="next-list">
              {next.map(({ island, quest, index }) => (
                <li key={island.id}>
                  <Link to={`/island/${island.id}/quest/${quest.id}`}>
                    <span className="next-emoji">{island.emoji}</span>
                    <span>
                      <strong>{quest.title}</strong>
                      <span className="muted small block">
                        {island.name} · quest {index + 1}/{island.quests.length}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>Every area is cleared. You are a Living Legend. 👑</p>
          )}
        </section>

        <section className="card">
          <h2>🗺️ Lands</h2>
          {(Object.keys(REGIONS) as Region[]).map((r) => {
            const islands = ISLANDS.filter((i) => i.region === r);
            const total = islands.reduce((n, i) => n + i.quests.length, 0);
            const done = islands.reduce((n, i) => n + islandDoneCount(completed, i), 0);
            return (
              <div key={r} className="region-progress">
                <div className="row-between">
                  <span>{REGIONS[r].name}</span>
                  <span className="muted small">
                    {done}/{total}
                  </span>
                </div>
                <span className="bar" style={{ ['--c' as string]: REGIONS[r].color }}>
                  <span style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
                </span>
              </div>
            );
          })}
        </section>

        <section className="card span-2">
          <h2>📅 Activity (last {WEEKS} weeks)</h2>
          <Heatmap activity={activity} restDays={restDays} />
        </section>

        <section className="card">
          <h2>🎯 Topics to review</h2>
          {weakest.length ? (
            <ul className="plain">
              {weakest.map((w) => (
                <li key={w.island.id} className="row-between">
                  <Link to={`/island/${w.island.id}`}>
                    {w.island.emoji} {w.island.name}
                  </Link>
                  <span className={w.avg < 75 ? 'bad-text' : 'muted'}>
                    avg {w.avg}% · {w.n} tries
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Take a few quizzes and your weakest topics will show up here.</p>
          )}
        </section>

        <section className="card">
          <h2>⚔️ Recent trials</h2>
          {recentQuizzes.length ? (
            <ul className="plain">
              {recentQuizzes.map((a, i) => {
                const [iid, qid] = a.key.split('/');
                const quest = ISLAND_MAP[iid]?.quests.find((q) => q.id === qid);
                return (
                  <li key={i} className="row-between">
                    <span>
                      {ISLAND_MAP[iid]?.emoji} {quest?.title ?? a.key}
                    </span>
                    <span className={a.passed ? 'ok-text' : 'bad-text'}>{a.score}%</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="muted">No quizzes yet.</p>
          )}
        </section>

        <section className="card span-2">
          <h2>💼 Portfolio projects</h2>
          {recentProjects.length ? (
            <ul className="plain">
              {recentProjects.map((s, i) => {
                const iid = s.key.split('/')[0];
                return (
                  <li key={i} className="row-between">
                    <span>
                      {ISLAND_MAP[iid]?.emoji}{' '}
                      <a href={`https://github.com/${s.repo}`} target="_blank" rel="noreferrer noopener">
                        {s.repo}
                      </a>{' '}
                      <span className="muted small">· {new Date(s.at).toLocaleDateString()}</span>
                    </span>
                    <span className={s.passed ? 'ok-text' : 'bad-text'}>
                      {s.passed ? 'Approved' : 'Needs work'} · {s.score}%
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="muted">Boss battles ask you to submit a GitHub repo. Approved projects are listed here, ready for your resume.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function Tile({ icon, label, value, sub }: { icon: string; label: string; value: string; sub: string }) {
  return (
    <div className="tile window">
      <span className="tile-icon">{icon}</span>
      <span className="tile-label">{label}</span>
      <strong className="tile-value">{value}</strong>
      <span className="muted small">{sub}</span>
    </div>
  );
}

function Heatmap({ activity, restDays }: { activity: Record<string, number>; restDays: Record<string, true> }) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (WEEKS * 7 - 1) - end.getDay());
  const days: { day: string; v: number | undefined }[] = [];
  for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const k = toDay(d);
    days.push({ day: k, v: activity[k] });
  }
  const level = (v: number | undefined) => (v === undefined ? 0 : v === 0 ? 1 : v < 30 ? 2 : v < 90 ? 3 : 4);
  return (
    <div className="heatmap-wrap">
      <div className="heatmap">
        {days.map((d) => (
          <i
            key={d.day}
            className={d.v === undefined && restDays[d.day] ? 'h0 heat-rest' : `h${level(d.v)}`}
            title={`${d.day}: ${d.v === undefined ? (restDays[d.day] ? 'zzz: rested by the campfire' : 'no activity') : `${d.v} min studied`}`}
          />
        ))}
      </div>
      <div className="heat-legend muted small">
        Less <i className="h0" />
        <i className="h1" />
        <i className="h2" />
        <i className="h3" />
        <i className="h4" /> More
      </div>
    </div>
  );
}

const fmtHours = (m: number) => (m < 60 ? `${m}m` : `${(m / 60).toFixed(1)}h`);
