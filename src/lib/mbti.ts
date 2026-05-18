import type { MBTIType } from "./types";

export interface MBTIInfo {
  type: MBTIType;
  /** 中文俗稱 */
  nickname: string;
  /** 一句話形容 */
  oneLiner: string;
  /** 主題 emoji */
  emoji: string;
  /** 主題色 (Tailwind 顏色 token，搭配 globals.css 自訂) */
  color: string;
  /** 漸層 (用在卡片背景) */
  gradient: string;
  /** 在校園裡的角色 */
  campusRole: string;
  /** 性格描述 (2-3 段) */
  description: string[];
  /** 優勢 (5 項) */
  strengths: string[];
  /** 要小心的地方 (3 項，正向表達) */
  watchOut: string[];
  /** 適合的職業 (給國小看就講方向) */
  futureJobs: string[];
  /** 著名角色或人物 (易懂的) */
  famous: string[];
  /** 與哪個類型最合拍 (給 3 個) */
  bestMatches: MBTIType[];
  /** 跟誰需要多點耐心 (給 2 個) */
  growthPartners: MBTIType[];
  /** 給家長或老師的小提示 */
  tipForGrowth: string;
}

const MBTI_DATA: Record<MBTIType, MBTIInfo> = {
  INTJ: {
    type: "INTJ",
    nickname: "戰略家",
    oneLiner: "腦袋裡永遠在下一盤大棋的小總監。",
    emoji: "♟️",
    color: "lavender",
    gradient: "from-purple-300 via-indigo-300 to-purple-400",
    campusRole: "默默計畫如何讓班級得冠軍的軍師",
    description: [
      "INTJ 是 16 型裡最像「未來計畫表」的小朋友。別人在想下課要不要去福利社，他已經想到下學期要怎麼安排自由研究。",
      "你看似安靜，但腦袋裡其實熱鬧得不得了。當大家還在討論怎麼分組時，你的計畫書已經寫好三個版本。",
      "獨立、有主見、不喜歡浪費時間在沒意義的事情上。一旦設定好目標，就會用最聰明的路走過去。",
    ],
    strengths: ["策略眼光超強", "獨立思考能力高", "做事有遠見", "不容易被流言影響", "完成度高"],
    watchOut: ["記得多聽別人說話", "計畫趕不上變化時，深呼吸再想方法", "肯定別人也是一種智慧"],
    futureJobs: ["科學家", "軟體工程師", "建築師", "外交官", "戰略顧問", "城市規劃師", "棋藝老師", "農場主"],
    famous: ["哈利波特裡的妙麗 (策略版)", "鋼鐵人 Tony Stark"],
    bestMatches: ["ENTP", "ENFP", "INFJ"],
    growthPartners: ["ESFP", "ISFP"],
    tipForGrowth: "INTJ 需要被理解多於被讚美。多問他「你怎麼想到的？」勝過「你好聰明！」",
  },
  INTP: {
    type: "INTP",
    nickname: "邏輯學者",
    oneLiner: "把『為什麼？』當成早安問候語的好奇寶寶。",
    emoji: "🔬",
    color: "sky",
    gradient: "from-sky-300 via-blue-300 to-cyan-400",
    campusRole: "下課鑽研奇怪知識、自然課最閃亮的小博士",
    description: [
      "INTP 是「問為什麼天空是藍色」會問到老師都答不出來的孩子。世界對你來說是一個超大的謎題盒。",
      "你不太在意外表或流行，但對知識的渴望比誰都大。常常一個人安靜地讀百科全書，看完還能跟同學講半小時。",
      "想法天馬行空、邏輯卻清楚。喜歡自己找答案，不喜歡別人塞給你「就是這樣」的解釋。",
    ],
    strengths: ["邏輯思考超清楚", "好奇心爆棚", "創意點子多", "獨立解決問題", "不盲從"],
    watchOut: ["別把家事忘光光", "想完也要記得做出來", "情緒也很重要喔"],
    futureJobs: ["研究員", "程式設計師", "發明家", "數學家", "考古學家", "圖書館員", "天文觀測員", "獨立紀錄片導演"],
    famous: ["愛因斯坦", "達文西"],
    bestMatches: ["ENTJ", "ENFJ", "INTJ"],
    growthPartners: ["ESFJ", "ISFJ"],
    tipForGrowth: "INTP 的腦袋一刻不停，給他空間獨自鑽研，他會自己長出一片森林。",
  },
  ENTJ: {
    type: "ENTJ",
    nickname: "指揮官",
    oneLiner: "天生就是當班長的領袖小巨人。",
    emoji: "👑",
    color: "coral",
    gradient: "from-orange-300 via-red-300 to-rose-400",
    campusRole: "永遠在第一排舉手、班會主持、運動會策劃",
    description: [
      "ENTJ 是天生的領導者，從幼稚園起就會說「我來分配工作！」的那種小孩。",
      "你有自信、有目標、有衝勁，看到混亂就想整理，看到問題就想解決。",
      "雖然有時候會被說「太兇」，但其實你只是不喜歡浪費時間。一旦你信任的人請你幫忙，你會全力以赴。",
    ],
    strengths: ["天生領導力", "決策果斷", "目標明確", "口才好", "意志力強"],
    watchOut: ["記得多聽朋友想說什麼", "不是每個人都需要被『改進』", "讓自己也休息一下"],
    futureJobs: ["CEO", "律師", "外交官", "導演", "總教練", "工會幹部", "非營利組織創辦人", "餐廳老闆"],
    famous: ["史蒂夫·賈伯斯", "拿破崙"],
    bestMatches: ["INTP", "INFP", "ENTP"],
    growthPartners: ["ISFP", "INFP"],
    tipForGrowth: "讓 ENTJ 主導一個小專案，他會綻放出讓你驚訝的成熟感。",
  },
  ENTP: {
    type: "ENTP",
    nickname: "辯論家",
    oneLiner: "可以跟你辯論『為什麼香蕉要彎』的點子王。",
    emoji: "💡",
    color: "sunny",
    gradient: "from-yellow-300 via-amber-300 to-orange-400",
    campusRole: "上課發言天王、下課組樂團、創意社長",
    description: [
      "ENTP 是班上的「點子製造機」。十秒鐘可以丟出五個方案，剛好都不一樣。",
      "你愛挑戰權威、愛問新問題、愛辯論。不是為了贏，而是覺得「想清楚」這件事很好玩。",
      "活力滿滿、社交能力強，常常是班級活動的靈魂人物。但有時候開始的事太多，會忘了做完。",
    ],
    strengths: ["創意無限", "口才一流", "適應力強", "勇於挑戰", "幽默感超強"],
    watchOut: ["開始的事記得收尾", "別人的感受也要顧到", "規則有時候也有用"],
    futureJobs: ["創業家", "編劇", "律師", "行銷專家", "脫口秀演員", "桌遊設計師", "YouTuber 知識頻道", "派對主持"],
    famous: ["馬克吐溫", "蘇格拉底"],
    bestMatches: ["INFJ", "INTJ", "ENFP"],
    growthPartners: ["ISFJ", "ISTJ"],
    tipForGrowth: "ENTP 喜歡被挑戰。問他「那你會怎麼做？」比直接給答案更激發他。",
  },
  INFJ: {
    type: "INFJ",
    nickname: "提倡者",
    oneLiner: "看一眼就知道朋友心情好不好的小天使。",
    emoji: "🌙",
    color: "lavender",
    gradient: "from-indigo-300 via-purple-300 to-pink-300",
    campusRole: "同學最常找他訴苦的安靜小知己",
    description: [
      "INFJ 是 16 型裡最稀有的一種。你心思細膩、看人準、又有自己的理想世界。",
      "你不太愛湊熱鬧，但只要朋友需要，你會默默把整顆心拿出來幫忙。",
      "對世界懷有善意、對未來懷有夢想，希望這世界可以變得更溫暖一點。",
    ],
    strengths: ["同理心超強", "洞察人心", "理想主義", "創意豐富", "默默堅持"],
    watchOut: ["照顧別人前也要照顧自己", "不要把所有壓力都自己扛", "說出來不會被討厭"],
    futureJobs: ["心理諮商師", "作家", "輔導老師", "社工", "藝術家", "繪本作家", "瑜伽老師", "安寧療護志工"],
    famous: ["馬丁路德金", "聖雄甘地"],
    bestMatches: ["ENTP", "ENFP", "INTJ"],
    growthPartners: ["ESTP", "ESTJ"],
    tipForGrowth: "INFJ 需要安靜的時間補充能量。別逼他「多交朋友」，幾個知心的就夠了。",
  },
  INFP: {
    type: "INFP",
    nickname: "調停者",
    oneLiner: "活在自己童話裡、心地柔軟得像棉花糖。",
    emoji: "🦄",
    color: "rose",
    gradient: "from-pink-300 via-rose-300 to-fuchsia-400",
    campusRole: "美術課讓老師驚嘆、作文常被當範本的夢想家",
    description: [
      "INFP 是內心戲最豐富的人。當你眼睛放空時，腦袋裡可能正在演一場史詩級的奇幻冒險。",
      "你看似安靜，其實對世界有非常強烈的好惡。看到不公平的事會難過很久，看到美的東西會感動到掉眼淚。",
      "創造力、想像力、同理心都是你的超能力。寫日記、畫圖、編故事都是你的拿手好戲。",
    ],
    strengths: ["想像力豐富", "同理心強", "重視價值觀", "創造力高", "真誠"],
    watchOut: ["別把所有的事都當成自己的錯", "現實的事也要記得做", "拒絕別人沒關係"],
    futureJobs: ["作家", "插畫家", "心理師", "音樂家", "動畫師", "詩人", "手作職人", "獨立書店店主"],
    famous: ["J.K.羅琳", "莎士比亞"],
    bestMatches: ["ENFJ", "ENTJ", "INFJ"],
    growthPartners: ["ESTJ", "ESTP"],
    tipForGrowth: "INFP 的世界裡價值觀大於規則。逼他做違背價值觀的事會讓他內傷很久。",
  },
  ENFJ: {
    type: "ENFJ",
    nickname: "主人公",
    oneLiner: "把全班團結在一起的暖陽小隊長。",
    emoji: "🌞",
    color: "coral",
    gradient: "from-orange-300 via-rose-300 to-pink-400",
    campusRole: "每個人的好朋友、活動主持、心靈導師",
    description: [
      "ENFJ 是天生的「氣氛製造者」。走到哪笑聲跟到哪，整個教室因為你變得溫暖。",
      "你很懂得看人，能感受到誰今天不開心，然後不動聲色地把他拉進來一起玩。",
      "有理想、有熱情、有領導力。如果讓你籌備班級活動，你會搞得像在辦演唱會一樣盛大。",
    ],
    strengths: ["凝聚力強", "同理心高", "溝通能力一流", "有領導魅力", "充滿熱情"],
    watchOut: ["記得也要照顧自己", "不是每個人都喜歡熱鬧", "說『不』也是一種愛"],
    futureJobs: ["老師", "心理諮商師", "活動策劃", "外交官", "公益創辦人", "婚禮主持", "社工督導", "教練"],
    famous: ["歐普拉", "馬丁路德金"],
    bestMatches: ["INFP", "ISFP", "INTP"],
    growthPartners: ["ISTP", "INTP"],
    tipForGrowth: "ENFJ 把所有人的心情都背在身上。記得提醒他『你也可以脆弱』。",
  },
  ENFP: {
    type: "ENFP",
    nickname: "競選者",
    oneLiner: "一進教室就把氣氛點亮的熱情小煙火。",
    emoji: "🎉",
    color: "sunny",
    gradient: "from-yellow-300 via-orange-300 to-rose-400",
    campusRole: "永遠在揪人玩、永遠有新點子的開心果",
    description: [
      "ENFP 是把全班帶進歡樂世界的那個人。你充滿熱情、充滿好奇、充滿愛。",
      "你會對任何新鮮事說「哇好酷！我也要！」 — 樂團、籃球、滑板、寫小說，全都想試。",
      "重感情、講義氣、能很快跟陌生人變麻吉。最大的天賦是讓別人覺得「被看見」、「被在意」。",
    ],
    strengths: ["熱情洋溢", "想像力豐富", "社交能力強", "點子超多", "情感真摯"],
    watchOut: ["開始的事記得做完", "情緒上下太大要練習平衡", "細節別忽略了"],
    futureJobs: ["記者", "演員", "創業家", "活動主持人", "兒童文學作家", "幼教老師", "街頭藝人", "說書人"],
    famous: ["華特迪士尼", "羅賓威廉斯"],
    bestMatches: ["INTJ", "INFJ", "ENTP"],
    growthPartners: ["ISTJ", "ESTJ"],
    tipForGrowth: "ENFP 需要被肯定、需要被擁抱、需要新鮮感。但也偶爾需要被輕輕拉回現實。",
  },
  ISTJ: {
    type: "ISTJ",
    nickname: "物流師",
    oneLiner: "聯絡簿一定每天簽、規則絕對遵守的可靠小幹部。",
    emoji: "📋",
    color: "mint",
    gradient: "from-emerald-300 via-teal-300 to-cyan-400",
    campusRole: "風紀股長、班費保管人、老師最信任的得力助手",
    description: [
      "ISTJ 是 16 型裡最值得信賴的人。答應你的事，一定做到；該交的功課，從不遲交。",
      "你不喜歡虛華，喜歡實實在在地把事情做好。別人玩鬧時，你已經在整理筆記。",
      "重視傳統、規則、責任。當班級需要有人扛責任時，第一個被想到的常常是你。",
    ],
    strengths: ["責任感超強", "做事有條理", "誠實可靠", "腳踏實地", "毅力驚人"],
    watchOut: ["偶爾跳脫框架試試看", "讓自己玩樂也很重要", "別把規則當成唯一答案"],
    futureJobs: ["會計師", "工程師", "法官", "醫師", "公務員", "護理師", "檔案管理員", "宅配司機"],
    famous: ["華倫·巴菲特", "華盛頓總統"],
    bestMatches: ["ESFP", "ESTP", "ISFJ"],
    growthPartners: ["ENFP", "ENTP"],
    tipForGrowth: "ISTJ 把世界扛得很穩。給他一句『有你真好』，他會偷偷感動一整天。",
  },
  ISFJ: {
    type: "ISFJ",
    nickname: "守護者",
    oneLiner: "默默幫同學收作業、整理公物的暖心守護神。",
    emoji: "🕊️",
    color: "mint",
    gradient: "from-green-300 via-emerald-300 to-teal-300",
    campusRole: "誰摔倒第一個衝過去扶、誰生病一定送湯的小天使",
    description: [
      "ISFJ 是 16 型裡最溫暖的存在。你不太愛搶風頭，但默默把每個人的需要都記在心裡。",
      "你心思細膩，記得朋友最喜歡的零食、討厭的食物、生日的日期 — 但你從不炫耀。",
      "重視家庭、朋友、傳統。對你而言，「被需要」就是最大的幸福。",
    ],
    strengths: ["細心體貼", "記憶力強", "責任感重", "默默付出", "忠誠可靠"],
    watchOut: ["也要學會說『不』", "別總是把別人放第一", "自己的夢想很重要"],
    futureJobs: ["護理師", "老師", "圖書館員", "幼教老師", "獸醫", "長照員", "烘焙師", "校護"],
    famous: ["德蕾莎修女", "羅莎·帕克斯"],
    bestMatches: ["ESTP", "ESFP", "ENFP"],
    growthPartners: ["ENTJ", "ENTP"],
    tipForGrowth: "ISFJ 把愛藏在所有細節裡。記得直接告訴他『謝謝你』。",
  },
  ESTJ: {
    type: "ESTJ",
    nickname: "總經理",
    oneLiner: "團體報告分工表自動跑出來的小老闆。",
    emoji: "📊",
    color: "coral",
    gradient: "from-red-300 via-orange-300 to-amber-400",
    campusRole: "班長、副班長、小組長、運動會總指揮",
    description: [
      "ESTJ 是把混亂變秩序的高手。看到小組亂成一團，你會自動跳出來說「我們來分工」。",
      "你重視效率、責任、規則。事情該怎麼做就怎麼做，不喜歡拖泥帶水。",
      "雖然有時被說太嚴格，但其實你是希望大家都好。你的領導力讓團隊更有戰鬥力。",
    ],
    strengths: ["組織能力強", "領導力高", "執行力超強", "可靠負責", "公平正直"],
    watchOut: ["也聽聽不同的聲音", "情感也是真實的", "規則之外還有彈性"],
    futureJobs: ["經理", "校長", "軍官", "法官", "企業家", "里長", "球隊隊長", "工地監工"],
    famous: ["艾森豪總統", "希拉蕊·柯林頓"],
    bestMatches: ["ISFP", "ISTP", "INFP"],
    growthPartners: ["INFP", "INTP"],
    tipForGrowth: "ESTJ 容易把感受藏在「我來處理」後面。陪他聊聊心事是好事。",
  },
  ESFJ: {
    type: "ESFJ",
    nickname: "執政官",
    oneLiner: "校慶活動少了他就不會成功的氣氛大師。",
    emoji: "🍰",
    color: "rose",
    gradient: "from-pink-300 via-rose-300 to-red-300",
    campusRole: "聯絡簿傳遞員、生日趴籌備員、班級服務股長",
    description: [
      "ESFJ 是把人和人連起來的大使。你記得每個朋友的生日、喜好、家裡有幾隻寵物。",
      "你熱心助人、樂於分享、超會炒熱氣氛。班級裡的歡樂時光，大半是因為有你。",
      "重視和諧、團體、傳統。看到有人被冷落，你會自然地把他拉進來一起玩。",
    ],
    strengths: ["人緣超好", "細心熱情", "團隊意識強", "可靠忠誠", "凝聚人心"],
    watchOut: ["不必為所有人開心負責", "也可以表達自己的需求", "別怕別人不開心"],
    futureJobs: ["護理師", "老師", "活動企劃", "餐廳老闆", "禮賓專員", "美容師", "婚禮顧問", "社區關懷員"],
    famous: ["珍妮佛·嘉納", "比爾·柯林頓"],
    bestMatches: ["ISFP", "ISTP", "INFP"],
    growthPartners: ["INTP", "INTJ"],
    tipForGrowth: "ESFJ 把和諧看得很重。讓他知道『有時候不和諧也沒關係』很重要。",
  },
  ISTP: {
    type: "ISTP",
    nickname: "鑑賞家",
    oneLiner: "東西壞了拆開就會修的小工程師。",
    emoji: "🔧",
    color: "sky",
    gradient: "from-slate-300 via-sky-300 to-blue-400",
    campusRole: "腳踏車鏈條掉了、遙控器壞了，找他就對了",
    description: [
      "ISTP 是 16 型裡的「動手達人」。你話不多，但只要拿到工具就能變魔術。",
      "你冷靜、實際、不愛長篇大論。喜歡用行動證明，不喜歡用嘴巴吹噓。",
      "適應力強、能在危機中保持冷靜。是團隊裡那個「真的把事情做好」的人。",
    ],
    strengths: ["動手能力強", "冷靜實際", "適應力高", "邏輯清楚", "獨立"],
    watchOut: ["別人需要陪伴時記得在", "話多一點別人才懂你", "情緒也要照顧"],
    futureJobs: ["機械師", "飛行員", "外科醫師", "工程師", "運動員", "汽車維修師", "木工師傅", "潛水教練"],
    famous: ["邁可·喬丹", "貝爾·吉羅斯"],
    bestMatches: ["ESFJ", "ESTJ", "ENFJ"],
    growthPartners: ["ENFJ", "ESFJ"],
    tipForGrowth: "ISTP 用做的、不用說的。看到他默默幫忙，記得肯定他的行動。",
  },
  ISFP: {
    type: "ISFP",
    nickname: "探險家",
    oneLiner: "用畫筆、音符、舞步表達世界的小藝術家。",
    emoji: "🎨",
    color: "rose",
    gradient: "from-rose-300 via-pink-300 to-purple-400",
    campusRole: "美術課最閃耀、音樂課常獨奏的安靜創作者",
    description: [
      "ISFP 像一陣輕輕的風，悄悄地讓世界變美。你話不多，但作品會替你說話。",
      "你重視自由、美感、和真實的感受。不喜歡被規則綁住，更喜歡用自己的方式表達。",
      "心地柔軟、感受敏銳。看到小動物受傷會難過、看到夕陽會發呆 — 那是你的詩意瞬間。",
    ],
    strengths: ["美感敏銳", "創造力強", "溫柔同理", "獨立自由", "真誠"],
    watchOut: ["敢於表達自己的想法", "計畫一下未來不會綁住你", "衝突不是壞事"],
    futureJobs: ["插畫家", "音樂家", "舞者", "服裝設計師", "攝影師", "髮型師", "寵物美容師", "陶藝師"],
    famous: ["麥可·傑克森", "波·迪倫"],
    bestMatches: ["ESFJ", "ESTJ", "ENFJ"],
    growthPartners: ["ENTJ", "ESTJ"],
    tipForGrowth: "ISFP 在被打分數的環境裡會內傷。多問「你想表達什麼？」勝過「畫得像不像？」",
  },
  ESTP: {
    type: "ESTP",
    nickname: "企業家",
    oneLiner: "下課鐘響第一個衝出教室的運動小旋風。",
    emoji: "⚡",
    color: "sunny",
    gradient: "from-amber-300 via-orange-400 to-red-400",
    campusRole: "躲避球王、班際運動會 MVP、活力擔當",
    description: [
      "ESTP 是 16 型裡最有「現場感」的人。你不愛紙上談兵，喜歡實際下場玩。",
      "你反應快、膽子大、愛冒險。讓你坐在教室裡背書真的太痛苦，下場跑跳才是你的天堂。",
      "在運動、競賽、即興演出裡發光發熱。是團隊裡那個「衝啊！我先上！」的人。",
    ],
    strengths: ["行動力超強", "反應敏捷", "勇於嘗試", "現場感強", "適應力高"],
    watchOut: ["想清楚再衝也不遲", "別人感受要顧到", "規則也是有道理的"],
    futureJobs: ["運動員", "消防員", "創業家", "業務員", "急診醫師", "戶外領隊", "警察", "巡山員"],
    famous: ["麥可·喬丹 (運動版)", "唐納·川普"],
    bestMatches: ["ISFJ", "ISTJ", "INFJ"],
    growthPartners: ["INFJ", "INFP"],
    tipForGrowth: "ESTP 在靜態教學裡會躁動。給他『動手做』的任務會看到完全不一樣的他。",
  },
  ESFP: {
    type: "ESFP",
    nickname: "表演者",
    oneLiner: "走到哪都能變成舞台的天生明星。",
    emoji: "🎤",
    color: "rose",
    gradient: "from-pink-400 via-rose-300 to-yellow-300",
    campusRole: "才藝表演主秀、班級搞笑擔當、人氣王",
    description: [
      "ESFP 是 16 型裡最會把生活變成派對的人。你愛笑、愛玩、愛吃、愛大家都開心。",
      "你的能量像太陽 — 走到哪裡，那裡就亮起來。沒朋友的人到你身邊三分鐘就變朋友。",
      "感受敏銳、表達豐富、超會抓氣氛。雖然有時候靜不下來，但你的熱情是無價之寶。",
    ],
    strengths: ["氣氛擔當", "感染力強", "感受敏銳", "勇於表達", "人緣超好"],
    watchOut: ["靜下來規劃一下未來", "也要學會專心", "情緒上下要練習平衡"],
    futureJobs: ["演員", "歌手", "活動主持", "幼教老師", "美食家", "調酒師", "街頭藝人", "兒童才藝老師"],
    famous: ["艾倫·迪珍妮", "瑪麗蓮·夢露"],
    bestMatches: ["ISFJ", "ISTJ", "INFJ"],
    growthPartners: ["INTJ", "INTP"],
    tipForGrowth: "ESFP 在被允許表達的舞台上會發光。給他舞台，他會回給你 100 倍的快樂。",
  },
};

