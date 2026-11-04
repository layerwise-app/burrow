import type { Release } from '~/lib/changelog';

export default {
  version: '2.0.0',
  date: '2025-11-18',
  commit: '1d7e03b',
  title: 'Snapshots',
  summary:
    'Previews now boot from a snapshot of the built image and its seed data, so every branch starts from the same state. burrow.toml moves to version 2.',
  changes: [
    {
      type: 'feat',
      text: 'Previews start from a snapshot of the built image and seeded data',
      detail:
        'A snapshot is taken once per commit. Restarting, waking, or sharing a preview reuses it instead of rebuilding, and every branch sees the same seed data.'
    },
    {
      type: 'feat',
      text: '`burrow.toml` version 2 with `[services]`, `[env]` interpolation, and `[preview]`',
      detail:
        'Version 1 files keep working. Run `burrow config upgrade` to rewrite one in place; it prints a diff first.'
    },
    {
      type: 'feat',
      text: '`burrow logs <branch>` shows logs from every service in a preview',
      detail:
        'Lines are prefixed with the service name. Add `-f` to follow and `--since 10m` to look back.'
    },
    {
      type: 'fix',
      text: 'Branch names with slashes, like `feat/checkout`, map to valid hostnames',
      detail:
        'Slashes and dots become hyphens, and names longer than 63 characters are shortened with a short hash so they stay unique.'
    },
    {
      type: 'perf',
      text: 'Layer uploads are content-addressed; unchanged layers are never sent twice'
    }
  ]
} satisfies Release;
