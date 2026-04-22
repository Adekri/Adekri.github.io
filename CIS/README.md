V tomto souboru je pouze vysvětlené vytváření průvodce programem a vyskakovacího informačního okna, které jsou použité v některých podadresářích. Tento dokument je proto vhodný pouze pro případnou replikaci těchto částí v jiné aplikaci. 


# TOC

1. [Jak používat Driver.js tour po programu](#jak-používat-driverjs-tour-po-programu)
   - [Highlight a změna vzhledu](#přidání-křížku-do-rohu-driver-okna--nový-typ-driver-okna)
2. [Custom okno s fontem VUT](#jak-používat-custom-vyskakovací-okno-s-fontem-a-stylem-vut)

## Jak používat Driver.js tour po programu

Oficiální dokumentace: https://driverjs.com/. Není úplně detailní, níže jsou rozepsány některé praktické tipy k použití.

Driver obsahuje několik typů vyskakovacích oken. Nejzákladnější je klasická tour.
Pokud chceme přidat tour, která se spustí při otevření stránky, vložíme ji přímo do scriptu například takto (ukázka tour z webové stránky pro přidání multifaktoru):

Do head je třeba přidat stylovací soubor:

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/driver.js/dist/driver.css">

Importovat script pro driver:

    <script src="https://cdn.jsdelivr.net/npm/driver.js/dist/driver.js.iife.js"></script>


A samotný kód (je možné vložit i do samostatného souboru):

    <script>

        const driver = window.driver.js.driver;
        let driverObj = null;

        /* =========================
           TOUR 1 – po načtení stránky
           ========================= */

        driverObj = driver({
            showProgress: true,
            nextBtnText: "Další",
            prevBtnText: "Zpět",
            doneBtnText: "Hotovo",
            progressText: '{{current}}/{{total}}',
            allowClose: false,
            steps: [
                {
                    element: "#addMFAbutton",
                    popover: {
                        title: "Postup",
                        description: "Stisknutím tohoto tlačítka zobrazíte možnosti přidání nového způsobu ověření."
                    }
                },
                {
                    element: "#table-of-devices",
                    popover: {
                        title: "Postup",
                        description: "Po úspěšném nastavení každé z metod se tato metoda přidá do tabulky. Zde tak můžete kontrolovat a spravovat aktivní způsoby ověření."
                    }
                }
            ]
        });

        window.addEventListener("load", () => {
            if (!localStorage.getItem("startTour")) {
                setTimeout(() => {
                    driverObj.drive();
                    localStorage.setItem("startTour", "true");
                }, 500);
            }
            /* případně další příkazy, které se provadou po refreshi */
        });
    </script>


Vysvětlivky:

- **const driver window.driver.js.driver;** stačí v kódu přidat pouze jednou a to i pro různé typy driverů
- **let driverObj = null;** je potřeba v případě, že chceme na základě nějaké akce okno driveru zavřít (například při stisknutí zvýrazněného tlačítka nedává smysl aby to místo pak zůstávalo zvýrazněné):

    
        document.getElementById('qr-failed').addEventListener('click', function () {
            if (driverObj) {
                driverObj.destroy();
                driverObj = null;
            }
        });
    
- pokud v předchozím případě použijeme u všech tour stejné označení (driverObj), stačí prostě všude, kde hrozí zanechání otevřeného tour přidat tento kód:

            if (driverObj) {
                driverObj.destroy();
                driverObj = null;
            }

- snadno lze také zařídit, aby se uživateli zobrazila tour jen při prvním spuštění a to přidáním hodnoty startTour do localstorage:


        if (!localStorage.getItem("startTour")) {
            setTimeout(() => {
                driverObj.drive();
                localStorage.setItem("startTour", "true");
            }, 500);
        }


- Samotná inicializace driveru je celkem intuitivní. Přidávají se sem jednotlivé stepy s nadpisy a texty a id prvku, který chceme zvýrazňovat. V horní části inicializace lze také měnit texty tlačítek, chvovat tlačítka, případně úplně uprvait vzhled daného okna. To bude vidět níže, kde byl přidán křížek do horního roku.

### Přidání křížku do rohu driver okna + nový typ driver okna

**POZOR**: místo toho prvního způsobu by se měl používat až ten následující ([tady](#modifikace-standartní-tour-jako-jeden-krok)).

Níže lze vidět, jak lze uprvait základní vzhled a funkčnost okna driveru. V případě highlight okna se přidává do sekce **onPopoverRender**. Sem se přidá i akci při kliknutí, což je zavření driveru. Typ driveru Highlight je vhodnější pokud máme v daném okně pouze jednu věc, kterou chceme zvýraznit. 

**POZOR**

>Například tato část se zobrazuje až při postupném průchodu přidávání TOTP kódu v aplikaci Multifaktor. Proto je celý tento kód potřeba přidat až do části scriptu, kde se například řeší otevření této části webové stránky. Pokud bude kód jinde, zobrazí se buď již při tevření stránky, nebo vůbec.

    driverObj = driver({
        popoverClass: "driverjs-theme",
        stagePadding: 4,
        progressText: '{{current}}/{{total}}',
        onPopoverRender: (popover) => {
            const closeBtn = document.createElement("button");
            closeBtn.innerHTML = "✕";

            closeBtn.style.position = "absolute";
            closeBtn.style.top = "10px";
            closeBtn.style.right = "10px";
            closeBtn.style.background = "transparent";
            closeBtn.style.border = "none";
            closeBtn.style.fontSize = "18px";
            closeBtn.style.cursor = "pointer";
            closeBtn.style.color = "black";

            closeBtn.addEventListener("click", () => {
                driverObj.destroy();
            });

            popover.wrapper.appendChild(closeBtn);
        }
    });
    driverObj.highlight({
        element: "#step3",
        popover: {
            title: "Postup",
            description: "Na závěr je ještě potřeba spojení potvrdit. To provedete zadáním jednorázového kódu, který se pravidelně obnovuje u přidaného účtu ve vašem telefonu.",
        }
    })

#### Modifikace standartní tour jako jeden krok
Případně asi lepší řešení je jen modifikovat standartní tour takto:

        const driverObj = driver({
            popoverClass: "driverjs-theme",
            stagePadding: 4,
            showProgress: true,
            doneBtnText: "Hotovo",
            showButtons: ['next'],
            progressText: '{{current}}/{{total}}',
            steps: [
                {
                    element: "#biometricModalBody",
                    popover: {
                        side: "bottom",
                        title: "Postup",
                        description: "V této simulaci místo přiložení prstu stiskněte klávesu 'O'.",
                    }
                }
            ],
        });
        setTimeout(() => {
            driverObj.drive();
        }, 500);


## Jak používat custom vyskakovací okno s fontem a stylem VUT

Samostatná ukázka tohoto okna je v adresáři *custom-modal*.

1. Kamkoliv do HTML je třeba přidat tuto část:

        <div class="modal" id="infoModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content info-modal">

            <div class="info-header">
                INFORMACE
            </div>

            <div class="info-body" id="infoModalText">
                Text
            </div>

            <div class="info-footer">
                <button class="info-btn" data-bs-dismiss="modal">
                Rozumím
                </button>
            </div>

            </div>
        </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

2. Zároveň je nutné vytvořit stylovací soubor k oknu. Teoreticky to lze i importem bootstrap stylů, ale to může ovlivnit vzhled zbytku stránky. Základní styl postačí takto:

        /* základ modalu */
        .modal {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.35);
        z-index: 2000;
        }

        .modal.show {
        display: block;
        }

        .modal-dialog {
        max-width: 400px;
        margin: 120px auto;
        }

        /* vzhled modalu */
        .info-modal{
        background:#f1f1f1;
        font-family: Arial, Helvetica, sans-serif;
        box-shadow:0 10px 30px rgba(0,0,0,0.3);
        }

        /* header */
        .info-header{
        padding:20px 40px;
        font-size: 32px;
        letter-spacing:3px;
        color:#2f3438;
        border-bottom:1px solid #cfd3d6;
        font-family: 'VafleVUT', sans-serif;
        }

        /* text */
        .info-body{
        padding:20px 40px;
        line-height:1.5;
        color:#1f2d3d;
        border-bottom:1px solid #cfd3d6;
        }

        /* footer */
        .info-footer{
        padding:20px 40px;
        display:flex;
        justify-content:flex-end;
        }

        /* tlačítko */
        .info-btn{
        background:#4f77a5;
        border:none;
        color:white;
        cursor:pointer;
        align-self: right;
        width: 40%;
        padding: 10px 20px;
        }

        .info-btn:hover{
        background:#3e6590;
        }


        @font-face {
            font-family: 'VafleVUT';
            src: url('../fonts/VAFLE_VUT_LIGHT.OTF') format('opentype');
            font-weight: 300;
            font-style: normal;
        }

        @font-face {
            font-family: 'VafleVUT';
            src: url('../fonts/VAFLE_VUT_REGULAR.OTF') format('opentype');
            font-weight: 400;
            font-style: normal;
        }

        @font-face {
            font-family: 'VafleVUT';
            src: url('../fonts/VAFLE_VUT_BOLD.OTF') format('opentype');
            font-weight: 700;
            font-style: normal;
        }

3. Jak je zde vidět, používáme font VUT, takže je teba ho mít importovaný ve správném adresáři. Odkaz na adresář je možno měnit u posledních 3 položek. Pokud písmo nebude importováno, použije se jiné, takže to neohrozí funkčnost.

4. Přidat je potřeba také jednoduchý script, který vloží text do okna a to otevře. Například v aplikaci Multifaktor lze vidět, že je tento script vložen přímo pod HTML část.

        window.showInfoModal = function(text) {
            const textEl = document.getElementById("infoModalText");
            textEl.textContent = text;

            const modalEl = document.getElementById("infoModal");
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        };

5. Použítí v kódu je pak jednoduché. Místo alert("text") se použije:

        showInfoModal('TOTP ověření úspěšné! FLAG(UmimNastavitMFA)');



