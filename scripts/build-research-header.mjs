import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const directory = new URL('../assets/', import.meta.url);
const palette = {
  light: { bg: '#f6f8f7', ink: '#273638', muted: '#536467', paper: '#fbfcfa', shade: '#d8e1de', metal: '#bac8c7', edge: '#52686b', screen: '#243537', eyes: '#95dbca', human: '#176e67', humanSoft: '#cee6df', proposal: '#70496d', proposalSoft: '#e6dce8', check: '#826019', checkSoft: '#efe5c6', coral: '#ae483e', coralSoft: '#f6dfd8', water: '#286f99', waterSoft: '#a3ccde', land: '#dbe5cf', hill: '#bdcdae', green: '#466d51' },
  dark: { bg: '#171e20', ink: '#e8efeb', muted: '#b8c8c5', paper: '#d7dfdc', shade: '#889e9c', metal: '#728988', edge: '#acc0bc', screen: '#233435', eyes: '#a7e0cb', human: '#83cbbb', humanSoft: '#264d47', proposal: '#d3b2d2', proposalSoft: '#493b4d', check: '#dfc173', checkSoft: '#544d35', coral: '#f0a496', coralSoft: '#623f39', water: '#95c7e1', waterSoft: '#397999', land: '#58735a', hill: '#75936c', green: '#c0d4a9' },
};
const copy = {
  en: {
    name: 'Wenyu Chiou', title: 'LLM evaluation & governed agents',
    titleMobile: ['LLM evaluation', '& governed agents'],
    subtitle: 'Behavioral simulation for human–environment systems',
    mobileSubtitle: ['Behavioral simulation', 'Human–environment systems'],
    human: 'Human evidence', context: 'Context', proposal: 'LLM proposal',
    validation: 'Validation', consequence: 'Consequence',
    behavior: 'Behavior', choices: 'Choices', owner: 'Owner', renter: 'Renter',
    risk: 'Risk', resources: 'Resources', schema: 'Schema',
    permission: 'Permission', budget: 'Budget', adapt: 'Adaptation',
    repair: 'Repair', feedback: 'Environment feedback',
    desc: 'Human evidence and context inform LLM proposals. Paired human and agent choices, working memory and an audit trail connect evaluation with governed action. A river basin with tributaries, rainfall, a stream gauge and households represents environmental feedback. Conceptual illustration, without measured results.',
  },
  'zh-TW': {
    name: '邱文昱 Wenyu Chiou', title: 'LLM 評估與代理治理',
    titleMobile: ['LLM 評估', '與代理治理'],
    subtitle: '以行為模擬探索人類—環境互動',
    mobileSubtitle: ['行為模擬', '人類—環境互動'],
    human: '人類證據', context: '情境', proposal: 'LLM 提案',
    validation: '驗證', consequence: '後果',
    behavior: '行為', choices: '選擇', owner: '屋主', renter: '租客',
    risk: '風險', resources: '資源', schema: '結構',
    permission: '權限', budget: '預算', adapt: '調適',
    repair: '修復', feedback: '環境回饋',
    desc: '人類證據與情境建立 LLM 提案；人類與代理選擇對照、工作記憶與稽核紀錄串起評估及受治理的行動。支流、降雨、水位尺和家戶構成環境回饋。這是概念插圖，不含實測結果。',
  },
};
const xml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
const type = {
  display: 'Literata,Georgia,"Chiron Sung HK","Microsoft JhengHei",serif',
  body: '"Atkinson Hyperlegible Next","Segoe UI","Chiron Hei HK","Microsoft JhengHei",sans-serif',
};
// Presentation attributes keep the typographic hierarchy in CSS-free SVG renderers.
const text = (id, x, y, value, size = 22, color = 'ink', extra = '') => `<text id="${id}" x="${x}" y="${y}" class="${color}" font-family="${xml(color.includes('heading') ? type.display : type.body)}" font-size="${size}" letter-spacing="0" ${extra}>${xml(value)}</text>`;
const group = (id, x, y, content) => `<g id="${id}" transform="translate(${x} ${y})">${content}</g>`;
const tick = (id, x, y, cls = '') => `<g id="${id}" class="${cls}" transform="translate(${x} ${y})"><path d="m0 7 6 6 13-16" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></g>`;
const person = (x, y) => `<g transform="translate(${x} ${y})"><circle cx="10" cy="7" r="7" fill="currentColor"/><path d="M0 29v-5a10 10 0 0 1 20 0v5Z" fill="currentColor"/></g>`;
const riverOutline = 'M109 29c27 25-25 43-21 66s53 23 34 51-40 22-38 61l15 8c-4-29 15-37 30-54s20-38-10-56-24-19-2-40 14-28 6-36Z';
const riverTrack = [[116, 33], [118, 45], [110, 57], [98, 69], [93, 81], [96, 94], [110, 105], [123, 116], [129, 127], [123, 141], [109, 156], [98, 173], [94, 190], [93, 209]];
// Artwork coordinates trace the river; this is a motion path, not a flow model.
const currentFrames = riverTrack.map(([x, y], i) => {
  const next = riverTrack[Math.min(i + 1, riverTrack.length - 1)];
  const previous = riverTrack[Math.max(0, i - 1)];
  const angle = Math.atan2(next[1] - previous[1], next[0] - previous[0]) * 180 / Math.PI - 90;
  return `${(i / (riverTrack.length - 1) * 100).toFixed(2)}%{transform:translate(${x}px,${y}px) rotate(${angle.toFixed(1)}deg);opacity:${i === 0 || i === riverTrack.length - 1 ? 0 : 1}}`;
}).join('');

