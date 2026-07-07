import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'galmuri/dist/galmuri.css';
import './index.css';
import { PALETTE } from './data/palette';
import App from './App.tsx';

// 팔레트를 CSS 변수로 주입 — 색의 단일 기준은 data/palette.ts 하나만 둔다
for (const [name, value] of Object.entries(PALETTE)) {
  document.documentElement.style.setProperty(`--c-${name}`, value);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
