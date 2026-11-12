/* The two figures that carry the research idea of the profile. Drawing code only: the wording is in profile-content.mjs.
   - bannerSvg: a hillslope, five households and a river play the research loop for two years, so the second flood
     meets different choices. Pure SVG and CSS, because an image in a README runs no script.
   - topicTiles: the three research directions as one row of tiles, joined by a line that runs through all three.
   With prefers-reduced-motion both show a still frame that keeps the meaning (the banner: the second flood). */

/* ---------- keyframe helpers: positions are percentages of one loop ---------- */
const pc = (v) => `${+(+v).toFixed(2)}%`;
const frames = (name, pts) => `@keyframes ${name}{${pts.map(([p, css]) => `${pc(p)}{${css}}`).join("")}}`;
/* visible inside each [from, to] window, hidden elsewhere */
const shown = (name, wins, hi = 1, f = 0.7) => {
  const pts = [];
  if (wins[0][0] > 0) pts.push([0, "opacity:0"]);
  for (const [a, b] of wins) pts.push([a, "opacity:0"], [a + f, `opacity:${hi}`], [b - f, `opacity:${hi}`], [b, "opacity:0"]);
  if (wins[wins.length - 1][1] < 100) pts.push([100, "opacity:0"]);
  return frames(name, pts);
};
/* the same, with a small pop when it appears */
const popped = (name, a, b) => frames(name, [[0, "opacity:0;transform:scale(.5)"], [a, "opacity:0;transform:scale(.5)"], [a + 0.7, "opacity:1;transform:scale(1.18)"], [a + 1.5, "opacity:1;transform:scale(1)"],
  [b - 0.7, "opacity:1;transform:scale(1)"], [b, "opacity:0;transform:scale(.8)"], [100, "opacity:0;transform:scale(.8)"]]);

/* ---------- shared glyphs: what a household chose ---------- */
const GL = {
  ask: `<rect x="-5" y="-6" width="10" height="12" rx="2"/><path d="M-2 -2h4M-2 2h4"/>`,
  up: `<path d="M0 6V-6M-5 -1l5-5 5 5"/>`,
  ins: `<path d="M0 -7l6 2v4c0 4-3 6-6 8-3-2-6-4-6-8v-4z"/>`,
  wait: `<path d="M-4 0h8"/>`,
};
const RIM = { ask: "#8de4e6", wait: "#8de4e6", ins: "#f7d67f", up: "#aee6c2" };
const WALL = { dry: "#eef6f4", wet: "#f4a285", cov: "#f7d67f" };

/* ---------- banner ---------- */
const LOOP_S = 30;                       /* seconds for one pass: year 1 then year 2 */
const W = 1280, H = 576, S = 1.6, LIFT = 38;
const RIVER = 538, FLOOD = 456, RISE = RIVER - FLOOD;
/* the loop, in percent: ask, decide, flood 1 (rise, hold, fall), next year, flood 2, next year */
const P = { ask: [0, 10], decide: [10, 22], flood1: [22, 44], next1: [44, 58], flood2: [58, 82], next2: [82, 100] };
const RISE_AT = { 1: [22, 30], 2: [58, 66] }, HOLD_TO = { 1: 39, 2: 77 }, FALL_TO = { 1: 44, 2: 82 };
const STILL = 72;                        /* the still frame: the second flood at its peak */
const GP = [[0, 440], [110, 444], [310, 466], [510, 474], [700, 484], [880, 498], [950, 512], [1010, 540], [1075, 560], [1280, 566]];
const seg = (a, b) => `C${(a[0] + b[0]) / 2} ${a[1]} ${(a[0] + b[0]) / 2} ${b[1]} ${b[0]} ${b[1]}`;
const gTop = GP.map((p, i) => (i ? seg(GP[i - 1], p) : `M${p[0]} ${p[1]}`)).join("");
const gBack = GP.slice().reverse().map((p, i, a) => (i ? seg(a[i - 1], p) : "")).join("");
/* Five households from high ground to the river bank. seq: what the badge shows and when; lift: when the house is raised;
   wet: which flood reaches it and how it shows (wet = flooded, cov = flooded but insured). */
