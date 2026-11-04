// Copy and data for every section of the home page, in page order. Change a
// headline, a number, or a quote here; the components only lay it out.
// Text in backticks renders as inline code.

export const home = {
  hero: {
    id: 'top',
    /** Small line above the headline. `{version}` is the newest release. */
    eyebrow: 'v{version} · open source · {license}',
    title: 'Every git branch gets its own preview URL.',
    lede: 'Burrow is a command-line tool. Run `burrow up` on any branch and it builds the app, snapshots it, and prints a live URL you can send to anyone. Merge the branch and the preview cleans itself up.',
    secondaryLink: { label: 'what changed in v{version}', href: '/changelog/{version}' },
    install: {
      label: 'install the CLI',
      tabs: [
        {
          id: 'unix',
          label: 'macOS / Linux',
          command: 'curl -fsSL {origin}/install.sh | sh'
        },
        {
          id: 'windows',
          label: 'Windows',
          command: 'irm {origin}/install.ps1 | iex'
        }
      ],
      copy: 'copy',
      copied: 'copied ✓',
      note: 'Burrow is a sample product: the script prints a note and exits without changing anything.'
    }
  },

  howItWorks: {
    id: 'how-it-works',
    label: 'how it works',
    title: 'From a push to a URL, and back to nothing.',
    lede: 'Five stages, all of them automatic after the first `burrow up`. Nothing waits in a CI queue.',
    stages: [
      {
        name: 'git push',
        time: '0s',
        note: 'You push a branch. Burrow sees the new commit; there is no pipeline to write.'
      },
      {
        name: 'build',
        time: '~25s',
        note: 'It detects the framework and builds with layers cached from the last push.'
      },
      {
        name: 'snapshot',
        time: '~3s',
        note: 'The image and seed data are frozen, so every preview starts from the same state.'
      },
      {
        name: 'preview URL',
        time: '~1s',
        note: 'The branch gets https://<branch>.<team>.burrow.run, with TLS, ready to share.'
      },
      {
        name: 'cleanup on merge',
        time: 'later',
        note: 'When the branch merges or is deleted, the preview and its data go with it.'
      }
    ],
    loopLabel: 'next push starts again'
  },

  configuration: {
    id: 'configuration',
    label: 'configuration',
    title: 'One file, and most of it is optional.',
    lede: 'A project with a lockfile needs no config at all. When it does, `burrow.toml` sits next to your code. Hover or focus a line for a note.',
    filename: 'burrow.toml',
    lines: [
      { code: '# burrow.toml lives next to package.json' },
      {
        code: 'version = 2',
        note: 'Config format version. Burrow 2.x reads 1 and 2, and says so if it cannot.'
      },
      { code: '' },
      { code: '[app]' },
      { code: 'name = "storefront"' },
      {
        code: 'framework = "auto"        # found: next.js',
        note: 'Detects Next.js, Remix, Rails, Django, Laravel, Go, and anything with a Dockerfile.'
      },
      {
        code: 'port = 3000',
        note: 'The port your app listens on. Burrow puts TLS in front of it.'
      },
      { code: '' },
      { code: '[build]' },
      { code: 'command = "pnpm build"' },
      {
        code: 'cache = ["node_modules", ".next/cache"]',
        note: 'Kept between builds of the same branch. This is most of the speed.'
      },
      { code: '' },
      {
        code: '[services.db]',
        note: 'Sidecar containers. Each branch gets its own database, never a shared one.'
      },
      { code: 'image = "postgres:17"' },
      {
        code: 'seed = "db/seed.sql"',
        note: 'Runs once, when the snapshot is taken, so every preview starts with the same data.'
      },
      { code: '' },
      { code: '[env]' },
      {
        code: 'DATABASE_URL = "${services.db.url}"',
        note: 'Values can point at services, so nothing hard-codes a host.'
      },
      {
        code: 'STRIPE_KEY = { secret = "stripe-test" }',
        note: 'Secrets come from `burrow secrets set`, never from this file.'
      },
      { code: '' },
      { code: '[preview]' },
      {
        code: 'sleep_after = "30m"',
        note: 'Idle previews sleep and wake on the next request in about two seconds.'
      },
      {
        code: 'delete_on_merge = true',
        note: 'On by default. Set it to false if you like collecting things.'
      }
    ]
  },

  speed: {
    id: 'speed',
    label: 'speed',
    title: 'Push to a working preview in under a minute.',
    lede: 'Time from `git push` until the preview answers its health check, against the same app deployed by a typical CI preview pipeline.',
    caption: 'seconds from push to a working preview · lower is better',
    burrowLabel: 'burrow',
    ciLabel: 'typical CI',
    /** Seconds. The chart's scale ends at `axisMax`. */
    axisMax: 480,
    ticks: [0, 60, 120, 180, 240, 300, 360, 420, 480],
    scenarios: [
      {
        name: 'next.js storefront',
        detail: 'cold cache, first push of the branch',
        burrow: 52.4,
        ci: 461
      },
      {
        name: 'next.js storefront',
        detail: 'warm cache, second push',
        burrow: 11.8,
        ci: 245
      },
      {
        name: 'rails + postgres',
        detail: 'warm cache, seeded database',
        burrow: 19.6,
        ci: 372
      }
    ],
    summary: '9–21× faster',
    footnote: 'Sample data for this template. Median of 15 runs per scenario on a 4 vCPU runner, October 2026. "Typical CI" builds an image in GitHub Actions, pushes it to a registry, and deploys it to a preview namespace. `burrow up --timings` prints your own numbers.'
  },

  worksWith: {
    id: 'works-with',
    label: 'works with',
    title: 'Fits the tools you already run.',
    lede: 'No new dashboard to live in. Burrow shows up where you already look.',
    columns: ['tool', 'what burrow does'],
    rows: [
      {
        tool: 'GitHub',
        does: 'Builds a preview for every pull request, posts the URL as a check, and deletes it when the PR merges or closes.'
      },
      {
        tool: 'GitLab',
        does: 'The same for merge requests: one environment per MR, its URL in the MR widget, gone on merge.'
      },
      {
        tool: 'Docker',
        does: 'Uses your Dockerfile when there is one. Otherwise builds an image from the detected framework.'
      },
      {
        tool: 'Compose',
        does: 'Starts the services in compose.yaml beside the app, one isolated stack per branch.'
      },
      {
        tool: 'any shell',
        does: 'It is all commands: put burrow up in a Makefile, a git hook, or a CI step you already have.'
      }
    ]
  },

  voices: {
    id: 'voices',
    label: 'voices',
    title: 'From people who stopped waiting on CI.',
    lede: 'Fictional engineers, real feelings.',
    quotes: [
      {
        file: 'mira-okafor.txt',
        text: 'We used to ask in Slack which staging was free. Now the answer is the branch name.',
        name: 'Mira Okafor',
        team: 'Platform, Halyard Freight'
      },
      {
        file: 'joris-van-dijk.txt',
        text: '`burrow down` is the most satisfying command I run all week. The preview, the database, the bill: gone.',
        name: 'Joris van Dijk',
        team: 'Frontend, Kettle & Co.'
      },
      {
        file: 'priya-raman.txt',
        text: 'Design review happens on the real thing now, not on screenshots pasted into a doc.',
        name: 'Priya Raman',
        team: 'Design systems, Quayside Bank'
      },
      {
        file: 'tomas-ferreira.txt',
        text: 'Our CI previews took eight minutes. I ran `burrow up` twice because I did not believe the first one.',
        name: 'Tomás Ferreira',
        team: 'Developer experience, Lumen Grid'
      }
    ]
  },

  pricing: {
    id: 'pricing',
    label: 'pricing',
    title: 'The CLI is free. The cloud is cheap.',
    lede: 'Run Burrow on your own machines for nothing, forever. Burrow Cloud runs the previews for you and is in early access.',
    plans: [
      {
        name: 'burrow CLI',
        price: 'free',
        unit: 'open source, MIT',
        features: [
          'unlimited previews on your machines',
          'every command on this page',
          'GitHub, GitLab, Docker, Compose',
          'community support'
        ],
        /** No button: the CLI needs no sign-up. */
        footer: 'install it with the command at the top of the page',
        footerHref: '#install'
      },
      {
        name: 'Burrow Cloud Team',
        price: '$12',
        unit: 'per seat per month',
        features: [
          'everything in the CLI',
          'hosted previews, nothing to run',
          'PR checks and share links',
          '30 days of logs',
          'previews sleep when idle'
        ],
        cta: 'primary'
      },
      {
        name: 'Enterprise',
        price: 'talk to us',
        unit: 'for 51+ seats',
        features: [
          'everything in Team',
          'SSO and SCIM',
          'runs in your cloud account',
          'audit log export',
          '99.9% uptime SLA'
        ],
        cta: 'enterprise'
      }
    ],
    note: 'Early access is free. Team pricing starts when Burrow Cloud opens, and nobody is billed without saying yes first.'
  },

  earlyAccess: {
    id: 'early-access',
    label: 'early access',
    title: 'Burrow Cloud is in early access.',
    lede: 'Hosted previews, PR checks, and share links, without running anything yourself. Sign up once; `burrow cloud status` shows everything that happens after.',
    fields: {
      email: { label: 'email', placeholder: 'you@company.com' },
      github: {
        label: 'github username',
        hint: 'optional',
        placeholder: 'octo-cat'
      },
      teamSize: {
        label: 'team size',
        options: [
          { value: '1', label: '1' },
          { value: '2-10', label: '2–10' },
          { value: '11-50', label: '11–50' },
          { value: '51+', label: '51+' }
        ]
      }
    },
    /** The `burrow cloud status` output beside the form: what happens after signing up. */
    status: {
      title: 'what happens next',
      command: 'burrow cloud status',
      heading: '{b:Burrow Cloud} {dim:· free while in beta}',
      /** The first row follows the form: before, after, or a repeat sign-up. */
      you: {
        label: 'you',
        waiting: '{dim:not on the list yet}',
        ok: '{ok:✓ on the list} as',
        duplicate: '{ok:✓ already on the list} as'
      },
      rows: [
        { label: 'queue', value: 'a few teams a week, first in, first out' },
        { label: 'email', value: 'one, with an invite link, when there is a seat' },
        { label: 'then', value: 'run {b:burrow login}; your previews move to the cloud' },
        { label: 'newsletter', value: 'none. no drip emails, no check-ins' },
        { label: 'billing', value: 'nothing until you pick a plan' }
      ],
      footer: '{ok:✓} the CLI is free and works today'
    },
    sending: 'sending…',
    privacy: {
      text: 'We store what you type here and nothing else.',
      link: 'privacy'
    },
    messages: {
      success: {
        title: "You're on the list.",
        body: 'We will write to {email} when a seat opens. Until then, the CLI is free and works today.'
      },
      duplicate: {
        title: 'Already on the list.',
        body: '{email} signed up before, so there is nothing else to do. We have not forgotten you.'
      },
      rateLimited:
        'That is a lot of sign-ups from one network. Try again in {minutes} minutes.',
      failed:
        'Could not reach the server. Your details are still here: check your connection and press the button again.',
      invalid: 'Check the fields marked above and try again.'
    }
  }
} as const;

export type HomeContent = typeof home;
