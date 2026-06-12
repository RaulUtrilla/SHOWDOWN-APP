// ==UserScript==
// @name         Speed Tier Viewer - Pokémon Showdown
// @namespace    https://pokemonshowdown.com
// @version      1.0.0
// @description  Panel de velocidad en tiempo real para Random Battles Gen 9
// @author       Tu nombre
// @match        https://play.pokemonshowdown.com/*
// @match        https://pokemonshowdown.com/*
// @grant        none
// ==/UserScript==

(function () {

  // ═══════════════════════════════════════════════════════════════════════════
  // BASE DE DATOS DE VELOCIDADES BASE — Gen 9 Random Battles
  // Fuente: https://www.smogon.com/dex/sv/pokemon/
  // ═══════════════════════════════════════════════════════════════════════════
  const SPEED_DATA = {
    // ── Gen 1 ───────────────────────────────────────────────────────────────
    bulbasaur: 45, ivysaur: 60, venusaur: 80,
    charmander: 65, charmeleon: 80, charizard: 100,
    squirtle: 43, wartortle: 58, blastoise: 78,
    caterpie: 45, metapod: 30, butterfree: 70,
    weedle: 35, kakuna: 35, beedrill: 75,
    pidgey: 56, pidgeotto: 71, pidgeot: 101,
    rattata: 72, raticate: 97,
    spearow: 70, fearow: 100,
    ekans: 55, arbok: 60,
    pikachu: 90, raichu: 110,
    sandshrew: 40, sandslash: 65,
    'nidoran-f': 41, nidorina: 56, nidoqueen: 76,
    'nidoran-m': 55, nidorino: 65, nidoking: 85,
    clefairy: 35, clefable: 60,
    vulpix: 65, ninetales: 100,
    jigglypuff: 20, wigglytuff: 45,
    zubat: 55, golbat: 90, crobat: 130,
    oddish: 30, gloom: 40, vileplume: 50, bellossom: 50,
    paras: 35, parasect: 25,
    venonat: 45, venomoth: 90,
    diglett: 95, dugtrio: 120,
    meowth: 90, persian: 115,
    psyduck: 55, golduck: 85,
    mankey: 70, primeape: 95,
    growlithe: 60, arcanine: 95,
    poliwag: 90, poliwhirl: 90, poliwrath: 70, politoed: 70,
    abra: 90, kadabra: 105, alakazam: 120,
    machop: 35, machoke: 45, machamp: 55,
    bellsprout: 40, weepinbell: 55, victreebel: 70,
    tentacool: 70, tentacruel: 100,
    geodude: 20, graveler: 35, golem: 45,
    ponyta: 90, rapidash: 105,
    slowpoke: 15, slowbro: 30, slowking: 30,
    magnemite: 45, magneton: 70, magnezone: 60,
    farfetchd: 60, 'farfetch-d': 60,
    doduo: 75, dodrio: 110,
    seel: 45, dewgong: 70,
    grimer: 25, muk: 50,
    shellder: 40, cloyster: 70,
    gastly: 80, haunter: 95, gengar: 110,
    onix: 70, steelix: 30,
    drowzee: 42, hypno: 67,
    krabby: 50, kingler: 75,
    voltorb: 100, electrode: 150,
    exeggcute: 45, exeggutor: 55,
    cubone: 35, marowak: 45,
    hitmonlee: 87, hitmonchan: 76, hitmontop: 70,
    lickitung: 30, lickilicky: 50,
    koffing: 35, weezing: 60,
    rhyhorn: 25, rhydon: 40, rhyperior: 40,
    chansey: 35, blissey: 55, happiny: 30,
    tangela: 60, tangrowth: 50,
    kangaskhan: 90,
    horsea: 60, seadra: 85, kingdra: 85,
    goldeen: 63, seaking: 68,
    staryu: 85, starmie: 115,
    'mr-mime': 90, mrmime: 90,
    scyther: 105, scizor: 65,
    jynx: 95,
    electabuzz: 105, electivire: 95,
    magmar: 93, magmortar: 83,
    pinsir: 85,
    tauros: 110,
    magikarp: 80, gyarados: 81,
    lapras: 60,
    ditto: 48,
    eevee: 55, vaporeon: 65, jolteon: 130, flareon: 65,
    espeon: 110, umbreon: 65, leafeon: 95, glaceon: 65, sylveon: 60,
    porygon: 40, porygon2: 60, 'porygon-z': 90, porygonz: 90,
    omanyte: 35, omastar: 55,
    kabuto: 55, kabutops: 80,
    aerodactyl: 130,
    snorlax: 30, munchlax: 5,
    articuno: 85, zapdos: 100, moltres: 90,
    dratini: 50, dragonair: 70, dragonite: 80,
    mewtwo: 130, mew: 100,

    // ── Gen 2 ───────────────────────────────────────────────────────────────
    chikorita: 45, bayleef: 60, meganium: 80,
    cyndaquil: 65, quilava: 80, typhlosion: 100,
    totodile: 43, croconaw: 58, feraligatr: 78,
    sentret: 20, furret: 90,
    hoothoot: 50, noctowl: 70,
    ledyba: 55, ledian: 85,
    spinarak: 30, ariados: 40,
    chinchou: 67, lanturn: 67,
    pichu: 60, cleffa: 15, igglybuff: 15,
    togepi: 20, togetic: 40, togekiss: 80,
    natu: 70, xatu: 95,
    mareep: 35, flaaffy: 45, ampharos: 55,
    marill: 40, azumarill: 50, azurill: 20,
    sudowoodo: 30, bonsly: 10,
    hoppip: 50, skiploom: 80, jumpluff: 110,
    aipom: 85, ambipom: 115,
    sunkern: 30, sunflora: 30,
    yanma: 95, yanmega: 95,
    wooper: 15, quagsire: 35,
    murkrow: 91, honchkrow: 71,
    misdreavus: 85, mismagius: 105,
    unown: 48,
    wobbuffet: 33, wynaut: 23,
    girafarig: 85, farigiraf: 52,
    pineco: 15, forretress: 40,
    dunsparce: 45, dudunsparce: 40, 'dudunsparce-three-segment': 40,
    gligar: 85, gliscor: 95,
    snubbull: 30, granbull: 45,
    qwilfish: 85, overqwil: 85,
    shuckle: 5,
    heracross: 85,
    sneasel: 115, weavile: 125, sneasler: 120,
    teddiursa: 40, ursaring: 55, ursaluna: 50, 'ursaluna-bloodmoon': 55,
    slugma: 20, magcargo: 30,
    swinub: 50, piloswine: 50, mamoswine: 80,
    corsola: 35, cursola: 30,
    remoraid: 65, octillery: 45,
    delibird: 75,
    mantine: 70, mantyke: 60,
    skarmory: 70,
    houndour: 65, houndoom: 95,
    phanpy: 40, donphan: 50,
    stantler: 85, wyrdeer: 52,
    smeargle: 75,
    tyrogue: 52,
    smoochum: 65,
    elekid: 95,
    magby: 83,
    miltank: 100,
    raikou: 115, entei: 100, suicune: 85,
    larvitar: 41, pupitar: 51, tyranitar: 61,
    lugia: 110, 'ho-oh': 90, hooh: 90,
    celebi: 100,

    // ── Gen 3 ───────────────────────────────────────────────────────────────
    treecko: 70, grovyle: 95, sceptile: 120,
    torchic: 45, combusken: 55, blaziken: 80,
    mudkip: 40, marshtomp: 50, swampert: 60,
    poochyena: 35, mightyena: 70,
    zigzagoon: 60, linoone: 100,
    wurmple: 20, silcoon: 15, beautifly: 65, cascoon: 15, dustox: 65,
    lotad: 30, lombre: 50, ludicolo: 70,
    seedot: 30, nuzleaf: 60, shiftry: 80,
    taillow: 85, swellow: 125,
    wingull: 85, pelipper: 65,
    ralts: 40, kirlia: 50, gardevoir: 80, gallade: 80,
    surskit: 65, masquerain: 80,
    shroomish: 35, breloom: 70,
    slakoth: 30, vigoroth: 90, slaking: 100,
    nincada: 40, ninjask: 160, shedinja: 40,
    whismur: 28, loudred: 48, exploud: 68,
    makuhita: 25, hariyama: 50,
    nosepass: 30, probopass: 40,
    skitty: 50, delcatty: 90,
    sableye: 50,
    mawile: 50,
    aron: 30, lairon: 40, aggron: 50,
    meditite: 60, medicham: 80,
    electrike: 65, manectric: 105,
    plusle: 95, minun: 95,
    volbeat: 85, illumise: 85,
    roselia: 65, roserade: 90,
    gulpin: 40, swalot: 55,
    carvanha: 30, sharpedo: 95,
    wailmer: 40, wailord: 60,
    numel: 35, camerupt: 40,
    torkoal: 20,
    spoink: 60, grumpig: 80,
    spinda: 60,
    trapinch: 10, vibrava: 70, flygon: 100,
    cacnea: 35, cacturne: 55,
    swablu: 50, altaria: 80,
    zangoose: 90,
    seviper: 65,
    lunatone: 70, solrock: 70,
    barboach: 60, whiscash: 60,
    corphish: 35, crawdaunt: 55,
    baltoy: 60, claydol: 75,
    lileep: 23, cradily: 43,
    anorith: 50, armaldo: 45,
    feebas: 80, milotic: 81,
    castform: 70,
    kecleon: 40,
    shuppet: 45, banette: 65,
    duskull: 25, dusclops: 25, dusknoir: 45,
    tropius: 51,
    chimecho: 65, chingling: 45,
    absol: 75,
    snorunt: 50, glalie: 65, froslass: 110,
    spheal: 25, sealeo: 45, walrein: 65,
    clamperl: 35, huntail: 52, gorebyss: 52,
    relicanth: 55,
    luvdisc: 97,
    bagon: 50, shelgon: 50, salamence: 100,
    beldum: 30, metang: 50, metagross: 70,
    regirock: 50, regice: 50, registeel: 50,
    latias: 110, latios: 110,
    kyogre: 90, groudon: 90, rayquaza: 95,
    jirachi: 100,
    deoxys: 150,
    'deoxys-attack': 150, 'deoxys-defense': 90, 'deoxys-speed': 180,

    // ── Gen 4 ───────────────────────────────────────────────────────────────
    turtwig: 31, grotle: 36, torterra: 56,
    chimchar: 61, monferno: 81, infernape: 108,
    piplup: 40, prinplup: 50, empoleon: 60,
    starly: 60, staravia: 80, staraptor: 100,
    bidoof: 31, bibarel: 71,
    kricketot: 25, kricketune: 65,
    shinx: 45, luxio: 60, luxray: 70,
    budew: 40,
    cranidos: 58, rampardos: 58,
    shieldon: 30, bastiodon: 30,
    burmy: 36, wormadam: 36, mothim: 66,
    combee: 70, vespiquen: 40,
    pachirisu: 95,
    buizel: 72, floatzel: 115,
    cherubi: 35, cherrim: 85,
    shellos: 34, gastrodon: 39,
    drifloon: 70, drifblim: 80,
    buneary: 85, lopunny: 105,
    glameow: 85, purugly: 112,
    stunky: 63, skuntank: 84,
    bronzor: 23, bronzong: 33,
    'mime-jr': 60, mimejr: 60,
    chatot: 91,
    spiritomb: 35,
    gible: 42, gabite: 82, garchomp: 102,
    riolu: 60, lucario: 90,
    hippopotas: 32, hippowdon: 47,
    skorupi: 65, drapion: 95,
    croagunk: 50, toxicroak: 85,
    carnivine: 46,
    finneon: 66, lumineon: 91,
    snover: 40, abomasnow: 60,
    rotom: 91,
    'rotom-heat': 86, 'rotom-wash': 86, 'rotom-frost': 86, 'rotom-fan': 86, 'rotom-mow': 86,
    uxie: 95, mesprit: 80, azelf: 115,
    dialga: 90, palkia: 100,
    giratina: 90, 'giratina-origin': 90,
    cresselia: 85,
    phione: 80, manaphy: 100,
    darkrai: 125,
    shaymin: 100, 'shaymin-sky': 127,
    arceus: 120,

    // ── Gen 5 ───────────────────────────────────────────────────────────────
    victini: 100,
    snivy: 63, servine: 83, serperior: 113,
    tepig: 45, pignite: 55, emboar: 65,
    oshawott: 45, dewott: 60, samurott: 70,
    patrat: 51, watchog: 77,
    lillipup: 55, herdier: 65, stoutland: 80,
    purrloin: 66, liepard: 106,
    pansage: 64, simisage: 101,
    pansear: 64, simisear: 101,
    panpour: 64, simipour: 101,
    munna: 24, musharna: 29,
    pidove: 43, tranquill: 65, unfezant: 93,
    blitzle: 76, zebstrika: 116,
    roggenrola: 15, boldore: 20, gigalith: 25,
    woobat: 72, swoobat: 114,
    drilbur: 68, excadrill: 88,
    audino: 50,
    timburr: 35, gurdurr: 40, conkeldurr: 45,
    tympole: 40, palpitoad: 69, seismitoad: 74,
    throh: 45, sawk: 85,
    sewaddle: 42, swadloon: 42, leavanny: 92,
    venipede: 57, whirlipede: 47, scolipede: 112,
    cottonee: 66, whimsicott: 116,
    petilil: 30, lilligant: 90,
    basculin: 98,
    basculegion: 86, 'basculegion-f': 75,
    sandile: 65, krokorok: 74, krookodile: 92,
    darumaka: 50, darmanitan: 95,
    maractus: 60,
    dwebble: 55, crustle: 45,
    scraggy: 48, scrafty: 58,
    sigilyph: 97,
    yamask: 30, cofagrigus: 30,
    tirtouga: 22, carracosta: 32,
    archen: 70, archeops: 110,
    trubbish: 65, garbodor: 75,
    zorua: 65, zoroark: 105,
    minccino: 75, cinccino: 115,
    gothita: 45, gothorita: 55, gothitelle: 65,
    solosis: 20, duosion: 20, reuniclus: 30,
    ducklett: 55, swanna: 98,
    vanillite: 44, vanillish: 59, vanilluxe: 79,
    deerling: 75, sawsbuck: 95,
    emolga: 103,
    karrablast: 60, escavalier: 20,
    foongus: 15, amoonguss: 30,
    frillish: 40, jellicent: 60,
    alomomola: 40,
    joltik: 65, galvantula: 108,
    ferroseed: 10, ferrothorn: 20,
    klink: 30, klang: 50, klinklang: 90,
    tynamo: 60, eelektrik: 40, eelektross: 50,
    elgyem: 30, beheeyem: 40,
    litwick: 20, lampent: 55, chandelure: 80,
    axew: 57, fraxure: 67, haxorus: 97,
    cubchoo: 40, beartic: 50,
    cryogonal: 105,
    shelmet: 25, accelgor: 145,
    stunfisk: 32,
    mienfoo: 65, mienshao: 105,
    druddigon: 48,
    golett: 35, golurk: 55,
    pawniard: 60, bisharp: 70, kingambit: 50,
    bouffalant: 55,
    rufflet: 60, braviary: 80,
    vullaby: 60, mandibuzz: 80,
    heatmor: 65,
    durant: 109,
    deino: 38, zweilous: 58, hydreigon: 98,
    larvesta: 10, volcarona: 100,
    cobalion: 108, terrakion: 108, virizion: 108,
    tornadus: 111, 'tornadus-therian': 121,
    thundurus: 111, 'thundurus-therian': 101,
    landorus: 101, 'landorus-therian': 91,
    reshiram: 90, zekrom: 90,
    kyurem: 95, 'kyurem-black': 95, 'kyurem-white': 95,
    keldeo: 108,
    meloetta: 90,
    genesect: 99,

    // ── Gen 6 ───────────────────────────────────────────────────────────────
    chespin: 38, quilladin: 57, chesnaught: 64,
    fennekin: 60, braixen: 73, delphox: 104,
    froakie: 71, frogadier: 97, greninja: 122, 'greninja-ash': 132,
    bunnelby: 57, diggersby: 78,
    fletchling: 62, fletchinder: 84, talonflame: 126,
    scatterbug: 17, spewpa: 17, vivillon: 89,
    litleo: 72, pyroar: 106,
    flabebe: 42, floette: 52, florges: 75,
    skiddo: 52, gogoat: 68,
    pancham: 43, pangoro: 58,
    furfrou: 102,
    espurr: 75, meowstic: 104,
    honedge: 28, doublade: 35, aegislash: 60,
    spritzee: 23, aromatisse: 29,
    swirlix: 49, slurpuff: 72,
    inkay: 65, malamar: 73,
    binacle: 68, barbaracle: 68,
    skrelp: 30, dragalge: 44,
    clauncher: 50, clawitzer: 59,
    helioptile: 70, heliolisk: 109,
    tyrunt: 48, tyrantrum: 71,
    amaura: 46, aurorus: 58,
    hawlucha: 118,
    dedenne: 101,
    carbink: 50,
    goomy: 40, sliggoo: 60, goodra: 80,
    klefki: 75,
    phantump: 38, trevenant: 56,
    pumpkaboo: 51, gourgeist: 84,
    bergmite: 28, avalugg: 28,
    noibat: 55, noivern: 123,
    xerneas: 99, yveltal: 99, zygarde: 95, 'zygarde-complete': 85,
    diancie: 50,
    hoopa: 70, 'hoopa-unbound': 80,
    volcanion: 70,

    // ── Gen 7 ───────────────────────────────────────────────────────────────
    rowlet: 42, dartrix: 52, decidueye: 70,
    litten: 70, torracat: 90, incineroar: 60,
    popplio: 40, brionne: 50, primarina: 60,
    pikipek: 65, trumbeak: 75, toucannon: 60,
    yungoos: 45, gumshoos: 45,
    grubbin: 45, charjabug: 38, vikavolt: 43,
    crabrawler: 63, crabominable: 43,
    oricorio: 93,
    cutiefly: 84, ribombee: 124,
    rockruff: 60,
    lycanroc: 112, 'lycanroc-midnight': 82, 'lycanroc-dusk': 110,
    wishiwashi: 40,
    mareanie: 50, toxapex: 35,
    mudbray: 45, mudsdale: 35,
    dewpider: 27, araquanid: 42,
    fomantis: 35, lurantis: 45,
    morelull: 15, shiinotic: 30,
    salandit: 75, salazzle: 117,
    stufful: 50, bewear: 60,
    bounsweet: 32, steenee: 62, tsareena: 72,
    comfey: 100,
    oranguru: 60,
    passimian: 80,
    wimpod: 80, golisopod: 40,
    sandygast: 30, palossand: 40,
    pyukumuku: 5,
    'type-null': 59, typenull: 59, silvally: 97,
    minior: 60,
    komala: 65,
    turtonator: 36,
    togedemaru: 96,
    mimikyu: 96,
    bruxish: 92,
    drampa: 46,
    dhelmise: 40,
    'jangmo-o': 45, jangmoo: 45,
    'hakamo-o': 65, hakamoo: 65,
    'kommo-o': 85, kommoo: 85,
    'tapu-koko': 130, tapukoko: 130,
    'tapu-lele': 95, tapulele: 95,
    'tapu-bulu': 75, tapubulu: 75,
    'tapu-fini': 85, tapufini: 85,
    cosmog: 29, cosmoem: 29, solgaleo: 97, lunala: 97,
    nihilego: 103, buzzwole: 79, pheromosa: 151, xurkitree: 83,
    celesteela: 61, kartana: 109, guzzlord: 77,
    necrozma: 79, 'necrozma-dusk-mane': 77, 'necrozma-dawn-wings': 77, 'necrozma-ultra': 129,
    magearna: 65, marshadow: 125,
    poipole: 73, naganadel: 121,
    stakataka: 13, blacephalon: 107,
    zeraora: 143,
    meltan: 30, melmetal: 34,

    // ── Gen 8 (Galar) ───────────────────────────────────────────────────────
    grookey: 65, thwackey: 80, rillaboom: 85,
    scorbunny: 71, raboot: 94, cinderace: 119,
    sobble: 37, drizzile: 82, intelleon: 120,
    skwovet: 25, greedent: 20,
    rookidee: 57, corvisquire: 67, corviknight: 67,
    blipbug: 45, dottler: 30, orbeetle: 90,
    nickit: 83, thievul: 90,
    gossifleur: 41, eldegoss: 86,
    wooloo: 48, dubwool: 48,
    chewtle: 44, drednaw: 74,
    yamper: 55, boltund: 121,
    rolycoly: 30, carkol: 50, coalossal: 30,
    applin: 40, flapple: 70, appletun: 40, dipplin: 56, hydrapple: 52,
    silicobra: 40, sandaconda: 65,
    cramorant: 85,
    arrokuda: 71, barraskewda: 136,
    toxel: 40, toxtricity: 75, 'toxtricity-low-key': 75,
    sizzlipede: 55, centiskorch: 65,
    clobbopus: 50, grapploct: 82,
    sinistea: 30, polteageist: 70,
    hatenna: 26, hattrem: 29, hatterene: 29,
    impidimp: 53, morgrem: 63, grimmsnarl: 60,
    obstagoon: 96,
    perrserker: 78,
    sirfetchd: 52,
    'mr-rime': 70, mrrime: 70,
    runerigus: 43,
    milcery: 14, alcremie: 64,
    falinks: 85,
    pincurchin: 15,
    snom: 20, frosmoth: 65,
    stonjourner: 70,
    eiscue: 50,
    indeedee: 75, 'indeedee-f': 75,
    morpeko: 97,
    cufant: 40, copperajah: 40,
    dracozolt: 75, arctozolt: 45, dracovish: 75, arctovish: 45,
    duraludon: 85, archaludon: 95,
    dreepy: 82, drakloak: 82, dragapult: 142,
    zacian: 138, 'zacian-crowned': 148,
    zamazenta: 128, 'zamazenta-crowned': 128,
    eternatus: 130,
    kubfu: 72, urshifu: 97, 'urshifu-rapid-strike': 97,
    zarude: 105,
    regieleki: 200, regidrago: 80,
    glastrier: 35, spectrier: 130,
    calyrex: 80, 'calyrex-ice': 50, 'calyrex-shadow': 150,
    enamorus: 107, 'enamorus-therian': 117,

    // ── Gen 8 (Hisui) ───────────────────────────────────────────────────────
    kleavor: 85,
    // ursaluna / sneasler / overqwil / basculegion / wyrdeer declarados en Gen 2/5

    // ── Gen 9 (Paldea) ──────────────────────────────────────────────────────
    sprigatito: 65, floragato: 83, meowscarada: 123,
    fuecoco: 36, crocalor: 49, skeledirge: 66,
    quaxly: 45, quaxwell: 57, quaquaval: 85,
    lechonk: 35, oinkologne: 65,
    tarountula: 35, spidops: 50,
    nymble: 55, lokix: 92,
    pawmi: 60, pawmo: 70, pawmot: 105,
    smoliv: 30, dolliv: 33, arboliva: 58,
    squawkabilly: 92,
    nacli: 35, naclstack: 40, garganacl: 35,
    charcadet: 60, armarouge: 75, ceruledge: 75,
    tadbulb: 45, bellibolt: 45,
    wattrel: 70, kilowattrel: 105,
    maschiff: 50, mabosstiff: 73,
    shroodle: 78, grafaiai: 110,
    bramblin: 60, brambleghast: 81,
    toedscool: 80, toedscruel: 110,
    klawf: 75,
    capsakid: 75, scovillain: 75,
    rellor: 25, rabsca: 45,
    flittle: 103, espathra: 142,
    tinkatink: 40, tinkatuff: 55, tinkaton: 75,
    wiglett: 90, wugtrio: 120,
    bombirdier: 82,
    finizen: 73, palafin: 100,
    varoom: 80, revavroom: 105,
    cyclizar: 121,
    orthworm: 40,
    glimmet: 60, glimmora: 73,
    greavard: 33, houndstone: 65,
    flamigo: 82,
    annihilape: 90,
    clodsire: 20,
    // farigiraf / dudunsparce / kingambit declarados en Gen 2/5
    fidough: 55, dachsbun: 75,
    // Paradox Pokémon (pasado)
    'great-tusk': 87,
    'scream-tail': 55,
    'brute-bonnet': 55,
    'flutter-mane': 135,
    'slither-wing': 81,
    'sandy-shocks': 101,
    'roaring-moon': 119,
    // Paradox Pokémon (futuro)
    'iron-treads': 106,
    'iron-hands': 50,
    'iron-jugulis': 104,
    'iron-moth': 110,
    'iron-thorns': 60,
    'iron-valiant': 116,
    'iron-bundle': 136,
    'iron-leaves': 104,
    'iron-boulder': 72,
    'iron-crown': 91,
    // Sublegendarios de las Ruinas (Treasures of Ruin)
    'wo-chien': 45,
    'chien-pao': 135,
    'ting-lu': 45,
    'chi-yu': 100,
    // Paradox DLC
    'walking-wake': 108,
    'gouging-fire': 95,
    'raging-bolt': 75,
    // Legendarios
    koraidon: 105,
    miraidon: 135,
    // DLC Teal Mask / Indigo Disk
    okidogi: 60, munkidori: 130, fezandipiti: 101,
    ogerpon: 110, 'ogerpon-wellspring': 110, 'ogerpon-hearthflame': 110, 'ogerpon-cornerstone': 110,
    terapagos: 60,
    pecharunt: 55,
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // TABLA DE MULTIPLICADORES POR BOOST DE VELOCIDAD
  // Valores exactos según el spec del proyecto
  // ═══════════════════════════════════════════════════════════════════════════
  const BOOST_MULT = {
    '-6': 0.25, '-5': 0.28, '-4': 0.33, '-3': 0.40,
    '-2': 0.50, '-1': 0.66,
     '0': 1.00,
     '1': 1.50,  '2': 2.00,  '3': 2.50,  '4': 3.00,  '5': 3.50,  '6': 4.00,
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ABILITIES QUE MODIFICAN LA VELOCIDAD CON CLIMA (Feature 5)
  // ═══════════════════════════════════════════════════════════════════════════
  const WEATHER_ABILITY_MAP = {
    'chlorophyll':  'sun',
    'swift swim':   'rain',
    'swiftswim':    'rain',
    'sand rush':    'sand',
    'sandrush':     'sand',
    'slush rush':   'snow',
    'slushrush':    'snow',
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURACIÓN PERSISTENTE (Feature 4)
  // Clave localStorage: 'showdown-stv-config'
  // ═══════════════════════════════════════════════════════════════════════════
  const CONFIG_KEY = 'showdown-stv-config';

  function defaultConfig() {
    return { x: 10, y: 120, visible: true, showConditions: true };
  }

  function loadConfig() {
    try {
      const raw = localStorage.getItem(CONFIG_KEY);
      if (raw) return Object.assign(defaultConfig(), JSON.parse(raw));
    } catch (_) {}
    return defaultConfig();
  }

  function saveConfig() {
    try { localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg)); } catch (_) {}
  }

  let cfg = loadConfig();

  // ═══════════════════════════════════════════════════════════════════════════
  // ESTADO DE BATALLA
  // pkmnData usa clave "p1:nombre" / "p2:nombre" para identificar cada
  // Pokémon por lado, ya que puede haber mismas especies en ambos equipos.
  // ═══════════════════════════════════════════════════════════════════════════
  const state = {
    playerName: '',
    opponentName: '',
    pkmnData: {},

    // Condiciones de campo (Feature 2)
    weather: null,          // 'sun' | 'rain' | 'sand' | 'snow' | null
    weatherTurns: 0,
    trickRoom: false,
    trickRoomTurns: 0,
    playerTailwind: 0,      // turnos restantes
    opponentTailwind: 0,

    // Hazards
    playerSR: false,   opponentSR: false,
    playerSpikes: 0,   opponentSpikes: 0,
    playerWeb: false,  opponentWeb: false,

    lastLogText: '',
    currentTurn: 0,
  };

  // Devuelve (o crea) la entrada de datos de un Pokémon
  function getPkmnEntry(side, name) {
    const key = side + ':' + normalizeName(name);
    if (!state.pkmnData[key]) {
      state.pkmnData[key] = {
        side,
        name,
        speedBoost: 0,
        status: null,
        ability: null,
        unburden: false,
        speedBoostStacks: 0,
        turnEntered: 0,
      };
    }
    return state.pkmnData[key];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NORMALIZACIÓN DE NOMBRES
  // Convierte "Rotom-Wash", "Mr. Mime", "Farfetch'd" al formato de SPEED_DATA
  // ═══════════════════════════════════════════════════════════════════════════
  function normalizeName(name) {
    return String(name)
      .toLowerCase()
      .replace(/♂/g, '-m').replace(/♀/g, '-f')
      .replace(/['.:\s]+/g, '-')
      .replace(/[^a-z0-9\-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function getBaseSpeed(name) {
    const key = normalizeName(name);
    if (SPEED_DATA[key] !== undefined) return SPEED_DATA[key];
    // Fallback: nombre sin sufijo de forma ("ninetales-alola" → "ninetales")
    const base = key.split('-')[0];
    return SPEED_DATA[base] !== undefined ? SPEED_DATA[base] : null;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CÁLCULO DE VELOCIDAD EFECTIVA (Feature 1)
  // Fórmula: base × boost × tailwind × weather × status
  // ═══════════════════════════════════════════════════════════════════════════
  function calcEffectiveSpeed(entry) {
    const base = getBaseSpeed(entry.name);
    if (base === null) return { speed: null, unknown: false };

    // Boost total (incluye Speed Boost stacks acumulados)
    const totalBoost = Math.max(-6, Math.min(6,
      (entry.speedBoost || 0) + (entry.speedBoostStacks || 0)
    ));
    const boostMult = BOOST_MULT[String(totalBoost)] || 1.0;

    // Tailwind (×2 si activo en el lado correspondiente)
    const tw = entry.side === 'p1' ? state.playerTailwind : state.opponentTailwind;
    const tailwindMult = tw > 0 ? 2 : 1;

    // Clima + ability (Feature 5)
    let weatherMult = 1;
    let unknown = false;

    if (entry.ability) {
      const abilityKey = entry.ability.toLowerCase().trim();
      const abilityKeyNoSpace = abilityKey.replace(/\s/g, '');
      const reqWeather = WEATHER_ABILITY_MAP[abilityKey] || WEATHER_ABILITY_MAP[abilityKeyNoSpace];
      if (reqWeather && state.weather === reqWeather) weatherMult = 2;

      if ((abilityKey === 'quick feet' || abilityKey === 'quickfeet') && entry.status) {
        weatherMult *= 1.5;
      }
      // Slow Start: ×0.5 durante los primeros 5 turnos desde que entró en combate
      if ((abilityKey === 'slow start' || abilityKey === 'slowstart')
          && (state.currentTurn - entry.turnEntered) < 5) {
        weatherMult *= 0.5;
      }
      if (abilityKey === 'unburden' && entry.unburden) {
        weatherMult *= 2;
      }
    } else if (state.weather) {
      // Ability desconocida y hay clima activo: marcar como incierto
      unknown = true;
    }

    // Parálisis: ×0.5
    const statusMult = entry.status === 'par' ? 0.5 : 1;

    const speed = Math.floor(base * boostMult * tailwindMult * weatherMult * statusMult);
    return { speed, unknown };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PARSEO DEL LOG DE BATALLA (Features 1, 2, 3, 5)
  // Se re-parsea el log completo en cada actualización para garantizar
  // consistencia. El debounce de 100ms evita procesamiento excesivo.
  // ═══════════════════════════════════════════════════════════════════════════

  // Determina lado y nombre desde el inicio de una línea del log.
  // "The opposing Pikachu's Speed rose!" → { side: 'p2', name: 'Pikachu' }
  // "Pikachu's Speed rose!" → { side: 'p1', name: 'Pikachu' }
  function parseSideAndName(text) {
    const oppMatch = text.match(/^the opposing ([^']+)/i);
    if (oppMatch) return { side: 'p2', name: oppMatch[1].trim() };
    const ownMatch = text.match(/^([^']+)/i);
    if (ownMatch) return { side: 'p1', name: ownMatch[1].trim() };
    return null;
  }

  function parseFullLog(logText) {
    if (logText === state.lastLogText) return;
    state.lastLogText = logText;

    // Reset completo para re-parsear desde cero
    state.weather = null; state.weatherTurns = 0;
    state.trickRoom = false; state.trickRoomTurns = 0;
    state.playerTailwind = 0; state.opponentTailwind = 0;
    state.playerSR = false; state.opponentSR = false;
    state.playerSpikes = 0; state.opponentSpikes = 0;
    state.playerWeb = false; state.opponentWeb = false;
    state.pkmnData = {};
    state.currentTurn = 0;

    const lines = logText.split('\n').map(l => l.trim()).filter(Boolean);

    for (const line of lines) {
      const lower = line.toLowerCase();

      // ── Turno: decrementar contadores de condiciones ────────────────────
      const turnMatch = line.match(/^turn (\d+)/i);
      if (turnMatch) {
        state.currentTurn = parseInt(turnMatch[1], 10);
        if (state.weatherTurns > 0 && --state.weatherTurns === 0) state.weather = null;
        if (state.trickRoomTurns > 0) {
          if (--state.trickRoomTurns === 0) state.trickRoom = false;
        }
        if (state.playerTailwind > 0) state.playerTailwind--;
        if (state.opponentTailwind > 0) state.opponentTailwind--;
        continue;
      }

      // ── Entrada de Pokémon ──────────────────────────────────────────────
      const sentOutMatch = line.match(/sent out (.+?)(?:\s*\(.*?\))?\s*!/i);
      if (sentOutMatch) {
        const side = /^the opposing/i.test(line) ? 'p2' : 'p1';
        getPkmnEntry(side, sentOutMatch[1].trim()).turnEntered = state.currentTurn;
        continue;
      }
      const goMatch = line.match(/^go!\s+(.+?)!$/i);
      if (goMatch) {
        getPkmnEntry('p1', goMatch[1].trim()).turnEntered = state.currentTurn;
        continue;
      }

      // ── Faint ──────────────────────────────────────────────────────────
      if (/fainted/i.test(line)) {
        const raw = line.replace(/\s*fainted!?/i, '').replace(/^the opposing\s+/i, '');
        const sn = parseSideAndName(line.replace(/\s*fainted!?$/i, ''));
        if (sn) delete state.pkmnData[sn.side + ':' + normalizeName(sn.name)];
      }

      // ── Boosts de velocidad ─────────────────────────────────────────────
      if (/speed/i.test(line)) {
        let boost = 0;
        if (/speed rose drastically/i.test(line))   boost = +3;
        else if (/speed rose sharply/i.test(line))  boost = +2;
        else if (/speed rose/i.test(line))          boost = +1;
        else if (/speed severely fell/i.test(line)) boost = -3;
        else if (/speed harshly fell/i.test(line) || /speed fell sharply/i.test(line)) boost = -2;
        else if (/speed fell/i.test(line))          boost = -1;

        if (boost !== 0) {
          const sn = parseSideAndName(line);
          if (sn) {
            const e = getPkmnEntry(sn.side, sn.name);
            e.speedBoost = Math.max(-6, Math.min(6, e.speedBoost + boost));
          }
        }

        // Speed Boost ability: acumular stack por turno
        if (/speed boost/i.test(line) && /raised its speed/i.test(line)) {
          const sn = parseSideAndName(line);
          if (sn) {
            const e = getPkmnEntry(sn.side, sn.name);
            e.ability = 'Speed Boost';
            e.speedBoostStacks = Math.min(6 - e.speedBoost, (e.speedBoostStacks || 0) + 1);
          }
        }
      }

      // ── Status ─────────────────────────────────────────────────────────
      if (/was paralyzed/i.test(line)) {
        const sn = parseSideAndName(line); if (sn) getPkmnEntry(sn.side, sn.name).status = 'par';
      }
      if (/was burned/i.test(line)) {
        const sn = parseSideAndName(line); if (sn) getPkmnEntry(sn.side, sn.name).status = 'brn';
      }
      if (/was poisoned|badly poisoned/i.test(line)) {
        const sn = parseSideAndName(line); if (sn) getPkmnEntry(sn.side, sn.name).status = 'psn';
      }
      if (/fell asleep|is fast asleep/i.test(line)) {
        const sn = parseSideAndName(line); if (sn) getPkmnEntry(sn.side, sn.name).status = 'slp';
      }
      if (/was frozen solid/i.test(line)) {
        const sn = parseSideAndName(line); if (sn) getPkmnEntry(sn.side, sn.name).status = 'frz';
      }
      if (/no longer|shook it off|was cured|healed its|status cleared/i.test(line)) {
        const sn = parseSideAndName(line); if (sn) getPkmnEntry(sn.side, sn.name).status = null;
      }

      // ── Clima ──────────────────────────────────────────────────────────
      if (/sunlight turned harsh|extremely harsh sunlight|the sun is intense/i.test(lower)) {
        state.weather = 'sun';  state.weatherTurns = 5;
      } else if (/started to rain/i.test(lower)) {
        state.weather = 'rain'; state.weatherTurns = 5;
      } else if (/sandstorm kicked up/i.test(lower)) {
        state.weather = 'sand'; state.weatherTurns = 5;
      } else if (/started to snow|started to hail|blizzard is raging/i.test(lower)) {
        state.weather = 'snow'; state.weatherTurns = 5;
      } else if (/sunlight faded|the harsh sunlight/i.test(lower)) {
        state.weather = null; state.weatherTurns = 0;
      } else if (/rain (stopped|ceased)/i.test(lower)) {
        state.weather = null; state.weatherTurns = 0;
      } else if (/sandstorm (subsided|ceased)/i.test(lower)) {
        state.weather = null; state.weatherTurns = 0;
      } else if (/snow (stopped|ceased)|hail stopped/i.test(lower)) {
        state.weather = null; state.weatherTurns = 0;
      }

      // ── Trick Room ─────────────────────────────────────────────────────
      // Inicio real: "[Pokémon] twisted the dimensions!"
      // Fin real:    "The twisted dimensions returned to normal!"
      if (/twisted the dimensions/i.test(lower)) {
        state.trickRoom = true; state.trickRoomTurns = 5;
      } else if (/twisted dimensions returned to normal/i.test(lower)) {
        state.trickRoom = false; state.trickRoomTurns = 0;
      }

      // ── Tailwind ───────────────────────────────────────────────────────
      // Inicio real: "The tailwind blew from behind your/the opposing team!"
      // Fin real:    "...tailwind petered out!"
      // El lado se determina por la presencia de "opposing"/"foe" en la línea.
      if (/tailwind blew from behind/i.test(lower)) {
        if (/opposing|foe/i.test(lower)) state.opponentTailwind = 4;
        else state.playerTailwind = 4;
      }
      if (/tailwind petered out/i.test(lower)) {
        if (/opposing|foe/i.test(lower)) state.opponentTailwind = 0;
        else state.playerTailwind = 0;
      }

      // ── Hazards ────────────────────────────────────────────────────────
      // "Pointed stones float in the air around your/the opposing team!"
      if (/pointed stones? float/i.test(lower)) {
        if (/opposing|foe/i.test(lower)) state.opponentSR = true; else state.playerSR = true;
      }
      if (/pointed stones? disappeared/i.test(lower)) {
        if (/opposing|foe/i.test(lower)) state.opponentSR = false; else state.playerSR = false;
      }
      // "Spikes were scattered all around the feet of your/the opposing team!"
      // (excluye "Toxic Spikes" / "Poison spikes", que no afectan velocidad)
      if (/spikes were scattered/i.test(lower) && !/toxic|poison/i.test(lower)) {
        if (/opposing|foe/i.test(lower)) state.opponentSpikes = Math.min(3, state.opponentSpikes + 1);
        else state.playerSpikes = Math.min(3, state.playerSpikes + 1);
      }
      if (/the spikes disappeared/i.test(lower) && !/toxic|poison/i.test(lower)) {
        if (/opposing|foe/i.test(lower)) state.opponentSpikes = 0; else state.playerSpikes = 0;
      }
      // "A sticky web has been laid out beneath your/the opposing team's feet!"
      if (/sticky web/i.test(lower) && !/disappeared/i.test(lower)) {
        if (/opposing|foe/i.test(lower)) state.opponentWeb = true; else state.playerWeb = true;
      }
      if (/sticky web.*disappeared/i.test(lower)) {
        if (/opposing|foe/i.test(lower)) state.opponentWeb = false; else state.playerWeb = false;
      }

      // ── Feature 5: Detección de abilities de velocidad ─────────────────
      const abilityDetectRx = /(chlorophyll|swift swim|sand rush|slush rush|unburden|slow start|quick feet)/i;
      if (abilityDetectRx.test(line)) {
        const am = line.match(abilityDetectRx);
        if (am) {
          const sn = parseSideAndName(line);
          if (sn) getPkmnEntry(sn.side, sn.name).ability = am[1].toLowerCase();
        }
      }

      // Unburden: item consumido
      if (/became unencumbered|consumed its|ate its|used its.*berry/i.test(lower)) {
        const sn = parseSideAndName(line);
        if (sn) {
          const e = getPkmnEntry(sn.side, sn.name);
          if (e.ability && e.ability.includes('unburden')) e.unburden = true;
        }
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LECTURA DE POKÉMON ACTIVOS DESDE EL DOM DE SHOWDOWN
  // ═══════════════════════════════════════════════════════════════════════════
  function readActiveFromDOM() {
    const lbar = document.querySelector('.statbar.lstatbar');
    const rbar = document.querySelector('.statbar.rstatbar');

    if (lbar) {
      const nameEl = lbar.querySelector('strong');
      if (nameEl) {
        state.playerName = nameEl.textContent.trim();
        const e = getPkmnEntry('p1', state.playerName);
        const statusEl = lbar.querySelector('.status');
        if (statusEl && statusEl.textContent.trim()) {
          e.status = statusEl.textContent.trim().toLowerCase().slice(0, 3);
        }
      }
    }

    if (rbar) {
      const nameEl = rbar.querySelector('strong');
      if (nameEl) {
        state.opponentName = nameEl.textContent.trim();
        const e = getPkmnEntry('p2', state.opponentName);
        const statusEl = rbar.querySelector('.status');
        if (statusEl && statusEl.textContent.trim()) {
          e.status = statusEl.textContent.trim().toLowerCase().slice(0, 3);
        }
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PARSEO COMPLETO DEL ESTADO DE BATALLA
  // ═══════════════════════════════════════════════════════════════════════════
  function parseBattleState() {
    const logEl = document.querySelector('.battle-log');
    if (logEl) parseFullLog(logEl.textContent || '');
    readActiveFromDOM();
    console.log('[SpeedTierViewer] turno', state.currentTurn,
      '| jugador:', state.playerName, '| rival:', state.opponentName,
      '| clima:', state.weather, '| TR:', state.trickRoom,
      '| TW p1:', state.playerTailwind, '| TW p2:', state.opponentTailwind);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDERIZADO DEL OVERLAY
  // ═══════════════════════════════════════════════════════════════════════════
  let overlayEl = null;

  function createOverlay() {
    const div = document.createElement('div');
    div.id = 'stv-overlay';
    Object.assign(div.style, {
      position: 'fixed',
      top: cfg.y + 'px',
      left: cfg.x + 'px',
      zIndex: '100000',
      background: 'rgba(15, 15, 25, 0.92)',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: '8px',
      color: '#e8e8f0',
      fontFamily: '"Segoe UI", Arial, sans-serif',
      fontSize: '13px',
      minWidth: '195px',
      maxWidth: '260px',
      userSelect: 'none',
      boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
      display: cfg.visible ? 'block' : 'none',
    });
    div.innerHTML = buildOverlayHTML();
    document.body.appendChild(div);
    makeDraggable(div);
    return div;
  }

  function buildOverlayHTML() {
    // Badges de condición activa en el título
    const trBadge = state.trickRoom
      ? `<span style="background:#c05cff;color:#fff;border-radius:4px;padding:0 5px;font-size:10px;margin-left:4px;">TR</span>` : '';
    const twBadge = (state.playerTailwind > 0 || state.opponentTailwind > 0)
      ? `<span style="background:#3a8fff;color:#fff;border-radius:4px;padding:0 5px;font-size:10px;margin-left:4px;">TW</span>` : '';

    let html = `
      <div id="stv-header" style="display:flex;align-items:center;justify-content:space-between;
           padding:7px 10px 6px;border-bottom:1px solid rgba(255,255,255,0.08);cursor:grab;">
        <span style="font-weight:700;font-size:12px;letter-spacing:.5px;color:#9de;">
          ⚡ Speed Order${trBadge}${twBadge}
        </span>
        <button id="stv-toggle" style="background:none;border:none;color:#888;cursor:pointer;
                font-size:16px;line-height:1;padding:0 2px;margin-left:6px;" title="Ocultar">×</button>
      </div>
      <div id="stv-body" style="padding:4px 0 2px;">
    `;

    // Lista de velocidades (Features 1 y 3)
    html += renderSpeedList(buildSpeedList());

    // Condiciones de campo (Feature 2)
    if (cfg.showConditions) html += renderConditions();

    html += `</div>`;
    return html;
  }

  // Construye el array ordenado de Pokémon activos con sus velocidades
  function buildSpeedList() {
    const entries = [];

    if (state.playerName) {
      const e = getPkmnEntry('p1', state.playerName);
      const { speed, unknown } = calcEffectiveSpeed(e);
      entries.push({ name: state.playerName, side: 'p1', speed, unknown, entry: e });
    }
    if (state.opponentName) {
      const e = getPkmnEntry('p2', state.opponentName);
      const { speed, unknown } = calcEffectiveSpeed(e);
      entries.push({ name: state.opponentName, side: 'p2', speed, unknown, entry: e });
    }

    // Ordenar: mayor primero (Trick Room invierte → menor primero)
    entries.sort((a, b) => {
      const sa = a.speed ?? -1, sb = b.speed ?? -1;
      return state.trickRoom ? sa - sb : sb - sa;
    });

    return entries;
  }

  // Feature 3: Renderiza la lista con indicadores de speed tie en amarillo
  function renderSpeedList(entries) {
    if (entries.length === 0) {
      return `<div style="padding:6px 12px;color:#555;font-style:italic;font-size:12px;">Sin batalla activa</div>`;
    }

    let html = '';
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      const next = entries[i + 1];
      const nameColor = e.side === 'p1' ? '#5bc8ff' : '#ff7878';

      // Icono de modificador (+/-) según boost total y parálisis
      const totalBoost = (e.entry.speedBoost || 0) + (e.entry.speedBoostStacks || 0);
      let modIcon = '';
      if (totalBoost > 0) modIcon = `<span style="color:#6f6;font-size:11px;margin-left:1px;">+</span>`;
      else if (totalBoost < 0 || e.entry.status === 'par')
        modIcon = `<span style="color:#f66;font-size:11px;margin-left:1px;">−</span>`;

      // Indicador TR (flecha para el más lento = más rápido en TR)
      const trMark = state.trickRoom ? `<span style="color:#c05cff;font-size:10px;margin-right:3px;">◀</span>` : '';

      // Velocidad (con "?" si ability desconocida puede cambiarla)
      const speedStr = e.speed === null
        ? `<span style="color:#555;">?</span>`
        : `<span style="color:#bbb;">${e.speed}${e.unknown ? '<span style="color:#e6b800;">?</span>' : ''}</span>`;

      html += `
        <div style="display:flex;align-items:center;justify-content:space-between;
                    padding:4px 12px;line-height:1.3;">
          <span style="display:flex;align-items:center;gap:2px;">
            ${trMark}<span style="color:${nameColor};font-weight:500;">${e.name}</span>${modIcon}
          </span>
          ${speedStr}
        </div>`;

      // Feature 3: Speed Tie → separador amarillo entre los dos
      if (next && e.speed !== null && next.speed !== null && e.speed === next.speed) {
        html += `
          <div style="text-align:center;font-size:10px;color:#e6b800;padding:1px 0 2px;
                      border-top:1px dashed rgba(230,184,0,0.25);border-bottom:1px dashed rgba(230,184,0,0.25);">
            ⚡ speed tie ⚡
          </div>`;
      }
    }
    return html;
  }

  // Feature 2: Panel de condiciones de campo
  function renderConditions() {
    const WEATHER_ICON = { sun: '☀️', rain: '🌧️', sand: '🏜️', snow: '❄️' };
    const rows = [];

    if (state.weather)
      rows.push(`${WEATHER_ICON[state.weather]} ${capitalize(state.weather)} <span style="color:#666;">(${state.weatherTurns}t)</span>`);
    if (state.trickRoom)
      rows.push(`🔮 Trick Room <span style="color:#666;">(${state.trickRoomTurns}t)</span>`);
    if (state.playerTailwind > 0)
      rows.push(`💨 Tailwind <span style="color:#5bc8ff;">(${state.playerTailwind}t)</span>`);
    if (state.opponentTailwind > 0)
      rows.push(`💨 Foe TW <span style="color:#ff7878;">(${state.opponentTailwind}t)</span>`);
    if (state.playerSR)
      rows.push(`🪨 Stealth Rock <span style="color:#5bc8ff;">✓</span>`);
    if (state.opponentSR)
      rows.push(`🪨 Foe SR <span style="color:#ff7878;">✓</span>`);
    if (state.playerSpikes > 0)
      rows.push(`📌 Spikes <span style="color:#5bc8ff;">${'▪'.repeat(state.playerSpikes)}</span>`);
    if (state.opponentSpikes > 0)
      rows.push(`📌 Foe Spikes <span style="color:#ff7878;">${'▪'.repeat(state.opponentSpikes)}</span>`);
    if (state.playerWeb)
      rows.push(`🕸️ Sticky Web <span style="color:#5bc8ff;">✓</span>`);
    if (state.opponentWeb)
      rows.push(`🕸️ Foe Web <span style="color:#ff7878;">✓</span>`);

    if (rows.length === 0) return '';

    const showHideBtn = `<span id="stv-cond-toggle" style="cursor:pointer;color:#555;font-size:10px;"
      title="Ocultar condiciones">▲</span>`;

    let html = `
      <div style="border-top:1px solid rgba(255,255,255,0.07);margin-top:3px;padding:4px 12px 6px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">
          <span style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#555;">Field</span>
          ${showHideBtn}
        </div>`;
    for (const r of rows)
      html += `<div style="font-size:11px;line-height:1.7;">${r}</div>`;
    html += `</div>`;
    return html;
  }

  function capitalize(s) { return s ? s[0].toUpperCase() + s.slice(1) : ''; }

  // Actualiza el contenido HTML del overlay y reattacha eventos
  function renderOverlay() {
    if (!overlayEl) return;
    overlayEl.innerHTML = buildOverlayHTML();
    attachOverlayEvents();
  }

  // Eventos de los botones del overlay (se llama tras cada render)
  function attachOverlayEvents() {
    const toggleBtn = overlayEl.querySelector('#stv-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        cfg.visible = false;
        overlayEl.style.display = 'none';
        saveConfig();
        showMiniButton();
      });
    }
    const condToggle = overlayEl.querySelector('#stv-cond-toggle');
    if (condToggle) {
      condToggle.addEventListener('click', () => {
        cfg.showConditions = !cfg.showConditions;
        saveConfig();
        renderOverlay();
      });
    }
  }

  // Botón flotante para restaurar el panel cuando está minimizado
  let miniBtn = null;
  function showMiniButton() {
    if (miniBtn) return;
    miniBtn = document.createElement('button');
    miniBtn.textContent = '⚡';
    miniBtn.title = 'Mostrar Speed Tier Viewer';
    Object.assign(miniBtn.style, {
      position: 'fixed',
      top: '10px', left: '10px',
      zIndex: '100001',
      background: 'rgba(15,15,25,0.9)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '50%',
      width: '30px', height: '30px',
      cursor: 'pointer',
      fontSize: '15px',
      color: '#9de',
    });
    miniBtn.addEventListener('click', () => {
      cfg.visible = true;
      overlayEl.style.display = 'block';
      saveConfig();
      miniBtn.remove();
      miniBtn = null;
    });
    document.body.appendChild(miniBtn);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DRAGGABLE — Feature 4: guarda posición x/y en localStorage
  // ═══════════════════════════════════════════════════════════════════════════
  function makeDraggable(el) {
    let dragging = false, ox = 0, oy = 0;

    el.addEventListener('mousedown', (e) => {
      // No iniciar drag desde botones
      if (['stv-toggle', 'stv-cond-toggle'].includes(e.target.id)) return;
      dragging = true;
      ox = e.clientX - el.offsetLeft;
      oy = e.clientY - el.offsetTop;
      el.style.cursor = 'grabbing';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const nx = Math.max(0, Math.min(window.innerWidth - el.offsetWidth, e.clientX - ox));
      const ny = Math.max(0, Math.min(window.innerHeight - el.offsetHeight, e.clientY - oy));
      el.style.left = nx + 'px';
      el.style.top  = ny + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      el.style.cursor = '';
      cfg.x = parseInt(el.style.left, 10);
      cfg.y = parseInt(el.style.top, 10);
      saveConfig();
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CICLO DE ACTUALIZACIÓN — debounce de 100ms para no bloquear el hilo
  // ═══════════════════════════════════════════════════════════════════════════
  let debounceTimer = null;

  function update() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      parseBattleState();
      if (!overlayEl) {
        overlayEl = createOverlay();
        attachOverlayEvents();
      } else {
        renderOverlay();
      }
    }, 100);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INICIALIZACIÓN — espera a que exista una batalla en el DOM
  // ═══════════════════════════════════════════════════════════════════════════
  function init() {
    const waitForBattle = setInterval(() => {
      if (!document.querySelector('.battle-log, .battle')) return;
      clearInterval(waitForBattle);
      console.log('[SpeedTierViewer] Batalla detectada, iniciando MutationObserver.');
      update();

      // Observar cambios en todo el body con debounce de 100ms
      const observer = new MutationObserver(() => update());
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }, 500);
  }

  init();
  console.log('[SpeedTierViewer] v1.0.0 loaded');

})();
