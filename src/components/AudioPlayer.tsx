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
        <div className="fixed bottom-0 left-0 w-full z-50 p-6 pointer-events-none">
            <div
                className={`
          max-w-3xl mx-auto border shadow-2xl rounded-3xl p-5 
          flex flex-col md:flex-row items-center justify-between 
          pointer-events-auto gap-4 transition-colors duration-500
          ${isDarkMode
                        ? 'bg-slate-900/95 border-slate-800 backdrop-blur-xl'
                        : 'bg-white/95 border-white/20 backdrop-blur-xl'
                    }
        `}
            >
                {/* Status Indicator */}
                <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-slate-400'
                                }`}
                        />
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                Klai Voice
                            </p>
                            <p className="text-[9px] text-slate-400 italic">
                                Pág {readingPageIndex + 1} • Linha {readingLineIndex + 1}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3 sm:gap-6">
                    <button
                        onClick={() => onPageSkip('prev')}
                        className="text-xl p-2 text-slate-400 hover:text-violet-600 transition-colors"
                        title="Página Anterior"
                    >
                        ≪
                    </button>

                    <button
                        onClick={() => onLineSkip('prev')}
                        className="text-xl p-2 text-slate-400 hover:text-violet-600 transition-colors"
                        title="Linha Anterior"
                    >
                        {'<'}
                    </button>

                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="group p-6 bg-violet-600 hover:bg-violet-700 rounded-full transition-all shadow-xl shadow-violet-500/20 active:scale-90"
                    >
                        {isPlaying ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-white"
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
                                className="h-6 w-6 text-white"
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
                        className="text-xl p-2 text-slate-400 hover:text-violet-600 transition-colors"
                        title="Próxima Linha"
                    >
                        {'>'}
                    </button>

                    <button
                        onClick={() => onPageSkip('next')}
                        className="text-xl p-2 text-slate-400 hover:text-violet-600 transition-colors"
                        title="Próxima Página"
                    >
                        ≫
                    </button>
                </div>

                {/* Theme Toggle */}
                <div className="flex justify-end min-w-[120px]">
                    <button
                        onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
                        className={`
              p-3 rounded-2xl transition-all text-xl shadow-sm border
              ${isDarkMode
                                ? 'bg-slate-800 border-slate-700 text-yellow-400'
                                : 'bg-slate-100 border-slate-200 text-slate-600'
                            }
            `}
                        title="Mudar Tema"
                    >
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>
                </div>
            </div>
        </div>
    );
};