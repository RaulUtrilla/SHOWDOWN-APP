#!/usr/bin/env python3
"""
build_teams.py — Genera data/teams.json a partir de los datos de equipos de
muestra públicos de pkmn/smogon (https://data.pkmn.cc/teams/<format>.json),
que son scrapes automáticos y validados de los hilos oficiales de "Sample
Teams" de Smogon (ver pkmn/smogon, MIT License; los datos de sets son de
Smogon y sus colaboradores).

Uso:
  1. Descarga los JSON fuente de cada formato en /tmp (o pásales otra ruta):
       curl -s -o /tmp/<format>.json \
         https://raw.githubusercontent.com/pkmn/smogon/main/data/teams/<format>.json
  2. Ejecuta este script: python3 scripts/build_teams.py
  3. Sobreescribe data/teams.json con el resultado.

Cada equipo seleccionado se referencia explícitamente en SELECTION con un
"id" estable, una descripción corta y unas tags. El campo "export" se
reconstruye en el formato de texto estándar de Showdown a partir de los
datos estructurados (que ya están validados por pkmn/smogon).
"""
import json
import os

SRC_DIR = "/tmp"
OUT_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "teams.json")

STAT_KEYS = ["hp", "atk", "def", "spa", "spd", "spe"]
STAT_LABELS = {"hp": "HP", "atk": "Atk", "def": "Def", "spa": "SpA", "spd": "SpD", "spe": "Spe"}

SOURCE_URL = {
    "gen9ou": "https://data.pkmn.cc/teams/gen9ou.json",
    "gen9uu": "https://data.pkmn.cc/teams/gen9uu.json",
    "gen9ru": "https://data.pkmn.cc/teams/gen9ru.json",
    "gen9nu": "https://data.pkmn.cc/teams/gen9nu.json",
    "gen9monotype": "https://data.pkmn.cc/teams/gen9monotype.json",
    "gen9doublesou": "https://data.pkmn.cc/teams/gen9doublesou.json",
    "gen9nationaldex": "https://data.pkmn.cc/teams/gen9nationaldex.json",
}

# format -> [(index en el JSON fuente, id, descripción, tags)]
SELECTION = {
    "gen9ou": [
        (0, "gen9ou-dark-n-darker",
         "Balance con Kingambit y Zamazenta como cierres, apoyados por Darkrai y Roaring Moon como wallbreakers especiales/físicos.",
         ["balance", "kingambit", "zamazenta"]),
        (6, "gen9ou-prime-pult",
         "Balance ofensivo en torno a Dragapult, con Kingambit y Landorus-Therian para hazard control y pivoteo.",
         ["balance", "dragapult", "kingambit"]),
    ],
    "gen9uu": [
        (0, "gen9uu-dual-steel",
         "Balance estándar de UU con doble Steel (Excadrill + apoyo), Hydrapple como wall especial y Tornadus-Therian de pivote.",
         ["balance", "steel", "hydrapple"]),
        (5, "gen9uu-mamo-hazard-stack",
         "Hazard stack con Mamoswine como setter/breaker físico y Tornadus-Therian + Slowking para control de ritmo.",
         ["hazard stack", "mamoswine"]),
    ],
    "gen9ru": [
        (0, "gen9ru-barraskewda-pawmot-balance",
         "Balance de RU con Barraskewda como wallbreaker rápido tras Tailwind/Rapid Spin, Pawmot como sweeper y Umbreon/Hippowdon como núcleo defensivo.",
         ["balance", "barraskewda", "pawmot"]),
    ],
    "gen9nu": [
        (3, "gen9nu-meta-is-broken-s3",
         "Balance ofensivo de NU con Scyther shiny como sweeper físico, apoyado por Gligar, Goodra y Bronzong como núcleo defensivo.",
         ["balance", "scyther", "offense"]),
    ],
    "gen9monotype": [
        (7, "gen9monotype-steel-balanced",
         "Monotype Acero balanceado: Gholdengo y Heatran como núcleo especial, Kingambit como cierre físico y Corviknight/Iron Treads para hazards y pivoteo.",
         ["monotype", "steel", "balance"]),
        (1, "gen9monotype-fairy-hyper-offense",
         "Monotype Hada hiperofensivo con Klefki para hazards/Spikes, Iron Valiant y Flutter Mane como sweepers especiales y Hatterene/Clefable como wallbreakers shiny.",
         ["monotype", "fairy", "hyper offense"]),
    ],
    "gen9doublesou": [
        (1, "gen9doublesou-ghold-tailwind-balance",
         "Doubles OU balance con Gholdengo (Nasty Plot + Protect) como win condition especial, Incineroar de soporte (Fake Out/Parting Shot) y Tornadus para Tailwind/Rain.",
         ["doubles", "balance", "gholdengo", "tailwind"]),
    ],
    "gen9nationaldex": [
        (0, "gen9nationaldex-wcop-grassy",
         "Balance de National Dex con Rillaboom (Grassy Terrain) y Landorus-Therian como núcleo de terreno/hazards, Kartana como wallbreaker físico y Heatran de soporte.",
         ["national dex", "balance", "rillaboom", "grassy terrain"]),
        (13, "gen9nationaldex-ursaluna-tapukoko-balance",
         "Balance de National Dex centrado en Ursaluna (Bloodmoon Ulcer) y Tapu Koko como wallbreakers, con Corviknight/Tangrowth/Slowking-Galar como núcleo defensivo.",
         ["national dex", "balance", "ursaluna", "tapu koko"]),
    ],
}


def fmt_stats(stats):
    parts = []
    for k in STAT_KEYS:
        v = stats.get(k)
        if v:
            parts.append(f"{v} {STAT_LABELS[k]}")
    return " / ".join(parts)


def set_to_export(m):
    lines = []

    head = m["species"]
    if m.get("gender") in ("M", "F"):
        head += f" ({m['gender']})"
    if m.get("item"):
        head += f" @ {m['item']}"
    lines.append(head)

    if m.get("ability"):
        lines.append(f"Ability: {m['ability']}")
    if m.get("level"):
        lines.append(f"Level: {m['level']}")
    if m.get("shiny"):
        lines.append("Shiny: Yes")
    if m.get("teraType"):
        lines.append(f"Tera Type: {m['teraType']}")

    evs = fmt_stats(m.get("evs", {}))
    if evs:
        lines.append(f"EVs: {evs}")
    if m.get("nature"):
        lines.append(f"{m['nature']} Nature")

    ivs = fmt_stats(m.get("ivs", {}))
    if ivs:
        lines.append(f"IVs: {ivs}")

    for move in m.get("moves", []):
        lines.append(f"- {move}")

    return "\n".join(lines)


def team_to_export(team):
    return "\n\n".join(set_to_export(m) for m in team["data"])


def main():
    out = []
    for fmt, picks in SELECTION.items():
        with open(os.path.join(SRC_DIR, f"{fmt}.json")) as f:
            data = json.load(f)
        for idx, team_id, description, tags in picks:
            team = data[idx]
            author = team.get("author") or "Smogon Sample Teams"
            name = team.get("name") or team_id
            out.append({
                "id": team_id,
                "format": fmt,
                "name": name,
                "author": author,
                "source": SOURCE_URL[fmt],
                "description": description,
                "tags": tags,
                "export": team_to_export(team),
            })

    with open(OUT_PATH, "w") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(f"Wrote {len(out)} teams to {OUT_PATH}")


if __name__ == "__main__":
    main()
