import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Camera, CheckCircle } from "lucide-react";

const encomendas = [
  { id: 1, morador: "Carlos Silva - A101", descricao: "Caixa grande - Amazon", dataRecebimento: "21/02/2026 10:30", status: "pending" as const },
  { id: 2, morador: "Maria Oliveira - A202", descricao: "Envelope - Correios", dataRecebimento: "21/02/2026 09:15", status: "pending" as const },
  { id: 3, morador: "João Mendes - B301", descricao: "Pacote médio - Mercado Livre", dataRecebimento: "20/02/2026 14:00", status: "active" as const },
  { id: 4, morador: "Paula Souza - C204", descricao: "Caixa pequena - Shopee", dataRecebimento: "20/02/2026 11:45", status: "pending" as const },
];

const columns = [
  { key: "morador", label: "Morador" },
  { key: "descricao", label: "Descrição" },
  { key: "dataRecebimento", label: "Recebimento" },
  {
    key: "status",
    label: "Retirado",
    render: (item: typeof encomendas[0]) => (
      <StatusBadge status={item.status} label={item.status === "active" ? "Sim" : "Não"} />
    ),
  },
];

const Encomendas = () => (
  <AppLayout>
    <PageHeader title="Encomendas" subtitle="Gestão de encomendas">
      <Button className="h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
        <Plus className="w-4 h-4" /> Registrar
      </Button>
    </PageHeader>
    <DataTable
      data={encomendas}
      columns={columns}
      searchPlaceholder="Buscar encomenda..."
      searchKey="morador"
      actions={() => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"><Camera className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-primary/70 hover:text-primary"><CheckCircle className="w-4 h-4" /></Button>
        </div>
      )}
    />
  </AppLayout>
);

export default Encomendas;
