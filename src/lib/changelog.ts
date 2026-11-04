// Releases come from one file per version in `src/content/changelog/`.
// Adding a file there adds it to /changelog, its own page, and the sitemap.

export type ChangeType = 'feat' | 'fix' | 'perf';

export type Change = {
  type: ChangeType;
  /** One line, shown in the changelog graph. Wrap `code` in backticks. */
  text: string;
  /** Optional longer note, shown on the release's own page. */
  detail?: string;
};

export type Release = {
  /** Semantic version without the `v`, like `2.4.0`. Must match the file name. */
  version: string;
  /** Release date as `YYYY-MM-DD`. */
  date: string;
  /** Short commit hash of the release tag (7 hex characters). */
  commit: string;
  /** A few words naming the release. */
  title: string;
  /** One or two sentences for the release page and its share preview. */
  summary: string;
  changes: Change[];
};

const modules = import.meta.glob<{ default: Release }>(
  '../content/changelog/*.ts',
  { eager: true }
);

function versionParts(version: string) {
  return version.split('.').map((part) => Number.parseInt(part, 10) || 0);
}

export function compareVersions(a: string, b: string) {
  const pa = versionParts(a);
  const pb = versionParts(b);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

/** Every release, newest first. */
export const releases: Release[] = Object.values(modules)
  .map((module) => module.default)
  .sort((a, b) => compareVersions(b.version, a.version));

export const latestRelease: Release = releases[0];

export function getRelease(version: string): Release | undefined {
  return releases.find((release) => release.version === version);
}

/** The releases before and after this one, for prev/next links. */
export function getNeighbors(version: string) {
  const index = releases.findIndex((release) => release.version === version);
  return {
    newer: index > 0 ? releases[index - 1] : undefined,
    older: index >= 0 ? releases[index + 1] : undefined
  };
}

export function isPatch(version: string) {
  const [, , patch] = versionParts(version);
  return (patch ?? 0) > 0;
}

export function releasePath(version: string) {
  return `/changelog/${version}`;
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** `2026-10-13` → `Tue Oct 13 2026`, the way `git log` prints dates. */
export function gitDate(date: string) {
  const [y, m, d] = date.split('-').map(Number);
  const day = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${DAYS[day]} ${MONTHS[m - 1]} ${d} ${y}`;
}

export function countChanges(release: Release) {
  const counts: Record<ChangeType, number> = { feat: 0, fix: 0, perf: 0 };
  for (const change of release.changes) counts[change.type]++;
  return counts;
}
