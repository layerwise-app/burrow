import { useEffect, useRef, useState } from 'react';
import type * as React from 'react';
import { Section } from '~/components/home/Section';
import { Text } from '~/components/tui/Text';
import { home } from '~/content/home';
import { useInView, usePageVisible } from '~/lib/motion';
import { clsx as cn } from 'clsx';

const content = home.speed;
/** Every bar fills at the same speed, so a short bar finishes first. */
const MS_PER_AXIS = 2600;

export function formatSeconds(value: number) {
  if (value < 60) return `${value.toFixed(1)}s`;
  const m = Math.floor(value / 60);
  const s = Math.round(value % 60);
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

function tickLabel(value: number) {
  return value === 0 ? '0' : value % 60 === 0 ? `${value / 60}m` : `${value}s`;
}

function Bar({
  label,
  value,
  delay,
  kind
}: {
  label: string;
  value: number;
  delay: number;
  kind: 'burrow' | 'ci';
}) {
  const pct = Math.min(100, (value / content.axisMax) * 100);
  const duration = (value / content.axisMax) * MS_PER_AXIS;
  const style = {
    ['--pct' as string]: `${pct}%`,
    ['--d' as string]: `${delay}ms`,
    ['--dur' as string]: `${Math.max(120, duration)}ms`
  } as React.CSSProperties;
  return (
    <div className={cn('bench-row', `is-${kind}`)} style={style}>
      <span className='bench-label'>{label}</span>
      <span className='bench-track' aria-hidden='true'>
        {/* The dotted track and the █ bar are drawn in CSS (site.css). */}
        <span className='bench-dots' />
        <span className='bench-fill' />
      </span>
      <span className='bench-value'>{formatSeconds(value)}</span>
    </div>
  );
}

export function Benchmark() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, threshold: 0.3 });
  const inView = useInView(ref);
  const visible = usePageVisible();
  const [run, setRun] = useState<'idle' | 'go'>('idle');
  useEffect(() => {
    if (seen) setRun('go');
  }, [seen]);

  return (
    <Section
      id={content.id}
      label={content.label}
      title={content.title}
      lede={content.lede}
      aside={content.summary}
    >
      <figure
        ref={ref}
        className={cn('bench', !(inView && visible) && 'is-paused')}
        data-run={run}
      >
        <figcaption className='bench-caption t-small t-dim'>{content.caption}</figcaption>
        {content.scenarios.map((scenario, i) => (
          <div key={i} className='bench-group'>
            <div className='bench-head'>
              <span className='bench-name'>{scenario.name}</span>
              <span className='bench-detail t-dim'>
                <span className='bench-sep' aria-hidden='true'>
                  ·{' '}
                </span>
                {scenario.detail}
              </span>
              <span className='bench-ratio tone-ok'>
                {(scenario.ci / scenario.burrow).toFixed(1)}× faster
              </span>
            </div>
            <Bar label={content.burrowLabel} value={scenario.burrow} delay={i * 220} kind='burrow' />
            <Bar label={content.ciLabel} value={scenario.ci} delay={i * 220 + 120} kind='ci' />
          </div>
        ))}
        <div className='bench-axis' aria-hidden='true'>
          <span />
          <span className='bench-axis-track'>
            <span className='bench-axis-line'>
              {'├' + '─'.repeat(200)}
            </span>
            {content.ticks.map((tick, i) => (
              <span
                key={tick}
                className={cn(
                  'bench-tick',
                  i % 2 === 1 && 'is-minor',
                  i === 0 && 'is-first',
                  i === content.ticks.length - 1 && 'is-last'
                )}
                style={{ left: `${(tick / content.axisMax) * 100}%` }}
              >
                <span className='bench-tick-mark'>
                  {i === 0 ? '├' : i === content.ticks.length - 1 ? '┤' : '┼'}
                </span>
                <span className='bench-tick-label'>{tickLabel(tick)}</span>
              </span>
            ))}
          </span>
          <span />
        </div>
        <p className='bench-foot t-note t-dim'>
          <Text>{content.footnote}</Text>
        </p>
      </figure>
    </Section>
  );
}
