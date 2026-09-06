import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const directory = resolve(process.argv[2] || 'assets');
const files = readdirSync(directory).filter(name => /^research-loop.*\.svg$/.test(name)).sort();
assert.equal(files.length, 16, 'complete locale/theme/layout/motion matrix');
const stages = ['human', 'context', 'proposal', 'validation', 'consequence'];
const structuralIds = source => [...source.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]).sort();
const source = name => readFileSync(resolve(directory, name), 'utf8').replace(/\r\n/g, '\n');

for (const file of files) {
  const svg = source(file);
  assert(Buffer.byteLength(svg) < 96 * 1024, `${file}: bounded vector asset`);
  assert(!/<(?:script|image|foreignObject)\b|@import|animation-iteration-count:\s*infinite/i.test(svg), `${file}: native finite SVG`);
  assert(svg.includes('<title id="title">') && svg.includes('<desc id="description">'));
  const ids = structuralIds(svg);
  assert.equal(new Set(ids).size, ids.length, `${file}: unique IDs`);
  for (const stage of stages) assert(ids.includes(`stage-${stage}`), `${file}: ${stage}`);
  for (const match of svg.matchAll(/url\(#([^)]*)\)/g)) assert(ids.includes(match[1]), `${file}: local reference ${match[1]}`);
  for (const text of svg.matchAll(/<text\b([^>]*)>/g)) assert(text[1].includes('font-family='), `${file}: CSS-free typography`);
  assert(!/Illustrative workflow|流程示意|Not a published/i.test(svg));
  assert(svg.includes('LLM'));
  if (file.includes('-static')) {
    assert(svg.includes('data-duration="0" data-motion="static"'));
    assert(svg.includes('.motion{animation:none!important}'));
  } else {
    assert(svg.includes('data-duration="4800"'));
    assert.equal(source(file.replace('.svg', '-static.svg')), svg.replace('data-duration="4800"', 'data-duration="0" data-motion="static"').replace('</style>', '.motion{animation:none!important}\n</style>'), `${file}: exact static counterpart`);
  }
  if (!file.includes('zh-TW')) {
    const translatedIds = structuralIds(source(file.replace('research-loop', 'research-loop-zh-TW')));
    // The longer English feedback caption has two lines in the portrait artwork.
    if (file.includes('-mobile')) translatedIds.push('feedback-label-line2');
    assert.deepEqual(ids, translatedIds.sort(), `${file}: locale structure parity`);
  }
}
console.log(`Verified ${files.length} research SVGs: structure, locale parity, typography and static counterparts`);
