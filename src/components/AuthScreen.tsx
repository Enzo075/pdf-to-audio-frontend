import { useState, useRef, useEffect } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaApple, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

type Mode = 'login' | 'register';

interface AuthScreenProps {
    onForgotPassword: () => void;
}

export default function AuthScreen({ onForgotPassword }: AuthScreenProps) {
    const { login, register, sessionExpiredMessage, clearSessionExpiredMessage } = useAuth();
    const { isDarkMode } = useTheme();

    const [mode, setMode] = useState<Mode>('login');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirm, setRegConfirm] = useState('');

    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

    const firstInputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        firstInputRef.current?.focus();
    }, [mode]);

    const switchMode = (next: Mode) => {
        setMode(next);
        setError('');
    };

    const handleSubmit = async () => {
        setError('');

        if (mode === 'login') {
            if (!loginEmail || !loginPassword) {
                setError('Preencha todos os campos.');
                return;
            }
            setIsSubmitting(true);
            try {
                await login({ email: loginEmail, password: loginPassword });
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : 'Erro ao entrar.');
            } finally {
                setIsSubmitting(false);
            }
        } else {
            if (!regName || !regEmail || !regPassword || !regConfirm) {
                setError('Preencha todos os campos.');
                return;
            }
            if (regPassword !== regConfirm) {
                setError('As senhas não coincidem.');
                return;
            }
            setIsSubmitting(true);
            try {
                await register({ name: regName, email: regEmail, password: regPassword });
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : 'Erro ao cadastrar.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const t = isDarkMode ? 'dark' : 'light';
    const labelClass = `auth-input-label auth-input-label--${t}`;
    const inputClass = `auth-input auth-input--${t}`;
    const eyeClass = `absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-slate-400 hover:text-violet-600 transition-colors`;

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center transition-colors ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>

            {/* Banner de sessão expirada */}
            {sessionExpiredMessage && (
                <div className={`w-full max-w-105 mb-4 flex items-center justify-between gap-3 rounded-xl py-3 px-4 text-sm ${isDarkMode ? 'bg-amber-900 text-amber-100' : 'bg-amber-100 text-amber-900'}`}>
                    <span>{sessionExpiredMessage}</span>
                    <button
                        onClick={clearSessionExpiredMessage}
                        className="shrink-0 font-bold hover:opacity-70 transition-opacity"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Card */}
            <div className={`auth-card auth-card--${t}`}>

                {/* Title inside card */}
                <div className="text-center mb-6">
                    <h1 className={`text-xl font-black tracking-widest uppercase ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`}>
                        PDF TO AUDIO
                    </h1>
                    <p className="text-slate-500 font-semibold text-base mt-1">
                        {mode === 'login' ? 'Login' : 'Criar nova conta'}
                    </p>
                </div>

                {/* Social buttons */}
                <div className="flex flex-col gap-3 mb-2">
                    <button
                        className={`auth-social-btn auth-social-btn--${t}`}
                        onClick={() => { /* TODO: implementar OAuth com Google */ }}
                    >
                        <FcGoogle size={20} />
                        Continuar com Google
                    </button>
                    <button
                        className={`auth-social-btn auth-social-btn--${t}`}
                        onClick={() => { /* TODO: implementar OAuth com Apple */ }}
                    >
                        <FaApple size={20} className={isDarkMode ? 'text-white' : 'text-slate-800'} />
                        Continuar com Apple
                    </button>
                    <button
                        className={`auth-social-btn auth-social-btn--${t}`}
                        onClick={() => { /* TODO: implementar OAuth com Microsoft */ }}
                    >
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
                            alt="Microsoft"
                            className="w-4.5 h-4.5"
                        />
                        Continuar com Microsoft
                    </button>
                </div>

                {/* Divider */}
                <div className="auth-divider">
                    <span className={`auth-divider-line auth-divider-line--${t}`} />
                    <span className={`auth-divider-text auth-divider-text--${t}`}>ou</span>
                    <span className={`auth-divider-line auth-divider-line--${t}`} />
                </div>

                {/* Fields */}
                <div className="flex flex-col gap-2">
                    {mode === 'login' ? (
                        <>
                            <div className="auth-input-group">
                                <input
                                    ref={firstInputRef}
                                    type="email"
                                    className={inputClass}
                                    placeholder=" "
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    disabled={isSubmitting}
                                />
                                <label className={labelClass}>Email</label>
                            </div>

                            <div className="auth-input-group">
                                <input
                                    type={showLoginPassword ? 'text' : 'password'}
                                    className={inputClass}
                                    placeholder=" "
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    disabled={isSubmitting}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                />
                                <label className={labelClass}>Senha</label>
                                <button
                                    type="button"
                                    className={eyeClass}
                                    onClick={() => setShowLoginPassword((v) => !v)}
                                    tabIndex={-1}
                                >
                                    {showLoginPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                </button>
                            </div>

                            {/* Esqueceu a senha: No futuro será implementado */}
                            {/*
                             <div className="flex justify-start">
                                <span
                                    onClick={onForgotPassword}
                                    className={`text-sm cursor-pointer hover:underline ${isDarkMode ? 'text-violet-400 hover:text-violet-300' : 'text-violet-600 hover:text-violet-800'}`}
                                >
                                    Esqueceu a senha?
                                </span>
                            </div>
                            */}
                        </>
                    ) : (
                        <>
                            <div className="auth-input-group">
                                <input
                                    ref={firstInputRef}
                                    type="text"
                                    className={inputClass}
                                    placeholder=" "
                                    value={regName}
                                    onChange={(e) => setRegName(e.target.value)}
                                    disabled={isSubmitting}
                                />
                                <label className={labelClass}>Nome</label>
                            </div>

                            <div className="auth-input-group">
                                <input
                                    type="email"
                                    className={inputClass}
                                    placeholder=" "
                                    value={regEmail}
                                    onChange={(e) => setRegEmail(e.target.value)}
                                    disabled={isSubmitting}
                                />
                                <label className={labelClass}>Email</label>
                            </div>

                            <div className="auth-input-group">
                                <input
                                    type={showRegisterPassword ? 'text' : 'password'}
                                    className={inputClass}
                                    placeholder=" "
                                    value={regPassword}
                                    onChange={(e) => setRegPassword(e.target.value)}
                                    disabled={isSubmitting}
                                />
                                <label className={labelClass}>Senha</label>
                                <button
                                    type="button"
                                    className={eyeClass}
                                    onClick={() => setShowRegisterPassword((v) => !v)}
                                    tabIndex={-1}
                                >
                                    {showRegisterPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                </button>
                            </div>

                            <div className="auth-input-group">
                                <input
                                    type={showRegisterConfirmPassword ? 'text' : 'password'}
                                    className={inputClass}
                                    placeholder=" "
                                    value={regConfirm}
                                    onChange={(e) => setRegConfirm(e.target.value)}
                                    disabled={isSubmitting}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                />
                                <label className={labelClass}>Confirmar senha</label>
                                <button
                                    type="button"
                                    className={eyeClass}
                                    onClick={() => setShowRegisterConfirmPassword((v) => !v)}
                                    tabIndex={-1}
                                >
                                    {showRegisterConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                </button>
                            </div>
                        </>
                    )}

                    {error && (
                        <p className={`auth-error${isDarkMode ? ' auth-error--dark' : ''}`}>{error}</p>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full mt-3 py-3 rounded-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold shadow-sm transition-all"
                    >
                        {isSubmitting
                            ? mode === 'login' ? 'Entrando...' : 'Cadastrando...'
                            : mode === 'login' ? 'Entrar' : 'Criar conta'}
                    </button>
                </div>
            </div>

            {/* Mode switch link — below card */}
            <div className="mt-5 text-sm text-slate-500">
                {mode === 'login' ? (
                    <>
                        Novo por aqui?{' '}
                        <span
                            onClick={() => switchMode('register')}
                            className={`font-bold cursor-pointer hover:underline rounded-full ${isDarkMode ? 'hover:bg-violet-950 px-2 py-1 text-violet-400 hover:text-violet-300' : 'text-violet-600 hover:text-violet-700 hover:bg-violet-200 px-2 py-1'}`}
                        >
                            Cadastrar-se
                        </span>
                    </>
                ) : (
                    <>
                        Já tem conta?{' '}
                        <span
                            onClick={() => switchMode('login')}
                            className={`font-bold cursor-pointer hover:underline rounded-full ${isDarkMode ? 'hover:bg-violet-950 px-2 py-1 text-violet-400 hover:text-violet-300' : 'text-violet-600 hover:text-violet-700 hover:bg-violet-200 px-2 py-1'}`}
                        >
                            Entrar
                        </span>
                    </>
                )}
            </div>

        </div>
    );
}