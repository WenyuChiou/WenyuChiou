/* Hand-written content of the GitHub profile README and its tiles (English and Traditional Chinese).
   scripts/build-profile.mjs draws the SVG files and both READMEs from this file plus scripts/profile-data.json (the numbers).
   Wording comes from the website (home/render.cjs and home/prs.cjs in the wenyuchiou.github.io repo); copy it, do not reword it.
   A string marked NO-ZH below has no Traditional Chinese version on the website yet, so it stays English in the zh README. */

const SITE = "https://wenyuchiou.github.io";
const DOI = "https://doi.org/10.1029/2025WR042111";
const ACTIVITY = "https://raw.githubusercontent.com/WenyuChiou/wenyuchiou.github.io/standalone-portfolio/assets/commit-maps/";

/* ---------- strings shared by both locales ---------- */
/* Research directions. The three names are Wenyu's own (2026-11-12). Each question and method is the wording of
   one stage on the website's Research page (content.en.js / content.zh-TW.js, `observatory.stages`), and `stage`
   is that stage's id, which the tile links to. The first method line joins the two survey stages (human-evidence
   and decision-pathways). The third tile's question and link are the external-feedback stage's; its method line is
   the behavioral-simulation stage's, because that line names the coupled model itself. */
const TOPICS = [
  { key: "behavior", stage: "human-evidence", pal: "sand", en: "Behavioral analysis", zh: "行為分析",
    enQ: "What do people report doing under flood risk?", zhQ: "人們在面臨洪災風險時|會採取什麼行動？",
    enHow: "Survey design, psychometrics, and multi-group structural equation modeling.", zhHow: "問卷設計、心理計量學，|以及多群體結構方程式模型 (SEM)。" },
  { key: "evaluation", stage: "llm-evaluation", pal: "iris", en: "AI evaluation", zh: "AI 評估",
    enQ: "Do generated decisions correspond to measured human pathways?", zhQ: "生成的決策是否與|實測的人類路徑相符？",
    enHow: "Human-versus-LLM pathway comparison with repeated-run stability checks.", zhHow: "比較人類與 LLM 的路徑，|並進行重複執行的穩定性檢查。" },
  { key: "coupled", stage: "external-feedback", pal: "aqua", en: "Coupled AI and environment systems", zh: "耦合 AI 與環境系統",
    enQ: "What changes after a decision enters the coupled environment?", zhQ: "當決策進入耦合環境後，|會發生什麼改變？",
    enHow: "Agent-based modeling coupled to a catastrophe model.", zhHow: "結合巨災模型的代理人基模型 (ABM)。" },
];
/* The banner plays the four steps of the website's hero (home/render.cjs, `phases`): step names and captions are copied from there,
   the legend is the hero's legend, and wait / insure / adapt are the three choices its second caption names. */
