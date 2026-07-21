(() => {
  'use strict';

  const SAVE_KEY = 'rakugakiQuestSaveV1';
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
  const defaultSave = () => ({
    ink:0, parts:0, xp:0, heroLevel:1, heroName:'ななしのラクガキ', heroImage:'', bestStage:0,
    baseLevel:1, assigned:['ink'], lastClaim:Date.now(), discovered:[], bossSeen:false
  });
  let data = load();
  let run = null;
  let battleTimer = null;
  let draw = {color:'#222222', width:8, eraser:false, drawing:false, history:[]};
  let audioCtx = null;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  function load(){try{return {...defaultSave(),...JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')}}catch{return defaultSave()}}
  function save(){localStorage.setItem(SAVE_KEY,JSON.stringify(data));renderHeader()}
  function renderHeader(){
    $('#ink-count').textContent=Math.floor(data.ink); $('#hero-level').textContent=data.heroLevel;
    $('#hero-name').textContent=data.heroName; $('#battle-hero-name').textContent=data.heroName;
    $('#best-stage').textContent=data.bestStage; $('#chapter-progress').style.width=`${Math.min(100,data.bestStage*10)}%`;
    $('#card-count-copy').textContent=`強化 ${data.discovered.length} / ${CARDS.length}`;
    renderHeroPreview();
  }
  function showView(id){$$('.view').forEach(v=>v.classList.toggle('active',v.id===id));window.scrollTo(0,0)}
  function openModal(id){const m=$(id);m.classList.add('open');m.setAttribute('aria-hidden','false')}
  function closeModal(id){const m=$(id);m.classList.remove('open');m.setAttribute('aria-hidden','true')}
  function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove('show'),1800)}
  function tone(freq=340,duration=.06,type='square'){
    try{audioCtx??=new (window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.035,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+duration);o.connect(g).connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+duration)}catch{}
  }

  function drawDefaultHero(ctx,w,h){
    ctx.clearRect(0,0,w,h);ctx.save();ctx.translate(w/2,h*.52);ctx.strokeStyle='#24211f';ctx.fillStyle='#fff';ctx.lineWidth=Math.max(5,w/55);ctx.lineCap='round';ctx.lineJoin='round';
    ctx.beginPath();ctx.arc(0,-h*.18,w*.105,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,-h*.07);ctx.lineTo(0,h*.19);ctx.moveTo(0,0);ctx.lineTo(-w*.17,h*.07);ctx.moveTo(0,0);ctx.lineTo(w*.17,-h*.02);ctx.moveTo(0,h*.18);ctx.lineTo(-w*.12,h*.35);ctx.moveTo(0,h*.18);ctx.lineTo(w*.14,h*.35);ctx.stroke();
    ctx.fillStyle='#24211f';ctx.beginPath();ctx.arc(-w*.04,-h*.2,3,0,7);ctx.arc(w*.04,-h*.2,3,0,7);ctx.fill();ctx.beginPath();ctx.arc(0,-h*.15,w*.04,0,Math.PI);ctx.stroke();
    ctx.strokeStyle='#ef476f';ctx.lineWidth=Math.max(4,w/70);ctx.beginPath();ctx.moveTo(w*.17,-h*.02);ctx.lineTo(w*.28,-h*.2);ctx.stroke();ctx.restore();
  }
  function renderHeroPreview(){const c=$('#hero-preview'),ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);if(data.heroImage){const img=new Image();img.onload=()=>ctx.drawImage(img,0,0,c.width,c.height);img.src=data.heroImage}else drawDefaultHero(ctx,c.width,c.height)}
  function heroSrc(){if(data.heroImage)return data.heroImage;const c=document.createElement('canvas');c.width=320;c.height=300;drawDefaultHero(c.getContext('2d'),320,300);return c.toDataURL()}

  function initDrawing(){
    const canvas=$('#draw-canvas'),ctx=canvas.getContext('2d');ctx.lineCap='round';ctx.lineJoin='round';
    if(data.heroImage){const img=new Image();img.onload=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);pushHistory()};img.src=data.heroImage}else{ctx.clearRect(0,0,canvas.width,canvas.height);pushHistory()}
    $('#name-input').value=data.heroName==='ななしのラクガキ'?'':data.heroName;
    function pos(e){const r=canvas.getBoundingClientRect(),p=e.touches?.[0]||e;return{x:(p.clientX-r.left)*canvas.width/r.width,y:(p.clientY-r.top)*canvas.height/r.height}}
    const start=e=>{e.preventDefault();draw.drawing=true;const p=pos(e);ctx.beginPath();ctx.moveTo(p.x,p.y)};
    const move=e=>{if(!draw.drawing)return;e.preventDefault();const p=pos(e);ctx.globalCompositeOperation=draw.eraser?'destination-out':'source-over';ctx.strokeStyle=draw.color;ctx.lineWidth=draw.eraser?32:draw.width;ctx.lineTo(p.x,p.y);ctx.stroke()};
    const end=e=>{if(!draw.drawing)return;e?.preventDefault();draw.drawing=false;ctx.closePath();ctx.globalCompositeOperation='source-over';pushHistory();tone(250,.04,'sine')};
    canvas.onpointerdown=start;canvas.onpointermove=move;canvas.onpointerup=end;canvas.onpointerleave=end;
    function pushHistory(){draw.history.push(canvas.toDataURL());if(draw.history.length>20)draw.history.shift()}
    draw.pushHistory=pushHistory;
  }

  function beginRun(){
    if(!data.heroImage){openModal('#draw-modal');toast('まずは主人公を描こう！');return}
    run={stage:1,hp:100,maxHp:100,attack:13,interval:900,guard:0,crit:.08,leech:0,double:0,bossBonus:0,ideas:0,cards:[],enemyHp:0,enemyMaxHp:0,active:false,speed:1};
    showView('battle-view');prepareBattle();
  }
  function prepareBattle(){
    clearTimeout(battleTimer);const boss=run.stage%10===0;const hp=Math.round((boss?150:42)+run.stage*(boss?22:11));
    run.enemyHp=run.enemyMaxHp=hp;run.active=false;
    $('#stage-number').textContent=run.stage;$('#enemy-name').textContent=boss?'ヌリツブシ王':'ケシカスライム';
    $('#enemy-fighter').classList.toggle('boss',boss);$('#battle-action').disabled=true;$('#battle-action').textContent='戦闘中…';$('#battle-hero').src=heroSrc();updateBattleUI();
    if(boss&&!data.bossSeen){showDialog([
      ['ヌリツブシ王','見つけたぞ……このノートに色をつける不届き者め！'],
      [data.heroName,'えっ。色鉛筆、貸してほしいの？'],
      ['ヌリツブシ王','ちがーう！ぜんぶ黒く塗るのだ！']
    ],()=>{data.bossSeen=true;save();startBattle()})}else startBattle();
  }
  function startBattle(){run.active=true;const loop=()=>{if(!run?.active)return;playerAttack();battleTimer=setTimeout(enemyAttack,Math.max(160,340/run.speed));};battleTimer=setTimeout(loop,450/run.speed);run.loop=loop}
  function playerAttack(){
    if(!run.active)return;const boss=run.stage%10===0;let dmg=run.attack*(boss?1+run.bossBonus:1);const crit=Math.random()<run.crit;if(crit)dmg*=2.2;dmg=Math.round(dmg);run.enemyHp=Math.max(0,run.enemyHp-dmg);run.hp=Math.min(run.maxHp,run.hp+run.leech);animateHit('player',crit?`会心 ${dmg}!`:`${dmg}`);tone(crit?520:330,.055,crit?'sawtooth':'square');
    if(Math.random()<run.double&&run.enemyHp>0){run.enemyHp=Math.max(0,run.enemyHp-Math.round(run.attack*.75));setTimeout(()=>splash('追撃！'),100)}updateBattleUI();
    if(run.enemyHp<=0){winBattle();return}battleTimer=setTimeout(run.loop,run.interval/run.speed)
  }
  function enemyAttack(){
    if(!run.active)return;const dmg=Math.max(1,Math.round((6+run.stage*1.8)*(1-run.guard)));run.hp=Math.max(0,run.hp-dmg);animateHit('enemy',`${dmg}`);tone(145,.08,'sawtooth');updateBattleUI();if(run.hp<=0)loseRun()
  }
  function animateHit(side,text){const a=$(side==='player'?'#player-fighter':'#enemy-fighter'),b=$(side==='player'?'#enemy-fighter':'#player-fighter');a.classList.add(side==='player'?'player-attack':'enemy-attack');setTimeout(()=>{a.classList.remove('player-attack');b.classList.add('hit');splash(text);setTimeout(()=>b.classList.remove('hit'),280)},130)}
  function splash(text){const s=$('#battle-splash');s.textContent=text;s.classList.remove('show');void s.offsetWidth;s.classList.add('show')}
  function updateBattleUI(){
    if(!run)return;$('#player-hp-text').textContent=`${Math.ceil(run.hp)} / ${run.maxHp}`;$('#enemy-hp-text').textContent=`${Math.ceil(run.enemyHp)} / ${run.enemyMaxHp}`;
    $('#player-hp-bar').style.width=`${100*run.hp/run.maxHp}%`;$('#enemy-hp-bar').style.width=`${100*run.enemyHp/run.enemyMaxHp}%`;
    $('#attack-stat').textContent=Math.round(run.attack);$('#speed-stat').textContent=(900/run.interval).toFixed(1);$('#idea-count').textContent=run.ideas;
  }
  function winBattle(){
    run.active=false;clearTimeout(battleTimer);data.bestStage=Math.max(data.bestStage,run.stage);data.ink+=4+run.stage;data.xp+=3;levelCheck();save();splash('CLEAR!');
    if(run.stage%10===0){setTimeout(()=>showDialog([
      ['ヌリツブシ王','ま、まぶしい……！色って、ちょっと良いかも……'],
      [data.heroName,'じゃあ一緒に描こう。はみ出してもいいんだよ。']
    ],()=>finishChapter()),650);return}
    setTimeout(showCardChoices,620)
  }
  function showCardChoices(){
    const choices=[...CARDS].sort(()=>Math.random()-.5).slice(0,3);const box=$('#card-options');box.innerHTML='';
    choices.forEach(card=>{const btn=document.createElement('button');btn.className=`choice-card ${card.rarity==='レア'?'rare':card.rarity==='伝説'?'legend':''}`;btn.innerHTML=`<span class="card-emoji">${card.icon}</span><span><b>${card.name}</b><small>${card.desc}</small></span><i>›</i>`;btn.onclick=()=>{card.effect(run);run.ideas++;run.cards.push(card.id);if(!data.discovered.includes(card.id))data.discovered.push(card.id);save();closeModal('#card-modal');run.stage++;run.hp=Math.min(run.maxHp,run.hp+Math.round(run.maxHp*.12));prepareBattle()};box.appendChild(btn)});openModal('#card-modal')
  }
  function loseRun(){run.active=false;clearTimeout(battleTimer);const earned=Math.max(2,Math.floor(run.stage*2));data.ink+=earned;save();$('#battle-action').disabled=false;$('#battle-action').textContent=`拠点へ戻る（インク +${earned}）`;$('#battle-action').onclick=()=>{run=null;showView('home-view');renderHeader()};splash('敗北…')}
  function finishChapter(){data.ink+=50;data.bestStage=Math.max(10,data.bestStage);data.heroLevel=Math.max(2,data.heroLevel);save();run=null;showView('home-view');toast('CHAPTER 1 クリア！ インク+50')}
  function showDialog(lines,done){let i=0;const next=()=>{if(i>=lines.length){closeModal('#dialog-modal');done();return}const [speaker,text]=lines[i++];$('#dialog-speaker').textContent=speaker;$('#dialog-text').textContent=text;$('#dialog-portrait').textContent=speaker===data.heroName?'✎':'?';tone(230+i*30,.04,'triangle')};$('#dialog-next').onclick=next;openModal('#dialog-modal');next()}
  function levelCheck(){const next=data.heroLevel*25;if(data.xp>=next){data.xp-=next;data.heroLevel++;toast(`主人公が Lv.${data.heroLevel} になった！`)}}

  function renderBase(){
    $('#base-level').textContent=data.baseLevel;const cost=40+(data.baseLevel-1)*35;$('#upgrade-cost').textContent=`インク ${cost}`;
    const list=$('#facility-list');list.innerHTML='';FACILITIES.forEach(f=>{const assigned=data.assigned.includes(f.id);const el=document.createElement('article');el.className='facility';el.innerHTML=`<span class="facility-icon" style="--facility-color:${f.color}">${f.icon}</span><div><b>${f.name}</b><small>${f.desc}</small></div><button class="${assigned?'assigned':''}">${assigned?'稼働中':'配置'}</button>`;el.querySelector('button').onclick=()=>toggleFacility(f.id);list.appendChild(el)});updateOfflineTime()
  }
  function slots(){return data.baseLevel>=10?3:data.baseLevel>=5?2:1}
  function toggleFacility(id){const i=data.assigned.indexOf(id);if(i>=0){if(data.assigned.length===1){toast('1つは稼働させておこう');return}data.assigned.splice(i,1)}else{if(data.assigned.length>=slots()){toast(`配置枠は${slots()}つです`);return}data.assigned.push(id)}save();renderBase()}
  function pendingMinutes(){return Math.min(720,Math.max(0,(Date.now()-data.lastClaim)/60000))}
  function updateOfflineTime(){const mins=Math.floor(pendingMinutes()),h=String(Math.floor(mins/60)).padStart(2,'0'),m=String(mins%60).padStart(2,'0');$('#offline-time').textContent=`${h}:${m}`}
  function claimOffline(){const mins=pendingMinutes();if(mins<.2){toast('まだ報酬はたまっていません');return}let message=[];data.assigned.forEach(id=>{if(id==='ink'){const n=Math.max(1,Math.floor(mins*2));data.ink+=n;message.push(`インク+${n}`)}if(id==='parts'){const n=Math.max(1,Math.floor(mins));data.parts+=n;message.push(`素材+${n}`)}if(id==='xp'){const n=Math.max(1,Math.floor(mins*2));data.xp+=n;message.push(`経験値+${n}`)}if(id==='treasure'){const n=Math.max(1,Math.floor(mins*(1+Math.random()*2)));data.ink+=n;message.push(`宝インク+${n}`)}});data.lastClaim=Date.now();levelCheck();save();renderBase();toast(message.join(' / '))}
  function upgradeBase(){const cost=40+(data.baseLevel-1)*35;if(data.baseLevel>=20){toast('拠点は最大レベルです');return}if(data.ink<cost){toast(`インクが${cost-data.ink}足りません`);return}data.ink-=cost;data.baseLevel++;save();renderBase();toast(`拠点が Lv.${data.baseLevel} になった！`)}
  function renderCollection(){const grid=$('#collection-grid');grid.innerHTML='';$('#collection-total').textContent=`${data.discovered.length}/${CARDS.length}`;CARDS.forEach(c=>{const unlocked=data.discovered.includes(c.id),el=document.createElement('article');el.className=`collection-item ${unlocked?'':'locked'}`;el.innerHTML=`<span class="rarity">${unlocked?c.rarity:'？？？'}</span><span class="card-emoji">${unlocked?c.icon:'?'}</span><b>${unlocked?c.name:'未発見'}</b><small>${unlocked?c.desc:'冒険で見つけよう'}</small>`;grid.appendChild(el)})}

  $('#logo-button').onclick=()=>{if(run?.active){if(!confirm('挑戦を中断して拠点へ戻りますか？'))return;run.active=false;clearTimeout(battleTimer)}showView('home-view')};
  $$('.back-home').forEach(b=>b.onclick=()=>showView('home-view'));
  $('#open-draw').onclick=()=>{openModal('#draw-modal');setTimeout(initDrawing,20)};$('#close-draw').onclick=()=>closeModal('#draw-modal');
  $('#save-drawing').onclick=()=>{const c=$('#draw-canvas'),ctx=c.getContext('2d'),pixels=ctx.getImageData(0,0,c.width,c.height).data;let visible=false;for(let i=3;i<pixels.length;i+=4){if(pixels[i]>8){visible=true;break}}if(!visible){toast('主人公を描いてね！');return}data.heroImage=c.toDataURL('image/png');data.heroName=$('#name-input').value.trim()||'ななしのラクガキ';save();closeModal('#draw-modal');toast(`${data.heroName}が誕生！`)};
  $$('.color').forEach(b=>b.onclick=()=>{$$('.color').forEach(x=>x.classList.remove('active'));b.classList.add('active');draw.color=b.dataset.color;draw.eraser=false;$('#eraser').classList.remove('active')});
  $('#thin-pen').onclick=()=>{draw.width=8;draw.eraser=false;$('.tool.active')?.classList.remove('active');$('#thin-pen').classList.add('active')};
  $('#thick-pen').onclick=()=>{draw.width=20;draw.eraser=false;$('.tool.active')?.classList.remove('active');$('#thick-pen').classList.add('active')};
  $('#eraser').onclick=()=>{draw.eraser=true;$$('.tool').forEach(x=>x.classList.remove('active'));$('#eraser').classList.add('active')};
  $('#undo').onclick=()=>{if(draw.history.length<2)return;draw.history.pop();const img=new Image();img.onload=()=>{$('#draw-canvas').getContext('2d').clearRect(0,0,640,420);$('#draw-canvas').getContext('2d').drawImage(img,0,0)};img.src=draw.history.at(-1)};
  $('#clear-canvas').onclick=()=>{if(!confirm('絵を全部消しますか？'))return;$('#draw-canvas').getContext('2d').clearRect(0,0,640,420);draw.pushHistory?.()};
  $('#start-run').onclick=beginRun;$('#open-base').onclick=()=>{renderBase();showView('base-view')};$('#open-collection').onclick=()=>{renderCollection();showView('collection-view')};
  $('#quit-run').onclick=()=>{if(!confirm('挑戦を中断しますか？ 獲得したインクは残ります。'))return;run.active=false;clearTimeout(battleTimer);run=null;showView('home-view')};
  $('#speed-button').onclick=()=>{if(!run)return;run.speed=run.speed===1?2:1;$('#speed-button').textContent=`×${run.speed}`;toast(run.speed===2?'2倍速':'通常速度')};
  $('#claim-offline').onclick=claimOffline;$('#upgrade-base').onclick=upgradeBase;
  setInterval(()=>{if($('#base-view').classList.contains('active'))updateOfflineTime()},10000);
  renderHeader();
  if('serviceWorker' in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
})();
