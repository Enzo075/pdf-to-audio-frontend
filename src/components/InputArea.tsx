import { useDropzone } from 'react-dropzone';
import { MAX_FILE_SIZE } from '../config/constants';

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
        <div {...getRootProps()} style={{
            border: '2px dashed #646cff',
            padding: '40px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            backgroundColor: isDragActive ? '#2a2a2a' : 'transparent',
            borderRadius: '12px'
        }}>
            <input {...getInputProps()} />
            {isDragActive ?
                <p>Solte o PDF aqui...</p> :
                <p>
                    Arraste um PDF ou clique para selecionar (Apenas 1 arquivo)
                </p>
            }
        </div>
    );
};