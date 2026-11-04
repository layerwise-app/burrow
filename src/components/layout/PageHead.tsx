import type * as React from 'react';
import { Rule } from '~/components/tui/Box';
import { Text } from '~/components/tui/Text';

/** The top of an inner page: the command that "printed" it, then the title. */
export function PageHead({
  command,
  title,
  lede,
  label
}: {
  command: string;
  title: React.ReactNode;
  lede?: string;
  label?: string;
}) {
  return (
    <header className='page-head'>
      <p className='page-cmd' aria-hidden='true'>
        <span className='tone-hl'>$</span> {command}
      </p>
      {label ? <Rule label={label} /> : null}
      <h1 className='t-h1 page-title'>{title}</h1>
      {lede ? (
        <p className='t-lede'>
          <Text>{lede}</Text>
        </p>
      ) : null}
    </header>
  );
}
