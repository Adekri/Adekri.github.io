Pokud nakupujete přízi nebo zadáváte specifikace do výroby, dřív nebo později narazíte na označení jako **tex**, **Nm** nebo **denier**. Každá část světa — a každé odvětví — používá trochu jiný systém.

Níže najdete kalkulačku a stručný přehled, co která jednotka znamená.

## Kalkulačka

Zadejte hodnotu do libovolného pole. Ostatní se dopočítají samy.
<div style="background:var(--bridlice,#1b1d1f);border:1px solid rgba(184,115,51,0.3);border-left:3px solid var(--med,#b87333);padding:32px 28px 28px;margin:36px 0;border-radius:2px;">
<p style="font-size:0.7rem;text-transform:uppercase;letter-spacing:2.5px;color:var(--med,#b87333);margin-bottom:24px;font-weight:600;">Převodní kalkulačka jednotek příze</p>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:16px;">
<div><label for="c-tex" style="display:block;font-size:0.72rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--len,#e2ded0);margin-bottom:7px;font-weight:600;">Tex <span style="font-weight:400;opacity:0.5;text-transform:none;letter-spacing:0;">(g / 1 000 m)</span></label><input id="c-tex" type="number" min="0.001" step="0.01" placeholder="zadejte hodnotu" style="width:100%;padding:11px 13px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#fff;font-size:1rem;font-family:inherit;border-radius:2px;outline:none;box-sizing:border-box;"></div>
<div><label for="c-dtex" style="display:block;font-size:0.72rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--len,#e2ded0);margin-bottom:7px;font-weight:600;">Dtex <span style="font-weight:400;opacity:0.5;text-transform:none;letter-spacing:0;">(g / 10 000 m)</span></label><input id="c-dtex" type="number" min="0.001" step="0.01" placeholder="zadejte hodnotu" style="width:100%;padding:11px 13px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#fff;font-size:1rem;font-family:inherit;border-radius:2px;outline:none;box-sizing:border-box;"></div>
<div><label for="c-den" style="display:block;font-size:0.72rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--len,#e2ded0);margin-bottom:7px;font-weight:600;">Denier <span style="font-weight:400;opacity:0.5;text-transform:none;letter-spacing:0;">(g / 9 000 m)</span></label><input id="c-den" type="number" min="0.001" step="0.01" placeholder="zadejte hodnotu" style="width:100%;padding:11px 13px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#fff;font-size:1rem;font-family:inherit;border-radius:2px;outline:none;box-sizing:border-box;"></div>
<div><label for="c-nm" style="display:block;font-size:0.72rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--len,#e2ded0);margin-bottom:7px;font-weight:600;">Nm <span style="font-weight:400;opacity:0.5;text-transform:none;letter-spacing:0;">(m / g)</span></label><input id="c-nm" type="number" min="0.001" step="0.01" placeholder="zadejte hodnotu" style="width:100%;padding:11px 13px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#fff;font-size:1rem;font-family:inherit;border-radius:2px;outline:none;box-sizing:border-box;"></div>
<div><label for="c-ne" style="display:block;font-size:0.72rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--len,#e2ded0);margin-bottom:7px;font-weight:600;">Ne <span style="font-weight:400;opacity:0.5;text-transform:none;letter-spacing:0;">(bavlna, anglické č.)</span></label><input id="c-ne" type="number" min="0.001" step="0.01" placeholder="zadejte hodnotu" style="width:100%;padding:11px 13px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#fff;font-size:1rem;font-family:inherit;border-radius:2px;outline:none;box-sizing:border-box;"></div>
<div><label for="c-nw" style="display:block;font-size:0.72rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--len,#e2ded0);margin-bottom:7px;font-weight:600;">Nw <span style="font-weight:400;opacity:0.5;text-transform:none;letter-spacing:0;">(vlna, worsted)</span></label><input id="c-nw" type="number" min="0.001" step="0.01" placeholder="zadejte hodnotu" style="width:100%;padding:11px 13px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#fff;font-size:1rem;font-family:inherit;border-radius:2px;outline:none;box-sizing:border-box;"></div>
</div>
<p id="c-error" style="display:none;margin-top:14px;font-size:0.85rem;color:var(--med,#b87333);">Zadejte kladnou číselnou hodnotu.</p>
<button onclick="['c-tex','c-dtex','c-den','c-nm','c-ne','c-nw'].forEach(function(id){var el=document.getElementById(id);if(el){el.value='';el.style.borderColor='';}}); var e=document.getElementById('c-error'); if(e) e.style.display='none';" style="margin-top:18px;background:transparent;border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.45);padding:8px 18px;font-size:0.75rem;text-transform:uppercase;letter-spacing:1px;cursor:pointer;font-family:inherit;border-radius:2px;">Vymazat</button>
</div>
<script>
(function () {
  var PREC = 4;
  function r(v) { return Math.round(v * Math.pow(10, PREC)) / Math.pow(10, PREC); }
  var ids = ['c-tex','c-dtex','c-den','c-nm','c-ne','c-nw'];
  var fields = {};
  ids.forEach(function(id) { fields[id] = document.getElementById(id); });
  var errEl = document.getElementById('c-error');
  // Převod z libovolné jednotky na tex
  var toTex = {
    'c-tex':  function(v){ return v; },
    'c-dtex': function(v){ return v / 10; },
    'c-den':  function(v){ return v / 9; },
    'c-nm':   function(v){ return 1000 / v; },
    'c-ne':   function(v){ return 590.5 / v; },
    'c-nw':   function(v){ return 885.8 / v; }
  };
  // Přepočet všech polí z tex
  function fromTex(tex, skip) {
    var vals = {
      'c-tex':  r(tex),
      'c-dtex': r(tex * 10),
      'c-den':  r(tex * 9),
      'c-nm':   r(1000 / tex),
      'c-ne':   r(590.5 / tex),
      'c-nw':   r(885.8 / tex)
    };
    ids.forEach(function(id) {
      if (id === skip || !fields[id]) return;
      fields[id].value = vals[id];
      fields[id].style.borderColor = 'rgba(184,115,51,0.45)';
    });
    if (fields[skip]) fields[skip].style.borderColor = 'var(--med,#b87333)';
    if (errEl) errEl.style.display = 'none';
  }
  ids.forEach(function(id) {
    if (!fields[id]) return;
    fields[id].addEventListener('input', function() {
      var raw = parseFloat(this.value);
      if (this.value === '' || this.value === null) return;
      if (!isFinite(raw) || raw <= 0) {
        if (errEl) errEl.style.display = 'block';
        return;
      }
      fromTex(toTex[id](raw), id);
    });
  });
}());
</script>

