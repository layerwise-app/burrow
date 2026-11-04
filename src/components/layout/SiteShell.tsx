import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import type * as React from 'react';
import { Footer } from '~/components/layout/Footer';
import { SectionLink } from '~/components/layout/SectionLink';
import { ShortcutsDialog } from '~/components/layout/ShortcutsDialog';
import { StatusBar } from '~/components/layout/StatusBar';
import {
  focusTerminal,
  isEditable,
  jumpToSection,
  navItems
} from '~/components/layout/navigation';
import { clsx as cn } from 'clsx';
import { siteConfig } from '~/site.config';

function Header({ isHome }: { isHome: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const command = siteConfig.command.toUpperCase();
  return (
    <header className='hdr'>
      <div className='wrap hdr-in'>
        <Link to='/' className='hdr-brand' aria-label={`${siteConfig.product} home`}>
          {command}(1)
        </Link>
        <span className='hdr-center t-dim' aria-hidden='true'>
          {siteConfig.company} {siteConfig.footer.manual}
        </span>
        <nav className='hdr-nav' aria-label='Main'>
          <Link
            to='/changelog'
            className='hdr-link'
            activeProps={{ 'aria-current': 'page' }}
          >
            changelog
          </Link>
          <SectionLink id='early-access' isHome={isHome} className='btn btn-sm hdr-cta'>
            {siteConfig.cta.short}
          </SectionLink>
          <button
            ref={buttonRef}
            type='button'
            className='btn-ghost hdr-menu'
            aria-expanded={open}
            aria-controls='site-menu'
            onClick={() => setOpen((v) => !v)}
          >
            menu
          </button>
        </nav>
      </div>
      <div id='site-menu' className={cn('menu', open && 'is-open')} hidden={!open}>
        <div className='wrap'>
          <ol className='menu-list'>
            {navItems.map((item) => (
              <li key={item.id}>
                <SectionLink
                  id={item.id}
                  isHome={isHome}
                  className='menu-link'
                  onNavigate={() => setOpen(false)}
                >
                  <span className='kbd'>{item.key}</span> {item.label}
                </SectionLink>
              </li>
            ))}
          </ol>
          <ul className='menu-list menu-pages'>
            {siteConfig.pages.map((page) => (
              <li key={page.href}>
                <Link to={page.href} className='menu-link'>
                  {page.label}
                </Link>
              </li>
            ))}
          </ul>
          <SectionLink
            id='early-access'
            isHome={isHome}
            className='btn menu-cta'
            onNavigate={() => setOpen(false)}
          >
            {siteConfig.cta.primary}
          </SectionLink>
        </div>
      </div>
    </header>
  );
}

/** Header, footer, status bar, and keyboard shortcuts around every page. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === '/';
  const navigate = useNavigate();
  const [helpOpen, setHelpOpen] = useState(false);

  const goToSection = useCallback(
    (id: string) => {
      if (isHome) jumpToSection(id);
      else void navigate({ to: '/', hash: id });
    },
    [isHome, navigate]
  );

  const goToTerminal = useCallback(() => {
    if (!focusTerminal()) void navigate({ to: '/', hash: 'terminal' });
  }, [navigate]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isEditable(event.target)) return;
      const item = navItems.find((n) => n.key === event.key);
      if (item) {
        event.preventDefault();
        goToSection(item.id);
      } else if (event.key === '/') {
        event.preventDefault();
        goToTerminal();
      } else if (event.key === '?') {
        event.preventDefault();
        setHelpOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goToSection, goToTerminal]);

  return (
    <>
      <a href='#main' className='skip-link'>
        skip to content
      </a>
      <Header isHome={isHome} />
      <main id='main' tabIndex={-1}>
        {children}
      </main>
      <Footer isHome={isHome} />
      <StatusBar
        isHome={isHome}
        onHelp={() => setHelpOpen(true)}
        onTerminal={goToTerminal}
      />
      <ShortcutsDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
