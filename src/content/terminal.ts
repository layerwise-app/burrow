// The terminal on the home page: what it types on load, what each command
// prints, and the sample previews it knows about. Rewrite this file to demo a
// different CLI. Everything runs in the visitor's browser; nothing is sent.
//
// Output lines use `{tone:text}` markup: dim, b (bold), ok (green),
// warn (yellow), link (cyan), hl (magenta). See src/lib/terminal/types.ts.

import { padEnd } from '~/lib/terminal/markup';
import type {
  CommandContext,
  Preview,
  Step,
  TerminalScript
} from '~/lib/terminal/types';

const CURRENT_BRANCH = 'feat-checkout';

/** Below this many columns (phones), tables switch to a narrow layout. */
const NARROW = 60;
const isNarrow = (ctx: CommandContext) => ctx.columns < NARROW;
/** URLs are indented when there is room. */
const indent = (ctx: CommandContext) => (isNarrow(ctx) ? '' : '  ');

const line = (text: string, delay = 0): Step => ({ type: 'line', text, delay });

const findPreview = (ctx: CommandContext, branch: string) =>
  ctx.state.previews.find((preview) => preview.branch === branch);

/** Shared reply for commands that need a branch that is not running. */
function missingBranch(ctx: CommandContext, command: string): Step[] {
  const [branch] = ctx.args;
  if (!branch) {
    return [
      line(`{warn:!} which branch? {b:burrow ${command} <branch>}`),
      line(
        `{dim:running:} ${ctx.state.previews.map((p) => p.branch).join('  ') || '{dim:nothing}'}`
      )
    ];
  }
  return [
    line(`{warn:!} no preview for {b:${branch}}`),
    line('{dim:see} {b:burrow ls} {dim:for running previews}')
  ];
}

type LogLine = {
  time: string;
  service: string;
  message: string;
  /** Request lines: HTTP status (or a result) and duration. */
  status?: string;
  ms?: string;
  note?: string;
};

/** Sample log lines per branch for `burrow logs`. */
const LOGS: Record<string, LogLine[]> = {
  main: [
    { time: '09:12:04', service: 'web', message: '▸ next start -p 3000' },
    { time: '09:12:05', service: 'web', message: 'ready on :3000' },
    { time: '09:14:31', service: 'web', message: 'GET /', status: '200', ms: '38ms' },
    { time: '09:14:33', service: 'web', message: 'GET /products/kettle', status: '200', ms: '61ms' },
    { time: '09:20:02', service: 'db', message: 'checkpoint complete: wrote 96 buffers' }
  ],
  'feat-checkout': [
    { time: '14:02:11', service: 'web', message: '▸ next start -p 3000' },
    { time: '14:02:12', service: 'web', message: 'ready on :3000' },
    { time: '14:02:14', service: 'web', message: 'GET /', status: '200', ms: '41ms' },
    { time: '14:02:19', service: 'web', message: 'GET /checkout', status: '200', ms: '88ms' },
    { time: '14:02:19', service: 'web', message: 'POST /api/cart', status: '201', ms: '23ms' },
    { time: '14:02:20', service: 'web', message: '{warn:warn} stripe: test key (sk_test_…)' },
    { time: '14:02:31', service: 'db', message: 'checkpoint complete: wrote 112 buffers' }
  ],
  'fix-auth-redirect': [
    { time: '09:40:51', service: 'web', message: '▸ next start -p 3000' },
    { time: '09:41:07', service: 'web', message: 'GET /login', status: '200', ms: '35ms' },
    { time: '09:41:12', service: 'web', message: 'POST /api/session', status: '302', ms: '44ms', note: '→ /account' },
    { time: '09:41:12', service: 'web', message: 'GET /account', status: '200', ms: '52ms' },
    { time: '09:41:12', service: 'web', message: 'redirect loop check', status: 'passed' }
  ],
  'exp-new-onboarding': [
    { time: '16:03:20', service: 'web', message: '▸ next start -p 3000' },
    { time: '16:03:28', service: 'web', message: 'GET /welcome', status: '200', ms: '73ms' },
    { time: '16:03:41', service: 'web', message: 'GET /welcome/step-2', status: '200', ms: '49ms' },
    { time: '16:33:41', service: 'burrow', message: 'idle for 30m, going to sleep' }
  ]
};

/** One log line; phones drop the timestamp and tighten the columns. */
function logLine(log: LogLine, narrow: boolean) {
  const result = log.status
    ? `${padEnd(log.message, narrow ? 18 : 20)}${narrow ? ' ' : ''}{ok:${log.status}}` +
      (log.ms ? `${narrow ? ' ' : '   '}${log.ms}` : '') +
      (log.note ? `${narrow ? ' ' : '  '}${log.note}` : '')
    : log.message;
  return narrow
    ? `${padEnd(log.service, 4)} ${result}`
    : `{dim:${log.time}}  ${padEnd(log.service, 4)} ${result}`;
}

