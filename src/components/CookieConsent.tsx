import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";
import { Link } from "react-router-dom";

const COOKIE_KEY = "cookie_consent_accepted";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(COOKIE_KEY);
    if (!accepted) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-lg mx-auto bg-card/80 backdrop-blur-xl border border-border/40 rounded-2xl p-5 shadow-[0_-4px_24px_hsl(0_0%_0%/0.4)] flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Cookie className="h-6 w-6 shrink-0 text-primary hidden sm:block" />
        <p className="text-sm text-foreground/80 font-body leading-relaxed flex-1">
          Usamos cookies esenciales y analíticas para mejorar tu experiencia.{" "}
          <Link to="/cookies" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
            Más información
          </Link>
        </p>
        <Button onClick={accept} size="sm" className="shrink-0">
          Aceptar
        </Button>
      </div>
    </div>
  );
};

export default CookieConsent;
