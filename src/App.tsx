import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  ExternalLink, 
  Gamepad2, 
  AppWindow, 
  ArrowRight, 
  Github, 
  Twitter, 
  Mail,
  Languages
} from 'lucide-react';

// --- Types ---
type Language = 'cn' | 'en';

interface Project {
  id: string;
  title: { cn: string; en: string };
  category: 'app' | 'game';
  description: { cn: string; en: string };
  longDescription: { cn: string; en: string };
  coverImage: string;
  tags: string[];
}

// --- Translations ---
const T = {
  cn: {
    about: '关于',
    works: '作品',
    contact: '联系',
    heroSub: '风系魔法师鸽鸽的个人作品集',
    heroTitle: ['魔法', '花园'],
    heroDesc: '专注于创意游戏和工具。',
    scrollingText: '欢迎来到过去，现在，和未来',
    aboutTitle: ['魔法背后的', '意志'],
    aboutDesc1: '我是一名风系魔法师，擅长将无形的创意转化为有形的数字体验。我的魔法涵盖了从高效的生产力工具到充满想象力的创意游戏。',
    aboutDesc2: '在我的魔法花园里，每一行代码都是咒语，每一个像素都是精灵。我致力于在逻辑与幻想的边界上，构建属于未来的数字景观。',
    philosophy: '设计哲学',
    philosophyVal: '逻辑与幻想的平衡',
    location: '所在地',
    locationVal: '风之谷 / 云端',
    selectedWorks: '精选作品',
    archive: '魔法档案',
    all: '全部',
    apps: '应用',
    games: '游戏',
    viewDetails: '查看详情',
    launch: '启动项目',
    letsBuild: '开启魔法契约',
    rights: '魔法花园 风系魔法师鸽鸽，保留所有权利',
    designedWith: '在风之谷中用心设计。'
  },
  en: {
    about: 'About',
    works: 'Works',
    contact: 'Contact',
    heroSub: "Wind Mage Gege's Personal Portfolio",
    heroTitle: ['Magic', 'Garden'],
    heroDesc: 'Focusing on creative games and tools.',
    scrollingText: 'Welcome to the past, present, and future',
    aboutTitle: ['The Will Behind', 'the Magic'],
    aboutDesc1: 'I am a wind mage, skilled at transforming invisible ideas into tangible digital experiences. My magic spans from efficient productivity tools to imaginative creative games.',
    aboutDesc2: 'In my magic garden, every line of code is a spell, and every pixel is a sprite. I am dedicated to building future digital landscapes on the boundary between logic and fantasy.',
    philosophy: 'Philosophy',
    philosophyVal: 'Balance of Logic & Fantasy',
    location: 'Location',
    locationVal: 'Valley of Wind / Clouds',
    selectedWorks: 'Selected Works',
    archive: 'Magic Archive.',
    all: 'All',
    apps: 'Apps',
    games: 'Games',
    viewDetails: 'View Details',
    launch: 'Launch Project',
    letsBuild: "Forge a Magic Contract.",
    rights: '© 2026 Magic Garden by Wind Mage Gege. All rights reserved.',
    designedWith: 'Designed with Intent in the Valley of Wind.'
  }
};

