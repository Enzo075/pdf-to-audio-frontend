import React, { useEffect, useRef } from 'react';

interface Props {
    lines: string[];
    onLineChange: (index: number) => void;
    currentLineIndex: number;
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    isUserOnDifferentPage?: boolean;
    onResumeFromThisPage?: () => void;
    onResumeFromSavedPosition?: () => void;
}

export const AudioPlayer = ({
    lines,
    onLineChange,
    currentLineIndex,
    isPlaying,
    setIsPlaying,
    isUserOnDifferentPage,
    onResumeFromThisPage,
    onResumeFromSavedPosition
}: Props) => {
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
        utterance.rate = 1.0;

        utterance.onstart = () => {
            onLineChange(index);
        };

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

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const skipLine = (direction: 'next' | 'prev') => {
        const wasPlaying = isPlaying;
        setIsPlaying(false);
        window.speechSynthesis.cancel();

        const newIndex = direction === 'next'
            ? Math.min(lines.length - 1, currentLineIndex + 1)
            : Math.max(0, currentLineIndex - 1);

        onLineChange(newIndex);

        setTimeout(() => {
            if (wasPlaying) setIsPlaying(true);
        }, 300);
    };

    return (
        <div className="fixed bottom-0 left-0 w-full z-50 p-6 pointer-events-none">
            <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between pointer-events-auto gap-4">

                <div className="flex items-center gap-3 pl-2">
                    <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                    <span className="hidden lg:inline text-[10px] font-bold text-slate-400 uppercase tracking-widest">Klai Voice</span>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <button
                        onClick={() => skipLine('prev')}
                        disabled={currentLineIndex === 0}
                        className="p-2 text-slate-400 hover:text-violet-600 disabled:opacity-20 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M20 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <button
                        onClick={isUserOnDifferentPage && !isPlaying ? onResumeFromSavedPosition : togglePlay}
                        className="group p-5 bg-violet-600 hover:bg-violet-700 rounded-full transition-all shadow-lg shadow-violet-200 active:scale-90"
                    >
                        {isPlaying ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 9v6m4-6v6" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            </svg>
                        )}
                    </button>

                    <button
                        onClick={() => skipLine('next')}
                        disabled={currentLineIndex === lines.length - 1}
                        className="p-2 text-slate-400 hover:text-violet-600 disabled:opacity-20 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M4 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {isUserOnDifferentPage && !isPlaying && (
                    <button
                        onClick={onResumeFromThisPage}
                        className="text-[10px] font-bold bg-violet-100 text-violet-700 px-4 py-2 rounded-full hover:bg-violet-200 transition-colors animate-in fade-in slide-in-from-right-2"
                    >
                        Ler esta página agora
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