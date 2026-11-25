import { useRef, useState } from 'react';
import { useFocusTrap } from '../lib/focus';
import { useStore } from '../store';
import DialogueBox from './ui/DialogueBox';

const LINES = [
  'Welcome, traveller! Corruption has spread across the realm of Devoria. Clear the quests in each area to purify it.',
  'Every quiz is a battle. Each wrong answer costs 10 to 20 HP. HP heals over time, and fully when you purify an area. If you are knocked out, you wake with 25 HP and can try again.',
  'A hint costs 10 MP. Chests in purified areas hold a rest token for the Campfire, which protects your streak, and a Tome. After a passed quiz a wayside Inn may appear to restore HP and MP.',
  'Open the menu on the world map and choose Save to keep a backup file. Good luck, hero!',
];

/** First-launch Sage intro. Shown once; migrated players with progress never see it. */
export default function Onboarding() {
  const seen = useStore((s) => !!s.dialoguesSeen.intro);
  const markSeen = useStore((s) => s.markDialogueSeen);
  const [i, setI] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const finish = () => markSeen('intro');
  useFocusTrap(ref, !seen, finish);

  if (seen) return null;
  const last = i === LINES.length - 1;
  return (
    <div className="dlg-overlay" ref={ref} role="dialog" aria-modal="true" aria-label="Welcome from the Sage">
      <DialogueBox
        speaker="Sage"
        who="sage"
        text={LINES[i]}
        step={`${i + 1} / ${LINES.length}`}
        last={last}
        onNext={() => (last ? finish() : setI(i + 1))}
        onSkip={finish}
      />
    </div>
  );
}
