import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, loadEnv} from 'vite';

import { execSync } from 'child_process';

// Vite 插件：提供 API 端点将配置写回 siteConfig.ts 文件并自动部署
function configPersistPlugin() {
  return {
    name: 'config-persist',
    configureServer(server: any) {
      // API: 保存配置到源文件
      server.middlewares.use('/api/save-config', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        let body = '';
        req.on('data', (chunk: string) => { body += chunk; });
        req.on('end', () => {
          try {
            const config = JSON.parse(body);
            const configFilePath = path.resolve(__dirname, 'src/config/siteConfig.ts');
            const fileContent = fs.readFileSync(configFilePath, 'utf-8');

            // 生成格式化的 JSON，然后转为 TS 对象风格
            const configJson = JSON.stringify(config, null, 2);

            const newContent = fileContent.replace(
              /export const defaultConfig: SiteConfig = \{[\s\S]*?\n\};/,
              `export const defaultConfig: SiteConfig = ${configJson};`
            );

            fs.writeFileSync(configFilePath, newContent, 'utf-8');

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
      });

      // API: 发布到 GitHub Pages（git commit + push 触发自动部署）
      server.middlewares.use('/api/deploy', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        try {
          const cwd = path.resolve(__dirname);
          execSync('git add -A', { cwd });
          execSync('git commit -m "update: 管理端配置更新" --allow-empty', { cwd });
          execSync('git push origin main', { cwd });

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, message: '已推送到 GitHub，自动部署中...' }));
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: err.message || err.toString() }));
        }
      });
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    // GitHub Pages 部署：使用仓库名作为 base 路径
    base: mode === 'production' ? '/personal-profile/' : '/',
    plugins: [react(), tailwindcss(), configPersistPlugin()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
