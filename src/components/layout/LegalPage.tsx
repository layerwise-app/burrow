import { PageHead } from '~/components/layout/PageHead';
import type { LegalPage as LegalContent } from '~/content/legal';
import { siteConfig } from '~/site.config';

/** Privacy and Terms, laid out like a man page. */
export function LegalPage({ page, slug }: { page: LegalContent; slug: string }) {
  return (
    <article className='page wrap'>
      <PageHead
        command={`man 7 ${siteConfig.command}-${slug}`}
        title={page.title}
        lede={page.description}
      />
      <p className='t-small t-dim legal-updated'>
        last updated <time dateTime={page.updated}>{page.updated}</time>
      </p>
      <div className='man legal'>
        {page.sections.map((section) => (
          <section key={section.heading} className='man-row'>
            <h2 className='man-heading'>{section.heading}</h2>
            <div className='man-body'>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.list ? (
                <ul className='man-list'>
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
