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
    "gen9lc": "https://data.pkmn.cc/teams/gen9lc.json",
    "gen9pu": "https://data.pkmn.cc/teams/gen9pu.json",
    "gen9anythinggoes": "https://data.pkmn.cc/teams/gen9anythinggoes.json",
}

# format -> [(index en el JSON fuente, id, descripción, tags)]
SELECTION = {
    "gen9ou": [
        (0, "gen9ou-dark-n-darker",
         "Balance con Kingambit y Zamazenta como cierres, apoyados por Darkrai y Roaring Moon como wallbreakers especiales/físicos.",
         ["balance", "kingambit", "zamazenta"]),
        (1, "gen9ou-mana-webs",
         "Balance especial con Ribombee (Sticky Web) para acelerar a Manaphy y Roaring Moon, apoyado por Gholdengo/Zamazenta como núcleo defensivo.",
         ["balance", "sticky web", "manaphy"]),
        (2, "gen9ou-safari-zone",
         "Balance ofensivo con Raging Bolt e Iron Valiant como wallbreakers especiales/físicos, Kingambit de cierre y Rillaboom de Grassy Terrain (varios shiny).",
         ["balance", "raging bolt", "kingambit"]),
        (6, "gen9ou-prime-pult",
         "Balance ofensivo en torno a Dragapult, con Kingambit y Landorus-Therian para hazard control y pivoteo.",
         ["balance", "dragapult", "kingambit"]),
        (8, "gen9ou-ogerpon-tinglu-fat",
         "Stall/balance pesado con Ting-Lu y Garganacl como muros físicos, Gholdengo como wall especial y Deoxys-Speed para hazards rápidos.",
         ["stall", "ting-lu", "garganacl"]),
    ],
    "gen9uu": [
        (0, "gen9uu-dual-steel",
         "Balance estándar de UU con doble Steel (Excadrill + apoyo), Hydrapple como wall especial y Tornadus-Therian de pivote.",
         ["balance", "steel", "hydrapple"]),
        (1, "gen9uu-band-gross-sand",
         "Balance con Tyranitar (Sand Stream) y Excadrill como dúo de arena, Metagross (Choice Band) como wallbreaker físico y Hydrapple/Tornadus-Therian de soporte.",
         ["sand", "metagross", "tyranitar"]),
        (5, "gen9uu-mamo-hazard-stack",
         "Hazard stack con Mamoswine como setter/breaker físico y Tornadus-Therian + Slowking para control de ritmo.",
         ["hazard stack", "mamoswine"]),
        (7, "gen9uu-shocks-regenguys-kicks",
         "Balance con núcleo Regenerator (Hydrapple/Slowking/Tornadus-Therian) para mantener salud, Sandy Shocks de hazards y Lokix/Tinkaton como wallbreakers físicos.",
         ["balance", "regenerator", "sandy shocks"]),
        (9, "gen9uu-triple-regen-core-bo",
         "Bulky offense con triple núcleo Regenerator (Hydrapple/Slowking/Zapdos) y Mienshao/Mamoswine/Tinkaton como wallbreakers físicos rápidos.",
         ["bulky offense", "regenerator", "mamoswine"]),
    ],
    "gen9ru": [
        (0, "gen9ru-barraskewda-pawmot-balance",
         "Balance de RU con Barraskewda como wallbreaker rápido tras Tailwind/Rapid Spin, Pawmot como sweeper y Umbreon/Hippowdon como núcleo defensivo.",
         ["balance", "barraskewda", "pawmot"]),
        (1, "gen9ru-pawmot-mimikyu-bo",
         "Bulky offense con Pawmot (Mach Punch/Double Shock) y Mimikyu (Red Card) como sweepers, apoyados por Hippowdon/Umbreon de control de hazards.",
         ["bulky offense", "pawmot", "mimikyu"]),
        (2, "gen9ru-band-zoroark-balance",
         "Balance con Zoroark-Hisui (Choice Band) como wallbreaker sorpresa, Thundurus de pivote especial y Milotic/Umbreon/Hippowdon como núcleo defensivo.",
         ["balance", "zoroark", "thundurus"]),
    ],
    "gen9nu": [
        (0, "gen9nu-specs-hoopa",
         "Balance ofensivo con Hoopa (Choice Specs) como wallbreaker especial, Copperajah de soporte físico y Gligar/Florges como núcleo defensivo.",
         ["balance", "hoopa", "offense"]),
        (1, "gen9nu-cm-dudun-knock-salazzle",
         "Balance con Dudunsparce (Calm Mind) como win condition especial, Klefki para hazards/Spikes y Electrode-Hisui/Salazzle como wallbreakers rápidos.",
         ["balance", "dudunsparce", "calm mind"]),
        (3, "gen9nu-meta-is-broken-s3",
         "Balance ofensivo de NU con Scyther shiny como sweeper físico, apoyado por Gligar, Goodra y Bronzong como núcleo defensivo.",
         ["balance", "scyther", "offense"]),
        (4, "gen9nu-new-sun-attempt",
         "Equipo de Sun (Volbeat con Drought) con Victreebel y Tauros-Paldea-Blaze como abusadores, y Jolteon/Goodra/Uxie de soporte especial.",
         ["sun", "victreebel", "volbeat"]),
    ],
    "gen9monotype": [
        (0, "gen9monotype-electric",
         "Monotype Eléctrico con Regieleki como sweeper ultrarrápido, Iron Hands como wallbreaker físico y Magnezone/Zapdos/Rotom-Wash de soporte.",
         ["monotype", "electric", "regieleki"]),
        (1, "gen9monotype-fairy-hyper-offense",
         "Monotype Hada hiperofensivo con Klefki para hazards/Spikes, Iron Valiant y Flutter Mane como sweepers especiales y Hatterene/Clefable como wallbreakers shiny.",
         ["monotype", "fairy", "hyper offense"]),
        (3, "gen9monotype-flying-balanced",
         "Monotype Volador balanceado con Corviknight/Gliscor de hazard control y Dragonite/Enamorus/Articuno/Zapdos como wallbreakers especiales/físicos.",
         ["monotype", "flying", "balance"]),
        (6, "gen9monotype-poison-balanced",
         "Monotype Veneno balanceado con Toxapex/Amoonguss/Weezing-Galar como núcleo defensivo y Sneasler/Salazzle/Muk-Alola como wallbreakers rápidos.",
         ["monotype", "poison", "balance"]),
        (7, "gen9monotype-steel-balanced",
         "Monotype Acero balanceado: Gholdengo y Heatran como núcleo especial, Kingambit como cierre físico y Corviknight/Iron Treads para hazards y pivoteo.",
         ["monotype", "steel", "balance"]),
        (10, "gen9monotype-water-rain",
         "Monotype Agua con Pelipper (Drizzle) activando Swift Swim para Barraskewda/Urshifu-Rapid-Strike, con Toxapex/Gastrodon de soporte.",
         ["monotype", "water", "rain"]),
    ],
    "gen9doublesou": [
        (1, "gen9doublesou-ghold-tailwind-balance",
         "Doubles OU balance con Gholdengo (Nasty Plot + Protect) como win condition especial, Incineroar de soporte (Fake Out/Parting Shot) y Tornadus para Tailwind/Rain.",
         ["doubles", "balance", "gholdengo", "tailwind"]),
        (2, "gen9doublesou-veils-gambit",
         "Doubles con Ninetales-Alola (Aurora Veil) dando pantallas a Kyurem/Kingambit como wallbreakers, e Incineroar/Landorus de soporte (Fake Out/Intimidate).",
         ["doubles", "aurora veil", "kingambit"]),
        (4, "gen9doublesou-tinglu-glim-prio-spam",
         "Doubles ofensivo con prioridad (Chien-Pao/Dragonite) apoyada por Glimmora (Stealth Rock) y Ting-Lu/Rillaboom/Gouging Fire como wallbreakers físicos.",
         ["doubles", "offense", "priority"]),
        (6, "gen9doublesou-regidrago",
         "Doubles con Regidrago y Ursaluna-Bloodmoon como wallbreakers principales, Farigiraf (Trick Room/Imposter) y Tornadus de soporte (Prankster).",
         ["doubles", "regidrago", "ursaluna"]),
    ],
    "gen9nationaldex": [
        (0, "gen9nationaldex-wcop-grassy",
         "Balance de National Dex con Rillaboom (Grassy Terrain) y Landorus-Therian como núcleo de terreno/hazards, Kartana como wallbreaker físico y Heatran de soporte.",
         ["national dex", "balance", "rillaboom", "grassy terrain"]),
        (1, "gen9nationaldex-mmedi-hydrei",
         "Balance de National Dex con Medicham (Pure Power) e Hydreigon como wallbreakers, Clefable/Heatran/Landorus-Therian de soporte y hazard control.",
         ["national dex", "balance", "medicham", "hydreigon"]),
        (8, "gen9nationaldex-monofire-larp-crown",
         "Balance de National Dex con Gouging Fire e Iron Crown como wallbreakers principales, Dragonite/Diancie/Landorus-Therian de soporte y hazard control.",
         ["national dex", "balance", "gouging fire", "iron crown"]),
        (11, "gen9nationaldex-torn-z-chomp",
         "Balance de National Dex con Garchomp y Urshifu-Rapid-Strike como wallbreakers físicos, Tapu Lele (Z-move) de ruptura especial y Ferrothorn/Toxapex/Tornadus-Therian de soporte.",
         ["national dex", "balance", "garchomp", "tapu lele"]),
        (13, "gen9nationaldex-ursaluna-tapukoko-balance",
         "Balance de National Dex centrado en Ursaluna (Bloodmoon Ulcer) y Tapu Koko como wallbreakers, con Corviknight/Tangrowth/Slowking-Galar como núcleo defensivo.",
         ["national dex", "balance", "ursaluna", "tapu koko"]),
        (16, "gen9nationaldex-tloh-iv-anique",
         "Stall de National Dex con Blissey/Toxapex/Clodsire/Dondozo como muros, y Corviknight/Gliscor para hazards y recuperación.",
         ["national dex", "stall", "blissey", "dondozo"]),
    ],
    "gen9lc": [
        (0, "gen9lc-stunky-tspikes",
         "Balance de Little Cup con Stunky (Toxic Spikes) y Mareanie de hazard stack, Mienfoo/Mudbray como wallbreakers físicos y Vullaby/Voltorb-Hisui de soporte.",
         ["lc", "balance", "hazard stack", "stunky"]),
        (3, "gen9lc-standard-6",
         "Balance estándar de Little Cup con Mienfoo/Growlithe-Hisui como wallbreakers físicos, Foongus (Spore) de soporte y Mudbray/Vullaby/Stunky de control.",
         ["lc", "balance"]),
        (5, "gen9lc-volt-turn-offense",
         "Ofensiva VoltTurn de Little Cup con Voltorb-Hisui/Tentacool/Toedscool pivoteando hacia Larvesta/Mienfoo/Meowth-Galar como wallbreakers (varios shiny).",
         ["lc", "voltturn", "offense"]),
    ],
    "gen9pu": [
        (0, "gen9pu-av-golurk-cm-glowbro",
         "Balance de PU con Golurk (Assault Vest) y Slowbro-Galar (Calm Mind) como wallbreakers, Milotic/Rotom-Mow de soporte y Bombirdier/Tauros-Paldea-Blaze de presión física.",
         ["pu", "balance", "golurk"]),
        (2, "gen9pu-cm-florges-salazzle-balance",
         "Balance de PU con Florges (Calm Mind) como win condition especial, Salazzle/Zoroark como wallbreakers rápidos y Bronzong/Gastrodon/Scyther de soporte.",
         ["pu", "balance", "florges"]),
        (6, "gen9pu-skunk-hazard-stack",
         "Hazard stack de PU con Skuntank (Sucker Punch/hazards) y Sandslash-Alola como rompedores, y Florges/Milotic/Gligar/Kilowattrel de soporte.",
         ["pu", "hazard stack", "skuntank"]),
    ],
    "gen9anythinggoes": [
        (0, "gen9ag-waterceus-regen-stall",
         "Stall/balance de AG (Anything Goes) con Arceus-Water (Calm Mind + Recover) y Ho-Oh como muros especiales regenerativos, Eternatus y Ting-Lu de hazards/recuperación, y Zacian/Calyrex-Shadow como cierres.",
         ["ag", "anything goes", "arceus", "stall"]),
        (1, "gen9ag-encore-caly-ndm",
         "Balance de AG con Calyrex-Shadow (Encore + Nasty Plot) como win condition especial y Necrozma-Dusk-Mane (Dragon Dance + Stone Edge) como sweeper físico, apoyados por Ting-Lu/Arceus-Water/Ho-Oh de soporte regenerativo.",
         ["ag", "anything goes", "calyrex", "necrozma"]),
        (3, "gen9ag-miraidon-solar-beam",
         "Ofensiva de AG con Miraidon (Hadron Engine + Solar Beam) como wallbreaker especial, Koraidon y Necrozma-Dusk-Mane como sweepers físicos, y Arceus-Fairy/Ting-Lu poniendo Stealth Rock/Spikes.",
         ["ag", "anything goes", "miraidon", "offense"]),
        (6, "gen9ag-deoxys-physical-ho",
         "Hyper offense de AG con Deoxys-Speed (Stealth Rock + Spikes + Focus Sash) abriendo paso a Zacian, Koraidon, Arceus, Arceus-Ground y Calyrex-Shadow, todos con Swords Dance o Nasty Plot.",
         ["ag", "anything goes", "hyper offense", "deoxys"]),
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
