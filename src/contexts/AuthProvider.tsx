import { useState } from 'react';
import { AuthContext } from './auth.context';
import type { AuthUser, AuthContextValue } from './auth.context';
import type { LoginRequest, RegisterRequest } from '../lib/authContracts';

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

    const login = (data: LoginRequest): Promise<void> =>
        new Promise((resolve, reject) => {
            setTimeout(() => {
                if (data.password.length < 6) {
                    reject(new Error('Credenciais inválidas'));
                    return;
                }
                const userData: AuthUser = { id: '1', name: 'Usuário', email: data.email };
                localStorage.setItem('accessToken', 'mock-token');
                localStorage.setItem('refreshToken', 'mock-refresh');
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                resolve();
            }, 800);
        });

    const register = (data: RegisterRequest): Promise<void> =>
        new Promise((resolve, reject) => {
            setTimeout(() => {
                if (data.email === 'teste@teste.com') {
                    reject(new Error('Email já cadastrado'));
                    return;
                }
                const userData: AuthUser = { id: '1', name: data.name, email: data.email };
                localStorage.setItem('accessToken', 'mock-token');
                localStorage.setItem('refreshToken', 'mock-refresh');
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                resolve();
            }, 800);
        });

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
    };

    const value: AuthContextValue = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}