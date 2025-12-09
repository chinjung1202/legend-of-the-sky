
import { Hero, LevelConfig, TowerDef, TowerType, ProjectileType, EnemyDef, EnemyType, ShopItem } from './types';

// --- Hero Definitions (Expanded to 9) ---
export const HEROES: Hero[] = [
  {
    id: 'h_rin',
    name: '赤鬼 凜 (Rin)',
    role: '前排坦克 / 物理攔截',
    description: '繼承了古老赤鬼之血的重裝劍士。她專注於前線作戰，擁有極高的生命值與護甲，能同時攔截多個敵人並反彈傷害。她是守護防線的不動壁壘。',
    skills: ['金剛不壞', '挑釁', '鬼火護盾'],
    ultimateName: "鬼神烈火斬",
    ultimateDesc: "爆發鬼神之力，對周圍敵人造成巨大火屬性傷害 (2000+) 並暈眩 5 秒。",
    baseStats: { hp: 900, atk: 35, armor: 0.7, respawnTime: 12, skillCooldown: 20 },
    visualTheme: {
      primaryColor: '#ef4444', 
      secondaryColor: '#1f2937', 
      accentColor: '#fbbf24', 
      weaponType: 'SWORD',
      feature: 'HORNS',
      eyeColor: '#facc15',
      hairStyle: 'PONYTAIL'
    },
    talentTree: {
      t1: [
        { id: 'rin_t1_hp', name: '鬼族體質', description: '最大生命值 +500', tier: 1, icon: 'heart' },
        { id: 'rin_t1_atk', name: '重擊訓練', description: '攻擊有 20% 機率擊暈敵人', tier: 1, icon: 'sword' }
      ],
      t2: [
        { id: 'rin_t2_burn', name: '熔岩鎧甲', description: '對接觸的敵人每秒造成 30 點真實傷害', tier: 2, icon: 'flame' },
        { id: 'rin_t2_thorns', name: '尖刺防禦', description: '受到攻擊時反彈 50% 傷害給攻擊者', tier: 2, icon: 'shield' }
      ],
      t3: [
        { id: 'rin_t3_ult', name: '不滅鬼神', description: '大招發動後獲得 10 秒無敵狀態', tier: 3, icon: 'zap' }
      ]
    }
  },
  {
    id: 'h_yuki',
    name: '白狐 雪 (Yuki)',
    role: '持續輸出 / 遠程狙擊',
    description: '守護神木的神射手。她不具備近戰能力，但擁有全遊戲最遠的射程與穩定的輸出。她的箭矢能輕易穿透敵人的裝甲，是擊殺飛行單位與高價值目標的專家。',
    skills: ['連珠箭', '弱點狙擊', '風之行'],
    ultimateName: "千本櫻・淨",
    ultimateDesc: "召喚光之箭雨覆蓋全場，對所有敵人造成多次神聖傷害 (合計 3000+)。",
    baseStats: { hp: 350, atk: 80, armor: 0.1, respawnTime: 15, skillCooldown: 25 },
    visualTheme: {
      primaryColor: '#f1f5f9',
      secondaryColor: '#3b82f6',
      accentColor: '#f43f5e',
      weaponType: 'BOW',
      feature: 'FOX_EARS',
      eyeColor: '#60a5fa',
      hairStyle: 'LONG'
    },
    talentTree: {
      t1: [
        { id: 'yuki_t1_spd', name: '精靈速射', description: '攻擊速度提升 30%', tier: 1, icon: 'wind' },
        { id: 'yuki_t1_range', name: '鷹眼', description: '攻擊射程提升 80', tier: 1, icon: 'eye' }
      ],
      t2: [
        { id: 'yuki_t2_crit', name: '致命一擊', description: '每第三次攻擊必定暴擊 (200% 傷害)', tier: 2, icon: 'target' },
        { id: 'yuki_t2_pierce', name: '穿透箭', description: '普通攻擊可穿透一直線上的所有敵人', tier: 2, icon: 'arrow' }
      ],
      t3: [
        { id: 'yuki_t3_ult', name: '神之箭', description: '大招箭雨附帶 3 秒凍結效果', tier: 3, icon: 'zap' }
      ]
    }
  },
  {
    id: 'h_sakura',
    name: '妖銃 櫻 (Sakura)',
    role: '爆發輸出 / 範圍轟炸',
    description: '手持魔導狙擊槍的傭兵。她的攻擊頻率較慢，但每一發子彈都能造成毀滅性的範圍傷害。擅長清理成群結隊的弱小魔物。',
    skills: ['高爆彈', '燃燒彈', '戰術裝填'],
    ultimateName: "終極爆裂彈",
    ultimateDesc: "鎖定場上最強敵人，發射一枚造成 5000 點真實傷害的戰術導彈。",
    baseStats: { hp: 450, atk: 120, armor: 0.2, respawnTime: 18, skillCooldown: 45 },
    visualTheme: {
      primaryColor: '#18181b',
      secondaryColor: '#db2777',
      accentColor: '#94a3b8',
      weaponType: 'GUN',
      feature: 'HAT',
      eyeColor: '#f472b6',
      hairStyle: 'TWINTAILS'
    },
    talentTree: {
      t1: [
        { id: 'sakura_t1_reload', name: '快速裝填', description: '攻擊間隔減少 25%', tier: 1, icon: 'clock' },
        { id: 'sakura_t1_dmg', name: '貧鈾彈頭', description: '基礎攻擊力 +50', tier: 1, icon: 'sword' }
      ],
      t2: [
        { id: 'sakura_t2_headshot', name: '處決者', description: '對生命值低於 40% 的敵人造成 3 倍傷害', tier: 2, icon: 'skull' },
        { id: 'sakura_t2_splash', name: '破片手雷', description: '普攻爆炸範圍擴大 50%', tier: 2, icon: 'bomb' }
      ],
      t3: [
        { id: 'sakura_t3_ult', name: '飽和轟炸', description: '大招變為發射 3 枚導彈，隨機攻擊不同目標', tier: 3, icon: 'zap' }
      ]
    }
  },
  {
    id: 'h_tamamo',
    name: '九尾 玉藻 (Tamamo)',
    role: '戰場控制 / 法術輔助',
    description: '擅長操縱靈魂與幻術的九尾妖狐。她能大幅削弱敵人的移動速度與防禦力，並利用持續性的法術傷害折磨對手。',
    skills: ['靈魂束縛', '魅惑之吻', '妖火'],
    ultimateName: "百鬼夜行",
    ultimateDesc: "釋放強大的妖氣，使全場敵人緩速 80% 並持續受到魔法傷害 (2000+)。",
    baseStats: { hp: 400, atk: 60, armor: 0.1, respawnTime: 16, skillCooldown: 30 },
    visualTheme: {
      primaryColor: '#7c3aed',
      secondaryColor: '#fcd34d',
      accentColor: '#ffffff',
      weaponType: 'MAGIC',
      feature: 'TAILS',
      eyeColor: '#c084fc',
      hairStyle: 'LONG'
    },
    talentTree: {
      t1: [
        { id: 'tamamo_t1_mp', name: '魔力迴路', description: '技能冷卻時間減少 30%', tier: 1, icon: 'clock' },
        { id: 'tamamo_t1_ap', name: '咒術增強', description: '法術傷害提升 40%', tier: 1, icon: 'sparkles' }
      ],
      t2: [
        { id: 'tamamo_t2_slow', name: '深淵泥沼', description: '普攻使敵人永久緩速 20% (可疊加3層)', tier: 2, icon: 'snow' },
        { id: 'tamamo_t2_charm', name: '混亂魅惑', description: '普攻有 25% 機率使敵人倒戈攻擊同伴', tier: 2, icon: 'heart' }
      ],
      t3: [
        { id: 'tamamo_t3_ult', name: '彼岸花開', description: '大招期間，所有死去的敵人會變成幽靈協助戰鬥', tier: 3, icon: 'zap' }
      ]
    }
  },
  {
    id: 'h_ibaraki',
    name: '鬼將 茨木 (Ibaraki)',
    role: '近戰鬥士 / 自我續航',
    description: '擁有強大再生能力的鬼族戰將。他不像凜那樣堅硬，但依靠強大的吸血能力與範圍橫掃，能在敵群中屹立不搖。',
    skills: ['鬼手粉碎', '嗜血', '狂暴'],
    ultimateName: "羅生門之握",
    ultimateDesc: "從地獄召喚巨大的鬼手，捏碎範圍內的敵人 (3000 傷害) 並回復大量生命。",
    baseStats: { hp: 800, atk: 70, armor: 0.3, respawnTime: 14, skillCooldown: 28 },
    visualTheme: {
      primaryColor: '#27272a',
      secondaryColor: '#dc2626',
      accentColor: '#ea580c',
      weaponType: 'GAUNTLET',
      feature: 'ARMOR',
      eyeColor: '#ef4444',
      hairStyle: 'SHORT'
    },
    talentTree: {
      t1: [
        { id: 'ibaraki_t1_armor', name: '黑鐵皮膚', description: '受到的所有傷害減少 15%', tier: 1, icon: 'shield' },
        { id: 'ibaraki_t1_hp', name: '鬼王活力', description: '生命回復速度 +10/秒', tier: 1, icon: 'heart' }
      ],
      t2: [
        { id: 'ibaraki_t2_cleave', name: '旋風斬', description: '普通攻擊變成 360 度範圍傷害', tier: 2, icon: 'users' },
        { id: 'ibaraki_t2_lifesteal', name: '血之渴望', description: '吸血率提升至 50%', tier: 2, icon: 'droplet' }
      ],
      t3: [
        { id: 'ibaraki_t3_ult', name: '地獄之門', description: '大招結束後，召喚一隻強大的鬼兵協助戰鬥', tier: 3, icon: 'skull' }
      ]
    }
  },
  {
    id: 'h_kael',
    name: '風之刃 凱爾 (Kael)',
    role: '極速刺客 / 閃避反擊',
    description: '掌握風之力的精靈刺客。他行動如風，敵人難以捕捉其身影。他雖然生命值不高，但極高的閃避率和暴擊傷害讓他成為戰場上的收割機。',
    skills: ['瞬步', '風刃', '殘影'],
    ultimateName: "風神演武",
    ultimateDesc: "瞬間在戰場上穿梭，對所有敵人造成 10 次斬擊傷害 (合計 3500+)。",
    baseStats: { hp: 400, atk: 90, armor: 0.1, respawnTime: 10, skillCooldown: 20 },
    visualTheme: {
      primaryColor: '#10b981', secondaryColor: '#064e3b', accentColor: '#34d399',
      weaponType: 'DAGGER', feature: 'HOOD', eyeColor: '#34d399', hairStyle: 'SHORT'
    },
    talentTree: {
      t1: [
        { id: 'kael_t1_spd', name: '迅捷步伐', description: '移動速度提升 50%', tier: 1, icon: 'wind' },
        { id: 'kael_t1_dodge', name: '直覺閃避', description: '閃避率 +20%', tier: 1, icon: 'eye' }
      ],
      t2: [
        { id: 'kael_t2_crit', name: '弱點識破', description: '暴擊率 +30%, 暴擊傷害 +50%', tier: 2, icon: 'crosshair' },
        { id: 'kael_t2_poison', name: '淬毒刀鋒', description: '攻擊附加劇毒，每秒造成 10% 攻擊力傷害', tier: 2, icon: 'droplet' }
      ],
      t3: [
        { id: 'kael_t3_ult', name: '暴風劍聖', description: '大招期間無敵，且每次斬擊皆為暴擊', tier: 3, icon: 'zap' }
      ]
    }
  },
  {
    id: 'h_lyra',
    name: '聖光祭司 萊拉 (Lyra)',
    role: '戰場輔助 / 治療強化',
    description: '侍奉光之女神的高階祭司。她不擅長戰鬥，但能為士兵和英雄提供強大的治療與防禦加成，甚至能復活倒下的友軍。',
    skills: ['治癒之光', '守護祝福', '神聖懲擊'],
    ultimateName: "女神之淚",
    ultimateDesc: "完全治癒全場所有友軍，並在 10 秒內提升所有防禦塔 100% 攻速。",
    baseStats: { hp: 300, atk: 20, armor: 0.1, respawnTime: 12, skillCooldown: 40 },
    visualTheme: {
      primaryColor: '#fef3c7', secondaryColor: '#fbbf24', accentColor: '#ffffff',
      weaponType: 'STAFF', feature: 'HALO', eyeColor: '#fcd34d', hairStyle: 'LONG'
    },
    talentTree: {
      t1: [
        { id: 'lyra_t1_range', name: '慈悲光環', description: '光環範圍擴大 30%', tier: 1, icon: 'sun' },
        { id: 'lyra_t1_mp', name: '冥想', description: '技能冷卻減少 20%', tier: 1, icon: 'clock' }
      ],
      t2: [
        { id: 'lyra_t2_buff', name: '勇氣讚歌', description: '周圍友軍攻擊力提升 30%', tier: 2, icon: 'sword' },
        { id: 'lyra_t2_heal', name: '再生之泉', description: '光環內友軍每秒恢復 2% 最大生命', tier: 2, icon: 'heart' }
      ],
      t3: [
        { id: 'lyra_t3_ult', name: '奇蹟降臨', description: '大招可復活所有死亡的士兵與英雄', tier: 3, icon: 'zap' }
      ]
    }
  },
  {
    id: 'h_grom',
    name: '大地之子 格羅姆 (Grom)',
    role: '超級坦克 / 戰場分割',
    description: '擁有岩石皮膚的矮人重裝戰士。他的存在本身就是一堵牆。他能製造地形障礙，強制改變敵人的路徑，並承受毀滅性的打擊。',
    skills: ['岩石皮膚', '地震波', '裂地擊'],
    ultimateName: "大地之怒",
    ultimateDesc: "重擊地面引發大地震，暈眩全場敵人 8 秒並降低其 70% 護甲，造成 1500 傷害。",
    baseStats: { hp: 1500, atk: 40, armor: 0.8, respawnTime: 20, skillCooldown: 35 },
    visualTheme: {
      primaryColor: '#57534e', secondaryColor: '#292524', accentColor: '#84cc16',
      weaponType: 'SHIELD', feature: 'ARMOR', eyeColor: '#a8a29e', hairStyle: 'BALD'
    },
    talentTree: {
      t1: [
        { id: 'grom_t1_hp', name: '山岳之心', description: '最大生命 +800', tier: 1, icon: 'shield' },
        { id: 'grom_t1_regen', name: '大地滋養', description: '受傷後 5 秒內快速回血', tier: 1, icon: 'heart' }
      ],
      t2: [
        { id: 'grom_t2_slow', name: '流沙陷阱', description: '攻擊使敵人緩速 60%', tier: 2, icon: 'anchor' },
        { id: 'grom_t2_taunt', name: '無畏嘲諷', description: '強制周圍敵人攻擊自己', tier: 2, icon: 'message-circle' }
      ],
      t3: [
        { id: 'grom_t3_ult', name: '泰坦降臨', description: '大招期間體型變大，阻擋範圍增加，免疫控制', tier: 3, icon: 'zap' }
      ]
    }
  },
  {
    id: 'h_vex',
    name: '虛空行者 維克斯 (Vex)',
    role: '暗影法師 / 持續削弱',
    description: '曾經觸碰過虛空而被詛咒的法師。他利用虛空的力量對抗虛空。擅長施加各種負面狀態 (DoT, 降攻, 降防)，並能召喚暗影分身。',
    skills: ['暗影箭', '恐懼', '虛空虹吸'],
    ultimateName: "黑洞塌縮",
    ultimateDesc: "在戰場中心召喚微型黑洞，將敵人吸入其中並造成持續真實傷害 (每秒 10% 最大生命)。",
    baseStats: { hp: 380, atk: 75, armor: 0.15, respawnTime: 16, skillCooldown: 32 },
    visualTheme: {
      primaryColor: '#4c1d95', secondaryColor: '#000000', accentColor: '#8b5cf6',
      weaponType: 'ORB', feature: 'MASK', eyeColor: '#a78bfa', hairStyle: 'SHORT'
    },
    talentTree: {
      t1: [
        { id: 'vex_t1_dot', name: '腐蝕觸摸', description: '所有傷害附加 5 秒腐蝕效果', tier: 1, icon: 'skull' },
        { id: 'vex_t1_range', name: '虛空視野', description: '射程 +100', tier: 1, icon: 'eye' }
      ],
      t2: [
        { id: 'vex_t2_spread', name: '瘟疫擴散', description: '敵人死亡時將身上的負面狀態傳染給周圍', tier: 2, icon: 'share-2' },
        { id: 'vex_t2_fear', name: '絕望光環', description: '周圍敵人攻擊力降低 30%', tier: 2, icon: 'frown' }
      ],
      t3: [
        { id: 'vex_t3_ult', name: '事件視界', description: '黑洞範圍擴大，並有低機率直接秒殺非 BOSS 單位', tier: 3, icon: 'zap' }
      ]
    }
  }
];

