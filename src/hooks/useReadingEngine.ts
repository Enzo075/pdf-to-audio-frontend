import { useContext } from "react";
import { ReadingContext } from "../contexts/reading.context";

export function useReadingEngine() {
  const context = useContext(ReadingContext);

  if (context === undefined) {
    throw new Error(
      "useReadingEngine deve ser usado dentro de um ReadingProvider",
    );
  }

  return context;
}
