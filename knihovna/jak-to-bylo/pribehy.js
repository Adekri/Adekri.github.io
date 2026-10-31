/*
 * ================================================================
 *  POHÁDKY PRO HRU „Jak to bylo dál?“
 * ================================================================
 *
 *  Každá pohádka je řada okének VE SPRÁVNÉM POŘADÍ, hra je sama zamíchá.
 *  Každé okénko má ukazovat jednu jasnou událost, aby šlo poznat, co
 *  bylo dřív a co potom — nestačí, že jsou v něm postavy z pohádky.
 *
 *  Okénko:
 *    text     – věta, která se ukáže po správném seřazení
 *    pozadi   – 'den', 'les', 'vecer' nebo 'pokoj'
 *    navic    – (nepovinné) vlastní SVG tvary za postavami,
 *               souřadnice 0–400 × 0–300
 *    veci     – co je v okénku nakreslené:
 *        e – emoji, nebo jméno vlastní kresby z knihovna/obrazky/
 *        x – vodorovná poloha středu v procentech
 *        y – kde věc stojí (spodní okraj) v procentech výšky
 *        s – velikost v procentech šířky okénka
 *        r – (nepovinné) otočení ve stupních
 *        z – (nepovinné) ruční pořadí, vyšší = víc vpředu
 *        svg – místo obrázku vlastní SVG tvar (s pořadím z)
 */

const CARA = 'stroke="#000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"';

const STROMY = [
    { e: '🌲', x: 9, y: 60, s: 26 },
    { e: '🌳', x: 30, y: 56, s: 20 },
    { e: '🌳', x: 72, y: 56, s: 20 },
    { e: '🌲', x: 91, y: 60, s: 26 }
];

// Čárkovaná cestička: odkud kam postava šla
const cesticka = d => `<path d="${d}" fill="none" stroke="#7A4E2A" stroke-width="4" stroke-dasharray="3 12" stroke-linecap="round"/>`;

// Bublina s ocáskem směřujícím k tomu, kdo mluví
const bublina = (x, y, w, h, ocasX, ocasY) => `<path fill="#FFFFFF" ${CARA} d="
    M${x + 14},${y} H${x + w - 14} Q${x + w},${y} ${x + w},${y + 14} V${y + h - 14} Q${x + w},${y + h} ${x + w - 14},${y + h}
    H${x + w * 0.5 + 12} L${ocasX},${ocasY} L${x + w * 0.5 - 12},${y + h}
    H${x + 14} Q${x},${y + h} ${x},${y + h - 14} V${y + 14} Q${x},${y} ${x + 14},${y} Z"/>`;

const OKNO = `<rect x="150" y="34" width="84" height="84" fill="#d6e6e8" ${CARA}/>
    <path d="M192,34 V118 M150,76 H234" ${CARA}/>`;

const STUL = `<rect x="110" y="212" width="100" height="10" fill="#A57939" ${CARA}/>
    <path d="M124,222 V272 M196,222 V272" stroke="#000" stroke-width="6" stroke-linecap="round"/>`;

const DROBECKY = [[46, 272], [84, 258], [116, 274], [150, 260], [182, 276]]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#F1B31C" stroke="#000" stroke-width="2"/>`).join('');

// Babiččina postel: vlk leží pod peřinou a má na hlavě její čepec
const POSTEL_ZADEK = `<rect x="44" y="104" width="14" height="150" rx="4" fill="#A57939" ${CARA}/>
    <rect x="276" y="160" width="12" height="94" rx="4" fill="#A57939" ${CARA}/>
    <rect x="50" y="222" width="232" height="16" fill="#D0A46B" ${CARA}/>
    <ellipse cx="112" cy="196" rx="58" ry="24" fill="#FFFFFF" ${CARA}/>`;
const CEPEC = `<path fill="#FFFFFF" ${CARA} d="M66,136 C62,84 178,84 174,136 C150,114 90,114 66,136 Z"/>
    <path fill="none" stroke="#D22F27" stroke-width="4" stroke-linecap="round" d="M76,122 C98,106 142,106 164,122"/>`;
