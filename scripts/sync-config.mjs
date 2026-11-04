/**
 * 把管理端发布的配置同步回源码，供 GitHub Pages 静态构建使用。
 *
 * 用法：
 *   npm run sync:config                       # 读取 data/site-config.json（本地配置服务）
 *   node scripts/sync-config.mjs <文件.json>  # 读取管理端「导出」的 JSON 文件
 *
 * 之后执行 git commit + push，GitHub Actions 会自动重新构建部署线上前台。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(ROOT, 'src/config/siteConfig.ts');
const input = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(ROOT, 'data/site-config.json');

if (!fs.existsSync(input)) {
  console.error(`[sync] 找不到配置文件：${input}`);
  process.exit(1);
}

const parsed = JSON.parse(fs.readFileSync(input, 'utf-8'));
const config = parsed.config || parsed;

if (!config?.site || !Array.isArray(config.projects) || !Array.isArray(config.tarotCards)) {
  console.error('[sync] 配置文件格式不合法，需要包含 site / projects / tarotCards');
  process.exit(1);
}

const content = fs.readFileSync(SOURCE, 'utf-8');
const startMarker = 'export const defaultConfig: SiteConfig = ';
const endMarker = '\n};\n\nexport function loadConfig';
const start = content.indexOf(startMarker);
const end = content.indexOf(endMarker, start);

if (start === -1 || end === -1) {
  console.error('[sync] 未在 siteConfig.ts 中定位到 defaultConfig 区块');
  process.exit(1);
}

const json = JSON.stringify(config, null, 2);
const tail = content.slice(end + '\n};'.length);
const next = content.slice(0, start) + startMarker + json + ';' + tail;

fs.writeFileSync(SOURCE, next, 'utf-8');
console.log(`[sync] 已同步 ${input}`);
console.log(`[sync] 项目顺序：${config.projects.map((p) => p.id).join(' -> ')}`);
