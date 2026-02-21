import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Image } from "lucide-react";

const ocorrencias = [
  { id: 1, tipo: "Barulho", descricao: "Barulho excessivo após 22h no Bloco A", data: "21/02/2026", responsavel: "Portaria", status: "pending" as const },
  { id: 2, tipo: "Manutenção", descricao: "Vazamento na garagem subsolo", data: "20/02/2026", responsavel: "Zelador", status: "active" as const },
  { id: 3, tipo: "Segurança", descricao: "Pessoa suspeita rondando o prédio", data: "19/02/2026", responsavel: "Portaria", status: "active" as const },
];

const columns = [
  { key: "tipo", label: "Tipo", render: (item: typeof ocorrencias[0]) => (
    <span className="px-2 py-1 rounded-lg bg-secondary text-xs font-medium text-secondary-foreground">{item.tipo}</span>
  )},
  { key: "descricao", label: "Descrição" },
  { key: "data", label: "Data" },
  { key: "responsavel", label: "Responsável" },
  { key: "status", label: "Status", render: (item: typeof ocorrencias[0]) => (
    <StatusBadge status={item.status} label={item.status === "active" ? "Resolvido" : "Aberto"} />
  )},
];

const Ocorrencias = () => (
  <AppLayout>
    <PageHeader title="Ocorrências" subtitle="Registro de ocorrências">
      <Button className="h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
        <Plus className="w-4 h-4" /> Registrar
      </Button>
    </PageHeader>
    <DataTable
      data={ocorrencias}
      columns={columns}
      searchPlaceholder="Buscar ocorrência..."
      searchKey="descricao"
      actions={() => (
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
          <Image className="w-4 h-4" />
        </Button>
      )}
    />
  </AppLayout>
);

export default Ocorrencias;
