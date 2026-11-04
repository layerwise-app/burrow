#!/usr/bin/env node
// Renders a 1200×630 share image for every public page into public/og/.
//
//   pnpm og-images
//
// Run it after changing a page title or adding a changelog release. It reads
// the same content files the site uses and renders them with headless Chrome
// (Playwright, `channel: 'chrome'`), so Google Chrome must be installed.

import { readdir, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const load = (file) => import(pathToFileURL(path.join(root, file)).href);

const { siteConfig } = await load('src/site.config.ts');
const { home } = await load('src/content/home.ts');
const { privacy, terms } = await load('src/content/legal.ts');

const changelogDir = path.join(root, 'src/content/changelog');
const releases = [];
for (const file of await readdir(changelogDir)) {
  if (!file.endsWith('.ts')) continue;
  releases.push((await load(`src/content/changelog/${file}`)).default);
}
const semver = (v) => v.split('.').map(Number);
releases.sort((a, b) => {
  const [x, y] = [semver(a.version), semver(b.version)];
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return y[i] - x[i];
  return 0;
});
const latest = releases[0];

const font = await readFile(path.join(root, 'public', siteConfig.font.files[0].src));
const fontUrl = `data:font/woff2;base64,${font.toString('base64')}`;
const c = siteConfig.colors;
const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => `&#${ch.charCodeAt(0)};`);
const tone = (s) =>
  esc(s).replace(/\{hl:([^}]*)\}/g, `<span style="color:${c.magenta}">$1</span>`);
const code = (s) => esc(s).replace(/`([^`]+)`/g, `<b style="color:${c.brightWhite}">$1</b>`);

function page({ path: pagePath, kicker, title, accent, lines = [], footer }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face{font-family:Mono;src:url(${fontUrl}) format('woff2');font-weight:100 800}
  *{margin:0;padding:0;box-sizing:border-box}
  pre{font-family:inherit}
  html,body{width:1200px;height:630px;background:${c.black};color:${c.white};font-family:Mono,monospace;font-variant-ligatures:none;-webkit-font-smoothing:antialiased}
  .frame{position:absolute;inset:28px 40px 70px;display:grid;grid-template-columns:1ch 1fr 1ch;grid-template-rows:auto 1fr auto;font-size:20px;line-height:1.5;color:${c.brightBlack}}
  .h{overflow:hidden;white-space:pre}
  .v{overflow:hidden;white-space:pre}
  .body{padding:22px 3ch 10px;display:flex;flex-direction:column;gap:18px;color:${c.white}}
  .top{display:flex;justify-content:space-between;font-size:20px;color:${c.white}}
  .top b{color:${c.brightWhite}}
  .wm{font-size:22px;line-height:1.32;font-weight:800;color:${c.brightWhite};white-space:pre;margin-top:8px}
  .kicker{font-size:20px;letter-spacing:.06em;text-transform:uppercase;color:${c.white}}
  h1{font-size:${title.length > 44 ? 50 : 58}px;line-height:1.12;font-weight:750;letter-spacing:-.035em;color:${c.brightWhite};max-width:22ch}
  h1 .a{color:${c.cyan}}
  .lines{font-size:21px;line-height:1.45;color:${c.white};display:grid;gap:4px;max-width:58ch}
  .bar{position:absolute;left:0;right:0;bottom:0;height:44px;display:flex;align-items:stretch;font-size:19px;border-top:1px solid ${c.brightBlack}}
  .bar span{display:flex;align-items:center;padding:0 1.5ch}
  .mode{background:${c.white};color:${c.black};font-weight:700}
  .path{color:${c.white}}
  .grow{flex:1}
  .k{color:${c.magenta};font-weight:700;margin-right:.6ch}
  .cta{background:${c.magenta};color:${c.black};font-weight:700}
  </style></head><body>
  <div class="frame">
    <span>┌</span><span class="h">${'─'.repeat(200)}</span><span>┐</span>
    <span class="v">${'│\n'.repeat(40)}</span>
    <div class="body">
      <div class="top"><b>${esc(siteConfig.command.toUpperCase())}(1)</b><span>${esc(siteConfig.company)} ${esc(siteConfig.footer.manual)}</span></div>
      <pre class="wm">${siteConfig.wordmark.map(tone).join('\n')}</pre>
      ${kicker ? `<p class="kicker">${esc(kicker)}</p>` : ''}
      <h1>${accent ? `<span class="a">${esc(accent)}</span> ` : ''}${esc(title)}</h1>
      ${lines.length ? `<div class="lines">${lines.map((l) => `<p>${code(l)}</p>`).join('')}</div>` : ''}
    </div>
    <span class="v">${'│\n'.repeat(40)}</span>
    <span>└</span><span class="h">${'─'.repeat(200)}</span><span>┘</span>
  </div>
  <div class="bar">
    <span class="mode">${esc(siteConfig.command)} ${esc(latest.version)}</span>
    <span class="path">${esc(pagePath)}</span>
    <span class="grow"></span>
    <span>${esc(footer ?? siteConfig.tagline)}</span>
  </div>
  </body></html>`;
}

const counts = (r) =>
  ['feat', 'fix', 'perf']
    .map((t) => [t, r.changes.filter((ch) => ch.type === t).length])
    .filter(([, n]) => n > 0)
    .map(([t, n]) => `${n} ${t}`)
    .join(' · ');

const cards = [
  {
    name: 'home',
    path: '~/',
    kicker: `v${latest.version} · open source · ${siteConfig.license}`,
    title: home.hero.title,
    lines: ['$ burrow up', `✓ https://feat-checkout.storefront.burrow.run`]
  },
  {
    name: 'changelog',
    path: '~/changelog',
    kicker: `git log v${releases.at(-1).version}..v${latest.version}`,
    title: 'Changelog',
    lines: releases.slice(0, 3).map((r) => `v${r.version}  ${r.title}`)
  },
  ...releases.map((r) => ({
    name: `changelog-${r.version}`,
    path: `~/changelog/${r.version}`,
    kicker: `${r.date} · ${counts(r)}`,
    accent: `v${r.version}`,
    title: r.title,
    lines: [r.summary]
  })),
  { name: 'privacy', path: '~/privacy', kicker: `man 7 ${siteConfig.command}-privacy`, title: privacy.title, lines: [privacy.description] },
  { name: 'terms', path: '~/terms', kicker: `man 7 ${siteConfig.command}-terms`, title: terms.title, lines: [terms.description] }
];

const outDir = path.join(root, 'public/og');
await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const card of cards) {
  await tab.setContent(page(card), { waitUntil: 'load' });
  await tab.evaluate(() => document.fonts.ready);
  const file = path.join(outDir, `${card.name}.png`);
  await tab.screenshot({ path: file, type: 'png' });
  console.log(`public/og/${card.name}.png`);
}
await browser.close();