const LOOP = {
  en: { head: "RESEARCH LOOP", year: (k) => `YEAR ${k}`, steps: ["Ask", "Decide", "Flood", "Next year"],
    caps: ["It starts with a survey: what would your household do before the next flood?", "Agents carry those choices into the model: adapt, insure, or wait.", "Then the river answers. Same water, different outcomes.", "Damage and payouts shape what each household can do next."],
    legend: { dry: "dry", wet: "flooded", cov: "flooded, insured", wait: "wait", ins: "insure", up: "adapt" },
    note: "Illustration, not model output",
    alt: "Illustration: households on a floodplain decide, the river rises, and the outcome feeds the next decision." },
  zh: { head: "研究循環", year: (k) => `第 ${k} 年`, steps: ["問", "決定", "淹水", "下一年"],
    caps: ["從問卷開始：下一次淹水前，你家會怎麼做？", "代理把這些選擇帶進模型：調適、買保險，或先等等。", "接著換河流回答。同一場水，結果不一樣。", "損失和理賠，決定每一戶下一步還能做什麼。"],
    legend: { dry: "沒淹", wet: "淹水", cov: "淹水但有保險", wait: "先等等", ins: "買保險", up: "調適" },
    note: "示意圖，不是模型結果",
    alt: "示意圖：洪泛平原上的家戶做決定，河水上漲，結果再影響下一次決定。" },
};
/* Labels inside the research-direction figures: the words of the Research page's stages (human, LLM; a decision goes in, damage and payout come back). */
const FIG = {
  en: { human: "human", llm: "LLM", decision: "decision", feedback: "damage · payout" },
  zh: { human: "人類", llm: "LLM", decision: "決策", feedback: "損失 · 理賠" },
};
/* Background paragraph. First sentence: the earlier profile README. The rest: the website's About page (aboutPage.bio, first two paragraphs). */
const BIO = {
  en: "Originally from Taiwan, now based in Bethlehem, Pennsylvania. I do my doctoral research in Civil & Environmental Engineering at Lehigh University, in the Complex Adaptive Water Systems Lab. I began with empirical human behavior and human–water systems: survey design, psychometrics, and coupled flood-risk simulation. That foundation now informs how I evaluate generated behavior and design constraint-checked agent systems.",
  zh: "來自台灣，目前居住在美國賓州 Bethlehem。我在理海大學 (Lehigh University) 土木與環境工程系的複雜適應水系統實驗室 (Complex Adaptive Water Systems Lab) 做博士研究。我的研究起點是人類行為與人類—水系統的實證研究：問卷設計、心理計量學，以及人類—洪災耦合風險模擬。這些基礎現在指引了我如何評估模型生成的行為，並設計具備限制檢查的代理系統。",
};
/* The two paper cards carry only where the work stands and its question (Wenyu 2026-11-12: keep them small, no
   authorship lines; the full record is on Google Scholar). */
const WRR = {
  enChip: "Published · Water Resources Research, 2026",
  zhChip: "已發表 · Water Resources Research，2026",
  enQ: "Can LLM agents stand in for households in a human–water simulation?",
  zhQ: "在人水系統模擬裡，|LLM 代理能扮演家戶嗎？",   /* "|" marks where the line may break in the card; it is not part of the text */
};
const ABM = {
  enChip: "In revision · Water Resources Research",
  zhChip: "修改中 · Water Resources Research",
  enQ: "FLOODABM: what do household flood choices cost over time?",
  zhQ: "FLOODABM：家戶面對洪災的選擇，|長期下來要付出什麼？",
};

