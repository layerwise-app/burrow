import { Link } from '@tanstack/react-router';
import { InstallTabs } from '~/components/home/InstallTabs';
import { Terminal } from '~/components/home/Terminal';
import { ScreenSlot } from '~/components/screens/ScreenSlot';
import { Text, fillText } from '~/components/tui/Text';
import { Wordmark } from '~/components/tui/Wordmark';
import { home } from '~/content/home';
import { latestRelease } from '~/lib/changelog';
import { siteConfig } from '~/site.config';

const content = home.hero;

export function Hero() {
  const values = { version: latestRelease.version, license: siteConfig.license };
  return (
    <section id={content.id} data-section='top' className='hero wrap' aria-labelledby='hero-title'>
      <div className='hero-copy'>
        <Wordmark className='hero-wordmark' />
        <p className='t-label hero-eyebrow'>{fillText(content.eyebrow, values)}</p>
        <h1 id='hero-title' className='t-h1'>
          {content.title}
        </h1>
        <p className='t-lede hero-lede'>
          <Text>{content.lede}</Text>
        </p>
        <div className='hero-actions'>
          <a className='btn' href={siteConfig.cta.formAnchor}>
            {siteConfig.cta.primary}
          </a>
          <Link
            className='link t-small'
            to='/changelog/$version'
            params={{ version: latestRelease.version }}
          >
            {fillText(content.secondaryLink.label, values)}
          </Link>
        </div>
      </div>
      <div className='hero-demo'>
        <ScreenSlot name='heroTerminal'>
          <Terminal />
        </ScreenSlot>
        <InstallTabs />
      </div>
    </section>
  );
}
