import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Map, Star, Download, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import StarField from "@/components/StarField";
import SkyMapCanvas, { type SkyMapStyle } from "@/components/SkyMapCanvas";
import AddDateDialog from "@/components/AddDateDialog";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { generateSkyMap, getMoonPhaseDescription, type SkyMapData } from "@/services/skyMap";
import { toast } from "sonner";

interface ImportantDate {
  id: string;
  event_name: string;
  event_icon: string;
  event_date: string;
  event_time: string | null;
  event_latitude: number | null;
  event_longitude: number | null;
}

const STYLE_OPTIONS: { value: SkyMapStyle; label: string }[] = [
  { value: "classic", label: "Clásico" },
  { value: "minimal", label: "Minimalista" },
  { value: "watercolor", label: "Acuarela" },
  { value: "gold", label: "Dorado" },
];

const SkyMap = () => {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const [chart, setChart] = useState<{
    sun_sign_name: string;
    birth_date: string;
    birth_time: string;
    birth_place: string;
  } | null>(null);
  const [importantDates, setImportantDates] = useState<ImportantDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<"birth" | string>("birth");
  const [skyData, setSkyData] = useState<SkyMapData | null>(null);
  const [style, setStyle] = useState<SkyMapStyle>("classic");
  const [showLabels, setShowLabels] = useState(true);

  // Default coords (Mexico City) when not available
  const DEFAULT_LAT = 19.4326;
  const DEFAULT_LNG = -99.1332;

  const generateForDate = useCallback(
    (dateStr: string, timeStr: string, lat: number, lng: number, name: string) => {
      const [y, m, d] = dateStr.split("-").map(Number);
      const [h = 12, min = 0] = (timeStr || "12:00").split(":").map(Number);
      const date = new Date(y, m - 1, d, h, min);
      setSkyData(generateSkyMap(date, lat, lng, name));
    },
    []
  );

  // Load astral chart
  useEffect(() => {
    if (!user) return;
    supabase
      .from("astral_charts")
      .select("sun_sign_name, birth_date, birth_time, birth_place")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setChart(data);
          generateForDate(
            data.birth_date,
            data.birth_time,
            DEFAULT_LAT,
            DEFAULT_LNG,
            data.birth_place || "Lugar de nacimiento"
          );
        }
      });
  }, [user, generateForDate]);

  // Load important dates
  const loadDates = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("important_dates" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("event_date", { ascending: false });
    setImportantDates((data as any) || []);
  }, [user]);

  useEffect(() => {
    loadDates();
  }, [loadDates]);

  const handleSelectDate = (id: "birth" | string) => {
    setSelectedDate(id);
    if (id === "birth" && chart) {
      generateForDate(chart.birth_date, chart.birth_time, DEFAULT_LAT, DEFAULT_LNG, chart.birth_place);
    } else {
      const d = importantDates.find((x) => x.id === id);
      if (d) {
        generateForDate(
          d.event_date,
          d.event_time || "12:00",
          d.event_latitude ?? DEFAULT_LAT,
          d.event_longitude ?? DEFAULT_LNG,
          d.event_name
        );
      }
    }
  };

  const handleDeleteDate = async (id: string) => {
    await supabase.from("important_dates" as any).delete().eq("id", id);
    if (selectedDate === id) {
      setSelectedDate("birth");
      if (chart) generateForDate(chart.birth_date, chart.birth_time, DEFAULT_LAT, DEFAULT_LNG, chart.birth_place);
    }
    loadDates();
    toast.success("Fecha eliminada");
  };

  const downloadMap = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `mapa-estelar-${selectedDate}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("Mapa descargado");
  };

  // Premium gate
  if (!isPremium) {
    return (
      <div className="min-h-screen relative">
        <StarField />
        <div className="relative z-10 px-4 py-16 max-w-md mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
            <Map className="w-8 h-8 text-primary" />
          </div>
          <h1
            className="font-display text-2xl font-bold tracking-wide bg-clip-text text-transparent mb-3"
            style={{ backgroundImage: "var(--gradient-title)" }}
          >
            Mapa Estelar
          </h1>
          <p className="text-muted-foreground text-sm font-body mb-6">
            El mapa estelar interactivo es una funcionalidad exclusiva de Premium+.{" "}
            <Link to="/premium" className="text-primary underline underline-offset-2 hover:text-primary/80">
              Conoce los planes y elige el tuyo →
            </Link>
          </p>
          <Link to="/premium" className="btn-gold py-3 inline-flex items-center gap-2">
            <Star className="w-4 h-4" /> Ver planes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <StarField />
      <div className="relative z-10 px-4 py-6 sm:py-8 max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1
            className="font-display text-2xl sm:text-3xl font-bold tracking-wide bg-clip-text text-transparent mb-1"
            style={{ backgroundImage: "var(--gradient-title)" }}
          >
            🌌 Tu Mapa Estelar
          </h1>
          <p className="text-muted-foreground text-sm font-body">
            El cielo exacto de tus momentos más importantes
          </p>
        </motion.div>

        {/* Date selector */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground font-body tracking-wide">Selecciona una fecha</span>
            <AddDateDialog onDateAdded={loadDates} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {/* Birth date chip */}
            {chart && (
              <button
                onClick={() => handleSelectDate("birth")}
                className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-body transition-all ${
                  selectedDate === "birth"
                    ? "bg-primary/20 border-2 border-primary text-foreground"
                    : "bg-muted/30 border border-border hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <span>🎂</span>
                <span>Mi nacimiento</span>
              </button>
            )}
            {importantDates.map((d) => (
              <div key={d.id} className="shrink-0 flex items-center gap-1">
                <button
                  onClick={() => handleSelectDate(d.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-body transition-all ${
                    selectedDate === d.id
                      ? "bg-primary/20 border-2 border-primary text-foreground"
                      : "bg-muted/30 border border-border hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <span>{d.event_icon}</span>
                  <span>{d.event_name}</span>
                </button>
                <button
                  onClick={() => handleDeleteDate(d.id)}
                  className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
          {/* Canvas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-3 sm:p-4"
          >
            {skyData ? (
              <SkyMapCanvas skyData={skyData} style={style} showLabels={showLabels} />
            ) : (
              <div className="aspect-square flex items-center justify-center">
                <p className="text-muted-foreground text-sm">Generando mapa…</p>
              </div>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-4"
          >
            {/* Info card */}
            {skyData && (
              <div className="glass-card p-4 space-y-3">
                <h3 className="text-xs tracking-wide text-muted-foreground font-body">Información</h3>
                <div className="space-y-2 text-sm font-body">
                  <div>
                    <span className="text-muted-foreground">📍 </span>
                    <span className="text-foreground">{skyData.location.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">📅 </span>
                    <span className="text-foreground">
                      {format(skyData.datetime, "dd MMMM yyyy, HH:mm", { locale: es })}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">🌙 </span>
                    <span className="text-foreground">{getMoonPhaseDescription(skyData.moonPhase)}</span>
                  </div>
                  {skyData.celestialObjects.sun.visible && (
                    <div>
                      <span className="text-muted-foreground">☀️ </span>
                      <span className="text-foreground">Sol visible (Alt: {skyData.celestialObjects.sun.altitude.toFixed(0)}°)</span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">🪐 </span>
                    <span className="text-foreground">
                      {skyData.celestialObjects.planets.filter((p) => p.visible).length} planetas visibles
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Style selector */}
            <div className="glass-card p-4 space-y-3">
              <h3 className="text-xs tracking-wide text-muted-foreground font-body">Estilo visual</h3>
              <div className="grid grid-cols-2 gap-2">
                {STYLE_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStyle(s.value)}
                    className={`px-3 py-2 rounded-lg text-xs font-body transition-all ${
                      style === s.value
                        ? "bg-primary/20 border-2 border-primary text-foreground"
                        : "bg-muted/30 border border-border hover:bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 text-sm font-body text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  className="rounded border-border"
                />
                Mostrar etiquetas
              </label>
            </div>

            {/* Actions */}
            <button
              onClick={downloadMap}
              className="btn-gold w-full py-3 flex items-center justify-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" /> Descargar HD
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SkyMap;
