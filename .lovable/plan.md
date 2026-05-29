## Plan: Corregir enlace roto al diario (404)

### Problema
El botón **"Escribir en mi diario"** en la tarjeta de evento astrológico actual en la página principal navega a `/journal`, pero la ruta real de la app es `/diario`. Esto produce un 404.

### Ubicación exacta del bug
- Archivo: `src/pages/Index.tsx`
- Línea: 522
- Código actual: `navigate("/journal")`
- Código correcto: `navigate("/diario")`

### Acción propuesta
1. Cambiar `navigate("/journal")` a `navigate("/diario")` en `src/pages/Index.tsx:522`.
2. Hacer una búsqueda rápida en todo el proyecto para descartar otras rutas mal escritas similares (ej. `/journal`, `/diary`, etc.) y corregirlas si existen.

Solo hay un cambio de código en un archivo. No se requiere modificar la base de datos, ni estilos, ni traducciones.