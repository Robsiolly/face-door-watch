import React, { createContext, useContext, useState, useEffect } from 'react';

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
    photo?: string; // Base64 representation of the face photo
    status: 'active' | 'inactive' | 'authorized' | 'denied' | 'pending';
}

interface PeopleContextType {
    people: Person[];
    addPerson: (person: Omit<Person, 'id'>) => void;
    findPersonByDoc: (doc: string) => Person | undefined;
    getPeopleByType: (type: PersonType) => Person[];
    deletePerson: (id: string) => void;
    updatePerson: (id: string, updatedFields: Partial<Person>) => void;
    clearAll: () => void;
}

export const PeopleContext = createContext<PeopleContextType | undefined>(undefined);

export const PeopleProvider = ({ children }: { children: React.ReactNode }) => {
    const [people, setPeople] = useState<Person[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('otrebor_people');
        if (saved) {
            try {
                setPeople(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse", e);
            }
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('otrebor_people', JSON.stringify(people));
        }
    }, [people, isLoaded]);

    const addPerson = (person: Omit<Person, 'id'>) => {
        setPeople(prev => [...prev, { ...person, id: Math.random().toString(36).substr(2, 9) }]);
    };

    const findPersonByDoc = (doc: string) => people.find(p => p.documento === doc);
    const getPeopleByType = (type: PersonType) => people.filter(p => p.type === type);

    const deletePerson = (id: string) => {
        setPeople(prev => prev.filter(p => p.id !== id));
    };

    const updatePerson = (id: string, updatedFields: Partial<Person>) => {
        setPeople(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
    };

    const clearAll = () => {
        setPeople([]);
        localStorage.removeItem('otrebor_people');
    };

    return (
        <PeopleContext.Provider value={{
            people,
            addPerson,
            findPersonByDoc,
            getPeopleByType,
            deletePerson,
            updatePerson,
            clearAll
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
