import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Check, Save, ScanFace, Settings } from "lucide-react";
import { usePeople, PersonType, Person } from "@/contexts/PeopleContext";
import { useToast } from "@/components/ui/use-toast";
import { loadFaceApi, getFaceDescriptor } from "@/lib/faceApi";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: PersonType;
    personToEdit?: Person;
}

export function RegistrationModal({ isOpen, onClose, type, personToEdit }: RegistrationModalProps) {
    const { addPerson, updatePerson } = usePeople();
    const { toast } = useToast();

    const [step, setStep] = useState<1 | 2>(1);
    const [formData, setFormData] = useState<Partial<Person>>(personToEdit || { type });
    const [faceCaptured, setFaceCaptured] = useState(!!personToEdit?.faceDescriptor);
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(personToEdit?.photo || null);
    const [faceDescriptor, setFaceDescriptor] = useState<number[] | null>(personToEdit?.faceDescriptor || null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedCamera, setSelectedCamera] = useState<string>("");

    const fetchDevices = async () => {
        try {
            const allDevices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = allDevices.filter(device => device.kind === "videoinput");
            setDevices(videoDevices);
        } catch (err) {
            console.error("Erro ao listar câmeras:", err);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadFaceApi().catch(err => {
                console.error("Face API failed to load", err);
            });
        }
    }, [isOpen]);

    const startCamera = async (deviceId?: string) => {
        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            const constraints: MediaStreamConstraints = {
                video: deviceId ? { deviceId: { exact: deviceId } } : true
            };
            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(mediaStream);
            await fetchDevices();
        } catch (err) {
            toast({ title: "Erro", description: "Não foi possível acessar a câmera.", variant: "destructive" });
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream, step]);

    useEffect(() => {
        if (!isOpen) stopCamera();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const resetState = () => {
        setStep(1);
        setFormData(personToEdit || { type });
        setFaceCaptured(!!personToEdit?.faceDescriptor);
        setCapturedPhoto(personToEdit?.photo || null);
        setFaceDescriptor(personToEdit?.faceDescriptor || null);
        stopCamera();
    };

    useEffect(() => {
        if (isOpen && personToEdit) {
            setFormData(personToEdit);
            setFaceCaptured(!!personToEdit.faceDescriptor);
            setCapturedPhoto(personToEdit.photo || null);
            setFaceDescriptor(personToEdit.faceDescriptor || null);
        } else if (isOpen) {
            setFormData({ type });
            setFaceCaptured(false);
            setCapturedPhoto(null);
            setFaceDescriptor(null);
        }
    }, [isOpen, personToEdit, type]);

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const renderFields = () => {
        return (
            <div className="space-y-4">
                <div>
                    <Label>Nome Completo</Label>
                    <Input name="nome" value={formData.nome || ""} onChange={handleChange} />
                </div>
                <div>
                    <Label>Documento (CPF/RG)</Label>
                    <Input name="documento" value={formData.documento || ""} onChange={handleChange} />
                </div>
                <div>
                    <Label>Telefone</Label>
                    <Input name="telefone" value={formData.telefone || ""} onChange={handleChange} />
                </div>
                {type === "morador" && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Bloco</Label>
                            <Input name="bloco" value={formData.bloco || ""} onChange={handleChange} />
                        </div>
                        <div>
                            <Label>Apartamento</Label>
                            <Input name="apartamento" value={formData.apartamento || ""} onChange={handleChange} />
                        </div>
                    </div>
                )}
                {type === "visitante" && (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Bloco Visitado</Label>
                                <Input name="blocoVisitado" value={formData.blocoVisitado || ""} onChange={handleChange} />
                            </div>
                            <div>
                                <Label>Apartamento Visitado</Label>
                                <Input name="aptoVisitado" value={formData.aptoVisitado || ""} onChange={handleChange} />
                            </div>
                        </div>
                        <div>
                            <Label>Autorizado Por</Label>
                            <Input name="autorizadoPor" value={formData.autorizadoPor || ""} onChange={handleChange} />
                        </div>
                        <div>
                            <Label>Validade do Acesso</Label>
                            <Input name="validade" type="date" value={formData.validade || ""} onChange={handleChange} />
                        </div>
                    </>
                )}
                {type === "prestador" && (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Bloco Visitado</Label>
                                <Input name="blocoVisitado" value={formData.blocoVisitado || ""} onChange={handleChange} />
                            </div>
                            <div>
                                <Label>Apartamento Visitado</Label>
                                <Input name="aptoVisitado" value={formData.aptoVisitado || ""} onChange={handleChange} />
                            </div>
                        </div>
                        <div>
                            <Label>Empresa</Label>
                            <Input name="empresa" value={formData.empresa || ""} onChange={handleChange} />
                        </div>
                        <div>
                            <Label>Serviço</Label>
                            <Input name="servico" value={formData.servico || ""} onChange={handleChange} />
                        </div>
                    </>
                )}
            </div>
        );
    };

    const handleNext = () => setStep(2);
    const handleSave = () => {
        if (!formData.nome || !formData.documento) {
            toast({ title: "Erro", description: "Nome e documento são obrigatórios.", variant: "destructive" });
            return;
        }

        if (personToEdit) {
            updatePerson(personToEdit.id, {
                ...formData,
                faceFeature: faceCaptured,
                faceDescriptor: faceDescriptor || undefined,
                photo: capturedPhoto || undefined
            });
            toast({ title: "Sucesso", description: "Cadastro atualizado com sucesso!" });
        } else {
            const newPerson = {
                ...formData,
                type,
                faceFeature: faceCaptured,
                faceDescriptor: faceDescriptor || undefined,
                photo: capturedPhoto || undefined,
                status: 'active'
            } as Omit<Person, "id">;
            addPerson(newPerson);
            toast({ title: "Sucesso", description: "Cadastro realizado com sucesso!" });
        }

        handleClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(val) => !val && handleClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{personToEdit ? 'Editar ' : 'Cadastrar '}{type === 'morador' ? 'Morador' : type === 'visitante' ? 'Visitante' : 'Prestador'}</DialogTitle>
                </DialogHeader>

                {step === 1 ? (
                    <>
                        {renderFields()}
                        <DialogFooter className="mt-6">
                            <Button onClick={handleNext} className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8">Avançar para Biometria</Button>
                        </DialogFooter>
                    </>
                ) : (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h3 className="font-semibold text-lg">Reconhecimento Facial</h3>
                            <p className="text-sm text-muted-foreground">Posicione o rosto em frente à câmera para registrar a face no sistema.</p>
                        </div>
                        <div className="flex h-48 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/30 relative overflow-hidden">
                            {stream ? (
                                <>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                    {isProcessing && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
                                            <div className="absolute inset-0 border-[4px] border-primary/30 animate-pulse pointer-events-none" />
                                            <ScanFace className="h-12 w-12 text-primary animate-pulse" />
                                        </div>
                                    )}
                                    {faceCaptured && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 animate-in fade-in duration-500">
                                            {capturedPhoto ? (
                                                <img src={capturedPhoto} alt="Face capturada" className="absolute inset-0 w-full h-full object-cover" />
                                            ) : (
                                                <div className="absolute inset-0 bg-background/90" />
                                            )}
                                            <div className="relative z-10 flex flex-col items-center justify-center bg-background/60 backdrop-blur-md p-4 rounded-2xl border border-primary/30">
                                                <Check className="h-10 w-10 mb-2 text-primary" />
                                                <p className="font-bold text-primary">Rosto Capturado</p>
                                                <Button size="sm" variant="ghost" onClick={() => { setFaceCaptured(false); startCamera(selectedCamera); }} className="mt-2 h-7 text-[10px] uppercase font-bold tracking-wider hover:bg-primary/20 hover:text-primary">Recapturar</Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Discreet Camera Selector */}
                                    <div className="absolute top-2 right-2 z-30">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm border border-white/10">
                                                    <Settings className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-md">
                                                {devices.map((device, idx) => (
                                                    <DropdownMenuItem
                                                        key={device.deviceId || idx}
                                                        onClick={() => {
                                                            setSelectedCamera(device.deviceId);
                                                            startCamera(device.deviceId);
                                                        }}
                                                        className={selectedCamera === device.deviceId ? "bg-primary/10 text-primary font-semibold" : ""}
                                                    >
                                                        <Camera className="mr-2 h-4 w-4" />
                                                        {device.label || `Câmera ${idx + 1}`}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-muted-foreground">
                                    <Camera className="h-12 w-12 mb-2 opacity-50" />
                                    <Button size="sm" variant="outline" onClick={() => startCamera(selectedCamera)}>Iniciar Câmera</Button>
                                </div>
                            )}
                        </div>
                        <DialogFooter className="mt-8 justify-between sm:justify-between items-center">
                            <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl">Voltar</Button>
                            <div className="flex gap-2">
                                {!faceCaptured && (
                                    <Button
                                        variant="secondary"
                                        disabled={!stream || isProcessing}
                                        className="rounded-xl font-bold"
                                        onClick={async () => {
                                            if (!videoRef.current) return;
                                            setIsProcessing(true);
                                            try {
                                                const descriptor = await getFaceDescriptor(videoRef.current);
                                                if (descriptor) {
                                                    const canvas = document.createElement("canvas");
                                                    canvas.width = videoRef.current.videoWidth;
                                                    canvas.height = videoRef.current.videoHeight;
                                                    const ctx = canvas.getContext("2d");
                                                    if (ctx) {
                                                        ctx.drawImage(videoRef.current, 0, 0);
                                                        setCapturedPhoto(canvas.toDataURL("image/jpeg", 0.8));
                                                    }
                                                    setFaceDescriptor(descriptor as number[]);
                                                    setFaceCaptured(true);
                                                    stopCamera();
                                                    toast({ title: "Sucesso", description: "Biometria facial capturada." });
                                                } else {
                                                    toast({ title: "Erro", description: "Rosto não detectado.", variant: "destructive" });
                                                }
                                            } catch (err) {
                                                toast({ title: "Erro", description: "Falha no processamento.", variant: "destructive" });
                                            } finally {
                                                setIsProcessing(false);
                                            }
                                        }}
                                    >
                                        {isProcessing ? "Lendo..." : "Capturar Face"}
                                    </Button>
                                )}
                                <Button onClick={handleSave} disabled={!faceCaptured} className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 gap-2">
                                    <Save className="h-4 w-4" /> Salvar Cadastro
                                </Button>
                            </div>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
