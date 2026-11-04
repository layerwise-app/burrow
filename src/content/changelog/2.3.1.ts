import type { Release } from '~/lib/changelog';

export default {
  version: '2.3.1',
  date: '2026-07-30',
  commit: '7e3a1f0',
  title: 'Quieter logs',
  summary:
    'Secrets are redacted from logs, share links respect basic auth, and burrow ls answers instantly from a local cache.',
  changes: [
    {
      type: 'fix',
      text: 'Values set with `burrow secrets set` are redacted from `burrow logs` output',
      detail:
        'Redaction happens before lines leave the preview, so secrets never reach your terminal or Burrow Cloud log storage.'
    },
    {
      type: 'fix',
      text: '`burrow share` links respect the branch’s basic-auth setting'
    },
    {
      type: 'perf',
      text: '`burrow ls` answers from a local cache and refreshes in the background'
    }
  ]
} satisfies Release;