// --- Enemy Definitions (Rewards Reduced) ---
export const ENEMIES: Record<EnemyType, EnemyDef> = {
  [EnemyType.SLIME]: { type: EnemyType.SLIME, name: "史萊姆", description: "低階魔物，行動遲緩。", baseHp: 20, baseSpeed: 0.8, armor: 0, isFlying: false, reward: 2, visualColor: '#a3e635' },
  [EnemyType.GOBLIN]: { type: EnemyType.GOBLIN, name: "哥布林", description: "貪婪且數量眾多。", baseHp: 30, baseSpeed: 1.5, armor: 0, isFlying: false, reward: 3, visualColor: '#16a34a' },
  [EnemyType.WOLF]: { type: EnemyType.WOLF, name: "魔化座狼", description: "速度極快的掠食者。", baseHp: 50, baseSpeed: 2.0, armor: 0, isFlying: false, reward: 5, visualColor: '#71717a' },
  [EnemyType.ORC]: { type: EnemyType.ORC, name: "獸人戰士", description: "皮糙肉厚的戰士。", baseHp: 120, baseSpeed: 0.7, armor: 0.1, isFlying: false, reward: 8, visualColor: '#3f6212' },
  [EnemyType.HARPY]: { type: EnemyType.HARPY, name: "哈比鷹人", description: "空中單位，無視地面阻擋。", baseHp: 70, baseSpeed: 1.3, armor: 0, isFlying: true, reward: 6, visualColor: '#0ea5e9' },
  [EnemyType.SPIDER]: { type: EnemyType.SPIDER, name: "劇毒蜘蛛", description: "成群結隊，干擾防線。", baseHp: 60, baseSpeed: 1.6, armor: 0, isFlying: false, reward: 4, visualColor: '#7f1d1d' },
  [EnemyType.GHOST]: { type: EnemyType.GHOST, name: "怨靈", description: "物理免疫 50%。", baseHp: 80, baseSpeed: 1.0, armor: 0, isFlying: true, reward: 8, visualColor: '#94a3b8' },
  [EnemyType.ASSASSIN]: { type: EnemyType.ASSASSIN, name: "虛空刺客", description: "隱形且極快，會繞過防禦。", baseHp: 80, baseSpeed: 2.5, armor: 0, isFlying: false, reward: 10, visualColor: '#4c1d95' },
  [EnemyType.VAMPIRE]: { type: EnemyType.VAMPIRE, name: "吸血鬼伯爵", description: "攻擊吸血，越戰越強。", baseHp: 250, baseSpeed: 1.2, armor: 0.2, isFlying: false, reward: 15, visualColor: '#9f1239' },
  [EnemyType.NECROMANCER]: { type: EnemyType.NECROMANCER, name: "死靈法師", description: "復活周圍屍體。", baseHp: 150, baseSpeed: 0.5, armor: 0.2, isFlying: false, reward: 12, visualColor: '#10b981' },
  [EnemyType.ARMORED_KNIGHT]: { type: EnemyType.ARMORED_KNIGHT, name: "墮落騎士", description: "重甲單位，物理抗性極高。", baseHp: 200, baseSpeed: 0.6, armor: 0.4, isFlying: false, reward: 10, visualColor: '#1e293b' },
  [EnemyType.DARK_MAGE]: { type: EnemyType.DARK_MAGE, name: "黑暗祭司", description: "會治療敵軍。", baseHp: 100, baseSpeed: 0.9, armor: 0.1, isFlying: false, reward: 9, visualColor: '#7c3aed' },
  [EnemyType.GOLEM]: { type: EnemyType.GOLEM, name: "岩石巨人", description: "超高血量與護甲。", baseHp: 500, baseSpeed: 0.35, armor: 0.3, isFlying: false, reward: 20, visualColor: '#78350f' },
  [EnemyType.BEHEMOTH]: { type: EnemyType.BEHEMOTH, name: "深淵巨獸", description: "攻城巨獸，免疫控制。", baseHp: 1200, baseSpeed: 0.25, armor: 0.6, isFlying: false, reward: 50, visualColor: '#5b21b6' },
  [EnemyType.DEMON]: { type: EnemyType.DEMON, name: "煉獄惡魔", description: "高攻高血，自帶燃燒。", baseHp: 400, baseSpeed: 1.0, armor: 0.2, isFlying: false, reward: 18, visualColor: '#991b1b' },
  // --- New Enemies ---
  [EnemyType.GARGOYLE]: { type: EnemyType.GARGOYLE, name: "石像鬼", description: "空中重甲單位，免疫毒素。", baseHp: 150, baseSpeed: 1.1, armor: 0.5, isFlying: true, reward: 12, visualColor: '#4b5563' },
  [EnemyType.BASILISK]: { type: EnemyType.BASILISK, name: "蛇雞獸", description: "目光能石化士兵，移動迅速。", baseHp: 180, baseSpeed: 1.4, armor: 0.1, isFlying: false, reward: 14, visualColor: '#059669' },
  [EnemyType.CULTIST]: { type: EnemyType.CULTIST, name: "虛空信徒", description: "狂熱的信徒，死亡時會自爆。", baseHp: 60, baseSpeed: 1.2, armor: 0, isFlying: false, reward: 5, visualColor: '#be185d' },
  [EnemyType.TREANT]: { type: EnemyType.TREANT, name: "腐化樹人", description: "極高的生命值與再生能力，畏火。", baseHp: 600, baseSpeed: 0.4, armor: 0.1, isFlying: false, reward: 25, visualColor: '#3f6212' },
  [EnemyType.SHADOW_STALKER]: { type: EnemyType.SHADOW_STALKER, name: "陰影獵手", description: "幾乎完全隱形，只有在攻擊時現身。", baseHp: 90, baseSpeed: 2.2, armor: 0, isFlying: false, reward: 15, visualColor: '#171717' },
  // --- BOSSES ---
  [EnemyType.TITAN]: { type: EnemyType.TITAN, name: "【精英】混沌泰坦", description: "擁有輻射光環。", baseHp: 2500, baseSpeed: 0.2, armor: 0.5, isFlying: false, reward: 100, visualColor: '#b45309' },
  [EnemyType.BOSS_DRAGON]: { type: EnemyType.BOSS_DRAGON, name: "【BOSS】末日魔龍", description: "空中的毀滅者，噴吐烈焰。", baseHp: 3000, baseSpeed: 0.6, armor: 0.4, isFlying: true, reward: 200, visualColor: '#dc2626' },
  [EnemyType.BOSS_LICH]: { type: EnemyType.BOSS_LICH, name: "【BOSS】巫妖王", description: "召喚不死軍團，免疫冰凍。", baseHp: 2500, baseSpeed: 0.4, armor: 0.2, isFlying: false, reward: 180, visualColor: '#60a5fa' },
  [EnemyType.BOSS_HYDRA]: { type: EnemyType.BOSS_HYDRA, name: "【BOSS】九頭蛇", description: "受傷後會快速分裂再生。", baseHp: 4000, baseSpeed: 0.3, armor: 0.1, isFlying: false, reward: 220, visualColor: '#15803d' },
  [EnemyType.BOSS_KRAKEN]: { type: EnemyType.BOSS_KRAKEN, name: "【BOSS】陸行海怪", description: "堅不可摧的外殼，極高護甲。", baseHp: 4500, baseSpeed: 0.2, armor: 0.8, isFlying: false, reward: 250, visualColor: '#0e7490' },
  [EnemyType.BOSS_FALLEN_ANGEL]: { type: EnemyType.BOSS_FALLEN_ANGEL, name: "【BOSS】墮落天使", description: "光與暗的結合，全屬性抗性。", baseHp: 3000, baseSpeed: 1.5, armor: 0.3, isFlying: true, reward: 300, visualColor: '#4c1d95' },
  [EnemyType.VOID_LORD]: { type: EnemyType.VOID_LORD, name: "【終焉】虛空領主", description: "最終BOSS。", baseHp: 8000, baseSpeed: 0.3, armor: 0.5, isFlying: true, reward: 500, visualColor: '#000000' }
};

