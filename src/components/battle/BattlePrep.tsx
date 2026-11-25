import { Link, useNavigate } from 'react-router-dom';
import { monstersOf } from '../../data/monsters';
import { armBattle } from '../../lib/battleNav';
import { HINT_COST, ITEMS, QUIZ_DRAW, neededToPass, partyStats, questKey, safeMisses, weakCountFor } from '../../lib/game';
import { sfx } from '../../lib/sound';
import { useNow } from '../../lib/useNow';
import { useStore } from '../../store';
import type { Island, Quest, QuizCheckpoint } from '../../types';
import { shade } from '../art/util';
import { Monster } from '../AreaScene';
import { PotionIcon, ShieldIcon } from '../art';
import EtherButton from '../EtherButton';
import TentButton from '../TentButton';
import StatBar from '../ui/StatBar';

/** The checkpoint on the quest page: a preview of the fight. "Begin battle" opens the battle page. */
export default function BattlePrep({ island, quest, checkpoint }: { island: Island; quest: Quest; checkpoint: QuizCheckpoint }) {
  const key = questKey(island.id, quest.id);
  const pool = checkpoint.questions;
  const n = Math.min(QUIZ_DRAW, pool.length);
  const need = neededToPass(n, checkpoint.passPercent);
  const mons = monstersOf(island.id);
  const navigate = useNavigate();

  const alreadyDone = useStore((s) => !!s.completed[key]);
  const innOffer = useStore((s) => s.innOffer);
  const hp = useStore((s) => s.hp);
  const hpAt = useStore((s) => s.hpAt);
  const mp = useStore((s) => s.mp);
  const mpAt = useStore((s) => s.mpAt);
  const xp = useStore((s) => s.xp);
  const items = useStore((s) => s.items);
  const weak = useStore((s) => s.weak);
  const weakCount = weakCountFor(weak, key, quest);
  const now = useNow(1000);
  const party = partyStats({ hp, hpAt, mp, mpAt, xp }, now);
  const afford = safeMisses(party.hp.value);
  const ownsAny = items.potion + items.ether + items.shield + items.tent > 0;
  const needsRest = party.hp.value < party.hp.max || party.mp.value < party.mp.max;

  const begin = (mode: 'battle' | 'training' = 'battle') => {
    sfx('confirm');
    navigate(`/island/${island.id}/quest/${quest.id}/battle`, { state: { nonce: armBattle(key), mode } });
  };

  return (
    <div className="battle">
      <div className="battle-intro">
        <svg viewBox="0 0 120 80" className="monster-preview" role="img" aria-label={mons.minion.name}>
          <g transform="translate(60 70) scale(1.7)">
            <Monster family={mons.minion.family} c={shade(island.color, -0.2)} name={mons.minion.name} x={0} y={0} />
          </g>
        </svg>
        <div>
          <p className="eyebrow">{mons.minion.name} blocks the way</p>
          <p>
            {n} question{n === 1 ? '' : 's'} drawn from a pool of {pool.length} · {need} correct to win.
            {n < QUIZ_DRAW && ' This trial is still growing, so it asks fewer questions.'}
            {weakCount > 0 && ` · ${weakCount} weak spot${weakCount === 1 ? '' : 's'}`}
            {alreadyDone && ' You already won this one. Replays cost HP and pay nothing. Training is free and leads with your weak spots.'}
          </p>
        </div>
      </div>
      <div className="battle-vitals">
        <StatBar kind="hp" title="HP" value={party.hp.value} max={party.hp.max} wounded={party.hp.state === 'wounded'} ko={party.hp.state === 'ko'} />
        <StatBar kind="mp" title="MP" value={party.mp.value} max={party.mp.max} status={`Hints cost ${HINT_COST} MP`} />
      </div>
      <p className={`afford ${afford <= 1 ? 'is-warn' : ''}`} role={afford <= 1 ? 'alert' : undefined}>
        You can afford {afford} wrong answer{afford === 1 ? '' : 's'}.
        {afford <= 1 && (afford === 0 ? ' Even one miss could knock you out.' : ' One more miss after that could knock you out.')}
      </p>
      <div className="battle-kit">
        {ownsAny ? (
          <>
            <span>
              <PotionIcon size={16} empty={items.potion === 0} /> Potions ×{items.potion}/{ITEMS.potion.max}
            </span>
            <span>
              <ShieldIcon size={16} broken={items.shield === 0} /> {items.shield > 0 ? 'Auto-shield ready (equips automatically)' : 'No auto-shield'}
            </span>
            <span>
              <PotionIcon size={16} tone="ether" empty={items.ether === 0} /> Ethers ×{items.ether}/{ITEMS.ether.max}
            </span>
            {items.ether > 0 && party.mp.value < party.mp.max && <EtherButton compact />}
            {items.tent > 0 && needsRest && <TentButton compact />}
          </>
        ) : (
          <span className="muted small">
            Buy potions, ethers and shields at the shop near Web Village (<Link to="/">world map</Link>).
          </span>
        )}
      </div>
      {innOffer && (
        <p className="muted small">
          A wayside Inn is open on the <Link to={`/island/${innOffer.islandId}`}>quest board</Link>. Starting a battle (not Training) closes it.
        </p>
      )}
      <div className="btn-row">
        <button className="btn btn-primary" onClick={() => begin('battle')} disabled={!pool.length} data-sfx="none">
          ⚔️ {alreadyDone ? 'Replay battle' : 'Begin battle'}
        </button>
        {alreadyDone && (
          <button className="btn" onClick={() => begin('training')} disabled={!pool.length} data-sfx="none">
            🎯 Training <span className="btn-sub">No HP lost, free hints, no rewards</span>
          </button>
        )}
      </div>
    </div>
  );
}
