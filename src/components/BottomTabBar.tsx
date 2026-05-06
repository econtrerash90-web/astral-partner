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
  Heart,
  Flame,
  Gem,
  Trophy,
  X,
} from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";

const buildMainTabs = (t: (k: string) => string) => [
  { to: "/", label: t("nav.home"), icon: Star },
  { to: "/diario", label: t("nav.journal"), icon: BookOpen },
  { to: "/compatibilidad", label: t("nav.compatibility"), icon: Heart },
  { to: "/logros", label: t("nav.achievements"), icon: Trophy },
  { to: "/carta-natal", label: t("nav.chart"), icon: Sparkles },
];

const buildSpreadOptions = (t: (k: string) => string) => [
  { to: "/tarot", label: t("nav.tarot"), icon: Layers },
  { to: "/el-secreto", label: t("nav.secret"), icon: Crown },
  { to: "/angeles", label: t("nav.angels"), icon: Feather },
  { to: "/oraculo", label: t("nav.oracle"), icon: SquareAsterisk },
  { to: "/ritual", label: t("nav.ritual"), icon: Flame },
  { to: "/amuleto", label: t("nav.amulet"), icon: Gem },
];

const BottomTabBar = () => {
  const { pathname } = useLocation();
  const { isPremium } = useSubscription();
  const { user } = useAuth();
  const { t } = useI18n();
  const [sheetOpen, setSheetOpen] = useState(false);

  const mainTabs = buildMainTabs(t);
  const spreadOptions = buildSpreadOptions(t);

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || t("common.user");
  const initials = displayName.slice(0, 2).toUpperCase();
  const avatarUrl = (user?.user_metadata?.avatar_url || user?.user_metadata?.picture) as string | undefined;
  const profileActive = pathname === "/perfil";

  const isSpreadRoute = spreadOptions.some((o) => o.to === pathname);

  const renderTab = (tab: ReturnType<typeof buildMainTabs>[number]) => {
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
                  {t("nav.mysticSpreads")}
                </h3>
                <button
                  onClick={() => setSheetOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-muted/40 text-muted-foreground"
                  aria-label={t("common.close")}
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
                    {t("header.becomePremium")}
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
        <div className="relative max-w-2xl mx-auto flex items-stretch h-16 px-1">
          {renderTab(mainTabs[0])}
          {renderTab(mainTabs[1])}
          {renderTab(mainTabs[2])}

          {/* Center FAB */}
          <div className="flex-1 flex items-start justify-center relative">
            <button
              onClick={() => setSheetOpen(true)}
              className="absolute -top-6 flex items-center justify-center w-14 h-14 rounded-full transition-transform active:scale-95 group"
              style={{
                background:
                  "radial-gradient(circle at 30% 25%, hsl(45 95% 75%) 0%, hsl(var(--mystic-gold)) 45%, hsl(38 70% 42%) 100%)",
                boxShadow:
                  isSpreadRoute || sheetOpen
                    ? "0 0 28px hsl(var(--mystic-gold) / 0.8), 0 0 48px hsl(var(--mystic-gold) / 0.35), 0 8px 24px hsl(0 0% 0% / 0.55), inset 0 1px 0 hsl(45 95% 90% / 0.6), inset 0 -2px 4px hsl(38 70% 30% / 0.5)"
                    : "0 0 18px hsl(var(--mystic-gold) / 0.5), 0 8px 24px hsl(0 0% 0% / 0.55), inset 0 1px 0 hsl(45 95% 90% / 0.5), inset 0 -2px 4px hsl(38 70% 30% / 0.45)",
                border: "3px solid hsl(234 45% 8%)",
              }}
              aria-label={t("nav.mysticSpreads")}
            >
              <svg
                viewBox="0 0 32 32"
                className="w-7 h-7 transition-transform duration-500 group-hover:rotate-[20deg]"
                fill="none"
                style={{ filter: "drop-shadow(0 1px 1px hsl(38 70% 25% / 0.6))" }}
              >
                {/* Outer ornamental ring */}
                <circle cx="16" cy="16" r="11" stroke="hsl(234 45% 10%)" strokeWidth="0.6" strokeDasharray="0.8 1.6" opacity="0.7" />
                {/* Four-point compass star */}
                <path
                  d="M16 4 L17.6 14.4 L28 16 L17.6 17.6 L16 28 L14.4 17.6 L4 16 L14.4 14.4 Z"
                  fill="hsl(234 45% 8%)"
                />
                {/* Inner highlight star */}
                <path
                  d="M16 8 L16.9 15.1 L24 16 L16.9 16.9 L16 24 L15.1 16.9 L8 16 L15.1 15.1 Z"
                  fill="hsl(45 95% 80%)"
                  opacity="0.95"
                />
                {/* Center jewel */}
                <circle cx="16" cy="16" r="1.6" fill="hsl(234 45% 8%)" />
                <circle cx="15.5" cy="15.5" r="0.6" fill="hsl(45 100% 92%)" />
                {/* Diagonal accent sparks */}
                <circle cx="23.5" cy="8.5" r="0.7" fill="hsl(234 45% 8%)" />
                <circle cx="8.5" cy="23.5" r="0.7" fill="hsl(234 45% 8%)" />
              </svg>
            </button>
            <span className="absolute bottom-1.5 text-[10px] font-body text-muted-foreground tracking-wide">
              {t("nav.spreads")}
            </span>
          </div>

          {renderTab(mainTabs[3])}
          {renderTab(mainTabs[4])}

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
              {t("nav.profile")}
            </span>
          </Link>
        </div>
      </nav>
    </>
  );
};

export default BottomTabBar;
