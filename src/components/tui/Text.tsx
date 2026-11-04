import { Fragment } from 'react';
import { parseMarkup } from '~/lib/terminal/markup';

/** Renders content strings: text in `backticks` becomes inline code. */
export function Text({ children }: { children: string }) {
  const parts = children.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('`') && part.endsWith('`') && part.length > 1 ? (
          <code key={i} className='t-code'>
            {part.slice(1, -1)}
          </code>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  );
}

/** Renders terminal markup like `{ok:✓} done` with ANSI tones. */
export function Markup({ text }: { text: string }) {
  return (
    <>
      {parseMarkup(text).map((segment, i) =>
        segment.tone ? (
          <span key={i} className={`tone-${segment.tone}`}>
            {segment.text}
          </span>
        ) : (
          <Fragment key={i}>{segment.text}</Fragment>
        )
      )}
    </>
  );
}

/** Fills `{name}` placeholders in content strings. */
export function fillText(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in values ? values[key] : whole
  );
}
