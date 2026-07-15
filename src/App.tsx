import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, useMotionTemplate, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  ExternalLink, 
  Gamepad2, 
  AppWindow, 
  ArrowRight, 
  ArrowLeft,
  Github, 
  Twitter, 
  Mail,
  Languages,
  Images
} from 'lucide-react';
import { loadConfig, SiteConfig, ProjectItem, ToolItem, TarotCard } from './config/siteConfig';

// --- Types ---
type Language = 'cn' | 'en';

// 小红书 SVG 图标
const XiaohongshuIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.57.05-1-.38-1.56-.74-.87-.57-1.36-.92-2.2-1.48-.97-.64-.34-1 .21-1.57.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.05-.2-.07-.05-.16-.03-.23-.02-.1.02-1.62 1.03-4.58 3.03-.43.3-.83.44-1.18.43-.39-.01-1.14-.22-1.7-.4-.68-.22-1.23-.34-1.18-.72.02-.2.3-.4.83-.61 3.24-1.41 5.4-2.34 6.49-2.8 3.09-1.29 3.73-1.51 4.15-1.52.09 0 .3.02.43.12.11.09.14.2.16.34-.01.06.01.24 0 .37z"/>
  </svg>
);

// --- Build translations from config ---
function buildTranslations(config: SiteConfig) {
  const p = config.profile;
  const c = config.contact;
  return {
    cn: {
      about: '关于',
      works: '作品',
      contact: '联系',
      heroSub: p.heroSub.cn,
      heroTitle: p.heroTitle.cn,
      heroDesc: p.heroDesc.cn,
      scrollingText: p.scrollingText.cn,
      aboutTitle: p.aboutTitle.cn,
      aboutDesc1: p.aboutDesc1.cn,
      aboutDesc2: p.aboutDesc2.cn,
      philosophy: p.philosophy.cn,
      philosophyVal: p.philosophyVal.cn,
      location: p.location.cn,
      locationVal: p.locationVal.cn,
      selectedWorks: '精选作品',
      archive: '魔法档案',
      all: '全部',
      apps: '交互书',
      games: '解谜游戏',
      viewDetails: '查看详情',
      launch: '启动项目',
      letsBuild: c.letsBuild.cn,
      rights: c.rights.cn,
      designedWith: c.designedWith.cn,
    },
    en: {
      about: 'About',
      works: 'Works',
      contact: 'Contact',
      heroSub: p.heroSub.en,
      heroTitle: p.heroTitle.en,
      heroDesc: p.heroDesc.en,
      scrollingText: p.scrollingText.en,
      aboutTitle: p.aboutTitle.en,
      aboutDesc1: p.aboutDesc1.en,
      aboutDesc2: p.aboutDesc2.en,
      philosophy: p.philosophy.en,
      philosophyVal: p.philosophyVal.en,
      location: p.location.en,
      locationVal: p.locationVal.en,
      selectedWorks: 'Selected Works',
      archive: 'Magic Archive.',
      all: 'All',
      apps: 'Interactive Books',
      games: 'Puzzle Games',
      viewDetails: 'View Details',
      launch: 'Launch Project',
      letsBuild: c.letsBuild.en,
      rights: c.rights.en,
      designedWith: c.designedWith.en,
    },
  };
}

// --- Video Cover Component ---
const VideoCover = ({ src, playMode, className, poster }: { 
  src: string; 
  playMode: 'delay5s' | 'hover'; 
  className?: string;
  poster?: string;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (playMode !== 'delay5s') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timerRef.current = setTimeout(() => {
            videoRef.current?.play().catch(() => {});
            setIsPlaying(true);
          }, 5000);
        } else {
          clearTimeout(timerRef.current);
          if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
          }
          setIsPlaying(false);
        }
      },
      { threshold: 0.5 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => { observer.disconnect(); clearTimeout(timerRef.current); };
  }, [playMode]);

  const handleMouseEnter = useCallback(() => {
    if (playMode !== 'hover') return;
    videoRef.current?.play().catch(() => {});
    setIsPlaying(true);
  }, [playMode]);

  const handleMouseLeave = useCallback(() => {
    if (playMode !== 'hover') return;
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  }, [playMode]);

  return (
    <div 
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className || ''}`}
    >
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        playsInline
        preload="metadata"
        className="w-full h-full object-cover"
      />
      {!isPlaying && playMode === 'hover' && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink/10 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-bg/80 backdrop-blur-sm flex items-center justify-center border border-ink/10">
            <svg className="w-5 h-5 text-ink ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      )}
    </div>
  );
};

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

// --- Tarot Card Component ---
const TarotCardBack = () => (
  <div className="absolute inset-0 bg-gradient-to-br from-[#1a1410] via-[#2a1f18] to-[#1a1410] flex items-center justify-center overflow-hidden">
    {/* 外边框 */}
    <div className="absolute inset-2 border border-[#c4953a]/30 rounded-sm" />
    <div className="absolute inset-3.5 border border-[#c4953a]/15 rounded-sm" />
    
    {/* 四角装饰 */}
    <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#c4953a]/50" />
    <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#c4953a]/50" />
    <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#c4953a]/50" />
    <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#c4953a]/50" />

    {/* 中心图案 */}
    <div className="relative w-3/5 aspect-square flex items-center justify-center">
      {/* 旋转外圈 */}
      <svg viewBox="0 0 200 200" className="absolute w-full h-full animate-[spin_40s_linear_infinite] opacity-20">
        <circle cx="100" cy="100" r="90" fill="none" stroke="#c4953a" strokeWidth="0.5" strokeDasharray="6 4" />
        <circle cx="100" cy="100" r="80" fill="none" stroke="#c4953a" strokeWidth="0.3" />
        {[...Array(12)].map((_, i) => (
          <line key={i} x1="100" y1="15" x2="100" y2="25" stroke="#c4953a" strokeWidth="0.5" transform={`rotate(${i * 30} 100 100)`} />
        ))}
      </svg>
      
      {/* 内圈五芒星 */}
      <svg viewBox="0 0 100 100" className="absolute w-2/3 h-2/3 opacity-25">
        <polygon points="50,5 61,38 97,38 68,60 79,93 50,72 21,93 32,60 3,38 39,38" fill="none" stroke="#c4953a" strokeWidth="0.8" />
        <circle cx="50" cy="50" r="35" fill="none" stroke="#c4953a" strokeWidth="0.4" />
      </svg>

      {/* 中心眼睛 */}
      <svg viewBox="0 0 80 40" className="relative w-1/3 opacity-40">
        <path d="M 5 20 Q 40 -5 75 20 Q 40 45 5 20 Z" fill="none" stroke="#c4953a" strokeWidth="1" />
        <circle cx="40" cy="20" r="8" fill="none" stroke="#c4953a" strokeWidth="0.8" />
        <circle cx="40" cy="20" r="3" fill="#c4953a" opacity="0.6" />
      </svg>
    </div>

    {/* 底纹 - 交叉菱形 */}
    <div className="absolute inset-5 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L40 20L20 40L0 20Z' fill='none' stroke='%23c4953a' stroke-width='0.5'/%3E%3C/svg%3E")`, backgroundSize: '20px 20px' }} />
    
    {/* 文字标记 */}
    <span className="absolute bottom-6 left-0 w-full text-center font-serif text-[9px] italic tracking-[0.5em] uppercase text-[#c4953a]/25">
      Arcana
    </span>
    <span className="absolute top-6 left-0 w-full text-center font-serif text-[9px] italic tracking-[0.5em] uppercase text-[#c4953a]/25 rotate-180">
      Arcana
    </span>
  </div>
);

