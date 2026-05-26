// Calcula el signo solar a partir de una fecha (mes 1-12, día 1-31)
export type SunSign = {
  name: string;
  symbol: string;
  element: "Fuego" | "Tierra" | "Aire" | "Agua";
  vibe: string;
  strength: string;
};

const SIGNS: Array<SunSign & { from: [number, number]; to: [number, number] }> = [
  { name: "Capricornio", symbol: "♑", element: "Tierra", vibe: "Disciplina y propósito", strength: "Construyes a largo plazo cuando otros buscan atajos.", from: [12, 22], to: [1, 19] },
  { name: "Acuario", symbol: "♒", element: "Aire", vibe: "Visión y libertad", strength: "Ves patrones que otros no ven y rompes esquemas con elegancia.", from: [1, 20], to: [2, 18] },
  { name: "Piscis", symbol: "♓", element: "Agua", vibe: "Intuición profunda", strength: "Sientes lo que otros callan; tu sensibilidad es radar, no debilidad.", from: [2, 19], to: [3, 20] },
  { name: "Aries", symbol: "♈", element: "Fuego", vibe: "Empuje y coraje", strength: "Inicias lo que otros solo planean; tu instinto abre caminos.", from: [3, 21], to: [4, 19] },
  { name: "Tauro", symbol: "♉", element: "Tierra", vibe: "Calma y constancia", strength: "Construyes belleza y estabilidad donde pisas.", from: [4, 20], to: [5, 20] },
  { name: "Géminis", symbol: "♊", element: "Aire", vibe: "Curiosidad viva", strength: "Conectas ideas y personas con una facilidad rara.", from: [5, 21], to: [6, 20] },
  { name: "Cáncer", symbol: "♋", element: "Agua", vibe: "Corazón y memoria", strength: "Tu sensibilidad es tu mayor fortaleza, no tu debilidad.", from: [6, 21], to: [7, 22] },
  { name: "Leo", symbol: "♌", element: "Fuego", vibe: "Brillo y generosidad", strength: "Inspiras a los demás solo siendo tú mismo.", from: [7, 23], to: [8, 22] },
  { name: "Virgo", symbol: "♍", element: "Tierra", vibe: "Detalle y servicio", strength: "Ves lo que falta y lo arreglas con maestría silenciosa.", from: [8, 23], to: [9, 22] },
  { name: "Libra", symbol: "♎", element: "Aire", vibe: "Equilibrio y belleza", strength: "Armonizas situaciones tensas con tu sola presencia.", from: [9, 23], to: [10, 22] },
  { name: "Escorpio", symbol: "♏", element: "Agua", vibe: "Profundidad e intensidad", strength: "Vas al fondo de todo y transformas lo que tocas.", from: [10, 23], to: [11, 21] },
  { name: "Sagitario", symbol: "♐", element: "Fuego", vibe: "Aventura y verdad", strength: "Expandes horizontes propios y ajenos con tu energía.", from: [11, 22], to: [12, 21] },
];

export function getSunSign(month: number, day: number): SunSign | null {
  if (!month || !day) return null;
  for (const s of SIGNS) {
    const [fm, fd] = s.from;
    const [tm, td] = s.to;
    if (fm === tm) {
      if (month === fm && day >= fd && day <= td) return s;
    } else {
      if ((month === fm && day >= fd) || (month === tm && day <= td)) return s;
    }
  }
  return null;
}
