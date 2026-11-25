import { useState } from 'react';
import { ISLAND_MAP } from '../../data';
import { REST_TOKENS_MAX } from '../../lib/game';
import { sfx } from '../../lib/sound';
import { tomeOf } from '../../lib/tome';
import { CHEST_CLOSED, useStore } from '../../store';
import { Chest, RestTokenIcon, TomeIcon } from '../art';

/** Rest tokens, chests from purified areas, and their Tomes. */
export default function ItemsWindow() {
  const tokens = useStore((s) => s.restTokens);
  const chests = useStore((s) => s.chests);
  const openChest = useStore((s) => s.openChest);
  const showToast = useStore((s) => s.showToast);
  const [reading, setReading] = useState<string | null>(null);

  const ids = Object.keys(chests).filter((id) => ISLAND_MAP[id]);

  return (
    <div>
      <ul className="items-list" aria-label="Items">
        <li>
          <RestTokenIcon size={28} />
          <div>
            <strong>
              Campfire rest tokens ×{tokens}/{REST_TOKENS_MAX}
            </strong>
            <p className="muted small">The Campfire spends one per missed day to keep your streak. Chests hold them.</p>
          </div>
        </li>
      </ul>
      <h3>Chests and Tomes</h3>
      {ids.length === 0 ? (
        <p className="muted">Purify an area to find its chest. Each holds a rest token and the area&apos;s Tome.</p>
      ) : (
        <ul className="items-list" aria-label="Chests and Tomes">
          {ids.map((id) => {
            const island = ISLAND_MAP[id];
            const closed = chests[id] === CHEST_CLOSED;
            return (
              <li key={id} className={closed ? 'is-locked' : ''}>
                <Chest state={closed ? 'closed' : 'spent'} scale="sm" title={closed ? 'Closed chest' : 'Opened chest'} />
                <div>
                  <strong>
                    {island.emoji} {island.name}
                  </strong>
                  <p className="muted small">
                    {closed ? (
                      'A closed chest: a rest token and the Tome.'
                    ) : (
                      <>
                        <TomeIcon size={14} /> Tome
                      </>
                    )}
                  </p>
                  {reading === id && (
                    <ul className="tome-text">
                      {tomeOf(island).map((t) => (
                        <li key={t.quest}>
                          <strong>{t.quest}</strong>: {t.points.join(' ')}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {closed ? (
                  <button
                    className="btn btn-primary btn-sm"
                    data-sfx="none"
                    onClick={() => {
                      if (openChest(id)) {
                        sfx('chest');
                        showToast(`Chest opened: +1 rest token and the ${island.name} Tome.`);
                      }
                    }}
                  >
                    Open
                  </button>
                ) : (
                  <button className="btn btn-sm" aria-expanded={reading === id} onClick={() => setReading(reading === id ? null : id)}>
                    {reading === id ? 'Close' : 'Read'}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
