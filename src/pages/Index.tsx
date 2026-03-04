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
  TrendingUp,
  Activity,
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

import { useNavigate, Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const { encomendas, ocorrencias } = useAppData();
  const { people } = usePeople();

  const accessByDay = [
    { dia: "Seg", acessos: 12 },
    { dia: "Ter", acessos: 18 },
    { dia: "Qua", acessos: 15 },
    { dia: "Qui", acessos: 22 },
    { dia: "Sex", acessos: 30 },
    { dia: "Sáb", acessos: 25 },
    { dia: "Dom", acessos: 10 },
  ];

  const accessByType = [
    { name: "Moradores", value: 45, color: "#bf953f" },
    { name: "Visitantes", value: 30, color: "#444" },
    { name: "Prestadores", value: 15, color: "#8a6628" },
    { name: "Outros", value: 10, color: "#222" },
  ];

  const recentAccess = [
    { nome: "Ricardo Silva", tipo: "Morador", hora: "14:20", status: "authorized" },
    { nome: "Ana Paula", tipo: "Visitante", hora: "13:45", status: "authorized" },
    { nome: "Carlos Souza", tipo: "Prestador", hora: "12:30", status: "authorized" },
  ] as any[];

  const alerts = [
    { descricao: "Acesso não autorizado bloco B", hora: "10:15", tipo: "Segurança" },
  ] as any[];

  const pendingEncomendasCount = encomendas.filter(e => e.status === 'pending').length;
  const pendingOcorrenciasCount = ocorrencias.filter(o => o.status === 'pending').length;
  const totalVisitantes = people.filter(p => p.type === 'visitante' && p.status === 'active').length;

  return (
    <AppLayout>
      <div className="space-y-16 pb-20">
        {/* Header Section */}
        <div className="reveal-up flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-primary animate-pulse">
              <Activity className="w-3 h-3" />
              Sistema em Tempo Real
            </div>
            <PageHeader
              title="Centro de Comando"
              subtitle="Monitoramento avançado do ecossistema OTREBOR"
            />
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
            <Clock className="w-4 h-4 text-primary" />
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 reveal-up" style={{ animationDelay: '0.1s' }}>
          <div className="parallax-layer translate-z-10">
            <MetricCard title="Fluxo de Acessos" value={124} icon={<DoorOpen />} trend="+12% hoje" variant="success" />
          </div>
          <div className="parallax-layer translate-z-20">
            <MetricCard title="Pessoas Ativas" value={totalVisitantes || 8} icon={<Users />} variant="accent" />
          </div>
          <Link to="/encomendas" className="parallax-layer translate-z-10 group outline-none">
            <MetricCard title="Encomendas" value={pendingEncomendasCount || 3} icon={<Package />} trend="Pendente(s)" variant="default" />
          </Link>
          <Link to="/ocorrencias" className="parallax-layer translate-z-20 group outline-none">
            <MetricCard title="Ocorrências" value={pendingOcorrenciasCount || 1} icon={<AlertTriangle />} variant="danger" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charts Section */}
          <div className="lg:col-span-2 premium-card reveal-scale" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-12">
              <div className="space-y-1">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/60">Análise de Fluxo</h3>
                <h2 className="text-2xl font-black text-foreground">Volume Semanal</h2>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={accessByDay} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#bf953f" stopOpacity={1} />
                      <stop offset="100%" stopColor="#8a6628" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                  <XAxis
                    dataKey="dia"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900 }}
                    dy={15}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900 }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    contentStyle={{
                      backgroundColor: 'rgba(10, 10, 12, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '20px',
                      padding: '15px',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                    }}
                  />
                  <Bar dataKey="acessos" fill="url(#barGradient)" radius={[10, 10, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="premium-card reveal-scale" style={{ animationDelay: '0.3s' }}>
            <div className="mb-10">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/60 mb-2">Composição</h3>
              <h2 className="text-xl font-black text-foreground">Distribuição</h2>
            </div>

            <div className="h-[280px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={accessByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    dataKey="value"
                    paddingAngle={10}
                    cornerRadius={8}
                    stroke="none"
                  >
                    {accessByType.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10, 10, 12, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total</span>
                <span className="text-3xl font-black text-foreground">100%</span>
              </div>
            </div>

            <div className="space-y-5 mt-10">
              {accessByType.map((item) => (
                <div key={item.name} className="flex items-center justify-between group cursor-default p-2 rounded-xl hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)]" style={{ backgroundColor: item.color }} />
                    <span className="text-[11px] font-black text-muted-foreground uppercase tracking-wider group-hover:text-primary transition-colors">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* List Section */}
          <div className="lg:col-span-2 premium-card reveal-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/60">Atividade</h3>
                  <h2 className="text-2xl font-black text-foreground">Logs Recentes</h2>
                </div>
              </div>
              <button className="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-white/5 border border-white/5 transition-all">Ver Tudo</button>
            </div>

            <div className="space-y-3">
              {recentAccess.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center opacity-30 gap-4">
                  <Clock className="w-12 h-12" />
                  <p className="text-xs font-black uppercase tracking-[0.4em]">Silêncio operacional</p>
                </div>
              ) : (
                recentAccess.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-5 rounded-[24px] bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500 border border-white/[0.02] hover:border-white/[0.08] group">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl glass-3d flex items-center justify-center text-lg font-black text-primary uppercase group-hover:scale-110 transition-transform shadow-2xl">
                        {item.nome.charAt(0)}
                      </div>
                      <div>
                        <p className="text-base font-black text-foreground group-hover:text-primary transition-all">{item.nome}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{item.tipo}</span>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span className="text-[10px] font-black text-primary/70 uppercase tracking-[0.2em]">{item.hora}</span>
                        </div>
                      </div>
                    </div>
                    <div className="scale-110">
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="premium-card reveal-up" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20">
                <UserX className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-red-500/60">Crítico</h3>
                <h2 className="text-xl font-black text-foreground">Alertas Ativos</h2>
              </div>
            </div>

            <div className="space-y-4">
              {alerts.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-6 opacity-20">
                  <ShieldCheck className="w-16 h-16 text-primary animate-pulse" />
                  <p className="text-[11px] font-black uppercase tracking-[0.4em]">Perímetro Seguro</p>
                </div>
              ) : (
                alerts.map((item, i) => (
                  <div key={i} className="flex items-start gap-5 p-6 rounded-[28px] bg-red-500/5 border border-red-500/10 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500 animate-pulse" />
                    <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5 shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                    <div className="space-y-3">
                      <p className="text-sm font-black text-foreground leading-relaxed italic group-hover:text-red-400 transition-colors">"{item.descricao}"</p>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-red-400/50 uppercase tracking-widest">{item.hora}</span>
                        <div className="px-3 py-1 rounded-lg bg-red-500/10 text-[9px] font-black text-red-400 uppercase tracking-widest border border-red-500/10">
                          {item.tipo}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .parallax-layer {
          transform: translate3d(var(--mouse-x, 0), var(--mouse-y, 0), 0);
          transition: transform 0.2s ease-out;
        }
        .translate-z-10 { --mouse-x: calc(var(--mouse-x) * 0.5); --mouse-y: calc(var(--mouse-y) * 0.5); }
        .translate-z-20 { --mouse-x: calc(var(--mouse-x) * 1.2); --mouse-y: calc(var(--mouse-y) * 1.2); }
      `}} />
    </AppLayout>
  );
};

export default Dashboard;
