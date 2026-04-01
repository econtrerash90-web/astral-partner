import { useState, type RefObject } from "react";
import { toPng } from "html-to-image";
import { Download } from "lucide-react";
import { toast } from "sonner";

const APP_URL = "https://astrelle-guide.app";

interface ResultShareButtonsProps {
  captureRef: RefObject<HTMLDivElement>;
  filename: string;
  shareText: string;
}

const ResultShareButtons = ({ captureRef, filename, shareText }: ResultShareButtonsProps) => {
  const [generating, setGenerating] = useState(false);

  const generateImage = async (): Promise<Blob | null> => {
    if (!captureRef.current) return null;
    setGenerating(true);
    try {
      const dataUrl = await toPng(captureRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#0f1029",
        style: {
          borderRadius: "0",
        },
      });
      const res = await fetch(dataUrl);
      return await res.blob();
    } catch (e) {
      console.error("Error generating image:", e);
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
    link.download = `astrelle-${filename}.png`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Imagen descargada ✨");
  };

  const fullShareText = `${shareText} — Descubre el tuyo en Astrelle ${APP_URL}`;

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(fullShareText)}`, "_blank");
  };

  const handleNativeShare = async () => {
    const blob = await generateImage();
    if (!blob) return;
    const file = new File([blob], `astrelle-${filename}.png`, { type: "image/png" });
    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "Astrelle", text: fullShareText });
      } catch (e) {
        if ((e as Error).name !== "AbortError") toast.error("No se pudo compartir");
      }
    } else {
      await navigator.clipboard.writeText(fullShareText);
      toast.success("Texto copiado al portapapeles ✨");
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      <button
        onClick={handleDownload}
        disabled={generating}
        className="py-3 rounded-xl font-body text-xs font-medium bg-primary/15 text-primary border border-primary/20 hover:bg-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Download className="w-4 h-4" />
        {generating ? "..." : "Descargar"}
      </button>
      <button
        onClick={handleWhatsApp}
        disabled={generating}
        className="py-3 rounded-xl font-body text-xs font-medium bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/20 hover:bg-[#25D366]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        WhatsApp
      </button>
      <button
        onClick={handleNativeShare}
        disabled={generating}
        className="py-3 rounded-xl font-body text-xs font-medium bg-accent/15 text-accent border border-accent/20 hover:bg-accent/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Compartir
      </button>
    </div>
  );
};

export default ResultShareButtons;
