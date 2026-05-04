import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  BookOpen,
  Sparkles,
  Layers,
  Crown,
  Feather,
  SquareAsterisk,
  Map,
  Hash,
  Flame,
  Gem,
  X,
} from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";

const mainTabs = [
  { to: "/", label: "Inicio", icon: Star },
  { to: "/diario", label: "Diario", icon: BookOpen },
  // center slot reserved
  { to: "/carta-natal", label: "Carta", icon: Sparkles },
];

const spreadOptions = [
  { to: "/tarot", label: "Tarot", icon: Layers },
  { to: "/el-secreto", label: "Secreto", icon: Crown },
  { to: "/angeles", label: "Ángeles", icon: Feather },
  { to: "/oraculo", label: "Oráculo", icon: SquareAsterisk },
  { to: "/numero-suerte", label: "Suerte", icon: Hash },
  { to: "/ritual", label: "Ritual", icon: Flame },
  { to: "/amuleto", label: "Amuleto", icon: Gem },
  { to: "/mapa-estelar", label: "Mapa", icon: Map },
];

const BottomTabBar = () => {
  const { pathname } = useLocation();
  const { isPremium } = useSubscription();
  const { user } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuario";
  const initials = displayName.slice(0, 2).toUpperCase();
  const avatarUrl = (user?.user_metadata?.avatar_url || user?.user_metadata?.picture) as string | undefined;
  const profileActive = pathname === "/perfil";

  const isSpreadRoute = spreadOptions.some((o) => o.to === pathname);

  const renderTab = (tab: typeof mainTabs[number]) => {
    const active = pathname === tab.to;
    const Icon = tab.icon;
    return (
      <Link
        key={tab.to}
        to={tab.to}
        className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 transition-colors"
      >
        <Icon
          className={`w-5 h-5 transition-all ${
            active ? "text-primary scale-110" : "text-muted-foreground"
          }`}
          style={active ? { filter: "drop-shadow(0 0 6px hsl(var(--mystic-gold) / 0.6))" } : undefined}
        />
        <span
          className={`text-[10px] font-body tracking-wide ${
            active ? "text-foreground font-medium" : "text-muted-foreground"
          }`}
        >
          {tab.label}
        </span>
      </Link>
    );
  };

  return (
    <>
      {/* Bottom sheet for spreads */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 right-0 bottom-0 z-[70] rounded-t-3xl"
              style={{
                background: "hsl(234 45% 8% / 0.95)",
                backdropFilter: "blur(28px) saturate(1.3)",
                WebkitBackdropFilter: "blur(28px) saturate(1.3)",
                borderTop: "1px solid hsl(var(--border) / 0.3)",
                boxShadow: "0 -20px 60px hsl(0 0% 0% / 0.6), 0 0 60px hsl(var(--cosmic-purple) / 0.15)",
                paddingBottom: "calc(env(safe-area-inset-bottom) + 1.5rem)",
              }}
            >
              <div className="mx-auto mt-3 mb-2 h-1.5 w-12 rounded-full bg-muted/60" />
              <div className="px-5 pt-2 pb-1 flex items-center justify-between">
                <h3 className="font-display text-base tracking-widest text-foreground">
                  Tiradas Místicas
                </h3>
                <button
                  onClick={() => setSheetOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-muted/40 text-muted-foreground"
                  aria-label="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3 p-5 pt-3">
                {spreadOptions.map((opt) => {
                  const Icon = opt.icon;
                  const active = pathname === opt.to;
                  return (
                    <Link
                      key={opt.to}
                      to={opt.to}
                      onClick={() => setSheetOpen(false)}
                      className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all"
                      style={{
                        background: active
                          ? "hsl(var(--mystic-gold) / 0.12)"
                          : "hsl(var(--card) / 0.5)",
                        border: `1px solid hsl(var(--border) / ${active ? 0.4 : 0.2})`,
                      }}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          active ? "text-primary" : "text-foreground/80"
                        }`}
                      />
                      <span className="text-[11px] font-body text-foreground/90 text-center">
                        {opt.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
              {!isPremium && (
                <div className="px-5 pb-5">
                  <Link
                    to="/premium"
                    onClick={() => setSheetOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-display text-sm tracking-wider"
                    style={{
                      background: "var(--gradient-gold)",
                      color: "hsl(var(--primary-foreground))",
                      boxShadow: "var(--shadow-gold)",
                    }}
                  >
                    <Crown className="w-4 h-4" />
                    Hazte Premium
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Tab Bar */}
      <nav
        className="fixed left-0 right-0 bottom-0 z-50"
        style={{
          background: "hsl(234 45% 8% / 0.85)",
          backdropFilter: "blur(28px) saturate(1.3)",
          WebkitBackdropFilter: "blur(28px) saturate(1.3)",
          borderTop: "1px solid hsl(var(--border) / 0.25)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="relative max-w-2xl mx-auto flex items-stretch h-16 px-2">
          {renderTab(mainTabs[0])}
          {renderTab(mainTabs[1])}

          {/* Center FAB */}
          <div className="flex-1 flex items-start justify-center relative">
            <button
              onClick={() => setSheetOpen(true)}
              className="absolute -top-6 flex items-center justify-center w-14 h-14 rounded-full transition-transform active:scale-95"
              style={{
                background: "var(--gradient-gold)",
                boxShadow: isSpreadRoute || sheetOpen
                  ? "0 0 24px hsl(var(--mystic-gold) / 0.7), 0 8px 24px hsl(0 0% 0% / 0.5)"
                  : "0 0 16px hsl(var(--mystic-gold) / 0.4), 0 8px 24px hsl(0 0% 0% / 0.5)",
                border: "3px solid hsl(234 45% 8%)",
              }}
              aria-label="Tiradas Místicas"
            >
              <Sparkles className="w-6 h-6 text-background" />
            </button>
            <span className="absolute bottom-1.5 text-[10px] font-body text-muted-foreground tracking-wide">
              Tiradas
            </span>
          </div>

          {renderTab(mainTabs[2])}

          <Link
            to="/perfil"
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 transition-colors"
          >
            <div
              className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-[10px] font-bold font-display transition-all"
              style={{
                background: avatarUrl ? "transparent" : "hsl(var(--primary) / 0.15)",
                color: "hsl(var(--primary))",
                border: profileActive ? "1.5px solid hsl(var(--mystic-gold))" : "1.5px solid transparent",
                filter: profileActive ? "drop-shadow(0 0 6px hsl(var(--mystic-gold) / 0.6))" : undefined,
              }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <span
              className={`text-[10px] font-body tracking-wide ${
                profileActive ? "text-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              Perfil
            </span>
          </Link>
        </div>
      </nav>
    </>
  );
};

export default BottomTabBar;
