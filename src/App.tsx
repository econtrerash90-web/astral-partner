import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import elfawaLogo from "@/assets/elfawa-logo.png";
import { BrowserRouter, Route, Routes, Navigate, Link } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import { AchievementsProvider } from "@/hooks/useAchievements";
import AppHeader from "@/components/AppHeader";
import BetaBanner from "@/components/BetaBanner";
import CookieConsent from "@/components/CookieConsent";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Index from "./pages/Index";
import Journal from "./pages/Journal";
import Profile from "./pages/Profile";
import LuckyNumber from "./pages/LuckyNumber";
import Ritual from "./pages/Ritual";
import Amulet from "./pages/Amulet";
import Tarot from "./pages/Tarot";
import Secret from "./pages/Secret";
import Angels from "./pages/Angels";
import Oracle from "./pages/Oracle";
import Premium from "./pages/Premium";
import SkyMap from "./pages/SkyMap";
import NatalChart from "./pages/NatalChart";
import NotFound from "./pages/NotFound";
import Terms from "./pages/legal/Terms";
import Privacy from "./pages/legal/Privacy";
import Cookies from "./pages/legal/Cookies";
import Disclaimer from "./pages/legal/Disclaimer";
import Refund from "./pages/legal/Refund";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, loading } = useAuth();

  return (
    <>
      {user && <BetaBanner />}
      {user && <AppHeader />}
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/recuperar-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Landing or App home */}
        <Route path="/" element={
          loading ? null : user ? (
            <ProtectedRoute><Index /></ProtectedRoute>
          ) : (
            <Landing />
          )
        } />

        {/* Protected routes */}
        <Route path="/diario" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
        <Route path="/numero-suerte" element={<ProtectedRoute><LuckyNumber /></ProtectedRoute>} />
        <Route path="/ritual" element={<ProtectedRoute><Ritual /></ProtectedRoute>} />
        <Route path="/amuleto" element={<ProtectedRoute><Amulet /></ProtectedRoute>} />
        <Route path="/tarot" element={<ProtectedRoute><Tarot /></ProtectedRoute>} />
        <Route path="/el-secreto" element={<ProtectedRoute><Secret /></ProtectedRoute>} />
        <Route path="/angeles" element={<ProtectedRoute><Angels /></ProtectedRoute>} />
        <Route path="/oraculo" element={<ProtectedRoute><Oracle /></ProtectedRoute>} />
        <Route path="/premium" element={<ProtectedRoute><Premium /></ProtectedRoute>} />
        <Route path="/sky-map" element={<ProtectedRoute><SkyMap /></ProtectedRoute>} />
        <Route path="/carta-natal" element={<ProtectedRoute><NatalChart /></ProtectedRoute>} />
        <Route path="/mapa-estelar" element={<ProtectedRoute><SkyMap /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Legal routes */}
        <Route path="/terminos" element={<Terms />} />
        <Route path="/privacidad" element={<Privacy />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/descargo" element={<Disclaimer />} />
        <Route path="/reembolso" element={<Refund />} />

        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Powered by Elfawa footer */}
      <footer className="relative z-10 py-4 text-center border-t border-border/30 space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link to="/terminos" className="text-muted-foreground/40 hover:text-muted-foreground/70 text-[11px] font-body transition-colors">Términos</Link>
          <Link to="/privacidad" className="text-muted-foreground/40 hover:text-muted-foreground/70 text-[11px] font-body transition-colors">Privacidad</Link>
          <Link to="/cookies" className="text-muted-foreground/40 hover:text-muted-foreground/70 text-[11px] font-body transition-colors">Cookies</Link>
          <Link to="/descargo" className="text-muted-foreground/40 hover:text-muted-foreground/70 text-[11px] font-body transition-colors">Descargo</Link>
          <Link to="/reembolso" className="text-muted-foreground/40 hover:text-muted-foreground/70 text-[11px] font-body transition-colors">Reembolso</Link>
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="text-muted-foreground/50 text-xs font-body">Powered by</span>
          <img src={elfawaLogo} alt="Elfawa" className="h-5 w-5 opacity-60" />
          <span className="text-muted-foreground/60 text-xs font-body font-medium">Elfawa</span>
          <span className="text-muted-foreground/40 text-xs font-body">2026</span>
        </div>
      </footer>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CookieConsent />
        <AuthProvider>
          <SubscriptionProvider>
            <AchievementsProvider>
              <AppRoutes />
            </AchievementsProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
