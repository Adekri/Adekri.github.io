/*
 * ================================================================
 *  KUFRY POHÁDKOVÝCH POSTAV
 * ================================================================
 *
 *  Každý kufr patří jedné postavě. Věci se vytahují postupně
 *  v pořadí, jak jsou zapsané — od nejtěžší nápovědy po nejlehčí.
 *
 *    majitel – jméno postavy (objeví se na visačce)
 *    obr     – obrázek postavy (emoji), nebo víc obrázků v [ ];
 *              když chybí, ukáže se jen jméno
 *    veci    – [obrázek, popisek] pro každou věc (3–5 věcí)
 *    veta    – krátká věta, která se ukáže po odhalení
 */

const KUFRY = [
    {
        majitel: 'Popelka', obr: '👸',
        veci: [['🧹', 'koště'], ['🏹', 'kuše'], ['👗', 'plesové šaty'], ['👠', 'střevíček'], ['🌰', 'tři oříšky']],
        veta: 'Tři oříšky pro Popelku! V každém byly kouzelné šaty.'
    },
    {
        majitel: 'Červená Karkulka', obr: '👧',
        veci: [['💐', 'kytička pro babičku'], ['🍰', 'bábovka'], ['🧺', 'košíček']],
        veta: 'Karkulka nesla nemocné babičce košíček s bábovkou.'
    },
    {
        majitel: 'Jeníček a Mařenka', obr: '👫',
        veci: [['🪨', 'bílé kamínky'], ['🍞', 'chleba na drobečky'], ['🍬', 'bonbon'], ['🍪', 'perníček']],
        veta: 'Jeníček a Mařenka našli v lese perníkovou chaloupku.'
    },
    {
        majitel: 'Krteček',
        veci: [['🍭', 'lízátko'], ['☂️', 'deštník'], ['🚗', 'autíčko'], ['👖', 'kalhotky s kapsami']],
        veta: 'Krteček si kalhotky s kapsami ušil s pomocí kamarádů.'
    },
    {
        majitel: 'SpongeBob', obr: '🧽',
        veci: [['🫧', 'bubliny'], ['🐌', 'šnek Gary'], ['🍍', 'ananas'], ['🍔', 'krabí burger']],
        veta: 'SpongeBob bydlí v ananasu na dně moře a peče krabí burgery.'
    },
    {
        majitel: 'Prasátko Peppa', obr: '🐷',
        veci: [['🧸', 'plyšový medvídek'], ['🦖', 'dinosaurus bratříčka Tomíka'], ['🥾', 'holínky']],
        veta: 'Peppa nejraději skáče v holínkách do blátivých louží.'
    },
    {
        majitel: 'Elsa z Ledového království', obr: '👸',
        veci: [['🧤', 'rukavice'], ['👑', 'korunka'], ['❄️', 'sněhová vločka'], ['⛄', 'sněhulák Olaf']],
        veta: 'Elsa umí vyčarovat led a sníh. Kouzlem oživila i sněhuláka Olafa.'
    },
    {
        majitel: 'Mach a Šebestová', obr: ['👦', '👧'],
        veci: [['🎒', 'aktovka'], ['🐕', 'pes Jonatán'], ['📞', 'kouzelné sluchátko']],
        veta: 'Kouzelné sluchátko splnilo Machovi a Šebestové každé přání.'
    },
    {
        majitel: 'Bob a Bobek', obr: ['🐇', '🐇'],
        veci: [['🥕', 'mrkev'], ['🪄', 'kouzelná hůlka'], ['🎩', 'klobouk']],
        veta: 'Bob a Bobek jsou králíci z klobouku kouzelníka Pokustóna.'
    },
    {
        majitel: 'Pat a Mat', obr: ['🧑‍🔧', '🧑‍🔧'],
        veci: [['🔧', 'klíč na šroubky'], ['🪚', 'pila'], ['🔨', 'kladivo']],
        veta: 'Pat a Mat všechno opraví po svém. A je to!'
    },
    {
        majitel: 'Pejsek a kočička', obr: ['🐕', '🐈'],
        veci: [['🪣', 'kbelík na mytí podlahy'], ['🧅', 'cibule'], ['🦴', 'kost'], ['🎂', 'dort']],
        veta: 'Pejsek a kočička upekli dort ze všeho, co měli rádi.'
    },
    {
        majitel: 'Sněhurka', obr: '👸',
        veci: [['🛏️', 'sedm postýlek'], ['⛏️', 'krumpáček od trpaslíků'], ['🍎', 'jablko']],
        veta: 'Zlá královna dala Sněhurce otrávené jablko.'
    },
    {
        majitel: 'Tlapková patrola', obr: '🐕',
        veci: [['🦴', 'pamlsek'], ['🚓', 'policejní auto'], ['🚒', 'hasičské auto']],
        veta: 'Na pejsky z Tlapkové patroly je vždycky spolehnutí.'
    },
    {
        majitel: 'Shrek', obr: '🧌',
        veci: [['🧅', 'cibule'], ['🐉', 'dračice'], ['🫏', 'oslík']],
        veta: 'Zlobr Shrek bydlí v bažině a jeho nejlepší kamarád je Oslík.'
    }
];
