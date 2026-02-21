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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/portaria" element={<Portaria />} />
          <Route path="/moradores" element={<Moradores />} />
          <Route path="/visitantes" element={<Visitantes />} />
          <Route path="/prestadores" element={<Prestadores />} />
          <Route path="/veiculos" element={<Veiculos />} />
          <Route path="/encomendas" element={<Encomendas />} />
          <Route path="/ocorrencias" element={<Ocorrencias />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
