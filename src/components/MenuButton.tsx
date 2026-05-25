import { useState, useEffect, useRef } from 'react';
import { MdLogout } from 'react-icons/md';
import { ThemeSwitch } from './ThemeSwitch';
import { ImBooks } from "react-icons/im";
import { FiMenu } from "react-icons/fi";

interface MenuButtonProps {
    isDarkMode: boolean;
    toggleTheme: () => void;
    onNavigate?: () => void;
    navigateLabel?: string;
    navigateIcon?: React.ReactNode;
    onLogout: () => void;
}

export function MenuButton({
    isDarkMode,
    toggleTheme,
    onNavigate,
    navigateLabel,
    navigateIcon,
    onLogout,
}: MenuButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const t = isDarkMode ? 'dark' : 'light';

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="absolute top-6 right-6 z-50">
            <button
                onClick={() => setIsOpen((v) => !v)}
                className={`menu-btn menu-btn--${t}`}
                aria-label="Menu"
            >
                <FiMenu size={20} />
            </button>

            {isOpen && (
                <div className={`menu-dropdown menu-dropdown--${t}`}>

                    {/* Tema */}
                    <div className={`menu-item menu-item--${t} justify-between`}>
                        <span className="whitespace-nowrap">
                            {isDarkMode ? 'Modo Escuro' : 'Modo Claro'}
                        </span>
                        <ThemeSwitch isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
                    </div>

                    {/* Navegar (opcional) */}
                    {onNavigate && navigateLabel && (
                        <>
                            <div className={`menu-divider menu-divider--${t}`} />
                            <button
                                onClick={() => { onNavigate(); setIsOpen(false); }}
                                className={`menu-item menu-item--${t}`}
                            >
                                {navigateIcon ?? (
                                    <ImBooks size={18} />
                                )}
                                {navigateLabel}
                            </button>
                        </>
                    )}

                    {/* Sair */}
                    <div className={`menu-divider menu-divider--${t}`} />
                    <button
                        onClick={() => { onLogout(); setIsOpen(false); }}
                        className={`menu-item ${isDarkMode ? 'menu-item--danger-dark' : 'menu-item--danger'}`}
                    >
                        <MdLogout size={18} />
                        Sair
                    </button>

                </div>
            )}
        </div>
    );
}