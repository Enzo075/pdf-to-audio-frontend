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

    return (
        <div
            {...getRootProps()}
            className={`
        relative group w-full h-80 flex flex-col items-center justify-center 
        rounded-3xl border-2 border-dashed transition-all duration-500 cursor-pointer overflow-hidden
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] shadow-xl'}
        ${isDragActive ? 'border-violet-400 bg-violet-500/10' : ''}
        ${isDarkMode
                    ? 'border-slate-800 bg-slate-900/50 hover:border-violet-500'
                    : 'border-slate-200 bg-white hover:border-violet-500'
                }
      `}
        >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center gap-4">
                <div className="p-5 rounded-full bg-violet-100 text-violet-600">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10"
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

                <div className="text-center">
                    <p className={`text-lg font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                        Uploader
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                        {isDragActive ? 'Solte o arquivo aqui...' : 'Selecione ou arraste um arquivo PDF'}
                    </p>
                </div>
            </div>
        </div>
    );
};