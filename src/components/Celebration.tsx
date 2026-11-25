import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ISLAND_MAP } from '../data';
import { monstersOf } from '../data/monsters';
import { computeBadges } from '../lib/badges';
import { REST_TOKENS_MAX, levelInfo, maxMp, partyStats, titleFor } from '../lib/game';
import { useFocusTrap } from '../lib/focus';
import { sfx } from '../lib/sound';
import { tomeOf } from '../lib/tome';
import { CHEST_CLOSED, useStore } from '../store';
import { BadgeSlotIcon, Chest, HeartIcon, InnScene, MpCrystalIcon, Portrait, RestTokenIcon, TomeIcon } from './art';
import StatBar from './ui/StatBar';

/** The victory screen: battle log, party bars, healing, a wayside Inn offer, chest and new badges. */
export default function Celebration() {
  const c = useStore((s) => s.celebration);
  const dismiss = useStore((s) => s.dismissCelebration);

  const sparkles = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        color: ['#ffd34d', '#7fd8ff', '#6ee59a', '#ff9fb1', '#ffffff'][i % 5],
      })),
    [c],
  );

  useEffect(() => {
    if (!c) return;
    sfx('victory');
    if (c.levelUp) sfx('levelup');
  }, [c]);

  // badges earned by this clear that the player has not seen yet; marked seen once shown
  const newBadges = useMemo(() => {
    if (!c) return [];
    const s = useStore.getState();
    return computeBadges(s).filter((b) => b.earned && !s.badgesSeen[b.id]);
  }, [c]);
  useEffect(() => {
    if (c && newBadges.length) useStore.getState().markBadgesSeen(newBadges.map((b) => b.id));
  }, [c, newBadges]);

  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, !!c, dismiss, 'checkpoint');

  if (!c) return null;

  const island = ISLAND_MAP[c.islandId];
  const index = island.quests.findIndex((q) => q.id === c.questId);
  const nextQuest = island.quests[index + 1];
  const mons = monstersOf(island.id);
  const defeated = island.quests[index]?.boss ? `You defeated the ${mons.boss.name}!` : `A ${mons.minion.name} was vanquished!`;

  return (
    <div className="modal-backdrop" onClick={dismiss}>
      <div className="confetti" aria-hidden>
        {sparkles.map((p, i) => (
          <i key={i} style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, background: p.color }} />
        ))}
      </div>
      <div ref={dialogRef} className="modal window" role="dialog" aria-modal="true" aria-labelledby="victory-title" onClick={(e) => e.stopPropagation()}>
        <div className="celebrate-icon">{c.islandCompleted ? '🏆' : '⚔️'}</div>
        <p className="victory" id="victory-title">
          {c.islandCompleted ? 'AREA PURIFIED!' : 'VICTORY!'}
        </p>
        <p className="muted">{c.questTitle}</p>
        <div className="battle-log">
          <p>{defeated}</p>
          <p className="exp">Gained {c.xp} EXP!</p>
          {c.levelUp && (
            <p className="lvl">
              Level up! You reached LV {c.levelUp}: {titleFor(c.levelUp)}.
              {c.levelUp % 10 === 0 && ` Max MP ${maxMp(c.levelUp)}!`}
            </p>
          )}
          {c.islandCompleted && (
            <p>
              The corruption lifts from {c.islandCompleted.emoji} {c.islandCompleted.name}. Its people return!
            </p>
          )}
          {c.unlocked.length > 0 && <p>New roads have opened!</p>}
        </div>

        <PartyRow healed={!!c.hpRestored} />

        {c.islandCompleted && <ChestReward islandId={c.islandCompleted.id} />}
        {c.inn && <InnPrompt />}

        {newBadges.length > 0 && (
          <div className="victory-extras" aria-label="New achievements">
            {newBadges.map((b) => (
              <div key={b.id} className="row">
                <BadgeSlotIcon earned size={24} />
                <span>
                  {b.emoji} <strong>{b.name}</strong> <span className="badge-new">Obtained!</span>
                </span>
              </div>
            ))}
          </div>
        )}

        <p className="eyebrow">What next?</p>
        <div className="next-choices">
          {nextQuest ? (
            <Link className="btn btn-primary" to={`/island/${island.id}/quest/${nextQuest.id}`} data-sfx="confirm">
              ▶ Next quest: {nextQuest.title}
            </Link>
          ) : (
            c.unlocked.map((u, i) => (
              <Link key={u.id} className={`btn ${i === 0 ? 'btn-primary' : ''}`} to={`/island/${u.id}`} data-sfx="confirm">
                ▶ Travel to {u.emoji} {u.name}
              </Link>
            ))
          )}
          <Link className="btn" to={nextQuest ? `/island/${island.id}` : '/'} data-sfx="back">
            {nextQuest ? '📋 Back to the quest board' : '🗺️ Return to the world map'}
          </Link>
          <button className="btn btn-ghost" onClick={dismiss} data-sfx="back">
            Stay here
          </button>
        </div>
      </div>
    </div>
  );
}

