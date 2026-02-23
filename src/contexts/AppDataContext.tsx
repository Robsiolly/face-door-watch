import React, { createContext, useContext, useState, useEffect } from 'react';

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
    addVeiculo: (v: Omit<Veiculo, 'id'>) => void;
    updateVeiculo: (id: string, v: Partial<Veiculo>) => void;
    deleteVeiculo: (id: string) => void;

    encomendas: Encomenda[];
    addEncomenda: (e: Omit<Encomenda, 'id'>) => void;
    updateEncomenda: (id: string, e: Partial<Encomenda>) => void;
    deleteEncomenda: (id: string) => void;

    ocorrencias: Ocorrencia[];
    addOcorrencia: (o: Omit<Ocorrencia, 'id'>) => void;
    updateOcorrencia: (id: string, o: Partial<Ocorrencia>) => void;
    deleteOcorrencia: (id: string) => void;
}

export const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider = ({ children }: { children: React.ReactNode }) => {
    const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
    const [encomendas, setEncomendas] = useState<Encomenda[]>([]);
    const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const savedVeiculos = localStorage.getItem('otrebor_veiculos');
        const savedEncomendas = localStorage.getItem('otrebor_encomendas');
        const savedOcorrencias = localStorage.getItem('otrebor_ocorrencias');

        if (savedVeiculos) setVeiculos(JSON.parse(savedVeiculos));
        if (savedEncomendas) setEncomendas(JSON.parse(savedEncomendas));
        if (savedOcorrencias) setOcorrencias(JSON.parse(savedOcorrencias));

        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('otrebor_veiculos', JSON.stringify(veiculos));
            localStorage.setItem('otrebor_encomendas', JSON.stringify(encomendas));
            localStorage.setItem('otrebor_ocorrencias', JSON.stringify(ocorrencias));
        }
    }, [veiculos, encomendas, ocorrencias, isLoaded]);

    const addVeiculo = (v: Omit<Veiculo, 'id'>) => {
        setVeiculos(prev => [...prev, { ...v, id: Math.random().toString(36).substr(2, 9) }]);
    };
    const updateVeiculo = (id: string, v: Partial<Veiculo>) => {
        setVeiculos(prev => prev.map(item => item.id === id ? { ...item, ...v } : item));
    };
    const deleteVeiculo = (id: string) => {
        setVeiculos(prev => prev.filter(item => item.id !== id));
    };

    const addEncomenda = (e: Omit<Encomenda, 'id'>) => {
        setEncomendas(prev => [...prev, { ...e, id: Math.random().toString(36).substr(2, 9) }]);
    };
    const updateEncomenda = (id: string, e: Partial<Encomenda>) => {
        setEncomendas(prev => prev.map(item => item.id === id ? { ...item, ...e } : item));
    };
    const deleteEncomenda = (id: string) => {
        setEncomendas(prev => prev.filter(item => item.id !== id));
    };

    const addOcorrencia = (o: Omit<Ocorrencia, 'id'>) => {
        setOcorrencias(prev => [...prev, { ...o, id: Math.random().toString(36).substr(2, 9) }]);
    };
    const updateOcorrencia = (id: string, o: Partial<Ocorrencia>) => {
        setOcorrencias(prev => prev.map(item => item.id === id ? { ...item, ...o } : item));
    };
    const deleteOcorrencia = (id: string) => {
        setOcorrencias(prev => prev.filter(item => item.id !== id));
    };

    return (
        <AppDataContext.Provider value={{
            veiculos, addVeiculo, updateVeiculo, deleteVeiculo,
            encomendas, addEncomenda, updateEncomenda, deleteEncomenda,
            ocorrencias, addOcorrencia, updateOcorrencia, deleteOcorrencia
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
