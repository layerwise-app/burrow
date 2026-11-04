import { useState } from 'react';
import { Section } from '~/components/home/Section';
import { Box } from '~/components/tui/Box';
import { Text } from '~/components/tui/Text';
import { home } from '~/content/home';
import { clsx as cn } from 'clsx';

const content = home.configuration;

type Token = { text: string; cls?: string };

/** A small TOML highlighter: comments, tables, keys, strings, values. */
function highlight(code: string): Token[] {
  if (code.trim() === '') return [{ text: ' ' }];
  const tokens: Token[] = [];
  let rest = code;
  const header = /^\[[^\]]+\]/.exec(rest);
  if (header) {
    tokens.push({ text: header[0], cls: 'tk-table' });
    rest = rest.slice(header[0].length);
  }
  const key = /^([A-Za-z_][\w.-]*)(\s*)(=)/.exec(rest);
  if (key) {
    tokens.push({ text: key[1], cls: 'tk-key' }, { text: key[2] }, { text: key[3], cls: 'tk-punct' });
    rest = rest.slice(key[0].length);
  }
  const pattern = /("(?:[^"\\]|\\.)*")|(#.*$)|(\btrue\b|\bfalse\b|\b\d+(?:\.\d+)?\b)|([[\]{},=])|([A-Za-z_][\w-]*(?=\s*=))/g;
  let last = 0;
  for (const match of rest.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > last) tokens.push({ text: rest.slice(last, index) });
    if (match[1]) {
      // Strings, with ${...} interpolation shown brighter.
      for (const part of match[1].split(/(\$\{[^}]+\})/g)) {
        if (part) tokens.push({ text: part, cls: part.startsWith('${') ? 'tk-interp' : 'tk-string' });
      }
    } else if (match[2]) tokens.push({ text: match[2], cls: 'tk-comment' });
    else if (match[3]) tokens.push({ text: match[3], cls: 'tk-value' });
    else if (match[4]) tokens.push({ text: match[4], cls: 'tk-punct' });
    else if (match[5]) tokens.push({ text: match[5], cls: 'tk-key' });
    last = index + match[0].length;
  }
  if (last < rest.length) tokens.push({ text: rest.slice(last) });
  return tokens;
}

const LINES = content.lines.map((line, index) => ({
  index,
  code: line.code,
  note: 'note' in line ? line.note : undefined,
  tokens: highlight(line.code)
}));
const FIRST_NOTE = LINES.find((line) => line.note)?.index ?? 0;
const GUTTER = String(LINES.length).length;

export function ConfigFile() {
  const [active, setActive] = useState(FIRST_NOTE);
  const activeLine = LINES[active];

  return (
    <Section id={content.id} label={content.label} title={content.title} lede={content.lede}>
      <div className='cfg' style={{ ['--active' as string]: active }}>
        <Box title={content.filename} aside={<span className='t-dim'>toml</span>} className='cfg-file' bodyClassName='cfg-body'>
          <div className='cfg-code' role='list' aria-label={`${content.filename}, ${LINES.length} lines`}>
            {LINES.map((line) => {
              const noteId = `cfg-note-${line.index}`;
              const isActive = line.index === active && !!line.note;
              return (
                <div key={line.index} role='listitem' className='cfg-item'>
                  <div
                    className={cn('cfg-line', line.note && 'has-note', isActive && 'is-active')}
                    tabIndex={line.note ? 0 : undefined}
                    aria-describedby={line.note ? noteId : undefined}
                    onMouseEnter={line.note ? () => setActive(line.index) : undefined}
                    onFocus={line.note ? () => setActive(line.index) : undefined}
                  >
                    <span className='cfg-gutter' aria-hidden='true'>
                      <span className='cfg-marker'>{isActive ? '▌' : ' '}</span>
                      {String(line.index + 1).padStart(GUTTER)}
                    </span>
                    <code className='cfg-src'>
                      {line.tokens.map((token, i) =>
                        token.cls ? (
                          <span key={i} className={token.cls}>
                            {token.text}
                          </span>
                        ) : (
                          token.text
                        )
                      )}
                    </code>
                  </div>
                  {line.note ? (
                    <p id={noteId} className='cfg-inline-note'>
                      <span aria-hidden='true' className='t-dim'>
                        └─{' '}
                      </span>
                      <Text>{line.note}</Text>
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Box>
        <div className='cfg-notes' aria-hidden='true'>
          {activeLine?.note ? (
            <div className='cfg-note'>
              <div className='cfg-note-head'>
                <span className='tone-hl'>◀──</span>
                <span className='t-dim'> line {active + 1} </span>
                <span className='bx-h' />
              </div>
              <p className='cfg-note-text'>
                <Text>{activeLine.note}</Text>
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
