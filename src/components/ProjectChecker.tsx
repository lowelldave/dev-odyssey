import { useState } from 'react';
import { Link } from 'react-router-dom';
import { type CheckReport, parseRepoUrl, runProjectCheck } from '../lib/github';
import { questKey } from '../lib/game';
import { useStore } from '../store';
import type { Island, ProjectCheckpoint, Quest } from '../types';

export default function ProjectChecker({ island, quest, checkpoint }: { island: Island; quest: Quest; checkpoint: ProjectCheckpoint }) {
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

  const run = async () => {
    setError('');
    setReport(null);
    setBusy(true);
    try {
      const rep = await runProjectCheck(url, checkpoint, token, setProgress);
      setReport(rep);
      recordSubmission({ key, repo: rep.repo, score: rep.score, passed: rep.passed });
      if (rep.passed) completeQuest(island.id, quest.id, { score: rep.score, repo: rep.repo });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
      setProgress('');
    }
  };

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
            {busy ? 'Inspecting…' : 'Run checks'}
          </button>
        </div>
        <p className="muted small">
          Checks read your repo through the GitHub API (60 requests/hour without a token).
          {!token && (
            <>
              {' '}
              If you hit the limit, add a token in <Link to="/profile">Profile → Settings</Link>.
            </>
          )}
        </p>
        {busy && <p className="progress-msg">🔎 {progress}</p>}
        {error && <p className="error">⚠️ {error}</p>}
      </form>

      {report && (
        <div className={`report ${report.passed ? 'pass' : 'fail'}`}>
          <div className="report-head">
            <div>
              <strong>{report.passed ? '🏆 Project approved!' : '🧭 Not ready yet'}</strong>
              <p className="muted small">
                {report.repo} @ {report.branch} · {report.fileCount} files inspected
              </p>
            </div>
            <div className="score-ring" style={{ ['--p' as string]: report.score }}>
              {report.score}%
            </div>
          </div>
          <ul className="checks">
            {report.results.map((r, i) => (
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
          {!report.passed && <p>Fix the ❌ items, push your changes, then run the checks again.</p>}
        </div>
      )}
    </div>
  );
}
