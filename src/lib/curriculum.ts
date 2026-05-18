/**
 * 📚 校園奇遇記 6 週完整教案 — 跨課程套餐
 *
 * 設計理念:
 *   把 5 個 Story Pack (MBTI / SEL / 猜朋友 / 數位素養 / 家庭篇) 串成
 *   「跨課程套餐」, 老師可一鍵備課, 學生 6 週完成完整自我認識旅程。
 *
 * 對應規範:
 *   - 108 課綱 9 大核心素養 (尤其 A1 身心素質 / A2 系統思考 / B1 符號運用 /
 *     B2 科技資訊媒體素養 / C1 道德實踐與公民意識 / C2 人際關係與團隊合作 /
 *     C3 多元文化與國際理解)
 *   - 聯合國永續發展目標 (SDG) 4/10/16/17 等
 *   - CASEL 5 大社會情緒能力 (self-awareness / self-management /
 *     social-awareness / relationship-skills / responsible-decision-making)
 *
 * 教學時段:
 *   建議用「綜合活動課」或「彈性學習節數」上, 每週 45 分鐘 (一節課)。
 *   可以在: 學期初 (認識自己) / 學期末 (反思成長) / 跨學期 (6 週連續課程)。
 *
 * 評量方式:
 *   - 形成性評量: 每週反思學習單 + 老師觀察
 *   - 總結性評量: 第 6 週完成證書 + 自我評估表
 *   - 三方檢核: 學生自評 + 同儕互評 + 家長回饋
 */

export interface SdgRef {
  number: number;
  name: string;
  color: string;
}

export interface CaselSkill {
  key: "self-awareness" | "self-management" | "social-awareness" | "relationship-skills" | "responsible-decision-making";
  zh: string;
  desc: string;
}

export interface WeeklyLesson {
  week: number;
  emoji: string;
  title: string;
  subtitle: string;
  /** 該週用的 Pack 路徑 */
  appPath: string;
  appName: string;
  /** 時間 */
  duration: string;
  /** 對應 108 課綱核心素養 */
  curriculum108: string[];
  /** 對應 SDG */
  sdgs: SdgRef[];
  /** 對應 CASEL 5 大能力 */
  caselSkills: CaselSkill["key"][];
  /** 課前準備 (老師端) */
  beforeClass: string[];
  /** 暖場 (5 分鐘) */
  warmUp: { time: string; teacher: string[]; activity: string };
  /** 主活動 (30 分鐘) */
  mainActivity: { time: string; teacher: string[]; studentTask: string; tips: string[] };
  /** 課後反思 (10 分鐘) */
  reflection: { time: string; questions: string[]; teacher: string[] };
  /** 跨單元銜接 */
  connectsTo: Array<{ week: number; how: string }>;
  /** 家長聯絡簿摘要 (1-2 句) */
  parentNote: string;
  /** 配套學習單 */
  worksheetTips: string;
}

// ─────────────────── CASEL 5 大能力 ───────────────────

export const CASEL_SKILLS: Record<CaselSkill["key"], CaselSkill> = {
  "self-awareness": {
    key: "self-awareness",
    zh: "🔍 自我察覺",
    desc: "認識自己的情緒、想法、價值觀、長處與限制",
  },
  "self-management": {
    key: "self-management",
    zh: "🧘 自我管理",
    desc: "管理情緒、設目標、調節壓力的能力",
  },
  "social-awareness": {
    key: "social-awareness",
    zh: "👥 社會察覺",
    desc: "理解他人觀點、同理多元背景、辨識社會線索",
  },
  "relationship-skills": {
    key: "relationship-skills",
    zh: "🤝 人際關係",
    desc: "建立健康關係、有效溝通、合作、衝突解決",
  },
  "responsible-decision-making": {
    key: "responsible-decision-making",
    zh: "🎯 負責任決策",
    desc: "考慮倫理、安全、後果做出建設性選擇",
  },
};

// ─────────────────── SDG (聯合國永續發展目標) ───────────────────

