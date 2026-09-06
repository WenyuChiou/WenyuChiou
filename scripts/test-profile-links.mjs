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
assert.equal(readdirSync(resolve(root, directory)).filter(file => file.endsWith('.svg')).length, 28);
const external = ['https://wenyuchiou.github.io/assets/Wenyu_Chiou_Industry_Resume_EN.pdf', 'mailto:wec324@lehigh.edu', 'https://www.linkedin.com/in/wenyu-chiou', 'https://www.threads.com/@wenyu_chiou'];
for (const locale of ['en', 'zh-TW']) {
  const text = read(locale === 'en' ? 'README.md' : 'README.zh-TW.md');
  const block = text.split('<!-- HIGHLIGHTS:START -->')[1]?.split('<!-- HIGHLIGHTS:END -->')[0];
  assert(block, `${locale}: highlights boundary`);
  assert(!/shields\.io|typing-svg|<table|<script|\bstyle=/.test(block), 'native wrapping, no badge wall or scripts');
  assert(!/typing-svg/.test(text), 'no repeated animated tagline');
  assert.equal([...block.matchAll(/<a href=/g)].length, 7, 'seven individually clickable destinations');
  assert(!block.includes('align="center"'), 'category navigation shares a left edge');
  const expectedGroups = locale === 'en'
    ? [['Hiring &amp; resume', ['hire', 'resume']], ['Research &amp; work', ['portfolio', 'scholar']], ['Contact &amp; social', ['email', 'linkedin', 'threads']]]
    : [['招聘與履歷', ['hire', 'resume']], ['研究與作品', ['portfolio', 'scholar']], ['聯絡與社群', ['email', 'linkedin', 'threads']]];
  const groups = [...block.matchAll(/<h3>([^<]+)<\/h3>\s*<p>([\s\S]*?)<\/p>/g)];
  assert.equal(groups.length, 3, 'three visibly named categories');
  groups.forEach((group, index) => {
    assert.equal(group[1], expectedGroups[index][0]);
    const ids = [...group[2].matchAll(/<img src="assets\/profile-links\/([a-z]+)-/g)].map(match => match[1]);
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
    assert(anchor.includes('width="180" height="44"'), 'compact but touch-accessible target');
    assert.equal([...anchor.matchAll(/\.svg\?v=grouped-1/g)].length, 2, 'both themes use the current asset version');
    for (const theme of ['light', 'dark']) {
      const name = `${link.id}-${locale}-${theme}.svg`;
      assert(anchor.includes(name), `${name}: referenced by picture`);
      const svg = read(`${directory}/${name}`);
      assert.equal(svg, renderLink(link, locale, theme), `${name}: reproducible generation`);
      assert(Buffer.byteLength(svg) < 4096, 'small self-contained artwork');
      assert(!/<(?:script|image|foreignObject|animate|a)\b|\bon\w+=|https?:\/\//i.test(svg.replace('http://www.w3.org/2000/svg', '')), 'no runtime, embedded links or remote dependencies');
      assert(svg.includes('font-size="16"') && svg.includes('<title id="title">'));
      assert(svg.includes('viewBox="0 0 180 44"') && svg.includes('<text x="46" y="27"'), 'horizontal icon and text, shared baseline');
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
console.log('PASS: 28 reproducible SVGs including CRLF checkout, 14 independently linked entries, locale/theme parity, live stars retained.');
