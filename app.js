(() => {
  'use strict';

  const SAVE_KEY = 'rakugakiQuestSaveV1';
  const MAX_STAGE = 100;
  const BASE_MAX = 20;
  const UAT_REWARD_MULTIPLIER = 1000;

  const ENEMY_TYPES = {
    stickman: { ink:'#25211f', fill:'#fffdf5', trait:'身軽・回避あり', hp:.8, damage:.85, evade:.1 },
    slime: { ink:'#214a3b', fill:'#7ee0ad', trait:'ぷるぷる・標準型', hp:1, damage:.85 },
    bug: { ink:'#53351e', fill:'#f4bd59', trait:'小さいが素早い', hp:.75, damage:.8, speed:1.35 },
    goblin: { ink:'#3b4025', fill:'#a8cf67', trait:'乱暴・攻撃高め', hp:.95, damage:1.25 },
    bat: { ink:'#2d2440', fill:'#806fa6', trait:'高速・回避あり', hp:.7, damage:.75, speed:1.55, evade:.08 },
    dragon: { ink:'#522c2c', fill:'#e96862', trait:'頑丈・高火力', hp:1.45, damage:1.35 },
    ghost: { ink:'#45536d', fill:'#e9f0ff', trait:'ときどき攻撃を無効化', hp:.9, damage:1, evade:.14 },
    robot: { ink:'#35404c', fill:'#aebbc9', trait:'装甲・ダメージ軽減', hp:1.3, damage:1.05, armor:.18 },
    spider: { ink:'#35273e', fill:'#8c739a', trait:'連続攻撃', hp:.85, damage:.7, speed:1.7 },
    knight: { ink:'#343945', fill:'#c5cbd3', trait:'重装甲', hp:1.55, damage:.95, armor:.26 },
    cactus: { ink:'#244f39', fill:'#69bd75', trait:'反撃のトゲ', hp:1.05, damage:1.05, thorns:.05 },
    crab: { ink:'#5b2b25', fill:'#ef766c', trait:'硬いハサミ', hp:1.35, damage:1.15, armor:.12 },
    mushroom: { ink:'#5c3448', fill:'#ed91ad', trait:'胞子で攻撃を弱める', hp:1.1, damage:.9, weaken:.08 },
    ninja: { ink:'#20232c', fill:'#555d6d', trait:'高速・高回避', hp:.8, damage:1.05, speed:1.6, evade:.16 },
    wolf: { ink:'#3c3530', fill:'#9a8a78', trait:'HP半分で狂暴化', hp:1.05, damage:1.15, berserk:1.45 },
    ogre: { ink:'#482d22', fill:'#d98456', trait:'遅いが超火力', hp:1.5, damage:1.55, speed:.75 },
    ufo: { ink:'#293b50', fill:'#89cce2', trait:'ビーム・防御貫通', hp:1, damage:1.2, pierce:.22 },
    alien: { ink:'#304d42', fill:'#83d6a9', trait:'不思議な回避', hp:.95, damage:1.05, evade:.12 },
    droid: { ink:'#343c46', fill:'#b7c3c9', trait:'自己修復', hp:1.25, damage:1, regen:.025 },
    demon: { ink:'#4c2530', fill:'#db6177', trait:'会心攻撃', hp:1.1, damage:1.35, crit:.15 },
    mimic: { ink:'#4a3120', fill:'#c98d4f', trait:'倒すと報酬2倍', hp:1.35, damage:1.15, reward:2 },
    hydra: { ink:'#274438', fill:'#62b888', trait:'三連撃級の圧力', hp:1.65, damage:1.35, speed:1.25 },
    angel: { ink:'#544a31', fill:'#fff0a1', trait:'少しずつ回復', hp:1.2, damage:1, regen:.04 },
    golem: { ink:'#3f4144', fill:'#a9a5a0', trait:'最高クラスの装甲', hp:1.8, damage:1.1, armor:.3 },
    phoenix: { ink:'#642d20', fill:'#ff9d43', trait:'HP半分で超加速', hp:1.2, damage:1.25, berserk:1.55, speed:1.2 },
    titan: { ink:'#3d4233', fill:'#929a69', trait:'巨大・超耐久', hp:2, damage:1.35 },
    void: { ink:'#29203d', fill:'#6e5a96', trait:'防御を無視する闇', hp:1.55, damage:1.45, pierce:.35 }
  };

  const ENEMY_VARIANTS = [
    {id:'plain',name:'ふつう',hp:1,damage:1,reward:1,color:null,note:'基本個体'},
    {id:'red',name:'赤インク変異',hp:1.08,damage:1.18,reward:1.3,color:'#ef476f',note:'攻撃 +18%・報酬 +30%'},
    {id:'giant',name:'でかラクガキ',hp:1.28,damage:1.08,reward:1.4,color:'#f0a23a',note:'HP +28%・報酬 +40%'},
    {id:'speedy',name:'走り書き',hp:.88,damage:1.08,speed:1.28,reward:1.25,color:'#1677ff',note:'速度 +28%・報酬 +25%'},
    {id:'blot',name:'インク暴走',hp:1.18,damage:1.24,speed:1.1,reward:1.6,color:'#7b4bc4',note:'全体強化・報酬 +60%'}
  ];

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
    { id:'boss', name:'巨大消しゴム', icon:'▰', rarity:'伝説', desc:'ボスへのダメージ+70%', effect:s=>s.bossBonus+=.7 },
    { id:'sharp', name:'芯とぎ', icon:'⌃', rarity:'通常', desc:'攻撃力+15%、会心率+8%', effect:s=>{s.attack*=1.15;s.crit=Math.min(.7,s.crit+.08)} },
    { id:'margin', name:'余白ステップ', icon:'↝', rarity:'通常', desc:'速度+12%、回避線でHP+10%', effect:s=>{s.interval*=.88;s.maxHp=Math.round(s.maxHp*1.1);s.hp=Math.min(s.maxHp,s.hp+s.maxHp*.1)} },
    { id:'paper', name:'厚紙アーマー', icon:'▤', rarity:'レア', desc:'HP+25%、ダメージ10%軽減', effect:s=>{s.maxHp=Math.round(s.maxHp*1.25);s.hp=Math.min(s.maxHp,s.hp+s.maxHp*.25);s.guard=Math.min(.65,s.guard+.1)} },
    { id:'needle', name:'コンパスの針', icon:'⌖', rarity:'レア', desc:'装甲貫通+18%', effect:s=>s.pierce=Math.min(.8,s.pierce+.18) },
    { id:'copy', name:'カーボンコピー', icon:'⧉', rarity:'伝説', desc:'追撃率+20%、攻撃力+15%', effect:s=>{s.double=Math.min(.85,s.double+.2);s.attack*=1.15} },
    { id:'revise', name:'描き直し', icon:'↻', rarity:'伝説', desc:'HPを全回復し全能力+10%', effect:s=>{s.attack*=1.1;s.maxHp=Math.round(s.maxHp*1.1);s.hp=s.maxHp;s.interval*=.9} }
  ];

  const FACILITIES = [
    {id:'ink',name:'インク工房',icon:'●',color:'#d9d3cc',desc:'UAT：放置中も毎分インク +2,000'},
    {id:'parts',name:'文房具工房',icon:'✂',color:'#ffdbaa',desc:'UAT：放置中も毎分強化素材 +1,000'},
    {id:'xp',name:'経験値スケッチ広場',icon:'☆',color:'#cde1ff',desc:'UAT：配置すると放置中も毎分EXP +2,000'},
    {id:'treasure',name:'宝探し机',icon:'?',color:'#d8f3dc',desc:'UAT：インクと素材を1000倍でランダム発見'}
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
    selectedStage:1, baseLevel:1, assigned:['ink'], lastClaim:Date.now(), discovered:[], enemyBook:{}, bossSeen:{},
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
      merged.enemyBook = typeof raw.enemyBook === 'object' && raw.enemyBook ? raw.enemyBook : {};
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
  function enemyCatalog(){return CHAPTERS.flatMap(ch=>[...ch.enemies.map(([name,type])=>({name,type,chapter:ch.id,boss:false})),{name:ch.boss[0],type:ch.boss[1],chapter:ch.id,boss:true}])}
  function enemyBookCount(){return enemyCatalog().filter(enemy=>data.enemyBook[enemy.name]).length}
  function enemyBookPercent(){return Math.round(enemyBookCount()/enemyCatalog().length*100)}
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
    $('#card-count-copy').textContent=`敵 ${enemyBookPercent()}%・強化 ${Math.round(data.discovered.length/CARDS.length*100)}%`;
    $('#growth-summary').textContent=`戦力 ${playerPower(stats)}・HP ${stats.maxHp}・攻撃 ${Math.round(stats.attack)}`;
    const activeNames=data.assigned.map(id=>FACILITIES.find(f=>f.id===id)?.name.replace('経験値','')||id).join('・');
    $('#base-summary').textContent=`Lv.${data.baseLevel} / MAX ${BASE_MAX}・稼働中：${activeNames}`;
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
  function askConfirm(title,message,okLabel,onConfirm){
    $('#confirm-title').textContent=title;$('#confirm-copy').textContent=message;$('#confirm-ok').textContent=okLabel||'OK';
    $('#confirm-cancel').onclick=()=>closeModal('#confirm-modal');$('#confirm-ok').onclick=()=>{closeModal('#confirm-modal');onConfirm?.()};openModal('#confirm-modal');
  }
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
  function drawSampleHero(ctx,id,w,h){
    ctx.clearRect(0,0,w,h);ctx.save();ctx.scale(w/320,h/250);ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=8;ctx.strokeStyle='#25211f';ctx.fillStyle='#fffdf5';
    const ellipse=(x,y,rx,ry,fill='#fffdf5')=>{ctx.fillStyle=fill;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();ctx.stroke()};
    const line=points=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke()};
    const shape=(points,fill)=>{ctx.fillStyle=fill;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();ctx.stroke()};
    const eyes=(x,y,gap=26)=>{ctx.fillStyle='#25211f';[x-gap/2,x+gap/2].forEach(ex=>{ctx.beginPath();ctx.arc(ex,y,5,0,Math.PI*2);ctx.fill()})};
    if(id==='pencil'){ellipse(145,58,30,30);eyes(145,55,22);line([[145,89],[145,167],[100,130]]);line([[145,112],[196,85]]);line([[145,167],[113,222]]);line([[145,167],[180,222]]);ctx.strokeStyle='#ef476f';ctx.lineWidth=12;line([[195,87],[228,44]]);shape([[221,40],[238,24],[231,51]],'#ead1a4')}
    if(id==='cat'){ellipse(160,122,72,68,'#f4bd59');shape([[103,81],[106,32],[137,66]],'#f4bd59');shape([[183,66],[216,32],[216,86]],'#f4bd59');eyes(160,111,36);line([[144,143],[160,151],[178,143]]);line([[97,160],[62,185],[80,205]]);line([[222,157],[253,176],[238,204]]);line([[124,185],[113,224]]);line([[196,185],[205,224]])}
    if(id==='robot'){shape([[93,48],[225,48],[235,143],[207,178],[111,178],[84,143]],'#a9d0e8');ctx.fillStyle='#fff';ctx.fillRect(115,75,89,42);ctx.strokeRect(115,75,89,42);eyes(160,96,42);line([[159,48],[159,23],[179,16]]);line([[88,104],[54,143]]);line([[232,104],[266,143]]);line([[128,178],[118,224]]);line([[192,178],[202,224]]);ellipse(159,143,20,11,'#7ee0ad')}
    if(id==='ghost'){shape([[90,220],[94,107],[111,62],[160,43],[208,62],[227,109],[231,220],[201,194],[176,222],[151,194],[123,222]],'#e9f0ff');eyes(160,113,42);ellipse(160,155,13,19,'#fff')}
    if(id==='dragon'){shape([[70,177],[90,94],[145,76],[199,105],[225,160],[196,198],[106,204]],'#7ee0ad');ellipse(205,85,45,39,'#7ee0ad');shape([[178,52],[181,15],[202,54]],'#f4bd59');shape([[219,54],[256,29],[247,73]],'#f4bd59');eyes(216,81,24);shape([[113,101],[72,37],[158,85]],'#f4bd59');line([[83,147],[36,118],[50,177]]);line([[119,199],[105,226]]);line([[188,196],[205,225]])}
    if(id==='slime'){shape([[69,202],[79,133],[109,83],[158,69],[210,86],[240,139],[251,203],[221,219],[101,219]],'#b690e8');ellipse(133,137,26,34,'#fff');ellipse(194,137,26,34,'#fff');ctx.fillStyle='#25211f';ctx.beginPath();ctx.arc(137,144,8,0,7);ctx.arc(190,144,8,0,7);ctx.fill();line([[137,185],[160,195],[187,181]])}
    ctx.restore();
  }
  function renderSampleHeroes(){$$('#sample-heroes button').forEach(button=>drawSampleHero(button.querySelector('canvas').getContext('2d'),button.dataset.sample,96,76))}
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
  const SAMPLE_NAMES={pencil:'えんぴつ勇者',cat:'まるネコ',robot:'ハコロボ',ghost:'ぷかオバケ',dragon:'ちびドラゴン',slime:'目玉スライム'};
  function selectSample(id){const canvas=$('#draw-canvas');drawSampleHero(canvas.getContext('2d'),id,canvas.width,canvas.height);draw.pushHistory?.();$('#name-input').value=SAMPLE_NAMES[id]||'サンプル勇者';$$('#sample-heroes button').forEach(button=>button.classList.toggle('selected',button.dataset.sample===id));tone(470,.08,'triangle')}

  function seedFrom(text){let seed=0;for(const char of text)seed=(seed*31+char.charCodeAt(0))>>>0;return()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296)}
  function drawEnemyArt(canvas,enemy,locked=false){
    const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height,scale=Math.min(w,h)/220,rnd=seedFrom(`${enemy.name}-${enemy.variant?.id||'plain'}`);
    ctx.clearRect(0,0,w,h);ctx.save();ctx.scale(scale,scale);ctx.translate((w/scale-220)/2,0);ctx.lineCap='round';ctx.lineJoin='round';
    const ink=locked?'#5f5b55':(enemy.variant?.color||enemy.ink||'#25211f'),fill=locked?'#cbc7bf':(enemy.fill||'#fff');ctx.strokeStyle=ink;ctx.fillStyle=fill;ctx.lineWidth=5;
    const line=(points,width=5)=>{ctx.lineWidth=width;for(let pass=0;pass<2;pass++){ctx.globalAlpha=pass?.22:1;ctx.beginPath();points.forEach(([x,y],i)=>{const j=pass?2.2:0,px=x+(rnd()-.5)*j,py=y+(rnd()-.5)*j;i?ctx.lineTo(px,py):ctx.moveTo(px,py)});ctx.stroke()}ctx.globalAlpha=1};
    const shape=(points,close=true,shade=fill)=>{ctx.fillStyle=shade;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x+(rnd()-.5)*2,y+(rnd()-.5)*2):ctx.moveTo(x,y));if(close)ctx.closePath();ctx.fill();ctx.stroke();};
    const ellipse=(x,y,rx,ry,shade=fill)=>{ctx.fillStyle=shade;ctx.beginPath();ctx.ellipse(x,y,rx,ry,(rnd()-.5)*.08,0,Math.PI*2);ctx.fill();ctx.stroke()};
    const eyes=(x,y,gap=20,angry=false,count=2)=>{ctx.fillStyle=ink;for(let i=0;i<count;i++){const ex=x+(i-(count-1)/2)*gap;ctx.beginPath();ctx.ellipse(ex,y,3.5,angry?2:5,0,0,Math.PI*2);ctx.fill();if(angry)line([[ex-6,y-7+i%2*2],[ex+5,y-4-i%2*2]],3)}};
    const feet=(x1,x2,y)=>{line([[x1,y-8],[x1-8,y+7],[x1+6,y+7]],4);line([[x2,y-8],[x2-6,y+7],[x2+9,y+7]],4)};
    const humanoid=(kind)=>{ellipse(110,65,32,29);shape([[82,91],[139,91],[148,157],[72,157]],true);eyes(110,60,19,kind==='ogre'||kind==='demon');line([[88,109],[56,137],[44,119]],5);line([[135,108],[165,134],[176,111]],5);feet(90,130,178);if(kind==='goblin'){shape([[79,59],[49,47],[79,78]]);shape([[141,59],[171,47],[141,78]]);line([[165,130],[188,84]],8);ellipse(190,77,9,13,'#b88a58')}if(kind==='ninja'){ctx.fillStyle=ink;ctx.fillRect(80,49,60,22);ctx.fillStyle='#fff';ctx.fillRect(92,55,36,8);line([[139,103],[179,73]],4);line([[170,67],[185,82]],4)}if(kind==='ogre'){shape([[87,42],[94,16],[105,42]],true,'#f0dfbb');shape([[115,41],[132,15],[134,49]],true,'#f0dfbb');line([[73,117],[43,89]],10)}if(kind==='demon'){shape([[84,45],[75,18],[103,41]]);shape([[121,41],[148,18],[140,50]]);line([[143,150],[176,159],[167,178]],4)}if(kind==='angel'){line([[76,102],[45,82],[53,131],[78,145]],4);line([[143,102],[176,82],[169,132],[143,145]],4);ctx.strokeStyle='#d6a600';ellipse(110,26,30,8,'transparent')}};
    const quadruped=(kind)=>{shape([[48,119],[66,83],[129,76],[164,102],[156,146],[76,148]],true);ellipse(160,82,34,28);eyes(169,78,17,true);feet(80,139,174);if(kind==='wolf'){shape([[137,59],[142,27],[158,57]]);shape([[163,56],[186,31],[184,68]]);shape([[48,105],[22,78],[35,125]])}else{shape([[142,57],[143,28],[159,57]]);shape([[173,58],[193,37],[188,72]]);line([[58,96],[34,54],[91,82]],4);shape([[74,86],[48,44],[107,78]],true,'#f3a66c');line([[189,93],[207,87]],4)}};
    switch(enemy.type){
      case 'stickman': ellipse(110,42,22,22,'#fffdf5');eyes(110,39,13);line([[110,65],[110,131],[68,103]],6);line([[110,88],[153,103]],6);line([[110,131],[79,180]],6);line([[110,131],[145,180]],6);break;
      case 'slime': shape([[48,158],[57,111],[78,81],[105,72],[136,80],[161,110],[172,158],[153,171],[71,171]],true);eyes(111,116,27);line([[99,143],[111,148],[126,140]],4);break;
      case 'bug': for(let i=0;i<4;i++)ellipse(67+i*27,116-(i%2)*5,21,24,i%2?fill:'#f7cf73');eyes(55,107,12,false);for(let i=0;i<4;i++){line([[72+i*23,133],[62+i*23,157]],3);line([[72+i*23,100],[65+i*23,79]],3)}line([[45,94],[30,73]],3);line([[57,93],[69,69]],3);break;
      case 'goblin':case 'ninja':case 'ogre':case 'demon':case 'angel':humanoid(enemy.type);break;
      case 'bat': shape([[108,92],[61,62],[19,88],[51,103],[25,126],[88,119],[110,145],[132,119],[195,126],[169,103],[201,88],[159,62]],true);ellipse(110,100,25,31);eyes(110,96,16,true);break;
      case 'dragon':case 'titan':case 'wolf':quadruped(enemy.type);if(enemy.type==='titan'){line([[86,80],[75,49],[102,75]],6);line([[117,77],[117,42],[135,79]],6)}break;
      case 'ghost': shape([[55,169],[58,92],[72,58],[110,43],[148,58],[163,94],[166,169],[143,151],[125,171],[105,151],[84,171]],true);eyes(110,92,25);ellipse(110,123,9,14,'#fffdf5');break;
      case 'robot':case 'droid': shape([[70,61],[148,61],[158,127],[145,155],[77,155],[62,127]],true);ctx.fillStyle='#fff';ctx.fillRect(83,81,55,27);ctx.strokeRect(83,81,55,27);eyes(110,95,23);line([[109,61],[109,35],[125,25]],5);line([[66,100],[37,126]],8);line([[153,100],[183,126]],8);feet(88,135,178);if(enemy.type==='droid'){ellipse(110,129,19,10,'#80d0b0');line([[91,129],[129,129]],3)}break;
      case 'spider': ellipse(110,110,40,35);eyes(110,101,13,false,4);for(let i=0;i<4;i++){line([[78,95+i*10],[43-i*5,72+i*26],[24,69+i*28]],4);line([[142,95+i*10],[177+i*5,72+i*26],[196,69+i*28]],4)}break;
      case 'knight': humanoid('knight');shape([[78,42],[143,42],[149,82],[110,103],[72,82]],true,'#c5cbd3');line([[82,69],[138,69]],5);shape([[144,107],[182,96],[186,151],[159,169],[140,145]],true,'#dce2e8');break;
      case 'cactus': shape([[86,177],[85,86],[66,69],[72,117],[48,117],[43,79],[29,79],[29,132],[84,141],[138,141],[190,121],[190,75],[174,75],[172,105],[139,112],[139,72],[122,55],[88,72]],true);eyes(111,105,19);for(let i=0;i<12;i++)line([[57+rnd()*108,76+rnd()*72],[54+rnd()*113,70+rnd()*76]],2);break;
      case 'crab': ellipse(110,123,48,34);eyes(110,104,30);line([[77,120],[45,95]],5);ellipse(36,84,19,15);line([[143,120],[174,95]],5);ellipse(184,84,19,15);for(let i=0;i<3;i++){line([[82+i*8,145],[62+i*7,169]],4);line([[138-i*8,145],[158-i*7,169]],4)}break;
      case 'mushroom': shape([[72,97],[82,67],[109,54],[140,63],[156,98]],true);ellipse(113,96,54,32);shape([[92,112],[134,112],[142,177],[83,177]],true,'#f3e1c7');eyes(112,143,18);break;
      case 'ufo': ellipse(110,95,76,24);shape([[72,91],[86,51],[133,47],[151,91]],true,'#c9edfa');eyes(110,69,23);line([[69,116],[43,169]],3);line([[151,116],[176,169]],3);break;
      case 'alien': ellipse(110,70,45,42);eyes(110,66,31);shape([[84,103],[136,103],[148,165],[73,165]],true);line([[80,117],[48,144]],4);line([[140,117],[174,144]],4);feet(91,132,181);break;
      case 'mimic': shape([[55,88],[165,88],[174,166],[46,166]],true);shape([[47,89],[66,54],[157,54],[173,89]],true,'#e3ad62');eyes(110,72,35,true);for(let i=0;i<7;i++)shape([[61+i*16,115],[69+i*16,136],[77+i*16,115]],true,'#fff');break;
      case 'hydra': shape([[72,165],[78,116],[101,91],[119,119],[139,91],[151,121],[160,165]],true);[69,110,151].forEach((x,i)=>{line([[110+(i-1)*18,125],[x,70]],10);ellipse(x,54,25,23);eyes(x,52,13,true)});break;
      case 'golem': shape([[67,67],[103,46],[140,59],[160,103],[149,162],[113,178],[69,161],[51,113]],true);shape([[35,89],[66,83],[65,143],[34,151]],true,'#bbb5ae');shape([[157,83],[188,91],[187,151],[154,143]],true,'#bbb5ae');eyes(109,96,24,true);line([[88,124],[133,124]],5);break;
      case 'phoenix': shape([[110,145],[74,119],[28,123],[59,92],[34,65],[90,89],[110,50],[130,89],[186,65],[161,92],[192,123],[146,119]],true);ellipse(110,111,27,45);eyes(110,90,14,true);shape([[95,149],[110,193],[126,149]],true,'#ff5d3d');break;
      case 'void': ellipse(110,80,51,45);eyes(110,75,27,false);for(let i=0;i<7;i++){const x=67+i*14;line([[x,111],[x+(i%2?18:-18),145],[x+(i%2?-8:8),181]],7)}ctx.fillStyle='#fff';ellipse(110,101,11,7,'#fff');break;
      default: ellipse(110,110,55,55);eyes(110,100,28);line([[90,140],[110,148],[134,138]],4);
    }
    ctx.strokeStyle=ink;ctx.lineWidth=5;ctx.globalAlpha=1;
    /* 名前に含まれる文房具・世界観を、色替えではなく形として描き足す */
    const pencil=(x,y,angle=0,color='#f4bd48')=>{ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle=color;ctx.fillRect(-7,-42,14,66);ctx.strokeRect(-7,-42,14,66);shape([[-7,24],[0,42],[7,24]],true,'#ead1a4');ctx.restore()};
    const ruler=(x,y,angle=0)=>{ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle='rgba(255,218,82,.82)';ctx.fillRect(-9,-48,18,96);ctx.strokeRect(-9,-48,18,96);for(let i=-38;i<43;i+=10)line([[0,i],[7,i]],2);ctx.restore()};
    const brush=(x,y,angle=0)=>{ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle='#9b633e';ctx.fillRect(-5,-45,10,62);ctx.strokeRect(-5,-45,10,62);shape([[-11,17],[0,45],[11,17]],true,'#29211d');ctx.restore()};
    const sticky=(x,y,angle=0)=>{ctx.save();ctx.translate(x,y);ctx.rotate(angle);shape([[-26,-23],[26,-23],[26,23],[-14,23],[-26,12]],true,'#ffe45f');line([[-14,23],[-14,12],[-26,12]],2);ctx.restore()};
    if(enemy.name.includes('ケシカス')){for(let i=0;i<7;i++)ellipse(45+i*18,181-(i%2)*4,4+i%3,3,'#d8d4cc')}
    if(enemy.name.includes('折れ芯')){for(let i=0;i<5;i++)shape([[62+i*23,147],[70+i*23,180],[77+i*23,148]],true,'#2b2b2b')}
    if(enemy.name.includes('ヌリツブシ')){shape([[76,45],[88,17],[109,39],[130,14],[146,48]],true,'#f3c849');ctx.globalAlpha=.2;ctx.fillStyle='#111';ctx.fillRect(61,69,99,91);ctx.globalAlpha=1}
    if(enemy.name.includes('ふせん')){sticky(48,86,-.35);sticky(172,86,.35)}
    if(enemy.name.includes('赤ペン'))pencil(187,119,.36,'#ef476f');
    if(enemy.name.includes('白紙')){line([[62,163],[80,176],[98,162],[118,177],[139,162],[160,175]],3)}
    if(enemy.name.includes('ブリキ')){for(let i=0;i<3;i++)line([[76,113+i*12],[145,113+i*12]],2)}
    if(enemy.name.includes('インクグモ')){ellipse(110,163,13,18,'#2f2350');line([[110,146],[110,128]],3)}
    if(enemy.name.includes('マッシロ')){ctx.fillStyle='#fff';ctx.globalAlpha=.72;ctx.fillRect(48,80,124,78);ctx.globalAlpha=1;line([[51,86],[168,151]],6)}
    if(enemy.name.includes('定規'))ruler(169,127,.18);
    if(enemy.name.includes('ゼンマイ')){line([[110,53],[110,24],[132,24],[132,13]],5);line([[121,13],[143,13]],5)}
    if(enemy.name.includes('ホチキス')){shape([[58,93],[166,93],[177,120],[65,122]],true,'#ef6f61');shape([[65,124],[176,124],[165,147],[72,147]],true,'#d8d8d8');for(let i=0;i<4;i++)shape([[46+i*42,147],[53+i*42,177],[61+i*42,147]],false,'transparent')}
    if(enemy.name.includes('コンパス')){line([[168,72],[145,176]],6);line([[168,72],[194,176]],6);ellipse(168,67,8,8,'#ffd447')}
    if(enemy.name.includes('えんぴつサボテン')){pencil(110,67,0,'#f4bd48');pencil(54,116,-.7,'#ef476f')}
    if(enemy.name.includes('ノート')){shape([[60,70],[156,64],[170,149],[75,155]],true,'#f7f3e8');for(let y=85;y<145;y+=14)line([[78,y],[154,y]],2);line([[73,70],[84,154]],4)}
    if(enemy.name.includes('消しゴム')){shape([[68,62],[153,62],[165,98],[58,98]],true,'#ef91a9');shape([[93,62],[153,62],[165,98],[91,98]],true,'#91b8ed')}
    if(enemy.name.includes('砂消し')){shape([[173,75],[203,87],[183,112]],true,'#b9945a');for(let i=0;i<5;i++)ellipse(30+i*8,177-rnd()*7,2,2,'#b9945a')}
    if(enemy.name.includes('墨汁')){ellipse(43,149,18,11,'#232323');brush(168,121,.4)}
    if(enemy.name.includes('下書き')){ctx.setLineDash([6,6]);line([[45,72],[176,156]],3);ctx.setLineDash([])}
    if(enemy.name.includes('筆'))brush(45,112,-.55);
    if(enemy.name.includes('クリップ')){ctx.beginPath();ctx.ellipse(110,96,83,35,0,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.ellipse(110,96,66,23,0,0,Math.PI*2);ctx.stroke()}
    if(enemy.name.includes('ケイセン')){for(let x=72;x<151;x+=18)line([[x,108],[x,166]],2);for(let y=119;y<167;y+=15)line([[70,y],[151,y]],2)}
    if(enemy.name.includes('計算')){ctx.fillStyle='#fff';ctx.fillRect(80,105,60,48);ctx.strokeRect(80,105,60,48);for(let y=116;y<148;y+=14)for(let x=91;x<132;x+=14)ellipse(x,y,3,3,'#4e8bb5')}
    if(enemy.name.includes('銀河')){for(let i=0;i<9;i++){ctx.fillStyle=i%2?'#ffd447':'#fff';ctx.fillRect(38+rnd()*145,30+rnd()*125,3,3)}}
    if(enemy.name.includes('赤インク')){ctx.fillStyle='#ef476f';ctx.globalAlpha=.3;ctx.fillRect(57,85,106,84);ctx.globalAlpha=1}
    if(enemy.name.includes('筆箱')){line([[58,91],[162,91]],6);ellipse(148,91,5,5,'#f3c849')}
    if(enemy.name.includes('三つ首')){ctx.font='900 16px sans-serif';ctx.fillStyle=ink;ctx.fillText('1',62,43);ctx.fillText('2',104,34);ctx.fillText('3',147,43)}
    if(enemy.name.includes('ページイーター')){shape([[44,56],[176,45],[181,183],[40,174]],false,'transparent');for(let i=0;i<5;i++)line([[58,68+i*21],[87,71+i*21]],2)}
    if(enemy.name.includes('修正')){ctx.fillStyle='#fff';ctx.fillRect(72,113,75,18);ctx.strokeRect(72,113,75,18);line([[147,122],[185,145]],5)}
    if(enemy.name.includes('石版')){ctx.font='900 18px serif';ctx.fillStyle=ink;ctx.fillText('△ ○ ×',72,135)}
    if(enemy.name.includes('クレヨン')){pencil(56,127,-.55,'#ef476f');pencil(165,127,.55,'#1677ff')}
    if(enemy.name.includes('七色')){['#ef476f','#ff9f1c','#ffd447','#06a77d','#1677ff'].forEach((c,i)=>{ctx.strokeStyle=c;ctx.lineWidth=3;ctx.beginPath();ctx.arc(110,106,71+i*3,Math.PI,Math.PI*2);ctx.stroke()});ctx.strokeStyle=ink}
    if(enemy.name.includes('余白')){ctx.setLineDash([9,7]);ctx.strokeRect(32,31,156,158);ctx.setLineDash([])}
    if(enemy.name.includes('終末')){ctx.globalAlpha=.22;ctx.fillStyle='#20202c';ctx.fillRect(30,34,160,145);ctx.globalAlpha=1;line([[35,39],[185,176]],8)}
    if(enemy.name.includes('インク神')){ctx.font='900 54px sans-serif';ctx.fillStyle='#fff';ctx.fillText('0',91,104);ctx.strokeStyle='#fff';ctx.strokeText('0',91,104)}
    if(enemy.variant?.id==='red')line([[35,42],[49,31],[43,52]],5);if(enemy.variant?.id==='giant'){ctx.strokeStyle='#f0a23a';ctx.strokeRect(10,10,200,200)}if(enemy.variant?.id==='speedy'){line([[18,82],[48,82]],4);line([[12,105],[43,105]],4);line([[22,128],[50,128]],4)}if(enemy.variant?.id==='blot'){for(let i=0;i<8;i++){ctx.fillStyle='#7b4bc4';ctx.beginPath();ctx.arc(20+rnd()*180,20+rnd()*180,2+rnd()*6,0,Math.PI*2);ctx.fill()}}
    if(locked){ctx.globalCompositeOperation='source-atop';ctx.fillStyle='rgba(25,25,25,.42)';ctx.fillRect(0,0,220,220)}ctx.restore();
  }

  function chooseEnemyVariant(stage,boss){
    if(boss)return {id:'boss',name:'ボス個体',hp:1,damage:1,reward:1,color:'#ef476f',note:'章の主'};
    const chapter=chapterFor(stage),roll=Math.random(),rare=.07+chapter.id*.012;
    if(roll<rare*.18)return ENEMY_VARIANTS[4];
    if(roll<rare*.48)return ENEMY_VARIANTS[1];
    if(roll<rare*.75)return ENEMY_VARIANTS[2];
    if(roll<rare)return ENEMY_VARIANTS[3];
    return ENEMY_VARIANTS[0];
  }
  function enemyFor(stage,rollVariant=false){
    const chapter=chapterFor(stage),boss=stage===chapter.end,entry=boss?chapter.boss:chapter.enemies[(stage-chapter.start)%chapter.enemies.length],type=ENEMY_TYPES[entry[1]],variant=rollVariant?chooseEnemyVariant(stage,boss):ENEMY_VARIANTS[0];
    const hp=Math.round(90*Math.pow(1.047,stage-1)*type.hp*(boss?2.25:1)*(variant.hp||1));
    const damage=Math.round(5.5*Math.pow(1.032,stage-1)*type.damage*(boss?1.35:1)*(variant.damage||1));
    return {...type,name:entry[0],type:entry[1],boss,hp,damage,variant,speed:(type.speed||1)*(variant.speed||1),reward:(type.reward||1)*(variant.reward||1),chapter:chapter.id};
  }
  function beginRun(stage){
    if(!data.heroImage){openDrawing();toast('まずは主人公を描こう！');return}
    const unlocked=Math.min(MAX_STAGE,data.bestStage+1),chosen=Math.max(1,Math.min(unlocked,Number(stage)||data.selectedStage||unlocked)),stats=startingStats();
    data.selectedStage=chosen;save();
    run={stage:chosen,startStage:chosen,hp:stats.maxHp,maxHp:stats.maxHp,attack:stats.attack,interval:1450,guard:0,crit:stats.crit,leech:0,double:0,bossBonus:0,pierce:stats.pierce,ideas:0,cards:[],enemyHp:0,enemyMaxHp:0,active:false,speed:1,weapon:stats.weapon};
    showView('battle-view');prepareBattle();
  }
  function prepareBattle(){
    clearTimeout(battleTimer);const chapter=chapterFor(run.stage),enemy=enemyFor(run.stage,true);
    run.enemy=enemy;run.enemyHp=run.enemyMaxHp=enemy.hp;run.active=false;
    $('#stage-number').textContent=run.stage;$('#battle-chapter').textContent=`CHAPTER ${chapter.id}・${chapter.name}・推奨戦力 ${recommendedPower(run.stage)}`;
    $('#enemy-name').textContent=enemy.name;$('#enemy-trait').textContent=`${enemy.variant.name}・${enemy.trait}`;
    const scene=$('#battle-scene');scene.className=`battle-scene ${chapter.theme} weapon-${run.weapon.type==='近接'?'melee':run.weapon.type==='遠距離'?'range':'magic'}`;
    const art=$('#enemy-art');art.className=`enemy-art enemy-${enemy.type}`;
    drawEnemyArt($('#enemy-canvas'),enemy);
    const record=data.enemyBook[enemy.name]||{count:0,variants:[]};record.count++;if(!record.variants.includes(enemy.variant.id))record.variants.push(enemy.variant.id);record.lastStage=run.stage;data.enemyBook[enemy.name]=record;save();
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
    Object.entries(defs).forEach(([id,def])=>{const level=data.growth[id],cost=def.base+level*def.step,button=$(`[data-growth="${id}"]`),max=level>=def.max,affordable=data[def.currency]>=cost;$(`#${id}-level`).textContent=level;$(`#${id}-cost`).textContent=max?'MAX':`${def.label} ${cost}`;button.disabled=max||!affordable;button.classList.toggle('unaffordable',!max&&!affordable);button.dataset.cost=cost;button.dataset.currency=def.currency});
  }
  function upgradeGrowth(id){const button=$(`[data-growth="${id}"]`),cost=Number(button.dataset.cost),currency=button.dataset.currency;if(button.disabled)return;if(data[currency]<cost){toast(`${currency==='ink'?'インク':'素材'}が${Math.ceil(cost-data[currency])}足りません`);return}data[currency]-=cost;data.growth[id]++;save();renderGrowth();tone(540,.12,'triangle');toast('永久能力が強くなった！')}

  function renderBase(){
    $('#base-level').textContent=data.baseLevel;const cost=40+(data.baseLevel-1)*35,atMax=data.baseLevel>=BASE_MAX,affordable=data.ink>=cost;$('#upgrade-cost').textContent=atMax?'MAX 強化済み':`インク ${cost}`;$('#upgrade-base').disabled=atMax||!affordable;$('#upgrade-base').classList.toggle('unaffordable',!atMax&&!affordable);
    const list=$('#facility-list');list.innerHTML='';FACILITIES.forEach(f=>{const assigned=data.assigned.includes(f.id),el=document.createElement('article');el.className='facility';el.innerHTML=`<span class="facility-icon" style="--facility-color:${f.color}">${f.icon}</span><div><b>${f.name}</b><small>${f.desc}</small></div><button class="${assigned?'assigned':''}">${assigned?'稼働中':'配置'}</button>`;el.querySelector('button').onclick=()=>toggleFacility(f.id);list.appendChild(el)});updateOfflineTime();
  }
  function slots(){return data.baseLevel>=10?3:data.baseLevel>=5?2:1}
  function toggleFacility(id){const index=data.assigned.indexOf(id);if(index>=0){if(data.assigned.length===1){toast('1つは稼働させておこう');return}data.assigned.splice(index,1)}else{if(data.assigned.length>=slots()){toast(`配置枠は${slots()}つです`);return}data.assigned.push(id)}save();renderBase()}
  function pendingMinutes(){return Math.min(720,Math.max(0,(Date.now()-data.lastClaim)/60000))}
  function offlineEstimate(mins=pendingMinutes()){
    const totals={ink:0,parts:0,xp:0};data.assigned.forEach(id=>{if(id==='ink')totals.ink+=Math.floor(mins*2*UAT_REWARD_MULTIPLIER);if(id==='parts')totals.parts+=Math.floor(mins*UAT_REWARD_MULTIPLIER);if(id==='xp')totals.xp+=Math.floor(mins*2*UAT_REWARD_MULTIPLIER);if(id==='treasure'){totals.ink+=Math.floor(mins*1.5*UAT_REWARD_MULTIPLIER);totals.parts+=Math.floor(mins/30*UAT_REWARD_MULTIPLIER)}});return totals;
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
    const list=$('#weapon-list');list.innerHTML='';WEAPONS.forEach(w=>{const level=data.weapons[w.id]||0,unlocked=level>0,costParts=2+level*3,costInk=30+level*45,max=level>=10,affordable=data.ink>=costInk&&data.parts>=costParts,el=document.createElement('article');el.className=`weapon-item ${unlocked?'':'locked'} ${data.equippedWeapon===w.id?'equipped':''}`;el.innerHTML=`<span class="weapon-icon">${unlocked?w.icon:'?'}</span><div><small>${w.type}${unlocked?`・Lv.${level}`:`・STAGE ${w.unlock}で解放`}</small><b>${unlocked?w.name:'未発見の武器'}</b><p>${unlocked?w.effect:'ボスを倒して入手しよう'}</p></div><div class="weapon-actions">${unlocked?`<button data-equip>${data.equippedWeapon===w.id?'装備中':'装備'}</button><button data-upgrade ${max||!affordable?'disabled':''} class="${!max&&!affordable?'unaffordable':''}">${max?'MAX':`強化<br><small>●${costInk} ✂${costParts}</small>`}</button>`:''}</div>`;
      el.querySelector('[data-equip]')?.addEventListener('click',()=>{data.equippedWeapon=w.id;save();renderWeapons();toast(`${w.name}を装備した`)});
      el.querySelector('[data-upgrade]')?.addEventListener('click',()=>upgradeWeapon(w,costInk,costParts));list.appendChild(el)
    });
  }
  function upgradeWeapon(w,ink,parts){if(data.ink<ink||data.parts<parts){toast(`必要：インク ${ink}・素材 ${parts}`);return}data.ink-=ink;data.parts-=parts;data.weapons[w.id]++;save();renderWeapons();tone(600,.14,'triangle');toast(`${w.name}が Lv.${data.weapons[w.id]} になった！`)}
  function renderEnemyBook(){
    const grid=$('#enemy-collection-grid');grid.innerHTML='';const catalog=enemyCatalog();
    catalog.forEach(entry=>{const record=data.enemyBook[entry.name],unlocked=!!record,type=ENEMY_TYPES[entry.type],el=document.createElement('article');el.className=`enemy-book-item ${unlocked?'':'locked'} ${entry.boss?'boss-entry':''}`;
      const canvas=document.createElement('canvas');canvas.width=180;canvas.height=160;canvas.setAttribute('aria-label',unlocked?entry.name:'未遭遇の敵');
      const copy=document.createElement('div');copy.innerHTML=`<span>${entry.boss?'BOSS':`CH.${entry.chapter}`}</span><b>${unlocked?entry.name:'？？？？？'}</b><small>${unlocked?type.trait:'この敵に出会うと記録されます'}</small>${unlocked?`<em>遭遇 ${record.count}回・個体 ${record.variants.length}/${entry.boss?1:5}</em>`:'<em>未遭遇</em>'}`;
      el.append(canvas,copy);grid.appendChild(el);drawEnemyArt(canvas,{...type,...entry,variant:ENEMY_VARIANTS[0]},!unlocked)
    });
  }
  function renderCardBook(){const grid=$('#collection-grid');grid.innerHTML='';CARDS.forEach(card=>{const unlocked=data.discovered.includes(card.id),el=document.createElement('article');el.className=`collection-item ${unlocked?'':'locked'}`;el.innerHTML=`<span class="rarity">${unlocked?card.rarity:'？？？'}</span><span class="card-emoji">${unlocked?card.icon:'?'}</span><b>${unlocked?card.name:'未発見'}</b><small>${unlocked?card.desc:'冒険で見つけよう'}</small>`;grid.appendChild(el)})}
  function renderCollection(tab='enemy'){
    const enemyCount=enemyBookCount(),allCount=enemyCatalog().length,cardCount=data.discovered.length,totalPercent=Math.round((enemyCount+cardCount)/(allCount+CARDS.length)*100);
    $('#collection-total').textContent=`${totalPercent}%`;$('#enemy-book-total').textContent=`${enemyCount}/${allCount}`;$('#card-book-total').textContent=`${cardCount}/${CARDS.length}`;
    const enemyMode=tab==='enemy';$('#enemy-book-tab').classList.toggle('active',enemyMode);$('#card-book-tab').classList.toggle('active',!enemyMode);$('#enemy-collection-grid').classList.toggle('hidden',!enemyMode);$('#collection-grid').classList.toggle('hidden',enemyMode);$('#collection-lead').textContent=enemyMode?'出会った敵の落書き、特性、出現場所を記録。レア個体は5種類あります。':'冒険中に一度でも選んだ強化が記録されます。';
    if(enemyMode)renderEnemyBook();else renderCardBook();
  }

  function openTutorial(firstRun=false){tutorialIndex=0;tutorialFirstRun=firstRun;renderTutorial();openModal('#tutorial-modal')}
  function renderTutorial(){const step=TUTORIAL[tutorialIndex];$('#tutorial-visual').textContent=step.icon;$('#tutorial-kicker').textContent=step.kicker;$('#tutorial-title').textContent=step.title;$('#tutorial-copy').textContent=step.copy;$('#tutorial-next').textContent=tutorialIndex===TUTORIAL.length-1?(tutorialFirstRun?'主人公を描く →':'閉じる'):'つぎへ →';$('#tutorial-dots').innerHTML=TUTORIAL.map((_,i)=>`<i class="${i===tutorialIndex?'active':''}"></i>`).join('')}
  function finishTutorial(openDraw=false){data.tutorialSeen=true;save();closeModal('#tutorial-modal');if(openDraw&&!data.heroImage)setTimeout(openDrawing,80)}

  $('#logo-button').onclick=()=>{if(run?.active){askConfirm('冒険を中断する？','ここまでに獲得した報酬は残ります。','拠点へ戻る',()=>{run.active=false;clearTimeout(battleTimer);run=null;showView('home-view')});return}showView('home-view')};
  $$('.back-home').forEach(button=>button.onclick=()=>showView('home-view'));
  $('#open-draw').onclick=openDrawing;$('#close-draw').onclick=()=>closeModal('#draw-modal');
  $$('#sample-heroes button').forEach(button=>button.onclick=()=>selectSample(button.dataset.sample));
  $('#save-drawing').onclick=()=>{const canvas=$('#draw-canvas'),ctx=canvas.getContext('2d'),pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;let visible=false;for(let i=3;i<pixels.length;i+=4){if(pixels[i]>8){visible=true;break}}if(!visible){toast('主人公を描いてね！');return}data.heroImage=canvas.toDataURL('image/png');data.heroName=$('#name-input').value.trim()||'ななしのラクガキ';save();closeModal('#draw-modal');toast(`${data.heroName}が誕生！ 冒険へ出よう`)};
  $$('.color').forEach(button=>button.onclick=()=>{$$('.color').forEach(x=>x.classList.remove('active'));button.classList.add('active');draw.color=button.dataset.color;draw.eraser=false;$('#eraser').classList.remove('active')});
  $('#thin-pen').onclick=()=>{draw.width=8;draw.eraser=false;$$('.tool').forEach(x=>x.classList.remove('active'));$('#thin-pen').classList.add('active')};
  $('#thick-pen').onclick=()=>{draw.width=20;draw.eraser=false;$$('.tool').forEach(x=>x.classList.remove('active'));$('#thick-pen').classList.add('active')};
  $('#eraser').onclick=()=>{draw.eraser=true;$$('.tool').forEach(x=>x.classList.remove('active'));$('#eraser').classList.add('active')};
  $('#undo').onclick=()=>{if(draw.history.length<2)return;draw.history.pop();const img=new Image();img.onload=()=>{const ctx=$('#draw-canvas').getContext('2d');ctx.clearRect(0,0,640,420);ctx.drawImage(img,0,0)};img.src=draw.history.at(-1)};
  $('#clear-canvas').onclick=()=>askConfirm('絵を全部消す？','消したあとも「元に戻す」で1つ前の状態へ戻せます。','全部消す',()=>{$('#draw-canvas').getContext('2d').clearRect(0,0,640,420);draw.pushHistory?.()});
  $('#start-run').onclick=()=>beginRun(Math.min(MAX_STAGE,data.bestStage+1));
  $('#open-stages').onclick=()=>{selectedChapter=chapterFor(data.selectedStage).id;renderStageSelect(selectedChapter);showView('stage-view')};
  $('#start-selected').onclick=()=>beginRun(data.selectedStage);
  $('#open-base').onclick=()=>{renderBase();showView('base-view')};$('#open-collection').onclick=()=>{renderCollection();showView('collection-view')};$('#open-growth').onclick=()=>{renderGrowth();showView('growth-view')};$('#open-weapons').onclick=()=>{renderWeapons();showView('weapons-view')};
  $('#enemy-book-tab').onclick=()=>renderCollection('enemy');$('#card-book-tab').onclick=()=>renderCollection('card');
  $$('.growth-item button').forEach(button=>button.onclick=()=>upgradeGrowth(button.dataset.growth));
  $('#quit-run').onclick=()=>askConfirm('冒険を中断する？','ここまでに獲得した報酬は残ります。','中断する',()=>{run.active=false;clearTimeout(battleTimer);run=null;showView('home-view')});
  $('#speed-button').onclick=()=>{if(!run)return;if(data.bestStage<run.stage){toast('2倍速はクリア済みステージで使えます');return}run.speed=run.speed===1?2:1;$('#speed-button').textContent=`×${run.speed}`;toast(run.speed===2?'2倍速':'通常速度')};
  $('#claim-offline').onclick=claimOffline;$('#upgrade-base').onclick=upgradeBase;
  $('#chapter-return').onclick=()=>{closeModal('#chapter-modal');run=null;showView('home-view');renderHeader()};
  $('#open-help').onclick=()=>openTutorial(false);$('#tutorial-skip').onclick=()=>finishTutorial(tutorialFirstRun);$('#tutorial-next').onclick=()=>{if(tutorialIndex<TUTORIAL.length-1){tutorialIndex++;renderTutorial()}else finishTutorial(tutorialFirstRun)};

  document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});
  document.addEventListener('dblclick',e=>e.preventDefault(),{passive:false});
  document.addEventListener('touchmove',e=>{if(e.touches.length>1)e.preventDefault()},{passive:false});
  setInterval(()=>{if($('#base-view').classList.contains('active'))updateOfflineTime()},10000);
  renderSampleHeroes();
  renderHeader();
  if(!data.tutorialSeen)setTimeout(()=>openTutorial(true),300);
  if('serviceWorker' in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
})();
