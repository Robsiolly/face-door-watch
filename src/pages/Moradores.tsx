import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Camera, Eye, ScanFace } from "lucide-react";
import { usePeople } from "@/contexts/PeopleContext";
import { RegistrationModal } from "@/components/RegistrationModal";
import { AccessControlModal } from "@/components/AccessControlModal";
import { PersonDetailsModal } from "@/components/PersonDetailsModal";
import { useToast } from "@/components/ui/use-toast";

import { Person } from "@/contexts/PeopleContext";

const Moradores = () => {
  const { getPeopleByType, deletePerson } = usePeople();
  const { toast } = useToast();
  const data = getPeopleByType("morador");

  const [isRegOpen, setIsRegOpen] = useState(false);
  const [isAccessOpen, setIsAccessOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewingPerson, setViewingPerson] = useState<Person | undefined>(undefined);
  const [editingPerson, setEditingPerson] = useState<Person | undefined>(undefined);

  const handleEdit = (person: Person) => {
    setEditingPerson(person);
    setIsRegOpen(true);
  };

  const handleViewDetails = (person: Person) => {
    setViewingPerson(person);
    setIsDetailsOpen(true);
  };

  const handleCloseReg = () => {
    setIsRegOpen(false);
    setEditingPerson(undefined);
  };

  const columns = [
    {
      key: "foto",
      label: "Foto",
      render: (item: Person) => (
        <div
          className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center overflow-hidden border border-border/50 cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => handleViewDetails(item)}
        >
          {item.photo ? (
            <img src={item.photo} alt={item.nome} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-muted-foreground">
              {item.nome.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "nome",
      label: "Nome",
      render: (item: Person) => (
        <button
          onClick={() => handleViewDetails(item)}
          className="text-foreground font-semibold hover:text-primary transition-colors text-left"
        >
          {item.nome}
        </button>
      )
    },
    { key: "documento", label: "Documento" },
    { key: "bloco", label: "Bloco" },
    { key: "apartamento", label: "Apto" },
    { key: "telefone", label: "Telefone" },
    {
      key: "status",
      label: "Status",
      render: (item: Person) => <StatusBadge status={item.status} />,
    },
  ];

  return (
    <AppLayout>
      <PageHeader title="Moradores" subtitle="Gestão de moradores do condomínio">
        <div className="flex gap-2">
          <Button variant="outline" className="h-10 rounded-xl gap-2" onClick={() => setIsAccessOpen(true)}>
            <ScanFace className="w-4 h-4" /> Controle de Acesso
          </Button>
          <Button className="h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground gap-2" onClick={() => setIsRegOpen(true)}>
            <Plus className="w-4 h-4" /> Adicionar
          </Button>
        </div>
      </PageHeader>

      <DataTable
        data={data}
        columns={columns}
        searchPlaceholder="Buscar morador..."
        actions={(item: Person) => (
          <div className="flex items-center gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-primary/70 hover:text-primary hover:bg-primary/10"
              title="Copiar Link de Acesso"
              onClick={() => {
                const url = `${window.location.origin}/?b=${item.bloco || ''}&a=${item.apartamento || ''}&n=${encodeURIComponent(item.nome)}`;
                navigator.clipboard.writeText(url);
                toast({ title: "Link Copiado!", description: `Link de acesso para ${item.nome} pronto para envio.` });
              }}
            >
              <Plus className="w-4 h-4 rotate-45" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground" onClick={() => handleViewDetails(item)}>
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
              <Camera className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground" onClick={() => handleEdit(item)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive/70 hover:text-destructive" onClick={() => deletePerson(item.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      />

      <RegistrationModal isOpen={isRegOpen} onClose={handleCloseReg} type="morador" personToEdit={editingPerson} />
      <AccessControlModal isOpen={isAccessOpen} onClose={() => setIsAccessOpen(false)} allowedTypes={["morador"]} />
      <PersonDetailsModal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} person={viewingPerson} />
    </AppLayout>
  );
};

export default Moradores;
