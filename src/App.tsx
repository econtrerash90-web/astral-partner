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

const BASE_URL = "https://astrelle-guide.app";

const PAGE_META: Record<string, { title: string; description: string }> = {
  "/": { title: "Astrelle — Tu guía personal basada en las estrellas", description: "Descubre tu carta astral completa, predicciones semanales y herramientas místicas personalizadas. Análisis astrológico con IA." },
  "/login": { title: "Iniciar Sesión | Astrelle", description: "Accede a tu cuenta para descubrir tu carta astral, lecturas personalizadas y predicciones semanales basadas en las estrellas." },
  "/registro": { title: "Crear Cuenta | Astrelle", description: "Regístrate gratis y descubre tu carta astral completa. Predicciones semanales personalizadas y herramientas místicas." },
  "/recuperar-password": { title: "Recuperar Contraseña | Astrelle", description: "Recupera el acceso a tu cuenta de Astrelle. Te enviaremos instrucciones para restablecer tu contraseña de forma segura." },
  "/reset-password": { title: "Restablecer Contraseña | Astrelle", description: "Crea una nueva contraseña para tu cuenta de Astrelle y vuelve a acceder a tu carta astral y lecturas personalizadas." },
  "/diario": { title: "Diario Astral | Astrelle", description: "Escribe tus reflexiones diarias guiadas por las estrellas. Análisis emocional con IA y seguimiento de tu estado de ánimo." },
  "/numero-suerte": { title: "Número de la Suerte | Astrelle", description: "Descubre qué número te favorece hoy según tu carta astral y la posición actual de los astros. Actualizado diariamente." },
  "/ritual": { title: "Ritual Diario | Astrelle", description: "Recibe un ritual personalizado con velas alineado a tu carta astral. Renueva tu energía todos los días con Astrelle." },
  "/amuleto": { title: "Amuleto de la Suerte | Astrelle", description: "Descubre tu piedra de poder de hoy alineada con tu carta astral. Propiedades, usos y significado personalizado." },
  "/tarot": { title: "Tarot | Astrelle", description: "Haz tu pregunta y recibe una lectura de tarot personalizada basada en tu energía astral. Una carta, una respuesta del universo." },
  "/el-secreto": { title: "El Secreto | Astrelle", description: "Revela el secreto que el universo tiene para ti hoy. Una lectura mística personalizada basada en tu carta astral." },
  "/angeles": { title: "Mensaje de Ángeles | Astrelle", description: "Recibe un mensaje angelical personalizado para tu día. Guía espiritual basada en tu energía astral y posición de los astros." },
  "/oraculo": { title: "Oráculo | Astrelle", description: "Consulta el oráculo y recibe una predicción personalizada. Sabiduría ancestral aplicada a tu carta astral y momento actual." },
  "/suenos": { title: "Interpreta Tus Sueños | Astrelle", description: "Describe tu sueño y recibe una interpretación personalizada basada en símbolos universales y tu energía astral." },
  "/premium": { title: "Premium | Astrelle", description: "Desbloquea lecturas ilimitadas, mapa estelar interactivo, análisis emocional avanzado y acceso anticipado a nuevas funciones." },
  "/sky-map": { title: "Mapa Estelar | Astrelle", description: "Explora el cielo de tu nacimiento en un mapa celeste interactivo. Múltiples estilos visuales y fechas personalizables." },
  "/mapa-estelar": { title: "Mapa Estelar | Astrelle", description: "Explora el cielo de tu nacimiento en un mapa celeste interactivo. Múltiples estilos visuales y fechas personalizables." },
  "/carta-natal": { title: "Carta Natal | Astrelle", description: "Visualiza tu carta astral completa con signos, ascendente, luna y mediocielo. Análisis de personalidad basado en las estrellas." },
  "/compatibilidad": { title: "Compatibilidad | Astrelle", description: "Descubre tu conexión con otra persona según las estrellas. Análisis de compatibilidad amorosa, laboral y de amistad." },
  "/logros": { title: "Logros | Astrelle", description: "Revisa tu progreso místico en Astrelle. Desbloquea logros por usar el diario, realizar lecturas y explorar tu carta astral." },
  "/perfil": { title: "Mi Perfil | Astrelle", description: "Gestiona tus datos de nacimiento, idioma preferente, suscripción y seguridad. Exporta o elimina tu cuenta cuando lo desees." },
  "/terminos": { title: "Términos y Condiciones | Astrelle", description: "Lee los términos y condiciones de uso de Astrelle. Reglas de uso, propiedad intelectual y limitaciones de responsabilidad." },
  "/privacidad": { title: "Política de Privacidad | Astrelle", description: "Conoce cómo Astrelle protege tus datos personales. Información sobre recolección, uso, almacenamiento y derechos ARCO." },
  "/cookies": { title: "Política de Cookies | Astrelle", description: "Información sobre las cookies y tecnologías de almacenamiento que utiliza Astrelle para mejorar tu experiencia." },
  "/descargo": { title: "Descargo de Responsabilidad | Astrelle", description: "Astrelle es una plataforma de entretenimiento. El contenido astrológico no sustituye asesoramiento profesional." },
  "/reembolso": { title: "Política de Reembolso | Astrelle", description: "Conoce las condiciones para solicitar reembolsos de suscripciones premium en Astrelle. Período de prueba y proceso." },
};

const SeoManager = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    const meta = PAGE_META[pathname] ?? PAGE_META["/"];
    document.title = meta.title;
    const descEl = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (descEl) descEl.content = meta.description;

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${BASE_URL}${pathname}`;
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
import Dreams from "./pages/Dreams";
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
      <SeoManager />
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
        <Route path="/suenos" element={<ProtectedRoute><Dreams /></ProtectedRoute>} />
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