const TarotCardFront = ({ card, lang }: { card: TarotCard; lang: Language }) => (
  <div className="absolute inset-0 bg-gradient-to-br from-[#f8f3ea] via-[#f4f1ea] to-[#ede6d6] overflow-hidden flex flex-col">
    {/* 顶部装饰条 */}
    <div className="relative px-4 pt-4 pb-2 flex items-center justify-between z-10">
      <div className="flex items-center gap-2">
        <div className="w-4 h-[1px] bg-accent/40" />
        <span className="font-mono text-[7px] uppercase tracking-[0.4em] text-accent/60">{card.romanNumeral}</span>
      </div>
      <div className="flex gap-1">
        <div className="w-1 h-1 rotate-45 bg-accent/30" />
        <div className="w-1 h-1 rotate-45 border border-accent/30" />
        <div className="w-1 h-1 rotate-45 bg-accent/30" />
      </div>
    </div>

    {/* 外边框 */}
    <div className="absolute inset-2 border border-accent/20 rounded-sm pointer-events-none z-10" />
    
    {/* 角标 */}
    <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-accent/40 z-10" />
    <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-accent/40 z-10" />
    <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-accent/40 z-10" />
    <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-accent/40 z-10" />

    {/* 图片区域 */}
    <div className="flex-1 mx-4 mb-2 relative overflow-hidden">
      <div className="absolute inset-0 border border-ink/10" />
      <img 
        src={card.coverImage} 
        alt={card.title[lang]} 
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
      {/* 渐变 */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#f4f1ea]/80 via-transparent to-[#f4f1ea]/20 pointer-events-none" />
      {/* 扫描线 */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(26,26,26,0.2) 2px, rgba(26,26,26,0.2) 3px)', backgroundSize: '100% 4px' }} />
    </div>

    {/* 底部信息 */}
    <div className="px-4 pb-4 pt-1 text-center relative z-10">
      <div className="w-8 h-[1px] bg-accent/30 mx-auto mb-2" />
      <h3 className="font-serif text-base md:text-lg leading-tight text-ink/90 mb-1 tracking-wide">
        {card.title[lang]}
      </h3>
      <p className="font-mono text-[7px] uppercase tracking-[0.3em] text-ink/35 leading-relaxed">
        {card.subtitle[lang]}
      </p>
      <div className="mt-2 flex items-center justify-center gap-2">
        <div className="w-3 h-[1px] bg-accent/20" />
        <div className="w-1 h-1 rotate-45 bg-accent/30" />
        <div className="w-3 h-[1px] bg-accent/20" />
      </div>
    </div>
  </div>
);

const TarotFlipCard = ({ card, lang, index, onProjectClick }: { key?: React.Key; card: TarotCard; lang: Language; index: number; onProjectClick: (id: string) => void }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateY: 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.15 }}
      className="flex flex-col items-center gap-4"
    >
      <div
        className="relative cursor-pointer group"
        style={{ perspective: '1200px', width: 'clamp(200px, 22vw, 280px)', aspectRatio: '3/4' }}
        onClick={() => {
          if (isFlipped && card.projectId) {
            onProjectClick(card.projectId);
          } else {
            setIsFlipped(!isFlipped);
          }
        }}
      >
        {/* 卡片底部阴影 */}
        <div className={`absolute inset-0 bg-ink/10 blur-xl transition-all duration-700 ${isFlipped ? 'translate-y-4 scale-95 opacity-60' : 'translate-y-2 scale-100 opacity-30'}`} />
        
        {/* 悬浮光晕 */}
        <div className={`absolute -inset-4 bg-accent/5 blur-2xl transition-opacity duration-700 ${isFlipped ? 'opacity-60' : 'opacity-0 group-hover:opacity-40'}`} />

        {/* 翻转容器 */}
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="relative w-full h-full"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* 背面（初始可见） */}
          <div 
            className="absolute inset-0 rounded-sm overflow-hidden shadow-lg border border-[#c4953a]/20"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <TarotCardBack />
          </div>

          {/* 正面（翻转后可见） */}
          <div 
            className="absolute inset-0 rounded-sm overflow-hidden shadow-lg border border-accent/20"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <TarotCardFront card={card} lang={lang} />
          </div>
        </motion.div>

        {/* 悬浮提示 */}
        <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 transition-all duration-500 ${isFlipped ? 'opacity-0 translate-y-0' : 'opacity-0 group-hover:opacity-60 group-hover:-translate-y-1'}`}>
          <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-accent whitespace-nowrap">
            {lang === 'cn' ? '点击揭示' : 'Click to Reveal'}
          </span>
        </div>
      </div>

      {/* 卡片下方编号 */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.15 + 0.5 }}
        className="text-center"
      >
        <span className="font-serif text-sm italic text-ink/20 tracking-wider">{card.romanNumeral}</span>
      </motion.div>
    </motion.div>
  );
};

const TarotSection = ({ lang, config, onProjectClick }: { lang: Language; config: SiteConfig; onProjectClick: (id: string) => void }) => {
  const cards = config.tarotCards || [];
  if (cards.length === 0) return null;

  return (
    <section className="relative w-full py-24 md:py-32 bg-bg overflow-hidden border-b border-ink/10">
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, var(--color-accent) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      
      {/* 顶部装饰 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="w-[1px] h-16 bg-gradient-to-b from-transparent to-accent/20" />
        <div className="w-2 h-2 rotate-45 border border-accent/30 -mt-[1px]" />
      </div>

      {/* 左右装饰线 */}
      <div className="absolute top-1/2 left-8 -translate-y-1/2 hidden lg:flex flex-col items-center gap-3 opacity-15">
        <div className="w-[1px] h-20 bg-accent/40" />
        <svg viewBox="0 0 20 20" className="w-4 h-4 text-accent/40"><circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="0.5" /><circle cx="10" cy="10" r="2" fill="currentColor" /></svg>
        <div className="w-[1px] h-20 bg-ink/20" />
      </div>
      <div className="absolute top-1/2 right-8 -translate-y-1/2 hidden lg:flex flex-col items-center gap-3 opacity-15">
        <div className="w-[1px] h-20 bg-ink/20" />
        <svg viewBox="0 0 20 20" className="w-4 h-4 text-accent/40"><circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="0.5" /><circle cx="10" cy="10" r="2" fill="currentColor" /></svg>
        <div className="w-[1px] h-20 bg-accent/40" />
      </div>

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        {/* 标题 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 md:mb-20"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-[1px] bg-accent/30" />
            <div className="w-2 h-2 rotate-45 border border-accent/40" />
            <div className="w-12 h-[1px] bg-accent/30" />
          </div>
          <span className="font-mono text-[9px] uppercase tracking-[0.5em] text-accent/60 block mb-3">
            {lang === 'cn' ? '精选作品 · 命运之牌' : 'Featured Works · Cards of Fate'}
          </span>
          <h2 className="text-4xl md:text-6xl font-serif italic text-ink/90">
            {lang === 'cn' ? '翻开命运' : 'Reveal Your Fate'}
          </h2>
          <p className="font-mono text-[8px] uppercase tracking-[0.4em] text-ink/25 mt-4">
            {lang === 'cn' ? '点击卡牌揭示隐藏的作品' : 'Click the cards to reveal hidden works'}
          </p>
        </motion.div>

        {/* 卡片网格 */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 lg:gap-14">
          {cards.map((card, index) => (
            <TarotFlipCard 
              key={card.id} 
              card={card} 
              lang={lang} 
              index={index}
              onProjectClick={onProjectClick}
            />
          ))}
        </div>

        {/* 底部装饰 */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-16 md:mt-20 flex items-center justify-center gap-3"
        >
          <div className="w-16 h-[1px] bg-ink/8" />
          <span className="font-mono text-[7px] uppercase tracking-[0.5em] text-ink/15">
            {lang === 'cn' ? `${cards.length} 张命运之牌` : `${cards.length} Cards of Destiny`}
          </span>
          <div className="w-16 h-[1px] bg-ink/8" />
        </motion.div>
      </div>
    </section>
  );
};

const Navbar = ({ lang, setLang, config }: { lang: Language, setLang: (l: Language) => void, config: SiteConfig }) => {
  const T = buildTranslations(config);
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 w-full z-50 px-8 py-6 flex justify-between items-center bg-bg/80 backdrop-blur-sm border-b border-ink/10"
    >
      <div className="absolute top-0 left-0 w-full h-[2px] bg-accent opacity-60" />
      <div className="font-serif text-2xl font-bold tracking-tighter uppercase flex items-center gap-3">
        {config.site.logo ? (
          <img src={config.site.logo} alt="Logo" className="h-8 object-contain" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-8 h-8 bg-accent text-bg flex items-center justify-center rounded-sm text-sm shadow-sm font-mono">M</div>
        )}
        <span className="tracking-[-0.05em]">{T[lang].heroTitle[0]}</span> <span className="text-accent italic font-light">{T[lang].heroTitle[1]}</span>
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
};

const Hero = ({ scrollYProgress, lang, config }: { scrollYProgress: any, lang: Language, config: SiteConfig }) => {
  const T = buildTranslations(config);
  const blur = useTransform(scrollYProgress, [0, 0.2], [0, 20]);
  const filterBlur = useMotionTemplate`blur(${blur}px)`;
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);
  const p = config.profile;

  return (
    <section className="group/hero relative h-screen w-full flex items-center justify-center overflow-hidden border-b border-ink/10">
      <motion.div 
        style={{ filter: filterBlur, scale, opacity }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-bg/5 group-hover/hero:bg-transparent z-10 transition-colors duration-700" />
        {p.heroBackgroundType === 'video' ? (
          <video
            src={p.heroBackground}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-70 group-hover/hero:opacity-100 transition-opacity duration-700"
          />
        ) : (
          <img 
            src={p.heroBackground}
            alt="Hero Background"
            className="w-full h-full object-cover opacity-70 group-hover/hero:opacity-100 transition-opacity duration-700"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="absolute inset-0 z-10 opacity-10 group-hover/hero:opacity-0 transition-opacity duration-700" style={{ backgroundImage: 'radial-gradient(var(--color-ink) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </motion.div>

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
          <motion.h1 
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-5xl md:text-9xl font-serif italic font-extralight leading-none mb-8 tracking-tighter"
          >
            <span className="text-white">{T[lang].heroTitle[0]}</span> <br /> <span className="not-italic font-black text-accent">{T[lang].heroTitle[1]}</span>
          </motion.h1>
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

      <div className="absolute bottom-4 left-0 w-full flex justify-between px-8 items-center pointer-events-none">
        <span className="font-mono text-[8px] opacity-20 uppercase tracking-widest">{T[lang].heroTitle[0]} {T[lang].heroTitle[1]} // ARCHIVE v2.0</span>
        <span className="font-mono text-[8px] opacity-20 uppercase tracking-widest">WIND-ELEMENT-MAGE</span>
      </div>
    </section>
  );
};

const About = ({ lang, config }: { lang: Language, config: SiteConfig }) => {
  const T = buildTranslations(config);
  const tools = config.profile.tools || [];
  return (
    <section id="about" className="min-h-screen w-full flex items-center justify-center bg-bg relative py-32 border-b border-ink/10">
      <div className="absolute top-0 left-1/4 w-[1px] h-full bg-ink/5 hidden md:block" />
      <div className="absolute top-0 right-1/4 w-[1px] h-full bg-ink/5 hidden md:block" />

      <div className="max-w-6xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-20 items-center relative z-10">
        <div className="relative group">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* 主图容器 - 不规则裁切 + 多层边框 */}
            <div className="relative aspect-[3/4] overflow-hidden">
              {/* 外层装饰框 - 偏移 */}
              <div className="absolute -top-3 -left-3 w-full h-full border-2 border-accent/30 z-0" />
              <div className="absolute -bottom-3 -right-3 w-full h-full border border-ink/10 z-0" />
              
              {/* 主图片 */}
              <div className="relative w-full h-full z-10 bg-ink/5 overflow-hidden">
                <img 
                  src={config.profile.photo}
                  alt="Portrait"
                  className="w-full h-full object-cover transition-all duration-1000 ease-out group-hover:scale-110 group-hover:brightness-110"
                  referrerPolicy="no-referrer"
                />
                {/* 渐变叠加 */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-accent/10 opacity-60 group-hover:opacity-30 transition-opacity duration-700" />
                {/* 网格纹理 */}
                <div className="absolute inset-0 opacity-10 group-hover:opacity-0 transition-opacity duration-700 pointer-events-none" style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(155,48,33,0.05) 25%, rgba(155,48,33,0.05) 26%, transparent 27%, transparent 74%, rgba(155,48,33,0.05) 75%, rgba(155,48,33,0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(155,48,33,0.05) 25%, rgba(155,48,33,0.05) 26%, transparent 27%, transparent 74%, rgba(155,48,33,0.05) 75%, rgba(155,48,33,0.05) 76%, transparent 77%, transparent)', backgroundSize: '50px 50px' }} />
                {/* 色彩叠加层 */}
                <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-overlay" />
              </div>

              {/* 角标装饰 */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-accent z-20" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-accent z-20" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-ink/20 z-20" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-ink/20 z-20" />
            </div>

            {/* 底部信息条 */}
            <div className="relative z-20 mt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-accent animate-pulse" />
                <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-ink/40">
                  {lang === 'cn' ? '风系魔法师 · 鉴定照' : 'WIND MAGE · ID PHOTO'}
                </span>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-1 h-3 bg-accent/20" style={{ height: `${8 + Math.random() * 12}px` }} />
                ))}
              </div>
            </div>

            {/* 浮动装饰元素 */}
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute -top-8 -right-8 w-16 h-16 opacity-20 z-30 hidden md:block"
            >
              <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" className="w-full h-full text-accent">
                <circle cx="32" cy="32" r="28" strokeWidth="0.5" strokeDasharray="4 4" />
                <circle cx="32" cy="32" r="20" strokeWidth="0.5" />
                <line x1="32" y1="4" x2="32" y2="60" strokeWidth="0.3" />
                <line x1="4" y1="32" x2="60" y2="32" strokeWidth="0.3" />
              </svg>
            </motion.div>

            {/* 验证印章 */}
            <div className="absolute -bottom-4 -right-4 stamp bg-bg z-30">Verified Identity</div>
          </motion.div>
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

          {tools.length > 0 && (
            <div className="mt-8 border-t border-ink/10 pt-8">
              <span className="font-mono text-[10px] uppercase tracking-widest text-accent block mb-4">
                {lang === 'cn' ? '常用工具' : 'Toolkit'}
              </span>
              <div className="flex flex-wrap gap-3">
                {tools.map((tool, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ y: -4, scale: 1.05 }}
                    className="group/tool flex items-center gap-2 px-3 py-2 border border-ink/10 bg-bg hover:border-accent hover:bg-accent/5 transition-all cursor-default"
                  >
                    <span className="text-[10px] font-mono uppercase tracking-wider opacity-70 group-hover/tool:opacity-100 transition-opacity">
                      {tool.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

const CatalogCardCover = ({ project, lang }: { project: ProjectItem; lang: Language }) => {
  if (project.coverType === 'video') {
    return (
      <VideoCover
        src={project.coverImage}
        playMode={project.videoPlayMode || 'delay5s'}
        className="w-full h-full"
      />
    );
  }

  return (
    <img
      src={project.coverImage}
      alt={project.title[lang]}
      className="w-full h-full object-cover"
      referrerPolicy="no-referrer"
    />
  );
};

const Catalog = ({ lang, config, onProjectClick }: { lang: Language, config: SiteConfig, onProjectClick: (id: string) => void }) => {
  const [filter, setFilter] = useState<'all' | 'interactive-book' | 'puzzle-game'>('all');
  const T = buildTranslations(config);
  const projects = config.projects;
  const filteredProjects = filter === 'all' 
    ? projects.slice(0, 4) 
    : projects.filter(p => p.category === filter);

  return (
    <section id="catalog" className="min-h-screen w-full py-32 bg-bg border-t border-ink/10 relative">
      {/* 侧边垂直文字 */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[8px] uppercase tracking-[0.5em] vertical-text opacity-10 hidden lg:block">
        {T[lang].heroTitle[0]} {T[lang].heroTitle[1]} // ARCHIVE 02
      </div>
      {/* 右侧垂直装饰线 */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-4 opacity-10">
        <div className="w-[1px] h-24 bg-accent" />
        <div className="w-2 h-2 rotate-45 border border-accent" />
        <div className="w-[1px] h-24 bg-ink" />
      </div>

      <div className="max-w-7xl mx-auto px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8 border-b border-ink/10 pb-12 relative">
          {/* 装饰角标 */}
          <div className="absolute -top-[1px] left-0 w-16 h-[2px] bg-accent" />
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-accent/60" />
              <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-accent">{T[lang].selectedWorks}</span>
              <div className="w-12 h-[1px] bg-accent/30" />
            </div>
            <h2 className="text-6xl md:text-8xl font-serif italic">{T[lang].archive}</h2>
          </div>
          
          <div className="flex gap-4 p-1">
            {(['all', 'interactive-book', 'puzzle-game'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-none text-[10px] font-mono uppercase tracking-widest transition-all border-2 border-ink shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                  filter === f ? 'bg-ink text-bg' : 'bg-bg hover:bg-accent hover:text-bg'
                }`}
              >
                {f === 'all' ? T[lang].all : f === 'interactive-book' ? T[lang].apps : T[lang].games}
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
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.7, delay: index * 0.12 }}
                viewport={{ once: true }}
                className="group cursor-pointer relative"
                onClick={() => onProjectClick(project.id)}
              >
                {/* 大号序号水印 */}
                <span className="absolute -top-10 -left-6 font-serif text-[80px] md:text-[100px] opacity-[0.03] italic text-ink select-none leading-none pointer-events-none">
                  {String(index + 1).padStart(2, '0')}
                </span>

                {/* 封面容器 - 多层嵌套 */}
                <div className="relative mb-8">
                  {/* 偏移装饰框 */}
                  <div className="absolute -top-2 -left-2 w-full h-full border border-accent/20 z-0 transition-all duration-500 group-hover:-top-3 group-hover:-left-3" />
                  <div className="absolute -bottom-2 -right-2 w-full h-full border border-ink/8 z-0 transition-all duration-500 group-hover:-bottom-3 group-hover:-right-3" />
                  
                  <div className="relative aspect-[16/10] bg-ink/5 overflow-hidden z-10">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 1.2, ease: [0.33, 1, 0.68, 1] }}
                      className="w-full h-full"
                    >
                      <CatalogCardCover project={project} lang={lang} />
                    </motion.div>

                    {/* 底部渐变 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-ink/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none" />
                    
                    {/* 网格纹理覆盖 */}
                    <div className="absolute inset-0 opacity-[0.04] group-hover:opacity-0 transition-opacity duration-700 pointer-events-none" 
                      style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(26,26,26,0.1) 2px, rgba(26,26,26,0.1) 3px), repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(26,26,26,0.1) 2px, rgba(26,26,26,0.1) 3px)', backgroundSize: '20px 20px' }} 
                    />

                    {/* 角标 */}
                    <div className="absolute top-0 left-0 w-10 h-10 z-20">
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-accent" />
                      <div className="absolute top-0 left-0 h-full w-[2px] bg-accent" />
                    </div>
                    <div className="absolute bottom-0 right-0 w-10 h-10 z-20">
                      <div className="absolute bottom-0 right-0 w-full h-[2px] bg-accent" />
                      <div className="absolute bottom-0 right-0 h-full w-[2px] bg-accent" />
                    </div>
                    <div className="absolute top-0 right-0 w-5 h-5 border-t border-r border-ink/15 z-20" />
                    <div className="absolute bottom-0 left-0 w-5 h-5 border-b border-l border-ink/15 z-20" />

                    {/* 类别图标 */}
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-bg/70 backdrop-blur-sm px-2 py-1 border border-ink/10 opacity-60 group-hover:opacity-100 transition-opacity">
                      {project.category === 'puzzle-game' ? <Gamepad2 className="w-3 h-3 text-accent" /> : <AppWindow className="w-3 h-3 text-accent" />}
                      <span className="font-mono text-[7px] uppercase tracking-widest text-ink/60">
                        {project.category === 'puzzle-game' ? (lang === 'cn' ? '解谜游戏' : 'PUZZLE') : (lang === 'cn' ? '交互书' : 'INTERACTIVE')}
                      </span>
                    </div>

                    {/* 多图数量指示 */}
                    {(project.gallery || []).length > 0 && project.coverType !== 'video' && (
                      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-bg/70 backdrop-blur-sm px-2 py-1 border border-ink/10 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Images className="w-3 h-3 text-accent" />
                        <span className="font-mono text-[7px] uppercase tracking-widest text-ink/60">
                          {(project.gallery || []).length + 1}
                        </span>
                      </div>
                    )}

                    {/* 底部浮层信息 */}
                    <div className="absolute bottom-0 left-0 w-full px-5 py-4 z-20 flex items-end justify-between opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-accent animate-pulse" />
                        <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-bg/80">
                          {lang === 'cn' ? '点击查看详情' : 'Click to explore'}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-bg/80" />
                    </div>

                    {/* Hover 色调叠加 */}
                    <div className="absolute inset-0 bg-accent/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-multiply" />
                  </div>
                </div>

                {/* 信息区 */}
                <div className="relative">
                  {/* 分割线装饰 */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-[1px] flex-1 bg-ink/10" />
                    <span className="font-mono text-[7px] uppercase tracking-[0.4em] text-accent/60">No. {String(index + 1).padStart(2, '0')}</span>
                    <div className="h-[1px] w-8 bg-accent/30" />
                  </div>

                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-accent/70 mb-2 block flex items-center gap-2">
                        <span className="w-3 h-[1px] bg-accent/40 inline-block" />
                        Ref: {project.id}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-serif mb-2 group-hover:text-accent transition-colors duration-300 leading-tight">{project.title[lang]}</h3>
                      <p className="opacity-50 text-sm font-light max-w-sm leading-relaxed group-hover:opacity-70 transition-opacity">{project.description[lang]}</p>
                    </div>
                    <motion.div 
                      className="mt-2 flex-shrink-0 w-10 h-10 border border-ink/10 flex items-center justify-center group-hover:border-accent group-hover:bg-accent/5 transition-all"
                      whileHover={{ rotate: -45 }}
                    >
                      <ArrowRight className="w-4 h-4 text-ink/30 group-hover:text-accent transition-colors" />
                    </motion.div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {project.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="font-mono text-[8px] uppercase tracking-wider text-ink/30 border border-ink/8 px-2 py-0.5 group-hover:text-ink/50 group-hover:border-ink/15 transition-all">
                        {tag}
                      </span>
                    ))}
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

