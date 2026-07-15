import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Settings, User, FolderOpen, Mail, Save, Plus, Trash2, ChevronDown, ChevronUp, 
  Eye, ArrowLeft, Image, Film, Link, Tag, Gamepad2, AppWindow, BookOpen, Upload, X, Play, Clock, MousePointer,
  Sparkles, Loader2, Check, Key, Wrench, Images, GripVertical, Lock, LogOut, Download, FolderInput
} from 'lucide-react';
import { SiteConfig, ProjectItem, ToolItem, TarotCard, loadConfig, saveConfig, defaultConfig } from '../config/siteConfig';

type Tab = 'site' | 'profile' | 'projects' | 'tarot' | 'contact' | 'ai';

// ===== AI 润色相关 =====
const AI_CONFIG_KEY = 'magic-garden-ai-config';

interface AIConfig {
  apiKey: string;
  apiEndpoint: string;
  model: string;
}

function loadAIConfig(): AIConfig {
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { apiKey: '', apiEndpoint: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o-mini' };
}

function saveAIConfig(cfg: AIConfig) {
  localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(cfg));
}

async function polishText(text: string, lang: 'cn' | 'en', aiConfig: AIConfig): Promise<string> {
  if (!aiConfig.apiKey) throw new Error('请先在「AI 设置」中配置 API Key');
  if (!text.trim()) throw new Error('请输入需要润色的文案');

  const systemPrompt = lang === 'cn'
    ? '你是一位专业的中文文案润色师，擅长为创意作品集网站撰写优雅、有格调的文案。请对用户输入的文案进行润色，使其更加精炼、有感染力、适合展示在作品集官网上。保持原意不变，只润色表达。直接返回润色后的文案，不要加任何解释。'
    : 'You are a professional English copywriter specializing in elegant, stylish copy for creative portfolio websites. Polish the user\'s text to be more refined, compelling, and suitable for a portfolio website. Keep the original meaning intact, only refine the expression. Return only the polished text without any explanation.';

  const res = await fetch(aiConfig.apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${aiConfig.apiKey}`,
    },
    body: JSON.stringify({
      model: aiConfig.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API 调用失败 (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || text;
}

// AI 润色按钮组件
function AIPolishButton({ value, onChange, lang }: { 
  value: string; 
  onChange: (v: string) => void;
  lang?: 'cn' | 'en';
}) {
  const [loading, setLoading] = useState(false);
  const [showDraft, setShowDraft] = useState(false);
  const [draft, setDraft] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showDraft) return;
    const handleClick = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) {
        setShowDraft(false);
        setResult('');
        setError('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDraft]);

  const handlePolish = async () => {
    const textToPolish = draft.trim() || value;
    if (!textToPolish) { setError('请输入文案内容'); return; }
    setLoading(true);
    setError('');
    setResult('');
    try {
      const aiConfig = loadAIConfig();
      const polished = await polishText(textToPolish, lang || 'cn', aiConfig);
      setResult(polished);
    } catch (err: any) {
      setError(err.message || '润色失败');
    }
    setLoading(false);
  };

  const handleApply = () => {
    if (result) {
      onChange(result);
      setShowDraft(false);
      setDraft('');
      setResult('');
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => { setShowDraft(!showDraft); setDraft(''); setResult(''); setError(''); }}
        className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-purple-600 hover:bg-purple-50 border border-purple-200 hover:border-purple-400 transition-all rounded-sm"
        title="AI 润色"
      >
        <Sparkles className="w-3 h-3" />
        AI润色
      </button>

      {showDraft && (
        <div ref={popRef} className="absolute z-50 top-full mt-1 right-0 w-80 bg-white border-2 border-purple-200 shadow-lg p-4 space-y-3" style={{ minWidth: '320px' }}>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-purple-600 border-b border-purple-100 pb-2">
            <Sparkles className="w-3 h-3" />
            AI 文案润色 {lang === 'en' ? '(English)' : '(中文)'}
          </div>

          <div>
            <label className="text-[10px] font-mono text-[#1a1a1a]/50 block mb-1">输入草稿文案（留空则润色当前内容）</label>
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder={value || '输入你想润色的大致文案...'}
              rows={3}
              className="w-full px-3 py-2 text-sm border-2 border-purple-100 focus:border-purple-400 focus:outline-none resize-y bg-purple-50/30"
            />
          </div>

          <button
            onClick={handlePolish}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white text-xs font-mono uppercase tracking-wider hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {loading ? <><Loader2 className="w-3 h-3 animate-spin" /> 润色中...</> : <><Sparkles className="w-3 h-3" /> 开始润色</>}
          </button>

          {error && (
            <div className="text-xs text-red-500 bg-red-50 px-3 py-2 border border-red-200">{error}</div>
          )}

          {result && (
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-green-600 block">润色结果：</label>
              <div className="px-3 py-2 bg-green-50 border border-green-200 text-sm leading-relaxed">{result}</div>
              <button
                onClick={handleApply}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-xs font-mono uppercase tracking-wider hover:bg-green-700 transition-colors"
              >
                <Check className="w-3 h-3" /> 应用此结果
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 小红书SVG图标
const XiaohongshuIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.57.05-1-.38-1.56-.74-.87-.57-1.36-.92-2.2-1.48-.97-.64-.34-1 .21-1.57.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.05-.2-.07-.05-.16-.03-.23-.02-.1.02-1.62 1.03-4.58 3.03-.43.3-.83.44-1.18.43-.39-.01-1.14-.22-1.7-.4-.68-.22-1.23-.34-1.18-.72.02-.2.3-.4.83-.61 3.24-1.41 5.4-2.34 6.49-2.8 3.09-1.29 3.73-1.51 4.15-1.52.09 0 .3.02.43.12.11.09.14.2.16.34-.01.06.01.24 0 .37z"/>
  </svg>
);

export default function AdminPanel() {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);
  const [activeTab, setActiveTab] = useState<Tab>('site');
  const [saved, setSaved] = useState(false);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  // 塔罗牌展开状态（必须在条件返回前声明）
  const [expandedTarot, setExpandedTarot] = useState<string | null>(null);

  // 密码验证
  const AUTH_SESSION_KEY = 'magic-garden-admin-auth';
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem(AUTH_SESSION_KEY) === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    setConfig(loadConfig(true));
  }, []);

  const handleSave = useCallback(() => {
    saveConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [config]);

  // 导出配置为 JSON 文件
  const handleExport = useCallback(() => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `site-config-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [config]);

  // 导入配置 JSON 文件
  const importRef = useRef<HTMLInputElement>(null);
  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result as string);
        setConfig(imported);
        saveConfig(imported);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch {
        alert('配置文件格式错误，请检查 JSON 格式');
      }
    };
    reader.readAsText(file);
    if (importRef.current) importRef.current.value = '';
  }, []);

  const handleLogin = () => {
    const cfg = loadConfig(true);
    const correctPassword = cfg.site.adminPassword || 'admin123';
    if (passwordInput === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
      setLoginError('');
    } else {
      setLoginError('密码错误，请重试');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(AUTH_SESSION_KEY);
  };

  // 未认证时显示登录页
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="w-full max-w-sm mx-4">
          <div className="bg-[#f8f6f1] border-2 border-[#1a1a1a] shadow-[8px_8px_0px_0px_#9b3021] p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-[#9b3021] flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#f4f1ea]" />
              </div>
              <div>
                <h1 className="font-serif text-xl tracking-tight">
                  后台<span className="text-[#9b3021] italic">管理</span>
                </h1>
                <p className="text-[10px] font-mono uppercase tracking-widest opacity-40">Admin Authentication</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-[#1a1a1a]/50 mb-2">
                  管理密码
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={e => { setPasswordInput(e.target.value); setLoginError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="请输入管理密码"
                  className="w-full px-4 py-3 border-2 border-[#1a1a1a] bg-white text-sm font-mono focus:outline-none focus:border-[#9b3021] transition-colors"
                  autoFocus
                />
              </div>

              {loginError && (
                <p className="text-[#9b3021] text-xs font-mono">{loginError}</p>
              )}

              <button
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#1a1a1a] text-[#f4f1ea] text-xs font-mono uppercase tracking-widest border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#9b3021] hover:bg-[#9b3021] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-75"
              >
                <Key className="w-3 h-3" />
                验证身份
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-[#1a1a1a]/10">
              <a href="/" className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#1a1a1a]/40 hover:text-[#1a1a1a] transition-colors">
                <ArrowLeft className="w-3 h-3" /> 返回首页
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const updateSite = (field: string, value: string) => {
    setConfig(prev => ({ ...prev, site: { ...prev.site, [field]: value } }));
  };

  const updateProfile = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, profile: { ...prev.profile, [field]: value } }));
  };

  const updateProfileI18n = (field: string, lang: 'cn' | 'en', value: string) => {
    setConfig(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: { ...(prev.profile as any)[field], [lang]: value },
      },
    }));
  };

  const updateProfileI18nArray = (field: string, lang: 'cn' | 'en', index: number, value: string) => {
    setConfig(prev => {
      const arr = [...(prev.profile as any)[field][lang]];
      arr[index] = value;
      return {
        ...prev,
        profile: {
          ...prev.profile,
          [field]: { ...(prev.profile as any)[field], [lang]: arr },
        },
      };
    });
  };

  const updateProject = (id: string, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      projects: prev.projects.map(p => (p.id === id ? { ...p, [field]: value } : p)),
    }));
  };

  const updateProjectI18n = (id: string, field: string, lang: 'cn' | 'en', value: string) => {
    setConfig(prev => ({
      ...prev,
      projects: prev.projects.map(p =>
        p.id === id ? { ...p, [field]: { ...(p as any)[field], [lang]: value } } : p
      ),
    }));
  };

  const addProject = () => {
    const newId = String(Date.now());
    const newProject: ProjectItem = {
      id: newId,
      title: { cn: '新项目', en: 'New Project' },
      category: 'interactive-book',
      description: { cn: '', en: '' },
      longDescription: { cn: '', en: '' },
      coverImage: 'https://picsum.photos/seed/new/1920/1080',
      coverType: 'image',
      videoPlayMode: 'delay5s',
      tags: [],
      launchUrl: '',
      gallery: [],
      gameplay: { cn: '', en: '' },
      demoVideo: '',
    };
    setConfig(prev => ({ ...prev, projects: [...prev.projects, newProject] }));
    setExpandedProject(newId);
  };

  const removeProject = (id: string) => {
    setConfig(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
  };

  const moveProject = (id: string, direction: 'up' | 'down') => {
    setConfig(prev => {
      const idx = prev.projects.findIndex(p => p.id === id);
      if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === prev.projects.length - 1)) return prev;
      const arr = [...prev.projects];
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
      return { ...prev, projects: arr };
    });
  };

  const updateContact = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, contact: { ...prev.contact, [field]: value } }));
  };

  const updateContactI18n = (field: string, lang: 'cn' | 'en', value: string) => {
    setConfig(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: { ...(prev.contact as any)[field], [lang]: value },
      },
    }));
  };

  // --- 塔罗牌管理 ---
  const updateTarotCard = (id: string, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      tarotCards: (prev.tarotCards || []).map(c => (c.id === id ? { ...c, [field]: value } : c)),
    }));
  };

  const updateTarotCardI18n = (id: string, field: string, lang: 'cn' | 'en', value: string) => {
    setConfig(prev => ({
      ...prev,
      tarotCards: (prev.tarotCards || []).map(c =>
        c.id === id ? { ...c, [field]: { ...(c as any)[field], [lang]: value } } : c
      ),
    }));
  };

  const addTarotCard = () => {
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const cards = config.tarotCards || [];
    const newCard: TarotCard = {
      id: 't' + Date.now(),
      title: { cn: '新卡牌', en: 'New Card' },
      subtitle: { cn: '卡牌描述', en: 'Card description' },
      coverImage: '',
      backImage: '',
      projectId: '',
      romanNumeral: romanNumerals[cards.length] || String(cards.length + 1),
    };
    setConfig(prev => ({ ...prev, tarotCards: [...(prev.tarotCards || []), newCard] }));
    setExpandedTarot(newCard.id);
  };

  const removeTarotCard = (id: string) => {
    setConfig(prev => ({ ...prev, tarotCards: (prev.tarotCards || []).filter(c => c.id !== id) }));
  };

  const moveTarotCard = (id: string, direction: 'up' | 'down') => {
    setConfig(prev => {
      const arr = [...(prev.tarotCards || [])];
      const idx = arr.findIndex(c => c.id === id);
      if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === arr.length - 1)) return prev;
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
      return { ...prev, tarotCards: arr };
    });
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'site', label: '站点设置', icon: <Settings className="w-4 h-4" /> },
    { key: 'profile', label: '个人档案', icon: <User className="w-4 h-4" /> },
    { key: 'projects', label: '作品管理', icon: <FolderOpen className="w-4 h-4" /> },
    { key: 'tarot', label: '塔罗牌', icon: <Sparkles className="w-4 h-4" /> },
    { key: 'contact', label: '联系方式', icon: <Mail className="w-4 h-4" /> },
    { key: 'ai', label: 'AI 设置', icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#f8f6f1] text-[#1a1a1a] font-sans">
      {/* 顶部栏 */}
      <header className="sticky top-0 z-50 bg-[#1a1a1a] text-[#f4f1ea] border-b-2 border-[#9b3021]">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2 text-[#f4f1ea]/60 hover:text-[#f4f1ea] transition-colors text-xs font-mono uppercase tracking-widest">
              <ArrowLeft className="w-3 h-3" /> 返回前台
            </a>
            <div className="w-px h-5 bg-[#f4f1ea]/20" />
            <h1 className="font-serif text-lg tracking-tight flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#9b3021]" />
              <span className="font-light">后台</span>
              <span className="text-[#9b3021] italic">管理</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-[#f4f1ea]/50 hover:text-[#f4f1ea] transition-colors">
              <Eye className="w-3 h-3" /> 预览
            </a>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-[#f4f1ea]/50 hover:text-[#f4f1ea] transition-colors"
              title="导出配置为 JSON 文件"
            >
              <Download className="w-3 h-3" /> 导出
            </button>
            <button
              onClick={() => importRef.current?.click()}
              className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-[#f4f1ea]/50 hover:text-[#f4f1ea] transition-colors"
              title="从 JSON 文件导入配置"
            >
              <FolderInput className="w-3 h-3" /> 导入
            </button>
            <input ref={importRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-[#f4f1ea]/50 hover:text-[#f4f1ea] transition-colors"
            >
              <LogOut className="w-3 h-3" /> 退出
            </button>
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-5 py-2 text-xs font-mono uppercase tracking-widest transition-all border-2 ${
                saved
                  ? 'bg-green-700 border-green-700 text-white'
                  : 'bg-[#9b3021] border-[#9b3021] text-white hover:bg-[#7a2419]'
              }`}
            >
              <Save className="w-3 h-3" />
              {saved ? '已保存 ✓' : '保存配置'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex min-h-[calc(100vh-52px)]">
        {/* 侧边栏 */}
        <aside className="w-56 flex-shrink-0 border-r border-[#1a1a1a]/10 bg-white/50 py-6">
          <nav className="flex flex-col gap-1 px-3">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-mono uppercase tracking-wider transition-all text-left ${
                  activeTab === tab.key
                    ? 'bg-[#1a1a1a] text-[#f4f1ea] shadow-[3px_3px_0_0_#9b3021]'
                    : 'text-[#1a1a1a]/60 hover:bg-[#1a1a1a]/5'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'site' && <SiteSettingsPanel config={config} updateSite={updateSite} />}
          {activeTab === 'profile' && (
            <ProfileSettingsPanel
              config={config}
              updateProfile={updateProfile}
              updateProfileI18n={updateProfileI18n}
              updateProfileI18nArray={updateProfileI18nArray}
            />
          )}
          {activeTab === 'projects' && (
            <ProjectsPanel
              config={config}
              updateProject={updateProject}
              updateProjectI18n={updateProjectI18n}
              addProject={addProject}
              removeProject={removeProject}
              moveProject={moveProject}
              expandedProject={expandedProject}
              setExpandedProject={setExpandedProject}
            />
          )}
          {activeTab === 'tarot' && (
            <TarotPanel
              config={config}
              updateTarotCard={updateTarotCard}
              updateTarotCardI18n={updateTarotCardI18n}
              addTarotCard={addTarotCard}
              removeTarotCard={removeTarotCard}
              moveTarotCard={moveTarotCard}
              expandedTarot={expandedTarot}
              setExpandedTarot={setExpandedTarot}
            />
          )}
          {activeTab === 'contact' && (
            <ContactPanel
              config={config}
              updateContact={updateContact}
              updateContactI18n={updateContactI18n}
            />
          )}
          {activeTab === 'ai' && <AISettingsPanel />}
        </main>
      </div>
    </div>
  );
}

/* ===== 通用组件 ===== */

function SectionTitle({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="mb-8 pb-6 border-b-2 border-[#1a1a1a]/10">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 bg-[#9b3021] text-white flex items-center justify-center">{icon}</div>
        <h2 className="text-2xl font-serif">{title}</h2>
      </div>
      <p className="text-sm text-[#1a1a1a]/50 font-mono uppercase tracking-wider ml-11">{desc}</p>
    </div>
  );
}

function FieldGroup({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-5">
      <label className="block text-xs font-mono uppercase tracking-widest text-[#1a1a1a]/60 mb-2">{label}</label>
      {children}
      {hint && <p className="text-xs text-[#1a1a1a]/40 mt-1 font-mono">{hint}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 bg-white border-2 border-[#1a1a1a]/15 text-sm font-sans focus:border-[#9b3021] focus:outline-none transition-colors placeholder:text-[#1a1a1a]/25"
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-2.5 bg-white border-2 border-[#1a1a1a]/15 text-sm font-sans focus:border-[#9b3021] focus:outline-none transition-colors resize-y placeholder:text-[#1a1a1a]/25"
    />
  );
}

function I18nField({ label, cnValue, enValue, onCnChange, onEnChange, multiline, hint }: {
  label: string;
  cnValue: string;
  enValue: string;
  onCnChange: (v: string) => void;
  onEnChange: (v: string) => void;
  multiline?: boolean;
  hint?: string;
}) {
  const Input = multiline ? TextArea : TextInput;
  return (
    <FieldGroup label={label} hint={hint}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-[#9b3021] uppercase tracking-wider">中文</span>
            <AIPolishButton value={cnValue} onChange={onCnChange} lang="cn" />
          </div>
          <Input value={cnValue} onChange={onCnChange} placeholder="中文" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-[#9b3021] uppercase tracking-wider">English</span>
            <AIPolishButton value={enValue} onChange={onEnChange} lang="en" />
          </div>
          <Input value={enValue} onChange={onEnChange} placeholder="English" />
        </div>
      </div>
    </FieldGroup>
  );
}

function ImagePreview({ url }: { url: string }) {
  if (!url) return null;
  const isVideo = url.startsWith('data:video') || /\.(mp4|webm|mov|ogg)(\?|$)/i.test(url);
  return (
    <div className="mt-2 border-2 border-[#1a1a1a]/10 p-1 inline-block bg-white">
      {isVideo ? (
        <video src={url} className="h-24 object-cover" muted playsInline onError={e => { (e.target as HTMLVideoElement).style.display = 'none'; }} />
      ) : (
        <img src={url} alt="preview" className="h-24 object-cover" referrerPolicy="no-referrer" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      )}
    </div>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function MediaUploadField({ label, value, onChange, accept, hint }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  accept: string;
  hint?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      onChange(dataUrl);
    } catch (err) {
      console.error('Upload failed:', err);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <FieldGroup label={label} hint={hint}>
      <div className="flex gap-2">
        <div className="flex-1">
          <TextInput value={value} onChange={onChange} placeholder="https://... 或点击上传本地文件" />
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1a1a1a] text-white text-xs font-mono uppercase tracking-wider hover:bg-[#9b3021] transition-colors disabled:opacity-50 flex-shrink-0"
        >
          <Upload className="w-3 h-3" />
          {uploading ? '上传中...' : '上传'}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="flex items-center px-2 py-2.5 text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
            title="清除"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />
      <ImagePreview url={value} />
    </FieldGroup>
  );
}

function GalleryUploadButton({ onUpload }: { onUpload: (dataUrl: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      onUpload(dataUrl);
    } catch {}
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="flex items-center px-2 py-1.5 bg-[#1a1a1a] text-white text-[10px] font-mono uppercase hover:bg-[#9b3021] transition-colors disabled:opacity-50 flex-shrink-0"
      >
        <Upload className="w-3 h-3" />
      </button>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
    </>
  );
}

/* ===== 站点设置 ===== */
function SiteSettingsPanel({ config, updateSite }: { config: SiteConfig; updateSite: (f: string, v: string) => void }) {
  return (
    <div>
      <SectionTitle icon={<Settings className="w-4 h-4" />} title="站点设置" desc="Site Settings — 配置网站基本信息" />
      <div className="max-w-2xl">
        <FieldGroup label="浏览器标签页标题" hint="显示在浏览器 Tab 上的名称">
          <TextInput value={config.site.tabTitle} onChange={v => updateSite('tabTitle', v)} placeholder="Magic Garden" />
        </FieldGroup>
        <MediaUploadField
          label="Logo 图片"
          value={config.site.logo}
          onChange={v => updateSite('logo', v)}
          accept="image/*"
          hint="留空则使用默认文字 Logo，支持 URL 或本地上传"
        />
        <MediaUploadField
          label="Favicon"
          value={config.site.faviconUrl}
          onChange={v => updateSite('faviconUrl', v)}
          accept="image/*,.ico"
          hint="浏览器标签页小图标"
        />

        <div className="mt-8 pt-8 border-t-2 border-[#1a1a1a]/10">
          <h3 className="text-sm font-mono uppercase tracking-widest text-[#9b3021] mb-4 flex items-center gap-2">
            <Lock className="w-3 h-3" /> 安全设置
          </h3>
          <FieldGroup label="管理端密码" hint="修改后下次登录生效，请牢记密码">
            <TextInput
              value={config.site.adminPassword || ''}
              onChange={v => updateSite('adminPassword', v)}
              placeholder="请设置管理密码"
            />
          </FieldGroup>
        </div>
      </div>
    </div>
  );
}

/* ===== 个人档案 ===== */
function ProfileSettingsPanel({ config, updateProfile, updateProfileI18n, updateProfileI18nArray }: {
  config: SiteConfig;
  updateProfile: (f: string, v: any) => void;
  updateProfileI18n: (f: string, l: 'cn' | 'en', v: string) => void;
  updateProfileI18nArray: (f: string, l: 'cn' | 'en', i: number, v: string) => void;
}) {
  const p = config.profile;
  return (
    <div>
      <SectionTitle icon={<User className="w-4 h-4" />} title="个人档案" desc="Profile — 首页 Hero 和个人介绍区域" />

      <div className="space-y-8">
        {/* Hero 背景 */}
        <div className="p-6 border-2 border-[#1a1a1a]/10 bg-white/80">
          <h3 className="text-sm font-mono uppercase tracking-widest text-[#9b3021] mb-4 flex items-center gap-2">
            <Image className="w-3 h-3" /> Hero 背景设置
          </h3>
          <FieldGroup label="背景类型">
            <div className="flex gap-3">
              <button
                onClick={() => updateProfile('heroBackgroundType', 'image')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase border-2 transition-all ${
                  p.heroBackgroundType === 'image' ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'border-[#1a1a1a]/20 hover:border-[#1a1a1a]/40'
                }`}
              >
                <Image className="w-3 h-3" /> 图片
              </button>
              <button
                onClick={() => updateProfile('heroBackgroundType', 'video')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase border-2 transition-all ${
                  p.heroBackgroundType === 'video' ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'border-[#1a1a1a]/20 hover:border-[#1a1a1a]/40'
                }`}
              >
                <Film className="w-3 h-3" /> 视频
              </button>
            </div>
          </FieldGroup>
          <MediaUploadField
            label="背景资源"
            value={p.heroBackground}
            onChange={v => updateProfile('heroBackground', v)}
            accept={p.heroBackgroundType === 'video' ? 'video/mp4,video/webm,video/quicktime,.mov' : 'image/*'}
            hint={p.heroBackgroundType === 'video' ? '支持 mp4/webm/mov 格式，可输入 URL 或上传本地文件' : '支持 jpg/png/webp 格式，可输入 URL 或上传本地文件'}
          />
        </div>

        {/* Hero 文案 */}
        <div className="p-6 border-2 border-[#1a1a1a]/10 bg-white/80">
          <h3 className="text-sm font-mono uppercase tracking-widest text-[#9b3021] mb-4">Hero 文案</h3>
          <I18nField label="副标题" cnValue={p.heroSub.cn} enValue={p.heroSub.en}
            onCnChange={v => updateProfileI18n('heroSub', 'cn', v)}
            onEnChange={v => updateProfileI18n('heroSub', 'en', v)} />
          <FieldGroup label="主标题（两行）">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-mono text-[#9b3021] mb-1 block">中文 第一行 / 第二行</span>
                <div className="flex gap-2">
                  <TextInput value={p.heroTitle.cn[0]} onChange={v => updateProfileI18nArray('heroTitle', 'cn', 0, v)} />
                  <TextInput value={p.heroTitle.cn[1]} onChange={v => updateProfileI18nArray('heroTitle', 'cn', 1, v)} />
                </div>
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#9b3021] mb-1 block">English Line 1 / Line 2</span>
                <div className="flex gap-2">
                  <TextInput value={p.heroTitle.en[0]} onChange={v => updateProfileI18nArray('heroTitle', 'en', 0, v)} />
                  <TextInput value={p.heroTitle.en[1]} onChange={v => updateProfileI18nArray('heroTitle', 'en', 1, v)} />
                </div>
              </div>
            </div>
          </FieldGroup>
          <I18nField label="描述" cnValue={p.heroDesc.cn} enValue={p.heroDesc.en}
            onCnChange={v => updateProfileI18n('heroDesc', 'cn', v)}
            onEnChange={v => updateProfileI18n('heroDesc', 'en', v)} />
          <I18nField label="滚动跑马灯文字" cnValue={p.scrollingText.cn} enValue={p.scrollingText.en}
            onCnChange={v => updateProfileI18n('scrollingText', 'cn', v)}
            onEnChange={v => updateProfileI18n('scrollingText', 'en', v)} />
        </div>

        {/* 个人照片与介绍 */}
        <div className="p-6 border-2 border-[#1a1a1a]/10 bg-white/80">
          <h3 className="text-sm font-mono uppercase tracking-widest text-[#9b3021] mb-4">个人介绍区域</h3>
          <MediaUploadField
            label="个人照片"
            value={p.photo}
            onChange={v => updateProfile('photo', v)}
            accept="image/*"
            hint="支持 URL 或本地上传"
          />
          <I18nField label="关于标题（两行）" cnValue={p.aboutTitle.cn.join(' / ')} enValue={p.aboutTitle.en.join(' / ')}
            onCnChange={v => { const parts = v.split(' / '); updateProfileI18nArray('aboutTitle', 'cn', 0, parts[0] || ''); updateProfileI18nArray('aboutTitle', 'cn', 1, parts[1] || ''); }}
            onEnChange={v => { const parts = v.split(' / '); updateProfileI18nArray('aboutTitle', 'en', 0, parts[0] || ''); updateProfileI18nArray('aboutTitle', 'en', 1, parts[1] || ''); }}
            hint="用 ' / ' 分隔两行，如：魔法背后的 / 意志"
          />
          <I18nField label="介绍段落一" cnValue={p.aboutDesc1.cn} enValue={p.aboutDesc1.en} multiline
            onCnChange={v => updateProfileI18n('aboutDesc1', 'cn', v)}
            onEnChange={v => updateProfileI18n('aboutDesc1', 'en', v)} />
          <I18nField label="介绍段落二" cnValue={p.aboutDesc2.cn} enValue={p.aboutDesc2.en} multiline
            onCnChange={v => updateProfileI18n('aboutDesc2', 'cn', v)}
            onEnChange={v => updateProfileI18n('aboutDesc2', 'en', v)} />
          <I18nField label="设计哲学标签" cnValue={p.philosophy.cn} enValue={p.philosophy.en}
            onCnChange={v => updateProfileI18n('philosophy', 'cn', v)}
            onEnChange={v => updateProfileI18n('philosophy', 'en', v)} />
          <I18nField label="设计哲学内容" cnValue={p.philosophyVal.cn} enValue={p.philosophyVal.en}
            onCnChange={v => updateProfileI18n('philosophyVal', 'cn', v)}
            onEnChange={v => updateProfileI18n('philosophyVal', 'en', v)} />
          <I18nField label="所在地标签" cnValue={p.location.cn} enValue={p.location.en}
            onCnChange={v => updateProfileI18n('location', 'cn', v)}
            onEnChange={v => updateProfileI18n('location', 'en', v)} />
          <I18nField label="所在地内容" cnValue={p.locationVal.cn} enValue={p.locationVal.en}
            onCnChange={v => updateProfileI18n('locationVal', 'cn', v)}
            onEnChange={v => updateProfileI18n('locationVal', 'en', v)} />
        </div>

        {/* 常用工具 */}
        <div className="p-6 border-2 border-[#1a1a1a]/10 bg-white/80">
          <h3 className="text-sm font-mono uppercase tracking-widest text-[#9b3021] mb-4 flex items-center gap-2">
            <Wrench className="w-3 h-3" /> 常用工具
          </h3>
          <p className="text-xs text-[#1a1a1a]/40 font-mono mb-4">在自我介绍区域展示你常用的工具/技术栈</p>
          
          <div className="space-y-3">
            {(p.tools || []).map((tool: ToolItem, idx: number) => (
              <div key={idx} className="flex items-center gap-3 p-3 border border-[#1a1a1a]/10 bg-white">
                <span className="text-xs font-mono text-[#1a1a1a]/30 flex-shrink-0 w-6 text-center">{idx + 1}</span>
                <div className="flex-1">
                  <input
                    type="text"
                    value={tool.name}
                    onChange={e => {
                      const tools = [...(p.tools || [])];
                      tools[idx] = { ...tools[idx], name: e.target.value };
                      updateProfile('tools', tools);
                    }}
                    placeholder="工具名称，如 Unity、Figma、TypeScript"
                    className="w-full px-3 py-1.5 bg-white border border-[#1a1a1a]/15 text-sm focus:border-[#9b3021] focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => {
                    const tools = (p.tools || []).filter((_: ToolItem, i: number) => i !== idx);
                    updateProfile('tools', tools);
                  }}
                  className="p-1 hover:bg-red-50 text-red-500 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              const tools = [...(p.tools || []), { name: '' }];
              updateProfile('tools', tools);
            }}
            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-[#1a1a1a]/20 text-[#1a1a1a]/50 hover:border-[#9b3021] hover:text-[#9b3021] transition-all text-xs font-mono uppercase tracking-widest"
          >
            <Plus className="w-3 h-3" /> 添加工具
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== 作品管理 ===== */
function ProjectsPanel({ config, updateProject, updateProjectI18n, addProject, removeProject, moveProject, expandedProject, setExpandedProject }: {
  config: SiteConfig;
  updateProject: (id: string, f: string, v: any) => void;
  updateProjectI18n: (id: string, f: string, l: 'cn' | 'en', v: string) => void;
  addProject: () => void;
  removeProject: (id: string) => void;
  moveProject: (id: string, d: 'up' | 'down') => void;
  expandedProject: string | null;
  setExpandedProject: (id: string | null) => void;
}) {
  return (
    <div>
      <SectionTitle icon={<FolderOpen className="w-4 h-4" />} title="作品管理" desc="Projects — 管理魔法档案中的所有作品" />

      <div className="space-y-3">
        {config.projects.map((project, idx) => (
          <div key={project.id} className="border-2 border-[#1a1a1a]/10 bg-white/80 transition-all">
            {/* 折叠头 */}
            <div
              className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-[#1a1a1a]/3"
              onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
            >
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-[#1a1a1a]/30">#{idx + 1}</span>
                <div className="flex items-center gap-2">
                  {project.category === 'puzzle-game' ? <Gamepad2 className="w-4 h-4 text-[#9b3021]" /> : <AppWindow className="w-4 h-4 text-[#9b3021]" />}
                  <span className="font-serif text-lg">{project.title.cn}</span>
                  <span className="text-xs text-[#1a1a1a]/40 font-mono">{project.title.en}</span>
                </div>
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 border ${
                  project.category === 'puzzle-game' ? 'border-purple-400 text-purple-600' : 'border-blue-400 text-blue-600'
                }`}>
                  {project.category === 'puzzle-game' ? '解谜游戏' : '交互书'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={e => { e.stopPropagation(); moveProject(project.id, 'up'); }} className="p-1 hover:bg-[#1a1a1a]/10 transition-colors" title="上移">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button onClick={e => { e.stopPropagation(); moveProject(project.id, 'down'); }} className="p-1 hover:bg-[#1a1a1a]/10 transition-colors" title="下移">
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button onClick={e => { e.stopPropagation(); if (confirm('确定要删除这个作品吗？')) removeProject(project.id); }} className="p-1 hover:bg-red-50 text-red-500 transition-colors" title="删除">
                  <Trash2 className="w-4 h-4" />
                </button>
                <ChevronDown className={`w-4 h-4 transition-transform ${expandedProject === project.id ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {/* 展开内容 */}
            {expandedProject === project.id && (
              <div className="px-5 pb-6 border-t border-[#1a1a1a]/10 pt-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup label="分类">
                    <div className="flex gap-3">
                      <button
                        onClick={() => updateProject(project.id, 'category', 'interactive-book')}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase border-2 transition-all ${
                          project.category === 'interactive-book' ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'border-[#1a1a1a]/20'
                        }`}
                      >
                        <AppWindow className="w-3 h-3" /> 交互书
                      </button>
                      <button
                        onClick={() => updateProject(project.id, 'category', 'puzzle-game')}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase border-2 transition-all ${
                          project.category === 'puzzle-game' ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'border-[#1a1a1a]/20'
                        }`}
                      >
                        <Gamepad2 className="w-3 h-3" /> 解谜游戏
                      </button>
                    </div>
                  </FieldGroup>
                  <FieldGroup label="封面类型">
                    <div className="flex gap-3">
                      <button
                        onClick={() => updateProject(project.id, 'coverType', 'image')}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase border-2 transition-all ${
                          (project.coverType || 'image') === 'image' ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'border-[#1a1a1a]/20'
                        }`}
                      >
                        <Image className="w-3 h-3" /> 图片
                      </button>
                      <button
                        onClick={() => updateProject(project.id, 'coverType', 'video')}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase border-2 transition-all ${
                          project.coverType === 'video' ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'border-[#1a1a1a]/20'
                        }`}
                      >
                        <Film className="w-3 h-3" /> 视频
                      </button>
                    </div>
                  </FieldGroup>
                </div>

                <MediaUploadField
                  label="封面资源"
                  value={project.coverImage}
                  onChange={v => updateProject(project.id, 'coverImage', v)}
                  accept={project.coverType === 'video' ? 'video/mp4,video/webm,video/quicktime,.mov' : 'image/*'}
                  hint={project.coverType === 'video' ? '支持 mp4/webm/mov 格式视频' : '支持 jpg/png/webp 格式图片'}
                />

                {project.coverType === 'video' && (
                  <FieldGroup label="视频播放模式" hint="控制前台视频封面的播放行为">
                    <div className="flex gap-3">
                      <button
                        onClick={() => updateProject(project.id, 'videoPlayMode', 'delay5s')}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase border-2 transition-all ${
                          (project.videoPlayMode || 'delay5s') === 'delay5s' ? 'bg-[#9b3021] text-white border-[#9b3021]' : 'border-[#1a1a1a]/20 hover:border-[#1a1a1a]/40'
                        }`}
                      >
                        <Clock className="w-3 h-3" /> 静态5秒后播放
                      </button>
                      <button
                        onClick={() => updateProject(project.id, 'videoPlayMode', 'hover')}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase border-2 transition-all ${
                          project.videoPlayMode === 'hover' ? 'bg-[#9b3021] text-white border-[#9b3021]' : 'border-[#1a1a1a]/20 hover:border-[#1a1a1a]/40'
                        }`}
                      >
                        <MousePointer className="w-3 h-3" /> Hover 后播放
                      </button>
                    </div>
                  </FieldGroup>
                )}

                <I18nField label="标题" cnValue={project.title.cn} enValue={project.title.en}
                  onCnChange={v => updateProjectI18n(project.id, 'title', 'cn', v)}
                  onEnChange={v => updateProjectI18n(project.id, 'title', 'en', v)} />
                <I18nField label="简短描述（卡片展示）" cnValue={project.description.cn} enValue={project.description.en}
                  onCnChange={v => updateProjectI18n(project.id, 'description', 'cn', v)}
                  onEnChange={v => updateProjectI18n(project.id, 'description', 'en', v)} />
                <I18nField label="详细介绍（详情页展示）" cnValue={project.longDescription.cn} enValue={project.longDescription.en} multiline
                  onCnChange={v => updateProjectI18n(project.id, 'longDescription', 'cn', v)}
                  onEnChange={v => updateProjectI18n(project.id, 'longDescription', 'en', v)} />

                <FieldGroup label="标签 Tags" hint="用英文逗号分隔，如: Puzzle, Unity, AI">
                  <TextInput
                    value={project.tags.join(', ')}
                    onChange={v => updateProject(project.id, 'tags', v.split(',').map(t => t.trim()).filter(Boolean))}
                  />
                </FieldGroup>
                <FieldGroup label="启动项目链接" hint="点击「启动项目」按钮时跳转的 URL">
                  <div className="flex items-center gap-2">
                    <Link className="w-4 h-4 text-[#9b3021] flex-shrink-0" />
                    <TextInput value={project.launchUrl} onChange={v => updateProject(project.id, 'launchUrl', v)} placeholder="https://app.example.com" />
                  </div>
                </FieldGroup>

                <I18nField label="玩法/功能概述（详情页展示）" cnValue={(project.gameplay || { cn: '', en: '' }).cn} enValue={(project.gameplay || { cn: '', en: '' }).en} multiline
                  onCnChange={v => updateProjectI18n(project.id, 'gameplay', 'cn', v)}
                  onEnChange={v => updateProjectI18n(project.id, 'gameplay', 'en', v)}
                  hint="描述项目的核心玩法或功能亮点"
                />

                <MediaUploadField
                  label="演示视频"
                  value={project.demoVideo || ''}
                  onChange={v => updateProject(project.id, 'demoVideo', v)}
                  accept="video/mp4,video/webm,video/quicktime,.mov"
                  hint="详情页中展示的演示视频，支持 mp4/webm/mov 格式，留空则不展示视频区域"
                />

                {/* 项目图片集 */}
                <div className="border-t border-[#1a1a1a]/10 pt-4 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Images className="w-4 h-4 text-[#9b3021]" />
                      <span className="text-xs font-mono uppercase tracking-widest text-[#1a1a1a]/60">项目图片集</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#1a1a1a]/40">第一张为大图展示，其余为网格小图</span>
                  </div>

                  <div className="space-y-2">
                    {(project.gallery || []).map((img: string, imgIdx: number) => (
                      <div key={imgIdx} className="flex items-center gap-2 p-2 border border-[#1a1a1a]/10 bg-white">
                        <span className="text-[10px] font-mono text-[#1a1a1a]/30 flex-shrink-0 w-6 text-center">
                          {imgIdx === 0 ? '大' : imgIdx + 1}
                        </span>
                        {img && (
                          <img src={img} alt="" className="w-10 h-10 object-cover border border-[#1a1a1a]/10 flex-shrink-0" referrerPolicy="no-referrer" />
                        )}
                        <input
                          type="text"
                          value={img}
                          onChange={e => {
                            const gallery = [...(project.gallery || [])];
                            gallery[imgIdx] = e.target.value;
                            updateProject(project.id, 'gallery', gallery);
                          }}
                          placeholder="图片 URL"
                          className="flex-1 px-3 py-1.5 bg-white border border-[#1a1a1a]/15 text-sm focus:border-[#9b3021] focus:outline-none"
                        />
                        <GalleryUploadButton
                          onUpload={dataUrl => {
                            const gallery = [...(project.gallery || [])];
                            gallery[imgIdx] = dataUrl;
                            updateProject(project.id, 'gallery', gallery);
                          }}
                        />
                        <button
                          onClick={() => {
                            const gallery = (project.gallery || []).filter((_: string, i: number) => i !== imgIdx);
                            updateProject(project.id, 'gallery', gallery);
                          }}
                          className="p-1 hover:bg-red-50 text-red-500 transition-colors flex-shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      const gallery = [...(project.gallery || []), ''];
                      updateProject(project.id, 'gallery', gallery);
                    }}
                    className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-[#1a1a1a]/20 text-[#1a1a1a]/50 hover:border-[#9b3021] hover:text-[#9b3021] transition-all text-xs font-mono uppercase tracking-widest"
                  >
                    <Plus className="w-3 h-3" /> 添加图片
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addProject}
        className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-4 border-2 border-dashed border-[#1a1a1a]/20 text-[#1a1a1a]/50 hover:border-[#9b3021] hover:text-[#9b3021] transition-all text-sm font-mono uppercase tracking-widest"
      >
        <Plus className="w-4 h-4" /> 添加新作品
      </button>
    </div>
  );
}

/* ===== 联系方式 ===== */
function ContactPanel({ config, updateContact, updateContactI18n }: {
  config: SiteConfig;
  updateContact: (f: string, v: any) => void;
  updateContactI18n: (f: string, l: 'cn' | 'en', v: string) => void;
}) {
  const c = config.contact;
  return (
    <div>
      <SectionTitle icon={<Mail className="w-4 h-4" />} title="联系方式" desc="Contact — 社交链接与底部文案" />

      <div className="max-w-2xl space-y-6">
        <div className="p-6 border-2 border-[#1a1a1a]/10 bg-white/80">
          <h3 className="text-sm font-mono uppercase tracking-widest text-[#9b3021] mb-4">社交链接</h3>
          <FieldGroup label="GitHub">
            <TextInput value={c.github} onChange={v => updateContact('github', v)} placeholder="https://github.com/yourname" />
          </FieldGroup>
          <FieldGroup label="Twitter / X">
            <TextInput value={c.twitter} onChange={v => updateContact('twitter', v)} placeholder="https://twitter.com/yourname" />
          </FieldGroup>
          <FieldGroup label="邮箱">
            <TextInput value={c.email} onChange={v => updateContact('email', v)} placeholder="your@email.com" />
          </FieldGroup>
          <FieldGroup label="小红书" hint="填入小红书个人主页链接，如: https://www.xiaohongshu.com/user/profile/xxx">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FF2442] text-white flex items-center justify-center flex-shrink-0 rounded-sm">
                <XiaohongshuIcon />
              </div>
              <TextInput value={c.xiaohongshu} onChange={v => updateContact('xiaohongshu', v)} placeholder="https://www.xiaohongshu.com/user/profile/xxx" />
            </div>
          </FieldGroup>
        </div>

        <div className="p-6 border-2 border-[#1a1a1a]/10 bg-white/80">
          <h3 className="text-sm font-mono uppercase tracking-widest text-[#9b3021] mb-4">底部文案</h3>
          <I18nField label="联系标题" cnValue={c.letsBuild.cn} enValue={c.letsBuild.en}
            onCnChange={v => updateContactI18n('letsBuild', 'cn', v)}
            onEnChange={v => updateContactI18n('letsBuild', 'en', v)} />
          <I18nField label="版权信息" cnValue={c.rights.cn} enValue={c.rights.en}
            onCnChange={v => updateContactI18n('rights', 'cn', v)}
            onEnChange={v => updateContactI18n('rights', 'en', v)} />
          <I18nField label="设计署名" cnValue={c.designedWith.cn} enValue={c.designedWith.en}
            onCnChange={v => updateContactI18n('designedWith', 'cn', v)}
            onEnChange={v => updateContactI18n('designedWith', 'en', v)} />
        </div>
      </div>
    </div>
  );
}

/* ===== 塔罗牌管理 ===== */
function TarotPanel({
  config, updateTarotCard, updateTarotCardI18n, addTarotCard, removeTarotCard, moveTarotCard, expandedTarot, setExpandedTarot,
}: {
  config: SiteConfig;
  updateTarotCard: (id: string, field: string, value: any) => void;
  updateTarotCardI18n: (id: string, field: string, lang: 'cn' | 'en', value: string) => void;
  addTarotCard: () => void;
  removeTarotCard: (id: string) => void;
  moveTarotCard: (id: string, direction: 'up' | 'down') => void;
  expandedTarot: string | null;
  setExpandedTarot: (id: string | null) => void;
}) {
  const cards = config.tarotCards || [];
  return (
    <div>
      <SectionTitle icon={<Sparkles className="w-5 h-5" />} title="塔罗牌管理" desc="配置首页塔罗牌翻卡展示的精选作品" />

      <div className="space-y-4">
        {cards.map((card, idx) => (
          <div key={card.id} className="border-2 border-[#1a1a1a]/10 bg-white">
            <div
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#f4f1ea] transition-colors"
              onClick={() => setExpandedTarot(expandedTarot === card.id ? null : card.id)}
            >
              <GripVertical className="w-4 h-4 opacity-30" />
              <span className="font-serif text-sm italic text-[#9b3021] w-8">{card.romanNumeral}</span>
              {card.coverImage && (
                <img src={card.coverImage} alt="" className="w-8 h-10 object-cover border border-[#1a1a1a]/10" referrerPolicy="no-referrer" />
              )}
              <span className="font-medium flex-1">{card.title.cn} / {card.title.en}</span>
              <div className="flex items-center gap-1">
                <button onClick={e => { e.stopPropagation(); moveTarotCard(card.id, 'up'); }} className="p-1 hover:bg-[#1a1a1a]/10 rounded"><ChevronUp className="w-3 h-3" /></button>
                <button onClick={e => { e.stopPropagation(); moveTarotCard(card.id, 'down'); }} className="p-1 hover:bg-[#1a1a1a]/10 rounded"><ChevronDown className="w-3 h-3" /></button>
                <button onClick={e => { e.stopPropagation(); removeTarotCard(card.id); }} className="p-1 hover:bg-red-50 text-red-500 rounded"><Trash2 className="w-3 h-3" /></button>
              </div>
              {expandedTarot === card.id ? <ChevronUp className="w-4 h-4 opacity-40" /> : <ChevronDown className="w-4 h-4 opacity-40" />}
            </div>

            {expandedTarot === card.id && (
              <div className="px-4 pb-4 space-y-4 border-t border-[#1a1a1a]/10 pt-4">
                {/* 标题 */}
                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup label="卡牌标题（中文）">
                    <input value={card.title.cn} onChange={e => updateTarotCardI18n(card.id, 'title', 'cn', e.target.value)} className="field-input" />
                  </FieldGroup>
                  <FieldGroup label="卡牌标题（英文）">
                    <input value={card.title.en} onChange={e => updateTarotCardI18n(card.id, 'title', 'en', e.target.value)} className="field-input" />
                  </FieldGroup>
                </div>

                {/* 副标题 */}
                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup label="副标题（中文）">
                    <input value={card.subtitle.cn} onChange={e => updateTarotCardI18n(card.id, 'subtitle', 'cn', e.target.value)} className="field-input" />
                  </FieldGroup>
                  <FieldGroup label="副标题（英文）">
                    <input value={card.subtitle.en} onChange={e => updateTarotCardI18n(card.id, 'subtitle', 'en', e.target.value)} className="field-input" />
                  </FieldGroup>
                </div>

                {/* 罗马数字编号 */}
                <FieldGroup label="罗马数字编号">
                  <input value={card.romanNumeral} onChange={e => updateTarotCard(card.id, 'romanNumeral', e.target.value)} className="field-input" placeholder="I, II, III..." />
                </FieldGroup>

                {/* 封面图 */}
                <MediaUploadField
                  label="正面封面图（建议 3:4 比例，如 600x800）"
                  value={card.coverImage}
                  onChange={v => updateTarotCard(card.id, 'coverImage', v)}
                  accept="image/*"
                  hint="支持 URL 或本地上传图片"
                />

                {/* 背面图 */}
                <MediaUploadField
                  label="背面图（可选，留空使用默认神秘花纹）"
                  value={card.backImage}
                  onChange={v => updateTarotCard(card.id, 'backImage', v)}
                  accept="image/*"
                  hint="可选，支持 URL 或本地上传"
                />

                {/* 关联项目 */}
                <FieldGroup label="关联项目（翻牌后点击跳转）">
                  <select
                    value={card.projectId}
                    onChange={e => updateTarotCard(card.id, 'projectId', e.target.value)}
                    className="field-input"
                  >
                    <option value="">不关联项目</option>
                    {config.projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title.cn} / {p.title.en}</option>
                    ))}
                  </select>
                </FieldGroup>
              </div>
            )}
          </div>
        ))}
      </div>

      <button onClick={addTarotCard} className="mt-6 flex items-center gap-2 px-4 py-2 border-2 border-dashed border-[#1a1a1a]/20 hover:border-[#9b3021] hover:text-[#9b3021] transition-colors text-sm font-mono uppercase tracking-wider">
        <Plus className="w-4 h-4" /> 添加塔罗牌
      </button>
    </div>
  );
}

/* ===== AI 设置 ===== */
function AISettingsPanel() {
  const [aiConfig, setAiConfig] = useState<AIConfig>(loadAIConfig());
  const [saved, setSaved] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState('');

  const handleSave = () => {
    saveAIConfig(aiConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = async () => {
    setTestLoading(true);
    setTestResult('');
    try {
      const result = await polishText('这是一个测试文案，用来验证AI润色功能是否正常工作。', 'cn', aiConfig);
      setTestResult('连接成功！润色结果：' + result);
    } catch (err: any) {
      setTestResult('测试失败：' + err.message);
    }
    setTestLoading(false);
  };

  return (
    <div>
      <SectionTitle icon={<Sparkles className="w-4 h-4" />} title="AI 润色设置" desc="AI Polish — 配置 AI 文案润色功能" />

      <div className="max-w-2xl space-y-6">
        <div className="p-6 border-2 border-purple-200 bg-purple-50/30">
          <h3 className="text-sm font-mono uppercase tracking-widest text-purple-600 mb-2 flex items-center gap-2">
            <Sparkles className="w-3 h-3" /> 使用说明
          </h3>
          <p className="text-sm text-[#1a1a1a]/60 leading-relaxed">
            配置 AI API 后，所有文本输入框旁会出现「AI润色」按钮。点击后可输入大致文案草稿，AI 会帮你润色为精炼优雅的作品集文案。支持任何 OpenAI 兼容的 API（如 OpenAI、DeepSeek、智谱等）。
          </p>
        </div>

        <div className="p-6 border-2 border-[#1a1a1a]/10 bg-white/80">
          <h3 className="text-sm font-mono uppercase tracking-widest text-[#9b3021] mb-4 flex items-center gap-2">
            <Key className="w-3 h-3" /> API 配置
          </h3>
          <FieldGroup label="API Endpoint" hint="OpenAI 兼容的接口地址，如 DeepSeek: https://api.deepseek.com/v1/chat/completions">
            <TextInput
              value={aiConfig.apiEndpoint}
              onChange={v => setAiConfig(prev => ({ ...prev, apiEndpoint: v }))}
              placeholder="https://api.openai.com/v1/chat/completions"
            />
          </FieldGroup>
          <FieldGroup label="API Key" hint="你的 API 密钥，仅保存在浏览器本地，不会上传">
            <input
              type="password"
              value={aiConfig.apiKey}
              onChange={e => setAiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="sk-..."
              className="w-full px-4 py-2.5 bg-white border-2 border-[#1a1a1a]/15 text-sm font-mono focus:border-[#9b3021] focus:outline-none transition-colors placeholder:text-[#1a1a1a]/25"
            />
          </FieldGroup>
          <FieldGroup label="模型名称" hint="如: gpt-4o-mini, deepseek-chat, glm-4 等">
            <TextInput
              value={aiConfig.model}
              onChange={v => setAiConfig(prev => ({ ...prev, model: v }))}
              placeholder="gpt-4o-mini"
            />
          </FieldGroup>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-mono uppercase tracking-wider transition-all border-2 ${
                saved ? 'bg-green-700 border-green-700 text-white' : 'bg-[#1a1a1a] border-[#1a1a1a] text-white hover:bg-[#9b3021] hover:border-[#9b3021]'
              }`}
            >
              <Save className="w-3 h-3" />
              {saved ? '已保存 ✓' : '保存设置'}
            </button>
            <button
              onClick={handleTest}
              disabled={testLoading || !aiConfig.apiKey}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-mono uppercase tracking-wider border-2 border-purple-400 text-purple-600 hover:bg-purple-50 disabled:opacity-50 transition-colors"
            >
              {testLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              {testLoading ? '测试中...' : '测试连接'}
            </button>
          </div>

          {testResult && (
            <div className={`mt-4 px-4 py-3 text-sm border-2 ${
              testResult.startsWith('连接成功') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {testResult}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
