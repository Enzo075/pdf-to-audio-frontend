import { useState, useRef, useMemo } from "react";
import { parseTextToLines } from "../utils/textParser";

export const useReaderState = () => {
  const [pages, setPages] = useState<string[]>([]);
  const [bookTitle, setBookTitle] = useState("");

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [readingPageIndex, setReadingPageIndex] = useState(0);
  const [readingLineIndex, setReadingLineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const onPlayStartCallbacks = useRef<Set<() => void>>(new Set());

  const registerOnPlayStart = (cb: () => void) => {
    onPlayStartCallbacks.current.add(cb);
    return () => onPlayStartCallbacks.current.delete(cb);
  };

  const startPlaying = () => {
    onPlayStartCallbacks.current.forEach((cb) => cb());
    setIsPlaying(true);
  };

  const stopPlaying = () => {
    setIsPlaying(false);
  };

  const handleLineSkip = (dir: "next" | "prev") => {
    const currentLines = parseTextToLines(pages[readingPageIndex]);

    if (dir === "next") {
      const nextLine = readingLineIndex + 1;

      // Ainda há linha na página atual
      if (nextLine < currentLines.length) {
        setReadingLineIndex(nextLine);
      } else {
        // Procurar próxima página com texto
        for (let i = readingPageIndex + 1; i < pages.length; i++) {
          const nextLines = parseTextToLines(pages[i]);
          if (nextLines.length > 0) {
            setReadingPageIndex(i);
            setReadingLineIndex(0);
            setCurrentPageIndex(i);
            break;
          }
        }
      }
    }

    if (dir === "prev") {
      const prevLine = readingLineIndex - 1;

      // Ainda há linha na página atual
      if (prevLine >= 0) {
        setReadingLineIndex(prevLine);
      } else {
        // Procurar página anterior com texto
        for (let i = readingPageIndex - 1; i >= 0; i--) {
          const prevLines = parseTextToLines(pages[i]);
          if (prevLines.length > 0) {
            setReadingPageIndex(i);
            setReadingLineIndex(prevLines.length - 1);
            setCurrentPageIndex(i);
            break;
          }
        }
      }
    }

    if (isPlaying) {
      stopPlaying();
      setTimeout(() => startPlaying(), 50);
    }
  };

  const handlePageSkip = (dir: "next" | "prev") => {
    const next = dir === "next" ? currentPageIndex + 1 : currentPageIndex - 1;
    if (next >= 0 && next < pages.length) {
      setCurrentPageIndex(next);
    }
  };

  const handleLineSelection = (index: number) => {
    window.speechSynthesis.cancel();
    stopPlaying();
    setReadingPageIndex(currentPageIndex);
    setReadingLineIndex(index);
  };

  const isUserAway = currentPageIndex !== readingPageIndex;
  const isEndOfBook =
    readingPageIndex === pages.length - 1 &&
    readingLineIndex === parseTextToLines(pages[readingPageIndex]).length - 1;

  const handleTopButton = () => {
    if (isEndOfBook && currentPageIndex === pages.length - 1) {
      setCurrentPageIndex(0);
      setReadingPageIndex(0);
      setReadingLineIndex(0);
      stopPlaying();
      window.speechSynthesis.cancel();
    } else {
      window.speechSynthesis.cancel();
      setReadingPageIndex(currentPageIndex);
      setReadingLineIndex(0);
      stopPlaying();
      setTimeout(() => startPlaying(), 50);
    }
  };

  const canGoToPrevPage = useMemo(() => {
    return currentPageIndex > 0;
  }, [currentPageIndex]);

  const canGoToNextPage = useMemo(() => {
    return currentPageIndex < pages.length - 1;
  }, [currentPageIndex, pages.length]);

  const canGoToPrevLine = useMemo(() => {
    // Se não estiver na primeira linha da página atual, pode voltar
    if (readingLineIndex > 0) {
      return true;
    }

    // Está na primeira linha (índice 0) - verificar se existe página anterior com texto
    for (let i = readingPageIndex - 1; i >= 0; i--) {
      const lines = parseTextToLines(pages[i]);
      if (lines.length > 0) {
        return true;
      }
    }

    return false;
  }, [readingPageIndex, readingLineIndex, pages]);

  const canGoToNextLine = useMemo(() => {
    const currentLines = parseTextToLines(pages[readingPageIndex]);

    // Se não estiver na última linha da página atual, pode avançar
    if (readingLineIndex < currentLines.length - 1) {
      return true;
    }

    // Está na última linha - verificar se existe próxima página com texto
    for (let i = readingPageIndex + 1; i < pages.length; i++) {
      const lines = parseTextToLines(pages[i]);
      if (lines.length > 0) {
        return true;
      }
    }

    return false;
  }, [readingPageIndex, readingLineIndex, pages]);

  return {
    pages,
    setPages,
    bookTitle,
    setBookTitle,
    currentPageIndex,
    setCurrentPageIndex,
    setReadingPageIndex,
    setReadingLineIndex,
    readingPageIndex,
    readingLineIndex,
    isPlaying,
    startPlaying,
    stopPlaying,
    registerOnPlayStart,
    handleLineSkip,
    handlePageSkip,
    handleLineSelection,
    handleTopButton,
    isUserAway,
    isEndOfBook,
    canGoToPrevPage,
    canGoToNextPage,
    canGoToPrevLine,
    canGoToNextLine,
  };
};
