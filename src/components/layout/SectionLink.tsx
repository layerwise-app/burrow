import { Link } from '@tanstack/react-router';
import type * as React from 'react';
import { jumpToSection } from '~/components/layout/navigation';

/** A link to a home section that works from any page. */
export function SectionLink({
  id,
  isHome,
  className,
  children,
  onNavigate,
  ...rest
}: {
  id: string;
  isHome: boolean;
  className?: string;
  children: React.ReactNode;
  onNavigate?: () => void;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  if (isHome) {
    return (
      <a
        href={`#${id}`}
        className={className}
        onClick={(event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey) return;
          if (jumpToSection(id)) event.preventDefault();
          onNavigate?.();
        }}
        {...rest}
      >
        {children}
      </a>
    );
  }
  return (
    <Link to='/' hash={id} className={className} onClick={onNavigate} {...rest}>
      {children}
    </Link>
  );
}
