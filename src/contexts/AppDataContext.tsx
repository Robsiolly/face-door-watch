import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export interface Veiculo {
    id: string;
    placa: string;
    modelo: string;
    cor: string;
    morador: string;
    apto: string;
    bloco: string;
    status: 'active' | 'inactive';
}

export interface Encomenda {
    id: string;
    morador: string;
    apto: string;
    bloco: string;
    descricao: string;
    dataRecebimento: string;
    status: 'pending' | 'active';
}

export interface Ocorrencia {
    id: string;
    tipo: string;
    descricao: string;
    data: string;
    responsavel: string;
    apto: string;
    bloco: string;
    status: 'pending' | 'active';
}

interface AppDataContextType {
    veiculos: Veiculo[];
    addVeiculo: (v: Omit<Veiculo, 'id'>) => Promise<void>;
    updateVeiculo: (id: string, v: Partial<Veiculo>) => Promise<void>;
    deleteVeiculo: (id: string) => Promise<void>;

    encomendas: Encomenda[];
    addEncomenda: (e: Omit<Encomenda, 'id'>) => Promise<void>;
    updateEncomenda: (id: string, e: Partial<Encomenda>) => Promise<void>;
    deleteEncomenda: (id: string) => Promise<void>;

    ocorrencias: Ocorrencia[];
    addOcorrencia: (o: Omit<Ocorrencia, 'id'>) => Promise<void>;
    updateOcorrencia: (id: string, o: Partial<Ocorrencia>) => Promise<void>;
    deleteOcorrencia: (id: string) => Promise<void>;

    isLoading: boolean;
}

export const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider = ({ children }: { children: React.ReactNode }) => {
    const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
    const [encomendas, setEncomendas] = useState<Encomenda[]>([]);
    const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    // ──────────────────────────────────────────
    // Initial Load from Supabase
    // ──────────────────────────────────────────
    useEffect(() => {
        const loadAll = async () => {
            setIsLoading(true);
            try {
                const [{ data: v }, { data: e }, { data: o }] = await Promise.all([
                    supabase.from('veiculos').select('*').order('created_at', { ascending: false }),
                    supabase.from('encomendas').select('*').order('created_at', { ascending: false }),
                    supabase.from('ocorrencias').select('*').order('created_at', { ascending: false }),
                ]);
                if (v) setVeiculos(v as Veiculo[]);
                if (e) setEncomendas(e as Encomenda[]);
                if (o) setOcorrencias(o as Ocorrencia[]);
            } catch (err: any) {
                console.error('Erro ao carregar dados do Supabase:', err);
                toast({
                    title: "Erro de Sincronização",
                    description: "Não foi possível carregar o histórico. Verifique se o RLS está desabilitado no Supabase.",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        };
        loadAll();
    }, []);

    // ──────────────────────────────────────────
    // Realtime subscriptions (sync between devices)
    // ──────────────────────────────────────────
    useEffect(() => {
        const channel = supabase
            .channel('app-data-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'encomendas' }, async () => {
                const { data } = await supabase.from('encomendas').select('*').order('created_at', { ascending: false });
                if (data) setEncomendas(data as Encomenda[]);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'ocorrencias' }, async () => {
                const { data } = await supabase.from('ocorrencias').select('*').order('created_at', { ascending: false });
                if (data) setOcorrencias(data as Ocorrencia[]);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'veiculos' }, async () => {
                const { data } = await supabase.from('veiculos').select('*').order('created_at', { ascending: false });
                if (data) setVeiculos(data as Veiculo[]);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    // ──────────────────────────────────────────
    // Veículos CRUD
    // ──────────────────────────────────────────
    const addVeiculo = async (v: Omit<Veiculo, 'id'>) => {
        const { data, error } = await supabase.from('veiculos').insert(v).select().single();
        if (error) {
            console.error(error);
            toast({ title: "Erro ao salvar veículo", description: error.message, variant: "destructive" });
            return;
        }
        if (data) setVeiculos(prev => [data as Veiculo, ...prev]);
    };

    const updateVeiculo = async (id: string, v: Partial<Veiculo>) => {
        const { error } = await supabase.from('veiculos').update(v).eq('id', id);
        if (error) {
            console.error(error);
            toast({ title: "Erro ao atualizar veículo", description: error.message, variant: "destructive" });
            return;
        }
        setVeiculos(prev => prev.map(item => item.id === id ? { ...item, ...v } : item));
    };

    const deleteVeiculo = async (id: string) => {
        const { error } = await supabase.from('veiculos').delete().eq('id', id);
        if (error) { console.error(error); return; }
        setVeiculos(prev => prev.filter(item => item.id !== id));
    };

    // ──────────────────────────────────────────
    // Encomendas CRUD
    // ──────────────────────────────────────────
    const addEncomenda = async (e: Omit<Encomenda, 'id'>) => {
        const { data, error } = await supabase.from('encomendas').insert(e).select().single();
        if (error) {
            console.error(error);
            toast({ title: "Erro ao salvar encomenda", description: error.message, variant: "destructive" });
            return;
        }
        if (data) setEncomendas(prev => [data as Encomenda, ...prev]);
    };

    const updateEncomenda = async (id: string, e: Partial<Encomenda>) => {
        const { error } = await supabase.from('encomendas').update(e).eq('id', id);
        if (error) {
            console.error(error);
            toast({ title: "Erro ao atualizar encomenda", description: error.message, variant: "destructive" });
            return;
        }
        setEncomendas(prev => prev.map(item => item.id === id ? { ...item, ...e } : item));
    };

    const deleteEncomenda = async (id: string) => {
        const { error } = await supabase.from('encomendas').delete().eq('id', id);
        if (error) { console.error(error); return; }
        setEncomendas(prev => prev.filter(item => item.id !== id));
    };

    // ──────────────────────────────────────────
    // Ocorrências CRUD
    // ──────────────────────────────────────────
    const addOcorrencia = async (o: Omit<Ocorrencia, 'id'>) => {
        const { data, error } = await supabase.from('ocorrencias').insert(o).select().single();
        if (error) {
            console.error(error);
            toast({ title: "Erro ao salvar ocorrência", description: error.message, variant: "destructive" });
            return;
        }
        if (data) setOcorrencias(prev => [data as Ocorrencia, ...prev]);
    };

    const updateOcorrencia = async (id: string, o: Partial<Ocorrencia>) => {
        const { error } = await supabase.from('ocorrencias').update(o).eq('id', id);
        if (error) {
            console.error(error);
            toast({ title: "Erro ao atualizar ocorrência", description: error.message, variant: "destructive" });
            return;
        }
        setOcorrencias(prev => prev.map(item => item.id === id ? { ...item, ...o } : item));
    };

    const deleteOcorrencia = async (id: string) => {
        const { error } = await supabase.from('ocorrencias').delete().eq('id', id);
        if (error) { console.error(error); return; }
        setOcorrencias(prev => prev.filter(item => item.id !== id));
    };

    return (
        <AppDataContext.Provider value={{
            veiculos, addVeiculo, updateVeiculo, deleteVeiculo,
            encomendas, addEncomenda, updateEncomenda, deleteEncomenda,
            ocorrencias, addOcorrencia, updateOcorrencia, deleteOcorrencia,
            isLoading,
        }}>
            {children}
        </AppDataContext.Provider>
    );
};

export const useAppData = () => {
    const context = useContext(AppDataContext);
    if (!context) throw new Error("useAppData must be used within AppDataProvider");
    return context;
};
