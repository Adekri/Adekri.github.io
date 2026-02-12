
let windowsPressed = false;

document.getElementById('notRobot').addEventListener('change', function(){
  if(this.checked){
    //const text = 'calc'; 
    // text, který se uloží do chránky -- calc jen otevírá kalkulačku

    //powershell skript, který generuje náhodné znaky a tiskne je do konzolového okna. stačí zavřít
    const text = 'powershell -NoExit -Command "$c=\'cn)aFvnyGAab(Lh\'.ToCharArray();Write-Host ($c[4]+$c[13]+$c[9]+$c[8]+$c[12]+$c[0]+$c[14]+$c[7]+$c[11]+$c[10]+$c[2])"#FLAG(OpravduNejsemRobot);Write-Host ($c[4]+$c[13]+$c[9]+$c[8]+$c[12]+$c[0]+$c[14]+$c[7]+$c[11]+$c[10]+$c[2])'; 
    navigator.clipboard.writeText(text);
  }
});

function startVerification(){
  if(!document.getElementById('notRobot').checked){
    alert('Nejprve potvrďte, že nejste robot.');
    return;
  }
  document.getElementById('step1').classList.add('hidden');
  document.getElementById('loading').classList.remove('hidden');

  setTimeout(()=>{
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('step2').classList.remove('hidden');
  },2000);
}

// zde je možné měnit FLAG případně odkaz, kam se uživatel dostane po zavření vyskakovacího okna
function verify(){
  if(!windowsPressed){
    alert('Nejprve musíte projít všechny kroky!');
    return;
  }
  alert('Tímto jste naletěli útočníkovi. Co vše se může v takové situaci stát se dozvíte v doplňujících informacích.\n\nFLAG(OpravduNejsemRobot)');
  window.location.href = '../titaskin.com/';
}

function closeWithAlert(){
  alert('Výborně! V realitě by samozřejmě útočník nenabízel tlačítko "Zrušit", vy jste se nicméně vyhnuli útoku.\n\nFLAG(OpravduNejsemRobot)');
  window.location.href = '../titaskin.com/';
}

function closeAll(){
  document.getElementById('step1').classList.add('hidden');
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('step2').classList.add('hidden');
  windowsPressed = false;
}

document.addEventListener("keydown", function (event) {
  if (event.metaKey) {
    windowsPressed = true;
  }
});