const HOUSES = [
  { x: 110, g: 444, seq: [["wait", 10, 97]] },
  { x: 310, g: 466, seq: [["wait", 10.8, 47], ["ins", 47, 88], ["up", 88, 97]], lift: [89.5, 93], wet: [[1, "wet"], [2, "cov"]] },
  { x: 510, g: 474, seq: [["wait", 11.6, 48], ["up", 48, 97]], lift: [49, 53], wet: [[1, "wet"]] },
  { x: 700, g: 484, seq: [["ins", 12.4, 49], ["up", 49, 97]], lift: [50.5, 54.5], wet: [[1, "cov"]] },
  { x: 880, g: 498, seq: [["up", 13.2, 97]], lift: [14, 18] },
];
/* when the rising water reaches ground level g (the rise eases in and out, close to a smoothstep) */
const arrive = (year, g) => { const p = (RIVER - g) / RISE; let lo = 0, hi = 1; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (m * m * (3 - 2 * m) < p) lo = m; else hi = m; } const [a, b] = RISE_AT[year]; return a + lo * (b - a); };

export function bannerSvg(svg, L, { ex, tw, wrapW, lines }) {
  const css = [], motion = [], keys = [], T = `${LOOP_S}s`;
  const run = (sel, name, ease = "linear") => motion.push(`${sel}{animation:${name} ${T} ${ease} infinite}`);

  /* water, rain, darker sky */
  let wv = "M-160 0q20 -7 40 0"; for (let i = 1; i < 41; i++) wv += "t40 0"; wv += "V260H-160Z";
  const water = (cls) => `<g class="wtr"><g transform="translate(0 ${RIVER})"><path class="wave ${cls}" d="${wv}"/></g></g>`;
  keys.push(`@keyframes tide{0%,${RISE_AT[1][0]}%{transform:translateY(0)}${RISE_AT[1][1]}%,${HOLD_TO[1]}%{transform:translateY(-${RISE}px)}${FALL_TO[1]}%,${RISE_AT[2][0]}%{transform:translateY(0)}${RISE_AT[2][1]}%,${HOLD_TO[2]}%{transform:translateY(-${RISE}px)}${FALL_TO[2]}%,100%{transform:translateY(0)}}`,
    `@keyframes wave{to{transform:translateX(-160px)}}`, `@keyframes fall{from{transform:translate(8px,-24px);opacity:0}30%{opacity:.8}to{transform:translate(-10px,44px);opacity:0}}`);
  const wet = [[RISE_AT[1][0] - 2, HOLD_TO[1] - 2], [RISE_AT[2][0] - 2, HOLD_TO[2] - 2]];
  keys.push(shown("rain", wet), shown("dim", wet, 0.26, 2));
  run(".wtr", "tide", "ease-in-out"); run(".rain", "rain"); run(".dim", "dim");
  motion.push(`.wave{animation:wave 7s linear infinite}.rain line{animation:fall .7s linear infinite}`);
  const rain = Array.from({ length: 40 }, (_, i) => { const x = 18 + i * 32, lo = x < 716 ? 306 : 270, y = lo + ((i * 53) % (x < 716 ? 100 : 130)); return `<line x1="${x}" y1="${y}" x2="${x - 6}" y2="${y + 16}" style="animation-delay:${((i * 0.137) % 0.7).toFixed(2)}s"/>`; }).join("");

  /* households */
  const rings = [], dots = [];
  const houses = HOUSES.map((h, i) => {
    const layers = [`<g class="ly l${i}a">` + `<circle r="12" stroke="${RIM.ask}"/>${GL.ask}</g>`];
    keys.push(popped(`l${i}a`, 1 + i * 1.2, h.seq[0][1])); run(`.l${i}a`, `l${i}a`);
    h.seq.forEach(([k, a, b], j) => {
      const still = a <= STILL && STILL < b;
      layers.push(`<g class="ly l${i}${j}${still ? " fin" : ""}"><circle r="12" stroke="${RIM[k]}"/>${GL[k]}</g>`);
      keys.push(popped(`l${i}${j}`, a, b)); run(`.l${i}${j}`, `l${i}${j}`);
    });
    const lifted = h.lift && h.lift[1] <= STILL;
    if (h.lift) {
      const up = `transform:translateY(-${LIFT}px)`, dn = "transform:translateY(0)";
      keys.push(frames(`b${i}`, [[0, dn], [h.lift[0], dn], [h.lift[1], up], [96, up], [99.5, dn], [100, dn]]),
        frames(`s${i}`, [[0, `stroke-dashoffset:${LIFT}`], [h.lift[0], `stroke-dashoffset:${LIFT}`], [h.lift[1], "stroke-dashoffset:0"], [96, "stroke-dashoffset:0"], [99.5, `stroke-dashoffset:${LIFT}`], [100, `stroke-dashoffset:${LIFT}`]]));
      run(`.b${i}`, `b${i}`, "ease-in-out"); run(`.s${i}`, `s${i}`, "ease-in-out");
    }
    if (h.wet) {
      const pts = [[0, `fill:${WALL.dry}`]];
      for (const [year, kind] of h.wet) {
        const a = arrive(year, h.g), reset = FALL_TO[year] + 2;   /* the wall goes back to dry once the water has left, in both years */
        pts.push([a, `fill:${WALL.dry}`], [a + 0.6, `fill:${WALL[kind]}`], [reset, `fill:${WALL[kind]}`], [reset + 1, `fill:${WALL.dry}`]);
        rings.push(`<g transform="translate(${h.x} ${h.g - 3})"><ellipse class="ring r${rings.length}" rx="34" ry="10" stroke="${WALL[kind]}"/></g>`);
        const n = rings.length - 1;
        keys.push(frames(`r${n}`, [[0, "opacity:0;transform:scale(.3)"], [a, "opacity:0;transform:scale(.3)"], [a + 0.4, "opacity:.9;transform:scale(.45)"], [a + 3.4, "opacity:0;transform:scale(1.8)"], [100, "opacity:0;transform:scale(1.8)"]]));
        run(`.r${n}`, `r${n}`);
        /* what the flood did travels up to the badge, which then changes */
        const next = h.seq.find(([, from]) => from > (year === 1 ? P.next1[0] : P.next2[0]) && from < (year === 1 ? P.next1[1] : P.next2[1]));
        if (next) {
          const e = next[1], s = e - 2.4, d = dots.length, lo = "transform:translateY(-12px)", hi = "transform:translateY(-104px)";
          dots.push(`<g transform="translate(${h.x} ${h.g})"><circle class="dot d${d}" r="5" fill="${WALL[kind]}"/></g>`);
          keys.push(frames(`d${d}`, [[0, `opacity:0;${lo}`], [s, `opacity:0;${lo}`], [s + 0.5, `opacity:1;${lo}`], [e - 0.2, `opacity:1;${hi}`], [e + 0.4, `opacity:0;${hi}`], [100, `opacity:0;${hi}`]]));
          run(`.d${d}`, `d${d}`);
        }
      }
      pts.push([100, `fill:${WALL.dry}`]);
      keys.push(frames(`w${i}`, pts)); run(`.w${i}`, `w${i}`);
      const now = h.wet.find(([year]) => year === 2);
      if (now) css.push(`.w${i}{fill:${WALL[now[1]]}}`);
    }
    return `<g class="hs${lifted ? " lifted" : ""}" transform="translate(${h.x} ${h.g}) scale(${S})"><path class="stilt s${i}" d="M-12 0V-${LIFT}M12 0V-${LIFT}"/><g class="bd b${i}"><rect class="wall w${i}" x="-17" y="-26" width="34" height="26" rx="3"/><path class="roof" d="M-23 -24L0 -45 23 -24Z"/><rect class="door" x="-4" y="-13" width="8" height="13" rx="1.5"/><g transform="translate(0 -66)">${layers.join("")}</g></g></g>`;
  }).join("");

  /* left: who */
  const chipW = Math.round(52 + tw(L.open, 11.4, 19));
  const left = `<rect x="64" y="34" width="${chipW}" height="36" rx="18" fill="#aee6c2" fill-opacity=".1" stroke="#aee6c2" stroke-opacity=".45"/><circle cx="84" cy="52" r="5" fill="#aee6c2"/><text x="98" y="58.5" class="m" font-size="19" fill="#d5ece0">${ex(L.open)}</text>
<text x="64" y="162" font-size="96" font-weight="600" letter-spacing="-3.4" fill="#ecf4f2">${ex(L.nameHead)}${L.nameTail ? `<tspan fill="#8de4e6">${ex(L.nameTail)}</tspan>` : ""}</text>
${lines(L.lead, 64, 218, 40,'font-size="30" font-weight="500" letter-spacing="-.6" fill="#ecf4f2"')}`;

  /* right: where the loop is now */
  const X0 = 740, CW = 476, steps = L.loop.steps.map((s, i) => `${i + 1} ${s}`), ws = steps.map((s) => Math.round(32 + tw(s, 10.2, 18)));
  const gap = Math.max(6, Math.min(10, Math.floor((CW - ws.reduce((a, b) => a + b, 0)) / (steps.length - 1))));
  let cx = X0;
  const rail = steps.map((s, i) => {
    const w = ws[i], t = `x="${w / 2}" y="25" text-anchor="middle" font-size="18" font-weight="600"`;
    const g = `<g transform="translate(${cx} 112)"><rect width="${w}" height="38" rx="19" fill="none" stroke="#ecf4f2" stroke-opacity=".25"/><text ${t} fill="#b9cfce">${ex(s)}</text><g class="on p${i + 1}"><rect width="${w}" height="38" rx="19" fill="#8de4e6"/><text ${t} fill="#06282c">${ex(s)}</text></g></g>`;
    cx += w + gap; return g;
  }).join("");
  const caps = L.loop.caps.map((c, i) => `<g class="cap p${i + 1}">${lines(even(wrapW, c, 43), X0, 196, 30, 'font-size="22" fill="#ecf4f2"')}</g>`).join("");
  const years = [1, 2].map((k) => `<text class="yr y${k} m" x="${X0 + CW}" y="92" text-anchor="end" font-size="18" letter-spacing="1.5" fill="#ecf4f2">${ex(L.loop.year(k))}</text>`).join("");
  const side = `<text x="${X0 + CW}" y="52" text-anchor="end" class="m" font-size="15" fill="#8fa9a8">${ex(L.loop.note)}</text>
<text x="${X0}" y="92" class="m" font-size="18" letter-spacing="1.5" fill="#8de4e6">${ex(L.loop.head)}</text>${years}${rail}${caps}`;
  keys.push(shown("p1", [P.ask]), shown("p2", [P.decide]), shown("p3", [P.flood1, P.flood2]), shown("p4", [P.next1, P.next2]), shown("y1", [[0, P.next1[0]]]), shown("y2", [[P.next1[0], 100]]));
  for (const k of ["p1", "p2", "p3", "p4", "y1", "y2"]) run(`.${k}`, k);

  /* legend, on the ground under the houses */
  const LY = H - 22, lt = (x, s) => `<text x="${x}" y="${LY}" class="m" font-size="17" fill="#b9cfce">${ex(s)}</text>`;
  let lx = 64, legend = "";
  for (const k of ["dry", "wet", "cov"]) { legend += `<rect x="${lx}" y="${LY - 13}" width="14" height="14" rx="3" fill="${WALL[k]}"/>` + lt(lx + 22, L.loop.legend[k]); lx += 22 + tw(L.loop.legend[k], 10.2, 17) + 26; }
  lx += 12;
  for (const k of ["wait", "ins", "up"]) { legend += `<g class="lg" transform="translate(${lx + 11} ${LY - 6}) scale(.92)"><circle r="12" stroke="${RIM[k]}"/>${GL[k]}</g>` + lt(lx + 30, L.loop.legend[k]); lx += 30 + tw(L.loop.legend[k], 10.2, 17) + 26; }

  /* a staff gauge standing in the river: the water level is read against it */
  const GX = 1190, gTicks = Array.from({ length: 7 }, (_, j) => `<path d="M${GX - 5} ${FLOOD - 14 + j * 18}h${j % 2 ? 6 : 10}" stroke="#ecf4f2" stroke-width="1.6" stroke-opacity="${j % 2 ? 0.55 : 0.9}"/>`).join("");
  const gauge = `<rect x="${GX - 7}" y="${FLOOD - 30}" width="14" height="${GP[GP.length - 1][1] - FLOOD + 30}" rx="3" fill="#0c2228" stroke="#8de4e6" stroke-opacity=".6"/>${gTicks}`;
  const contours = Array.from({ length: 6 }, (_, j) => `<ellipse class="cn" cx="1010" cy="130" rx="${90 + j * 62}" ry="${44 + j * 32}" transform="rotate(-12 1010 130)"/>`).join("");
  const body = `<defs><clipPath id="br"><rect width="${W}" height="${H}" rx="28"/></clipPath><pattern id="bd" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="14" cy="14" r="1" fill="#ecf4f2" opacity=".09"/></pattern>
<radialGradient id="bh" cx=".85" cy="0" r="1"><stop offset="0" stop-color="#14434c"/><stop offset=".7" stop-color="#081316"/></radialGradient>
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#11363d"/><stop offset="1" stop-color="#071417"/></linearGradient>
<clipPath id="bc"><path d="M0 0H${W}V${GP[GP.length - 1][1]}${gBack}Z"/></clipPath></defs>
<g clip-path="url(#br)"><rect width="${W}" height="${H}" fill="url(#bh)"/><rect width="${W}" height="${H}" fill="url(#bd)"/>${contours}
<path class="hill" d="M0 392C180 340 340 366 500 346S820 280 1020 330 1200 316 1280 304V${H}H0Z"/><path class="hill" d="M0 414C240 392 400 416 640 392S1040 380 1280 366V${H}H0Z"/>
<rect class="dim" width="${W}" height="${H}" fill="#020608"/>
${water("bk")}<path d="${gTop}V${H}H0Z" fill="url(#bg)"/><path class="grl" d="${gTop}"/>
${gauge}
${legend}
${houses}
${rings.join("")}
<g clip-path="url(#bc)">${water("fr")}</g><g class="rain">${rain}</g>
${dots.join("")}
${left}
${side}</g>`;

  const base = `.hill{fill:#fff;opacity:.04}.cn{fill:none;stroke:#fff;opacity:.05}.grl{fill:none;stroke:#8de4e6;stroke-opacity:.55;stroke-width:1.5}
.wave.bk{fill:#35b6c4}.wave.fr{fill:#8de4e6;opacity:.34}
.stilt{fill:none;stroke:#cfe9e8;stroke-width:2.5;stroke-linecap:round;stroke-dasharray:${LIFT};stroke-dashoffset:${LIFT}}
.wall{fill:${WALL.dry}}.roof{fill:#8de4e6}.door{fill:#0c2228}
.ly circle,.lg circle{fill:#0c2228;stroke-width:1.5}.ly path,.ly rect,.lg path{fill:none;stroke:#ecf4f2;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.rain line{stroke:#8de4e6;stroke-width:1.4;stroke-linecap:round}.ring{fill:none;stroke-width:2}
.ly,.on,.cap,.yr,.rain,.dim,.ring,.dot{opacity:0}
.wtr{transform:translateY(-${RISE}px)}.fin,.p3,.y2{opacity:1}.lifted .bd{transform:translateY(-${LIFT}px)}.lifted .stilt{stroke-dashoffset:0}${css.join("")}`;
  return svg(W, H, body, L.bannerAlt, `${base}\n@media (prefers-reduced-motion:no-preference){${motion.join("")}}\n${keys.join("")}`);
}

