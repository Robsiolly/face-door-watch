import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Camera, History, ScanFace, Edit, Trash2, Eye } from "lucide-react";
import { usePeople } from "@/contexts/PeopleContext";
import { RegistrationModal } from "@/components/RegistrationModal";
import { AccessControlModal } from "@/components/AccessControlModal";
import { PersonDetailsModal } from "@/components/PersonDetailsModal";

import { Person } from "@/contexts/PeopleContext";

const Visitantes = () => {
  const { getPeopleByType, deletePerson } = usePeople();
  const data = getPeopleByType("visitante");

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
    { key: "telefone", label: "Telefone" },
    { key: "blocoVisitado", label: "Bloco" },
    { key: "aptoVisitado", label: "Apto" },
    { key: "autorizadoPor", label: "Autorizado Por" },
    { key: "validade", label: "Validade" },
    {
      key: "status",
      label: "Status",
      render: (item: Person) => <StatusBadge status={item.status} />,
    },
  ];

  return (
    <AppLayout>
      <PageHeader title="Visitantes" subtitle="Controle de visitantes">
        <div className="flex gap-2">
          <Button variant="outline" className="h-10 rounded-xl gap-2" onClick={() => setIsAccessOpen(true)}>
            <ScanFace className="w-4 h-4" /> Controle de Acesso
          </Button>
          <Button className="h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground gap-2" onClick={() => setIsRegOpen(true)}>
            <Plus className="w-4 h-4" /> Cadastrar
          </Button>
        </div>
      </PageHeader>

      <DataTable
        data={data}
        columns={columns}
        searchPlaceholder="Buscar visitante..."
        actions={(item: Person) => (
          <div className="flex items-center gap-1 justify-end">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground" onClick={() => handleViewDetails(item)}>
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
              <Camera className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
              <History className="w-4 h-4" />
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

      <RegistrationModal isOpen={isRegOpen} onClose={handleCloseReg} type="visitante" personToEdit={editingPerson} />
      <AccessControlModal isOpen={isAccessOpen} onClose={() => setIsAccessOpen(false)} allowedTypes={["visitante"]} />
      <PersonDetailsModal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} person={viewingPerson} />
    </AppLayout>
  );
};

export default Visitantes;
