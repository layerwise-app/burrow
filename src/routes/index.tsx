import { createFileRoute } from '@tanstack/react-router';
import { Benchmark } from '~/components/home/Benchmark';
import { ConfigFile } from '~/components/home/ConfigFile';
import { EarlyAccess } from '~/components/home/EarlyAccess';
import { Hero } from '~/components/home/Hero';
import { HowItWorks } from '~/components/home/HowItWorks';
import { Pricing } from '~/components/home/Pricing';
import { Voices } from '~/components/home/Voices';
import { WorksWith } from '~/components/home/WorksWith';
import { home } from '~/content/home';
import { latestRelease } from '~/lib/changelog';
import { ogImage, siteUrl } from '~/lib/site';
import { siteConfig } from '~/site.config';
import { seo } from '~/utils/seo';

export const Route = createFileRoute('/')({
  head: () =>
    seo({
      title: `${siteConfig.product}: a preview URL for every git branch`,
      description: siteConfig.description,
      path: '/',
      image: ogImage('home'),
      imageAlt: `${siteConfig.product}: ${home.hero.title}`,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          '@id': siteUrl('/#organization'),
          name: siteConfig.company,
          legalName: siteConfig.companyLegalName,
          url: siteUrl('/'),
          logo: siteUrl('/logo.png'),
          numberOfEmployees: { '@type': 'QuantitativeValue', value: 9 },
          address: {
            '@type': 'PostalAddress',
            addressLocality: siteConfig.companyCity,
            addressCountry: siteConfig.companyCountry
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: siteConfig.product,
          description: siteConfig.description,
          url: siteUrl('/'),
          image: siteUrl(ogImage('home')),
          applicationCategory: 'DeveloperApplication',
          operatingSystem: siteConfig.platforms.join(', '),
          softwareVersion: latestRelease.version,
          datePublished: latestRelease.date,
          license: 'https://opensource.org/license/mit',
          releaseNotes: siteUrl(`/changelog/${latestRelease.version}`),
          publisher: { '@id': siteUrl('/#organization') },
          offers: [
            {
              '@type': 'Offer',
              name: 'burrow CLI',
              price: '0',
              priceCurrency: 'USD'
            },
            {
              '@type': 'Offer',
              name: 'Burrow Cloud Team',
              price: '12',
              priceCurrency: 'USD',
              priceSpecification: {
                '@type': 'UnitPriceSpecification',
                price: '12',
                priceCurrency: 'USD',
                unitText: 'per seat per month'
              }
            }
          ]
        }
      ]
    }),
  component: Home
});

function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <ConfigFile />
      <Benchmark />
      <WorksWith />
      <Voices />
      <Pricing />
      <EarlyAccess />
    </>
  );
}
