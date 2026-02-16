import { ThemeSwitch } from './ThemeSwitch';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    isDarkMode: boolean;
    toggleTheme: () => void;
}

export const SettingsDrawer = ({
    isOpen,
    onClose,
    isDarkMode,
    toggleTheme,
}: Props) => {
    if (!isOpen) return null;

    return (
        <>
            <div
                className="settings-drawer-overlay"
                onClick={onClose}
                aria-hidden="true"
            />

            <div className={`settings-drawer ${isDarkMode ? 'settings-drawer--dark' : 'settings-drawer--light'}`}>
                <div className="settings-drawer-header">
                    <h2 className={`settings-drawer-title ${isDarkMode ? 'settings-drawer-title--dark' : 'settings-drawer-title--light'}`}>
                        Configurações
                    </h2>
                    <button
                        onClick={onClose}
                        className="settings-drawer-close-btn"
                        aria-label="Fechar configurações"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="settings-drawer-close-icon"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <div className="settings-drawer-content">
                    <div className="settings-section">
                        <h3 className={`settings-section-title ${isDarkMode ? 'settings-section-title--dark' : 'settings-section-title--light'}`}>
                            Tema
                        </h3>
                        <div className="settings-section-content">
                            <div className="flex items-center justify-between p-4 rounded-xl border shadow-sm transition-all"
                                style={{ backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc', borderColor: isDarkMode ? '#475569' : '#e2e8f0' }}>
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
                            <div className={`settings-placeholder ${isDarkMode ? 'settings-placeholder--dark' : 'settings-placeholder--light'}`}>
                                <p className="settings-placeholder-text">
                                    Controle de velocidade será implementado em breve
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h3 className={`settings-section-title ${isDarkMode ? 'settings-section-title--dark' : 'settings-section-title--light'}`}>
                            API de Leitura Externa
                        </h3>
                        <div className="settings-section-content">
                            <div className={`settings-placeholder ${isDarkMode ? 'settings-placeholder--dark' : 'settings-placeholder--light'}`}>
                                <p className="settings-placeholder-text">
                                    Integração com APIs externas será implementada em breve
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};