// --- Tower Definitions (With Skills & Adjustments) ---
export const TOWER_DEFS: Record<TowerType, TowerDef> = {
  [TowerType.BARRACKS]: {
    id: 'barracks', type: TowerType.BARRACKS, name: '兵營', icon: '🛡️',
    t1: { name: '民兵營', damage: 20, range: 160, rate: 1000, cost: 70, description: '訓練3名民兵。', soldierHp: 200, soldierArmor: 0.1 },
    t2: { name: '步兵營', damage: 45, range: 180, rate: 900, cost: 160, description: '士兵更強。', soldierHp: 450, soldierArmor: 0.4 },
    t3Options: [
      { 
          name: '聖騎士大廳', damage: 100, range: 200, rate: 800, cost: 250, description: '極高護甲與治療能力。', soldierHp: 1200, soldierArmor: 0.8,
          skills: [
              { id: 'paladin_heal', name: '聖光術', description: '每 5 秒治療自己', baseCost: 150, maxLevel: 3, getEffectDesc: (lv) => `回復 ${lv * 100} HP` },
              { id: 'paladin_armor', name: '虔誠光環', description: '增加自身護甲', baseCost: 200, maxLevel: 3, getEffectDesc: (lv) => `護甲 +${lv * 5}%` }
          ]
      },
      { 
          name: '野蠻人路口', damage: 160, range: 200, rate: 600, cost: 230, description: '雙斧狂戰士，輸出高。', soldierHp: 700, soldierArmor: 0.2,
          skills: [
              { id: 'barb_whirl', name: '旋風斬', description: '機率造成範圍傷害', baseCost: 150, maxLevel: 3, getEffectDesc: (lv) => `${lv * 10}% 機率觸發` },
              { id: 'barb_throw', name: '飛斧', description: '對空攻擊能力', baseCost: 200, maxLevel: 3, getEffectDesc: (lv) => `射程 +${lv * 20}` }
          ]
      },
      { 
          name: '刺客公會', damage: 120, range: 220, rate: 500, cost: 240, description: '閃避與暴擊。', soldierHp: 550, soldierArmor: 0.3,
          skills: [
              { id: 'sin_dodge', name: '殘影', description: '增加閃避率', baseCost: 180, maxLevel: 3, getEffectDesc: (lv) => `閃避 +${lv * 15}%` },
              { id: 'sin_crit', name: '致命', description: '增加暴擊傷害', baseCost: 180, maxLevel: 3, getEffectDesc: (lv) => `暴傷 +${lv * 50}%` }
          ]
      }
    ]
  },
  [TowerType.ARCHER]: {
    id: 'archer', type: TowerType.ARCHER, name: '箭塔', icon: '🏹',
    t1: { name: '瞭望台', damage: 35, range: 130, rate: 900, cost: 100, description: '基礎遠程。', projectileType: ProjectileType.ARROW },
    t2: { name: '獵人小屋', damage: 80, range: 160, rate: 800, cost: 220, description: '傷害提升。', projectileType: ProjectileType.ARROW },
    t3Options: [
      { 
          name: '火槍手駐地', damage: 600, range: 300, rate: 2000, cost: 400, description: '超遠程狙擊，秒殺脆皮。', projectileType: ProjectileType.ARROW,
          skills: [
              { id: 'sniper_headshot', name: '爆頭', description: '機率造成即死(非BOSS)', baseCost: 250, maxLevel: 3, getEffectDesc: (lv) => `${lv * 2}% 機率秒殺` },
              { id: 'sniper_range', name: '高倍鏡', description: '大幅增加射程', baseCost: 200, maxLevel: 3, getEffectDesc: (lv) => `射程 +${lv * 50}` }
          ]
      },
      { 
          name: '精靈遊俠', damage: 60, range: 200, rate: 150, cost: 380, description: '超高攻速。', projectileType: ProjectileType.ARROW,
          skills: [
              { id: 'ranger_multi', name: '多重箭', description: '同時攻擊多個目標', baseCost: 300, maxLevel: 3, getEffectDesc: (lv) => `目標數 +${lv}` },
              { id: 'ranger_poison', name: '藤蔓毒素', description: '每次攻擊附加毒傷', baseCost: 200, maxLevel: 3, getEffectDesc: (lv) => `毒傷 ${lv * 5}/秒` }
          ]
      },
      { 
          name: '劇毒藤蔓', damage: 100, range: 150, rate: 700, cost: 350, description: '範圍毒霧與緩速。', projectileType: ProjectileType.MAGIC,
          skills: [
              { id: 'vine_slow', name: '麻痺毒素', description: '增加緩速效果', baseCost: 150, maxLevel: 3, getEffectDesc: (lv) => `緩速 +${lv * 10}%` },
              { id: 'vine_aoe', name: '毒爆', description: '敵人死亡時爆炸', baseCost: 200, maxLevel: 3, getEffectDesc: (lv) => `範圍傷害 ${lv * 50}` }
          ]
      }
    ]
  },
  [TowerType.MAGE]: {
    id: 'mage', type: TowerType.MAGE, name: '法師塔', icon: '🔮',
    t1: { name: '法師塔', damage: 70, range: 120, rate: 1400, cost: 120, description: '無視物理護甲。', projectileType: ProjectileType.MAGIC, armorIgnoreChance: 0.1 },
    t2: { name: '秘術塔', damage: 150, range: 150, rate: 1300, cost: 260, description: '強大的魔法攻擊。', projectileType: ProjectileType.MAGIC, armorIgnoreChance: 0.2 },
    t3Options: [
      { 
          name: '奧術巫師', damage: 400, range: 190, rate: 1800, cost: 500, description: '高傷射線，必定命中。', projectileType: ProjectileType.MAGIC, armorIgnoreChance: 0.5,
          skills: [
              { id: 'arcane_teleport', name: '傳送術', description: '將敵人傳送回起點', baseCost: 300, maxLevel: 3, getEffectDesc: (lv) => `${lv * 5}% 機率傳送` },
              { id: 'arcane_crit', name: '魔力超載', description: '魔法暴擊傷害', baseCost: 250, maxLevel: 3, getEffectDesc: (lv) => `暴擊率 +${lv * 10}%` }
          ]
      },
      { 
          name: '死靈法師', damage: 140, range: 160, rate: 1000, cost: 450, description: '召喚骷髏阻擋敵人。', projectileType: ProjectileType.MAGIC, armorIgnoreChance: 0.3,
          skills: [
              { id: 'necro_summon', name: '骷髏兵', description: '召喚骷髏戰士', baseCost: 200, maxLevel: 3, getEffectDesc: (lv) => `召喚 ${lv} 隻/10秒` },
              { id: 'necro_curse', name: '虛弱詛咒', description: '降低敵人攻擊力', baseCost: 150, maxLevel: 3, getEffectDesc: (lv) => `降攻 ${lv * 15}%` }
          ]
      },
      { 
          name: '元素召喚', damage: 200, range: 150, rate: 900, cost: 480, description: '召喚元素巨人。', projectileType: ProjectileType.MAGIC, armorIgnoreChance: 0.3,
          skills: [
              { id: 'ele_golem', name: '召喚土靈', description: '召喚強大土元素', baseCost: 350, maxLevel: 3, getEffectDesc: (lv) => `土靈血量 +${lv * 500}` },
              { id: 'ele_burn', name: '烈焰光環', description: '周圍敵人持續受傷', baseCost: 200, maxLevel: 3, getEffectDesc: (lv) => `燒傷 ${lv * 20}/秒` }
          ]
      }
    ]
  },
  [TowerType.CANNON]: {
    id: 'cannon', type: TowerType.CANNON, name: '砲塔', icon: '💣',
    t1: { name: '矮人火砲', damage: 80, range: 90, rate: 2200, cost: 140, description: '範圍爆炸。', projectileType: ProjectileType.BOMB, splashRadius: 60 },
    t2: { name: '重型榴彈砲', damage: 180, range: 110, rate: 2000, cost: 300, description: '更大爆炸範圍。', projectileType: ProjectileType.BOMB, splashRadius: 80 },
    t3Options: [
      { 
          name: '特斯拉線圈', damage: 250, range: 130, rate: 1500, cost: 550, description: '連鎖閃電攻擊多個目標。', projectileType: ProjectileType.MAGIC, splashRadius: 100,
          skills: [
              { id: 'tesla_chain', name: '超導', description: '增加彈跳次數', baseCost: 200, maxLevel: 3, getEffectDesc: (lv) => `彈跳 +${lv} 次` },
              { id: 'tesla_stun', name: '麻痺電擊', description: '機率暈眩敵人', baseCost: 250, maxLevel: 3, getEffectDesc: (lv) => `暈眩 ${lv * 0.5} 秒` }
          ]
      },
      { 
          name: '貝莎巨砲', damage: 700, range: 220, rate: 4000, cost: 600, description: '全地圖超遠程支援。', projectileType: ProjectileType.BOMB, splashRadius: 110,
          skills: [
              { id: 'bertha_nuke', name: '聚變彈頭', description: '大幅增加傷害', baseCost: 400, maxLevel: 3, getEffectDesc: (lv) => `傷害 +${lv * 200}` },
              { id: 'bertha_cluster', name: '集束炸彈', description: '分裂出小炸彈', baseCost: 300, maxLevel: 3, getEffectDesc: (lv) => `分裂 ${lv * 2} 枚` }
          ]
      },
      { 
          name: '戰鬥機甲', damage: 130, range: 100, rate: 600, cost: 580, description: '快速發射導彈風暴。', projectileType: ProjectileType.BOMB, splashRadius: 50,
          skills: [
              { id: 'mech_missile', name: '蜂群導彈', description: '發射更多導彈', baseCost: 250, maxLevel: 3, getEffectDesc: (lv) => `導彈 +${lv}` },
              { id: 'mech_armor', name: '合金裝甲', description: '機甲本體無敵', baseCost: 999, maxLevel: 1, getEffectDesc: (lv) => `裝飾技能` } 
          ]
      }
    ]
  },
  [TowerType.GOLD_MINE]: {
    id: 'gold_mine', type: TowerType.GOLD_MINE, name: '金礦', icon: '💰',
    t1: { name: '採礦場', damage: 0, range: 0, rate: 5000, cost: 200, description: '每 5 秒產出金幣。' }, 
    t2: { name: '深層礦井', damage: 0, range: 0, rate: 4500, cost: 350, description: '產量增加。' },
    t3Options: [
      { 
          name: '矮人銀行', damage: 0, range: 0, rate: 3500, cost: 600, description: '高效率產金(有上限)。',
          skills: [
              { id: 'bank_interest', name: '複利', description: '根據現有金幣增加產量(上限300g)', baseCost: 400, maxLevel: 3, getEffectDesc: (lv) => `額外 +${lv * 1}% 現金` },
              { id: 'bank_speed', name: '自動化', description: '加快生產速度', baseCost: 300, maxLevel: 3, getEffectDesc: (lv) => `速度 +${lv * 10}%` }
          ]
      },
      { 
          name: '黑市', damage: 0, range: 0, rate: 4000, cost: 500, description: '產錢並提供隨機Buff。',
          skills: [
              { id: 'market_discount', name: '貪婪', description: '擊殺賞金增加', baseCost: 300, maxLevel: 3, getEffectDesc: (lv) => `賞金 +${lv * 10}%` },
              { id: 'market_smuggle', name: '走私', description: '偶爾獲得稀有道具', baseCost: 500, maxLevel: 3, getEffectDesc: (lv) => `${lv * 5}% 機率` }
          ]
      },
      { 
          name: '寶石工坊', damage: 100, range: 9999, rate: 3000, cost: 550, description: '產出魔法寶石對全場造成傷害。',
          skills: [
              { id: 'gem_laser', name: '聚焦透鏡', description: '增加寶石傷害', baseCost: 250, maxLevel: 3, getEffectDesc: (lv) => `傷害 +${lv * 50}` },
              { id: 'gem_money', name: '點石成金', description: '攻擊時獲得金幣', baseCost: 300, maxLevel: 3, getEffectDesc: (lv) => `每次 +${lv * 2}g` }
          ]
      }
    ]
  },
  [TowerType.SUPPORT]: {
    id: 'support', type: TowerType.SUPPORT, name: '圖騰', icon: '🗿',
    t1: { name: '部落圖騰', damage: 0, range: 9999, rate: 0, cost: 150, description: '全圖防禦塔傷害 +10%。' },
    t2: { name: '戰爭戰鼓', damage: 0, range: 9999, rate: 0, cost: 300, description: '全圖防禦塔範圍 +10%。' },
    t3Options: [
      { 
          name: '嗜血圖騰', damage: 0, range: 9999, rate: 0, cost: 500, description: '大幅提升全場攻速。',
          skills: [
              { id: 'totem_speed', name: '狂熱', description: '進一步提升攻速', baseCost: 250, maxLevel: 3, getEffectDesc: (lv) => `攻速 +${lv * 5}%` },
              { id: 'totem_crit', name: '鮮血儀式', description: '給予防禦塔暴擊率', baseCost: 300, maxLevel: 3, getEffectDesc: (lv) => `暴擊 +${lv * 5}%` }
          ]
      },
      { 
          name: '恐懼圖騰', damage: 0, range: 9999, rate: 0, cost: 550, description: '全場敵人緩速。',
          skills: [
              { id: 'fear_slow', name: '泥沼', description: '強化緩速效果', baseCost: 200, maxLevel: 3, getEffectDesc: (lv) => `緩速 +${lv * 5}%` },
              { id: 'fear_weak', name: '虛弱', description: '降低敵人傷害', baseCost: 250, maxLevel: 3, getEffectDesc: (lv) => `降傷 ${lv * 10}%` }
          ]
      },
      { 
          name: '靈魂連結', damage: 0, range: 9999, rate: 0, cost: 600, description: '全場士兵生命提升。',
          skills: [
              { id: 'soul_hp', name: '強壯', description: '士兵生命值加成', baseCost: 200, maxLevel: 3, getEffectDesc: (lv) => `HP +${lv * 20}%` },
              { id: 'soul_regen', name: '癒合', description: '士兵獲得生命回復', baseCost: 250, maxLevel: 3, getEffectDesc: (lv) => `回血 ${lv * 5}/秒` }
          ]
      }
    ]
  }
};

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'potion', name: '生命藥水', cost: 500, icon: '❤️', description: '恢復 5 點生命值，英雄回滿血', effectType: 'HEAL' },
  { id: 'mana', name: '魔力充能', cost: 300, icon: '⚡', description: '立即重置英雄技能冷卻', effectType: 'MANA' },
  { id: 'fortify', name: '防禦工事', cost: 800, icon: '🛡️', description: '修復所有士兵，30秒內金幣獲取雙倍', effectType: 'FORTIFY' },
  { id: 'berserk', name: '狂暴藥劑', cost: 600, icon: '⚔️', description: '英雄攻擊力翻倍 (20秒)', effectType: 'BERSERK' },
  { id: 'freeze', name: '極地卷軸', cost: 700, icon: '❄️', description: '凍結全場敵人 8 秒', effectType: 'FREEZE' },
  { id: 'nuke', name: '戰術轟炸', cost: 1500, icon: '☢️', description: '全圖敵人扣除 50% 當前血量', effectType: 'NUKE' }
];

