import { useState } from "react";
import { parseTextToLines } from "../utils/textParser";

export const useReaderState = () => {
  const [pages, setPages] = useState<string[]>([]);
  const [bookTitle, setBookTitle] = useState("");

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [readingPageIndex, setReadingPageIndex] = useState(0);
  const [readingLineIndex, setReadingLineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleLineSkip = (dir: "next" | "prev") => {
    const lines = parseTextToLines(pages[readingPageIndex]);
    const next = dir === "next" ? readingLineIndex + 1 : readingLineIndex - 1;

    if (next >= 0 && next < lines.length) {
      setReadingLineIndex(next);
      // Se estava tocando, força reiniciar leitura na nova linha
      if (isPlaying) {
        setIsPlaying(false);
        setTimeout(() => setIsPlaying(true), 50);
      }
    } else if (dir === "next" && readingPageIndex + 1 < pages.length) {
      setReadingPageIndex(readingPageIndex + 1);
      setReadingLineIndex(0);
      setCurrentPageIndex(readingPageIndex + 1);
      // Se estava tocando, força reiniciar leitura na nova página
      if (isPlaying) {
        setIsPlaying(false);
        setTimeout(() => setIsPlaying(true), 50);
      }
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
      // Força reiniciar para garantir que inicia leitura
      setIsPlaying(false);
      setTimeout(() => setIsPlaying(true), 50);
    }
  };

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
  };
};
