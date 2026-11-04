import type { Release } from '~/lib/changelog';

export default {
  version: '2.1.0',
  date: '2026-01-27',
  commit: '6b2f9a4',
  title: 'Share links',
  summary:
    'burrow share makes a read-only link to any preview, and GitLab merge requests get their preview URL in the merge request widget.',
  changes: [
    {
      type: 'feat',
      text: '`burrow share <branch>` makes a read-only link that expires after 72 hours',
      detail:
        'Pass `--expires 7d` for longer. Anyone with the link can look around; nobody needs a Burrow account, and nothing they do can change the preview.'
    },
    {
      type: 'feat',
      text: 'GitLab merge requests show the preview URL in the merge request widget',
      detail:
        'Connect a project with `burrow connect gitlab`. Self-managed GitLab 16.4 and newer is supported.'
    },
    {
      type: 'fix',
      text: '`burrow down` no longer leaves an orphaned volume behind when the preview was asleep'
    },
    {
      type: 'perf',
      text: 'Framework detection reads lockfiles instead of installing; cold starts are 1.8 s faster'
    }
  ]
} satisfies Release;
