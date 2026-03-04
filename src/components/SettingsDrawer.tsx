import { useState, useEffect } from 'react';
import { ThemeSwitch } from './ThemeSwitch';
import { useReadingEngine } from '../hooks/useReadingEngine';
import type { TTSProvider } from '../contexts/reading.context';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    isDarkMode: boolean;
    toggleTheme: () => void;
    playbackRate: number;
    onPlaybackRateChange: (rate: number) => void;
    isPlaying: boolean;
    onPause: () => void;
    registerOnPlayStart: (cb: () => void) => () => void;
}

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

const PROVIDERS: { value: TTSProvider; label: string }[] = [
    { value: 'google', label: 'Google Cloud TTS' },
    { value: 'openai', label: 'OpenAI TTS' },
    { value: 'azure', label: 'Azure TTS' },
];

const NO_PROVIDER = '' as const;

export const SettingsDrawer = ({
    isOpen,
    onClose,
    isDarkMode,
    toggleTheme,
    playbackRate,
    onPlaybackRateChange,
    isPlaying,
    onPause,
    registerOnPlayStart,
}: Props) => {
    const {
        readingEngine,
        setReadingEngine,
        setApiProvider,
        setApiKey,
        apiKeyError,
        setApiKeyError,
    } = useReadingEngine();

    const [selectedProvider, setSelectedProvider] = useState<TTSProvider | typeof NO_PROVIDER>(NO_PROVIDER);
    const [keyDraft, setKeyDraft] = useState('');
    const [justApplied, setJustApplied] = useState(false);
    const [appliedKey, setAppliedKey] = useState<string | null>(null);

    const hasError =
        typeof appliedKey === 'string' &&
        appliedKey.length > 0 &&
        !!apiKeyError &&
        keyDraft === appliedKey;

    useEffect(() => {
        return registerOnPlayStart(() => setJustApplied(false));
    }, [registerOnPlayStart]);

    const isProviderSelected = selectedProvider !== NO_PROVIDER;
    const isApplyEnabled = isProviderSelected && keyDraft.trim().length > 0 && keyDraft.trim() !== appliedKey;

    useEffect(() => {
        if (isPlaying && readingEngine === 'api' && selectedProvider === NO_PROVIDER) {
            setReadingEngine('browser');
        }
    }, [isPlaying]);

    const inputBorderClass = (() => {
        if (!isProviderSelected) {
            return isDarkMode
                ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed';
        }
        if (hasError) {
            return 'bg-transparent border-red-500 text-red-400 ring-2 ring-red-500/30';
        }
        if (justApplied) {
            return 'bg-transparent border-green-500 text-green-400 ring-2 ring-green-500/30';
        }
        return isDarkMode
            ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500'
            : 'bg-white border-slate-300 text-slate-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-500';
    })();

    const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedProvider(e.target.value as TTSProvider | typeof NO_PROVIDER);
        setKeyDraft('');
        setJustApplied(false);
        setAppliedKey(null);
    };

    const handleApply = () => {
        if (!keyDraft.trim() || !isProviderSelected) return;
        if (isPlaying) onPause();
        setApiProvider(selectedProvider as TTSProvider);
        setApiKey(keyDraft.trim());
        setJustApplied(true);
        setAppliedKey(keyDraft.trim());
        setApiKeyError(null);
    };

    const btnBase = 'p-3 rounded-xl border font-bold text-sm transition-all';
    const btnActive = isDarkMode
        ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/30'
        : 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20';
    const btnInactive = isDarkMode
        ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';
    const btnDisabled = isDarkMode
        ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
        : 'bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed';

    if (!isOpen) return null;

    return (
        <>
            <div className="settings-drawer-overlay" onClick={onClose} aria-hidden="true" />

            <div className={`settings-drawer ${isDarkMode ? 'settings-drawer--dark' : 'settings-drawer--light'}`}>
                <div className="settings-drawer-header">
                    <h2 className={`settings-drawer-title ${isDarkMode ? 'settings-drawer-title--dark' : 'settings-drawer-title--light'}`}>
                        Configurações
                    </h2>
                    <button onClick={onClose} className="settings-drawer-close-btn" aria-label="Fechar configurações">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="settings-drawer-close-icon">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="settings-drawer-content">

                    <div className="settings-section">
                        <h3 className={`settings-section-title ${isDarkMode ? 'settings-section-title--dark' : 'settings-section-title--light'}`}>
                            Tema
                        </h3>
                        <div className="settings-section-content">
                            <div
                                className="flex items-center justify-between p-4 rounded-xl border shadow-sm transition-all"
                                style={{ backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc', borderColor: isDarkMode ? '#475569' : '#e2e8f0' }}
                            >
                                <span className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                                    {isDarkMode ? 'Modo Escuro' : 'Modo Claro'}
                                </span>
                                <ThemeSwitch isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
                            </div>
                        </div>
                    </div>
                    <div className="settings-section">
                        <h3 className={`settings-section-title ${isDarkMode ? 'settings-section-title--dark' : 'settings-section-title--light'}`}>
                            Velocidade de Áudio
                        </h3>
                        <div className="settings-section-content">
                            <div className="grid grid-cols-3 gap-2">
                                {PLAYBACK_RATES.map((rate) => (
                                    <button
                                        key={rate}
                                        onClick={() => onPlaybackRateChange(rate)}
                                        className={`${btnBase} ${playbackRate === rate ? btnActive : btnInactive}`}
                                    >
                                        {rate}x
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h3 className={`settings-section-title ${isDarkMode ? 'settings-section-title--dark' : 'settings-section-title--light'}`}>
                            Engine de Leitura
                        </h3>
                        <div className="settings-section-content">
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setReadingEngine('browser')}
                                    className={`${btnBase} ${readingEngine === 'browser' ? btnActive : btnInactive}`}
                                >
                                    Navegador
                                </button>
                                <button
                                    onClick={() => setReadingEngine('api')}
                                    className={`${btnBase} ${readingEngine === 'api' ? btnActive : btnInactive}`}
                                >
                                    Usar API
                                </button>
                            </div>
                        </div>
                    </div>

                    {readingEngine === 'api' && (
                        <div className="settings-section">
                            <h3 className={`settings-section-title ${isDarkMode ? 'settings-section-title--dark' : 'settings-section-title--light'}`}>
                                Configurar API
                            </h3>
                            <div className="settings-section-content flex flex-col gap-3">

                                <select
                                    value={selectedProvider}
                                    onChange={handleProviderChange}
                                    className={`w-full p-3 rounded-xl border font-semibold text-sm transition-all appearance-none cursor-pointer
                                        ${isDarkMode
                                            ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500'
                                            : 'bg-white border-slate-300 text-slate-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-500'
                                        }`}
                                >
                                    <option value={NO_PROVIDER} disabled>Selecione o provider</option>
                                    {PROVIDERS.map((p) => (
                                        <option key={p.value} value={p.value}>{p.label}</option>
                                    ))}
                                </select>

                                <input
                                    type="password"
                                    value={keyDraft}
                                    onChange={(e) => setKeyDraft(e.target.value)}
                                    disabled={!isProviderSelected}
                                    placeholder={isProviderSelected ? 'Cole sua API Key aqui' : 'Selecione um provider primeiro'}
                                    className={`w-full p-3 rounded-xl border font-mono text-sm transition-all ${inputBorderClass}`}
                                />

                                <button
                                    onClick={handleApply}
                                    disabled={!isApplyEnabled}
                                    className={`w-full p-3 rounded-xl border font-bold text-sm transition-all
                                        ${isApplyEnabled
                                            ? 'bg-violet-600 border-violet-500 text-white hover:bg-violet-700 shadow-lg shadow-violet-500/20 cursor-pointer'
                                            : btnDisabled
                                        }`}
                                >
                                    Aplicar
                                </button>

                            </div>
                        </div>
                    )}

                </div>
            </div>
        </>
    );
};