export const terminal: TerminalScript = {
  program: 'burrow',
  title: '~/code/storefront — zsh',
  prompt: `{dim:~/code/storefront} {hl:${CURRENT_BRANCH}} {b:$} `,
  introCommand: 'burrow up',
  welcome: [],
  urlPattern: 'https://{branch}.storefront.burrow.run',

  initialState: {
    previews: [
      { branch: 'main', status: 'up', age: '3d', commit: '8c1e7a2' },
      { branch: 'fix-auth-redirect', status: 'up', age: '5h', commit: 'e41b09d' },
      { branch: 'exp-new-onboarding', status: 'asleep', age: '2d', commit: '57fa3c8' }
    ]
  },

  notFound: [
    'zsh: command not found: {b:{cmd}}',
    '{dim:this shell only knows burrow. try} {b:help}'
  ],
  unknownSubcommand: [
    '{warn:!} burrow: unknown command {b:{cmd}}',
    '{dim:type} {b:help} {dim:to see what burrow can do}'
  ],

  commands: {
    help: {
      usage: 'help',
      summary: 'show this list',
      run: (ctx) => {
        const rows: [string, string][] = Object.entries(terminal.commands)
          .filter(([, cmd]) => cmd.usage && cmd.summary)
          .map(([, cmd]) => [cmd.usage!, cmd.summary!]);
        if (isNarrow(ctx)) {
          // Phones: each summary goes under its command.
          return {
            steps: [
              line(`{b:burrow ${ctx.version}} {dim:— previews for every branch}`),
              ...rows.flatMap(([usage, summary]) => [
                line(`  {b:${usage}}`),
                line(`      {dim:${summary}}`)
              ]),
              line(''),
              line('{dim:tab completes · ↑ ↓ history}'),
              line('{dim:ctrl+c stops · ctrl+l clears}'),
              line('{dim:runs in your browser. nothing is sent.}')
            ]
          };
        }
        return {
          steps: [
            line(`{b:burrow ${ctx.version}} {dim:— a preview environment for every branch}`),
            line(''),
            ...rows.map(([usage, summary]) =>
              line(`  ${padEnd(`{b:${usage}}`, 24)}{dim:${summary}}`)
            ),
            line(''),
            line('{dim:tab completes · ↑ ↓ history · ctrl+c stops · ctrl+l clears}'),
            line('{dim:this demo runs in your browser. nothing is sent anywhere.}')
          ]
        };
      }
    },

    'burrow up': {
      usage: 'burrow up',
      summary: 'build this branch, print its URL',
      run: (ctx) => {
        const existing = findPreview(ctx, CURRENT_BRANCH);
        const url = ctx.url(CURRENT_BRANCH);
        if (existing) {
          return {
            steps: [
              line(`{dim:burrow ${ctx.version}} · {hl:${CURRENT_BRANCH}} @ 3f9c2e1`),
              line('→ no changes, reusing the last snapshot', 260),
              line('→ health    GET /  {ok:200}  96ms', 420),
              line(`{ok:✓} preview ready in {b:1.2s}`, 200),
              line(`${indent(ctx)}{link:${url}}`)
            ]
          };
        }
        const preview: Preview = {
          branch: CURRENT_BRANCH,
          status: 'up',
          age: 'now',
          commit: '3f9c2e1'
        };
        return {
          state: { previews: [...ctx.state.previews, preview] },
          steps: [
            line(`{dim:burrow ${ctx.version}} · {hl:${CURRENT_BRANCH}} @ 3f9c2e1`, 180),
            line('→ detected  next.js 15 · pnpm · node 22', 520),
            line('→ config    1 service · 1 seed · 4 env vars', 360),
            line('→ building image', 300),
            {
              type: 'progress',
              label: '  ',
              duration: 2200,
              done: '  {ok:✓} built in {b:31.4s} {dim:· cache hit 82%}'
            },
            line('→ uploading layers', 260),
            line('    1/5  base     {dim:cached}', 140),
            line('    2/5  deps     {dim:cached}', 110),
            line('    3/5  app      14.2 MB', 380),
            line('    4/5  public    3.1 MB', 240),
            line('    5/5  seed      0.4 MB', 180),
            line('→ snapshot  {dim:sha256:9e1c4b…a40f}', 420),
            line('→ health    GET /  {ok:200}  118ms', 640),
            line('{warn:!} STRIPE_KEY is a test key (test mode)', 260),
            line(`{ok:✓} preview ready in {b:38.2s}`, 320),
            line(`${indent(ctx)}{link:${url}}`, 60)
          ]
        };
      }
    },

    'burrow ls': {
      usage: 'burrow ls',
      summary: 'list running previews',
      run: (ctx) => {
        const { previews } = ctx.state;
        if (previews.length === 0) {
          return {
            steps: [
              line('{dim:no previews running.}'),
              line('{dim:run} {b:burrow up} {dim:on a branch to make one.}')
            ]
          };
        }
        const asleep = previews.filter((p) => p.status === 'asleep').length;
        const host = (branch: string) => ctx.url(branch).replace(/^https?:\/\//, '');
        // Phones leave out the HOST column and print the pattern once.
        const narrow = isNarrow(ctx);
        return {
          steps: [
            line(
              `{dim:${padEnd('BRANCH', 20)}${padEnd('STATUS', 9)}${narrow ? 'AGE' : `${padEnd('AGE', 5)}HOST`}}`
            ),
            ...previews.map((p) =>
              line(
                padEnd(p.branch === CURRENT_BRANCH ? `{hl:${p.branch}}` : p.branch, 20) +
                  padEnd(p.status === 'up' ? '{ok:● up}' : '{dim:○ asleep}', 9) +
                  (narrow ? `{dim:${p.age}}` : padEnd(`{dim:${p.age}}`, 5) + `{link:${host(p.branch)}}`)
              )
            ),
            line(
              `{dim:${previews.length} preview${previews.length === 1 ? '' : 's'}${
                asleep ? ` · ${asleep} asleep, wakes on request` : ''
              }}`
            ),
            ...(narrow ? [line(`{dim:each at} {link:${host('<branch>')}}`)] : [])
          ]
        };
      }
    },

    'burrow logs': {
      usage: 'burrow logs <branch>',
      summary: 'show recent logs',
      completeBranch: true,
      run: (ctx) => {
        const preview = findPreview(ctx, ctx.args[0] ?? '');
        if (!preview) return { steps: missingBranch(ctx, 'logs') };
        const lines = LOGS[preview.branch] ?? LOGS.main;
        return {
          steps: [
            ...(preview.status === 'asleep'
              ? [line(`→ waking {b:${preview.branch}} … up in 2.1s`, 600)]
              : []),
            ...lines.map((log, i) => line(logLine(log, isNarrow(ctx)), i === 0 ? 120 : 70)),
            line(`{dim:— end of logs · add -f to follow}`, 80)
          ],
          state:
            preview.status === 'asleep'
              ? {
                  previews: ctx.state.previews.map((p) =>
                    p.branch === preview.branch ? { ...p, status: 'up' } : p
                  )
                }
              : undefined
        };
      }
    },

    'burrow share': {
      usage: 'burrow share <branch>',
      summary: 'make a read-only link',
      completeBranch: true,
      run: (ctx) => {
        const preview = findPreview(ctx, ctx.args[0] ?? '');
        if (!preview) return { steps: missingBranch(ctx, 'share') };
        const token = preview.commit.slice(0, 4) + 'mx9q';
        return {
          steps: [
            line(`{ok:✓} share link for {b:${preview.branch}} {dim:· 72h}`, 380),
            line(`${indent(ctx)}{link:${ctx.url(preview.branch)}/?share=${token}}`),
            line('{dim:read-only · no account needed to view}')
          ]
        };
      }
    },

    'burrow down': {
      usage: 'burrow down <branch>',
      summary: 'stop a preview, delete its data',
      completeBranch: true,
      run: (ctx) => {
        const preview = findPreview(ctx, ctx.args[0] ?? '');
        if (!preview) return { steps: missingBranch(ctx, 'down') };
        const previews = ctx.state.previews.filter((p) => p !== preview);
        return {
          state: { previews },
          steps: [
            line(`→ stopping {b:${preview.branch}}  {dim:done}`, 420),
            line(`→ deleting snapshot and data  {dim:done}`, 380),
            line(`{ok:✓} ${preview.branch} is gone. ${previews.length} left.`, 200)
          ]
        };
      }
    },

    clear: {
      usage: 'clear',
      summary: 'clear the screen',
      run: () => ({ steps: [{ type: 'clear' }] })
    },

    // Not listed by `help`, but people type them.
    burrow: { run: (ctx) => terminal.commands.help.run(ctx) },
    'burrow help': { run: (ctx) => terminal.commands.help.run(ctx) },
    'burrow --help': { run: (ctx) => terminal.commands.help.run(ctx) },
    'burrow --version': {
      run: (ctx) => ({ steps: [line(`burrow ${ctx.version} {dim:(tunnelworks, rotterdam)}`)] })
    },
    'burrow version': {
      run: (ctx) => ({ steps: [line(`burrow ${ctx.version} {dim:(tunnelworks, rotterdam)}`)] })
    },
    ls: {
      run: () => ({
        steps: [line('burrow.toml  compose.yaml  db/  package.json  pnpm-lock.yaml  src/')]
      })
    },
    pwd: { run: () => ({ steps: [line('/home/you/code/storefront')] }) },
    whoami: { run: () => ({ steps: [line('you, reading a landing page')] }) },
    sudo: {
      run: () => ({
        steps: [line('burrow never needs root. neither does this web page.')]
      })
    },
    exit: {
      run: () => ({
        steps: [line('there is no exit, only {b:burrow down}.')]
      })
    },
    'git push': {
      run: () => ({
        steps: [
          line('Everything up-to-date', 300),
          line('{dim:with Burrow Cloud, a push builds the preview for you.}')
        ]
      })
    }
  }
};
