/*
 * ================================================================
 *  SCÉNY PRO HRU „Popletená pohádka“
 * ================================================================
 *
 *  Každá scéna má dva seznamy:
 *    kulisy – prostředí (stromy, slunce, sníh…). Nejde na ně kliknout,
 *             aby děti nemátly — hledá se jen mezi postavami a věcmi.
 *    veci   – postavy a věci z pohádky + věci, které tam NEPATŘÍ.
 *             Sem dávejte jen to, co v pohádce opravdu je.
 *
 *  Každá kulisa / věc:
 *    e – emoji, nebo jméno vlastní kresby z knihovna/obrazky/
 *        (např. 'kape'), nebo 'hromadka' = nakreslená krtčí hromádka
 *    foto – vlastní obrázek ze složky knihovna/obrazky-postav/ (bez přípony);
 *           když soubor chybí, použije se „e“ (a bez něj se věc nezobrazí).
 *           Do scény se nejlépe hodí PNG s průhledným pozadím.
 *    n – název (ukáže se po kliknutí)
 *    x – vodorovná poloha středu v procentech (0 = vlevo, 100 = vpravo)
 *    y – kde věc STOJÍ (spodní okraj) v procentech výšky (0 = nahoře, 100 = dole)
 *        Čím je věc níž, tím víc vpředu (kreslí se přes věci za ní).
 *    s – velikost (cca 5 = drobnost, 13 = postava, 16 = dům)
 *    cizi: true – věc, která do pohádky NEPATŘÍ (tu mají děti najít)
 *    zprava – vlastní věta po nalezení (jinak „… do pohádky nepatří!“)
 *    z – ruční pořadí vrstvy (vyšší = víc vpředu), např. sova na stromě
 *
 *  Rozvržení: pozadí (stromy, domy) stojí těsně pod horizontem, postavy
 *  uprostřed (y ≈ 75–88), drobnosti v trávě vpředu (y ≈ 90–97).
 *  Barvy: nebe → nebe2 nahoře, zeme → zeme2 dole, horizont = kde začíná země.
 */

