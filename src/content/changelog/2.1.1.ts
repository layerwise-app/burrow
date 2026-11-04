import type { Release } from '~/lib/changelog';

export default {
  version: '2.1.1',
  date: '2026-02-10',
  commit: 'c90e5d1',
  title: 'Line endings',
  summary:
    'Two fixes: Windows line endings in .env files, and a progress bar that misbehaved in narrow terminals.',
  changes: [
    {
      type: 'fix',
      text: '`burrow up` reads `.env` files with Windows (CRLF) line endings correctly',
      detail:
        'Values used to keep a trailing carriage return, which broke database URLs in ways that were very hard to see.'
    },
    {
      type: 'fix',
      text: 'The progress bar no longer redraws over the prompt in terminals narrower than 60 columns'
    }
  ]
} satisfies Release;
