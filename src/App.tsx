import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { BrowserRouter, Route, Routes, Navigate, Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);
  return null;
};
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import { AchievementsProvider } from "@/hooks/useAchievements";
import { I18nProvider } from "@/hooks/useI18n";
import AppHeader from "@/components/AppHeader";
import BottomTabBar from "@/components/BottomTabBar";
import BetaBanner from "@/components/BetaBanner";

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
import Compatibility from "./pages/Compatibility";
import Achievements from "./pages/Achievements";
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
      <ScrollToTop />
      {user && <BetaBanner />}
      <div style={user ? { paddingBottom: "calc(4rem + env(safe-area-inset-bottom))" } : undefined}>
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
        <Route path="/compatibilidad" element={<ProtectedRoute><Compatibility /></ProtectedRoute>} />
        <Route path="/mapa-estelar" element={<ProtectedRoute><SkyMap /></ProtectedRoute>} />
        <Route path="/logros" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Legal routes */}
        <Route path="/terminos" element={<Terms />} />
        <Route path="/privacidad" element={<Privacy />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/descargo" element={<Disclaimer />} />
        <Route path="/reembolso" element={<Refund />} />

        <Route path="*" element={<NotFound />} />
      </Routes>

      </div>
      {user && <BottomTabBar />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        
        <AuthProvider>
          <I18nProvider>
            <SubscriptionProvider>
              <AchievementsProvider>
                <AppRoutes />
              </AchievementsProvider>
            </SubscriptionProvider>
          </I18nProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