// --- Mock Data ---
const PROJECTS: Project[] = [
  {
    id: '1',
    title: { cn: '以太谜题', en: 'Aetheria Puzzle' },
    category: 'game',
    description: { cn: '一个设定在梦幻虚空中的极简空间推理游戏。', en: 'A minimalist spatial reasoning game set in a dreamlike void.' },
    longDescription: { 
      cn: '以太谜题挑战玩家通过操纵光影来揭示隐藏的路径。受野兽派建筑和禅宗哲学的启发，它为大脑提供了一种冥想式但又极具挑战性的体验。', 
      en: 'Aetheria challenges players to manipulate light and shadow to reveal hidden paths. Inspired by brutalist architecture and zen philosophy, it offers a meditative yet taxing experience for the mind.' 
    },
    coverImage: 'https://picsum.photos/seed/aetheria/1920/1080',
    tags: ['Puzzle', 'Unity', 'Minimalist']
  },
  {
    id: '2',
    title: { cn: '克罗诺斯笔记', en: 'Chronos Notes' },
    category: 'app',
    description: { cn: '一款为非线性思维者设计的具有时间意识的笔记应用。', en: 'A time-aware note-taking application for non-linear thinkers.' },
    longDescription: { 
      cn: '克罗诺斯通过将笔记与时间事件和情感状态联系起来，重新想象了我们存储信息的方式。它使用基于图谱的可视化来展示你的想法如何随时间演变。', 
      en: 'Chronos reimagines how we store information by linking notes to temporal events and emotional states. It uses a graph-based visualization to show how your ideas evolve over time.' 
    },
    coverImage: 'https://picsum.photos/seed/chronos/1920/1080',
    tags: ['Productivity', 'React', 'Data Viz']
  },
  {
    id: '3',
    title: { cn: '霓虹密码', en: 'Neon Cipher' },
    category: 'game',
    description: { cn: '一款结合了现实世界密码学的赛博朋克黑客模拟器。', en: 'A cyberpunk hacking simulator with real-world cryptography.' },
    longDescription: { 
      cn: '霓虹密码让你化身为一名数字幽灵。在处理企业间谍活动的紧张叙事时，解决基于现实世界算法的复杂加密谜题。', 
      en: 'Neon Cipher puts you in the shoes of a digital ghost. Solve complex cryptographic puzzles based on real-world algorithms while navigating a high-stakes narrative of corporate espionage.' 
    },
    coverImage: 'https://picsum.photos/seed/neon/1920/1080',
    tags: ['Simulation', 'Cyberpunk', 'Cryptography']
  },
  {
    id: '4',
    title: { cn: '流光工作室', en: 'Lumina Studio' },
    category: 'app',
    description: { cn: '为数字画家设计的生成艺术平台。', en: 'Generative art platform for digital painters.' },
    longDescription: { 
      cn: '流光工作室提供了一套 AI 辅助画笔，能够实时响应你的笔触。它架起了传统技法与算法创意之间的桥梁。', 
      en: 'Lumina provides a suite of AI-assisted brushes that respond to your strokes in real-time. It bridges the gap between traditional technique and algorithmic creativity.' 
    },
    coverImage: 'https://picsum.photos/seed/lumina/1920/1080',
    tags: ['Creative', 'AI', 'Canvas']
  }
];

// --- Components ---

const ScrollingMarquee = ({ text }: { text: string }) => (
  <div className="w-full py-6 bg-accent/90 backdrop-blur-sm overflow-hidden border-y border-ink/5 flex items-center relative z-20">
    <motion.div 
      animate={{ x: [0, -1000] }}
      transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
      className="flex whitespace-nowrap gap-32"
    >
      {[...Array(10)].map((_, i) => (
        <motion.span 
          key={i} 
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
          className="text-bg font-serif italic text-lg md:text-xl tracking-[0.2em] uppercase opacity-90"
        >
          {text} <span className="mx-4 opacity-30 text-xs">/</span>
        </motion.span>
      ))}
    </motion.div>
  </div>
);

