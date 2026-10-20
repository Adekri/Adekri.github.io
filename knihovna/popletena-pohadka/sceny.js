/*
 * ================================================================
 *  SCÉNY PRO HRU „Popletená pohádka“
 * ================================================================
 *
 *  Každá scéna je obrázek složený z emoji:
 *    e – emoji,  n – název (přečte se po ťuknutí)
 *    x, y – poloha středu v procentech (0 = vlevo/nahoře, 100 = vpravo/dole)
 *    s – velikost (cca 5 = malá věc, 13 = postava, 16 = dům)
 *    cizi: true – věc, která do pohádky NEPATŘÍ (tu mají děti najít)
 *
 *  Barvy: nebe → nebe2 nahoře, zeme → zeme2 dole, horizont = kde začíná země.
 *  Pozdější položky v seznamu se kreslí navrch.
 */

const SCENY = [
    {
        nazev: 'O Červené Karkulce',
        nebe: '#d6e6e8', nebe2: '#eef2e6', zeme: '#c5d6a2', zeme2: '#a7bf84', horizont: '45%',
        veci: [
            { e: '☀️', n: 'sluníčko', x: 90, y: 13, s: 8 },
            { e: '🦋', n: 'motýlek', x: 44, y: 20, s: 5 },
            { e: '🌲', n: 'strom', x: 8, y: 32, s: 13 },
            { e: '🌳', n: 'strom', x: 24, y: 30, s: 11 },
            { e: '🌲', n: 'strom', x: 64, y: 30, s: 10 },
            { e: '🏡', n: 'babiččina chaloupka', x: 83, y: 46, s: 13 },
            { e: '👧', n: 'Karkulka', x: 32, y: 66, s: 13 },
            { e: '🧺', n: 'košíček', x: 43, y: 77, s: 7 },
            { e: '🐺', n: 'vlk', x: 62, y: 63, s: 12 },
            { e: '🍄', n: 'houbička', x: 12, y: 84, s: 6 },
            { e: '🌼', n: 'kytička', x: 52, y: 89, s: 5 },
            { e: '🌷', n: 'tulipán', x: 90, y: 84, s: 5 },
            { e: '🚗', n: 'auto', x: 11, y: 60, s: 10, cizi: true },
            { e: '📱', n: 'mobil', x: 74, y: 84, s: 6, cizi: true }
        ]
    },
    {
        nazev: 'O třech prasátkách',
        nebe: '#dbe7ec', nebe2: '#f1f1e6', zeme: '#e3d6a4', zeme2: '#cbb985', horizont: '50%',
        veci: [
            { e: '☁️', n: 'mráček', x: 20, y: 14, s: 10 },
            { e: '☁️', n: 'mráček', x: 52, y: 10, s: 8 },
            { e: '🛖', n: 'domeček ze slámy', x: 15, y: 44, s: 13 },
            { e: '🏠', n: 'domeček ze dřeva', x: 47, y: 42, s: 13 },
            { e: '🧱', n: 'domeček z cihel', x: 80, y: 46, s: 11 },
            { e: '🌾', n: 'sláma', x: 30, y: 58, s: 6 },
            { e: '🐷', n: 'prasátko', x: 17, y: 72, s: 10 },
            { e: '🐷', n: 'prasátko', x: 41, y: 76, s: 10 },
            { e: '🐷', n: 'prasátko', x: 63, y: 72, s: 10 },
            { e: '🐺', n: 'vlk', x: 88, y: 72, s: 12 },
            { e: '🚀', n: 'raketa', x: 82, y: 15, s: 9, cizi: true },
            { e: '💻', n: 'počítač', x: 53, y: 90, s: 7, cizi: true }
        ]
    },
    {
        nazev: 'Sněhurka a sedm trpaslíků',
        nebe: '#cfe0cc', nebe2: '#e6eedb', zeme: '#a9c48f', zeme2: '#8aab76', horizont: '50%',
        veci: [
            { e: '🐦', n: 'ptáček', x: 22, y: 14, s: 6 },
            { e: '🌲', n: 'strom', x: 7, y: 32, s: 14 },
            { e: '🌳', n: 'strom', x: 36, y: 26, s: 11 },
            { e: '🌲', n: 'strom', x: 93, y: 30, s: 14 },
            { e: '🐿️', n: 'veverka', x: 91, y: 54, s: 6 },
            { e: '🏡', n: 'chaloupka trpaslíků', x: 68, y: 40, s: 14 },
            { e: '🦌', n: 'srnka', x: 13, y: 72, s: 11 },
            { e: '👸', n: 'Sněhurka', x: 36, y: 66, s: 13 },
            { e: '🍎', n: 'jablíčko', x: 47, y: 81, s: 6 },
            { e: '⛏️', n: 'krumpáček trpaslíků', x: 86, y: 76, s: 7 },
            { e: '🚁', n: 'vrtulník', x: 55, y: 12, s: 9, cizi: true },
            { e: '🤖', n: 'robot', x: 62, y: 76, s: 10, cizi: true }
        ]
    },
    {
        nazev: 'O kohoutkovi a slepičce',
        nebe: '#f1e5c4', nebe2: '#f6efdc', zeme: '#cddba6', zeme2: '#b3c78b', horizont: '48%',
        veci: [
            { e: '☀️', n: 'sluníčko', x: 12, y: 14, s: 9 },
            { e: '🏡', n: 'chaloupka', x: 20, y: 40, s: 12 },
            { e: '🌻', n: 'slunečnice', x: 41, y: 43, s: 8 },
            { e: '🐄', n: 'kravička', x: 82, y: 56, s: 14 },
            { e: '🐓', n: 'kohoutek', x: 34, y: 68, s: 13 },
            { e: '🐔', n: 'slepička', x: 57, y: 66, s: 11 },
            { e: '🌽', n: 'zrníčko', x: 22, y: 87, s: 6 },
            { e: '🪣', n: 'vědro na vodu', x: 68, y: 85, s: 7 },
            { e: '🍕', n: 'pizza', x: 46, y: 89, s: 6, cizi: true },
            { e: '🛴', n: 'koloběžka', x: 90, y: 84, s: 9, cizi: true }
        ]
    },
    {
        nazev: 'O perníkové chaloupce',
        nebe: '#d9d2e6', nebe2: '#ece6ef', zeme: '#b4c89a', zeme2: '#97b282', horizont: '50%',
        veci: [
            { e: '🌙', n: 'měsíc', x: 90, y: 12, s: 7 },
            { e: '🌲', n: 'strom', x: 8, y: 30, s: 14 },
            { e: '🌲', n: 'strom', x: 27, y: 28, s: 10 },
            { e: '🏠', n: 'perníková chaloupka', x: 61, y: 40, s: 16 },
            { e: '🍪', n: 'perníček', x: 48, y: 22, s: 6 },
            { e: '🍭', n: 'lízátko', x: 75, y: 22, s: 5 },
            { e: '👫', n: 'Jeníček a Mařenka', x: 24, y: 68, s: 13 },
            { e: '🧙‍♀️', n: 'ježibaba', x: 82, y: 68, s: 13 },
            { e: '🐈‍⬛', n: 'černá kočka', x: 50, y: 80, s: 8 },
            { e: '🔥', n: 'oheň v peci', x: 66, y: 87, s: 6 },
            { e: '📺', n: 'televize', x: 38, y: 42, s: 8, cizi: true },
            { e: '🎧', n: 'sluchátka', x: 92, y: 89, s: 6, cizi: true }
        ]
    },
    {
        nazev: 'Tři oříšky pro Popelku',
        nebe: '#dfe9f0', nebe2: '#f3f5f3', zeme: '#fbfaf6', zeme2: '#e6ebee', horizont: '52%',
        veci: [
            { e: '❄️', n: 'sněhová vločka', x: 38, y: 14, s: 5 },
            { e: '❄️', n: 'sněhová vločka', x: 72, y: 24, s: 4 },
            { e: '🏰', n: 'zámek', x: 16, y: 36, s: 14 },
            { e: '🌲', n: 'strom', x: 88, y: 44, s: 16 },
            { e: '🦉', n: 'sova Rozárka', x: 88, y: 28, s: 7 },
            { e: '🐕', n: 'pejsek', x: 14, y: 78, s: 10 },
            { e: '👸', n: 'Popelka', x: 37, y: 67, s: 13 },
            { e: '🐴', n: 'koník Juráček', x: 62, y: 64, s: 15 },
            { e: '🌰', n: 'tři oříšky', x: 48, y: 85, s: 6 },
            { e: '✈️', n: 'letadlo', x: 58, y: 12, s: 9, cizi: true },
            { e: '🛹', n: 'skateboard', x: 80, y: 86, s: 8, cizi: true }
        ]
    }
];
