import { Fragment } from 'react';
import type * as React from 'react';
import { clsx as cn } from 'clsx';

type Column = {
  header: React.ReactNode;
  /** A CSS grid track, like `14ch` or `minmax(0, 1fr)`. */
  width: string;
  className?: string;
};

type BoxTableProps = {
  label: string;
  columns: Column[];
  rows: React.ReactNode[][];
  /** Draw ├──┼──┤ between body rows. */
  rowRules?: boolean;
  className?: string;
  /** Optional class per body row. */
  rowClassName?: (index: number) => string | undefined;
};

function Line({
  left,
  mid,
  right,
  count
}: {
  left: string;
  mid: string;
  right: string;
  count: number;
}) {
  return (
    <>
      <span className='bx-c' aria-hidden='true'>
        {left}
      </span>
      {Array.from({ length: count }, (_, i) => (
        <Fragment key={i}>
          <span className='bx-h' aria-hidden='true' />
          <span className='bx-c' aria-hidden='true'>
            {i === count - 1 ? right : mid}
          </span>
        </Fragment>
      ))}
    </>
  );
}

/**
 * A table whose borders are box-drawing characters. Cells are real grid
 * cells with table roles, so text wraps and screen readers read a table.
 */
export function BoxTable({
  label,
  columns,
  rows,
  rowRules = true,
  className,
  rowClassName
}: BoxTableProps) {
  const template = ['1ch', ...columns.flatMap((c) => [c.width, '1ch'])].join(' ');
  const n = columns.length;
  return (
    <div
      role='table'
      aria-label={label}
      className={cn('bt', className)}
      style={{ gridTemplateColumns: template }}
    >
      <Line left='┌' mid='┬' right='┐' count={n} />
      <div role='row' className='bt-row'>
        <span className='bx-v' aria-hidden='true' />
        {columns.map((column, i) => (
          <Fragment key={i}>
            <div role='columnheader' className={cn('bt-cell bt-head', column.className)}>
              {column.header}
            </div>
            <span className='bx-v' aria-hidden='true' />
          </Fragment>
        ))}
      </div>
      <Line left='├' mid='┼' right='┤' count={n} />
      {rows.map((cells, r) => (
        <Fragment key={r}>
          {r > 0 && rowRules ? <Line left='├' mid='┼' right='┤' count={n} /> : null}
          <div role='row' className={cn('bt-row', rowClassName?.(r))}>
            <span className='bx-v' aria-hidden='true' />
            {cells.map((cell, i) => (
              <Fragment key={i}>
                <div role='cell' className={cn('bt-cell', columns[i]?.className)}>
                  {cell}
                </div>
                <span className='bx-v' aria-hidden='true' />
              </Fragment>
            ))}
          </div>
        </Fragment>
      ))}
      <Line left='└' mid='┴' right='┘' count={n} />
    </div>
  );
}
