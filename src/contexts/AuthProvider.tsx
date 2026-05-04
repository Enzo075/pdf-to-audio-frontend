import { useState, useEffect } from 'react';
import { AuthContext } from './auth.context';
import type { AuthUser, AuthContextValue } from './auth.context';
import type { LoginRequest, RegisterRequest } from '../lib/authContracts';
import httpClient from '../lib/httpClient';
import axios from 'axios';

function readUserFromStorage(): AuthUser | null {
    const token = localStorage.getItem('accessToken');
    const raw = localStorage.getItem('user');
    if (!token || !raw) return null;
    try {
        return JSON.parse(raw) as AuthUser;
    } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        return null;
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(readUserFromStorage);
    const [isLoading] = useState(false);
    const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);

    useEffect(() => {
        const handleSessionExpired = () => {
            setUser(null);
            setSessionExpiredMessage('Sua sessão expirou. Por favor, entre novamente.');
        };
        window.addEventListener('auth:session-expired', handleSessionExpired);
        return () => {
            window.removeEventListener('auth:session-expired', handleSessionExpired);
        };
    }, []);

    const login = async (data: LoginRequest): Promise<void> => {
        try {
            const response = await httpClient.post('/api/auth/login', data);
            const { accessToken, user: userData } = response.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                const message = error.response?.data?.error;

                if (status === 401 || status === 409) {
                    throw new Error(message ?? 'Credenciais inválidas.');
                }
            }
            throw new Error('Erro ao entrar. Tente novamente.');
        }
    };

    const register = async (data: RegisterRequest): Promise<void> => {
        try {
            const response = await httpClient.post('/api/auth/register', data);
            if (response.status !== 201) throw new Error();
            const { accessToken, user: userData } = response.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                const message = error.response?.data?.error;

                if (status === 401 || status === 409) {
                    throw new Error(message ?? 'Credenciais inválidas.');
                }
            }
            throw new Error('Erro ao entrar. Tente novamente.');
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await httpClient.post('/api/auth/logout');
        } catch {
            // ignorar erro de logout
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setUser(null);
    };

    const clearSessionExpiredMessage = () => setSessionExpiredMessage(null);

    const value: AuthContextValue = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        sessionExpiredMessage,
        clearSessionExpiredMessage,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}