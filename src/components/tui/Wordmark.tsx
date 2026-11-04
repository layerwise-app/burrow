import { Markup } from '~/components/tui/Text';
import { clsx as cn } from 'clsx';
import { siteConfig } from '~/site.config';

/** The ASCII-art wordmark from `siteConfig.wordmark`, drawn with box-drawing lines. */
export function Wordmark({
  className,
  label = siteConfig.product
}: {
  className?: string;
  label?: string;
}) {
  return (
    <pre
      role='img'
      aria-label={label}
      className={cn('wordmark', className)}
    >
      <span aria-hidden='true'>
        <Markup text={siteConfig.wordmark.join('\n')} />
      </span>
    </pre>
  );
}
