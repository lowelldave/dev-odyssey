import { Fragment, useState, type ReactNode } from 'react';
import type { Tutorial } from '../types';
import Paper from './Paper';

/** Renders `inline code` inside a line of text. */
function inline(text: string): ReactNode[] {
  return text.split(/(`[^`]+`)/g).map((part, i) =>
    part.startsWith('`') && part.endsWith('`') ? <code key={i}>{part.slice(1, -1)}</code> : <Fragment key={i}>{part}</Fragment>,
  );
}

/** Paragraphs separated by blank lines; lines starting with "- " become a list. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n\s*\n/).map((block, i) => {
        const lines = block.split('\n');
        if (lines.every((l) => l.trim().startsWith('- '))) {
          return (
            <ul key={i} className="lessons">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.trim().slice(2))}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{inline(block.replace(/\n/g, ' '))}</p>;
      })}
    </>
  );
}

function CodeBlock({ lang, src, caption }: { lang: string; src: string; caption?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(src);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard can be blocked; the code is still selectable */
    }
  };
  return (
    <figure className="code-block">
      <figcaption>
        <span className="code-lang">{lang}</span>
        {caption && <span className="code-caption">{caption}</span>}
        <button className="code-copy" onClick={copy} data-sfx="confirm">
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </figcaption>
      <pre>
        <code>{src.trim()}</code>
      </pre>
    </figure>
  );
}

export default function TutorialView({ tutorial }: { tutorial: Tutorial }) {
  return (
    <div className="tutorial">
      <section className="card paper goal-card">
        <Paper tape="both" />
        <h2>🎯 Your goal</h2>
        <Rich text={tutorial.goal} />
        <ol className="step-index">
          {tutorial.steps.map((s, i) => (
            <li key={i}>
              <a href={`#step-${i + 1}`} data-sfx="click" onClick={(e) => {
                e.preventDefault();
                document.getElementById(`step-${i + 1}`)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
              }}>
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </section>

      {tutorial.steps.map((step, i) => (
        <section key={i} id={`step-${i + 1}`} className="card paper step-card">
          <Paper tape={i % 2 ? 'right' : 'left'} />
          <p className="eyebrow">
            Step {i + 1} of {tutorial.steps.length}
          </p>
          <h2>{step.title}</h2>
          <Rich text={step.body} />
          {step.code && <CodeBlock {...step.code} />}
          {step.tryIt && (
            <div className="try-it">
              <strong>🗡️ Try it</strong>
              <Rich text={step.tryIt} />
            </div>
          )}
        </section>
      ))}

      {(tutorial.mistakes?.length || tutorial.recap?.length) && (
        <section className="card paper recap-card">
          <Paper tape="right" />
          {tutorial.mistakes?.length ? (
            <div className="mistakes">
              <h3>⚠️ Common mistakes</h3>
              <ul className="lessons">
                {tutorial.mistakes.map((m, i) => (
                  <li key={i}>{inline(m)}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {tutorial.recap?.length ? (
            <div>
              <h3>📌 Recap</h3>
              <ul className="lessons">
                {tutorial.recap.map((m, i) => (
                  <li key={i}>{inline(m)}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}
