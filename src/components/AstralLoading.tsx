import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const AstralLoading = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card p-10 text-center max-w-md mx-auto"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="w-14 h-14 mx-auto mb-6"
      >
        <Sparkles className="w-full h-full text-primary" />
      </motion.div>
      <h2 className="font-display text-xl text-foreground mb-2">
        Consultando las estrellas
      </h2>
      <p className="text-muted-foreground text-sm font-body">
        Analizando las posiciones planetarias
      </p>

      <div className="flex justify-center gap-1.5 mt-5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-primary"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default AstralLoading;
