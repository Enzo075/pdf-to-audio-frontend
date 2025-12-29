import React, { useState, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

interface PDFInfo {
  Title?: string;
  Author?: string;
}

interface PDFResult {
  pages: string[];
  text: string;
  info?: PDFInfo;
}

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  disabled: boolean;
  isDarkMode: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const getApiBaseUrl = (): string => {
  try {
    const env = (import.meta as unknown as { env: Record<string, string> }).env;
    return env?.VITE_API_URL || "https://pdf-to-audio-backend-6flw.onrender.com";
  } catch {
    return "https://pdf-to-audio-backend-6flw.onrender.com";
  }
};
const API_BASE_URL = getApiBaseUrl();

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center p-10 gap-6 animate-in fade-in duration-1000">
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 rounded-full border-4 border-t-violet-600 border-r-transparent border-b-violet-600 border-l-transparent animate-spin duration-[2000ms]"></div>
      <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-purple-400 border-b-transparent border-l-purple-400 animate-spin-reverse"></div>
      <div className="absolute inset-6 bg-violet-600 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.6)] animate-pulse"></div>
    </div>
    <div className="text-center">
      <h3 className="text-violet-600 font-black text-xl tracking-tighter uppercase">Processando PDF...</h3>
      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Extraindo texto e preparando a leitura</p>
    </div>
  </div>
);

