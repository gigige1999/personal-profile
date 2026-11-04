// 站点配置数据结构与本地缓存
// 线上生效的配置由 /api/site-config 提供，见 ./remoteConfig.ts

export interface SiteSettings {
  logo: string;        // logo URL
  tabTitle: string;    // 浏览器 tab 标题
  faviconUrl: string;  // favicon URL
  adminPassword: string; // 管理端登录密码
}

export interface ToolItem {
  name: string;
}

export interface ProfileSettings {
  photo: string;
  heroBackground: string; // Hero 背景图/视频 URL
  heroBackgroundType: 'image' | 'video';
  heroSub: { cn: string; en: string };
  heroTitle: { cn: [string, string]; en: [string, string] };
  heroDesc: { cn: string; en: string };
  scrollingText: { cn: string; en: string };
  aboutTitle: { cn: [string, string]; en: [string, string] };
  aboutDesc1: { cn: string; en: string };
  aboutDesc2: { cn: string; en: string };
  philosophy: { cn: string; en: string };
  philosophyVal: { cn: string; en: string };
  location: { cn: string; en: string };
  locationVal: { cn: string; en: string };
  tools: ToolItem[]; // 常用工具
}

export interface ProjectItem {
  id: string;
  title: { cn: string; en: string };
  category: 'interactive-book' | 'puzzle-game';
  description: { cn: string; en: string };
  longDescription: { cn: string; en: string };
  coverImage: string;
  coverType: 'image' | 'video';  // 封面类型
  videoPlayMode: 'delay5s' | 'hover';  // 视频播放模式：5秒后自动播放 / hover播放
  tags: string[];
  launchUrl: string;  // 启动项目跳转链接
  gallery: string[];  // 项目图片集（多张）
  gameplay: { cn: string; en: string };  // 玩法/功能概述
  demoVideo: string;  // 演示视频 URL（可选，留空不展示）
}

export interface TarotCard {
  id: string;
  title: { cn: string; en: string };
  subtitle: { cn: string; en: string };
  coverImage: string;        // 正面封面图
  backImage: string;         // 背面图（可选，留空使用默认花纹）
  projectId: string;         // 关联的项目 ID（点击可跳转）
  romanNumeral: string;      // 罗马数字编号 I, II, III...
}

export interface ContactSettings {
  github: string;
  twitter: string;
  email: string;
  xiaohongshu: string; // 小红书链接
  letsBuild: { cn: string; en: string };
  rights: { cn: string; en: string };
  designedWith: { cn: string; en: string };
}

export interface SiteConfig {
  site: SiteSettings;
  profile: ProfileSettings;
  projects: ProjectItem[];
  tarotCards: TarotCard[];
  contact: ContactSettings;
}

const STORAGE_KEY = 'shadow-archives-config';

