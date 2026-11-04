import { useRouterState } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { SectionLink } from '~/components/layout/SectionLink';
import { navItems } from '~/components/layout/navigation';
import { latestRelease } from '~/lib/changelog';
import { clsx as cn } from 'clsx';
import { siteConfig } from '~/site.config';

function useScrollState(isHome: boolean) {
  const [current, setCurrent] = useState<string>('top');
  const [position, setPosition] = useState('Top');

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      // Like vim's ruler: Top, Bot, or how far down the page you are.
      setPosition(max <= 0 ? 'All' : y <= 2 ? 'Top' : y >= max - 2 ? 'Bot' : `${Math.round((y / max) * 100)}%`);
      if (!isHome) return;
      const line = window.innerHeight * 0.38;
      let id = 'top';
      for (const el of document.querySelectorAll<HTMLElement>('[data-section]')) {
        if (el.getBoundingClientRect().top <= line) id = el.dataset.section ?? id;
      }
      setCurrent(id);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [isHome]);

  return { current, position };
}

/** The TUI status bar along the bottom on desktop: sections 1–6 and keys. */
export function StatusBar({
  isHome,
  onHelp,
  onTerminal
}: {
  isHome: boolean;
  onHelp: () => void;
  onTerminal: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { current, position } = useScrollState(isHome);
  const where = isHome ? '' : pathname.replace(/^\//, '').replace(/\//g, ' › ');
  const atForm = isHome && current === 'early-access';

  return (
    <nav className='sbar' aria-label='Sections'>
      <span className='sbar-mode'>
        {siteConfig.command} {latestRelease.version}
      </span>
      <ol className='sbar-items'>
        {navItems.map((item) => {
          const isCurrent = isHome && current === item.id;
          return (
            <li key={item.id}>
              <SectionLink
                id={item.id}
                isHome={isHome}
                className={cn('sbar-item', isCurrent && 'is-current')}
                aria-current={isCurrent ? 'location' : undefined}
              >
                <span className='sbar-key'>{item.key}</span>
                {item.label}
              </SectionLink>
            </li>
          );
        })}
      </ol>
      <span className='sbar-where' aria-hidden='true'>
        {where}
      </span>
      <button type='button' className='sbar-btn' onClick={onTerminal}>
        <span className='sbar-key'>/</span>terminal
      </button>
      <button type='button' className='sbar-btn' onClick={onHelp}>
        <span className='sbar-key'>?</span>keys
      </button>
      <SectionLink
        id='early-access'
        isHome={isHome}
        className={cn('sbar-cta', atForm && 'is-current')}
        aria-current={atForm ? 'location' : undefined}
      >
        {siteConfig.cta.short}
      </SectionLink>
      <span className='sbar-pos' aria-hidden='true'>
        {position}
      </span>
    </nav>
  );
}
