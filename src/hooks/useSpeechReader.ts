import { useEffect, useRef } from "react";
import { SPEECH_CONFIG } from "../config/constants";
import { parseTextToLines } from "../utils/textParser";

interface UseSpeechReaderProps {
  pages: string[];
  readingPageIndex: number;
  readingLineIndex: number;
  currentPageIndex: number;
  isPlaying: boolean;
  onLineChange: (pageIndex: number, lineIndex: number) => void;
  onPageChange: (pageIndex: number) => void;
  onFinish: () => void;
}

/**
 * Hook especializado em controle de leitura por voz (Web Speech API)
 * Responsabilidade: executar áudio e notificar progresso
 */
export const useSpeechReader = ({
  pages,
  readingPageIndex,
  readingLineIndex,
  currentPageIndex,
  isPlaying,
  onLineChange,
  onPageChange,
  onFinish,
}: UseSpeechReaderProps) => {
  const pageRef = useRef(readingPageIndex);
  const lineRef = useRef(readingLineIndex);

  useEffect(() => {
    pageRef.current = readingPageIndex;
    lineRef.current = readingLineIndex;
  }, [readingPageIndex, readingLineIndex]);

  const speak = (pIndex: number, lIndex: number) => {
    window.speechSynthesis.cancel();
    const lines = parseTextToLines(pages[pIndex]);

    if (!lines || lines.length === 0 || !lines[lIndex]) {
      if (pIndex + 1 < pages.length) {
        const nextPage = pIndex + 1;
        onPageChange(nextPage);
        onLineChange(nextPage, 0);
        speak(nextPage, 0);
      } else {
        onFinish();
      }
      return;
    }

    const utterance = new SpeechSynthesisUtterance(lines[lIndex]);
    utterance.lang = SPEECH_CONFIG.lang;
    utterance.rate = SPEECH_CONFIG.rate;

    utterance.onstart = () => {
      onLineChange(pIndex, lIndex);
    };

    utterance.onend = () => {
      if (window.speechSynthesis.speaking || isPlaying) {
        const lines = parseTextToLines(pages[pIndex]);
        if (lIndex + 1 < lines.length) {
          speak(pIndex, lIndex + 1);
        } else if (pIndex + 1 < pages.length) {
          const nextPage = pIndex + 1;
          onPageChange(nextPage);
          onLineChange(nextPage, 0);
          speak(nextPage, 0);
        } else {
          onFinish();
        }
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (isPlaying) {
      // Sincroniza currentPage com readingPage ao dar play
      if (pageRef.current !== currentPageIndex) {
        onPageChange(pageRef.current);
      }
      speak(pageRef.current, lineRef.current);
    } else {
      window.speechSynthesis.cancel();
    }
    return () => window.speechSynthesis.cancel();
  }, [isPlaying]);

  return { speak };
};
