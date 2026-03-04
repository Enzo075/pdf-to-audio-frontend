interface Props {
    isPlaying: boolean;
    onPlay: () => void;
    onPause: () => void;
    readingPageIndex: number;
    readingLineIndex: number;
    canGoToPrevPage: boolean;
    canGoToNextPage: boolean;
    canGoToPrevLine: boolean;
    canGoToNextLine: boolean;
    onLineSkip: (direction: 'next' | 'prev') => void;
    onPageSkip: (direction: 'next' | 'prev') => void;
    isDarkMode: boolean;
    onSettingsClick: () => void;
}

export const AudioPlayer = ({
    isPlaying,
    onPlay,
    onPause,
    readingPageIndex,
    readingLineIndex,
    canGoToPrevPage,
    canGoToNextPage,
    canGoToPrevLine,
    canGoToNextLine,
    onLineSkip,
    onPageSkip,
    isDarkMode,
    onSettingsClick,
}: Props) => {
    return (
        <div className="audio-player-container">
            <div className={`audio-player-card ${isDarkMode ? 'audio-player-card--dark' : 'audio-player-card--light'}`}>
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
                        onClick={() => isPlaying ? onPause() : onPlay()}
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

                <div className="audio-player-theme-wrapper">
                    <button
                        onClick={onSettingsClick}
                        className={`audio-player-theme-btn ${isDarkMode ? 'audio-player-theme-btn--dark' : 'audio-player-theme-btn--light'}`}
                        title="Configurações"
                        aria-label="Abrir configurações"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className={`audio-player-icon ${isDarkMode ? 'audio-player-icon--settings-dark' : 'audio-player-icon--settings-light'}`}
                        >
                            <path
                                fillRule="evenodd"
                                d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};