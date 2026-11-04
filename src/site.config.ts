// Site-wide settings: names, navigation, button labels, links, colors, and
// fonts. Page copy lives in `src/content/`. Keep this file free of imports so
// scripts in `scripts/` can read it too.

export const siteConfig = {
  company: 'Tunnelworks',
  /** Shown in the footer and the Organization structured data. */
  companyLegalName: 'Tunnelworks B.V.',
  companyCity: 'Rotterdam',
  companyCountry: 'NL',
  product: 'Burrow',
  /** The command people type. Used in the terminal, man-page header, and wordmark. */
  command: 'burrow',
  tagline: 'A preview environment for every git branch, from one command.',
  description:
    'Burrow is an open-source CLI that builds the git branch you are on and gives it a live preview URL. One command, and it cleans up when you merge.',
  license: 'MIT',
  platforms: ['macOS', 'Linux', 'Windows'],

  /**
   * Where early-access sign-ups are emailed (at most 100 a day). Leave empty
   * to only save them; they always show up in the project's Database panel.
   */
  ownerEmail: '',

  /** The main call to action. Every button that asks for action leads to the form. */
  cta: {
    primary: 'Get Burrow Cloud early access',
    short: 'early access',
    enterprise: 'Talk to us',
    submit: 'Get Burrow Cloud early access',
    formAnchor: '#early-access'
  },

  /**
   * Home sections in the status bar (desktop) and menu (phones). Keys 1–6
   * jump to them in this order. `id` must match a section id on the home page.
   */
  nav: [
    { id: 'how-it-works', label: 'how it works' },
    { id: 'configuration', label: 'config' },
    { id: 'speed', label: 'speed' },
    { id: 'works-with', label: 'works with' },
    { id: 'voices', label: 'voices' },
    { id: 'pricing', label: 'pricing' }
  ],

  /** Other pages in the header, menu, and footer. */
  pages: [
    { href: '/changelog', label: 'changelog' },
    { href: '/privacy', label: 'privacy' },
    { href: '/terms', label: 'terms' }
  ],

  /** The man-page style footer on every page. */
  footer: {
    manual: 'General Commands Manual',
    bugs: 'None known. Several suspected. Tell us through the early-access form and we will fix them in the open.',
    authors: 'Tunnelworks: nine people in Rotterdam who got tired of asking which staging server was free.'
  },

  /** Shown in the footer when `href` is set. */
  social: [
    { label: 'GitHub', href: '' },
    { label: 'Mastodon', href: '' },
    { label: 'Bluesky', href: '' }
  ],

  /**
   * The 16 ANSI colors are the whole palette. Roles: green = success,
   * yellow = warnings, cyan = links, magenta = "you are here" (cursor, focus,
   * the current section). Body text uses `white` on `black`.
   */
  colors: {
    black: '#0a0a0a',
    red: '#e2726b',
    green: '#86d07f',
    yellow: '#e7c463',
    blue: '#73a6e6',
    magenta: '#e07fd0',
    cyan: '#6ed0d3',
    white: '#c8c8c1',
    brightBlack: '#8a8a83',
    brightRed: '#ff958c',
    brightGreen: '#a9ec9f',
    brightYellow: '#f6dc8e',
    brightBlue: '#9cc4fa',
    brightMagenta: '#f7a3ea',
    brightCyan: '#97eef0',
    brightWhite: '#f3f3ec'
  },

  /**
   * One monospace family for everything. Put open-license font files in
   * `public/fonts/` and list them here; the first file is preloaded.
   */
  font: {
    family: 'JetBrains Mono',
    fallback: "ui-monospace, 'SF Mono', Menlo, Consolas, 'DejaVu Sans Mono', monospace",
    files: [
      {
        src: '/fonts/JetBrainsMono-Variable.woff2',
        weight: '100 800',
        style: 'normal'
      }
    ]
  },

  /**
   * ASCII-art wordmark, drawn with heavy box-drawing lines. `{hl:█}` is the
   * magenta block cursor. Lines may differ in width.
   */
  wordmark: [
    '┃',
    '┣━━┓ ┃  ┃ ┏━━╸┏━━╸┏━━┓ ┃ ┃ ┃',
    '┃  ┃ ┃  ┃ ┃   ┃   ┃  ┃ ┃ ┃ ┃',
    '┗━━┛ ┗━━┛ ╹   ╹   ┗━━┛ ┗━┻━┛ {hl:█}'
  ]
} as const;

export type SiteConfig = typeof siteConfig;
export type NavItem = (typeof siteConfig.nav)[number];
