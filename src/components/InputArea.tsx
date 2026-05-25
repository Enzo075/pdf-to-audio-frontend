import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { MAX_FILE_SIZE } from '../config/constants';

interface Props {
    onUpload: (file: File) => void;
    onUploadAndSave?: (file: File) => void;
    disabled?: boolean;
    isDarkMode: boolean;
}

export const InputArea = ({ onUpload, onUploadAndSave, disabled = false, isDarkMode }: Props) => {
    // Quando onUploadAndSave existe, aguardamos o clique de um botão antes de chamar
    const [pendingFile, setPendingFile] = useState<File | null>(null);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: ([file]) => {
            if (!file) return;
            if (onUploadAndSave) {
                // Modo dois botões: segura o arquivo e aguarda escolha do usuário
                setPendingFile(file);
            } else {
                // Modo legado: chama imediatamente
                onUpload(file);
            }
        },
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        maxSize: MAX_FILE_SIZE,
        disabled,
    });

    const handleCarregar = () => {
        if (!pendingFile) return;
        setPendingFile(null);
        onUpload(pendingFile);
    };

    const handleSalvarNaEstante = () => {
        if (!pendingFile || !onUploadAndSave) return;
        const file = pendingFile;
        setPendingFile(null);
        onUploadAndSave(file);
    };

    const getDropzoneClasses = () => {
        const classes = ['input-area-dropzone'];
        if (disabled) {
            classes.push('input-area-dropzone--disabled');
        } else {
            classes.push('input-area-dropzone--enabled');
        }
        if (isDragActive) {
            classes.push('input-area-dropzone--drag-active');
        }
        classes.push(isDarkMode ? 'input-area-dropzone--dark' : 'input-area-dropzone--light');
        return classes.join(' ');
    };

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            <div {...getRootProps()} className={getDropzoneClasses()}>
                <input {...getInputProps()} />

                <div className="input-area-content">
                    <div className={`input-area-icon-wrapper--${isDarkMode ? 'dark' : 'light'}`}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="input-area-icon"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                            />
                        </svg>
                    </div>

                    <div className="input-area-text">
                        <p className={`input-area-title ${isDarkMode ? 'input-area-title--dark' : 'input-area-title--light'}`}>
                            {pendingFile ? pendingFile.name : 'Uploader'}
                        </p>
                        <p className="input-area-subtitle">
                            {pendingFile
                                ? 'Pronto! Escolha uma ação abaixo.'
                                : isDragActive
                                    ? 'Solte o arquivo aqui...'
                                    : 'Selecione ou arraste um arquivo PDF'}
                        </p>
                    </div>
                </div>
            </div>

            {onUploadAndSave && pendingFile && (
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button
                        onClick={handleCarregar}
                        disabled={disabled}
                        className="flex-1 cursor-pointer bg-violet-600 hover:bg-violet-700 text-white rounded-full px-6 py-2 font-bold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Ler o PDF
                    </button>
                    <button
                        onClick={handleSalvarNaEstante}
                        disabled={disabled}
                        className="flex-1 cursor-pointer bg-violet-600 hover:bg-violet-700 text-white rounded-full px-6 py-2 font-bold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Ler e salvar o PDF
                    </button>
                </div>
            )}
        </div>
    );
};