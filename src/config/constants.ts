export const API_BASE_URL = import.meta.env.VITE_API_URL as string;

if (!API_BASE_URL) {
  throw new Error("VITE_API_URL não definida");
}

export const MAX_FILE_SIZE: number = 10 * 1024 * 1024; // 10MB

export const SPEECH_CONFIG = {
  lang: "pt-BR",
  rate: 1.0,
  pitch: 1.0,
} as const;
