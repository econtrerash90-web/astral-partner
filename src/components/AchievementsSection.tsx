import { motion } from "framer-motion";
import { Lock, Trophy } from "lucide-react";
import { ACHIEVEMENTS, CATEGORY_LABELS, type AchievementCategory } from "@/lib/achievements";
import { useAchievements } from "@/hooks/useAchievements";

const AchievementsSection = () => {
  const { unlocked, loading } = useAchievements();
  const unlockedSet = new Set(unlocked.map((u) => u.achievement_code));
  const total = ACHIEVEMENTS.length;
  const done = unlocked.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  const categories: AchievementCategory[] = ["constancia", "modulos", "diario", "exploracion"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-body text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary/70" /> Logros
        </h2>
        <span className="text-xs text-primary/80 font-body font-medium">
          {done}/{total}
        </span>
      </div>

      {/* progress bar */}
      <div className="h-2 rounded-full bg-muted/40 overflow-hidden mb-5">
        <div
          className="h-full bg-gradient-to-r from-primary/70 to-accent/70 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      {loading ? (
        <p className="text-xs text-muted-foreground font-body">Cargando logros...</p>
      ) : (
        <div className="space-y-5">
          {categories.map((cat) => {
            const items = ACHIEVEMENTS.filter((a) => a.category === cat);
            const catDone = items.filter((a) => unlockedSet.has(a.code)).length;
            return (
              <div key={cat}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-body text-xs font-semibold text-foreground/80 uppercase tracking-wider">
                    {CATEGORY_LABELS[cat]}
                  </h3>
                  <span className="text-[10px] text-muted-foreground font-body">
                    {catDone}/{items.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {items.map((a) => {
                    const isUnlocked = unlockedSet.has(a.code);
                    return (
                      <div
                        key={a.code}
                        className={`relative rounded-xl p-3 border transition-all ${
                          isUnlocked
                            ? "bg-primary/10 border-primary/30 shadow-[0_0_12px_hsl(var(--primary)/0.15)]"
                            : "bg-muted/20 border-border/30 opacity-60"
                        }`}
                        title={a.description}
                      >
                        <div className="flex items-start gap-2">
                          <span className={`text-2xl ${isUnlocked ? "" : "grayscale"}`}>
                            {a.icon}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-body font-semibold text-foreground leading-tight truncate">
                              {a.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-body leading-snug line-clamp-2 mt-0.5">
                              {a.description}
                            </p>
                          </div>
                        </div>
                        {!isUnlocked && (
                          <Lock className="w-3 h-3 text-muted-foreground/50 absolute top-2 right-2" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default AchievementsSection;
