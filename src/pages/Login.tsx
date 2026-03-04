import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, User, Lock, Activity, ArrowRight, Chrome, ScanFace, Camera, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BackgroundEffects } from "@/components/BackgroundEffects";
import { useToast } from "@/components/ui/use-toast";
import { getFaceDescriptor, loadFaceApi } from "@/lib/faceApi";

const Login = () => {
    const { login, loginWithGoogle, loginWithFace, registerWithFace, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [isProcessing, setIsProcessing] = useState(false);
    const [faceDescriptor, setFaceDescriptor] = useState<number[] | null>(null);

    const [regForm, setRegForm] = useState({ name: "", email: "" });
    const [loginEmail, setLoginEmail] = useState("");

    const videoRef = useRef<HTMLVideoElement>(null);
    const [showCamera, setShowCamera] = useState(false);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        if (isAuthenticated) navigate("/");
        return () => stopCamera();
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        stopCamera();
    }, [mode]);

    const startCamera = async () => {
        setShowCamera(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            // Provide a small delay to ensure video element is mounted
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
            await loadFaceApi();
        } catch (err) {
            toast({ title: "Erro na câmera", description: "Não foi possível acessar a webcam.", variant: "destructive" });
            setShowCamera(false);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setShowCamera(false);
    };

    const captureFace = async () => {
        if (!videoRef.current) return;
        setIsProcessing(true);
        try {
            const descriptor = await getFaceDescriptor(videoRef.current);
            if (descriptor) {
                setFaceDescriptor(descriptor as number[]);
                toast({ title: "Biometria capturada", description: "Sua face foi processada com sucesso." });
                stopCamera();
            } else {
                toast({ title: "Face não detectada", description: "Tente se posicionar melhor diante da câmera.", variant: "destructive" });
            }
        } catch (err) {
            toast({ title: "Erro no processamento", description: "Houve um problema ao processar sua face.", variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!faceDescriptor) {
            toast({ title: "Biometria necessária", description: "Capture seu reconhecimento facial para prosseguir.", variant: "destructive" });
            return;
        }
        setIsProcessing(true);
        try {
            await registerWithFace({ ...regForm, descriptor: faceDescriptor });
            toast({ title: "Cadastro realizado", description: "Bem-vindo ao ecossistema OTREBOR." });
            setMode('login');
            setFaceDescriptor(null);
            setRegForm({ name: "", email: "" });
        } catch (err) {
            toast({ title: "Erro no cadastro", description: "Verifique se o e-mail já está em uso.", variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBiometricLogin = async () => {
        if (!videoRef.current) {
            await startCamera();
            return;
        }

        setIsProcessing(true);
        try {
            await loadFaceApi();
            const descriptor = await getFaceDescriptor(videoRef.current);

            if (descriptor) {
                const success = await loginWithFace(descriptor as number[]);
                if (success) {
                    toast({ title: "Acesso autorizado", description: "Identidade confirmada via biometria." });
                    stopCamera();
                } else {
                    toast({ title: "Acesso negado", description: "Identidade não encontrada no sistema.", variant: "destructive" });
                }
            } else {
                toast({ title: "Face não detectada", description: "Posicione-se melhor diante da câmera.", variant: "destructive" });
            }
        } catch (err) {
            toast({ title: "Erro biométrico", description: "Não foi possível realizar o reconhecimento facial.", variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-[#050507]">
                <div className="flex flex-col items-center gap-4">
                    <Activity className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50">Neural Identity Check...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 overflow-hidden relative selection:bg-primary/30">
            <BackgroundEffects />

            <div className="w-full max-w-[520px] z-10 space-y-10">
                {/* Header */}
                <div className="text-center space-y-6 reveal-up">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 mb-2">
                        <ScanFace className="w-4 h-4 text-primary animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">Otrebor Biometric Protocol</span>
                    </div>

                    <div className="flex flex-col items-center">
                        <img src="/favicon.svg" alt="Logo" className="w-24 h-24 mb-6 hover:scale-110 transition-transform duration-700" />
                        <h1 className="text-6xl font-black tracking-tighter gold-text uppercase mb-1">Otrebor</h1>
                        <p className="text-muted-foreground font-black tracking-[0.5em] text-[10px] uppercase opacity-40">Intelligence & Defense</p>
                    </div>
                </div>

                {/* Main Card */}
                <div className="reveal-scale" style={{ animationDelay: '0.2s' }}>
                    <Card className="premium-card bg-black/60 backdrop-blur-[60px] border-white/5 rounded-[40px] overflow-hidden">
                        <div className="flex border-b border-white/5">
                            <button
                                onClick={() => setMode('login')}
                                className={`flex-1 py-5 text-[11px] font-black uppercase tracking-[0.3em] transition-all ${mode === 'login' ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => setMode('register')}
                                className={`flex-1 py-5 text-[11px] font-black uppercase tracking-[0.3em] transition-all ${mode === 'register' ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}
                            >
                                Cadastro
                            </button>
                        </div>

                        <CardContent className="p-10 space-y-8">
                            {mode === 'login' ? (
                                <div className="space-y-8">
                                    <div className="text-center space-y-2">
                                        <CardTitle className="text-3xl font-black">Autenticação Neural</CardTitle>
                                        <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Posicione-se diante do sensor biométrico</CardDescription>
                                    </div>

                                    <div className="space-y-6">
                                        {showCamera ? (
                                            <div className="relative aspect-video rounded-[32px] overflow-hidden border-2 border-primary/30 bg-black group">
                                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 border-[20px] border-black/20 pointer-events-none" />
                                                <div className="absolute inset-x-0 bottom-6 flex justify-center">
                                                    <Button
                                                        type="button"
                                                        onClick={handleBiometricLogin}
                                                        disabled={isProcessing}
                                                        className="rounded-full w-16 h-16 bg-primary hover:bg-primary/90 border-4 border-white/20 shadow-2xl flex items-center justify-center group"
                                                    >
                                                        {isProcessing ? (
                                                            <Activity className="w-8 h-8 text-black animate-spin" />
                                                        ) : (
                                                            <ScanFace className="w-8 h-8 text-black group-hover:scale-110 transition-transform" />
                                                        )}
                                                    </Button>
                                                </div>
                                                <div className="absolute top-4 right-4 group-hover:opacity-100 opacity-0 transition-opacity">
                                                    <Button variant="ghost" size="icon" onClick={stopCamera} className="rounded-full bg-black/40 text-white hover:bg-black/60">
                                                        <Activity className="w-4 h-4 rotate-45" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button
                                                onClick={startCamera}
                                                disabled={isProcessing}
                                                className="h-32 w-full rounded-[32px] bg-primary text-black hover:bg-primary/90 transition-all duration-500 font-black text-xs uppercase tracking-[0.3em] flex flex-col gap-2 group shadow-[0_15px_40px_rgba(191,149,63,0.3)]"
                                            >
                                                <Camera className="w-10 h-10 group-hover:scale-125 transition-transform duration-500" />
                                                Ativar Scanner de Face
                                            </Button>
                                        )}
                                    </div>

                                    <p className="text-[10px] text-center font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic">
                                        "Seu rosto é sua chave mestre no ecossistema OTREBOR"
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleRegister} className="space-y-8">
                                    <div className="text-center space-y-2">
                                        <CardTitle className="text-3xl font-black">Nova Identidade</CardTitle>
                                        <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Siga o protocolo para liberar seu acesso</CardDescription>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/50 ml-3">Nome Completo</Label>
                                            <div className="relative">
                                                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                                <Input
                                                    required
                                                    className="pl-14 h-16 rounded-[24px] bg-white/[0.03] border-white/5 focus:border-primary/20 text-base font-bold"
                                                    placeholder="Como devemos chamá-lo?"
                                                    value={regForm.name}
                                                    onChange={e => setRegForm({ ...regForm, name: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/50 ml-3">E-mail Corporativo</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                                <Input
                                                    required
                                                    type="email"
                                                    className="pl-14 h-16 rounded-[24px] bg-white/[0.03] border-white/5 focus:border-primary/20 text-base font-bold"
                                                    placeholder="exemplo@otrebor.ai"
                                                    value={regForm.email}
                                                    onChange={e => setRegForm({ ...regForm, email: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/50 ml-3">Reconhecimento Facial</Label>

                                            {showCamera ? (
                                                <div className="relative aspect-video rounded-[32px] overflow-hidden border-2 border-primary/30 bg-black">
                                                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                                    <div className="absolute inset-x-0 bottom-4 flex justify-center">
                                                        <Button
                                                            type="button"
                                                            onClick={captureFace}
                                                            disabled={isProcessing}
                                                            className="rounded-full w-14 h-14 bg-red-500 hover:bg-red-600 border-4 border-white/20 shadow-2xl animate-pulse"
                                                        >
                                                            <Camera className="w-6 h-6" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    onClick={startCamera}
                                                    className={`w-full h-32 rounded-[32px] border-2 border-dashed ${faceDescriptor ? 'border-primary/50 bg-primary/5' : 'border-white/10 bg-white/[0.02]'} hover:bg-white/[0.05] transition-all flex flex-col items-center justify-center gap-2 group`}
                                                >
                                                    {faceDescriptor ? (
                                                        <>
                                                            <ScanFace className="w-10 h-10 text-primary" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Biometria Pronta</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Camera className="w-10 h-10 text-white/20 group-hover:text-primary transition-colors" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ativar Sensor de Face</span>
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isProcessing || !faceDescriptor}
                                        className="btn-premium w-full h-18 rounded-[28px] group"
                                    >
                                        Confirmar Cadastro
                                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-all" />
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <p className="text-[10px] text-center font-black uppercase tracking-[0.4em] text-muted-foreground/30 px-10 leading-loose">
                    Processado via Motor Biométrico OTREBOR. Criptografia ponta-a-ponta ativada.
                </p>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .btn-premium {
                    background: var(--gold-gradient);
                    color: black;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.2em;
                    font-size: 0.75rem;
                    box-shadow: 0 10px 40px rgba(191,149,63,0.3);
                    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .btn-premium:hover {
                    box-shadow: 0 15px 50px rgba(191,149,63,0.4);
                    transform: translateY(-2px) scale(1.02);
                }
                .btn-premium:disabled {
                    opacity: 0.3;
                    filter: grayscale(1);
                }
            `}} />
        </div>
    );
};

export default Login;
