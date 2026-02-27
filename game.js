
/* ── IMAGES ── */
const IMAGES={
  aeryndel:"img/aeryndel.jpg",
  humano:"img/humano.jpg",
  mapa_cindermoor:"img/mapa-cindermoor.jpg",
  vista_vila:"img/vista-vila.jpg",
  taverna:"img/taverna.jpg",
  rua_principal:"img/rua-principal.jpg",
  mercador:"img/mercador.jpg"
};

function imgUrl(key){ return "url('"+IMAGES[key]+"')"; }
function setBg(el, key){ if(el) el.style.backgroundImage=imgUrl(key); }

/* ── STATE ── */
const G={race:0,class:null,name:'',notebook:false};

const CLASS_DATA={
  warrior:{
    name:'Guerreiro',avatar:'⚔️',
    desc:'Mestre em armas e táticas. Estilo de combate equilibrado — resiste a qualquer ameaça no campo de batalha.',
    advantage:'Versatilidade para mudar de estilo conforme o inimigo. Aprende técnicas novas mais rápido, sobrevivendo onde outros morreriam.',
    stats:{FOR:8,AGI:6,INT:4,VIT:7,CAR:5,SOR:4}
  },
  rogue:{
    name:'Ladino',avatar:'🗡️',
    desc:'Adaptável, furtivo e crítico. Especialista em sombras e golpes precisos.',
    advantage:'Furtividade para evitar conflitos. Ataques críticos eliminam ameaças antes que possam reagir.',
    stats:{FOR:5,AGI:9,INT:6,VIT:4,CAR:6,SOR:7}
  },
  mage:{
    name:'Mago',avatar:'🔮',
    desc:'Estudioso de magia arcana. Especialidade em dano em área — controla o campo de batalha inteiro.',
    advantage:'Feitiços complexos controlam multidões à distância, mantendo-se seguro enquanto eles caem.',
    stats:{FOR:3,AGI:5,INT:10,VIT:3,CAR:7,SOR:9}
  }
};

const PROGRESS={title:0,race:10,class:20,name:30,story:40,'race-story':50,'village-arrive':60,world:70,npc1:80,npc2:90,forest:100};

function nextScreen(id){
  const prev=document.querySelector('.screen.active');
  if(prev)prev.classList.remove('active');
  const el=document.getElementById('screen-'+id);
  if(el){el.classList.add('active');document.getElementById('progress-bar').style.width=(PROGRESS[id]||0)+'%';onEnter(id);}
}
const OVERVIEW_LINES=[
  {text:"Você notou algo? Hoje... ninguém está gritando com as crianças. Ninguém está discutindo. Todos seguem o mesmo caminho, o mesmo ritmo. Como se esquecessem que podiam escolher outro."},
  {text:"Eu moro aqui há quarenta anos. Conheço cada rosto. Mas hoje de manhã, olhei pro meu vizinho e ele me olhou de volta... como se me visse pela primeira vez. Sem reconhecimento. Sem nada."},
  {text:"Sei lá o que tá acontecendo. Mas você é diferente. Eu vejo nos seus olhos — ainda tem alguém ali dentro.", last:true}
];
const TAVERN_LINES=[
  {text:"Esses aqui jogam desde ontem à noite. Mesma partida. Mesma rodada. Eu já parei de servir cerveja — nenhum deles pediu nada em duas horas. Só jogam."},
  {text:"O estranho é que às vezes um deles dá uma gargalhada. Todos na mesma hora. Mesmo som. Parece ensaiado. Mas não tem nada engraçado na mesa — só cartas gastas."},
  {text:"Você tá passando por aqui ou tá ficando? Porque se for ficar... não deita perto de nenhum deles. Eles não dormem. Só ficam parados, olhando pro teto, esperando o dia clarear pra jogar de novo.", last:true}
];
const MERCHANT_LINES=[
  {text:"Erva de Cinza Prateada — três moedas."},
  {text:"... Erva de Cinza Prateada — três moedas."},
  {text:"Você me olha. Eu me lembro de você. Você passou aqui ontem — não, espera. Foi hoje de manhã. Não... foi agora. Quando você chegou? Erva de Cinza Prateada — três moedas.", last:true}
];

