import type { TeamSize } from '~/lib/signup-rules';

const EVENT = 'burrow:prefill-team-size';

/** Called by buttons like "Talk to us" before they jump to the form. */
export function prefillTeamSize(teamSize: TeamSize) {
  window.dispatchEvent(new CustomEvent<TeamSize>(EVENT, { detail: teamSize }));
}

export function onPrefillTeamSize(handler: (teamSize: TeamSize) => void) {
  const listener = (event: Event) => handler((event as CustomEvent<TeamSize>).detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
