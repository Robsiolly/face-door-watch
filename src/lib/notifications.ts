import { supabase } from './supabase';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'visitante' | 'encomenda' | 'ocorrencia' | 'sistema';
    read: boolean;
    created_at: string;
    target_user?: string;
}

// Normaliza o identificador do alvo (ex: "A-101")
export const normalizeTarget = (bloco?: string, apto?: string) => {
    if (!bloco || !apto) return null;
    return `${bloco}-${apto}`.toLowerCase().replace(/\s/g, '');
};

// Canal de comunicação em tempo real usando Supabase Broadcast
const realtimeChannel = supabase.channel('global-notifications', {
    config: {
        broadcast: { ack: false },
    },
});

realtimeChannel.subscribe((status) => {
    console.log('Notificações realtime:', status);
});

export const notificationService = {
    // Salva e envia a notificação
    async send(notifData: Omit<Notification, 'id' | 'created_at' | 'read'>) {
        const newNotif: Notification = {
            ...notifData,
            id: Math.random().toString(36).substr(2, 9),
            created_at: new Date().toISOString(),
            read: false
        };

        // Salva no LocalStorage (nosso banco de dados local da origem)
        const saved = localStorage.getItem('otrebor_notifications');
        const notifications = saved ? JSON.parse(saved) : [];
        notifications.unshift(newNotif);
        localStorage.setItem('otrebor_notifications', JSON.stringify(notifications.slice(0, 50)));

        // Grita para outros dispositivos usando Supabase Realtime
        realtimeChannel.send({
            type: 'broadcast',
            event: 'new_notification',
            payload: newNotif
        });

        // Dispara um evento local para a própria aba também saber
        window.dispatchEvent(new CustomEvent('new_notification', { detail: newNotif }));

        return newNotif;
    },

    async markAsRead(id: string) {
        const saved = localStorage.getItem('otrebor_notifications');
        if (saved) {
            const notifications = JSON.parse(saved);
            const updated = notifications.map((n: Notification) =>
                n.id === id ? { ...n, read: true } : n
            );
            localStorage.setItem('otrebor_notifications', JSON.stringify(updated));
        }
    },

    async getUnread() {
        const saved = localStorage.getItem('otrebor_notifications');
        if (!saved) return [];
        const notifications = JSON.parse(saved);
        return notifications.filter((n: Notification) => !n.read);
    },

    async getAll() {
        const saved = localStorage.getItem('otrebor_notifications');
        if (!saved) return [];
        return JSON.parse(saved);
    },

    subscribe(callback: (notification: Notification) => void, currentUser?: { role: string, bloco?: string, apto?: string }) {
        // Escuta mensagens do Supabase (outros dispositivos)
        const realtimeSubscription = realtimeChannel.on(
            'broadcast',
            { event: 'new_notification' },
            (payload) => {
                const newNotif = payload.payload as Notification;

                // Filtragem na camada de serviço para não poluir o localStorage de quem não é o alvo
                if (currentUser) {
                    const isPortaria = currentUser.role === 'portaria' || currentUser.role === 'admin';
                    const myTarget = normalizeTarget(currentUser.bloco, currentUser.apto);
                    const notifTarget = newNotif.target_user ? newNotif.target_user.toLowerCase().replace(/\s/g, '') : null;

                    const isMatch = isPortaria || (notifTarget && notifTarget === myTarget);

                    if (!isMatch) return; // Ignora se não for para mim
                }

                // Salva também no localStorage desse dispositivo destino
                const saved = localStorage.getItem('otrebor_notifications');
                const notifications = saved ? JSON.parse(saved) : [];

                // Evita duplicatas caso seja a mesma aba
                if (!notifications.find((n: Notification) => n.id === newNotif.id)) {
                    notifications.unshift(newNotif);
                    localStorage.setItem('otrebor_notifications', JSON.stringify(notifications.slice(0, 50)));
                    callback(newNotif);
                }
            }
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleLocal = (event: any) => {
            callback(event.detail);
        };

        window.addEventListener('new_notification', handleLocal);

        return {
            unsubscribe: () => {
                realtimeSubscription.unsubscribe();
                window.removeEventListener('new_notification', handleLocal);
            }
        };
    }
};