function onEnter(id){
  // Apply background images for each screen
  const bgMap={
    'story':'aeryndel',
    'race-story':'humano', 
    'village-arrive':'mapa_cindermoor',
    'world':'vista_vila',
    'npc1':'rua_principal',
    'npc2':'vista_vila',
    'npc-overview':'vista_vila',
    'npc-tavern':'taverna',
    'npc-merchant':'mercador'
  };
  if(bgMap[id]){
    const sc=document.getElementById('screen-'+id);
    if(sc){
      if(id==='village-arrive'){
        const vb=document.getElementById('village-bg');
        if(vb) setBg(vb, bgMap[id]);
      } else if(id==='world'){
        setBg(document.getElementById('world-bg'), bgMap[id]);
      } else if(id==='npc1'||id==='npc2'||id==='npc-overview'||id==='npc-tavern'||id==='npc-merchant'){
        const ds=sc.querySelector('.dialogue-scene');
        if(ds) setBg(ds, bgMap[id]);
      } else {
        sc.style.backgroundImage=imgUrl(bgMap[id]);
        sc.style.backgroundSize='cover';
        sc.style.backgroundPosition='center';
      }
    }
  }
  if(id==='npc1')startNPC1();
  if(id==='npc2')startNPC2();
  if(id==='world')setupWorld();
  if(id==='name')setTimeout(()=>document.getElementById('player-name-input').focus(),300);
  if(id==='npc-overview')startSimpleNPC('npc-overview',OVERVIEW_LINES);
  if(id==='npc-tavern')startSimpleNPC('npc-tavern',TAVERN_LINES);
  if(id==='npc-merchant')startSimpleNPC('npc-merchant',MERCHANT_LINES);
}

/* ── CANVAS BG ── */
const canvas=document.getElementById('canvas-bg'),ctx=canvas.getContext('2d');
const pts=[];
function resize(){canvas.width=innerWidth;canvas.height=innerHeight;}
resize();addEventListener('resize',resize);
function mkP(){return{x:Math.random()*canvas.width,y:canvas.height+10,vy:-(Math.random()*.5+.15),vx:(Math.random()-.5)*.25,r:Math.random()*1.6+.3,op:Math.random()*.28+.08,color:Math.random()>.5?'#3a5870':'#2a4060',life:0,maxLife:Math.random()*260+130,w:Math.random()*Math.PI*2};}
for(let i=0;i<50;i++){const p=mkP();p.y=Math.random()*canvas.height;p.life=Math.random()*p.maxLife;pts.push(p);}
function anim(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  pts.forEach((p,i)=>{
    p.life++;p.w+=.015;p.x+=p.vx+Math.sin(p.w)*.12;p.y+=p.vy;
    const lr=p.life/p.maxLife,fade=lr<.1?lr*10:lr>.8?(1-lr)*5:1;
    ctx.globalAlpha=p.op*fade;ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=4;
    ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    if(p.life>=p.maxLife||p.y<-10)pts[i]=mkP();
  });
  ctx.globalAlpha=1;requestAnimationFrame(anim);
}
anim();

