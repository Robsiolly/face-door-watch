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
import { Button } from "./ui/button";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, roles: ['portaria', 'admin', 'morador'] },
  { title: "Portaria", url: "/portaria", icon: ScanFace, roles: ['portaria', 'admin'] },
  { title: "Moradores", url: "/moradores", icon: Users, roles: ['portaria', 'admin'] },
  { title: "Visitantes", url: "/visitantes", icon: UserCheck, roles: ['portaria', 'admin'] },
  { title: "Prestadores", url: "/prestadores", icon: Wrench, roles: ['portaria', 'admin'] },
  { title: "Veículos", url: "/veiculos", icon: Car, roles: ['portaria', 'admin'] },
  { title: "Encomendas", url: "/encomendas", icon: Package, roles: ['portaria', 'admin', 'morador'] },
  { title: "Ocorrências", url: "/ocorrencias", icon: AlertTriangle, roles: ['portaria', 'admin', 'morador'] },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3, roles: ['portaria', 'admin'] },
  { title: "Configurações", url: "/configuracoes", icon: Settings, roles: ['portaria', 'admin'] },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const filteredItems = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <aside
      className={`${collapsed ? "w-[72px]" : "w-64"
        } h-screen sticky top-0 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 z-50`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-foreground tracking-tight">OTREBOR</h1>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-none mt-1">Watch</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {filteredItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/"}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-sm"
            activeClassName="bg-primary/10 text-primary font-medium"
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Info & Actions */}
      <div className="p-2 space-y-2 border-t border-sidebar-border">
        {!collapsed && user && (
          <div className="px-3 py-2 rounded-xl bg-secondary/30 mb-2">
            <p className="text-xs font-bold text-foreground line-clamp-1">{user.name}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-bold">
              {user.role === 'morador' ? `Bloco ${user.bloco} • Ap ${user.apto}` : user.role}
            </p>
          </div>
        )}

        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-colors text-sm font-medium"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Sair do Sistema</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-10 w-full rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
