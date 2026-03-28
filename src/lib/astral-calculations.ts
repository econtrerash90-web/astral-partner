export interface ZodiacSign {
  name: string;
  start: [number, number];
  end: [number, number];
  element: string;
  planet: string;
  symbol: string;
}

const signs: ZodiacSign[] = [
  { name: 'Capricornio', start: [12, 22], end: [1, 19], element: 'Tierra', planet: 'Saturno', symbol: '♑' },
  { name: 'Acuario', start: [1, 20], end: [2, 18], element: 'Aire', planet: 'Urano', symbol: '♒' },
  { name: 'Piscis', start: [2, 19], end: [3, 20], element: 'Agua', planet: 'Neptuno', symbol: '♓' },
  { name: 'Aries', start: [3, 21], end: [4, 19], element: 'Fuego', planet: 'Marte', symbol: '♈' },
  { name: 'Tauro', start: [4, 20], end: [5, 20], element: 'Tierra', planet: 'Venus', symbol: '♉' },
  { name: 'Géminis', start: [5, 21], end: [6, 20], element: 'Aire', planet: 'Mercurio', symbol: '♊' },
  { name: 'Cáncer', start: [6, 21], end: [7, 22], element: 'Agua', planet: 'Luna', symbol: '♋' },
  { name: 'Leo', start: [7, 23], end: [8, 22], element: 'Fuego', planet: 'Sol', symbol: '♌' },
  { name: 'Virgo', start: [8, 23], end: [9, 22], element: 'Tierra', planet: 'Mercurio', symbol: '♍' },
  { name: 'Libra', start: [9, 23], end: [10, 22], element: 'Aire', planet: 'Venus', symbol: '♎' },
  { name: 'Escorpio', start: [10, 23], end: [11, 21], element: 'Agua', planet: 'Plutón', symbol: '♏' },
  { name: 'Sagitario', start: [11, 22], end: [12, 21], element: 'Fuego', planet: 'Júpiter', symbol: '♐' },
];

const signNames = ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo',
  'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'];

export const getZodiacSign = (month: number, day: number): ZodiacSign => {
  for (const sign of signs) {
    const [startMonth, startDay] = sign.start;
    const [endMonth, endDay] = sign.end;
    if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
      return sign;
    }
  }
  return signs[0];
};

export const getAscendant = (hour: number): string => {
  const index = Math.floor((hour * 60) / 120) % 12;
  return signNames[index];
};

export const getMoonSign = (date: Date): string => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const index = Math.floor((dayOfYear * 12) / 365) % 12;
  return signNames[index];
};

export interface AstralData {
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  sunSign: ZodiacSign;
  moonSign: string;
  ascendant: string;
  analysis?: string;
  timestamp: string;
}

export const encryptData = (data: unknown): string => {
  const jsonStr = JSON.stringify(data);
  return btoa(encodeURIComponent(jsonStr));
};

export const decryptData = (encrypted: string): AstralData | null => {
  try {
    return JSON.parse(decodeURIComponent(atob(encrypted)));
  } catch {
    return null;
  }
};
