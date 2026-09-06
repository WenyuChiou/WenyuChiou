import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const directory = resolve(root, 'assets/profile-links');
const license = readFileSync(resolve(directory, 'LICENSE.txt'), 'utf8').replaceAll('\r\n', '\n').trim();
const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');

// Lucide 0.468.0 icon geometry; attribution is embedded in each distributable SVG.
export const links = [
  { id: 'hire', labels: ['Recruiter brief', '招聘摘要'], color: 'teal', icon: '<path d="M12 12h.01M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M22 13a18.15 18.15 0 0 1-20 0"/><rect width="20" height="14" x="2" y="6" rx="2"/>' },
  { id: 'resume', labels: ['Resume', '英文履歷'], color: 'ochre', icon: '<path d="M14 2v4a2 2 0 0 0 2 2h4M15 18a3 3 0 1 0-6 0M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><circle cx="12" cy="13" r="2"/>' },
  { id: 'email', labels: ['Email', '電子郵件'], color: 'coral', icon: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>' },
  { id: 'linkedin', labels: ['LinkedIn', 'LinkedIn'], color: 'blue', icon: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>' },
  { id: 'portfolio', labels: ['Portfolio', '個人網站'], color: 'teal', icon: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/>' },
  { id: 'scholar', labels: ['Google Scholar', 'Google Scholar'], color: 'blue', icon: '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0zM22 10v6M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>' },
  { id: 'threads', labels: ['Threads', 'Threads'], color: 'neutral', icon: '<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>' },
];

const palettes = {
  light: { ink: '#24292f', teal: ['#e3f4ef', '#a6d3c6', '#176858'], ochre: ['#fbefcf', '#e2c47c', '#80600b'], coral: ['#fce8e3', '#e7b3a4', '#a04434'], blue: ['#e6effb', '#b4c9e8', '#225c9a'], neutral: ['#eff1f3', '#c8cdd4', '#3c4755'] },
  dark: { ink: '#f0f3f6', teal: ['#203d36', '#112b25', '#86d8bd'], ochre: ['#40381f', '#292410', '#edd087'], coral: ['#482e29', '#2d1c19', '#f3ad9a'], blue: ['#25364e', '#172539', '#a2c6f2'], neutral: ['#333b45', '#21272e', '#d4dce7'] },
};

export function renderLink(link, locale, theme) {
  const compact = theme === 'auto';
  const colors = palettes[compact ? 'light' : theme];
  const [face, depth, stroke] = compact ? ['var(--face)', 'var(--depth)', 'var(--stroke)'] : colors[link.color];
  const ink = compact ? 'var(--ink)' : colors.ink;
  const variables = mode => {
    const palette = palettes[mode];
    const [face, depth, stroke] = palette[link.color];
    return `--face:${face};--depth:${depth};--stroke:${stroke};--ink:${palette.ink}`;
  };
  const label = escape(link.labels[locale === 'en' ? 0 : 1]);
  const lines = label.split(' ');
  const icon = `<g transform="translate(2 5)"><rect x="2" y="3" width="32" height="32" rx="6" fill="${depth}"/><rect width="32" height="32" rx="6" fill="${face}" stroke="${stroke}"/><g transform="translate(6 6) scale(.833333)" fill="none" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${link.icon}</g></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${compact ? 60 : 180}" height="${compact ? 80 : 44}" viewBox="0 0 ${compact ? '60 80' : '180 44'}" role="img" aria-labelledby="title" lang="${locale}">
<!-- ${license} -->
<title id="title">${label}</title>
${compact ? `<style>:root{${variables('light')}}@media(prefers-color-scheme:dark){:root{${variables('dark')}}}</style>\n` : ''}${icon}
${compact ? lines.map((line, index) => `<text x="2" y="${56 + index * 18}" fill="${ink}" font-family="'Atkinson Hyperlegible Next', 'Segoe UI', 'Microsoft JhengHei', sans-serif" font-size="14" font-weight="500">${line}</text>`).join('\n') : `<text x="46" y="27" fill="${ink}" font-family="'Atkinson Hyperlegible Next', 'Segoe UI', 'Microsoft JhengHei', sans-serif" font-size="16" font-weight="500">${label}</text>`}
</svg>
`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  if (!check) mkdirSync(directory, { recursive: true });
  for (const link of links) for (const locale of ['en', 'zh-TW']) for (const theme of ['light', 'dark', 'auto']) {
    const path = resolve(directory, `${link.id}-${locale}-${theme === 'auto' ? 'compact' : theme}.svg`);
    const svg = renderLink(link, locale, theme);
    if (check) {
      if (readFileSync(path, 'utf8').replaceAll('\r\n', '\n') !== svg) throw new Error(`Stale link asset: ${path}`);
    } else writeFileSync(path, svg);
  }
  console.log(`${check ? 'Verified' : 'Generated'} 42 profile link assets`);
}
