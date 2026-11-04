import { useRef, useState } from 'react';
import type * as React from 'react';
import { fillText } from '~/components/tui/Text';
import { home } from '~/content/home';
import { siteUrl } from '~/lib/site';
import { clsx as cn } from 'clsx';

const content = home.hero.install;

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Clipboard API can be blocked (embedded previews); fall back to a selection.
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

/** The install line under the terminal: tabs per OS, a copy button, `copied ✓`. */
export function InstallTabs() {
  const origin = siteUrl('/').replace(/\/$/, '');
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const commands = content.tabs.map((tab) => fillText(tab.command, { origin }));

  const onCopy = async () => {
    const ok = await copyText(commands[active]);
    if (!ok) return;
    setCopied(active);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(null), 2400);
  };

  const onTabKey = (event: React.KeyboardEvent, index: number) => {
    const count = content.tabs.length;
    let next: number | null = null;
    if (event.key === 'ArrowRight') next = (index + 1) % count;
    if (event.key === 'ArrowLeft') next = (index - 1 + count) % count;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = count - 1;
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div id='install' className='install'>
      <div className='install-head'>
        <span className='t-label'>{content.label}</span>
        <div role='tablist' aria-label='Operating system' className='install-tabs'>
          {content.tabs.map((tab, i) => (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type='button'
              role='tab'
              id={`install-tab-${tab.id}`}
              aria-selected={active === i}
              aria-controls={`install-panel-${tab.id}`}
              tabIndex={active === i ? 0 : -1}
              className={cn('install-tab', active === i && 'is-active')}
              onClick={() => setActive(i)}
              onKeyDown={(e) => onTabKey(e, i)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {content.tabs.map((tab, i) => (
        <div
          key={tab.id}
          role='tabpanel'
          id={`install-panel-${tab.id}`}
          aria-labelledby={`install-tab-${tab.id}`}
          hidden={active !== i}
          className='install-line'
        >
          <code className='install-cmd'>
            <span className='tone-hl' aria-hidden='true'>
              {tab.id === 'windows' ? '>' : '$'}{' '}
            </span>
            {commands[i]}
          </code>
          <button
            type='button'
            className={cn('install-copy', copied === i && 'is-copied')}
            onClick={onCopy}
            aria-label={copied === i ? 'Copied' : `Copy the ${tab.label} install command`}
          >
            {copied === i ? content.copied : content.copy}
          </button>
        </div>
      ))}
      <p className='install-note t-small t-dim'>{content.note}</p>
      <span className='sr-only' role='status' aria-live='polite'>
        {copied !== null ? 'Install command copied to the clipboard' : ''}
      </span>
    </div>
  );
}
