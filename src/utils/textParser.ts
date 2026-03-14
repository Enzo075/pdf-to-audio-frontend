// Abreviações que NÃO devem gerar quebra de linha após o ponto final.
const ABBREVIATIONS = ["Mr", "Ms", "Mrs", "Sr", "Sra", "Dr", "Prof"];

/**
 * Constrói a Regex dinamicamente a partir da lista de abreviações acima.
 *
 * 1. (?!<...)  -> Ignora o ponto se ele vier logo após uma abreviação
 * 2. \\.      -> Procura o caractere de ponto final.
 * 3. (?=...)   -> Só valida o ponto se o que vier depois for um espaço seguido
 *                 de letra maiúscula (início real de uma nova frase).
 *
 * Flag "gi": Diz que a busca é global (no texto todo) + "i" = case-insensitive.
 */
const buildLineBreakRegex = (): RegExp => {
  const abbrPattern = ABBREVIATIONS.join("|");
  return new RegExp(
    `(?<!(?:${abbrPattern}))\\.(?=\\s+[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ])`,
    "gi",
  );
};

const LINE_BREAK_REGEX = buildLineBreakRegex();

/**
 * Insere quebras de linha (\n) após sentenças,
 * ignorando abreviações citas acima.
 *
 * @param text - Texto bruto vindo da API/banco de dados.
 * @returns Texto formatado com quebras de linha após sentenças.
 */
export const formatTextWithLineBreaks = (text: string): string => {
  if (!text || typeof text !== "string") return "";
  return text.replace(LINE_BREAK_REGEX, ".\n");
};

/**
 * Converte uma página de texto em um array de linhas navegáveis.
 * Suporta tanto strings puras quanto objetos retornados por APIs legadas.
 *
 * @param text - Texto bruto da página (string ou tipo desconhecido da API).
 * @returns Array de linhas não-vazias prontas para leitura.
 */
export const parseTextToLines = (text: unknown): string[] => {
  if (!text) return [];

  let content = "";

  if (typeof text === "string") {
    content = text;
  } else if (typeof text === "object" && text !== null && "text" in text) {
    const textObject = text as { text: unknown };
    if (typeof textObject.text === "string") {
      content = textObject.text;
    }
  }

  if (!content || typeof content !== "string") {
    return [];
  }

  // Formata quebras por ponto final (respeitando abreviações).
  const formatted = formatTextWithLineBreaks(content);

  // Divide em linhas, remove espaços extras e filtra vazias.
  return formatted
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
};
