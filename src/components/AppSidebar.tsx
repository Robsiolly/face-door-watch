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
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Portaria", url: "/portaria", icon: ScanFace },
  { title: "Moradores", url: "/moradores", icon: Users },
  { title: "Visitantes", url: "/visitantes", icon: UserCheck },
  { title: "Prestadores", url: "/prestadores", icon: Wrench },
  { title: "Veículos", url: "/veiculos", icon: Car },
  { title: "Encomendas", url: "/encomendas", icon: Package },
  { title: "Ocorrências", url: "/ocorrencias", icon: AlertTriangle },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? "w-[72px]" : "w-64"
      } h-screen sticky top-0 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 z-50`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-foreground tracking-tight">PortarIA</h1>
            <p className="text-[10px] text-muted-foreground">Portaria Inteligente</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
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

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-12 border-t border-sidebar-border text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
