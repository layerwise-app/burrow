import { createFileRoute } from '@tanstack/react-router';
import { ChangelogGraph } from '~/components/changelog/ChangelogGraph';
import { PageHead } from '~/components/layout/PageHead';
import { releases } from '~/lib/changelog';
import { ogImage } from '~/lib/site';
import { siteConfig } from '~/site.config';
import { seo } from '~/utils/seo';

const oldest = releases[releases.length - 1];
const newest = releases[0];

export const Route = createFileRoute('/changelog/')({
  head: () =>
    seo({
      title: `Changelog: every ${siteConfig.product} release`,
      description: `What changed in each release of the ${siteConfig.command} CLI, from v${oldest.version} to v${newest.version}: features, fixes, and speedups.`,
      path: '/changelog',
      image: ogImage('changelog'),
      imageAlt: `${siteConfig.product} changelog, v${oldest.version} to v${newest.version}`
    }),
  component: ChangelogPage
});

function ChangelogPage() {
  return (
    <div className='page wrap'>
      <PageHead
        command={`git log --graph v${oldest.version}..v${newest.version}`}
        title='Changelog'
        lede={`Every release of the ${siteConfig.command} CLI, newest first. Each tag has its own page with the details.`}
      />
      <ChangelogGraph releases={releases} />
    </div>
  );
}
