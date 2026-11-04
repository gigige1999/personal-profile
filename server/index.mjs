/**
 * 生产服务：托管构建产物（含独立管理端 admin.html）+ 线上配置 API。
 *
 *   npm run build && npm start
 *
 * 环境变量：
 *   PORT            服务端口（默认 3000）
 *   CONFIG_DATA_DIR 配置持久化目录（默认 <项目>/data），上线时请挂载持久卷
 *   DIST_DIR        构建产物目录（默认 <项目>/dist）
 */
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { handleConfigApi, readStoredConfig, writeStoredConfig } from './config-store.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = process.env.DIST_DIR || path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT || 3000);

// 首次启动时用构建产物里的默认配置初始化，保证线上配置 API 立即可用
if (!readStoredConfig()) {
  const seed = path.join(DIST, 'site-config.default.json');
  if (fs.existsSync(seed)) {
    try {
      writeStoredConfig(JSON.parse(fs.readFileSync(seed, 'utf-8')));
      console.log('[server] 已用默认配置初始化线上配置');
    } catch (error) {
      console.warn('[server] 初始化配置失败:', error?.message || error);
    }
  }
}

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '30mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, hasPublishedConfig: Boolean(readStoredConfig()) });
});

app.all('/api/site-config', (req, res) => {
  void handleConfigApi(req, res);
});

// dist 未随代码分发时（例如平台直接执行 npm start）自动构建一次
if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.warn('[server] 未找到 dist/index.html，正在自动构建…');
  try {
    execSync('npm run build', { cwd: ROOT, stdio: 'inherit', env: { ...process.env, VITE_BASE: process.env.VITE_BASE || '/' } });
  } catch (error) {
    console.error('[server] 自动构建失败:', error?.message || error);
  }
}

// 配置里的图片路径带 GitHub Pages 子路径前缀，独立域名部署时同样要能访问
app.use('/personal-profile', express.static(DIST, { index: false, etag: true, maxAge: 0 }));
app.use(express.static(DIST, { index: false, etag: true, maxAge: 0 }));

app.use((req, res) => {
  if (req.method !== 'GET') {
    res.status(404).end();
    return;
  }
  res.sendFile(path.join(DIST, 'index.html'), (error) => {
    if (error && !res.headersSent) res.status(404).end();
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] 主站      http://localhost:${PORT}/`);
  console.log(`[server] 管理端    http://localhost:${PORT}/admin.html`);
  console.log(`[server] 配置 API  http://localhost:${PORT}/api/site-config`);
});
