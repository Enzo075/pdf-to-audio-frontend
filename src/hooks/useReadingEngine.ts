import { useContext } from "react";
import { ReadingContext } from "../contexts/reading.context";

/**
 * Hook customizado para consumir a engine de leitura
 * Lança erro se usado fora do ReadingProvider
 */
export function useReadingEngine() {
  const context = useContext(ReadingContext);

  if (context === undefined) {
    throw new Error(
      "useReadingEngine deve ser usado dentro de um ReadingProvider",
    );
  }

  return context;
}
