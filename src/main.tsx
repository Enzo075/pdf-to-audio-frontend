import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './contexts/ThemeContext.tsx'
import { ReadingProvider } from './contexts/ReadingContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ReadingProvider>
        <App />
      </ReadingProvider>
    </ThemeProvider>
  </StrictMode>,
)