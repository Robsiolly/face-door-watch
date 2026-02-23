import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export type PersonType = 'morador' | 'visitante' | 'prestador';

export interface Person {
    id: string;
    type: PersonType;
    nome: string;
    documento: string;
    telefone?: string;
    bloco?: string;
    apartamento?: string;
    autorizadoPor?: string;
    validade?: string;
    empresa?: string;
    servico?: string;
    blocoVisitado?: string;
    aptoVisitado?: string;
    data?: string;
    faceFeature?: boolean;
    faceDescriptor?: number[];
    photo?: string;
    status: 'active' | 'inactive' | 'authorized' | 'denied' | 'pending';
}

interface PeopleContextType {
    people: Person[];
    addPerson: (person: Omit<Person, 'id'>) => Promise<void>;
    findPersonByDoc: (doc: string) => Person | undefined;
    getPeopleByType: (type: PersonType) => Person[];
    deletePerson: (id: string) => Promise<void>;
    updatePerson: (id: string, updatedFields: Partial<Person>) => Promise<void>;
    clearAll: () => void;
    isLoading: boolean;
}

export const PeopleContext = createContext<PeopleContextType | undefined>(undefined);

export const PeopleProvider = ({ children }: { children: React.ReactNode }) => {
    const [people, setPeople] = useState<Person[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    // ──────────────────────────────────────────
    // Initial Load from Supabase
    // ──────────────────────────────────────────
    useEffect(() => {
        const loadPeople = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('pessoas')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (error) throw error;
                if (data) setPeople(data as Person[]);
            } catch (err) {
                console.error('Erro ao carregar pessoas do Supabase:', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadPeople();
    }, []);

    // ──────────────────────────────────────────
    // Realtime subscription
    // ──────────────────────────────────────────
    useEffect(() => {
        const channel = supabase
            .channel('pessoas-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'pessoas' }, async () => {
                const { data } = await supabase.from('pessoas').select('*').order('created_at', { ascending: false });
                if (data) setPeople(data as Person[]);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    // ──────────────────────────────────────────
    // CRUD
    // ──────────────────────────────────────────
    const addPerson = async (person: Omit<Person, 'id'>) => {
        const { data, error } = await supabase.from('pessoas').insert(person).select().single();
        if (error) {
            console.error('addPerson error:', error);
            toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
            return;
        }
        if (data) setPeople(prev => [data as Person, ...prev]);
    };

    const updatePerson = async (id: string, updatedFields: Partial<Person>) => {
        const { error } = await supabase.from('pessoas').update(updatedFields).eq('id', id);
        if (error) { console.error('updatePerson error:', error); return; }
        setPeople(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
    };

    const deletePerson = async (id: string) => {
        const { error } = await supabase.from('pessoas').delete().eq('id', id);
        if (error) { console.error('deletePerson error:', error); return; }
        setPeople(prev => prev.filter(p => p.id !== id));
    };

    const findPersonByDoc = (doc: string) => people.find(p => p.documento === doc);
    const getPeopleByType = (type: PersonType) => people.filter(p => p.type === type);

    const clearAll = () => {
        // Just clear local state; no need to delete from DB in this flow
        setPeople([]);
    };

    return (
        <PeopleContext.Provider value={{
            people,
            addPerson,
            findPersonByDoc,
            getPeopleByType,
            deletePerson,
            updatePerson,
            clearAll,
            isLoading,
        }}>
            {children}
        </PeopleContext.Provider>
    );
};

export const usePeople = () => {
    const context = useContext(PeopleContext);
    if (!context) throw new Error("usePeople must be used within PeopleProvider");
    return context;
};
