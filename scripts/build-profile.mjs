#!/usr/bin/env node
/* Builds the GitHub profile: assets/profile/<locale>/*.svg plus README.md and README.zh-TW.md.
   Drawing code only; the hand-written text is in profile-content.mjs and the numbers are in profile-data.json.
   Zero dependencies. `node scripts/build-profile.mjs` builds offline from profile-data.json;
   `--refresh` first fetches the numbers from the GitHub API, validates them, and writes nothing if anything fails. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import defaultContent from "./profile-content.mjs";
import { bannerSvg, topicTiles, even } from "./profile-figures.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const DATA_FILE = "scripts/profile-data.json";

/* ---------- small helpers ---------- */
const n = (v) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const kfmt = (s) => (s >= 100000 ? Math.round(s / 1000) + "k" : s >= 1000 ? (s / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(s));
const ex = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const exAttr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const f1 = (v) => (+v).toFixed(1);
const CJK = /[⺀-鿿＀-￯　-〿]/;
/* width in "ascii units": a CJK character counts 2 */
const cw = (s) => [...s].reduce((k, ch) => k + (CJK.test(ch) ? 2 : 1), 0);
/* text width in px, with separate per-character widths for ascii and CJK */
const tw = (s, a, c) => [...s].reduce((k, ch) => k + (CJK.test(ch) ? c : a), 0);
const CLOSE = "，。、；：？！）」』》,.;:?!)";
const OPEN = "（「『《(";
/* split into wrap tokens: a word of non-CJK characters, or one CJK character (closing punctuation sticks to the token before it).
   A word ends at CJK punctuation, so "Zotero、Obsidian" is two tokens and can break between them. */
const tokens = (s) => {
  const out = []; let sep = false;
  for (const ch of s) {
    if (ch === " ") { sep = true; continue; }
    const last = out[out.length - 1];
    if (CJK.test(ch)) {
      if (CLOSE.includes(ch) && last && !sep) { last.t += ch; last.end = true; }
      else if (last && OPEN.includes(last.t) && !sep) last.t += ch;
      else out.push({ t: ch, sep, cjk: true });
    } else if (last && !last.cjk && !sep && !last.end) last.t += ch;
    else if (last && last.cjk && !sep && !OPEN.includes(ch) && CLOSE.includes(ch)) last.t += ch;
    else out.push({ t: ch, sep, cjk: false });
    sep = false;
  }
  return out;
};
const wrapW = (s, max) => {
  const out = []; let cur = "";
  for (const k of tokens(s)) { const nx = cur ? cur + (k.sep ? " " : "") + k.t : k.t; if (cw(nx) > max && cur) { out.push(cur); cur = k.t; } else cur = nx; }
  if (cur) out.push(cur);
  return out;
};
const nameLines = (s, max) => { const out = []; let cur = ""; for (const p of s.split(/(?<=[-/_])/)) { if (cur && (cur + p).length > max) { out.push(cur); cur = p; } else cur += p; } if (cur) out.push(cur); return out; };
const pct = (row) => row.map((t) => Math.floor(t.share * 10000) / 100);

/* ---------- tiles whose area follows a number (the website's layout) ---------- */
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => "#" + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, "0")).join("");
const lum = (h) => { const [r, g, b] = hex(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ramp = (stops) => (t) => { t = Math.max(0, Math.min(1, t)); const k = t * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(k)); return mix(stops[i], stops[i + 1], k - i); };
const ink = (bg, dark, light) => { const L = lum(bg), cd = (L + 0.05) / (lum(dark) + 0.05), cl = (lum(light) + 0.05) / (L + 0.05); return cd >= cl ? dark : light; };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
/* [background, ink, soft ink]. A mid-tone background is moved away from its ink until the pair reaches 4.6:1 (WCAG AA is 4.5:1),
   so the text stays readable whatever the number is; the soft ink is the ink mixed toward the background as far as 4.6:1 allows.
   Same rule as the website's home/tiles.cjs. */
const tone = (stops, dark, light) => (v, max) => { let bg = ramp(stops)((v / max) ** 0.65); const fg = ink(bg, dark, light);
  for (let k = 0; k < 24 && ratio(bg, fg) < 4.6; k++) bg = mix(bg, fg === light ? "#000000" : "#ffffff", 0.05);
  const soft = [0.2, 0.15, 0.1, 0.05].map((t) => mix(fg, bg, t)).find((c) => ratio(c, bg) >= 4.6) || fg;
  return [bg, fg, soft]; };
const starTone = tone(["#12292f", "#8de4e6", "#f7d67f"], "#06282c", "#ecf4f2");
const irisTone = tone(["#1a1c3a", "#d3d0fb"], "#1b1a3c", "#ecf4f2");
const layout = (items, rows, total) => {
  const sorted = items.slice().sort((a, b) => b.v - a.v).map((x) => ({ ...x, w: Math.sqrt(x.v) })), max = sorted[0].v, out = []; let k = 0;
  for (const cnt of rows) { if (k >= sorted.length) break; const part = sorted.slice(k, k + cnt); k += cnt; out.push({ items: part, sum: part.reduce((a, x) => a + x.w, 0) }); }
  const all = out.reduce((a, r) => a + r.sum, 0);
  out.forEach((r) => { r.h = Math.round(total * r.sum / all); r.items.forEach((x) => { x.u = Math.sqrt(x.v / max); x.share = x.w / r.sum; }); });
  return { rows: out, max };
};

/* ---------- icons (48 box, stroke = currentColor) ---------- */
const IC = {
  robot: `<rect x="10" y="15" width="28" height="22" rx="7"/><path d="M24 15V9M10 23H6v7h4M38 23h4v7h-4M19 31h10"/><circle cx="24" cy="7" r="2"/><circle cx="18.5" cy="24.5" r="2.4" class="fillc"/><circle cx="29.5" cy="24.5" r="2.4" class="fillc"/>`,
  env: `<path d="M9 25 24 11l15 14M14 21v12M34 21v12M21 33v-7h6v7"/><path d="M3 38c4-3 6.500-3 10.500 0s6.500 3 10.500 0 6.500-3 10.500 0 6.500 3 10.500 0M3 44c4-3 6.500-3 10.500 0s6.500 3 10.500 0 6.500-3 10.500 0 6.500 3 10.500 0"/>`,
  person: `<circle cx="24" cy="15" r="7.500"/><path d="M9 42c0-9.500 6.500-14 15-14s15 4.500 15 14"/>`,
  board: `<rect x="5" y="8" width="38" height="28" rx="4"/><path d="M18 8v28M30 8v28M9 15h5M9 21h5M22 15h4M34 15h5M34 21h5M34 27h5M17 42h14"/>`,
  map: `<path d="M6 13l11-4 14 4 11-4v26l-11 4-14-4-11 4zM17 9v26M31 13v26"/>`,
  paper: `<path d="M12 5h17l9 9v29H12zM29 5v9h9M18 23h14M18 30h14M18 37h9"/>`,
  book: `<path d="M24 12c-4-3-9-4-16-4v29c7 0 12 1 16 4 4-3 9-4 16-4V8c-7 0-12 1-16 4zM24 12v29"/>`,
  mail: `<rect x="5" y="10" width="38" height="28" rx="4"/><path d="M6 13l18 14 18-14"/>`,
  coffee: `<path d="M9 19h27v11c0 6-5 11-11 11h-5c-6 0-11-5-11-11zM36 22h2.500a5 5 0 0 1 0 10H36M16 6v6M22.500 6v6M29 6v6"/>`,
};
const BRP = {
  linkedin: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  scholar: "M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z",
};
const bi = (k, z) => `<svg class="ic" viewBox="0 0 24 24" width="${z}" height="${z}" style="fill:currentColor;stroke:none" aria-hidden="true"><path d="${BRP[k]}"/></svg>`;
const nest = (k, x, y, z, col) => bi(k, z).replace("<svg ", `<svg x="${x}" y="${y}" color="${col}" `).replace('class="ic"', "").replace(/style="[^"]*"/, `fill="${col}"`);
const gi = (k, x, y, s, col) => `<g transform="translate(${x} ${y}) scale(${s / 48})" style="color:${col}" fill="none" stroke="${col}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${IC[k]}</g>`;

/* ---------- SVG frame ---------- */
const PAL = { ink: ["#10242a", "#ecf4f2", "#a3b8b7", "#8de4e6"], deep: ["url(#dg)", "#ecf4f2", "#b9cfce", "#8de4e6"], aqua: ["#8de4e6", "#06282c", "#2a5b60", "#06282c"], sand: ["#f3ead6", "#1b2527", "#5c635f", "#1b2527"], iris: ["#d3d0fb", "#1b1a3c", "#4f4d7c", "#1b1a3c"], sun: ["#f7d67f", "#2a2106", "#6b5a26", "#2a2106"], moss: ["#aee6c2", "#0c2a1a", "#3d6650", "#0c2a1a"] };
const DEFS = `<linearGradient id="dg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#13444d"/><stop offset=".75" stop-color="#0b2026"/></linearGradient>`;
const MONO = `ui-monospace,"SF Mono","Cascadia Mono",Consolas,monospace`;
const makeSvg = (L) => {
  const DISP = `"Bricolage Grotesque","Segoe UI Variable Display","Segoe UI",system-ui,-apple-system,"Helvetica Neue",Arial,sans-serif${L.fontExtra}`;
  const BASE = `text{font-family:${DISP}}.m{font-family:${MONO}}.fillc{fill:currentColor;stroke:none}`;
  return (W, H, body, title, css = "") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><title>${ex(title)}</title><style>${BASE}${css}</style><defs>${DEFS}</defs>${body}</svg>`;
};
const lines = (arr, x, y, lh, attr) => arr.map((s, i) => `<text x="${x}" y="${y + i * lh}" ${attr}>${ex(s)}</text>`).join("");

/* ---------- validation ---------- */
export function validate(data, content = defaultContent) {
  const bad = (m) => { throw new Error(`profile data: ${m}`); };
  const isObj = (o) => o && typeof o === "object" && !Array.isArray(o);
  if (!isObj(data)) bad("not an object");
  if (typeof data.asOf !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(data.asOf)) bad(`asOf must be YYYY-MM-DD, got ${JSON.stringify(data.asOf)}`);
  const d = new Date(data.asOf + "T00:00:00Z");
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== data.asOf) bad(`asOf is not a real date: ${data.asOf}`);
  if (!isObj(data.own)) bad("own is missing");
  if (!isObj(data.ownForks)) bad("ownForks is missing");
  if (!isObj(data.upstream)) bad("upstream is missing");
  for (const r of content.own) {
    const s = data.own[r.name], f = data.ownForks[r.name];
    if (!Number.isInteger(s) || s <= 0) bad(`own stars for ${r.name} must be a positive integer, got ${JSON.stringify(s)}`);
    if (!Number.isInteger(f) || f < 0) bad(`forks for ${r.name} must be a non-negative integer, got ${JSON.stringify(f)}`);
  }
  for (const u of content.upstream) {
    const e = data.upstream[u.repo];
    if (!isObj(e)) bad(`upstream ${u.repo} is missing`);
    if (!Number.isInteger(e.stars) || e.stars <= 0) bad(`stars for ${u.repo} must be a positive integer, got ${JSON.stringify(e.stars)}`);
    if (!Number.isInteger(e.mergedPrs) || e.mergedPrs < 1) bad(`merged PRs for ${u.repo} must be an integer of at least 1, got ${JSON.stringify(e.mergedPrs)}`);
  }
  return data;
}

/* ---------- repo tiles: area and colour follow stars ---------- */
const repoTiles = (svg, L, list, forksOf) => {
  const lay = layout(list, [1, 2, 99], 720), FULL = 1240, G = 8;
  return lay.rows.map((row) => row.items.map((x, xi) => {
    const W = Math.round(x.share * FULL), H = row.h, w = W - (xi === row.items.length - 1 ? 0 : G), h = H - G, [bg, fg, soft] = starTone(x.v, lay.max), big = row.items.length === 1;
    let b = `<rect width="${w}" height="${h}" rx="${big ? 30 : 22}" fill="${bg}"/>`;
    if (big) {
      let cx = 36;
      b += `<rect x="36" y="34" width="60" height="60" rx="16" fill="${fg}" fill-opacity=".1"/>${gi(x.ic, 50, 48, 32, fg)}<text x="114" y="74" class="m" font-size="28" font-weight="600" fill="${fg}">${x.r}</text><text x="36" y="138" font-size="23" fill="${soft}">${ex(x.big || x.d)}</text>`;
      for (const lab of ["繁體中文", "简体中文", "English"]) {
        const cwid = (/[^\x00-\xff]/.test(lab) ? lab.length * 18 : lab.length * 10) + 30;
        b += `<rect x="${cx}" y="160" width="${cwid}" height="36" rx="18" fill="none" stroke="${fg}" stroke-opacity=".3"/><text x="${cx + cwid / 2}" y="184" text-anchor="middle" font-size="17" fill="${fg}">${lab}</text>`;
        cx += cwid + 10;
      }
      b += `<text x="30" y="${h - 36}" fill="${fg}"><tspan font-size="132" font-weight="600" letter-spacing="-5">${n(x.v)}</tspan><tspan dx="20" class="m" font-size="20">★ · ${ex(L.forks(n(forksOf(x.r))))}</tspan></text>`;
    } else {
      const pad = 18, ic = w >= 400, x0 = pad + (ic ? 54 : 0), fsN = 17, cwN = fsN * 0.61, fsS = Math.round(22 + x.u * 16), sw = String(n(x.v)).length * fsS * 0.6 + 26;
      let top = true, room = w - x0 - pad - sw - 10, nl = nameLines(x.r, Math.floor(room / cwN));
      if (nl.length > 1) { top = false; nl = nameLines(x.r, Math.floor((w - x0 - pad) / cwN)); }
      if (ic) b += `<rect x="${pad}" y="${pad - 2}" width="42" height="42" rx="12" fill="${fg}" fill-opacity=".1"/>${gi(x.ic, pad + 9, pad + 7, 24, fg)}`;
      nl.forEach((l, i) => { b += `<text x="${x0}" y="${pad + 24 + i * 23}" class="m" font-size="${fsN}" font-weight="600" fill="${fg}">${l}</text>`; });
      const nb = pad + 24 + (nl.length - 1) * 23 + 6, star = `<tspan font-size="${fsS}" font-weight="600" letter-spacing="-.6">${n(x.v)}</tspan><tspan dx="6" font-size="17" fill-opacity=".85">★</tspan>`;
      b += top ? `<text x="${w - pad}" y="${pad + 26}" text-anchor="end" fill="${fg}">${star}</text>` : `<text x="${pad}" y="${h - pad}" fill="${fg}">${star}</text>`;
      const dl = wrapW(x.d, Math.floor((w - 2 * pad) / 8.5)), yb = top ? h - pad : h - pad - fsS - 10;
      if (nb + 14 + dl.length * 22 <= yb + 6) dl.forEach((l, i) => { b += `<text x="${pad}" y="${yb - (dl.length - 1 - i) * 22}" font-size="17" fill="${soft}">${ex(l)}</text>`; });
    }
    const alt = L.repoAlt(x.r, (x.big || x.d).replace(/[.。]$/, ""), n(x.v));
    return { key: x.r, alt, share: x.share, file: `repo-${x.r}.svg`, svg: svg(W, H, b, alt) };
  }));
};

/* ---------- PR tiles: area follows merged PRs, colour follows that project's stars ---------- */
const prTiles = (svg, L, groups) => {
  const mx = Math.max(...groups.map((g) => g.stars)), lay = layout(groups.map((g) => ({ g, v: g.k })), [2, 2, 99], 720), FULL = 1240, G = 8;
  return lay.rows.map((row, ri) => {
    const big = ri === 0, pad = big ? 32 : 22, fsN = big ? 20 : 17, cwN = fsN * 0.61, fsD = big ? 19 : 17, lh = fsD + 6;
    const plan = row.items.map((x, xi) => {
      const g = x.g, W = Math.round(x.share * FULL), w = W - (xi === row.items.length - 1 ? 0 : G), k = g.k, fs = Math.round(36 + (k / lay.max) * 100), star = "★ " + g.starsK, sw = star.length * 10.4;
      let nl = nameLines(g.repo, Math.floor((w - 2 * pad - sw - 12) / cwN)), below = false;
      if (nl.length > 1) { nl = nameLines(g.repo, Math.floor((w - 2 * pad) / cwN)); below = true; }
      const dl = wrapW(g.did, Math.floor((w - 2 * pad) / (fsD * 0.5))), nb = pad + fsN + (nl.length - 1) * (fsN + 6) + (below ? 26 : 0);
      return { x, g, W, w, k, fs, star, nl, below, dl, nb, need: nb + 14 + fs * 0.76 + 14 + fsD + (dl.length - 1) * lh + pad + G };
    });
    const H = Math.max(row.h, Math.ceil(Math.max(...plan.map((t) => t.need)))), h = H - G;
    return plan.map((t) => {
      const { g, W, w, k, fs, nl, dl } = t, [bg, fg, soft] = irisTone(g.stars, mx), y1 = h - pad - (dl.length - 1) * lh;
      let b = '<rect width="' + w + '" height="' + h + '" rx="' + (big ? 28 : 22) + '" fill="' + bg + '"/>';
      nl.forEach((l, i) => { b += '<text x="' + pad + '" y="' + (pad + fsN + i * (fsN + 6)) + '" class="m" font-size="' + fsN + '" font-weight="600" fill="' + fg + '">' + l + "</text>"; });
      b += t.below ? '<text x="' + pad + '" y="' + t.nb + '" class="m" font-size="17" fill="' + soft + '">' + t.star + "</text>" : '<text x="' + (w - pad) + '" y="' + (pad + fsN) + '" text-anchor="end" class="m" font-size="17" fill="' + soft + '">' + t.star + "</text>";
      dl.forEach((l, i) => { b += '<text x="' + pad + '" y="' + (y1 + i * lh) + '" font-size="' + fsD + '" fill="' + soft + '">' + ex(l) + "</text>"; });
      b += '<text x="' + (pad - 2) + '" y="' + (y1 - fsD - 14) + '" fill="' + fg + '"><tspan font-size="' + fs + '" font-weight="600" letter-spacing="' + (-fs * 0.03).toFixed(1) + '">' + k + '</tspan><tspan dx="10" class="m" font-size="17" fill="' + soft + '">' + ex(k === 1 ? L.pr1 : L.prN) + "</tspan></text>";
      const alt = L.prAlt(g.repo, k, g.did);
      return { key: g.repo, g, alt, share: t.x.share, file: "pr-" + g.repo.split("/")[1] + ".svg", svg: svg(W, H, b, alt) };
    });
  });
};

/* ---------- buttons, research tiles (the banner and the research-direction tiles are in profile-figures.mjs) ---------- */

const pill = (svg, k, label, pal) => {
  const [bg, fg] = PAL[pal], W = Math.round(62 + tw(label, 9.6, 16.5));
  const icon = k === "website" ? gi("env", 16, 11, 24, fg) : k === "mail" ? gi("mail", 16, 11, 24, fg) : k === "cv" ? gi("paper", 16, 11, 24, fg) : k === "coffee" ? gi("coffee", 16, 11, 24, fg) : nest(k, 18, 13, 20, fg);
  return svg(W, 46, `<rect width="${W}" height="46" rx="23" fill="${bg}"/>${icon}<text x="48" y="29" font-size="16" font-weight="600" fill="${fg}">${ex(label)}</text>`, label);
};

/* A slim paper card: where the work stands and its question, nothing else (the full record is on Google Scholar).
   W is the card's width in drawing units; draw(H, gap) leaves `gap` empty units on the right, the space to the next card. */
const rcard = (svg, pal, ic, r, W) => {
  const [bg, fg] = PAL[pal], ql = r.qLines || even(wrapW, r.q, Math.floor((W - 56) / 13.2));
  const b = `${gi(ic, 26, 22, 26, fg)}<text x="62" y="41" class="m" font-size="16.5" fill="${fg}">${ex(r.chip)}</text>` + lines(ql, 28, 86, 30, `font-size="22" font-weight="600" letter-spacing="-.5" fill="${fg}"`);
  return { h: 86 + (ql.length - 1) * 30 + 30, draw: (H, gap = 0) => svg(W + gap, H, `<rect width="${W}" height="${H}" rx="22" fill="${bg}"/>${b}<text x="${W - 28}" y="42" text-anchor="end" font-size="22" font-weight="600" fill="${fg}">↗</text>`, r.alt) };
};

/* a row of tiles as README html: no whitespace between images, widths add up to at most 100% */
const rowHtml = (rows, p, href) => rows.map((row) => { const ws = pct(row); return row.map((t, i) => `<a href="${exAttr(href(t))}"><img src="${p}${t.file}" width="${ws[i]}%" alt="${exAttr(t.alt)}"></a>`).join(""); }).join("\n");

/* ---------- one locale ---------- */
function buildLocale(data, content, L) {
  const svg = makeSvg(L), files = new Map(), prefix = `assets/profile/${L.dir}/`, GHU = content.github;
  const kit = { ex, tw, wrapW, lines, PAL, gi };
  files.set("banner.svg", bannerSvg(svg, L, kit));
  const topicRow = topicTiles(svg, L, content.topics, kit);
  topicRow.forEach((t) => files.set(t.file, t.svg));
  const scholar = `https://scholar.google.com/citations?user=${content.scholarUser}&hl=${L.scholarHl}`;
  const pills = [["website", "aqua", L.home], ["scholar", "sand", scholar], ["linkedin", "iris", content.linkedin], ["mail", "sun", content.mail], ["cv", "moss", L.cv], ["coffee", "deep", content.coffee]];
  const pillOut = pills.map(([k, pal, href]) => { files.set(`btn-${k}.svg`, pill(svg, k, L.buttons[k], pal)); return [k, L.buttons[k], href]; });

  /* the two papers share one slim row, half each */
  const RW = 1240, RG = 12, W1 = (RW - RG) / 2;
  const cards = [rcard(svg, content.research.wrr.pal, content.research.wrr.icon, L.wrr, W1), rcard(svg, content.research.abm.pal, content.research.abm.icon, L.abm, W1)];
  const H = Math.max(...cards.map((c) => c.h)), rw = [W1 + RG, W1].map((w) => Math.floor(w / RW * 10000) / 100);
  files.set("research-wrr.svg", cards[0].draw(H, RG)); files.set("research-floodabm.svg", cards[1].draw(H));

  const zh = L.dir !== "en";
  const repoRows = repoTiles(svg, L, content.own.map((r) => ({ r: r.name, ic: r.icon, d: zh ? r.zh : r.en, big: zh ? r.bigZh : r.bigEn, v: data.own[r.name] })), (name) => data.ownForks[name]);
  const groups = content.upstream.map((u) => ({ repo: u.repo, stars: data.upstream[u.repo].stars, starsK: kfmt(data.upstream[u.repo].stars), k: data.upstream[u.repo].mergedPrs, did: zh ? u.zh : u.en, pr: u.pr,
    list: `https://github.com/${u.repo}/pulls?q=is%3Apr+is%3Amerged+author%3A${content.login}` }));
  const prRows = prTiles(svg, L, groups);
  repoRows.flat().concat(prRows.flat()).forEach((t) => files.set(t.file, t.svg));

  const p = prefix, other = L.switchTo;
  const switchLine = L.dir === "en" ? `<p><b>English</b> · <a href="${other}">繁體中文</a></p>` : `<p><a href="${other}">English</a> · <b>繁體中文</b></p>`;
  const readme = `<!-- Generated by scripts/build-profile.mjs. Do not edit by hand: change the wording in scripts/profile-content.mjs and the numbers come from scripts/profile-data.json. -->
${switchLine}

<a href="${exAttr(L.home)}"><img src="${p}banner.svg" width="100%" alt="${exAttr(L.bannerAlt)}"></a>

<p>
${pillOut.map(([k, label, href]) => `<a href="${exAttr(href)}"><img src="${p}btn-${k}.svg" height="40" alt="${exAttr(label)}"></a>`).join("\n")}
</p>

<p>${ex(L.bio)}</p>

<h3>${ex(L.h.research)}</h3>
<p><b>${ex(L.question)}</b></p>
<p>
${topicRow.map((t) => `<a href="${exAttr(`${L.research}#observatory-stage-${t.stage}`)}"><img src="${p}${t.file}" width="${Math.floor(t.share * 10000) / 100}%" alt="${exAttr(t.alt)}"></a>`).join("")}
</p>
<p>
<a href="${exAttr(content.research.wrr.href)}"><img src="${p}research-wrr.svg" width="${rw[0]}%" alt="${exAttr(L.wrr.alt)}"></a><a href="${exAttr(L.floodabm)}"><img src="${p}research-floodabm.svg" width="${rw[1]}%" alt="${exAttr(L.abm.alt)}"></a>
</p>

<h3>${ex(L.h.projects)}</h3>
<p>
${rowHtml(repoRows, p, (t) => `${GHU}/${t.key}`)}
</p>

<h3>${ex(L.h.merged)}</h3>
<p>
${rowHtml(prRows, p, (t) => (t.g.k === 1 && t.g.pr ? t.g.pr : t.g.list))}
</p>

<h3>${ex(L.h.activity)}</h3>
<a href="${exAttr(L.actHref)}"><img src="${content.activity}activity-dam.svg" width="100%" alt="${exAttr(L.activityDam)}"></a>
<a href="${exAttr(L.actHref)}"><img src="${content.activity}activity-snake.svg" width="100%" alt="${exAttr(L.activitySnake)}"></a>

<sub>${ex(L.footer(data.asOf))} · <a href="${content.threads}">${ex(L.threads)}</a></sub>
`;
  return { files: [...files].map(([f, s]) => [prefix + f, s]), readme: [L.readme, readme] };
}

/* ---------- public: render(data, content) -> Map of relative path -> file text ---------- */
export function render(data, content = defaultContent) {
  validate(data, content);
  const out = new Map();
  for (const L of Object.values(content.locales)) {
    const r = buildLocale(data, content, L);
    r.files.forEach(([f, s]) => out.set(f, s));
    out.set(r.readme[0], r.readme[1]);
  }
  return out;
}

/* ---------- public: refresh(fetchImpl, token) -> fresh data, or throws ---------- */
export async function refresh(fetchImpl, token, content = defaultContent, now = new Date()) {
  const headers = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "profile-tiles-refresh" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const get = async (url) => {
    let res;
    try { res = await fetchImpl(url, { headers }); } catch (e) { throw new Error(`GET ${url} failed: ${e && e.message ? e.message : e}`); }
    if (!res || !res.ok) throw new Error(`GET ${url} failed: HTTP ${res && res.status}`);
    return res.json();
  };
  const data = { asOf: now.toISOString().slice(0, 10), own: {}, ownForks: {}, upstream: {} };
  for (const r of content.own) {
    const j = await get(`https://api.github.com/repos/${content.login}/${r.name}`);
    data.own[r.name] = j.stargazers_count; data.ownForks[r.name] = j.forks_count;
  }
  for (const u of content.upstream) {
    const j = await get(`https://api.github.com/repos/${u.repo}`);
    const s = await get(`https://api.github.com/search/issues?q=repo:${u.repo}+is:pr+is:merged+author:${content.login}`);
    if (s.incomplete_results) throw new Error(`search for ${u.repo} returned incomplete results`);
    data.upstream[u.repo] = { stars: j.stargazers_count, mergedPrs: s.total_count };
  }
  validate(data, content);
  return data;
}

/* ---------- CLI ---------- */
const defaultIo = {
  read: (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8"),
  write: (rel, text) => { const f = path.join(ROOT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text, "utf8"); },
  fetchImpl: (...a) => globalThis.fetch(...a),
  token: process.env.GITHUB_TOKEN,
  log: (m) => console.log(m),
  err: (m) => console.error(m),
};
export async function main(argv = [], io = {}, content = defaultContent) {
  const o = { ...defaultIo, ...io };
  try {
    let data, fresh = false;
    if (argv.includes("--refresh")) { data = await refresh(o.fetchImpl, o.token, content); fresh = true; }
    else { data = JSON.parse(o.read(DATA_FILE)); validate(data, content); }
    const files = render(data, content); /* everything is built in memory first: a failure above writes nothing */
    if (fresh) o.write(DATA_FILE, JSON.stringify(data, null, 2) + "\n");
    for (const [f, s] of files) o.write(f, s);
    o.log(`profile: ${files.size} files${fresh ? ", numbers refreshed " + data.asOf : ""}`);
    return 0;
  } catch (e) {
    o.err(`profile build failed: ${e && e.message ? e.message : e}`);
    return 1;
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).then((c) => { process.exitCode = c; });
}
