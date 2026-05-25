import { useState } from "react";
import { InputArea } from "./components/InputArea";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { LikeABook } from "./components/LikeABook";
import { AudioPlayer } from "./components/AudioPlayer";
import { SettingsDrawer } from "./components/SettingsDrawer";
import { BookShelf } from "./components/BookShelf";
import { MenuButton } from "./components/MenuButton";
import { usePdfUpload } from "./hooks/usePdfUpload";
import { useReaderState } from "./hooks/useReaderState";
import { useSpeechReader } from "./hooks/useSpeechReader";
import { useTheme } from "./hooks/useTheme";
import { useReadingEngine } from "./hooks/useReadingEngine";
import { useBooks } from "./hooks/useBooks";
import { useAuth } from "./hooks/useAuth";
import AuthScreen from "./components/AuthScreen";
import ForgotPasswordScreen from "./components/ForgotPasswordScreen";
import ResetPasswordScreen from "./components/ResetPasswordScreen";
import GoogleAuthCallback from "./components/GoogleAuthCallback";
import type { Book } from "./types/book";

type AppView = "upload" | "shelf" | "reading";

export default function App() {
  const { theme, setTheme, isDarkMode } = useTheme();
  const { uploadPdf, loading, error, clearError } = usePdfUpload();
  const { apiKeyError } = useReadingEngine();
  const reader = useReaderState();
  const { isAuthenticated, isLoading, logout } = useAuth();

  // Hook de persistência (Código 2)
  const { books, uploadBook, updateProgress, reorderBooks, toggleFavorite, deleteBook } = useBooks();

  // --- Estado de Navegação e View ---
  const [appView, setAppView] = useState<AppView>("upload");
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [dismissedErrorId, setDismissedErrorId] = useState<number | null>(null);
  const [bookLoading, setBookLoading] = useState(false);

  const isKeyErrorModalOpen = !!apiKeyError && apiKeyError.id !== dismissedErrorId;

  // Mantido do Código 1: Detecção rigorosa do pathname para Auth
  const [authView, setAuthView] = useState<string>(() => {
    const path = window.location.pathname;
    if (path === "/auth/callback") return "google-callback";
    if (path.startsWith("/reset-password/")) return "reset-password";
    return "login";
  });

  // --- Lógica de Sincronização de Progresso ---
  const handleProgressSave = (page?: number, line?: number) => {
    if (!currentBook) return;
    const pageToSave = page ?? reader.currentPageIndex;
    const lineToSave = line ?? reader.readingLineIndex;
    updateProgress(currentBook.id, pageToSave, lineToSave);
  };

  useSpeechReader({
    pages: reader.pages,
    readingPageIndex: reader.readingPageIndex,
    readingLineIndex: reader.readingLineIndex,
    currentPageIndex: reader.currentPageIndex,
    isPlaying: reader.isPlaying,
    playbackRate,
    onLineChange: (pageIndex, lineIndex) => {
      reader.setReadingPageIndex(pageIndex);
      reader.setReadingLineIndex(lineIndex);
    },
    onPageChange: (pageIndex) => {
      reader.setCurrentPageIndex(pageIndex);
      handleProgressSave(pageIndex, 0);
    },
    onFinish: () => {
      reader.stopPlaying();
    },
  });

  // --- Handlers de Upload e Seleção ---
  interface RenderResponse {
    pages: (string | string[])[];
    info?: { Title?: string };
  }

  const normalizePages = (result: RenderResponse, fileName: string) => {
    const pages: string[] = result.pages.map((p) => {
      if (Array.isArray(p)) return p.join("\n");
      return typeof p === "string" ? p : "";
    });
    const title = result.info?.Title || fileName.replace(".pdf", "");
    return { pages, title };
  };

  // Fluxo 1: Upload temporário (sem salvar)
  const handleUpload = async (file: File) => {
    const result = (await uploadPdf(file)) as unknown as RenderResponse;
    if (!result || !result.pages) return;

    const { pages, title } = normalizePages(result, file.name);
    reader.setBookTitle(title);
    reader.setPages(pages);
    reader.setCurrentPageIndex(0);
    reader.setReadingPageIndex(0);
    reader.setReadingLineIndex(0);
    setCurrentBook(null);
    setAppView("reading");
  };

  // Fluxo 2: Upload e Salvar na Estante
  const handleUploadAndSave = async (file: File) => {
    setBookLoading(true);
    try {
      const data = await uploadBook(file, true);
      if (!data?.extraction || !data?.book) return;

      const { pages, title } = normalizePages(data.extraction as RenderResponse, file.name);
      reader.setBookTitle(title);
      reader.setPages(pages);
      reader.setCurrentPageIndex(0);
      reader.setReadingPageIndex(0);
      reader.setReadingLineIndex(0);
      setCurrentBook(data.book as Book);
      setAppView("reading");
    } catch (err) {
      console.error("[handleUploadAndSave]", err);
    } finally {
      setBookLoading(false);
    }
  };

  const handleBookSelect = async (book: Book) => {
    setBookLoading(true);
    try {
      const response = await fetch(book.fileUrl);
      const blob = await response.blob();
      const file = new File([blob], `${book.title}.pdf`, { type: "application/pdf" });
      const result = (await uploadPdf(file)) as unknown as RenderResponse;

      if (!result || !result.pages) return;
      const { pages, title } = normalizePages(result, book.title);

      reader.setBookTitle(title);
      reader.setPages(pages);
      reader.setCurrentPageIndex(book.lastPageRead ?? 0);
      reader.setReadingPageIndex(book.lastPageRead ?? 0);
      reader.setReadingLineIndex(book.lastLineRead ?? 0);
      setCurrentBook(book);
      setAppView("reading");
    } catch (err) {
      console.error("[handleBookSelect]", err);
    } finally {
      setBookLoading(false);
    }
  };

  const handleResetReader = () => {
    handleProgressSave();

    reader.setPages([]);
    reader.stopPlaying();
    window.speechSynthesis.cancel();
    setCurrentBook(null);
    setAppView("upload");
  };

  // --- UI Helpers ---
  const hasBook = reader.pages.length > 0;
  const showUploadArea = !loading && !bookLoading && !hasBook;
  const showReader = !loading && !bookLoading && hasBook;
  const showHeader = hasBook && !loading && !bookLoading;
  const isRestartMode = reader.isEndOfBook && reader.currentPageIndex === reader.pages.length - 1;
  const showTopButton = showHeader && (reader.isUserAway || reader.isEndOfBook);

  const toggleTheme = () => setTheme(isDarkMode ? "light" : "dark");

  const renderErrorModal = (message: string, onClose: () => void) => (
    <div className="error-modal-overlay">
      <div className={`error-modal-backdrop error-modal-backdrop--${theme}`} />
      <div className={`error-modal-content error-modal-content--${theme}`}>
        <div className="error-modal-icon-wrapper">
          <div className={`error-modal-icon error-modal-icon--${theme}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        <h2 className={`error-modal-title error-modal-title--${theme}`}>Ops! Algo deu errado</h2>
        <p className={`error-modal-message error-modal-message--${theme}`}>{message}</p>
        <button onClick={onClose} className={`error-modal-button error-modal-button--${theme}`}>OK</button>
      </div>
    </div>
  );

  // --- Auth Guards (Mantidos do Código 1) ---
  if (isLoading) return null;
  if (!isAuthenticated) {
    if (authView === "google-callback") return <GoogleAuthCallback />;
    if (authView === "forgot-password") return <ForgotPasswordScreen onBack={() => setAuthView("login")} />;
    if (authView === "reset-password") return <ResetPasswordScreen onBack={() => setAuthView("login")} />;
    return <AuthScreen />;
  }

  // --- View da Estante ---
  if (appView === "shelf") {
    return (
      <BookShelf
        books={books}
        onBookSelect={handleBookSelect}
        onAddNew={() => {
          setCurrentBook(null);
          reader.setPages([]);
          setAppView("upload");
        }}
        onReorder={reorderBooks}
        onToggleFavorite={toggleFavorite}
        onDelete={deleteBook}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onLogout={logout}
      />
    );
  }

  // --- Render Principal ---
  return (
    <div className={`app-container app-container--${theme}`}>

      {/* Menu hambúrguer — visível apenas na tela de upload */}
      {showUploadArea && (
        <MenuButton
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onNavigate={() => setAppView("shelf")}
          navigateLabel="Estante"
          onLogout={logout}
        />
      )}

      <div className="app-header">
        {showHeader && (
          <div className="flex items-center gap-2">
            <button onClick={handleResetReader} className={`app-btn-change-pdf app-btn-change-pdf--${theme}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="app-btn-change-pdf-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" />
              </svg>
              Trocar o PDF
            </button>
          </div>
        )}
        {showTopButton && (
          <button
            onClick={() => {
              if (isRestartMode) {
                handleProgressSave(0, 0);
              } else {
                handleProgressSave(reader.currentPageIndex, 0);
              }
              reader.handleTopButton();
            }}
            className={isRestartMode ? "app-btn-top-action bg-green-600 hover:bg-green-700 shadow-green-500/20" : "app-btn-top-action bg-violet-600 hover:bg-violet-700 shadow-violet-500/20"}
          >
            {isRestartMode ? "Começar a leitura do início do PDF" : "Continuar leitura desta página"}
          </button>
        )}
      </div>

      {showUploadArea && (
        <header className="app-logo-header">
          <h1 className="app-logo-title">
            PDF TO <span className={`app-logo-subtitle--${theme}`}>AUDIO</span>
          </h1>
        </header>
      )}

      <main className="app-main-content">
        <LoadingSpinner visible={loading || bookLoading} />

        {showUploadArea && (
          <>
            <div className="app-input-container">
              <InputArea
                onUpload={handleUpload}
                onUploadAndSave={handleUploadAndSave}
                disabled={loading || bookLoading}
                isDarkMode={isDarkMode}
              />
            </div>
          </>
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
            onPageChange={(page) => {
              reader.setCurrentPageIndex(page);
            }}
          />
        )}
      </main>

      {hasBook && (
        <AudioPlayer
          isPlaying={reader.isPlaying}
          onPlay={reader.startPlaying}
          onPause={() => {
            reader.stopPlaying();
            handleProgressSave();
          }}
          readingPageIndex={reader.readingPageIndex}
          readingLineIndex={reader.readingLineIndex}
          canGoToPrevPage={reader.canGoToPrevPage}
          canGoToNextPage={reader.canGoToNextPage}
          canGoToPrevLine={reader.canGoToPrevLine}
          canGoToNextLine={reader.canGoToNextLine}
          onLineSkip={reader.handleLineSkip}
          onPageSkip={reader.handlePageSkip}
          isDarkMode={isDarkMode}
          onSettingsClick={() => setIsSettingsOpen(true)}
        />
      )}

      <footer className={`app-footer app-footer--${theme}`}>
        &copy; 2026 Enzo Klai Roth - Projeto Desenvolvido para portfolio
      </footer>

      {error && renderErrorModal(error, clearError)}
      {isKeyErrorModalOpen && renderErrorModal(apiKeyError!.message, () => setDismissedErrorId(apiKeyError!.id))}

      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        playbackRate={playbackRate}
        onPlaybackRateChange={setPlaybackRate}
        isPlaying={reader.isPlaying}
        onPause={reader.stopPlaying}
        registerOnPlayStart={reader.registerOnPlayStart}
        onLogout={logout}
        onNavigateToShelf={books.length > 0 ? () => setAppView("shelf") : undefined}
      />
    </div>
  );
}