import { motion } from "framer-motion";
import StarField from "@/components/StarField";
import AchievementsSection from "@/components/AchievementsSection";
import { PageSeo } from "@/components/PageSeo";

const Achievements = () => {
  return (
    <div className="min-h-screen relative">
      <PageSeo title="Logros | Astrelle" description="Tus logros desbloqueados en tu camino astral." path="/logros" />
      <StarField />
      <div className="relative z-10 px-4 py-8 sm:py-12 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1
            className="font-display text-3xl sm:text-4xl font-bold tracking-wide bg-clip-text text-transparent mb-1"
            style={{ backgroundImage: "var(--gradient-title)" }}
          >
            Logros
          </h1>
          <p className="text-muted-foreground text-sm font-body">
            Tu camino místico en Astrelle
          </p>
        </motion.div>
        <AchievementsSection />
      </div>
    </div>
  );
};

export default Achievements;
