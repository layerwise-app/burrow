import type { Release } from '~/lib/changelog';

export default {
  version: '2.2.0',
  date: '2026-04-21',
  commit: '3a8c7f2',
  title: 'Sleep',
  summary:
    'Idle previews go to sleep and wake on the next request, and Compose services start beside the app, one stack per branch.',
  changes: [
    {
      type: 'feat',
      text: 'Idle previews sleep after `sleep_after` and wake on the next request in about two seconds',
      detail:
        'A sleeping preview keeps its snapshot and data but uses no compute. The default is `30m`; set `sleep_after = "never"` to keep one awake.'
    },
    {
      type: 'feat',
      text: 'Compose support: services in `compose.yaml` start beside the app, one stack per branch',
      detail:
        'Burrow reads the services you already have. Ports are rewired so two branches never collide.'
    },
    {
      type: 'perf',
      text: 'The build cache restores in parallel; warm builds are 34% faster on a typical Next.js app'
    },
    {
      type: 'fix',
      text: 'Health checks follow redirects before deciding whether a preview is up'
    }
  ]
} satisfies Release;
