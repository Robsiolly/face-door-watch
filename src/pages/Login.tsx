import { useState } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Home, Building2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [role, setRole] = useState<UserRole>("portaria");
    const [formData, setFormData] = useState({
        bloco: "",
        apto: "",
        nome: "",
        password: ""
    });

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        login({
            role,
            bloco: formData.bloco,
            apto: formData.apto,
            name: formData.nome,
            password: formData.password
        });
        navigate("/");
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-background via-secondary/20 to-background overflow-hidden relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] animate-pulse" />

            <div className="w-full max-w-md z-10 animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 rounded-2xl bg-primary/20 mb-4 border border-primary/20">
                        <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Otrebor Watch</h1>
                    <p className="text-muted-foreground mt-2 font-medium italic">Segurança e Conectividade para seu Condomínio</p>
                </div>

                <Card className="glass-card border-white/10 shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-xl">Identificação</CardTitle>
                        <CardDescription>Escolha como deseja acessar o sistema</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="portaria" className="w-full" onValueChange={(v) => setRole(v as UserRole)}>
                            <TabsList className="grid w-full grid-cols-2 mb-8 bg-secondary/50 p-1 rounded-xl">
                                <TabsTrigger value="portaria" className="rounded-lg gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                    <Building2 className="w-4 h-4" /> Portaria
                                </TabsTrigger>
                                <TabsTrigger value="morador" className="rounded-lg gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                    <Home className="w-4 h-4" /> Morador
                                </TabsTrigger>
                            </TabsList>

                            <form onSubmit={handleLogin} className="space-y-4">
                                <TabsContent value="portaria" className="mt-0 space-y-4 animate-in slide-in-from-left-2 duration-300">
                                    <div className="space-y-2">
                                        <Label htmlFor="nome-portaria" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nome do Operador</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="nome-portaria"
                                                placeholder="Digite seu nome..."
                                                className="pl-10 h-11 rounded-xl glass bg-secondary/30"
                                                value={formData.nome}
                                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="pass-portaria" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Senha de Acesso</Label>
                                        <Input
                                            id="pass-portaria"
                                            type="password"
                                            placeholder="••••••••"
                                            className="h-11 rounded-xl glass bg-secondary/30"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="morador" className="mt-0 space-y-4 animate-in slide-in-from-right-2 duration-300">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="bloco" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Bloco</Label>
                                            <Input
                                                id="bloco"
                                                placeholder="Ex: A"
                                                className="h-11 rounded-xl glass bg-secondary/30"
                                                value={formData.bloco}
                                                onChange={(e) => setFormData({ ...formData, bloco: e.target.value })}
                                                required={role === 'morador'}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="apto" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Apartamento</Label>
                                            <Input
                                                id="apto"
                                                placeholder="Ex: 101"
                                                className="h-11 rounded-xl glass bg-secondary/30"
                                                value={formData.apto}
                                                onChange={(e) => setFormData({ ...formData, apto: e.target.value })}
                                                required={role === 'morador'}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="nome-morador" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nome Completo</Label>
                                        <Input
                                            id="nome-morador"
                                            placeholder="Seu nome..."
                                            className="h-11 rounded-xl glass bg-secondary/30"
                                            value={formData.nome}
                                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                            required={role === 'morador'}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="pass-morador" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Senha Individual</Label>
                                        <Input
                                            id="pass-morador"
                                            type="password"
                                            placeholder="Crie ou digite sua senha"
                                            className="h-11 rounded-xl glass bg-secondary/30"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required={role === 'morador'}
                                        />
                                    </div>
                                </TabsContent>

                                <Button type="submit" className="w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-primary/20">
                                    Acessar Sistema
                                </Button>
                            </form>
                        </Tabs>
                    </CardContent>
                    <CardFooter className="flex justify-center border-t border-white/5 pt-6">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-primary" /> Sistema de Vigilância • v1.0
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default Login;
