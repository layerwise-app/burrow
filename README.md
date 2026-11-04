<a href="https://layerwise.app"><picture><source media="(prefers-color-scheme: dark)" srcset="https://layerwise.app/powered-by-dark.png"><img src="https://layerwise.app/powered-by.png" alt="Powered by Layerwise" width="174" height="28"></picture></a>

# Burrow

A landing page template for a command-line tool, built to look like a
terminal. The sample product is **Burrow**, an open-source CLI by the
fictional company Tunnelworks that gives every git branch its own preview URL.
People, companies, and quotes are all made up.

Pages: Home (`/`), Changelog (`/changelog` and one page per release),
Privacy, Terms, and a 404 page. `/install.sh` and `/install.ps1` serve the
install commands shown in the hero; both only print a note and exit.

Built with TanStack Start, React, Tailwind CSS, and Cloudflare Workers, with
the Layerwise database and email services.

## Change the copy

Ask the Layerwise agent, or edit these files:

| What                                                               | Where                            |
| ------------------------------------------------------------------ | -------------------------------- |
| Company and product name, tagline, navigation, button labels, social links, colors, font, wordmark, `ownerEmail` | `src/site.config.ts` |
| Every section of the home page, in page order: headline, install commands, diagram stages, `burrow.toml`, benchmark numbers, integrations, quotes, pricing, form labels and messages | `src/content/home.ts` |
| What the hero terminal knows: prompt, commands, their output, sample previews | `src/content/terminal.ts`        |
| Changelog releases, one file each                                  | `src/content/changelog/*.ts`     |
| Privacy and Terms                                                  | `src/content/legal.ts`           |
| Install scripts at `/install.sh` and `/install.ps1`                 | `src/routes/install[.]sh.ts`, `src/routes/install[.]ps1.ts` |

In copy, wrap code in backticks. In the terminal and wordmark, `{ok:…}`,
`{warn:…}`, `{link:…}`, `{hl:…}`, `{dim:…}`, and `{b:…}` color a span green,
yellow, cyan, magenta, dim, or bold.

After changing a page title, a description, or the latest version, run
`pnpm og-images` to redraw the share images in `public/og/`.

## Add a changelog release

1. Copy the newest file in `src/content/changelog/`, like `2.4.0.ts`, to a
   file named after the new version, like `2.5.0.ts`.
2. Change `version` (it must match the file name), `date`, `commit`, `title`,
   `summary`, and `changes`. Each change has a `type` (`feat`, `fix`, or
   `perf`), a one-line `text`, and an optional longer `detail`.
3. Run `pnpm og-images` to draw the release's share image.

The release then appears at the top of `/changelog`, gets its own page at
`/changelog/2.5.0`, and is added to `/sitemap.xml`. The newest release also
sets the version shown in the hero, the terminal, the footer, and the
structured data.

## Replace a drawn screen with a screenshot or video

The hero terminal is a React component drawn in code. It sits behind
`<ScreenSlot name='heroTerminal'>`, so it can be swapped without touching the
page.

**Screenshot:**

1. `pnpm add-images path/to/screenshot.png --name hero-terminal`
   writes 800, 1600, and 2880 px WebP files to `public/images/` and records
   their size and a blur placeholder in `src/content/images.json`. PNG, JPEG,
   and WebP work; GIFs are copied as they are; SVG is rejected.
2. In `src/content/screens.ts`, set
   `heroTerminal: { kind: 'image', image: 'hero-terminal', alt: 'What the screenshot shows' }`.

**Video:** put the file in `public/videos/`, then set
`heroTerminal: { kind: 'video', src: '/videos/demo.mp4', poster: '/images/hero-terminal-1600.webp', alt: '…', width: 1600, height: 1000 }`.
Videos play muted and pause when off screen.

Set it back to `{ kind: 'drawn' }` to return to the working terminal.

## Fonts and colors

- **Colors:** `colors` in `src/site.config.ts` holds the 16 ANSI colors, the
  whole palette. Green means success, yellow warnings, cyan links, and magenta
  "you are here" (the cursor, focus, the current section). Keep body text
  (`white` on `black`) at 4.5:1 contrast or more.
- **Font:** the site uses one monospace family. To change it, put the
  `.woff2` files and their license in `public/fonts/`, then update `font` in
  `src/site.config.ts`. Use a font whose box-drawing characters connect, and
  list it below.

| Font | License | Files |
| ---- | ------- | ----- |
| [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono) 2.304, variable, weights 100–800 | SIL Open Font License 1.1 | `public/fonts/JetBrainsMono-Variable.woff2`, `public/fonts/JetBrainsMono-OFL.txt` |

The font file is subset to Latin, punctuation, arrows, box drawing, and block
characters to keep it small. Other characters fall back to the system
monospace font.

## Early access form

The form at the bottom of the home page saves each sign-up to the database.

- **Where submissions show up:** in Layerwise, open the project's
  **Database** panel and choose the `early_access_signups` table (email,
  GitHub username, team size, date). `signup_attempts` holds the rate limit's
  hashed visitor keys (never IP addresses), and `app_secrets` the salt for
  them.
- **Email me each sign-up:** set `ownerEmail` in `src/site.config.ts` to
  your address. Each new sign-up is then emailed to you, up to 100 a day;
  past that, sign-ups are still saved. Visitors are never emailed. In the
  local preview the email lands in **Email → Local** instead of being sent,
  and real email works after the project is published.
- **Rules:** the server checks every field, ignores bots that fill the hidden
  field, allows 5 submissions per visitor per hour, and saves each email once
  (a second try says it's already on the list). The rules are in
  `src/lib/signup-rules.ts` and `src/server/signup-service.ts`, with tests
  next to them.

## Logo and icons

`public/logo.svg` is the logo: a lowercase b in heavy box-drawing strokes with
the magenta cursor in its bowl. `public/logo.png` is a 1024 px copy. After
changing `logo.svg`, the product name, or the colors, run `pnpm favicons` to
redraw `logo.png`, every favicon, the Android and Apple touch icons, and
`public/site.webmanifest`.

## Commands

```bash
pnpm dev                      # Layerwise runs this for you
pnpm check-types
pnpm lint
pnpm test                     # form rules and the terminal engine
pnpm build
pnpm add-images <file…>       # see "Replace a drawn screen"
pnpm og-images                # share images, needs Google Chrome
pnpm favicons                 # icons from public/logo.svg
pnpm db:generate --name <change>
pnpm db:migrate
```

`db:migrate` applies migrations to the local database. Layerwise applies the
same migrations to the production database when the project is published.

## Important files

- `src/routes/`: pages, `/install.sh`, `/install.ps1`, `/sitemap.xml`, `/robots.txt`
- `src/components/home/`: the home page sections
- `src/components/tui/`: boxes, rules, tables, and the wordmark, drawn with
  box-drawing characters
- `src/components/layout/`: header, status bar, keyboard shortcuts, footer
- `src/lib/terminal/`: the hero terminal's command engine (runs in the
  browser; nothing is sent anywhere)
- `src/lib/site.ts`: indexed address and `sitemapPaths` for search engines
- `src/db/schema.ts`: database tables
- `src/components/ui/`: shadcn/ui components from the Layerwise starter. The
  site doesn't use them, so Tailwind skips them (see the top of
  `src/styles/app.css`); delete that `@source not` line before using one.
