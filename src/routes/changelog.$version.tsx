import { Link, createFileRoute, notFound } from '@tanstack/react-router';
import { ChangeType, changeHash } from '~/components/changelog/ChangelogGraph';
import { PageHead } from '~/components/layout/PageHead';
import { Box } from '~/components/tui/Box';
import { Text } from '~/components/tui/Text';
import {
  countChanges,
  getNeighbors,
  getRelease,
  gitDate,
  releasePath
} from '~/lib/changelog';
import { ogImage } from '~/lib/site';
import { siteConfig } from '~/site.config';
import { seo } from '~/utils/seo';

export const Route = createFileRoute('/changelog/$version')({
  loader: ({ params }) => {
    const release = getRelease(params.version);
    if (!release) throw notFound();
    return { version: release.version, title: release.title, summary: release.summary };
  },
  head: ({ loaderData }) =>
    loaderData
      ? seo({
          title: `${siteConfig.product} v${loaderData.version}: ${loaderData.title}`,
          description: loaderData.summary,
          path: releasePath(loaderData.version),
          type: 'article',
          image: ogImage(`changelog-${loaderData.version}`),
          imageAlt: `${siteConfig.product} v${loaderData.version}: ${loaderData.title}`
        })
      : seo({ title: `command not found · ${siteConfig.product}`, noindex: true }),
  component: ReleasePage
});

function ReleasePage() {
  const { version } = Route.useLoaderData();
  const release = getRelease(version)!;
  const { newer, older } = getNeighbors(version);
  const counts = countChanges(release);
  const stat = (['feat', 'fix', 'perf'] as const)
    .filter((type) => counts[type] > 0)
    .map((type) => `${counts[type]} ${type}`)
    .join(', ');

  return (
    <article className='page wrap'>
      <PageHead
        command={`git show v${release.version}`}
        title={
          <>
            <span className='tone-link'>v{release.version}</span> {release.title}
          </>
        }
      />
      <div className='release'>
        <dl className='release-meta'>
          <div>
            <dt>tag</dt>
            <dd>v{release.version}</dd>
          </div>
          <div>
            <dt>Tagger:</dt>
            <dd>{siteConfig.company} release bot</dd>
          </div>
          <div>
            <dt>Date:</dt>
            <dd>
              <time dateTime={release.date}>{gitDate(release.date)}</time>
            </dd>
          </div>
          <div>
            <dt>commit</dt>
            <dd className='t-dim'>
              {release.commit} · {release.changes.length} changes: {stat}
            </dd>
          </div>
        </dl>

        <p className='release-summary t-lede'>
          <Text>{release.summary}</Text>
        </p>

        <ul className='release-changes'>
          {release.changes.map((change, i) => (
            <li key={i} className='release-change'>
              <span className='release-hash t-dim' aria-hidden='true'>
                {changeHash(release, i, change)}
              </span>
              <ChangeType type={change.type} />
              <div className='release-change-body'>
                <p>
                  <Text>{change.text}</Text>
                </p>
                {change.detail ? (
                  <p className='release-detail'>
                    <Text>{change.detail}</Text>
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>

        <Box title='upgrade' className='release-upgrade'>
          <p>
            Run the install command again; it replaces the old binary.{' '}
            <Link to='/' hash='install' className='link'>
              get the install command
            </Link>
          </p>
        </Box>

        <nav className='release-nav' aria-label='Other releases'>
          {older ? (
            <Link to='/changelog/$version' params={{ version: older.version }} className='link'>
              ← v{older.version} {older.title}
            </Link>
          ) : (
            <span className='t-dim'>← first 2.x release</span>
          )}
          <Link to='/changelog' className='link'>
            all releases
          </Link>
          {newer ? (
            <Link to='/changelog/$version' params={{ version: newer.version }} className='link'>
              v{newer.version} {newer.title} →
            </Link>
          ) : (
            <span className='t-dim'>latest →</span>
          )}
        </nav>
      </div>
    </article>
  );
}
