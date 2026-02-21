import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Filter } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const accessData = [
  { dia: "15/02", moradores: 120, visitantes: 35, prestadores: 12 },
  { dia: "16/02", moradores: 135, visitantes: 28, prestadores: 8 },
  { dia: "17/02", moradores: 110, visitantes: 42, prestadores: 15 },
  { dia: "18/02", moradores: 145, visitantes: 30, prestadores: 10 },
  { dia: "19/02", moradores: 130, visitantes: 38, prestadores: 20 },
  { dia: "20/02", moradores: 80, visitantes: 15, prestadores: 5 },
  { dia: "21/02", moradores: 95, visitantes: 22, prestadores: 8 },
];

const tooltipStyle = {
  contentStyle: {
    background: "hsl(220, 20%, 13%)",
    border: "1px solid hsl(220, 15%, 25%)",
    borderRadius: "12px",
    color: "hsl(210, 20%, 95%)",
  },
};

const Relatorios = () => (
  <AppLayout>
    <PageHeader title="Relatórios" subtitle="Análise e relatórios do condomínio">
      <Button variant="outline" className="h-10 rounded-xl border-border/50 text-muted-foreground hover:bg-secondary gap-2">
        <Download className="w-4 h-4" /> Exportar
      </Button>
    </PageHeader>

    {/* Filters */}
    <div className="glass-card p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Filtros</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Período Início</Label>
          <Input type="date" className="bg-secondary/50 border-border/50 rounded-xl h-10" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Período Fim</Label>
          <Input type="date" className="bg-secondary/50 border-border/50 rounded-xl h-10" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Tipo</Label>
          <Select>
            <SelectTrigger className="bg-secondary/50 border-border/50 rounded-xl h-10">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="moradores">Moradores</SelectItem>
              <SelectItem value="visitantes">Visitantes</SelectItem>
              <SelectItem value="prestadores">Prestadores</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground">Filtrar</Button>
        </div>
      </div>
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Acessos por Período</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={accessData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" />
            <XAxis dataKey="dia" stroke="hsl(215, 15%, 55%)" fontSize={11} />
            <YAxis stroke="hsl(215, 15%, 55%)" fontSize={11} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="moradores" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="visitantes" fill="hsl(210, 60%, 50%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="prestadores" fill="hsl(45, 93%, 47%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Tendência de Visitantes</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={accessData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" />
            <XAxis dataKey="dia" stroke="hsl(215, 15%, 55%)" fontSize={11} />
            <YAxis stroke="hsl(215, 15%, 55%)" fontSize={11} />
            <Tooltip {...tooltipStyle} />
            <Line type="monotone" dataKey="visitantes" stroke="hsl(210, 60%, 50%)" strokeWidth={2} dot={{ fill: "hsl(210, 60%, 50%)" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  </AppLayout>
);

export default Relatorios;