const PERINA = `<path fill="#92D3F5" ${CARA} d="M58,194 C120,178 220,180 282,200 L282,232 L58,232 Z"/>`;

// Kouř z komína perníkové chaloupky: pec ještě hoří
const KOUR = `<path fill="none" stroke="#8A8A8A" stroke-width="7" stroke-linecap="round" d="M106,64 C96,52 118,44 108,30 C102,20 118,14 112,4"/>`;

const LOZE = `<rect x="70" y="232" width="176" height="16" rx="4" fill="#D0A46B" ${CARA}/>
    <path d="M86,248 V272 M230,248 V272" stroke="#000" stroke-width="6" stroke-linecap="round"/>`;

const POHADKY = [
    {
        nazev: 'Červená Karkulka',
        okenka: [
            {
                text: 'Maminka vyprovodila Karkulku ke dveřím a zamávala jí.',
                pozadi: 'den',
                navic: cesticka('M110,272 C170,288 220,282 262,270'),
                veci: [
                    { e: '☀️', x: 86, y: 26, s: 13 },
                    { e: '🏠', x: 24, y: 76, s: 50 },
                    { e: 'maminka', x: 25, y: 92, s: 32 },
                    { e: 'karkulka', x: 76, y: 96, s: 36 }
                ]
            },
            {
                text: 'V lese potkala vlka a prozradila mu, že jde k babičce.',
                pozadi: 'les',
                navic: '',
                veci: [
                    ...STROMY,
                    { e: 'karkulka', x: 26, y: 96, s: 36 },
                    { e: 'vlk', x: 74, y: 96, s: 38 },
                    { z: 200, svg: bublina(44, 12, 156, 88, 104, 134) },
                    { e: '🏡', x: 21, y: 31, s: 17, z: 201 },
                    { e: 'babicka', x: 39, y: 32, s: 19, z: 201 }
                ]
            },
            {
                text: 'Vlk se převlékl za babičku a lehl si do její postele.',
                pozadi: 'pokoj',
                navic: OKNO + POSTEL_ZADEK,
                veci: [
                    { e: '🐺', x: 30, y: 68, s: 30, z: 1 },
                    { z: 2, svg: CEPEC },
                    { z: 3, svg: PERINA },
                    { e: 'karkulka', x: 84, y: 96, s: 34, z: 4 }
                ]
            },
            {
                text: 'Myslivec je zachránil a všichni si pochutnali na bábovce.',
                pozadi: 'pokoj',
                navic: OKNO.replace(/x="150"/, 'x="250"').replace('M192,34 V118 M150,76 H234', 'M292,34 V118 M250,76 H334') + STUL,
                veci: [
                    { e: 'babicka', x: 14, y: 96, s: 32 },
                    { e: '🍰', x: 40, y: 74, s: 15 },
                    { e: 'karkulka', x: 64, y: 96, s: 32 },
                    { e: 'myslivec', x: 86, y: 96, s: 34 }
                ]
            }
        ]
    },
    {
        nazev: 'Perníková chaloupka',
        okenka: [
            {
                text: 'Jeníček a Mařenka šli lesem a sypali drobečky, ale ptáčci je sezobali.',
                pozadi: 'les',
                navic: DROBECKY,
                veci: [
                    ...STROMY,
                    { e: '🐦', x: 13, y: 90, s: 15 },
                    { e: '🐦', x: 40, y: 92, s: 12 },
                    { e: 'jenicek-marenka-smutni', x: 72, y: 96, s: 38 }
                ]
            },
            {
                text: 'V lese našli perníkovou chaloupku a začali z ní mlsat.',
                pozadi: 'vecer',
                veci: [
                    { e: '🌙', x: 12, y: 24, s: 12 },
                    { e: 'chaloupka', x: 68, y: 92, s: 58 },
                    { e: 'marenka-smutna', x: 15, y: 96, s: 30 },
                    { e: 'jenicek-smutny', x: 34, y: 96, s: 30 },
                    { e: 'pernicek', x: 43, y: 62, s: 14 }
                ]
            },
            {
                text: 'Ježibaba chtěla Jeníčka posadit na lopatu a strčit do pece.',
                pozadi: 'pokoj',
                veci: [
                    { e: 'pec', x: 82, y: 92, s: 38 },
                    { e: 'marenka-smutna', x: 11, y: 94, s: 26 },
                    { e: 'lopata', x: 44, y: 110, s: 34, r: 58, z: 50 },
                    { e: 'jenicek-smutny', x: 31, y: 92, s: 28, z: 60 },
                    { e: 'carodejnice', x: 60, y: 90, s: 30, z: 60 }
                ]
            },
            {
                text: 'Ježibaba skončila v peci a děti šťastně doběhly domů k tatínkovi.',
                pozadi: 'den',
                navic: KOUR + cesticka('M86,188 C110,236 140,262 170,276'),
                veci: [
                    { e: 'chaloupka', x: 19, y: 62, s: 34 },
                    { e: '🏡', x: 86, y: 60, s: 26 },
                    { e: '❤️', x: 70, y: 34, s: 10 },
                    { e: 'jenicek-marenka', x: 56, y: 96, s: 32 },
                    { e: 'tatinek', x: 85, y: 96, s: 32 }
                ]
            }
        ]
    },
    {
        nazev: 'Sněhurka',
        okenka: [
            {
                text: 'Sněhurka utekla ze zámku do lesa.',
                pozadi: 'les',
                navic: cesticka('M112,178 C150,214 190,240 226,268'),
                veci: [
                    { e: '🏰', x: 18, y: 62, s: 38 },
                    { e: '🌲', x: 62, y: 58, s: 22 },
                    { e: '🌳', x: 78, y: 56, s: 20 },
                    { e: '🌲', x: 92, y: 60, s: 26 },
                    { e: 'snehurka', x: 70, y: 96, s: 38 }
                ]
            },
            {
                text: 'V lese našla chaloupku sedmi trpaslíků a zůstala u nich.',
                pozadi: 'den',
                veci: [
                    { e: '🏡', x: 84, y: 58, s: 24 },
                    { e: 'snehurka', x: 16, y: 96, s: 36 },
                    { e: 'trpaslik-1', x: 38, y: 78, s: 17 },
                    { e: 'trpaslik-3', x: 52, y: 78, s: 17 },
                    { e: 'trpaslik-5', x: 66, y: 78, s: 17 },
                    { e: 'trpaslik-7', x: 80, y: 78, s: 17 },
                    { e: 'trpaslik-2', x: 45, y: 96, s: 17 },
                    { e: 'trpaslik-4', x: 59, y: 96, s: 17 },
                    { e: 'trpaslik-6', x: 73, y: 96, s: 17 }
                ]
            },
            {
                text: 'Zlá královna převlečená za stařenku jí dala otrávené jablko.',
                pozadi: 'les',
                veci: [...STROMY, { e: 'snehurka', x: 24, y: 96, s: 38 }, { e: '🍎', x: 47, y: 72, s: 16 }, { e: 'carodejnice', x: 72, y: 96, s: 38 }]
            },
            {
                text: 'Sněhurka usnula a princ ji probudil.',
                pozadi: 'pokoj',
                navic: OKNO.replace(/x="150"/, 'x="30"').replace('M192,34 V118 M150,76 H234', 'M72,34 V118 M30,76 H114') + LOZE,
                veci: [
                    { e: 'trpaslici', x: 40, y: 58, s: 24, z: 1 },
                    { e: 'snehurka', x: 38, y: 92, s: 40, r: -90, z: 2 },
                    { e: '❤️', x: 62, y: 42, s: 12, z: 3 },
                    { e: 'princ', x: 82, y: 96, s: 38, z: 4 }
                ]
            }
        ]
    }
];
