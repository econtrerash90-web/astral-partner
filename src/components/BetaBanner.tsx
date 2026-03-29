import { useState } from "react";
import { X } from "lucide-react";

const BetaBanner = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative z-[60] bg-primary/90 text-primary-foreground text-center text-xs font-body py-1.5 px-8">
      <span className="font-display tracking-wider mr-1.5">BETA</span>
      Estás usando una versión preliminar. Algunas funciones pueden cambiar.
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-primary-foreground/20 rounded transition-colors"
        aria-label="Cerrar"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

export default BetaBanner;
