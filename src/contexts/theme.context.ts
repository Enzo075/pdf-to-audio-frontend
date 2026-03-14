import { createContext } from "react";

export type Theme = "light" | "dark";

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined,
);
