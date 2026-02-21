import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const veiculos = [
  { id: 1, placa: "ABC-1234", modelo: "Honda Civic", cor: "Prata", morador: "Carlos Silva - A101", status: "active" as const },
  { id: 2, placa: "DEF-5678", modelo: "Toyota Corolla", cor: "Preto", morador: "Maria Oliveira - A202", status: "active" as const },
  { id: 3, placa: "GHI-9012", modelo: "VW Gol", cor: "Branco", morador: "João Mendes - B301", status: "active" as const },
  { id: 4, placa: "JKL-3456", modelo: "Fiat Uno", cor: "Vermelho", morador: "Fernanda Costa - B402", status: "inactive" as const },
];

const columns = [
  { key: "placa", label: "Placa", render: (item: typeof veiculos[0]) => <span className="font-mono text-foreground">{item.placa}</span> },
  { key: "modelo", label: "Modelo" },
  { key: "cor", label: "Cor" },
  { key: "morador", label: "Morador" },
  { key: "status", label: "Status", render: (item: typeof veiculos[0]) => <StatusBadge status={item.status} /> },
];

const Veiculos = () => (
  <AppLayout>
    <PageHeader title="Veículos" subtitle="Controle de veículos">
      <Button className="h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
        <Plus className="w-4 h-4" /> Adicionar
      </Button>
    </PageHeader>
    <DataTable data={veiculos} columns={columns} searchPlaceholder="Buscar placa ou modelo..." searchKey="placa" />
  </AppLayout>
);

export default Veiculos;
