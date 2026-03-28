import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star, BookOpen, Menu, X, User, LogOut, ChevronDown, Layers, Crown, Feather, SquareAsterisk, Map } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { to: "/", label: "Inicio", icon: Star },
  { to: "/tarot", label: "Tarot", icon: Layers },
  { to: "/el-secreto", label: "Secreto", icon: Crown },
  { to: "/angeles", label: "Ángeles", icon: Feather },
  { to: "/oraculo", label: "Oráculo", icon: SquareAsterisk },
  { to: "/diario", label: "Diario", icon: BookOpen },
];

const AppHeader = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isPremium } = useSubscription();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuario";
  const initials = displayName.slice(0, 2).toUpperCase();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: "hsl(234 45% 8% / 0.7)",
        backdropFilter: "blur(28px) saturate(1.3)",
        WebkitBackdropFilter: "blur(28px) saturate(1.3)",
        borderBottom: "1px solid hsl(240 15% 20% / 0.25)",
      }}
    >
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <Sparkles className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
          <span className="font-display text-lg font-bold tracking-widest bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-title)" }}>
            ASTRELLE
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden md:flex items-center rounded-xl p-1"
          style={{
            background: "hsl(var(--muted) / 0.3)",
            border: "1px solid hsl(var(--border) / 0.2)",
          }}
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-body text-sm transition-all duration-200 ${
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                style={isActive ? {
                  background: "hsl(var(--card) / 0.6)",
                  boxShadow: "0 2px 12px hsl(0 0% 0% / 0.2)",
                } : undefined}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Premium badge + Sky Map (desktop) */}
        <div className="hidden md:flex items-center gap-2">
          {isPremium && (
            <>
              <Link
                to="/mapa-estelar"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-body text-amber-300 hover:bg-amber-500/10 transition-colors"
              >
                <Map className="w-3.5 h-3.5" />
                Sky Map
              </Link>
              <Badge className="bg-gradient-to-r from-amber-500 to-yellow-400 text-background border-0 font-display text-[10px] tracking-wider shadow-[0_0_8px_hsl(var(--primary)/0.3)]">
                <Crown className="w-3 h-3 mr-1" />
                PREMIUM
              </Badge>
            </>
          )}
        </div>

        {/* User avatar dropdown (desktop) */}
        <div className="hidden md:block relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-muted/50 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center text-xs font-bold font-display">
              {initials}
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-52 rounded-xl overflow-hidden"
                style={{
                  background: "hsl(var(--card) / 0.85)",
                  border: "1px solid hsl(var(--border) / 0.25)",
                  backdropFilter: "blur(28px)",
                  boxShadow: "0 20px 60px hsl(0 0% 0% / 0.5), 0 0 40px hsl(var(--cosmic-purple) / 0.06)",
                }}
              >
                <div className="px-4 py-3" style={{ borderBottom: "1px solid hsl(var(--border) / 0.3)" }}>
                  <p className="text-foreground text-sm font-medium truncate">{displayName}</p>
                  <p className="text-muted-foreground text-xs truncate">{user?.email}</p>
                </div>
                <Link
                  to="/perfil"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-all font-body text-sm"
                >
                  <User className="w-4 h-4" /> Mi Perfil
                </Link>
                <button
                  onClick={() => { setUserMenuOpen(false); signOut(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-all font-body text-sm"
                >
                  <LogOut className="w-4 h-4" /> Cerrar Sesión
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Toggle menu">
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
            style={{
              background: "hsl(var(--background) / 0.92)",
              backdropFilter: "blur(28px)",
              borderTop: "1px solid hsl(var(--border) / 0.2)",
            }}
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm transition-all ${
                      isActive
                        ? "text-foreground bg-muted/50"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                    }`}
                  >
                    <item.icon className="w-4 h-4" /> {item.label}
                  </Link>
                );
              })}
              {isPremium && (
                <Link
                  to="/mapa-estelar"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm text-amber-300 hover:bg-amber-500/10 transition-all"
                >
                  <Map className="w-4 h-4" /> Sky Map
                  <Badge className="ml-auto bg-gradient-to-r from-amber-500 to-yellow-400 text-background border-0 font-display text-[10px] tracking-wider">
                    <Crown className="w-3 h-3 mr-0.5" /> PRO
                  </Badge>
                </Link>
              )}
              <div style={{ borderTop: "1px solid hsl(var(--border) / 0.2)" }} className="pt-2 mt-2">
                <Link
                  to="/perfil"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all"
                >
                  <User className="w-4 h-4" /> Mi Perfil
                </Link>
                <button
                  onClick={() => { setMenuOpen(false); signOut(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all"
                >
                  <LogOut className="w-4 h-4" /> Cerrar Sesión
                </button>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default AppHeader;
