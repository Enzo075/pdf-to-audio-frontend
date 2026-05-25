import { useState, useEffect } from "react";
import httpClient from "../lib/httpClient";
import type { Book } from "../types/book";

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Busca todos os livros do usuário ──────────────────────────────────────
  const fetchBooks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await httpClient.get<Book[]>("/api/books");
      const sorted = [...response.data].sort((a, b) => a.position - b.position);
      setBooks(sorted);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar a estante.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // ─── Faz upload do PDF (com ou sem salvar na estante) ──────────────────────
  const uploadBook = async (file: File, saveToShelf: boolean) => {
    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("saveToShelf", saveToShelf ? "true" : "false");

    const response = await httpClient.post("/api/books", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // Se salvou na estante, recarrega a lista
    if (saveToShelf && response.data?.book) {
      setBooks((prev) => {
        const exists = prev.find((b) => b.id === response.data.book.id);
        if (exists) return prev;
        return [...prev, response.data.book].sort(
          (a, b) => a.position - b.position,
        );
      });
    }

    return response.data;
  };

  // ─── Atualiza progresso de leitura ─────────────────────────────────────────
  const updateProgress = async (
    bookId: string,
    lastPageRead: number,
    lastLineRead: number,
  ) => {
    try {
      const response = await httpClient.patch<Book>(
        `/api/books/${bookId}/progress`,
        { lastPageRead, lastLineRead },
      );
      setBooks((prev) =>
        prev.map((b) => (b.id === bookId ? response.data : b)),
      );
    } catch (err) {
      console.warn("[useBooks] Falha ao salvar progresso:", err);
    }
  };

  // ─── Reordena com optimistic update ────────────────────────────────────────
  const reorderBooks = async (newOrder: Book[]) => {
    // Feedback visual imediato — não bloqueia a UI
    setBooks(newOrder);

    const payload = newOrder.map((b, index) => ({ id: b.id, position: index }));

    try {
      await httpClient.patch("/api/books/reorder", { books: payload });
    } catch (err) {
      console.warn("[useBooks] Falha ao reordenar. Recarregando lista...", err);
      // Em caso de erro, ressincroniza com o servidor
      fetchBooks();
    }
  };

  // ─── Favoritar livro ───────────────────────────────────────────────────────

  const toggleFavorite = async (bookId: string, isFavorite: boolean) => {
    // Atualização otimista: muda na tela antes de ir ao servidor
    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, isFavorite } : b)),
    );

    try {
      await httpClient.patch(`/api/books/${bookId}/favorite`, { isFavorite });
    } catch (err) {
      console.warn("[useBooks] Falha ao favoritar:", err);
      fetchBooks(); // Se der erro no servidor, recarrega a lista original
    }
  };

  // ─── Remove livro ──────────────────────────────────────────────────────────
  const deleteBook = async (bookId: string) => {
    // Optimistic update: remove localmente antes de confirmar no servidor
    setBooks((prev) => prev.filter((b) => b.id !== bookId));

    try {
      await httpClient.delete(`/api/books/${bookId}`);
    } catch (err) {
      console.warn("[useBooks] Falha ao deletar. Recarregando lista...", err);
      fetchBooks();
    }
  };

  return {
    books,
    isLoading,
    error,
    fetchBooks,
    uploadBook,
    updateProgress,
    reorderBooks,
    toggleFavorite,
    deleteBook,
  };
}
