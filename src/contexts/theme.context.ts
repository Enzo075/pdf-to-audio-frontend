import { createContext } from "react";

/**
 * Tipo do tema: apenas 'light' ou 'dark'
 */
export type Theme = "light" | "dark";

/**
 * O que o contexto expõe para os consumidores
 */
export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
}

/**
 * Contexto de tema - criado uma vez, compartilhado por Provider e hook
 */
export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined,
);
