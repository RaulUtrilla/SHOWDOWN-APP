# Showdown Teambuilder Assistant

Extensión de Chrome (Manifest V3) que añade un **side panel** con equipos de
referencia ("sample teams") para el Teambuilder de
[Pokémon Showdown](https://play.pokemonshowdown.com). Elige un formato, mira
una lista de equipos verificados con su preview de sprites, y cópialos o
intenta importarlos directamente al Teambuilder con un clic.

No sustituye a Showdex (que se centra en el combate): esta extensión se centra
en **construir equipos**, y convive perfectamente con Showdex.

---

## 🚀 Instalación (modo desarrollador)

1. Abre Chrome y ve a `chrome://extensions`.
2. Activa **"Modo de desarrollador"** (interruptor arriba a la derecha).
3. Pulsa **"Cargar descomprimida"** ("Load unpacked").
4. Selecciona la carpeta `showdown-teambuilder-assistant/` (esta carpeta).
5. Pulsa el icono de la extensión en la barra de Chrome para abrir el **side
   panel**.

---

## 🧭 Uso

1. Abre `https://play.pokemonshowdown.com` y entra en el **Teambuilder**.
2. Abre el side panel de la extensión (icono en la barra de herramientas).
3. Elige un **formato** (Gen 9 OU, Ubers, UU, RU, NU, PU, LC, Monotype,
   Doubles OU, National Dex, o "Todos los formatos").
4. Usa el buscador para filtrar por **especie, autor o arquetipo** (p. ej.
   escribe "Kingambit" para ver equipos que lo incluyan).
5. En cada equipo:
   - **Ver set ▼** despliega los 6 sets completos (item, ability, Tera type,
     EVs/IVs, naturaleza, movimientos).
   - **Fuente ↗** abre la página original (hilo de Smogon / PokePaste) donde
     se verificó el equipo.
   - **Copiar** copia el equipo en formato export al portapapeles.
   - **Importar a Showdown** crea automáticamente un equipo nuevo en el
     Teambuilder y le pega el set completo (ver limitaciones más abajo).
     Después solo tienes que asignarle el formato correcto con el
     desplegable junto al nombre. Si algún paso falla, copia el equipo y te
     avisa para que lo pegues a mano.

Tu formato favorito se recuerda entre sesiones (`chrome.storage.local`).

---

## ➕ Cómo añadir equipos nuevos

Todos los equipos viven en [`data/teams.json`](data/teams.json), un array de
objetos con este esquema:

```jsonc
{
  // Identificador único y estable (slug). Se usa para recordar qué equipos
  // tienes expandidos, etc.
  "id": "gen9ou-balance-landotran",

  // Debe coincidir con un "id" de src/shared/formats.js
  "format": "gen9ou",

  // Nombre corto mostrado en la tarjeta
  "name": "Balance con Landorus-Therian",

  // Autor/créditos tal como aparecen en la fuente. Si es un equipo
  // comunitario sin autor concreto, usa algo como "Smogon Sample Teams".
  "author": "Smogon Sample Teams",

  // URL pública donde se puede verificar el equipo (hilo de Smogon,
  // PokePaste, etc.)
  "source": "https://www.smogon.com/forums/threads/....",

  // 1-2 frases describiendo el arquetipo
  "description": "Balance con control de hazards y pivoteo.",

  // Etiquetas libres para filtros/búsqueda
  "tags": ["balance", "hazard control"],

  // El equipo completo en el "export format" estándar de Showdown,
  // copiado VERBATIM de la fuente (no lo reescribas a mano). Los 6 sets
  // van separados por una línea en blanco.
  "export": "Landorus-Therian @ Leftovers\nAbility: Intimidate\nTera Type: Water\nEVs: 252 HP / 4 Def / 252 SpD\nCareful Nature\n- Earthquake\n- Stealth Rock\n- U-turn\n- Taunt\n\n..."
}
```

**No inventes equipos ni atribuyas autoría falsa.** Si no puedes verificar de
dónde sale un set, márcalo como `"author": "Community / sample"` y enlaza la
fuente más cercana posible (o deja `"source": null`).

Las especies, sprites y el detalle de cada set se **derivan automáticamente**
del campo `export` (ver `src/shared/teamparser.js`), así que no hace falta
duplicar esa información en el JSON.

### Añadir un formato nuevo

Edita [`src/shared/formats.js`](src/shared/formats.js) y añade
`{ "id": "gen9xxx", "name": "Gen 9 XXX" }`. El `id` debe seguir el formato
interno de Showdown (todo en minúsculas, sin espacios — el mismo que aparece
en la URL de una sala de batalla, p. ej. `gen9doublesou`).

### Procedencia de los equipos incluidos

Los equipos de `data/teams.json` provienen de
[`data.pkmn.cc/teams/<format>.json`](https://data.pkmn.cc/teams/), una API
pública que hace *scraping* automático (cada 24h) de los hilos oficiales de
"Sample Teams" de cada tier en los foros de Smogon y valida cada equipo con el
team validator real de Pokémon Showdown. El campo `"source"` de cada equipo
apunta al JSON de esa API para el formato correspondiente.

`scripts/build_teams.py` descarga esos JSON y reconstruye el campo `export`
en el formato de texto estándar de Showdown a partir de los datos
estructurados (ya validados). Para regenerar/ampliar `data/teams.json`:

```sh
for fmt in gen9ou gen9uu gen9ru gen9nu gen9monotype gen9doublesou gen9nationaldex; do
  curl -s -o "/tmp/${fmt}.json" \
    "https://raw.githubusercontent.com/pkmn/smogon/main/data/teams/${fmt}.json"
done
python3 scripts/build_teams.py
```

Edita `SELECTION` en `scripts/build_teams.py` para elegir otros equipos
(índice dentro del JSON de cada formato) y vuelve a ejecutar el script.

**Gen 9 Ubers** no tiene equipos de ejemplo todavía (no hay un
`gen9ubers.json` en esa API a fecha de escritura); el formato sigue
disponible en el selector y mostrará el mensaje de "sin equipos" hasta que
se añadan manualmente.

---

## 🗂️ Estructura del proyecto

```
showdown-teambuilder-assistant/
├── manifest.json
├── data/
│   └── teams.json              # catálogo de equipos (ver arriba)
├── icons/                       # iconos de la extensión
└── src/
    ├── background/
    │   └── service-worker.js    # abre el side panel al pulsar el icono
    ├── content/
    │   └── teambuilder.content.js  # intenta pegar el equipo en el Teambuilder
    ├── sidepanel/
    │   ├── sidepanel.html
    │   ├── sidepanel.css
    │   └── sidepanel.js          # UI: lista, búsqueda, copiar/importar
    └── shared/
        ├── formats.js            # formatos disponibles
        ├── selectors.js           # selectores del DOM de Showdown (ver abajo)
        └── teamparser.js          # parser del "export format" + URLs de sprites
```

---

## 🔐 Permisos solicitados

| Permiso | Por qué |
|---|---|
| `sidePanel` | Es la interfaz principal de la extensión. |
| `storage` | Recordar el formato favorito entre sesiones. |
| `clipboardWrite` | Botón "Copiar" (copia el export al portapapeles). |
| `activeTab` | Enviar el equipo al content script de la pestaña activa de Showdown al pulsar "Importar". |

El content script solo se ejecuta en `https://play.pokemonshowdown.com/*`
(`content_scripts.matches` en `manifest.json`). Los sprites se cargan vía
`<img src="https://play.pokemonshowdown.com/sprites/...">`; al ser etiquetas
`<img>`, no requieren `host_permissions` adicionales.

---

## ⚠️ Limitaciones / partes "best-effort"

- **Importar a Showdown**: como el Teambuilder no tiene un diálogo
  "Import/Export" por equipo en la pantalla de lista, la extensión automatiza
  los pasos equivalentes a hacerlo a mano:
  1. Pulsa el botón **"New team"** del Teambuilder (crea un equipo vacío al
     principio de la lista).
  2. Abre el editor de ese equipo nuevo.
  3. Cambia a la pestaña **"Import/Export"**.
  4. Pega el equipo en el `<textarea>`, que se autoguarda al disparar el
     evento `input` (Showdown no tiene botón "Guardar" en esa pestaña).

  El equipo nuevo se crea **"Sin categorizar"** (formato `gen9`); tras
  importarlo, usa el desplegable junto al nombre del equipo para asignarle el
  formato correcto (p. ej. "Gen 9 OU").

  Esto requiere que la pestaña activa sea `play.pokemonshowdown.com` y que
  tengas el Teambuilder abierto. Como Showdown es una SPA (Preact) que cambia
  de versión periódicamente, esto puede romperse. Todos los selectores están
  centralizados en `src/shared/selectors.js` como **listas de candidatos** —
  si deja de funcionar, normalmente basta con añadir/ajustar un selector ahí.
  - Si falla cualquier paso (botón "New team", enlace al equipo, pestaña
    "Import/Export" o textarea), la extensión hace **fallback automático**:
    copia el equipo al portapapeles y te indica que lo pegues manualmente.
- **Sprites**: se usa `https://play.pokemonshowdown.com/sprites/dex/<id>.png`
  con fallback a `https://play.pokemonshowdown.com/sprites/gen5/<id>.png` y,
  si ambos fallan, el icono local de la extensión.
- **Datos de equipos**: `data/teams.json` empieza con un catálogo pequeño y
  está pensado para ampliarse — ver la sección de arriba.
