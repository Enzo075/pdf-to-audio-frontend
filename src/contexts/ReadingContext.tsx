import { useState } from 'react';
import type { ReactNode } from 'react';
import { ReadingContext } from './reading.context';
import type { ReadingEngine, TTSProvider, ApiKeyError } from './reading.context';

const STORAGE_KEY_ENGINE = 'reading-engine';
const STORAGE_KEY_PROVIDER = 'reading-provider';

export function ReadingProvider({ children }: { children: ReactNode }) {
    const [readingEngine, setReadingEngineState] = useState<ReadingEngine>(() => {
        const stored = localStorage.getItem(STORAGE_KEY_ENGINE);
        return (stored === 'browser' || stored === 'api') ? stored : 'browser';
    });

    const [apiProvider, setApiProviderState] = useState<TTSProvider>(() => {
        const stored = localStorage.getItem(STORAGE_KEY_PROVIDER);
        return (stored === 'openai' || stored === 'google' || stored === 'azure') ? stored : 'google';
    });

    const [apiKey, setApiKeyState] = useState<string>('');

    const [apiKeyError, setApiKeyError] = useState<ApiKeyError>(null);

    const setReadingEngine = (engine: ReadingEngine) => {
        setReadingEngineState(engine);
        localStorage.setItem(STORAGE_KEY_ENGINE, engine);
    };

    const setApiProvider = (provider: TTSProvider) => {
        setApiProviderState(provider);
        localStorage.setItem(STORAGE_KEY_PROVIDER, provider);
    };

    const setApiKey = (key: string) => {
        setApiKeyState(key);
    };

    return (
        <ReadingContext.Provider value={{
            readingEngine,
            setReadingEngine,
            apiProvider,
            setApiProvider,
            apiKey,
            setApiKey,
            apiKeyError,
            setApiKeyError,
        }}>
            {children}
        </ReadingContext.Provider>
    );
}