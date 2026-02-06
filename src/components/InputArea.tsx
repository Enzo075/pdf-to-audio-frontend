import { useDropzone } from 'react-dropzone';
import { MAX_FILE_SIZE } from '../config/constants';

interface Props {
    onUpload: (file: File) => void;
    disabled?: boolean;
    isDarkMode: boolean;
}

export const InputArea = ({ onUpload, disabled = false, isDarkMode }: Props) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: ([file]) => file && onUpload(file),
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        maxSize: MAX_FILE_SIZE,
        disabled,
    });

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
        <div {...getRootProps()} className={getDropzoneClasses()}>
            <input {...getInputProps()} />

            <div className="input-area-content">
                <div className="input-area-icon-wrapper">
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
                        Uploader
                    </p>
                    <p className="input-area-subtitle">
                        {isDragActive ? 'Solte o arquivo aqui...' : 'Selecione ou arraste um arquivo PDF'}
                    </p>
                </div>
            </div>
        </div>
    );
};