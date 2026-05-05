import { forwardRef } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DailyShareCardProps {
  name: string;
  sunSign: string;
  sunSymbol: string;
  general: string;
  luckyNumber: number | null;
  luckyColor?: string;
  advice?: string;
}

const DailyShareCard = forwardRef<HTMLDivElement, DailyShareCardProps>(
  ({ name, sunSign, sunSymbol, general, luckyNumber, luckyColor, advice }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: "1080px",
          height: "1920px",
          background:
            "linear-gradient(160deg, #0f0524 0%, #1a0b2e 30%, #2d1b4e 60%, #5a189a 100%)",
          padding: "100px 80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "'DM Sans', sans-serif",
          color: "#ffffff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Stars decoration */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(2px 2px at 15% 20%, #ffd700 50%, transparent), radial-gradient(1px 1px at 80% 15%, #fff 50%, transparent), radial-gradient(2px 2px at 70% 80%, #c4b5fd 50%, transparent), radial-gradient(1px 1px at 25% 70%, #ffd700 50%, transparent), radial-gradient(1.5px 1.5px at 50% 40%, #fff 50%, transparent), radial-gradient(1px 1px at 90% 60%, #c4b5fd 50%, transparent)",
            opacity: 0.7,
          }}
        />

        {/* Header */}
        <div style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
          <p
            style={{
              fontSize: "32px",
              letterSpacing: "8px",
              color: "#ffd700",
              textTransform: "uppercase",
              marginBottom: "20px",
              fontFamily: "'Cinzel', serif",
            }}
          >
            ✦ Astrelle ✦
          </p>
          <p style={{ fontSize: "28px", color: "#c4b5fd", opacity: 0.85 }}>
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
          </p>
        </div>

        {/* Main */}
        <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
          <div style={{ fontSize: "180px", lineHeight: 1, marginBottom: "20px" }}>{sunSymbol}</div>
          <h1
            style={{
              fontSize: "90px",
              fontFamily: "'Cinzel', serif",
              fontWeight: 600,
              marginBottom: "20px",
              background: "linear-gradient(135deg, #ffd700, #ffffff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {name}
          </h1>
          <p style={{ fontSize: "40px", color: "#c4b5fd", marginBottom: "60px", letterSpacing: "4px" }}>
            {sunSign.toUpperCase()}
          </p>

          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
              border: "2px solid rgba(255,215,0,0.25)",
              borderRadius: "40px",
              padding: "60px 50px",
              marginBottom: "40px",
            }}
          >
            <p
              style={{
                fontSize: "36px",
                lineHeight: 1.5,
                color: "#f5f3ff",
                fontStyle: "italic",
              }}
            >
              "{general}"
            </p>
          </div>

          {advice && (
            <p
              style={{
                fontSize: "32px",
                color: "#ffd700",
                fontStyle: "italic",
                lineHeight: 1.5,
                padding: "0 40px",
              }}
            >
              💫 {advice}
            </p>
          )}
        </div>

        {/* Footer info */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "30px",
              marginBottom: "40px",
              flexWrap: "wrap",
            }}
          >
            {luckyNumber !== null && (
              <div
                style={{
                  background: "rgba(255,215,0,0.15)",
                  border: "1px solid rgba(255,215,0,0.4)",
                  borderRadius: "30px",
                  padding: "24px 40px",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: "22px", color: "#ffd700", opacity: 0.8, marginBottom: "8px" }}>
                  Número de la suerte
                </p>
                <p style={{ fontSize: "56px", color: "#ffd700", fontWeight: 700 }}>
                  {luckyNumber}
                </p>
              </div>
            )}
            {luckyColor && (
              <div
                style={{
                  background: "rgba(196,181,253,0.12)",
                  border: "1px solid rgba(196,181,253,0.4)",
                  borderRadius: "30px",
                  padding: "24px 40px",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: "22px", color: "#c4b5fd", opacity: 0.8, marginBottom: "8px" }}>
                  Color del día
                </p>
                <p style={{ fontSize: "36px", color: "#c4b5fd", fontWeight: 600 }}>{luckyColor}</p>
              </div>
            )}
          </div>

          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "24px", color: "rgba(255,255,255,0.6)", letterSpacing: "2px" }}>
              astrelle-guide.app
            </p>
          </div>
        </div>
      </div>
    );
  }
);

DailyShareCard.displayName = "DailyShareCard";

export default DailyShareCard;
