import { useContext } from "react";
import { ThemeContext } from "../contexts/theme.context";

/**
 * Hook customizado para consumir o tema
 * Lança erro se usado fora do ThemeProvider (proteção)
 */
export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme deve ser usado dentro de um ThemeProvider");
  }

  return context;
}
