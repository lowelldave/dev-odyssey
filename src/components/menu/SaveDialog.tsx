import { useRef, useState } from 'react';
import { downloadSave, isBackupDue } from '../../lib/save';
import { sfx } from '../../lib/sound';
import { useStore } from '../../store';
import { SaveCrystal } from '../art';

/** Progress autosaves in this browser. "Save" writes or loads a Save Scroll, the backup file. */
export default function SaveDialog() {
  const completed = useStore((s) => s.completed);
  const lastBackupAt = useStore((s) => s.lastBackupAt);
  const importData = useStore((s) => s.importData);
  const showToast = useStore((s) => s.showToast);
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');
  const due = isBackupDue(completed, lastBackupAt);

  const load = async (f: File) => {
    try {
      importData(await f.text());
      setMsg('Save scroll loaded.');
      sfx('save');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Could not load that file.');
    }
  };

  return (
    <div>
      <div className="save-row">
        <SaveCrystal due={due} size={64} title={due ? 'The crystal glows: a backup is due' : 'Save crystal'} />
        <div>
          <p>Your progress is saved in this browser automatically. A Save Scroll is a backup file you can keep or carry to another device.</p>
          <p className="muted small">
            {lastBackupAt ? `Last scroll written ${new Date(lastBackupAt).toLocaleString()}.` : 'You have not written a Save Scroll yet.'}
            {due && ' The crystal glows: a backup is due.'}
          </p>
        </div>
      </div>
      <div className="btn-row">
        <button
          className="btn btn-primary"
          data-sfx="none"
          onClick={() => {
            downloadSave();
            sfx('save');
            showToast('Save scroll written.');
          }}
        >
          ⬇ Write a Save Scroll
        </button>
        <button className="btn" onClick={() => fileRef.current?.click()}>
          ⬆ Load a Save Scroll
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (f) void load(f);
          }}
        />
      </div>
      {msg && <p role="status">{msg}</p>}
    </div>
  );
}
