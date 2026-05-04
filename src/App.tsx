import { useState } from "react";
import { InputArea } from "./components/InputArea";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { LikeABook } from "./components/LikeABook";
import { AudioPlayer } from "./components/AudioPlayer";
import { SettingsDrawer } from "./components/SettingsDrawer";
import { usePdfUpload } from "./hooks/usePdfUpload";
import { useReaderState } from "./hooks/useReaderState";
import { useSpeechReader } from "./hooks/useSpeechReader";
import { useTheme } from "./hooks/useTheme";
import { useReadingEngine } from "./hooks/useReadingEngine";
import { ThemeSwitch } from "./components/ThemeSwitch";
import { useAuth } from "./hooks/useAuth";
import AuthScreen from "./components/AuthScreen";
import ForgotPasswordScreen from "./components/ForgotPasswordScreen";
import ResetPasswordScreen from "./components/ResetPasswordScreen";
import GoogleAuthCallback from "./components/GoogleAuthCallback";
import { MdLogout } from "react-icons/md";

export default function App() {
  const { theme, setTheme, isDarkMode } = useTheme();
  const { uploadPdf, loading, error, clearError } = usePdfUpload();
  const { apiKeyError } = useReadingEngine();
  const reader = useReaderState();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [dismissedErrorId, setDismissedErrorId] = useState<number | null>(null);

  // Detecta a view inicial a partir do pathname
  const [authView, setAuthView] = useState<string>(() => {
    const path = window.location.pathname;
    if (path === "/auth/callback") return "google-callback";
    if (path.startsWith("/reset-password/")) return "reset-password";
    return "login";
  });

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
    },
    onFinish: () => {
      reader.stopPlaying();
    },
  });

  const { isAuthenticated, isLoading, logout } = useAuth();

  const isKeyErrorModalOpen =
    !!apiKeyError && apiKeyError.id !== dismissedErrorId;

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  const hasBook = reader.pages.length > 0;
  const showUploadArea = !loading && !hasBook;
  const showReader = !loading && hasBook;
  const showHeader = hasBook && !loading;
  const isRestartMode =
    reader.isEndOfBook &&
    reader.currentPageIndex === reader.pages.length - 1;
  const showTopButton = showHeader && (reader.isUserAway || reader.isEndOfBook);

  interface RenderResponse {
    pages: (string | string[])[];
    info?: { Title?: string };
  }

  const handleUpload = async (file: File) => {
    const result = (await uploadPdf(file)) as unknown as RenderResponse;
    if (!result || !result.pages) return;

    const pages: string[] = result.pages.map((p) => {
      if (Array.isArray(p)) return p.join("\n");
      return typeof p === "string" ? p : "";
    });

    const title = result.info?.Title || file.name.replace(".pdf", "");
    reader.setBookTitle(title);
    reader.setPages(pages);
    reader.setCurrentPageIndex(0);
    reader.setReadingPageIndex(0);
    reader.setReadingLineIndex(0);
  };

  const handleResetReader = () => {
    reader.setPages([]);
    reader.stopPlaying();
    window.speechSynthesis.cancel();
  };

  const toggleTheme = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  const topButtonText = isRestartMode
    ? "Começar a leitura do início do PDF"
    : "Continuar leitura desta página";

  const topButtonClass = isRestartMode
    ? "app-btn-top-action bg-green-600 hover:bg-green-700 shadow-green-500/20"
    : "app-btn-top-action bg-violet-600 hover:bg-violet-700 shadow-violet-500/20";

  const renderErrorModal = (message: string, onClose: () => void) => (
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
          {message}
        </p>
        <button
          onClick={onClose}
          className={`error-modal-button error-modal-button--${theme}`}
        >
          OK
        </button>
      </div>
    </div>
  );

  // Loading inicial do AuthProvider
  if (isLoading) return null;

  // ─── Guard de autenticação ────────────────────────────────────────────────
  if (!isAuthenticated) {
    if (authView === "google-callback") return <GoogleAuthCallback />;
    if (authView === "forgot-password")
      return <ForgotPasswordScreen onBack={() => setAuthView("login")} />;
    if (authView === "reset-password")
      return <ResetPasswordScreen onBack={() => setAuthView("login")} />;
    return (
      <AuthScreen onForgotPassword={() => setAuthView("forgot-password")} />
    );
  }

  // ─── App principal ────────────────────────────────────────────────────────
  return (
    <div className={`app-container app-container--${theme}`}>

      {/* Botão de logout — canto superior esquerdo */}
      {showUploadArea && (
        <div className="fixed top-6 left-6 z-50">
          <button
            onClick={logout}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all shadow-md active:scale-95 ${isDarkMode
                ? "bg-slate-900 text-slate-400 hover:text-red-400 border border-slate-800"
                : "bg-white text-slate-600 hover:text-red-600 border border-slate-200"
              }`}
            title="Sair"
          >
            <MdLogout size={18} />
            <span className="text-xs uppercase tracking-widest hidden sm:inline">
              Sair
            </span>
          </button>
        </div>
      )}

      {showUploadArea && (
        <div className="app-theme-switch-wrapper">
          <ThemeSwitch isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        </div>
      )}

      <div className="app-header">
        {showHeader && (
          <button
            onClick={handleResetReader}
            className={`app-btn-change-pdf app-btn-change-pdf--${theme}`}
          >
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

      {showUploadArea && (
        <header className="app-logo-header">
          <h1 className="app-logo-title">
            PDF TO
            <span className={`app-logo-subtitle--${theme}`}>AUDIO</span>
          </h1>
        </header>
      )}

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

      {hasBook && (
        <AudioPlayer
          isPlaying={reader.isPlaying}
          onPlay={reader.startPlaying}
          onPause={reader.stopPlaying}
          readingPageIndex={reader.readingPageIndex}
          readingLineIndex={reader.readingLineIndex}
          canGoToPrevPage={reader.canGoToPrevPage}
          canGoToNextPage={reader.canGoToNextPage}
          canGoToPrevLine={reader.canGoToPrevLine}
          canGoToNextLine={reader.canGoToNextLine}
          onLineSkip={reader.handleLineSkip}
          onPageSkip={reader.handlePageSkip}
          isDarkMode={isDarkMode}
          onSettingsClick={openSettings}
        />
      )}

      <footer className={`app-footer app-footer--${theme}`}>
        &copy; 2026 Enzo Klai Roth - Projeto Desenvolvido para portfolio
      </footer>

      {error && renderErrorModal(error, clearError)}

      {isKeyErrorModalOpen &&
        renderErrorModal(apiKeyError!.message, () =>
          setDismissedErrorId(apiKeyError!.id)
        )}

      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={closeSettings}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        playbackRate={playbackRate}
        onPlaybackRateChange={setPlaybackRate}
        isPlaying={reader.isPlaying}
        onPause={reader.stopPlaying}
        registerOnPlayStart={reader.registerOnPlayStart}
      />
    </div>
  );
}