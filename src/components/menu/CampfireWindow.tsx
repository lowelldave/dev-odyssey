import { REST_TOKENS_MAX, streak } from '../../lib/game';
import { useStore } from '../../store';
import { Campfire, Portrait, RestTokenIcon } from '../art';

/** The Campfire: explains streak protection and lists the nights it has bridged. It never heals; the wayside Inn does. */
export default function CampfireWindow() {
  const tokens = useStore((s) => s.restTokens);
  const restDays = useStore((s) => s.restDays);
  const activity = useStore((s) => s.activity);
  const st = streak(activity, restDays);
  const nights = Object.keys(restDays).sort().reverse().slice(0, 7);

  return (
    <div>
      <div className="save-row">
        <Campfire lit={tokens > 0} size={64} title="Campfire" />
        <div>
          <p className="eyebrow">
            <Portrait who="campfire" size={24} /> Campfire
          </p>
          <p>
            Sit by the fire and your streak is safe. If you miss one or two days, the Campfire spends a rest token for each night and keeps your
            streak going, as long as it was at least 3 days long.
          </p>
        </div>
      </div>
      <p>
        <RestTokenIcon size={20} /> Rest tokens: <strong>{tokens}/{REST_TOKENS_MAX}</strong> · Streak: <strong>{st.current}</strong> day
        {st.current === 1 ? '' : 's'}
      </p>
      {nights.length ? (
        <>
          <h3>Recent bridged nights</h3>
          <ul className="camp-days">
            {nights.map((d) => (
              <li key={d}>🌙 {d}</li>
            ))}
          </ul>
        </>
      ) : (
        <p className="muted">Chests in purified areas hold rest tokens.</p>
      )}
      <p className="muted small">The Campfire does not restore HP or MP. Look for a wayside Inn for that.</p>
    </div>
  );
}
