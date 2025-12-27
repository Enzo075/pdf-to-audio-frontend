import { useState, useEffect, useRef } from 'react';

interface Props {
    lines: string[];
    onLineChange: (index: number) => void;
    currentLineIndex: number;
}

export const AudioPlayer = ({ lines, onLineChange, currentLineIndex }: Props) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const indexRef = useRef(currentLineIndex);

    // Sincroniza o ref com o index atual para o loop de leitura
    useEffect(() => {
        indexRef.current = currentLineIndex;
    }, [currentLineIndex]);

    const speak = (index: number) => {
        if (index >= lines.length) {
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
            if (isPlaying) {
                speak(index + 1);
            }
        };

        window.speechSynthesis.speak(utterance);
    };

    const togglePlay = () => {
        if (isPlaying) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
            speak(indexRef.current);
        }
    };

    return (
        <div className="fixed bottom-0 left-0 w-full z-50 p-6 pointer-events-none">
            <div className="max-w-xl mx-auto bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-4 flex items-center justify-between pointer-events-auto">

                {/* Klai Brand Indicator */}
                <div className="flex items-center gap-3 pl-2">
                    <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Klai Voice</span>
                </div>

                {/* Play/Pause Button */}
                <button
                    onClick={togglePlay}
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

                {/* Progress Text */}
                <div className="pr-4 text-right">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Linha</p>
                    <p className="text-sm font-black text-violet-600">#{currentLineIndex + 1}</p>
                </div>

            </div>
        </div>
    );
};