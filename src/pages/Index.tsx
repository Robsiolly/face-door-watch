import { AppLayout } from "@/components/AppLayout";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import {
  DoorOpen,
  Users,
  Package,
  AlertTriangle,
  Clock,
  UserX,
  ShieldCheck,
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
import { useAuth } from "@/contexts/AuthContext";
import { useAppData } from "@/contexts/AppDataContext";
import { usePeople } from "@/contexts/PeopleContext";

const accessByDay = [
  { dia: "Seg", acessos: 0 },
  { dia: "Ter", acessos: 0 },
  { dia: "Qua", acessos: 0 },
  { dia: "Qui", acessos: 0 },
  { dia: "Sex", acessos: 0 },
  { dia: "Sáb", acessos: 0 },
  { dia: "Dom", acessos: 0 },
];

const accessByType = [
  { name: "Moradores", value: 0, color: "hsl(142, 71%, 45%)" },
  { name: "Visitantes", value: 0, color: "hsl(210, 60%, 50%)" },
  { name: "Prestadores", value: 0, color: "hsl(45, 93%, 47%)" },
  { name: "Desconhecidos", value: 0, color: "hsl(0, 72%, 51%)" },
];

const recentAccess: Array<{ nome: string, tipo: string, hora: string, status: "authorized" | "denied" | "unknown" }> = [];

const alerts: Array<{ descricao: string, hora: string, tipo: string }> = [];

const Dashboard = () => {
  const { user } = useAuth();
  const { encomendas, ocorrencias } = useAppData();
  const { people } = usePeople();

  const isMorador = user?.role === 'morador';

  // Métricas filtradas para morador
  const myEncomendas = isMorador
    ? encomendas.filter(e => e.bloco === user.bloco && e.apto === user.apto && e.status === 'pending')
    : encomendas.filter(e => e.status === 'pending');

  const myOcorrencias = isMorador
    ? ocorrencias.filter(o => o.bloco === user.bloco && o.apto === user.apto && o.status === 'pending')
    : ocorrencias.filter(o => o.status === 'pending');

  const totalVisitantes = people.filter(p => p.type === 'visitante' && p.status === 'active').length;

  return (
    <AppLayout>
      <PageHeader
        title={isMorador ? `Olá, ${user?.name}` : "Dashboard"}
        subtitle={isMorador ? `Bem-vindo à área do condômino: Bloco ${user?.bloco} - Ap ${user?.apto}` : "Visão geral do condomínio"}
      />

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 fade-in">
        {!isMorador && <MetricCard title="Acessos Hoje" value={0} icon={<DoorOpen className="w-5 h-5" />} trend="+0% vs ontem" variant="success" />}
        {!isMorador && <MetricCard title="Visitantes Presentes" value={totalVisitantes} icon={<Users className="w-5 h-5" />} variant="accent" />}
        <MetricCard title="Suas Encomendas" value={myEncomendas.length} icon={<Package className="w-5 h-5" />} variant="default" />
        <MetricCard title="Ocorrências" value={myOcorrencias.length} icon={<AlertTriangle className="w-5 h-5" />} variant="danger" />
      </div>

      {isMorador ? (
        <div className="glass-card p-8 text-center space-y-6 mt-8">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <ShieldCheck className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold italic tracking-tight">Seu ambiente está seguro</h2>
          <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
            Utilize o menu lateral para conferir suas encomendas pendentes ou registrar uma nova ocorrência com a administração. Todas as suas informações são privadas.
          </p>
        </div>
      ) : (
        <>
          {/* Charts (Only for Portaria/Admin) */}
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
                {recentAccess.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center italic">Nenhum acesso recente registrado</p>
                ) : (
                  recentAccess.map((item, i) => (
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
                  ))
                )}
              </div>
            </div>

            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <UserX className="w-4 h-4 text-destructive" />
                <h3 className="text-sm font-semibold text-foreground">Alertas</h3>
              </div>
              <div className="space-y-3">
                {alerts.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center italic">Nenhum alerta pendente</p>
                ) : (
                  alerts.map((item, i) => (
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
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
};

export default Dashboard;
