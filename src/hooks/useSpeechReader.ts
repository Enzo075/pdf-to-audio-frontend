import { useEffect, useRef } from "react";
import { SPEECH_CONFIG } from "../config/constants";
import { parseTextToLines } from "../utils/textParser";
import { useReadingEngine } from "./useReadingEngine";
import type { ApiKeyError } from "../contexts/reading.context";

interface UseSpeechReaderProps {
  pages: string[];
  readingPageIndex: number;
  readingLineIndex: number;
  currentPageIndex: number;
  isPlaying: boolean;
  playbackRate: number;
  onLineChange: (pageIndex: number, lineIndex: number) => void;
  onPageChange: (pageIndex: number) => void;
  onFinish: () => void;
}
const toUserMessage = (error: unknown, status?: number): string => {
  if (status === 401 || status === 403) return "Key API inválida";
  if (error instanceof DOMException && error.name === "AbortError") return "";
  return "Erro ao gerar áudio";
};

export const useSpeechReader = ({
  pages,
  readingPageIndex,
  readingLineIndex,
  currentPageIndex,
  isPlaying,
  playbackRate,
  onLineChange,
  onPageChange,
  onFinish,
}: UseSpeechReaderProps) => {
  const { readingEngine, apiProvider, apiKey, setApiKeyError } =
    useReadingEngine();

  const pageRef = useRef(readingPageIndex);
  const lineRef = useRef(readingLineIndex);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const executionIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const errorIdRef = useRef(0);

  const makeApiKeyError = (message: string): ApiKeyError => ({
    message,
    id: ++errorIdRef.current,
  });

  const cleanup = () => {
    executionIdRef.current += 1;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    window.speechSynthesis.cancel();
  };

  const speakWithBrowser = (pIndex: number, lIndex: number, execId: number) => {
    if (execId !== executionIdRef.current) return;

    window.speechSynthesis.cancel();
    const lines = parseTextToLines(pages[pIndex]);

    if (!lines || lines.length === 0 || !lines[lIndex]) {
      if (pIndex + 1 < pages.length) {
        const nextPage = pIndex + 1;
        onPageChange(nextPage);
        onLineChange(nextPage, 0);
        speakWithBrowser(nextPage, 0, execId);
      } else {
        onFinish();
      }
      return;
    }

    const utterance = new SpeechSynthesisUtterance(lines[lIndex]);
    utterance.lang = SPEECH_CONFIG.lang;
    utterance.rate = playbackRate;

    utterance.onstart = () => {
      onLineChange(pIndex, lIndex);
    };

    utterance.onend = () => {
      if (execId !== executionIdRef.current) return;
      const currentLines = parseTextToLines(pages[pIndex]);
      if (lIndex + 1 < currentLines.length) {
        speakWithBrowser(pIndex, lIndex + 1, execId);
      } else if (pIndex + 1 < pages.length) {
        const nextPage = pIndex + 1;
        onPageChange(nextPage);
        onLineChange(nextPage, 0);
        speakWithBrowser(nextPage, 0, execId);
      } else {
        onFinish();
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const speakWithAPI = async (
    pIndex: number,
    lIndex: number,
    execId: number,
  ) => {
    if (execId !== executionIdRef.current) return;

    const lines = parseTextToLines(pages[pIndex]);

    if (!lines || lines.length === 0 || !lines[lIndex]) {
      if (pIndex + 1 < pages.length) {
        const nextPage = pIndex + 1;
        onPageChange(nextPage);
        onLineChange(nextPage, 0);
        speakWithAPI(nextPage, 0, execId);
      } else {
        onFinish();
      }
      return;
    }

    if (!apiKey || apiKey.trim() === "") {
      setApiKeyError(makeApiKeyError("Key API inválida"));
      onFinish();
      return;
    }

    try {
      onLineChange(pIndex, lIndex);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const response = await fetch("/api/tts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: lines[lIndex],
          playbackRate,
          provider: apiProvider,
          apiKey,
        }),
        signal: controller.signal,
      });

      if (execId !== executionIdRef.current) return;

      if (!response.ok) {
        setApiKeyError(makeApiKeyError(toUserMessage(null, response.status)));
        onFinish();
        return;
      }

      const audioBlob = await response.blob();
      if (execId !== executionIdRef.current) return;

      const audioUrl = URL.createObjectURL(audioBlob);
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = audioUrl;

      const audio = new Audio(audioUrl);
      audio.playbackRate = playbackRate;
      audioRef.current = audio;

      audio.onended = () => {
        if (execId !== executionIdRef.current) return;
        const currentLines = parseTextToLines(pages[pIndex]);
        if (lIndex + 1 < currentLines.length) {
          speakWithAPI(pIndex, lIndex + 1, execId);
        } else if (pIndex + 1 < pages.length) {
          const nextPage = pIndex + 1;
          onPageChange(nextPage);
          onLineChange(nextPage, 0);
          speakWithAPI(nextPage, 0, execId);
        } else {
          onFinish();
        }
      };

      audio.onerror = () => {
        if (execId !== executionIdRef.current) return;
        console.error("Erro ao reproduzir áudio");
        onFinish();
      };

      await audio.play();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      if (execId !== executionIdRef.current) return;

      console.error("Erro TTS:", error);
      setApiKeyError(makeApiKeyError(toUserMessage(error)));
      onFinish();
    }
  };

  const speak = (pIndex: number, lIndex: number, execId: number) => {
    const useAPI = readingEngine === "api" && apiProvider && apiKey?.trim();
    if (useAPI) {
      speakWithAPI(pIndex, lIndex, execId);
    } else {
      speakWithBrowser(pIndex, lIndex, execId);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      cleanup();
      const execId = executionIdRef.current;
      if (pageRef.current !== currentPageIndex) onPageChange(pageRef.current);
      speak(pageRef.current, lineRef.current, execId);
    } else {
      cleanup();
    }
    return () => {
      cleanup();
    };
  }, [isPlaying, playbackRate, readingEngine]);

  useEffect(() => {
    pageRef.current = readingPageIndex;
    lineRef.current = readingLineIndex;

    if (isPlaying) {
      cleanup();
      const execId = executionIdRef.current;
      speak(readingPageIndex, readingLineIndex, execId);
    }
  }, [readingPageIndex, readingLineIndex]);

  return { speak };
};
