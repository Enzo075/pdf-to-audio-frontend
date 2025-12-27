// Arquivo: src/App.tsx - Implementação da Ideia 9: Navegação e Retomada Inteligente
import React, { useState, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

// --- CONFIGURAÇÕES INTEGRADAS ---
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const getApiBaseUrl = (): string => {
  try {
    const env = (import.meta as unknown as { env: Record<string, string> }).env;
    return env?.VITE_API_URL || "https://pdf-to-audio-backend-6flw.onrender.com";
  } catch {
    return "https://pdf-to-audio-backend-6flw.onrender.com";
  }
};

const API_BASE_URL = getApiBaseUrl();

// --- SERVIÇOS ---
const extractTextFromPDF = async (file: File) => {
  const formData = new FormData();
  formData.append("pdf", file);
  const response = await axios.post(`${API_BASE_URL}/api/pdf/extract`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// --- COMPONENTES INTERNOS ---

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
    <style>{`
      @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
      .animate-spin-reverse { animation: spin-reverse 1s linear infinite; }
    `}</style>
  </div>
);

const InputArea = ({ onFileSelect, disabled }: { onFileSelect: (f: File) => void, disabled: boolean }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => onFileSelect(acceptedFiles[0]),
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    disabled
  });

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div {...getRootProps()} className={`relative group w-full max-w-md h-72 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all duration-500 cursor-pointer overflow-hidden bg-white ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] shadow-xl'} ${isDragActive ? 'border-violet-400 bg-violet-50' : 'border-slate-200 hover:border-violet-500'}`}>
        <input {...getInputProps()} />
        <div className="z-10 flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-violet-100 text-violet-600 transition-transform group-hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          </div>
          <div className="text-center px-4">
            <p className="text-lg font-bold text-slate-700">Klai Uploader</p>
            <p className="text-sm text-slate-400 mt-1">Arraste seu PDF ou clique aqui</p>
          </div>
        </div>
      </div>
      <p className="mt-6 text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">PDF Máximo 10MB</p>
    </div>
  );
};

const AudioPlayer = ({
  lines,
  onLineChange,
  currentLineIndex,
  isPlaying,
  setIsPlaying,
  isUserOnDifferentPage,
  onResumeFromThisPage,
  onResumeFromSavedPosition
}: {
  lines: string[],
  onLineChange: (i: number) => void,
  currentLineIndex: number,
  isPlaying: boolean,
  setIsPlaying: (p: boolean) => void,
  isUserOnDifferentPage: boolean,
  onResumeFromThisPage: () => void,
  onResumeFromSavedPosition: () => void
}) => {
  const indexRef = useRef(currentLineIndex);

  useEffect(() => {
    indexRef.current = currentLineIndex;
  }, [currentLineIndex]);

  const speak = (index: number) => {
    if (index < 0 || index >= lines.length) {
      setIsPlaying(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(lines[index]);
    utterance.lang = 'pt-BR';
    utterance.onstart = () => onLineChange(index);
    utterance.onend = () => {
      if (isPlaying && index + 1 < lines.length) {
        speak(index + 1);
      } else {
        setIsPlaying(false);
      }
    };
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (isPlaying) {
      speak(indexRef.current);
    } else {
      window.speechSynthesis.cancel();
    }
  }, [isPlaying]);

  const skipLine = (direction: 'next' | 'prev') => {
    const wasPlaying = isPlaying;
    setIsPlaying(false);
    window.speechSynthesis.cancel();
    const newIndex = direction === 'next'
      ? Math.min(lines.length - 1, currentLineIndex + 1)
      : Math.max(0, currentLineIndex - 1);
    onLineChange(newIndex);
    setTimeout(() => { if (wasPlaying) setIsPlaying(true); }, 300);
  };

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 p-6 pointer-events-none">
      <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between pointer-events-auto gap-4">
        <div className="flex items-center gap-3 pl-2">
          <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
          <span className="hidden lg:inline text-[10px] font-bold text-slate-400 uppercase tracking-widest">Klai Voice</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button onClick={() => skipLine('prev')} disabled={currentLineIndex === 0} className="p-2 text-slate-400 hover:text-violet-600 disabled:opacity-20 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M20 19l-7-7 7-7" /></svg>
          </button>

          {/* Botão de Play Normal */}
          <button onClick={isUserOnDifferentPage ? onResumeFromSavedPosition : () => setIsPlaying(!isPlaying)} className="group p-5 bg-violet-600 hover:bg-violet-700 rounded-full transition-all shadow-lg shadow-violet-200 active:scale-90 flex items-center justify-center">
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 9v6m4-6v6" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
            )}
          </button>

          <button onClick={() => skipLine('next')} disabled={currentLineIndex === lines.length - 1} className="p-2 text-slate-400 hover:text-violet-600 disabled:opacity-20 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M4 5l7 7-7 7" /></svg>
          </button>
        </div>

        {/* Ideia 9: Botão Condicional para ler esta página específica */}
        {isUserOnDifferentPage && !isPlaying && (
          <button
            onClick={onResumeFromThisPage}
            className="text-[10px] font-bold bg-violet-100 text-violet-700 px-4 py-2 rounded-full hover:bg-violet-200 transition-colors animate-in fade-in slide-in-from-right-2"
          >
            Continuar leitura desta página
          </button>
        )}

        <div className="pr-4 text-right">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Linha</p>
          <p className="text-sm font-black text-violet-600">#{currentLineIndex + 1}</p>
        </div>
      </div>
    </div>
  );
};

