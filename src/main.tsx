import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import SelectMusic from './SelectMusic.tsx';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SelectMusic />
  </StrictMode>,
);