const Navbar = ({ lang, setLang }: { lang: Language, setLang: (l: Language) => void }) => (
  <motion.nav 
    initial={{ y: -100 }}
    animate={{ y: 0 }}
    className="fixed top-0 left-0 w-full z-50 px-8 py-6 flex justify-between items-center bg-bg/80 backdrop-blur-sm border-b border-ink/10"
  >
    {/* Top Red Line */}
    <div className="absolute top-0 left-0 w-full h-[2px] bg-accent opacity-60" />

    <div className="font-serif text-2xl font-bold tracking-tighter uppercase flex items-center gap-3">
      <div className="w-8 h-8 bg-accent text-bg flex items-center justify-center rounded-sm text-sm shadow-sm font-mono">M</div>
      <span className="tracking-[-0.05em]">{lang === 'cn' ? '魔法' : 'Magic'}</span> <span className="text-accent italic font-light">{lang === 'cn' ? '花园' : 'Garden'}</span>
    </div>
    <div className="flex items-center gap-8 font-mono text-[10px] uppercase tracking-[0.3em]">
      <a href="#about" className="hover:text-accent transition-colors hidden md:block">{T[lang].about}</a>
      <a href="#catalog" className="hover:text-accent transition-colors hidden md:block">{T[lang].works}</a>
      <a href="#contact" className="hover:text-accent transition-colors hidden md:block">{T[lang].contact}</a>
      <button 
        onClick={() => setLang(lang === 'cn' ? 'en' : 'cn')}
        className="flex items-center gap-2 hover:bg-accent hover:text-bg transition-all border-2 border-ink px-4 py-1.5 rounded-none font-mono text-[10px] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
      >
        <Languages className="w-3 h-3" />
        {lang === 'cn' ? 'EN' : '中文'}
      </button>
    </div>
  </motion.nav>
);

