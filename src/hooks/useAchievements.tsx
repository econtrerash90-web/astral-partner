import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ACHIEVEMENTS, type AchievementDef } from "@/lib/achievements";

interface UnlockedAchievement {
  achievement_code: string;
  unlocked_at: string;
}

interface AchievementsContextValue {
  unlocked: UnlockedAchievement[];
  loading: boolean;
  refresh: () => Promise<void>;
  /** Try to unlock one or more achievements by code; ignores already-unlocked */
  unlock: (codes: string | string[]) => Promise<void>;
  /** Re-evaluate progress-based achievements by querying counters */
  evaluate: () => Promise<void>;
}

const Ctx = createContext<AchievementsContextValue | undefined>(undefined);

const showUnlockToast = (def: AchievementDef) => {
  toast.success(`¡Logro desbloqueado!`, {
    description: `${def.icon}  ${def.title} — ${def.description}`,
    duration: 5000,
    className: "achievement-toast",
  });
};

export const AchievementsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [unlocked, setUnlocked] = useState<UnlockedAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const unlockedRef = useRef<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    if (!user) {
      setUnlocked([]);
      unlockedRef.current = new Set();
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("achievements")
      .select("achievement_code, unlocked_at")
      .eq("user_id", user.id);
    const list = data ?? [];
    setUnlocked(list);
    unlockedRef.current = new Set(list.map((a) => a.achievement_code));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const unlock = useCallback(
    async (codes: string | string[]) => {
      if (!user) return;
      const list = Array.isArray(codes) ? codes : [codes];
      const newCodes = list.filter((c) => !unlockedRef.current.has(c));
      if (newCodes.length === 0) return;

      const rows = newCodes.map((code) => ({ user_id: user.id, achievement_code: code }));
      const { error } = await supabase.from("achievements").insert(rows);
      if (error) return;

      newCodes.forEach((code) => {
        unlockedRef.current.add(code);
        const def = ACHIEVEMENTS.find((a) => a.code === code);
        if (def) showUnlockToast(def);
      });
      // refresh state list
      const now = new Date().toISOString();
      setUnlocked((prev) => [...prev, ...newCodes.map((c) => ({ achievement_code: c, unlocked_at: now }))]);
    },
    [user],
  );

  /**
   * Evaluate progress-based achievements by checking counters in DB.
   * Called on app mount and can be invoked after key actions.
   */
  const evaluate = useCallback(async () => {
    if (!user) return;

    const toUnlock: string[] = [];

    // --- Diario ---
    const { data: entries } = await supabase
      .from("journal_entries")
      .select("word_count")
      .eq("user_id", user.id);
    if (entries) {
      const count = entries.length;
      const totalWords = entries.reduce((sum, e: any) => sum + (e.word_count || 0), 0);
      if (count >= 1) toUnlock.push("journal_1");
      if (count >= 10) toUnlock.push("journal_10");
      if (totalWords >= 1000) toUnlock.push("journal_1000_words");
    }

    // --- Carta Natal ---
    const { data: chart } = await supabase
      .from("astral_charts")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (chart) toUnlock.push("explore_natal");

    // --- Fechas importantes (Sky Map) ---
    const { count: datesCount } = await supabase
      .from("important_dates")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    if ((datesCount ?? 0) >= 1) toUnlock.push("explore_dates");

    // --- Extras (lucky number, ritual, amulet) ---
    const { data: extras } = await supabase
      .from("astral_extras")
      .select("type")
      .eq("user_id", user.id);
    if (extras) {
      const types = new Set(extras.map((e: any) => e.type));
      if (types.has("lucky_number")) toUnlock.push("explore_lucky");
      if (types.has("ritual")) toUnlock.push("explore_ritual");
      if (types.has("amulet")) toUnlock.push("explore_amulet");
    }

    // --- Módulos místicos (totales acumulados desde daily_limits) ---
    const { data: limits } = await supabase
      .from("daily_limits")
      .select("tarot_count, oracle_count, angels_count, secret_count")
      .eq("user_id", user.id);
    if (limits) {
      const tarot = limits.reduce((s, r: any) => s + (r.tarot_count || 0), 0);
      const oracle = limits.reduce((s, r: any) => s + (r.oracle_count || 0), 0);
      const angels = limits.reduce((s, r: any) => s + (r.angels_count || 0), 0);
      const secret = limits.reduce((s, r: any) => s + (r.secret_count || 0), 0);
      if (tarot >= 1) toUnlock.push("tarot_1");
      if (tarot >= 10) toUnlock.push("tarot_10");
      if (oracle >= 5) toUnlock.push("oracle_5");
      if (angels >= 5) toUnlock.push("angels_5");
      if (secret >= 5) toUnlock.push("secret_5");
    }

    // --- Constancia (rachas de daily_readings tipo horoscope) ---
    const { data: readings } = await supabase
      .from("daily_readings")
      .select("reading_date")
      .eq("user_id", user.id)
      .eq("reading_type", "horoscope")
      .order("reading_date", { ascending: false })
      .limit(60);
    if (readings && readings.length > 0) {
      const dates = Array.from(new Set(readings.map((r: any) => r.reading_date))).sort().reverse();
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let cursor = new Date(today);
      // allow streak to start from today or yesterday
      const first = new Date(dates[0] + "T00:00:00");
      const diffStart = Math.round((today.getTime() - first.getTime()) / 86400000);
      if (diffStart > 1) {
        streak = 0;
      } else {
        cursor = new Date(first);
        for (const d of dates) {
          const dd = new Date(d + "T00:00:00");
          if (dd.getTime() === cursor.getTime()) {
            streak += 1;
            cursor.setDate(cursor.getDate() - 1);
          } else {
            break;
          }
        }
      }
      if (streak >= 3) toUnlock.push("streak_3");
      if (streak >= 7) toUnlock.push("streak_7");
      if (streak >= 30) toUnlock.push("streak_30");
    }

    if (toUnlock.length > 0) {
      await unlock(toUnlock);
    }
  }, [user, unlock]);

  // Auto-evaluate when user logs in
  useEffect(() => {
    if (user && !loading) {
      evaluate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  return (
    <Ctx.Provider value={{ unlocked, loading, refresh, unlock, evaluate }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAchievements = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAchievements must be used within AchievementsProvider");
  return ctx;
};
