import { useDropzone } from 'react-dropzone';

// Definindo a constante localmente para evitar erros de importação
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface Props {
    onFileSelect: (file: File) => void;
    disabled: boolean;
}

export const InputArea = ({ onFileSelect, disabled }: Props) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => onFileSelect(acceptedFiles[0]),
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        maxSize: MAX_FILE_SIZE,
        disabled
    });

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div
                {...getRootProps()}
                className={`
          relative group w-full max-w-md h-72 
          flex flex-col items-center justify-center 
          rounded-3xl border-2 border-dashed transition-all duration-500
          cursor-pointer overflow-hidden bg-white
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] shadow-xl'}
          ${isDragActive ? 'border-violet-400 bg-violet-50' : 'border-slate-200 hover:border-violet-500'}
        `}
            >
                <input {...getInputProps()} />
                <div className="z-10 flex flex-col items-center gap-4">
                    <div className="p-4 rounded-full bg-violet-100 text-violet-600 transition-transform group-hover:scale-110">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                    </div>
                    <div className="text-center px-4">
                        <p className="text-lg font-bold text-slate-700">Klai Uploader</p>
                        <p className="text-sm text-slate-400 mt-1">Arraste seu PDF ou clique aqui</p>
                    </div>
                </div>
            </div>
            <p className="mt-6 text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">
                PDF Máximo 10MB
            </p>
        </div>
    );
};