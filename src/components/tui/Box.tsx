import type * as React from 'react';
import { clsx as cn } from 'clsx';

type BoxProps = {
  /** Text in the top border: ┌─ title ─────┐ */
  title?: React.ReactNode;
  /** Text at the right end of the top border. */
  aside?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Border color, as a CSS color. Defaults to bright black. */
  color?: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'color'>;

/** A frame drawn with box-drawing characters that fits any size. */
export function Box({
  title,
  aside,
  className,
  bodyClassName,
  color,
  children,
  style,
  ...rest
}: BoxProps) {
  return (
    <div
      className={cn('box', className)}
      style={color ? { ...style, ['--bx-color' as string]: color } : style}
      {...rest}
    >
      <span className='bx-c' aria-hidden='true'>
        ┌
      </span>
      <div className='box-top'>
        {title ? (
          <>
            <span className='bx-c' aria-hidden='true'>
              ─
            </span>
            <span className='box-title'>{title}</span>
          </>
        ) : null}
        <span className='bx-h' aria-hidden='true' />
        {aside ? (
          <span className='box-aside-wide'>
            <span className='box-title'>{aside}</span>
            <span className='bx-c' aria-hidden='true'>
              ─
            </span>
          </span>
        ) : null}
      </div>
      <span className='bx-c' aria-hidden='true'>
        ┐
      </span>
      <span className='bx-v' aria-hidden='true' />
      <div className={cn('box-body', bodyClassName)}>{children}</div>
      <span className='bx-v' aria-hidden='true' />
      <span className='bx-c' aria-hidden='true'>
        └
      </span>
      <span className='bx-h' aria-hidden='true' />
      <span className='bx-c' aria-hidden='true'>
        ┘
      </span>
    </div>
  );
}

/** A divider: ── label ────────────────── */
export function Rule({
  label,
  index,
  className,
  right
}: {
  label?: React.ReactNode;
  /** Shown before the label, like the status bar's key for this section. */
  index?: number;
  className?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className={cn('rule', className)}>
      <span className='bx-h' aria-hidden='true' style={{ flex: 'none', width: '2ch' }} />
      {label ? (
        <span className='rule-label'>
          {index ? <span className='rule-key'>{index} </span> : null}
          {label}
        </span>
      ) : null}
      <span className='bx-h' aria-hidden='true' />
      {right ? <span className='rule-label t-dim'>{right}</span> : null}
      {right ? (
        <span className='bx-h' aria-hidden='true' style={{ flex: 'none', width: '2ch' }} />
      ) : null}
    </div>
  );
}
