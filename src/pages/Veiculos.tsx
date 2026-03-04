import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useAppData, Veiculo } from "@/contexts/AppDataContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const Veiculos = () => {
  const { veiculos, addVeiculo, updateVeiculo, deleteVeiculo } = useAppData();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingVeiculo, setEditingVeiculo] = useState<Veiculo | null>(null);
  const [formData, setFormData] = useState<Partial<Veiculo>>({});
  const [filterBloco, setFilterBloco] = useState("");
  const [filterApto, setFilterApto] = useState("");

  const displayData = veiculos.filter(v => {
    const matchBloco = !filterBloco || v.bloco?.toString().toLowerCase().includes(filterBloco.toLowerCase());
    const matchApto = !filterApto || v.apto?.toString().toLowerCase().includes(filterApto.toLowerCase());
    return matchBloco && matchApto;
  });

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

  const handleSave = async () => {
    if (!formData.placa || !formData.modelo) {
      toast({ title: "Erro", description: "Placa e modelo são obrigatórios.", variant: "destructive" });
      return;
    }

    if (editingVeiculo) {
      await updateVeiculo(editingVeiculo.id, formData);
      toast({ title: "Sucesso", description: "Veículo atualizado!" });
    } else {
      await addVeiculo(formData as Omit<Veiculo, 'id'>);
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="space-y-1">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Filtrar Bloco</Label>
          <Input
            placeholder="Buscar por bloco..."
            value={filterBloco}
            onChange={(e) => setFilterBloco(e.target.value)}
            className="bg-secondary/50 border-border/50 rounded-xl"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Filtrar Apartamento</Label>
          <Input
            placeholder="Buscar por apartamento..."
            value={filterApto}
            onChange={(e) => setFilterApto(e.target.value)}
            className="bg-secondary/50 border-border/50 rounded-xl"
          />
        </div>
      </div>

      <DataTable
        data={displayData}
        columns={columns}
        searchPlaceholder="Buscar placa, modelo, cor, morador ou unidade..."
        searchKey={["placa", "modelo", "cor", "morador", "apto", "bloco"]}
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
          <DialogFooter className="mt-6 gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl">Cancelar</Button>
            <Button onClick={handleSave} className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8">Salvar Veículo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Veiculos;
