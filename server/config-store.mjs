/**
 * 线上配置存储：供 Vite 开发服务器与生产 Express 服务共用。
 *
 * GET  /api/site-config  -> { config, updatedAt }（config 中移除管理密码）
 * PUT  /api/site-config  -> 需 x-admin-key 请求头，写入配置
 *
 * 配置保存在 CONFIG_DATA_DIR/site-config.json（默认项目根目录 data/）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const DEFAULT_ADMIN_KEY = 'admin123';

export function getConfigFilePath() {
  const dir = process.env.CONFIG_DATA_DIR || path.join(ROOT, 'data');
  return path.join(dir, 'site-config.json');
}

export function readStoredConfig() {
  try {
    const parsed = JSON.parse(fs.readFileSync(getConfigFilePath(), 'utf-8'));
    if (parsed?.config && typeof parsed.config === 'object') return parsed;
    if (parsed?.site) return { config: parsed, updatedAt: null };
  } catch {
    // 文件不存在或内容损坏时视为未配置
  }
  return null;
}

export function writeStoredConfig(config) {
  const file = getConfigFilePath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const payload = { config, updatedAt: new Date().toISOString() };
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(payload, null, 2), 'utf-8');
  fs.renameSync(tmp, file);
  return payload;
}

function resolveAdminKey() {
  const stored = readStoredConfig();
  return stored?.config?.site?.adminPassword || DEFAULT_ADMIN_KEY;
}

function publicConfig(config) {
  const copy = JSON.parse(JSON.stringify(config));
  if (copy?.site) delete copy.site.adminPassword;
  return copy;
}

function readBody(req) {
  return new Promise((resolve) => {
    if (req.body !== undefined && req.body !== null) {
      resolve(req.body);
      return;
    }
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 30 * 1024 * 1024) req.destroy();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw || '{}'));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

export async function handleConfigApi(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method === 'GET') {
    const stored = readStoredConfig();
    res.end(
      JSON.stringify(
        stored
          ? { config: publicConfig(stored.config), updatedAt: stored.updatedAt }
          : { config: null, updatedAt: null }
      )
    );
    return;
  }

  if (req.method === 'PUT') {
    const parsed = await readBody(req);
    const config = parsed?.config ?? parsed;
    if (!config || typeof config !== 'object' || !config.site || !Array.isArray(config.projects)) {
      res.statusCode = 400;
      res.end(JSON.stringify({ success: false, error: '配置格式不合法' }));
      return;
    }

    const key = String(req.headers['x-admin-key'] || '');
    if (key !== resolveAdminKey()) {
      res.statusCode = 401;
      res.end(JSON.stringify({ success: false, error: '管理密码不正确，请重新登录后再发布' }));
      return;
    }

    try {
      const saved = writeStoredConfig(config);
      res.end(JSON.stringify({ success: true, updatedAt: saved.updatedAt }));
    } catch (error) {
      res.statusCode = 500;
      res.end(JSON.stringify({ success: false, error: String(error?.message || error) }));
    }
    return;
  }

  res.statusCode = 405;
  res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
}