const LikeABook = ({ pages, currentPage, onPageChange, currentLineIndex, onLineSelect, userSelectedLine, readingPageIndex }: {
  pages: string[], currentPage: number, onPageChange: (p: number) => void, currentLineIndex: number, onLineSelect: (i: number) => void, userSelectedLine: number | null, readingPageIndex: number
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lines = pages[currentPage]?.split(/(?<=[.!?])\s+|\n/).filter(l => l.trim() !== '') || [];

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-6">
      <div className="relative w-full aspect-[3/4] md:aspect-[4/5] bg-[#fbfaf8] shadow-2xl rounded-sm border border-slate-200 p-8 md:p-16 flex flex-col justify-between overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide pr-2">
          {lines.map((line, index) => {
            // Só mostramos o destaque amarelo se estivermos na página que o áudio está lendo
            const isReading = (index === currentLineIndex && currentPage === readingPageIndex);
            const isSelected = index === userSelectedLine;
            return (
              <span id={`line-${index}`} key={index} onDoubleClick={() => onLineSelect(index)} className={`font-serif text-xl md:text-2xl leading-relaxed block mb-4 transition-all duration-500 rounded px-1 cursor-pointer select-none ${isSelected ? 'bg-blue-400 text-white shadow-lg scale-[1.01]' : isReading ? 'bg-yellow-300 text-black shadow-md' : 'text-slate-800 opacity-90'}`}>
                {line}
              </span>
            );
          })}
        </div>
        <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-sans tracking-widest uppercase">
          <span>Klai Digital Reader</span>
          <span>Página {currentPage + 1} de {pages.length}</span>
        </div>
      </div>
      <div className="flex gap-4 items-center bg-white p-2 rounded-full shadow-lg border border-slate-100">
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0} className="p-3 rounded-full hover:bg-violet-50 text-violet-600 disabled:opacity-20 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4">{Math.round(((currentPage + 1) / pages.length) * 100)}%</span>
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === pages.length - 1} className="p-3 rounded-full hover:bg-violet-50 text-violet-600 disabled:opacity-20 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
};

