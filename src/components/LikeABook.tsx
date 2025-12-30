import { useRef, useCallback } from 'react';

interface Props {
    pages: string[];
    currentPageIndex: number;
    readingPageIndex: number;
    readingLineIndex: number;
    bookTitle: string;
    isDarkMode: boolean;
    onLineSelection: (index: number) => void;
    onPageChange: (page: number) => void;
}

export const LikeABook = ({
    pages,
    currentPageIndex,
    readingPageIndex,
    readingLineIndex,
    bookTitle,
    isDarkMode,
    onLineSelection,
    onPageChange,
}: Props) => {
    const lastTap = useRef<number>(0);

    const getLines = (text: string) => {
        return text ? text.split(/(?<=[.!?])\s+|\n/).filter((l) => l.trim() !== '') : [];
    };

    const handleTouch = useCallback((index: number) => {
        const now = performance.now();
        if (now - lastTap.current < 300) {
            onLineSelection(index);
        }
        lastTap.current = now;
    }, [onLineSelection]);

    const currentLines = getLines(pages[currentPageIndex]);

    return (
        <div className="w-full flex flex-col items-center gap-6 pb-40">
            <div
                className={`
          relative w-full aspect-[3/4] md:aspect-[4/5] shadow-2xl rounded-sm border 
          transition-colors duration-500 p-8 md:p-16 flex flex-col justify-between overflow-hidden
          ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#fbfaf8] border-slate-200'}
        `}
            >
                <div className="flex-1 overflow-y-auto scrollbar-hide pr-2">
                    {currentLines.map((line, index) => {
                        const isReading = index === readingLineIndex && currentPageIndex === readingPageIndex;
                        return (
                            <span
                                key={index}
                                onDoubleClick={() => onLineSelection(index)}
                                onTouchEnd={() => handleTouch(index)}
                                className={`
                  font-serif text-xl md:text-2xl leading-relaxed block mb-4 
                  transition-all duration-300 rounded px-1 cursor-pointer select-none
                  ${isReading
                                        ? 'bg-yellow-400 text-black shadow-md'
                                        : isDarkMode
                                            ? 'text-slate-300 opacity-80'
                                            : 'text-slate-800 opacity-90'
                                    }
                `}
                            >
                                {line}
                            </span>
                        );
                    })}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700/20 flex justify-between items-center text-[10px] text-slate-500 font-sans tracking-widest uppercase">
                    <span className="truncate max-w-[60%] font-bold">{bookTitle}</span>
                    <span>
                        Página {currentPageIndex + 1} de {pages.length}
                    </span>
                </div>
            </div>

            {/* Page Navigation */}
            <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Página
                    </span>
                    <input
                        type="number"
                        value={currentPageIndex + 1}
                        onChange={(e) => {
                            const page = parseInt(e.target.value) - 1;
                            if (!isNaN(page) && page >= 0 && page < pages.length) {
                                onPageChange(page);
                            }
                        }}
                        className={`
              w-16 text-center py-1 rounded-lg font-bold border 
              outline-none focus:ring-2 focus:ring-violet-500
              ${isDarkMode
                                ? 'bg-slate-800 border-slate-700 text-white'
                                : 'bg-white border-slate-200 text-slate-700'
                            }
            `}
                    />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        de {pages.length}
                    </span>
                </div>
            </div>
        </div>
    );
};