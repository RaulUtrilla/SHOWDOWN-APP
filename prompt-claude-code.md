# Prompt para Claude Code — Extensión Pokémon Showdown (Tampermonkey)

## Contexto del proyecto

Estoy desarrollando una extensión para **Pokémon Showdown** como script de **Tampermonkey/Violentmonkey**. El formato objetivo es **Random Battles** (Gen 9). El script debe inyectarse en `https://play.pokemonshowdown.com/*`.

Ya tengo una base de datos parcial de velocidades base en el archivo `showdown-speed-tier.user.js`. Tu tarea es construir el script completo y funcional implementando todas las features descritas a continuación, en orden de prioridad.

---

## Arquitectura general

El script sigue este flujo:
1. **Tampermonkey** inyecta el script cuando se carga Showdown
2. Un **MutationObserver** detecta cambios en el DOM de batalla (nuevos Pokémon, boosts, clima, etc.)
3. `parseBattleState()` extrae el estado actual de la batalla leyendo el DOM
4. `getSpeedData()` consulta la base de datos local de velocidades base
5. `calcEffectiveSpeed()` calcula la velocidad efectiva real considerando todos los modificadores
6. `renderOverlay()` pinta un panel HTML draggable ordenado por velocidad

---

## Feature 1 (PRIORIDAD ALTA): Speed Tier Viewer

### Descripción
Panel overlay draggable que muestra en tiempo real qué Pokémon actúa primero en el turno actual.

### Requisitos funcionales

**Extracción de datos del DOM de Showdown:**
- Leer los Pokémon activos del jugador en `.statbar.lstatbar` y del rival en `.statbar.rstatbar`
- Leer los boosts de velocidad del log de batalla (`.battle-log`) buscando mensajes tipo "rose sharply", "harshly fell", etc.
- Detectar si hay **Tailwind** activo para cada lado (duplica velocidad efectiva, dura 4 turnos)
- Detectar si hay **Trick Room** activo (invierte el orden, dura 5 turnos)
- Detectar el **clima** activo: Sun (Chlorophyll ×2), Rain (Swift Swim ×2), Sand (Sand Rush ×2), Snow/Hail (Slush Rush ×2)
- Detectar si hay **Paralysis** en un Pokémon (velocidad ×0.5)

**Tabla de multiplicadores de boost:**
```
+6 → ×4.0
+5 → ×3.5
+4 → ×3.0
+3 → ×2.5
+2 → ×2.0
+1 → ×1.5
 0 → ×1.0
-1 → ×0.66
-2 → ×0.5
-3 → ×0.4
-4 → ×0.33
-5 → ×0.28
-6 → ×0.25
```

**Fórmula de velocidad efectiva:**
```
effectiveSpeed = baseSpeed × boostMultiplier × tailwindMultiplier × weatherMultiplier × statusMultiplier
```

Donde:
- `tailwindMultiplier` = 2 si Tailwind activo para ese lado, 1 si no
- `weatherMultiplier` = 2 si el Pokémon tiene ability Chlorophyll/Swift Swim/Sand Rush/Slush Rush y el clima correspondiente está activo, 1 si no. En Randoms no sabemos la ability hasta que se revela, así que muestra un icono "?" en ese caso.
- `statusMultiplier` = 0.5 si tiene parálisis, 1 si no

**En Trick Room**, invertir el orden del panel (más lento va primero).

### UI del panel

- Panel flotante con fondo semitransparente oscuro, arrastrable con el ratón
- Título: "Speed order" con un pequeño indicador si Trick Room está activo (🔀) o Tailwind (💨)
- Lista ordenada de mayor a menor velocidad efectiva, con:
  - Nombre del Pokémon
  - Velocidad efectiva calculada entre paréntesis
  - Color del nombre: azul para los del jugador, rojo para los del rival
  - Si hay empate de velocidad: mostrar "?" indicando que hay aleatoriedad
  - Icono ⚡ si el Pokémon tiene un boost de velocidad positivo activo
  - Icono 🐢 si tiene boost negativo o parálisis
- Botón "×" para ocultar/mostrar el panel
- El panel debe actualizarse automáticamente cada vez que cambia el estado de la batalla

### Estructura de archivos

```
showdown-speed-tier.user.js   ← archivo único, todo el script aquí
```

