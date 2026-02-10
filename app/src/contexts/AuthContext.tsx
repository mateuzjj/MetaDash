import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import api from '../services/api';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: 'admin' | 'analyst' | 'viewer';
    tenantId: string;
}

interface Tenant {
    id: string;
    name: string;
    subdomain: string;
    status: 'active' | 'trial' | 'suspended' | 'cancelled';
    plan: 'free' | 'starter' | 'professional' | 'enterprise';
    settings: {
        timezone?: string;
        currency?: string;
        language?: string;
        limits?: {
            users?: number;
            connectors?: number;
            dataRetentionDays?: number;
        };
    };
}

interface AuthContextType {
    user: User | null;
    tenant: Tenant | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        tenantName?: string;
    }) => Promise<void>;
    loginWithGoogle: () => void;
    logout: () => void;
    refreshTenant: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isAuthenticated = !!user && !api.isTokenExpired();

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && !api.isTokenExpired()) {
            try {
                setUser(JSON.parse(storedUser));
                loadTenant();
            } catch {
                api.clearTokens();
            }
        }
        setIsLoading(false);
    }, []);

    // Listen for auth events
    useEffect(() => {
        const handleExpired = () => {
            setUser(null);
            setTenant(null);
            setError('Session expired. Please login again.');
        };

        const handleLogout = () => {
            setUser(null);
            setTenant(null);
            setError(null);
        };

        window.addEventListener('auth:expired', handleExpired);
        window.addEventListener('auth:logout', handleLogout);

        return () => {
            window.removeEventListener('auth:expired', handleExpired);
            window.removeEventListener('auth:logout', handleLogout);
        };
    }, []);

    const loadTenant = async () => {
        try {
            const tenantData = await api.getCurrentTenant();
            setTenant(tenantData);
            localStorage.setItem('tenant', JSON.stringify(tenantData));
        } catch (err) {
            console.error('Failed to load tenant:', err);
        }
    };

    const login = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await api.login(email, password);
            setUser(result.user);
            await loadTenant();
        } catch (err: any) {
            setError(err.message || 'Login failed');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const register = useCallback(async (data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        tenantName?: string;
    }) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await api.register(data);
            setUser(result.user);
            await loadTenant();
        } catch (err: any) {
            setError(err.message || 'Registration failed');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loginWithGoogle = useCallback(() => {
        api.loginWithGoogle();
    }, []);

    const logout = useCallback(() => {
        api.logout();
        setUser(null);
        setTenant(null);
    }, []);

    const refreshTenant = useCallback(async () => {
        await loadTenant();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                tenant,
                isAuthenticated,
                isLoading,
                error,
                login,
                register,
                loginWithGoogle,
                logout,
                refreshTenant,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
