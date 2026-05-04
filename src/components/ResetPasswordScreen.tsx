import { useState, useRef, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useTheme } from '../hooks/useTheme';
import httpClient from '../lib/httpClient';
import axios from 'axios';

interface ResetPasswordScreenProps {
    onBack: () => void;
}

export default function ResetPasswordScreen({ onBack }: ResetPasswordScreenProps) {
    const { isDarkMode } = useTheme();

    const token = window.location.pathname.split('/reset-password/')[1] ?? '';

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = async () => {
        setError('');
        if (!newPassword || !confirmPassword) {
            setError('Preencha todos os campos.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        if (!token) {
            setError('Token inválido. Solicite um novo link.');
            return;
        }
        setIsSubmitting(true);
        try {
            await httpClient.post(`/api/auth/reset-password/${token}`, { newPassword });
            setSuccess(true);
        } catch (e: unknown) {
            let message = 'Erro ao redefinir senha. Tente novamente.';

            if (axios.isAxiosError(e)) {
                message = e.response?.data?.error || message;
            }

            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const t = isDarkMode ? 'dark' : 'light';
    const eyeClass = `absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-slate-400 hover:text-violet-600 transition-colors`;

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center transition-colors ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>
            <div className={`auth-card auth-card--${t}`}>
                <div className="text-center mb-6">
                    <h1 className={`text-xl font-black tracking-widest uppercase ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`}>
                        PDF TO AUDIO
                    </h1>
                    <p className="text-slate-500 font-semibold text-base mt-1">
                        Nova senha
                    </p>
                </div>

                {success ? (
                    <div className="text-center py-4">
                        <p className={`text-base font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                            Senha alterada com sucesso
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Você já pode entrar com sua nova senha.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <div className="auth-input-group">
                            <input
                                ref={inputRef}
                                type={showNew ? 'text' : 'password'}
                                className={`auth-input auth-input--${t}`}
                                placeholder=" "
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={isSubmitting}
                            />
                            <label className={`auth-input-label auth-input-label--${t}`}>Nova senha</label>
                            <button
                                type="button"
                                className={eyeClass}
                                onClick={() => setShowNew((v) => !v)}
                                tabIndex={-1}
                            >
                                {showNew ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                            </button>
                        </div>

                        <div className="auth-input-group">
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                className={`auth-input auth-input--${t}`}
                                placeholder=" "
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isSubmitting}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            />
                            <label className={`auth-input-label auth-input-label--${t}`}>Confirmar senha</label>
                            <button
                                type="button"
                                className={eyeClass}
                                onClick={() => setShowConfirm((v) => !v)}
                                tabIndex={-1}
                            >
                                {showConfirm ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                            </button>
                        </div>

                        {error && (
                            <p className={`auth-error${isDarkMode ? ' auth-error--dark' : ''}`}>{error}</p>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full mt-3 py-3 rounded-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold shadow-sm transition-all"
                        >
                            {isSubmitting ? 'Salvando...' : 'Redefinir senha'}
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-5 text-sm text-slate-500">
                <span
                    onClick={onBack}
                    className={`font-bold cursor-pointer ${isDarkMode ? 'text-violet-400 hover:text-violet-300' : 'text-violet-600 hover:text-violet-700'}`}
                >
                    Voltar ao login
                </span>
            </div>
        </div>
    );
}