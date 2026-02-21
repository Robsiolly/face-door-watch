import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Camera, History } from "lucide-react";

const visitantes = [
  { id: 1, nome: "Ana Oliveira", documento: "123.456.789-00", telefone: "(11) 98888-1111", autorizadoPor: "Carlos Silva - A101", validade: "21/02/2026", status: "authorized" as const },
  { id: 2, nome: "Pedro Santos", documento: "987.654.321-00", telefone: "(11) 98888-2222", autorizadoPor: "Maria Oliveira - A202", validade: "20/02/2026", status: "denied" as const },
  { id: 3, nome: "Lucia Ferreira", documento: "456.789.123-00", telefone: "(11) 98888-3333", autorizadoPor: "João Mendes - B301", validade: "22/02/2026", status: "authorized" as const },
];

const columns = [
  {
    key: "foto",
    label: "Foto",
    render: (item: typeof visitantes[0]) => (
      <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-xs font-medium text-muted-foreground">
        {item.nome.split(" ").map(n => n[0]).join("")}
      </div>
    ),
  },
  { key: "nome", label: "Nome" },
  { key: "documento", label: "Documento" },
  { key: "telefone", label: "Telefone" },
  { key: "autorizadoPor", label: "Autorizado Por" },
  { key: "validade", label: "Validade" },
  {
    key: "status",
    label: "Status",
    render: (item: typeof visitantes[0]) => <StatusBadge status={item.status} />,
  },
];

const Visitantes = () => {
  return (
    <AppLayout>
      <PageHeader title="Visitantes" subtitle="Controle de visitantes">
        <Button className="h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
          <Plus className="w-4 h-4" /> Cadastrar
        </Button>
      </PageHeader>

      <DataTable
        data={visitantes}
        columns={columns}
        searchPlaceholder="Buscar visitante..."
        actions={() => (
          <div className="flex items-center gap-1 justify-end">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
              <Camera className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
              <History className="w-4 h-4" />
            </Button>
          </div>
        )}
      />
    </AppLayout>
  );
};

export default Visitantes;