export const defaultConfig: SiteConfig = {
  "site": {
    "logo": "/personal-profile/assets/extracted/image-ec5c9b5480d4.jpg",
    "tabTitle": "魔法花园 | Magic Garden",
    "faviconUrl": "",
    "adminPassword": "admin123"
  },
  "profile": {
    "photo": "/personal-profile/assets/extracted/image-40b681d3352c.jpg",
    "heroBackground": "/personal-profile/assets/extracted/image-495d9eb1c720.png",
    "heroBackgroundType": "image",
    "heroSub": {
      "cn": "风系魔法师鸽鸽的个人作品集",
      "en": "Wind Mage Gege's Personal Portfolio"
    },
    "heroTitle": {
      "cn": [
        "魔法",
        "花园"
      ],
      "en": [
        "Magic",
        "Garden"
      ]
    },
    "heroDesc": {
      "cn": "专注于创意游戏和工具。",
      "en": "Focusing on creative games and tools."
    },
    "scrollingText": {
      "cn": "欢迎来到过去，现在，和未来",
      "en": "Welcome to the past, present, and future"
    },
    "aboutTitle": {
      "cn": [
        "魔法背后的",
        "意志"
      ],
      "en": [
        "The Will Behind",
        "the Magic"
      ]
    },
    "aboutDesc1": {
      "cn": "我是一名风系魔法师，擅长将无形的创意转化为有形的数字体验。我的魔法涵盖了从高效的生产力工具到充满想象力的创意游戏。",
      "en": "I am a wind mage, skilled at transforming invisible ideas into tangible digital experiences. My magic spans from efficient productivity tools to imaginative creative games."
    },
    "aboutDesc2": {
      "cn": "在我的魔法花园里，每一行代码都是咒语，每一个像素都是精灵。我致力于在逻辑与幻想的边界上，构建属于未来的数字景观。",
      "en": "In my magic garden, every line of code is a spell, and every pixel is a sprite. I am dedicated to building future digital landscapes on the boundary between logic and fantasy."
    },
    "philosophy": {
      "cn": "设计哲学",
      "en": "Philosophy"
    },
    "philosophyVal": {
      "cn": "逻辑与幻想的平衡",
      "en": "Balance of Logic & Fantasy"
    },
    "location": {
      "cn": "所在地",
      "en": "Location"
    },
    "locationVal": {
      "cn": "风之谷 / 云端",
      "en": "Valley of Wind / Clouds"
    },
    "tools": [
      {
        "name": "Unity"
      },
      {
        "name": "TypeScript"
      },
      {
        "name": "Figma"
      },
      {
        "name": "Blender"
      },
      {
        "name": "procreate"
      }
    ]
  },
  "projects": [
    {
      "id": "3",
      "title": {
        "cn": "百年孤独-马孔多的记忆",
        "en": "Neon Cipher"
      },
      "category": "puzzle-game",
      "description": {
        "cn": "欢迎来到马尔克斯沉寂的世界",
        "en": "A cyberpunk hacking simulator with real-world cryptography."
      },
      "longDescription": {
        "cn": "基于百年孤独内容的解密小游戏，带你走近马孔多的雨季",
        "en": "Neon Cipher puts you in the shoes of a digital ghost. Solve complex cryptographic puzzles based on real-world algorithms while navigating a high-stakes narrative of corporate espionage."
      },
      "coverImage": "/personal-profile/assets/extracted/image-2e847f31c1da.png",
      "coverType": "image",
      "videoPlayMode": "delay5s",
      "tags": [
        "交互书，百年孤独，文字游戏"
      ],
      "launchUrl": "https://gigige1999.github.io/_101book/",
      "gallery": [
        "/personal-profile/assets/extracted/image-201222448915.png",
        "/personal-profile/assets/extracted/image-514dedcfca90.png",
        "/personal-profile/assets/extracted/image-840db330e18d.png",
        "/personal-profile/assets/extracted/image-9db9bfabcd03.png",
        "/personal-profile/assets/extracted/image-9f261b60dec4.png",
        "/personal-profile/assets/extracted/image-b4b5dede88a1.png"
      ],
      "gameplay": {
        "cn": "",
        "en": ""
      },
      "demoVideo": "/personal-profile/assets/extracted/video-98492c99c314.mov"
    },
    {
      "id": "1",
      "title": {
        "cn": "交互书-世界名著可视化书架",
        "en": "Aetheria Puzzle"
      },
      "category": "interactive-book",
      "description": {
        "cn": "一本可以随时翻阅的交互书",
        "en": "A minimalist spatial reasoning game set in a dreamlike void."
      },
      "longDescription": {
        "cn": "一本可以随时翻阅的交互书。用指尖代替翻页，用好奇心驱动叙事。每一处细节都可以交互，每一次触碰都通往新的可能。",
        "en": "An interactive book you can open anytime. Let your fingertips turn the pages, let curiosity drive the narrative. Every detail is interactive, every touch leads to new possibilities."
      },
      "coverImage": "/personal-profile/assets/extracted/image-e7f54c098f09.png",
      "coverType": "image",
      "videoPlayMode": "delay5s",
      "tags": [
        "交互书，互动，外国名著"
      ],
      "launchUrl": "",
      "gallery": [
        "/personal-profile/assets/extracted/image-65bc515625d4.png",
        "/personal-profile/assets/extracted/image-deb63f1af5f4.png",
        "/personal-profile/assets/extracted/image-e3a2bed82c75.png",
        "/personal-profile/assets/extracted/image-d57828e4c5af.png",
        "/personal-profile/assets/extracted/image-8c318a2c6e15.png"
      ],
      "gameplay": {
        "cn": "",
        "en": ""
      },
      "demoVideo": "/personal-profile/assets/extracted/video-0d1bdbd7e7e0.mov"
    },
    {
      "id": "1792740206731",
      "title": {
        "cn": "中世纪城堡交互书",
        "en": "CASTELLUM · Within the Stone Walls"
      },
      "category": "interactive-book",
      "description": {
        "cn": "走进公元10世纪的城堡，在石墙之间过一天中世纪生活",
        "en": "Step into a 10th-century castle and live a medieval day within its stone walls."
      },
      "longDescription": {
        "cn": "一部可以走进去的 3D 城堡交互书。以公元 950 年前后的西欧城堡为蓝本进行概念复原，25 个室内空间、30 个可交互区域分布在主堡、地下层与庭院之间，每一处都配有介绍与平面示意图，在漫游中读懂中世纪城堡的防御、日常与信仰。",
        "en": "A 3D castle book you can walk into. Conceptually reconstructed from Western European castles around 950 AD, it spans 25 interior spaces and 30 interactive areas across the keep, the undercroft and the courtyard, each with notes and a floor plan, revealing the defense, daily life and faith of a medieval castle as you wander."
      },
      "coverImage": "/personal-profile/assets/extracted/image-d689ba231983.png",
      "coverType": "image",
      "videoPlayMode": "delay5s",
      "tags": [
        "交互书",
        "中世纪",
        "3D漫游",
        "历史科普",
        "角色扮演"
      ],
      "launchUrl": "https://gigige1999.github.io/mid-castle/",
      "gallery": [
        "/personal-profile/assets/extracted/image-70be365e6f17.png",
        "/personal-profile/assets/extracted/image-1213a744a56c.png",
        "/personal-profile/assets/extracted/image-c16e74e88f78.png",
        "/personal-profile/assets/extracted/image-4c92035bde8d.png",
        "/personal-profile/assets/extracted/image-642c106c3144.png",
        "/personal-profile/assets/extracted/image-77b91242777e.png",
        "/personal-profile/assets/extracted/image-899034533b24.png"
      ],
      "gameplay": {
        "cn": "从领主、守卫、司铎、厨师、铁匠、缮写员、草药师等 9 种身份中选择一位，在自己的房间醒来。点击地面或用 WASD 在城堡中行走，拾取散落的物品放进行囊，与庭院里的 9 位居民交谈、赠礼，完成每个角色的「今日小事」，收集纪念章与成就。也可以拖动旋转整座城堡，剖开任意房间查看结构与说明。",
        "en": "Choose one of 9 roles, from lord and guard to priest, cook, blacksmith, scribe and herbalist, and wake up in your own chamber. Click or use WASD to walk the castle, gather items into your satchel, chat with and give gifts to 9 residents in the courtyard, finish each role's daily tasks, and earn medals and achievements. You can also rotate the whole castle and cut open any room to explore its structure."
      },
      "demoVideo": ""
    },
    {
      "id": "1792742248298",
      "title": {
        "cn": "风栖之境",
        "en": "The Quiet Lands"
      },
      "category": "puzzle-game",
      "description": {
        "cn": "在苔藓与废墟间慢慢走，种下一朵花，翻开一页插画手记",
        "en": "Wander mossy ruins, plant a flower, and unlock a page of an illustrated journal."
      },
      "longDescription": {
        "cn": "一场中世纪西幻风格的治愈系遗迹漫游。推开废墟中的石门，跟随猫耳白斗篷的小旅人登上一座低多边形小岛，在微风峡谷、被遗忘的圣所、遗迹旷野之间游荡。这里没有战斗，也没有惩罚，草木正慢慢收复石头，而每一处风景都通向一幅插画。",
        "en": "A cozy ruin-wandering journey in a medieval fantasy world. Push open a stone gate and follow a little cat-eared traveler in a white cloak across a low-poly island, through the Breezy Canyon, the Forgotten Sanctuary and the Ruined Wilds. No combat, no penalties: just greenery slowly reclaiming stone, and every view leading into an illustration."
      },
      "coverImage": "/personal-profile/assets/extracted/image-ef9d44c659df.png",
      "coverType": "image",
      "videoPlayMode": "delay5s",
      "tags": [
        "治愈",
        "遗迹漫游",
        "插画",
        "西幻",
        "放置养成"
      ],
      "launchUrl": "https://gigige1999.github.io/myMINIMAP/",
      "gallery": [
        "/personal-profile/assets/extracted/image-7e9243d572b9.png"
      ],
      "gameplay": {
        "cn": "点击地面或用 WASD 自由行走，穿过石桥、点燃篝火坐下休息、切换昼夜。核心循环是「花与峡谷」：在峡谷拾取种子，带回篝火边种下，花开后解锁一页插画手记；种满三朵，峡谷得以修复，彩虹随之出现。点击地名即可进入全屏插画浏览，画中的藤叶、光束与飞鸟都会轻轻动起来。",
        "en": "Walk freely by clicking or with WASD, cross stone bridges, light a campfire to rest, and switch between day and night. The core loop is \"Flowers & the Canyon\": collect seeds in the canyon, plant them by the campfire, and each bloom unlocks a page of the illustrated journal. Grow three flowers to restore the canyon and bring out a rainbow. Click a place name to open a full-screen illustration where vines, light beams and birds gently come alive."
      },
      "demoVideo": ""
    },
    {
      "id": "1792742663665",
      "title": {
        "cn": "魔女侦探日记",
        "en": "Witch Detective's Diary"
      },
      "category": "puzzle-game",
      "description": {
        "cn": "1897 年的伦敦，月亮缺了一块。翻开手册，查明黑曜月蚀案",
        "en": "London, 1897. A piece of the moon is missing. Open the casebook and solve the Obsidian Eclipse."
      },
      "longDescription": {
        "cn": "一部维多利亚哥特风的魔幻推理交互书。午夜，月神剧院的银月吊灯骤然熄灭，灯中的蓝火被盗，后台大门却从内反锁。翻开魔女侦探手册，在旧报纸、手写信与魔法证物之间，拼凑出这场「偷月亮」事件背后的真相。",
        "en": "A Victorian-gothic magical mystery book. At midnight, the silver moon chandelier of the Luna Theatre goes dark, its blue flame stolen, while the backstage door remains locked from the inside. Open the witch detective's casebook and piece together the truth behind the theft of the moon from old newspapers, handwritten letters and magical evidence."
      },
      "coverImage": "/personal-profile/assets/extracted/image-dce11d49e77d.png",
      "coverType": "image",
      "videoPlayMode": "delay5s",
      "tags": [
        "推理",
        "魔女",
        "维多利亚",
        "手账风",
        "侦探"
      ],
      "launchUrl": "https://gigige1999.github.io/detectivestory/",
      "gallery": [
        "/personal-profile/assets/extracted/image-e1e71e8e08de.png",
        "/personal-profile/assets/extracted/image-b409a8001232.png",
        "/personal-profile/assets/extracted/image-c6ab6fc92d0b.png"
      ],
      "gameplay": {
        "cn": "扮演调查员艾达，在 3D 街景与剧院内景中勘验 6 件证物，询问钟表师傅、剧院总管与舞女三位证人，部分证物需要先完成对话才会解锁。把疑点记进手账，梳理案件时间线，最后填写结案报告，指认嫌疑人、作案手法与动机。推理正确，才能读到那个关于姐妹的结局。",
        "en": "Play as investigator Ada: examine 6 pieces of evidence across 3D street and theatre scenes, and question three witnesses (a clockmaker, the theatre manager and a dancer). Some evidence unlocks only after the right conversation. Log your doubts in the journal, rebuild the timeline, then file the final report naming the culprit, the method and the motive. Only the right deduction reveals the ending about two sisters."
      },
      "demoVideo": ""
    },
    {
      "id": "1792742715447",
      "title": {
        "cn": "vikings历史交互书",
        "en": "The Viking Age in Britain"
      },
      "category": "interactive-book",
      "description": {
        "cn": "翻开一部皮面古书，重返不列颠的维京纪元（793–1066）",
        "en": "Open a leather-bound codex and return to Viking Age Britain (793–1066)."
      },
      "longDescription": {
        "cn": "一部中世纪手抄本风格的数字古籍。从 793 年林迪斯法恩的劫掠到 1066 年的斯坦福桥之战，以大事记、史诗篇章、饮食、建筑、信仰与战争六大板块，讲述维京人在不列颠的近三百年。左页正文、右页古画，羊皮纸、如尼文与烫金封面还原翻阅古书的质感。",
        "en": "A digital codex in the style of a medieval illuminated manuscript. From the raid on Lindisfarne in 793 to the Battle of Stamford Bridge in 1066, six sections (chronicle, epic chapters, food, architecture, faith and warfare) tell nearly three centuries of the Vikings in Britain. Text on the left, illustrations on the right, with parchment, runes and a gilded cover recreating the feel of an ancient book."
      },
      "coverImage": "/personal-profile/assets/extracted/image-e5fe4bac6c51.png",
      "coverType": "image",
      "videoPlayMode": "delay5s",
      "tags": [
        "交互书",
        "维京",
        "历史",
        "手抄本",
        "中英双语"
      ],
      "launchUrl": "https://gigige1999.github.io/vikings/",
      "gallery": [
        "/personal-profile/assets/extracted/image-3929d8b64f34.png",
        "/personal-profile/assets/extracted/image-61574e4c0093.png",
        "/personal-profile/assets/extracted/image-f11381bd6560.png",
        "/personal-profile/assets/extracted/image-6dcdf62b2c02.png",
        "/personal-profile/assets/extracted/image-b7a05afc67dc.png"
      ],
      "gameplay": {
        "cn": "开启烫金封面后以双页跨页阅读，翻页伴随羊皮纸声响。点击插画中的热点，正文关键词会同步高亮；通过交互时间线与扩张地图追踪维京人的足迹，在人物关系图谱中厘清阿尔弗雷德、克努特等人物的纠葛，还可以观看纪录短片。支持中英双语与深色、白色两种阅读主题。",
        "en": "Open the gilded cover and read in two-page spreads, with the rustle of parchment on every turn. Click hotspots in the illustrations to highlight matching keywords in the text; follow the Vikings' footsteps on an interactive timeline and expansion map, untangle figures like Alfred and Cnut in a relationship graph, and watch a short documentary. Available in Chinese and English, with dark and light reading themes."
      },
      "demoVideo": ""
    },
    {
      "id": "1792742626631",
      "title": {
        "cn": "迷雾城堡",
        "en": "Misty Castle"
      },
      "category": "puzzle-game",
      "description": {
        "cn": "1448 年的雾湖古堡，乌鸦在等待第 33 年的献祭",
        "en": "A castle by a misty lake, 1448. The raven awaits its offering every 33 years."
      },
      "longDescription": {
        "cn": "一款锈湖风格的点击解谜逃脱游戏。英格兰北部雾湖边的雷文霍尔德堡，家族先祖曾与雾中的乌鸦立约，每隔三十三年献出一个孩子。你在一间上锁的石屋中醒来，穿过礼拜堂、磨坊、肖像长廊与钟楼，一点点拼回被涂抹的家族记忆。不见血，只靠暗示的哥特悬疑。",
        "en": "A Rusty Lake-style point-and-click escape puzzle. At Ravenhold, a castle by a misty lake in northern England, the family's ancestors made a pact with the raven in the fog: a child every thirty-three years. You wake in a locked stone room and pass through the chapel, the mill, the portrait gallery and the bell tower, piecing together a family memory that was painted over. Gothic suspense told through hints, not gore."
      },
      "coverImage": "/personal-profile/assets/extracted/image-7334772eadc3.png",
      "coverType": "image",
      "videoPlayMode": "delay5s",
      "tags": [
        "解谜",
        "锈湖风",
        "哥特",
        "密室逃脱",
        "中世纪"
      ],
      "launchUrl": "https://gigige1999.github.io/misty-castle/",
      "gallery": [
        "/personal-profile/assets/extracted/image-c546af3d8d14.png",
        "/personal-profile/assets/extracted/image-a0cc8a63c147.png",
        "/personal-profile/assets/extracted/image-a16b52f9a5f7.png",
        "/personal-profile/assets/extracted/image-269b3cfc2ff0.png",
        "/personal-profile/assets/extracted/image-dc84fc448e25.png"
      ],
      "gameplay": {
        "cn": "点击场景查看细节、进入特写，组合并使用物品栏里的道具解开机关。以「灰烬大厅」为枢纽依次进入八个房间，每一关都有新机制：光色滤读、音名拼词、量水、齿轮奇偶、镜中世界……卡关时可以使用三级提示；每个房间还藏着一根鸦羽与一页记忆书页，等待收集。",
        "en": "Click to inspect scenes and zoom into details, then combine and use items from your inventory to solve mechanisms. Starting from the Ash Hall hub, enter eight rooms, each with a new mechanic: color-filter reading, spelling with musical notes, measuring water, gear parity, a mirror world and more. A three-level hint system helps when you are stuck, and every room hides a raven feather and a memory page to collect."
      },
      "demoVideo": ""
    },
    {
      "id": "2",
      "title": {
        "cn": "教堂之谜",
        "en": "Chronos Notes"
      },
      "category": "puzzle-game",
      "description": {
        "cn": "一款非线性的解密小游戏",
        "en": "A time-aware note-taking application for non-linear thinkers."
      },
      "longDescription": {
        "cn": "侦探板通过将卡片与时间事件和解密状态联系起来，你需要寻找线索之间的关系",
        "en": "Chronos reimagines how we store information by linking notes to temporal events and emotional states. It uses a graph-based visualization to show how your ideas evolve over time."
      },
      "coverImage": "/personal-profile/assets/extracted/image-d3a5c86f1198.png",
      "coverType": "image",
      "videoPlayMode": "delay5s",
      "tags": [
        "解密，中世纪，侦探"
      ],
      "launchUrl": "",
      "gallery": [
        "/personal-profile/assets/extracted/image-6bcff663ef5b.jpg",
        "/personal-profile/assets/extracted/image-e12a84974a5a.jpg"
      ],
      "gameplay": {
        "cn": "威塞克斯郡的一所不起眼的小教堂里，藏着异教徒留下的痕迹，在信仰和生存之间，要做出什么样的选择",
        "en": ""
      },
      "demoVideo": "/personal-profile/assets/extracted/video-90dd84c27e4b.mov"
    },
    {
      "id": "4",
      "title": {
        "cn": "城堡的秘密",
        "en": "Lumina Studio"
      },
      "category": "puzzle-game",
      "description": {
        "cn": "来到中世纪城堡，你是客人也是食物",
        "en": "Generative art platform for digital painters."
      },
      "longDescription": {
        "cn": "通过在每个房间中搜集物品探索城堡主人不愿被人发现的秘密",
        "en": "Lumina provides a suite of AI-assisted brushes that respond to your strokes in real-time. It bridges the gap between traditional technique and algorithmic creativity."
      },
      "coverImage": "/personal-profile/assets/extracted/image-bddc3caaa136.png",
      "coverType": "image",
      "videoPlayMode": "delay5s",
      "tags": [
        "中世纪，解谜"
      ],
      "launchUrl": "",
      "gallery": [
        "/personal-profile/assets/extracted/image-cac1804c2efb.jpg",
        "/personal-profile/assets/extracted/image-ab9f7cc6c250.png",
        "/personal-profile/assets/extracted/image-d63f9171d894.png"
      ],
      "gameplay": {
        "cn": "",
        "en": ""
      },
      "demoVideo": "/personal-profile/assets/extracted/video-e215e3cbdffc.mov"
    },
    {
      "id": "1784112397292",
      "title": {
        "cn": "正念之旅",
        "en": ""
      },
      "category": "interactive-book",
      "description": {
        "cn": "跟随悉达多开启一段自我疗愈之旅",
        "en": ""
      },
      "longDescription": {
        "cn": "跟随悉达多开启一段自我疗愈之旅",
        "en": ""
      },
      "coverImage": "/personal-profile/assets/extracted/image-df2fc746d0be.png",
      "coverType": "image",
      "videoPlayMode": "delay5s",
      "tags": [
        "交互书，佛教"
      ],
      "launchUrl": "",
      "gallery": [
        "/personal-profile/assets/extracted/image-1f3f5cde2bb8.png",
        "/personal-profile/assets/extracted/image-4b6ea807ea29.png"
      ],
      "gameplay": {
        "cn": "",
        "en": ""
      },
      "demoVideo": "/personal-profile/assets/extracted/video-36f22be1b933.mov"
    }
  ],
  "tarotCards": [
    {
      "id": "tarot-3",
      "title": {
        "cn": "孤独的雨",
        "en": "Source of Magic"
      },
      "subtitle": {
        "cn": "潮湿中孕育着生机",
        "en": "The origin of all magic"
      },
      "coverImage": "/personal-profile/assets/extracted/image-76c8c590a233.png",
      "backImage": "",
      "projectId": "3",
      "romanNumeral": "III"
    },
    {
      "id": "tarot-1",
      "title": {
        "cn": "意外之喜",
        "en": "Wind Messenger"
      },
      "subtitle": {
        "cn": "来自未知的黑色羽毛",
        "en": "A breeze that carries inspiration"
      },
      "coverImage": "/personal-profile/assets/extracted/image-e12a84974a5a.jpg",
      "backImage": "",
      "projectId": "1792742715447",
      "romanNumeral": "I"
    },
    {
      "id": "tarot-2",
      "title": {
        "cn": "跳动的心",
        "en": "Star Guide"
      },
      "subtitle": {
        "cn": "追随内心的指引",
        "en": "Follow the guidance of starlight"
      },
      "coverImage": "/personal-profile/assets/extracted/image-d052ec52ee5a.png",
      "backImage": "",
      "projectId": "1792742626631",
      "romanNumeral": "II"
    }
  ],
  "contact": {
    "github": "",
    "twitter": "",
    "email": "",
    "xiaohongshu": "",
    "letsBuild": {
      "cn": "开启魔法契约",
      "en": "Forge a Magic Contract."
    },
    "rights": {
      "cn": "魔法花园 风系魔法师鸽鸽，保留所有权利",
      "en": "© 2026 Magic Garden by Wind Mage Gege. All rights reserved."
    },
    "designedWith": {
      "cn": "在风之谷中用心设计。",
      "en": "Designed with Intent in the Valley of Wind."
    }
  }
};

export function loadConfig(useLocalStorage = false): SiteConfig {
  // 管理端传 useLocalStorage=true，会从 localStorage 加载
  // 前端展示端直接使用 defaultConfig（即管理端写入源码的最新配置）
  if (useLocalStorage) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        // 深度合并，确保新字段有默认值
        return deepMerge(defaultConfig, saved);
      }
    } catch (e) {
      console.warn('Failed to load config:', e);
    }
  }
  return defaultConfig;
}

export function saveConfig(config: SiteConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Failed to save config:', e);
  }

  // 通知同标签页内的展示端刷新（线上生效由 publishConfig 负责）
  try {
    window.dispatchEvent(new CustomEvent('config-updated'));
  } catch (e) {
    console.warn('Failed to notify config update:', e);
  }
}

export function deepMerge(target: any, source: any): any {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
