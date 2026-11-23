import { useStore } from '../store';

/**
 * Tiny RPG-style sound effects synthesised with the Web Audio API.
 * No audio files: every sound is a few short oscillator notes.
 * Browsers only allow audio after a user gesture, and every sound here is
 * triggered by one, so nothing ever plays on page load.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function audio() {
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

interface Note {
  freq: number;
  /** seconds after the sound starts */
  at?: number;
  dur: number;
  type?: OscillatorType;
  vol?: number;
  /** glide to this frequency over the note */
  to?: number;
}

function play(notes: Note[]) {
  if (!useStore.getState().sound) return;
  const ac = audio();
  if (!ac || !master) return;
  const t0 = ac.currentTime + 0.005;
  for (const n of notes) {
    const start = t0 + (n.at ?? 0);
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = n.type ?? 'triangle';
    osc.frequency.setValueAtTime(n.freq, start);
    if (n.to) osc.frequency.exponentialRampToValueAtTime(n.to, start + n.dur);
    const vol = n.vol ?? 0.18;
    // quick attack, smooth release: no clicks
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(vol, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + n.dur);
    osc.connect(gain).connect(master);
    osc.start(start);
    osc.stop(start + n.dur + 0.02);
  }
}

export type Sfx = 'click' | 'confirm' | 'back' | 'error' | 'victory' | 'levelup' | 'toggle' | 'purify';

const SOUNDS: Record<Sfx, () => void> = {
  // soft two-step menu blip
  click: () =>
    play([
      { freq: 1320, dur: 0.045, vol: 0.09 },
      { freq: 1760, at: 0.035, dur: 0.05, vol: 0.07 },
    ]),
  // bright rising chime for opening a quest / area
  confirm: () =>
    play([
      { freq: 784, dur: 0.07, vol: 0.12 },
      { freq: 1175, at: 0.06, dur: 0.08, vol: 0.12 },
      { freq: 1568, at: 0.12, dur: 0.14, vol: 0.1, type: 'sine' },
    ]),
  back: () =>
    play([
      { freq: 1175, dur: 0.05, vol: 0.08 },
      { freq: 784, at: 0.045, dur: 0.07, vol: 0.08 },
    ]),
  toggle: () => play([{ freq: 990, dur: 0.06, vol: 0.1, type: 'square', to: 1480 }]),
  // low "bonk"
  error: () =>
    play([
      { freq: 220, dur: 0.12, vol: 0.12, type: 'square', to: 150 },
      { freq: 165, at: 0.1, dur: 0.18, vol: 0.1, type: 'square', to: 110 },
    ]),
  // short fanfare: rising arpeggio then a held chord
  victory: () => {
    const lead: [number, number][] = [
      [523, 0],
      [659, 0.11],
      [784, 0.22],
      [1047, 0.33],
    ];
    play([
      ...lead.map(([freq, at]) => ({ freq, at, dur: 0.12, vol: 0.14, type: 'square' as const })),
      { freq: 1047, at: 0.46, dur: 0.6, vol: 0.12, type: 'square' },
      { freq: 784, at: 0.46, dur: 0.6, vol: 0.09 },
      { freq: 523, at: 0.46, dur: 0.6, vol: 0.09 },
      { freq: 262, at: 0.46, dur: 0.6, vol: 0.1, type: 'sine' },
    ]);
  },
  // the corruption lifts: a soft swell under a shimmering, bell-like arpeggio
  purify: () =>
    play([
      { freq: 196, dur: 1.4, vol: 0.08, type: 'sine', to: 392 },
      ...[784, 988, 1175, 1568, 1976, 2349].map((freq, i) => ({ freq, at: 0.15 + i * 0.09, dur: 0.5, vol: 0.07, type: 'sine' as const })),
      { freq: 1568, at: 0.8, dur: 0.9, vol: 0.06, type: 'triangle' },
      { freq: 1175, at: 0.8, dur: 0.9, vol: 0.06, type: 'sine' },
    ]),
  // sparkly fast run upwards
  levelup: () =>
    play(
      [523, 659, 784, 988, 1175, 1397, 1568, 2093].map((freq, i) => ({
        freq,
        at: 0.6 + i * 0.055,
        dur: 0.12,
        vol: 0.1,
        type: 'triangle' as const,
      })),
    ),
};

export function sfx(name: Sfx) {
  try {
    SOUNDS[name]();
  } catch {
    /* audio is a nicety; never let it break the app */
  }
}
