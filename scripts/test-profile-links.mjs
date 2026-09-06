import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { resolve, sep } from 'node:path';
import { links, renderLink } from './build-profile-links.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = path => readFileSync(resolve(root, path), 'utf8').replaceAll('\r\n', '\n');
const directory = 'assets/profile-links';
assert.equal(readdirSync(resolve(root, directory)).filter(file => file.endsWith('.svg')).length, 42);
const external = ['https://wenyuchiou.github.io/assets/Wenyu_Chiou_Industry_Resume_EN.pdf', 'mailto:wec324@lehigh.edu', 'https://www.linkedin.com/in/wenyu-chiou', 'https://www.threads.com/@wenyu_chiou'];
// GitHub's themed-picture rewrites theme media to all/none, including compound queries.
function sourceAfterGitHubTheme(anchor, width, theme) {
  for (const [, media, src] of anchor.matchAll(/<source media="([^"]+)" srcset="([^"]+)"/g)) {
    const active = media.includes('(prefers-color-scheme: dark)')
      ? theme === 'dark'
      : media === '(max-width: 1199px)' && width <= 1199;
    if (active) return src;
  }
  return anchor.match(/<img src="([^"]+)"/)[1];
}
for (const locale of ['en', 'zh-TW']) {
  const text = read(locale === 'en' ? 'README.md' : 'README.zh-TW.md');
  const block = text.split('<!-- HIGHLIGHTS:START -->')[1]?.split('<!-- HIGHLIGHTS:END -->')[0];
  assert(block, `${locale}: highlights boundary`);
  assert(!/shields\.io|typing-svg|<script|\bstyle=/.test(block), 'native GitHub layout, no badge wall or scripts');
  assert(block.includes('<table width="100%">'), 'directory occupies the available desktop width');
  assert(!/typing-svg/.test(text), 'no repeated animated tagline');
  assert.equal([...block.matchAll(/<a href=/g)].length, 7, 'seven individually clickable destinations');
  assert(!block.includes('align="center"'), 'category navigation shares a left edge');
  const expectedGroups = locale === 'en'
    ? [['Hiring &amp; resume', ['hire', 'resume']], ['Research &amp; work', ['portfolio', 'scholar']], ['Contact &amp; social', ['email', 'linkedin', 'threads']]]
    : [['招聘履歷', ['hire', 'resume']], ['研究作品', ['portfolio', 'scholar']], ['聯絡社群', ['email', 'linkedin', 'threads']]];
  const headings = [...block.matchAll(/<th width="280" align="left" scope="col">([^<]+)<\/th>/g)].map(match => match[1]);
  const groups = [...block.matchAll(/<td width="280" align="left" valign="top">([\s\S]*?)<\/td>/g)];
  assert.equal(groups.length, 3, 'three equal, top-aligned category columns');
  assert.deepEqual(headings, expectedGroups.map(group => group[0]), 'visible semantic column headers');
  groups.forEach((group, index) => {
    const ids = [...group[1].matchAll(/<img src="assets\/profile-links\/([a-z]+)-/g)].map(match => match[1]);
    assert.deepEqual(ids, expectedGroups[index][1], 'every destination belongs to its semantic category');
  });
  for (const href of external) assert(block.includes(`href="${href}"`), `${locale}: ${href}`);
  const base = `https://wenyuchiou.github.io/${locale === 'en' ? '' : 'zh/'}`;
  assert(block.includes(`href="${base}hire/"`) && block.includes(`href="${base}"`));
  assert(block.includes(`user=vSQ3zT4AAAAJ&amp;hl=${locale}`));
  assert(block.includes('2027') && block.includes('Lehigh University') && block.includes('Bethlehem'));
  assert.equal([...text.matchAll(/img\.shields\.io\/github\/stars\//g)].length, 1, 'retain one live star counter');
  assert(text.indexOf('img.shields.io/github/stars/') > text.indexOf('<!-- OSS:END -->'), 'stars beside the learning project');
  for (const link of links) {
    const anchor = [...block.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].find(match => match[0].includes(`/${link.id}-${locale}-light.svg`))?.[0];
    assert(anchor, `${locale}/${link.id}: independent anchor`);
    assert(anchor.includes('title="') && anchor.includes('alt="'));
    assert(!/\b(?:width|height)=/.test(anchor), 'picture-selected source uses its own unscaled intrinsic size');
    assert(!anchor.includes('alt=""'), 'each linked image has a meaningful accessible name');
    assert(anchor.includes('<picture><source media="(max-width: 1199px)"'), 'width-only compact source comes before theme sources');
    assert(!anchor.includes(') and (prefers-color-scheme:'), 'GitHub rewrites compound theme queries and discards width');
    assert.equal([...anchor.matchAll(/\.svg\?v=columns-3/g)].length, 3, 'both sizes and themes use the current asset version');
    for (const width of [360, 1199, 1200, 1440]) for (const theme of ['light', 'dark']) {
      const suffix = width < 1200 ? 'compact' : theme;
      assert(sourceAfterGitHubTheme(anchor, width, theme).endsWith(`${suffix}.svg?v=columns-3`), `${locale}/${link.id}/${width}/${theme}: correct source after GitHub transformation`);
    }
    const unsafe = anchor.replace('media="(max-width: 1199px)"', 'media="(max-width: 1199px) and (prefers-color-scheme: dark)"');
    assert(sourceAfterGitHubTheme(unsafe, 1440, 'dark').endsWith('-compact.svg?v=columns-3'), 'regression fixture reproduces the rejected desktop-compact bug');
    for (const theme of ['light', 'dark', 'auto']) {
      const compact = theme === 'auto';
      const name = `${link.id}-${locale}-${compact ? 'compact' : theme}.svg`;
      assert(anchor.includes(name), `${name}: referenced by picture`);
      const svg = read(`${directory}/${name}`);
      assert.equal(svg, renderLink(link, locale, theme), `${name}: reproducible generation`);
      assert(Buffer.byteLength(svg) < 4096, 'small self-contained artwork');
      assert(!/<(?:script|image|foreignObject|animate|a)\b|\bon\w+=|https?:\/\//i.test(svg.replace('http://www.w3.org/2000/svg', '')), 'no runtime, embedded links or remote dependencies');
      assert(svg.includes('<title id="title">'));
      assert(svg.includes(`viewBox="0 0 ${compact ? '60 80' : '180 44'}"`));
      assert(svg.includes(`font-size="${compact ? 14 : 16}"`), 'mobile/desktop retain explicit readable label sizes');
      if (compact) assert(svg.includes('@media(prefers-color-scheme:dark)') && svg.includes('--ink:#24292f') && svg.includes('--ink:#f0f3f6'), 'compact theme follows embedding color scheme');
      assert(svg.includes('ISC License') && svg.includes('Lucide Contributors'));
    }
  }
}
// Reproduce a fresh Windows checkout without mutating the repository's files.
const temporary = mkdtempSync(resolve(tmpdir(), 'profile-links-crlf-'));
assert(temporary.startsWith(resolve(tmpdir()) + sep));
try {
  cpSync(resolve(root, directory), resolve(temporary, directory), { recursive: true });
  cpSync(resolve(root, 'scripts'), resolve(temporary, 'scripts'), { recursive: true });
  for (const file of readdirSync(resolve(temporary, directory))) {
    const target = resolve(temporary, directory, file);
    writeFileSync(target, readFileSync(target, 'utf8').replaceAll('\r\n', '\n').replaceAll('\n', '\r\n'));
  }
  const result = spawnSync(process.execPath, ['scripts/build-profile-links.mjs', '--check'], { cwd: temporary, encoding: 'utf8', timeout: 10000 });
  assert.ifError(result.error);
  assert.equal(result.status, 0, `Fresh CRLF checkout remains reproducible: ${result.stderr}`);
} finally { rmSync(temporary, { recursive: true, force: true }); }
console.log('PASS: 42 reproducible SVGs including CRLF checkout, 14 independently linked entries, mobile/desktop and locale/theme parity, live stars retained.');
