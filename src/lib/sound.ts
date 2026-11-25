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

export type Sfx =
  | 'click'
  | 'confirm'
  | 'back'
  | 'error'
  | 'victory'
  | 'levelup'
  | 'toggle'
  | 'purify'
  | 'cursor'
  | 'hit'
  | 'hurt'
  | 'defeat'
  | 'hint'
  | 'inn'
  | 'campfire'
  | 'chest'
  | 'save'
  | 'text';

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
  cursor: () => play([{ freq: 1100, dur: 0.03, vol: 0.06, type: 'square' }]),
  // a sword landing
  hit: () =>
    play([
      { freq: 180, dur: 0.1, vol: 0.14, type: 'sawtooth', to: 70 },
      { freq: 900, dur: 0.05, vol: 0.08, type: 'square', to: 400 },
    ]),
  // the hero is struck
  hurt: () =>
    play([
      { freq: 300, dur: 0.14, vol: 0.14, type: 'square', to: 120 },
      { freq: 120, at: 0.1, dur: 0.16, vol: 0.12, type: 'sawtooth', to: 70 },
    ]),
  // slow falling line
  defeat: () => play([392, 330, 262, 196, 147].map((freq, i) => ({ freq, at: i * 0.2, dur: 0.3, vol: 0.12, type: 'triangle' as const }))),
  hint: () =>
    play([
      { freq: 1047, dur: 0.08, vol: 0.09, type: 'sine' },
      { freq: 1568, at: 0.07, dur: 0.18, vol: 0.09, type: 'sine' },
    ]),
  // warm restful chord
  inn: () =>
    play([
      { freq: 262, dur: 0.9, vol: 0.09, type: 'sine' },
      { freq: 330, at: 0.12, dur: 0.9, vol: 0.09, type: 'sine' },
      { freq: 392, at: 0.24, dur: 0.9, vol: 0.09, type: 'sine' },
      { freq: 523, at: 0.36, dur: 1.0, vol: 0.08, type: 'triangle' },
    ]),
  // crackle, then a soft chord
  campfire: () =>
    play([
      { freq: 90, dur: 0.05, vol: 0.07, type: 'sawtooth', to: 400 },
      { freq: 130, at: 0.08, dur: 0.05, vol: 0.06, type: 'sawtooth', to: 300 },
      { freq: 330, at: 0.2, dur: 0.6, vol: 0.07, type: 'sine' },
      { freq: 494, at: 0.3, dur: 0.6, vol: 0.06, type: 'sine' },
    ]),
  chest: () =>
    play([
      { freq: 200, dur: 0.08, vol: 0.1, type: 'square', to: 300 },
      ...[659, 784, 988, 1319].map((freq, i) => ({ freq, at: 0.1 + i * 0.07, dur: 0.14, vol: 0.09, type: 'triangle' as const })),
    ]),
  save: () =>
    play([
      { freq: 988, dur: 0.1, vol: 0.09, type: 'sine' },
      { freq: 1319, at: 0.1, dur: 0.1, vol: 0.09, type: 'sine' },
      { freq: 1976, at: 0.2, dur: 0.3, vol: 0.08, type: 'sine' },
    ]),
  // dialogue typewriter blip (throttled in sfx)
  text: () => play([{ freq: 520, dur: 0.02, vol: 0.04, type: 'square' }]),
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

let lastText = 0;

export function sfx(name: Sfx) {
  try {
    if (name === 'text') {
      const t = performance.now();
      if (t - lastText < 70) return;
      lastText = t;
    }
    SOUNDS[name]();
  } catch {
    /* audio is a nicety; never let it break the app */
  }
}
