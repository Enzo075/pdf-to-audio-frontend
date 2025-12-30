import { useState } from 'react';
import { InputArea } from './components/InputArea';
import { LoadingSpinner } from './components/LoadingSpinner';
import { LikeABook } from './components/LikeABook';
import { AudioPlayer } from './components/AudioPlayer';
import { usePdfUpload } from './hooks/usePdfUpload';
import { useReaderState } from './hooks/useReaderState';

export default function App() {
  // Estados principais
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const isDarkMode = theme === 'dark';


  const { uploadPdf, loading } = usePdfUpload();
  const reader = useReaderState();

  const handleUpload = async (file: File) => {
    const result = await uploadPdf(file);

    const pagesData = Array.isArray(result.pages)
      ? result.pages
      : [result.text];

    const title = result.info?.Title || file.name.replace('.pdf', '');

    reader.setBookTitle(title);
    reader.setPages(pagesData);
    reader.setCurrentPageIndex(0);
    reader.setReadingPageIndex(0);
    reader.setReadingLineIndex(0);
  };


  return (
    <div
      className={`
        min-h-screen w-full transition-colors duration-500 
        flex flex-col items-center py-6 px-4 selection:bg-violet-400
        ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}
      `}
    >
      {/* Header com botões */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-8 h-12">
        {reader.pages.length > 0 && !loading && (
          <button
            onClick={() => {
              reader.setPages([]);
              reader.setIsPlaying(false);
              window.speechSynthesis.cancel();
            }}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full shadow-sm 
              text-sm font-bold transition-all border
              ${isDarkMode
                ? 'bg-slate-900 border-slate-700 text-slate-300'
                : 'bg-white border-slate-200 text-slate-600'
              }
            `}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7 7-7"
              />
            </svg>
            Trocar o PDF
          </button>
        )}

        {reader.pages.length > 0 && !loading && (reader.isUserAway || reader.isEndOfBook) && (
          <button onClick={reader.handleTopButton} className={`
              animate-in fade-in slide-in-from-right-4 px-5 py-2 rounded-full
              text-white text-sm font-bold shadow-lg transition-all active:scale-95
              ${reader.getTopButtonClasses()}
            `}
          >
            {reader.getTopButtonText()}
          </button>
        )}
      </div>

      {/* Logo/Header inicial */}
      {reader.pages.length === 0 && !loading && (
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-black text-violet-600 tracking-tighter">
            KLAI
            <span className={isDarkMode ? 'text-slate-700' : 'text-slate-300'}>
              READER
            </span>
          </h1>
        </header>
      )}

      {/* Conteúdo principal */}
      <main className="w-full max-w-4xl flex flex-col items-center flex-1">
        <LoadingSpinner visible={loading} />

        {!loading && reader.pages.length === 0 && (
          <div className="w-full max-w-md">
            <InputArea
              onUpload={handleUpload}
              disabled={loading}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        {!loading && reader.pages.length > 0 && (
          <LikeABook
            pages={reader.pages}
            currentPageIndex={reader.currentPageIndex}
            readingPageIndex={reader.readingPageIndex}
            readingLineIndex={reader.readingLineIndex}
            bookTitle={reader.bookTitle}
            isDarkMode={isDarkMode}
            onLineSelection={reader.handleLineSelection}
            onPageChange={reader.setCurrentPageIndex}
          />
        )}
      </main>

      {/* Audio Player fixo */}
      {reader.pages.length > 0 && (
        <AudioPlayer
          isPlaying={reader.isPlaying}
          setIsPlaying={reader.setIsPlaying}
          readingPageIndex={reader.readingPageIndex}
          readingLineIndex={reader.readingLineIndex}
          onLineSkip={reader.handleLineSkip}
          onPageSkip={reader.handlePageSkip}
          isDarkMode={isDarkMode}
          setTheme={setTheme}
        />
      )}

      {/* Footer */}
      <footer
        className={`
          mt-auto pt-8 text-[10px] uppercase tracking-widest text-center transition-colors
          ${isDarkMode ? 'text-slate-700' : 'text-slate-300'}
        `}
      >
        &copy; 2025 Klai - Projeto Desenvolvido para portfolio
      </footer>
    </div>
  );
}