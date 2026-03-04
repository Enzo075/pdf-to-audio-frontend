import { createContext } from "react";

export type ReadingEngine = "browser" | "api";
export type TTSProvider = "openai" | "google" | "azure";

export type ApiKeyError = {
  message: string;
  id: number;
} | null;

export interface ReadingContextType {
  readingEngine: ReadingEngine;
  setReadingEngine: (engine: ReadingEngine) => void;
  apiProvider: TTSProvider;
  setApiProvider: (provider: TTSProvider) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  apiKeyError: ApiKeyError;
  setApiKeyError: (error: ApiKeyError) => void;
}

export const ReadingContext = createContext<ReadingContextType | undefined>(
  undefined,
);
