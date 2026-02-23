import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'portaria' | 'morador' | 'admin';

export interface User {
    id: string;
    name: string;
    role: UserRole;
    bloco?: string;
    apto?: string;
}

interface AuthContextType {
    user: User | null;
    login: (credentials: { role: UserRole, bloco?: string, apto?: string, name?: string, password?: string }) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const savedUser = localStorage.getItem('otrebor_user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error("Failed to load user", e);
            }
        }

        // Check for URL parameters (Magic Link)
        const params = new URLSearchParams(window.location.search);
        const b = params.get('b');
        const a = params.get('a');
        const n = params.get('n');

        if (b && a) {
            const newUser: User = {
                id: Math.random().toString(36).substr(2, 9),
                name: n || `Morador ${b}-${a}`,
                role: 'morador',
                bloco: b,
                apto: a
            };
            setUser(newUser);
            localStorage.setItem('otrebor_user', JSON.stringify(newUser));
            // Clear params from URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        setIsLoaded(true);
    }, []);

    const login = (credentials: { role: UserRole, bloco?: string, apto?: string, name?: string, password?: string }) => {
        // Simulando verificação de segurança (em produção seria via Supabase Auth)
        if (!credentials.password || credentials.password.length < 4) {
            console.error("Senha inválida ou muito curta");
            return;
        }

        const newUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            name: credentials.name || (credentials.role === 'portaria' ? 'Operador Portaria' : `Morador ${credentials.bloco}-${credentials.apto}`),
            role: credentials.role,
            bloco: credentials.bloco,
            apto: credentials.apto
        };
        setUser(newUser);
        localStorage.setItem('otrebor_user', JSON.stringify(newUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('otrebor_user');
    };

    if (!isLoaded) return null;

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
