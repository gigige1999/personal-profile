import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import { handleConfigApi } from './server/config-store.mjs';
import { defaultConfig } from './src/config/siteConfig';

// 开发服务器挂载与线上完全相同的配置 API，保证本地调试和线上行为一致
function configApiPlugin() {
  return {
    name: 'site-config-api',
    configureServer(server: any) {
      server.middlewares.use('/api/site-config', (req: any, res: any) => {
        void handleConfigApi(req, res);
      });
    },
  };
}

// 构建时导出一份默认配置，供配置服务首次启动时作为初始数据
function defaultConfigSeedPlugin() {
  return {
    name: 'default-config-seed',
    closeBundle() {
      const out = path.resolve(__dirname, 'dist/site-config.default.json');
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, JSON.stringify(defaultConfig), 'utf-8');
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    // GitHub Pages 部署：使用仓库名作为 base 路径
    base: mode === 'production' ? '/personal-profile/' : '/',
    plugins: [react(), tailwindcss(), configApiPlugin(), defaultConfigSeedPlugin()],
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          admin: path.resolve(__dirname, 'admin.html'),
        },
      },
    },
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
