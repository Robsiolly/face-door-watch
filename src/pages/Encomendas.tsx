import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, PackageCheck, MessageCircle, Check, Phone } from "lucide-react";
import { useAppData, Encomenda } from "@/contexts/AppDataContext";
import { usePeople } from "@/contexts/PeopleContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { notificationService } from "@/lib/notifications";
import { useAuth } from "@/contexts/AuthContext";

const Encomendas = () => {
  const { encomendas, addEncomenda, updateEncomenda, deleteEncomenda } = useAppData();
  const { findPersonByDoc, people } = usePeople();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingEncomenda, setEditingEncomenda] = useState<Encomenda | null>(null);
  const [formData, setFormData] = useState<Partial<Encomenda>>({});
  const [filterBloco, setFilterBloco] = useState("");
  const [filterApto, setFilterApto] = useState("");

  // Resumo de encomendas pendentes agrupadas por bloco/apto
  const pendingSummary = encomendas
    .filter(e => e.status === 'pending')
    .reduce((acc, curr) => {
      const key = `${curr.bloco || 'S/B'}-${curr.apto || 'S/A'}`;
      if (!acc[key]) acc[key] = { block: curr.bloco, apto: curr.apto, count: 0, items: [] };
      acc[key].count++;
      acc[key].items.push(curr.descricao);
      return acc;
    }, {} as Record<string, { block: string, apto: string, count: number, items: string[] }>);

  const displayData = encomendas.filter(e => {
    const matchBloco = !filterBloco || e.bloco?.toString().toLowerCase().includes(filterBloco.toLowerCase());
    const matchApto = !filterApto || e.apto?.toString().toLowerCase().includes(filterApto.toLowerCase());
    return matchBloco && matchApto;
  });

  const handleOpen = (encomenda?: Encomenda) => {
    if (encomenda) {
      setEditingEncomenda(encomenda);
      setFormData(encomenda);
    } else {
      setEditingEncomenda(null);
      setFormData({ status: 'pending', dataRecebimento: new Date().toLocaleDateString('pt-BR') });
    }
    setIsOpen(true);
  };

  // Associação automática: Busca morador por Bloco/Apto
  useEffect(() => {
    if (formData.bloco && formData.apto && !editingEncomenda) {
      const found = people.find(p =>
        p.type === 'morador' &&
        p.bloco === formData.bloco &&
        p.apartamento === formData.apto
      );
      if (found && found.nome !== formData.morador) {
        setFormData(prev => ({ ...prev, morador: found.nome }));
      }
    }
  }, [formData.bloco, formData.apto, people, editingEncomenda]);

  const handleSave = async () => {
    if (!formData.morador || !formData.descricao) {
      toast({ title: "Erro", description: "Morador e descrição são obrigatórios.", variant: "destructive" });
      return;
    }

    if (editingEncomenda) {
      await updateEncomenda(editingEncomenda.id, formData);
      toast({ title: "Sucesso", description: "Encomenda atualizada!" });
    } else {
      await addEncomenda(formData as Omit<Encomenda, 'id'>);
      toast({ title: "Sucesso", description: "Encomenda registrada!" });

      // Notify resident
      const target = (formData.bloco && formData.apto)
        ? `${formData.bloco}-${formData.apto}`.toLowerCase().replace(/\s/g, '')
        : undefined;

      notificationService.send({
        title: "Correspondência na Portaria",
        message: `Olá, há uma correspondência na portaria para você. Favor retirar assim que possível.`,
        type: 'encomenda',
        target_user: target
      });

    }
    setIsOpen(false);
  };

  const toggleStatus = async (item: Encomenda) => {
    const newStatus = item.status === 'active' ? 'pending' : 'active';
    await updateEncomenda(item.id, { status: newStatus });
    toast({ title: "Status alterado", description: newStatus === 'active' ? "Encomenda marcada como retirada." : "Encomenda pendente." });
  };

  const sendWhatsApp = (item: Encomenda) => {
    const morador = people.find(p =>
      p.type === 'morador' &&
      p.bloco === item.bloco &&
      p.apartamento === item.apto
    );

    if (!morador?.telefone) {
      toast({
        title: "Telefone não encontrado",
        description: "O morador não possui telefone cadastrado para envio automático.",
        variant: "destructive"
      });
      return;
    }

    const phone = morador.telefone.replace(/\D/g, '');
    const message = `Olá ${item.morador}, há uma correspondência na portaria para você. Favor retirar assim que possível.`;
    const url = `whatsapp://send?phone=55${phone}&text=${encodeURIComponent(message)}`;

    window.location.href = url;
  };

  const columns = [
    {
      key: "morador_info",
      label: "Destinatário",
      render: (item: Encomenda) => (
        <div>
          <p className="font-semibold text-sm">{item.morador}</p>
          <p className="text-[10px] text-muted-foreground uppercase">{item.bloco ? `Bl ${item.bloco}` : ''} {item.apto ? `Ap ${item.apto}` : ''}</p>
        </div>
      )
    },
    { key: "descricao", label: "Descrição" },
    { key: "dataRecebimento", label: "Recebimento" },
    {
      key: "status",
      label: "Retirado",
      render: (item: Encomenda) => (
        <StatusBadge status={item.status} label={item.status === "active" ? "Sim" : "Não"} />
      ),
    },
  ];

  return (
    <AppLayout>
      <PageHeader title="Encomendas" subtitle="Gestão de recebimentos">
        <Button className="h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground gap-2" onClick={() => handleOpen()}>
          <Plus className="w-4 h-4" /> Registrar
        </Button>
      </PageHeader>

      {Object.keys(pendingSummary).length > 0 && (
        <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-primary" /> Encomendas Pendentes por Unidade
          </h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(pendingSummary).map(([key, data]) => (
              <div
                key={key}
                className="glass-card p-3 flex flex-col items-center justify-center min-w-[100px] border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => {
                  setFilterBloco(data.block || "");
                  setFilterApto(data.apto || "");
                }}
              >
                <p className="text-[10px] text-muted-foreground font-bold uppercase">Bl {data.block} - Ap {data.apto}</p>
                <p className="text-xl font-black text-primary">{data.count}</p>
                <p className="text-[9px] text-primary/70 font-medium">PENDENTE(S)</p>
              </div>
            ))}
            {(filterBloco || filterApto) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto py-2 px-3 text-xs text-muted-foreground hover:text-destructive"
                onClick={() => { setFilterBloco(""); setFilterApto(""); }}
              >
                Limpar Filtros
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="space-y-1">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Filtrar Bloco</Label>
          <Input
            placeholder="Ex: A, 1, Norte..."
            value={filterBloco}
            onChange={(e) => setFilterBloco(e.target.value)}
            className="bg-secondary/50 border-border/50 rounded-xl"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Filtrar Apartamento</Label>
          <Input
            placeholder="Ex: 101, 12-B..."
            value={filterApto}
            onChange={(e) => setFilterApto(e.target.value)}
            className="bg-secondary/50 border-border/50 rounded-xl"
          />
        </div>
      </div>

      <DataTable
        data={displayData}
        columns={columns}
        searchPlaceholder="Buscar por morador, descrição ou unidade (Ap/Bl)..."
        searchKey={["morador", "descricao", "apto", "bloco"]}
        actions={(item) => (
          <div className="flex items-center gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-lg ${item.status === 'active' ? 'text-primary' : 'text-muted-foreground'}`}
              onClick={() => toggleStatus(item)}
              title={item.status === 'active' ? "Marcar como não retirado" : "Marcar como retirado"}
            >
              <PackageCheck className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-primary hover:text-primary/80 hover:bg-primary/10"
              onClick={() => sendWhatsApp(item)}
              title="Notificar via WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground" onClick={() => handleOpen(item)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive/70 hover:text-destructive" onClick={() => deleteEncomenda(item.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingEncomenda ? "Editar Encomenda" : "Registrar Encomenda"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <Label>Nome do Morador</Label>
                {formData.bloco && formData.apto && people.find(p => p.type === 'morador' && p.bloco === formData.bloco && p.apartamento === formData.apto) && (
                  <span className="text-[10px] text-green-600 font-bold flex items-center gap-1 animate-in fade-in zoom-in">
                    <Check className="w-3 h-3" /> MORADOR LOCALIZADO
                  </span>
                )}
              </div>
              <Input value={formData.morador || ""} onChange={e => setFormData({ ...formData, morador: e.target.value })} placeholder="Ex: João Silva" />
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

            {/* Exibição automática do telefone */}
            {formData.bloco && formData.apto && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label className="text-xs text-muted-foreground italic">Telefone Associado</Label>
                <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/10 rounded-xl">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">
                    {people.find(p => p.type === 'morador' && p.bloco === formData.bloco && p.apartamento === formData.apto)?.telefone || "Telefone não cadastrado"}
                  </span>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Descrição / Volume</Label>
              <Input value={formData.descricao || ""} onChange={e => setFormData({ ...formData, descricao: e.target.value })} placeholder="Ex: Caixa Amazon, iFood, etc" />
            </div>
            <div className="space-y-2">
              <Label>Data de Recebimento</Label>
              <Input value={formData.dataRecebimento || ""} onChange={e => setFormData({ ...formData, dataRecebimento: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button
              variant="outline"
              className="text-primary border-primary/20 hover:bg-primary/10 gap-2"
              onClick={() => sendWhatsApp(formData as Encomenda)}
            >
              <MessageCircle className="w-4 h-4" /> Notificar WhatsApp
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Encomendas;