export const content = {
  github: "https://github.com/WenyuChiou",
  login: "WenyuChiou",
  activity: ACTIVITY,
  mail: "mailto:wec324@lehigh.edu",
  linkedin: "https://www.linkedin.com/in/wenyu-chiou",
  scholarUser: "vSQ3zT4AAAAJ",
  coffee: "https://buymeacoffee.com/wenyuchiou",
  threads: "https://www.threads.com/@wenyu_chiou",

  /* the eight repositories of mine that get a tile; the order here only breaks ties, tile size follows stars */
  own: [
    { name: "awesome-agentic-ai-zh", icon: "map", en: "A learning map for agentic AI, in three languages", zh: "三種語言的 AI agent 學習地圖",
      /* the flagship tile shows the longer line the website shows on its own flagship tile */
      bigEn: "A learning map for agentic AI that I write and maintain in three languages.", bigZh: "我自己寫、自己維護的 AI agent 學習地圖，三種語言。" },
    { name: "agent-board", icon: "board", en: "One board that shows what every agent is doing", zh: "一個看板，看到每個代理正在做什麼" },
    { name: "agent-collab-skills", icon: "person", en: "Split, merge and accept multi-agent work", zh: "多代理工作的拆分、整合與驗收" },
    { name: "codex-delegate", icon: "robot", en: "Hand coding work to Codex CLI and get a checked result back", zh: "把程式工作交給 Codex CLI，拿回可檢查的結果" },
    { name: "research-hub", icon: "book", en: "Zotero, Obsidian and NotebookLM in one workspace", zh: "把 Zotero、Obsidian、NotebookLM 接成一個工作區" },
    { name: "ai-research-skills", icon: "book", en: "A catalog of skills for research workflows", zh: "研究流程用的技能目錄" },
    { name: "academic-writing-skills", icon: "paper", en: "Paper writing and revision with claims tied to evidence", zh: "論文寫作與修訂，主張都對得上證據" },
    { name: "zotero-skills", icon: "paper", en: "Manage Zotero references by script", zh: "用程式管理 Zotero 文獻" },
  ],

  /* projects of other people that took my pull requests: what the PRs did, in the website's words.
     `pr` is the one merged PR's address, used for the tile link while the project has exactly one merged PR from me. */
  upstream: [
    { repo: "morluto/rea", en: "Bug fixes across evidence tracking, JavaScript and Electron analysis, LLDB, ADB and the CLI.", zh: "修 bug：證據追蹤、JavaScript 與 Electron 分析、LLDB、ADB 和 CLI。" },
    { repo: "ZhuLinsen/daily_stock_analysis", en: "Added Taiwan market support: market detection and routing, the 三大法人 institutional-flow data, and its place in the report and the LLM prompt.", zh: "加上台股支援：市場判斷與路由、三大法人資料，並放進報告和 LLM prompt。" },
    { repo: "BuilderIO/agent-native", en: "Fixed a CLI crash when the engine is set to Codex CLI, and broken references in the docs.", zh: "修掉引擎設成 Codex CLI 時的當機，還有文件裡失效的連結。" },
    { repo: "langchain-ai/openwiki", en: "Interrupted runs now get retried, and the config folder is locked down on Windows.", zh: "中斷的執行會重試；Windows 上的設定資料夾權限收緊。" },
    { repo: "Nanako0129/coralline", en: "Fixed line wrapping in the auto layout: it now measures display width, not bytes.", zh: "修正自動排版的換行：改用顯示寬度計算，不是位元組數。", pr: "https://github.com/Nanako0129/coralline/pull/10" },
    { repo: "NVIDIA/skills", en: "Fixed the Skill Catalog link in the contributing guide.", zh: "修正貢獻指南裡 Skill Catalog 的連結。", pr: "https://github.com/NVIDIA/skills/pull/76" },
    { repo: "punkpeye/awesome-mcp-servers", en: "Added research-hub to the Research category.", zh: "把 research-hub 收錄進 Research 分類。", pr: "https://github.com/punkpeye/awesome-mcp-servers/pull/6921" },
  ],

  research: {
    wrr: { pal: "sand", icon: "robot", href: DOI },
    abm: { pal: "aqua", icon: "env" },
  },
  topics: TOPICS,

  locales: {
    en: {
      dir: "en", readme: "README.md", lang: "English", switchTo: "README.zh-TW.md",
      home: SITE, actHref: `${SITE}/#act5`, floodabm: `${SITE}/work/floodabm/`,
      cv: `${SITE}/assets/Wenyu_Chiou_Academic_CV_EN.pdf`, scholarHl: "en",
      /* extra font names appended to the SVG font stack */
      fontExtra: "",
      nameHead: "Wenyu ", nameTail: "Chiou",
      lead: ["I study how people decide under flood risk,", "using surveys, simulation and LLM agents."],
      open: "Open to Summer 2027 internships",
      bannerAlt: `Wenyu Chiou. I study how people decide under flood risk, using surveys, simulation and LLM agents. ${LOOP.en.alt}`,
      loop: LOOP.en, bio: BIO.en, fig: FIG.en, research: `${SITE}/research/`,
      topics: TOPICS.map((t) => ({ title: t.en, q: t.enQ, how: t.enHow, alt: `${t.en}. ${t.enQ} ${t.enHow}` })),
      buttons: { website: "Website", scholar: "Google Scholar", linkedin: "LinkedIn", mail: "Email", cv: "CV", coffee: "Buy me a coffee" },
      h: { research: "Research", projects: "Projects", merged: "Merged into other people’s projects", activity: "Activity" },
      question: "How do people decide under flood risk, and what do those decisions change?",
      wrr: { chip: WRR.enChip, q: WRR.enQ, alt: `${WRR.enChip}. ${WRR.enQ}` },
      abm: { chip: ABM.enChip, q: ABM.enQ, alt: `${ABM.enChip}. ${ABM.enQ}` },
      forks: (n) => `${n} forks`,
      repoAlt: (name, d, n) => `${name}: ${d}. ${n} stars.`,
      pr1: "PR merged", prN: "PRs merged",
      prAlt: (repo, k, d) => `${repo}: ${k} merged pull request${k === 1 ? "" : "s"}. ${d}`,
      activityDam: "The past year of commits drawn as rain that fills a reservoir behind a dam, month by month.",
      activitySnake: "The past year of commits as a grid with one square per day, and a snake that eats the squares from the quietest day to the busiest.",
      footer: (asOf) => `Public repositories only. Numbers as of ${asOf}, refreshed daily.`,
      threads: "Threads",
    },
    "zh-TW": {
      dir: "zh-TW", readme: "README.zh-TW.md", lang: "繁體中文", switchTo: "README.md",
      home: `${SITE}/zh/`, actHref: `${SITE}/zh/#act5`, floodabm: `${SITE}/zh/work/floodabm/`,
      cv: `${SITE}/assets/Wenyu_Chiou_Academic_CV_zh-TW.pdf`, scholarHl: "zh-TW",
      fontExtra: ',"PingFang TC","Noto Sans TC","Microsoft JhengHei"',
      nameHead: "邱文昱", nameTail: "",
      lead: ["我研究人在洪災風險下怎麼做決定，", "用問卷、模擬，還有 LLM 代理。"],
      open: "2027 暑期實習開放中",
      bannerAlt: `邱文昱。我研究人在洪災風險下怎麼做決定，用問卷、模擬，還有 LLM 代理。${LOOP.zh.alt}`,
      loop: LOOP.zh, bio: BIO.zh, fig: FIG.zh, research: `${SITE}/zh/research/`,
      /* "|" in the zh text marks where a line may break in the tile; it is not part of the text */
      topics: TOPICS.map((t) => { const qLines = t.zhQ.split("|"), howLines = t.zhHow.split("|"), q = qLines.join(""), how = howLines.join(""); return { title: t.zh, q, how, qLines, howLines, alt: `${t.zh}。${q}${how}` }; }),
      /* Labels that are names stay as they are (LinkedIn, Google Scholar, Email, CV), as on the website's zh page.
         The coffee label is the one the earlier zh README showed next to its coffee badge. */
      buttons: { website: "網站", scholar: "Google Scholar", linkedin: "LinkedIn", mail: "Email", cv: "CV", coffee: "支持我的開源專案" },
      h: { research: "研究", projects: "專案", merged: "合併進別人專案的 PR", activity: "動態" },
      question: "人在洪災風險下怎麼做決定？這些決定又改變了什麼？",
      wrr: { chip: WRR.zhChip, q: WRR.zhQ.split("|").join(""), qLines: WRR.zhQ.split("|"), alt: `${WRR.zhChip}。${WRR.zhQ.split("|").join("")}` },
      abm: { chip: ABM.zhChip, q: ABM.zhQ.split("|").join(""), qLines: ABM.zhQ.split("|"), alt: `${ABM.zhChip}。${ABM.zhQ.split("|").join("")}` },
      forks: (n) => `${n} 個 fork`,
      repoAlt: (name, d, n) => `${name}：${d}。星數 ${n}。`,
      pr1: "個 PR 已合併", prN: "個 PR 已合併",
      prAlt: (repo, k, d) => `${repo}：${k} 個 PR 已合併。${d}`,
      activityDam: "過去一年的 commit 畫成雨水，逐月注入水壩後方的水庫。",
      activitySnake: "過去一年的 commit 排成每日一格，貪吃蛇從最少的那天吃到最多的那天。",
      footer: (asOf) => `只算公開專案 · ${asOf} 的數字，每天更新`,
      threads: "Threads",
    },
  },
};

export default content;
