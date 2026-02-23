import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  UserPlus,
  Camera,
  ScanFace,
  Clock,
  Users,
  Loader2,
  Settings,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePeople, Person } from "@/contexts/PeopleContext";
import { useToast } from "@/components/ui/use-toast";
import { loadFaceApi, getFaceDescriptor, compareFaces } from "@/lib/faceApi";
import { notificationService } from "@/lib/notifications";

const Portaria = () => {
  const { people } = usePeople();
  const { toast } = useToast();

  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [foundPerson, setFoundPerson] = useState<Person | null>(null);
  const [unrecognized, setUnrecognized] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(true);
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
    let activeStream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        setIsCameraLoading(true);
        await loadFaceApi();
        activeStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
            facingMode: selectedCamera ? undefined : "user"
          }
        });
        setStream(activeStream);
        setIsCameraLoading(false);

        // Fetch devices to get labels after permission is granted
        await fetchDevices();
      } catch (err) {
        console.error("Camera error:", err);
        setIsCameraLoading(false);
        toast({ title: "Erro na Câmera", description: "Certifique-se que deu permissão para uso da câmera.", variant: "destructive" });
      }
    };
    startCamera();

    return () => {
      if (activeStream) {
        (activeStream as MediaStream).getTracks().forEach(track => track.stop());
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCamera]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(console.error);
      };
    }
  }, [stream]);

  const handleScan = async () => {
    if (!stream || !videoRef.current) return;

    setIsScanning(true);
    setFoundPerson(null);
    setUnrecognized(false);

    try {
      // Pequena pausa para garantir que o frame está pronto
      await new Promise(resolve => setTimeout(resolve, 200));

      const currentDescriptor = await getFaceDescriptor(videoRef.current);

      if (!currentDescriptor) {
        setIsScanning(false);
        toast({ title: "Rosto não encontrado", description: "Posicione-se melhor à frente da câmera.", variant: "destructive" });
        return;
      }

      let bestMatch: Person | null = null;
      for (const person of people) {
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
        toast({ title: "Identificado", description: `${bestMatch.nome} reconhecido.` });

        // Push notification
        const targetBloco = bestMatch.type === 'morador' ? bestMatch.bloco : bestMatch.blocoVisitado;
        const targetApto = (bestMatch.type === 'morador' ? bestMatch.apartamento : bestMatch.aptoVisitado) || "";

        if (targetBloco && targetApto) {
          notificationService.send({
            title: bestMatch.type === 'morador' ? "Chegada de Morador" : "Seu Visitante Chegou",
            message: `${bestMatch.nome} chegou à portaria agora.`,
            type: 'visitante',
            target_user: `${targetBloco}-${targetApto}`
          });
        }
      } else {
        setUnrecognized(true);
      }
    } catch (err) {
      console.error("Scan error:", err);
      toast({ title: "Erro", description: "Houve um problema no reconhecimento.", variant: "destructive" });
    } finally {
      setIsScanning(false);
    }
  };

  const clearState = () => {
    setFoundPerson(null);
    setUnrecognized(false);
  };

  return (
    <AppLayout>
      <PageHeader title="Portaria" subtitle="Monitoramento em tempo real">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs text-primary font-medium">SISTEMA ATIVO</span>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-muted border border-border shadow-2xl">
            {isCameraLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-secondary/20">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Iniciando Biometria...</p>
              </div>
            ) : stream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                <Camera className="w-12 h-12 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Câmera não disponível</p>
              </div>
            )}

            {/* Scanning Overlay - Minimalist to prevent black flash */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none z-10">
                <div className="absolute inset-0 border-[8px] border-primary/40 animate-pulse" />
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-primary/60 shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-scan-line" />
              </div>
            )}

            {/* Results Overlay */}
            {(foundPerson || unrecognized) && (
              <div className={`absolute inset-0 z-20 flex items-center justify-center backdrop-blur-sm ${unrecognized ? 'bg-destructive/10' : 'bg-primary/5'}`}>
                <div className="glass-card p-8 text-center animate-in zoom-in duration-300 max-w-sm mx-4">
                  {unrecognized ? (
                    <>
                      <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4 border-2 border-destructive/30">
                        <X className="w-10 h-10 text-destructive" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-1">Não Reconhecido</h3>
                      <p className="text-sm text-muted-foreground mb-6">Este indivíduo não consta na base de dados.</p>
                      <div className="flex gap-2">
                        <Button onClick={clearState} variant="outline" className="flex-1 rounded-xl">Voltar</Button>
                        <Button
                          onClick={() => {
                            toast({ title: "Alerta Enviado", variant: "destructive" });
                            notificationService.send({
                              title: "ALERTA: Indivíduo não reconhecido",
                              message: "Um indivíduo não identificado está tentando acesso na portaria.",
                              type: 'ocorrencia'
                            });
                          }}
                          className="flex-1 rounded-xl bg-destructive hover:bg-destructive/90"
                        >
                          Alertar
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      {foundPerson?.photo ? (
                        <div className="mb-4 relative">
                          <img src={foundPerson.photo} alt={foundPerson.nome} className="w-24 h-24 rounded-3xl object-cover mx-auto border-4 border-primary/20 shadow-xl" />
                          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground border-4 border-background">
                            <Check className="w-4 h-4" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 border-2 border-primary/30">
                          <Check className="w-12 h-12 text-primary" />
                        </div>
                      )}
                      <h3 className="text-2xl font-bold text-foreground mb-1">{foundPerson?.nome}</h3>
                      <p className="text-sm text-primary font-medium uppercase mb-6 tracking-wider">{foundPerson?.type} • AUTORIZADO</p>
                      <div className="flex gap-2">
                        <Button onClick={clearState} variant="outline" className="flex-1 rounded-xl">Fechar</Button>
                        <Button onClick={() => { toast({ title: "Acesso Liberado" }); clearState(); }} className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground">Liberar</Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Bar Controls */}
            {!isScanning && !foundPerson && !unrecognized && stream && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
                <Button onClick={handleScan} className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-8 rounded-full shadow-2xl shadow-primary/40 gap-3 font-bold text-lg group">
                  <ScanFace className="w-6 h-6 group-hover:scale-110 transition-transform" /> Iniciar Reconhecimento
                </Button>
              </div>
            )}

            <div className="absolute top-4 left-4 flex gap-2">
              <div className="glass px-3 py-1.5 rounded-full flex items-center gap-2 border-white/10">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold text-primary tracking-widest uppercase">
                  {devices.find(d => d.deviceId === selectedCamera)?.label || "Cam-Main"}
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full glass border-white/10 text-white/70 hover:text-white hover:bg-white/10">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 glass border-white/20 bg-background/80 backdrop-blur-xl">
                  {devices.length === 0 ? (
                    <div className="p-2 text-xs text-muted-foreground">Nenhuma câmera encontrada</div>
                  ) : (
                    devices.map((device, index) => (
                      <DropdownMenuItem
                        key={device.deviceId || index}
                        onClick={() => setSelectedCamera(device.deviceId)}
                        className={`text-xs gap-2 ${selectedCamera === device.deviceId ? "bg-primary/20 text-primary font-bold" : ""}`}
                      >
                        <Camera className="w-3 h-3" />
                        {device.label || `Câmera ${index + 1}`}
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Quick Info Bar */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-card p-4 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary"><Users className="w-5 h-5" /></div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Base</p>
                <p className="text-xl font-bold">{people.length}</p>
              </div>
            </div>
            <div className="glass-card p-4 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-accent/10 text-accent"><Clock className="w-5 h-5" /></div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Último Acesso</p>
                <p className="text-xl font-bold">12:45</p>
              </div>
            </div>
            <div className="glass-card p-4 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-warning/10 text-warning"><UserPlus className="w-5 h-5" /></div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Pendentes</p>
                <p className="text-xl font-bold">03</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-5 h-full">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Histórico Operacional
            </h3>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center font-bold text-muted-foreground">A</div>
                    <div>
                      <p className="text-sm font-bold">Acesso {i}</p>
                      <p className="text-[10px] text-muted-foreground">Confirmado via Biometria</p>
                    </div>
                  </div>
                  <StatusBadge status="authorized" />
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-xs font-semibold text-muted-foreground hover:text-primary">Ver histórico completo</Button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes scan-line {
            0% { top: 10%; opacity: 0.2; }
            50% { opacity: 1; }
            100% { top: 90%; opacity: 0.2; }
        }
        .animate-scan-line {
            animation: scan-line 2s linear infinite;
        }
      `}} />
    </AppLayout>
  );
};

export default Portaria;
