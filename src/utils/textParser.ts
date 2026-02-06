/**
 * Quebra texto em sentenças/linhas navegáveis
 * @param text - Texto bruto da página
 * @returns Array de linhas não-vazias
 */
export const parseTextToLines = (text: string): string[] => {
  return text
    ? text.split(/(?<=[.!?])\s+|\n/).filter((l) => l.trim() !== "")
    : [];
};
