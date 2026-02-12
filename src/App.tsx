import { InputArea } from './components/InputArea';
import { LoadingSpinner } from './components/LoadingSpinner';
import { LikeABook } from './components/LikeABook';
import { AudioPlayer } from './components/AudioPlayer';
import { usePdfUpload } from './hooks/usePdfUpload';
import { useReaderState } from './hooks/useReaderState';
import { useSpeechReader } from './hooks/useSpeechReader';
import { useTheme } from './hooks/useTheme';

export default function App() {
  const { theme, setTheme, isDarkMode } = useTheme();
  const { uploadPdf, loading, error, clearError } = usePdfUpload();
  const reader = useReaderState();

  useSpeechReader({
    pages: reader.pages,
    readingPageIndex: reader.readingPageIndex,
    readingLineIndex: reader.readingLineIndex,
    currentPageIndex: reader.currentPageIndex,
    isPlaying: reader.isPlaying,
    onLineChange: (pageIndex, lineIndex) => {
      reader.setReadingPageIndex(pageIndex);
      reader.setReadingLineIndex(lineIndex);
    },
    onPageChange: (pageIndex) => {
      reader.setCurrentPageIndex(pageIndex);
    },
    onFinish: () => {
      reader.setIsPlaying(false);
    },
  });

  const hasBook = reader.pages.length > 0;
  const showUploadArea = !loading && !hasBook;
  const showReader = !loading && hasBook;
  const showHeader = hasBook && !loading;
  const isRestartMode = reader.isEndOfBook && reader.currentPageIndex === reader.pages.length - 1;
  const showTopButton = showHeader && (reader.isUserAway || reader.isEndOfBook);

  const handleUpload = async (file: File) => {
    const result = await uploadPdf(file);

    if (!result) return;

    const pages = Array.isArray(result.pages)
      ? result.pages
      : [result.text];

    const title = result.info?.Title || file.name.replace('.pdf', '');

    reader.setBookTitle(title);
    reader.setPages(pages);
    reader.setCurrentPageIndex(0);
    reader.setReadingPageIndex(0);
    reader.setReadingLineIndex(0);
  };

  const handleResetReader = () => {
    reader.setPages([]);
    reader.setIsPlaying(false);
    window.speechSynthesis.cancel();
  };

  const containerClass = `app-container app-container--${theme}`;
  const changePdfClass = `app-btn-change-pdf app-btn-change-pdf--${theme}`;
  const subtitleClass = `app-logo-subtitle--${theme}`;
  const footerClass = `app-footer app-footer--${theme}`;

  const topButtonText = isRestartMode
    ? "Começar a leitura do início do PDF"
    : "Continuar leitura desta página";

  const topButtonClass = isRestartMode
    ? "app-btn-top-action bg-green-600 hover:bg-green-700 shadow-green-500/20"
    : "app-btn-top-action bg-violet-600 hover:bg-violet-700 shadow-violet-500/20";

  return (
    <div className={containerClass}>
      {/* Header com botões */}
      <div className="app-header">
        {showHeader && (
          <button onClick={handleResetReader} className={changePdfClass}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="app-btn-change-pdf-icon"
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

        {showTopButton && (
          <button onClick={reader.handleTopButton} className={topButtonClass}>
            {topButtonText}
          </button>
        )}
      </div>

      {/* Logo/Header inicial */}
      {showUploadArea && (
        <header className="app-logo-header">
          <h1 className="app-logo-title">
            PDF TO
            <span className={subtitleClass}>AUDIO</span>
          </h1>
        </header>
      )}

      {/* Conteúdo principal */}
      <main className="app-main-content">
        <LoadingSpinner visible={loading} />

        {showUploadArea && (
          <div className="app-input-container">
            <InputArea
              onUpload={handleUpload}
              disabled={loading}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        {showReader && (
          <LikeABook
            pages={reader.pages}
            currentPageIndex={reader.currentPageIndex}
            readingPageIndex={reader.readingPageIndex}
            readingLineIndex={reader.readingLineIndex}
            bookTitle={reader.bookTitle}
            isDarkMode={isDarkMode}
            isPlaying={reader.isPlaying}
            onLineSelection={reader.handleLineSelection}
            onPageChange={reader.setCurrentPageIndex}
          />
        )}
      </main>

      {/* Audio Player fixo */}
      {hasBook && (
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
      <footer className={footerClass}>
        &copy; 2025 Enzo Klai Roth - Projeto Desenvolvido para portfolio
      </footer>

      {/* Modal de Erro */}
      {error && (
        <div className="error-modal-overlay">
          <div className={`error-modal-backdrop error-modal-backdrop--${theme}`} />
          <div className={`error-modal-content error-modal-content--${theme}`}>
            <div className="error-modal-icon-wrapper">
              <div className={`error-modal-icon error-modal-icon--${theme}`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
            <h2 className={`error-modal-title error-modal-title--${theme}`}>
              Ops! Algo deu errado
            </h2>
            <p className={`error-modal-message error-modal-message--${theme}`}>
              {error}
            </p>
            <button
              onClick={clearError}
              className={`error-modal-button error-modal-button--${theme}`}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}