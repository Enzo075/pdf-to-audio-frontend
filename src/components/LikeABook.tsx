import { useEffect, useRef } from 'react';

interface Props {
    pages: string[];
    currentPage: number;
    onPageChange: (page: number) => void;
    currentLineIndex: number;
}

export const LikeABook = ({ pages, currentPage, onPageChange, currentLineIndex }: Props) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Divide o texto da página atual em linhas/frases
    const lines = pages[currentPage]?.split(/(?<=[.!?])\s+|\n/).filter(l => l.trim() !== '') || [];

    // Scroll automático para a linha ativa (opcional, melhora UX)
    useEffect(() => {
        const activeLine = document.getElementById(`line-${currentLineIndex}`);
        if (activeLine && scrollRef.current) {
            activeLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [currentLineIndex]);

    return (
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-6">
            {/* Página do Livro */}
            <div className="relative w-full aspect-[3/4] md:aspect-[4/5] bg-[#fbfaf8] shadow-2xl rounded-sm border border-slate-200 p-8 md:p-16 flex flex-col justify-between overflow-hidden">

                <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide pr-2">
                    {lines.map((line, index) => (
                        <span
                            id={`line-${index}`}
                            key={index}
                            className={`
                font-serif text-xl md:text-2xl leading-relaxed block mb-4 transition-all duration-500 rounded px-1
                ${index === currentLineIndex
                                    ? 'bg-yellow-300 text-black shadow-[0_2px_10px_rgba(253,224,71,0.4)]'
                                    : 'text-slate-800 opacity-90'}
              `}
                        >
                            {line}
                        </span>
                    ))}
                </div>

                {/* Rodapé da Página */}
                <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-sans tracking-widest uppercase">
                    <span>Klai Digital Reader</span>
                    <span>Página {currentPage + 1} de {pages.length}</span>
                </div>
            </div>

            {/* Controles de Página */}
            <div className="flex gap-4 items-center bg-white p-2 rounded-full shadow-lg border border-slate-100">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="p-3 rounded-full hover:bg-violet-50 text-violet-600 disabled:opacity-20 transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4">
                    {Math.round(((currentPage + 1) / pages.length) * 100)}%
                </span>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === pages.length - 1}
                    className="p-3 rounded-full hover:bg-violet-50 text-violet-600 disabled:opacity-20 transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
};