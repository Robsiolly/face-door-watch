import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, PackageCheck, MessageCircle, Check } from "lucide-react";
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

  const isMorador = user?.role === 'morador';

  // Filtrar se for morador
  const displayData = isMorador
    ? encomendas.filter(e => e.bloco === user.bloco && e.apto === user.apto)
    : encomendas;

  const handleOpen = (encomenda?: Encomenda) => {
    if (isMorador) return; // Morador não cria/edita
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
    if (isMorador) return;
    const newStatus = item.status === 'active' ? 'pending' : 'active';
    await updateEncomenda(item.id, { status: newStatus });
    toast({ title: "Status alterado", description: newStatus === 'active' ? "Encomenda marcada como retirada." : "Encomenda pendente." });
  };

  const sendWhatsApp = (item: Encomenda) => {
    // Tenta encontrar o morador pelo nome ou bloco/apto para pegar o telefone
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
        {!isMorador && (
          <Button className="h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground gap-2" onClick={() => handleOpen()}>
            <Plus className="w-4 h-4" /> Registrar
          </Button>
        )}
      </PageHeader>

      <DataTable
        data={displayData}
        columns={columns}
        searchPlaceholder="Buscar por morador ou descrição..."
        searchKey="morador"
        actions={!isMorador ? (item) => (
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
              className="h-8 w-8 rounded-lg text-green-500 hover:text-green-600 hover:bg-green-50"
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
        ) : undefined}
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
              className="text-green-600 border-green-200 hover:bg-green-50 gap-2"
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
