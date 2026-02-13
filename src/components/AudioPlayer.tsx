interface Props {
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    readingPageIndex: number;
    readingLineIndex: number;
    canGoToPrevPage: boolean;
    canGoToNextPage: boolean;
    canGoToPrevLine: boolean;
    canGoToNextLine: boolean;
    onLineSkip: (direction: 'next' | 'prev') => void;
    onPageSkip: (direction: 'next' | 'prev') => void;
    isDarkMode: boolean;
    setTheme: (theme: 'light' | 'dark') => void;
}

export const AudioPlayer = ({
    isPlaying,
    setIsPlaying,
    readingPageIndex,
    readingLineIndex,
    canGoToPrevPage,
    canGoToNextPage,
    canGoToPrevLine,
    canGoToNextLine,
    onLineSkip,
    onPageSkip,
    isDarkMode,
    setTheme,
}: Props) => {
    return (
        <div className="audio-player-container">
            <div className={`audio-player-card ${isDarkMode ? 'audio-player-card--dark' : 'audio-player-card--light'}`}>
                {/* Status Indicator */}
                <div className="audio-player-status">
                    <div className="audio-player-indicator">
                        <div className={`audio-player-dot ${isPlaying ? 'audio-player-dot--playing' : 'audio-player-dot--paused'}`} />
                        <div>
                            <p className="audio-player-label">Áudio</p>
                            <p className="audio-player-position">
                                Pág {readingPageIndex + 1} • Linha {readingLineIndex + 1}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="audio-player-controls">
                    <button
                        onClick={() => canGoToPrevPage && onPageSkip('prev')}
                        disabled={!canGoToPrevPage}
                        className={`audio-player-btn-skip ${!canGoToPrevPage ? 'audio-player-btn-skip--disabled' : ''}`}
                        title={canGoToPrevPage ? "Página Anterior" : "Primeira página"}
                    >
                        ≪
                    </button>

                    <button
                        onClick={() => canGoToPrevLine && onLineSkip('prev')}
                        disabled={!canGoToPrevLine}
                        className={`audio-player-btn-skip ${!canGoToPrevLine ? 'audio-player-btn-skip--disabled' : ''}`}
                        title={canGoToPrevLine ? "Linha Anterior" : "Primeira linha"}
                    >
                        {'<'}
                    </button>

                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="audio-player-btn-play"
                    >
                        {isPlaying ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="audio-player-icon"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M10 9v6m4-6v6"
                                />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="audio-player-icon"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                />
                            </svg>
                        )}
                    </button>

                    <button
                        onClick={() => canGoToNextLine && onLineSkip('next')}
                        disabled={!canGoToNextLine}
                        className={`audio-player-btn-skip ${!canGoToNextLine ? 'audio-player-btn-skip--disabled' : ''}`}
                        title={canGoToNextLine ? "Próxima Linha" : "Última linha"}
                    >
                        {'>'}
                    </button>

                    <button
                        onClick={() => canGoToNextPage && onPageSkip('next')}
                        disabled={!canGoToNextPage}
                        className={`audio-player-btn-skip ${!canGoToNextPage ? 'audio-player-btn-skip--disabled' : ''}`}
                        title={canGoToNextPage ? "Próxima Página" : "Última página"}
                    >
                        ≫
                    </button>
                </div>

                {/* Theme Toggle */}
                <div className="audio-player-theme-wrapper">
                    <button
                        onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
                        className={`audio-player-theme-btn ${isDarkMode ? 'audio-player-theme-btn--dark' : 'audio-player-theme-btn--light'}`}
                        title="Mudar Tema"
                    >
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>
                </div>
            </div>
        </div>
    );
};