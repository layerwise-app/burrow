import { Link } from '@tanstack/react-router';
import { Fragment } from 'react';
import { SectionLink } from '~/components/layout/SectionLink';
import { Rule } from '~/components/tui/Box';
import { latestRelease } from '~/lib/changelog';
import { siteConfig } from '~/site.config';

/** A man-page footer: SEE ALSO, BUGS, AUTHORS, then the page footer line. */
export function Footer({ isHome }: { isHome: boolean }) {
  const social = siteConfig.social.filter((item) => item.href);
  const command = siteConfig.command.toUpperCase();
  return (
    <footer className='ftr'>
      <div className='wrap'>
        <Rule />
        <dl className='man'>
          <div className='man-row'>
            <dt>SEE ALSO</dt>
            <dd>
              {siteConfig.pages.map((page, i) => (
                <Fragment key={page.href}>
                  {i > 0 ? ', ' : null}
                  <Link to={page.href} className='link'>
                    {page.label}
                  </Link>
                  <span className='t-dim'>(7)</span>
                </Fragment>
              ))}
              {', '}
              <SectionLink id='early-access' isHome={isHome} className='link'>
                early access
              </SectionLink>
              <span className='t-dim'>(1)</span>
            </dd>
          </div>
          <div className='man-row'>
            <dt>BUGS</dt>
            <dd>{siteConfig.footer.bugs}</dd>
          </div>
          <div className='man-row'>
            <dt>AUTHORS</dt>
            <dd>{siteConfig.footer.authors}</dd>
          </div>
          {social.length > 0 ? (
            <div className='man-row'>
              <dt>ELSEWHERE</dt>
              <dd>
                {social.map((item, i) => (
                  <Fragment key={item.label}>
                    {i > 0 ? ', ' : null}
                    <a className='link' href={item.href} rel='me noopener' target='_blank'>
                      {item.label}
                    </a>
                  </Fragment>
                ))}
              </dd>
            </div>
          ) : null}
        </dl>
        <div className='ftr-line'>
          <span>{siteConfig.companyLegalName}</span>
          <span className='t-dim'>{latestRelease.date}</span>
          <span>{command}(1)</span>
        </div>
        <div className='ftr-badge'>
          <a href='https://layerwise.app' target='_blank' rel='noopener noreferrer'>
            <img
              src='https://layerwise.app/powered-by-dark.png'
              width={174}
              height={28}
              loading='lazy'
              decoding='async'
              alt='Powered by Layerwise'
            />
          </a>
          <span className='t-small t-dim'>
            {siteConfig.product} and {siteConfig.company} are fictional, made for a Layerwise template.
          </span>
        </div>
      </div>
    </footer>
  );
}
