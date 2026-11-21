import { useMemo, useState } from 'react';
import { questKey } from '../lib/game';
import { useStore } from '../store';
import type { Island, Quest, QuizCheckpoint } from '../types';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizRunner({ island, quest, checkpoint }: { island: Island; quest: Quest; checkpoint: QuizCheckpoint }) {
  const [round, setRound] = useState(0);
  const questions = useMemo(
    () =>
      shuffle(checkpoint.questions).map((q) => {
        const order = shuffle(q.options.map((_, i) => i));
        return { ...q, options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer) };
      }),
    // reshuffle on every new round
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [checkpoint, round],
  );
  const [answers, setAnswers] = useState<(number | null)[]>(() => checkpoint.questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const recordQuiz = useStore((s) => s.recordQuiz);
  const completeQuest = useStore((s) => s.completeQuest);
  const alreadyDone = useStore((s) => !!s.completed[questKey(island.id, quest.id)]);

  const correct = questions.filter((q, i) => answers[i] === q.answer).length;
  const score = Math.round((correct / questions.length) * 100);
  const passed = score >= checkpoint.passPercent;

  const submit = () => {
    setSubmitted(true);
    recordQuiz({ key: questKey(island.id, quest.id), score, passed });
    if (passed) completeQuest(island.id, quest.id, { score });
  };

  const retry = () => {
    setAnswers(checkpoint.questions.map(() => null));
    setSubmitted(false);
    setRound((r) => r + 1);
  };

  return (
    <div className="quiz">
      <p className="muted small">
        Score {checkpoint.passPercent}% or higher to clear this quest. Questions and answers are shuffled each attempt.
        {alreadyDone && ' You already cleared this one, so retakes are just for practice.'}
      </p>
      {questions.map((q, qi) => (
        <fieldset key={`${round}-${qi}`} className="quiz-q">
          <legend>
            <span className="qnum">{qi + 1}</span> {q.question}
          </legend>
          <div className="options">
            {q.options.map((opt, oi) => {
              const chosen = answers[qi] === oi;
              const cls = submitted ? (oi === q.answer ? 'correct' : chosen ? 'wrong' : '') : chosen ? 'chosen' : '';
              return (
                <label key={oi} className={`option ${cls}`}>
                  <input
                    type="radio"
                    name={`q-${round}-${qi}`}
                    checked={chosen}
                    disabled={submitted}
                    onChange={() => setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)))}
                  />
                  <span>{opt}</span>
                </label>
              );
            })}
          </div>
          {submitted && q.explain && <p className="explain">💡 {q.explain}</p>}
        </fieldset>
      ))}

      {!submitted ? (
        <button className="btn btn-primary" disabled={answers.some((a) => a === null)} onClick={submit}>
          Submit answers
        </button>
      ) : (
        <div className={`result ${passed ? 'pass' : 'fail'}`}>
          <strong>
            {passed ? '🎉 Passed!' : '⚓ Not quite.'} {correct}/{questions.length} correct ({score}%)
          </strong>
          {!passed && <p>Review the briefing and study scrolls, then try again.</p>}
          <button className="btn" onClick={retry}>
            {passed ? 'Practice again' : 'Retry quiz'}
          </button>
        </div>
      )}
    </div>
  );
}
