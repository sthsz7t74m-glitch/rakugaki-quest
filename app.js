(() => {
  'use strict';

  const SAVE_KEY = 'rakugakiQuestSaveV1';
  const MAX_STAGE = 300;
  const BASE_MAX = 100;
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
    void: { ink:'#29203d', fill:'#6e5a96', trait:'防御を無視する闇', hp:1.55, damage:1.45, pierce:.35 },
    snail: { ink:'#4c3a2a', fill:'#efb366', trait:'殻が硬い・自己修復', hp:1.45, damage:.9, armor:.16, regen:.02 },
    owl: { ink:'#40352e', fill:'#d7b98b', trait:'鋭い目・会心攻撃', hp:1, damage:1.2, crit:.18 },
    worm: { ink:'#4c3550', fill:'#d58fc3', trait:'すばやい連続攻撃', hp:.9, damage:.82, speed:1.65 },
    fish: { ink:'#244b5b', fill:'#79c7d9', trait:'水流で防御を貫く', hp:1.05, damage:1.15, pierce:.18 },
    shark: { ink:'#2f4351', fill:'#7fa5b6', trait:'高火力・HP半分で狂暴化', hp:1.35, damage:1.4, berserk:1.5 },
    bee: { ink:'#4f3c19', fill:'#f1c84b', trait:'高速・ときどき痛恨', hp:.82, damage:1.08, speed:1.55, crit:.12 },
    puppet: { ink:'#4e342e', fill:'#efd7bc', trait:'軽やか・攻撃をかわす', hp:.92, damage:1.05, evade:.15 },
    clock: { ink:'#35434d', fill:'#b8d3dd', trait:'一定間隔で高速化', hp:1.25, damage:1.12, speed:1.25, armor:.08 },
    rabbit: { ink:'#4b4653', fill:'#e8dff1', trait:'とても素早い', hp:.88, damage:1, speed:1.75, evade:.08 },
    witch: { ink:'#3d284d', fill:'#a784c7', trait:'魔法攻撃・装甲貫通', hp:1.08, damage:1.32, pierce:.25 }
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
    { id:10, start:91, end:100, name:'最後の白紙', short:'最後の白紙', theme:'theme-5', enemies:[['余白タイタン','titan'],['虚無の触手','void'],['終末ドラゴン','dragon']], boss:['インク神・ゼロ','void'] },
    { id:11, start:101, end:110, name:'裏返しノート', short:'裏ノート', theme:'theme-1', enemies:[['鏡うつし棒人間','stickman'],['逆さケシカス','slime'],['裏紙ゴブリン','goblin']], boss:['反転ドラゴン','dragon'] },
    { id:12, start:111, end:120, name:'落書き水族館', short:'水族館', theme:'theme-2', enemies:[['クリップクラゲ','ghost'],['ホチキスザメ','wolf'],['定規タツノオトシゴ','dragon']], boss:['大王インクダコ','hydra'] },
    { id:13, start:121, end:130, name:'消しゴム雪原', short:'消し雪原', theme:'theme-3', enemies:[['ねり消しペンギン','bat'],['白紙オオカミ','wolf'],['修正液ゴーレム','golem']], boss:['吹雪のケシゴン','titan'] },
    { id:14, start:131, end:140, name:'ハサミの峡谷', short:'ハサミ谷', theme:'theme-4', enemies:[['切り抜きニンジャ','ninja'],['紙ふぶきムシ','bug'],['断裁オーガ','ogre']], boss:['巨大裁断バサミ','crab'] },
    { id:15, start:141, end:150, name:'絵の具の沼', short:'絵の具沼', theme:'theme-5', enemies:[['水彩スライム','slime'],['パレットガニ','crab'],['筆先キノコ','mushroom']], boss:['混色ヒュドラ','hydra'] },
    { id:16, start:151, end:160, name:'製図機械都市', short:'製図都市', theme:'theme-1', enemies:[['三角定規ロボ','robot'],['コンパスドロイド','droid'],['製図ナイト','knight']], boss:['プロッターX','robot'] },
    { id:17, start:161, end:170, name:'蛍光ペンの夜', short:'蛍光の夜', theme:'theme-2', enemies:[['マーカーゴースト','ghost'],['光るデーモン','demon'],['ネオンUFO','ufo']], boss:['蛍光不死鳥','phoenix'] },
    { id:18, start:171, end:180, name:'破線の迷宮', short:'破線迷宮', theme:'theme-3', enemies:[['点線スパイダー','spider'],['迷路ミミック','mimic'],['破線ニンジャ','ninja']], boss:['方眼ミノタウロス','ogre'] },
    { id:19, start:181, end:190, name:'百色の空', short:'百色の空', theme:'theme-4', enemies:[['虹ペン天使','angel'],['クレヨンタイタン','titan'],['七彩ドラゴン','dragon']], boss:['百色フェニックス','phoenix'] },
    { id:20, start:191, end:200, name:'無限のスケッチ', short:'無限スケッチ', theme:'theme-5', enemies:[['未完の巨人','golem'],['永遠の余白','void'],['始まりの棒人間','stickman']], boss:['創造主・ラクガキ','void'] },
    { id:21, start:201, end:210, name:'のりの湿地', short:'のり湿地', theme:'theme-1', enemies:[['のりツボカタツムリ','snail'],['テープヒル','worm'],['ふせんガエル','slime']], boss:['スティックのり大ナメクジ','snail'] },
    { id:22, start:211, end:220, name:'バインダー図書館', short:'図書館', theme:'theme-2', enemies:[['リングフクロウ','owl'],['しおりウサギ','rabbit'],['ページワーム','worm']], boss:['百科事典ミミック','mimic'] },
    { id:23, start:221, end:230, name:'インク海溝', short:'インク海溝', theme:'theme-3', enemies:[['万年筆フィッシュ','fish'],['修正テープエイ','fish'],['ハサミザメ','shark']], boss:['深海インクザメ','shark'] },
    { id:24, start:231, end:240, name:'画びょう荒野', short:'画びょう荒野', theme:'theme-4', enemies:[['画びょうバチ','bee'],['クリップサソリ','spider'],['針山ゴーレム','golem']], boss:['針千本キング','bee'] },
    { id:25, start:241, end:250, name:'コピー紙劇場', short:'紙劇場', theme:'theme-5', enemies:[['紙人形ダンサー','puppet'],['セロテープミイラ','ghost'],['影絵ナイト','knight']], boss:['黒幕マリオネット','puppet'] },
    { id:26, start:251, end:260, name:'時計仕掛けの教室', short:'時計教室', theme:'theme-1', enemies:[['タイマーくん','clock'],['分度器ギア','robot'],['黒板チョークゴースト','ghost']], boss:['終業ベルクロック','clock'] },
    { id:27, start:261, end:270, name:'消しゴム遊園地', short:'消し遊園地', theme:'theme-2', enemies:[['ケシゴムウサギ','rabbit'],['鉛筆コースター竜','dragon'],['ノート観覧車UFO','ufo']], boss:['ねり消しピエロ','puppet'] },
    { id:28, start:271, end:280, name:'マーカー魔法陣', short:'魔法陣', theme:'theme-3', enemies:[['マーカーウィッチ','witch'],['蛍光コウモリ','bat'],['インクポットスライム','slime']], boss:['五色ペンの大魔女','witch'] },
    { id:29, start:281, end:290, name:'破棄文書工場', short:'破棄工場', theme:'theme-4', enemies:[['シュレッダーワーム','worm'],['パンチ穴ロボ','robot'],['ホチキスキメラ','hydra']], boss:['廃棄王シュレッダー','worm'] },
    { id:30, start:291, end:300, name:'真っ白な新世界', short:'新世界', theme:'theme-5', enemies:[['一番星フクロウ','owl'],['はじまりウサギ','rabbit'],['未知の紙人形','puppet']], boss:['ノートの向こう側','void'] }
  ].map(ch => ({...ch, reward:{ink:50*ch.id+ch.id*ch.id*12, parts:4+ch.id*3, xp:20+ch.id*18}}));

  const WEAPONS = [
    {id:'pencil', name:'えんぴつ剣', icon:'✎', type:'近接', unlock:0, attack:.1, effect:'安定した近接攻撃'},
    {id:'ruler', name:'定規ボウ', icon:'📏', type:'遠距離', unlock:10, attack:.2, crit:.05, effect:'会心率が上がる遠距離武器'},
    {id:'crayon', name:'魔法クレヨン', icon:'🖍️', type:'魔法', unlock:30, attack:.28, pierce:.12, effect:'敵の装甲を一部無視'},
    {id:'eraser', name:'巨大消しゴム', icon:'▰', type:'近接', unlock:50, attack:.38, hp:.12, effect:'HPも増える重量武器'},
    {id:'compass', name:'星のコンパス', icon:'🧭', type:'遠距離', unlock:70, attack:.5, crit:.1, effect:'高い会心率を持つ伝説武器'},
    {id:'rainbow', name:'虹色万年筆', icon:'✒', type:'魔法', unlock:100, attack:.7, pierce:.25, effect:'装甲を大きく無視する'},
    {id:'stapler', name:'連射ホチキス', icon:'⊏', type:'遠距離', unlock:110, attack:.78, crit:.08, effect:'鋭い針を連射する'},
    {id:'brush', name:'大筆ブレード', icon:'〆', type:'近接', unlock:130, attack:.9, hp:.16, effect:'攻撃とHPを同時に強化'},
    {id:'scissors', name:'次元ハサミ', icon:'✂', type:'近接', unlock:150, attack:1.02, crit:.12, effect:'高い会心率を持つ'},
    {id:'marker', name:'蛍光レールガン', icon:'▰', type:'遠距離', unlock:170, attack:1.16, pierce:.2, effect:'装甲を貫く蛍光弾'},
    {id:'palette', name:'百色パレット', icon:'◉', type:'魔法', unlock:190, attack:1.32, crit:.1, pierce:.18, effect:'会心と貫通を両立'},
    {id:'creator', name:'創造のペン', icon:'★', type:'魔法', unlock:200, attack:1.55, crit:.15, pierce:.3, effect:'200面の先へ進む究極装備'}
  ];

  const ARMORS = [
    {id:'paperVest',name:'厚紙ベスト',icon:'▤',rarity:'R',hp:.12,guard:.02,effect:'最大HP +12%'},
    {id:'eraserMail',name:'ねり消しメイル',icon:'▣',rarity:'R',hp:.18,guard:.04,effect:'HP +18%・軽減 +4%'},
    {id:'rulerArmor',name:'定規アーマー',icon:'目',rarity:'SR',hp:.24,guard:.07,effect:'HP +24%・軽減 +7%'},
    {id:'notebookPlate',name:'ノート装甲',icon:'冊',rarity:'SR',hp:.34,guard:.05,effect:'最大HP +34%'},
    {id:'rainbowCoat',name:'七色コート',icon:'彩',rarity:'SSR',hp:.42,guard:.1,effect:'HP +42%・軽減 +10%'},
    {id:'infinitePage',name:'無限ページの鎧',icon:'∞',rarity:'SSR',hp:.55,guard:.12,effect:'HP +55%・軽減 +12%'}
  ];

  const ACCESSORIES = [
    {id:'clipCharm',name:'クリップのお守り',icon:'∪',rarity:'R',attack:.06,effect:'攻撃力 +6%'},
    {id:'sharpener',name:'金の鉛筆削り',icon:'◇',rarity:'R',crit:.04,effect:'会心率 +4%'},
    {id:'tapeRing',name:'修正テープの輪',icon:'○',rarity:'SR',attack:.1,hp:.1,effect:'攻撃・HP +10%'},
    {id:'compassEye',name:'コンパスの眼',icon:'⌖',rarity:'SR',crit:.08,pierce:.08,effect:'会心・貫通 +8%'},
    {id:'inkHeart',name:'インクの心臓',icon:'♥',rarity:'SSR',attack:.18,hp:.2,effect:'攻撃 +18%・HP +20%'},
    {id:'creatorSeal',name:'創造主のしおり',icon:'★',rarity:'SSR',attack:.25,crit:.1,pierce:.12,effect:'攻撃・会心・貫通を強化'}
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
    {id:'ink',name:'インク工房',icon:'●',color:'#d9d3cc',desc:'UAT：放置中も1秒ごとにインクを自動収集'},
    {id:'parts',name:'文房具工房',icon:'✂',color:'#ffdbaa',desc:'UAT：放置中も1秒ごとに強化素材を自動収集'},
    {id:'xp',name:'経験値スケッチ広場',icon:'☆',color:'#cde1ff',desc:'UAT：配置すると1秒ごとにEXPを自動収集'},
    {id:'treasure',name:'宝探し机',icon:'?',color:'#d8f3dc',desc:'UAT：インクと素材を1000倍でランダム発見'}
  ];

  const TUTORIAL = [
    {icon:'📓',kicker:'はじめに',title:'消えかけた世界を描き直そう',copy:'描いた主人公と一緒に全300ステージへ挑戦します。\nクリア後は通常敵だけの無限ノートにも挑めます。'},
    {icon:'✎',kicker:'STEP 1',title:'主人公を自由に描く',copy:'形や大きさで性能は変わりません。\n好きな主人公を指やマウスで描いてください。'},
    {icon:'⚔',kicker:'STEP 2',title:'戦闘は自動、準備が勝負',copy:'敵ごとに耐久・攻撃・速度・特性が違います。\n戦力と推奨戦力を見て、武器や永久能力を育てましょう。'},
    {icon:'💡',kicker:'STEP 3',title:'冒険中のひらめき',copy:'戦闘後は3枚から一時強化を1つ選択。\n完全自動モードなら相性のよい報酬を自動で選びます。'},
    {icon:'⌂',kicker:'STEP 4',title:'放置中も素材を集める',copy:'拠点の施設はゲームを閉じても最大12時間働きます。\n拠点Lv.5・10・25で、同時に動かせる施設が増えます。'},
    {icon:'★',kicker:'STEP 5',title:'装備とガチャで強くなる',copy:'武器・防具・アクセサリーはすべて上限なし。\nゲーム内報酬だけでガチャを回せます。'},
    {icon:'🗺️',kicker:'STEP 6',title:'好きなステージへ再挑戦',copy:'クリア済みステージは何度でも遊べます。\nエンドレスノートでは通常敵と永遠に連戦できます。'}
  ];

  const defaultSave = () => ({
    ink:0, parts:0, xp:0, heroLevel:1, heroName:'ななしのラクガキ', heroImage:'', bestStage:0,
    selectedStage:1, baseLevel:1, assigned:['ink'], lastClaim:Date.now(), autoCarry:{ink:0,parts:0,xp:0}, discovered:[], enemyBook:{}, bossSeen:{},
    growth:{power:0,vitality:0,focus:0}, weapons:{pencil:1}, equippedWeapon:'pencil', armors:{paperVest:1}, equippedArmor:'paperVest', accessories:{clipCharm:1}, equippedAccessory:'clipCharm',
    tickets:10, blueprints:0, pity:0, gachaHistory:[], autoMode:false, endlessBest:0, chapterClears:{}, tutorialSeen:false
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
  let activeCollectionTab = 'enemy';
  const gearViewState = {
    weapons:{filter:'all',category:'all',sort:'default'},
    armors:{filter:'all',category:'all',sort:'default'},
    accessories:{filter:'all',category:'all',sort:'default'}
  };
  const collectionViewState = {
    enemy:{filter:'all',category:'all',sort:'default'},
    card:{filter:'all',category:'all',sort:'default'}
  };
  let gachaBusy = false;
  let gachaSkipRequested = false;
  let gachaWaitResolve = null;

  function load(){
    try{
      const raw = JSON.parse(localStorage.getItem(SAVE_KEY)||'{}');
      const merged = {...defaultSave(),...raw};
      merged.growth = {...defaultSave().growth,...(raw.growth||{})};
      merged.weapons = {...defaultSave().weapons,...(raw.weapons||{})};
      merged.armors = {...defaultSave().armors,...(raw.armors||{})};
      merged.accessories = {...defaultSave().accessories,...(raw.accessories||{})};
      merged.chapterClears = {...(raw.chapterClears||{})};
      merged.bossSeen = typeof raw.bossSeen === 'object' && raw.bossSeen ? raw.bossSeen : {};
      merged.enemyBook = typeof raw.enemyBook === 'object' && raw.enemyBook ? raw.enemyBook : {};
      merged.autoCarry = {...defaultSave().autoCarry,...(raw.autoCarry||{})};
      merged.assigned = Array.isArray(merged.assigned) && merged.assigned.length ? merged.assigned : ['ink'];
      merged.discovered = Array.isArray(merged.discovered) ? merged.discovered : [];
      merged.selectedStage = Math.max(1,Math.min(MAX_STAGE,Number(merged.selectedStage)||1));
      if(!WEAPONS.some(w=>w.id===merged.equippedWeapon))merged.equippedWeapon='pencil';
      if(!ARMORS.some(w=>w.id===merged.equippedArmor))merged.equippedArmor='paperVest';
      if(!ACCESSORIES.some(w=>w.id===merged.equippedAccessory))merged.equippedAccessory='clipCharm';
      unlockEarnedWeapons(merged);
      return merged;
    }catch{return defaultSave()}
  }
  function save(){localStorage.setItem(SAVE_KEY,JSON.stringify(data));renderHeader()}
  function unlockEarnedWeapons(target=data){WEAPONS.forEach(w=>{if((target.bestStage||0)>=w.unlock&&!target.weapons[w.id])target.weapons[w.id]=1})}
  function xpNeeded(){return data.heroLevel*25}
  function chapterFor(stage){return CHAPTERS.find(ch=>stage>=ch.start&&stage<=ch.end)||CHAPTERS.at(-1)}
  function enemyCatalog(){return CHAPTERS.flatMap(ch=>[...ch.enemies.map(([name,type])=>({name,type,chapter:ch.id,boss:false})),{name:ch.boss[0],type:ch.boss[1],chapter:ch.id,boss:true}])}
  function enemyBookCount(){return enemyCatalog().filter(enemy=>data.enemyBook[enemy.name]).length}
  function enemyBookPercent(){return Math.round(enemyBookCount()/enemyCatalog().length*100)}
  function currentChapter(){return chapterFor(Math.min(MAX_STAGE,Math.max(1,data.bestStage+1)))}
  function equippedWeapon(){return WEAPONS.find(w=>w.id===data.equippedWeapon)||WEAPONS[0]}
  function equippedArmor(){return ARMORS.find(w=>w.id===data.equippedArmor)||ARMORS[0]}
  function equippedAccessory(){return ACCESSORIES.find(w=>w.id===data.equippedAccessory)||ACCESSORIES[0]}
  function weaponLevel(w=equippedWeapon()){return data.weapons[w.id]||1}
  function gearLevel(kind,item){return data[kind][item.id]||1}
  function startingStats(){
    const w=equippedWeapon(),armor=equippedArmor(),accessory=equippedAccessory(),level=weaponLevel(w),armorLevel=gearLevel('armors',armor),accessoryLevel=gearLevel('accessories',accessory);
    const weaponScale=w.attack+(level-1)*.055,armorScale=(armor.hp||0)+(armorLevel-1)*.035,accessoryAttack=(accessory.attack||0)+(accessoryLevel-1)*.025;
    const blueprintScale=1+(data.blueprints||0)*.001,baseHp=(120+(data.heroLevel-1)*15+data.growth.vitality*24)*blueprintScale;
    return {
      maxHp:Math.round(baseHp*(1+(w.hp||0)+armorScale+(accessory.hp||0)+(accessoryLevel-1)*.018)),
      attack:Math.round((14+(data.heroLevel-1)*2+data.growth.power*4)*(1+weaponScale+accessoryAttack)*blueprintScale*10)/10,
      crit:Math.min(.75,.08+data.growth.focus*.012+(w.crit||0)+(accessory.crit||0)),
      critDamage:2.1+data.growth.focus*.025,
      pierce:Math.min(.9,(w.pierce||0)+(level-1)*.006+(accessory.pierce||0)),
      permanentGuard:Math.min(.55,(armor.guard||0)+(armorLevel-1)*.006),
      weapon:w,armor,accessory
    };
  }
  function playerPower(stats=startingStats()){
    return Math.round(stats.maxHp*.42+stats.attack*8.5+stats.crit*180+(stats.critDamage||2)*35+stats.pierce*140+(stats.permanentGuard||0)*240);
  }
  function recommendedPower(stage){const chapterIndex=Math.floor((stage-1)/10),chapterStep=(stage-1)%10,chapterScale=Math.pow(1.26,chapterIndex),stageSlope=1+chapterStep*.03;return Math.round(105*chapterScale*stageSlope*(stage%10===0?1.28:1))}

  function renderHeader(){
    const chapter=currentChapter(),need=xpNeeded(),stats=startingStats(),weapon=equippedWeapon();
    $('#ink-count').textContent=Math.floor(data.ink);$('#parts-count').textContent=Math.floor(data.parts);$('#ticket-count').textContent=Math.floor(data.tickets||0);
    $('#hero-level').textContent=data.heroLevel;$('#hero-name').textContent=data.heroName;$('#battle-hero-name').textContent=data.heroName;
    $('#best-stage').textContent=data.bestStage;$('#chapter-progress').style.width=`${Math.min(100,data.bestStage/MAX_STAGE*100)}%`;
    $('#home-chapter-number').textContent=`CHAPTER ${chapter.id}${data.bestStage>=MAX_STAGE?' / ALL CLEAR':''}`;$('#home-chapter-name').textContent=chapter.name;
    $('#hero-xp-copy').textContent=`EXP ${Math.floor(data.xp)} / ${need}`;$('#hero-xp-bar').style.width=`${Math.min(100,data.xp/need*100)}%`;
    $('#card-count-copy').textContent=`敵 ${enemyBookPercent()}%・強化 ${Math.round(data.discovered.length/CARDS.length*100)}%`;
    $('#growth-summary').textContent=`戦力 ${playerPower(stats)}・HP ${stats.maxHp}・攻撃 ${Math.round(stats.attack)}・上限なし`;
    $('#weapon-summary').textContent=`${weapon.name} Lv.${weaponLevel(weapon)}＋防具・アクセ`;
    $('#gacha-summary').textContent=`SSR天井まで ${Math.max(1,50-(data.pity||0))}回`;
    $('#endless-best').textContent=data.endlessBest||0;
    $('#auto-mode').checked=!!data.autoMode;
    const map=$('#chapter-map');map.innerHTML='';
    CHAPTERS.forEach(ch=>{const node=document.createElement('span'),cleared=data.bestStage>=ch.end,current=chapter.id===ch.id;node.className=`chapter-node ${cleared?'cleared':''} ${current?'current':''}`;node.innerHTML=`<b>${cleared?'✓ ':''}${ch.id}. ${ch.short}</b>${ch.start}–${ch.end}`;map.appendChild(node)});
    renderHeroPreview();
  }
  function showView(id){$$('.view').forEach(view=>view.classList.toggle('active',view.id===id));window.scrollTo(0,0)}
  function bindHoldButtons(buttons,action){
    buttons.filter(Boolean).forEach(button=>{button._holdAction=()=>{if(!button.disabled)action(button)};if(button.dataset.holdBound)return;button.dataset.holdBound='1';let delay=0,repeater=0,fired=false;const clear=()=>{clearTimeout(delay);clearInterval(repeater)};
      button.addEventListener('contextmenu',e=>e.preventDefault());button.addEventListener('selectstart',e=>e.preventDefault());
      button.addEventListener('pointerdown',e=>{if(button.disabled)return;e.preventDefault();fired=false;button.setPointerCapture?.(e.pointerId);delay=setTimeout(()=>{fired=true;button._holdAction();repeater=setInterval(()=>button._holdAction(),110)},360)});
      button.addEventListener('pointerup',e=>{clear();if(!button.disabled&&!fired)button._holdAction();if(button.hasPointerCapture?.(e.pointerId))button.releasePointerCapture(e.pointerId)});button.addEventListener('pointercancel',clear);button.addEventListener('lostpointercapture',clear);button.addEventListener('click',e=>{e.preventDefault();if(e.detail===0)button._holdAction()});
    })
  }
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
    if(id==='rabbit'){ellipse(160,145,64,61,'#e8dff1');ellipse(160,87,51,47,'#e8dff1');shape([[124,55],[119,10],[147,52]],'#e8dff1');shape([[171,49],[201,11],[195,66]],'#e8dff1');eyes(160,84,30);line([[146,107],[160,116],[177,105]]);line([[112,167],[71,191]]);line([[208,168],[250,191]]);line([[135,202],[122,228]]);line([[188,202],[201,228]])}
    if(id==='owl'){ellipse(160,132,75,76,'#d7b98b');shape([[91,120],[48,84],[74,166],[107,178]],'#e8cfa5');shape([[229,120],[272,84],[246,166],[213,178]],'#e8cfa5');ellipse(133,107,26,30,'#fff');ellipse(187,107,26,30,'#fff');eyes(160,108,54);shape([[148,132],[160,146],[173,132]],'#f1c84b');shape([[111,70],[129,37],[144,77]],'#d7b98b');shape([[176,77],[194,37],[211,71]],'#d7b98b')}
    if(id==='clock'){ellipse(160,125,70,70,'#b8d3dd');ellipse(160,125,52,52,'#fffdf5');eyes(160,102,36);line([[160,124],[160,86]]);line([[160,124],[191,141]]);shape([[95,69],[112,31],[135,65]],'#b8d3dd');shape([[185,65],[208,31],[225,69]],'#b8d3dd');line([[123,190],[111,225]]);line([[197,190],[209,225]])}
    if(id==='witch'){ellipse(160,83,38,35,'#efd7bc');shape([[120,76],[160,17],[202,76]],'#745092');shape([[103,76],[217,76],[198,93],[119,92]],'#745092');eyes(160,83,28);shape([[121,113],[199,113],[216,202],[101,202]],'#a784c7');line([[117,137],[70,178]]);line([[202,137],[245,168]]);ctx.strokeStyle='#9b633e';ctx.lineWidth=12;line([[69,178],[251,219]])}
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
  const SAMPLE_NAMES={pencil:'えんぴつ勇者',cat:'まるネコ',robot:'ハコロボ',ghost:'ぷかオバケ',dragon:'ちびドラゴン',slime:'目玉スライム',rabbit:'ケシゴムうさぎ',owl:'リングふくろう',clock:'タイマーくん',witch:'マーカー魔女'};
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
      case 'snail': shape([[38,157],[49,125],[82,117],[108,132],[143,139],[176,129],[192,146],[178,166],[65,170]],true);ellipse(112,107,49,47,'#e8a95c');ctx.beginPath();ctx.arc(112,107,30,0,Math.PI*1.72);ctx.stroke();line([[172,133],[176,83]],4);line([[188,136],[199,91]],4);eyes(187,83,22);break;
      case 'owl': ellipse(110,111,53,59);shape([[67,103],[24,73],[46,145],[79,154]],true,'#e8cfa5');shape([[153,103],[196,73],[174,145],[141,154]],true,'#e8cfa5');ellipse(90,92,20,23,'#fff');ellipse(130,92,20,23,'#fff');eyes(110,93,40);shape([[100,114],[110,126],[121,114]],true,'#f1c84b');shape([[73,69],[89,39],[100,74]]);shape([[120,74],[134,39],[151,68]]);feet(91,129,178);break;
      case 'worm': for(let i=0;i<6;i++)ellipse(53+i*25,126-(i%2)*12,22,24,i%2?'#eab2d7':fill);eyes(43,116,13);for(let i=0;i<5;i++)line([[68+i*23,142],[63+i*23,166]],3);line([[35,101],[24,78]],3);line([[47,101],[58,76]],3);break;
      case 'fish':case 'shark': ellipse(108,112,62,43);shape([[48,111],[20,75],[21,148]],true);eyes(133,103,19,true);line([[150,126],[171,119]],3);shape([[96,75],[111,42],[128,80]],true);if(enemy.type==='shark'){shape([[112,78],[130,34],[145,87]],true);for(let i=0;i<5;i++)shape([[125+i*10,128],[130+i*10,141],[136+i*10,127]],true,'#fff')}break;
      case 'bee': ellipse(110,115,50,36);for(let x=83;x<140;x+=18)line([[x,83],[x+7,146]],5);shape([[80,92],[53,55],[101,78]],true,'#e9f0ff');shape([[140,92],[167,55],[119,78]],true,'#e9f0ff');eyes(139,105,15,true);shape([[60,113],[35,104],[59,125]],true,'#4f3c19');line([[146,136],[165,158]],3);line([[116,147],[121,171]],3);break;
      case 'puppet': ellipse(110,54,25,24,'#efd7bc');eyes(110,51,16);shape([[88,80],[132,80],[147,145],[73,145]],true);line([[84,92],[48,122],[65,145]],4);line([[136,92],[171,121],[155,145]],4);line([[91,145],[77,181]],4);line([[128,145],[143,181]],4);ellipse(83,86,4,4,'#ef476f');ellipse(137,86,4,4,'#1677ff');line([[110,29],[110,11]],2);line([[48,122],[39,48]],2);line([[171,121],[182,47]],2);break;
      case 'clock': ellipse(110,105,56,56);ellipse(110,105,42,42,'#fffdf5');eyes(110,91,28);line([[110,105],[110,74]],4);line([[110,105],[137,119]],4);shape([[57,57],[74,24],[92,60]],true);shape([[128,60],[147,24],[164,58]],true);feet(88,132,176);break;
      case 'rabbit': ellipse(110,123,45,48);ellipse(110,77,36,34);shape([[83,57],[77,18],[102,52]],true);shape([[117,51],[144,18],[139,64]],true);eyes(110,74,23);line([[99,94],[110,102],[123,92]],3);line([[77,137],[45,159]],4);line([[143,137],[175,159]],4);feet(91,129,181);break;
      case 'witch': humanoid('witch');shape([[73,58],[109,12],[146,58]],true,'#745092');shape([[61,58],[158,58],[144,75],[75,74]],true,'#745092');line([[151,93],[193,169]],8);shape([[181,164],[194,192],[207,161]],true,'#29211d');break;
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
    if(enemy.name.includes('のり')){ctx.fillStyle='#f3eee4';ctx.fillRect(82,119,57,45);ctx.strokeRect(82,119,57,45);ctx.fillStyle='#ef476f';ctx.fillRect(82,143,57,21);ctx.strokeRect(82,143,57,21)}
    if(enemy.name.includes('テープ')){ctx.beginPath();ctx.ellipse(110,116,67,31,0,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.ellipse(110,116,49,17,0,0,Math.PI*2);ctx.stroke()}
    if(enemy.name.includes('リング')){for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(77+i*22,46,8,0,Math.PI*2);ctx.stroke()}}
    if(enemy.name.includes('しおり')){shape([[164,62],[184,62],[184,142],[174,132],[164,142]],true,'#ef476f')}
    if(enemy.name.includes('ページ')){for(let y=61;y<160;y+=15)line([[59,y],[160,y]],2)}
    if(enemy.name.includes('万年筆')){pencil(174,120,.5,'#263b62');shape([[166,71],[177,48],[187,76]],true,'#d8d8d8')}
    if(enemy.name.includes('ハサミ')){ctx.beginPath();ctx.arc(167,137,13,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(192,137,13,0,Math.PI*2);ctx.stroke();line([[178,129],[149,69]],5);line([[182,128],[208,68]],5)}
    if(enemy.name.includes('画びょう')){shape([[91,51],[132,51],[139,71],[118,77],[118,109],[104,109],[104,77],[84,70]],true,'#ef476f')}
    if(enemy.name.includes('針')){for(let x=52;x<174;x+=20)line([[x,151],[x+8,177]],3)}
    if(enemy.name.includes('紙人形')||enemy.name.includes('マリオネット')){line([[67,41],[67,121]],2);line([[153,41],[153,121]],2);line([[110,18],[110,54]],2)}
    if(enemy.name.includes('影絵')){ctx.globalAlpha=.18;ctx.fillStyle='#151515';ctx.fillRect(43,35,134,145);ctx.globalAlpha=1}
    if(enemy.name.includes('タイマー')){ctx.font='900 20px monospace';ctx.fillStyle=ink;ctx.fillText('00:10',79,119)}
    if(enemy.name.includes('分度器')){ctx.beginPath();ctx.arc(110,128,70,Math.PI,Math.PI*2);ctx.stroke();line([[40,128],[180,128]],3)}
    if(enemy.name.includes('チョーク')){for(let i=0;i<3;i++){ctx.fillStyle=['#fff','#ef91a9','#8fc7ef'][i];ctx.fillRect(53+i*25,157,20,8);ctx.strokeRect(53+i*25,157,20,8)}}
    if(enemy.name.includes('ベル')){shape([[79,131],[89,74],[110,58],[133,74],[144,131]],true,'#f1c84b');ellipse(111,137,39,8,'#e6a832')}
    if(enemy.name.includes('コースター')){ctx.setLineDash([7,5]);line([[28,173],[58,120],[90,160],[122,91],[169,151],[199,105]],4);ctx.setLineDash([])}
    if(enemy.name.includes('観覧車')){ctx.beginPath();ctx.arc(110,111,68,0,Math.PI*2);ctx.stroke();for(let i=0;i<8;i++){const a=i*Math.PI/4;line([[110,111],[110+Math.cos(a)*68,111+Math.sin(a)*68]],2)}}
    if(enemy.name.includes('マーカー')){pencil(177,119,.35,'#9aef5f');ctx.globalAlpha=.22;ctx.fillStyle='#9aef5f';ctx.fillRect(48,94,116,35);ctx.globalAlpha=1}
    if(enemy.name.includes('インクポット')){shape([[72,113],[147,113],[157,176],[62,176]],true,'#4c355f');shape([[81,92],[138,92],[147,113],[72,113]],true,'#d8d8d8')}
    if(enemy.name.includes('シュレッダー')){shape([[52,91],[168,91],[176,151],[44,151]],true,'#9da7ad');for(let x=58;x<166;x+=13)line([[x,151],[x+(x%2?6:-6),184]],3)}
    if(enemy.name.includes('パンチ穴')){for(let i=0;i<4;i++)ellipse(75+i*24,123,7,7,'#fff')}
    if(enemy.name.includes('一番星')){shape([[110,24],[118,45],[141,46],[123,60],[130,82],[110,68],[91,82],[97,60],[79,46],[102,45]],true,'#ffd447')}
    if(enemy.name.includes('はじまり')){ctx.font='900 31px sans-serif';ctx.fillStyle=ink;ctx.fillText('1',101,125)}
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
    const chapterIndex=Math.floor((stage-1)/10),chapterStep=(stage-1)%10,hpGrowth=Math.pow(1.3,chapterIndex),damageGrowth=Math.pow(1.14,chapterIndex),chapterHpRamp=1+chapterStep*.035,chapterDamageRamp=1+chapterStep*.025;
    const hp=Math.round(82*hpGrowth*chapterHpRamp*type.hp*(boss?1.9:1)*(variant.hp||1));
    const damage=Math.round(4.6*damageGrowth*chapterDamageRamp*type.damage*(boss?1.25:1)*(variant.damage||1));
    return {...type,name:entry[0],type:entry[1],boss,hp,damage,variant,speed:(type.speed||1)*(variant.speed||1),reward:(type.reward||1)*(variant.reward||1),chapter:chapter.id};
  }
  function endlessEnemy(wave){
    const catalog=enemyCatalog().filter(x=>!x.boss),entry=catalog[Math.floor(Math.random()*catalog.length)],type=ENEMY_TYPES[entry.type],variant=chooseEnemyVariant(Math.min(MAX_STAGE,Math.max(1,data.bestStage)),false),scaleStage=Math.min(MAX_STAGE,Math.max(1,data.bestStage-8+wave));
    const base=enemyFor(scaleStage,false),scale=Math.pow(1.045,Math.max(0,wave-1));
    return {...type,...entry,boss:false,hp:Math.round(base.hp*scale*(variant.hp||1)),damage:Math.round(base.damage*Math.pow(1.025,wave-1)*(variant.damage||1)),variant,speed:(type.speed||1)*(variant.speed||1),reward:(type.reward||1)*(variant.reward||1),chapter:entry.chapter};
  }
  function beginRun(stage,endless=false){
    if(!data.heroImage){openDrawing();toast('まずは主人公を描こう！');return}
    const unlocked=Math.min(MAX_STAGE,data.bestStage+1),chosen=Math.max(1,Math.min(unlocked,Number(stage)||data.selectedStage||unlocked)),stats=startingStats();
    if(!endless)data.selectedStage=chosen;save();
    run={stage:chosen,startStage:chosen,endless,wave:1,hp:stats.maxHp,maxHp:stats.maxHp,attack:stats.attack,interval:1450,guard:stats.permanentGuard||0,crit:stats.crit,critDamage:stats.critDamage||2.1,leech:0,double:0,bossBonus:0,pierce:stats.pierce,ideas:0,cards:[],enemyHp:0,enemyMaxHp:0,active:false,speed:1,weapon:stats.weapon};
    showView('battle-view');prepareBattle();
  }
  function prepareBattle(){
    clearTimeout(battleTimer);const chapter=chapterFor(run.stage),enemy=run.endless?endlessEnemy(run.wave):enemyFor(run.stage,true);
    run.enemy=enemy;run.enemyHp=run.enemyMaxHp=enemy.hp;run.active=false;
    $('#stage-number').textContent=run.endless?`∞-${run.wave}`:run.stage;$('#battle-chapter').textContent=run.endless?`ENDLESS NOTE・通常敵連戦・最高 ${data.endlessBest||0}`:`CHAPTER ${chapter.id}・${chapter.name}・推奨戦力 ${recommendedPower(run.stage)}`;
    $('#enemy-name').textContent=enemy.name;$('#enemy-trait').textContent=`${enemy.variant.name}・${enemy.trait}`;
    const scene=$('#battle-scene');scene.className=`battle-scene ${chapter.theme} weapon-${run.weapon.type==='近接'?'melee':run.weapon.type==='遠距離'?'range':'magic'}`;
    const art=$('#enemy-art');art.className=`enemy-art enemy-${enemy.type}`;
    drawEnemyArt($('#enemy-canvas'),enemy);
    const record=data.enemyBook[enemy.name]||{count:0,variants:[]};record.count++;if(!record.variants.includes(enemy.variant.id))record.variants.push(enemy.variant.id);record.lastStage=run.stage;data.enemyBook[enemy.name]=record;save();
    $('#enemy-fighter').classList.toggle('boss',enemy.boss);$('#battle-action').disabled=true;$('#battle-action').textContent='戦闘中…';$('#battle-hero').src=heroSrc();$('#speed-button').textContent=`×${run.speed}`;$('#auto-badge').classList.toggle('hidden',!data.autoMode);updateBattleUI();
    if(enemy.boss&&!data.bossSeen[chapter.id]){showDialog(bossIntro(chapter),()=>{data.bossSeen[chapter.id]=true;save();startBattle()})}else startBattle();
  }
  function bossIntro(chapter){return [[chapter.boss[0],`ステージ${chapter.end}まで来たか。ここから先は通さない！`],[data.heroName,'なら、このページごと描き直す！'],[chapter.boss[0],chapter.id===30?'最後の白紙で消えてしまえ！':'その武器ごと消してやる！']]}
  function startBattle(){
    run.active=true;
    const loop=()=>{if(!run?.active)return;playerAttack();if(run?.active)battleTimer=setTimeout(enemyAttack,Math.max(560,980/(run.enemy.speed||1))/run.speed)};
    battleTimer=setTimeout(loop,900/run.speed);run.loop=loop;
  }
  function playerAttack(){
    if(!run?.active)return;
    const enemy=run.enemy;
    if(Math.random()<(enemy.evade||0)){animateHit('player','MISS');battleTimer=setTimeout(run.loop,run.interval/run.speed);return}
    let armor=Math.max(0,(enemy.armor||0)-run.pierce),damage=run.attack*(enemy.boss?1+run.bossBonus:1)*(1-armor);const critical=Math.random()<run.crit;if(critical)damage*=run.critDamage;damage=Math.max(1,Math.round(damage));
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
    $('#power-stat').textContent=playerPower({maxHp:run.maxHp,attack:run.attack,crit:run.crit,critDamage:run.critDamage,pierce:run.pierce,permanentGuard:run.guard});$('#attack-stat').textContent=Math.round(run.attack);$('#speed-stat').textContent=(1450/run.interval).toFixed(1);$('#idea-count').textContent=run.ideas;
  }
  function winBattle(){
    run.active=false;clearTimeout(battleTimer);const chapter=chapterFor(run.stage),enemy=run.enemy,firstClear=run.stage>data.bestStage,rewardMult=enemy.reward||1;
    if(run.endless){const earnedInk=Math.round((8+Math.ceil(run.wave/2))*rewardMult),earnedXp=Math.round((10+Math.ceil(run.wave/2))*rewardMult);data.endlessBest=Math.max(data.endlessBest||0,run.wave);data.ink+=earnedInk;data.xp+=earnedXp;if(run.wave%10===0)data.tickets=(data.tickets||0)+1;levelCheck();save();splash(`EXP +${earnedXp}`);setTimeout(()=>{run.wave++;run.hp=Math.min(run.maxHp,run.hp+Math.round(run.maxHp*.12));if((run.wave-1)%5===0)showCardChoices();else prepareBattle()},900);return}
    data.bestStage=Math.max(data.bestStage,run.stage);data.ink+=(4+Math.ceil(run.stage/4))*rewardMult;data.parts+=run.stage%5===0?1:0;data.xp+=(6+chapter.id*2)*rewardMult;if(run.stage%10===0)data.tickets=(data.tickets||0)+1;data.selectedStage=Math.min(MAX_STAGE,Math.max(data.selectedStage,run.stage+1));unlockEarnedWeapons();levelCheck();save();splash('CLEAR!');
    if(enemy.boss){setTimeout(()=>showDialog([[chapter.boss[0],bossOutro(chapter.id)],[data.heroName,'このページにも、色が戻ってきた！']],()=>finishChapter(chapter,firstClear)),1000);return}
    setTimeout(showCardChoices,1000);
  }
  function bossOutro(id){return id===30?'描き終わりはない。次の線は、無限に続く……。':id%3===1?'ま、まぶしい……！色って、ちょっと良いかも……':id%3===2?'その線、はみ出してるのに……強い。':'こんなににぎやかなページになるとは……。'}
  function showCardChoices(){
    const choices=[...CARDS].sort(()=>Math.random()-.5).slice(0,3),box=$('#card-options');box.innerHTML='';
    const choose=card=>{card.effect(run);run.ideas++;run.cards.push(card.id);if(!data.discovered.includes(card.id))data.discovered.push(card.id);save();closeModal('#card-modal');if(!run.endless)run.stage++;run.hp=Math.min(run.maxHp,run.hp+Math.round(run.maxHp*.15));prepareBattle()};
    choices.forEach(card=>{const button=document.createElement('button');button.className=`choice-card ${card.rarity==='レア'?'rare':card.rarity==='伝説'?'legend':''}`;button.innerHTML=`<span class="card-emoji">${card.icon}</span><span><b>${card.name}</b><small>${card.desc}</small></span><i>›</i>`;button.onclick=()=>choose(card);box.appendChild(button)});
    if(data.autoMode){const score={通常:1,レア:2,伝説:3},best=[...choices].sort((a,b)=>score[b.rarity]-score[a.rarity])[0];toast(`AUTO：${best.name}を選択`);setTimeout(()=>choose(best),520)}else openModal('#card-modal');
  }
  function loseRun(){
    run.active=false;clearTimeout(battleTimer);const bonus=2+chapterFor(run.stage).id*2;data.ink+=bonus;save();$('#battle-action').disabled=false;$('#battle-action').textContent=`拠点へ戻る（インク +${bonus}）`;$('#battle-action').onclick=()=>{run=null;showView('home-view');renderHeader()};splash('敗北…');
  }
  function finishChapter(chapter,firstClear){
    const multiplier=firstClear?1:.3,reward={ink:Math.round(chapter.reward.ink*multiplier),parts:Math.max(1,Math.round(chapter.reward.parts*multiplier)),xp:Math.round(chapter.reward.xp*multiplier)};
    data.ink+=reward.ink;data.parts+=reward.parts;data.xp+=reward.xp;data.tickets=(data.tickets||0)+(firstClear?2:0);data.chapterClears[chapter.id]=(data.chapterClears[chapter.id]||0)+1;data.selectedStage=chapter.id<CHAPTERS.length?chapter.end+1:MAX_STAGE;unlockEarnedWeapons();levelCheck();save();run.active=false;
    const unlockedWeapon=WEAPONS.find(w=>w.unlock===chapter.end);
    $('#chapter-clear-kicker').textContent=chapter.id===CHAPTERS.length?'ALL 300 STAGES CLEAR!':'CHAPTER CLEAR!';$('#chapter-clear-icon').textContent=chapter.id===CHAPTERS.length?'★':'✓';
    $('#chapter-clear-title').textContent=chapter.id===CHAPTERS.length?'300ステージ完全制覇！':`CHAPTER ${chapter.id} 突破！`;
    $('#chapter-clear-copy').textContent=`「${chapter.name}」をクリア。${unlockedWeapon?`新武器「${unlockedWeapon.name}」を入手しました！`:'クリア済みステージは何度でも再挑戦できます。'}`;
    $('#chapter-rewards').innerHTML=`<span>● +${reward.ink}</span><span>✂ +${reward.parts}</span><span>☆ +${reward.xp}</span>${unlockedWeapon?`<span>${unlockedWeapon.icon} NEW</span>`:''}`;
    closeModal('#dialog-modal');openModal('#chapter-modal');
  }
  function showDialog(lines,done){let index=0;const next=()=>{if(index>=lines.length){closeModal('#dialog-modal');done();return}const [speaker,text]=lines[index++];$('#dialog-speaker').textContent=speaker;$('#dialog-text').textContent=text;$('#dialog-portrait').textContent=speaker===data.heroName?'✎':'!';tone(230+index*30,.04,'triangle')};$('#dialog-next').onclick=next;openModal('#dialog-modal');next()}
  function levelCheck(silent=false){let leveled=false;while(data.xp>=xpNeeded()){data.xp-=xpNeeded();data.heroLevel++;leveled=true}if(leveled&&!silent)toast(`主人公が Lv.${data.heroLevel} になった！`)}

  function renderGrowth(){
    const stats=startingStats();$('#growth-hero-level').textContent=data.heroLevel;$('#growth-total-hp').textContent=stats.maxHp;$('#growth-total-attack').textContent=Math.round(stats.attack);
    const defs={power:{currency:'ink',base:25,step:18,label:'インク'},vitality:{currency:'ink',base:25,step:18,label:'インク'},focus:{currency:'parts',base:2,step:1.5,label:'素材'}};
    Object.entries(defs).forEach(([id,def])=>{const level=data.growth[id],cost=growthCost(id,level),button=$(`[data-growth="${id}"]`),maxButton=$(`[data-growth-max="${id}"]`),affordable=data[def.currency]>=cost;$(`#${id}-level`).textContent=level;$(`#${id}-cost`).textContent=`${def.label} ${cost}`;button.disabled=!affordable;maxButton.disabled=!affordable;button.classList.toggle('unaffordable',!affordable);maxButton.classList.toggle('unaffordable',!affordable);button.dataset.cost=cost;button.dataset.currency=def.currency;maxButton.onclick=()=>upgradeGrowth(id,true)});
    $('#power-effect').textContent=`+${data.growth.power*4}`;$('#vitality-effect').textContent=`+${data.growth.vitality*24}`;$('#focus-effect').textContent=`+${(data.growth.focus*1.2).toFixed(1)}% / +${(data.growth.focus*2.5).toFixed(1)}%`;
    bindHoldButtons($$('[data-growth]'),button=>upgradeGrowth(button.dataset.growth,false));
  }
  function growthDef(id){return {power:{currency:'ink',base:25,step:18},vitality:{currency:'ink',base:25,step:18},focus:{currency:'parts',base:2,step:1.5}}[id]}
  function growthCost(id,level=data.growth[id]){const def=growthDef(id);return Math.ceil(def.base+level*def.step+Math.pow(level,1.32)*1.7)}
  function upgradeGrowth(id,max=false){const def=growthDef(id);if(!def)return;let raised=0;do{const cost=growthCost(id);if(data[def.currency]<cost)break;data[def.currency]-=cost;data.growth[id]++;raised++}while(max&&raised<10000);if(!raised){toast(`${def.currency==='ink'?'インク':'素材'}が足りません`);return}save();renderGrowth();tone(540,.12,'triangle');toast(max?`${raised}レベルまとめて強化！`:'永久能力が強くなった！')}

  function renderBase(){
    $('#base-level').textContent=data.baseLevel;const cost=40+(data.baseLevel-1)*35,atMax=data.baseLevel>=BASE_MAX,affordable=data.ink>=cost;$('#upgrade-cost').textContent=atMax?'MAX 強化済み':`インク ${cost}`;$('#upgrade-base').disabled=atMax||!affordable;$('#upgrade-base-max').disabled=atMax||!affordable;$('#upgrade-base').classList.toggle('unaffordable',!atMax&&!affordable);$('#upgrade-base-max').classList.toggle('unaffordable',!atMax&&!affordable);
    const rate=baseProductionMultiplier();$('#offline-rate').textContent=`拠点Lv.${data.baseLevel} 生産倍率 ×${rate.toFixed(2)}`;
    const list=$('#facility-list');list.innerHTML='';FACILITIES.forEach(f=>{const assigned=data.assigned.includes(f.id),el=document.createElement('article'),perSecond=f.id==='parts'?UAT_REWARD_MULTIPLIER*rate/60:f.id==='treasure'?1.5*UAT_REWARD_MULTIPLIER*rate/60:2*UAT_REWARD_MULTIPLIER*rate/60,treasureParts=UAT_REWARD_MULTIPLIER*rate/1800;el.className='facility';el.innerHTML=`<span class="facility-icon" style="--facility-color:${f.color}">${f.icon}</span><div><b>${f.name}</b><small>毎秒 ${f.id==='xp'?'EXP':f.id==='parts'?'素材':'インク'} +${formatRate(perSecond)}${f.id==='treasure'?` / 素材 +${formatRate(treasureParts)}`:''}（拠点Lv連動）</small></div><button class="${assigned?'assigned':''}">${assigned?'稼働中':'配置'}</button>`;el.querySelector('button').onclick=()=>toggleFacility(f.id);list.appendChild(el)});updateOfflineTime();
    bindHoldButtons([$('#upgrade-base')],()=>upgradeBase(false));
    $('#upgrade-base-max').onclick=()=>upgradeBase(true);
  }
  function slots(){return data.baseLevel>=25?4:data.baseLevel>=10?3:data.baseLevel>=5?2:1}
  function toggleFacility(id){const index=data.assigned.indexOf(id);if(index>=0){if(data.assigned.length===1){toast('1つは稼働させておこう');return}data.assigned.splice(index,1)}else{if(data.assigned.length>=slots()){toast(`配置枠は${slots()}つです`);return}data.assigned.push(id)}save();renderBase()}
  function baseProductionMultiplier(){return 1+(Math.max(1,data.baseLevel)-1)*.22}
  function formatRate(value){return value>=100?Math.floor(value).toLocaleString():value.toFixed(value>=10?1:2).replace(/\.?0+$/,'')}
  function autoRatesPerSecond(){const totals={ink:0,parts:0,xp:0},rate=baseProductionMultiplier();data.assigned.forEach(id=>{if(id==='ink')totals.ink+=2*UAT_REWARD_MULTIPLIER*rate/60;if(id==='parts')totals.parts+=UAT_REWARD_MULTIPLIER*rate/60;if(id==='xp')totals.xp+=2*UAT_REWARD_MULTIPLIER*rate/60;if(id==='treasure'){totals.ink+=1.5*UAT_REWARD_MULTIPLIER*rate/60;totals.parts+=UAT_REWARD_MULTIPLIER*rate/1800}});return totals}
  function updateOfflineTime(){const rates=autoRatesPerSecond();$('#offline-time').textContent='毎秒受取';$('#offline-preview').textContent=`毎秒：インク ${formatRate(rates.ink)} / 素材 ${formatRate(rates.parts)} / EXP ${formatRate(rates.xp)}`}
  function collectAutoRewards(){
    const now=Date.now(),last=Number(data.lastClaim)||now,rawSeconds=Math.max(0,(now-last)/1000),seconds=Math.min(43200,Math.floor(rawSeconds));if(seconds<1)return;
    const rates=autoRatesPerSecond(),gains={ink:0,parts:0,xp:0};data.autoCarry=data.autoCarry||{ink:0,parts:0,xp:0};Object.keys(gains).forEach(key=>{const raw=rates[key]*seconds+(Number(data.autoCarry[key])||0);gains[key]=Math.floor(raw);data.autoCarry[key]=raw-gains[key];data[key]+=gains[key]});data.lastClaim=rawSeconds>43200?now:last+seconds*1000;levelCheck(true);save();refreshResourceActions();if($('#base-view').classList.contains('active'))updateOfflineTime();
  }
  function refreshResourceActions(){
    renderHeader();
    if($('#growth-view').classList.contains('active'))renderGrowth();
    if($('#base-view').classList.contains('active')){
      const cost=40+(data.baseLevel-1)*35,atMax=data.baseLevel>=BASE_MAX,affordable=data.ink>=cost;
      $('#upgrade-base').disabled=atMax||!affordable;$('#upgrade-base-max').disabled=atMax||!affordable;
      $('#upgrade-base').classList.toggle('unaffordable',!atMax&&!affordable);$('#upgrade-base-max').classList.toggle('unaffordable',!atMax&&!affordable);
    }
    $$('.view.active [data-upgrade], .view.active [data-upgrade-max]').forEach(button=>{
      const ink=Number(button.dataset.costInk),parts=Number(button.dataset.costParts);if(!Number.isFinite(ink)||!Number.isFinite(parts))return;
      const affordable=data.ink>=ink&&data.parts>=parts;button.disabled=!affordable;button.classList.toggle('unaffordable',!affordable);
    });
    if($('#gacha-view').classList.contains('active')){
      $('#gacha-ticket-count').textContent=data.tickets||0;$('#gacha-ink-count').textContent=Math.floor(data.ink);
      $('#gacha-one').disabled=(data.tickets||0)<1&&data.ink<120;$('#gacha-ten').disabled=(data.tickets||0)<10&&data.ink<1080;
    }
  }
  function upgradeBase(max=false){let raised=0;do{const cost=40+(data.baseLevel-1)*35;if(data.baseLevel>=BASE_MAX||data.ink<cost)break;data.ink-=cost;data.baseLevel++;raised++}while(max);if(!raised){toast(data.baseLevel>=BASE_MAX?`拠点は Lv.${BASE_MAX} でMAXです`:'インクが足りません');return}save();renderBase();toast(max?`拠点を${raised}レベルまとめて強化！`:`拠点が Lv.${data.baseLevel} / ${BASE_MAX} になった！`)}

  function renderStageSelect(chapterId=selectedChapter){
    selectedChapter=Math.max(1,Math.min(CHAPTERS.length,chapterId));const unlocked=Math.min(MAX_STAGE,data.bestStage+1),power=playerPower();$('#stage-unlocked').textContent=unlocked;$('#select-power').textContent=power;
    const tabs=$('#chapter-tabs');tabs.innerHTML='';CHAPTERS.forEach(ch=>{const b=document.createElement('button');b.textContent=ch.id;b.title=ch.name;b.disabled=ch.start>unlocked;b.className=ch.id===selectedChapter?'active':'';b.onclick=()=>renderStageSelect(ch.id);tabs.appendChild(b)});
    const chapter=CHAPTERS[selectedChapter-1],grid=$('#stage-grid');grid.innerHTML='';
    for(let stage=chapter.start;stage<=chapter.end;stage++){
      const b=document.createElement('button'),locked=stage>unlocked,cleared=stage<=data.bestStage,selected=stage===data.selectedStage,danger=power<recommendedPower(stage)*.8;b.disabled=locked;b.className=`stage-tile ${cleared?'cleared':''} ${selected?'selected':''} ${danger&&!locked?'danger':''}`;b.innerHTML=`<small>${stage%10===0?'BOSS':'STAGE'}</small><b>${stage}</b><span>${locked?'🔒':cleared?'✓':danger?'危険':'NEW'}</span>`;b.onclick=()=>{data.selectedStage=stage;save();renderStageSelect(selectedChapter)};grid.appendChild(b)
    }
    const selectedEnemy=enemyFor(data.selectedStage);$('#selected-stage-copy').textContent=`STAGE ${data.selectedStage}・${selectedEnemy.name}へ挑戦`;$('#start-selected').disabled=data.selectedStage>unlocked;
  }

  function pct(value){return `${(value*100).toFixed(Math.abs(value*100-Math.round(value*100))<.01?0:1)}%`}
  function gearEffectText(store,item,level){
    if(store==='weapons'){const parts=[`攻撃倍率 +${pct(item.attack+(level-1)*.055)}`];if(item.hp)parts.push(`最大HP +${pct(item.hp)}`);if(item.crit)parts.push(`会心率 +${pct(item.crit)}`);const pierce=(item.pierce||0)+(level-1)*.006;if(pierce)parts.push(`貫通 +${pct(pierce)}`);return parts.join(' / ')}
    if(store==='armors')return `最大HP +${pct((item.hp||0)+(level-1)*.035)} / ダメージ軽減 +${pct((item.guard||0)+(level-1)*.006)}`;
    return `攻撃倍率 +${pct((item.attack||0)+(level-1)*.025)} / 最大HP +${pct((item.hp||0)+(level-1)*.018)}${item.crit?` / 会心率 +${pct(item.crit)}`:''}${item.pierce?` / 貫通 +${pct(item.pierce)}`:''}`;
  }
  function gearNextText(store){return store==='weapons'?'攻撃倍率 +5.5pt / 貫通 +0.6pt':store==='armors'?'最大HP +3.5pt / 軽減 +0.6pt':'攻撃倍率 +2.5pt / 最大HP +1.8pt'}
  function gearCost(level){return {parts:Math.ceil(2+level*2.4),ink:Math.ceil(28+level*34+Math.pow(level,1.35)*9)}}
  function renderEquipmentHub(){
    unlockEarnedWeapons();const entries=[['weapon',equippedWeapon(),'weapons'],['armor',equippedArmor(),'armors'],['accessory',equippedAccessory(),'accessories']];entries.forEach(([id,item,store])=>{const level=data[store][item.id]||1;$(`#hub-${id}-icon`).textContent=item.icon;$(`#hub-${id}-name`).textContent=`${item.name} Lv.${level}`;$(`#hub-${id}-effect`).textContent=gearEffectText(store,item,level)});
  }
  function renderWeapons(){renderGearPage('weapon-list',WEAPONS,'weapons','equippedWeapon','weapon-count')}
  function renderArmors(){renderGearPage('armor-list',ARMORS,'armors','equippedArmor','armor-count')}
  function renderAccessories(){renderGearPage('accessory-list',ACCESSORIES,'accessories','equippedAccessory','accessory-count')}
  function gearPower(item){return (item.attack||0)*100+(item.hp||0)*75+(item.guard||0)*160+(item.crit||0)*120+(item.pierce||0)*120}
  function rarityRank(rarity){return ({SSR:3,SR:2,R:1,'伝説':3,'レア':2,'通常':1})[rarity]||0}
  function renderGearPage(containerId,items,store,equipKey,countId){
    unlockEarnedWeapons();$(`#${countId}`).textContent=`${items.filter(item=>data[store][item.id]).length}/${items.length}`;
    const state=gearViewState[store],toolbar=$(`[data-gear-tools="${store}"]`);if(toolbar){toolbar.querySelector('[data-gear-filter]').value=state.filter;toolbar.querySelector('[data-gear-category]').value=state.category;toolbar.querySelector('[data-gear-sort]').value=state.sort}
    let visible=items.filter(item=>{const owned=!!data[store][item.id],equipped=data[equipKey]===item.id,status=state.filter==='all'||(state.filter==='owned'&&owned)||(state.filter==='equipped'&&equipped)||(state.filter==='locked'&&!owned),category=state.category==='all'||(store==='weapons'?item.type:item.rarity)===state.category;return status&&category});
    const originalIndex=item=>items.findIndex(x=>x.id===item.id);visible=[...visible].sort((a,b)=>state.sort==='level'?(data[store][b.id]||0)-(data[store][a.id]||0)||originalIndex(a)-originalIndex(b):state.sort==='power'?gearPower(b)-gearPower(a)||originalIndex(a)-originalIndex(b):state.sort==='rarity'?rarityRank(b.rarity)-rarityRank(a.rarity)||originalIndex(a)-originalIndex(b):state.sort==='name'?a.name.localeCompare(b.name,'ja'):originalIndex(a)-originalIndex(b));
    if(toolbar)toolbar.querySelector('[data-gear-result]').textContent=`${visible.length}件`;renderGearGroup(containerId,visible,store,equipKey)
  }
  function rerenderGearPage(store){if(store==='weapons')renderWeapons();else if(store==='armors')renderArmors();else renderAccessories()}
  function renderGearGroup(containerId,items,store,equipKey){
    const list=$(`#${containerId}`);list.innerHTML='';if(!items.length){list.innerHTML='<p class="empty-filter">条件に合う装備がありません</p>';return}items.forEach(item=>{const level=data[store][item.id]||0,unlocked=level>0,cost=gearCost(level),affordable=data.ink>=cost.ink&&data.parts>=cost.parts,el=document.createElement('article');el.className=`weapon-item ${unlocked?'':'locked'} ${data[equipKey]===item.id?'equipped':''}`;el.innerHTML=`<span class="weapon-icon">${unlocked?item.icon:'?'}</span><div class="gear-copy"><small>${item.type||item.rarity||'装備'}${unlocked?`・Lv.${level}`:item.unlock?`・STAGE ${item.unlock}で解放`:'・ガチャで入手'}</small><b>${unlocked?item.name:'未発見の装備'}</b><p class="gear-description">${unlocked?item.effect:item.unlock?'ボスを倒すと入手できます。':'ガチャから入手できます。'}</p>${unlocked?`<p class="gear-current"><strong>現在</strong>${gearEffectText(store,item,level)}</p><p class="gear-next"><strong>次Lv</strong>${gearNextText(store)}</p>`:''}</div><div class="weapon-actions">${unlocked?`<button data-equip>${data[equipKey]===item.id?'装備中':'装備'}</button><button data-upgrade data-cost-ink="${cost.ink}" data-cost-parts="${cost.parts}" ${!affordable?'disabled':''} class="${!affordable?'unaffordable':''}">強化<small>●${cost.ink} ✂${cost.parts}</small></button><button data-upgrade-max data-cost-ink="${cost.ink}" data-cost-parts="${cost.parts}" ${!affordable?'disabled':''} class="max-gear-button ${!affordable?'unaffordable':''}">MAX強化<small>所持分まで</small></button>`:''}</div>`;
      el.querySelector('[data-equip]')?.addEventListener('click',()=>{data[equipKey]=item.id;save();rerenderGearPage(store);toast(`${item.name}を装備した`)});
      const upgrade=el.querySelector('[data-upgrade]'),maxUpgrade=el.querySelector('[data-upgrade-max]');if(upgrade){bindHoldButtons([upgrade],()=>upgradeGear(store,item,false,upgrade));maxUpgrade.onclick=()=>upgradeGear(store,item,true)}list.appendChild(el)
    });
  }
  function upgradeGear(store,item,max=false,button=null){let raised=0;do{const level=data[store][item.id]||0,cost=gearCost(level);if(data.ink<cost.ink||data.parts<cost.parts)break;data.ink-=cost.ink;data.parts-=cost.parts;data[store][item.id]=level+1;raised++}while(max&&raised<10000);if(!raised){toast('インクまたは素材が足りません');return}save();tone(600,.035,'triangle');if(max){rerenderGearPage(store);toast(`${item.name}を${raised}レベルまとめて強化！`);return}const level=data[store][item.id],nextCost=gearCost(level),affordable=data.ink>=nextCost.ink&&data.parts>=nextCost.parts,card=button?.closest('.weapon-item');if(card){card.querySelector('.gear-copy>small').textContent=`${item.type||item.rarity||'装備'}・Lv.${level}`;card.querySelector('.gear-current').innerHTML=`<strong>現在</strong>${gearEffectText(store,item,level)}`;button.innerHTML=`強化<small>●${nextCost.ink} ✂${nextCost.parts}</small>`;button.dataset.costInk=nextCost.ink;button.dataset.costParts=nextCost.parts;button.disabled=!affordable;button.classList.toggle('unaffordable',!affordable);const maxButton=card.querySelector('[data-upgrade-max]');maxButton.dataset.costInk=nextCost.ink;maxButton.dataset.costParts=nextCost.parts;maxButton.disabled=!affordable;maxButton.classList.toggle('unaffordable',!affordable)}}
  function renderGacha(){
    $('#pity-count').textContent=data.pity||0;$('#gacha-ticket-count').textContent=data.tickets||0;$('#gacha-ink-count').textContent=Math.floor(data.ink);$('#blueprint-count').textContent=data.blueprints||0;
    $('#gacha-one').disabled=(data.tickets||0)<1&&data.ink<120;$('#gacha-ten').disabled=(data.tickets||0)<10&&data.ink<1080;
    const history=$('#gacha-history');history.innerHTML=(data.gachaHistory||[]).length?(data.gachaHistory||[]).map(x=>`<article class="gacha-result ${x.rarity.toLowerCase()}"><span>${x.icon}</span><div><small>${x.rarity}・${x.kind}</small><b>${x.name}</b></div><em>${x.new?'NEW':'Lv.UP'}</em></article>`).join(''):'<p class="empty-gacha">まだガチャを回していません</p>';
  }
  async function pullGacha(count){
    if(gachaBusy)return;
    const ticketCost=count;if((data.tickets||0)>=ticketCost)data.tickets-=ticketCost;else{const cost=count===10?1080:120;if(data.ink<cost)return;data.ink-=cost}
    gachaBusy=true;const results=[];for(let i=0;i<count;i++)results.push(drawGachaItem());data.gachaHistory=results.slice(-10).reverse();save();
    try{await playGachaAnimation(results)}finally{gachaBusy=false;renderGacha()}
    tone(results.some(x=>x.rarity==='SSR')?780:520,.18,'triangle');toast(results.some(x=>x.rarity==='SSR')?'SSR装備を獲得！':`${count}個の装備を獲得！`);
  }
  function gachaWait(ms){return new Promise(resolve=>{let done=false;const finish=()=>{if(done)return;done=true;if(gachaWaitResolve===finish)gachaWaitResolve=null;resolve()};gachaWaitResolve=finish;setTimeout(finish,ms)})}
  async function playGachaAnimation(results){
    const stage=$('#gacha-reveal-stage'),progress=$('#gacha-reveal-progress'),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,maxRarity=results.some(x=>x.rarity==='SSR')?'ssr':results.some(x=>x.rarity==='SR')?'sr':'r';
    gachaSkipRequested=false;stage.className='gacha-reveal-stage feeding';progress.textContent=results.length===10?'10枚の券をセット中…':'券をセット中…';openModal('#gacha-reveal-modal');tone(280,.06,'square');
    await gachaWait(reduced?80:430);if(!gachaSkipRequested){stage.className=`gacha-reveal-stage charging ${maxRarity}`;progress.textContent=maxRarity==='ssr'?'虹色の気配…！':maxRarity==='sr'?'青い光があふれている…':'文房具ボックス作動中…';tone(maxRarity==='ssr'?700:maxRarity==='sr'?560:430,.16,'triangle');await gachaWait(reduced?90:620)}
    for(let i=0;i<results.length&&!gachaSkipRequested;i++){
      const item=results[i];$('#gacha-reveal-rarity').textContent=`${item.rarity}・${item.kind}`;$('#gacha-reveal-icon').textContent=item.icon;$('#gacha-reveal-name').textContent=item.name;$('#gacha-reveal-new').textContent=item.new?'NEW':'Lv.UP';progress.textContent=`${i+1} / ${results.length}　タップでスキップ`;stage.className=`gacha-reveal-stage reveal ${item.rarity.toLowerCase()}`;void stage.offsetWidth;stage.classList.add('pop');tone(item.rarity==='SSR'?900:item.rarity==='SR'?680:510,.09,'triangle');await gachaWait(reduced?70:results.length===1?820:260);stage.classList.remove('pop')
    }
    closeModal('#gacha-reveal-modal');
  }
  function drawGachaItem(){
    data.pity=(data.pity||0)+1;const roll=Math.random(),rarity=data.pity>=50?'SSR':roll<.05?'SSR':roll<.25?'SR':'R';if(rarity==='SSR')data.pity=0;
    const armorPool=ARMORS.filter(x=>x.rarity===rarity),accessoryPool=ACCESSORIES.filter(x=>x.rarity===rarity),weaponPool=WEAPONS.filter(x=>(data.weapons[x.id]||x.unlock<=data.bestStage)&&((rarity==='SSR'&&x.attack>=.7)||(rarity==='SR'&&x.attack>=.28&&x.attack<.7)||(rarity==='R'&&x.attack<.28)));
    const pools=[...armorPool.map(x=>({item:x,store:'armors',kind:'防具'})),...accessoryPool.map(x=>({item:x,store:'accessories',kind:'アクセ'})),...weaponPool.map(x=>({item:x,store:'weapons',kind:'武器'}))],pick=pools[Math.floor(Math.random()*pools.length)]||{item:armorPool[0]||ARMORS[0],store:'armors',kind:'防具'},wasNew=!data[pick.store][pick.item.id];
    data[pick.store][pick.item.id]=(data[pick.store][pick.item.id]||0)+1;if(!wasNew)data.blueprints=(data.blueprints||0)+(rarity==='SSR'?5:rarity==='SR'?2:1);
    return {name:pick.item.name,icon:pick.item.icon,rarity,kind:pick.kind,new:wasNew};
  }
  function enemyStory(entry){
    const origins={stickman:'ノートのすみに最初に描かれた、素朴で負けず嫌いなラクガキ。',slime:'消しカスとインクが混ざって生まれた、ぷるぷるの掃除屋。',goblin:'使いかけの文房具を集める、いたずら好きの小鬼。',dragon:'赤ペンの勢いから生まれた、誇り高い空のラクガキ。',ghost:'書き損じを消した跡に残る、少しさびしがりな影。',robot:'定規で引いた線と計算式から組み上がった機械生命。',crab:'ホチキスやクリップを殻にした、机上の働き者。',knight:'定規を盾に、コンパスを槍にして余白を守る騎士。',snail:'のりと丸まった紙から生まれた、ゆっくり几帳面な運び屋。',owl:'本の知識を目いっぱい吸い込んだ、夜ふかし好きの案内役。',worm:'細長い紙片がつながって動き出した、せっかちなラクガキ。',fish:'こぼれた青インクを泳ぐ、好奇心いっぱいの水中ラクガキ。',shark:'切れ味のよい文房具を集める、迫力満点の海の番人。',bee:'画びょうの針と黄色いマーカーから生まれた働き者。',puppet:'切り抜いた紙へ糸を結んで動き出した、舞台好きの紙人形。',clock:'時間割と時計の数字から組み上がった、時間に厳しい機械。',rabbit:'消しゴムの角が耳になって跳び出した、すばしっこい人気者。',witch:'色とりどりのマーカーで魔法陣を描く、いたずら好きの魔女。',void:'描かれなかった余白そのもの。新しい線を静かに待っている。'};
    const stationery=entry.name.includes('ホチキス')?'背中のホチキスで紙を束ね、針の脚でカチカチ歩く。':entry.name.includes('定規')?'体の直線は定規でできており、曲がった線を見ると直したくなる。':entry.name.includes('ふせん')?'付箋の羽を貼ったりはがしたりして飛ぶ。':entry.name.includes('クリップ')?'クリップを曲げた体で、散らかった紙を回収する。':'';
    return `${origins[entry.type]||'紙とインクのすき間から生まれた、個性豊かなラクガキ。'}${stationery}`;
  }
  function openEnemyDetail(entry,record){
    const unlocked=!!record,type=ENEMY_TYPES[entry.type];$('#enemy-detail-name').textContent=unlocked?entry.name:'？？？？？';$('#enemy-detail-kicker').textContent=unlocked?`CHARACTER FILE・CHAPTER ${entry.chapter}`:'UNKNOWN CHARACTER';$('#enemy-detail-story').textContent=unlocked?enemyStory(entry):`CHAPTER ${entry.chapter}のどこかにいるようだ。出会うと詳しい説明が解放されます。`;
    $('#enemy-detail-stats').innerHTML=unlocked?`<span><small>戦闘特性</small><b>${type.trait}</b></span><span><small>初出</small><b>STAGE ${(entry.chapter-1)*10+1}〜</b></span><span><small>遭遇</small><b>${record.count}回</b></span><span><small>個体発見率</small><b>${Math.round(record.variants.length/(entry.boss?1:5)*100)}%</b></span>`:'<span><small>発見ヒント</small><b>ステージを進めよう</b></span>';
    drawEnemyArt($('#enemy-detail-canvas'),{...type,...entry,variant:ENEMY_VARIANTS[0]},!unlocked);openModal('#enemy-detail-modal');
  }
  function renderEnemyBook(){
    const grid=$('#enemy-collection-grid');grid.innerHTML='';const state=collectionViewState.enemy,fullCatalog=enemyCatalog();let catalog=fullCatalog.filter(entry=>{const found=!!data.enemyBook[entry.name],status=state.filter==='all'||(state.filter==='found'&&found)||(state.filter==='missing'&&!found),category=state.category==='all'||(state.category==='boss'&&entry.boss)||(state.category==='normal'&&!entry.boss);return status&&category});
    catalog=[...catalog].sort((a,b)=>state.sort==='name'?a.name.localeCompare(b.name,'ja'):state.sort==='encounters'?(data.enemyBook[b.name]?.count||0)-(data.enemyBook[a.name]?.count||0)||a.chapter-b.chapter:state.sort==='found'?Number(!!data.enemyBook[b.name])-Number(!!data.enemyBook[a.name])||a.chapter-b.chapter:a.chapter-b.chapter||Number(a.boss)-Number(b.boss));$('#collection-result').textContent=`${catalog.length}件`;
    if(!catalog.length){grid.innerHTML='<p class="empty-filter">条件に合うキャラクターがいません</p>';return}
    catalog.forEach(entry=>{const record=data.enemyBook[entry.name],unlocked=!!record,type=ENEMY_TYPES[entry.type],el=document.createElement('article');el.className=`enemy-book-item ${unlocked?'':'locked'} ${entry.boss?'boss-entry':''}`;
      const canvas=document.createElement('canvas');canvas.width=180;canvas.height=160;canvas.setAttribute('aria-label',unlocked?entry.name:'未遭遇の敵');
      const copy=document.createElement('div');copy.innerHTML=`<span>${entry.boss?'BOSS':`CH.${entry.chapter}`}</span><b>${unlocked?entry.name:'？？？？？'}</b><small>${unlocked?type.trait:'この敵に出会うと記録されます'}</small>${unlocked?`<em>遭遇 ${record.count}回・個体 ${record.variants.length}/${entry.boss?1:5}</em>`:'<em>未遭遇</em>'}`;
      el.append(canvas,copy);el.tabIndex=0;el.setAttribute('role','button');el.onclick=()=>openEnemyDetail(entry,record);el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openEnemyDetail(entry,record)}};grid.appendChild(el);drawEnemyArt(canvas,{...type,...entry,variant:ENEMY_VARIANTS[0]},!unlocked)
    });
  }
  function renderCardBook(){const grid=$('#collection-grid');grid.innerHTML='';const state=collectionViewState.card;let cards=CARDS.filter(card=>{const found=data.discovered.includes(card.id),status=state.filter==='all'||(state.filter==='found'&&found)||(state.filter==='missing'&&!found),category=state.category==='all'||card.rarity===state.category;return status&&category});cards=[...cards].sort((a,b)=>state.sort==='name'?a.name.localeCompare(b.name,'ja'):state.sort==='rarity'?rarityRank(b.rarity)-rarityRank(a.rarity)||CARDS.indexOf(a)-CARDS.indexOf(b):state.sort==='found'?Number(data.discovered.includes(b.id))-Number(data.discovered.includes(a.id))||CARDS.indexOf(a)-CARDS.indexOf(b):CARDS.indexOf(a)-CARDS.indexOf(b));$('#collection-result').textContent=`${cards.length}件`;if(!cards.length){grid.innerHTML='<p class="empty-filter">条件に合うひらめきがありません</p>';return}cards.forEach(card=>{const unlocked=data.discovered.includes(card.id),el=document.createElement('article');el.className=`collection-item ${unlocked?'':'locked'}`;el.innerHTML=`<span class="rarity">${unlocked?card.rarity:'？？？'}</span><span class="card-emoji">${unlocked?card.icon:'?'}</span><b>${unlocked?card.name:'未発見'}</b><small>${unlocked?card.desc:'冒険で見つけよう'}</small>`;grid.appendChild(el)})}
  function syncCollectionTools(tab){const state=collectionViewState[tab],category=$('#collection-category'),sort=$('#collection-sort');$('#collection-filter').value=state.filter;if(tab==='enemy'){$('#collection-category-label').textContent='種類';category.innerHTML='<option value="all">すべて</option><option value="normal">通常敵</option><option value="boss">ボス</option>';sort.innerHTML='<option value="default">初出順</option><option value="found">発見済み順</option><option value="encounters">遭遇数順</option><option value="name">名前順</option>'}else{$('#collection-category-label').textContent='レア度';category.innerHTML='<option value="all">すべて</option><option value="通常">通常</option><option value="レア">レア</option><option value="伝説">伝説</option>';sort.innerHTML='<option value="default">図鑑順</option><option value="found">発見済み順</option><option value="rarity">レア度順</option><option value="name">名前順</option>'}category.value=state.category;sort.value=state.sort}
  function renderCollection(tab='enemy'){
    activeCollectionTab=tab;syncCollectionTools(tab);
    const enemyCount=enemyBookCount(),allCount=enemyCatalog().length,cardCount=data.discovered.length,totalPercent=Math.round((enemyCount+cardCount)/(allCount+CARDS.length)*100);
    $('#collection-total').textContent=`${totalPercent}%`;$('#enemy-book-total').textContent=`${enemyCount}/${allCount}`;$('#card-book-total').textContent=`${cardCount}/${CARDS.length}`;
    const enemyMode=tab==='enemy';$('#enemy-book-tab').classList.toggle('active',enemyMode);$('#card-book-tab').classList.toggle('active',!enemyMode);$('#enemy-collection-grid').classList.toggle('hidden',!enemyMode);$('#collection-grid').classList.toggle('hidden',enemyMode);$('#collection-lead').textContent=enemyMode?'キャラクターをタップすると、由来・性格・戦闘特性・個体発見率を確認できます。':'冒険中に一度でも選んだ強化が記録されます。';
    if(enemyMode)renderEnemyBook();else renderCardBook();
  }

  function openTutorial(firstRun=false){tutorialIndex=0;tutorialFirstRun=firstRun;renderTutorial();openModal('#tutorial-modal')}
  function renderTutorial(){const step=TUTORIAL[tutorialIndex];$('#tutorial-visual').textContent=step.icon;$('#tutorial-kicker').textContent=step.kicker;$('#tutorial-title').textContent=step.title;$('#tutorial-copy').textContent=step.copy;$('#tutorial-next').textContent=tutorialIndex===TUTORIAL.length-1?(tutorialFirstRun?'主人公を描く →':'閉じる'):'つぎへ →';$('#tutorial-dots').innerHTML=TUTORIAL.map((_,i)=>`<i class="${i===tutorialIndex?'active':''}"></i>`).join('')}
  function finishTutorial(openDraw=false){data.tutorialSeen=true;save();closeModal('#tutorial-modal');if(openDraw&&!data.heroImage)setTimeout(openDrawing,80)}

  $('#logo-button').onclick=()=>{if(run?.active){askConfirm('冒険を中断する？','ここまでに獲得した報酬は残ります。','拠点へ戻る',()=>{run.active=false;clearTimeout(battleTimer);run=null;showView('home-view')});return}showView('home-view')};
  $$('.back-home').forEach(button=>button.onclick=()=>showView('home-view'));
  $$('.back-equipment').forEach(button=>button.onclick=()=>{renderEquipmentHub();showView('equipment-view')});
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
  $('#start-endless').onclick=()=>beginRun(Math.max(1,Math.min(MAX_STAGE,data.bestStage||1)),true);
  $('#auto-mode').onchange=e=>{data.autoMode=e.target.checked;save();toast(data.autoMode?'完全自動モード ON':'完全自動モード OFF')};
  $('#open-stages').onclick=()=>{selectedChapter=chapterFor(data.selectedStage).id;renderStageSelect(selectedChapter);showView('stage-view')};
  $('#start-selected').onclick=()=>beginRun(data.selectedStage);
  $('#open-base').onclick=()=>{renderBase();showView('base-view')};$('#open-collection').onclick=()=>{renderCollection();showView('collection-view')};$('#open-growth').onclick=()=>{renderGrowth();showView('growth-view')};$('#open-weapons').onclick=()=>{renderEquipmentHub();showView('equipment-view')};$('#open-gacha').onclick=()=>{renderGacha();showView('gacha-view')};
  $('#open-weapon-page').onclick=()=>{renderWeapons();showView('weapons-view')};$('#open-armor-page').onclick=()=>{renderArmors();showView('armors-view')};$('#open-accessory-page').onclick=()=>{renderAccessories();showView('accessories-view')};
  $$('[data-gear-tools]').forEach(toolbar=>toolbar.addEventListener('change',event=>{const store=toolbar.dataset.gearTools,state=gearViewState[store];if(event.target.matches('[data-gear-filter]'))state.filter=event.target.value;if(event.target.matches('[data-gear-category]'))state.category=event.target.value;if(event.target.matches('[data-gear-sort]'))state.sort=event.target.value;rerenderGearPage(store)}));
  $('#enemy-book-tab').onclick=()=>renderCollection('enemy');$('#card-book-tab').onclick=()=>renderCollection('card');
  $('#collection-filter').onchange=event=>{collectionViewState[activeCollectionTab].filter=event.target.value;renderCollection(activeCollectionTab)};$('#collection-category').onchange=event=>{collectionViewState[activeCollectionTab].category=event.target.value;renderCollection(activeCollectionTab)};$('#collection-sort').onchange=event=>{collectionViewState[activeCollectionTab].sort=event.target.value;renderCollection(activeCollectionTab)};
  $('#quit-run').onclick=()=>askConfirm('冒険を中断する？','ここまでに獲得した報酬は残ります。','中断する',()=>{run.active=false;clearTimeout(battleTimer);run=null;showView('home-view')});
  $('#speed-button').onclick=()=>{if(!run)return;if(!run.endless&&data.bestStage<run.stage){toast('2倍速はクリア済みステージで使えます');return}run.speed=run.speed===1?2:1;$('#speed-button').textContent=`×${run.speed}`;toast(run.speed===2?'2倍速':'通常速度')};
  $('#claim-offline').onclick=()=>toast('報酬は1秒ごとに自動で追加されています');
  $('#gacha-one').onclick=()=>pullGacha(1);$('#gacha-ten').onclick=()=>pullGacha(10);$('#close-enemy-detail').onclick=()=>closeModal('#enemy-detail-modal');
  $('#gacha-skip').onclick=()=>{gachaSkipRequested=true;gachaWaitResolve?.()};$('#gacha-reveal-stage').onclick=e=>{if(e.target.closest('#gacha-skip'))return;gachaSkipRequested=true;gachaWaitResolve?.()};
  $('#chapter-return').onclick=()=>{closeModal('#chapter-modal');run=null;showView('home-view');renderHeader()};
  $('#open-help').onclick=()=>openTutorial(false);$('#tutorial-skip').onclick=()=>finishTutorial(tutorialFirstRun);$('#tutorial-next').onclick=()=>{if(tutorialIndex<TUTORIAL.length-1){tutorialIndex++;renderTutorial()}else finishTutorial(tutorialFirstRun)};

  document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});
  document.addEventListener('dblclick',e=>e.preventDefault(),{passive:false});
  document.addEventListener('touchmove',e=>{if(e.touches.length>1)e.preventDefault()},{passive:false});
  collectAutoRewards();
  setInterval(collectAutoRewards,1000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)collectAutoRewards()});
  renderSampleHeroes();
  renderHeader();
  if(!data.tutorialSeen)setTimeout(()=>openTutorial(true),300);
  if('serviceWorker' in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
})();