/* ── Generate stars for village bg ── */
function buildStars(){
  const c=document.getElementById('vbg-stars');
  if(!c)return;
  c.innerHTML='';
  for(let i=0;i<60;i++){
    const s=document.createElement('span');
    s.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*50}%;animation-delay:${Math.random()*4}s;animation-duration:${2+Math.random()*3}s;opacity:${.3+Math.random()*.5};`;
    c.appendChild(s);
  }
}
buildStars();

/* ── RACE CAROUSEL ── */
let raceIdx=0;const RACES=4;
function slideRace(d){raceIdx=Math.max(0,Math.min(RACES-1,raceIdx+d));updateCarousel();}
function updateCarousel(){
  document.getElementById('race-track').style.transform=`translateX(-${raceIdx*100}%)`;
  document.querySelectorAll('#race-dots .c-dot').forEach((d,i)=>d.classList.toggle('active',i===raceIdx));
  document.getElementById('race-arr-l').classList.toggle('disabled',raceIdx===0);
  document.getElementById('race-arr-r').classList.toggle('disabled',raceIdx===RACES-1);
  document.getElementById('btn-race-next').disabled=raceIdx!==0;
  G.race=raceIdx;
}
updateCarousel();
function goToClass(){if(G.race===0)nextScreen('class');}

/* swipe race */
let tx=0;
const tw=document.getElementById('race-track').parentElement;
tw.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;},{passive:true});
tw.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-tx;if(Math.abs(dx)>40)slideRace(dx<0?1:-1);});

/* ── CLASS CAROUSEL ── */
let classIdx=0;const CLASSES=3;
function slideClass(d){classIdx=Math.max(0,Math.min(CLASSES-1,classIdx+d));updateClassCarousel();}
function updateClassCarousel(){
  document.getElementById('class-track').style.transform=`translateX(-${classIdx*100}%)`;
  document.querySelectorAll('#class-dots .c-dot').forEach((d,i)=>d.classList.toggle('active',i===classIdx));
  document.getElementById('class-arr-l').classList.toggle('disabled',classIdx===0);
  document.getElementById('class-arr-r').classList.toggle('disabled',classIdx===CLASSES-1);
}
updateClassCarousel();
let tcx=0;
const ctw=document.getElementById('class-track-wrap');
ctw.addEventListener('touchstart',e=>{tcx=e.touches[0].clientX;},{passive:true});
ctw.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-tcx;if(Math.abs(dx)>40)slideClass(dx<0?1:-1);});

function selectClass(cls){
  G.class=cls;
  document.querySelectorAll('.class-card-new').forEach(c=>c.classList.remove('selected'));
  const el=document.getElementById('cc-'+cls);if(el)el.classList.add('selected');
  document.getElementById('btn-class-next').disabled=false;
}

/* ── NAME ── */
function updateNameBtn(){G.name=document.getElementById('player-name-input').value.trim();document.getElementById('btn-name-next').disabled=G.name.length<2;}

/* ── VILLAGE ARRIVE — CINEMATIC ── */
function startVillageArrive(){
  nextScreen('village-arrive');
  // reset
  const title=document.getElementById('vi-title'),text=document.getElementById('vi-text'),btn=document.getElementById('vi-btn');
  title.classList.remove('show');text.classList.remove('show');text.innerHTML='';btn.classList.remove('show');
  // after 2s: show title
  setTimeout(()=>{
    title.classList.add('show');
    // then typewrite the intro
    setTimeout(()=>{
      text.classList.add('show');
      const msg='Às margens do Rio Ashfen, onde as águas escuras refletem um céu permanentemente encoberto, Cindermoor se recusa a desaparecer.\n\nVocê acorda aqui. A chuva de cinzas prateadas da noite passada ainda cobre as ruas. E você percebe: é o único na vila que ainda lembra dos últimos dez anos.';
      typewriteEl(text,msg,32,()=>{
        setTimeout(()=>btn.classList.add('show'),400);
      });
    },600);
  },2000);
}

let viTimer=null;
function typewriteEl(el,text,spd,done){
  if(viTimer){clearTimeout(viTimer);viTimer=null;}
  let i=0;
  // Build plain chars array — convert newlines to a marker
  const chars=text.split('');
  function render(upTo){
    let out='';
    for(let c=0;c<upTo;c++){
      out += chars[c]==='\n' ? '<br/>' : chars[c];
    }
    el.innerHTML=out;
  }
  function skip(){
    if(viTimer){clearTimeout(viTimer);viTimer=null;}
    el.onclick=null;
    render(chars.length);
    if(done)done();
  }
  el.onclick=skip;
  function step(){
    if(i<chars.length){
      i++;
      render(i);
      viTimer=setTimeout(step,spd);
    } else {
      viTimer=null;
      el.onclick=null;
      if(done)done();
    }
  }
  step();
}

/* ── WORLD SETUP ── */
function setupWorld(){
  const c=CLASS_DATA[G.class]||CLASS_DATA.warrior;
  const _e=id=>document.getElementById(id);
  if(_e('world-player-name')) _e('world-player-name').textContent=G.name||'HERÓI';
  if(_e('world-player-class')) _e('world-player-class').textContent='Humano · '+c.name;
  if(_e('hud-char-btn')) _e('hud-char-btn').textContent=c.avatar;
  if(G.notebook){
    const n=document.createElement('div');n.className='world-notif';n.textContent='📒 Caderno na mochila';
    document.getElementById('screen-world').appendChild(n);
    setTimeout(()=>n.remove(),3000);
  }
  // build inventory
  buildInventory();
}

/* ── OVERLAYS ── */
function openOverlay(id){document.getElementById('overlay-'+id).classList.add('active');}
function closeOverlay(id){document.getElementById('overlay-'+id).classList.remove('active');}

function openMap(){
  openOverlay('map');
  const om=document.getElementById('overlay-map');
  if(om) setBg(om,'mapa_cindermoor');
}
function openInventory(){
  openOverlay('inventory');
  buildInventory();
}
function openMenu(){openOverlay('menu');}
function openChar(){
  const c=CLASS_DATA[G.class]||CLASS_DATA.warrior;
  document.getElementById('char-portrait-icon').textContent=c.avatar;
  document.getElementById('char-class-badge').textContent=c.name.toUpperCase();
  document.getElementById('char-name-val').textContent=G.name||'HERÓI';
  document.getElementById('char-race-class').textContent='Humano · '+c.name;
  document.getElementById('char-class-desc').innerHTML=c.desc;
  document.getElementById('char-advantage').innerHTML=c.advantage;
  // build stat bars
  const sb=document.getElementById('char-stats');sb.innerHTML='';
  Object.entries(c.stats).forEach(([k,v])=>{
    sb.innerHTML+=`<div class="stat-item">
      <div class="stat-label">${k}</div>
      <div class="stat-bar-wrap"><div class="stat-bar-fill" style="width:${v*10}%"></div></div>
      <div class="stat-val">${v}/10</div>
    </div>`;
  });
  openOverlay('character');
}

/* ── MAP LOCATIONS ── */
const MAP_LOCS={
  overview:{name:'01 — VISTA GERAL DO VILAREJO',desc:'Visto de cima, Cindermoor parece um organismo vivo sem planejamento. Hoje não há fumaça saindo das chaminés. As pessoas estão nas ruas, mas em silêncio.',actions:[]},
  mainstreet:{name:'02 — RUA PRINCIPAL COM ALDEÕES',desc:'Aldeões caminham em padrões estranhos, seguindo rotas memorizadas. 📖 Maren Dusk está à sua direita.',actions:[{l:'📖 Falar com Maren Dusk',f:'goToNPC1'}]},
  river:{name:'03 — MARGEM DO RIO ASHFEN',desc:'O Rio Ashfen corre mais escuro. Uma criança desenha repetidamente o mesmo símbolo na lama. Não olha para cima.',actions:[]},
  tavern:{name:'04 — TAVERNA DA VILA',desc:'Seis homens jogam cartas com os mesmos movimentos, rindo nas mesmas pausas. Uma partida que ninguém lembra quando começou.',actions:[]},
  'east-exit':{name:'05 — SAÍDA LESTE DA VILA',desc:'O início da Floresta de Vel\'Shara. Uma linha escura no horizonte que parece se mover. 🛡️ Cael do Portão está aqui.',actions:[{l:'🛡️ Falar com Cael do Portão',f:'goToNPC2'},{l:'🌲 Entrar na floresta',f:'goToForest'}]},
  merchant:{name:'06 — MERCADOR DA VILA',desc:'Brin Ashfold: "Erva de Cinza Prateada — três moedas." Você recusa. Ele vira, pausa, vira novamente: "Erva de Cinza Prateada — três moedas."',actions:[]}
};

function goToNPC1(){
  const wbg=document.getElementById('world-bg');
  if(wbg) wbg.style.setProperty('background-image','');
  closeOverlay('map');nextScreen('npc1');
}
function goToNPC2(){closeOverlay('map');nextScreen('npc2');}
function goToForest(){closeOverlay('map');nextScreen('forest');}

const LOC_IMAGES={"overview": "vista_vila", "mainstreet": "rua_principal", "river": "vista_vila", "tavern": "taverna", "merchant": "mercador", "east-exit": "rua_principal"};
function selectMapPin(id){
  const loc=MAP_LOCS[id];if(!loc)return;
  document.getElementById('map-info-name').textContent=loc.name;
  document.getElementById('map-info-desc').textContent=loc.desc;
  const acts=document.getElementById('map-info-actions');acts.innerHTML='';
  loc.actions.forEach(a=>{
    const b=document.createElement('button');
    b.className='btn btn-ice';b.style.cssText='font-size:clamp(7px,1.2vw,9px);padding:8px 14px;';
    b.textContent=a.l;b.onclick=window[a.f];acts.appendChild(b);
  });
  // Update world background image
  const imgKey=LOC_IMAGES[id]||'vista_vila';
  const wbg=document.getElementById('world-bg');
  setBg(document.getElementById('world-bg'), imgKey);
  // Store selected location
  G.currentLoc=id;
}

/* ── INVENTORY BUILD ── */
function buildInventory(){
  const grid=document.getElementById('inv-grid');grid.innerHTML='';
  // slot 0 = notebook if collected
  for(let i=0;i<20;i++){
    const s=document.createElement('div');s.className='inv-slot';
    if(i===0&&G.notebook){
      s.classList.add('filled');s.innerHTML='📒';s.title='Caderno de Maren Dusk';
      s.onclick=()=>{document.getElementById('inv-tooltip').textContent='📒 Caderno de Maren Dusk — Três anos de observações sobre as Centelhas extintas.';};
    } else {
      s.innerHTML=`<span class="inv-slot-label">${String(i+1).padStart(2,'0')}</span>`;
      s.onclick=()=>{document.getElementById('inv-tooltip').textContent='Slot vazio.';};
    }
    grid.appendChild(s);
  }
}

/* ── TYPEWRITER (dialogue) ── */
let twt=null;
function typewrite(el,text,spd,done){
  if(twt)clearTimeout(twt);el.innerHTML='';let i=0;
  const cur='<span class="dialogue-cursor"></span>';
  function step(){if(i<text.length){el.innerHTML=text.slice(0,i+1)+cur;i++;twt=setTimeout(step,spd||26);}else{el.innerHTML=text;if(done)done();}}
  step();
}

/* ── NPC1 ── */
const N1=['Você ainda escolhe o que diz antes de dizer. Eu noto isso agora — é a primeira coisa que observo em alguém. Quarenta por cento das pessoas nessa cidade já não fazem mais isso.','Peguei este caderno. São três anos de observações. Não sei o que fazer com ele — não consigo mais escrever sem saber quem vai ler. Mas você tem Centelha. Isso significa que você vai a algum lugar. Leva.','Há algo no sul — onde a floresta começa. Pessoas que voltam de lá falam de uma luz entre as raízes. As que foram mais fundo... não voltaram para contar.'];
let n1i=0,n1t=false;
function startNPC1(){n1i=0;n1t=true;document.getElementById('npc1-choices').style.display='none';document.getElementById('npc1-next-btn').style.display='none';typewrite(document.getElementById('npc1-text'),N1[0],24,()=>{n1t=false;document.getElementById('npc1-next-btn').style.display='flex';});}
function advanceNPC1(){
  const el=document.getElementById('npc1-text'),nb=document.getElementById('npc1-next-btn'),ch=document.getElementById('npc1-choices');
  if(n1t){if(twt)clearTimeout(twt);el.innerHTML=N1[n1i];n1t=false;nb.style.display='flex';return;}
  n1i++;
  if(n1i<N1.length){nb.style.display='none';n1t=true;if(n1i===N1.length-1)nb.textContent='► RECEBER O CADERNO';typewrite(el,N1[n1i],24,()=>{n1t=false;nb.style.display='flex';});}
  else{nb.style.display='none';G.notebook=true;buildInventory();showNotif('📒','Item Recebido','Caderno de Maren Dusk');
    ch.style.display='flex';ch.innerHTML=`<div class="choice-btn" onclick="nextScreen('world')">"Obrigado. Vou descobrir o que está acontecendo."</div><div class="choice-btn" onclick="nextScreen('world')">"Por que você ainda tem Centelha, Maren?"</div>`;}
}

/* ── NPC2 ── */
const N2=['Tô vendo a bolsa. Tô vendo a postura. Você tá indo para o sul.','Deixa eu te contar sobre Derin. Bom guerreiro. Foi para o sul há quatro meses porque a filha dele sumiu lá. Voltou em duas semanas — mas Derin não voltou. O corpo voltou.','Toda vez que pergunto o que ele encontrou, ele começa uma frase diferente e termina a mesma: "não era o que eu esperava". Sempre essas palavras. Como se estivesse lendo de algum lugar.','O mundo lá fora não vai te matar necessariamente. Às vezes faz algo pior. Vai com isso em mente.'];
let n2i=0,n2t=false;
function startNPC2(){n2i=0;n2t=true;document.getElementById('npc2-choices').style.display='none';document.getElementById('npc2-next-btn').style.display='none';typewrite(document.getElementById('npc2-text'),N2[0],26,()=>{n2t=false;document.getElementById('npc2-next-btn').style.display='flex';});}
function advanceNPC2(){
  const el=document.getElementById('npc2-text'),nb=document.getElementById('npc2-next-btn'),ch=document.getElementById('npc2-choices');
  if(n2t){if(twt)clearTimeout(twt);el.innerHTML=N2[n2i];n2t=false;nb.style.display='flex';return;}
  n2i++;
  if(n2i<N2.length){nb.style.display='none';n2t=true;typewrite(el,N2[n2i],26,()=>{n2t=false;nb.style.display='flex';});}
  else{nb.style.display='none';ch.style.display='flex';ch.innerHTML=`<div class="choice-btn" onclick="nextScreen('forest')">"Entendido. Mas alguém tem que ir."</div><div class="choice-btn" onclick="nextScreen('forest')">"O que você teria feito diferente?"</div>`;}
}

['npc-overview','npc-tavern','npc-merchant'].forEach(id=>{
  const sc=document.getElementById('screen-'+id);
  if(sc) sc.querySelector('.dialogue-scene').addEventListener('click',()=>{
    const nb=document.getElementById(id+'-next');
    if(nb&&nb.style.display!=='none')nb.click();
  });
});
document.getElementById('screen-npc1').querySelector('.dialogue-scene').addEventListener('click',()=>{if(document.getElementById('npc1-next-btn').style.display!=='none')advanceNPC1();else if(n1t)advanceNPC1();});
document.getElementById('screen-npc2').querySelector('.dialogue-scene').addEventListener('click',()=>{if(document.getElementById('npc2-next-btn').style.display!=='none')advanceNPC2();else if(n2t)advanceNPC2();});

function showNotif(icon,title,name){const el=document.createElement('div');el.className='item-notification';el.innerHTML=`<div class="item-notification-title">${icon} ${title}</div><div class="item-notification-name">${name}</div>`;document.body.appendChild(el);setTimeout(()=>el.remove(),3700);}

/* ── EXTRA NPC ROUTES ── */
function goToOverviewNPC(){closeOverlay('map');nextScreen('npc-overview');}
function goToTavernNPC(){closeOverlay('map');nextScreen('npc-tavern');}
function goToMerchantNPC(){closeOverlay('map');nextScreen('npc-merchant');}

/* ── RESTART ── */
/* ── SIMPLE NPC DIALOGUE RUNNER ── */
function startSimpleNPC(screenId, lines){
  const el=document.getElementById(screenId+'-text');
  const nb=document.getElementById(screenId+'-next');
  const ch=document.getElementById(screenId+'-choices');
  let idx=0; let typing=false; let timer=null;
  ch.style.display='none'; nb.style.display='none';
  function show(i){
    nb.style.display='none'; typing=true;
    typewrite(el, lines[i].text, 24, ()=>{
      typing=false;
      nb.textContent=lines[i].last?'► FECHAR':'► CONTINUAR';
      nb.style.display='flex';
    });
  }
  nb.onclick=function(){
    if(typing){if(timer)clearTimeout(timer);el.innerHTML=lines[idx].text;typing=false;nb.textContent=lines[idx].last?'► FECHAR':'► CONTINUAR';nb.style.display='flex';return;}
    idx++;
    if(idx<lines.length) show(idx);
    else nextScreen('world');
  };
  show(0);
}

function restartGame(){
  G.race=0;G.class=null;G.name='';G.notebook=false;
  raceIdx=0;updateCarousel();classIdx=0;updateClassCarousel();
  document.getElementById('player-name-input').value='';
  document.getElementById('btn-name-next').disabled=true;
  document.getElementById('btn-class-next').disabled=true;
  document.querySelectorAll('.class-card-new').forEach(c=>c.classList.remove('selected'));
  document.querySelectorAll('.overlay').forEach(o=>o.classList.remove('active'));
  nextScreen('title');
}

nextScreen('title');
