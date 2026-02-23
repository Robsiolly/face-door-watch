import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Portaria from "./pages/Portaria";
import Moradores from "./pages/Moradores";
import Visitantes from "./pages/Visitantes";
import Prestadores from "./pages/Prestadores";
import Veiculos from "./pages/Veiculos";
import Encomendas from "./pages/Encomendas";
import Ocorrencias from "./pages/Ocorrencias";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import { PeopleProvider } from "./contexts/PeopleContext";
import { AppDataProvider } from "./contexts/AppDataContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Login />;

  if (roles && user && !roles.includes(user.role)) {
    return <Index />; // Ou uma página de acesso negado
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <PeopleProvider>
          <AppDataProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/portaria" element={<ProtectedRoute roles={['portaria', 'admin']}><Portaria /></ProtectedRoute>} />
                <Route path="/moradores" element={<ProtectedRoute roles={['portaria', 'admin']}><Moradores /></ProtectedRoute>} />
                <Route path="/visitantes" element={<ProtectedRoute roles={['portaria', 'admin']}><Visitantes /></ProtectedRoute>} />
                <Route path="/prestadores" element={<ProtectedRoute roles={['portaria', 'admin']}><Prestadores /></ProtectedRoute>} />
                <Route path="/veiculos" element={<ProtectedRoute roles={['portaria', 'admin']}><Veiculos /></ProtectedRoute>} />
                <Route path="/encomendas" element={<ProtectedRoute><Encomendas /></ProtectedRoute>} />
                <Route path="/ocorrencias" element={<ProtectedRoute><Ocorrencias /></ProtectedRoute>} />
                <Route path="/relatorios" element={<ProtectedRoute roles={['portaria', 'admin']}><Relatorios /></ProtectedRoute>} />
                <Route path="/configuracoes" element={<ProtectedRoute roles={['portaria', 'admin']}><Configuracoes /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AppDataProvider>
        </PeopleProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
