import { useState, useMemo } from "react";
import { parseTextToLines } from "../utils/textParser";

export const useReaderState = () => {
  const [pages, setPages] = useState<string[]>([]);
  const [bookTitle, setBookTitle] = useState("");

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [readingPageIndex, setReadingPageIndex] = useState(0);
  const [readingLineIndex, setReadingLineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleLineSkip = (dir: "next" | "prev") => {
    const currentLines = parseTextToLines(pages[readingPageIndex]);

    // ============================
    // AVANÇAR
    // ============================
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

    // ============================
    // VOLTAR
    // ============================
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

    // Reinicia áudio se estiver tocando
    if (isPlaying) {
      setIsPlaying(false);
      setTimeout(() => setIsPlaying(true), 50);
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
    setIsPlaying(false);
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
      setIsPlaying(false);
      window.speechSynthesis.cancel();
    } else {
      window.speechSynthesis.cancel();
      setReadingPageIndex(currentPageIndex);
      setReadingLineIndex(0);
      setIsPlaying(false);
      setTimeout(() => setIsPlaying(true), 50);
    }
  };

  // ==================== FLAGS DE NAVEGAÇÃO ====================

  // Flags de navegação de página (baseadas em currentPageIndex - navegação visual)
  const canGoToPrevPage = useMemo(() => {
    return currentPageIndex > 0;
  }, [currentPageIndex]);

  const canGoToNextPage = useMemo(() => {
    return currentPageIndex < pages.length - 1;
  }, [currentPageIndex, pages.length]);

  // Flags de navegação de linha (baseadas em readingPageIndex/readingLineIndex - áudio)
  // Com navegação contínua entre páginas
  const canGoToPrevLine = useMemo(() => {
    // Se não estiver na primeira linha da página atual, pode voltar
    if (readingLineIndex > 0) {
      return true;
    }

    // Está na primeira linha (índice 0) - verificar se existe página anterior com texto
    for (let i = readingPageIndex - 1; i >= 0; i--) {
      const lines = parseTextToLines(pages[i]);
      if (lines.length > 0) {
        // Existe página anterior com texto
        return true;
      }
    }

    // Não existe página anterior com texto
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
        // Existe próxima página com texto
        return true;
      }
    }

    // Não existe próxima página com texto
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
    setIsPlaying,
    handleLineSkip,
    handlePageSkip,
    handleLineSelection,
    handleTopButton,
    isUserAway,
    isEndOfBook,
    // Flags de navegação
    canGoToPrevPage,
    canGoToNextPage,
    canGoToPrevLine,
    canGoToNextLine,
  };
};