/** The hero's HP and MP, live, so resting at the Inn updates them in place. */
function PartyRow({ healed }: { healed: boolean }) {
  const hp = useStore((s) => s.hp);
  const hpAt = useStore((s) => s.hpAt);
  const mp = useStore((s) => s.mp);
  const mpAt = useStore((s) => s.mpAt);
  const xp = useStore((s) => s.xp);
  const p = partyStats({ hp, hpAt, mp, mpAt, xp }, Date.now());
  const lv = levelInfo(xp);
  return (
    <div className="victory-extras party-row">
      <div className="row">
        <Portrait who="hero" size={40} />
        <div style={{ flex: 1, minWidth: 140 }}>
          <StatBar kind="hp" title="HP" icon={<HeartIcon size={14} />} value={p.hp.value} max={p.hp.max} wounded={p.hp.state === 'wounded'} />
          <StatBar kind="mp" title="MP" icon={<MpCrystalIcon size={14} />} value={p.mp.value} max={p.mp.max} />
          <StatBar kind="exp" title={`EXP · LV ${lv.level}`} value={xp - lv.floor} max={lv.next - lv.floor} showValue={false} />
        </div>
      </div>
      {healed && <p className="exp">Your wounds are healed: HP {p.hp.max}/{p.hp.max}</p>}
    </div>
  );
}

/** The chest an area drops when it is purified: a rest token for the Campfire and the area's Tome. */
function ChestReward({ islandId }: { islandId: string }) {
  const state = useStore((s) => s.chests[islandId]);
  const tokens = useStore((s) => s.restTokens);
  const openChest = useStore((s) => s.openChest);
  const [showTome, setShowTome] = useState(false);
  const island = ISLAND_MAP[islandId];
  const opened = state !== undefined && state !== CHEST_CLOSED;
  return (
    <div className="victory-extras chest-reward">
      <div className="row">
        <Chest state={opened ? 'open' : 'closed'} scale="lg" title="Treasure chest" className={opened ? 'jr-chest-svg' : 'jr-chest-svg jr-chest-bob'} />
        <div>
          {opened ? (
            <>
              <p className="exp">
                <RestTokenIcon size={18} /> +1 rest token ({tokens}/{REST_TOKENS_MAX}) <TomeIcon size={18} /> {island.name} Tome
              </p>
              <button className="btn btn-sm" onClick={() => setShowTome((v) => !v)} aria-expanded={showTome}>
                {showTome ? 'Close the Tome' : 'Read the Tome'}
              </button>
            </>
          ) : (
            <>
              <p>A chest appeared in the cleared area!</p>
              <button
                className="btn btn-primary btn-sm"
                data-sfx="none"
                onClick={() => {
                  if (openChest(islandId)) sfx('chest');
                }}
              >
                Open the chest
              </button>
            </>
          )}
        </div>
      </div>
      {opened && showTome && (
        <ul className="tome-text">
          {tomeOf(island).map((t) => (
            <li key={t.quest}>
              <strong>{t.quest}</strong>: {t.points.join(' ')}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** The wayside Inn offer rolled for this clear. "Later" leaves it on the quest board. */
export function InnPrompt() {
  const offer = useStore((s) => s.innOffer);
  const redeem = useStore((s) => s.redeemInn);
  const [rested, setRested] = useState(false);
  const [later, setLater] = useState(false);
  if (rested) return <p className="exp victory-extras">You rested at the inn. HP and MP restored.</p>;
  if (!offer) return null;
  return (
    <div className="victory-extras inn-prompt">
      <div className="row">
        <InnScene title="A wayside inn" />
        <div>
          <p>
            <strong>A wayside Inn appears down the road!</strong>
          </p>
          <p className="muted small">Rest: +50 HP, +30 MP. It stays open until your next battle.</p>
        </div>
      </div>
      {later ? (
        <p className="muted small">The Inn waits on the quest board.</p>
      ) : (
        <div className="btn-row">
          <button
            className="btn btn-primary btn-sm"
            data-sfx="none"
            onClick={() => {
              if (redeem()) {
                sfx('inn');
                setRested(true);
              }
            }}
          >
            🛏️ Rest now
          </button>
          <button className="btn btn-sm" onClick={() => setLater(true)}>
            Later
          </button>
        </div>
      )}
    </div>
  );
}
