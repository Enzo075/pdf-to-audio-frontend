interface Props {
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    readingPageIndex: number;
    readingLineIndex: number;
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
                        onClick={() => onPageSkip('prev')}
                        className="audio-player-btn-skip"
                        title="Página Anterior"
                    >
                        ≪
                    </button>

                    <button
                        onClick={() => onLineSkip('prev')}
                        className="audio-player-btn-skip"
                        title="Linha Anterior"
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
                        onClick={() => onLineSkip('next')}
                        className="audio-player-btn-skip"
                        title="Próxima Linha"
                    >
                        {'>'}
                    </button>

                    <button
                        onClick={() => onPageSkip('next')}
                        className="audio-player-btn-skip"
                        title="Próxima Página"
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