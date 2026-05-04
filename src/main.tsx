import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './contexts/ThemeContext.tsx'
import { ReadingProvider } from './contexts/ReadingContext.tsx'
import { AuthProvider } from './contexts/AuthProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ReadingProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ReadingProvider>
    </ThemeProvider>
  </StrictMode>,
)