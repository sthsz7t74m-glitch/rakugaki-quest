(() => {
  'use strict';

  const SAVE_KEY = 'rakugakiQuestSaveV1';
  const CHAPTERS = [
    { id:1, start:1, end:10, name:'消えかけたノート', short:'消えかけ', theme:'theme-1', enemies:['ケシカスライム','折れ芯コロコロ','まちがいムシ'], boss:'ヌリツブシ王', reward:{ink:50,parts:5,xp:25} },
    { id:2, start:11, end:20, name:'罫線の森', short:'罫線の森', theme:'theme-2', enemies:['定規イモムシ','ふせんコウモリ','ホチキス草'], boss:'ビリビリ先生', reward:{ink:100,parts:10,xp:45} },
    { id:3, start:21, end:30, name:'色ぬすみの机', short:'色ぬすみ', theme:'theme-3', enemies:['インクモドキ','白紙ゴースト','クレヨン泥棒'], boss:'マッシロ大魔王', reward:{ink:180,parts:20,xp:80} }
  ];
  const CARDS = [
    { id:'power', name:'ごんぶと線', icon:'✎', rarity:'通常', desc:'攻撃力が30%アップ', effect:s=>s.attack*=1.3 },
    { id:'haste', name:'早描き', icon:'⌁', rarity:'通常', desc:'攻撃速度が25%アップ', effect:s=>s.interval*=.75 },
    { id:'heart', name:'赤ペンハート', icon:'♥', rarity:'通常', desc:'最大HP+35、全回復', effect:s=>{s.maxHp+=35;s.hp=s.maxHp} },
    { id:'guard', name:'ねり消しガード', icon:'▱', rarity:'レア', desc:'受けるダメージを25%軽減', effect:s=>s.guard=Math.min(.65,s.guard+.25) },
    { id:'critical', name:'定規スマッシュ', icon:'📏', rarity:'レア', desc:'25%で2.2倍ダメージ', effect:s=>s.crit=Math.min(.65,s.crit+.25) },
    { id:'heal', name:'修正テープ', icon:'＋', rarity:'レア', desc:'攻撃ごとにHPを3回復', effect:s=>s.leech+=3 },
    { id:'double', name:'二刀流えんぴつ', icon:'✐', rarity:'伝説', desc:'35%で追撃が発生', effect:s=>s.double=Math.min(.85,s.double+.35) },
    { id:'rainbow', name:'七色クレヨン', icon:'🌈', rarity:'伝説', desc:'全能力が少しアップ', effect:s=>{s.attack*=1.18;s.maxHp+=20;s.hp+=20;s.interval*=.9} },
    { id:'eraser', name:'巨大消しゴム', icon:'▰', rarity:'伝説', desc:'ボスへのダメージ+70%', effect:s=>s.bossBonus+=.7 }
  ];
  const FACILITIES = [
    {id:'ink',name:'インク工房',icon:'●',color:'#d9d3cc',desc:'インクを毎分2個つくる'},
    {id:'parts',name:'文房具工房',icon:'✂',color:'#ffdbaa',desc:'強化素材を毎分1個つくる'},
    {id:'xp',name:'スケッチ広場',icon:'☆',color:'#cde1ff',desc:'経験値を毎分2獲得'},
    {id:'treasure',name:'宝探し机',icon:'?',color:'#d8f3dc',desc:'インク中心のランダム報酬'}
  ];
  const TUTORIAL = [
    {icon:'📓',kicker:'はじめに',title:'消えかけた世界を描き直そう',copy:'ノートから色が消え、落書きたちも元気をなくしています。\nあなたが描いた主人公と一緒に、全30ステージを進みましょう。'},
    {icon:'✎',kicker:'STEP 1',title:'主人公を自由に描く',copy:'名前をつけ、指やマウスで主人公を描きます。\n大きさや形で強さは変わらないので、好きな姿で大丈夫です。'},
    {icon:'⚔',kicker:'STEP 2',title:'戦闘はゆっくり自動進行',copy:'主人公と敵は自動で戦います。まずは見守るだけでOK。\n10ステージごとにボスが待っています。'},
    {icon:'💡',kicker:'STEP 3',title:'ひらめきを1つ選ぶ',copy:'通常戦のあと、3枚の強化から1枚を選びます。\nこの効果はその冒険中だけ。組み合わせてボス対策を作りましょう。'},
    {icon:'↗',kicker:'STEP 4',title:'帰還して永久に強くなる',copy:'経験値のレベルアップと「主人公の育成」は次の冒険にも残ります。\n負けても素材を持ち帰れるので、育てて再挑戦しましょう。'}
  ];

  const defaultSave = () => ({
    ink:0, parts:0, xp:0, heroLevel:1, heroName:'ななしのラクガキ', heroImage:'', bestStage:0,
    baseLevel:1, assigned:['ink'], lastClaim:Date.now(), discovered:[], bossSeen:{},
    growth:{power:0,vitality:0,focus:0}, tutorialSeen:false
  });
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  let data = load();
  let run = null;
  let battleTimer = null;
  let draw = {color:'#222222',width:8,eraser:false,drawing:false,history:[]};
  let audioCtx = null;
  let lockedScrollY = 0;
  let tutorialIndex = 0;
  let tutorialFirstRun = false;

  function load(){
    try{
      const raw = JSON.parse(localStorage.getItem(SAVE_KEY)||'{}');
      const merged = {...defaultSave(),...raw};
      merged.growth = {...defaultSave().growth,...(raw.growth||{})};
      merged.bossSeen = typeof raw.bossSeen === 'object' && raw.bossSeen ? raw.bossSeen : (raw.bossSeen?{1:true}:{});
      merged.assigned = Array.isArray(merged.assigned) && merged.assigned.length ? merged.assigned : ['ink'];
      merged.discovered = Array.isArray(merged.discovered) ? merged.discovered : [];
      return merged;
    }catch{return defaultSave()}
  }
  function save(){localStorage.setItem(SAVE_KEY,JSON.stringify(data));renderHeader()}
  function xpNeeded(){return data.heroLevel*25}
  function currentChapter(){
    const stage = data.bestStage>=30 ? 30 : data.bestStage>=20 ? 21 : data.bestStage>=10 ? 11 : 1;
    return chapterFor(stage);
  }
  function chapterFor(stage){return CHAPTERS.find(ch=>stage>=ch.start&&stage<=ch.end)||CHAPTERS[2]}
  function startingStats(){
    return {
      maxHp:100+(data.heroLevel-1)*8+data.growth.vitality*12,
      attack:13+(data.heroLevel-1)+data.growth.power*2,
      crit:Math.min(.45,.08+data.growth.focus*.015)
    };
  }
  function renderHeader(){
    const chapter=currentChapter(),need=xpNeeded(),stats=startingStats();
    $('#ink-count').textContent=Math.floor(data.ink);$('#parts-count').textContent=Math.floor(data.parts);
    $('#hero-level').textContent=data.heroLevel;$('#hero-name').textContent=data.heroName;$('#battle-hero-name').textContent=data.heroName;
    $('#best-stage').textContent=data.bestStage;$('#chapter-progress').style.width=`${Math.min(100,data.bestStage/30*100)}%`;
    $('#home-chapter-number').textContent=`CHAPTER ${chapter.id}${data.bestStage>=30?' / CLEAR':''}`;$('#home-chapter-name').textContent=chapter.name;
    $('#hero-xp-copy').textContent=`EXP ${Math.floor(data.xp)} / ${need}`;$('#hero-xp-bar').style.width=`${Math.min(100,data.xp/need*100)}%`;
    $('#card-count-copy').textContent=`強化 ${data.discovered.length} / ${CARDS.length}`;
    $('#growth-summary').textContent=`HP ${stats.maxHp}・攻撃 ${stats.attack}・会心 ${Math.round(stats.crit*100)}%`;
    const map=$('#chapter-map');map.innerHTML='';
    CHAPTERS.forEach(ch=>{const node=document.createElement('span');const cleared=data.bestStage>=ch.end,current=chapter.id===ch.id;node.className=`chapter-node ${cleared?'cleared':''} ${current?'current':''}`;node.innerHTML=`<b>${cleared?'✓ ':''}${ch.id}. ${ch.short}</b>${ch.start}–${ch.end}`;map.appendChild(node)});
    renderHeroPreview();
  }
  function showView(id){$$('.view').forEach(view=>view.classList.toggle('active',view.id===id));window.scrollTo(0,0)}
  function syncModalLock(){
    const hasOpen=$$('.modal.open').length>0;
    if(hasOpen&&!document.body.classList.contains('modal-open')){lockedScrollY=window.scrollY;document.body.style.top=`-${lockedScrollY}px`;document.body.classList.add('modal-open')}
    if(!hasOpen&&document.body.classList.contains('modal-open')){document.body.classList.remove('modal-open');document.body.style.top='';window.scrollTo(0,lockedScrollY)}
  }
  function openModal(id){const modal=$(id);modal.classList.add('open');modal.setAttribute('aria-hidden','false');syncModalLock()}
  function closeModal(id){const modal=$(id);modal.classList.remove('open');modal.setAttribute('aria-hidden','true');syncModalLock()}
  function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(el._timer);el._timer=setTimeout(()=>el.classList.remove('show'),1900)}
  function tone(freq=340,duration=.06,type='square'){
    try{audioCtx??=new (window.AudioContext||window.webkitAudioContext)();const oscillator=audioCtx.createOscillator(),gain=audioCtx.createGain();oscillator.type=type;oscillator.frequency.value=freq;gain.gain.setValueAtTime(.035,audioCtx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+duration);oscillator.connect(gain).connect(audioCtx.destination);oscillator.start();oscillator.stop(audioCtx.currentTime+duration)}catch{}
  }

  function drawDefaultHero(ctx,w,h){
    ctx.clearRect(0,0,w,h);ctx.save();ctx.translate(w/2,h*.52);ctx.strokeStyle='#24211f';ctx.fillStyle='#fff';ctx.lineWidth=Math.max(5,w/55);ctx.lineCap='round';ctx.lineJoin='round';
    ctx.beginPath();ctx.arc(0,-h*.18,w*.105,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,-h*.07);ctx.lineTo(0,h*.19);ctx.moveTo(0,0);ctx.lineTo(-w*.17,h*.07);ctx.moveTo(0,0);ctx.lineTo(w*.17,-h*.02);ctx.moveTo(0,h*.18);ctx.lineTo(-w*.12,h*.35);ctx.moveTo(0,h*.18);ctx.lineTo(w*.14,h*.35);ctx.stroke();
    ctx.fillStyle='#24211f';ctx.beginPath();ctx.arc(-w*.04,-h*.2,3,0,7);ctx.arc(w*.04,-h*.2,3,0,7);ctx.fill();ctx.beginPath();ctx.arc(0,-h*.15,w*.04,0,Math.PI);ctx.stroke();
    ctx.strokeStyle='#ef476f';ctx.lineWidth=Math.max(4,w/70);ctx.beginPath();ctx.moveTo(w*.17,-h*.02);ctx.lineTo(w*.28,-h*.2);ctx.stroke();ctx.restore();
  }
  function renderHeroPreview(){const canvas=$('#hero-preview'),ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);if(data.heroImage){const img=new Image();img.onload=()=>ctx.drawImage(img,0,0,canvas.width,canvas.height);img.src=data.heroImage}else drawDefaultHero(ctx,canvas.width,canvas.height)}
  function heroSrc(){if(data.heroImage)return data.heroImage;const canvas=document.createElement('canvas');canvas.width=320;canvas.height=300;drawDefaultHero(canvas.getContext('2d'),320,300);return canvas.toDataURL()}
  function openDrawing(){openModal('#draw-modal');setTimeout(initDrawing,20)}
  function initDrawing(){
    const canvas=$('#draw-canvas'),ctx=canvas.getContext('2d');ctx.lineCap='round';ctx.lineJoin='round';draw.history=[];draw.drawing=false;
    const reset=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);if(data.heroImage){const img=new Image();img.onload=()=>{ctx.drawImage(img,0,0,canvas.width,canvas.height);pushHistory()};img.src=data.heroImage}else pushHistory()};
    reset();$('#name-input').value=data.heroName==='ななしのラクガキ'?'':data.heroName;
    const pos=e=>{const rect=canvas.getBoundingClientRect();return{x:(e.clientX-rect.left)*canvas.width/rect.width,y:(e.clientY-rect.top)*canvas.height/rect.height}};
    const start=e=>{e.preventDefault();canvas.setPointerCapture?.(e.pointerId);draw.drawing=true;const point=pos(e);ctx.beginPath();ctx.moveTo(point.x,point.y)};
    const move=e=>{if(!draw.drawing)return;e.preventDefault();const point=pos(e);ctx.globalCompositeOperation=draw.eraser?'destination-out':'source-over';ctx.strokeStyle=draw.color;ctx.lineWidth=draw.eraser?32:draw.width;ctx.lineTo(point.x,point.y);ctx.stroke()};
    const end=e=>{if(!draw.drawing)return;e?.preventDefault();draw.drawing=false;ctx.closePath();ctx.globalCompositeOperation='source-over';if(e?.pointerId!=null&&canvas.hasPointerCapture?.(e.pointerId))canvas.releasePointerCapture(e.pointerId);pushHistory();tone(250,.04,'sine')};
    canvas.onpointerdown=start;canvas.onpointermove=move;canvas.onpointerup=end;canvas.onpointercancel=end;canvas.onlostpointercapture=end;
    if(!canvas.dataset.touchGuard){canvas.addEventListener('touchstart',e=>e.preventDefault(),{passive:false});canvas.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});canvas.dataset.touchGuard='true'}
    function pushHistory(){draw.history.push(canvas.toDataURL());if(draw.history.length>20)draw.history.shift()}
    draw.pushHistory=pushHistory;
  }

  function beginRun(){
    if(!data.heroImage){openDrawing();toast('まずは主人公を描こう！');return}
    const chapter=currentChapter(),stats=startingStats();
    run={stage:chapter.start,startStage:chapter.start,hp:stats.maxHp,maxHp:stats.maxHp,attack:stats.attack,interval:1450,guard:0,crit:stats.crit,leech:0,double:0,bossBonus:0,ideas:0,cards:[],enemyHp:0,enemyMaxHp:0,active:false,speed:1};
    showView('battle-view');prepareBattle();
  }
  function prepareBattle(){
    clearTimeout(battleTimer);const chapter=chapterFor(run.stage),boss=run.stage===chapter.end;
    const hp=Math.round(boss?110+run.stage*8:32+run.stage*4.5);
    run.enemyHp=run.enemyMaxHp=hp;run.active=false;
    $('#stage-number').textContent=run.stage;$('#battle-chapter').textContent=`CHAPTER ${chapter.id}・${chapter.name}`;
    $('#enemy-name').textContent=boss?chapter.boss:chapter.enemies[(run.stage-chapter.start)%chapter.enemies.length];
    const scene=$('#battle-scene');scene.classList.remove('theme-1','theme-2','theme-3');scene.classList.add(chapter.theme);
    $('#enemy-fighter').classList.toggle('boss',boss);$('#battle-action').disabled=true;$('#battle-action').textContent='戦闘中…';$('#battle-hero').src=heroSrc();updateBattleUI();
    if(boss&&!data.bossSeen[chapter.id]){showDialog(bossIntro(chapter),()=>{data.bossSeen[chapter.id]=true;save();startBattle()})}else startBattle();
  }
  function bossIntro(chapter){
    const lines={
      1:[[chapter.boss,'見つけたぞ……このノートに色をつける不届き者め！'],[data.heroName,'えっ。色鉛筆、貸してほしいの？'],[chapter.boss,'ちがーう！ぜんぶ黒く塗るのだ！']],
      2:[[chapter.boss,'罫線からはみ出す者は、ビリビリにしてやる！'],[data.heroName,'はみ出した線のほうが、なんか元気じゃない？'],[chapter.boss,'ルール違反だー！']],
      3:[[chapter.boss,'色はぜんぶ私が隠した。ここから先は真っ白だ！'],[data.heroName,'じゃあ、また描けばいい。'],[chapter.boss,'その鉛筆を止めてみせる！']]
    };return lines[chapter.id];
  }
  function startBattle(){
    run.active=true;
    const loop=()=>{if(!run?.active)return;playerAttack();battleTimer=setTimeout(enemyAttack,Math.max(320,620/run.speed))};
    battleTimer=setTimeout(loop,700/run.speed);run.loop=loop;
  }
  function playerAttack(){
    if(!run?.active)return;const chapter=chapterFor(run.stage),boss=run.stage===chapter.end;let damage=run.attack*(boss?1+run.bossBonus:1);const critical=Math.random()<run.crit;if(critical)damage*=2.2;damage=Math.round(damage);run.enemyHp=Math.max(0,run.enemyHp-damage);run.hp=Math.min(run.maxHp,run.hp+run.leech);animateHit('player',critical?`会心 ${damage}!`:`${damage}`);tone(critical?520:330,.075,critical?'sawtooth':'square');
    if(Math.random()<run.double&&run.enemyHp>0){run.enemyHp=Math.max(0,run.enemyHp-Math.round(run.attack*.75));setTimeout(()=>splash('追撃！'),160)}updateBattleUI();
    if(run.enemyHp<=0){winBattle();return}battleTimer=setTimeout(run.loop,run.interval/run.speed);
  }
  function enemyAttack(){
    if(!run?.active)return;const damage=Math.max(1,Math.round((4+run.stage*.25)*(1-run.guard)));run.hp=Math.max(0,run.hp-damage);animateHit('enemy',`${damage}`);tone(145,.1,'sawtooth');updateBattleUI();if(run.hp<=0)loseRun();
  }
  function animateHit(side,text){const attacker=$(side==='player'?'#player-fighter':'#enemy-fighter'),target=$(side==='player'?'#enemy-fighter':'#player-fighter');attacker.classList.add(side==='player'?'player-attack':'enemy-attack');setTimeout(()=>{attacker.classList.remove('player-attack','enemy-attack');target.classList.add('hit');splash(text);setTimeout(()=>target.classList.remove('hit'),360)},210)}
  function splash(text){const el=$('#battle-splash');el.textContent=text;el.classList.remove('show');void el.offsetWidth;el.classList.add('show')}
  function updateBattleUI(){
    if(!run)return;$('#player-hp-text').textContent=`${Math.ceil(run.hp)} / ${run.maxHp}`;$('#enemy-hp-text').textContent=`${Math.ceil(run.enemyHp)} / ${run.enemyMaxHp}`;
    $('#player-hp-bar').style.width=`${Math.max(0,100*run.hp/run.maxHp)}%`;$('#enemy-hp-bar').style.width=`${Math.max(0,100*run.enemyHp/run.enemyMaxHp)}%`;
    $('#attack-stat').textContent=Math.round(run.attack);$('#speed-stat').textContent=(1450/run.interval).toFixed(1);$('#idea-count').textContent=run.ideas;
  }
  function winBattle(){
    run.active=false;clearTimeout(battleTimer);const chapter=chapterFor(run.stage),boss=run.stage===chapter.end;
    data.bestStage=Math.max(data.bestStage,run.stage);data.ink+=3+Math.ceil(run.stage/4);data.xp+=5+chapter.id*2;levelCheck();save();splash('CLEAR!');
    if(boss){setTimeout(()=>showDialog([[chapter.boss,bossOutro(chapter.id)],[data.heroName,'このノートにも、色が戻ってきた！']],()=>finishChapter(chapter)),900);return}
    setTimeout(showCardChoices,900);
  }
  function bossOutro(id){return id===1?'ま、まぶしい……！色って、ちょっと良いかも……':id===2?'はみ出した線も……悪くないのかもしれない。':'真っ白だった机が……こんなににぎやかになるとは。'}
  function showCardChoices(){
    const choices=[...CARDS].sort(()=>Math.random()-.5).slice(0,3),box=$('#card-options');box.innerHTML='';
    choices.forEach(card=>{const button=document.createElement('button');button.className=`choice-card ${card.rarity==='レア'?'rare':card.rarity==='伝説'?'legend':''}`;button.innerHTML=`<span class="card-emoji">${card.icon}</span><span><b>${card.name}</b><small>${card.desc}</small></span><i>›</i>`;button.onclick=()=>{card.effect(run);run.ideas++;run.cards.push(card.id);if(!data.discovered.includes(card.id))data.discovered.push(card.id);save();closeModal('#card-modal');run.stage++;run.hp=Math.min(run.maxHp,run.hp+Math.round(run.maxHp*.15));prepareBattle()};box.appendChild(button)});openModal('#card-modal');
  }
  function loseRun(){
    run.active=false;clearTimeout(battleTimer);const bonus=2+chapterFor(run.stage).id*2;data.ink+=bonus;save();$('#battle-action').disabled=false;$('#battle-action').textContent=`拠点へ戻る（インク +${bonus}）`;$('#battle-action').onclick=()=>{run=null;showView('home-view');renderHeader()};splash('敗北…');
  }
  function finishChapter(chapter){
    data.ink+=chapter.reward.ink;data.parts+=chapter.reward.parts;data.xp+=chapter.reward.xp;levelCheck();save();run.active=false;
    $('#chapter-clear-kicker').textContent=chapter.id===3?'ALL STAGES CLEAR!':'CHAPTER CLEAR!';$('#chapter-clear-icon').textContent=chapter.id===3?'★':'✓';
    $('#chapter-clear-title').textContent=chapter.id===3?'世界に色が戻った！':`CHAPTER ${chapter.id+1} が開いた！`;
    $('#chapter-clear-copy').textContent=chapter.id===3?'全30ステージをクリアしました。育てた主人公で、好きな章を何度でも遊べます。':`「${chapter.name}」を突破。次は「${CHAPTERS[chapter.id].name}」へ進めます。`;
    $('#chapter-rewards').innerHTML=`<span>● インク +${chapter.reward.ink}</span><span>✂ 素材 +${chapter.reward.parts}</span><span>☆ EXP +${chapter.reward.xp}</span>`;
    closeModal('#dialog-modal');openModal('#chapter-modal');
  }
  function showDialog(lines,done){let index=0;const next=()=>{if(index>=lines.length){closeModal('#dialog-modal');done();return}const [speaker,text]=lines[index++];$('#dialog-speaker').textContent=speaker;$('#dialog-text').textContent=text;$('#dialog-portrait').textContent=speaker===data.heroName?'✎':'?';tone(230+index*30,.04,'triangle')};$('#dialog-next').onclick=next;openModal('#dialog-modal');next()}
  function levelCheck(){let leveled=false;while(data.xp>=xpNeeded()){data.xp-=xpNeeded();data.heroLevel++;leveled=true}if(leveled)toast(`主人公が Lv.${data.heroLevel} になった！`)}

  function renderGrowth(){
    const stats=startingStats();$('#growth-hero-level').textContent=data.heroLevel;$('#growth-total-hp').textContent=stats.maxHp;$('#growth-total-attack').textContent=stats.attack;
    const defs={power:{max:20,currency:'ink',base:25,step:30,label:'インク'},vitality:{max:20,currency:'ink',base:25,step:30,label:'インク'},focus:{max:10,currency:'parts',base:2,step:2,label:'素材'}};
    Object.entries(defs).forEach(([id,def])=>{const level=data.growth[id],cost=def.base+level*def.step;const button=$(`[data-growth="${id}"]`);$(`#${id==='vitality'?'vitality':id}-level`).textContent=level;$(`#${id}-cost`).textContent=level>=def.max?'MAX':`${def.label} ${cost}`;button.disabled=level>=def.max;button.dataset.cost=cost;button.dataset.currency=def.currency});
  }
  function upgradeGrowth(id){
    const button=$(`[data-growth="${id}"]`),cost=Number(button.dataset.cost),currency=button.dataset.currency;if(button.disabled)return;
    if(data[currency]<cost){toast(`${currency==='ink'?'インク':'素材'}が${Math.ceil(cost-data[currency])}足りません`);return}data[currency]-=cost;data.growth[id]++;save();renderGrowth();tone(540,.12,'triangle');toast('永久能力が強くなった！');
  }
  function renderBase(){
    $('#base-level').textContent=data.baseLevel;const cost=40+(data.baseLevel-1)*35;$('#upgrade-cost').textContent=`インク ${cost}`;const list=$('#facility-list');list.innerHTML='';
    FACILITIES.forEach(f=>{const assigned=data.assigned.includes(f.id),el=document.createElement('article');el.className='facility';el.innerHTML=`<span class="facility-icon" style="--facility-color:${f.color}">${f.icon}</span><div><b>${f.name}</b><small>${f.desc}</small></div><button class="${assigned?'assigned':''}">${assigned?'稼働中':'配置'}</button>`;el.querySelector('button').onclick=()=>toggleFacility(f.id);list.appendChild(el)});updateOfflineTime();
  }
  function slots(){return data.baseLevel>=10?3:data.baseLevel>=5?2:1}
  function toggleFacility(id){const index=data.assigned.indexOf(id);if(index>=0){if(data.assigned.length===1){toast('1つは稼働させておこう');return}data.assigned.splice(index,1)}else{if(data.assigned.length>=slots()){toast(`配置枠は${slots()}つです`);return}data.assigned.push(id)}save();renderBase()}
  function pendingMinutes(){return Math.min(720,Math.max(0,(Date.now()-data.lastClaim)/60000))}
  function updateOfflineTime(){const mins=Math.floor(pendingMinutes()),hours=String(Math.floor(mins/60)).padStart(2,'0'),minutes=String(mins%60).padStart(2,'0');$('#offline-time').textContent=`${hours}:${minutes}`}
  function claimOffline(){
    const mins=pendingMinutes();if(mins<.2){toast('まだ報酬はたまっていません');return}const message=[];
    data.assigned.forEach(id=>{if(id==='ink'){const n=Math.max(1,Math.floor(mins*2));data.ink+=n;message.push(`インク+${n}`)}if(id==='parts'){const n=Math.max(1,Math.floor(mins));data.parts+=n;message.push(`素材+${n}`)}if(id==='xp'){const n=Math.max(1,Math.floor(mins*2));data.xp+=n;message.push(`経験値+${n}`)}if(id==='treasure'){const n=Math.max(1,Math.floor(mins*(1+Math.random()*2)));data.ink+=n;message.push(`宝インク+${n}`)}});
    data.lastClaim=Date.now();levelCheck();save();renderBase();toast(message.join(' / '));
  }
  function upgradeBase(){const cost=40+(data.baseLevel-1)*35;if(data.baseLevel>=20){toast('拠点は最大レベルです');return}if(data.ink<cost){toast(`インクが${Math.ceil(cost-data.ink)}足りません`);return}data.ink-=cost;data.baseLevel++;save();renderBase();toast(`拠点が Lv.${data.baseLevel} になった！`)}
  function renderCollection(){const grid=$('#collection-grid');grid.innerHTML='';$('#collection-total').textContent=`${data.discovered.length}/${CARDS.length}`;CARDS.forEach(card=>{const unlocked=data.discovered.includes(card.id),el=document.createElement('article');el.className=`collection-item ${unlocked?'':'locked'}`;el.innerHTML=`<span class="rarity">${unlocked?card.rarity:'？？？'}</span><span class="card-emoji">${unlocked?card.icon:'?'}</span><b>${unlocked?card.name:'未発見'}</b><small>${unlocked?card.desc:'冒険で見つけよう'}</small>`;grid.appendChild(el)})}

  function openTutorial(firstRun=false){tutorialIndex=0;tutorialFirstRun=firstRun;renderTutorial();openModal('#tutorial-modal')}
  function renderTutorial(){const step=TUTORIAL[tutorialIndex];$('#tutorial-visual').textContent=step.icon;$('#tutorial-kicker').textContent=step.kicker;$('#tutorial-title').textContent=step.title;$('#tutorial-copy').textContent=step.copy;$('#tutorial-next').textContent=tutorialIndex===TUTORIAL.length-1?(tutorialFirstRun?'主人公を描く →':'閉じる'):'つぎへ →';const dots=$('#tutorial-dots');dots.innerHTML=TUTORIAL.map((_,i)=>`<i class="${i===tutorialIndex?'active':''}"></i>`).join('')}
  function finishTutorial(openDraw=false){data.tutorialSeen=true;save();closeModal('#tutorial-modal');if(openDraw&&!data.heroImage)setTimeout(openDrawing,80)}

  $('#logo-button').onclick=()=>{if(run?.active){if(!confirm('挑戦を中断して拠点へ戻りますか？'))return;run.active=false;clearTimeout(battleTimer)}showView('home-view')};
  $$('.back-home').forEach(button=>button.onclick=()=>showView('home-view'));
  $('#open-draw').onclick=openDrawing;$('#close-draw').onclick=()=>closeModal('#draw-modal');
  $('#save-drawing').onclick=()=>{const canvas=$('#draw-canvas'),ctx=canvas.getContext('2d'),pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;let visible=false;for(let i=3;i<pixels.length;i+=4){if(pixels[i]>8){visible=true;break}}if(!visible){toast('主人公を描いてね！');return}data.heroImage=canvas.toDataURL('image/png');data.heroName=$('#name-input').value.trim()||'ななしのラクガキ';save();closeModal('#draw-modal');toast(`${data.heroName}が誕生！ 冒険へ出よう`)};
  $$('.color').forEach(button=>button.onclick=()=>{$$('.color').forEach(x=>x.classList.remove('active'));button.classList.add('active');draw.color=button.dataset.color;draw.eraser=false;$('#eraser').classList.remove('active')});
  $('#thin-pen').onclick=()=>{draw.width=8;draw.eraser=false;$$('.tool').forEach(x=>x.classList.remove('active'));$('#thin-pen').classList.add('active')};
  $('#thick-pen').onclick=()=>{draw.width=20;draw.eraser=false;$$('.tool').forEach(x=>x.classList.remove('active'));$('#thick-pen').classList.add('active')};
  $('#eraser').onclick=()=>{draw.eraser=true;$$('.tool').forEach(x=>x.classList.remove('active'));$('#eraser').classList.add('active')};
  $('#undo').onclick=()=>{if(draw.history.length<2)return;draw.history.pop();const img=new Image();img.onload=()=>{const ctx=$('#draw-canvas').getContext('2d');ctx.clearRect(0,0,640,420);ctx.drawImage(img,0,0)};img.src=draw.history.at(-1)};
  $('#clear-canvas').onclick=()=>{if(!confirm('絵を全部消しますか？'))return;$('#draw-canvas').getContext('2d').clearRect(0,0,640,420);draw.pushHistory?.()};
  $('#start-run').onclick=beginRun;$('#open-base').onclick=()=>{renderBase();showView('base-view')};$('#open-collection').onclick=()=>{renderCollection();showView('collection-view')};$('#open-growth').onclick=()=>{renderGrowth();showView('growth-view')};
  $$('.growth-item button').forEach(button=>button.onclick=()=>upgradeGrowth(button.dataset.growth));
  $('#quit-run').onclick=()=>{if(!confirm('挑戦を中断しますか？ 獲得した報酬は残ります。'))return;run.active=false;clearTimeout(battleTimer);run=null;showView('home-view')};
  $('#speed-button').onclick=()=>{if(!run)return;if(data.bestStage<run.stage){toast('2倍速はクリア済みステージで使えます');return}run.speed=run.speed===1?2:1;$('#speed-button').textContent=`×${run.speed}`;toast(run.speed===2?'2倍速':'通常速度')};
  $('#claim-offline').onclick=claimOffline;$('#upgrade-base').onclick=upgradeBase;
  $('#chapter-return').onclick=()=>{closeModal('#chapter-modal');run=null;showView('home-view');renderHeader()};
  $('#open-help').onclick=()=>openTutorial(false);$('#tutorial-skip').onclick=()=>finishTutorial(tutorialFirstRun);$('#tutorial-next').onclick=()=>{if(tutorialIndex<TUTORIAL.length-1){tutorialIndex++;renderTutorial()}else finishTutorial(tutorialFirstRun)};
  setInterval(()=>{if($('#base-view').classList.contains('active'))updateOfflineTime()},10000);
  renderHeader();
  if(!data.tutorialSeen)setTimeout(()=>openTutorial(true),300);
  if('serviceWorker' in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
})();
