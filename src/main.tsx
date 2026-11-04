import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// 旧的管理端 hash 路由重定向到独立管理端页面 admin.html
if (window.location.hash.startsWith('#/admin')) {
  window.location.replace(`${import.meta.env.BASE_URL}admin.html`);
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <HashRouter>
        <Routes>
          <Route path="/" element={<App />} />
        </Routes>
      </HashRouter>
    </StrictMode>,
  );
}