const ProjectDetailPage = ({ project, lang, config, onBack }: { key?: React.Key; project: ProjectItem, lang: Language, config: SiteConfig, onBack: () => void }) => {
  const T = buildTranslations(config);
  const gallery = project.gallery || [];
  const gameplay = project.gameplay || { cn: '', en: '' };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-bg"
    >
      {/* 顶部导航 */}
      <div className="fixed top-0 left-0 w-full z-50 px-8 py-6 flex justify-between items-center bg-bg/80 backdrop-blur-sm border-b border-ink/10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] hover:text-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {lang === 'cn' ? '返回作品集' : 'Back to Portfolio'}
        </button>
        <span className="font-mono text-[8px] uppercase tracking-widest opacity-30">
          {lang === 'cn' ? '魔法档案' : 'MAGIC ARCHIVE'} No. {project.id}
        </span>
      </div>

      <div className="pt-24">
        {/* Hero 封面 */}
        <div className="relative w-full aspect-[21/9] overflow-hidden border-b border-ink/10">
          {project.coverType === 'video' ? (
            <video
              src={project.coverImage}
              autoPlay loop muted playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={project.coverImage}
              alt={project.title[lang]}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 w-full px-8 md:px-16 pb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <span className="stamp">{lang === 'cn' ? '魔法卷宗' : 'MAGIC FILE'}</span>
                <span className="font-mono text-[10px] uppercase tracking-widest opacity-40">Ref: {project.id}</span>
                {project.category === 'puzzle-game' ? <Gamepad2 className="w-4 h-4 text-accent" /> : <AppWindow className="w-4 h-4 text-accent" />}
              </div>
              <h1 className="text-5xl md:text-8xl font-serif leading-none tracking-tighter">
                {project.title[lang].split(' ')[0]} <br />
                <span className="italic font-light text-accent">{project.title[lang].split(' ').slice(1).join(' ') || ''}</span>
              </h1>
            </motion.div>
          </div>
        </div>

        {/* 内容区 */}
        <div className="max-w-6xl mx-auto px-8 md:px-16 py-16 md:py-24">
          {/* 核心摘要 + Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 border-b border-ink/10 pb-16"
          >
            <div className="md:col-span-3">
              <span className="font-mono text-[8px] uppercase tracking-widest text-accent mb-4 block">{lang === 'cn' ? '核心摘要' : 'CORE SUMMARY'}</span>
              <p className="text-xl md:text-2xl opacity-80 font-light leading-relaxed">
                {project.longDescription[lang]}
              </p>
            </div>
            <div>
              <span className="font-mono text-[8px] uppercase tracking-widest text-accent mb-4 block">{lang === 'cn' ? '魔法分类' : 'MAGIC CLASS'}</span>
              <p className="font-mono text-[10px] uppercase tracking-tighter mb-6">
                {project.category === 'interactive-book' ? T[lang].apps : T[lang].games}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map(tag => (
                  <div key={tag} className="flex items-center gap-1.5 px-2 py-1 border border-ink/10">
                    <div className="w-1 h-1 bg-accent rounded-full" />
                    <span className="text-[10px] font-mono uppercase tracking-widest opacity-60">{tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 玩法/功能概述 */}
          {gameplay[lang] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-16 border-b border-ink/10 pb-16"
            >
              <span className="font-mono text-[8px] uppercase tracking-widest text-accent mb-6 block">
                {lang === 'cn' ? '玩法概述' : 'GAMEPLAY OVERVIEW'}
              </span>
              <div className="text-lg opacity-80 font-light leading-relaxed border-l-2 border-accent pl-8 whitespace-pre-line">
                {gameplay[lang]}
              </div>
            </motion.div>
          )}

          {/* 演示视频 */}
          {project.demoVideo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="mb-16 border-b border-ink/10 pb-16"
            >
              <span className="font-mono text-[8px] uppercase tracking-widest text-accent mb-8 block">
                {lang === 'cn' ? '演示视频' : 'DEMO VIDEO'}
              </span>
              <div className="border border-ink/10 p-2 bg-ink/5">
                <video
                  src={project.demoVideo}
                  controls
                  playsInline
                  className="w-full aspect-video object-contain bg-black"
                />
              </div>
            </motion.div>
          )}

          {/* 图片画廊 */}
          {gallery.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-16"
            >
              <span className="font-mono text-[8px] uppercase tracking-widest text-accent mb-8 block">
                {lang === 'cn' ? '项目图鉴' : 'PROJECT GALLERY'}
              </span>
              
              <div className="space-y-4">
                {(() => {
                  const total = gallery.length;

                  if (total === 1) {
                    return (
                      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="border border-ink/10 p-2 bg-ink/5">
                        <img src={gallery[0]} alt="" className="w-full" referrerPolicy="no-referrer" />
                      </motion.div>
                    );
                  }

                  if (total === 2) {
                    return (
                      <>
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                          className="border border-ink/10 p-2 bg-ink/5">
                          <img src={gallery[0]} alt="" className="w-full" referrerPolicy="no-referrer" />
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                          className="group/img border border-ink/10 p-2 bg-ink/5 overflow-hidden">
                          <img src={gallery[1]} alt="" className="w-full aspect-video object-cover group-hover/img:object-contain group-hover/img:bg-black/5 transition-all duration-500" referrerPolicy="no-referrer" />
                        </motion.div>
                      </>
                    );
                  }

                  // 3+ 张：第一张原始尺寸，后续分组排列，hover 显示完整图片
                  const groups: { type: 'full' | 'duo' | 'trio' | 'duo-offset'; imgs: string[] }[] = [];
                  let cursor = 1;
                  const patterns: ('duo' | 'trio' | 'duo-offset' | 'full')[] = ['duo', 'trio', 'duo-offset', 'full'];
                  let patIdx = 0;
                  while (cursor < total) {
                    const pat = patterns[patIdx % patterns.length];
                    const take = pat === 'trio' ? 3 : pat === 'duo' || pat === 'duo-offset' ? 2 : 1;
                    const remaining = total - cursor;
                    if (remaining <= 0) break;
                    const actualTake = Math.min(take, remaining);
                    if (actualTake === 1 && pat !== 'full') {
                      groups.push({ type: 'full', imgs: gallery.slice(cursor, cursor + 1) });
                    } else if (actualTake === 2 && pat === 'trio') {
                      groups.push({ type: 'duo', imgs: gallery.slice(cursor, cursor + 2) });
                    } else {
                      groups.push({ type: pat, imgs: gallery.slice(cursor, cursor + actualTake) });
                    }
                    cursor += actualTake;
                    patIdx++;
                  }

                  const hoverClass = "object-cover group-hover/img:object-contain group-hover/img:bg-black/5 transition-all duration-500";

                  return (
                    <>
                      {/* 第一张：原始尺寸 */}
                      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="border border-ink/10 p-2 bg-ink/5">
                        <img src={gallery[0]} alt="" className="w-full" referrerPolicy="no-referrer" />
                      </motion.div>

                      {/* 后续分组 */}
                      {groups.map((group, gi) => {
                        if (group.type === 'full') {
                          return (
                            <motion.div key={`g${gi}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: gi * 0.06 }}
                              className="group/img border border-ink/10 p-2 bg-ink/5 overflow-hidden">
                              <img src={group.imgs[0]} alt="" className={`w-full aspect-video ${hoverClass}`} referrerPolicy="no-referrer" />
                            </motion.div>
                          );
                        }
                        if (group.type === 'duo') {
                          return (
                            <div key={`g${gi}`} className="grid grid-cols-2 gap-4">
                              {group.imgs.map((g, j) => (
                                <motion.div key={j} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: gi * 0.06 + j * 0.08 }}
                                  className="group/img border border-ink/10 p-2 bg-ink/5 overflow-hidden">
                                  <img src={g} alt="" className={`w-full aspect-video ${hoverClass}`} referrerPolicy="no-referrer" />
                                </motion.div>
                              ))}
                            </div>
                          );
                        }
                        if (group.type === 'duo-offset') {
                          return (
                            <div key={`g${gi}`} className="grid grid-cols-5 gap-4">
                              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: gi * 0.06 }}
                                className="col-span-3 group/img border border-ink/10 p-2 bg-ink/5 overflow-hidden">
                                <img src={group.imgs[0]} alt="" className={`w-full aspect-video ${hoverClass}`} referrerPolicy="no-referrer" />
                              </motion.div>
                              {group.imgs[1] && (
                                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: gi * 0.06 + 0.08 }}
                                  className="col-span-2 group/img border border-ink/10 p-2 bg-ink/5 overflow-hidden">
                                  <img src={group.imgs[1]} alt="" className={`w-full aspect-video ${hoverClass}`} referrerPolicy="no-referrer" />
                                </motion.div>
                              )}
                            </div>
                          );
                        }
                        if (group.type === 'trio') {
                          return (
                            <div key={`g${gi}`} className="grid grid-cols-3 gap-4">
                              {group.imgs.map((g, j) => (
                                <motion.div key={j} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: gi * 0.06 + j * 0.06 }}
                                  className="group/img border border-ink/10 p-1.5 bg-ink/5 overflow-hidden">
                                  <img src={g} alt="" className={`w-full aspect-video ${hoverClass}`} referrerPolicy="no-referrer" />
                                </motion.div>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      })}
                    </>
                  );
                })()}
              </div>
            </motion.div>
          )}

          {/* 启动按钮 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-4"
          >
            {project.launchUrl ? (
              <a
                href={project.launchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-6 text-ink font-mono text-[10px] uppercase tracking-[0.3em] border-2 border-ink px-10 py-5 bg-bg shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:bg-accent hover:text-bg hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all duration-75"
              >
                {T[lang].launch} <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </a>
            ) : (
              <span className="inline-flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.3em] border-2 border-ink/20 px-10 py-5 text-ink/40 cursor-default">
                <div className="w-1.5 h-1.5 bg-accent/60 animate-pulse rounded-full" />
                {lang === 'cn' ? '开发中' : 'In Development'}
              </span>
            )}
            <button
              onClick={onBack}
              className="inline-flex items-center gap-4 text-ink/60 font-mono text-[10px] uppercase tracking-[0.3em] border-2 border-ink/20 px-8 py-5 hover:border-ink/40 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {lang === 'cn' ? '返回' : 'Back'}
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const ProjectDetails = ({ lang, config }: { lang: Language, config: SiteConfig }) => {
  const T = buildTranslations(config);
  const projects = config.projects.filter(p => p.launchUrl);

  return (
    <section className="bg-bg relative">
      {/* 全局装饰 - 垂直辅助线 */}
      <div className="absolute top-0 left-[10%] w-[1px] h-full bg-ink/[0.03] hidden xl:block" />
      <div className="absolute top-0 right-[10%] w-[1px] h-full bg-ink/[0.03] hidden xl:block" />

      {/* 区域标题 */}
      <div className="max-w-7xl mx-auto px-8 pt-24 pb-16 text-center relative z-10">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-12 h-[1px] bg-accent/30" />
          <div className="w-2 h-2 rotate-45 border border-accent/40" />
          <div className="w-12 h-[1px] bg-accent/30" />
        </div>
        <h2 className="text-5xl md:text-7xl font-serif italic text-ink/90">
          {lang === 'cn' ? '开启魔法之旅' : 'Begin the Magic Journey'}
        </h2>
        <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-ink/30 mt-4">
          {lang === 'cn' ? '探索每一份魔法作品的细节' : 'Explore the details of each magical work'}
        </p>
      </div>

      {projects.map((project, index) => (
        <div key={project.id} className="min-h-screen w-full flex flex-col md:flex-row border-t border-ink/10 relative group/card overflow-hidden">
          
          {/* 区块间装饰分割线 */}
          {index > 0 && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-4 -translate-y-1/2 z-20">
              <div className="w-12 h-[1px] bg-accent/30" />
              <div className="w-2 h-2 rotate-45 border border-accent/40" />
              <div className="w-12 h-[1px] bg-accent/30" />
            </div>
          )}

          {/* 图片侧 */}
          <div className={`w-full md:w-1/2 aspect-video md:h-screen md:sticky md:top-0 overflow-hidden ${index % 2 === 0 ? 'md:order-1' : 'md:order-2'} relative`}>
            {/* 内边距容器 */}
            <div className="absolute inset-4 md:inset-8 z-10">
              <div className="w-full h-full relative overflow-hidden group/img">
                {/* 偏移装饰框 */}
                <div className="absolute -top-2 -left-2 w-[calc(100%+4px)] h-[calc(100%+4px)] border border-accent/15 z-0 transition-all duration-700 group-hover/card:-top-3 group-hover/card:-left-3" />

                {/* 主图容器 */}
                <div className="relative w-full h-full overflow-hidden bg-ink/5">
                  {project.coverType === 'video' ? (
                    <VideoCover
                      src={project.coverImage}
                      playMode={project.videoPlayMode || 'delay5s'}
                      className="w-full h-full"
                    />
                  ) : (
                    <img
                      src={project.coverImage}
                      alt={project.title[lang]}
                      className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover/card:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  )}

                  {/* 渐变遮罩 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-accent/5 opacity-50 group-hover/card:opacity-30 transition-opacity duration-700 pointer-events-none" />
                  
                  {/* 扫描线纹理 */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(26,26,26,0.15) 1px, rgba(26,26,26,0.15) 2px)', backgroundSize: '100% 4px' }} />

                  {/* 角标 */}
                  <div className="absolute top-0 left-0 w-12 h-12 z-20">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-accent" />
                    <div className="absolute top-0 left-0 h-full w-[2px] bg-accent" />
                    <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-accent/60" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-12 h-12 z-20">
                    <div className="absolute bottom-0 right-0 w-full h-[2px] bg-accent" />
                    <div className="absolute bottom-0 right-0 h-full w-[2px] bg-accent" />
                  </div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-ink/15 z-20" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-ink/15 z-20" />

                  {/* 档案编号标签 */}
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                    <div className="bg-ink/80 backdrop-blur-sm px-3 py-1.5 border border-ink/20">
                      <span className="font-mono text-[8px] uppercase tracking-widest text-bg/90">
                        {lang === 'cn' ? '魔法档案' : 'MAGIC ARCHIVE'}
                      </span>
                    </div>
                    <div className="bg-accent/90 px-2 py-1.5">
                      <span className="font-mono text-[9px] font-bold text-bg tracking-wider">
                        No.{String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  {/* 底部信息条 */}
                  <div className="absolute bottom-0 left-0 w-full px-5 py-3 z-20 bg-gradient-to-t from-ink/30 to-transparent">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-accent animate-pulse" />
                        <span className="font-mono text-[7px] uppercase tracking-[0.3em] text-bg/50">
                          {project.category === 'puzzle-game' ? (lang === 'cn' ? '解谜游戏' : 'PUZZLE GAME') : (lang === 'cn' ? '交互书' : 'INTERACTIVE BOOK')}
                        </span>
                      </div>
                      <div className="flex gap-[2px]">
                        {[...Array(8)].map((_, i) => (
                          <div key={i} className="w-[2px] bg-bg/20" style={{ height: `${4 + Math.sin(i * 0.8) * 6 + 4}px` }} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 色调叠加 */}
                  <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none mix-blend-multiply" />
                </div>
              </div>
            </div>
            
            {/* 背景装饰 */}
            <div className="absolute inset-0 bg-ink/[0.02]" />
          </div>

          {/* 文字侧 */}
          <div className={`w-full md:w-1/2 p-8 md:p-16 lg:p-24 flex flex-col justify-center relative ${index % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
            {/* 背景大号序号 */}
            <span className="absolute top-8 right-8 font-serif text-[120px] md:text-[200px] opacity-[0.02] italic text-ink select-none leading-none pointer-events-none">
              {String(index + 1).padStart(2, '0')}
            </span>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative z-10"
            >
              {/* 标签行 */}
              <div className="flex items-center gap-4 mb-8 md:mb-12">
                <span className="stamp">{lang === 'cn' ? '魔法卷宗' : 'MAGIC FILE'}</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-[1px] bg-ink/20" />
                  <span className="font-mono text-[9px] uppercase tracking-widest opacity-30">
                    Ref: {project.id}
                  </span>
                </div>
              </div>

              {/* 标题 */}
              <h2 className="text-4xl md:text-7xl lg:text-8xl font-serif mb-8 md:mb-12 leading-[0.9] tracking-tighter">
                {project.title[lang].split(' ')[0]} <br />
                <span className="italic font-light text-accent">{project.title[lang].split(' ').slice(1).join(' ')}</span>
              </h2>

              {/* 描述 + 分类 */}
              <div className="mb-8 md:mb-12 relative">
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-accent via-accent/30 to-transparent" />
                <div className="pl-6 md:pl-8">
                  <span className="font-mono text-[8px] uppercase tracking-widest text-accent mb-4 block flex items-center gap-2">
                    <span className="inline-block w-3 h-[1px] bg-accent/40" />
                    {lang === 'cn' ? '核心摘要' : 'CORE SUMMARY'}
                  </span>
                  <p className="text-base md:text-lg opacity-70 font-light leading-relaxed mb-6">
                    {project.longDescription[lang]}
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-ink/8">
                    <span className="font-mono text-[8px] uppercase tracking-widest text-accent/60">{lang === 'cn' ? '魔法分类' : 'CLASS'}</span>
                    <div className="w-4 h-[1px] bg-ink/10" />
                    <span className="font-mono text-[10px] uppercase tracking-wider opacity-50">
                      {project.category === 'interactive-book' ? T[lang].apps : T[lang].games}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-12 md:mb-16">
                {project.tags.map((tag, i) => (
                  <motion.div 
                    key={tag}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-ink/10 hover:border-accent/30 hover:bg-accent/3 transition-all"
                  >
                    <div className="w-1 h-1 bg-accent/60 rotate-45" />
                    <span className="text-[9px] font-mono uppercase tracking-widest opacity-50">
                      {tag}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* 启动按钮 */}
              {project.launchUrl ? (
                <a
                  href={project.launchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn w-full md:w-auto inline-flex items-center justify-center md:justify-start gap-6 text-ink font-mono text-[10px] uppercase tracking-[0.3em] border-2 border-ink px-10 py-5 bg-bg shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:bg-accent hover:text-bg hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all duration-75 relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-accent/5 translate-x-[-100%] group-hover/btn:translate-x-0 transition-transform duration-500" />
                  <span className="relative">{T[lang].launch}</span>
                  <ArrowRight className="w-4 h-4 relative group-hover/btn:translate-x-2 transition-transform" />
                </a>
              ) : (
                <button className="group/btn w-full md:w-auto flex items-center justify-center md:justify-start gap-6 text-ink font-mono text-[10px] uppercase tracking-[0.3em] border-2 border-ink px-10 py-5 bg-bg shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:bg-accent hover:text-bg hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all duration-75 relative overflow-hidden">
                  <span className="absolute inset-0 bg-accent/5 translate-x-[-100%] group-hover/btn:translate-x-0 transition-transform duration-500" />
                  <span className="relative">{T[lang].launch}</span>
                  <ArrowRight className="w-4 h-4 relative group-hover/btn:translate-x-2 transition-transform" />
                </button>
              )}
            </motion.div>
          </div>
        </div>
      ))}
    </section>
  );
};

const Footer = ({ lang, config }: { lang: Language, config: SiteConfig }) => {
  const T = buildTranslations(config);
  const c = config.contact;

  return (
    <footer id="contact" className="py-32 bg-bg border-t border-ink/10 relative overflow-hidden">
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-accent/30" />

      <div className="max-w-7xl mx-auto px-8 text-center relative z-10">
        <div className="mb-8 inline-block">
          <span className="stamp border-accent text-accent rotate-0">Seal of Authenticity</span>
        </div>
        <h2 className="text-7xl md:text-9xl font-serif italic mb-12">{T[lang].letsBuild}</h2>
        
        <div className="flex justify-center gap-12 mb-20">
          {c.github && (
            <a href={c.github} target="_blank" rel="noopener noreferrer" className="p-4 rounded-none border-2 border-ink shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:bg-accent hover:text-bg hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all duration-75">
              <Github className="w-6 h-6" />
            </a>
          )}
          {c.twitter && (
            <a href={c.twitter} target="_blank" rel="noopener noreferrer" className="p-4 rounded-none border-2 border-ink shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:bg-accent hover:text-bg hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all duration-75">
              <Twitter className="w-6 h-6" />
            </a>
          )}
          {c.email && (
            <a href={`mailto:${c.email}`} className="p-4 rounded-none border-2 border-ink shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:bg-accent hover:text-bg hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all duration-75">
              <Mail className="w-6 h-6" />
            </a>
          )}
          {c.xiaohongshu && (
            <a href={c.xiaohongshu} target="_blank" rel="noopener noreferrer" className="p-4 rounded-none border-2 border-ink shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:bg-[#FF2442] hover:text-white hover:border-[#FF2442] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all duration-75" title="小红书">
              <XiaohongshuIcon className="w-6 h-6" />
            </a>
          )}
          {/* 如果没有配置任何链接，显示默认占位 */}
          {!c.github && !c.twitter && !c.email && !c.xiaohongshu && (
            <>
              <span className="p-4 rounded-none border-2 border-ink/20 text-ink/20"><Github className="w-6 h-6" /></span>
              <span className="p-4 rounded-none border-2 border-ink/20 text-ink/20"><Mail className="w-6 h-6" /></span>
            </>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 font-mono text-[10px] uppercase tracking-[0.3em] opacity-30">
          <p>{T[lang].rights}</p>
          <p>{T[lang].designedWith}</p>
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  const [lang, setLang] = useState<Language>('cn');
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    setConfig(loadConfig());

    const handleStorage = () => {
      setConfig(loadConfig());
    };
    window.addEventListener('storage', handleStorage);

    const handleConfigUpdate = () => {
      setConfig(loadConfig());
    };
    window.addEventListener('config-updated', handleConfigUpdate);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('config-updated', handleConfigUpdate);
    };
  }, []);

  useEffect(() => {
    if (!config) return;
    if (config.site.tabTitle) {
      document.title = config.site.tabTitle;
    }
    if (config.site.faviconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = config.site.faviconUrl;
    }
  }, [config]);

  // 进入详情页时滚动到顶部
  useEffect(() => {
    if (activeProjectId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeProjectId]);

  if (!config) return null;

  const T = buildTranslations(config);
  const activeProject = activeProjectId ? config.projects.find(p => p.id === activeProjectId) : null;

  // 详情页模式
  if (activeProject) {
    return (
      <div className="relative bg-bg">
        <div className="noise" />
        <AnimatePresence mode="wait">
          <ProjectDetailPage
            key={activeProject.id}
            project={activeProject}
            lang={lang}
            config={config}
            onBack={() => setActiveProjectId(null)}
          />
        </AnimatePresence>
        <div className="fixed inset-0 pointer-events-none z-[-1] opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(var(--color-ink) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink) 1px, transparent 1px)', backgroundSize: '100px 100px' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-bg">
      <div className="noise" />
      <Navbar lang={lang} setLang={setLang} config={config} />
      
      <Hero scrollYProgress={scrollYProgress} lang={lang} config={config} />
      
      <ScrollingMarquee text={T[lang].scrollingText} />

      <TarotSection lang={lang} config={config} onProjectClick={(id) => setActiveProjectId(id)} />

      <About lang={lang} config={config} />
      
      <Catalog lang={lang} config={config} onProjectClick={(id) => setActiveProjectId(id)} />

      <ProjectDetails lang={lang} config={config} />
      
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
      
      <Footer lang={lang} config={config} />
      
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-5">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(var(--color-ink) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink) 1px, transparent 1px)', backgroundSize: '100px 100px' }} />
      </div>
    </div>
  );
}
