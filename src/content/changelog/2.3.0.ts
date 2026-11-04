import type { Release } from '~/lib/changelog';

export default {
  version: '2.3.0',
  date: '2026-07-08',
  commit: '9b01d3c',
  title: 'Windows and shells',
  summary:
    'A native Windows build, JSON output for scripts, and shell completions for bash, zsh, fish, and PowerShell.',
  changes: [
    {
      type: 'feat',
      text: 'Native Windows build, installed with one line of PowerShell',
      detail:
        'No WSL needed. Builds run in the same container runtime as on macOS and Linux, so previews behave the same.'
    },
    {
      type: 'feat',
      text: '`burrow ls --json` for scripts; every command exits non-zero when it fails'
    },
    {
      type: 'feat',
      text: 'Shell completions for bash, zsh, fish, and PowerShell with `burrow completions <shell>`'
    },
    {
      type: 'perf',
      text: 'Snapshots stream to storage while the image is still exporting'
    }
  ]
} satisfies Release;
