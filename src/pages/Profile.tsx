import { useEffect, useRef, useState } from 'react';
import PartyPanel from '../components/PartyPanel';
import { downloadSave } from '../lib/save';
import { computeBadges } from '../lib/badges';
import { levelInfo, titleFor } from '../lib/game';
import { useStore } from '../store';

const AVATARS = ['🧑‍💻', '👩‍💻', '👨‍💻', '🧙', '🏴‍☠️', '🦊', '🐙', '🦉', '🐉', '🤖', '🧜', '🦸'];

export default function Profile() {
  const s = useStore();
  const lv = levelInfo(s.xp);
  const badges = computeBadges(s);
  const earned = badges.filter((b) => b.earned).length;
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');
  const [tokenDraft, setTokenDraft] = useState(s.githubToken);

  // achievements shown as new here stop being new when you leave the page
  const unseen = badges.filter((b) => b.earned && !s.badgesSeen[b.id]).map((b) => b.id);
  const unseenRef = useRef(unseen);
  unseenRef.current = unseen;
  useEffect(
    () => () => {
      if (unseenRef.current.length) useStore.getState().markBadgesSeen(unseenRef.current);
    },
    [],
  );

  const importFile = async (f: File) => {
    try {
      s.importData(await f.text());
      setMsg('✅ Save imported.');
    } catch (e) {
      setMsg(`⚠️ ${e instanceof Error ? e.message : 'Import failed.'}`);
    }
  };

  return (
    <div className="profile">
      <section className="player-card window">
        <div className="player-avatar">{s.avatar}</div>
        <div className="player-info">
          <input className="name-input" value={s.name} onChange={(e) => s.setProfile({ name: e.target.value })} aria-label="Your name" maxLength={30} />
          <p className="title-line">
            LV {lv.level} · {titleFor(lv.level)}
          </p>
          <div className="avatar-pick">
            {AVATARS.map((a) => (
              <button key={a} className={a === s.avatar ? 'on' : ''} onClick={() => s.setProfile({ avatar: a })} aria-label={`Use avatar ${a}`}>
                {a}
              </button>
            ))}
          </div>
        </div>
      </section>

      <PartyPanel />

      <section>
        <h2 className="badges-title">
          🎖️ Achievements ({earned}/{badges.length})
        </h2>
        <div className="badges">
          {badges.map((b) => (
            <div key={b.id} className={`badge window ${b.earned ? 'earned' : ''}`} title={b.desc}>
              <span className="badge-emoji">{b.earned ? b.emoji : '❔'}</span>
              <strong>
                {b.name}
                {b.earned && !s.badgesSeen[b.id] && <span className="badge-new">New!</span>}
              </strong>
              <span className="muted small">{b.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card settings">
        <h2>⚙️ Settings</h2>

        <h3>GitHub token (optional)</h3>
        <p className="muted small">
          Without a token, GitHub allows 60 API requests per hour, which covers a few project checks. A fine-grained personal access token with
          read-only access to public repositories raises the limit to 5,000. It is stored only in this browser and sent only to api.github.com.
        </p>
        <div className="repo-row">
          <input type="password" value={tokenDraft} onChange={(e) => setTokenDraft(e.target.value)} placeholder="github_pat_…" autoComplete="off" />
          <button className="btn" onClick={() => (s.setToken(tokenDraft), setMsg(tokenDraft ? '✅ Token saved.' : 'Token cleared.'))}>
            Save
          </button>
        </div>

        <h3>Window style</h3>
        <p className="muted small">The pixel skin gives menus hard stepped corners. Notebook pages stay as they are.</p>
        <div className="seg" role="group" aria-label="Window style">
          <button className={s.uiSkin === 'classic' ? 'on' : ''} aria-pressed={s.uiSkin === 'classic'} onClick={() => s.setUiSkin('classic')} data-sfx="toggle">
            Classic
          </button>
          <button className={s.uiSkin === 'pixel' ? 'on' : ''} aria-pressed={s.uiSkin === 'pixel'} onClick={() => s.setUiSkin('pixel')} data-sfx="toggle">
            Pixel
          </button>
        </div>

        <h3>Backup</h3>
        <p className="muted small">Progress is saved in this browser. Export a backup to move it to another device.</p>
        <div className="btn-row">
          <button className="btn" onClick={downloadSave}>
            ⬇ Export save
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            ⬆ Import save
          </button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => {
              const f = e.target.files?.[0];
              // clear so choosing the same file again still fires onChange
              e.target.value = '';
              if (f) void importFile(f);
            }} />
          <button
            className="btn btn-danger"
            onClick={() => {
              if (confirm('Reset ALL progress? This cannot be undone. Export a backup first if you might want it.')) {
                s.reset();
                setMsg('Progress reset.');
              }
            }}
          >
            Reset progress
          </button>
        </div>
        {msg && <p>{msg}</p>}
      </section>
    </div>
  );
}