export default MBTI_DATA;

export function getMBTIInfo(type: MBTIType): MBTIInfo {
  return MBTI_DATA[type];
}

export function getAllMBTIInfo(): MBTIInfo[] {
  return Object.values(MBTI_DATA);
}

/** 將 16 型分成四群顯示用 */
export const MBTI_GROUPS = [
  {
    name: "分析家 (NT)",
    key: "NT",
    color: "from-purple-300 to-indigo-400",
    emoji: "🧠",
    desc: "用邏輯與遠見看世界的策略派",
    types: ["INTJ", "INTP", "ENTJ", "ENTP"] as MBTIType[],
  },
  {
    name: "外交官 (NF)",
    key: "NF",
    color: "from-rose-300 to-pink-400",
    emoji: "💖",
    desc: "重視價值與情感的理想派",
    types: ["INFJ", "INFP", "ENFJ", "ENFP"] as MBTIType[],
  },
  {
    name: "守護者 (SJ)",
    key: "SJ",
    color: "from-emerald-300 to-teal-400",
    emoji: "🛡️",
    desc: "守護秩序與責任的可靠派",
    types: ["ISTJ", "ISFJ", "ESTJ", "ESFJ"] as MBTIType[],
  },
  {
    name: "探險家 (SP)",
    key: "SP",
    color: "from-amber-300 to-orange-400",
    emoji: "🌈",
    desc: "享受當下與行動的自由派",
    types: ["ISTP", "ISFP", "ESTP", "ESFP"] as MBTIType[],
  },
];
