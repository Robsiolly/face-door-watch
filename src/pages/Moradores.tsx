import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Camera, Eye } from "lucide-react";

const moradores = [
  { id: 1, nome: "Carlos Silva", bloco: "A", apartamento: "101", telefone: "(11) 99999-1234", status: "active" as const },
  { id: 2, nome: "Maria Oliveira", bloco: "A", apartamento: "202", telefone: "(11) 99999-5678", status: "active" as const },
  { id: 3, nome: "João Mendes", bloco: "B", apartamento: "301", telefone: "(11) 99999-9012", status: "active" as const },
  { id: 4, nome: "Fernanda Costa", bloco: "B", apartamento: "402", telefone: "(11) 99999-3456", status: "inactive" as const },
  { id: 5, nome: "Ricardo Santos", bloco: "C", apartamento: "103", telefone: "(11) 99999-7890", status: "active" as const },
  { id: 6, nome: "Paula Souza", bloco: "C", apartamento: "204", telefone: "(11) 99999-2345", status: "active" as const },
];

const columns = [
  {
    key: "foto",
    label: "Foto",
    render: (item: typeof moradores[0]) => (
      <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-xs font-medium text-muted-foreground">
        {item.nome.split(" ").map(n => n[0]).join("")}
      </div>
    ),
  },
  { key: "nome", label: "Nome" },
  { key: "bloco", label: "Bloco" },
  { key: "apartamento", label: "Apto" },
  { key: "telefone", label: "Telefone" },
  {
    key: "status",
    label: "Status",
    render: (item: typeof moradores[0]) => <StatusBadge status={item.status} />,
  },
];

const Moradores = () => {
  return (
    <AppLayout>
      <PageHeader title="Moradores" subtitle="Gestão de moradores do condomínio">
        <Button className="h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
          <Plus className="w-4 h-4" /> Adicionar
        </Button>
      </PageHeader>

      <DataTable
        data={moradores}
        columns={columns}
        searchPlaceholder="Buscar morador..."
        actions={(item) => (
          <div className="flex items-center gap-1 justify-end">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
              <Camera className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive/70 hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      />
    </AppLayout>
  );
};

export default Moradores;
