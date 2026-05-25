import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { SlOptionsVertical } from "react-icons/sl";
import { FiTrash2 } from "react-icons/fi";
import type { Book } from "../types/book";
import { AiOutlineStar, AiFillStar } from "react-icons/ai";

interface Props {
    book: Book;
    onSelect: (book: Book) => void;
    onDelete: (bookId: string) => void;
    onToggleFavorite: (bookId: string, isFavorite: boolean) => void;
    isDarkMode: boolean;
}

export function BookCard({ book, onSelect, onDelete, onToggleFavorite, isDarkMode }: Props) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: book.id });

    const style: React.CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : undefined,
        touchAction: "none",
    };

    const progress =
        book.totalPages > 0
            ? Math.min(100, Math.max(0, ((book.lastPageRead + 1) / book.totalPages) * 100))
            : 0;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`
        relative group rounded-xl overflow-hidden shadow-md cursor-grab active:cursor-grabbing
        transition-shadow active:scale-95 hover:shadow-xl
        ${isDarkMode ? "bg-slate-800" : "bg-white"}
      `}
            onClick={() => onSelect(book)}
        >
            {/* Capa */}
            <div className="aspect-3/4 w-full overflow-hidden">
                {book.coverUrl ? (
                    <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        draggable={false}
                    />
                ) : (
                    /* Placeholder gradiente quando não há capa */
                    <div className="w-full h-full bg-linear-to-b from-violet-600 to-violet-800 flex items-center justify-center p-3">
                        <span className="text-white text-xs font-bold text-center leading-snug line-clamp-5">
                            {book.title}
                        </span>
                    </div>
                )}
            </div>

            {/* Botão de Opções (3 pontinhos) — Superior Direito */}
            <div className="absolute top-2 right-2 z-20">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsMenuOpen(!isMenuOpen);
                    }}
                    onPointerDown={(e) => e.stopPropagation()} // Impede que o clique arraste o card
                    className={`cursor-pointer p-2 rounded-full backdrop-blur-sm transition-all shadow-md 
                        ${isDarkMode ? 'bg-slate-800/90 text-slate-200 hover:bg-slate-700' : 'bg-white/90 text-slate-700 hover:bg-slate-100'}
                    `}
                >
                    <SlOptionsVertical size={16} />
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                    <>
                        {/* Fundo invisível para fechar o menu ao clicar fora */}
                        <div
                            className="fixed inset-0 z-10"
                            onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }}
                            onPointerDown={(e) => e.stopPropagation()}
                        />

                        <div className={`absolute top-full right-0 mt-2 w-44 rounded-xl shadow-xl z-20 overflow-hidden border 
                            ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}
                        `}>
                            {/* Opção: Favoritar */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleFavorite(book.id, !book.isFavorite);
                                    setIsMenuOpen(false);
                                }}
                                onPointerDown={(e) => e.stopPropagation()}
                                className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors 
                                    ${isDarkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}
                                `}
                            >
                                {book.isFavorite ? <AiFillStar size={18} className="text-amber-400" /> : <AiOutlineStar size={18} />}
                                {book.isFavorite ? "Desfavoritar" : "Favoritar"}
                            </button>

                            {/* Opção: Excluir */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(book.id);
                                    setIsMenuOpen(false);
                                }}
                                onPointerDown={(e) => e.stopPropagation()}
                                className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors 
                                    ${isDarkMode ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-600'}
                                `}
                            >
                                <FiTrash2 size={18} />
                                Excluir
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Crachá visual da estrela (Opcional: para o usuário ver que está favoritado sem precisar abrir o menu) */}
            {book.isFavorite && (
                <div className="absolute top-2 left-2 z-10 p-1.5 rounded-full bg-amber-400 text-white shadow-md">
                    <AiFillStar size={16} />
                </div>
            )}

            {/* Título e barra de progresso */}
            <div className="px-2 py-2">
                <p
                    className={`truncate font-semibold text-sm ${isDarkMode ? "text-slate-100" : "text-slate-800"
                        }`}
                    title={book.title}
                >
                    {book.title}
                </p>

                {/* Barra de progresso */}
                <div className="flex items-center gap-2 mt-1.5">
                    <div className={`flex-1 h-1.5 rounded-full ${isDarkMode ? "bg-slate-700" : "bg-slate-200"}`}>
                        <div
                            className="h-full bg-violet-600 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    {/* Texto da porcentagem */}
                    <span className={`text-[10px] font-bold ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                        {Math.round(progress)}%
                    </span>
                </div>
            </div>
        </div>
    );
}
