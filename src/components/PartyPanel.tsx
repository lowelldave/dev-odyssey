import { formatDuration, partyStats } from '../lib/game';
import { useNow } from '../lib/useNow';
import { useStore } from '../store';
import { Bar, HeartIcon, MpCrystalIcon, Portrait } from './art';
import Purse from './Purse';
import TentButton from './TentButton';
import StatBar from './ui/StatBar';

function useParty(periodMs: number) {
  const hp = useStore((s) => s.hp);
  const hpAt = useStore((s) => s.hpAt);
  const mp = useStore((s) => s.mp);
  const mpAt = useStore((s) => s.mpAt);
  const xp = useStore((s) => s.xp);
  const now = useNow(periodMs);
  return partyStats({ hp, hpAt, mp, mpAt, xp }, now);
}

const hpWord = { healthy: 'Healthy', wounded: 'Wounded', ko: 'Knocked out' } as const;

/**
 * The hero's bars. `full` shows HP, MP and EXP with their status text; `compact` is a two-bar strip for the HUD
 * on phones, which turns amber or red when the hero is hurt so the state is visible on every page.
 */
export default function PartyPanel({ variant = 'full', legend = true, purse = true }: { variant?: 'full' | 'compact'; legend?: boolean; purse?: boolean }) {
  const p = useParty(variant === 'full' ? 1000 : 15_000);
  const avatar = useStore((s) => s.avatar);
  const name = useStore((s) => s.name);
  const hurt = p.hp.state !== 'healthy';

  if (variant === 'compact') {
    return (
      <div className={`party-compact ${hurt ? `is-${p.hp.state}` : ''}`} aria-label={`HP ${Math.round(p.hp.value)} of ${p.hp.max}, MP ${Math.round(p.mp.value)} of ${p.mp.max}`} role="group">
        <Bar kind="hp" value={p.hp.value} max={p.hp.max} wounded={p.hp.state === 'wounded'} ko={p.hp.state === 'ko'} paused={p.hp.paused} label="HP" notches={false} />
        <Bar kind="mp" value={p.mp.value} max={p.mp.max} label="MP" />
      </div>
    );
  }

  const hpStatus = p.hp.paused
    ? 'Regeneration paused during battle'
    : [hpWord[p.hp.state], p.hp.fullInSec !== null ? `full in ${formatDuration(p.hp.fullInSec)}` : 'full'].join(' · ');

  return (
    <section className={`party window ${hurt ? `is-${p.hp.state}` : ''}`} aria-label="Party status">
      <div className="party-head">
        <Portrait who="hero" size={44} ko={p.hp.state === 'ko'} />
        <div>
          <strong className="party-name">
            {avatar} {name}
          </strong>
          <span className="muted small">LV {p.exp.level}</span>
        </div>
      </div>
      <StatBar
        kind="hp"
        title="HP"
        icon={<HeartIcon size={16} empty={p.hp.state === 'ko'} />}
        value={p.hp.value}
        max={p.hp.max}
        wounded={p.hp.state === 'wounded'}
        ko={p.hp.state === 'ko'}
        paused={p.hp.paused}
        status={hpStatus}
      />
      <StatBar
        kind="mp"
        title="MP"
        icon={<MpCrystalIcon size={16} />}
        value={p.mp.value}
        max={p.mp.max}
        status={p.mp.nextInSec === null ? 'Full' : `+1/min · next in ${formatDuration(p.mp.nextInSec)}`}
      />
      <StatBar kind="exp" title="EXP" value={p.exp.value} max={p.exp.max} status={`to LV ${p.exp.level + 1}`} />
      {purse && (
        <div className="party-purse">
          <Purse />
          <TentButton />
        </div>
      )}
      {legend && (
        <p className="party-legend muted small">
          HP: −10 to −20 per wrong answer, +1/min outside battle, full when you purify an area. MP: hints. EXP: next level. Potions: +30 HP in battle. Tents: +50 HP, +30 MP outside battle.
        </p>
      )}
    </section>
  );
}
