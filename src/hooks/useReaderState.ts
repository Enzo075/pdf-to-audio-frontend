import { useState, useEffect, useRef } from "react";
import { SPEECH_CONFIG } from "../config/constants";

export const useReaderState = () => {
  const [pages, setPages] = useState<string[]>([]);
  const [bookTitle, setBookTitle] = useState("");

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [readingPageIndex, setReadingPageIndex] = useState(0);
  const [readingLineIndex, setReadingLineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const indexRef = useRef(readingLineIndex);
  const pageRef = useRef(readingPageIndex);

  useEffect(() => {
    indexRef.current = readingLineIndex;
    pageRef.current = readingPageIndex;
  }, [readingLineIndex, readingPageIndex]);

  const getLines = (text: string) => {
    return text
      ? text.split(/(?<=[.!?])\s+|\n/).filter((l) => l.trim() !== "")
      : [];
  };

  const speak = (pIndex: number, lIndex: number) => {
    window.speechSynthesis.cancel();
    const lines = getLines(pages[pIndex]);

    if (!lines || lines.length === 0 || !lines[lIndex]) {
      if (pIndex + 1 < pages.length) {
        setReadingPageIndex(pIndex + 1);
        setReadingLineIndex(0);
        setCurrentPageIndex(pIndex + 1);
        speak(pIndex + 1, 0);
      } else {
        setIsPlaying(false);
      }
      return;
    }

    const utterance = new SpeechSynthesisUtterance(lines[lIndex]);
    utterance.lang = SPEECH_CONFIG.lang;
    utterance.rate = SPEECH_CONFIG.rate;

    utterance.onstart = () => {
      setReadingPageIndex(pIndex);
      setReadingLineIndex(lIndex);
    };

    utterance.onend = () => {
      if (window.speechSynthesis.speaking || isPlaying) {
        const lines = getLines(pages[pIndex]);
        if (lIndex + 1 < lines.length) {
          speak(pIndex, lIndex + 1);
        } else if (pIndex + 1 < pages.length) {
          setReadingPageIndex(pIndex + 1);
          setReadingLineIndex(0);
          setCurrentPageIndex(pIndex + 1);
          speak(pIndex + 1, 0);
        } else {
          setIsPlaying(false);
        }
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (isPlaying) {
      if (currentPageIndex !== pageRef.current) {
        setCurrentPageIndex(pageRef.current);
      }
      speak(pageRef.current, indexRef.current);
    } else {
      window.speechSynthesis.cancel();
    }
    return () => window.speechSynthesis.cancel();
  }, [isPlaying]);

  const handleLineSkip = (dir: "next" | "prev") => {
    const lines = getLines(pages[readingPageIndex]);
    const next = dir === "next" ? readingLineIndex + 1 : readingLineIndex - 1;

    if (next >= 0 && next < lines.length) {
      setReadingLineIndex(next);
      if (isPlaying) speak(readingPageIndex, next);
    } else if (dir === "next" && readingPageIndex + 1 < pages.length) {
      setReadingPageIndex(readingPageIndex + 1);
      setReadingLineIndex(0);
      setCurrentPageIndex(readingPageIndex + 1);
      if (isPlaying) speak(readingPageIndex + 1, 0);
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
    readingLineIndex === getLines(pages[readingPageIndex]).length - 1;

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
      setIsPlaying(true);
      speak(currentPageIndex, 0);
    }
  };

  const getTopButtonText = () => {
    if (isEndOfBook && currentPageIndex === pages.length - 1)
      return "Começar a leitura do início do PDF";
    return "Continuar leitura desta página";
  };

  const getTopButtonClasses = () => {
    const baseClasses =
      "animate-in fade-in slide-in-from-right-4 px-5 py-2 rounded-full text-white text-sm font-bold shadow-lg transition-all active:scale-95";

    if (isEndOfBook && currentPageIndex === pages.length - 1) {
      return `${baseClasses} bg-green-600 hover:bg-green-700 shadow-green-500/20`;
    }

    return `${baseClasses} bg-violet-600 hover:bg-violet-700 shadow-violet-500/20`;
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
    getTopButtonText,
    getTopButtonClasses,
  };
};
