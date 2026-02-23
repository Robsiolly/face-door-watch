import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Building2,
  Camera,
  Shield,
  Link,
  ScanFace,
  Save,
} from "lucide-react";

const cameras: Array<{ nome: string, localizacao: string, tipo: string, status: "active" | "inactive" }> = [];

const Section = ({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) => (
  <div className="glass-card p-5 mb-4">
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-4 h-4 text-primary" />
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
    {children}
  </div>
);

const Configuracoes = () => (
  <AppLayout>
    <PageHeader title="Configurações" subtitle="Configurações do sistema">
      <Button className="h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
        <Save className="w-4 h-4" /> Salvar
      </Button>
    </PageHeader>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div>
        <Section icon={Building2} title="Dados do Condomínio">
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Nome do Condomínio</Label>
              <Input defaultValue="" placeholder="Meu Condomínio" className="bg-secondary/50 border-border/50 rounded-xl h-10" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">CNPJ</Label>
              <Input defaultValue="" placeholder="00.000.000/0000-00" className="bg-secondary/50 border-border/50 rounded-xl h-10" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Endereço</Label>
              <Input defaultValue="" placeholder="Endereço" className="bg-secondary/50 border-border/50 rounded-xl h-10" />
            </div>
          </div>
        </Section>

        <Section icon={Shield} title="Permissões">
          <div className="space-y-3">
            {["Porteiros podem cadastrar visitantes", "Síndico pode ver relatórios", "Administrador acesso total"].map((perm) => (
              <div key={perm} className="flex items-center justify-between py-2">
                <span className="text-sm text-foreground">{perm}</span>
                <Switch defaultChecked />
              </div>
            ))}
          </div>
        </Section>

        <Section icon={Link} title="Integrações">
          <div className="space-y-3">
            {[
              { nome: "WhatsApp Notificações", status: true },
              { nome: "E-mail Alertas", status: true },
              { nome: "Controle de Cancela", status: false },
            ].map((item) => (
              <div key={item.nome} className="flex items-center justify-between py-2">
                <span className="text-sm text-foreground">{item.nome}</span>
                <Switch defaultChecked={item.status} />
              </div>
            ))}
          </div>
        </Section>
      </div>

      <div>
        <Section icon={Camera} title="Câmeras">
          <div className="space-y-3">
            {cameras.map((cam) => (
              <div key={cam.nome} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{cam.nome}</p>
                  <p className="text-xs text-muted-foreground">{cam.localizacao} • {cam.tipo}</p>
                </div>
                <StatusBadge status={cam.status} label={cam.status === "active" ? "Online" : "Offline"} />
              </div>
            ))}
          </div>
        </Section>

        <Section icon={ScanFace} title="Reconhecimento Facial">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary/50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-primary">0</p>
                <p className="text-xs text-muted-foreground">Pessoas Cadastradas</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-foreground">0%</p>
                <p className="text-xs text-muted-foreground">Taxa de Reconhecimento</p>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Confiança Mínima (%)</Label>
              <Input type="number" defaultValue="85" className="bg-secondary/50 border-border/50 rounded-xl h-10" />
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-foreground">Integração Facial Ativa</span>
              <Switch defaultChecked />
            </div>
          </div>
        </Section>
      </div>
    </div>
  </AppLayout>
);

export default Configuracoes;