export const SDG_MAP: Record<number, SdgRef> = {
  4: { number: 4, name: "優質教育", color: "from-red-500 to-red-600" },
  10: { number: 10, name: "減少不平等", color: "from-pink-500 to-fuchsia-500" },
  11: { number: 11, name: "永續城市與社區", color: "from-amber-500 to-orange-500" },
  13: { number: 13, name: "氣候行動", color: "from-emerald-600 to-green-700" },
  16: { number: 16, name: "和平正義與健全制度", color: "from-blue-600 to-indigo-700" },
  17: { number: 17, name: "夥伴關係", color: "from-blue-500 to-cyan-600" },
};

// ─────────────────── 6 週教案 ───────────────────

export const WEEKLY_LESSONS: WeeklyLesson[] = [
  // ─── 第 1 週: MBTI 主故事 — 自我認識 ───
  {
    week: 1,
    emoji: "🎒",
    title: "校園奇遇記·自我認識",
    subtitle: "用 10 分鐘故事 RPG 找出我的 16 型人格",
    appPath: "/game",
    appName: "MBTI 校園奇遇記",
    duration: "45 分鐘",
    curriculum108: [
      "A1 身心素質與自我精進",
      "A2 系統思考與解決問題",
      "B1 符號運用與溝通表達",
    ],
    sdgs: [SDG_MAP[4], SDG_MAP[10]],
    caselSkills: ["self-awareness", "responsible-decision-making"],
    beforeClass: [
      "前一天請學生回家想：「你覺得自己是什麼樣的人？」(不必回答,只想)",
      "投影設備 + 學生個人裝置 (平板/筆電/手機都可)",
      "印發第 1 週反思學習單 (一人一張)",
    ],
    warmUp: {
      time: "5 分鐘",
      teacher: [
        "「今天我們要做一場校園冒險 — 你會走進故事,你的選擇會揭曉一個專屬於你的『人格類型』。」",
        "「但有 3 個重要規定:(1) 沒有對錯答案 (2) 結果只給你自己看 (3) 跟跟著直覺選,不要想『哪個比較好』。」",
      ],
      activity: "請學生舉手: 你覺得『認識自己』重要嗎? 為什麼?",
    },
    mainActivity: {
      time: "30 分鐘",
      teacher: [
        "引導學生打開 /game,完成 10 分鐘故事",
        "巡視觀察學生的選擇模式 (有的快有的慢、有的猶豫有的果斷 — 都是 OK 的)",
        "完成後請學生在結果頁停留,看自己的 MBTI 型 + 4 軸圖 + 給家長的話",
      ],
      studentTask: "完成 6 章 30+ 場景的故事,看到自己的結果頁",
      tips: [
        "不催快: 有的學生會邊讀邊想很久,這就是反思",
        "結果出來後問: 「準不準?」如果學生說『不準』,問他『哪一句最不準?』 — 這是更深的反思",
        "提醒: MBTI 是傾向不是身分,用「我可能更傾向...」而不是「我是 X 型,所以我會...」",
      ],
    },
    reflection: {
      time: "10 分鐘",
      questions: [
        "我的 MBTI 型是什麼？我覺得哪一句描述最像我？",
        "故事裡有沒有一個選擇,讓我發現「原來我會這樣想」？",
        "我的型跟我猜的一樣嗎？如果不一樣,差在哪？",
      ],
      teacher: [
        "請 3-5 位學生分享 (自願 only)",
        "強調「沒有比較好的型」 — 16 型各有閃光點",
        "下週預告: 「下週我們玩 SEL — 不是聊好的時候,是聊難過的時候你怎麼接住自己。」",
      ],
    },
    connectsTo: [
      { week: 2, how: "下週 SEL 探索『同樣的我,遇到逆境時的因應風格』" },
      { week: 6, how: "第 6 週看『6 週下來我變了嗎』總結反思" },
    ],
    parentNote:
      "本週孩子完成「MBTI 校園奇遇記」自我探索,認識自己的人格傾向。建議您問問孩子:「你的 MBTI 型是什麼?哪一句最像你?」傾聽就好,不評判。",
    worksheetTips: "/worksheet 已有 A4 反思學習單可直接列印 (含 MBTI 型 + 4 軸 + 反思題)",
  },

  // ─── 第 2 週: SEL 逆境特別篇 ───
  {
    week: 2,
    emoji: "🌧️",
    title: "SEL 逆境特別篇·情緒因應",
    subtitle: "9 個情境探索我的情緒工具箱",
    appPath: "/sel",
    appName: "SEL 逆境特別篇",
    duration: "45 分鐘",
    curriculum108: [
      "A1 身心素質與自我精進",
      "C2 人際關係與團隊合作",
    ],
    sdgs: [SDG_MAP[4]],
    caselSkills: ["self-awareness", "self-management"],
    beforeClass: [
      "前一週請學生留意「自己遇到難過/生氣/害怕時都怎麼處理」(只觀察,不評判)",
      "預備 4 張海報紙 (對應 4 風格: 表達者/思考者/安撫者/連結者),貼在教室四角",
      "印發第 2 週反思學習單",
    ],
    warmUp: {
      time: "5 分鐘",
      teacher: [
        "「每個人都會難過、生氣、害怕 — 重點不是『怎麼不有這些情緒』,而是『有了之後我怎麼接住自己』。」",
        "「今天我們會看 9 個情境,沒有對錯。看到不熟的情境,試著想『我會怎麼做』。」",
      ],
      activity: "請學生想一個最近難過的事 (不必說出來),記在心裡",
    },
    mainActivity: {
      time: "30 分鐘",
      teacher: [
        "引導學生打開 /sel,完成 9 個情境",
        "巡視: 注意學生在哪個情境停留最久 — 可能觸動真實經驗",
        "完成後看自己的「因應風格」+ 5 個情緒工具箱",
      ],
      studentTask: "完成 9 個情境,看到自己的 SEL 因應風格 (表達/思考/安撫/連結)",
      tips: [
        "如果學生流淚或不想完成,允許他暫停 — 這代表觸動了真實情緒,陪伴而不追問",
        "看完結果後,請學生走到對應「風格海報」前,看身邊同學是哪型 (視覺化班級多元)",
        "強調:「沒有最好的風格 — 4 種都需要,我們互相學習」",
      ],
    },
    reflection: {
      time: "10 分鐘",
      questions: [
        "我是哪種因應風格？看到結果我覺得「準」還是「不準」？",
        "5 個情緒工具箱裡,哪一個我已經在用？哪一個我想試試？",
        "看到全班 4 種風格的分布,我想對哪一種風格的同學說什麼？",
      ],
      teacher: [
        "4 風格各請 1 位分享自己的工具箱實用情境",
        "強調「跨風格學習」: 表達者學一點思考者、思考者學一點連結者...",
        "下週預告: 「下週玩猜朋友 — 看你猜得到同學是哪型嗎？」",
      ],
    },
    connectsTo: [
      { week: 1, how: "MBTI 認識「平常的我」, SEL 認識「逆境的我」 — 兩個面向" },
      { week: 5, how: "家庭篇處理「家裡的情緒事件」, 是 SEL 的延伸應用" },
    ],
    parentNote:
      "本週孩子探索情緒因應風格 (表達/思考/安撫/連結)。建議您問:「你最常用的情緒工具是什麼?爸媽下次可以怎麼幫你?」一起列家庭情緒工具箱。",
    worksheetTips: "結果頁直接點「📥 列印我的情緒急救卡」可印 A4 含 5 工具 + 緊急聯絡人空格",
  },

  // ─── 第 3 週: 猜朋友 MBTI ───
  {
    week: 3,
    emoji: "🎲",
    title: "猜朋友 MBTI·班級互動",
    subtitle: "你眼中的同學跟他們真實的自己一樣嗎",
    appPath: "/guess",
    appName: "猜朋友 MBTI",
    duration: "45 分鐘",
    curriculum108: [
      "C2 人際關係與團隊合作",
      "C3 多元文化與國際理解",
    ],
    sdgs: [SDG_MAP[4], SDG_MAP[10]],
    caselSkills: ["social-awareness", "relationship-skills"],
    beforeClass: [
      "確認班上同學至少 5 人已完成第 1 週 MBTI (有結果才能對照)",
      "建議由老師建立班級房間 (/teacher/new 選 MBTI 模式) → 投影房號讓學生加入",
      "印發第 3 週反思學習單 (內含「我對 OO 的猜測 vs 實際」表格)",
    ],
    warmUp: {
      time: "5 分鐘",
      teacher: [
        "「人跟人之間有個有趣的事:你眼中的我,跟我自己看到的我,常常不一樣。」",
        "「今天我們玩『猜朋友 MBTI』— 看你猜得多準。不是測『誰最了解別人』,是看『刻板印象』有多深。」",
      ],
      activity: "請學生想 3 個同學,各猜一個 MBTI 型 (不告訴對方)",
    },
    mainActivity: {
      time: "30 分鐘",
      teacher: [
        "學生打開 /guess,輸入班級名單 (或從前面 /class-stats sessionStorage 自動帶入)",
        "1-by-1 猜每個同學的 MBTI",
        "結果頁出現「準確率 + 最讓你意外的同學」",
      ],
      studentTask: "完成所有同學的猜測,看自己的準確率 + 4 軸個別 (EI/SN/TF/JP) 統計",
      tips: [
        "如果準確率高: 引導思考「為什麼我猜得準?是因為真的了解?還是用刻板印象?」",
        "如果準確率低: 引導思考「猜錯的同學,我對他的印象是怎麼形成的?」",
        "**重點議題**: 「最讓你意外的同學」 — 為什麼意外? 我之前用什麼線索判斷?",
      ],
    },
    reflection: {
      time: "10 分鐘",
      questions: [
        "我的猜測準確率是多少？哪一個軸 (EI/SN/TF/JP) 我猜得最準？最不準？",
        "「最讓我意外的同學」 — 我之前對他的印象哪裡跟真實不一樣？",
        "猜錯的時候,我用的「判斷線索」是不是太單一了？(例如「他話多 = 一定是 E」)",
      ],
      teacher: [
        "分享: 1-2 位學生分享「最讓我意外的同學」",
        "強調「破除刻板印象」: 我們常用 1-2 個線索就下判斷,但人有很多面",
        "下週預告: 「下週玩數位素養 — 看你是哪種數位公民。」",
      ],
    },
    connectsTo: [
      { week: 1, how: "第 1 週認識「我自己」, 本週認識「同學的我」 — 兩個視角" },
      { week: 6, how: "第 6 週看「全班拼圖」, NPC 卡牌與真實同學交織" },
    ],
    parentNote:
      "本週孩子練習「看見同學的多元」 — 不被刻板印象框住。建議您問:「最讓你意外的同學是誰?為什麼?」延伸到「家人之間是不是也有這種誤判?」",
    worksheetTips: "結果頁可截圖班級準確率 + 4 軸統計 (老師可印成班級海報)",
  },

  // ─── 第 4 週: 數位素養 Story Pack ───
  {
    week: 4,
    emoji: "📱",
    title: "數位素養特別篇·網路公民",
    subtitle: "AI/假訊息/短影音 6 情境探索",
    appPath: "/digital",
    appName: "數位素養特別篇",
    duration: "45 分鐘",
    curriculum108: [
      "B2 科技資訊與媒體素養",
      "C1 道德實踐與公民意識",
      "A2 系統思考與解決問題",
    ],
    sdgs: [SDG_MAP[4], SDG_MAP[16]],
    caselSkills: ["responsible-decision-making", "self-management"],
    beforeClass: [
      "前一週請學生記錄「自己最常用的 3 個 app」(只記錄,不評判)",
      "預備白板 / 大張紙寫 4 風格名 (守門員 / 探險家 / 自律者 / 連結者)",
      "印發第 4 週反思學習單 (含「我家裡的數位公約」空白欄)",
    ],
    warmUp: {
      time: "5 分鐘",
      teacher: [
        "「2026 年的小學生,每天面對 AI、假訊息、短影音、線上交友 — 這些東西都是新的,沒有人教過你們爸媽怎麼處理,所以你們要自己學會。」",
        "「今天 6 個情境都是『真實會發生』的事 — 不是嚇你,是讓你想清楚『我會怎麼選』。」",
      ],
      activity: "舉手調查: (a) 用過 ChatGPT/Gemini? (b) 看過短影音超過 1 小時? (c) 收過假訊息? (d) 在線上認識過陌生人?",
    },
    mainActivity: {
      time: "30 分鐘",
      teacher: [
        "引導學生打開 /digital,完成 6 個情境",
        "巡視: 觀察學生對哪個情境特別有反應 (可能是真實經驗)",
        "完成後看自己的「數位素養型」+ 5 個數位工具箱",
      ],
      studentTask: "完成 6 個情境,看到自己的數位風格 (守門員/探險家/自律者/連結者)",
      tips: [
        "**重點議題**: AI 工具情境 — 引導討論「AI 當副駕 vs AI 代寫」差別",
        "假訊息情境 — 教學生「查證 3 步驟」: 看來源、找官方、問 1-2 個信任的大人",
        "強調「沒有完美的數位公民」 — 4 種風格互相補位才安全",
      ],
    },
    reflection: {
      time: "10 分鐘",
      questions: [
        "我是哪種數位風格？我覺得自己「足夠安全」嗎？",
        "5 個工具箱裡,哪一個我可以今天就開始做？",
        "如果我家裡要訂「家庭數位公約」3 條,我會寫什麼？",
      ],
      teacher: [
        "請 2-3 位學生分享自己的家庭數位公約構想",
        "強調「家庭公約」不是「規則」,是「全家一起遵守」 — 大人也要做到",
        "下週預告: 「下週家庭篇 — 我們會聊家裡的事。可能會觸動情緒,你可以隨時停止。」(主動提醒)",
      ],
    },
    connectsTo: [
      { week: 2, how: "SEL 處理情緒, 數位素養處理『數位疲憊』『網路霸凌情緒』的延伸" },
      { week: 5, how: "家庭篇有「父母吵架」「被責罵」, 跟數位公約可一起討論" },
    ],
    parentNote:
      "本週孩子探索「數位素養」(AI/假訊息/短影音/網路霸凌/隱私/線上交友)。**強烈建議**: 跟孩子一起列「家庭數位公約」 — 不只規範孩子,大人也一起遵守 (例: 飯桌不滑手機)。",
    worksheetTips: "學習單最後一頁是「家庭數位公約模板」,讓孩子帶回家跟爸媽一起填",
  },

  // ─── 第 5 週: 家庭篇 Story Pack ───
  {
    week: 5,
    emoji: "🏡",
    title: "家庭篇·家庭情緒探索",
    subtitle: "在家裡的我是怎麼接住自己",
    appPath: "/family",
    appName: "家庭篇 Story Pack",
    duration: "45 分鐘",
    curriculum108: [
      "A1 身心素質與自我精進",
      "C2 人際關係與團隊合作",
    ],
    sdgs: [SDG_MAP[4], SDG_MAP[16]],
    caselSkills: ["self-awareness", "social-awareness", "relationship-skills"],
    beforeClass: [
      "**重要**: 課前一週寄信給家長告知「本週主題是家庭情緒,可能觸動孩子情緒,週末請陪伴」",
      "確保輔導老師在場待命 (或事先確認可諮詢)",
      "預備 5 條緊急專線海報貼教室後方 (113/1980/1995/0800-200-885/110)",
      "印發第 5 週反思學習單 (內含「我家裡的情緒地圖」)",
    ],
    warmUp: {
      time: "5 分鐘",
      teacher: [
        "「今天的主題比較深 — 我們會聊家裡的事 (爸媽吵架、被冤枉、家人生病、搬家)。」",
        "「3 個重要提醒: (1) 你的選擇『不會被傳給家人』,完全私密 (2) 如果你不想答,可以跳過 (3) 如果觸動了你,你可以舉手,我們暫停一下。」",
        "「這個單元不是『要解決家裡的事』,是『讓你認識自己在家裡的因應風格』。」",
      ],
      activity: "請學生深呼吸 3 次,告訴自己「我現在是安全的」",
    },
    mainActivity: {
      time: "30 分鐘",
      teacher: [
        "引導學生打開 /family → **先看「同意」階段** (重要儀式感)",
        "**全程巡視** — 任何學生看起來不對勁,立刻關心",
        "結果頁如果出現「⚠️ 你似乎遇到比較重的事」紅色框 + 緊急資源 → **下課後主動關心該學生**",
      ],
      studentTask: "完成 6 個情境,看到自己的家庭因應風格 (表達/思考/安撫/連結)",
      tips: [
        "**Flag 機制**: 系統會自動標記「需要關心」的選擇組合,結果頁會跳出緊急資源",
        "**老師職責**: 若學生出現大量負向情緒,**主動聯繫輔導室**,不要試圖獨自處理嚴重議題",
        "**避免**: 不要在課堂上「公開」追問家庭事,讓學生有「私下找你」的空間",
      ],
    },
    reflection: {
      time: "10 分鐘",
      questions: [
        "我是哪種家庭因應風格？看到工具箱,哪一個我想試試？",
        "在家裡遇到難過時,我通常找誰聊？如果都沒有人,我可以找誰？",
        "我家裡的『情緒地圖』(誰能聽我哭/誰能讓我笑) 我想新增誰？",
      ],
      teacher: [
        "**不問個人家庭事**, 只問「風格」(表達者 / 思考者 / 安撫者 / 連結者)",
        "強調 5 條緊急專線 — 「如果你覺得家裡的事太重,請打這些電話」",
        "下週預告: 「下週是綜合反思 — 6 週下來,你長大了多少」",
      ],
    },
    connectsTo: [
      { week: 2, how: "SEL 是個人情緒, 家庭篇是『情緒在家庭系統中的展現』" },
      { week: 6, how: "第 6 週看完整成長軌跡,含家庭風格的反思" },
    ],
    parentNote:
      "本週孩子探索「家庭情緒因應」 — 可能會更敏感地觀察家裡氣氛。**重要建議**: 不要追問孩子在課堂上選了什麼,但可以說「最近有什麼想跟我聊嗎?」並認真傾聽。**若孩子主動提到負面情緒,請聯繫學校輔導室一起協助**。",
    worksheetTips: "學習單最後是「我家裡的情緒地圖」 — 列出誰能聽我哭/誰能讓我笑/我想新增誰",
  },

  // ─── 第 6 週: 綜合反思 (服務組 + NPC 卡牌 + 完成證書) ───
  {
    week: 6,
    emoji: "🌟",
    title: "綜合反思·我長大了多少",
    subtitle: "服務組支線 + NPC 卡牌 + 6 週完成證書",
    appPath: "/cards",
    appName: "NPC 角色卡牌 + /journey 三部曲",
    duration: "45 分鐘",
    curriculum108: [
      "A1 身心素質與自我精進",
      "C1 道德實踐與公民意識",
      "C3 多元文化與國際理解",
    ],
    sdgs: [SDG_MAP[4], SDG_MAP[10], SDG_MAP[17]],
    caselSkills: [
      "self-awareness",
      "social-awareness",
      "responsible-decision-making",
    ],
    beforeClass: [
      "印發第 6 週「6 週總結反思學習單」 (內含時間軸 + 成長對比 + 給未來自己的話)",
      "預備「全班拼圖」海報 (12 NPC 大頭 + 學生可貼自己的便利貼當「第 13 個 NPC」)",
      "為每位學生準備完成證書空白紙 (可從 /journey 系統下載)",
    ],
    warmUp: {
      time: "5 分鐘",
      teacher: [
        "「6 週前我們一起進了校園奇遇記 — 從 MBTI、SEL、猜朋友、數位、家庭。今天是總集合。」",
        "「請拿出你前 5 週的反思學習單,回想自己當時的答案 — 有什麼變了嗎?」",
      ],
      activity: "靜默 1 分鐘翻閱前 5 週學習單,感受變化",
    },
    mainActivity: {
      time: "30 分鐘",
      teacher: [
        "**Part 1 (10 min)**: 學生打開 /cards 收藏 12 NPC 卡 — 完成了 MBTI/SEL/猜朋友的學生應該已解鎖大部分面向",
        "**Part 2 (10 min)**: (可選) 玩過服務組支線的學生分享經驗 — 沒玩過的可重玩 /game 選『公民服務隊』",
        "**Part 3 (10 min)**: 打開 /journey 看『自我探索王』綜合報告 + 列印完成證書",
      ],
      studentTask: "完成 NPC 卡牌收藏 (48 面全解) + 領取「校園奇遇記畢業證書」",
      tips: [
        "**全班拼圖儀式**: 學生上台貼自己的便利貼 (寫上「我是 ___ 型 + 我學到 ___」),全班一起完成拼圖",
        "**第 13 個 NPC**: 學生自己 — 你的多元也是這個班級的一部分",
        "強調: 6 週不是「完成」,是「開始」 — MBTI 會變、SEL 會變、家庭關係會變,持續認識自己",
      ],
    },
    reflection: {
      time: "10 分鐘",
      questions: [
        "6 週前的我跟現在的我,最大的不同是什麼？",
        "我學到的 4 個工具箱 (MBTI / SEL / 數位 / 家庭),哪一個我會帶到下個月繼續用？",
        "如果我要寫一封信給「明年的我」,我會寫什麼？",
      ],
      teacher: [
        "5-7 位學生分享「6 週前 vs 現在」(自願 only)",
        "頒發完成證書 (建議全班一人一張,儀式感重要)",
        "結語: 「認識自己是一輩子的事 — 你們現在學的工具,大人可能還沒學會。」",
      ],
    },
    connectsTo: [
      { week: 1, how: "回到第 1 週的 MBTI 結果,看自己『感覺』有沒有變化" },
      { week: 5, how: "結合家庭篇的「家庭情緒地圖」,做成完整自我畫像" },
    ],
    parentNote:
      "本週是「校園奇遇記 6 週課程」結業 — 孩子完成完整自我認識旅程。建議您:(1) 看孩子帶回的『畢業證書』+ 反思學習單 (2) 跟他聊「6 週下來你覺得最深刻的是什麼?」(3) 留下這些學習單,1 年後再翻一次。",
    worksheetTips: "/journey 系統可下載「自我探索王」綜合報告 (含 MBTI / SEL / 猜朋友 三段並陳)",
  },
];

// ─────────────────── Helper ───────────────────

export function getLessonByWeek(week: number): WeeklyLesson | undefined {
  return WEEKLY_LESSONS.find((l) => l.week === week);
}

export const TOTAL_WEEKS = WEEKLY_LESSONS.length;

/** 取得所有 108 課綱核心素養 (去重) */
export function getAllCurriculumAreas(): string[] {
  const set = new Set<string>();
  for (const l of WEEKLY_LESSONS) {
    l.curriculum108.forEach((c) => set.add(c));
  }
  return [...set];
}

/** 取得所有 SDG (去重) */
export function getAllSdgs(): SdgRef[] {
  const map = new Map<number, SdgRef>();
  for (const l of WEEKLY_LESSONS) {
    l.sdgs.forEach((s) => map.set(s.number, s));
  }
  return [...map.values()].sort((a, b) => a.number - b.number);
}

/** 取得所有 CASEL 能力 (去重) */
export function getAllCaselSkills(): CaselSkill[] {
  const set = new Set<CaselSkill["key"]>();
  for (const l of WEEKLY_LESSONS) {
    l.caselSkills.forEach((c) => set.add(c));
  }
  return [...set].map((k) => CASEL_SKILLS[k]);
}
