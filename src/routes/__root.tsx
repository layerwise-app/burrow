/// <reference types="vite/client" />
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext
} from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import type * as React from 'react';
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary';
import { NotFound } from '~/components/NotFound';
import { SiteShell } from '~/components/layout/SiteShell';
import { site } from '~/lib/site';
import { siteConfig } from '~/site.config';
import { seo } from '~/utils/seo';
import '~/styles/app.css';
import '~/styles/site.css';

const kebab = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** CSS variables and @font-face rules from `src/site.config.ts`. */
const themeCss = [
  ...siteConfig.font.files.map(
    (file) =>
      `@font-face{font-family:'${siteConfig.font.family}';src:url('${file.src}') format('woff2');font-weight:${file.weight};font-style:${file.style};font-display:swap}`
  ),
  `:root{--site-font:'${siteConfig.font.family}',${siteConfig.font.fallback};${Object.entries(
    siteConfig.colors
  )
    .map(([name, value]) => `--ansi-${kebab(name)}:${value}`)
    .join(';')}}`
].join('\n');

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  // Site-wide defaults; each page's `seo()` overrides tags with the same name.
  head: ({ matches }) => {
    const notFound = matches.some(
      (match) => match.status === 'notFound' || (match as { _notFound?: boolean })._notFound
    );
    return {
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: siteConfig.colors.black },
      { name: 'color-scheme', content: 'dark' },
      ...(site.googleSiteVerification
        ? [
            {
              name: 'google-site-verification',
              content: site.googleSiteVerification
            }
          ]
        : []),
      ...seo(
        notFound
          ? { title: `command not found · ${site.name}`, noindex: true }
          : { title: site.name, description: site.description }
      ).meta
    ],
    links: [
      {
        rel: 'preload',
        href: siteConfig.font.files[0].src,
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous'
      },
      { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
      { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      { rel: 'manifest', href: '/site.webmanifest' }
    ],
    styles: [{ children: themeCss }],
    scripts: [
      // Lets CSS start animations from their first frame only when JS runs.
      { children: "document.documentElement.classList.add('js')" }
    ]
    };
  },
  errorComponent: (props) => (
    <RootDocument>
      <SiteShell>
        <DefaultCatchBoundary {...props} />
      </SiteShell>
    </RootDocument>
  ),
  notFoundComponent: () => <NotFound />,
  component: RootComponent
});

function RootComponent() {
  return (
    <RootDocument>
      <SiteShell>
        <Outlet />
      </SiteShell>
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
