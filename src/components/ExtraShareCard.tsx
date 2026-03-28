import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

const APP_URL = "https://astrelle-guide.app";

interface ExtraShareCardProps {
  type: "luckyNumber" | "ritual" | "amulet";
  title: string;
  mainContent: string;
  subtitle: string;
  description?: string;
  chartData: { sun_sign_name: string; moon_sign: string; ascendant: string };
}

const typeEmoji: Record<string, string> = {
  luckyNumber: "#️⃣",
  ritual: "🕯️",
  amulet: "💎",
};

const ExtraShareCard = ({ type, title, mainContent, subtitle, description, chartData }: ExtraShareCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const generateImage = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    setGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true });
      const res = await fetch(dataUrl);
      return await res.blob();
    } catch {
      toast.error("Error al generar la imagen");
      return null;
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    const blob = await generateImage();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `astrelle-${type}.png`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Imagen descargada ✨");
  };

  const shareText = `✨ ${title}: ${mainContent} — Descubre el tuyo en Astrelle ${APP_URL}`;

  const handleWhatsApp = async () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const handleInstagram = async () => {
    const blob = await generateImage();
    if (!blob) return;
    const file = new File([blob], `astrelle-${type}.png`, { type: "image/png" });
    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "Astrelle", text: shareText });
      } catch (e) {
        if ((e as Error).name !== "AbortError") toast.error("No se pudo compartir");
      }
    } else {
      // Fallback: download for manual sharing
      handleDownload();
      toast.info("Descarga la imagen y compártela en Instagram Stories");
    }
  };

  const handleNativeShare = async () => {
    const blob = await generateImage();
    if (!blob) return;
    const file = new File([blob], `astrelle-${type}.png`, { type: "image/png" });
    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "Astrelle", text: shareText });
      } catch (e) {
        if ((e as Error).name !== "AbortError") toast.error("No se pudo compartir");
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success("Texto copiado al portapapeles ✨");
    }
  };

  return (
    <div className="space-y-3">
      {/* Hidden card for capture */}
      <div style={{ maxHeight: 0, opacity: 0, position: "absolute", left: "-9999px", overflow: "hidden" }}>
        <div
          ref={cardRef}
          style={{
            width: 540,
            padding: 40,
            background: "linear-gradient(145deg, #0f1029 0%, #1a1040 35%, #0d1a30 70%, #0f1029 100%)",
            fontFamily: "'Cinzel', serif",
            color: "#e8e0f0",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            background: "radial-gradient(circle at 20% 20%, rgba(200, 170, 80, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(100, 180, 200, 0.06) 0%, transparent 50%)",
          }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <p style={{ fontSize: 11, letterSpacing: 4, color: "#c8aa50", textTransform: "uppercase", marginBottom: 4 }}>✦ Astrelle ✦</p>
              <p style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{title}</p>
              <div style={{ width: 60, height: 1, background: "linear-gradient(90deg, transparent, #c8aa50, transparent)", margin: "0 auto" }} />
            </div>

            <div style={{
              textAlign: "center", marginBottom: 20, padding: "24px 16px",
              background: "rgba(200, 170, 80, 0.08)", borderRadius: 16,
              border: "1px solid rgba(200, 170, 80, 0.15)",
            }}>
              <p style={{ fontSize: 36, marginBottom: 8 }}>{typeEmoji[type]}</p>
              <p style={{ fontSize: type === "luckyNumber" ? 48 : 22, fontWeight: 700, color: "#c8aa50" }}>{mainContent}</p>
              <p style={{ fontSize: 12, color: "#9990a8", marginTop: 8, lineHeight: 1.5 }}>{subtitle}</p>
              {description && (
                <p style={{ fontSize: 11, color: "#b0a8c0", marginTop: 10, lineHeight: 1.6, fontStyle: "italic" }}>{description}</p>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <div style={{ flex: 1, textAlign: "center", padding: "10px 6px", background: "rgba(255,255,255,0.04)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)" }}>
                <p style={{ fontSize: 9, color: "#9990a8", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 3 }}>☀️ Sol</p>
                <p style={{ fontSize: 13, fontWeight: 600 }}>{chartData.sun_sign_name}</p>
              </div>
              <div style={{ flex: 1, textAlign: "center", padding: "10px 6px", background: "rgba(255,255,255,0.04)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)" }}>
                <p style={{ fontSize: 9, color: "#9990a8", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 3 }}>🌙 Luna</p>
                <p style={{ fontSize: 13, fontWeight: 600 }}>{chartData.moon_sign}</p>
              </div>
              <div style={{ flex: 1, textAlign: "center", padding: "10px 6px", background: "rgba(255,255,255,0.04)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)" }}>
                <p style={{ fontSize: 9, color: "#9990a8", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 3 }}>⬆️ Asc</p>
                <p style={{ fontSize: 13, fontWeight: 600 }}>{chartData.ascendant}</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div>
                <p style={{ fontSize: 12, color: "#c8aa50", fontWeight: 600, marginBottom: 2 }}>Astrelle</p>
                <p style={{ fontSize: 9, color: "#9990a8", letterSpacing: 1.5 }}>Descubre tu carta astral</p>
                <p style={{ fontSize: 9, color: "#9990a8", letterSpacing: 1 }}>astrelle-guide.app</p>
              </div>
              <div style={{ background: "#ffffff", padding: 6, borderRadius: 8 }}>
                <QRCodeSVG value={APP_URL} size={64} bgColor="#ffffff" fgColor="#0f1029" level="M" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button onClick={handleDownload} disabled={generating} className="py-3 rounded-xl font-body text-xs font-medium bg-primary/15 text-primary border border-primary/20 hover:bg-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
          <Download className="w-4 h-4" />
          Descargar
        </button>
        <button onClick={handleWhatsApp} disabled={generating} className="py-3 rounded-xl font-body text-xs font-medium bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/20 hover:bg-[#25D366]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          WhatsApp
        </button>
        <button onClick={handleInstagram} disabled={generating} className="py-3 rounded-xl font-body text-xs font-medium bg-[#E4405F]/15 text-[#E4405F] border border-[#E4405F]/20 hover:bg-[#E4405F]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          Instagram
        </button>
        <button onClick={handleNativeShare} disabled={generating} className="py-3 rounded-xl font-body text-xs font-medium bg-accent/15 text-accent border border-accent/20 hover:bg-accent/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          Más opciones
        </button>
      </div>
    </div>
  );
};

export default ExtraShareCard;
