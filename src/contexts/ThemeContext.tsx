import { useState } from 'react';
import type { ReactNode } from 'react';
import { ThemeContext } from './theme.context';
import type { Theme } from './theme.context';

/**
 * Provider que envolve a aplicação
 * Gerencia o estado do tema e expõe para toda árvore de componentes
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light');
    const isDarkMode = theme === 'dark';

    return (
        <ThemeContext.Provider value={{ theme, setTheme, isDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
}