export default function App() {
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [bookTitle, setBookTitle] = useState<string>('');

  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const [readingPageIndex, setReadingPageIndex] = useState(0);
  const [readingLineIndex, setReadingLineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const lastTap = useRef<number>(0);
  const indexRef = useRef(readingLineIndex);
  const pageRef = useRef(readingPageIndex);

  useEffect(() => {
    indexRef.current = readingLineIndex;
    pageRef.current = readingPageIndex;
  }, [readingLineIndex, readingPageIndex]);

  const extractTextFromPDF = async (file: File): Promise<PDFResult> => {
    const formData = new FormData();
    formData.append("pdf", file);
    const response = await axios.post(`${API_BASE_URL}/api/pdf/extract`, formData);
    return response.data;
  };

  const getLines = (text: string) => text ? text.split(/(?<=[.!?])\s+|\n/).filter((l) => l.trim() !== '') : [];

  const speak = (pIndex: number, lIndex: number) => {
    window.speechSynthesis.cancel();
    const currentLines = getLines(pages[pIndex]);

    if (!currentLines || currentLines.length === 0 || !currentLines[lIndex]) {
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

    const utterance = new SpeechSynthesisUtterance(currentLines[lIndex]);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;

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
      speak(pageRef.current, indexRef.current);
    } else {
      window.speechSynthesis.cancel();
    }
    return () => window.speechSynthesis.cancel();
  }, [isPlaying]);

  const handleUpload = async (file: File) => {
    setLoading(true);
    try {
      const result = await extractTextFromPDF(file);
      const pagesData = Array.isArray(result.pages) ? result.pages : [result.text];

      const title = result.info?.Title || file.name.replace('.pdf', '');
      setBookTitle(title);

      setPages(pagesData);
      setCurrentPageIndex(0);
      setReadingPageIndex(0);
      setReadingLineIndex(0);
    } catch (error) {
      console.error("Erro no processamento Klai:", error);
      alert("Erro ao processar o PDF.");
    } finally {
      setLoading(false);
    }
  };

  const handleLineSkip = (direction: 'next' | 'prev') => {
    const currentLines = getLines(pages[readingPageIndex]);
    const newL = direction === 'next' ? readingLineIndex + 1 : readingLineIndex - 1;

    if (newL >= 0 && newL < currentLines.length) {
      setReadingLineIndex(newL);
      if (isPlaying) speak(readingPageIndex, newL);
    } else if (direction === 'next' && readingPageIndex + 1 < pages.length) {
      setReadingPageIndex(readingPageIndex + 1);
      setReadingLineIndex(0);
      setCurrentPageIndex(readingPageIndex + 1);
      if (isPlaying) speak(readingPageIndex + 1, 0);
    }
  };

  const handlePageSkip = (direction: 'next' | 'prev') => {
    const newP = direction === 'next' ? currentPageIndex + 1 : currentPageIndex - 1;
    if (newP >= 0 && newP < pages.length) {
      setCurrentPageIndex(newP);
    }
  };

  const handleLineSelection = (index: number) => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setReadingPageIndex(currentPageIndex);
    setReadingLineIndex(index);
  };

  const handleTouch = (index: number) => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      handleLineSelection(index);
    }
    lastTap.current = now;
  };

  const jumpToPage = (val: string) => {
    const p = parseInt(val) - 1;
    if (!isNaN(p) && p >= 0 && p < pages.length) {
      setCurrentPageIndex(p);
    }
  };

  const isUserAway = currentPageIndex !== readingPageIndex;
  const isEndOfBook = readingPageIndex === pages.length - 1 && readingLineIndex === (getLines(pages[readingPageIndex]).length - 1);

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
    if (isEndOfBook && currentPageIndex === pages.length - 1) return "Começar a leitura do início do PDF";
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


  const isDarkMode = theme === 'dark';

  return (
    <div className={`min-h-screen w-full transition-colors duration-500 flex flex-col items-center py-6 px-4 selection:bg-violet-400 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>

      <div className="w-full max-w-5xl flex justify-between items-center mb-8 h-12">
        {pages.length > 0 && !loading && (
          <button onClick={() => { setPages([]); window.speechSynthesis.cancel(); }} className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-sm text-sm font-bold transition-all border ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" /></svg>
            Trocar PDF
          </button>
        )}

        {pages.length > 0 && !loading && (isUserAway || isEndOfBook) && (
          <button
            onClick={handleTopButton}
            className={getTopButtonClasses()}
          >
            {getTopButtonText()}
          </button>
        )}
      </div>

      {pages.length === 0 && !loading && (
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-black text-violet-600 tracking-tighter">KLAI<span className={isDarkMode ? 'text-slate-700' : 'text-slate-300'}>READER</span></h1>
          <p className="text-slate-400 font-medium uppercase text-[10px] tracking-[0.4em]">Portfolio Academic System</p>
        </header>
      )}

      <main className="w-full max-w-4xl flex flex-col items-center flex-1">
        {loading ? (
          <div className="mt-20"><LoadingSpinner /></div>
        ) : pages.length === 0 ? (
          <div className="w-full max-w-md"><InputArea onFileSelect={handleUpload} disabled={loading} isDarkMode={isDarkMode} /></div>
        ) : (
          <div className="w-full flex flex-col items-center gap-6 pb-40">
            <div className={`relative w-full aspect-[3/4] md:aspect-[4/5] shadow-2xl rounded-sm border transition-colors duration-500 p-8 md:p-16 flex flex-col justify-between overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#fbfaf8] border-slate-200'}`}>
              <div className="flex-1 overflow-y-auto scrollbar-hide pr-2">
                {getLines(pages[currentPageIndex]).map((line, index) => {
                  const isReading = (index === readingLineIndex && currentPageIndex === readingPageIndex);
                  return (
                    <span
                      key={index}
                      onDoubleClick={() => handleLineSelection(index)}
                      onTouchEnd={() => handleTouch(index)}
                      className={`font-serif text-xl md:text-2xl leading-relaxed block mb-4 transition-all duration-300 rounded px-1 cursor-pointer select-none ${isReading ? 'bg-yellow-400 text-black shadow-md' : isDarkMode ? 'text-slate-300 opacity-80' : 'text-slate-800 opacity-90'}`}
                    >
                      {line}
                    </span>
                  );
                })}
              </div>
              <div className="mt-6 pt-4 border-t border-slate-700/20 flex justify-between items-center text-[10px] text-slate-500 font-sans tracking-widest uppercase">
                <span className="truncate max-w-[60%] font-bold">{bookTitle}</span>
                <span>Página {currentPageIndex + 1} de {pages.length}</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Página</span>
                <input
                  type="number"
                  value={currentPageIndex + 1}
                  onChange={(e) => jumpToPage(e.target.value)}
                  className={`w-16 text-center py-1 rounded-lg font-bold border outline-none focus:ring-2 focus:ring-violet-500 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700'}`}
                />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">de {pages.length}</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {pages.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full z-50 p-6 pointer-events-none">
          <div className={`max-w-3xl mx-auto border shadow-2xl rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between pointer-events-auto gap-4 transition-colors duration-500 ${isDarkMode ? 'bg-slate-900/95 border-slate-800 backdrop-blur-xl' : 'bg-white/95 border-white/20 backdrop-blur-xl'}`}>

            <div className="flex items-center gap-6 w-full md:w-auto">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Klai Voice</p>
                  <p className="text-[9px] text-slate-400 italic">Pág {readingPageIndex + 1} • Linha {readingLineIndex + 1}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-6">
              <button onClick={() => handlePageSkip('prev')} className="text-xl p-2 text-slate-400 hover:text-violet-600 transition-colors" title="Página Anterior">≪</button>
              <button onClick={() => handleLineSkip('prev')} className="text-xl p-2 text-slate-400 hover:text-violet-600 transition-colors" title="Linha Anterior">{'<'}</button>
              <button onClick={() => setIsPlaying(!isPlaying)} className="group p-6 bg-violet-600 hover:bg-violet-700 rounded-full transition-all shadow-xl shadow-violet-500/20 active:scale-90">
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 9v6m4-6v6" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
                )}
              </button>
              <button onClick={() => handleLineSkip('next')} className="text-xl p-2 text-slate-400 hover:text-violet-600 transition-colors" title="Próxima Linha">{'>'}</button>
              <button onClick={() => handlePageSkip('next')} className="text-xl p-2 text-slate-400 hover:text-violet-600 transition-colors" title="Próxima Página">≫</button>
            </div>

            <div className="flex justify-end min-w-[120px]">
              <button
                onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
                className={`p-3 rounded-2xl transition-all text-xl shadow-sm border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-yellow-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}
                title="Mudar Tema"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className={`mt-auto pt-8 text-[10px] uppercase tracking-widest text-center transition-colors ${isDarkMode ? 'text-slate-700' : 'text-slate-300'}`}>
        &copy; 2025 Klai - Projeto Desenvolvido para portfolio
      </footer>
    </div>
  );
}

const InputArea = ({ onFileSelect, disabled, isDarkMode }: DropzoneProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => onFileSelect(acceptedFiles[0]),
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    disabled
  });

  return (
    <div {...getRootProps()} className={`relative group w-full h-80 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all duration-500 cursor-pointer overflow-hidden ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] shadow-xl'} ${isDragActive ? 'border-violet-400 bg-violet-500/10' : isDarkMode ? 'border-slate-800 bg-slate-900/50 hover:border-violet-500' : 'border-slate-200 bg-white hover:border-violet-500'}`}>
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        <div className="p-5 rounded-full bg-violet-100 text-violet-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg></div>
        <div className="text-center"><p className={`text-lg font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Klai Uploader</p><p className="text-sm text-slate-400 mt-1">Solte seu PDF acadêmico aqui</p></div>
      </div>
    </div>
  );
};