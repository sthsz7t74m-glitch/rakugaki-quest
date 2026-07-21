(() => {
  'use strict';

  const SAVE_KEY = 'rakugakiQuestSaveV1';
  const MAX_STAGE = 100;
  const BASE_MAX = 20;

  const ENEMY_TYPES = {
    stickman: { glyph:'🕺', trait:'身軽・回避あり', hp:.8, damage:.85, evade:.1 },
    slime: { glyph:'🟢', trait:'ぷるぷる・標準型', hp:1, damage:.85 },
    bug: { glyph:'🐛', trait:'小さいが素早い', hp:.75, damage:.8, speed:1.35 },
    goblin: { glyph:'👺', trait:'乱暴・攻撃高め', hp:.95, damage:1.25 },
    bat: { glyph:'🦇', trait:'高速・回避あり', hp:.7, damage:.75, speed:1.55, evade:.08 },
    dragon: { glyph:'🐉', trait:'頑丈・高火力', hp:1.45, damage:1.35 },
    ghost: { glyph:'👻', trait:'ときどき攻撃を無効化', hp:.9, damage:1, evade:.14 },
    robot: { glyph:'🤖', trait:'装甲・ダメージ軽減', hp:1.3, damage:1.05, armor:.18 },
    spider: { glyph:'🕷️', trait:'連続攻撃', hp:.85, damage:.7, speed:1.7 },
    knight: { glyph:'🛡️', trait:'重装甲', hp:1.55, damage:.95, armor:.26 },
    cactus: { glyph:'🌵', trait:'反撃のトゲ', hp:1.05, damage:1.05, thorns:.05 },
    crab: { glyph:'🦀', trait:'硬いハサミ', hp:1.35, damage:1.15, armor:.12 },
    mushroom: { glyph:'🍄', trait:'胞子で攻撃を弱める', hp:1.1, damage:.9, weaken:.08 },
    ninja: { glyph:'🥷', trait:'高速・高回避', hp:.8, damage:1.05, speed:1.6, evade:.16 },
    wolf: { glyph:'🐺', trait:'HP半分で狂暴化', hp:1.05, damage:1.15, berserk:1.45 },
    ogre: { glyph:'👹', trait:'遅いが超火力', hp:1.5, damage:1.55, speed:.75 },
    ufo: { glyph:'🛸', trait:'ビーム・防御貫通', hp:1, damage:1.2, pierce:.22 },
    alien: { glyph:'👽', trait:'不思議な回避', hp:.95, damage:1.05, evade:.12 },
    droid: { glyph:'🦾', trait:'自己修復', hp:1.25, damage:1, regen:.025 },
    demon: { glyph:'😈', trait:'会心攻撃', hp:1.1, damage:1.35, crit:.15 },
    mimic: { glyph:'🎁', trait:'倒すと報酬2倍', hp:1.35, damage:1.15, reward:2 },
    hydra: { glyph:'🐲', trait:'三連撃級の圧力', hp:1.65, damage:1.35, speed:1.25 },
    angel: { glyph:'👼', trait:'少しずつ回復', hp:1.2, damage:1, regen:.04 },
    golem: { glyph:'🗿', trait:'最高クラスの装甲', hp:1.8, damage:1.1, armor:.3 },
    phoenix: { glyph:'🔥', trait:'HP半分で超加速', hp:1.2, damage:1.25, berserk:1.55, speed:1.2 },
    titan: { glyph:'🦖', trait:'巨大・超耐久', hp:2, damage:1.35 },
    void: { glyph:'🐙', trait:'防御を無視する闇', hp:1.55, damage:1.45, pierce:.35 }
  };

  const CHAPTERS = [
    { id:1, start:1, end:10, name:'消えかけたノート', short:'消えかけ', theme:'theme-1', enemies:[['ただの棒人間','stickman'],['ケシカスライム','slime'],['折れ芯ムシ','bug']], boss:['ヌリツブシ王','goblin'] },
    { id:2, start:11, end:20, name:'罫線の森', short:'罫線の森', theme:'theme-2', enemies:[['いたずらゴブリン','goblin'],['ふせんコウモリ','bat'],['ちびドラゴン','dragon']], boss:['赤ペン竜','dragon'] },
    { id:3, start:21, end:30, name:'色ぬすみの机', short:'色ぬすみ', theme:'theme-3', enemies:[['白紙ゴースト','ghost'],['ブリキの落書き','robot'],['インクグモ','spider']], boss:['マッシロ大魔王','ghost'] },
    { id:4, start:31, end:40, name:'文房具の城', short:'文具の城', theme:'theme-4', enemies:[['定規ナイト','knight'],['ゼンマイロボ','robot'],['ホチキスガニ','crab']], boss:['コンパス将軍','knight'] },
    { id:5, start:41, end:50, name:'余白の砂漠', short:'余白砂漠', theme:'theme-5', enemies:[['えんぴつサボテン','cactus'],['ノートヤドカリ','crab'],['消しゴムキノコ','mushroom']], boss:['砂消しドラゴン','dragon'] },
    { id:6, start:51, end:60, name:'黒インク山', short:'黒インク山', theme:'theme-1', enemies:[['墨汁ニンジャ','ninja'],['下書きウルフ','wolf'],['筆オーガ','ogre']], boss:['鬼筆ゴウカイ','ogre'] },
    { id:7, start:61, end:70, name:'方眼宇宙', short:'方眼宇宙', theme:'theme-2', enemies:[['クリップUFO','ufo'],['ケイセン星人','alien'],['計算ドロイド','droid']], boss:['銀河定規Z','robot'] },
    { id:8, start:71, end:80, name:'破れたページ', short:'破れページ', theme:'theme-3', enemies:[['赤インクデーモン','demon'],['筆箱ミミック','mimic'],['三つ首落書き','hydra']], boss:['ページイーター','hydra'] },
    { id:9, start:81, end:90, name:'光のスケッチ', short:'光スケッチ', theme:'theme-4', enemies:[['修正天使','angel'],['石版ゴーレム','golem'],['クレヨン不死鳥','phoenix']], boss:['七色フェニックス','phoenix'] },
    { id:10, start:91, end:100, name:'最後の白紙', short:'最後の白紙', theme:'theme-5', enemies:[['余白タイタン','titan'],['虚無の触手','void'],['終末ドラゴン','dragon']], boss:['インク神・ゼロ','void'] }
  ].map(ch => ({...ch, reward:{ink:50*ch.id+ch.id*ch.id*12, parts:4+ch.id*3, xp:20+ch.id*18}}));

  const WEAPONS = [
    {id:'pencil', name:'えんぴつ剣', icon:'✎', type:'近接', unlock:0, attack:.1, effect:'安定した近接攻撃'},
    {id:'ruler', name:'定規ボウ', icon:'📏', type:'遠距離', unlock:10, attack:.2, crit:.05, effect:'会心率が上がる遠距離武器'},
    {id:'crayon', name:'魔法クレヨン', icon:'🖍️', type:'魔法', unlock:30, attack:.28, pierce:.12, effect:'敵の装甲を一部無視'},
    {id:'eraser', name:'巨大消しゴム', icon:'▰', type:'近接', unlock:50, attack:.38, hp:.12, effect:'HPも増える重量武器'},
    {id:'compass', name:'星のコンパス', icon:'🧭', type:'遠距離', unlock:70, attack:.5, crit:.1, effect:'高い会心率を持つ伝説武器'},
    {id:'rainbow', name:'虹色万年筆', icon:'🖋️', type:'魔法', unlock:100, attack:.7, pierce:.25, effect:'すべてを描き直す最終武器'}
  ];

  const CARDS = [
    { id:'power', name:'ごんぶと線', icon:'✎', rarity:'通常', desc:'攻撃力が30%アップ', effect:s=>s.attack*=1.3 },
    { id:'haste', name:'早描き', icon:'⌁', rarity:'通常', desc:'攻撃速度が25%アップ', effect:s=>s.interval*=.75 },
    { id:'heart', name:'赤ペンハート', icon:'♥', rarity:'通常', desc:'最大HP+35%、全回復', effect:s=>{s.maxHp=Math.round(s.maxHp*1.35);s.hp=s.maxHp} },
    { id:'guard', name:'ねり消しガード', icon:'▱', rarity:'レア', desc:'受けるダメージを25%軽減', effect:s=>s.guard=Math.min(.65,s.guard+.25) },
    { id:'critical', name:'定規スマッシュ', icon:'📏', rarity:'レア', desc:'会心率+25%', effect:s=>s.crit=Math.min(.7,s.crit+.25) },
    { id:'heal', name:'修正テープ', icon:'＋', rarity:'レア', desc:'攻撃ごとにHPを5%回復', effect:s=>s.leech+=.05 },
    { id:'double', name:'二刀流えんぴつ', icon:'✐', rarity:'伝説', desc:'35%で追撃が発生', effect:s=>s.double=Math.min(.85,s.double+.35) },
    { id:'rainbow', name:'七色クレヨン', icon:'🌈', rarity:'伝説', desc:'全能力が少しアップ', effect:s=>{s.attack*=1.2;s.maxHp=Math.round(s.maxHp*1.2);s.hp=Math.min(s.maxHp,s.hp+s.maxHp*.2);s.interval*=.9} },
    { id:'boss', name:'巨大消しゴム', icon:'▰', rarity:'伝説', desc:'ボスへのダメージ+70%', effect:s=>s.bossBonus+=.7 }
  ];

  const FACILITIES = [
    {id:'ink',name:'インク工房',icon:'●',color:'#d9d3cc',desc:'インクを毎分2個、自動で蓄積'},
    {id:'parts',name:'文房具工房',icon:'✂',color:'#ffdbaa',desc:'強化素材を毎分1個、自動で蓄積'},
    {id:'xp',name:'スケッチ広場',icon:'☆',color:'#cde1ff',desc:'経験値を毎分2、自動で蓄積'},
    {id:'treasure',name:'宝探し机',icon:'?',color:'#d8f3dc',desc:'インクと素材をランダム発見'}
  ];

  const TUTORIAL = [
    {icon:'📓',kicker:'はじめに',title:'消えかけた世界を描き直そう',copy:'描いた主人公と一緒に全100ステージへ挑戦します。\n10ステージごとに敵の世界とボスが変化します。'},
    {icon:'✎',kicker:'STEP 1',title:'主人公を自由に描く',copy:'形や大きさで性能は変わりません。\n好きな主人公を指やマウスで描いてください。'},
    {icon:'⚔',kicker:'STEP 2',title:'戦闘は自動、準備が勝負',copy:'敵ごとに耐久・攻撃・速度・特性が違います。\n戦力と推奨戦力を見て、武器や永久能力を育てましょう。'},
    {icon:'💡',kicker:'STEP 3',title:'冒険中のひらめき',copy:'戦闘後は3枚から一時強化を1つ選択。\n組み合わせ次第で格上のボスにも勝てます。'},
    {icon:'⌂',kicker:'STEP 4',title:'放置中も素材を集める',copy:'拠点の施設はゲームを閉じても最大12時間働きます。\n拠点Lv.5と10で、同時に動かせる施設が増えます。'},
    {icon:'🗺️',kicker:'STEP 5',title:'好きなステージへ再挑戦',copy:'クリア済みステージはステージ選択から何度でも遊べます。\nボス撃破で新しい武器も解放されます。'}
  ];

  const defaultSave = () => ({
    ink:0, parts:0, xp:0, heroLevel:1, heroName:'ななしのラクガキ', heroImage:'', bestStage:0,
    selectedStage:1, baseLevel:1, assigned:['ink'], lastClaim:Date.now(), discovered:[], bossSeen:{},
    growth:{power:0,vitality:0,focus:0}, weapons:{pencil:1}, equippedWeapon:'pencil', chapterClears:{}, tutorialSeen:false
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
  let selectedChapter = 1;

  function load(){
    try{
      const raw = JSON.parse(localStorage.getItem(SAVE_KEY)||'{}');
      const merged = {...defaultSave(),...raw};
      merged.growth = {...defaultSave().growth,...(raw.growth||{})};
      merged.weapons = {...defaultSave().weapons,...(raw.weapons||{})};
      merged.chapterClears = {...(raw.chapterClears||{})};
      merged.bossSeen = typeof raw.bossSeen === 'object' && raw.bossSeen ? raw.bossSeen : {};
      merged.assigned = Array.isArray(merged.assigned) && merged.assigned.length ? merged.assigned : ['ink'];
      merged.discovered = Array.isArray(merged.discovered) ? merged.discovered : [];
      merged.selectedStage = Math.max(1,Math.min(MAX_STAGE,Number(merged.selectedStage)||1));
      if(!WEAPONS.some(w=>w.id===merged.equippedWeapon))merged.equippedWeapon='pencil';
      unlockEarnedWeapons(merged);
      return merged;
    }catch{return defaultSave()}
  }
  function save(){localStorage.setItem(SAVE_KEY,JSON.stringify(data));renderHeader()}
  function unlockEarnedWeapons(target=data){WEAPONS.forEach(w=>{if((target.bestStage||0)>=w.unlock&&!target.weapons[w.id])target.weapons[w.id]=1})}
  function xpNeeded(){return data.heroLevel*25}
  function chapterFor(stage){return CHAPTERS.find(ch=>stage>=ch.start&&stage<=ch.end)||CHAPTERS[9]}
  function currentChapter(){return chapterFor(Math.min(MAX_STAGE,Math.max(1,data.bestStage+1)))}
  function equippedWeapon(){return WEAPONS.find(w=>w.id===data.equippedWeapon)||WEAPONS[0]}
  function weaponLevel(w=equippedWeapon()){return data.weapons[w.id]||1}
  function startingStats(){
    const w=equippedWeapon(),level=weaponLevel(w),weaponScale=w.attack+(level-1)*.06;
    const baseHp=110+(data.heroLevel-1)*12+data.growth.vitality*18;
    return {
      maxHp:Math.round(baseHp*(1+(w.hp||0))),
      attack:Math.round((13+(data.heroLevel-1)*1.7+data.growth.power*3)*(1+weaponScale)*10)/10,
      crit:Math.min(.55,.08+data.growth.focus*.015+(w.crit||0)),
      pierce:(w.pierce||0)+(level-1)*.006,
      weapon:w
    };
  }
  function playerPower(stats=startingStats()){
    return Math.round(stats.maxHp*.45+stats.attack*8+stats.crit*150+stats.pierce*120);
  }
  function recommendedPower(stage){return Math.round(100*Math.pow(1.032,stage-1)*(stage%10===0?1.42:1))}

  function renderHeader(){
    const chapter=currentChapter(),need=xpNeeded(),stats=startingStats(),weapon=equippedWeapon();
    $('#ink-count').textContent=Math.floor(data.ink);$('#parts-count').textContent=Math.floor(data.parts);
    $('#hero-level').textContent=data.heroLevel;$('#hero-name').textContent=data.heroName;$('#battle-hero-name').textContent=data.heroName;
    $('#best-stage').textContent=data.bestStage;$('#chapter-progress').style.width=`${Math.min(100,data.bestStage/MAX_STAGE*100)}%`;
    $('#home-chapter-number').textContent=`CHAPTER ${chapter.id}${data.bestStage>=MAX_STAGE?' / ALL CLEAR':''}`;$('#home-chapter-name').textContent=chapter.name;
    $('#hero-xp-copy').textContent=`EXP ${Math.floor(data.xp)} / ${need}`;$('#hero-xp-bar').style.width=`${Math.min(100,data.xp/need*100)}%`;
    $('#card-count-copy').textContent=`強化 ${data.discovered.length} / ${CARDS.length}`;
    $('#growth-summary').textContent=`戦力 ${playerPower(stats)}・HP ${stats.maxHp}・攻撃 ${Math.round(stats.attack)}`;
    $('#base-summary').textContent=`Lv.${data.baseLevel} / MAX ${BASE_MAX}・${slots()}施設が稼働可能`;
    $('#weapon-summary').textContent=`${weapon.name} Lv.${weaponLevel(weapon)}・${weapon.type}`;
    const map=$('#chapter-map');map.innerHTML='';
    CHAPTERS.forEach(ch=>{const node=document.createElement('span'),cleared=data.bestStage>=ch.end,current=chapter.id===ch.id;node.className=`chapter-node ${cleared?'cleared':''} ${current?'current':''}`;node.innerHTML=`<b>${cleared?'✓ ':''}${ch.id}. ${ch.short}</b>${ch.start}–${ch.end}`;map.appendChild(node)});
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
  function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(el._timer);el._timer=setTimeout(()=>el.classList.remove('show'),2200)}
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

  function enemyFor(stage){
    const chapter=chapterFor(stage),boss=stage===chapter.end,entry=boss?chapter.boss:chapter.enemies[(stage-chapter.start)%chapter.enemies.length],type=ENEMY_TYPES[entry[1]];
    const hp=Math.round(90*Math.pow(1.047,stage-1)*type.hp*(boss?2.25:1));
    const damage=Math.round(5.5*Math.pow(1.032,stage-1)*type.damage*(boss?1.35:1));
    return {...type,name:entry[0],type:entry[1],boss,hp,damage};
  }
  function beginRun(stage){
    if(!data.heroImage){openDrawing();toast('まずは主人公を描こう！');return}
    const unlocked=Math.min(MAX_STAGE,data.bestStage+1),chosen=Math.max(1,Math.min(unlocked,Number(stage)||data.selectedStage||unlocked)),stats=startingStats();
    data.selectedStage=chosen;save();
    run={stage:chosen,startStage:chosen,hp:stats.maxHp,maxHp:stats.maxHp,attack:stats.attack,interval:1450,guard:0,crit:stats.crit,leech:0,double:0,bossBonus:0,pierce:stats.pierce,ideas:0,cards:[],enemyHp:0,enemyMaxHp:0,active:false,speed:1,weapon:stats.weapon};
    showView('battle-view');prepareBattle();
  }
  function prepareBattle(){
    clearTimeout(battleTimer);const chapter=chapterFor(run.stage),enemy=enemyFor(run.stage);
    run.enemy=enemy;run.enemyHp=run.enemyMaxHp=enemy.hp;run.active=false;
    $('#stage-number').textContent=run.stage;$('#battle-chapter').textContent=`CHAPTER ${chapter.id}・${chapter.name}・推奨戦力 ${recommendedPower(run.stage)}`;
    $('#enemy-name').textContent=enemy.name;$('#enemy-trait').textContent=enemy.trait;$('#enemy-glyph').textContent=enemy.glyph;
    const scene=$('#battle-scene');scene.className=`battle-scene ${chapter.theme} weapon-${run.weapon.type==='近接'?'melee':run.weapon.type==='遠距離'?'range':'magic'}`;
    const art=$('#enemy-art');art.className=`enemy-art enemy-${enemy.type}`;
    $('#enemy-fighter').classList.toggle('boss',enemy.boss);$('#battle-action').disabled=true;$('#battle-action').textContent='戦闘中…';$('#battle-hero').src=heroSrc();$('#speed-button').textContent='×1';updateBattleUI();
    if(enemy.boss&&!data.bossSeen[chapter.id]){showDialog(bossIntro(chapter),()=>{data.bossSeen[chapter.id]=true;save();startBattle()})}else startBattle();
  }
  function bossIntro(chapter){return [[chapter.boss[0],`ステージ${chapter.end}まで来たか。ここから先は通さない！`],[data.heroName,'なら、このページごと描き直す！'],[chapter.boss[0],chapter.id===10?'最後の白紙で消えてしまえ！':'その武器ごと消してやる！']]}
  function startBattle(){
    run.active=true;
    const loop=()=>{if(!run?.active)return;playerAttack();if(run?.active)battleTimer=setTimeout(enemyAttack,Math.max(430,780/(run.enemy.speed||1))/run.speed)};
    battleTimer=setTimeout(loop,900/run.speed);run.loop=loop;
  }
  function playerAttack(){
    if(!run?.active)return;
    const enemy=run.enemy;
    if(Math.random()<(enemy.evade||0)){animateHit('player','MISS');battleTimer=setTimeout(run.loop,run.interval/run.speed);return}
    let armor=Math.max(0,(enemy.armor||0)-run.pierce),damage=run.attack*(enemy.boss?1+run.bossBonus:1)*(1-armor);const critical=Math.random()<run.crit;if(critical)damage*=2.2;damage=Math.max(1,Math.round(damage));
    run.enemyHp=Math.max(0,run.enemyHp-damage);run.hp=Math.min(run.maxHp,run.hp+run.maxHp*run.leech);animateHit('player',critical?`会心 ${damage}!`:`${damage}`);tone(critical?520:330,.075,critical?'sawtooth':'square');
    if(enemy.thorns)run.hp=Math.max(1,run.hp-Math.round(damage*enemy.thorns));
    if(enemy.weaken)run.attack=Math.max(1,run.attack*(1-enemy.weaken*.15));
    if(Math.random()<run.double&&run.enemyHp>0){run.enemyHp=Math.max(0,run.enemyHp-Math.round(run.attack*.75));setTimeout(()=>splash('追撃！'),180)}
    if(enemy.regen&&run.enemyHp>0)run.enemyHp=Math.min(run.enemyMaxHp,run.enemyHp+Math.round(run.enemyMaxHp*enemy.regen));
    updateBattleUI();if(run.enemyHp<=0){winBattle();return}battleTimer=setTimeout(run.loop,run.interval/run.speed);
  }
  function enemyAttack(){
    if(!run?.active)return;const enemy=run.enemy,berserk=enemy.berserk&&run.enemyHp<run.enemyMaxHp*.5?enemy.berserk:1,crit=Math.random()<(enemy.crit||0)?1.8:1,effectiveGuard=run.guard*(1-(enemy.pierce||0));const damage=Math.max(1,Math.round(enemy.damage*berserk*crit*(1-effectiveGuard)));
    run.hp=Math.max(0,run.hp-damage);animateHit('enemy',crit>1?`痛恨 ${damage}!`:`${damage}`);tone(145,.1,'sawtooth');updateBattleUI();if(run.hp<=0)loseRun();
  }
  function animateHit(side,text){const attacker=$(side==='player'?'#player-fighter':'#enemy-fighter'),target=$(side==='player'?'#enemy-fighter':'#player-fighter');attacker.classList.add(side==='player'?'player-attack':'enemy-attack');setTimeout(()=>{attacker.classList.remove('player-attack','enemy-attack');target.classList.add('hit');splash(text);setTimeout(()=>target.classList.remove('hit'),420)},260)}
  function splash(text){const el=$('#battle-splash');el.textContent=text;el.classList.remove('show');void el.offsetWidth;el.classList.add('show')}
  function updateBattleUI(){
    if(!run)return;$('#player-hp-text').textContent=`${Math.ceil(run.hp)} / ${run.maxHp}`;$('#enemy-hp-text').textContent=`${Math.ceil(run.enemyHp)} / ${run.enemyMaxHp}`;
    $('#player-hp-bar').style.width=`${Math.max(0,100*run.hp/run.maxHp)}%`;$('#enemy-hp-bar').style.width=`${Math.max(0,100*run.enemyHp/run.enemyMaxHp)}%`;
    $('#power-stat').textContent=playerPower({maxHp:run.maxHp,attack:run.attack,crit:run.crit,pierce:run.pierce});$('#attack-stat').textContent=Math.round(run.attack);$('#speed-stat').textContent=(1450/run.interval).toFixed(1);$('#idea-count').textContent=run.ideas;
  }
  function winBattle(){
    run.active=false;clearTimeout(battleTimer);const chapter=chapterFor(run.stage),enemy=run.enemy,firstClear=run.stage>data.bestStage,rewardMult=enemy.reward||1;
    data.bestStage=Math.max(data.bestStage,run.stage);data.ink+=(3+Math.ceil(run.stage/4))*rewardMult;data.parts+=run.stage%5===0?1:0;data.xp+=(5+chapter.id*2)*rewardMult;data.selectedStage=Math.min(MAX_STAGE,Math.max(data.selectedStage,run.stage+1));unlockEarnedWeapons();levelCheck();save();splash('CLEAR!');
    if(enemy.boss){setTimeout(()=>showDialog([[chapter.boss[0],bossOutro(chapter.id)],[data.heroName,'このページにも、色が戻ってきた！']],()=>finishChapter(chapter,firstClear)),1000);return}
    setTimeout(showCardChoices,1000);
  }
  function bossOutro(id){return id===10?'白紙は終わりじゃない……次に描くための場所だったのか。':id%3===1?'ま、まぶしい……！色って、ちょっと良いかも……':id%3===2?'その線、はみ出してるのに……強い。':'こんなににぎやかなページになるとは……。'}
  function showCardChoices(){
    const choices=[...CARDS].sort(()=>Math.random()-.5).slice(0,3),box=$('#card-options');box.innerHTML='';
    choices.forEach(card=>{const button=document.createElement('button');button.className=`choice-card ${card.rarity==='レア'?'rare':card.rarity==='伝説'?'legend':''}`;button.innerHTML=`<span class="card-emoji">${card.icon}</span><span><b>${card.name}</b><small>${card.desc}</small></span><i>›</i>`;button.onclick=()=>{card.effect(run);run.ideas++;run.cards.push(card.id);if(!data.discovered.includes(card.id))data.discovered.push(card.id);save();closeModal('#card-modal');run.stage++;run.hp=Math.min(run.maxHp,run.hp+Math.round(run.maxHp*.15));prepareBattle()};box.appendChild(button)});openModal('#card-modal');
  }
  function loseRun(){
    run.active=false;clearTimeout(battleTimer);const bonus=2+chapterFor(run.stage).id*2;data.ink+=bonus;save();$('#battle-action').disabled=false;$('#battle-action').textContent=`拠点へ戻る（インク +${bonus}）`;$('#battle-action').onclick=()=>{run=null;showView('home-view');renderHeader()};splash('敗北…');
  }
  function finishChapter(chapter,firstClear){
    const multiplier=firstClear?1:.3,reward={ink:Math.round(chapter.reward.ink*multiplier),parts:Math.max(1,Math.round(chapter.reward.parts*multiplier)),xp:Math.round(chapter.reward.xp*multiplier)};
    data.ink+=reward.ink;data.parts+=reward.parts;data.xp+=reward.xp;data.chapterClears[chapter.id]=(data.chapterClears[chapter.id]||0)+1;data.selectedStage=chapter.id<10?chapter.end+1:100;unlockEarnedWeapons();levelCheck();save();run.active=false;
    const unlockedWeapon=WEAPONS.find(w=>w.unlock===chapter.end);
    $('#chapter-clear-kicker').textContent=chapter.id===10?'ALL 100 STAGES CLEAR!':'CHAPTER CLEAR!';$('#chapter-clear-icon').textContent=chapter.id===10?'★':'✓';
    $('#chapter-clear-title').textContent=chapter.id===10?'100ステージ完全制覇！':`CHAPTER ${chapter.id} 突破！`;
    $('#chapter-clear-copy').textContent=`「${chapter.name}」をクリア。${unlockedWeapon?`新武器「${unlockedWeapon.name}」を入手しました！`:'クリア済みステージは何度でも再挑戦できます。'}`;
    $('#chapter-rewards').innerHTML=`<span>● +${reward.ink}</span><span>✂ +${reward.parts}</span><span>☆ +${reward.xp}</span>${unlockedWeapon?`<span>${unlockedWeapon.icon} NEW</span>`:''}`;
    closeModal('#dialog-modal');openModal('#chapter-modal');
  }
  function showDialog(lines,done){let index=0;const next=()=>{if(index>=lines.length){closeModal('#dialog-modal');done();return}const [speaker,text]=lines[index++];$('#dialog-speaker').textContent=speaker;$('#dialog-text').textContent=text;$('#dialog-portrait').textContent=speaker===data.heroName?'✎':'!';tone(230+index*30,.04,'triangle')};$('#dialog-next').onclick=next;openModal('#dialog-modal');next()}
  function levelCheck(){let leveled=false;while(data.xp>=xpNeeded()){data.xp-=xpNeeded();data.heroLevel++;leveled=true}if(leveled)toast(`主人公が Lv.${data.heroLevel} になった！`)}

  function renderGrowth(){
    const stats=startingStats();$('#growth-hero-level').textContent=data.heroLevel;$('#growth-total-hp').textContent=stats.maxHp;$('#growth-total-attack').textContent=Math.round(stats.attack);
    const defs={power:{max:40,currency:'ink',base:25,step:22,label:'インク'},vitality:{max:40,currency:'ink',base:25,step:22,label:'インク'},focus:{max:20,currency:'parts',base:2,step:2,label:'素材'}};
    Object.entries(defs).forEach(([id,def])=>{const level=data.growth[id],cost=def.base+level*def.step,button=$(`[data-growth="${id}"]`);$(`#${id}-level`).textContent=level;$(`#${id}-cost`).textContent=level>=def.max?'MAX':`${def.label} ${cost}`;button.disabled=level>=def.max;button.dataset.cost=cost;button.dataset.currency=def.currency});
  }
  function upgradeGrowth(id){const button=$(`[data-growth="${id}"]`),cost=Number(button.dataset.cost),currency=button.dataset.currency;if(button.disabled)return;if(data[currency]<cost){toast(`${currency==='ink'?'インク':'素材'}が${Math.ceil(cost-data[currency])}足りません`);return}data[currency]-=cost;data.growth[id]++;save();renderGrowth();tone(540,.12,'triangle');toast('永久能力が強くなった！')}

  function renderBase(){
    $('#base-level').textContent=data.baseLevel;const cost=40+(data.baseLevel-1)*35,atMax=data.baseLevel>=BASE_MAX;$('#upgrade-cost').textContent=atMax?'MAX 強化済み':`インク ${cost}`;$('#upgrade-base').disabled=atMax;
    const list=$('#facility-list');list.innerHTML='';FACILITIES.forEach(f=>{const assigned=data.assigned.includes(f.id),el=document.createElement('article');el.className='facility';el.innerHTML=`<span class="facility-icon" style="--facility-color:${f.color}">${f.icon}</span><div><b>${f.name}</b><small>${f.desc}</small></div><button class="${assigned?'assigned':''}">${assigned?'稼働中':'配置'}</button>`;el.querySelector('button').onclick=()=>toggleFacility(f.id);list.appendChild(el)});updateOfflineTime();
  }
  function slots(){return data.baseLevel>=10?3:data.baseLevel>=5?2:1}
  function toggleFacility(id){const index=data.assigned.indexOf(id);if(index>=0){if(data.assigned.length===1){toast('1つは稼働させておこう');return}data.assigned.splice(index,1)}else{if(data.assigned.length>=slots()){toast(`配置枠は${slots()}つです`);return}data.assigned.push(id)}save();renderBase()}
  function pendingMinutes(){return Math.min(720,Math.max(0,(Date.now()-data.lastClaim)/60000))}
  function offlineEstimate(mins=pendingMinutes()){
    const totals={ink:0,parts:0,xp:0};data.assigned.forEach(id=>{if(id==='ink')totals.ink+=Math.floor(mins*2);if(id==='parts')totals.parts+=Math.floor(mins);if(id==='xp')totals.xp+=Math.floor(mins*2);if(id==='treasure'){totals.ink+=Math.floor(mins*1.5);totals.parts+=Math.floor(mins/30)}});return totals;
  }
  function updateOfflineTime(){const mins=Math.floor(pendingMinutes()),hours=String(Math.floor(mins/60)).padStart(2,'0'),minutes=String(mins%60).padStart(2,'0'),t=offlineEstimate(mins);$('#offline-time').textContent=`${hours}:${minutes}`;$('#offline-preview').textContent=`見込み：インク ${t.ink} / 素材 ${t.parts} / EXP ${t.xp}`}
  function claimOffline(){
    const mins=pendingMinutes();if(mins<.2){toast('まだ報酬はたまっていません');return}const t=offlineEstimate(mins);data.ink+=Math.max(t.ink,t.parts+t.xp?0:1);data.parts+=t.parts;data.xp+=t.xp;data.lastClaim=Date.now();levelCheck();save();renderBase();toast(`インク+${t.ink} / 素材+${t.parts} / EXP+${t.xp}`);
  }
  function upgradeBase(){const cost=40+(data.baseLevel-1)*35;if(data.baseLevel>=BASE_MAX){toast('拠点は Lv.20 でMAXです');return}if(data.ink<cost){toast(`インクが${Math.ceil(cost-data.ink)}足りません`);return}data.ink-=cost;data.baseLevel++;save();renderBase();toast(`拠点が Lv.${data.baseLevel} / ${BASE_MAX} になった！`)}

  function renderStageSelect(chapterId=selectedChapter){
    selectedChapter=Math.max(1,Math.min(10,chapterId));const unlocked=Math.min(MAX_STAGE,data.bestStage+1),power=playerPower();$('#stage-unlocked').textContent=unlocked;$('#select-power').textContent=power;
    const tabs=$('#chapter-tabs');tabs.innerHTML='';CHAPTERS.forEach(ch=>{const b=document.createElement('button');b.textContent=ch.id;b.title=ch.name;b.disabled=ch.start>unlocked;b.className=ch.id===selectedChapter?'active':'';b.onclick=()=>renderStageSelect(ch.id);tabs.appendChild(b)});
    const chapter=CHAPTERS[selectedChapter-1],grid=$('#stage-grid');grid.innerHTML='';
    for(let stage=chapter.start;stage<=chapter.end;stage++){
      const b=document.createElement('button'),locked=stage>unlocked,cleared=stage<=data.bestStage,selected=stage===data.selectedStage,danger=power<recommendedPower(stage)*.8;b.disabled=locked;b.className=`stage-tile ${cleared?'cleared':''} ${selected?'selected':''} ${danger&&!locked?'danger':''}`;b.innerHTML=`<small>${stage%10===0?'BOSS':'STAGE'}</small><b>${stage}</b><span>${locked?'🔒':cleared?'✓':danger?'危険':'NEW'}</span>`;b.onclick=()=>{data.selectedStage=stage;save();renderStageSelect(selectedChapter)};grid.appendChild(b)
    }
    const selectedEnemy=enemyFor(data.selectedStage);$('#selected-stage-copy').textContent=`STAGE ${data.selectedStage}・${selectedEnemy.name}へ挑戦`;$('#start-selected').disabled=data.selectedStage>unlocked;
  }

  function renderWeapons(){
    unlockEarnedWeapons();const current=equippedWeapon(),owned=WEAPONS.filter(w=>data.weapons[w.id]).length;$('#weapon-count').textContent=`${owned}/${WEAPONS.length}`;$('#equipped-icon').textContent=current.icon;$('#equipped-name').textContent=`${current.name} Lv.${weaponLevel(current)}`;$('#equipped-effect').textContent=`${current.type}・${current.effect}`;
    const list=$('#weapon-list');list.innerHTML='';WEAPONS.forEach(w=>{const level=data.weapons[w.id]||0,unlocked=level>0,costParts=2+level*3,costInk=30+level*45,max=level>=10,el=document.createElement('article');el.className=`weapon-item ${unlocked?'':'locked'} ${data.equippedWeapon===w.id?'equipped':''}`;el.innerHTML=`<span class="weapon-icon">${unlocked?w.icon:'?'}</span><div><small>${w.type}${unlocked?`・Lv.${level}`:`・STAGE ${w.unlock}で解放`}</small><b>${unlocked?w.name:'未発見の武器'}</b><p>${unlocked?w.effect:'ボスを倒して入手しよう'}</p></div><div class="weapon-actions">${unlocked?`<button data-equip>${data.equippedWeapon===w.id?'装備中':'装備'}</button><button data-upgrade ${max?'disabled':''}>${max?'MAX':`強化<br><small>●${costInk} ✂${costParts}</small>`}</button>`:''}</div>`;
      el.querySelector('[data-equip]')?.addEventListener('click',()=>{data.equippedWeapon=w.id;save();renderWeapons();toast(`${w.name}を装備した`)});
      el.querySelector('[data-upgrade]')?.addEventListener('click',()=>upgradeWeapon(w,costInk,costParts));list.appendChild(el)
    });
  }
  function upgradeWeapon(w,ink,parts){if(data.ink<ink||data.parts<parts){toast(`必要：インク ${ink}・素材 ${parts}`);return}data.ink-=ink;data.parts-=parts;data.weapons[w.id]++;save();renderWeapons();tone(600,.14,'triangle');toast(`${w.name}が Lv.${data.weapons[w.id]} になった！`)}
  function renderCollection(){const grid=$('#collection-grid');grid.innerHTML='';$('#collection-total').textContent=`${data.discovered.length}/${CARDS.length}`;CARDS.forEach(card=>{const unlocked=data.discovered.includes(card.id),el=document.createElement('article');el.className=`collection-item ${unlocked?'':'locked'}`;el.innerHTML=`<span class="rarity">${unlocked?card.rarity:'？？？'}</span><span class="card-emoji">${unlocked?card.icon:'?'}</span><b>${unlocked?card.name:'未発見'}</b><small>${unlocked?card.desc:'冒険で見つけよう'}</small>`;grid.appendChild(el)})}

  function openTutorial(firstRun=false){tutorialIndex=0;tutorialFirstRun=firstRun;renderTutorial();openModal('#tutorial-modal')}
  function renderTutorial(){const step=TUTORIAL[tutorialIndex];$('#tutorial-visual').textContent=step.icon;$('#tutorial-kicker').textContent=step.kicker;$('#tutorial-title').textContent=step.title;$('#tutorial-copy').textContent=step.copy;$('#tutorial-next').textContent=tutorialIndex===TUTORIAL.length-1?(tutorialFirstRun?'主人公を描く →':'閉じる'):'つぎへ →';$('#tutorial-dots').innerHTML=TUTORIAL.map((_,i)=>`<i class="${i===tutorialIndex?'active':''}"></i>`).join('')}
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
  $('#start-run').onclick=()=>beginRun(Math.min(MAX_STAGE,data.bestStage+1));
  $('#open-stages').onclick=()=>{selectedChapter=chapterFor(data.selectedStage).id;renderStageSelect(selectedChapter);showView('stage-view')};
  $('#start-selected').onclick=()=>beginRun(data.selectedStage);
  $('#open-base').onclick=()=>{renderBase();showView('base-view')};$('#open-collection').onclick=()=>{renderCollection();showView('collection-view')};$('#open-growth').onclick=()=>{renderGrowth();showView('growth-view')};$('#open-weapons').onclick=()=>{renderWeapons();showView('weapons-view')};
  $$('.growth-item button').forEach(button=>button.onclick=()=>upgradeGrowth(button.dataset.growth));
  $('#quit-run').onclick=()=>{if(!confirm('挑戦を中断しますか？ 獲得した報酬は残ります。'))return;run.active=false;clearTimeout(battleTimer);run=null;showView('home-view')};
  $('#speed-button').onclick=()=>{if(!run)return;if(data.bestStage<run.stage){toast('2倍速はクリア済みステージで使えます');return}run.speed=run.speed===1?2:1;$('#speed-button').textContent=`×${run.speed}`;toast(run.speed===2?'2倍速':'通常速度')};
  $('#claim-offline').onclick=claimOffline;$('#upgrade-base').onclick=upgradeBase;
  $('#chapter-return').onclick=()=>{closeModal('#chapter-modal');run=null;showView('home-view');renderHeader()};
  $('#open-help').onclick=()=>openTutorial(false);$('#tutorial-skip').onclick=()=>finishTutorial(tutorialFirstRun);$('#tutorial-next').onclick=()=>{if(tutorialIndex<TUTORIAL.length-1){tutorialIndex++;renderTutorial()}else finishTutorial(tutorialFirstRun)};

  document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});
  document.addEventListener('dblclick',e=>e.preventDefault(),{passive:false});
  document.addEventListener('touchmove',e=>{if(e.touches.length>1)e.preventDefault()},{passive:false});
  setInterval(()=>{if($('#base-view').classList.contains('active'))updateOfflineTime()},10000);
  renderHeader();
  if(!data.tutorialSeen)setTimeout(()=>openTutorial(true),300);
  if('serviceWorker' in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
})();
