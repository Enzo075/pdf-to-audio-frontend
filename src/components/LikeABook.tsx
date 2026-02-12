import { useRef, useCallback, useEffect } from 'react';

interface Props {
    pages: string[];
    currentPageIndex: number;
    readingPageIndex: number;
    readingLineIndex: number;
    bookTitle: string;
    isDarkMode: boolean;
    isPlaying: boolean;
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
    isPlaying,
    onLineSelection,
    onPageChange,
}: Props) => {
    const lastTap = useRef<number>(0);
    const activeLineRef = useRef<HTMLSpanElement>(null);

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

    // Scroll automático quando play/pause é clicado ou linha muda
    useEffect(() => {
        // Só faz scroll se estiver na página correta
        if (
            isPlaying &&
            currentPageIndex === readingPageIndex &&
            activeLineRef.current
        ) {
            activeLineRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [isPlaying, readingLineIndex, currentPageIndex, readingPageIndex]);

    const currentLines = getLines(pages[currentPageIndex]);

    const getLineClasses = (index: number) => {
        const isReading = index === readingLineIndex && currentPageIndex === readingPageIndex;
        const classes = ['book-line'];

        if (isReading) {
            classes.push('book-line--reading');
        } else {
            classes.push(isDarkMode ? 'book-line--dark' : 'book-line--light');
        }

        return classes.join(' ');
    };

    return (
        <div className="book-container">
            <div className={`book-page-wrapper ${isDarkMode ? 'book-page-wrapper--dark' : 'book-page-wrapper--light'}`}>
                <div className="book-content">
                    {currentLines.map((line, index) => {
                        const isActiveReadingLine = index === readingLineIndex && currentPageIndex === readingPageIndex;

                        return (
                            <span
                                key={index}
                                ref={isActiveReadingLine ? activeLineRef : null}
                                onDoubleClick={() => onLineSelection(index)}
                                onTouchEnd={() => handleTouch(index)}
                                className={getLineClasses(index)}
                            >
                                {line}
                            </span>
                        );
                    })}
                </div>

                <div className="book-footer">
                    <span className="book-title">{bookTitle}</span>
                    <span>
                        Página {currentPageIndex + 1} de {pages.length}
                    </span>
                </div>
            </div>

            {/* Page Navigation */}
            <div className="book-navigation">
                <div className="book-navigation-controls">
                    <span className="book-navigation-label">Página</span>
                    <input
                        type="number"
                        value={currentPageIndex + 1}
                        onChange={(e) => {
                            const page = parseInt(e.target.value) - 1;
                            if (!isNaN(page) && page >= 0 && page < pages.length) {
                                onPageChange(page);
                            }
                        }}
                        className={`book-navigation-input ${isDarkMode ? 'book-navigation-input--dark' : 'book-navigation-input--light'}`}
                    />
                    <span className="book-navigation-label">de {pages.length}</span>
                </div>
            </div>
        </div>
    );
};