const SCENY = [
    {
        nazev: 'O Červené Karkulce',
        nebe: '#d6e6e8', nebe2: '#eef2e6', zeme: '#c5d6a2', zeme2: '#a7bf84', horizont: '45%',
        kulisy: [
            { e: '☀️', x: 88, y: 24, s: 8 },
            { e: '🌲', x: 6, y: 50, s: 13 },
            { e: '🌳', x: 17, y: 49, s: 11 },
            { e: '🌲', x: 27, y: 48, s: 9 },
            { e: '🌲', x: 50, y: 47, s: 8 },
            { e: '🌳', x: 60, y: 48, s: 9 }
        ],
        veci: [
            { e: '🏡', n: 'babiččina chaloupka', x: 85, y: 53, s: 14 },
            { e: '👵', n: 'babička', x: 72, y: 58, s: 8 },
            { e: 'kape', n: 'Karkulka', x: 33, y: 84, s: 15 },
            { e: '🧺', n: 'košíček', x: 43, y: 85, s: 6 },
            { e: '🐺', n: 'vlk', x: 62, y: 80, s: 13 },
            { e: '💐', n: 'kytička pro babičku', x: 52, y: 95, s: 6 },
            // nepatří sem
            { e: '🚗', n: 'auto', x: 82, y: 72, s: 10, cizi: true },
            { e: '📱', n: 'mobil', x: 20, y: 96, s: 5, cizi: true }
        ]
    },
    {
        nazev: 'Krteček',
        nebe: '#d8e8ec', nebe2: '#eef3e6', zeme: '#c2d79c', zeme2: '#a3bf80', horizont: '48%',
        kulisy: [
            { e: '☀️', x: 12, y: 24, s: 8 },
            { e: '🌳', x: 7, y: 54, s: 13 },
            { e: '🌳', x: 22, y: 52, s: 9 },
            { e: '🌳', x: 80, y: 53, s: 12 },
            { e: '🌳', x: 93, y: 52, s: 8 }
        ],
        veci: [
            { e: 'hromadka', n: 'krtčí hromádka', x: 44, y: 76, s: 15 },
            { foto: 'krtek', n: 'Krteček', x: 58, y: 78, s: 13 },
            { e: '🐭', foto: 'krtek-mys', n: 'myška', x: 22, y: 83, s: 12 },
            { e: '🐸', foto: 'krtek-zabka', n: 'žabka', x: 34, y: 92, s: 10 },
            { e: '🐰', foto: 'krtek-zajic', n: 'zajíček', x: 74, y: 83, s: 13 },
            { e: '🦔', foto: 'krtek-jezek', n: 'ježek', x: 89, y: 86, s: 11 },
            { e: '☂️', n: 'deštník', x: 8, y: 95, s: 8 },
            { e: '👖', n: 'kalhotky s kapsami', x: 50, y: 96, s: 7 },
            { e: '🍭', n: 'lízátko', x: 64, y: 95, s: 6 },
            { e: '🦈', n: 'žralok', x: 52, y: 60, s: 10, cizi: true },
            { e: '🐧', n: 'tučňák', x: 13, y: 70, s: 8, cizi: true }
        ]
    },
    {
        nazev: 'Sněhurka a sedm trpaslíků',
        nebe: '#cfe0cc', nebe2: '#e6eedb', zeme: '#a9c48f', zeme2: '#8aab76', horizont: '50%',
        kulisy: [
            { e: '🌲', x: 6, y: 56, s: 14 },
            { e: '🌳', x: 19, y: 54, s: 10 },
            { e: '🌳', x: 72, y: 54, s: 10 },
            { e: '🌲', x: 94, y: 56, s: 14 }
        ],
        veci: [
            { e: '🚁', n: 'vrtulník', x: 64, y: 26, s: 9, cizi: true },
            { e: '🏡', n: 'chaloupka trpaslíků', x: 42, y: 58, s: 14 },
            { e: '🧙‍♀️', n: 'zlá královna převlečená za stařenku', x: 84, y: 62, s: 10 },
            { e: 'snehurka', n: 'Sněhurka', x: 20, y: 87, s: 15 },
            { e: '🍎', n: 'jablíčko', x: 30, y: 88, s: 5 },
            // trpaslíci ve dvou řadách, čísla jdou zleva doprava
            { e: 'trpaslik-1', n: 'trpaslík číslo 1', x: 50, y: 78, s: 9 },
            { e: 'trpaslik-2', n: 'trpaslík číslo 2', x: 56, y: 90, s: 9 },
            { e: 'trpaslik-3', n: 'trpaslík číslo 3', x: 62, y: 78, s: 9 },
            { e: 'trpaslik-4', n: 'trpaslík číslo 4', x: 68, y: 90, s: 9 },
            { e: 'trpaslik-5', n: 'trpaslík číslo 5', x: 74, y: 78, s: 9 },
            { e: 'trpaslik-6', n: 'trpaslík číslo 6', x: 80, y: 90, s: 9 },
            { e: 'trpaslik-7', n: 'trpaslík číslo 7', x: 86, y: 78, s: 9 },
            { e: 'trpaslik-8', n: 'trpaslík číslo 8', x: 92, y: 90, s: 9, cizi: true,
              zprava: 'Trpaslík číslo 8 je navíc, v pohádce je jich jen sedm!' }
        ]
    },
    {
        nazev: 'SpongeBob v kalhotách',
        nebe: '#bcdde6', nebe2: '#a6cfdb', zeme: '#eadcae', zeme2: '#dccb92', horizont: '70%',
        kulisy: [
            { e: '🫧', x: 8, y: 32, s: 7 },
            { e: '🫧', x: 56, y: 22, s: 5 },
            { e: '🫧', x: 93, y: 40, s: 5 }
        ],
        veci: [
            { e: '🪼', n: 'medúza', x: 32, y: 34, s: 8 },
            { e: '🪼', n: 'medúza', x: 70, y: 36, s: 6 },
            { e: '🐄', n: 'kráva', x: 84, y: 58, s: 10, cizi: true },
            { e: '🍍', n: 'ananasový domek', x: 16, y: 80, s: 18 },
            { e: '🐿️', n: 'veverka Sandy', x: 31, y: 80, s: 7 },
            { e: 'patrik', n: 'Patrik', x: 58, y: 81, s: 11 },
            { e: '🐙', n: 'Sépiák', x: 90, y: 79, s: 11 },
            { e: '🧽', foto: 'spongebob', n: 'SpongeBob', x: 44, y: 91, s: 12 },
            { e: '🍔', n: 'krabí burger', x: 54, y: 92, s: 5 },
            { e: '🦀', n: 'pan Krabs', x: 71, y: 92, s: 10 },
            { e: '🐌', n: 'šnek Gary', x: 28, y: 97, s: 6 },
            { e: '☃️', n: 'sněhulák', x: 90, y: 97, s: 9, cizi: true }
        ]
    },
    {
        nazev: 'O perníkové chaloupce',
        nebe: '#d9d2e6', nebe2: '#ece6ef', zeme: '#b4c89a', zeme2: '#97b282', horizont: '50%',
        kulisy: [
            { e: '🌙', x: 88, y: 22, s: 7 },
            { e: '🌲', x: 6, y: 56, s: 14 },
            { e: '🌲', x: 18, y: 54, s: 10 },
            { e: '🌲', x: 94, y: 55, s: 12 }
        ],
        veci: [
            { e: '🏠', n: 'perníková chaloupka', x: 57, y: 64, s: 18 },
            { e: 'pernicek', n: 'perníček', x: 42, y: 66, s: 6 },
            { e: '🍭', n: 'lízátko', x: 72, y: 66, s: 6 },
            { e: 'jenicek-marenka', n: 'Jeníček a Mařenka', x: 24, y: 87, s: 16 },
            { e: '🐈‍⬛', n: 'černá kočka', x: 63, y: 88, s: 8 },
            { e: '🧙‍♀️', n: 'ježibaba', x: 78, y: 86, s: 14 },
            { e: '🔥', n: 'oheň v peci', x: 93, y: 91, s: 6 },
            { e: '📺', n: 'televize', x: 40, y: 90, s: 8, cizi: true },
            { e: '🎧', n: 'sluchátka', x: 52, y: 97, s: 5, cizi: true }
        ]
    },
    {
        nazev: 'Tři oříšky pro Popelku',
        nebe: '#dfe9f0', nebe2: '#f3f5f3', zeme: '#fbfaf6', zeme2: '#e6ebee', horizont: '52%',
        kulisy: [
            { e: '❄️', x: 36, y: 22, s: 5 },
            { e: '❄️', x: 74, y: 30, s: 4 },
            { e: '❄️', x: 12, y: 30, s: 4 },
            { e: '🌲', x: 88, y: 61, s: 16 }
        ],
        veci: [
            { e: '✈️', n: 'letadlo', x: 56, y: 26, s: 9, cizi: true },
            { e: '🏰', n: 'zámek', x: 16, y: 58, s: 15 },
            { e: '🦉', n: 'sova Rozárka', x: 90, y: 44, s: 6, z: 99 },
            { e: '🐕', n: 'pejsek', x: 10, y: 87, s: 10 },
            { e: '👠', n: 'ztracený střevíček', x: 22, y: 94, s: 5 },
            { e: '👸', n: 'Popelka', x: 33, y: 85, s: 14 },
            { e: '🌰', n: 'tři oříšky', x: 44, y: 90, s: 5 },
            { e: '🐴', n: 'koník Juráček', x: 59, y: 84, s: 16 },
            { e: '🏹', n: 'kuše', x: 77, y: 90, s: 7 },
            { e: '🛹', n: 'skateboard', x: 92, y: 95, s: 7, cizi: true }
        ]
    }
];
