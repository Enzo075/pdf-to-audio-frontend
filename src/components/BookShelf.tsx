import {
    DndContext,
    PointerSensor,
    KeyboardSensor,
    useSensors,
    useSensor,
    closestCenter,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import { BookCard } from "./BookCard";
import type { Book } from "../types/book";
import { FaPlus } from "react-icons/fa";

interface Props {
    books: Book[];
    onBookSelect: (book: Book) => void;
    onAddNew: () => void;
    onReorder: (newOrder: Book[]) => void;
    onToggleFavorite: (bookId: string, isFavorite: boolean) => void;
    onDelete: (bookId: string) => void;
    isDarkMode: boolean;
    toggleTheme: () => void;
    onLogout: () => void;
}

export function BookShelf({
    books,
    onBookSelect,
    onAddNew,
    onReorder,
    onToggleFavorite,
    onDelete,
    isDarkMode,
}: Props) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            // Exige arrastar pelo menos 8px para não conflitar com o onClick
            activationConstraint: { distance: 8 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = books.findIndex((b) => b.id === active.id);
        const newIndex = books.findIndex((b) => b.id === over.id);
        const reordered = arrayMove(books, oldIndex, newIndex);
        onReorder(reordered);
    };

    return (
        <div
            className={`
        min-h-screen w-full flex flex-col transition-colors duration-500
        ${isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}
      `}
        >
            {/* Header da estante */}
            <div className="w-full max-w-6xl mx-auto px-4 pt-8 pb-4 flex items-center justify-between">
                <h1 className="text-2xl font-black tracking-tight">
                    Minha Estante
                </h1>
                <button
                    onClick={onAddNew}
                    className="flex cursor-pointer items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-full px-4 py-2 text-sm font-bold transition-all active:scale-95 shadow-md"
                >
                    <FaPlus size={12} />
                    Ler ou adicionar um PDF
                </button>
            </div>

            {/* Conteúdo */}
            <div className="w-full max-w-6xl mx-auto px-4 pb-16 flex-1">
                {books.length === 0 ? (
                    /* Estado vazio */
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <p className={`text-sm font-semibold ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                            Nenhum livro na estante ainda
                        </p>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={books.map((b) => b.id)}
                            strategy={rectSortingStrategy}
                        >
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-2">
                                {books.map((book) => (
                                    <BookCard
                                        key={book.id}
                                        book={book}
                                        onSelect={onBookSelect}
                                        onToggleFavorite={onToggleFavorite}
                                        onDelete={onDelete}
                                        isDarkMode={isDarkMode}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>
        </div>
    );
}
