export interface Book {
  id: string;
  title: string;
  fileUrl: string;
  coverUrl: string | null;
  totalLines: number;
  totalPages: number;
  lastLineRead: number;
  lastPageRead: number;
  isFavorite: boolean;
  position: number;
  createdAt: string;
  userId: string;
}
