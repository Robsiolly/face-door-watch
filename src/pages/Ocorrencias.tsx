import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, CheckCircle2 } from "lucide-react";
import { useAppData, Ocorrencia } from "@/contexts/AppDataContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { notificationService } from "@/lib/notifications";
import { useAuth } from "@/contexts/AuthContext";

const Ocorrencias = () => {
  const { ocorrencias, addOcorrencia, updateOcorrencia, deleteOcorrencia } = useAppData();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingOcorrencia, setEditingOcorrencia] = useState<Ocorrencia | null>(null);
  const [formData, setFormData] = useState<Partial<Ocorrencia>>({});

  const [filterBloco, setFilterBloco] = useState("");
  const [filterApto, setFilterApto] = useState("");

  // Filtro de blocos e unidades
  const displayData = ocorrencias.filter(o => {
    const matchBloco = !filterBloco || o.bloco?.toString().toLowerCase().includes(filterBloco.toLowerCase());
    const matchApto = !filterApto || o.apto?.toString().toLowerCase().includes(filterApto.toLowerCase());
    return matchBloco && matchApto;
  });

  const handleOpen = (ocorrencia?: Ocorrencia) => {
    if (ocorrencia) {
      setEditingOcorrencia(ocorrencia);
      setFormData(ocorrencia);
    } else {
      setEditingOcorrencia(null);
      setFormData({ status: 'pending', data: new Date().toLocaleDateString('pt-BR') });
    }
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!formData.tipo || !formData.descricao) {
      toast({ title: "Erro", description: "Tipo e descrição são obrigatórios.", variant: "destructive" });
      return;
    }

    if (editingOcorrencia) {
      await updateOcorrencia(editingOcorrencia.id, formData);
      toast({ title: "Sucesso", description: "Ocorrência atualizada!" });
    } else {
      await addOcorrencia(formData as Omit<Ocorrencia, 'id'>);
      toast({ title: "Sucesso", description: "Ocorrência registrada!" });

      // Notify relevant parties
      const target = (formData.bloco && formData.apto)
        ? `${formData.bloco}-${formData.apto}`.toLowerCase().replace(/\s/g, '')
        : undefined;

      notificationService.send({
        title: `Nova Ocorrência: ${formData.tipo}`,
        message: formData.descricao || "",
        type: 'ocorrencia',
        target_user: target
      });
    }
    setIsOpen(false);
  };

  const toggleStatus = async (item: Ocorrencia) => {
    const newStatus = item.status === 'active' ? 'pending' : 'active';
    await updateOcorrencia(item.id, { status: newStatus });
    toast({ title: "Status alterado", description: newStatus === 'active' ? "Ocorrência marcada como resolvida." : "Ocorrência aberta." });
  };

  const columns = [
    {
      key: "tipo", label: "Tipo", render: (item: Ocorrencia) => (
        <span className="px-2 py-1 rounded-lg bg-secondary text-xs font-medium text-secondary-foreground">{item.tipo}</span>
      )
    },
    { key: "descricao", label: "Descrição" },
    {
      key: "local",
      label: "Local",
      render: (item: Ocorrencia) => (
        <span className="text-xs font-medium uppercase">{item.bloco ? `Bl ${item.bloco}` : ''} {item.apto ? `Ap ${item.apto}` : ''}</span>
      )
    },
    { key: "data", label: "Data" },
    { key: "responsavel", label: "Responsável" },
    {
      key: "status", label: "Status", render: (item: Ocorrencia) => (
        <StatusBadge status={item.status} label={item.status === "active" ? "Resolvido" : "Aberto"} />
      )
    },
  ];

  return (
    <AppLayout>
      <PageHeader title="Ocorrências" subtitle="Gestão de ocorrências e incidentes">
        <Button className="h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground gap-2" onClick={() => handleOpen()}>
          <Plus className="w-4 h-4" /> Registrar
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
        searchPlaceholder="Buscar por tipo, descrição ou unidade (Ap/Bl)..."
        searchKey={["tipo", "descricao", "bloco", "apartamento"]}
        actions={(item) => (
          <div className="flex items-center gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-lg ${item.status === 'active' ? 'text-primary' : 'text-muted-foreground'}`}
              onClick={() => toggleStatus(item)}
              title={item.status === 'active' ? "Marcar como aberto" : "Marcar como resolvido"}
            >
              <CheckCircle2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground" onClick={() => handleOpen(item)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive/70 hover:text-destructive" onClick={() => deleteOcorrencia(item.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingOcorrencia ? "Editar Ocorrência" : "Registrar Ocorrência"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de Ocorrência</Label>
              <Input value={formData.tipo || ""} onChange={e => setFormData({ ...formData, tipo: e.target.value })} placeholder="Ex: Barulho, Manutenção, etc" />
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
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={formData.descricao || ""} onChange={e => setFormData({ ...formData, descricao: e.target.value })} placeholder="Detalhes do ocorrido..." />
            </div>
            <div className="space-y-2">
              <Label>Responsável / Solicitante</Label>
              <Input value={formData.responsavel || ""} onChange={e => setFormData({ ...formData, responsavel: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input value={formData.data || ""} onChange={e => setFormData({ ...formData, data: e.target.value })} />
            </div>
          </div>
          <DialogFooter className="mt-8 gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl flex-1">Cancelar</Button>
            <Button onClick={handleSave} className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 flex-1">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Ocorrencias;
