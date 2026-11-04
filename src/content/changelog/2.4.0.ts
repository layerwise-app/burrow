import type { Release } from '~/lib/changelog';

export default {
  version: '2.4.0',
  date: '2026-10-13',
  commit: 'a41c9e2',
  title: 'Cleanup on merge',
  summary:
    'Previews delete themselves when their branch merges, burrow up can print where the time went, and uploads are faster on slow connections.',
  changes: [
    {
      type: 'feat',
      text: 'Previews are deleted when their branch merges or is deleted on GitHub or GitLab',
      detail:
        'The preview, its snapshot, and its data go together. Set `delete_on_merge = false` under `[preview]` to keep them.'
    },
    {
      type: 'feat',
      text: '`burrow up --timings` prints how long each stage took',
      detail:
        'Useful when a build gets slow: it shows detect, build, upload, snapshot, and health check separately, plus cache hit rates.'
    },
    {
      type: 'feat',
      text: 'The health check waits for every service in `[services]`, not only the web port'
    },
    {
      type: 'fix',
      text: '`burrow logs -f` reconnects after your laptop sleeps instead of exiting'
    },
    {
      type: 'perf',
      text: 'Layer uploads use up to 8 parallel streams; 41% faster on slow uplinks'
    }
  ]
} satisfies Release;
