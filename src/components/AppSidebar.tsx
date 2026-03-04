import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  Shield,
  Users,
  UserCheck,
  Wrench,
  Car,
  Package,
  AlertTriangle,
  BarChart3,
  Settings,
  ScanFace,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, roles: ['portaria', 'admin'] },
  { title: "Portaria", url: "/portaria", icon: ScanFace, roles: ['portaria', 'admin'] },
  { title: "Moradores", url: "/moradores", icon: Users, roles: ['portaria', 'admin'] },
  { title: "Visitantes", url: "/visitantes", icon: UserCheck, roles: ['portaria', 'admin'] },
  { title: "Prestadores", url: "/prestadores", icon: Wrench, roles: ['portaria', 'admin'] },
  { title: "Veículos", url: "/veiculos", icon: Car, roles: ['portaria', 'admin'] },
  { title: "Encomendas", url: "/encomendas", icon: Package, roles: ['portaria', 'admin'] },
  { title: "Ocorrências", url: "/ocorrencias", icon: AlertTriangle, roles: ['portaria', 'admin'] },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3, roles: ['portaria', 'admin'] },
  { title: "Configurações", url: "/configuracoes", icon: Settings, roles: ['portaria', 'admin'] },
];

interface AppSidebarProps {
  onNavItemClick?: () => void;
  isDrawer?: boolean;
}

export function AppSidebar({ onNavItemClick, isDrawer }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const filteredItems = navItems.filter(item => user && item.roles.includes(user.role));
  const isCollapsed = isDrawer ? false : collapsed;

  return (
    <aside
      className={`
        ${isCollapsed ? "w-[80px]" : "w-80"}
        ${isDrawer ? "h-full" : "h-screen"}
        flex flex-col glass-3d border-r border-white/5 transition-all duration-700 z-50
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-4 px-6 h-20 border-b border-white/5 shrink-0 overflow-hidden">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform hover:rotate-12 duration-500">
          <img src="/favicon.svg" alt="OTREBOR Logo" className="w-full h-full object-contain" />
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden reveal-scale space-y-0.5">
            <h1 className="text-base font-black text-foreground tracking-[0.3em] uppercase gold-text">OTREBOR</h1>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none opacity-40">Intelligence</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-10 px-4 space-y-3 overflow-y-auto custom-scrollbar">
        {filteredItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/"}
            onClick={onNavItemClick}
            className="flex items-center gap-4 px-5 py-4 rounded-2xl text-muted-foreground/60 border border-transparent hover:bg-white/[0.03] hover:border-white/5 hover:text-primary transition-all duration-500 text-[10px] font-black uppercase tracking-[0.2em] group"
            activeClassName="bg-primary/10 text-primary border-primary/20 shadow-[0_0_20px_rgba(212,175,55,0.1)]"
          >
            <item.icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110 group-active:scale-90" />
            {!isCollapsed && <span className="transition-all">{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Info & Actions */}
      <div className="p-4 space-y-4 border-t border-white/5 shrink-0">
        {!isCollapsed && user && (
          <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/5 group transition-colors hover:bg-white/10">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">
              {user.role === 'admin' ? 'Administrador' : 'Portaria'}
            </p>
            <p className="text-xs font-bold text-foreground line-clamp-1">{user.name}</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {!isDrawer && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center justify-center h-12 w-full rounded-2xl text-muted-foreground hover:text-primary hover:bg-white/5 transition-all duration-500"
            >
              {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          )}

          <button
            onClick={() => { logout(); onNavItemClick?.(); }}
            className="flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl text-red-500/70 hover:bg-red-500/10 hover:text-red-500 transition-all duration-500 text-xs font-black uppercase tracking-widest"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Sair do Sistema</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}


