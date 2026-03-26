import { useState, useEffect } from 'react';
import { ThemeSwitch } from './ThemeSwitch';
import { useReadingEngine } from '../hooks/useReadingEngine';
import type { TTSProvider } from '../contexts/reading.context';

import * as Select from '@radix-ui/react-select';
import { ChevronDownIcon } from '@radix-ui/react-icons';

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

    const handleEngineChange = (engine: 'browser' | 'api') => {
        if (isPlaying) {
            window.speechSynthesis.cancel();
            onPause();
        }
        setReadingEngine(engine);
    };

    const getInputClass = () => {
        if (!isProviderSelected) {
            return `settings-api-input settings-api-input--disabled-${isDarkMode ? 'dark' : 'light'}`;
        }
        if (hasError) return 'settings-api-input settings-api-input--error';
        if (justApplied) return 'settings-api-input settings-api-input--success';
        return `settings-api-input settings-api-input--${isDarkMode ? 'dark' : 'light'}`;
    };

    const getRateBtnClass = (rate: number) => {
        if (playbackRate === rate) return 'settings-rate-btn settings-rate-btn--active';
        return `settings-rate-btn settings-rate-btn--inactive-${isDarkMode ? 'dark' : 'light'}`;
    };

    const getEngineBtnClass = (engine: 'browser' | 'api') => {
        if (readingEngine === engine) return 'settings-rate-btn settings-rate-btn--active';
        return `settings-rate-btn settings-rate-btn--inactive-${isDarkMode ? 'dark' : 'light'}`;
    };

    const getApplyBtnClass = () => {
        if (isApplyEnabled) return 'settings-apply-btn settings-apply-btn--enabled';
        return `settings-apply-btn settings-apply-btn--disabled-${isDarkMode ? 'dark' : 'light'}`;
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

    if (!isOpen) return null;

    return (
        <>
            <div className="settings-drawer-overlay" onClick={onClose} aria-hidden="true" />

            <div className={`settings-drawer settings-drawer--${isDarkMode ? 'dark' : 'light'}`}>
                <div className="settings-drawer-header">
                    <h2 className={`settings-drawer-title settings-drawer-title--${isDarkMode ? 'dark' : 'light'}`}>
                        Configurações
                    </h2>
                    <button
                        onClick={onClose}
                        className={`settings-drawer-close-btn settings-drawer-close-btn--${isDarkMode ? 'dark' : 'light'}`}
                        aria-label="Fechar configurações"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className={`settings-drawer-close-icon--${isDarkMode ? 'dark' : 'light'}`}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="settings-drawer-content">

                    {/* Tema */}
                    <div className="settings-section">
                        <h3 className={`settings-section-title settings-section-title--${isDarkMode ? 'dark' : 'light'}`}>
                            Tema
                        </h3>
                        <div className="settings-section-content">
                            <div className={`settings-theme-row settings-theme-row--${isDarkMode ? 'dark' : 'light'}`}>
                                <span className={`settings-theme-row-label settings-theme-row-label--${isDarkMode ? 'dark' : 'light'}`}>
                                    {isDarkMode ? 'Modo Escuro' : 'Modo Claro'}
                                </span>
                                <ThemeSwitch isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
                            </div>
                        </div>
                    </div>

                    {/* Velocidade de Áudio */}
                    <div className="settings-section">
                        <h3 className={`settings-section-title settings-section-title--${isDarkMode ? 'dark' : 'light'}`}>
                            Velocidade de Áudio
                        </h3>
                        <div className="settings-section-content">
                            <div className="settings-grid-3">
                                {PLAYBACK_RATES.map((rate) => (
                                    <button
                                        key={rate}
                                        onClick={() => onPlaybackRateChange(rate)}
                                        className={getRateBtnClass(rate)}
                                    >
                                        {rate}x
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Engine de Leitura */}
                    <div className="settings-section">
                        <h3 className={`settings-section-title settings-section-title--${isDarkMode ? 'dark' : 'light'}`}>
                            Engine de Leitura
                        </h3>
                        <div className="settings-section-content">
                            <div className="settings-grid-2">
                                <button
                                    onClick={() => handleEngineChange('browser')}
                                    className={getEngineBtnClass('browser')}
                                >
                                    Navegador
                                </button>
                                <button
                                    onClick={() => handleEngineChange('api')}
                                    className={getEngineBtnClass('api')}
                                >
                                    Usar API
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Configurar API */}
                    {readingEngine === 'api' && (
                        <div className="settings-section">
                            <h3 className={`settings-section-title settings-section-title--${isDarkMode ? 'dark' : 'light'}`}>
                                Configurar API
                            </h3>
                            <div className="settings-section-content flex flex-col gap-3">

                                <Select.Root
                                    value={selectedProvider}
                                    onValueChange={(value) => {
                                        const newProvider = value as TTSProvider | typeof NO_PROVIDER;
                                        if (isPlaying) onPause();
                                        setApiKey('');
                                        setApiKeyError(null);
                                        setSelectedProvider(newProvider);
                                        setKeyDraft('');
                                        setJustApplied(false);
                                        setAppliedKey(null);
                                    }}
                                >
                                    <Select.Trigger
                                        className={`select-trigger ${selectedProvider
                                            ? isDarkMode
                                                ? 'select-trigger--selected-dark'
                                                : 'select-trigger--selected-light'
                                            : isDarkMode
                                                ? 'select-trigger--dark'
                                                : 'select-trigger--light'
                                            }`}
                                        aria-label="Selecione o provider de TTS"
                                    >
                                        <Select.Value placeholder="Selecione o provider" />
                                        <Select.Icon className="select-icon">
                                            <ChevronDownIcon />
                                        </Select.Icon>
                                    </Select.Trigger>

                                    <Select.Content
                                        className={`select-content select-content--${isDarkMode ? 'dark' : 'light'}`}
                                        position="popper"
                                        sideOffset={6}
                                    >
                                        <Select.Viewport className="select-viewport">
                                            {PROVIDERS.map((p) => (
                                                <Select.Item
                                                    key={p.value}
                                                    value={p.value}
                                                    className={`select-item select-item--${isDarkMode ? 'dark' : 'light'}`}
                                                >
                                                    <Select.ItemText>{p.label}</Select.ItemText>
                                                </Select.Item>
                                            ))}
                                        </Select.Viewport>
                                    </Select.Content>
                                </Select.Root>

                                <input
                                    type="password"
                                    value={keyDraft}
                                    onChange={(e) => setKeyDraft(e.target.value)}
                                    disabled={!isProviderSelected}
                                    placeholder={
                                        isProviderSelected
                                            ? 'Cole sua API Key aqui'
                                            : 'Selecione um provider primeiro'
                                    }
                                    className={getInputClass()}
                                />

                                <button
                                    onClick={handleApply}
                                    disabled={!isApplyEnabled}
                                    className={getApplyBtnClass()}
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