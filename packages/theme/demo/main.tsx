import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, GlobalStyles } from '../src/index';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultMode="light">
      <GlobalStyles />
      <App />
    </ThemeProvider>
  </StrictMode>
);