### Código base existente

Tengo ya el objeto `SPEED_DATA` con ~200 Pokémon. Debes:
1. Completar `SPEED_DATA` con **todos los Pokémon disponibles en Gen 9 Random Battles** (aprox. 400+ entradas). Consulta la lista oficial de Smogon para Gen 9 Randoms.
2. Añadir los nombres alternativos más comunes que Showdown usa (ej: `rotom-wash`, `urshifu-rapid-strike`, `indeedee-f`, etc.)

---

## Feature 2 (PRIORIDAD MEDIA): Contador de condiciones de campo

### Descripción
Debajo del speed tier, añadir una sección compacta que muestre el estado actual de:

- **Clima** activo + turnos restantes (Sun / Rain / Sand / Snow)
- **Trick Room** activo + turnos restantes
- **Tailwind** (jugador y rival por separado) + turnos restantes
- **Stealth Rock** en cada lado (activo / inactivo)
- **Spikes** en cada lado (número de capas: 0, 1, 2, 3)
- **Sticky Web** en cada lado (activo / inactivo)

El contador de turnos debe decrementar correctamente leyendo el log de batalla.

---

## Feature 3 (PRIORIDAD MEDIA): Indicador de empates de velocidad

Cuando dos Pokémon tienen la misma velocidad efectiva, en lugar de ordenarlos arbitrariamente:
- Mostrarlos al mismo nivel con un separador "— speed tie —"
- Indicar visualmente con un color especial (amarillo/naranja) que el orden es aleatorio en ese turno

---

## Feature 4 (PRIORIDAD BAJA): Persistencia de configuración

Guardar en `localStorage` las preferencias del usuario:
- Posición del panel en pantalla (x, y)
- Si el panel está visible u oculto
- Opción de mostrar/ocultar la sección de condiciones de campo

Clave de localStorage: `showdown-stv-config`

---

## Feature 5 (PRIORIDAD BAJA): Detección de abilities relevantes de velocidad

En Randoms, las abilities se revelan cuando el Pokémon las activa. Detectar del log de batalla cuándo se revela una ability relevante para la velocidad y actualizar el cálculo:

Abilities a detectar:
- `Swift Swim` (×2 en Rain)
- `Chlorophyll` (×2 en Sun)
- `Sand Rush` (×2 en Sand)
- `Slush Rush` (×2 en Snow)
- `Unburden` (×2 si item consumido)
- `Speed Boost` (acumula +1 por turno)
- `Slow Start` (×0.5 primeros 5 turnos)
- `Quick Feet` (×1.5 si tiene status)

---

## Restricciones técnicas

- **Sin dependencias externas**: solo vanilla JS, sin npm, sin imports. Todo en un único archivo `.user.js`.
- **Sin peticiones de red**: toda la data debe estar embebida en el script. No hacer fetch a APIs externas.
- **Compatible con Tampermonkey y Violentmonkey**.
- **No usar `// @grant GM_*`** salvo que sea estrictamente necesario. Usar `// @grant none` si es posible.
- **El script no debe interferir** con el funcionamiento normal de Showdown ni modificar su DOM más allá de añadir el overlay propio.
- **Performance**: el MutationObserver debe tener un debounce de ~100ms para no bloquear el hilo principal.

---

## Instrucciones de implementación para Claude Code

1. Lee el archivo `showdown-speed-tier.user.js` existente para ver la base de datos parcial.
2. Implementa las features en orden: 1 → 2 → 3 → 4 → 5.
3. Después de cada feature, el script debe ser funcional y no romper las features anteriores.
4. Añade comentarios en español explicando cada sección principal.
5. Usa `console.log('[SpeedTierViewer]', ...)` para todos los logs de debug, con ese prefijo exacto.
6. Al final, muestra en consola la versión del script: `console.log('[SpeedTierViewer] v1.0.0 loaded')`.

---

## Criterios de éxito

- El panel aparece correctamente al entrar en una batalla de Random Battles.
- El orden de velocidad es correcto y se actualiza en tiempo real al haber boosts, clima, o cambios de estado.
- Trick Room invierte el orden visualmente.
- El panel es draggable y su posición se recuerda entre partidas.
- No hay errores en consola durante el uso normal.
