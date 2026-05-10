## Objetivo
En la sección "Tu Perfil Astral" de la Carta Natal, actualizar los labels de las 3 cards (Luna, Ascendente, Medio Cielo) para mostrar tanto su significado cotidiano como su nombre astrológico. Además, resaltar (highlight) estos 3 términos dentro del texto de análisis de personalidad generado por IA.

## Cambios Propuestos

### 1. Traducciones (`src/lib/i18n/translations.ts`)
Actualizar las claves existentes en los 5 idiomas para incluir el nombre astrológico junto al significado:
- `natal.yourEmotions`: "Tus emociones — Tu luna"
- `natal.howOthersSee`: "Cómo te ven otros — Ascendente"
- `natal.yourPath`: "Tu camino de vida — Medio Cielo"

Y agregar nuevas claves para los términos técnicos usados en el highlight:
- `natal.termAsc`, `natal.termMc`, `natal.termMoon` (en cada idioma: ES, EN, DE, PL, PT).

### 2. Función de resaltado (`src/lib/format-ai-text.ts`)
Crear `highlightAstralTerms(text, terms)` que:
- Busca cada término astrológico en el texto original.
- Lo envuelve en `**texto**` si aún no está en bold.
- Es compatible con el flujo existente de `formatAIText()`.

### 3. Página de Carta Natal (`src/pages/NatalChart.tsx`)
- Reemplazar el texto del análisis por: `formatAIText(highlightAstralTerms(analysis, [t("natal.termAsc"), t("natal.termMc"), t("natal.termMoon")]))`
- Los términos se resaltarán automáticamente con el estilo `text-primary` ya usado por `formatAIText` para bold.

## Notas técnicas
- Los términos astrológicos varían por idioma, por eso se agregan como traducciones dinámicas.
- El highlight se aplica como pre-procesamiento antes del formateo de Markdown, sin modificar la lógica de `formatAIText`.
- El estilo visual del resaltado hereda el estilo `<strong className="text-primary">` ya existente.
