import { useState, useRef, useEffect } from 'react';
import httpClient from '../lib/httpClient';
import { useTheme } from '../hooks/useTheme';

interface ForgotPasswordScreenProps {
    onBack: () => void;
}

export default function ForgotPasswordScreen({ onBack }: ForgotPasswordScreenProps) {
    const { isDarkMode } = useTheme();

    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = async () => {
        setError('');
        if (!email) {
            setError('Preencha o email.');
            return;
        }
        setIsSubmitting(true);
        try {
            await httpClient.post('/api/auth/forgot-password', { email });
            setSuccess(true);
        } catch {
            setError('Erro ao enviar. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const t = isDarkMode ? 'dark' : 'light';

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center transition-colors ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>
            <div className={`auth-card auth-card--${t}`}>
                <div className="text-center mb-6">
                    <h1 className={`text-xl font-black tracking-widest uppercase ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`}>
                        PDF TO AUDIO
                    </h1>
                    <p className="text-slate-500 font-semibold text-base mt-1">
                        Recuperar senha
                    </p>
                </div>

                {success ? (
                    <div className="text-center py-4">
                        <p className={`text-base font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                            Verifique seu email
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Se o email estiver cadastrado, você receberá as instruções para redefinir sua senha em instantes.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <div className="auth-input-group">
                            <input
                                ref={inputRef}
                                type="email"
                                className={`auth-input auth-input--${t}`}
                                placeholder=" "
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isSubmitting}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            />
                            <label className={`auth-input-label auth-input-label--${t}`}>Email</label>
                        </div>

                        {error && (
                            <p className={`auth-error${isDarkMode ? ' auth-error--dark' : ''}`}>{error}</p>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full mt-3 py-3 rounded-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold shadow-sm transition-all"
                        >
                            {isSubmitting ? 'Enviando...' : 'Enviar instruções'}
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