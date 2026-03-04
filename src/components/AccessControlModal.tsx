import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ScanFace, CheckCircle2, ShieldAlert, Camera, Settings } from "lucide-react";
import { usePeople, Person } from "@/contexts/PeopleContext";
import { useToast } from "@/components/ui/use-toast";
import { loadFaceApi, getFaceDescriptor, compareFaces } from "@/lib/faceApi";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AccessControlModalProps {
    isOpen: boolean;
    onClose: () => void;
    allowedTypes?: Array<"morador" | "visitante" | "prestador">;
}

export function AccessControlModal({ isOpen, onClose, allowedTypes }: AccessControlModalProps) {
    const { people, findPersonByDoc } = usePeople();
    const { toast } = useToast();

    const [mode, setMode] = useState<"doc" | "camera">("doc");
    const [docTerm, setDocTerm] = useState("");
    const [foundPerson, setFoundPerson] = useState<Person | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
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

    const startCamera = async (deviceId?: string) => {
        try {
            await loadFaceApi();
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
    }, [stream, mode]);

    useEffect(() => {
        if (!isOpen || mode !== "camera") {
            stopCamera();
        }
        if (!isOpen) {
            setDocTerm("");
            setFoundPerson(null);
            setIsScanning(false);
            setMode("doc");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, mode]);

    const handleSearch = () => {
        const p = findPersonByDoc(docTerm);
        if (p) {
            if (allowedTypes && !allowedTypes.includes(p.type)) {
                toast({ title: "Tipo inválido", description: `Encontrado um ${p.type}, mas não pertence a este painel.`, variant: "destructive" });
                setFoundPerson(null);
            } else {
                setFoundPerson(p);
            }
        } else {
            setFoundPerson(null);
            toast({ title: "Não encontrado", description: "Pessoa não cadastrada no sistema.", variant: "destructive" });
        }
    };

    const simulateFaceScan = async () => {
        if (!stream || !videoRef.current) return;
        setIsScanning(true);
        setFoundPerson(null);

        try {
            const currentDescriptor = await getFaceDescriptor(videoRef.current);
            setIsScanning(false);

            if (!currentDescriptor) {
                toast({ title: "Erro", description: "Rosto não detectado. Tente novamente.", variant: "destructive" });
                return;
            }

            let bestMatch: Person | null = null;
            let validPeople = people;
            if (allowedTypes) {
                validPeople = people.filter(p => allowedTypes.includes(p.type));
            }

            for (const person of validPeople) {
                if (person.faceDescriptor) {
                    const isMatch = compareFaces(currentDescriptor as number[], person.faceDescriptor);
                    if (isMatch) {
                        bestMatch = person;
                        break;
                    }
                }
            }

            if (bestMatch) {
                setFoundPerson(bestMatch);
                toast({ title: "Rosto detectado!", description: `${bestMatch.nome} reconhecido com sucesso.` });
            } else {
                toast({ title: "Acesso Negado", description: "Rosto não reconhecido na base correspondente.", variant: "destructive" });
            }
        } catch (err) {
            setIsScanning(false);
            toast({ title: "Erro", description: "Falha no reconhecimento facial.", variant: "destructive" });
        }
    };

    const handleLiberar = () => {
        toast({ title: "Acesso Liberado!", description: `Entrada autorizada para ${foundPerson?.nome}.`, variant: "default" });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Controle de Acesso</DialogTitle>
                </DialogHeader>

                <div className="flex gap-2 mb-4">
                    <Button variant={mode === "doc" ? "default" : "outline"} onClick={() => setMode("doc")} className="flex-1">Por Documento</Button>
                    <Button variant={mode === "camera" ? "default" : "outline"} onClick={() => setMode("camera")} className="flex-1">Reconhecimento Facial</Button>
                </div>

                {mode === "doc" && (
                    <div className="flex gap-2 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input placeholder="Digite o documento..." value={docTerm} onChange={e => setDocTerm(e.target.value)} className="pl-9" />
                        </div>
                        <Button onClick={handleSearch}>Buscar</Button>
                    </div>
                )}

                {mode === "camera" && (
                    <div className="mb-6 flex flex-col items-center">
                        <div className="flex h-48 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/30 relative overflow-hidden mb-4">
                            {stream ? (
                                <>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                    {isScanning && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
                                            <div className="absolute inset-0 border-[6px] border-primary/50 animate-pulse pointer-events-none" />
                                            <ScanFace className="h-12 w-12 text-primary animate-pulse" />
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
                        <Button onClick={simulateFaceScan} disabled={isScanning || !stream} className="w-full gap-2">
                            <ScanFace className="w-4 h-4" /> {isScanning ? "Analisando..." : "Escanear Rosto"}
                        </Button>
                    </div>
                )}

                {foundPerson && (
                    <div className="rounded-xl border border-border/50 bg-secondary/20 p-4 space-y-4 animate-in fade-in zoom-in duration-300">
                        <div className="flex items-start gap-4">
                            {foundPerson.photo ? (
                                <img src={foundPerson.photo} alt={foundPerson.nome} className="w-12 h-12 rounded-xl object-cover border border-border/50" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                                    {foundPerson.nome.charAt(0)}
                                </div>
                            )}
                            <div>
                                <h3 className="font-semibold text-lg">{foundPerson.nome}</h3>
                                <p className="text-sm text-muted-foreground uppercase">{foundPerson.type} • Doc: {foundPerson.documento}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {foundPerson.telefone && <div><span className="text-muted-foreground">Tel:</span> {foundPerson.telefone}</div>}
                            {foundPerson.bloco && <div><span className="text-muted-foreground">Bloco:</span> {foundPerson.bloco}</div>}
                            {foundPerson.apartamento && <div><span className="text-muted-foreground">Apto:</span> {foundPerson.apartamento}</div>}
                            {foundPerson.blocoVisitado && <div><span className="text-muted-foreground">Bl. Visitado:</span> {foundPerson.blocoVisitado}</div>}
                            {foundPerson.aptoVisitado && <div><span className="text-muted-foreground">Apto Visitado:</span> {foundPerson.aptoVisitado}</div>}
                            {foundPerson.empresa && <div><span className="text-muted-foreground">Empresa:</span> {foundPerson.empresa}</div>}
                            {foundPerson.autorizadoPor && <div><span className="text-muted-foreground">Liberado por:</span> {foundPerson.autorizadoPor}</div>}
                        </div>

                        <DialogFooter className="flex gap-3 pt-3">
                            <Button onClick={handleLiberar} className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2 rounded-xl">
                                <CheckCircle2 className="w-4 h-4" /> Liberar Acesso
                            </Button>
                            <Button variant="outline" onClick={() => setFoundPerson(null)} className="flex-1 border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-600 gap-2 rounded-xl">
                                <ShieldAlert className="w-4 h-4" /> Negar
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
