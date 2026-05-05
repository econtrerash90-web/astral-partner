// Lazy URL resolution: Vite emits each file as a separate asset URL,
// and we only resolve the one we need on demand.
const modules = import.meta.glob<string>("@/assets/knights/*.jpg", {
  eager: true,
  import: "default",
  query: "?url",
});

const SIGN_TO_FILE: Record<string, string> = {
  Aries: "aries",
  Tauro: "tauro",
  "Géminis": "geminis",
  "Cáncer": "cancer",
  Leo: "leo",
  Virgo: "virgo",
  Libra: "libra",
  Escorpio: "escorpio",
  Sagitario: "sagitario",
  Capricornio: "capricornio",
  Acuario: "acuario",
  Piscis: "piscis",
};

export function getKnightImage(sign: string): string | undefined {
  const file = SIGN_TO_FILE[sign];
  if (!file) return undefined;
  const key = Object.keys(modules).find((k) => k.endsWith(`/${file}.jpg`));
  return key ? (modules[key] as unknown as string) : undefined;
}
