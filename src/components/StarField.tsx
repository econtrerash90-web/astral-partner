import { useMemo } from "react";

const StarField = () => {
  const stars = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2,
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Deep cosmic base */}
      <div className="absolute inset-0 bg-background" />

      {/* Subtle purple glow orb — top right */}
      <div
        className="absolute -top-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, hsl(256 40% 35% / 0.5) 0%, transparent 70%)",
          animation: "glow-drift 14s ease-in-out infinite",
        }}
      />

      {/* Subtle blue orb — bottom left */}
      <div
        className="absolute -bottom-[15%] -left-[15%] w-[50vw] h-[50vw] rounded-full opacity-15"
        style={{
          background: "radial-gradient(circle, hsl(262 35% 30% / 0.4) 0%, transparent 70%)",
          animation: "glow-drift 18s ease-in-out 4s infinite reverse",
        }}
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 opacity-40"
        style={{ background: "var(--gradient-cosmic)" }}
      />

      {/* Twinkling stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-stardust"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animation: `glow-pulse ${star.duration}s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
};

export default StarField;