const Hero = ({ scrollYProgress, lang }: { scrollYProgress: any, lang: Language }) => {
  const blur = useTransform(scrollYProgress, [0, 0.2], [0, 20]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden border-b border-ink/10">
      <motion.div 
        style={{ filter: `blur(${blur}px)`, scale, opacity }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-bg/20 z-10" />
        <img 
          src="https://picsum.photos/seed/hero-bg/1920/1080?blur=2" 
          alt="Hero Background"
          className="w-full h-full object-cover opacity-40"
          referrerPolicy="no-referrer"
        />
        {/* Technical Grid Overlay */}
        <div className="absolute inset-0 z-10 opacity-10" style={{ backgroundImage: 'radial-gradient(var(--color-ink) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </motion.div>

      {/* Side Serial Number */}
      <div className="absolute left-12 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 opacity-20 hidden lg:flex">
        <div className="w-[1px] h-24 bg-accent" />
        <span className="font-mono text-[10px] uppercase tracking-[0.5em] vertical-text">
          {lang === 'cn' ? '风系魔法师' : 'WIND MAGE'}
        </span>
      </div>

      <div className="relative z-20 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="mb-12 relative flex flex-col items-center">
            {/* Circular Badge */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-20 -left-20 w-40 h-40 opacity-20 hidden md:block pointer-events-none"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full fill-accent">
                <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
                <text className="text-[7px] font-mono uppercase tracking-[0.2em]">
                  <textPath href="#circlePath">
                    {lang === 'cn' ? '魔法花园 • 风系魔法师 • 创意档案 •' : 'MAGIC GARDEN • WIND MAGE • CREATIVE ARCHIVE •'}
                  </textPath>
                </text>
              </svg>
            </motion.div>

            {/* Technical Crosshair */}
            <div className="absolute -top-6 -right-6 w-16 h-16 flex items-center justify-center opacity-30 hidden md:block">
              <div className="absolute w-full h-[1px] bg-accent" />
              <div className="absolute h-full w-[1px] bg-accent" />
              <div className="w-3 h-3 border border-accent rounded-full" />
              <span className="absolute -bottom-8 font-mono text-[6px] uppercase tracking-widest text-accent">Wind Element</span>
            </div>

            <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent block mb-4 bg-accent/5 px-4 py-1 border border-accent/20">
              {T[lang].heroSub}
            </span>
            <div className="w-24 h-[1px] bg-accent/40 mb-4" />
          </div>
          <div className="w-12 h-[1px] bg-accent mx-auto mb-8 opacity-40" />
          <h1 className="text-5xl md:text-9xl font-serif italic font-extralight leading-none mb-8 tracking-tighter">
            <span className="opacity-40">{T[lang].heroTitle[0]}</span> <br /> <span className="not-italic font-black text-accent">{T[lang].heroTitle[1]}</span>
          </h1>
          <p className="max-w-xl mx-auto font-sans text-lg md:text-xl opacity-80 font-light leading-relaxed text-balance border-t border-ink/10 pt-8 tracking-wide">
            {T[lang].heroDesc}
          </p>
        </motion.div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="font-mono text-[8px] uppercase tracking-widest opacity-40">Scroll to Explore</span>
          <ChevronDown className="w-4 h-4 text-accent opacity-50" />
        </motion.div>
      </div>

      {/* Bottom Technical Labels */}
      <div className="absolute bottom-4 left-0 w-full flex justify-between px-8 items-center pointer-events-none">
        <span className="font-mono text-[8px] opacity-20 uppercase tracking-widest">{lang === 'cn' ? '魔法花园' : 'MAGIC GARDEN'} // ARCHIVE v2.0</span>
        <span className="font-mono text-[8px] opacity-20 uppercase tracking-widest">WIND-ELEMENT-MAGE</span>
      </div>
    </section>
  );
};

const About = ({ lang }: { lang: Language }) => (
  <section id="about" className="min-h-screen w-full flex items-center justify-center bg-bg relative py-32 border-b border-ink/10">
    {/* Technical Lines */}
    <div className="absolute top-0 left-1/4 w-[1px] h-full bg-ink/5 hidden md:block" />
    <div className="absolute top-0 right-1/4 w-[1px] h-full bg-ink/5 hidden md:block" />

    <div className="max-w-6xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-20 items-center relative z-10">
      <div className="relative">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="aspect-[3/4] bg-ink/5 p-4 border border-ink/10"
        >
          <div className="w-full h-full overflow-hidden">
            <img 
              src="https://picsum.photos/seed/portrait/800/1200" 
              alt="Portrait"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </motion.div>
        <div className="absolute -bottom-4 -right-4 stamp bg-bg">Verified Identity</div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent mb-4 block">Dossier: {lang === 'cn' ? '风系魔法师' : 'Wind Mage'}</span>
        <h2 className="text-5xl md:text-7xl font-serif mb-8 leading-tight">
          {T[lang].aboutTitle[0]} <br /> <span className="italic text-accent">{T[lang].aboutTitle[1]}</span>
        </h2>
        <div className="space-y-6 text-lg opacity-80 font-light leading-relaxed border-l-2 border-accent pl-8">
          <p>{T[lang].aboutDesc1}</p>
          <p>{T[lang].aboutDesc2}</p>
        </div>
        
        <div className="mt-12 grid grid-cols-2 gap-8 border-t border-ink/10 pt-8">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent block mb-2">{T[lang].philosophy}</span>
            <p className="text-sm font-medium font-mono uppercase tracking-tighter">{T[lang].philosophyVal}</p>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent block mb-2">{T[lang].location}</span>
            <p className="text-sm font-medium font-mono uppercase tracking-tighter">{T[lang].locationVal}</p>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

const Catalog = ({ lang }: { lang: Language }) => {
  const [filter, setFilter] = useState<'all' | 'app' | 'game'>('all');
  
  const filteredProjects = PROJECTS.filter(p => filter === 'all' || p.category === filter);

  return (
    <section id="catalog" className="min-h-screen w-full py-32 bg-bg border-t border-ink/10 relative">
      {/* Side Labels */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[8px] uppercase tracking-[0.5em] vertical-text opacity-20 hidden lg:block">
        {lang === 'cn' ? '魔法花园' : 'MAGIC GARDEN'} // ARCHIVE 02
      </div>

      <div className="max-w-7xl mx-auto px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8 border-b border-ink/10 pb-12">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent mb-4 block">{T[lang].selectedWorks}</span>
            <h2 className="text-6xl md:text-8xl font-serif italic">{T[lang].archive}</h2>
          </div>
          
          <div className="flex gap-4 p-1">
            {(['all', 'app', 'game'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-none text-[10px] font-mono uppercase tracking-widest transition-all border-2 border-ink shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                  filter === f ? 'bg-ink text-bg' : 'bg-bg hover:bg-accent hover:text-bg'
                }`}
              >
                {f === 'all' ? T[lang].all : f === 'app' ? T[lang].apps : T[lang].games}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-32">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group cursor-pointer relative"
              >
                {/* Index Number */}
                <span className="absolute -top-8 -left-8 font-mono text-[40px] opacity-5 italic text-ink select-none">
                  0{index + 1}
                </span>

                <div className="relative aspect-[16/10] bg-ink/5 p-2 border border-ink/10 mb-8 overflow-hidden">
                  {/* Red Corner Accent */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-accent z-20" />
                  
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                    className="w-full h-full transition-all duration-700"
                  >
                    <img 
                      src={project.coverImage} 
                      alt={project.title[lang]}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                  
                  {/* Corner Accents */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-accent/40" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-accent/40" />
                  
                  <div className="absolute top-4 right-4 flex gap-2">
                    {project.category === 'game' ? <Gamepad2 className="w-4 h-4 text-ink/40" /> : <AppWindow className="w-4 h-4 text-ink/40" />}
                  </div>
                </div>
                
                <div className="flex justify-between items-start border-t border-ink/10 pt-6">
                  <div>
                    <span className="font-mono text-[8px] uppercase tracking-widest text-accent mb-2 block">Project Ref: {project.id}</span>
                    <h3 className="text-3xl font-serif mb-2 group-hover:text-accent transition-colors">{project.title[lang]}</h3>
                    <p className="opacity-60 text-sm font-light max-w-sm leading-relaxed">{project.description[lang]}</p>
                  </div>
                  <div className="text-right">
                    <ArrowRight className="w-5 h-5 text-accent opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

const ProjectDetails = ({ lang }: { lang: Language }) => (
  <section className="bg-bg">
    {PROJECTS.map((project, index) => (
      <div key={project.id} className="min-h-screen w-full flex flex-col md:flex-row border-t border-ink/10 relative">
        <div className={`w-full md:w-1/2 aspect-video md:h-screen md:sticky md:top-0 overflow-hidden ${index % 2 === 0 ? 'md:order-1' : 'md:order-2'} bg-ink/5 p-4 md:p-8`}>
          <div className="w-full h-full border border-ink/10 relative overflow-hidden">
            <img 
              src={project.coverImage} 
              alt={project.title[lang]}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Technical Overlay */}
            <div className="absolute inset-0 pointer-events-none border-[10px] md:border-[20px] border-bg/10" />
            <div className="absolute top-4 left-4 font-mono text-[8px] uppercase tracking-widest text-bg bg-ink px-2 py-1">
              {lang === 'cn' ? '魔法档案' : 'MAGIC ARCHIVE'} No. {project.id}
            </div>
          </div>
        </div>
        
        <div className={`w-full md:w-1/2 p-8 md:p-24 flex flex-col justify-center ${index % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="flex items-center gap-4 mb-8 md:mb-12">
              <span className="stamp">{lang === 'cn' ? '魔法卷宗' : 'MAGIC FILE'}</span>
              <span className="font-mono text-[10px] uppercase tracking-widest opacity-30">
                Ref: {project.id}
              </span>
            </div>
            
            <h2 className="text-4xl md:text-8xl font-serif mb-8 md:mb-12 leading-none tracking-tighter">
              {project.title[lang].split(' ')[0]} <br /> 
              <span className="italic font-light text-accent">{project.title[lang].split(' ').slice(1).join(' ')}</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 md:mb-12 border-y border-ink/10 py-8">
              <div className="md:col-span-3">
                <span className="font-mono text-[8px] uppercase tracking-widest text-accent mb-4 block">{lang === 'cn' ? '核心摘要' : 'CORE SUMMARY'}</span>
                <p className="text-lg md:text-xl opacity-80 font-light leading-relaxed">
                  {project.longDescription[lang]}
                </p>
              </div>
              <div>
                <span className="font-mono text-[8px] uppercase tracking-widest text-accent mb-4 block">{lang === 'cn' ? '魔法分类' : 'MAGIC CLASS'}</span>
                <p className="font-mono text-[10px] uppercase tracking-tighter">
                  {project.category === 'app' ? T[lang].apps : T[lang].games}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 md:gap-6 mb-12 md:mb-16">
              {project.tags.map(tag => (
                <div key={tag} className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-accent rounded-full" />
                  <span className="text-[10px] font-mono uppercase tracking-widest opacity-60">
                    {tag}
                  </span>
                </div>
              ))}
            </div>
            
            <button className="group w-full md:w-auto flex items-center justify-center md:justify-start gap-6 text-ink font-mono text-[10px] uppercase tracking-[0.3em] border-2 border-ink px-10 py-5 bg-bg shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:bg-accent hover:text-bg hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all duration-75">
              {T[lang].launch} <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </button>
          </motion.div>
        </div>
      </div>
    ))}
  </section>
);

const Footer = ({ lang }: { lang: Language }) => (
  <footer id="contact" className="py-32 bg-bg border-t border-ink/10 relative overflow-hidden">
    {/* Red Decorative Circle */}
    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-accent/30" />

    <div className="max-w-7xl mx-auto px-8 text-center relative z-10">
      <div className="mb-8 inline-block">
        <span className="stamp border-accent text-accent rotate-0">Seal of Authenticity</span>
      </div>
      <h2 className="text-7xl md:text-9xl font-serif italic mb-12">{T[lang].letsBuild}</h2>
      
      <div className="flex justify-center gap-12 mb-20">
        <a href="#" className="p-4 rounded-none border-2 border-ink shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:bg-accent hover:text-bg hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all duration-75">
          <Github className="w-6 h-6" />
        </a>
        <a href="#" className="p-4 rounded-none border-2 border-ink shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:bg-accent hover:text-bg hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all duration-75">
          <Twitter className="w-6 h-6" />
        </a>
        <a href="#" className="p-4 rounded-none border-2 border-ink shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:bg-accent hover:text-bg hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all duration-75">
          <Mail className="w-6 h-6" />
        </a>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 font-mono text-[10px] uppercase tracking-[0.3em] opacity-30">
        <p>{T[lang].rights}</p>
        <p>{T[lang].designedWith}</p>
      </div>
    </div>
  </footer>
);

export default function App() {
  const [lang, setLang] = useState<Language>('cn');
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <div ref={containerRef} className="relative bg-bg">
      <div className="noise" />
      <Navbar lang={lang} setLang={setLang} />
      
      <Hero scrollYProgress={scrollYProgress} lang={lang} />
      
      <ScrollingMarquee text={T[lang].scrollingText} />

      <About lang={lang} />
      
      <Catalog lang={lang} />
      
      <div className="w-full py-6 bg-ink/95 backdrop-blur-sm overflow-hidden border-y border-ink/5 flex items-center relative z-20">
        <motion.div 
          animate={{ x: [-1000, 0] }}
          transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
          className="flex whitespace-nowrap gap-32"
        >
          {[...Array(10)].map((_, i) => (
            <motion.span 
              key={i} 
              animate={{ y: [5, 0, 5] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: i * 0.7 }}
              className="text-bg font-serif italic text-lg md:text-xl tracking-[0.2em] uppercase opacity-40"
            >
              {T[lang].scrollingText} <span className="mx-4 opacity-20 text-xs">/</span>
            </motion.span>
          ))}
        </motion.div>
      </div>
      
      <ProjectDetails lang={lang} />
      
      <Footer lang={lang} />
      
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-5">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(var(--color-ink) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink) 1px, transparent 1px)', backgroundSize: '100px 100px' }} />
      </div>
    </div>
  );
}