// --- APP PRINCIPAL ---
export default function App() {
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // O que o usuário está VENDO
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [userSelectedLine, setUserSelectedLine] = useState<number | null>(null);

  // O que o sistema está LENDO (Ideia 9)
  const [readingPageIndex, setReadingPageIndex] = useState(0);
  const [readingLineIndex, setReadingLineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleUpload = async (file: File) => {
    setLoading(true);
    try {
      const result = await extractTextFromPDF(file);
      const pagesData = Array.isArray(result.pages) ? result.pages : [result.text];
      setPages(pagesData);
      setCurrentPageIndex(0);
      setReadingPageIndex(0);
      setReadingLineIndex(0);
      setUserSelectedLine(null);
    } catch (error) {
      console.error("Falha no upload Klai:", error);
      alert("Erro ao processar o PDF.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    window.speechSynthesis.cancel();
    setPages([]);
    setIsPlaying(false);
    setReadingPageIndex(0);
    setReadingLineIndex(0);
    setCurrentPageIndex(0);
    setUserSelectedLine(null);
  };

  // Ideia 9: Ao clicar em play normal, voltamos para onde a leitura parou
  const handleResumeFromSavedPosition = () => {
    setCurrentPageIndex(readingPageIndex);
    setIsPlaying(true);
  };

  // Ideia 9: Ao clicar no novo botão, começamos a ler a página que estamos olhando
  const handleResumeFromThisPage = () => {
    setReadingPageIndex(currentPageIndex);
    setReadingLineIndex(0);
    setIsPlaying(true);
  };

  const handleLineSelect = (index: number) => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setUserSelectedLine(index);
    setReadingLineIndex(index);
    setReadingPageIndex(currentPageIndex);
  };

  const getLines = (text: string) => text ? text.split(/(?<=[.!?])\s+|\n/).filter((l) => l.trim() !== '') : [];

  // O player sempre carrega as linhas da página que está sendo LIDA
  const currentReadingLines = getLines(pages[readingPageIndex]);

  // Checamos se o usuário navegou para longe da página de leitura
  const isUserOnDifferentPage = currentPageIndex !== readingPageIndex;

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center py-12 px-4 selection:bg-violet-200">
      {pages.length > 0 && !loading && (
        <button onClick={handleReset} className="fixed top-6 left-6 z-50 flex items-center gap-2 bg-white px-5 py-2.5 rounded-full shadow-lg text-slate-600 hover:text-violet-600 transition-all border border-slate-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" /></svg>
          <span className="text-sm font-bold">Novo PDF</span>
        </button>
      )}

      {pages.length === 0 && !loading && (
        <header className="mb-12 text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-5xl font-black text-violet-600 tracking-tighter mb-2">KLAI<span className="text-slate-300">READER</span></h1>
          <p className="text-slate-400 font-medium uppercase text-[10px] tracking-[0.4em]">PDF to Audio Streaming System</p>
        </header>
      )}

      <main className="w-full max-w-5xl flex flex-col items-center pb-32">
        {loading ? (
          <div className="mt-20"><LoadingSpinner /></div>
        ) : pages.length === 0 ? (
          <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700"><InputArea onFileSelect={handleUpload} disabled={loading} /></div>
        ) : (
          <div className="w-full flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <AudioPlayer
              lines={currentReadingLines}
              onLineChange={setReadingLineIndex}
              currentLineIndex={readingLineIndex}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              isUserOnDifferentPage={isUserOnDifferentPage}
              onResumeFromThisPage={handleResumeFromThisPage}
              onResumeFromSavedPosition={handleResumeFromSavedPosition}
            />
            <LikeABook
              pages={pages}
              currentPage={currentPageIndex}
              readingPageIndex={readingPageIndex}
              onPageChange={(p) => {
                setCurrentPageIndex(p);
                setIsPlaying(false);
                setUserSelectedLine(null);
                window.speechSynthesis.cancel();
              }}
              currentLineIndex={readingLineIndex}
              onLineSelect={handleLineSelect}
              userSelectedLine={userSelectedLine}
            />
          </div>
        )}
      </main>

      <footer className="mt-auto pt-12 text-slate-300 text-[10px] uppercase tracking-widest text-center">
        &copy; 2025 Klai - Projeto Desenvolvido para portfolio
      </footer>
    </div>
  );
}