import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Camera, History } from "lucide-react";

const prestadores = [
  { id: 1, nome: "Técnico NET", empresa: "NET/Claro", servico: "Instalação Internet", data: "21/02/2026", autorizadoPor: "Carlos Silva - A101" },
  { id: 2, nome: "Eletricista João", empresa: "JE Elétrica", servico: "Manutenção", data: "21/02/2026", autorizadoPor: "Administração" },
  { id: 3, nome: "Pintor Marcos", empresa: "Pintura Express", servico: "Pintura", data: "20/02/2026", autorizadoPor: "Maria Oliveira - A202" },
];

const columns = [
  {
    key: "foto",
    label: "Foto",
    render: (item: typeof prestadores[0]) => (
      <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-xs font-medium text-muted-foreground">
        {item.nome.charAt(0)}
      </div>
    ),
  },
  { key: "nome", label: "Nome" },
  { key: "empresa", label: "Empresa" },
  { key: "servico", label: "Serviço" },
  { key: "data", label: "Data" },
  { key: "autorizadoPor", label: "Autorizado Por" },
];

const Prestadores = () => (
  <AppLayout>
    <PageHeader title="Prestadores" subtitle="Controle de prestadores de serviço">
      <Button className="h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
        <Plus className="w-4 h-4" /> Cadastrar
      </Button>
    </PageHeader>
    <DataTable
      data={prestadores}
      columns={columns}
      searchPlaceholder="Buscar prestador..."
      actions={() => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"><Camera className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"><History className="w-4 h-4" /></Button>
        </div>
      )}
    />
  </AppLayout>
);

export default Prestadores;
