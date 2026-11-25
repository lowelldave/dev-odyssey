import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { monstersOf } from '../../data/monsters';
import {
  type BattleQuestion,
  HINT_COST,
  QUIZ_DRAW,
  drawQuestions,
  neededToPass,
  partyStats,
  questKey,
  quizPasses,
  quizScore,
} from '../../lib/game';
import { useReducedMotion } from '../../lib/motion';
import { sfx } from '../../lib/sound';
import { useNow } from '../../lib/useNow';
import { mpNow, useStore } from '../../store';
import type { Island, Quest, QuizCheckpoint } from '../../types';
import { BattleBackdrop, DamageNumber, HeroDefeated, HintButtonFace, HintCard, HitFlash, SlashFx } from '../art';
import { shade } from '../art/util';
import { Monster } from '../AreaScene';
import { InnPrompt } from '../Celebration';
import { Hero } from '../Overworld';
import CommandMenu, { type CommandItem } from '../ui/CommandMenu';
import DefeatModal from './DefeatModal';
import InlineText from '../ui/InlineText';
import StatBar from '../ui/StatBar';

type Phase = 'loading' | 'asking' | 'resolved' | 'defeated' | 'failed' | 'won';

interface Fx {
  id: number;
  kind: 'hit' | 'hurt' | 'finish';
  amount?: number;
}

const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

/**
 * A quiz as a battle: n questions are drawn from the quest pool, each wrong answer costs persistent HP,
 * hints cost MP. Pass/fail uses the shared `quizPasses`; the battle never records anything if it is abandoned.
 */
