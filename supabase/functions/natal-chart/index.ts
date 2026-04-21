import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Auth check ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { birthDate, birthTime, birthPlace } = await req.json();

    if (!birthDate || !birthTime || !birthPlace) {
      return new Response(JSON.stringify({ error: "Faltan datos de nacimiento" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Step 1: Geocode birth place using Nominatim
    let latitude = 40.4168;
    let longitude = -3.7038;
    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(birthPlace)}&format=json&limit=1`,
        { headers: { "User-Agent": "AstrelleGuide/1.0" } }
      );
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.length > 0) {
          latitude = parseFloat(geoData[0].lat);
          longitude = parseFloat(geoData[0].lon);
        }
      }
    } catch (e) {
      console.error("Geocoding error:", e);
    }

    // Step 2: Use AI to generate planetary positions
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Eres un sistema de cálculo astronómico. Dada una fecha, hora y coordenadas de nacimiento, debes generar las posiciones planetarias aproximadas para una carta natal. Responde SOLO con un JSON válido, sin markdown ni texto adicional.

Las posiciones deben ser realistas basadas en las efemérides astronómicas conocidas. Calcula las posiciones usando el conocimiento astronómico de la fecha dada.

El formato de respuesta debe ser exactamente:
{
  "planets": [
    {"name": "Sol", "symbol": "☉", "sign": "Aries", "degree": 15, "minute": 23, "house": 1, "retrograde": false},
    {"name": "Luna", "symbol": "☽", "sign": "Tauro", "degree": 8, "minute": 45, "house": 2, "retrograde": false},
    {"name": "Mercurio", "symbol": "☿", "sign": "Piscis", "degree": 28, "minute": 12, "house": 12, "retrograde": true},
    {"name": "Venus", "symbol": "♀", "sign": "Aries", "degree": 3, "minute": 56, "house": 1, "retrograde": false},
    {"name": "Marte", "symbol": "♂", "sign": "Géminis", "degree": 20, "minute": 8, "house": 3, "retrograde": false},
    {"name": "Júpiter", "symbol": "♃", "sign": "Leo", "degree": 12, "minute": 34, "house": 5, "retrograde": false},
    {"name": "Saturno", "symbol": "♄", "sign": "Capricornio", "degree": 5, "minute": 17, "house": 10, "retrograde": true},
    {"name": "Urano", "symbol": "♅", "sign": "Escorpio", "degree": 18, "minute": 42, "house": 8, "retrograde": false},
    {"name": "Neptuno", "symbol": "♆", "sign": "Sagitario", "degree": 1, "minute": 5, "house": 9, "retrograde": false},
    {"name": "Plutón", "symbol": "♇", "sign": "Libra", "degree": 27, "minute": 33, "house": 7, "retrograde": true},
    {"name": "Nodo Norte", "symbol": "☊", "sign": "Virgo", "degree": 14, "minute": 20, "house": 6, "retrograde": false},
    {"name": "Quirón", "symbol": "⚷", "sign": "Tauro", "degree": 9, "minute": 15, "house": 2, "retrograde": false}
  ],
  "houses": [
    {"number": 1, "sign": "Aries", "degree": 0, "minute": 0},
    {"number": 2, "sign": "Tauro", "degree": 2, "minute": 15},
    {"number": 3, "sign": "Géminis", "degree": 5, "minute": 30},
    {"number": 4, "sign": "Cáncer", "degree": 8, "minute": 45},
    {"number": 5, "sign": "Leo", "degree": 6, "minute": 20},
    {"number": 6, "sign": "Virgo", "degree": 3, "minute": 10},
    {"number": 7, "sign": "Libra", "degree": 0, "minute": 0},
    {"number": 8, "sign": "Escorpio", "degree": 2, "minute": 15},
    {"number": 9, "sign": "Sagitario", "degree": 5, "minute": 30},
    {"number": 10, "sign": "Capricornio", "degree": 8, "minute": 45},
    {"number": 11, "sign": "Acuario", "degree": 6, "minute": 20},
    {"number": 12, "sign": "Piscis", "degree": 3, "minute": 10}
  ],
  "ascendant": {"sign": "Aries", "degree": 0, "minute": 0},
  "midheaven": {"sign": "Capricornio", "degree": 8, "minute": 45},
  "aspects": [
    {"planet1": "Sol", "planet2": "Luna", "type": "sextil", "orb": 2.3},
    {"planet1": "Sol", "planet2": "Marte", "type": "trígono", "orb": 1.5},
    {"planet1": "Luna", "planet2": "Venus", "type": "cuadratura", "orb": 3.1},
    {"planet1": "Mercurio", "planet2": "Saturno", "type": "oposición", "orb": 0.8}
  ]
}

Los tipos de aspectos son: conjunción, sextil, cuadratura, trígono, oposición, quincuncio, semisextil.
Los signos zodiacales son: Aries, Tauro, Géminis, Cáncer, Leo, Virgo, Libra, Escorpio, Sagitario, Capricornio, Acuario, Piscis.
Los grados van de 0 a 29. Los minutos van de 0 a 59.
Las casas van de 1 a 12.

Genera posiciones REALISTAS basadas en la astronomía real para la fecha dada. No inventes posiciones aleatorias.`
          },
          {
            role: "user",
            content: `Calcula las posiciones planetarias para:
- Fecha de nacimiento: ${birthDate}
- Hora de nacimiento: ${birthTime}
- Latitud: ${latitude}
- Longitud: ${longitude}
- Lugar: ${birthPlace}

Devuelve SOLO el JSON, sin ningún texto adicional ni markdown.`
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Límite de consultas excedido, intenta de nuevo en un momento." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos agotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const chartData = JSON.parse(cleaned);

    // Step 3: Generate interpretations for each planet
    const interpretResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: "Eres un coach de vida. Explica conceptos de personalidad en lenguaje simple y cotidiano. NUNCA uses jerga astrológica. Responde SOLO con JSON válido sin markdown."
          },
          {
            role: "user",
            content: `Para cada planeta en esta carta natal, genera una interpretación breve (1-2 oraciones) en lenguaje cotidiano explicando qué significa para la persona. NO uses términos astrológicos.

Planetas: ${JSON.stringify(chartData.planets.map((p: any) => ({ name: p.name, sign: p.sign, house: p.house })))}

Formato de respuesta (JSON, sin markdown):
{
  "interpretations": {
    "Sol": "Tu esencia es...",
    "Luna": "Tus emociones...",
    ...
  }
}`
          }
        ],
      }),
    });

    let interpretations: Record<string, string> = {};
    if (interpretResponse.ok) {
      const interpData = await interpretResponse.json();
      const interpText = interpData.choices?.[0]?.message?.content || "";
      try {
        const cleanedInterp = interpText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(cleanedInterp);
        interpretations = parsed.interpretations || {};
      } catch (e) {
        console.error("Failed to parse interpretations:", e);
      }
    }

    return new Response(JSON.stringify({
      ...chartData,
      interpretations,
      coordinates: { latitude, longitude },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("natal-chart error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
