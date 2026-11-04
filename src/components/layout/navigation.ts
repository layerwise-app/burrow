import { prefersReducedMotion } from '~/lib/motion';
import { siteConfig } from '~/site.config';

export const TERMINAL_INPUT_ID = 'terminal-input';

/** Scrolls to a home section and moves focus to its heading. */
export function jumpToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  history.replaceState(history.state, '', `#${id}`);
  const heading = document.getElementById(`${id}-title`);
  heading?.focus({ preventScroll: true });
  return true;
}

export function focusTerminal() {
  const input = document.getElementById(TERMINAL_INPUT_ID) as HTMLInputElement | null;
  if (!input) return false;
  const terminal = input.closest('.terminal');
  terminal?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
  input.focus({ preventScroll: true });
  return true;
}

export function isEditable(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  );
}

export const navItems = siteConfig.nav.map((item, i) => ({ ...item, key: String(i + 1) }));