export default function BattleQuiz({
  island,
  quest,
  checkpoint,
  next,
  lessonPath,
}: {
  island: Island;
  quest: Quest;
  checkpoint: QuizCheckpoint;
  next: { href: string; label: string };
  /** the quest (lesson) page: failing, fleeing and finishing all return here */
  lessonPath: string;
}) {
  const navigate = useNavigate();
  const key = questKey(island.id, quest.id);
  const pool = checkpoint.questions;
  const n = Math.min(QUIZ_DRAW, pool.length);
  const need = neededToPass(n, checkpoint.passPercent);
  const mons = monstersOf(island.id);
  const reduced = useReducedMotion();

  const startBattle = useStore((s) => s.startBattle);
  const takeHit = useStore((s) => s.takeHit);
  const endBattle = useStore((s) => s.endBattle);
  const buyHint = useStore((s) => s.buyHint);
  const recordQuiz = useStore((s) => s.recordQuiz);
  const completeQuest = useStore((s) => s.completeQuest);
  const alreadyDone = useStore((s) => !!s.completed[key]);
  const innOffer = useStore((s) => s.innOffer);
  const hp = useStore((s) => s.hp);
  const hpAt = useStore((s) => s.hpAt);
  const mp = useStore((s) => s.mp);
  const mpAtV = useStore((s) => s.mpAt);
  const xp = useStore((s) => s.xp);
  const hintsBought = useStore((s) => s.hintsBought);
  const now = useNow(1000);
  const party = partyStats({ hp, hpAt, mp, mpAt: mpAtV, xp }, now);
  const mpValue = mpNow({ mp, mpAt: mpAtV, xp }, now).value;

  const [phase, setPhase] = useState<Phase>('loading');
  const [drawn, setDrawn] = useState<BattleQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [lastMiss, setLastMiss] = useState(0);
  const [hitsKey, setHitsKey] = useState(0);
  const [fx, setFx] = useState<Fx | null>(null);
  const [announce, setAnnounce] = useState('');
  const [finishScore, setFinishScore] = useState(0);
  // a practice win (quest already cleared) has no victory screen, so its Inn offer is shown on the win panel
  const [practiceWin, setPracticeWin] = useState(false);
  const [fleeAsk, setFleeAsk] = useState(false);
  const keepRef = useRef<HTMLButtonElement>(null);
  const askedAt = useRef(0);
  const pendingComplete = useRef<number | null>(null);
  const pendingScore = useRef(0);
  const focusRef = useRef<HTMLDivElement>(null);
  const hpMax = party.hp.max;

  const dmgPerHit = n > 0 ? Math.round(100 / n) : 0;
  const monsterHp = Math.max(0, 100 - correct * dmgPerHit);
  // after a pass the monster is gone, whether it fell to the questions or to the finishing blow
  const monsterShown = phase === 'won' ? 0 : monsterHp;

  // one-shot effects are removed after a second, which also covers reduced motion (no animation, no leftovers)
  useEffect(() => {
    if (!fx) return;
    const id = window.setTimeout(() => setFx(null), 1000);
    return () => window.clearTimeout(id);
  }, [fx]);

  // leaving the page mid-battle: close it without recording anything (HP already lost stays lost);
  // a delayed victory is flushed so the clear is never lost
  useEffect(
    () => () => {
      const st = useStore.getState();
      if (pendingComplete.current !== null) {
        window.clearTimeout(pendingComplete.current);
        pendingComplete.current = null;
        completeQuest(island.id, quest.id, { score: pendingScore.current });
      }
      if (st.battle?.key === key) st.endBattle();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const begin = useCallback(() => {
    if (!pool.length) return;
    const st = useStore.getState();
    if (st.battle) st.endBattle(); // a knocked-out hero from the last attempt wakes up first
    const questions = drawQuestions(pool, n, useStore.getState().lastDraw[key] ?? []);
    const hadInn = !!useStore.getState().innOffer;
    startBattle(key, questions.map((d) => d.poolIndex));
    if (hadInn) useStore.getState().showToast('The wayside Inn closed as you set off.');
    setDrawn(questions);
    setIdx(0);
    setPicked(null);
    setCorrect(0);
    setLastMiss(0);
    setFx(null);
    askedAt.current = Date.now();
    setPhase('asking');
    setAnnounce(`Battle started. Question 1 of ${questions.length}.`);
    window.scrollTo(0, 0);
  }, [pool, n, key, startBattle]);

  // the battle starts as soon as the page opens
  useEffect(() => {
    begin();
  }, [begin]);

  const backToLesson = useCallback(() => navigate(lessonPath, { state: { focusCheckpoint: true } }), [navigate, lessonPath]);
  const flee = () => {
    // nothing is recorded; HP already lost stays lost
    useStore.getState().endBattle();
    backToLesson();
  };

  // Escape opens the flee prompt (and closes it again), unless a dialog such as the victory screen is open
  useEffect(() => {
    if (phase !== 'asking' && phase !== 'resolved') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || useStore.getState().celebration) return;
      e.preventDefault();
      setFleeAsk((v) => !v);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [phase]);
  // focus "Keep fighting" when the prompt opens; when it closes, put focus back on the active answer
  const fleeWasOpen = useRef(false);
  useEffect(() => {
    if (fleeAsk) {
      keepRef.current?.focus({ preventScroll: true });
    } else if (fleeWasOpen.current) {
      const answer = document.querySelector<HTMLElement>('.answers [tabindex="0"]') ?? document.querySelector<HTMLElement>('.answers button:not([disabled])');
      answer?.focus({ preventScroll: true });
    }
    fleeWasOpen.current = fleeAsk;
  }, [fleeAsk]);

  // after an answer, focus moves to the Next / Wake up button (once per phase change, not on every tick)
  useEffect(() => {
    if (phase === 'resolved' || phase === 'failed') focusRef.current?.querySelector<HTMLElement>('button')?.focus({ preventScroll: true });
  }, [phase]);

  const q = drawn[idx];
  const hintKey = q ? `${key}#${q.poolIndex}` : '';
  const hintBought = !!hintsBought[hintKey];
  const hintState: 'ready' | 'bought' | 'no-hint' | 'no-mp' = !q?.hint ? 'no-hint' : hintBought ? 'bought' : mpValue < HINT_COST ? 'no-mp' : 'ready';
  const hintReason = hintState === 'no-hint' ? 'No hint for this question' : hintState === 'no-mp' ? `Needs ${HINT_COST} MP` : undefined;

  const useHint = useCallback(() => {
    if (!q || phase !== 'asking') return;
    if (!q.hint) return;
    if (buyHint(hintKey) === 'ok') {
      sfx('hint');
      setAnnounce(`Hint: ${q.hint}`);
    }
  }, [q, phase, hintKey, buyHint]);

  // H opens the hint from anywhere on the page while a question is open
  useEffect(() => {
    if (phase !== 'asking') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'h' || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      e.preventDefault();
      useHint();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [phase, useHint]);

  const resolve = (choice: number) => {
    // a double Enter or a click right after "Next" must not answer the new question
    if (phase !== 'asking' || picked !== null || !q || fleeAsk || Date.now() - askedAt.current < 350) return;
    setPicked(choice);
    const right = choice === q.answer;
    const total = idx + 1;
    if (right) {
      sfx('hit');
      setCorrect((c) => c + 1);
      setFx({ id: Date.now(), kind: 'hit', amount: dmgPerHit });
      setAnnounce(`Question ${total} of ${n}. Correct! ${mons.minion.name} HP ${Math.max(0, 100 - (correct + 1) * dmgPerHit)} of 100.`);
      setPhase('resolved');
      return;
    }
    const res = takeHit();
    sfx('hurt');
    setLastMiss(res.damage);
    setHitsKey((k) => k + 1);
    setFx({ id: Date.now(), kind: 'hurt', amount: res.damage });
    if (res.defeated) {
      sfx('defeat');
      // unanswered questions count as wrong; recorded once
      recordQuiz({ key, score: quizScore(correct, drawn.length), passed: false });
      setAnnounce(`Wrong, minus ${res.damage} HP. You were knocked out.`);
      setPhase('defeated');
      return;
    }
    setAnnounce(`Question ${total} of ${n}. Wrong, minus ${res.damage} HP. HP ${res.hp} of ${hpMax}.`);
    setPhase('resolved');
  };

  const nextQuestion = () => {
    if (idx + 1 < drawn.length) {
      setIdx(idx + 1);
      setPicked(null);
      askedAt.current = Date.now();
      setPhase('asking');
      setAnnounce(`Question ${idx + 2} of ${drawn.length}.`);
      return;
    }
    // all answered and still standing
    const score = quizScore(correct, drawn.length);
    const passed = quizPasses(correct, drawn.length, checkpoint.passPercent);
    endBattle();
    recordQuiz({ key, score, passed });
    setFinishScore(score);
    if (!passed) {
      sfx('error');
      setPhase('failed');
      setAnnounce(`The ${mons.minion.name} still stands. ${correct} of ${drawn.length} correct.`);
      return;
    }
    if (monsterHp > 0) {
      sfx('hit');
      setFx({ id: Date.now(), kind: 'finish' });
    }
    setPhase('won');
    setPracticeWin(alreadyDone);
    setAnnounce(`${monsterHp > 0 ? 'Finishing blow! ' : ''}${mons.minion.name} defeated. ${correct} of ${drawn.length} correct.`);
    // first clear: the victory screen plays the fanfare; practice runs get a chime
    if (alreadyDone) sfx('confirm');
    pendingScore.current = score;
    const finish = () => {
      pendingComplete.current = null;
      completeQuest(island.id, quest.id, { score });
    };
    if (monsterHp > 0 && !reduced) pendingComplete.current = window.setTimeout(finish, 900);
    else finish();
  };

  const closeDefeat = () => {
    endBattle(); // wakes the hero at 25 HP; regeneration continues from there
    backToLesson();
  };

  const heroKo = phase === 'defeated';
  // open the defeat modal once the knockout has played on the stage (straight away under reduced motion)
  const [defeatOpen, setDefeatOpen] = useState(false);
  useEffect(() => {
    if (phase !== 'defeated') {
      setDefeatOpen(false);
      return;
    }
    const id = window.setTimeout(() => setDefeatOpen(true), reduced ? 0 : 1100);
    return () => window.clearTimeout(id);
  }, [phase, reduced]);
  const backdrop = island.region;
  const monsterCol = shade(island.color, -0.2);

  const menuItems: CommandItem[] = useMemo(() => {
    if (!q) return [];
    return q.options.map((opt, i) => {
      const resolved = picked !== null;
      const cls = resolved ? (i === q.answer ? 'correct' : i === picked ? 'wrong' : '') : '';
      return { id: String(i), label: <InlineText text={opt} />, icon: <span className="opt-letter" aria-hidden="true">{letters[i]}</span>, disabled: resolved, className: cls };
    });
  }, [q, picked]);

  /* ---------- battle ---------- */
  if (phase === 'loading') return <p className="sr-only" role="status">Preparing the battle…</p>;
  const total = drawn.length;
  const last = idx + 1 >= total;
  const fighting = phase === 'asking' || phase === 'resolved';
  return (
    <div className="battle">
      <p className="sr-only" role="status" aria-live="polite">
        {announce}
      </p>
      {fighting && (
        <div className="flee-row">
          {fleeAsk ? (
            <div className="flee-confirm" role="group" aria-label="Flee the battle?">
              <p>
                <strong>Flee the battle?</strong> HP you lost stays lost and this attempt isn&apos;t recorded.
              </p>
              <div className="btn-row">
                <button className="btn btn-primary btn-sm" onClick={() => setFleeAsk(false)} ref={keepRef} data-sfx="back">
                  Keep fighting
                </button>
                <button className="btn btn-danger btn-sm" onClick={flee} data-sfx="back">
                  Flee
                </button>
              </div>
            </div>
          ) : (
            <button className="btn btn-ghost btn-sm" onClick={() => setFleeAsk(true)} aria-keyshortcuts="Escape" data-sfx="back">
              🏃 Flee <kbd className="kbd">Esc</kbd>
            </button>
          )}
        </div>
      )}
      <div className={`jr-battle-stage battle-stage ${fx?.kind === 'hurt' && !reduced ? 'jr-shake' : ''}`} aria-hidden="true">
        <BattleBackdrop kind={backdrop} />
        <svg className="battle-svg" viewBox="0 0 300 150" preserveAspectRatio="xMidYMax meet">
          {/* attack animations live on inner groups (keyed by the effect so each one replays): a CSS transform on the
              outer group would replace its SVG translate. Right answer: the hero lunges and the monster recoils.
              Wrong answer: the monster lunges and the hero recoils. */}
          <g transform="translate(236 138) scale(3)" className={monsterShown <= 0 ? 'monster-fallen' : ''}>
            <g key={`m-${fx?.id ?? 0}`} className={fx?.kind === 'hurt' ? 'anim-monster-attack' : fx?.kind === 'hit' || fx?.kind === 'finish' ? 'anim-monster-recoil' : ''}>
              <Monster family={mons.minion.family} c={monsterCol} name={mons.minion.name} x={0} y={0} />
            </g>
          </g>
          {/* knocked out, the hero switches to the dedicated defeated sprite (it carries its own dizzy stars) */}
          {heroKo ? (
            <g transform="translate(70 136) scale(2.1)">
              <HeroDefeated />
            </g>
          ) : (
            <g transform="translate(62 130) scale(2.1)">
              <g key={`h-${fx?.id ?? 0}`} className={fx?.kind === 'hit' || fx?.kind === 'finish' ? 'anim-hero-attack' : fx?.kind === 'hurt' ? 'anim-hero-recoil' : ''}>
                <Hero x={0} y={0} />
              </g>
            </g>
          )}
        </svg>
        {fx?.kind === 'hit' && (
          <>
            <HitFlash kind="hit" fxKey={fx.id} />
            <span className="fx-at fx-monster">
              <SlashFx fxKey={fx.id} size={72} />
              <DamageNumber amount={fx.amount ?? 0} kind="hit" fxKey={fx.id} />
            </span>
          </>
        )}
        {fx?.kind === 'finish' && (
          <span className="fx-at fx-monster">
            <SlashFx fxKey={fx.id} size={96} finishing />
          </span>
        )}
        {fx?.kind === 'hurt' && (
          <>
            <HitFlash kind="hurt" fxKey={fx.id} />
            <span className="fx-at fx-hero">
              <DamageNumber amount={fx.amount ?? 0} kind="hurt" fxKey={fx.id} />
            </span>
          </>
        )}
        {phase === 'won' && monsterHp > 0 && <span className="finish-banner">Finishing blow!</span>}
      </div>

      {/* hero on the left and the enemy on the right, matching where each stands on the stage */}
      <div className="battle-plates">
        <div className="plate">
          <strong>Hero</strong>
          <StatBar kind="hp" title="HP" value={party.hp.value} max={hpMax} wounded={party.hp.state === 'wounded'} ko={party.hp.state === 'ko'} paused={party.hp.paused} flash={hitsKey > 0} flashKey={hitsKey} />
          <StatBar kind="mp" title="MP" value={party.mp.value} max={party.mp.max} />
        </div>
        <div className="plate">
          <strong>{mons.minion.name}</strong>
          <StatBar kind="monster" title="HP" value={monsterShown} max={100} showValue />
        </div>
      </div>

      {(phase === 'asking' || phase === 'resolved') && q && (
        <section className="battle-q" aria-label={`Question ${idx + 1} of ${total}`}>
          <p className="eyebrow">
            Question {idx + 1} of {total} · {need} correct to win
          </p>
          <h3 className="battle-question"><InlineText text={q.question} /></h3>
          <CommandMenu
            key={`${idx}-${q.poolIndex}`}
            items={menuItems}
            onSelect={(id) => resolve(Number(id))}
            label="Answers"
            role="group"
            numberKeys
            autoFocus={phase === 'asking'}
            className="answers"
          />
          <div className="hint-row">
            <button
              type="button"
              className={`jr-hint-btn ${hintState === 'bought' ? 'is-bought' : ''}`}
              aria-disabled={hintState === 'no-hint' || hintState === 'no-mp' || picked !== null ? true : undefined}
              aria-describedby={hintReason ? 'hint-why' : undefined}
              aria-keyshortcuts="H"
              data-sfx="none"
              onClick={() => hintState === 'ready' && picked === null && useHint()}
            >
              <HintButtonFace state={hintState} cost={HINT_COST} />
              <kbd className="kbd">H</kbd>
            </button>
            {hintReason && (
              <span id="hint-why" className="jr-hint-reason">
                {hintReason}
              </span>
            )}
          </div>
          {hintBought && q.hint && <HintCard><InlineText text={q.hint} /></HintCard>}

          {phase === 'resolved' && picked !== null && (
            <div ref={focusRef} className={`resolve ${picked === q.answer ? 'is-right' : 'is-wrong'}`}>
              {picked === q.answer ? (
                <p>
                  <strong>Correct!</strong> The {mons.minion.name} takes {dmgPerHit} damage.
                </p>
              ) : (
                <p>
                  <strong>
                    The {mons.minion.name} strikes! −{lastMiss} HP.
                  </strong>{' '}
                  The answer was: {q.options[q.answer]}
                </p>
              )}
              {q.explain && <p className="explain">💡 <InlineText text={q.explain} /></p>}
              <button className="btn btn-primary" onClick={nextQuestion} data-sfx="confirm">
                {last ? 'Finish battle ▶' : 'Next question ▶'}
              </button>
            </div>
          )}
        </section>
      )}

      {/* the knockout plays on the stage first, then the defeat modal opens */}
      {phase === 'defeated' && !defeatOpen && (
        <p className="result fail" role="status">
          <strong>You were knocked out…</strong>
        </p>
      )}
      {phase === 'defeated' && defeatOpen && (
        <DefeatModal monsterName={mons.minion.name} correct={correct} answered={idx + 1} total={drawn.length} innIslandId={innOffer?.islandId} onWake={closeDefeat} />
      )}

      {phase === 'failed' && (
        <div ref={focusRef} className="result fail" role="status">
          <strong>
            The {mons.minion.name} still stands. {correct}/{total} correct ({finishScore}%), you needed {need}
          </strong>
          <p>Review the lesson, then begin again with a fresh set of questions.</p>
          <div className="btn-row">
            <button className="btn btn-primary" onClick={backToLesson} data-sfx="back">
              Return to the lesson
            </button>
          </div>
        </div>
      )}

      {phase === 'won' && (
        <div className="result pass" role="status">
          <strong>
            ⚔️ Trial won! {correct}/{total} correct ({finishScore}%)
          </strong>
          <div className="btn-row">
            <Link className="btn btn-primary" to={next.href} data-sfx="confirm">
              ▶ {next.label}
            </Link>
            <button className="btn" onClick={backToLesson} data-sfx="back">
              Back to the lesson
            </button>
          </div>
          {practiceWin && innOffer && <InnPrompt />}
        </div>
      )}
    </div>
  );
}
