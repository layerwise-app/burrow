import type * as React from 'react';
import { Rule } from '~/components/tui/Box';
import { Text } from '~/components/tui/Text';
import { clsx as cn } from 'clsx';
import { siteConfig } from '~/site.config';

/** A home section: a numbered divider, the headline, and a lede. */
export function Section({
  id,
  label,
  title,
  lede,
  children,
  className,
  aside
}: {
  id: string;
  label: string;
  title: string;
  lede?: string;
  children: React.ReactNode;
  className?: string;
  aside?: React.ReactNode;
}) {
  const index = siteConfig.nav.findIndex((item) => item.id === id) + 1;
  return (
    <section
      id={id}
      data-section={id}
      className={cn('section wrap', className)}
      aria-labelledby={`${id}-title`}
    >
      <Rule label={label} index={index || undefined} right={aside} />
      <header className='section-head'>
        <h2 id={`${id}-title`} className='t-h2' tabIndex={-1}>
          {title}
        </h2>
        {lede ? (
          <p className='t-lede'>
            <Text>{lede}</Text>
          </p>
        ) : null}
      </header>
      {children}
    </section>
  );
}
