/*
 * ================================================================
 *  KUFRY POHÁDKOVÝCH POSTAV
 * ================================================================
 *
 *  Každý kufr patří jedné postavě. Věci se vytahují postupně
 *  v pořadí, jak jsou zapsané — od nejtěžší nápovědy po nejlehčí.
 *
 *    majitel – jméno postavy (objeví se na visačce)
 *    foto    – jméno vlastního obrázku ve složce knihovna/obrazky-postav/
 *              (bez přípony; .png, .jpg i .webp fungují). Když soubor
 *              chybí, použije se kreslená ikonka z „obr“.
 *    obr     – kreslená ikonka postavy (emoji), nebo víc ikonek v [ ];
 *              když chybí i ta, ukáže se jen jméno
 *    veci    – [obrázek, popisek] pro každou věc (3–5 věcí); obrázek je
 *              emoji, nebo jméno vlastní kresby z knihovna/obrazky/
 *              (např. 'kape' = červená kápě);
 *              volitelně i třetí položka = vlastní obrázek věci, např.
 *              ['📞', 'kouzelné sluchátko', 'sluchatko']
 *    veta    – krátká věta, která se ukáže po odhalení
 */

const KUFRY = [
    {
        majitel: 'Popelka', foto: 'popelka', obr: '👸',
        veci: [['🧹', 'koště'], ['🏹', 'kuše'], ['👗', 'plesové šaty'], ['👠', 'ztracený střevíček'], ['🌰', 'tři oříšky']],
        veta: 'Tři oříšky pro Popelku! V každém byly kouzelné šaty.'
    },
    {
        majitel: 'Červená Karkulka', foto: 'karkulka', obr: '👧',
        veci: [['💐', 'kytička pro babičku'], ['🍰', 'bábovka'], ['🧺', 'košíček'], ['kape', 'červený čepeček']],
        veta: 'Karkulka nesla nemocné babičce košíček s bábovkou.'
    },
    {
        majitel: 'Jeníček a Mařenka', foto: 'jenicek-a-marenka', obr: 'jenicek-marenka',
        veci: [['🍞', 'chleba na drobečky'], ['🍬', 'bonbon'], ['pernicek', 'perníček']],
        veta: 'Jeníček a Mařenka našli v lese perníkovou chaloupku.'
    },
    {
        majitel: 'SpongeBob', foto: 'spongebob', obr: '🧽',
        veci: [['🫧', 'bubliny'], ['🐌', 'šnek Gary'], ['🍍', 'ananas'], ['🍔', 'krabí burger']],
        veta: 'SpongeBob bydlí v ananasu na dně moře a peče krabí burgery.'
    },
    {
        majitel: 'Shrek', foto: 'shrek', obr: '🧌',
        veci: [['🧅', 'cibule'], ['🐉', 'dračice'], ['🫏', 'oslík']],
        veta: 'Zlobr Shrek bydlí v bažině a jeho nejlepší kamarád je Oslík.'
    }
    /*,
    {
        majitel: 'Krteček', foto: 'krtek',
        veci: [['🍭', 'lízátko'], ['☂️', 'deštník'], ['🚗', 'autíčko'], ['👖', 'kalhotky s kapsami']],
        veta: 'Krteček si kalhotky s kapsami ušil s pomocí kamarádů.'
    },
    {
        majitel: 'Prasátko Peppa', foto: 'peppa', obr: '🐷',
        veci: [['🧸', 'plyšový medvídek'], ['🦖', 'dinosaurus bratříčka Tomíka'], ['🥾', 'holínky']],
        veta: 'Peppa nejraději skáče v holínkách do blátivých louží.'
    },
    {
        majitel: 'Elsa z Ledového království', foto: 'elsa', obr: '👸',
        veci: [['🧤', 'rukavice'], ['👑', 'korunka'], ['❄️', 'sněhová vločka'], ['⛄', 'sněhulák Olaf']],
        veta: 'Elsa umí vyčarovat led a sníh. Kouzlem oživila i sněhuláka Olafa.'
    },
    {
        majitel: 'Mach a Šebestová', foto: 'mach-a-sebestova', obr: ['👦', '👧'],
        veci: [['🎒', 'aktovka'], ['🐕', 'pes Jonatán'], ['📞', 'kouzelné sluchátko']],
        veta: 'Kouzelné sluchátko splnilo Machovi a Šebestové každé přání.'
    },
    {
        majitel: 'Bob a Bobek', foto: 'bob-a-bobek', obr: ['🐇', '🐇'],
        veci: [['🥕', 'mrkev'], ['🪄', 'kouzelná hůlka'], ['🎩', 'klobouk']],
        veta: 'Bob a Bobek jsou králíci z klobouku kouzelníka Pokustóna.'
    },
    {
        majitel: 'Pat a Mat', foto: 'pat-a-mat', obr: ['🧑‍🔧', '🧑‍🔧'],
        veci: [['🔧', 'klíč na šroubky'], ['🪚', 'pila'], ['🔨', 'kladivo']],
        veta: 'Pat a Mat všechno opraví po svém. A je to!'
    },
    {
        majitel: 'Pejsek a kočička', foto: 'pejsek-a-kocicka', obr: ['🐕', '🐈'],
        veci: [['🪣', 'kbelík na mytí podlahy'], ['🧅', 'cibule'], ['🦴', 'kost'], ['🎂', 'dort']],
        veta: 'Pejsek a kočička upekli dort ze všeho, co měli rádi.'
    },
    {
        majitel: 'Sněhurka', foto: 'snehurka', obr: '👸',
        veci: [['🛏️', 'sedm postýlek'], ['trpaslici', 'sedm trpaslíků'], ['🍎', 'jablko']],
        veta: 'Zlá královna dala Sněhurce otrávené jablko.'
    },
    {
        majitel: 'Tlapková patrola', foto: 'tlapkova-patrola', obr: '🐕',
        veci: [['🦴', 'pamlsek'], ['🚓', 'policejní auto'], ['🚒', 'hasičské auto']],
        veta: 'Na pejsky z Tlapkové patroly je vždycky spolehnutí.'
    }*/

];
