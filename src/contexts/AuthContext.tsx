import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { compareFaces } from '@/lib/faceApi';

export type UserRole = 'portaria' | 'morador' | 'admin';

export interface User {
    id: string;
    email?: string;
    name: string;
    role: UserRole;
    bloco?: string;
    apto?: string;
    avatar_url?: string;
    face_descriptor?: number[];
}

interface AuthContextType {
    user: User | null;
    login: (credentials: { role: UserRole, bloco?: string, apto?: string, name?: string, password?: string }) => void;
    loginWithGoogle: () => Promise<void>;
    loginWithFace: (descriptor: number[]) => Promise<boolean>;
    registerWithFace: (data: { name: string, email: string, descriptor: number[] }) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                await handleUserSession(session.user);
            } else {
                const savedUser = localStorage.getItem('otrebor_user');
                if (savedUser) {
                    try {
                        setUser(JSON.parse(savedUser));
                    } catch (e) {
                        console.error("Failed to load user", e);
                    }
                }
            }
            setLoading(false);
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                await handleUserSession(session.user);
            } else {
                setUser(null);
                localStorage.removeItem('otrebor_user');
            }
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleUserSession = async (supabaseUser: any) => {
        const { data: registeredUser, error } = await supabase
            .from('authorized_users')
            .select('*')
            .eq('email', supabaseUser.email)
            .single();

        if (error || !registeredUser) {
            console.error("Usuário não autorizado no sistema:", supabaseUser.email);
            await supabase.auth.signOut();
            setUser(null);
            return;
        }

        const newUser: User = {
            id: supabaseUser.id,
            email: supabaseUser.email,
            name: registeredUser.name || supabaseUser.user_metadata.full_name || 'Operador',
            role: registeredUser.role as UserRole || 'portaria',
            avatar_url: supabaseUser.user_metadata.avatar_url,
            face_descriptor: registeredUser.face_descriptor
        };
        setUser(newUser);
    };

    const registerWithFace = async (data: { name: string, email: string, descriptor: number[] }) => {
        // Enviar os dados para a tabela de usuários autorizados
        const { error } = await supabase.from('authorized_users').insert({
            name: data.name,
            email: data.email,
            face_descriptor: data.descriptor,
            role: 'portaria', // Default role
            status: 'active'
        });

        if (error) throw error;

        // Após cadastrar, tenta logar se o e-mail bater com uma conta ativa ou simplesmente marca como cadastrado
        // Para simplificar, o login facial será usado após o cadastro
    };

    const loginWithFace = async (descriptor: number[]) => {
        const { data: users, error } = await supabase
            .from('authorized_users')
            .select('*')
            .not('face_descriptor', 'is', null);

        if (error) throw error;

        for (const dbUser of users) {
            if (dbUser.face_descriptor && compareFaces(descriptor, dbUser.face_descriptor)) {
                const newUser: User = {
                    id: dbUser.id || Math.random().toString(),
                    email: dbUser.email,
                    name: dbUser.name,
                    role: dbUser.role as UserRole,
                    face_descriptor: dbUser.face_descriptor
                };
                setUser(newUser);
                localStorage.setItem('otrebor_user', JSON.stringify(newUser));
                return true;
            }
        }
        return false;
    };

    const loginWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin }
        });
        if (error) throw error;
    };

    const login = (credentials: { role: UserRole, bloco?: string, apto?: string, name?: string, password?: string }) => {
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

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        localStorage.removeItem('otrebor_user');
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            loginWithGoogle,
            loginWithFace,
            registerWithFace,
            logout,
            isAuthenticated: !!user,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
