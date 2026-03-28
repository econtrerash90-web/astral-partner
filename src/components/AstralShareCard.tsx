import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

interface ShareCardProps {
  sunSign: { name: string; symbol: string; element: string; planet: string };
  moonSign: string;
  ascendant: string;
  name: string;
  luckyNumber?: { number: number; reason: string } | null;
  ritual?: { candleColor: string; title: string } | null;
  amulet?: { stone: string; emoji: string } | null;
}

const AstralShareCard = ({ sunSign, moonSign, ascendant, name, luckyNumber, ritual, amulet }: ShareCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const generateImage = async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    setGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      return dataUrl;
    } catch (e) {
      console.error("Error generating image:", e);
      toast.error("Error al generar la imagen");
      return null;
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    const dataUrl = await generateImage();
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.download = `astrelle-${name.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = dataUrl;
    link.click();
    toast.success("Imagen descargada ✨");
  };

  const handleShare = async () => {
    const dataUrl = await generateImage();
    if (!dataUrl) return;

    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], "astrelle-carta-astral.png", { type: "image/png" });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Mi Carta Astral - Astrelle",
          text: `✨ Mi carta astral: Sol en ${sunSign.name}, Luna en ${moonSign}, Ascendente en ${ascendant}`,
          files: [file],
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        toast.success("Imagen copiada al portapapeles ✨");
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        toast.error("No se pudo compartir la imagen");
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Hidden card for capture */}
      <div className="overflow-hidden" style={{ maxHeight: 0, opacity: 0, position: "absolute", left: "-9999px" }}>
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
          {/* Decorative elements */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            background: "radial-gradient(circle at 20% 20%, rgba(200, 170, 80, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(100, 180, 200, 0.06) 0%, transparent 50%)",
          }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <p style={{ fontSize: 11, letterSpacing: 4, color: "#c8aa50", textTransform: "uppercase", marginBottom: 4 }}>
                ✦ Astrelle ✦
              </p>
              <p style={{ fontSize: 22, fontWeight: 700, color: "#e8e0f0", marginBottom: 4 }}>
                Carta Astral de {name}
              </p>
              <div style={{ width: 60, height: 1, background: "linear-gradient(90deg, transparent, #c8aa50, transparent)", margin: "0 auto" }} />
            </div>

            {/* Main sign */}
            <div style={{
              textAlign: "center", marginBottom: 24,
              padding: "20px 16px",
              background: "rgba(200, 170, 80, 0.08)",
              borderRadius: 16,
              border: "1px solid rgba(200, 170, 80, 0.15)",
            }}>
              <p style={{ fontSize: 48, marginBottom: 4 }}>{sunSign.symbol}</p>
              <p style={{ fontSize: 20, fontWeight: 600, color: "#c8aa50" }}>Sol en {sunSign.name}</p>
              <p style={{ fontSize: 12, color: "#9990a8", marginTop: 4 }}>{sunSign.element} · {sunSign.planet}</p>
            </div>

            {/* Moon & Ascendant */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <div style={{
                flex: 1, textAlign: "center", padding: "14px 8px",
                background: "rgba(255,255,255,0.04)", borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.08)",
              }}>
                <p style={{ fontSize: 10, color: "#9990a8", textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>🌙 Luna en</p>
                <p style={{ fontSize: 16, fontWeight: 600 }}>{moonSign}</p>
              </div>
              <div style={{
                flex: 1, textAlign: "center", padding: "14px 8px",
                background: "rgba(255,255,255,0.04)", borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.08)",
              }}>
                <p style={{ fontSize: 10, color: "#9990a8", textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>⬆️ Ascendente</p>
                <p style={{ fontSize: 16, fontWeight: 600 }}>{ascendant}</p>
              </div>
            </div>

            {/* Extras row */}
            {(luckyNumber || ritual || amulet) && (
              <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                {luckyNumber && (
                  <div style={{
                    flex: 1, textAlign: "center", padding: "12px 6px",
                    background: "rgba(200, 170, 80, 0.06)", borderRadius: 12,
                    border: "1px solid rgba(200, 170, 80, 0.12)",
                  }}>
                    <p style={{ fontSize: 9, color: "#9990a8", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}># Suerte</p>
                    <p style={{ fontSize: 26, fontWeight: 700, color: "#c8aa50" }}>{luckyNumber.number}</p>
                  </div>
                )}
                {ritual && (
                  <div style={{
                    flex: 1, textAlign: "center", padding: "12px 6px",
                    background: "rgba(200, 170, 80, 0.06)", borderRadius: 12,
                    border: "1px solid rgba(200, 170, 80, 0.12)",
                  }}>
                    <p style={{ fontSize: 9, color: "#9990a8", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>🕯️ Ritual</p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#e8e0f0" }}>{ritual.title}</p>
                    <p style={{ fontSize: 10, color: "#c8aa50", marginTop: 2 }}>Vela {ritual.candleColor}</p>
                  </div>
                )}
                {amulet && (
                  <div style={{
                    flex: 1, textAlign: "center", padding: "12px 6px",
                    background: "rgba(200, 170, 80, 0.06)", borderRadius: 12,
                    border: "1px solid rgba(200, 170, 80, 0.12)",
                  }}>
                    <p style={{ fontSize: 9, color: "#9990a8", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>💎 Amuleto</p>
                    <p style={{ fontSize: 14, marginBottom: 2 }}>{amulet.emoji}</p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#e8e0f0" }}>{amulet.stone}</p>
                  </div>
                )}
              </div>
            )}

            {/* Footer with QR */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div>
                <p style={{ fontSize: 12, color: "#c8aa50", fontWeight: 600, marginBottom: 2 }}>Astrelle</p>
                <p style={{ fontSize: 9, color: "#9990a8", letterSpacing: 1.5 }}>Descubre tu carta astral</p>
                <p style={{ fontSize: 9, color: "#9990a8", letterSpacing: 1 }}>astrelle-guide.app</p>
              </div>
              <div style={{ background: "#ffffff", padding: 6, borderRadius: 8 }}>
                <QRCodeSVG
                  value="https://astrelle-guide.app"
                  size={64}
                  bgColor="#ffffff"
                  fgColor="#0f1029"
                  level="M"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleDownload}
          disabled={generating}
          className="flex-1 py-3 rounded-xl font-body text-sm font-medium bg-primary/15 text-primary border border-primary/20 hover:bg-primary/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {generating ? "Generando..." : "Descargar Imagen"}
        </button>
        <button
          onClick={handleShare}
          disabled={generating}
          className="flex-1 py-3 rounded-xl font-body text-sm font-medium bg-accent/15 text-accent border border-accent/20 hover:bg-accent/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Share2 className="w-4 h-4" />
          {generating ? "Generando..." : "Compartir"}
        </button>
      </div>
    </div>
  );
};

export default AstralShareCard;
