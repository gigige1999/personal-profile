// 线上配置读写：管理端发布 -> 云端存储 -> 前端展示端实时读取

import { defaultConfig, deepMerge, type SiteConfig } from './siteConfig';

// 同源部署时留空即可（/api/site-config）。
// 若主站仍在 GitHub Pages、配置服务在别的域名，构建时设置 VITE_CONFIG_API=https://服务域名
const API_BASE = String(import.meta.env.VITE_CONFIG_API || '').replace(/\/+$/, '');

export const CONFIG_API_ENDPOINT = `${API_BASE}/api/site-config`;

export interface PublishResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function fetchRemoteConfig(): Promise<SiteConfig | null> {
  try {
    const res = await fetch(CONFIG_API_ENDPOINT, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.config || typeof data.config !== 'object') return null;
    return deepMerge(defaultConfig, data.config) as SiteConfig;
  } catch {
    return null;
  }
}

export async function publishConfig(config: SiteConfig, adminKey: string): Promise<PublishResult> {
  try {
    const res = await fetch(CONFIG_API_ENDPOINT, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey,
      },
      body: JSON.stringify({ config }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) {
      return { success: false, error: data.error || `发布失败 (HTTP ${res.status})` };
    }
    return { success: true, message: '已发布，线上页面刷新后生效' };
  } catch (error) {
    return { success: false, error: String((error as Error)?.message || error) };
  }
}