function house(x, y, scale = 1, roof = 'water') {
  return `<g transform="translate(${x} ${y}) scale(${scale})" stroke-linejoin="round" stroke-width="1.8"><path d="m0 25 29-17 32 19v42L30 87 0 69Z" class="paper-fill edge-stroke"/><path d="m30 44 31-17v42L30 87Z" class="shade-fill edge-stroke"/><path d="m-6 29 35-32 39 29-37 21Z" class="${roof}-fill edge-stroke"/><path d="m5 30 25-24m-13 31 25-23m-13 30 26-22" class="paper-stroke" opacity=".35"/><path d="m10 46 10 6v14L10 60Zm33 7 9-5v15l-9 5Z" class="water-fill"/><path d="m15 49 0 14m-5-10 10 6m28-7v15m-5-4 9-5" class="paper-stroke" stroke-width="1.2"/><path d="m9 65 10 6v10L9 75Z" class="edge-fill"/><path d="m6 76 15 8m-18-4 18 10" class="edge-stroke" fill="none"/></g>`;
}
function evidence(c) {
  return `<g class="human" transform="translate(0 38)"><path d="M5 70 151 43l25 23v179L27 267 5 248Z" class="human-soft-fill human-stroke" stroke-width="2"/><path d="m150 45 24 23v178l-22-17Z" class="shade-fill human-stroke" stroke-width="2"/>
    <path id="evidence-tabs" d="M10 20 148 9v20L10 40Zm4-10L139 0v10L14 21Z" class="shade-fill human-stroke" stroke-width="1.5"/>
    <g id="evidence-page" class="evidence-sheet motion"><path d="m18 15 135-11 9 10v147L23 173Z" class="paper-fill human-stroke" stroke-width="2"/><path d="m143 6 1 17 17-1" class="shade-fill human-stroke" stroke-width="1.5"/>${person(35, 45)}<path d="M75 48h61M75 63h47M36 94h98M36 108h82" class="muted-stroke" stroke-width="3"/>${text('behavior-label', 34, 139, c.behavior, 23, 'paper-ink')}</g>
    <path d="m10 172 145-17v87L27 267 10 251Z" class="human-soft-fill human-stroke" stroke-width="2"/>${text('choices-label', 31, 195, c.choices, 23, 'human')}
    <g id="human-agent-comparison" stroke-width="1.8">
      <g transform="translate(32 207) scale(.55)">${person(0, 0)}</g>
      <path d="M31 236h16v13H31Zm8-4v4m-4 5h2m4 0h2m-8 4h8" class="proposal-stroke" fill="none"/>
      <path d="M62 209h16v14H62Zm56 0h16v14h-16Z" class="human-stroke" fill="none"/>
      <path d="M90 209h16v14H90Z" class="human-fill"/>
      <g class="choice-match motion"><path d="M62 235h16v14H62Zm28 0h16v14H90Zm28 0h16v14h-16Z" class="proposal-stroke" fill="none"/><g id="decision-match" class="decision-cursor motion"><path d="M90 235h16v14H90Z" class="proposal-fill"/></g></g>
    </g>
    <path d="M-1 280H186M7 286h20m20 0h20m20 0h20m20 0h20" class="shade-stroke" stroke-width="2"/>
  </g>`;
}
function homeowner() {
  return `<g id="homeowner-house" transform="translate(0 3)" stroke-width="1.6" stroke-linejoin="round">
    <path d="m-2 91 49 23 46-25-47-21Z" class="shade-fill edge-stroke"/>
    <path d="M7 43 44 22l40 23v43l-37 21L7 88Z" class="paper-fill edge-stroke"/><path d="m47 59 37-14v43l-37 21Z" class="shade-fill edge-stroke"/>
    <path d="M60 15V3l12 4v19" class="coral-soft-fill edge-stroke"/><path d="m58 3 7-3 11 5-5 4Z" class="paper-fill edge-stroke"/>
    <path d="m-1 45 44-38 49 35-45 23Z" class="human-fill edge-stroke"/><path d="m10 46 35-29m-25 35 36-27m-25 32 36-24m-25 29 36-24" class="human-soft-stroke" opacity=".65"/>
    <path d="m1 49 46 22 42-23" class="edge-stroke" fill="none"/>
    <path d="m14 58 17 8v18l-17-8Zm45 5 15-7v19l-15 7Z" class="water-fill paper-stroke"/>
    <path d="m22 62 0 17m-8-13 17 8m35-15v20m-7-7 15-7" class="paper-stroke"/>
    <path class="owner-window motion" d="m15 60 15 7v7l-15-7Zm45 5 13-6v8l-13 6Z" fill="#dfc173"/>
    <path id="owner-door" d="m35 81 10 5v21l-10-5Z" class="human-fill edge-stroke"/><circle cx="42" cy="94" r="1.4" class="paper-fill"/>
    <path d="m30 101 16 8-7 4-16-8Zm-7 6 16 8-6 3-16-8Z" class="paper-fill edge-stroke"/>
    <path d="M7 91 14 94v8l-9-4ZM74 93l10-5v8l-10 5Z" class="land-fill green-stroke"/>
    <g id="homeowner-key" class="ownership-key motion" transform="translate(71 111)"><circle r="6" class="check-soft-fill check-stroke"/><path d="M6 0h15m-5 0v5m5-5v4" class="check-stroke" stroke-width="2.8" fill="none" stroke-linecap="round"/></g>
  </g>`;
}
function rentalBuilding() {
  return `<g id="renter-building" transform="translate(107 0)" stroke-width="1.5" stroke-linejoin="round">
    <path d="m-5 105 27 14 47-13-25-16Z" class="shade-fill edge-stroke"/>
    <path d="M0 16 44 4l23 15v83l-44 13L0 102Z" class="shade-fill edge-stroke"/><path d="m23 31 44-12v83l-44 13Z" class="paper-fill edge-stroke"/>
    <path d="m-3 15 47-13 27 15-48 15Z" class="metal-fill edge-stroke"/><path d="M3 14 43 5l17 10-37 10Z" class="bg-fill edge-stroke"/>
    <path d="m33 11 12-3 9 6-12 3Z" class="metal-fill edge-stroke"/><path d="M42 9v7m4-8v7" class="edge-stroke"/>
    ${[42, 65, 88].map(y => `<path d="M6 ${y-9}l10 5v12l-10-5Zm25 1 12-3v15l-12 3Zm19-5 11-3v15l-11 3Z" class="water-fill paper-stroke"/><path d="M37 ${y-10}v15m18-20v15" class="paper-stroke"/>`).join('')}
    <path class="renter-window motion" d="m32 35 10-3v13l-10 3Zm19 18 9-3v13l-9 3Z" fill="#dfc173"/>
    ${[58, 81].map(y => `<path d="M26 ${y}l41-11 5 5-41 12Z" class="shade-fill edge-stroke"/><path d="M31 ${y+6}v-9l41-11v9m-31-5v9m10-12v9m10-12v9" class="edge-stroke" fill="none"/>`).join('')}
    <path d="m47 94 12-3v13l-12 4Z" class="human-fill edge-stroke"/><path d="m46 108 16-5 5 3-16 5" class="edge-stroke" fill="none"/>
    <g id="renter-lease" class="lease-paper motion" transform="translate(-13 84)"><path d="M0 0h24l6 6v28H0Z" class="paper-fill proposal-stroke"/><path d="M24 0v7h6M5 11h18M5 17h13m-12 9 4-4 3 3 5-2" class="proposal-stroke" fill="none"/></g>
  </g>`;
}
function context(c) {
  return `<g transform="translate(2 54)">
    ${homeowner()}${rentalBuilding()}
    ${text('owner-label', 43, 145, c.owner, 24, 'ink', 'text-anchor="middle" font-weight="600"')}${text('renter-label', 139, 145, c.renter, 24, 'ink', 'text-anchor="middle" font-weight="600"')}
    <path d="M0 169H175" class="shade-stroke" stroke-width="2"/>
    <g class="context-scan motion"><path d="m16 188 15 28H1Z" class="check-soft-fill check-stroke" stroke-width="2"/><path d="M16 195v10m0 5v2" class="check-stroke" stroke-width="2.5"/>${text('risk-label', 43, 212, c.risk, 23, 'ink')}</g>
    <path d="M2 238h28v21H2Zm6-6h16v6m-9 10h4" class="human-stroke" fill="none" stroke-width="2"/>${text('resources-label', 43, 258, c.resources, 23, 'ink')}
  </g>`;
}
function robot() {
  return `<g id="robot" transform="translate(0 37)" stroke-width="2" stroke-linejoin="round">
    <g id="working-memory"><path d="M0 36h23v33H0Z" class="shade-fill proposal-stroke"/><g id="memory-sheet" class="memory-sheet motion"><path d="M7 43h23v33H7Z" class="paper-fill proposal-stroke"/><path d="M12 51h12m-12 7h12m-12 7h7" class="proposal-stroke" fill="none"/></g><path d="M30 62h11" class="proposal-stroke"/></g>
    <ellipse cx="121" cy="277" rx="115" ry="17" class="shade-fill"/>
    <path d="m59 229-11 19v23l55 8 23-15-7-28Z" class="metal-fill edge-stroke"/><path d="m137 231-9 29 18 16 61-5v-25l-21-19Z" class="metal-fill edge-stroke"/>
    <path d="M60 251v16m13-15v17m13-17v18m66-18v17m15-16v17m16-16v14" class="edge-stroke"/>
    <path d="m78 216 9 28 30-5 7-26m16 1 7 30 29-4 1-26" class="shade-fill edge-stroke"/>
    <path d="m74 143 95-5 30 24-7 65-86 12-39-24-7-48Z" class="paper-fill edge-stroke"/>
    <path d="m169 138 30 24-7 65-23 6Z" class="metal-fill edge-stroke"/>
    <path d="m91 167 64-6 17 15-5 29-65 8-17-13Z" class="shade-fill edge-stroke"/>
    <path id="wc-monogram" d="m99 177 6 23 9-18 8 17 6-24m25 1c-19-8-27 27-4 23" class="human-stroke" fill="none" stroke-width="3.2" stroke-linecap="round"/>
    <circle cx="64" cy="162" r="20" class="metal-fill edge-stroke"/><circle cx="64" cy="162" r="10" class="human-soft-fill edge-stroke"/>
    <path d="M55 181 36 206 57 232l20-15-17-15 11-15" class="paper-fill edge-stroke"/><path d="m49 228 14 12 21-8-5-17-9-3-3 14-8-5Z" class="paper-fill edge-stroke"/>
    <circle cx="192" cy="161" r="15" class="metal-fill edge-stroke"/>
    <g class="robot-arm motion"><path d="m199 166 30-13 14 11-32 30-18-12Z" class="paper-fill edge-stroke"/><path d="m230 151 20-7 10 10-3 13-23 3Z" class="paper-fill edge-stroke"/></g>
    <path d="M101 128v18l49-3v-20" class="metal-fill edge-stroke"/>
    <g id="robot-head" class="robot-head motion">
      <path d="m54 25 108-12 39 26v94l-120 18-34-24V45Z" class="paper-fill edge-stroke"/>
      <path d="m162 13 39 26v94l-27-13V32Z" class="metal-fill edge-stroke"/>
      <path d="m66 34 96-10 15 13-99 12Z" class="shade-fill"/>
      <path d="M65 64q0-10 10-12l80-9q12-1 12 11v54q0 11-11 13l-79 11q-12 1-12-10Z" class="screen-fill edge-stroke"/>
      <g class="robot-eyes motion"><path d="M84 82q8-9 16-2m32-7q8-9 16-2" class="eye-stroke" stroke-width="6" stroke-linecap="round" fill="none"/></g>
      <path d="M106 107q12 6 22-3" class="eye-stroke" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="47" cy="83" rx="11" ry="22" class="metal-fill edge-stroke"/><ellipse cx="47" cy="83" rx="5" ry="12" class="human-soft-fill edge-stroke"/>
      <path d="M85 21 81 3" class="edge-stroke" stroke-width="4"/><circle cx="80" cy="0" r="6" class="human-fill edge-stroke"/>
      <path d="M184 56v43m7-39v33" class="edge-stroke"/>
      <circle cx="59" cy="40" r="2.3" class="edge-fill"/><circle cx="62" cy="124" r="2.3" class="edge-fill"/>
    </g>
    <g transform="translate(198 179) rotate(8)"><g id="proposal-sheet" class="proposal-clipboard motion">
      <path d="M0 0h64l9 10v101H0Z" class="proposal-soft-fill proposal-stroke"/><path d="M6 7h53l7 7v89H6Z" class="paper-fill proposal-stroke"/><path d="M19-4h30v13H19Z" class="metal-fill proposal-stroke"/>
      <path d="m16 39 12-12 12 12m-20-3v15h15V35M17 66h38M17 77h27M17 88h34" class="proposal-stroke" fill="none" stroke-width="2.5"/>
    </g></g>
  </g>`;
}
function validator(c) {
  return `<g transform="translate(0 44)" stroke-linejoin="round" stroke-width="2">
    <path d="M7 25 174 14l21 21v225l-168 15L7 258Z" class="check-soft-fill check-stroke"/>
    <path d="m174 14 21 21v225l-21-18Z" class="metal-fill check-stroke"/>
    <path d="M21 46h149v181H21Z" class="bg-fill check-stroke"/>
    <path d="M21 105h149M21 165h149" class="shade-stroke"/>
    <path d="M41 25v-8a22 22 0 0 1 44 0v8" class="paper-fill check-stroke"/><path d="M47 15h3m3-11 2 3m8-8v4m10 1-2 3m5 8h3" class="check-stroke"/><g transform="translate(63 17)"><path id="validation-needle" class="check-stroke validation-needle motion" d="M0 0 10-14" stroke-width="3"/></g>
    <path d="M128 22V9h25v12m-29-13h33v-9h-33Z" class="metal-fill check-stroke"/>
    ${text('schema-label', 32, 82, c.schema, 22, 'ink')}${text('permission-label', 32, 143, c.permission, 22, 'ink')}${text('budget-label', 32, 203, c.budget, 22, 'ink')}
    ${tick('schema-check', 142, 75, 'human check-schema motion')}${tick('permission-check', 142, 136, 'human check-permission motion')}${tick('budget-check', 142, 196, 'human check-budget motion')}
    <g id="rejected-mark" class="coral rejection motion" opacity="0"><path d="m142 132 17 17m0-17-17 17" stroke="currentColor" stroke-width="4"/></g>
    <path d="M37 244h77" class="edge-stroke" stroke-width="6" stroke-linecap="round"/><path id="validation-slider" class="check-stroke validation-slider motion" d="M46 244h20" stroke-width="4" stroke-linecap="round"/>
    <path d="M182 47v23m0 9v23m0 9v23" class="edge-stroke"/>
    ${[[16, 37], [164, 28], [18, 252], [163, 247]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="2.3" class="edge-fill"/>`).join('')}
    <circle cx="151" cy="245" r="6" class="human-fill"/>
    <g id="audit-trail" class="audit-record motion">
      <path d="M48 266h100v44l-10-5-10 5-10-5-10 5-10-5-10 5-10-5-10 5-10-5-10 5Z" class="paper-fill check-stroke"/>
      <path d="M68 283h59" class="human-stroke"/>
      ${[68, 98, 127].map(x => `<circle cx="${x}" cy="283" r="5" class="human-soft-fill human-stroke"/>`).join('')}
      <path d="M62 298h11m19 0h11m19 0h11" class="edge-stroke" stroke-linecap="round"/>
    </g>
  </g>`;
}
function terrain() {
  return `<g id="terrain" transform="translate(0 48)" stroke-linejoin="round" stroke-width="1.6">
    <path d="m4 178 136 53 72-131v43L140 273 4 219Z" class="metal-fill edge-stroke"/>
    <path id="soil-layers" d="m5 193 135 54 71-131M5 208l135 54 71-131" class="edge-stroke" fill="none"/>
    <path d="m4 178 64-148 74-7 70 77-72 131Z" class="land-fill green-stroke"/>
    <path d="m17 148 42-98 16-9 31 9-38 57-22 50Z" class="hill-fill"/>
    <path d="M48 100 68 53l20-8M27 155l23-23 21-10m79-50 21 29-12 17M140 201l17-14 16-1" class="green-stroke" fill="none"/>
    <path id="flood-extent" class="water-soft-fill water-stroke flood-water motion" opacity=".18" d="M99 66c-25 17-17 36 2 49s18 24 4 40-29 30-28 46l24 12c1-25 30-45 42-67s-12-32-25-45-8-23-5-29Z"/>
    <path d="${riverOutline}" class="water-soft-fill water-stroke"/>
    <path d="M114 33c17 20-27 43-19 64s54 24 27 52-27 29-29 60" class="paper-stroke" fill="none" stroke-width="2.6"/>
    <path id="tributaries" d="M82 61q-5 15 12 23m-22-10 10 4m70-32q-23-4-28 16m-5-18 8 5" class="water-stroke" fill="none" stroke-width="2.4"/>
    <g id="river-currents" clip-path="url(#river-mask)">${[0,1,2].map((i) => `<g id="river-current-${i}" class="river-current flow-${i} motion" transform="translate(${riverTrack[3+i*3].join(' ')})"><path d="m-3-5 3 5 3-5" class="paper-stroke" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>`).join('')}</g>
    <g id="rainfall"><path d="M110 17c-13-1-12-19 0-20 5-17 29-17 35-4 16-10 30-1 29 10 19-2 23 16 9 19Z" class="bg-fill water-stroke"/><path d="M117 9q4-9 16-7m21 5q9-7 16 3" class="shade-stroke" fill="none"/><g clip-path="url(#rain-mask)"><path id="rain-front" d="m116 25-4 9m24-9-4 9m24-9-4 9m24-9-4 9" class="water-stroke rain-streaks motion" stroke-width="2.5" stroke-linecap="round"/><path id="rain-back" d="m127 18-3 7m24-7-3 7m24-7-3 7" class="water-stroke rain-streaks rain-second motion" stroke-width="2" stroke-linecap="round"/></g></g>
    <path id="household-network" d="M77 125q29-29 69-16M81 140q15 37 47 44" class="human-stroke" stroke-dasharray="3 4" fill="none"/>
    ${house(127, 87, .66, 'water')}${house(56, 107, .56, 'human')}${house(116, 164, .49, 'metal')}
    <g class="adaptation motion"><path d="m62 144 28 11-3 15-30-12Z" class="human-soft-fill human-stroke"/><path d="m65 143 8-4 6 7 8-3 9 8" class="human-stroke" fill="none" stroke-width="3"/></g>
    <g id="stream-gauge"><path d="M78 166v39m-8-30h8m-5 8h5m-8 8h8m-5 8h5" class="paper-stroke" stroke-width="3.5"/><path d="M78 166v39m-8-30h8m-5 8h5m-8 8h8m-5 8h5" class="edge-stroke"/><path id="water-level" class="coral-fill water-level motion" d="m81 188 9-4v8Z"/></g>
    ${[[74, 29], [180, 108], [30, 132]].map(([x, y]) => `<g transform="translate(${x} ${y})"><path d="M0 7v13" class="edge-stroke" stroke-width="3"/><path d="M-8 10-5-3 0-12 7-2 10 10 1 14Z" class="hill-fill green-stroke"/></g>`).join('')}
  </g>`;
}

function build(locale, dark, mobile) {
  const c = copy[locale], p = palette[dark ? 'dark' : 'light'];
  const width = mobile ? 480 : 1200, height = mobile ? 1480 : 750;
  const cssColors = Object.entries(p).flatMap(([key, value]) => {
    const name = ({ humanSoft: 'human-soft', proposalSoft: 'proposal-soft', checkSoft: 'check-soft', coralSoft: 'coral-soft', waterSoft: 'water-soft' })[key] || key;
    return [`.${name}{fill:${value};color:${value}}`, `.${name}-fill{fill:${value}}`, `.${name}-stroke{stroke:${value}}`];
  }).join('\n');
  const columns = mobile ? [[30, 252], [257, 252], [24, 625], [270, 625], [180, 1058]] : [[30, 218], [244, 218], [453, 218], [742, 218], [970, 218]];
  const ids = ['human', 'context', 'proposal', 'validation', 'consequence'];
  const bodies = [evidence(c), context(c), robot(), validator(c), terrain()];
  const bodySizes = mobile ? [1, 1, .85, .96, .86] : [1, 1, 1, 1, 1];
  const stageMarkup = ids.map((id, i) => {
    const [x, y] = columns[i];
    const labelColor = ['human', 'ink', 'proposal', 'check', 'water'][i];
    const art = bodySizes[i] === 1 ? bodies[i] : `<g transform="scale(${bodySizes[i]})">${bodies[i]}</g>`;
    let captions = '';
    if (id === 'consequence') captions = text('consequence-caption', mobile ? 81 : 108, mobile ? 315 : 360, c.adapt, 24, 'water', 'text-anchor="middle"');
    return group(`stage-${id}`, x, y, text(`${id}-label`, 0, 0, c[id], 26, labelColor, 'font-weight="600"') + art + captions);
  }).join('\n');
  const routes = mobile ? {
    evidence: 'M216 365H245', context: 'M345 576v22H236v76h-24', proposal: 'M242 786h19', pass: 'M444 995v37H355v55', repair: 'M355 995v24H128v-51', feedback: 'M168 1237H15V584h241', repairStart: [355, 995], repairDeltas: [0, 24, -227, 24, -227, -27], packetStart: [234, 758], packetTravel: [31, 0],
  } : {
    evidence: 'M214 360h20', context: 'M426 360h19', proposal: 'M714 360h19', pass: 'M944 360h17', repair: 'M832 596v26H578v-26', feedback: 'M1101 600v75H322V584', repairStart: [832, 596], repairDeltas: [0, 26, -254, 26, -254, 0], packetStart: [703, 340], packetTravel: [42, 0],
  };
  const arrow = (id, d, color, animatedClass = '') => `<path id="${id}" d="${d}" fill="none" class="${color}-stroke ${animatedClass}" stroke-width="2.5" marker-end="url(#arrow-${color})"/>`;
  const [rx, ry] = routes.repairStart, [dx1, dy1, dx2, dy2, dx3, dy3] = routes.repairDeltas;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description" xml:lang="${locale}" data-design="precision-robot-workbench" data-duration="4800">
<title id="title">${xml(c.name + ': ' + c.title)}</title><desc id="description">${xml(c.desc)}</desc>
<defs>
<style>
${cssColors}
text{font-family:${type.body};letter-spacing:0}
.heading{font-family:${type.display};font-weight:500}
.paper-ink{fill:#273638}.eye-stroke{stroke:${p.eyes}}
.motion{animation-duration:4.8s;animation-timing-function:cubic-bezier(.22,1,.36,1);animation-iteration-count:1;animation-fill-mode:both}
.evidence-sheet{animation-name:evidence}.context-scan{animation-name:context}
.robot-head{animation-name:think;transform-box:fill-box;transform-origin:50% 95%}
.robot-arm{animation-name:offer;transform-box:fill-box;transform-origin:0 60%}
.robot-eyes{animation-name:blink;transform-box:fill-box;transform-origin:center}
.check-schema{animation-name:schema}.check-permission{animation-name:permission}.check-budget{animation-name:budget}
.rejection{animation-name:reject}.adaptation{animation-name:adapt}
.paper-flight{animation-name:flight}.repair-flight{animation-name:return-paper}
.passed-highlight{animation-name:accept}.feedback-highlight{animation-name:feedback}
.choice-match{animation-name:choice-match}.audit-record{animation-name:audit-record}
.decision-cursor{animation-name:decision-match}.ownership-key{animation-name:ownership-key;transform-box:fill-box;transform-origin:left center}
.lease-paper{animation-name:lease-paper}.owner-window,.renter-window{animation-name:window-light}
.memory-sheet{animation-name:memory-sheet}.proposal-clipboard{animation-name:clipboard}
.validation-needle{animation-name:needle}.validation-slider{animation-name:slider}
.river-current{animation-name:river-current;animation-duration:1.25s;animation-iteration-count:3;animation-timing-function:linear}
.flow-1{animation-delay:.35s}.flow-2{animation-delay:.7s}
.rain-streaks{animation-name:rainfall;animation-duration:1s;animation-iteration-count:4;animation-timing-function:linear}.rain-second{animation-delay:.25s}
.flood-water{animation-name:flood;transform-box:fill-box;transform-origin:center}.water-level{animation-name:water-level}
@keyframes decision-match{0%,7%{transform:translateX(28px)}19%,100%{transform:translateX(0)}}
@keyframes ownership-key{0%,6%,35%,100%{transform:translate(71px,111px) rotate(0deg)}15%,23%{transform:translate(71px,108px) rotate(-12deg)}}
@keyframes lease-paper{0%,8%,36%,100%{transform:translate(-13px,84px)}17%,25%{transform:translate(-13px,77px)}}
@keyframes window-light{0%,8%{opacity:.1}20%,28%{opacity:.9}44%,100%{opacity:.35}}
@keyframes memory-sheet{0%,15%,44%,100%{transform:translate(0,0)}26%,34%{transform:translate(-3px,-7px)}}
@keyframes clipboard{0%,25%,58%,100%{transform:translate(0,0)}36%,47%,69%,76%{transform:translate(2px,-5px)}}
@keyframes needle{0%,16%{transform:rotate(-55deg)}34%,42%{transform:rotate(20deg)}56%{transform:rotate(-30deg)}78%,100%{transform:rotate(0deg)}}
@keyframes slider{0%,28%{transform:translateX(0)}46%{transform:translateX(26px)}57%{transform:translateX(8px)}80%,100%{transform:translateX(36px)}}
@keyframes river-current{${currentFrames}}
@keyframes rainfall{0%{opacity:0;transform:translate(5px,-8px)}10%,78%{opacity:.9}100%{opacity:0;transform:translate(-14px,52px)}}
@keyframes flood{0%,12%{opacity:0;transform:scaleX(.45)}42%,68%{opacity:.45;transform:scaleX(1)}92%,100%{opacity:.18;transform:scaleX(.75)}}
@keyframes water-level{0%,12%{transform:translateY(3px)}42%,68%{transform:translateY(-12px)}92%,100%{transform:translateY(0)}}
@keyframes choice-match{0%,26%{opacity:.25}35%,100%{opacity:1}}
@keyframes audit-record{0%,76%{opacity:0;transform:translateY(-6px)}84%,100%{opacity:1;transform:translateY(0)}}
@keyframes evidence{0%{transform:translateY(7px)}12%,100%{transform:translateY(0)}}
@keyframes context{0%,8%{opacity:.45}20%,100%{opacity:1}}
@keyframes think{0%,16%,100%{transform:rotate(0deg)}30%,53%{transform:rotate(-5deg)}68%{transform:rotate(3deg)}82%{transform:rotate(0deg)}}
@keyframes offer{0%,16%,50%,100%{transform:rotate(0deg)}28%,40%,67%,76%{transform:rotate(-8deg)}}
@keyframes blink{0%,37%,43%,100%{transform:scaleY(1)}39%,41%{transform:scaleY(.15)}}
@keyframes schema{0%,27%{opacity:.2}35%,100%{opacity:1}}
@keyframes permission{0%,66%{opacity:0}73%,100%{opacity:1}}
@keyframes budget{0%,72%{opacity:.2}80%,100%{opacity:1}}
@keyframes reject{0%,34%{opacity:0}39%,48%{opacity:1}54%,100%{opacity:0}}
@keyframes adapt{0%,80%{opacity:0;transform:translateY(5px)}90%,100%{opacity:1;transform:translateY(0)}}
@keyframes flight{0%,18%,41%,56%,80%,100%{opacity:0;transform:translate(0,0)}21%,59%{opacity:1;transform:translate(0,0)}35%,73%{opacity:1;transform:translate(${routes.packetTravel[0]}px,${routes.packetTravel[1]}px)}}
@keyframes return-paper{0%,40%,61%,100%{opacity:0;transform:translate(0,0)}43%{opacity:1;transform:translate(0,0)}47%{opacity:1;transform:translate(${dx1}px,${dy1}px)}54%{opacity:1;transform:translate(${dx2}px,${dy2}px)}58%{opacity:1;transform:translate(${dx3}px,${dy3}px)}}
@keyframes accept{0%,76%{opacity:.25}83%,100%{opacity:1}}
@keyframes feedback{0%,86%{opacity:.3}96%,100%{opacity:1}}
@media(prefers-reduced-motion:reduce){.motion{animation:none!important}}
</style>
${['human', 'proposal', 'check', 'coral', 'water'].map(key => `<marker id="arrow-${key}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="m1 1 7 4-7 4" fill="none" stroke="${p[key]}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker>`).join('\n')}
<clipPath id="river-mask" clipPathUnits="userSpaceOnUse"><path d="${riverOutline}"/></clipPath>
<clipPath id="rain-mask" clipPathUnits="userSpaceOnUse"><path d="M96 22h99v60H96Z"/></clipPath>
</defs>
<rect width="${width}" height="${height}" class="bg-fill"/>
${text('name', 30, mobile ? 58 : 76, c.name, mobile ? (locale === 'en' ? 42 : 34) : 54, 'ink heading', 'font-weight="500"')}
${mobile ? c.titleMobile.map((v, i) => text(`heading-${i}`, 30, 100 + i * 46, v, 30, 'ink', 'font-weight="600"')).join('') : text('heading', 30, 124, c.title, 34, 'ink', 'font-weight="600"')}
${mobile ? c.mobileSubtitle.map((v, i) => text(`subtitle-${i}`, 30, 184 + i * 28, v, 22, 'muted')).join('') : text('subtitle', 30, 160, c.subtitle, 24, 'muted')}
${stageMarkup}
${arrow('evidence-route', routes.evidence, 'human')}${arrow('context-route', routes.context, 'human')}${arrow('proposal-route', routes.proposal, 'proposal')}${arrow('passed-route', routes.pass, 'check', 'passed-highlight motion')}
<path id="repair-route" d="${routes.repair}" class="coral-stroke" stroke-width="2.5" stroke-dasharray="7 6" fill="none" marker-end="url(#arrow-coral)"/>
<path id="feedback-route" d="${routes.feedback}" class="water-stroke feedback-highlight motion" stroke-width="2.5" stroke-dasharray="7 6" fill="none" marker-end="url(#arrow-water)"/>
${text('repair-label', mobile ? 185 : 705, mobile ? 1004 : 609, c.repair, 24, 'coral', mobile ? '' : 'text-anchor="middle"')}
${mobile && locale === 'en' ? text('feedback-label', 32, 1160, 'Environment', 22, 'water') + text('feedback-label-line2', 32, 1189, 'feedback', 22, 'water') : text('feedback-label', mobile ? 32 : 712, mobile ? 1160 : 660, c.feedback, 24, 'water', mobile ? '' : 'text-anchor="middle"')}
<g transform="translate(${routes.packetStart.join(' ')})"><g class="paper-flight motion" opacity="0"><path d="M0 0h18l5 5v24H0Z" class="paper-fill proposal-stroke" stroke-width="2"/><path d="M5 10h12M5 16h10M5 22h8" class="proposal-stroke" stroke-width="2"/></g></g>
<g transform="translate(${rx} ${ry})"><g class="repair-flight motion" opacity="0"><path d="M-8-12H8v24H-8Z" class="paper-fill coral-stroke" stroke-width="2"/><path d="m-3-4 6 8m0-8-6 8" class="coral-stroke" stroke-width="2"/></g></g>
</svg>\n`;
  // Duplicate this generator's paint tokens as SVG attributes for CSS-free static rendering.
  const paints = Object.fromEntries(Object.entries(p).map(([key, value]) => [key.replace(/[A-Z]/g, (v) => `-${v.toLowerCase()}`), value]));
  return svg.replace(/<([a-z][^<>]*\sclass="([^"]+)"[^<>]*)>/g, (tag, attrs, names) => {
    const values = {};
    for (const name of names.split(/\s+/)) {
      if (name === 'paper-ink') values.fill = '#273638';
      else if (name === 'eye-stroke') values.stroke = p.eyes;
      else if (paints[name]) { values.fill = paints[name]; values.color = paints[name]; }
      else for (const property of ['fill', 'stroke']) {
        if (name.endsWith(`-${property}`) && paints[name.slice(0, -property.length - 1)]) values[property] = paints[name.slice(0, -property.length - 1)];
      }
    }
    const additions = Object.entries(values).filter(([key]) => !new RegExp(`\\s${key}=`).test(attrs)).map(([key, value]) => ` ${key}="${value}"`).join('');
    return tag.replace(/\/?>(?=$)/, (end) => additions + end);
  });
}

const checkOnly = process.argv.includes('--check');
if (process.argv.slice(2).some(arg => arg !== '--check')) throw new Error('Usage: node scripts/build-research-header.mjs [--check]');
if (!checkOnly) mkdirSync(directory, { recursive: true });
function emit(target, svg) {
  if (checkOnly) {
    if (readFileSync(target, 'utf8').replace(/\r\n/g, '\n') !== svg) throw new Error(`Stale generated SVG: ${fileURLToPath(target)}`);
  } else writeFileSync(target, svg);
}
for (const locale of ['en', 'zh-TW']) for (const mobile of [false, true]) for (const dark of [false, true]) {
  const name = `research-loop${locale === 'en' ? '' : '-zh-TW'}${mobile ? '-mobile' : ''}${dark ? '-dark' : ''}.svg`;
  const target = new URL(name, directory);
  const svg = build(locale, dark, mobile);
  emit(target, svg);
  emit(new URL(name.replace('.svg', '-static.svg'), directory), svg.replace('data-duration="4800"', 'data-duration="0" data-motion="static"').replace('</style>', '.motion{animation:none!important}\n</style>'));
  console.log(fileURLToPath(target));
}
console.log(`${checkOnly ? 'Verified' : 'Built'} 16 research SVG variants`);
