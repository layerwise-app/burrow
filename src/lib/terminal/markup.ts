import type { Markup, Tone } from './types';

export type Segment = { text: string; tone?: Tone };

const TONES = new Set<Tone>(['dim', 'b', 'ok', 'warn', 'link', 'hl', 'bar']);
const PATTERN = /\{(dim|b|ok|warn|link|hl|bar):([^{}]*)\}/g;

/** Splits `{ok:✓} done` into colored segments. */
export function parseMarkup(markup: Markup): Segment[] {
  const segments: Segment[] = [];
  let last = 0;
  for (const match of markup.matchAll(PATTERN)) {
    const index = match.index ?? 0;
    if (index > last) segments.push({ text: markup.slice(last, index) });
    const tone = match[1] as Tone;
    segments.push({ text: match[2], tone: TONES.has(tone) ? tone : undefined });
    last = index + match[0].length;
  }
  if (last < markup.length) segments.push({ text: markup.slice(last) });
  return segments;
}

/** The text without markup, for measuring and screen readers. */
export function plainText(markup: Markup): string {
  return markup.replace(PATTERN, '$2');
}

/** Pads markup to a visible width, ignoring the markup itself. */
export function padEnd(markup: Markup, width: number): Markup {
  const visible = plainText(markup).length;
  return visible >= width ? markup + ' ' : markup + ' '.repeat(width - visible);
}

export function tone(t: Tone, text: string): Markup {
  return `{${t}:${text}}`;
}

/** Fills `{name}` placeholders. */
export function fill(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in values ? values[key] : whole
  );
}
