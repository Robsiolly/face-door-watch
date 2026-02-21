import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  UserPlus,
  Camera,
  ScanFace,
  Clock,
  Users,
} from "lucide-react";

const recentAccess = [
  { nome: "Carlos Silva", tipo: "Morador", hora: "14:32", status: "authorized" as const, bloco: "A", apto: "101" },
  { nome: "Ana Oliveira", tipo: "Visitante", hora: "14:28", status: "authorized" as const, bloco: "B", apto: "302" },
  { nome: "Desconhecido", tipo: "—", hora: "14:02", status: "unknown" as const, bloco: "—", apto: "—" },
  { nome: "Pedro Santos", tipo: "Visitante", hora: "13:40", status: "denied" as const, bloco: "—", apto: "—" },
];

const presentPeople = [
  { nome: "Técnico NET", tipo: "Prestador", entrada: "10:30" },
  { nome: "Maria Santos", tipo: "Visitante", entrada: "11:15" },
  { nome: "Eletricista João", tipo: "Prestador", entrada: "09:00" },
];

const Portaria = () => {
  return (
    <AppLayout>
      <PageHeader title="Portaria" subtitle="Monitoramento em tempo real">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary pulse-green" />
          <span className="text-xs text-primary font-medium">AO VIVO</span>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Camera feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="camera-feed">
            {/* Simulated camera view */}
            <div className="w-full h-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center" style={{ aspectRatio: "16/9" }}>
              <div className="text-center">
                <ScanFace className="w-16 h-16 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Câmera Principal - Entrada</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Feed de vídeo ao vivo</p>
              </div>

              {/* Face detection overlay */}
              <div className="face-detection-box" style={{ top: "25%", left: "38%", width: "24%", height: "42%" }}>
                <div className="absolute -top-7 left-0 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded-lg font-medium">
                  Carlos Silva — Morador
                </div>
              </div>
            </div>

            {/* Camera info bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm px-4 py-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-mono">CAM-01 | Entrada Principal</span>
              <span className="text-xs text-muted-foreground font-mono">21/02/2026 14:32:45</span>
            </div>
          </div>

          {/* Recognition result */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-lg font-bold text-muted-foreground">
                  CS
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Carlos Silva</h3>
                  <p className="text-sm text-muted-foreground">Morador • Bloco A, Apto 101</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status="authorized" />
                    <span className="text-xs text-muted-foreground">Confiança: 98.5%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-base font-medium gap-2">
                <Check className="w-5 h-5" /> Liberar Acesso
              </Button>
              <Button variant="outline" className="flex-1 h-12 rounded-xl border-destructive/50 text-destructive hover:bg-destructive/10 text-base font-medium gap-2">
                <X className="w-5 h-5" /> Negar Acesso
              </Button>
              <Button variant="outline" className="h-12 rounded-xl border-border/50 text-muted-foreground hover:bg-secondary gap-2">
                <UserPlus className="w-5 h-5" />
              </Button>
              <Button variant="outline" className="h-12 rounded-xl border-border/50 text-muted-foreground hover:bg-secondary gap-2">
                <Camera className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Acessos Recentes</h3>
            </div>
            <div className="space-y-2">
              {recentAccess.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                      {item.nome.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">{item.nome}</p>
                      <p className="text-[10px] text-muted-foreground">{item.tipo} • {item.hora}</p>
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-foreground">Pessoas Presentes</h3>
            </div>
            <div className="space-y-2">
              {presentPeople.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                  <div>
                    <p className="text-xs font-medium text-foreground">{item.nome}</p>
                    <p className="text-[10px] text-muted-foreground">{item.tipo}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Desde {item.entrada}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Portaria;
