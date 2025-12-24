import { useState } from 'react';
import { InputArea } from './components/InputArea';
import { AudioPlayer } from './components/AudioPlayer';
import { extractTextFromPDF } from './services/api';
import './App.css';

function App() {
  const [extractedText, setExtractedText] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file: File) => {
    setLoading(true);
    try {
      const result = await extractTextFromPDF(file);
      setExtractedText(result.text);
    } catch (error) {
      console.error("Erro detalhado do processamento:", error);
      alert("Erro ao processar o PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>PDF to Audio 🎧</h1>
      <InputArea onFileSelect={handleUpload} disabled={loading} />

      {loading && <p>Processando seu PDF... aguarde.</p>}

      {extractedText && (
        <div className="result-area">
          <AudioPlayer text={extractedText} />
          <textarea
            readOnly
            value={extractedText}
            style={{ width: '100%', height: '200px', marginTop: '20px' }}
          />
        </div>
      )}
    </div>
  );
}

export default App;