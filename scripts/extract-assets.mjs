/**
 * 预构建脚本：将 siteConfig.ts 中的 base64 数据提取为独立文件
 * 放到 public/assets/extracted/ 目录，并将 siteConfig.ts 中的 base64 引用替换为文件路径
 * 
 * 注意：此脚本会直接修改 siteConfig.ts，在 CI 中是安全的（不会提交回去）
 * 在本地开发中不需要运行此脚本
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONFIG_FILE = path.join(ROOT, 'src/config/siteConfig.ts');
const OUTPUT_DIR = path.join(ROOT, 'public/assets/extracted');

// 确保输出目录存在
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

console.log('🔍 读取 siteConfig.ts ...');
let content = fs.readFileSync(CONFIG_FILE, 'utf-8');

const originalSize = Buffer.byteLength(content, 'utf-8');
console.log(`📦 原始文件大小: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);

if (originalSize < 1024 * 1024) {
  console.log('✅ 文件小于 1MB，无需提取，跳过。');
  process.exit(0);
}

// 匹配所有 base64 数据 URI
const base64Regex = /"(data:(image|video)\/([\w+.-]+);base64,([A-Za-z0-9+/=\r\n\s]+))"/g;

let count = 0;
const replacements = [];

let match;
while ((match = base64Regex.exec(content)) !== null) {
  const fullDataUri = match[1];
  const mediaType = match[2];
  const format = match[3];
  const base64Data = match[4].replace(/[\s\r\n]/g, '');
  
  // 生成文件名
  const hash = crypto.createHash('md5').update(base64Data).digest('hex').slice(0, 12);
  
  let ext = format;
  if (ext === 'jpeg') ext = 'jpg';
  if (ext === 'svg+xml') ext = 'svg';
  if (ext === 'quicktime') ext = 'mov';
  if (ext === 'x-matroska') ext = 'mkv';
  
  const filename = `${mediaType}-${hash}.${ext}`;
  const filePath = path.join(OUTPUT_DIR, filename);
  
  // 写入文件
  if (!fs.existsSync(filePath)) {
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);
    console.log(`  ✅ 提取: ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
  }
  
  // 使用绝对路径引用（对应 vite base: /personal-profile/）
  // public/ 目录中的文件在构建后位于 dist/ 根目录
  replacements.push({
    original: `"${fullDataUri}"`,
    replacement: `"/personal-profile/assets/extracted/${filename}"`,
    start: match.index,
    end: match.index + match[0].length
  });
  
  count++;
}

console.log(`\n📊 共找到 ${count} 个 base64 资源`);

if (count === 0) {
  console.log('✅ 无需处理。');
  process.exit(0);
}

// 从后往前替换
replacements.sort((a, b) => b.start - a.start);
for (const r of replacements) {
  content = content.slice(0, r.start) + r.replacement + content.slice(r.end);
}

// 写回配置文件
fs.writeFileSync(CONFIG_FILE, content, 'utf-8');

const newSize = Buffer.byteLength(content, 'utf-8');
console.log(`\n✨ 优化后文件大小: ${(newSize / 1024).toFixed(1)} KB`);
console.log(`💾 节省: ${((originalSize - newSize) / 1024 / 1024).toFixed(2)} MB`);
console.log('✅ 资源提取完成！构建产物将大幅缩小。');
