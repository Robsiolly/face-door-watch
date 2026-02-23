import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useAppData, Veiculo } from "@/contexts/AppDataContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const Veiculos = () => {
  const { veiculos, addVeiculo, updateVeiculo, deleteVeiculo } = useAppData();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingVeiculo, setEditingVeiculo] = useState<Veiculo | null>(null);
  const [formData, setFormData] = useState<Partial<Veiculo>>({});

  const handleOpen = (veiculo?: Veiculo) => {
    if (veiculo) {
      setEditingVeiculo(veiculo);
      setFormData(veiculo);
    } else {
      setEditingVeiculo(null);
      setFormData({ status: 'active' });
    }
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!formData.placa || !formData.modelo) {
      toast({ title: "Erro", description: "Placa e modelo são obrigatórios.", variant: "destructive" });
      return;
    }

    if (editingVeiculo) {
      updateVeiculo(editingVeiculo.id, formData);
      toast({ title: "Sucesso", description: "Veículo atualizado!" });
    } else {
      addVeiculo(formData as Omit<Veiculo, 'id'>);
      toast({ title: "Sucesso", description: "Veículo adicionado!" });
    }
    setIsOpen(false);
  };

  const columns = [
    { key: "placa", label: "Placa", render: (item: Veiculo) => <span className="font-mono text-foreground font-bold">{item.placa}</span> },
    { key: "modelo", label: "Modelo" },
    { key: "cor", label: "Cor" },
    {
      key: "morador_info",
      label: "Responsável",
      render: (item: Veiculo) => (
        <div>
          <p className="font-medium text-sm">{item.morador || "Não inf."}</p>
          <p className="text-[10px] text-muted-foreground uppercase">{item.bloco ? `Bl ${item.bloco}` : ''} {item.apto ? `Ap ${item.apto}` : ''}</p>
        </div>
      )
    },
    { key: "status", label: "Status", render: (item: Veiculo) => <StatusBadge status={item.status} /> },
  ];

  return (
    <AppLayout>
      <PageHeader title="Veículos" subtitle="Controle de acessos e veículos">
        <Button className="h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground gap-2" onClick={() => handleOpen()}>
          <Plus className="w-4 h-4" /> Adicionar
        </Button>
      </PageHeader>

      <DataTable
        data={veiculos}
        columns={columns}
        searchPlaceholder="Buscar placa ou modelo..."
        searchKey="placa"
        actions={(item) => (
          <div className="flex items-center gap-1 justify-end">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground" onClick={() => handleOpen(item)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive/70 hover:text-destructive" onClick={() => deleteVeiculo(item.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingVeiculo ? "Editar Veículo" : "Novo Veículo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Placa</Label>
                <Input value={formData.placa || ""} onChange={e => setFormData({ ...formData, placa: e.target.value.toUpperCase() })} placeholder="ABC-1234" />
              </div>
              <div className="space-y-2">
                <Label>Cor</Label>
                <Input value={formData.cor || ""} onChange={e => setFormData({ ...formData, cor: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Modelo</Label>
              <Input value={formData.modelo || ""} onChange={e => setFormData({ ...formData, modelo: e.target.value })} placeholder="Ex: Corolla" />
            </div>
            <div className="space-y-2">
              <Label>Morador (Proprietário)</Label>
              <Input value={formData.morador || ""} onChange={e => setFormData({ ...formData, morador: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bloco</Label>
                <Input value={formData.bloco || ""} onChange={e => setFormData({ ...formData, bloco: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Apartamento</Label>
                <Input value={formData.apto || ""} onChange={e => setFormData({ ...formData, apto: e.target.value })} />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Veiculos;