/* ---------- research-direction tiles ---------- */
const TW_ = 405, TG = 12, PADX = 28, FIGW = TW_ - 2 * PADX, FIGH = 116;
const badge = (x, y, k, r = 15) => `<g transform="translate(${x} ${y}) scale(${r / 12})"><circle r="12" fill="#0c2228" stroke="${RIM[k]}" stroke-width="1.5"/><g fill="none" stroke="#ecf4f2" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${GL[k]}</g></g>`;
/* each figure is drawn in a FIGW x FIGH box; `fl` lines carry dashes that move along the line */
const FIGS = {
  /* survey items -> latent factors -> the choices people report */
  behavior: (fg) => {
    const ys = [16, 58, 100], lat = [[150, 34], [150, 82]], out = [["wait", 16], ["ins", 58], ["up", 100]];
    const edges = ys.flatMap((y) => lat.map(([lx, ly]) => `M26 ${y}L${lx - 17} ${ly}`)).concat(lat.flatMap(([lx, ly]) => out.map(([, oy]) => `M${lx + 17} ${ly}L302 ${oy}`)));
    return `<path class="fl" d="${edges.join("")}" stroke="${fg}" stroke-opacity=".55"/>` +
      ys.map((y) => `<rect x="0" y="${y - 11}" width="24" height="22" rx="5" fill="none" stroke="${fg}" stroke-width="1.8"/><path d="M6 ${y - 3}h12M6 ${y + 3}h8" stroke="${fg}" stroke-width="1.6" stroke-linecap="round"/>`).join("") +
      lat.map(([lx, ly]) => `<circle cx="${lx}" cy="${ly}" r="17" fill="${fg}" fill-opacity=".1" stroke="${fg}" stroke-width="1.8"/>`).join("") + out.map(([k, oy]) => badge(318, oy, k)).join("");
  },
  /* one human pathway, and the same pathway from repeated LLM runs: do they end in the same place? */
  evaluation: (fg, mu, fig, gi) => {
    const runs = [[80, 80], [72, 86], [88, 74]].map(([c, e], i) => `<path class="run n${i}" d="M44 88C110 88 126 58 180 58S250 ${c} 292 ${e}" stroke="${fg}"/>`).join("");
    return `${gi("person", 0, 8, 34, fg)}${gi("robot", 0, 70, 34, fg)}
<text x="46" y="14" class="m" font-size="15" fill="${mu}">${fig.human}</text><text x="46" y="112" class="m" font-size="15" fill="${mu}">${fig.llm}</text>
<path d="M44 26C110 26 126 58 180 58S250 36 292 36" fill="none" stroke="${fg}" stroke-width="2.6" stroke-linecap="round"/>${runs}
<circle cx="298" cy="36" r="6" fill="${fg}"/><circle cx="298" cy="80" r="6" fill="none" stroke="${fg}" stroke-width="2"/>
<path d="M310 36h8v44h-8" fill="none" stroke="${fg}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><text x="328" y="66" font-size="22" font-weight="600" fill="${fg}">?</text>`;
  },
  /* an agent and its environment: the decision goes one way, what the flood did comes back */
  coupled: (fg, mu, fig, gi) => `<rect x="0" y="28" width="84" height="60" rx="14" fill="${fg}" fill-opacity=".08" stroke="${fg}" stroke-width="1.8"/>${gi("robot", 25, 41, 34, fg)}
<rect x="265" y="28" width="84" height="60" rx="14" fill="${fg}" fill-opacity=".08" stroke="${fg}" stroke-width="1.8"/>
<path d="M300 40l7 10a8 8 0 1 1-14 0z" fill="none" stroke="${fg}" stroke-width="1.8" stroke-linejoin="round"/><path class="wv" d="M277 72q7.5 -6 15 0t15 0 15 0 15 0" fill="none" stroke="${fg}" stroke-width="2" stroke-linecap="round"/>
<path class="fl" d="M84 42C140 2 209 2 265 42" stroke="${fg}"/><path d="M-9 -5L0 0-9 5" transform="translate(265 42) rotate(36)" fill="none" stroke="${fg}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path class="fl" d="M265 74C209 114 140 114 84 74" stroke="${fg}"/><path d="M-9 -5L0 0-9 5" transform="translate(84 74) rotate(216)" fill="none" stroke="${fg}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<text x="174.5" y="46" text-anchor="middle" class="m" font-size="15" fill="${mu}">${fig.decision}</text><text x="174.5" y="80" text-anchor="middle" class="m" font-size="15" fill="${mu}">${fig.feedback}</text>`,
};
const TILE_CSS = `.fl{fill:none;stroke-width:1.8;stroke-linecap:round;stroke-dasharray:4 8}.run{fill:none;stroke-width:2;stroke-linecap:round;stroke-dasharray:5 6;opacity:.3}.run.n0{opacity:1}
@media (prefers-reduced-motion:no-preference){.fl{animation:fl 1.1s linear infinite}.run{animation:run 3.6s linear infinite}.run.n1{animation-delay:-2.4s}.run.n2{animation-delay:-1.2s}.wv{animation:wv 2.4s ease-in-out infinite alternate}}
@keyframes fl{to{stroke-dashoffset:-12}}@keyframes run{0%,28%{opacity:1}36%,92%{opacity:.22}100%{opacity:1}}@keyframes wv{to{transform:translateY(-5px)}}`;

