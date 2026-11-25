import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ISLAND_MAP } from '../../data';
import { nextQuests } from '../../lib/game';
import { sfx } from '../../lib/sound';
import { useStore } from '../../store';
import { CampfireIcon, InnIcon, SaveIcon, TomeIcon } from '../art';
import BottomSheet from '../ui/BottomSheet';
import type { CommandItem } from '../ui/CommandMenu';
import CommandMenu from '../ui/CommandMenu';
import CampfireWindow from './CampfireWindow';
import ItemsWindow from './ItemsWindow';
import SaveDialog from './SaveDialog';

type View = 'menu' | 'items' | 'campfire' | 'save' | 'inn';
const TITLES: Record<View, string> = { menu: 'Menu', items: 'Items', campfire: 'Campfire', save: 'Save', inn: 'Wayside Inn' };

/** The map command menu: Continue, Quests, Items, Campfire, Save and (only while an offer exists) Inn. */
export default function MapMenu() {
  const [view, setView] = useState<View | null>(null);
  const completed = useStore((s) => s.completed);
  const innOffer = useStore((s) => s.innOffer);
  const redeemInn = useStore((s) => s.redeemInn);
  const showToast = useStore((s) => s.showToast);
  const navigate = useNavigate();
  const next = nextQuests(completed, 1)[0];
  const close = () => setView(null);

  const items: CommandItem[] = [
    { id: 'continue', label: 'Continue', detail: next ? next.quest.title : 'Nothing left to do', icon: <span aria-hidden="true">▶</span>, disabled: !next, reason: 'Every quest is cleared' },
    { id: 'quests', label: 'Quests', detail: next ? `${next.island.name} quest board` : undefined, icon: <span aria-hidden="true">📋</span>, disabled: !next, reason: 'Every quest is cleared' },
    { id: 'items', label: 'Items', detail: 'Rest tokens, chests and Tomes', icon: <TomeIcon size={20} /> },
    { id: 'campfire', label: 'Campfire', detail: 'Protects your streak', icon: <CampfireIcon size={20} /> },
    { id: 'save', label: 'Save', detail: 'Write or load a Save Scroll', icon: <SaveIcon size={20} /> },
    ...(innOffer ? [{ id: 'inn', label: 'Inn', detail: 'Rest: +50 HP, +30 MP', badge: '!', icon: <InnIcon size={20} /> }] : []),
  ];

  const pick = (id: string) => {
    if (id === 'continue' && next) {
      close();
      navigate(`/island/${next.island.id}/quest/${next.quest.id}`);
    } else if (id === 'quests' && next) {
      close();
      navigate(`/island/${next.island.id}`);
    } else if (id === 'items' || id === 'campfire' || id === 'save' || id === 'inn') {
      sfx('confirm');
      setView(id);
    }
  };

  const innIsland = innOffer ? ISLAND_MAP[innOffer.islandId] : undefined;

  return (
    <>
      <button className="btn" onClick={() => setView('menu')} aria-haspopup="dialog" data-sfx="confirm">
        ☰ Menu{innOffer && <span className="cmd-badge" aria-label="a wayside Inn is open"> !</span>}
      </button>
      <BottomSheet open={view !== null} onClose={close} title={view ? TITLES[view] : 'Menu'} focusKey={view ?? ''}>
        {view === 'menu' && <CommandMenu items={items} onSelect={pick} onCancel={close} label="Map menu" memoryKey="map" autoFocus numberKeys />}
        {view && view !== 'menu' && (
          <button className="btn btn-ghost btn-sm" onClick={() => setView('menu')} data-sfx="back" data-autofocus={view !== 'inn' ? '' : undefined}>
            ◀ Menu
          </button>
        )}
        {view === 'items' && <ItemsWindow />}
        {view === 'campfire' && <CampfireWindow />}
        {view === 'save' && <SaveDialog />}
        {view === 'inn' && (
          <div>
            {innOffer ? (
              <>
                <p>
                  A wayside Inn is open near {innIsland?.name ?? 'the road'}. Rest here for <strong>+50 HP and +30 MP</strong> (up to your maximum). It
                  closes when your next battle starts.
                </p>
                <div className="btn-row">
                  <button
                    className="btn btn-primary"
                    data-sfx="none"
                    data-autofocus
                    onClick={() => {
                      if (redeemInn()) {
                        sfx('inn');
                        showToast('You rested at the wayside inn. HP and MP restored.');
                        close();
                      }
                    }}
                  >
                    🛏️ Rest
                  </button>
                  <button className="btn" onClick={() => setView('menu')} data-sfx="back">
                    Not now
                  </button>
                </div>
              </>
            ) : (
              <p className="muted">The wayside Inn has closed.</p>
            )}
          </div>
        )}
      </BottomSheet>
    </>
  );
}
