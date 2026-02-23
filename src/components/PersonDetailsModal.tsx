import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Person } from "@/contexts/PeopleContext";
import { User, Phone, MapPin, Building2, Briefcase, Calendar, ShieldCheck, ShieldAlert } from "lucide-react";

interface PersonDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    person?: Person;
}

export function PersonDetailsModal({ isOpen, onClose, person }: PersonDetailsModalProps) {
    if (!person) return null;

    const DetailItem = ({ icon: Icon, label, value, color = "text-muted-foreground" }: { icon: React.ElementType, label: string, value: string, color?: string }) => (
        <div className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0">
            <div className={`p-2 rounded-xl bg-secondary/50 ${color}`}>
                <Icon className="w-4 h-4" />
            </div>
            <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70">{label}</p>
                <p className="text-sm font-medium text-foreground">{value || "Não informado"}</p>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-3xl border-none glass shadow-2xl">
                <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    {person.photo ? (
                        <div className="relative group">
                            <img
                                src={person.photo}
                                alt={person.nome}
                                className="w-32 h-32 rounded-3xl object-cover border-4 border-background shadow-xl"
                                onError={(e) => {
                                    // Fallback if base64 is invalid
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement?.querySelector('.fallback')?.classList.remove('hidden');
                                }}
                            />
                            <div className="fallback hidden w-32 h-32 rounded-3xl bg-secondary flex items-center justify-center border-4 border-background shadow-xl">
                                <User className="w-16 h-16 text-muted-foreground/30" />
                            </div>
                        </div>
                    ) : (
                        <div className="w-32 h-32 rounded-3xl bg-secondary flex items-center justify-center border-4 border-background shadow-xl">
                            <User className="w-16 h-16 text-muted-foreground/30" />
                        </div>
                    )}
                    <div className="absolute bottom-4 right-6">
                        <div className={`px-3 py-1 rounded-full flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tighter border ${person.status === 'active' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-destructive/10 text-destructive border-destructive/20'
                            }`}>
                            {person.status === 'active' ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                            {person.status === 'active' ? 'Ativo' : 'Inativo'}
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-bold text-center">{person.nome}</DialogTitle>
                        <p className="text-center text-sm text-muted-foreground uppercase font-bold tracking-[0.2em]">{person.type}</p>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-x-6">
                        <DetailItem icon={User} label="Documento" value={person.documento} />
                        <DetailItem icon={Phone} label="Telefone" value={person.telefone || ""} />

                        {person.type === "morador" && (
                            <>
                                <DetailItem icon={MapPin} label="Bloco" value={person.bloco || ""} />
                                <DetailItem icon={Building2} label="Apartamento" value={person.apartamento || ""} />
                            </>
                        )}

                        {person.type === "visitante" && (
                            <>
                                <DetailItem icon={MapPin} label="Bloco Visitado" value={person.blocoVisitado || ""} />
                                <DetailItem icon={Building2} label="Apartamento Visitado" value={person.aptoVisitado || ""} />
                                <DetailItem icon={User} label="Autorizado Por" value={person.autorizadoPor || ""} />
                                <DetailItem icon={Calendar} label="Validade" value={person.validade || ""} />
                            </>
                        )}

                        {person.type === "prestador" && (
                            <>
                                <DetailItem icon={MapPin} label="Bloco Visitado" value={person.blocoVisitado || ""} />
                                <DetailItem icon={Building2} label="Apartamento Visitado" value={person.aptoVisitado || ""} />
                                <DetailItem icon={Building2} label="Empresa" value={person.empresa || ""} />
                                <DetailItem icon={Briefcase} label="Serviço" value={person.servico || ""} />
                            </>
                        )}
                    </div>

                    <div className="mt-8 flex justify-center">
                        <Button onClick={onClose} variant="secondary" className="px-10 rounded-xl font-bold">
                            Fechar Análise
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
