# Evento astrológico actual y cómo me afecta

Añadir una nueva sección en la página principal (debajo del horóscopo diario, antes de "Compartir mi día") que muestre el evento astrológico vigente con fechas, cómo afecta personalmente al usuario según su carta natal, una invitación a reflexionar y consejos para aprovecharlo.

## Qué verá el usuario

Tarjeta "cosmic-glass" titulada **"Evento astrológico actual"** con:
- **Nombre del evento** en lenguaje cotidiano (ej: "Temporada de Sagitario", "Luna llena en Géminis", "Mercurio pide calma").
- **Rango de fechas** "Del 22 de noviembre al 21 de diciembre".
- **Qué es** en 1-2 frases, sin jerga (cumple regla: nada de "tránsito", "aspecto", "casa").
- **Cómo te afecta a ti** (2-3 frases personalizadas usando signo solar, lunar y ascendente del usuario).
- **Invitación a reflexionar**: una pregunta breve para el diario.
- **Cómo aprovecharlo**: 3 consejos prácticos en bullets.
- Botón "Escribir reflexión" que lleva al diario con el prompt precargado (sessionStorage).
- Botón refrescar 🔄 igual que el horóscopo.

Estilo: mismas pills/glass-card que el resto, ícono Sparkles/Orbit en gold.

## Cómo se genera

Edge Function nueva **`current-astro-event`** (modelo `google/gemini-3-flash-preview`, igual que `daily-horoscope`):
- Detecta el evento principal vigente hoy (temporada solar, fase lunar, retrógrado activo) usando lógica simple por fecha (ya hay base en `daily-horoscope` para retrógrado de Mercurio y signo lunar).
- Pide a la IA un JSON con: `eventName`, `startDate`, `endDate`, `whatItIs`, `howItAffectsYou` (personalizado con sun/moon/asc), `reflectionPrompt`, `tips[3]`.
- Lenguaje cotidiano obligatorio, multi-idioma vía `_shared/language.ts`.
- Auth requerida + reuso del cliente Supabase como en otras functions.

## Caché y límites

- Reutilizar tabla **`astral_extras`** con `type = "current_event"` y guardar `valid_until` dentro del JSON.
- Al cargar el dashboard: si existe y `valid_until >= hoy`, se muestra cacheado; si no, se invoca la function una sola vez.
- Botón "regenerar" fuerza nueva llamada y sobrescribe el upsert (`onConflict: "user_id,type"`).
- El trigger `recalculate_astral_chart` ya borra `astral_extras` cuando cambia la carta, así que la personalización siempre queda fresca.

## Archivos

- **Nuevo**: `supabase/functions/current-astro-event/index.ts`
- **Editar**: `src/pages/Index.tsx` — nueva sección + estado `currentEvent`, carga en `useEffect`, función `generateCurrentEvent`.
- **Editar**: `src/lib/i18n/translations.ts` — claves nuevas (`home.currentEvent.*`).
- **Editar**: `src/pages/Journal.tsx` (mínimo) — leer `sessionStorage.astrelle_journal_prompt` para precargar la reflexión (opcional, dejo botón funcionando aunque no se precargue).

## Fuera de alcance

- No se calculan efemérides reales (Swiss Ephemeris) para este evento; se usa heurística por fecha + IA, consistente con cómo ya funcionan el horóscopo y los extras del proyecto.
- No se añaden tablas nuevas ni cambios de schema.