export const LEVELS: LevelConfig[] = [
  { 
      id: 0, name: "第零章：新兵訓練營", waves: 5, startMoney: 500, theme: { background: '#1e293b', pathColor: '#cbd5e1', decorationType: 'FOREST' }, 
      paths: [[{ x: 0, y: 200 }, { x: 200, y: 200 }, { x: 300, y: 100 }, { x: 500, y: 100 }, { x: 600, y: 300 }, { x: 800, y: 300 }]],
      buildSlots: [{ x: 100, y: 200 }, { x: 250, y: 150 }, { x: 400, y: 150 }, { x: 550, y: 250 }, { x: 700, y: 250 }]
  },
  {
    id: 1, name: "第一章：邊境烽火", waves: 9999, startMoney: 750, theme: { background: '#111827', pathColor: '#374151', decorationType: 'FOREST' }, 
    paths: [[{ x: 0, y: 150 }, { x: 100, y: 150 }, { x: 150, y: 100 }, { x: 250, y: 100 }, { x: 300, y: 180 }, { x: 250, y: 300 }, { x: 400, y: 320 }, { x: 500, y: 250 }, { x: 600, y: 250 }, { x: 650, y: 150 }, { x: 800, y: 150 }], [{ x: 0, y: 350 }, { x: 200, y: 350 }, { x: 250, y: 300 }, { x: 400, y: 320 }, { x: 500, y: 250 }, { x: 600, y: 250 }, { x: 650, y: 150 }, { x: 800, y: 150 }]],
    buildSlots: [{ x: 100, y: 220 }, { x: 180, y: 50 }, { x: 300, y: 50 }, { x: 350, y: 250 }, { x: 200, y: 250 }, { x: 450, y: 360 }, { x: 550, y: 180 }, { x: 550, y: 320 }, { x: 650, y: 80 }, { x: 700, y: 220 }, { x: 750, y: 80 }, { x: 50, y: 80 }, { x: 420, y: 150 }, { x: 250, y: 150 }, { x: 350, y: 150 }, { x: 150, y: 300 }]
  },
  { id: 2, name: "第二章：荒蕪之地", waves: 9999, startMoney: 900, theme: { background: '#272018', pathColor: '#574c3d', decorationType: 'DESERT' }, paths: [[{ x: 0, y: 80 }, { x: 200, y: 80 }, { x: 300, y: 130 }, { x: 450, y: 130 }, { x: 550, y: 80 }, { x: 800, y: 80 }], [{ x: 0, y: 320 }, { x: 200, y: 320 }, { x: 300, y: 270 }, { x: 450, y: 270 }, { x: 550, y: 320 }, { x: 800, y: 320 }], [{ x: 0, y: 200 }, { x: 150, y: 200 }, { x: 250, y: 100 }, { x: 450, y: 130 }, { x: 550, y: 250 }, { x: 700, y: 320 }, { x: 800, y: 320 }]], buildSlots: [{ x: 100, y: 40 }, { x: 100, y: 150 }, { x: 250, y: 60 }, { x: 250, y: 180 }, { x: 400, y: 60 }, { x: 400, y: 340 }, { x: 550, y: 40 }, { x: 550, y: 150 }, { x: 700, y: 40 }, { x: 700, y: 150 }, { x: 100, y: 250 }, { x: 100, y: 370 }, { x: 250, y: 350 }, { x: 550, y: 250 }, { x: 550, y: 370 }, { x: 700, y: 250 }, { x: 700, y: 370 }, { x: 350, y: 200 }] },
  { id: 3, name: "第三章：凜冬將至", waves: 9999, startMoney: 850, theme: { background: '#0c2444', pathColor: '#60a5fa', decorationType: 'SNOW' }, paths: [[{ x: 0, y: 100 }, { x: 300, y: 100 }, { x: 400, y: 200 }, { x: 800, y: 200 }], [{ x: 0, y: 300 }, { x: 300, y: 300 }, { x: 400, y: 200 }, { x: 800, y: 200 }], [{ x: 0, y: 50 }, { x: 200, y: 50 }, { x: 500, y: 50 }, { x: 600, y: 150 }, { x: 600, y: 250 }, { x: 800, y: 200 }]], buildSlots: [{ x: 150, y: 50 }, { x: 150, y: 150 }, { x: 150, y: 250 }, { x: 150, y: 350 }, { x: 350, y: 150 }, { x: 350, y: 250 }, { x: 500, y: 150 }, { x: 500, y: 250 }, { x: 650, y: 150 }, { x: 650, y: 250 }, { x: 300, y: 50 }, { x: 550, y: 80 }] },
  { id: 4, name: "第四章：烈焰深淵", waves: 9999, startMoney: 1000, theme: { background: '#2a0a0a', pathColor: '#7f1d1d', decorationType: 'LAVA' }, paths: [[{ x: 0, y: 50 }, { x: 150, y: 50 }, { x: 150, y: 350 }, { x: 650, y: 350 }, { x: 650, y: 50 }, { x: 800, y: 50 }], [{ x: 0, y: 150 }, { x: 100, y: 200 }, { x: 400, y: 200 }, { x: 700, y: 200 }, { x: 800, y: 150 }]], buildSlots: [{ x: 50, y: 120 }, { x: 250, y: 120 }, { x: 250, y: 280 }, { x: 400, y: 280 }, { x: 550, y: 280 }, { x: 550, y: 120 }, { x: 400, y: 200 }, { x: 400, y: 120 }] },
  { id: 5, name: "第五章：虛空之門", waves: 9999, startMoney: 1100, theme: { background: '#020617', pathColor: '#4c1d95', decorationType: 'VOID' }, paths: [[{ x: 0, y: 50 }, { x: 200, y: 50 }, { x: 400, y: 200 }, { x: 600, y: 350 }, { x: 800, y: 350 }], [{ x: 0, y: 100 }, { x: 300, y: 100 }, { x: 500, y: 300 }, { x: 800, y: 300 }], [{ x: 0, y: 300 }, { x: 300, y: 300 }, { x: 500, y: 100 }, { x: 800, y: 100 }]], buildSlots: [{ x: 100, y: 50 }, { x: 300, y: 50 }, { x: 500, y: 50 }, { x: 700, y: 50 }, { x: 100, y: 300 }, { x: 300, y: 300 }, { x: 500, y: 300 }, { x: 700, y: 300 }, { x: 200, y: 200 }, { x: 400, y: 200 }, { x: 600, y: 200 }, { x: 400, y: 100 }, { x: 400, y: 300 }] },
  { id: 6, name: "第六章：腐化沼澤", waves: 9999, startMoney: 1100, theme: { background: '#064e3b', pathColor: '#3f6212', decorationType: 'FOREST' }, paths: [[{ x: 0, y: 200 }, { x: 100, y: 100 }, { x: 200, y: 300 }, { x: 300, y: 100 }, { x: 400, y: 300 }, { x: 500, y: 100 }, { x: 600, y: 300 }, { x: 700, y: 100 }, { x: 800, y: 200 }]], buildSlots: [{ x: 100, y: 200 }, { x: 200, y: 200 }, { x: 300, y: 200 }, { x: 400, y: 200 }, { x: 500, y: 200 }, { x: 600, y: 200 }, { x: 700, y: 200 }, { x: 150, y: 50 }, { x: 350, y: 50 }, { x: 550, y: 50 }, { x: 250, y: 350 }, { x: 450, y: 350 }, { x: 650, y: 350 }] },
  { id: 7, name: "第七章：黃金迷宮", waves: 9999, startMoney: 1200, theme: { background: '#422006', pathColor: '#ca8a04', decorationType: 'DESERT' }, paths: [[{ x: 0, y: 100 }, { x: 200, y: 100 }, { x: 400, y: 200 }, { x: 600, y: 300 }, { x: 800, y: 300 }], [{ x: 0, y: 300 }, { x: 200, y: 300 }, { x: 400, y: 200 }, { x: 600, y: 100 }, { x: 800, y: 100 }]], buildSlots: [{ x: 400, y: 100 }, { x: 400, y: 300 }, { x: 200, y: 200 }, { x: 600, y: 200 }, { x: 100, y: 50 }, { x: 100, y: 350 }, { x: 700, y: 50 }, { x: 700, y: 350 }, { x: 300, y: 150 }, { x: 500, y: 150 }, { x: 300, y: 250 }, { x: 500, y: 250 }] },
  { id: 8, name: "第八章：雷霆之巔", waves: 9999, startMoney: 1250, theme: { background: '#1e1b4b', pathColor: '#818cf8', decorationType: 'VOID' }, paths: [[{ x: 0, y: 50 }, { x: 400, y: 50 }, { x: 600, y: 200 }, { x: 800, y: 200 }], [{ x: 0, y: 200 }, { x: 300, y: 200 }, { x: 600, y: 200 }, { x: 800, y: 200 }], [{ x: 0, y: 350 }, { x: 400, y: 350 }, { x: 600, y: 200 }, { x: 800, y: 200 }]], buildSlots: [{ x: 200, y: 125 }, { x: 400, y: 125 }, { x: 200, y: 275 }, { x: 400, y: 275 }, { x: 500, y: 100 }, { x: 500, y: 300 }, { x: 650, y: 100 }, { x: 650, y: 300 }, { x: 100, y: 100 }, { x: 100, y: 300 }, { x: 700, y: 200 }] },
  { id: 9, name: "第九章：天空堡壘", waves: 9999, startMoney: 1300, theme: { background: '#64748b', pathColor: '#94a3b8', decorationType: 'SNOW' }, paths: [[{ x: 0, y: 200 }, { x: 200, y: 200 }, { x: 300, y: 100 }, { x: 500, y: 100 }, { x: 600, y: 200 }, { x: 800, y: 200 }], [{ x: 0, y: 200 }, { x: 200, y: 200 }, { x: 300, y: 300 }, { x: 500, y: 300 }, { x: 600, y: 200 }, { x: 800, y: 200 }]], buildSlots: [{ x: 200, y: 100 }, { x: 200, y: 300 }, { x: 400, y: 200 }, { x: 600, y: 100 }, { x: 600, y: 300 }, { x: 300, y: 200 }, { x: 500, y: 200 }, { x: 100, y: 200 }, { x: 700, y: 200 }, { x: 350, y: 50 }, { x: 450, y: 350 }] },
  { id: 10, name: "第十章：水晶洞窟", waves: 9999, startMoney: 1350, theme: { background: '#312e81', pathColor: '#a5b4fc', decorationType: 'VOID' }, paths: [[{ x: 0, y: 50 }, { x: 100, y: 50 }, { x: 100, y: 350 }, { x: 200, y: 350 }, { x: 200, y: 50 }, { x: 300, y: 50 }, { x: 300, y: 350 }, { x: 400, y: 350 }, { x: 400, y: 50 }, { x: 500, y: 50 }, { x: 500, y: 350 }, { x: 600, y: 350 }, { x: 600, y: 50 }, { x: 700, y: 50 }, { x: 700, y: 350 }, { x: 800, y: 350 }]], buildSlots: [{ x: 150, y: 200 }, { x: 250, y: 200 }, { x: 350, y: 200 }, { x: 450, y: 200 }, { x: 550, y: 200 }, { x: 650, y: 200 }, { x: 50, y: 200 }, { x: 750, y: 200 }, { x: 150, y: 100 }, { x: 350, y: 300 }, { x: 550, y: 100 }] },
  { id: 11, name: "第十一章：深淵之底", waves: 9999, startMoney: 1400, theme: { background: '#000000', pathColor: '#4c1d95', decorationType: 'LAVA' }, paths: [[{ x: 0, y: 200 }, { x: 800, y: 200 }], [{ x: 400, y: 0 }, { x: 400, y: 400 }], [{ x: 0, y: 0 }, { x: 800, y: 400 }], [{ x: 0, y: 400 }, { x: 800, y: 0 }]], buildSlots: [{ x: 200, y: 150 }, { x: 200, y: 250 }, { x: 600, y: 150 }, { x: 600, y: 250 }, { x: 350, y: 100 }, { x: 450, y: 100 }, { x: 350, y: 300 }, { x: 450, y: 300 }, { x: 100, y: 200 }, { x: 700, y: 200 }, { x: 400, y: 50 }, { x: 400, y: 350 }] },
  { id: 12, name: "第十二章：機械城", waves: 9999, startMoney: 1400, theme: { background: '#262626', pathColor: '#f59e0b', decorationType: 'VOID' }, paths: [[{ x: 0, y: 100 }, { x: 700, y: 100 }, { x: 700, y: 300 }, { x: 100, y: 300 }, { x: 100, y: 200 }, { x: 800, y: 200 }]], buildSlots: [{ x: 50, y: 50 }, { x: 200, y: 50 }, { x: 350, y: 50 }, { x: 500, y: 50 }, { x: 650, y: 50 }, { x: 750, y: 150 }, { x: 50, y: 250 }, { x: 200, y: 250 }, { x: 350, y: 250 }, { x: 500, y: 250 }, { x: 650, y: 250 }] },
  { id: 13, name: "第十三章：死靈墓地", waves: 9999, startMoney: 1400, theme: { background: '#1c1917', pathColor: '#10b981', decorationType: 'SNOW' }, paths: [[{ x: 0, y: 50 }, { x: 200, y: 50 }, { x: 200, y: 350 }, { x: 400, y: 350 }, { x: 400, y: 50 }, { x: 600, y: 50 }, { x: 600, y: 350 }, { x: 800, y: 350 }]], buildSlots: [{ x: 100, y: 100 }, { x: 100, y: 300 }, { x: 300, y: 100 }, { x: 300, y: 300 }, { x: 500, y: 100 }, { x: 500, y: 300 }, { x: 700, y: 100 }, { x: 700, y: 300 }] },
  { id: 14, name: "第十四章：星界戰艦", waves: 9999, startMoney: 1450, theme: { background: '#0f172a', pathColor: '#0ea5e9', decorationType: 'VOID' }, paths: [[{ x: 0, y: 200 }, { x: 300, y: 200 }, { x: 400, y: 100 }, { x: 500, y: 200 }, { x: 800, y: 200 }], [{ x: 0, y: 200 }, { x: 300, y: 200 }, { x: 400, y: 300 }, { x: 500, y: 200 }, { x: 800, y: 200 }]], buildSlots: [{ x: 200, y: 150 }, { x: 200, y: 250 }, { x: 600, y: 150 }, { x: 600, y: 250 }, { x: 400, y: 50 }, { x: 400, y: 350 }, { x: 400, y: 200 }] },
  { id: 15, name: "第十五章：元素位面", waves: 9999, startMoney: 1450, theme: { background: '#4c0519', pathColor: '#f43f5e', decorationType: 'LAVA' }, paths: [[{ x: 0, y: 0 }, { x: 200, y: 200 }, { x: 400, y: 0 }, { x: 600, y: 200 }, { x: 800, y: 0 }], [{ x: 0, y: 400 }, { x: 200, y: 200 }, { x: 400, y: 400 }, { x: 600, y: 200 }, { x: 800, y: 400 }]], buildSlots: [{ x: 100, y: 100 }, { x: 300, y: 100 }, { x: 500, y: 100 }, { x: 700, y: 100 }, { x: 100, y: 300 }, { x: 300, y: 300 }, { x: 500, y: 300 }, { x: 700, y: 300 }, { x: 400, y: 200 }] },
  { id: 16, name: "第十六章：浮空島", waves: 9999, startMoney: 1500, theme: { background: '#0c4a6e', pathColor: '#bae6fd', decorationType: 'SNOW' }, paths: [[{ x: 0, y: 200 }, { x: 200, y: 100 }, { x: 400, y: 200 }, { x: 600, y: 300 }, { x: 800, y: 200 }], [{ x: 0, y: 200 }, { x: 200, y: 300 }, { x: 400, y: 200 }, { x: 600, y: 100 }, { x: 800, y: 200 }]], buildSlots: [{ x: 200, y: 200 }, { x: 600, y: 200 }, { x: 400, y: 100 }, { x: 400, y: 300 }, { x: 100, y: 100 }, { x: 100, y: 300 }, { x: 700, y: 100 }, { x: 700, y: 300 }] },
  { id: 17, name: "第十七章：鏡像迷宮", waves: 9999, startMoney: 1500, theme: { background: '#2e1065', pathColor: '#a78bfa', decorationType: 'VOID' }, paths: [[{ x: 0, y: 100 }, { x: 200, y: 100 }, { x: 200, y: 300 }, { x: 400, y: 300 }, { x: 400, y: 100 }, { x: 600, y: 100 }, { x: 600, y: 300 }, { x: 800, y: 300 }], [{ x: 800, y: 100 }, { x: 600, y: 100 }, { x: 600, y: 300 }, { x: 400, y: 300 }, { x: 400, y: 100 }, { x: 200, y: 100 }, { x: 200, y: 300 }, { x: 0, y: 300 }]], buildSlots: [{ x: 100, y: 200 }, { x: 300, y: 200 }, { x: 500, y: 200 }, { x: 700, y: 200 }, { x: 300, y: 50 }, { x: 500, y: 50 }, { x: 300, y: 350 }, { x: 500, y: 350 }] },
  { id: 18, name: "第十八章：混沌核心", waves: 9999, startMoney: 1550, theme: { background: '#450a0a', pathColor: '#ef4444', decorationType: 'LAVA' }, paths: [[{ x: 400, y: 0 }, { x: 400, y: 150 }, { x: 200, y: 200 }, { x: 400, y: 250 }, { x: 400, y: 400 }], [{ x: 0, y: 200 }, { x: 150, y: 200 }, { x: 200, y: 200 }, { x: 250, y: 200 }, { x: 400, y: 250 }, { x: 550, y: 200 }, { x: 600, y: 200 }, { x: 800, y: 200 }]], buildSlots: [{ x: 300, y: 100 }, { x: 500, y: 100 }, { x: 300, y: 300 }, { x: 500, y: 300 }, { x: 100, y: 100 }, { x: 700, y: 100 }, { x: 100, y: 300 }, { x: 700, y: 300 }] },
  { id: 19, name: "第十九章：終焉迴廊", waves: 9999, startMoney: 1600, theme: { background: '#000000', pathColor: '#ffffff', decorationType: 'VOID' }, paths: [[{ x: 0, y: 200 }, { x: 800, y: 200 }]], buildSlots: [{ x: 100, y: 150 }, { x: 200, y: 150 }, { x: 300, y: 150 }, { x: 400, y: 150 }, { x: 500, y: 150 }, { x: 600, y: 150 }, { x: 700, y: 150 }, { x: 100, y: 250 }, { x: 200, y: 250 }, { x: 300, y: 250 }, { x: 400, y: 250 }, { x: 500, y: 250 }, { x: 600, y: 250 }, { x: 700, y: 250 }] },
  { id: 20, name: "第二十章：神之試煉", waves: 9999, startMoney: 1650, theme: { background: '#fef3c7', pathColor: '#d97706', decorationType: 'DESERT' }, paths: [[{ x: 0, y: 0 }, { x: 800, y: 400 }], [{ x: 800, y: 0 }, { x: 0, y: 400 }]], buildSlots: [{ x: 400, y: 100 }, { x: 400, y: 300 }, { x: 200, y: 200 }, { x: 600, y: 200 }, { x: 200, y: 100 }, { x: 600, y: 100 }, { x: 200, y: 300 }, { x: 600, y: 300 }, { x: 100, y: 200 }, { x: 700, y: 200 }, { x: 400, y: 50 }, { x: 400, y: 350 }] },
  { id: 21, name: "第二十一章：扭曲維度", waves: 9999, startMoney: 1700, theme: { background: '#312e81', pathColor: '#a855f7', decorationType: 'VOID' }, paths: [[{ x: 0, y: 200 }, { x: 200, y: 50 }, { x: 400, y: 350 }, { x: 600, y: 50 }, { x: 800, y: 200 }]], buildSlots: [{ x: 200, y: 200 }, { x: 400, y: 200 }, { x: 600, y: 200 }, { x: 100, y: 100 }, { x: 300, y: 300 }, { x: 500, y: 100 }, { x: 700, y: 300 }] },
  { id: 22, name: "第二十二章：絕望深坑", waves: 9999, startMoney: 1750, theme: { background: '#27272a', pathColor: '#71717a', decorationType: 'LAVA' }, paths: [[{ x: 400, y: 0 }, { x: 400, y: 200 }, { x: 200, y: 200 }, { x: 200, y: 400 }], [{ x: 400, y: 0 }, { x: 400, y: 200 }, { x: 600, y: 200 }, { x: 600, y: 400 }]], buildSlots: [{ x: 300, y: 100 }, { x: 500, y: 100 }, { x: 300, y: 300 }, { x: 500, y: 300 }, { x: 100, y: 300 }, { x: 700, y: 300 }] },
  { id: 23, name: "第二十三章：時間迴廊", waves: 9999, startMoney: 1800, theme: { background: '#eab308', pathColor: '#fef08a', decorationType: 'DESERT' }, paths: [[{ x: 0, y: 100 }, { x: 800, y: 100 }], [{ x: 800, y: 300 }, { x: 0, y: 300 }]], buildSlots: [{ x: 100, y: 200 }, { x: 200, y: 200 }, { x: 300, y: 200 }, { x: 400, y: 200 }, { x: 500, y: 200 }, { x: 600, y: 200 }, { x: 700, y: 200 }, { x: 400, y: 50 }, { x: 400, y: 350 }] },
  { id: 24, name: "第二十四章：英靈殿", waves: 9999, startMoney: 1900, theme: { background: '#ffffff', pathColor: '#cbd5e1', decorationType: 'SNOW' }, paths: [[{ x: 0, y: 200 }, { x: 300, y: 200 }, { x: 400, y: 100 }, { x: 500, y: 200 }, { x: 800, y: 200 }], [{ x: 0, y: 200 }, { x: 300, y: 200 }, { x: 400, y: 300 }, { x: 500, y: 200 }, { x: 800, y: 200 }]], buildSlots: [{ x: 200, y: 100 }, { x: 200, y: 300 }, { x: 600, y: 100 }, { x: 600, y: 300 }, { x: 400, y: 200 }] },
  { id: 25, name: "第二十五章：虛空之心", waves: 9999, startMoney: 2000, theme: { background: '#000000', pathColor: '#ef4444', decorationType: 'VOID' }, paths: [[{ x: 400, y: 200 }, { x: 800, y: 200 }], [{ x: 400, y: 200 }, { x: 0, y: 200 }], [{ x: 400, y: 200 }, { x: 400, y: 0 }], [{ x: 400, y: 200 }, { x: 400, y: 400 }]], buildSlots: [{ x: 300, y: 100 }, { x: 500, y: 100 }, { x: 300, y: 300 }, { x: 500, y: 300 }] }
];
