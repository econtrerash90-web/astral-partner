import { useRef, useEffect } from "react";
import type { SkyMapData } from "@/services/skyMap";

export type SkyMapStyle = "classic" | "minimal" | "watercolor" | "gold";

interface SkyMapCanvasProps {
  skyData: SkyMapData;
  style?: SkyMapStyle;
  showLabels?: boolean;
  className?: string;
}

const PLANET_COLORS: Record<string, string> = {
  Mercurio: "#B0B0B0",
  Venus: "#FFC649",
  Marte: "#FF6347",
  Júpiter: "#DAA520",
  Saturno: "#F4A460",
};

const SkyMapCanvas = ({
  skyData,
  style = "classic",
  showLabels = true,
  className = "",
}: SkyMapCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = 800 * dpr;
    canvas.height = 800 * dpr;
    ctx.scale(dpr, dpr);

    const W = 800;
    const H = 800;
    const CX = W / 2;
    const CY = H / 2;

    // Background
    if (style === "minimal") {
      ctx.fillStyle = "#0f0f1a";
    } else if (style === "gold") {
      ctx.fillStyle = "#000000";
    } else {
      const grad = ctx.createRadialGradient(CX, CY, 0, CX, CY, 500);
      if (style === "watercolor") {
        grad.addColorStop(0, "#1e3a5f");
        grad.addColorStop(1, "#0f1729");
      } else {
        grad.addColorStop(0, "#0a0e27");
        grad.addColorStop(0.7, "#050816");
        grad.addColorStop(1, "#000000");
      }
      ctx.fillStyle = grad;
    }
    ctx.fillRect(0, 0, W, H);

    // Circular border
    ctx.beginPath();
    ctx.arc(CX, CY, 385, 0, Math.PI * 2);
    ctx.strokeStyle =
      style === "gold"
        ? "hsla(43, 72%, 52%, 0.6)"
        : style === "minimal"
        ? "hsla(240, 20%, 30%, 0.5)"
        : "hsla(240, 20%, 80%, 0.15)";
    ctx.lineWidth = style === "gold" ? 2.5 : 1.5;
    ctx.stroke();

    // Cardinal directions
    const directions = [
      { label: "N", angle: 0 },
      { label: "E", angle: 90 },
      { label: "S", angle: 180 },
      { label: "O", angle: 270 },
    ];
    ctx.font = "bold 14px 'DM Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    directions.forEach((d) => {
      const rad = ((d.angle - 90) * Math.PI) / 180;
      const r = 395;
      const x = CX + r * Math.cos(rad);
      const y = CY + r * Math.sin(rad);
      ctx.fillStyle =
        style === "gold" ? "hsla(43, 72%, 52%, 0.8)" : "hsla(240, 20%, 80%, 0.5)";
      ctx.fillText(d.label, x, y);
    });

    // Ecliptic ring
    ctx.beginPath();
    ctx.arc(CX, CY, 280, 0, Math.PI * 2);
    ctx.strokeStyle = "hsla(43, 72%, 52%, 0.1)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 8]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Stars
    skyData.celestialObjects.stars.forEach((star) => {
      const dx = star.x - 400;
      const dy = star.y - 400;
      if (Math.sqrt(dx * dx + dy * dy) > 385) return;

      ctx.beginPath();
      if (style === "gold") {
        ctx.fillStyle =
          star.magnitude < 1
            ? "hsla(43, 72%, 60%, 1)"
            : `hsla(43, 30%, 70%, ${Math.max(0.2, 1 - star.magnitude / 5)})`;
      } else {
        const alpha = Math.max(0.15, 1 - star.magnitude / 5);
        ctx.fillStyle = `hsla(240, 20%, 95%, ${alpha})`;
      }
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();

      // Glow for bright stars
      if (star.magnitude < 1 && style !== "minimal") {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size + 6, 0, Math.PI * 2);
        ctx.fillStyle =
          style === "gold"
            ? "hsla(43, 72%, 52%, 0.08)"
            : "hsla(240, 20%, 95%, 0.06)";
        ctx.fill();
      }

      // Named star labels
      if (showLabels && star.name) {
        ctx.font = "9px 'DM Sans', sans-serif";
        ctx.fillStyle =
          style === "gold"
            ? "hsla(43, 50%, 60%, 0.6)"
            : "hsla(240, 20%, 80%, 0.45)";
        ctx.textAlign = "center";
        ctx.fillText(star.name, star.x, star.y - star.size - 6);
      }
    });

    // Sun
    const sun = skyData.celestialObjects.sun;
    if (sun.visible) {
      // Glow
      const sunGrad = ctx.createRadialGradient(sun.x, sun.y, 0, sun.x, sun.y, 40);
      sunGrad.addColorStop(0, "hsla(43, 90%, 60%, 0.4)");
      sunGrad.addColorStop(1, "hsla(43, 90%, 60%, 0)");
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sun.x, sun.y, 40, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = "hsla(43, 90%, 55%, 1)";
      ctx.arc(sun.x, sun.y, 14, 0, Math.PI * 2);
      ctx.fill();

      if (showLabels) {
        ctx.font = "11px 'DM Sans', sans-serif";
        ctx.fillStyle = "hsla(43, 72%, 52%, 0.9)";
        ctx.textAlign = "center";
        ctx.fillText("☀️ Sol", sun.x, sun.y + 28);
      }
    }

    // Moon
    const moon = skyData.celestialObjects.moon;
    if (moon.visible) {
      const moonGrad = ctx.createRadialGradient(moon.x, moon.y, 0, moon.x, moon.y, 30);
      moonGrad.addColorStop(0, "hsla(210, 20%, 80%, 0.3)");
      moonGrad.addColorStop(1, "hsla(210, 20%, 80%, 0)");
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(moon.x, moon.y, 30, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = "hsla(210, 15%, 85%, 0.95)";
      ctx.arc(moon.x, moon.y, 12, 0, Math.PI * 2);
      ctx.fill();

      // Craters
      ctx.fillStyle = "hsla(210, 10%, 70%, 0.4)";
      ctx.beginPath();
      ctx.arc(moon.x - 3, moon.y - 2, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(moon.x + 4, moon.y + 3, 1.5, 0, Math.PI * 2);
      ctx.fill();

      if (showLabels) {
        ctx.font = "11px 'DM Sans', sans-serif";
        ctx.fillStyle = "hsla(210, 30%, 80%, 0.9)";
        ctx.textAlign = "center";
        ctx.fillText("🌙 Luna", moon.x, moon.y + 26);
      }
    }

    // Planets
    skyData.celestialObjects.planets.forEach((planet) => {
      if (!planet.visible) return;
      const dx = planet.x - 400;
      const dy = planet.y - 400;
      if (Math.sqrt(dx * dx + dy * dy) > 380) return;

      const color = PLANET_COLORS[planet.name] || "#ffffff";

      // Glow
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, 16, 0, Math.PI * 2);
      ctx.fillStyle = `${color}15`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(planet.x, planet.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = style === "gold" ? "hsla(43, 72%, 52%, 0.9)" : color;
      ctx.fill();

      if (showLabels) {
        ctx.font = "10px 'DM Sans', sans-serif";
        ctx.fillStyle = "hsla(240, 20%, 80%, 0.7)";
        ctx.textAlign = "center";
        ctx.fillText(`${planet.symbol} ${planet.name}`, planet.x, planet.y + 20);
      }
    });

    // Center crosshair
    ctx.strokeStyle = "hsla(240, 20%, 80%, 0.08)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(CX - 20, CY);
    ctx.lineTo(CX + 20, CY);
    ctx.moveTo(CX, CY - 20);
    ctx.lineTo(CX, CY + 20);
    ctx.stroke();
  }, [skyData, style, showLabels]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full max-w-[800px] aspect-square rounded-2xl ${className}`}
      style={{ width: "100%", height: "auto" }}
    />
  );
};

export default SkyMapCanvas;
