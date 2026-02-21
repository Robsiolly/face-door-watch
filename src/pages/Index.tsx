import { AppLayout } from "@/components/AppLayout";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import {
  DoorOpen,
  Users,
  Wrench,
  Package,
  AlertTriangle,
  Clock,
  UserX,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const accessByDay = [
  { dia: "Seg", acessos: 142 },
  { dia: "Ter", acessos: 168 },
  { dia: "Qua", acessos: 155 },
  { dia: "Qui", acessos: 190 },
  { dia: "Sex", acessos: 203 },
  { dia: "Sáb", acessos: 87 },
  { dia: "Dom", acessos: 45 },
];

const accessByType = [
  { name: "Moradores", value: 520, color: "hsl(142, 71%, 45%)" },
  { name: "Visitantes", value: 180, color: "hsl(210, 60%, 50%)" },
  { name: "Prestadores", value: 95, color: "hsl(45, 93%, 47%)" },
  { name: "Desconhecidos", value: 15, color: "hsl(0, 72%, 51%)" },
];

const recentAccess = [
  { nome: "Carlos Silva", tipo: "Morador", hora: "14:32", status: "authorized" as const },
  { nome: "Ana Oliveira", tipo: "Visitante", hora: "14:28", status: "authorized" as const },
  { nome: "Técnico NET", tipo: "Prestador", hora: "14:15", status: "authorized" as const },
  { nome: "Desconhecido", tipo: "—", hora: "14:02", status: "unknown" as const },
  { nome: "João Mendes", tipo: "Morador", hora: "13:55", status: "authorized" as const },
  { nome: "Pedro Santos", tipo: "Visitante", hora: "13:40", status: "denied" as const },
];

const alerts = [
  { descricao: "Pessoa não identificada na entrada principal", hora: "14:02", tipo: "Desconhecido" },
  { descricao: "Tentativa de acesso negada - Bloco B", hora: "13:40", tipo: "Negado" },
  { descricao: "Câmera 3 offline", hora: "12:15", tipo: "Sistema" },
];

const Dashboard = () => {
  return (
    <AppLayout>
      <PageHeader title="Dashboard" subtitle="Visão geral do condomínio" />

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 fade-in">
        <MetricCard title="Acessos Hoje" value={234} icon={<DoorOpen className="w-5 h-5" />} trend="+12% vs ontem" variant="success" />
        <MetricCard title="Visitantes Presentes" value={8} icon={<Users className="w-5 h-5" />} variant="accent" />
        <MetricCard title="Prestadores Presentes" value={3} icon={<Wrench className="w-5 h-5" />} variant="warning" />
        <MetricCard title="Encomendas Pendentes" value={12} icon={<Package className="w-5 h-5" />} variant="default" />
        <MetricCard title="Ocorrências Abertas" value={2} icon={<AlertTriangle className="w-5 h-5" />} variant="danger" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Acessos por Dia</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={accessByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" />
              <XAxis dataKey="dia" stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "hsl(220, 20%, 13%)",
                  border: "1px solid hsl(220, 15%, 25%)",
                  borderRadius: "12px",
                  color: "hsl(210, 20%, 95%)",
                }}
              />
              <Bar dataKey="acessos" fill="hsl(142, 71%, 45%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Acessos por Tipo</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={accessByType} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                {accessByType.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "hsl(220, 20%, 13%)",
                  border: "1px solid hsl(220, 15%, 25%)",
                  borderRadius: "12px",
                  color: "hsl(210, 20%, 95%)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {accessByType.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="text-foreground font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Últimos Acessos</h3>
          </div>
          <div className="space-y-3">
            {recentAccess.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-muted-foreground">
                    {item.nome.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.nome}</p>
                    <p className="text-xs text-muted-foreground">{item.tipo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{item.hora}</span>
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <UserX className="w-4 h-4 text-destructive" />
            <h3 className="text-sm font-semibold text-foreground">Alertas</h3>
          </div>
          <div className="space-y-3">
            {alerts.map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-border/30 last:border-0">
                <div className="w-2 h-2 rounded-full bg-destructive mt-1.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{item.descricao}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{item.hora}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{item.tipo}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
