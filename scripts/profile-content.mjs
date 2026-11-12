/* Hand-written content of the GitHub profile README and its tiles (English and Traditional Chinese).
   scripts/build-profile.mjs draws the SVG files and both READMEs from this file plus scripts/profile-data.json (the numbers).
   Wording comes from the website (home/render.cjs and home/prs.cjs in the wenyuchiou.github.io repo); copy it, do not reword it.
   A string marked NO-ZH below has no Traditional Chinese version on the website yet, so it stays English in the zh README. */

const SITE = "https://wenyuchiou.github.io";
const DOI = "https://doi.org/10.1029/2025WR042111";
const ACTIVITY = "https://raw.githubusercontent.com/WenyuChiou/wenyuchiou.github.io/standalone-portfolio/assets/commit-maps/";

/* ---------- strings shared by both locales ---------- */
const WRR = {
  enChip: "Published · Water Resources Research, 2026",
  zhChip: "已發表 · Water Resources Research，2026",
  enQ: "Can LLM agents stand in for households in a human–water simulation?",
  zhQ: "在人水系統模擬裡，LLM 代理能扮演家戶嗎？",
  enWhat: "The paper tests large language models as the decision-making part of a human–water simulation.",
  zhWhat: "這篇論文測試：把大型語言模型放進人水系統模擬，當成做決定的那一部分，行不行。",
  enMine: ["Co-author, second of two authors"],
  zhMine: ["共同作者（兩位作者中的第二作者）"],
};
const ABM = {
  enChip: "In revision · Water Resources Research",
  zhChip: "修改中 · Water Resources Research",
  enQ: "FLOODABM: what do household flood choices cost over time?",
  zhQ: "FLOODABM：家戶面對洪災的選擇，長期下來要付出什麼？",
  enWhat: "A coupled household and flood-catastrophe model that follows each choice through to flood damage, insurance payouts and out-of-pocket cost. The households here are rule-based agents, not LLM.",
  zhWhat: "把家戶和洪災巨災模型接在一起，將每個選擇一路追到洪水損失、保險理賠和自付金額。這裡的家戶是規則式代理，不是 LLM。",
  enMine: ["Designed and fielded the household survey (Passaic River Basin, NJ)", "Built the pipeline that turns survey answers into agent parameters", "Built the coupled model, with NFIP premium, payout and deductible rules", "First author"],
  zhMine: ["設計並發放家戶問卷（紐澤西 Passaic 河流域）", "建立把問卷答案轉成代理參數的流程", "建立耦合模型，含 NFIP 保費、理賠與自負額機制", "第一作者"],
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
      bannerAlt: "Wenyu Chiou. I study how people decide under flood risk, using surveys, simulation and LLM agents.",
      buttons: { website: "Website", scholar: "Google Scholar", linkedin: "LinkedIn", mail: "Email", cv: "CV", coffee: "Buy me a coffee" },
      h: { research: "Research", projects: "Projects", merged: "Merged into other people’s projects", activity: "Activity" },
      question: "How do people decide under flood risk, and what do those decisions change?",
      myPart: "MY PART", readPaper: "Read the paper", readCase: "Read the case",
      wrr: { chip: WRR.enChip, q: WRR.enQ, what: WRR.enWhat, mine: WRR.enMine,
        alt: `${WRR.enChip}. ${WRR.enQ} ${WRR.enWhat} My part: ${WRR.enMine.join("; ")}.` },
      abm: { chip: ABM.enChip, q: ABM.enQ, what: ABM.enWhat, mine: ABM.enMine,
        alt: `${ABM.enChip}. ${ABM.enQ} ${ABM.enWhat} My part: ${ABM.enMine.join("; ")}.` },
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
      bannerAlt: "邱文昱。我研究人在洪災風險下怎麼做決定，用問卷、模擬，還有 LLM 代理。",
      /* Labels that are names stay as they are (LinkedIn, Google Scholar, Email, CV), as on the website's zh page.
         The coffee label is the one the earlier zh README showed next to its coffee badge. */
      buttons: { website: "網站", scholar: "Google Scholar", linkedin: "LinkedIn", mail: "Email", cv: "CV", coffee: "支持我的開源專案" },
      h: { research: "研究", projects: "專案", merged: "合併進別人專案的 PR", activity: "動態" },
      question: "人在洪災風險下怎麼做決定？這些決定又改變了什麼？",
      myPart: "我做的部分", readPaper: "讀論文", readCase: "看案例",
      wrr: { chip: WRR.zhChip, q: WRR.zhQ, what: WRR.zhWhat, mine: WRR.zhMine,
        alt: `${WRR.zhChip}。${WRR.zhQ}${WRR.zhWhat}我做的部分：${WRR.zhMine.join("；")}。` },
      abm: { chip: ABM.zhChip, q: ABM.zhQ, what: ABM.zhWhat, mine: ABM.zhMine,
        alt: `${ABM.zhChip}。${ABM.zhQ}${ABM.zhWhat}我做的部分：${ABM.zhMine.join("；")}。` },
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
