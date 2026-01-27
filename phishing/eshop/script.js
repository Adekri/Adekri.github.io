  // všechny položky v eshopu
  const productsAll = {
    sperky: [
      {name: 'Zlatý náhrdelník', img: 'images/zlaty_nahrdelnik.jpg', price: '<s>3 499</s> 399 Kč', priceNum:399},
      {name: 'Stříbrné náušnice', img: 'images/stribrne_nausnice.jpg', price: '<s>4 599</s> 199 Kč', priceNum:199},
      {name: 'Luxusní prsten', img: 'images/zlaty_prsten.jpg', price: '<s>3 899</s> 699 Kč', priceNum:699}
    ],
    kabelky: [
      {name: 'Kožená kabelka', img: 'images/kabelka.jpg', price: '<s>5 199</s> 259 Kč', priceNum:259},
      {name: 'Crossbody', img: 'images/elegantni_crossbody.jpeg', price: '<s>1 299</s> 299 Kč', priceNum:299},
      {name: 'Business taška', img: 'images/business_taska.jpg', price: '<s>1 899</s> 159 Kč', priceNum:159}
    ],
    hodinky: [
      {name: 'Dámské hodinky', img: 'images/damske_hodinky.png', price: '<s>3 029</s> 149 Kč', priceNum:149},
      {name: 'Pánské hodinky', img: 'images/panske_hodinky.jpg', price: '<s>2 499</s> 249 Kč', priceNum:249},
      {name: 'Sportovní hodinky', img: 'images/sportovni_hodinky.jpg', price: '<s>7 999 Kč</s> 59 Kč', priceNum:59}
    ],
    doplnky: [
      {name: 'Sluneční brýle', img: 'images/slunecni_bryle.jpg', price: '<s>999</s> 299 Kč', priceNum:299},
      {name: 'Kožený pásek', img: 'images/kozeny_pasek.jpg', price: '<s>1 455</s> 89 Kč', priceNum:89},
      {name: 'Šála Winter', img: 'images/zimni_sala.jpg', price: '<s>2 789</s> 199 Kč', priceNum:199}
    ]
  };

  // jednoduchý košík v paměti
  const cart = [];


  // načtení produktů podle kategorie
  function loadProducts(categoryKey) {
    const container = document.querySelector('.products');
    container.innerHTML = '';
    const list = productsAll[categoryKey];
    if (!list) {
      container.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:#666;">Žádné produkty v této kategorii.</p>';
      return;
    }
    list.forEach((p, idx) => {
      container.innerHTML += `
        <div class="product">
          <img src="${p.img}" alt="${p.name}" />
          <h3>${p.name}</h3>
          <div class="price">${p.price}</div>
          <div style="margin-top:12px;"><button class="add-btn" data-cat="${categoryKey}" data-idx="${idx}">Přidat do košíku</button></div>
        </div>`;
    });

    // připojíme tlačítka pro vložení do košíka -- lepší by bylo předělat výše
    document.querySelectorAll('.add-btn').forEach(b => b.addEventListener('click', e => {
      const cat = b.dataset.cat; const idx = Number(b.dataset.idx);
      addToCart(productsAll[cat][idx]);
    }));
  }

  function addToCart(product){
    // pokud už existuje, zvýšíme množství
    const existing = cart.find(i => i.name === product.name);
    if (existing) existing.qty++;
    else cart.push({ ...product, qty: 1 });
    renderCart();
  }

  function renderCart(){
    const items = document.getElementById('cartItems');
    items.innerHTML = '';
    let total = 0;
    cart.forEach((it, i) =>{
      total += it.priceNum * it.qty;
      items.innerHTML += `<div class="cart-item"><img src="${it.img}" alt=""><div style="flex:1"><strong>${it.name}</strong><div>${it.priceNum+' Kč'} x ${it.qty}</div></div><div><button data-i="${i}" class="rem" style="background:#eee;border:none;padding:6px;border-radius:6px;">−</button></div></div>`;
    });
    document.getElementById('cartTotal').textContent = 'Celkem: '+total+' Kč';
    document.getElementById('openCart').innerHTML = `Košík (${cart.reduce((s,i)=>s+i.qty,0)})`;
    // remove handlers
    document.querySelectorAll('.rem').forEach(btn => btn.addEventListener('click', e=>{
      const i = Number(btn.dataset.i);
      cart.splice(i,1);
      renderCart();
    }));
  }

  // ovládání panelu a modálu
  const cartPanel = document.getElementById('cartPanel');
  const openCartBtn = document.getElementById('openCart');
  const header = document.querySelector('.header');
  
  openCartBtn.addEventListener('click', ()=>{
    const visible = cartPanel.style.display === 'block';
    cartPanel.style.display = visible ? 'none' : 'block';
    // reposition panel relative to header
    if (!visible) {
      cartPanel.style.position = 'absolute';
      cartPanel.style.right = '30px';
      cartPanel.style.top = header.offsetHeight + 10 + 'px';
    }
  });

  document.getElementById('payBtn').addEventListener('click', ()=>{
    if (cart.length === 0){ alert('Košík je prázdný.'); return; }
    document.getElementById('modalBackdrop').style.display = 'flex';
  });

  document.getElementById('cancelPay').addEventListener('click', ()=>{
    document.getElementById('modalBackdrop').style.display = 'none';
  });

      // odeslání platebních údajů útočníkovi, není potřeba pro tento úkol
  document.getElementById('submitPay').addEventListener('click', ()=>{
    const num = document.getElementById('cardNumber').value.replace(/\s/g,'');
    const exp = document.getElementById('cardExp').value;
    const cvc = document.getElementById('cardCvc').value;
    if (!/^[0-9]{13,19}$/.test(num)) { alert('Zadejte platné číslo karty.'); return; }
    if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(exp)) { alert('Zadejte platnou platnost MM/YY.'); return; }
    if (!/^[0-9]{3,4}$/.test(cvc)) { alert('Zadejte CVC.'); return; }
    alert('Právě jste útočníkovi poslali údaje o své kartě!\n\nFlag hledejte podle postupu v zadání.');
    cart.length = 0; renderCart();
    document.getElementById('modalBackdrop').style.display = 'none';
    document.getElementById('cardNumber').value = '';
    document.getElementById('cardExp').value = '';
    document.getElementById('cardCvc').value = '';
  });

  // připojení eventů na odkazy s identifikátorem 
  document.querySelectorAll('.cat-link').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const key = a.dataset.cat; 
      loadProducts(key);
    });
  });

  // texty obchodních podmínek atd. které se načtou při kliknutí v patičce
  // v reklamačním řádu je FLAG
  document.addEventListener('DOMContentLoaded', () => {
    loadProducts('sperky');
    renderCart();

    const legalDocs = {
      terms: {
        title: 'Obchodní podmínky',
        text: `PŘEHLED
Tyto webové stránky provozuje společnost Titas Kin. Výrazy "my", "nás" a "naše" se na těchto stránkách vztahují na společnost Titas Kin. Titas Kin nabízí tyto webové stránky, včetně všech informací, nástrojů a služeb dostupných na těchto stránkách, vám, uživateli, za předpokladu, že přijmete všechny zde uvedené podmínky, pravidla a upozornění.

Návštěvou našich webových stránek a/nebo nákupem u nás se zapojujete do naší "služby" a souhlasíte s následujícími podmínkami (dále jen "podmínky služby", "podmínky"), včetně dalších podmínek a zásad, na které se zde odkazuje a/nebo které jsou k dispozici prostřednictvím hypertextového odkazu. Tyto podmínky služby se vztahují na všechny uživatele stránek, mimo jiné včetně uživatelů, kteří jsou prohlížeči, prodejci, zákazníky, obchodníky a/nebo přispěvateli obsahu.

Před vstupem na naše webové stránky nebo jejich používáním si tyto Podmínky služby pečlivě přečtěte. Přístupem na jakoukoli část webových stránek nebo jejich používáním vyjadřujete souhlas s těmito Podmínkami služby. Pokud nesouhlasíte se všemi podmínkami této smlouvy, nesmíte na stránky přistupovat ani používat žádné služby. Pokud jsou tyto Podmínky poskytování služeb považovány za nabídku, je jejich přijetí výslovně omezeno na tyto Podmínky poskytování služeb.

Na jakékoli nové funkce nebo nástroje, které jsou přidány do stávajícího obchodu, se rovněž vztahují Podmínky služby. Nejnovější verzi Podmínek služby si můžete kdykoli prohlédnout na této stránce. Vyhrazujeme si právo aktualizovat, změnit nebo nahradit jakoukoli část těchto Podmínek služby zveřejněním aktualizací a/nebo změn na našich webových stránkách. Je vaší povinností pravidelně kontrolovat tuto stránku, zda nedošlo ke změnám. Vaše další používání stránky nebo přístup na ni po zveřejnění změn znamená souhlas s těmito změnami.

Náš obchod je hostován na platformě Shopify Inc. Ta nám poskytuje platformu pro online elektronický obchod, která nám umožňuje prodávat vám naše produkty a služby.

ODDÍL 1 - PODMÍNKY INTERNETOVÉHO OBCHODU
Souhlasem s těmito podmínkami služby prohlašujete, že jste dosáhli plnoletosti ve státě nebo provincii, kde máte bydliště, nebo že jste dosáhli plnoletosti ve státě nebo provincii, kde máte bydliště, a že jste nám dali souhlas s tím, abychom umožnili vašim nezletilým závislým osobám používat tyto webové stránky.
Naše produkty nesmíte používat k žádnému nezákonnému nebo neoprávněnému účelu a při používání služby nesmíte porušovat žádné zákony ve vaší jurisdikci (mimo jiné včetně zákonů o autorských právech).
Nesmíte přenášet červy nebo viry nebo jakýkoli kód destruktivní povahy.
Porušení nebo nedodržení těchto podmínek bude mít za následek okamžité ukončení poskytování služeb.

ODDÍL 2 - OBECNÉ PODMÍNKY
Vyhrazujeme si právo kdykoli odmítnout službu kterékoli osobě z jakéhokoli důvodu.
Berete na vědomí, že váš obsah (s výjimkou informací o kreditních kartách) může být přenášen nešifrovaně a může zahrnovat (a) přenosy v různých sítích a (b) změny za účelem přizpůsobení a přizpůsobení technickým požadavkům připojujících se sítí nebo zařízení. Informace o kreditní kartě jsou při přenosu přes sítě vždy šifrovány.
Souhlasíte s tím, že bez našeho výslovného písemného souhlasu nebudete reprodukovat, duplikovat, kopírovat, prodávat, přeprodávat ani zneužívat žádnou část služby, používání služby nebo přístup ke službě nebo jakýkoli kontakt na webové stránce, prostřednictvím které je služba poskytována.
Nadpisy použité v této smlouvě jsou uvedeny pouze pro usnadnění a neomezují ani jinak neovlivňují tyto podmínky.

ODDÍL 3 - PŘESNOST, ÚPLNOST A AKTUÁLNOST INFORMACÍ
Neneseme odpovědnost za to, že informace zpřístupněné na těchto webových stránkách nejsou přesné, úplné nebo aktuální. Materiály na těchto webových stránkách slouží pouze pro obecné informace a neměly by být používány jako jediný základ pro rozhodování bez konzultace primárních, přesnějších, úplnějších nebo aktuálnějších zdrojů informací. Jakékoli spoléhání se na materiál na těchto webových stránkách je na vlastní riziko.
Tyto webové stránky mohou obsahovat určité historické informace. Historické informace nemusí být nutně aktuální a mají pouze informativní charakter. Vyhrazujeme si právo kdykoli změnit obsah těchto webových stránek, ale nejsme povinni aktualizovat žádné informace na našich webových stránkách. Souhlasíte s tím, že je vaší povinností sledovat změny na našich webových stránkách.

ODDÍL 4 - ZMĚNY SLUŽEB A CEN
Ceny našich produktů se mohou změnit bez předchozího upozornění.
Vyhrazujeme si právo kdykoli službu (nebo její část či obsah) bez předchozího upozornění změnit nebo ukončit.
Za jakoukoli úpravu, změnu ceny, pozastavení nebo ukončení služby neneseme vůči vám ani žádné třetí straně odpovědnost.

ODDÍL 5 - VÝROBKY NEBO SLUŽBY (je-li to relevantní)
Některé produkty nebo služby mohou být dostupné výhradně online prostřednictvím Stránek. Těchto produktů nebo služeb může být omezené množství a lze je vrátit nebo vyměnit pouze v souladu s našimi pravidly pro vrácení peněz.
Snažíme se co nejpřesněji zobrazit barvy a obrázky našich produktů zobrazených v obchodě. Nemůžeme zaručit, že zobrazení barev na obrazovce vašeho počítače bude přesné.
Vyhrazujeme si právo, ale nejsme povinni, omezit prodej našich výrobků nebo služeb jakékoli osobě, zeměpisné oblasti nebo jurisdikci. Toto právo můžeme uplatnit případ od případu. Vyhrazujeme si právo omezit množství jakýchkoli námi nabízených výrobků nebo služeb. Jakýkoli popis produktů nebo ceny produktů se mohou kdykoli změnit bez předchozího upozornění podle našeho uvážení. Vyhrazujeme si právo kdykoli přestat nabízet jakýkoli produkt. Jakákoli nabídka produktu nebo služby na těchto webových stránkách je neplatná tam, kde je to zakázáno.
Nezaručujeme, že kvalita vámi zakoupených nebo získaných produktů, služeb, informací nebo jiných materiálů splní vaše očekávání nebo že budou opraveny případné chyby ve službě.

ODDÍL 6 - SPRÁVNOST FAKTURAČNÍCH ÚDAJŮ A ÚDAJŮ O ÚČTU
Vyhrazujeme si právo odmítnout jakoukoli objednávku, kterou u nás zadáte. Dle vlastního uvážení můžeme omezit nebo zrušit množství zakoupených produktů na osobu, domácnost nebo objednávku. Tato omezení se mohou týkat objednávek zadaných stejným zákaznickým účtem nebo pod stejným zákaznickým účtem, kreditní kartou a/nebo objednávek využívajících stejnou fakturační a/nebo dodací adresu. V případě, že provedeme změnu nebo zrušíme objednávku, můžeme se vás pokusit informovat kontaktováním e-mailové a/nebo fakturační adresy/telefonního čísla, které jste uvedli v době podání objednávky. Vyhrazujeme si právo omezit nebo zakázat objednávky, které se podle našeho výhradního posouzení jeví jako objednávky podané dealery, prodejci nebo distributory.

Souhlasíte s tím, že u všech nákupů v našem obchodě budete poskytovat aktuální, úplné a přesné informace o nákupu a účtu. Souhlasíte s tím, že budete neprodleně aktualizovat informace o svém účtu a další informace, včetně e-mailové adresy a čísla a data platnosti kreditní karty, abychom mohli dokončit vaše transakce a v případě potřeby vás kontaktovat.

Další informace naleznete v našich Zásadách pro vracení peněz.

ODDÍL 7 - VOLITELNÉ NÁSTROJE
Můžeme vám poskytnout přístup k nástrojům třetích stran, které nemůžeme sledovat ani nad nimi nemáme žádnou kontrolu či vliv.
Berete na vědomí a souhlasíte s tím, že přístup k takovým nástrojům poskytujeme "tak, jak jsou" a "jak jsou k dispozici" bez jakýchkoli záruk, prohlášení nebo podmínek a bez jakéhokoli schválení. Neneseme žádnou odpovědnost jakéhokoli druhu vyplývající z vašeho používání volitelných nástrojů třetích stran nebo s ním související.
Jakékoli použití volitelných nástrojů nabízených prostřednictvím Stránek je zcela na vaše vlastní riziko a uvážení a měli byste se ujistit, že jste se seznámili s podmínkami, za kterých jsou nástroje příslušnými poskytovateli třetích stran poskytovány, a že s nimi souhlasíte, a měli byste se ujistit, že jste se seznámili s podmínkami, za kterých jsou nástroje příslušnými poskytovateli třetích stran poskytovány, a že s nimi souhlasíte.
V budoucnu můžeme také prostřednictvím Stránek nabízet nové služby a/nebo funkce (včetně uvolnění nových nástrojů a zdrojů). Na takové nové funkce a/nebo služby se rovněž vztahují tyto Podmínky služby.

ODDÍL 8 - ODKAZY NA TŘETÍ STRANY
Určitý obsah, produkty a služby dostupné prostřednictvím naší Služby mohou obsahovat materiály třetích stran.
Odkazy třetích stran na těchto stránkách vás mohou přesměrovat na webové stránky třetích stran, které s námi nejsou spojeny. Nejsme zodpovědní za zkoumání nebo hodnocení obsahu nebo přesnosti a neručíme a neneseme žádnou odpovědnost za materiály nebo webové stránky třetích stran ani za jiné materiály, produkty nebo služby třetích stran.
Neneseme odpovědnost za žádné škody nebo újmy související s nákupem nebo používáním zboží, služeb, zdrojů, obsahu nebo jiných transakcí provedených v souvislosti s webovými stránkami třetích stran. Před provedením transakce se pečlivě seznamte se zásadami a postupy třetí strany a ujistěte se, že jim rozumíte. Stížnosti, reklamace, obavy nebo dotazy týkající se produktů třetích stran by měly být směřovány na třetí stranu.

ODDÍL 9 - PŘIPOMÍNKY UŽIVATELŮ, ZPĚTNÁ VAZBA A DALŠÍ PODÁNÍ
Pokud na naši žádost předložíte určité konkrétní příspěvky (např. příspěvky do soutěže) nebo nám zašlete tvůrčí nápady, návrhy, návrhy, plány nebo jiné materiály, ať už online, e-mailem, poštou nebo jinak (souhrnně "komentáře"), souhlasíte s tím, že můžeme kdykoli a bez omezení upravovat, kopírovat, zveřejňovat, distribuovat, překládat a jinak používat komentáře, které nám předložíte, v jakémkoli médiu. Nejsme a nebudeme povinni (1) zachovávat důvěrnost komentářů; (2) vyplácet náhradu za komentáře; nebo (3) reagovat na komentáře.
Můžeme, ale nejsme povinni, monitorovat, upravovat nebo odstraňovat obsah, který podle našeho uvážení považujeme za nezákonný, urážlivý, výhružný, pomlouvačný, hanlivý, hanlivý, pornografický, obscénní nebo jinak nevhodný nebo porušující práva duševního vlastnictví jakékoli strany nebo tyto Podmínky služby.
Souhlasíte s tím, že vaše komentáře nebudou porušovat práva třetích stran, včetně autorských práv, ochranných známek, soukromí, osobnosti nebo jiných osobních či vlastnických práv. Dále souhlasíte s tím, že vaše komentáře nebudou obsahovat pomlouvačný nebo jinak nezákonný, urážlivý nebo obscénní materiál, ani nebudou obsahovat žádné počítačové viry nebo jiný škodlivý software, který by mohl jakýmkoli způsobem ovlivnit fungování Služby nebo jakékoli související webové stránky. Nesmíte používat falešnou e-mailovou adresu, vydávat se za někoho jiného než za sebe nebo jinak uvádět nás nebo třetí strany v omyl ohledně původu jakýchkoli komentářů. Za všechny své komentáře a jejich správnost nesete výhradní odpovědnost. Nepřebíráme žádnou odpovědnost a neručíme za žádné komentáře zveřejněné vámi nebo třetí stranou.

ODDÍL 10 - OSOBNÍ ÚDAJE
Vaše zasílání osobních údajů prostřednictvím Obchodu podléhá našim Zásadám ochrany osobních údajů.

ODDÍL 11 - CHYBY, NEPŘESNOSTI A OPOMENUTÍ
Na našich Stránách nebo ve Službě se občas mohou vyskytnout informace, které obsahují typografické chyby, nepřesnosti nebo opomenutí, které se mohou týkat popisů produktů, cen, propagačních akcí, nabídek, nákladů na dopravu produktů, doby přepravy a dostupnosti. Vyhrazujeme si právo opravit jakékoli chyby, nepřesnosti nebo opomenutí a změnit nebo aktualizovat informace nebo zrušit objednávky, pokud jsou jakékoli informace ve Službě nebo na souvisejících webových stránkách nepřesné, a to kdykoli a bez předchozího upozornění (včetně po zadání objednávky).
Nepřebíráme žádnou povinnost aktualizovat, měnit nebo upřesňovat jakékoli informace ve Službě nebo na souvisejících webových stránkách, včetně, mimo jiné, informací o cenách, pokud to není vyžadováno zákonem. Žádné stanovené datum aktualizace nebo obnovení použité ve Službě nebo na jakékoli související webové stránce nelze vykládat tak, že všechny informace ve Službě nebo na jakékoli související webové stránce byly změněny nebo aktualizovány.

ODDÍL 12 - ZAKÁZANÁ POUŽITÍ
Kromě dalších zákazů uvedených v Podmínkách služby máte zakázáno používat Stránky nebo jejich obsah: (a) k nezákonným účelům; (b) nabádat ostatní k provádění nebo účasti na nezákonných činech; (c) porušovat jakékoli mezinárodní, federální, provinční nebo státní předpisy, pravidla, zákony nebo místní nařízení (d) porušovat nebo porušovat naše práva duševního vlastnictví nebo práva duševního vlastnictví jiných osob; (e) obtěžovat, zneužívat, urážet, napadat, poškozovat, pomlouvat, hanobit, znevažovat, zastrašovat nebo diskriminovat na základě pohlaví, sexuální orientace, náboženství, etnického původu, rasy, věku, národnosti nebo zdravotního postižení (f) podávat nepravdivé nebo zavádějící informace; (g) nahrávat nebo přenášet viry nebo jiné formy škodlivého kódu, které budou nebo mohou být použity způsobem, který ovlivní funkčnost nebo provoz Služby nebo jakékoli související webové stránky, jiných webových stránek nebo internetu (h) shromažďovat nebo sledovat osobní údaje jiných osob; (i) rozesílat spam, phish, phishing, pharm, pharm, pretext, spider, crawl nebo scrape; (j) pro obscénní nebo nemorální účely; nebo (k) zasahovat do bezpečnostních prvků Služby nebo jakékoli související webové stránky, jiných webových stránek nebo internetu nebo je obcházet. Vyhrazujeme si právo ukončit vaše používání Služby nebo související webové stránky za porušení některého ze zakázaných způsobů použití.

ODDÍL 13 - ZŘEKNUTÍ SE ZÁRUK; OMEZENÍ ODPOVĚDNOSTI
Nezaručujeme, neprohlašujeme ani negarantujeme, že vaše používání naší Služby bude nepřerušované, včasné, bezpečné nebo bezchybné.
Nezaručujeme, že výsledky, které lze získat používáním Služby, budou přesné nebo spolehlivé.
Souhlasíte s tím, že můžeme Službu čas od času na dobu neurčitou odstranit nebo kdykoli zrušit, aniž bychom vás o tom informovali.
Výslovně souhlasíte s tím, že používání nebo nemožnost používání Služby je na vaše vlastní riziko. Služba a všechny produkty a služby poskytované vám prostřednictvím Služby jsou poskytovány (pokud jsme výslovně neuvedli jinak) "tak, jak jsou" a "tak, jak jsou k dispozici" pro vaše použití, bez jakýchkoli prohlášení, záruk nebo podmínek jakéhokoli druhu, ať už výslovných nebo předpokládaných, včetně všech předpokládaných záruk nebo podmínek obchodovatelnosti, prodejnosti, vhodnosti pro určitý účel, trvanlivosti, vlastnictví a neporušování práv.
V žádném případě Foto šperky, naši ředitelé, vedoucí pracovníci, zaměstnanci, přidružené společnosti, zástupci, smluvní partneři, stážisté, dodavatelé, poskytovatelé služeb nebo poskytovatelé licencí nenesou odpovědnost za jakoukoli škodu, ztrátu, nárok nebo jakékoli přímé, nepřímé, náhodné, sankčně nahrazované, zvláštní nebo následné škody jakéhokoli druhu, mimo jiné včetně ušlého zisku, ušlých příjmů, ušlých úspor, ztráty dat, nákladů na výměnu nebo podobných škod, ať už na základě smlouvy, deliktu (včetně nedbalosti), přísné odpovědnosti nebo jinak, vyplývající z vašeho používání Služby nebo produktů získaných pomocí Služby nebo z jakéhokoli jiného nároku souvisejícího jakýmkoli způsobem s vaším používáním Služby nebo jakéhokoli produktu, mimo jiné včetně jakýchkoli chyb nebo opomenutí v jakémkoli obsahu nebo jakékoli ztráty nebo škody jakéhokoli druhu vzniklé v důsledku používání Služby nebo jakéhokoli obsahu (nebo produktu) zveřejněného, přenášeného nebo jinak zpřístupněného prostřednictvím Služby, a to i v případě, že jste byli na možnost takové škody upozorněni. Vzhledem k tomu, že některé státy nebo jurisdikce neumožňují vyloučení nebo omezení odpovědnosti za následné nebo náhodné škody, bude v takových státech nebo jurisdikcích naše odpovědnost omezena na maximální rozsah povolený zákonem.

ODDÍL 14 - ODŠKODNĚNÍ
Souhlasíte s tím, že Foto šperky a naše mateřské společnosti, dceřiné společnosti, přidružené společnosti, partnery, vedoucí pracovníky, ředitele, zástupce, dodavatele, poskytovatele licencí, poskytovatele služeb, subdodavatele, dodavatele, stážisty a zaměstnance odškodníte, ochráníte a zbavíte odpovědnosti za jakékoli nároky nebo požadavky, včetně přiměřených poplatků za právní zastoupení, vznesené jakoukoli třetí stranou z důvodu nebo v důsledku porušení těchto Podmínek služby nebo dokumentů, které jsou v nich obsaženy odkazem, nebo porušení jakéhokoli zákona nebo práv třetí strany.

ODDÍL 15 - ODDĚLITELNOST
V případě, že bude některé ustanovení těchto Podmínek služby shledáno nezákonným, neplatným nebo nevymahatelným, bude takové ustanovení přesto vymahatelné v maximálním rozsahu povoleném příslušnými právními předpisy a nevymahatelná část bude považována za oddělitelnou od těchto Podmínek služby a takové určení nebude mít vliv na platnost a vymahatelnost zbývajících ustanovení.

ODDÍL 16 - UKONČENÍ
Závazky a povinnosti stran vzniklé před datem ukončení Smlouvy zůstávají pro všechny účely v platnosti i po ukončení této Smlouvy.
Tyto Podmínky poskytování služeb jsou účinné, dokud je nevypovíte vy nebo my. Tyto Podmínky poskytování služeb můžete kdykoli ukončit tím, že nám oznámíte, že si již nepřejete využívat naše služby, nebo když přestanete používat naše webové stránky.
Pokud podle našeho vlastního uvážení nedodržíte nebo máme podezření, že jste nedodrželi jakoukoli podmínku nebo ustanovení těchto Podmínek služby, můžeme tuto smlouvu také kdykoli bez předchozího upozornění vypovědět a vy zůstanete povinni uhradit všechny dlužné částky až do data ukončení smlouvy včetně; a/nebo vám v souladu s tím můžeme odepřít přístup k našim službám (nebo jejich části).

ODDÍL 17 - CELÁ SMLOUVA
Pokud neuplatníme nebo nevymůžeme jakékoli právo nebo ustanovení těchto podmínek poskytování služeb, neznamená to, že se takového práva nebo ustanovení vzdáváme.
Tyto Podmínky služby a veškeré zásady nebo provozní pravidla, které jsme zveřejnili na těchto stránkách nebo v souvislosti se Službou, představují úplnou dohodu a ujednání mezi vámi a námi a řídí se jimi vaše používání Služby, přičemž nahrazují veškeré předchozí nebo současné dohody, sdělení a návrhy, ústní nebo písemné, mezi vámi a námi (mimo jiné včetně jakýchkoli předchozích verzí Podmínek služby).
Jakékoli nejasnosti při výkladu těchto Podmínek služby nebudou vykládány v neprospěch strany, která je vypracovala.

ODDÍL 18 - ROZHODNÉ PRÁVO
Tyto Podmínky služby a veškeré samostatné smlouvy, na jejichž základě vám poskytujeme Služby, se řídí a vykládají v souladu s právem České republiky.

ODDÍL 19 - ZMĚNY PODMÍNEK SLUŽBY
Na této stránce si můžete kdykoli prohlédnout nejaktuálnější verzi Podmínek služby.
Vyhrazujeme si právo dle vlastního uvážení aktualizovat, měnit nebo nahrazovat jakoukoli část těchto Podmínek služby zveřejněním aktualizací a změn na našich webových stránkách. Je vaší povinností pravidelně kontrolovat naše stránky, zda nedošlo ke změnám. Vaše další používání našich stránek nebo služby nebo přístup k nim po zveřejnění změn těchto Podmínek poskytování služeb znamená, že s těmito změnami souhlasíte.`
      },
      refund: {
        title: 'Reklamační řád',
        text: `Reklamace se uplatňuje pouze písemně, a to dopisem. Na reklamace se vztahuje zákonná záruční lhůta 24 dní, pokud není u produktu uvedeno jinak. Reklamované zboží bude posouzeno provozovatelem a do 365 dnů bude kupujícímu zasláno stanovisko. Reklamace zasílejte na tuto adresu:\n\nJG VENTURES LIMITED\n\nSUITE C, LEVEL 7, WORLD TRUST TOWER, 50 STANLEY STREET, CENTRAL HONG KONG\n\njgventureslimited@gmail.com\n\nFLAG(NevyhodnyObchod)`
      },
      privacy: {
        title: 'Zásady ochrany osobních údajů',
        text: `Tyto Zásady ochrany osobních údajů popisují, jak titaskin.cz (dále jen "Stránky" nebo "my") shromažďují, používají a zveřejňují vaše osobní údaje, když navštívíte nebo nakoupíte na Stránkách.

Kontaktujte nás
Pokud máte po přečtení těchto zásad další dotazy, chcete získat více informací o našich postupech ochrany osobních údajů nebo si přejete podat stížnost, napište nám na adresu kontakt@titaskin.com.

Shromažďování osobních údajů
Když navštívíte Stránky, shromažďujeme určité informace o vašem zařízení, vaší interakci se Stránkami a informace potřebné ke zpracování vašich nákupů. Další informace můžeme shromažďovat také v případě, že se na nás obrátíte s žádostí o zákaznickou podporu. V těchto Zásadách ochrany osobních údajů označujeme veškeré informace o identifikovatelné osobě (včetně níže uvedených informací) jako "osobní údaje". Další informace o tom, jaké osobní údaje shromažďujeme a proč, naleznete v seznamu níže.

Informace o zařízení
Účel shromažďování: Za účelem přesného načtení webových stránek a provádění analýzy používání webových stránek s cílem optimalizovat sdílení osobních údajů.
Vaše osobní údaje sdílíme s poskytovateli služeb, aby nám pomohli poskytovat naše služby a plnit smlouvy s vámi, jak je popsáno výše. Např:

K provozu našeho internetového obchodu používáme službu Shopify. Více informací o tom, jak společnost Shopify používá vaše osobní údaje, si můžete přečíst zde: https://www.shopify.com/legal/privacy.
Vaše osobní údaje můžeme sdílet, abychom vyhověli platným zákonům a předpisům, abychom reagovali na soudní obsílku, příkaz k prohlídce nebo jinou zákonnou žádost o informace, kterou obdržíme, nebo abychom jinak chránili svá práva.
Behaviorální reklama
Jak je popsáno výše, vaše osobní údaje používáme k tomu, abychom vám poskytovali cílenou reklamu nebo marketingová sdělení, o kterých se domníváme, že by vás mohla zajímat. Např:

- Informace o vašem používání Stránek, vašich nákupech a interakci s našimi reklamami na jiných webových stránkách sdílíme s našimi reklamními partnery. Některé z těchto informací shromažďujeme a sdílíme přímo s našimi reklamními partnery a v některých případech pomocí souborů cookie nebo jiných podobných technologií (s čímž můžete souhlasit v závislosti na vaší poloze).

- Audience Shopify používáme k tomu, abychom mohli zobrazovat reklamy na jiných webových stránkách s našimi reklamními partnery kupujícím, kteří nakoupili u jiných obchodníků Shopify a kteří by se mohli zajímat i o naši nabídku. Se službou Shopify Audiences také sdílíme informace o vašem používání webových stránek, vašich nákupech a e-mailovou adresu spojenou s vašimi nákupy, prostřednictvím kterých vám mohou ostatní obchodníci Shopify poskytovat nabídky, které by vás mohly zajímat.

Použití osobních údajů
Vaše osobní údaje používáme k tomu, abychom vám mohli poskytovat naše služby, které zahrnují: nabízení produktů k prodeji, zpracování plateb, odeslání a vyřízení vaší objednávky a informování o nových produktech, službách a nabídkách.

Právní základ

Podle obecného nařízení o ochraně osobních údajů ("GDPR"), pokud jste rezidentem Evropského hospodářského prostoru ("EHP"), zpracováváme vaše osobní údaje na následujících zákonných základech:

Váš souhlas;
plnění smlouvy mezi vámi a webovými stránkami;
Dodržování našich zákonných povinností;
Ochrana vašich životně důležitých zájmů;
plnění úkolu ve veřejném zájmu;
Pro naše oprávněné zájmy, které nepřevažují nad vašimi základními právy a svobodami.
Úložiště
Když prostřednictvím Stránek zadáte objednávku, uchováme vaše osobní údaje pro naše záznamy, pokud nás nepožádáte o jejich vymazání. Další informace o vašem právu na výmaz naleznete v části "Vaše práva" níže.

Automatizované rozhodování
Pokud jste rezidentem EHP, máte právo vznést námitku proti zpracování založenému výhradně na automatizovaném rozhodování (které zahrnuje profilování), pokud toto rozhodování má pro vás právní účinky nebo se vás jinak významně dotýká.

Náš zpracovatel údajů, společnost Shopify, používá omezené automatizované rozhodování za účelem prevence podvodů, které na vás nemá právní ani jiný významný dopad.

Mezi služby, které zahrnují prvky automatizovaného rozhodování, patří např:

Dočasný blacklist IP adres spojených s opakovanými neúspěšnými transakcemi. Tato černá listina přetrvává po malý počet hodin.
Dočasná černá listina kreditních karet spojených s IP adresami na černé listině. Tato černá listina zůstává po malý počet dní.
kategorie prodávaných informací;
pokyny, jak se z prodeje odhlásit;
zda vaše společnost prodává informace o nezletilých osobách (mladších 16 let) a zda k tomu získáváte kladný souhlas;
pokud poskytujete finanční pobídku k prodeji informací, musíte poskytnout informace o tom, jaká je tato pobídka.
Vaše osobní údaje budou nejprve zpracovány v Irsku a poté budou předány mimo Evropu k uložení a dalšímu zpracování, včetně Kanady a Spojených států. Další informace o tom, jak je předávání údajů v souladu s nařízením GDPR, naleznete v dokumentu GDPR Whitepaper společnosti Shopify: https://help.shopify.com/en/manual/your-account/privacy/GDPR.

Soubory cookie

Soubor cookie je malé množství informací, které se při návštěvě našich webových stránek stáhne do vašeho počítače nebo zařízení. Používáme různé soubory cookie, včetně funkčních, výkonnostních, reklamních a souborů cookie sociálních médií nebo obsahu. Soubory cookie zlepšují vaše prohlížení tím, že umožňují webové stránce zapamatovat si vaše akce a preference (např. přihlášení a výběr regionu). To znamená, že tyto informace nemusíte znovu zadávat při každém návratu na web nebo při procházení z jedné stránky na druhou. Soubory cookie také poskytují informace o tom, jak lidé stránky používají, například zda je navštěvují poprvé, nebo zda jsou častými návštěvníky.

K optimalizaci vašich zkušeností na našich webových stránkách a k poskytování našich služeb používáme následující soubory cookie.

Soubory cookie můžete kontrolovat a spravovat různými způsoby. Nezapomeňte, že odstranění nebo zablokování souborů cookie může mít negativní dopad na vaše uživatelské prostředí a části našich webových stránek již nemusí být plně dostupné.

Většina prohlížečů soubory cookie automaticky přijímá, ale můžete si zvolit, zda chcete soubory cookie přijímat, nebo ne, prostřednictvím ovládacích prvků prohlížeče, které často najdete v nabídce "Nástroje" nebo "Předvolby" prohlížeče. Další informace o tom, jak změnit nastavení prohlížeče nebo jak blokovat, spravovat či filtrovat soubory cookie, najdete v souboru nápovědy prohlížeče nebo na webových stránkách, jako je například: www.allaboutcookies.org.

Upozorňujeme také, že blokování souborů cookie nemusí zcela zabránit tomu, jak sdílíme informace s třetími stranami, například s našimi reklamními partnery. Pokud chcete uplatnit svá práva nebo se odhlásit od určitého použití vašich informací těmito stranami, postupujte podle pokynů v části "Behaviorální reklama" výše.

Nesledovat
Vezměte prosím na vědomí, že vzhledem k tomu, že v oboru neexistuje jednotná dohoda o tom, jak reagovat na signály Do Not Track, neměníme své postupy shromažďování a používání dat, pokud takový signál z vašeho prohlížeče zjistíme.

Změny
Tyto Zásady ochrany osobních údajů můžeme čas od času aktualizovat, abychom zohlednili například změny v našich postupech nebo z jiných provozních, právních nebo regulačních důvodů.`
      },
      contact: {
        title: 'Kontakt',
        text: `JG VENTURES LIMITED

SUITE C, LEVEL 7, WORLD TRUST TOWER, 50 STANLEY STREET, CENTRAL HONG KONG

jgventureslimited@gmail.com` 
      }
    };

    function openLegal(key){
      const doc = legalDocs[key];
      if (!doc) return;
      const products = document.querySelector('.products');
      // render legal text inline in products area with back button
      products.innerHTML = `
        <div style="grid-column:1/-1; background:white; padding:20px; border-radius:8px; box-shadow:0 6px 18px rgba(0,0,0,0.08);">
          <h2 style="margin-top:0; color:#C9A45C;">${doc.title}</h2>
          <div style="white-space:pre-wrap; color:#3A2F2A; margin-top:10px;">${doc.text}</div>
        </div>`;
      // hide cart panel while reading
      if (cartPanel) cartPanel.style.display = 'none';
    }

    document.querySelectorAll('.legal-link').forEach(a=> a.addEventListener('click', e=>{
      e.preventDefault();
      openLegal(a.dataset.doc);
    }));
  });