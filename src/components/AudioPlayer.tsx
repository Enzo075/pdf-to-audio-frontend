import { useState } from 'react';

interface Props {
    text: string;
}

export const AudioPlayer = ({ text }: Props) => {
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlayPause = () => {
        if (isPlaying) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
        } else {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'pt-BR';
            utterance.onend = () => setIsPlaying(false);
            window.speechSynthesis.speak(utterance);
            setIsPlaying(true);
        }
    };

    return (
        <div style={{ marginTop: '20px' }}>
            <button onClick={handlePlayPause}>
                {isPlaying ? '⏸ Pausar Áudio' : '▶️ Ouvir Texto'}
            </button>
        </div>
    );
};