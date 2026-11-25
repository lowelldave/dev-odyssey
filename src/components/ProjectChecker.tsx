import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { type CheckReport, parseRepoUrl, runProjectCheck } from '../lib/github';
import { type GoldAward, questKey } from '../lib/game';
import { monstersOf } from '../data/monsters';
import { useReducedMotion } from '../lib/motion';
import { sfx } from '../lib/sound';
import { useStore } from '../store';
import type { Island, ProjectCheckpoint, Quest } from '../types';
import { BattleBackdrop, Bar, GoldCoinIcon } from './art';
import { shade } from './art/util';
import { Monster } from './AreaScene';
import { Hero } from './Overworld';

export default function ProjectChecker({
  island,
  quest,
  checkpoint,
  next,
}: {
  island: Island;
  quest: Quest;
  checkpoint: ProjectCheckpoint;
  next: { href: string; label: string };
}) {
  const alreadyDone = useStore((s) => !!s.completed[questKey(island.id, quest.id)]);
  const key = questKey(island.id, quest.id);
  const lastSubmission = useStore((s) => [...s.submissions].reverse().find((x) => x.key === key));
  const token = useStore((s) => s.githubToken);
  const recordSubmission = useStore((s) => s.recordSubmission);
  const completeQuest = useStore((s) => s.completeQuest);

  const [url, setUrl] = useState(lastSubmission ? `https://github.com/${lastSubmission.repo}` : '');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [report, setReport] = useState<CheckReport | null>(null);
  // the report arrives in one piece; it is revealed one check at a time (presentation only: no HP is lost here)
  const [revealed, setRevealed] = useState(0);
  // gold from a first clear; 0 for a re-check of a cleared quest
  const [goldWon, setGoldWon] = useState<GoldAward | null>(null);
  const reduced = useReducedMotion();
  const pending = useRef<(() => void) | null>(null);
  const boss = monstersOf(island.id).boss;

  useEffect(() => {
    if (!report) return;
    const total = report.results.length;
    const finish = () => {
      if (!pending.current) return;
      pending.current = null;
      // a boss project never earns the flawless bonus, only the base and the streak bonus
      if (report.passed) setGoldWon(completeQuest(island.id, quest.id, { score: report.score, repo: report.repo }));
    };
    pending.current = finish;
    if (reduced || total === 0) {
      setRevealed(total);
      finish();
      return;
    }
    setRevealed(0);
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      setRevealed(n);
      sfx(report.results[n - 1]?.passed ? 'hit' : 'click');
      if (n >= total) {
        window.clearInterval(id);
        finish();
      }
    }, 380);
    // leaving mid-reveal must not lose the clear
    return () => {
      window.clearInterval(id);
      finish();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report]);

  const run = async () => {
    setError('');
    setReport(null);
    setRevealed(0);
    setGoldWon(null);
    setBusy(true);
    try {
      const rep = await runProjectCheck(url, checkpoint, token, setProgress);
      setReport(rep);
      recordSubmission({ key, repo: rep.repo, score: rep.score, passed: rep.passed });
      // the clear is applied once the reveal finishes; a failed check never touches HP
      if (rep.passed) {
        if (alreadyDone) sfx('confirm');
      } else sfx('error');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
      setProgress('');
    }
  };

  const total = report?.results.length ?? 0;
  const passedSoFar = report ? report.results.slice(0, revealed).filter((r) => r.passed).length : 0;
  const bossHp = report ? (report.passed && revealed >= total ? 0 : Math.max(report.passed ? 0 : 5, Math.round(100 * (1 - passedSoFar / Math.max(1, total))))) : 100;
  const required = checkpoint.rules.filter((r) => !r.optional).length;

  return (
    <div className="project">
      <div className="project-brief">
        <h3>{checkpoint.title}</h3>
        <p>{checkpoint.brief}</p>
        <h4>Requirements</h4>
        <ul className="lessons">
          {checkpoint.requirements.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <details className="rules-preview">
          <summary>
            Automated checks ({checkpoint.rules.length}: {required} required). To pass, every required check and at least{' '}
            {checkpoint.passPercent}% of all checks must succeed.
          </summary>
          <ul>
            {checkpoint.rules.map((r, i) => (
              <li key={i}>
                {r.label} {r.optional && <span className="tag">optional</span>}
              </li>
            ))}
          </ul>
        </details>
      </div>

      <form
        className="repo-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!busy) run();
        }}
      >
        <label htmlFor="repo">Public GitHub repository</label>
        <div className="repo-row">
          <input
            id="repo"
            type="text"
            inputMode="url"
            placeholder="https://github.com/you/your-project"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          <button className="btn btn-primary" disabled={busy || !parseRepoUrl(url)}>
            {busy ? 'Battling…' : '⚔️ Fight the boss'}
          </button>
        </div>
        <p className="muted small">
          Checks read your repo through the GitHub API (60 requests/hour without a token).
          {!token && (
            <>
              {' '}
              If you hit the limit, add a token in <Link to="/profile">Status → Settings</Link>.
            </>
          )}
        </p>
        {busy && <p className="progress-msg">🔎 {progress}</p>}
        {error && <p className="error">⚠️ {error}</p>}
      </form>

      {(busy || report) && (
        <div className="jr-battle-stage battle-stage boss-stage" aria-hidden="true">
          <BattleBackdrop kind="lair" />
          <svg className="battle-svg" viewBox="0 0 300 150" preserveAspectRatio="xMidYMax meet">
            <g transform="translate(205 130) scale(1.7)">
              <Monster family={boss.family} c={shade(island.color, -0.5)} boss name={boss.name} x={0} y={0} />
            </g>
            <g transform="translate(70 132) scale(1.6)">
              <Hero x={0} y={0} />
            </g>
          </svg>
        </div>
      )}
      {report && (
        <div className={`report ${report.passed ? 'pass' : 'fail'}`}>
          <div className="report-head">
            <div>
              <strong>{report.passed ? '🏆 Boss defeated! Project approved.' : '💫 The boss still stands'}</strong>
              {report.passed && goldWon && (
                <>
                  <p className="gold-gain">
                    <GoldCoinIcon size={16} /> +{goldWon.base} gold
                  </p>
                  {goldWon.streak > 0 && (
                    <p className="gold-gain gold-bonus">
                      <GoldCoinIcon size={16} /> {goldWon.streakDays}-day streak bonus: +{goldWon.streak} gold
                    </p>
                  )}
                </>
              )}
              <p className="muted small">
                {report.repo} @ {report.branch} · {report.fileCount} files inspected
              </p>
            </div>
            <div className="score-ring" style={{ ['--p' as string]: report.score }}>
              {report.score}%
            </div>
          </div>
          {report.warning && (
            <p className="small" role="status">
              ⚠️ {report.warning}
            </p>
          )}
          <div className="boss-hp">
            <strong>{boss.name}</strong>
            <Bar kind="monster" value={bossHp} max={100} label={`${boss.name} HP`} />
          </div>
          <ul className="checks">
            {report.results.slice(0, revealed).map((r, i) => (
              <li key={i} className={r.passed ? 'ok' : r.optional ? 'warn' : 'bad'}>
                <span className="check-icon">{r.passed ? '✅' : r.optional ? '⚠️' : '❌'}</span>
                <span>
                  <strong>{r.label}</strong> {r.optional && <span className="tag">optional</span>}
                  <span className="muted small block">{r.detail}</span>
                  {!r.passed && r.hint && <span className="hint block">💡 {r.hint}</span>}
                </span>
              </li>
            ))}
          </ul>
          {revealed < report.results.length ? (
            <p className="muted" role="status">
              Reading the checks…
            </p>
          ) : report.passed ? (
            <Link className="btn btn-primary" to={next.href} data-sfx="confirm">
              ▶ {next.label}
            </Link>
          ) : (
            <p>Fix the ❌ items, push your changes, then run the checks again.</p>
          )}
        </div>
      )}
    </div>
  );
}