/* Wraps to the width, then narrows the lines while the line count stays the same, so the last line is not a lone word. */
export const even = (wrapW, s, max) => { let best = wrapW(s, max); for (let m = max - 1; m > max / 2; m--) { const w = wrapW(s, m); if (w.length > best.length) break; best = w; } return best; };

/* Returns the row: [{ file, svg, share, alt, key }]. All three tiles get the height of the tallest one;
   a shorter one moves its text to the bottom and centres its figure in the room that is left. */
export function topicTiles(svg, L, topics, { ex, wrapW, lines, PAL, gi }) {
  const fig = Object.fromEntries(Object.entries(L.fig).map(([k, v]) => [k, ex(v)]));
  const built = topics.map((t, i) => {
    const [bg, fg, mu] = PAL[t.pal], loc = L.topics[i], last = i === topics.length - 1;
    const tl = even(wrapW, loc.title, Math.floor(FIGW / 17.9)), ql = loc.qLines || even(wrapW, loc.q, Math.floor(FIGW / 11.2)), hl = loc.howLines || even(wrapW, loc.how, Math.floor(FIGW / 9.9));
    const textH = tl.length * 36 + 4 + ql.length * 29 + 8 + hl.length * 26, h = 76 + FIGH + 30 + textH + 18;
    const draw = (Ht) => {
      const slack = Ht - h; let y = 76 + FIGH + 30 + slack + 28, b = "";
      b += lines(tl, PADX, y, 36, `font-size="30" font-weight="600" letter-spacing="-.8" fill="${fg}"`); y += tl.length * 36 + 4;
      b += lines(ql, PADX, y - 6, 29, `font-size="21" font-weight="500" fill="${fg}"`); y += ql.length * 29 + 8;
      b += lines(hl, PADX, y - 8, 26, `font-size="18.5" fill="${mu}"`);
      const Wt = TW_ + (last ? 0 : TG), x0 = i ? 0 : 64;
      /* the line that joins the tiles: it enters from the left edge, passes the number, and leaves on the right */
      const line = `<path class="fl" d="M${x0} 40H${last ? TW_ - 34 : TW_}" stroke="${fg}" stroke-opacity=".6"/>` + (last ? `<path d="M-9 -5L0 0-9 5" transform="translate(${TW_ - 30} 40)" fill="none" stroke="${fg}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>` : `<path class="fl" d="M${TW_} 40H${Wt}" stroke="#8b949e"/>`);
      const num = `<circle cx="46" cy="40" r="18" fill="${fg}"/><text x="46" y="46" text-anchor="middle" class="m" font-size="16" font-weight="600" fill="${bg}">${String(i + 1).padStart(2, "0")}</text>`;
      return svg(Wt, Ht, `<rect width="${TW_}" height="${Ht}" rx="28" fill="${bg}"/>${line}${num}<g transform="translate(${PADX} ${76 + slack / 2})">${FIGS[t.key](fg, mu, fig, gi)}</g>${b}`, loc.alt, TILE_CSS);
    };
    return { t, h, draw, loc };
  });
  const Ht = Math.max(...built.map((b) => b.h)), total = topics.length * TW_ + (topics.length - 1) * TG;
  return built.map((b, i) => ({ key: b.t.key, stage: b.t.stage, file: `topic-${b.t.key}.svg`, svg: b.draw(Ht), share: (TW_ + (i === topics.length - 1 ? 0 : TG)) / total, alt: b.loc.alt }));
}
