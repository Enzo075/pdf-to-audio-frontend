import { createContext } from 'react';
import type { LoginRequest, RegisterRequest } from '../lib/authContracts';

export interface AuthUser {
    id: string;
    name: string;
    email: string;
}

export interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);