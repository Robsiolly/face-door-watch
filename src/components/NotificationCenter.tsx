import { useState, useEffect } from "react";
import { Bell, Package, User, AlertTriangle, ShieldCheck } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { notificationService } from "@/lib/notifications";
import type { Notification as AppNotification } from "@/lib/notifications";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export function NotificationCenter() {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const { toast } = useToast();
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        console.log("Iniciando assinatura de notificações para:", user.name);

        const filterNotif = (notif: AppNotification) => {
            const isPortaria = user.role === 'portaria' || user.role === 'admin';
            if (isPortaria) return true;

            if (!notif.target_user) return false;

            const myTarget = `${user.bloco}-${user.apto}`.toLowerCase().replace(/\s/g, '');
            const notifTarget = notif.target_user.toLowerCase().replace(/\s/g, '');

            return notifTarget === myTarget;
        };

        // Carregar iniciais
        notificationService.getAll().then(all => {
            const filtered = all.filter(filterNotif);
            setNotifications(filtered);
        });

        // Se inscrever para novas (passando o usuário para filtro na fonte)
        const subscription = notificationService.subscribe((newNotif) => {
            console.log("Recebida msg filtrada:", newNotif);
            // Mesmo com filtro na fonte, mantemos aqui por segurança UI
            if (filterNotif(newNotif)) {
                setNotifications((prev) => {
                    // Evitar duplicidade caso a aba atual também tenha enviado
                    if (prev.find(n => n.id === newNotif.id)) return prev;
                    return [newNotif, ...prev];
                });

                toast({
                    title: newNotif.title,
                    description: newNotif.message,
                    variant: newNotif.type === 'ocorrencia' ? 'destructive' : 'default',
                });

                if (typeof Notification !== 'undefined' && Notification.permission === "granted") {
                    // Tenta usar o Service Worker para mostrar a notificação (melhor para mobile)
                    if ('serviceWorker' in navigator) {
                        navigator.serviceWorker.ready.then(registration => {
                            registration.showNotification(newNotif.title, {
                                body: newNotif.message,
                                icon: 'https://cdn-icons-png.flaticon.com/512/3662/3662817.png',
                                badge: 'https://cdn-icons-png.flaticon.com/512/3662/3662817.png',
                                vibrate: [200, 100, 200],
                                tag: newNotif.id,
                                data: { url: window.location.origin + '/encomendas' }
                            } as any);
                        });
                    } else {
                        new Notification(newNotif.title, { body: newNotif.message });
                    }
                }
            }
        }, user); // Passa o usuário aqui!

        // Pedir permissão
        if (typeof Notification !== 'undefined' && Notification.permission === "default") {
            Notification.requestPermission();
        }

        return () => {
            subscription.unsubscribe();
        };
    }, [toast, user]);

    const markRead = async (id: string, alreadyRead: boolean) => {
        if (alreadyRead) return;
        await notificationService.markAsRead(id);
        setNotifications((prev) =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const getIcon = (type: AppNotification['type']) => {
        switch (type) {
            case 'encomenda': return <Package className="w-4 h-4 text-blue-500" />;
            case 'visitante': return <User className="w-4 h-4 text-green-500" />;
            case 'ocorrencia': return <AlertTriangle className="w-4 h-4 text-red-500" />;
            default: return <ShieldCheck className="w-4 h-4 text-primary" />;
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl bg-secondary/50 hover:bg-secondary">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 glass border-white/20 bg-background/80 backdrop-blur-xl">
                <DropdownMenuLabel className="font-bold flex items-center justify-between">
                    Histórico de Notificações
                    {unreadCount > 0 && (
                        <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                            {unreadCount} novas
                        </span>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Nenhuma notificação registrada
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <DropdownMenuItem
                                key={n.id}
                                className={`p-3 focus:bg-primary/5 cursor-pointer flex gap-3 items-start border-b border-white/5 last:border-0 ${!n.read ? 'bg-primary/5' : 'opacity-60'}`}
                                onClick={() => n.id && markRead(n.id, !!n.read)}
                            >
                                <div className="mt-1">{getIcon(n.type)}</div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold leading-none">{n.title}</p>
                                        {!n.read && <div className="w-2 h-2 rounded-full bg-primary"></div>}
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                                    <p className="text-[9px] text-muted-foreground/50 uppercase font-bold">
                                        {n.created_at ? new Date(n.created_at).toLocaleString() : 'Agora'}
                                    </p>
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
