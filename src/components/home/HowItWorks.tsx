import { useEffect, useRef, useState } from 'react';
import type * as React from 'react';
import { Section } from '~/components/home/Section';
import { home } from '~/content/home';
import { useInView, usePageVisible } from '~/lib/motion';
import { clsx as cn } from 'clsx';

const content = home.howItWorks;
/** Milliseconds between stages lighting up. */
const STEP = 650;

type Seg = { text: string; k?: string; name?: boolean };

/** Draws the horizontal pipeline as rows of character segments. */
function horizontalRows(): Seg[][] {
  const stages = content.stages;
  const inner = Math.max(...stages.map((s) => s.name.length)) + 2;
  const width = inner + 2;
  const gap = 4;
  const rows: Seg[][] = [[], [], [], [], []];
  const lastIndex = stages.length - 1;
  const loopFrom = 4; // column of ▲ inside the first box
  const loopTo = Math.floor(width / 2); // column of ┬ inside the last box

  stages.forEach((stage, i) => {
    const k = `s${i}`;
    const isLast = i === lastIndex;
    rows[0].push({ text: `┌${'─'.repeat(inner)}┐`, k });
    rows[1].push(
      { text: '│ ', k },
      { text: stage.name.padEnd(inner - 1), k, name: true },
      { text: isLast ? '│' : '├', k }
    );
    rows[2].push({ text: `│ ${stage.time.padEnd(inner - 1)}│`, k });
    if (i === 0) {
      rows[3].push(
        { text: `└${'─'.repeat(loopFrom - 1)}`, k },
        { text: '▲', k: 'loop' },
        { text: `${'─'.repeat(inner - loopFrom)}┘`, k }
      );
    } else if (isLast) {
      rows[3].push(
        { text: `└${'─'.repeat(loopTo - 1)}`, k },
        { text: '┬', k: 'loop' },
        { text: `${'─'.repeat(inner - loopTo)}┘`, k }
      );
    } else {
      rows[3].push({ text: `└${'─'.repeat(inner)}┘`, k });
    }
    if (!isLast) {
      const c = `c${i}`;
      rows[0].push({ text: ' '.repeat(gap) });
      rows[1].push({ text: '───', k: c }, { text: '▶', k: c });
      rows[2].push({ text: ' '.repeat(gap) });
      rows[3].push({ text: ' '.repeat(gap) });
    }
  });

  // The loop back from cleanup to the next push.
  const total = stages.length * width + lastIndex * gap;
  const start = loopFrom;
  const end = lastIndex * (width + gap) + loopTo;
  const label = ` ${content.loopLabel} `;
  const span = end - start - 1;
  const left = Math.floor((span - label.length) / 2);
  rows[4].push(
    { text: ' '.repeat(start) },
    {
      text: `└${'─'.repeat(left)}${label}${'─'.repeat(span - left - label.length)}┘`,
      k: 'loop'
    },
    { text: ' '.repeat(Math.max(0, total - end - 1)) }
  );
  return rows;
}

const ROWS = horizontalRows();
const COLS = ROWS[0].reduce((n, seg) => n + seg.text.length, 0);
const BOX = Math.max(...content.stages.map((s) => s.name.length)) + 4;
const GAP = 4;

function delayFor(k: string) {
  if (k === 'loop') return content.stages.length * STEP;
  const index = Number(k.slice(1));
  return k.startsWith('s') ? index * STEP : index * STEP + STEP / 2;
}

function seg(k: string | undefined): React.CSSProperties | undefined {
  return k ? ({ ['--d' as string]: `${delayFor(k)}ms` } as React.CSSProperties) : undefined;
}

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, threshold: 0.35 });
  const inView = useInView(ref);
  const visible = usePageVisible();
  const [run, setRun] = useState<'idle' | 'go'>('idle');
  useEffect(() => {
    if (seen) setRun('go');
  }, [seen]);

  return (
    <Section id={content.id} label={content.label} title={content.title} lede={content.lede}>
      <div
        ref={ref}
        className={cn('flow', !(inView && visible) && 'is-paused')}
        data-run={run}
        style={{ ['--step' as string]: `${STEP}ms`, ['--cols' as string]: COLS, ['--box' as string]: BOX, ['--gap' as string]: GAP }}
      >
        <pre className='flow-diagram' aria-hidden='true'>
          {ROWS.map((row, r) => (
            <span key={r} className='flow-row'>
              {row.map((s, i) =>
                s.k ? (
                  <span key={i} data-k={s.k} className={s.name ? 'flow-name' : undefined} style={seg(s.k)}>
                    {s.text}
                  </span>
                ) : (
                  <span key={i}>{s.text}</span>
                )
              )}
              {'\n'}
            </span>
          ))}
        </pre>

        <ol className='flow-steps'>
          {content.stages.map((stage, i) => {
            const inner = stage.name.length + 2;
            const isLast = i === content.stages.length - 1;
            return (
              <li key={stage.name} className='flow-step' data-k={`s${i}`} style={seg(`s${i}`)}>
                <span className='flow-mini' aria-hidden='true'>
                  {`┌${'─'.repeat(3)}${i === 0 ? '─' : '┴'}${'─'.repeat(inner - 4)}┐\n`}
                  {'│ '}
                  <span className='flow-name'>{stage.name}</span>
                  {` │  `}
                  <span className='t-dim'>{stage.time}</span>
                  {`\n└${'─'.repeat(3)}${isLast ? '─' : '┬'}${'─'.repeat(inner - 4)}┘`}
                </span>
                <span className='flow-step-body'>
                  <span className={cn('flow-rail', isLast && 'is-end')} aria-hidden='true'>
                    <span className='bx-v' />
                  </span>
                  <span className='flow-step-text'>
                    <span className='flow-step-head'>
                      <strong className='flow-name'>{stage.name}</strong>
                      <span className='t-dim'> · {stage.time}</span>
                    </span>
                    <span className='flow-note'>{stage.note}</span>
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}