---

## Co jednotky znamenají

**Tex** je metrická základní jednotka pro jemnost příze. Říká, kolik gramů váží 1 000 metrů příze. Čím vyšší číslo, tím silnější příze. ISO 1144 doporučuje tex jako hlavní jednotku pro mezinárodní obchod.

**Dtex** (decitex) je tex × 10 — tedy hmotnost 10 000 metrů v gramech. Běžný u syntetických vláken (polyester, nylon) a na etiketách v EU, kde ho doporučuje směrnice 1007/2011.

**Denier** (zkratka den nebo D) pochází z hedvábnického průmyslu. Udává hmotnost 9 000 metrů příze v gramech. Dnes převládá pro hedvábí, nylon a polyester, zvláště na anglosaském a asijském trhu.

**Nm** (metrické číslo, *Nummer metrisch*) funguje obráceně oproti tex — udává délku v metrech, kterou váží 1 gram. Vyšší Nm = jemnější příze. Typický pro vlnu a česanou přízi evropského původu.

**Ne** (*English cotton count*) je historická anglická jednotka pro bavlnu. Udává počet přadélek o délce 840 yardů (768 m), která dohromady váží 1 libru (453,6 g). Stále převládá v bavlnářském průmyslu USA a Velké Británie.

**Nw** (*Worsted count*) je obdoba Ne pro česanou vlnu. Přadénko má 560 yardů (512 m). Používá se v tradičním vlnařském průmyslu, zejména ve Velké Británii.

---

*Vzorce jsou standardizovány dle ISO 1144. Výsledky zaokrouhleny na 4 desetinná místa.*
