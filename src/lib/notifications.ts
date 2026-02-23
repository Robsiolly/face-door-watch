export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'visitante' | 'encomenda' | 'ocorrencia' | 'sistema';
    read: boolean;
    created_at: string;
    target_user?: string;
}

// Canal de comunicação em tempo real entre as abas do navegador
// Fallback para navegadores que não suportam BroadcastChannel
const channel = typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel('otrebor_notifications')
    : {
        postMessage: () => { },
        addEventListener: () => { },
        removeEventListener: () => { },
    } as any;

export const notificationService = {
    // Salva e envia a notificação
    async send(notifData: Omit<Notification, 'id' | 'created_at' | 'read'>) {
        const newNotif: Notification = {
            ...notifData,
            id: Math.random().toString(36).substr(2, 9),
            created_at: new Date().toISOString(),
            read: false
        };

        // Salva no LocalStorage (nosso banco de dados local)
        const saved = localStorage.getItem('otrebor_notifications');
        const notifications = saved ? JSON.parse(saved) : [];
        notifications.unshift(newNotif);
        localStorage.setItem('otrebor_notifications', JSON.stringify(notifications.slice(0, 50)));

        // "Grita" para as outras abas
        channel.postMessage(newNotif);

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

    subscribe(callback: (notification: Notification) => void) {
        const handleMessage = (event: MessageEvent) => {
            callback(event.data);
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleLocal = (event: any) => {
            callback(event.detail);
        };

        channel.addEventListener('message', handleMessage);
        window.addEventListener('new_notification', handleLocal);

        return {
            unsubscribe: () => {
                channel.removeEventListener('message', handleMessage);
                window.removeEventListener('new_notification', handleLocal);
            }
        };
    }
};
