
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, Hero, ActiveTower, Enemy, TowerType, ProjectileType, GameView, Soldier, EnemyType, Projectile, SelectedTalents, ActiveEvent, TowerDef, ShopItem } from '../types';
import { LEVELS, TOWER_DEFS, ENEMIES, SHOP_ITEMS, MAX_GLOBAL_SPEED_BUFF, MAX_TOTAL_SLOW, MAX_SLOW_STACKS, SLOW_DURATION_FRAMES, BANK_INTEREST_CAP, BASE_GROWTH_RATE, BASE_LINEAR, SOFT_CAP_START_WAVE, SOFT_GROWTH_FACTOR, ENEMY_GROWTH_MODIFIERS, TOTEM_BASE_SPEED, TOTEM_SPEED_PER_LEVEL, MAX_TOTEM_STACKS, MAX_TOTEM_TOTAL } from '../constants';
import { Play, Pause, Skull, RotateCcw, Crosshair, Zap, BookOpen, ArrowUp, Clock, Swords, Trophy, Home, ShoppingBag, Plus, AlertTriangle, X, LogOut, TrendingUp, BarChart, ShieldAlert, Bug, Hourglass, FastForward, MousePointer, HelpCircle } from 'lucide-react';
import Bestiary from './Bestiary';
import { HeroPortrait } from './HeroSelect';

interface GameLevelProps {
  levelId: number;
  hero: Hero;
  selectedTalents: SelectedTalents;
  onExit: () => void;
  onRetry: () => void;
  onLogoutAdmin: () => void;
  isAdminMode: boolean;
}

const FRAME_RATE = 60;
const PROJECTILE_SPEED = 8;
const AGGRO_RANGE = 90;
const ENGAGE_RANGE = 20;
const CHASE_SPEED = 5.5; 
const RETURN_SPEED = 3.0;
const LEASH_RANGE = 250; 

// Define shop cooldowns in seconds
const SHOP_COOLDOWNS: Record<string, number> = {
    'potion': 30,
    'mana': 45,
    'fortify': 60,
    'berserk': 60,
    'freeze': 45,
    'nuke': 90
};

const GameLevel: React.FC<GameLevelProps> = ({ levelId, hero, selectedTalents, onExit, onRetry, onLogoutAdmin, isAdminMode }) => {
  const levelConfig = LEVELS.find(l => l.id === levelId) || LEVELS[0];
  const pathEnd = levelConfig.paths[0][levelConfig.paths[0].length - 1]; 
  
  const getInitialHeroStats = () => {
      let stats = { ...hero.baseStats };
      // Apply T1 Stat Talents
      if (selectedTalents.t1 === 'rin_t1_hp') stats.hp += 500;
      if (selectedTalents.t1 === 'rin_t1_atk') stats.atk += 20; 
      if (selectedTalents.t1 === 'sakura_t1_dmg') stats.atk += 50;
      if (selectedTalents.t1 === 'sakura_t1_reload') stats.skillCooldown *= 0.75;
      if (selectedTalents.t1 === 'tamamo_t1_ap') stats.atk += 40; 
      if (selectedTalents.t1 === 'tamamo_t1_mp') stats.skillCooldown *= 0.7;
      if (selectedTalents.t1 === 'ibaraki_t1_armor') stats.armor += 0.3;
      if (selectedTalents.t1 === 'grom_t1_hp') stats.hp += 800;
      if (selectedTalents.t1 === 'kael_t1_dodge') stats.armor += 0.1; 
      if (selectedTalents.t1 === 'lyra_t1_mp') stats.skillCooldown *= 0.8;
      
      return { ...stats, maxHp: stats.hp };
  };

  const initialStats = getInitialHeroStats();

  const [gameState, setGameState] = useState<GameState>({
    money: isAdminMode ? 999999 : levelConfig.startMoney,
    lives: isAdminMode ? 9999 : 20,
    wave: 1,
    activeTowers: [],
    enemies: [],
    projectiles: [],
    particles: [],
    selectedHeroDef: hero,
    heroEntity: {
      x: pathEnd.x, 
      y: pathEnd.y, 
      hp: initialStats.hp,
      maxHp: initialStats.maxHp,
      isDead: false,
      respawnTimer: 0,
      state: 'IDLE',
      skillCooldownTimer: 0,
      isSkillActive: false,
      lastAttackTime: 0,
      talents: selectedTalents
    },
    skillEffect: null,
    gameSpeed: 1,
    isPaused: false,
    selectedTowerId: null,
    score: 0,
    view: GameView.PLAYING,
    enemiesKilled: 0,
    gameStartTime: Date.now(),
    goldBuffTimer: 0,
    activeEvent: null,
    totalGoldEarned: isAdminMode ? 999999 : levelConfig.startMoney,
    totalDamageDealt: 0,
    itemCooldowns: {},
    waveTimer: 60 * 60, // 60 seconds initial
    isAdmin: isAdminMode
  });

  const [buildMenuOpen, setBuildMenuOpen] = useState<{x: number, y: number} | null>(null);
  const [isSettingRally, setIsSettingRally] = useState(false); 
  const [isMovingHero, setIsMovingHero] = useState(false); 
  const [showBestiary, setShowBestiary] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [showBottomPanel, setShowBottomPanel] = useState(false);
  const [showTutorial, setShowTutorial] = useState(levelId === 0);
  
  // Admin UI State
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Sync Admin State from Prop
  useEffect(() => {
    setGameState(prev => ({ ...prev, isAdmin: isAdminMode }));
    if (!isAdminMode) setShowAdminPanel(false);
  }, [isAdminMode]);

  const waveStateRef = useRef({
      enemiesSpawned: 0,
      enemiesToSpawn: 10,
      spawnTimer: 0,
      waveCooldown: 0,
      bossSpawned: false,
      eventTriggered: false
  });

  const lastTimeRef = useRef<number>(0);
  const requestRef = useRef<number>(0);
  const lastWaveCallTime = useRef<number>(0);

  // Keyboard Event Listener for ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isShopOpen) {
            setIsShopOpen(false);
        } else if (showBestiary) {
            setShowBestiary(false);
        } else if (gameState.selectedTowerId || buildMenuOpen || showBottomPanel) {
            setGameState(prev => ({...prev, selectedTowerId: null}));
            setBuildMenuOpen(null);
            setShowBottomPanel(false);
            setIsSettingRally(false);
            setIsMovingHero(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isShopOpen, showBestiary, gameState.selectedTowerId, buildMenuOpen, showBottomPanel]);


  const isRangedHero = ['BOW', 'GUN', 'MAGIC', 'STAFF', 'ORB'].includes(hero.visualTheme.weaponType);
  let heroAttackRange = isRangedHero ? 180 : 30;
  if (selectedTalents.t1 === 'yuki_t1_range') heroAttackRange += 80;
  if (selectedTalents.t1 === 'vex_t1_range') heroAttackRange += 100;

  const getTowerStats = (tower: ActiveTower) => {
    const def = TOWER_DEFS[Object.values(TOWER_DEFS).find(d => d.id === tower.defId)!.type];
    if (tower.tier === 2) return def.t2;
    if (tower.tier === 3 && tower.t3Index !== undefined) return def.t3Options[tower.t3Index];
    return def.t1;
  };

  const getRallyPoint = (tower: ActiveTower, index: number) => {
      if (tower.rallyPoint) {
          const offsetX = (index % 3 - 1) * 15;
          const offsetY = (Math.floor(index / 3)) * 15;
          return { x: tower.rallyPoint.x + offsetX, y: tower.rallyPoint.y + offsetY };
      }
      const offsetX = (index - 1) * 20;
      const offsetY = 30 + (index % 2) * 10;
      return { x: tower.x + offsetX, y: tower.y + offsetY };
  };

  // Helper to calculate spawn point "behind" the start of the path
  const getSpawnPoint = useCallback((path: {x: number, y: number}[], offsetDistance: number) => {
      if (path.length < 2) return { x: path[0].x, y: path[0].y };
      const p0 = path[0];
      const p1 = path[1];
      const dx = p0.x - p1.x; // Vector pointing backwards from path direction
      const dy = p0.y - p1.y;
      const len = Math.sqrt(dx*dx + dy*dy);
      // Normalize and scale
      const offX = (dx / len) * offsetDistance;
      const offY = (dy / len) * offsetDistance;
      return { x: p0.x + offX, y: p0.y + offY };
  }, []);

  const createBoss = useCallback((wave: number, pathId: number, offset: number = 30) => {
       const path = levelConfig.paths[pathId];
       const bossTypes = [EnemyType.VOID_LORD, EnemyType.DEMON, EnemyType.GOLEM, EnemyType.BEHEMOTH, EnemyType.TITAN, EnemyType.BOSS_DRAGON, EnemyType.BOSS_LICH, EnemyType.BOSS_HYDRA, EnemyType.BOSS_KRAKEN, EnemyType.BOSS_FALLEN_ANGEL];
       
       let bossType = bossTypes[Math.floor(Math.random() * 5)]; // Early bosses
       if (wave > 20) bossType = bossTypes[Math.floor(Math.random() * bossTypes.length)]; // Any boss

       const def = ENEMIES[bossType];
       const scale = Math.pow(1.10, wave) + (wave * 0.5); 
       const spawnPos = getSpawnPoint(path, offset);

       return {
           id: `BOSS_${wave}_${Math.random()}`,
           defId: def.type,
           x: spawnPos.x,
           y: spawnPos.y,
           hp: Math.floor(def.baseHp * scale), 
           maxHp: Math.floor(def.baseHp * scale),
           speed: def.baseSpeed * 0.8,
           pathId: pathId,
           pathIndex: 0,
           isFlying: def.isFlying,
           freezeTime: 0,
           burnTime: 0,
           stunTime: 0,
           poisonTime: 0,
           isBlocked: false,
           blockedBy: null,
           isBoss: true
       };
  }, [levelConfig.paths, getSpawnPoint]);

  const buyItem = (itemId: string) => {
      const item = SHOP_ITEMS.find(i => i.id === itemId);
      if (!item) return;
      if (gameState.money < item.cost && !gameState.isAdmin) return;
      
      // Check Cooldown
      if (!gameState.isAdmin && gameState.itemCooldowns[itemId] > 0) return;

      setGameState(prev => {
          let updates: Partial<GameState> = { money: prev.money - item.cost };
          // Admin Cheat: Infinite Money
          if (prev.isAdmin) updates.money = 999999;
          
          let particles = [...prev.particles];
          let enemies = [...prev.enemies];
          
          // Set Cooldown
          const newCooldowns = { ...prev.itemCooldowns };
          if (!prev.isAdmin) {
              const cdTime = SHOP_COOLDOWNS[itemId] || 30;
              newCooldowns[itemId] = cdTime * 60; // Convert to frames
          }

          if (item.effectType === 'HEAL') {
              updates.lives = Math.min(prev.isAdmin ? 9999 : 20, prev.lives + 5); 
              if (prev.heroEntity) updates.heroEntity = { ...prev.heroEntity, hp: prev.heroEntity.maxHp, isDead: false };
              particles.push({ id: Math.random().toString(), x: 400, y: 200, life: 60, maxLife: 60, color: '#ef4444', radius: 100 });
          } else if (item.effectType === 'MANA') {
             if (prev.heroEntity) {
                 updates.heroEntity = { ...prev.heroEntity, skillCooldownTimer: 0 };
                 particles.push({ id: Math.random().toString(), x: prev.heroEntity.x, y: prev.heroEntity.y, life: 60, maxLife: 60, color: '#3b82f6', radius: 50 });
             }
          } else if (item.effectType === 'FORTIFY') {
             updates.goldBuffTimer = 1800; // 30s @ 60fps
             const newTowers = prev.activeTowers.map(t => {
                 if (t.defId === 'barracks') {
                     const healedSoldiers = t.soldiers.map(s => ({...s, hp: s.maxHp, isDead: false, respawnTime: 0}));
                     return { ...t, soldiers: healedSoldiers };
                 }
                 return t;
             });
             updates.activeTowers = newTowers;
          } else if (item.effectType === 'BERSERK') {
              particles.push({ id: Math.random().toString(), x: prev.heroEntity?.x || 400, y: prev.heroEntity?.y || 200, life: 60, maxLife: 60, color: '#ef4444', radius: 80 });
          } else if (item.effectType === 'FREEZE') {
              enemies = enemies.map(e => ({...e, freezeTime: 480}));
          } else if (item.effectType === 'NUKE') {
              enemies = enemies.map(e => ({...e, hp: e.hp * 0.5}));
              particles.push({ id: Math.random().toString(), x: 400, y: 200, life: 60, maxLife: 60, color: '#fbbf24', radius: 1000 });
          }
          
          return { ...prev, ...updates, particles, enemies, itemCooldowns: newCooldowns };
      });
  };

  const renderMapDecorations = () => {
    const type = levelConfig.theme.decorationType;
    const decorations = [];
    const seed = levelConfig.id * 100;

    for (let i = 0; i < 40; i++) {
        const x = (Math.sin(seed + i * 1.3) * 400) + 400; 
        const y = (Math.cos(seed + i * 1.7) * 200) + 200; 
        let tooClose = false;
        levelConfig.paths.forEach(path => {
            path.forEach(p => {
                if (Math.sqrt((p.x - x)**2 + (p.y - y)**2) < 40) tooClose = true;
            });
        });
        if (tooClose) continue;

        if (type === 'FOREST') {
            decorations.push(
                <g key={`d-${i}`} transform={`translate(${x},${y})`}>
                    <circle r={14 + (i%5)} fill="#0f3923" opacity="0.4" />
                    <circle r={10 + (i%3)} fill="#14532d" opacity="0.6" />
                </g>
            );
        } else if (type === 'DESERT') {
            decorations.push(
                <g key={`d-${i}`} transform={`translate(${x},${y})`}>
                     <path d="M-5,10 L0,-10 L5,10 Z" fill="#78350f" opacity="0.4"/>
                </g>
            );
        } else if (type === 'SNOW') {
            decorations.push(
                <g key={`d-${i}`} transform={`translate(${x},${y})`}>
                    <circle r={5} fill="white" opacity="0.15" />
                </g>
            );
        } else if (type === 'LAVA') {
             decorations.push(
                <g key={`d-${i}`} transform={`translate(${x},${y})`}>
                    <circle r={8 + (i%6)} fill="#dc2626" opacity="0.15" className="animate-pulse" />
                </g>
            );
        } else if (type === 'VOID') {
             decorations.push(
                <g key={`d-${i}`} transform={`translate(${x},${y})`}>
                    <rect width="10" height="10" fill="#4c1d95" opacity="0.15" transform={`rotate(${i*25})`} />
                </g>
            );
        }
    }
    return decorations;
  };

  const activateHeroSkill = () => {
    if (!gameState.heroEntity || gameState.heroEntity.isDead || gameState.heroEntity.skillCooldownTimer > 0) return;
    
    setGameState(prev => {
        const heroEnt = prev.heroEntity!;
        const enemies = [...prev.enemies];
        let towers = [...prev.activeTowers];
        const particles = [...prev.particles];
        const newHero = { ...heroEnt, skillCooldownTimer: initialStats.skillCooldown * 60, isSkillActive: true };
        const t3 = heroEnt.talents.t3;
        
        let skillEffect = null;
        let totalSkillDamage = 0;

        // Apply Cooldown Event Reduction immediately
        if (prev.activeEvent?.type === 'HERO_CD') {
            newHero.skillCooldownTimer *= 0.5; // Start at 50% cooldown
        }

        // Buffed Ult Damages
        switch (hero.id) {
            case 'h_rin': // Rin - Fire Slash
                skillEffect = { type: 'RIN_BLAST', timer: 60, x: heroEnt.x, y: heroEnt.y };
                enemies.forEach(e => {
                     const dist = Math.sqrt((e.x - heroEnt.x)**2 + (e.y - heroEnt.y)**2);
                     if (dist < 250) { 
                         e.hp -= 2000;
                         totalSkillDamage += 2000;
                         e.stunTime += 300; 
                         particles.push({ id: Math.random().toString(), x: e.x, y: e.y, life: 30, maxLife: 30, color: '#ef4444', radius: 10 });
                     }
                });
                break;
            case 'h_yuki': // Yuki - Arrow Rain
                const duration = t3 === 'yuki_t3_ult' ? 240 : 120; 
                skillEffect = { type: 'YUKI_RAIN', timer: duration, x: 400, y: 0 };
                enemies.forEach(e => {
                    if (e.hp > 0) {
                        e.hp -= 200; // Multi-hit
                        totalSkillDamage += 200;
                        if (t3 === 'yuki_t3_ult') e.freezeTime += 180;
                        particles.push({ id: Math.random().toString(), x: e.x, y: e.y - 20, life: 20, maxLife: 20, color: '#60a5fa', radius: 8 });
                    }
                });
                break;
            case 'h_sakura': // Sakura - Nuke
                const target = enemies.reduce((prev, current) => (prev.hp > current.hp) ? prev : current, enemies[0]);
                if (target) {
                    skillEffect = { type: 'SAKURA_LASER', timer: 40, x: heroEnt.x, y: heroEnt.y };
                    if (t3 === 'sakura_t3_ult') {
                        for(let i=0; i<3; i++) {
                            const t = enemies[Math.floor(Math.random()*enemies.length)];
                            if(t) {
                                t.hp -= 5000;
                                totalSkillDamage += 5000;
                                particles.push({ id: Math.random().toString(), x: t.x, y: t.y, life: 60, maxLife: 60, color: '#db2777', radius: 100 });
                            }
                        }
                    } else {
                        const range = 200;
                        enemies.forEach(e => {
                             const dist = Math.sqrt((e.x - target.x)**2 + (e.y - target.y)**2);
                             if (dist < range) { 
                                 e.hp -= 5000; 
                                 totalSkillDamage += 5000;
                             }
                        });
                        particles.push({ id: Math.random().toString(), x: target.x, y: target.y, life: 60, maxLife: 60, color: '#db2777', radius: range });
                    }
                }
                break;
            case 'h_tamamo': // Tamamo - Slow + DoT
                skillEffect = { type: 'TAMAMO_FOG', timer: 300, x: 400, y: 200 };
                enemies.forEach(e => {
                     e.burnTime += 300;
                     e.freezeTime += 480; 
                     e.hp -= 2000;
                     totalSkillDamage += 2000;
                });
                break;
            case 'h_ibaraki': // Ibaraki - Hand Crush
                skillEffect = { type: 'IBARAKI_HAND', timer: 50, x: heroEnt.x, y: heroEnt.y };
                newHero.hp = Math.min(newHero.maxHp, newHero.hp + 2000);
                enemies.forEach(e => {
                    const dist = Math.sqrt((e.x - heroEnt.x)**2 + (e.y - heroEnt.y)**2);
                    if (dist < 300) { 
                        e.hp -= 3000; 
                        totalSkillDamage += 3000;
                    }
                });
                break;
            case 'h_kael': // Kael - Omnislash
                skillEffect = { type: 'KAEL_WIND', timer: 30, x: heroEnt.x, y: heroEnt.y };
                for(let i=0; i<15; i++) {
                    const t = enemies[Math.floor(Math.random()*enemies.length)];
                    if (t) {
                        t.hp -= 350; 
                        totalSkillDamage += 350;
                        particles.push({ id: Math.random().toString(), x: t.x, y: t.y, life: 20, maxLife: 20, color: '#10b981', radius: 20 });
                    }
                }
                break;
            case 'h_lyra': // Lyra - Heal + Speed
                skillEffect = { type: 'LYRA_LIGHT', timer: 120, x: 400, y: 200 };
                towers.forEach(t => {
                    if (t.defId === 'barracks') {
                        t.soldiers.forEach(s => { s.hp = s.maxHp; s.isDead = false; });
                    }
                });
                newHero.hp = newHero.maxHp;
                break;
            case 'h_grom': // Grom - Quake
                skillEffect = { type: 'GROM_QUAKE', timer: 60, x: heroEnt.x, y: heroEnt.y };
                enemies.forEach(e => {
                    e.stunTime += 480; 
                    e.hp -= 1500;
                    totalSkillDamage += 1500;
                    // Armor strip
                });
                break;
            case 'h_vex': // Vex - Black Hole
                skillEffect = { type: 'VEX_VOID', timer: 180, x: 400, y: 200 };
                enemies.forEach(e => {
                    const dist = Math.sqrt((e.x - 400)**2 + (e.y - 200)**2);
                    if (dist < 400) {
                        const dmg = e.maxHp * 0.05;
                        e.hp -= dmg; // % Max HP
                        totalSkillDamage += dmg;
                        e.x += (400 - e.x) * 0.15; 
                        e.y += (200 - e.y) * 0.15;
                    }
                });
                break;
        }

        return { 
            ...prev, 
            heroEntity: newHero, 
            enemies: enemies, 
            activeTowers: towers, 
            particles: particles, 
            skillEffect: skillEffect as any,
            totalDamageDealt: prev.totalDamageDealt + totalSkillDamage
        };
    });

    setTimeout(() => {
        setGameState(p => ({...p, heroEntity: {...p.heroEntity!, isSkillActive: false}}));
    }, 1000);
  };

  const renderSkillEffect = () => {
      const effect = gameState.skillEffect;
      if (!effect) return null;
      // Reduced Opacity for visual clarity
      switch(effect.type) {
          case 'RIN_BLAST':
              return (
                  <g>
                      <circle cx={effect.x} cy={effect.y} r={250 - effect.timer * 3} fill="#ef4444" opacity={(effect.timer/60) * 0.4} />
                      <path d={`M${effect.x - 100} ${effect.y} Q${effect.x} ${effect.y - 150} ${effect.x + 100} ${effect.y} Q${effect.x} ${effect.y + 150} ${effect.x - 100} ${effect.y}`} fill="none" stroke="#fbbf24" strokeWidth="4" className="animate-spin-slow origin-center" style={{transformOrigin: `${effect.x}px ${effect.y}px`}}/>
                  </g>
              );
          case 'YUKI_RAIN':
              return (
                  <g>
                      {Array.from({length: 10}).map((_, i) => (
                          <rect key={i} x={Math.random() * 800} y={Math.random() * 400} width="2" height="40" fill="#60a5fa" opacity="0.3" transform={`rotate(15)`} />
                      ))}
                  </g>
              )
          case 'SAKURA_LASER':
              return (
                  <g>
                      <circle cx={effect.x} cy={effect.y} r={200} fill="#db2777" opacity={0.3} />
                      <line x1={effect.x} y1="0" x2={effect.x} y2="400" stroke="#db2777" strokeWidth="2" opacity="0.5" />
                      <line x1="0" y1={effect.y} x2="800" y2={effect.y} stroke="#db2777" strokeWidth="2" opacity="0.5" />
                  </g>
              )
          case 'TAMAMO_FOG':
              return <rect x="0" y="0" width="800" height="400" fill="#7c3aed" opacity="0.15" />
          case 'IBARAKI_HAND':
              return <circle cx={effect.x} cy={effect.y} r={150} fill="#7f1d1d" opacity="0.3" />
          case 'KAEL_WIND':
               return <circle cx={effect.x} cy={effect.y} r={100} fill="none" stroke="#10b981" strokeWidth="4" className="animate-ping" opacity="0.3" />
          case 'LYRA_LIGHT':
               return <rect x="0" y="0" width="800" height="400" fill="#fcd34d" opacity="0.1" />
          case 'GROM_QUAKE':
              return <circle cx={effect.x} cy={effect.y} r={200} fill="none" stroke="#57534e" strokeWidth="10" opacity="0.3" className="animate-ping" />
          case 'VEX_VOID':
               return <circle cx={400} cy={200} r={effect.timer} fill="black" opacity="0.2" />
      }
      return null;
  };

  const upgradeTower = (towerId: string, t3Index?: number) => {
      setGameState(prev => {
          const towerIndex = prev.activeTowers.findIndex(t => t.id === towerId);
          if (towerIndex === -1) return prev;
          
          const tower = prev.activeTowers[towerIndex];
          const def = TOWER_DEFS[Object.values(TOWER_DEFS).find(d => d.id === tower.defId)!.type];
          
          let cost = 0;
          let newTier: 1 | 2 | 3 = tower.tier;
          let soldiers = tower.soldiers;
          
          if (tower.tier === 1) {
              cost = def.t2.cost;
              newTier = 2;
          } else if (tower.tier === 2 && t3Index !== undefined) {
              cost = def.t3Options[t3Index].cost;
              newTier = 3;
          }
          
          if (prev.money < cost && !prev.isAdmin) return prev;
          
          // Re-init soldiers if upgrade
          if (def.type === TowerType.BARRACKS) {
              // Apply new stats to existing soldiers on respawn, but maybe refresh alive ones?
              // For simplicity, just update their maxHP reference in update loop.
          }

          const updatedTowers = [...prev.activeTowers];
          updatedTowers[towerIndex] = {
              ...tower,
              tier: newTier,
              t3Index: t3Index,
              level: tower.level + 1,
              totalInvestment: tower.totalInvestment + cost,
              soldiers: soldiers
          };

          return {
              ...prev,
              money: prev.isAdmin ? 999999 : prev.money - cost,
              activeTowers: updatedTowers
          };
      });
  };

  const upgradeSkill = (towerId: string, skillId: string, cost: number) => {
      setGameState(prev => {
          if (prev.money < cost && !prev.isAdmin) return prev;
          const tIndex = prev.activeTowers.findIndex(t => t.id === towerId);
          if (tIndex === -1) return prev;

          const towers = [...prev.activeTowers];
          const tower = towers[tIndex];
          const currentLevel = tower.skillLevels[skillId] || 0;
          
          if (currentLevel >= 3) return prev;

          towers[tIndex] = {
              ...tower,
              skillLevels: { ...tower.skillLevels, [skillId]: currentLevel + 1 },
              totalInvestment: tower.totalInvestment + cost
          };

          return { ...prev, money: prev.isAdmin ? 999999 : prev.money - cost, activeTowers: towers };
      });
  };

  const getWaveEnemyType = (wave: number): EnemyType => {
      const allTypes = Object.values(EnemyType).filter(t => !t.startsWith('BOSS') && t !== EnemyType.VOID_LORD && t !== EnemyType.TITAN);
      if (wave > 30) return allTypes[Math.floor(Math.random() * allTypes.length)];
      if (wave <= 2) return EnemyType.SLIME;
      if (wave <= 4) return EnemyType.GOBLIN;
      if (wave <= 6) return EnemyType.WOLF;
      if (wave <= 8) return EnemyType.ORC;
      if (wave <= 10) return EnemyType.HARPY;
      if (wave <= 12) return EnemyType.CULTIST; 
      if (wave <= 14) return EnemyType.SPIDER;
      if (wave <= 16) return EnemyType.GHOST;
      if (wave <= 18) return EnemyType.BASILISK; 
      if (wave <= 20) return EnemyType.GARGOYLE; 
      if (wave <= 22) return EnemyType.NECROMANCER;
      if (wave <= 24) return EnemyType.ARMORED_KNIGHT;
      if (wave <= 26) return EnemyType.SHADOW_STALKER; 
      if (wave <= 28) return EnemyType.TREANT; 
      return allTypes[Math.floor(Math.random() * allTypes.length)];
  };

  const spawnEnemy = (wave: number, pathId: number, path: {x: number, y: number}[], offsetDistance: number = 30) => {
      const typeToSpawn = getWaveEnemyType(wave);
      const def = ENEMIES[typeToSpawn];
      // --- Enemy scaling with conservative base, soft cap, and per-type modifiers ---
      // Conservative base: exponential * linear
      const baseScale = Math.pow(BASE_GROWTH_RATE, wave) + (wave * BASE_LINEAR);
      let scale = baseScale;

      // Apply soft cap smoothing after SOFT_CAP_START_WAVE
      if (wave > SOFT_CAP_START_WAVE) {
          const baseAtSoft = Math.pow(BASE_GROWTH_RATE, SOFT_CAP_START_WAVE) + (SOFT_CAP_START_WAVE * BASE_LINEAR);
          scale = baseAtSoft + (baseScale - baseAtSoft) * SOFT_GROWTH_FACTOR;
      }

      // Per-type modifier reduces growth for especially strong units
      const typeModifier = ENEMY_GROWTH_MODIFIERS[typeToSpawn] || 1.0;
      scale = scale * typeModifier;
      
      const spawnPos = getSpawnPoint(path, offsetDistance);

      return {
          id: `e_${wave}_${Math.random()}`,
          defId: def.type,
          x: spawnPos.x,
          y: spawnPos.y,
          hp: Math.floor(def.baseHp * scale),
          maxHp: Math.floor(def.baseHp * scale),
          speed: def.baseSpeed,
          pathId: pathId,
          pathIndex: 0,
          isFlying: def.isFlying,
          freezeTime: 0,
          slowPercent: 0,
          slowStacks: 0,
          slowTime: 0,
          burnTime: 0,
          stunTime: 0,
          poisonTime: 0,
          isBlocked: false,
          blockedBy: null
      };
  };

  const adminSpawnEnemy = (type: EnemyType) => {
        setGameState(prev => {
            const pathId = Math.floor(Math.random() * levelConfig.paths.length);
            const path = levelConfig.paths[pathId];
            const def = ENEMIES[type];
            // Use current wave scaling so they aren't insta-killed
            const scale = Math.pow(1.10, prev.wave) + (prev.wave * 0.5); 
            const spawnPos = getSpawnPoint(path, 30);
            
            const newEnemy: Enemy = {
                id: `admin_e_${Date.now()}_${Math.random()}`,
                defId: def.type,
                x: spawnPos.x,
                y: spawnPos.y,
                hp: Math.floor(def.baseHp * scale),
                maxHp: Math.floor(def.baseHp * scale),
                speed: def.baseSpeed,
                pathId: pathId,
                pathIndex: 0,
                isFlying: def.isFlying,
                freezeTime: 0,
                slowPercent: 0,
                slowStacks: 0,
                slowTime: 0,
                burnTime: 0,
                stunTime: 0,
                poisonTime: 0,
                isBlocked: false,
                blockedBy: null,
                isBoss: type.startsWith('BOSS') || type === EnemyType.VOID_LORD || type === EnemyType.TITAN
            };
            return { ...prev, enemies: [...prev.enemies, newEnemy] };
        });
  };

  const adminKillAll = () => {
      setGameState(prev => {
          const particles: any[] = [];
          prev.enemies.forEach(e => {
              particles.push({ id: Math.random().toString(), x: e.x, y: e.y, life: 30, maxLife: 30, color: '#ef4444', radius: 20 });
              particles.push({ id: `txt_${Math.random()}`, x: e.x, y: e.y, life: 40, maxLife: 40, color: '#fff', radius: 0, text: 'CLEARED' });
          });
          return { ...prev, enemies: [], particles: [...prev.particles, ...particles] };
      });
  };

  const callNextWave = useCallback(() => {
      const now = Date.now();
      // No cooldown logic here for functionality, only debounce
      if (now - lastWaveCallTime.current < 200) return; 
      lastWaveCallTime.current = now;
      
      setGameState(prev => {
          // Check if max waves reached to prevent skipping logic
          if (prev.wave >= levelConfig.waves) return prev;

          let newEnemies = [...prev.enemies];
          const currentWaveRemaining = waveStateRef.current.enemiesToSpawn - waveStateRef.current.enemiesSpawned;
          let loopCount = currentWaveRemaining;

          // Check if we need to spawn a boss for the CURRENT wave being burst
          if (prev.wave % 10 === 0 && !waveStateRef.current.bossSpawned && loopCount > 0) {
              const pathId = Math.floor(Math.random() * levelConfig.paths.length);
              const boss = createBoss(prev.wave, pathId, 30);
              newEnemies.push(boss);
              loopCount--; // Boss takes up one spawn slot
          }
          
          if (loopCount > 0) {
              for (let i = 0; i < loopCount; i++) {
                  const pathId = Math.floor(Math.random() * levelConfig.paths.length);
                  const path = levelConfig.paths[pathId];
                  const offset = 30 + (i * 25); 
                  const enemy = spawnEnemy(prev.wave, pathId, path, offset);
                  newEnemies.push(enemy);
              }
          }
          
          // Bonus money for rushing wave
          const rushBonus = 50 + (prev.wave * 5);
          
          // Reset Wave Timer
          const nextTimer = Math.max(20, 60 - (prev.wave * 1)) * 60;

          // Update Ref for next wave immediately
          const nextWave = prev.wave + 1;
          waveStateRef.current.enemiesToSpawn = 10 + Math.floor(nextWave * 1.5);
          waveStateRef.current.spawnTimer = 0;
          waveStateRef.current.enemiesSpawned = 0;
          waveStateRef.current.waveCooldown = 0;
          waveStateRef.current.bossSpawned = false;
          waveStateRef.current.eventTriggered = false;

          return {
              ...prev,
              enemies: newEnemies,
              money: prev.money + rushBonus, 
              totalGoldEarned: prev.totalGoldEarned + rushBonus,
              wave: nextWave,
              waveTimer: nextTimer
          };
      });
  }, [gameState.wave, levelConfig, createBoss, levelId]);

  const updateGame = useCallback((time: number) => {
    if (gameState.isPaused || gameState.view === GameView.GAME_OVER || gameState.view === GameView.VICTORY || showBestiary) {
      lastTimeRef.current = time;
      requestRef.current = requestAnimationFrame(updateGame);
      return;
    }

    const deltaTime = time - lastTimeRef.current;
    
    if (deltaTime > 1000 / FRAME_RATE) {
      setGameState(prev => {
        const now = Date.now();
        let newMoney = prev.money;
        let newLives = prev.lives;
        const gameSpeed = prev.gameSpeed;
        
        // ADMIN CHEATS
        if (prev.isAdmin) {
            newMoney = 999999;
            newLives = 9999;
        }

        let newWave = prev.wave;
        let newProjectiles = [...prev.projectiles];
        let newParticles = prev.particles.map(p => ({...p, life: p.life - (1 * gameSpeed)})).filter(p => p.life > 0);
        let newTowers = [...prev.activeTowers];
        let currentEnemies = [...prev.enemies];
        let newEnemiesKilled = prev.enemiesKilled || 0;
        let skillEffect = prev.skillEffect;
        let goldBuff = prev.goldBuffTimer;
        let activeEvent = prev.activeEvent;
        let newTotalGoldEarned = prev.totalGoldEarned;
        let newTotalDamageDealt = prev.totalDamageDealt;
        let newWaveTimer = prev.waveTimer;
        
        // Only decrement wave timer if not at max wave and tutorial is not showing
        // This prevents the tutorial level from auto-starting waves before the player hits Start
        if (newWave < levelConfig.waves && !showTutorial) {
            newWaveTimer = prev.waveTimer - (1 * gameSpeed);
        }
        
        // Item Cooldowns
        let newItemCooldowns = { ...prev.itemCooldowns };
        Object.keys(newItemCooldowns).forEach(key => {
            if (newItemCooldowns[key] > 0) newItemCooldowns[key] = Math.max(0, newItemCooldowns[key] - (1 * gameSpeed));
        });

        const towerDamageUpdates = new Map<string, number>();
        const towerKillUpdates = new Map<string, number>();

        if (goldBuff > 0) goldBuff = Math.max(0, goldBuff - (1 * gameSpeed));
        
        if (skillEffect) {
            skillEffect = { ...skillEffect, timer: skillEffect.timer - (1 * gameSpeed) };
            if (skillEffect.timer <= 0) skillEffect = null;
        }

        // --- GLOBAL SKILL BUFFS CALCULATION ---
        let globalRangeBuff = 1.0;
        let globalDamageBuff = 1.0;
        let globalSpeedBuff = 1.0;
        let globalSoldierHpBuff = 1.0;
        let globalCritChance = 0;
        let globalEnemySlow = 0; // % Slow from towers
        let globalDamageReduction = 0; // % Weakness

        // Collect totem (t3Index===0) contributions separately so we can cap stacks
        const totemContributions: number[] = [];
        newTowers.forEach(t => {
            const def = TOWER_DEFS[Object.values(TOWER_DEFS).find(d => d.id === t.defId)!.type];
            if (def.type === TowerType.SUPPORT) {
                if (t.tier >= 1) globalDamageBuff += 0.1;
                if (t.tier >= 2) globalRangeBuff += 0.1;
                if (t.tier === 3) {
                    if (t.t3Index === 0) {
                        const contrib = TOTEM_BASE_SPEED + (t.skillLevels['totem_speed'] || 0) * TOTEM_SPEED_PER_LEVEL;
                        totemContributions.push(contrib);
                        globalCritChance += (t.skillLevels['totem_crit'] || 0) * 0.05;
                    }
                    if (t.t3Index === 1) {
                         globalEnemySlow += 0.2 + (t.skillLevels['fear_slow'] || 0) * 0.05;
                         globalDamageReduction += 0.1 + (t.skillLevels['fear_weak'] || 0) * 0.1;
                    }
                    if (t.t3Index === 2) {
                        globalSoldierHpBuff += 0.2;
                        globalSoldierHpBuff += (t.skillLevels['soul_hp'] || 0) * 0.2;
                    }
                }
            }
        });
        if (totemContributions.length > 0) {
            totemContributions.sort((a, b) => b - a);
            const applied = totemContributions.slice(0, MAX_TOTEM_STACKS).reduce((s, v) => s + v, 0);
            globalSpeedBuff += Math.min(applied, MAX_TOTEM_TOTAL);
        }

        // Clamp some global values to keep balance
        globalSpeedBuff = Math.min(globalSpeedBuff, MAX_GLOBAL_SPEED_BUFF);
        globalEnemySlow = Math.min(globalEnemySlow, MAX_TOTAL_SLOW);
        if (skillEffect?.type === 'LYRA_LIGHT') globalSpeedBuff += 1.0;

        // --- WAVE LOGIC: Timer Check inside State Update for Atomicity ---
        // Fix for bug where timer hits 0 but nothing happens
        if (newWaveTimer <= 0 && newWave < levelConfig.waves) {
             // Trigger Next Wave Logic INLINE to ensure state consistency
             let nextWaveEnemies = [...currentEnemies];
             const nextWaveNum = newWave + 1;
             
             // Reset Wave Refs for next wave
             waveStateRef.current.enemiesToSpawn = 10 + Math.floor(nextWaveNum * 1.5);
             waveStateRef.current.spawnTimer = 0;
             waveStateRef.current.enemiesSpawned = 0;
             waveStateRef.current.waveCooldown = 0;
             waveStateRef.current.bossSpawned = false;
             waveStateRef.current.eventTriggered = false;

             // Give Bonus
             const rushBonus = 50 + (newWave * 5);
             newMoney += rushBonus;
             newTotalGoldEarned += rushBonus;

             // Increment Wave
             newWave = nextWaveNum;
             newWaveTimer = Math.max(20, 60 - (newWave * 1)) * 60;
             
             // Initial spawn for new wave happens in next frame via spawnTimer logic below
        }

        // --- WAVE EVENTS (including terrain-specific) ---
        if (newWave > 1 && newWave % 5 === 0 && !waveStateRef.current.eventTriggered) {
             const baseEvents: ActiveEvent[] = [
                { type: 'ENEMY_SPEED', name: '急速狂潮', description: '本波敵人移動速度 +30%', timer: 3000 },
                { type: 'ENEMY_ARMOR', name: '鐵壁防禦', description: '本波敵人護甲 +20%', timer: 3000 },
                { type: 'HERO_CD', name: '魔力激盪', description: '英雄技能冷卻時間減半', timer: 3000 },
                { type: 'DOUBLE_GOLD', name: '黃金時代', description: '本波擊殺金幣加倍', timer: 3000 }
            ];

            // Add terrain-themed events based on map decoration type
            const terrainType = levelConfig.theme.decorationType;
            if (terrainType === 'FOREST') {
                baseEvents.push({ type: 'FOREST_ENTANGLE', name: '荊棘蔓延', description: '本波敵人被荊棘纏繞，移動速度 -20%', timer: 3000 });
            } else if (terrainType === 'DESERT') {
                baseEvents.push({ type: 'SANDSTORM', name: '沙塵暴', description: '本波塔攻擊射程降低 25%', timer: 3000 });
            } else if (terrainType === 'SNOW') {
                baseEvents.push({ type: 'BLIZZARD', name: '暴風雪', description: '本波敵人移動速度 -30%', timer: 3000 });
            } else if (terrainType === 'LAVA') {
                baseEvents.push({ type: 'LAVA_FLOW', name: '熔岩氾濫', description: '本波敵人持續受到火焰傷害', timer: 3000 });
            } else if (terrainType === 'VOID') {
                baseEvents.push({ type: 'NULL_FIELD', name: '虛空場域', description: '本波防禦塔傷害降低 25%', timer: 3000 });
            }

            activeEvent = baseEvents[Math.floor(Math.random() * baseEvents.length)];
            waveStateRef.current.eventTriggered = true;
        }
        
        if (activeEvent) {
             // Event clears when wave is done spawning and cleared
             if (currentEnemies.length === 0 && waveStateRef.current.enemiesSpawned >= waveStateRef.current.enemiesToSpawn) {
                activeEvent = null; 
            }
        }

        // --- HERO LOGIC ---
        let newHero = { ...prev.heroEntity! };
        let cdRate = 1;
        if (activeEvent?.type === 'HERO_CD') cdRate = 2; // Keep rate 2x, also apply 0.5x on cast
        if (newHero.skillCooldownTimer > 0) newHero.skillCooldownTimer = Math.max(0, newHero.skillCooldownTimer - (cdRate * gameSpeed));
        
        if (prev.isAdmin) newHero.skillCooldownTimer = 0;
        
        if (newHero.isDead) {
            newHero.respawnTimer = Math.max(0, newHero.respawnTimer - (1 * gameSpeed));
            if (prev.isAdmin) newHero.respawnTimer = 0;
            
            if (newHero.respawnTimer <= 0) {
                newHero.isDead = false;
                newHero.hp = newHero.maxHp;
                newHero.state = 'IDLE';
                newHero.x = pathEnd.x;
                newHero.y = pathEnd.y;
            }
        } else {
             if (newHero.state === 'MOVING' && newHero.targetX !== undefined) {
                const dx = newHero.targetX - newHero.x;
                const dy = newHero.targetY! - newHero.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                const step = CHASE_SPEED * gameSpeed;
                if (dist <= step) {
                    newHero.x = newHero.targetX;
                    newHero.y = newHero.targetY!;
                    newHero.state = 'IDLE';
                } else {
                    newHero.x += (dx/dist) * step;
                    newHero.y += (dy/dist) * step;
                }
                newHero.fightingEnemyId = null; 
            }
            if (newHero.state !== 'FIGHTING' && newHero.hp < newHero.maxHp) {
                let regen = 0.2 * gameSpeed;
                if (selectedTalents.t1 === 'grom_t1_regen' && newHero.hp < newHero.maxHp * 0.5) regen += (1.0 * gameSpeed);
                if (prev.isAdmin) regen += 1000;
                newHero.hp = Math.min(newHero.maxHp, newHero.hp + regen);
            }

            if (isRangedHero && newHero.state !== 'MOVING' && newHero.state !== 'FIGHTING') {
                 // **Refactored Attack Logic**: 
                 // We will simply cheat `lastAttackTime` by subtracting `deltaTime * (gameSpeed - 1)` from it, making it appear in the past.
                 if (gameSpeed > 1) {
                     newHero.lastAttackTime -= (deltaTime * (gameSpeed - 1));
                 }
                 
                 const attackRate = (1000 - (hero.baseStats.skillCooldown * 10)) / globalSpeedBuff; 
                 
                 if (now - newHero.lastAttackTime > attackRate) {
                     // ... Attack Logic ...
                     const target = currentEnemies.find(e => {
                         const d = Math.sqrt((e.x - newHero.x)**2 + (e.y - newHero.y)**2);
                         return d < heroAttackRange && e.hp > 0;
                     });

                     if (target) {
                         newHero.lastAttackTime = now;
                         let projType = ProjectileType.ARROW;
                         if (hero.visualTheme.weaponType === 'GUN') projType = ProjectileType.BOMB;
                         if (['MAGIC', 'STAFF', 'ORB'].includes(hero.visualTheme.weaponType)) projType = ProjectileType.MAGIC;
                         
                         let damage = initialStats.atk;
                         if (selectedTalents.t2 === 'yuki_t2_crit' && Math.random() < 0.33) damage *= 2; 
                         if (selectedTalents.t2 === 'sakura_t2_headshot' && target.hp < target.maxHp * 0.4) damage *= 3;
                         if (selectedTalents.t2 === 'kael_t2_crit' && Math.random() < 0.4) damage *= 1.5;

                         newProjectiles.push({
                            id: `hp_${Math.random()}`,
                            x: newHero.x,
                            y: newHero.y - 15,
                            targetId: target.id,
                            speed: 10,
                            damage: damage,
                            type: projType,
                            hit: false,
                            isHeroProjectile: true
                         });
                     }
                 }
            }
        }

        // --- TOWER LOGIC ---
        newTowers = newTowers.map((tower, tIdx) => {
            const def = TOWER_DEFS[Object.values(TOWER_DEFS).find(d => d.id === tower.defId)!.type];
            const stats = getTowerStats(tower);
            
            // Speed Hack for Towers
            if (gameSpeed > 1) {
                tower.lastAttackTime -= (deltaTime * (gameSpeed - 1));
            }

            let effectiveRange = stats.range * globalRangeBuff + (tower.skillLevels['sniper_range'] || 0) * 50;
            if (activeEvent?.type === 'SANDSTORM') effectiveRange *= 0.75; // Sandstorm reduces tower range
            const effectiveDamage = stats.damage * globalDamageBuff + (tower.skillLevels['gem_laser'] || 0) * 50 + (tower.skillLevels['bertha_nuke'] || 0) * 300;
            let effectiveRate = stats.rate / globalSpeedBuff;
            if (tower.skillLevels['bank_speed']) effectiveRate /= (1 + (tower.skillLevels['bank_speed'] * 0.1));
            // Enforce minimum effectiveRate based on MAX_GLOBAL_SPEED_BUFF (prevents >max buff)
            effectiveRate = Math.max(effectiveRate, stats.rate / MAX_GLOBAL_SPEED_BUFF);

            // --- SUMMON LOGIC FOR MAGE/OTHER ---
            if ((def.type === TowerType.MAGE && (tower.t3Index === 1 || tower.t3Index === 2))) {
                const maxSummons = tower.skillLevels['necro_summon'] || (tower.t3Index === 2 ? 1 : 0);
                if (maxSummons > 0) {
                     tower.summonTimer = (tower.summonTimer || 0) + (1 * gameSpeed);
                     if (tower.summonTimer > 600) { 
                         tower.summonTimer = 0;
                         const currentSummons = tower.soldiers.filter(s => !s.isDead).length;
                         if (currentSummons < maxSummons) {
                             const isGolem = tower.t3Index === 2;
                             const hp = isGolem ? 1000 + (tower.skillLevels['ele_golem']||0)*500 : 300;
                             const dmg = isGolem ? 50 : 20;
                             const rally = getRallyPoint(tower, currentSummons);
                             const newMinion: Soldier = {
                                 id: `sum_${tower.id}_${Math.random()}`,
                                 x: tower.x, y: tower.y,
                                 hp: hp, maxHp: hp, damage: dmg,
                                 respawnTime: 0, isDead: false, targetEnemyId: null,
                                 isSummon: true
                             };
                             tower.soldiers = [...tower.soldiers, newMinion];
                         }
                     }
                }
            }

            // --- SOLDIER LOGIC ---
            if (tower.soldiers && tower.soldiers.length > 0) {
                const updatedSoldiers = tower.soldiers.map((soldier, sIdx) => {
                    const rally = getRallyPoint(tower, sIdx);
                    
                    let maxHp = (stats.soldierHp || 100) * globalSoldierHpBuff;
                    if (soldier.isSummon) maxHp = soldier.maxHp; 

                    if (tower.skillLevels['paladin_heal'] && !soldier.isDead && soldier.hp < maxHp) {
                        soldier.hp += ((tower.skillLevels['paladin_heal'] * 100) / 300) * gameSpeed; 
                    }
                    if (tower.skillLevels['soul_regen'] && !soldier.isDead && soldier.hp < maxHp) {
                         soldier.hp += (tower.skillLevels['soul_regen'] * 0.1) * gameSpeed;
                    }

                    if (soldier.isDead) {
                        if (soldier.isSummon) return soldier; 
                        soldier.respawnTime -= (1 * gameSpeed);
                        if (soldier.respawnTime <= 0) return { ...soldier, isDead: false, hp: maxHp, targetEnemyId: null, x: rally.x, y: rally.y };
                        return soldier;
                    }
                    
                    if (tower.skillLevels['ele_burn']) {
                         currentEnemies.forEach(e => {
                             if (Math.sqrt((e.x - soldier.x)**2 + (e.y - soldier.y)**2) < 50) e.burnTime = 60;
                         });
                    }

                    const distFromBase = Math.sqrt((soldier.x - rally.x)**2 + (soldier.y - rally.y)**2);
                    if (distFromBase > LEASH_RANGE) {
                        soldier.targetEnemyId = null;
                        if (soldier.targetEnemyId) {
                            const e = currentEnemies.find(en => en.id === soldier.targetEnemyId);
                             if (e && e.blockedBy === soldier.id) { e.isBlocked = false; e.blockedBy = null; }
                        }
                    }

                    let target = null;
                    if (soldier.targetEnemyId) {
                        target = currentEnemies.find(e => e.id === soldier.targetEnemyId && e.hp > 0 && (!e.isFlying || tower.skillLevels['barb_throw']));
                        if (target) {
                             const d = Math.sqrt((target.x - soldier.x)**2 + (target.y - soldier.y)**2);
                             if (d > 150) target = null;
                        }
                        if (!target) soldier.targetEnemyId = null;
                    }
                    
                    if (!target) {
                        let closest = null;
                        let minDst = Infinity;
                        for (const e of currentEnemies) {
                            if (e.hp <= 0) continue;
                            if (e.isFlying && !tower.skillLevels['barb_throw']) continue;
                            if (e.isBlocked && e.blockedBy !== soldier.id) continue;
                            const distToEnemy = Math.sqrt((e.x - rally.x)**2 + (e.y - rally.y)**2);
                            if (distToEnemy > LEASH_RANGE) continue;

                            const d = Math.sqrt((e.x - soldier.x)**2 + (e.y - soldier.y)**2);
                            if (d < AGGRO_RANGE && d < minDst) {
                                minDst = d;
                                closest = e;
                            }
                        }
                        if (closest) {
                            soldier.targetEnemyId = closest.id;
                            target = closest;
                        }
                    }

                    if (target) {
                         const range = tower.skillLevels['barb_throw'] ? 100 : ENGAGE_RANGE;
                         const dx = target.x - soldier.x;
                         const dy = target.y - soldier.y;
                         const dist = Math.sqrt(dx*dx + dy*dy);
                         
                         if (dist <= range) {
                             if (!target.isFlying) {
                                 target.isBlocked = true;
                                 target.blockedBy = soldier.id;
                                 const angle = Math.atan2(dy, dx);
                                 target.x = soldier.x + Math.cos(angle) * 12; 
                                 target.y = soldier.y + Math.sin(angle) * 12;
                             }
                             
                             if (Math.random() < (0.05 * gameSpeed)) { 
                                 let dmg = soldier.damage * globalDamageBuff;
                                 if (tower.skillLevels['sin_crit'] && Math.random() < 0.2) dmg *= (1.5 + tower.skillLevels['sin_crit'] * 0.5);
                                 
                                 if (tower.skillLevels['barb_whirl'] && Math.random() < (tower.skillLevels['barb_whirl'] * 0.1)) {
                                     currentEnemies.forEach(e => {
                                         if (Math.sqrt((e.x - soldier.x)**2 + (e.y - soldier.y)**2) < 50) {
                                            e.hp -= dmg;
                                            towerDamageUpdates.set(tower.id, (towerDamageUpdates.get(tower.id) || 0) + dmg);
                                            newTotalDamageDealt += dmg;
                                         }
                                     });
                                     newParticles.push({ id: Math.random().toString(), x: soldier.x, y: soldier.y, life: 10, maxLife: 10, color: '#fca5a5', radius: 30 });
                                 } else {
                                     target.hp -= dmg;
                                     towerDamageUpdates.set(tower.id, (towerDamageUpdates.get(tower.id) || 0) + dmg);
                                     newTotalDamageDealt += dmg;
                                 }
                                 newParticles.push({ id: Math.random().toString(), x: target.x, y: target.y, life: 5, maxLife: 5, color: '#fff', radius: 4 });
                             }
                             
                             if (Math.random() < (0.03 * gameSpeed) && target.stunTime <= 0) {
                                 let enemyDmg = 5 * (1 - globalDamageReduction);
                                 let armor = stats.soldierArmor || 0;
                                 if (tower.skillLevels['paladin_armor']) armor += tower.skillLevels['paladin_armor'] * 0.05;
                                 if(armor) enemyDmg = Math.max(1, enemyDmg * (1 - armor));
                                 
                                 if (tower.skillLevels['sin_dodge'] && Math.random() < (tower.skillLevels['sin_dodge'] * 0.15)) {
                                     // Dodged
                                 } else {
                                     soldier.hp -= enemyDmg; 
                                 }
                             }
                         } else {
                             soldier.x += (dx/dist) * CHASE_SPEED * gameSpeed;
                             soldier.y += (dy/dist) * CHASE_SPEED * gameSpeed;
                         }
                    } else {
                        const dx = rally.x - soldier.x;
                        const dy = rally.y - soldier.y;
                        const dist = Math.sqrt(dx*dx + dy*dy);
                        const returnStep = RETURN_SPEED * gameSpeed;
                        if (dist > 2) {
                            soldier.x += (dx/dist) * returnStep;
                            soldier.y += (dy/dist) * returnStep;
                        } else {
                            soldier.x = rally.x;
                            soldier.y = rally.y;
                        }
                    }
                    
                    if (soldier.hp <= 0) {
                        soldier.isDead = true;
                        soldier.respawnTime = 300;
                        if (soldier.targetEnemyId) {
                             const e = currentEnemies.find(en => en.id === soldier.targetEnemyId);
                             if (e && e.blockedBy === soldier.id) { e.isBlocked = false; e.blockedBy = null; }
                        }
                        soldier.targetEnemyId = null;
                    }
                    return soldier;
                });
                
                tower.soldiers = updatedSoldiers.filter(s => !(s.isSummon && s.isDead));
                return tower;
            }

            // --- TOWER ATTACK ---
            if (stats.damage > 0 && now - tower.lastAttackTime > effectiveRate) {
                // ... (Tower Attack logic unchanged mostly, speed hack applied above) ...
                 const target = currentEnemies.find(e => {
                    const dx = e.x - tower.x;
                    const dy = e.y - tower.y;
                    return Math.sqrt(dx*dx + dy*dy) <= effectiveRange && e.hp > 0;
                });
                
                let targets = [target];
                if (tower.skillLevels['ranger_multi'] && target) {
                    const extraCount = tower.skillLevels['ranger_multi'];
                    const extras = currentEnemies.filter(e => e.id !== target.id && e.hp > 0 && Math.sqrt((e.x - tower.x)**2 + (e.y - tower.y)**2) <= effectiveRange).slice(0, extraCount);
                    targets = [target, ...extras];
                }
                if (tower.skillLevels['mech_missile'] && target) {
                    const count = tower.skillLevels['mech_missile'];
                    for (let i=0; i<count; i++) targets.push(target); 
                }

                if (target) {
                    targets.forEach(tgt => {
                        if (!tgt) return;
                        if (stats.projectileType) {
                            let armorIgnore = false;
                            if ((stats.armorIgnoreChance && Math.random() < stats.armorIgnoreChance) || tower.defId === 'mage') {
                                armorIgnore = true;
                            }
                            
                            let isCrit = Math.random() < globalCritChance;
                            let dmg = effectiveDamage;
                            if (tower.skillLevels['arcane_crit']) isCrit = isCrit || Math.random() < (0.1 * tower.skillLevels['arcane_crit']);
                            if (isCrit) dmg *= 2;

                            newProjectiles.push({
                                id: Math.random().toString(),
                                x: tower.x,
                                y: tower.y - 20,
                                targetId: tgt.id,
                                speed: PROJECTILE_SPEED, // Projectiles speed handled in projectile loop
                                damage: dmg,
                                type: stats.projectileType,
                                splashRadius: stats.splashRadius,
                                hit: false,
                                ignoreArmor: armorIgnore,
                                sourceTowerId: tower.id,
                                headshotChance: tower.skillLevels['sniper_headshot'] ? tower.skillLevels['sniper_headshot'] * 0.02 : 0,
                                poisonDamage: tower.skillLevels['ranger_poison'] ? tower.skillLevels['ranger_poison'] * 5 : 0,
                                slowAmount: tower.skillLevels['vine_slow'] ? tower.skillLevels['vine_slow'] * 0.1 : 0,
                                teleportChance: tower.skillLevels['arcane_teleport'] ? tower.skillLevels['arcane_teleport'] * 0.05 : 0,
                                chainCount: tower.skillLevels['tesla_chain'] ? tower.skillLevels['tesla_chain'] : 0,
                                stunDuration: tower.skillLevels['tesla_stun'] ? tower.skillLevels['tesla_stun'] * 30 : 0,
                                isCluster: !!tower.skillLevels['bertha_cluster']
                            });
                        }
                    });
                    return { ...tower, lastAttackTime: now };
                }
            }
            
            // --- GOLD MINE LOGIC ---
            if (tower.defId === 'gold_mine' && now - tower.lastAttackTime > effectiveRate) {
                // ... (Gold mine logic) ...
                let amount = (tower.tier === 1 ? 15 : tower.tier === 2 ? 30 : 45);
                if (tower.tier === 3 && tower.t3Index === 0) {
                    const interestLv = tower.skillLevels['bank_interest'] || 0;
                    if (interestLv > 0) {
                        // Compound interest is based on tower production amount (per-tick), not total money
                        const interest = Math.min(Math.floor(amount * (0.01 * interestLv)), BANK_INTEREST_CAP);
                        amount += interest;
                    }
                }
                if (tower.tier === 3 && tower.t3Index === 2) {
                     const moneyLv = tower.skillLevels['gem_money'] || 0;
                     if (moneyLv > 0) amount += moneyLv * 2;
                }
                if (tower.skillLevels['market_smuggle']) {
                     if (Math.random() < (tower.skillLevels['market_smuggle'] * 0.05)) {
                         newLives = Math.min(prev.isAdmin ? 9999 : 20, newLives + 1);
                         newParticles.push({ id: `txt_${Math.random()}`, x: tower.x, y: tower.y - 40, life: 40, maxLife: 40, color: '#f87171', radius: 0, text: '+1 Life' });
                     }
                }
                if (goldBuff > 0) amount *= 2;
                newMoney += amount;
                newTotalGoldEarned += amount;
                newParticles.push({ id: Math.random().toString(), x: tower.x, y: tower.y - 10, life: 30, maxLife: 30, color: '#fcd34d', radius: 15 });
                newParticles.push({ id: `txt_${Math.random()}`, x: tower.x, y: tower.y - 30, life: 40, maxLife: 40, color: '#fbbf24', radius: 0, text: `+${Math.floor(amount)}g` });
                return { ...tower, lastAttackTime: now };
            }
            return tower;
        });

        // --- ENEMY UPDATE ---
        const activeEnemies = currentEnemies.map(e => {
            if (e.hp <= 0) return { ...e, dead: true };
            let moveSpeed = e.speed;
            if (activeEvent?.type === 'ENEMY_SPEED') moveSpeed *= 1.3;
            // Terrain-specific slow events
            if (activeEvent?.type === 'FOREST_ENTANGLE') moveSpeed *= 0.8; // -20% move speed for this wave
            if (activeEvent?.type === 'BLIZZARD') moveSpeed *= 0.7; // -30% move speed for this wave
            
            // Status Effects
            if (e.freezeTime > 0) { moveSpeed *= 0.5; e.freezeTime = Math.max(0, e.freezeTime - (1 * gameSpeed)); }

            // Per-enemy slow + global slow combined (clamped)
            if (e.slowTime && e.slowTime > 0) {
                e.slowTime = Math.max(0, e.slowTime - (1 * gameSpeed));
                if (e.slowTime <= 0) { e.slowPercent = 0; e.slowStacks = 0; }
            }
            const totalSlow = Math.min(MAX_TOTAL_SLOW, (globalEnemySlow || 0) + (e.slowPercent || 0));
            if (totalSlow > 0) moveSpeed *= (1 - totalSlow);
            
            if (e.burnTime > 0) { e.hp -= (0.5 * gameSpeed); newTotalDamageDealt += (0.5 * gameSpeed); e.burnTime = Math.max(0, e.burnTime - (1 * gameSpeed)); }
            if (e.poisonTime > 0) { e.hp -= (0.8 * gameSpeed); newTotalDamageDealt += (0.8 * gameSpeed); e.poisonTime = Math.max(0, e.poisonTime - (1 * gameSpeed)); }

            // Terrain lava causes persistent minor damage each frame
            if (activeEvent?.type === 'LAVA_FLOW') {
                const lavaTick = 0.2 * gameSpeed;
                e.hp -= lavaTick;
                newTotalDamageDealt += lavaTick;
            }
            
            if (e.stunTime > 0) { moveSpeed = 0; e.stunTime = Math.max(0, e.stunTime - (1 * gameSpeed)); }
            
            // FIX STUCK ENEMY BUG
            if (e.isBlocked && e.stunTime <= 0) {
                moveSpeed = 0;
                if (e.blockedBy === 'hero') {
                     const dist = Math.sqrt((e.x - newHero.x)**2 + (e.y - newHero.y)**2);
                     if (dist > 50 || newHero.isDead) {
                         e.isBlocked = false; e.blockedBy = null; moveSpeed = e.speed; 
                     }
                }
            }

            if (selectedTalents.t2 === 'rin_t2_burn' && !newHero.isDead) {
                const dist = Math.sqrt((e.x - newHero.x)**2 + (e.y - newHero.y)**2);
                if (dist < 100) { e.hp -= 0.5 * gameSpeed; newTotalDamageDealt += 0.5 * gameSpeed; }
            }
            if (selectedTalents.t2 === 'grom_t2_slow' && !newHero.isDead) {
                const dist = Math.sqrt((e.x - newHero.x)**2 + (e.y - newHero.y)**2);
                if (dist < 50) moveSpeed *= 0.4;
            }

            if (!isRangedHero && !e.isFlying && !e.isBlocked && !newHero.isDead && newHero.state !== 'MOVING') {
                 const dist = Math.sqrt((e.x - newHero.x)**2 + (e.y - newHero.y)**2);
                 if (dist < 30) {
                     e.isBlocked = true; e.blockedBy = 'hero'; newHero.state = 'FIGHTING'; newHero.fightingEnemyId = e.id; moveSpeed = 0;
                 }
            }
            
            if (isRangedHero && !e.isBlocked && !newHero.isDead && newHero.state !== 'MOVING') {
                const dist = Math.sqrt((e.x - newHero.x)**2 + (e.y - newHero.y)**2);
                if (dist < 10) {
                     e.isBlocked = true; e.blockedBy = 'hero'; newHero.state = 'FIGHTING'; newHero.fightingEnemyId = e.id; moveSpeed = 0;
                }
            }

            if (e.blockedBy === 'hero' && newHero.fightingEnemyId === e.id) {
                 if (Math.random() < 0.1 * gameSpeed && e.stunTime <= 0) {
                     let reflection = 0;
                     if (selectedTalents.t2 === 'rin_t2_thorns') reflection = 5 * 0.5;
                     if (reflection > 0) { e.hp -= reflection; newTotalDamageDealt += reflection; }
                     newHero.hp -= 5;
                 }
                 if (Math.random() < 0.1 * gameSpeed) {
                     let dmg = initialStats.atk;
                     if (selectedTalents.t2 === 'ibaraki_t2_lifesteal') newHero.hp += dmg * 0.5;
                     e.hp -= dmg;
                     newTotalDamageDealt += dmg;
                     newParticles.push({ id: Math.random().toString(), x: e.x, y: e.y, life: 8, maxLife: 8, color: '#fbbf24', radius: 8 });
                 }
                 if (newHero.hp <= 0) {
                     newHero.isDead = true; newHero.respawnTimer = hero.baseStats.respawnTime * 60; e.isBlocked = false; e.blockedBy = null;
                 }
            }

            if (!e.isBlocked && moveSpeed > 0) {
                const path = levelConfig.paths[e.pathId];
                if (!path || e.pathIndex >= path.length - 1) return { ...e, finished: true };
                const target = path[e.pathIndex + 1];
                const dx = target.x - e.x;
                const dy = target.y - e.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                const step = moveSpeed * gameSpeed;
                if (dist <= step) return { ...e, x: target.x, y: target.y, pathIndex: e.pathIndex + 1 };
                else return { ...e, x: e.x + (dx/dist)*step, y: e.y + (dy/dist)*step };
            }
            return e;
        });

        // --- ENEMY DEATH LOGIC ---
        const survivingEnemies: Enemy[] = [];
        activeEnemies.forEach(e => {
            if (e.dead) {
              const def = ENEMIES[e.defId];
              let reward = def.reward;
              
              let marketBonus = 0;
              newTowers.forEach(t => { if(t.skillLevels['market_discount']) marketBonus += t.skillLevels['market_discount']; });
              if (marketBonus > 0) reward *= (1 + marketBonus * 0.1);

              if (goldBuff > 0) reward *= 2;
              if (activeEvent?.type === 'DOUBLE_GOLD') reward *= 2;
              newMoney += reward;
              newTotalGoldEarned += reward;
              newEnemiesKilled++;
              newParticles.push({ id: Math.random().toString(), x: e.x, y: e.y, life: 20, maxLife: 20, color: def.visualColor, radius: 10 });
              if (newHero.fightingEnemyId === e.id) { newHero.state = 'IDLE'; newHero.fightingEnemyId = null; }

              let vineAoeDmg = 0;
              newTowers.forEach(t => { if(t.skillLevels['vine_aoe']) vineAoeDmg += t.skillLevels['vine_aoe'] * 50; });
              if (vineAoeDmg > 0 && e.poisonTime > 0) {
                   activeEnemies.forEach(other => {
                       if (!other.dead && Math.sqrt((other.x - e.x)**2 + (other.y - e.y)**2) < 60) {
                           other.hp -= vineAoeDmg;
                           newTotalDamageDealt += vineAoeDmg;
                       }
                   });
                   newParticles.push({ id: Math.random().toString(), x: e.x, y: e.y, life: 15, maxLife: 15, color: '#10b981', radius: 40 });
              }

            } else if (e.finished) {
              if (e.isBoss) {
                  newLives = 0; 
              } else {
                  newLives -= 1;
              }
              if (newHero.fightingEnemyId === e.id) { newHero.state = 'IDLE'; newHero.fightingEnemyId = null; }
            } else {
              survivingEnemies.push(e);
            }
        });

        // --- PROJECTILE LOGIC ---
        const activeProjectiles: Projectile[] = [];
        newProjectiles.forEach(p => {
            const target = survivingEnemies.find(e => e.id === p.targetId);
            let tx = p.x, ty = p.y;
            if (target) { tx = target.x; ty = target.y; }
            else if (p.type !== ProjectileType.BOMB) return;

            const dx = tx - p.x;
            const dy = ty - p.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const pSpeed = p.speed * gameSpeed;

            if (dist <= pSpeed) {
                let damage = p.damage;
                if (activeEvent?.type === 'ENEMY_ARMOR') damage *= 0.8;

                if (p.splashRadius) {
                    newParticles.push({ id: Math.random().toString(), x: tx, y: ty, life: 25, maxLife: 25, color: '#f59e0b', radius: p.splashRadius });
                    survivingEnemies.forEach(e => {
                        if (Math.sqrt((e.x - tx)**2 + (e.y - ty)**2) <= p.splashRadius!) {
                            e.hp -= damage;
                            newTotalDamageDealt += damage;
                            if (p.sourceTowerId) {
                                towerDamageUpdates.set(p.sourceTowerId, (towerDamageUpdates.get(p.sourceTowerId) || 0) + damage);
                            }
                            // Terrain lava applies extra burn-like damage
                            if (activeEvent?.type === 'LAVA_FLOW') {
                                const lavaDmg = 0.5;
                                e.hp -= lavaDmg;
                                newTotalDamageDealt += lavaDmg;
                            }
                        }
                    });
                    
                    if (p.isCluster) {
                         for(let i=0; i<3; i++) {
                             newParticles.push({ id: Math.random().toString(), x: tx + (Math.random()*40-20), y: ty + (Math.random()*40-20), life: 15, maxLife: 15, color: '#ef4444', radius: 20 });
                             survivingEnemies.forEach(e => {
                                if (Math.sqrt((e.x - tx)**2 + (e.y - ty)**2) <= 50) {
                                    e.hp -= damage * 0.3;
                                    newTotalDamageDealt += damage * 0.3;
                                    if (p.sourceTowerId) {
                                        towerDamageUpdates.set(p.sourceTowerId, (towerDamageUpdates.get(p.sourceTowerId) || 0) + (damage * 0.3));
                                    }
                                }
                             });
                         }
                    }

                } else {
                    if (target) {
                        if (!p.ignoreArmor) {
                           const def = ENEMIES[target.defId];
                           damage *= (1 - def.armor);
                        } else {
                           newParticles.push({ id: Math.random().toString(), x: tx, y: ty - 10, life: 8, maxLife: 8, color: '#c084fc', radius: 4 }); 
                        }

                        if (activeEvent?.type === 'NULL_FIELD') {
                            damage *= 0.75; // tower damage reduced by 25% during null field
                        }

                        if (p.headshotChance && !target.isBoss && Math.random() < p.headshotChance) {
                             damage = target.hp + 999;
                             newParticles.push({ id: `txt_${Math.random()}`, x: tx, y: ty - 20, life: 30, maxLife: 30, color: '#ef4444', radius: 0, text: 'HEADSHOT!' });
                        }

                        target.hp -= damage;
                        // Terrain lava causes persistent burning — give a small immediate tick as well
                        if (activeEvent?.type === 'LAVA_FLOW') {
                            const lavaDmg = 0.5;
                            target.hp -= lavaDmg;
                            newTotalDamageDealt += lavaDmg;
                        }
                        newTotalDamageDealt += damage;
                        if (p.sourceTowerId) {
                            towerDamageUpdates.set(p.sourceTowerId, (towerDamageUpdates.get(p.sourceTowerId) || 0) + damage);
                        }
                        
                        if (p.type === ProjectileType.MAGIC) target.freezeTime = 30;
                                if (p.poisonDamage) { target.poisonTime += 120; }
                                // Apply slow as percent stacking with max and duration
                                if (p.slowAmount) {
                                    const added = p.slowAmount; // value is e.g. 0.1 for 10%
                                    target.slowStacks = (target.slowStacks || 0) + 1;
                                    // limit stacks
                                    if (target.slowStacks > MAX_SLOW_STACKS) target.slowStacks = MAX_SLOW_STACKS;
                                    target.slowPercent = Math.min(MAX_TOTAL_SLOW, (target.slowPercent || 0) + added);
                                    target.slowTime = Math.max(target.slowTime || 0, SLOW_DURATION_FRAMES);
                                }
                        if (p.stunDuration) { target.stunTime += p.stunDuration; }
                        if (p.teleportChance && Math.random() < p.teleportChance) {
                             target.pathIndex = Math.max(0, target.pathIndex - 5);
                             const backPt = levelConfig.paths[target.pathId][target.pathIndex];
                             target.x = backPt.x;
                             target.y = backPt.y;
                             newParticles.push({ id: Math.random().toString(), x: tx, y: ty, life: 15, maxLife: 15, color: '#a855f7', radius: 15 });
                        }

                        if (p.chainCount && p.chainCount > 0) {
                             const neighbors = survivingEnemies.filter(e => e.id !== target.id && Math.sqrt((e.x - tx)**2 + (e.y - ty)**2) < 100).slice(0, p.chainCount);
                             neighbors.forEach(n => {
                                 const chainDmg = damage * 0.7;
                                 n.hp -= chainDmg;
                                 newTotalDamageDealt += chainDmg;
                                 if (p.sourceTowerId) {
                                     towerDamageUpdates.set(p.sourceTowerId, (towerDamageUpdates.get(p.sourceTowerId) || 0) + chainDmg);
                                 }
                                 n.stunTime += 10;
                                 newParticles.push({ id: Math.random().toString(), x: n.x, y: n.y, life: 8, maxLife: 8, color: '#67e8f9', radius: 8 });
                             });
                        }

                        if (p.isHeroProjectile && selectedTalents.t2 === 'tamamo_t2_slow') target.freezeTime = 120;
                        if (p.isHeroProjectile) newParticles.push({ id: Math.random().toString(), x: tx, y: ty, life: 8, maxLife: 8, color: hero.visualTheme.primaryColor, radius: 6 });
                        
                        if (p.isHeroProjectile && selectedTalents.t2 === 'vex_t1_dot') target.burnTime += 300;
                        
                        if (p.isHeroProjectile && selectedTalents.t2 === 'yuki_t2_pierce') {
                            survivingEnemies.forEach(e2 => {
                                if(e2.id !== target.id && Math.sqrt((e2.x-tx)**2 + (e2.y-ty)**2) < 20) {
                                    const pierceDmg = damage * 0.5;
                                    e2.hp -= pierceDmg;
                                    newTotalDamageDealt += pierceDmg;
                                }
                            });
                        }
                    }
                }
            } else {
                activeProjectiles.push({ ...p, x: p.x + (dx / dist) * pSpeed, y: p.y + (dy / dist) * pSpeed });
            }
        });

        if (towerDamageUpdates.size > 0 || towerKillUpdates.size > 0) {
            newTowers = newTowers.map(t => {
                const dmg = towerDamageUpdates.get(t.id) || 0;
                const kills = towerKillUpdates.get(t.id) || 0;
                if (dmg > 0 || kills > 0) {
                    return { ...t, totalDamage: (t.totalDamage || 0) + dmg, killCount: (t.killCount || 0) + kills };
                }
                return t;
            });
        }

        waveStateRef.current.spawnTimer += (1 * gameSpeed);
        const spawnInterval = Math.max(30, 100 - (newWave * 5)); 
        
        if (newWave % 10 === 0 && waveStateRef.current.enemiesSpawned === 0 && !waveStateRef.current.bossSpawned) {
             const pathId = Math.floor(Math.random() * levelConfig.paths.length);
             const boss = createBoss(newWave, pathId, 30);
             survivingEnemies.push(boss);
             waveStateRef.current.bossSpawned = true;
             waveStateRef.current.enemiesSpawned++; 
        }

        else if (waveStateRef.current.enemiesSpawned < waveStateRef.current.enemiesToSpawn && waveStateRef.current.spawnTimer > spawnInterval) {
            waveStateRef.current.spawnTimer = 0;
            waveStateRef.current.enemiesSpawned++;
            const pathId = Math.floor(Math.random() * levelConfig.paths.length);
            const path = levelConfig.paths[pathId];
            const enemy = spawnEnemy(newWave, pathId, path, 30); 
            survivingEnemies.push(enemy);
        }

        if (newLives <= 0) prev.view = GameView.GAME_OVER;
        
        // --- VICTORY CHECK ---
        // For level 0 (Tutorial) or limited wave levels, victory happens when all enemies of final wave are dead
        // Endless mode (9999 waves) never triggers this typically
        if (newWave >= levelConfig.waves && levelConfig.waves < 999 && survivingEnemies.length === 0 && waveStateRef.current.enemiesSpawned >= waveStateRef.current.enemiesToSpawn) {
            return { ...prev, view: GameView.VICTORY };
        }

        return {
            ...prev,
            activeTowers: newTowers,
            enemies: survivingEnemies,
            projectiles: activeProjectiles,
            particles: newParticles,
            lives: newLives,
            money: newMoney + (0.05 * gameSpeed),
            wave: newWave,
            heroEntity: newHero,
            skillEffect: skillEffect,
            enemiesKilled: newEnemiesKilled,
            goldBuffTimer: goldBuff,
            activeEvent: activeEvent,
            totalGoldEarned: newTotalGoldEarned,
            totalDamageDealt: newTotalDamageDealt,
            itemCooldowns: newItemCooldowns,
            waveTimer: newWaveTimer
        };
      });
      lastTimeRef.current = time;
    }
    requestRef.current = requestAnimationFrame(updateGame);
    }, [gameState.isPaused, levelConfig, gameState.view, showBestiary, isShopOpen, createBoss, callNextWave, levelId, showTutorial]); 

  const StatRow = ({label, value, nextValue, highlight}: {label: string, value: string, nextValue?: string, highlight?: boolean}) => (
      <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">{label}</span>
          <div className="flex gap-2">
              <span className={`font-mono ${highlight ? 'text-green-400 font-bold' : 'text-white'}`}>{value}</span>
              {nextValue && <span className="font-mono text-green-400">→ {nextValue}</span>}
          </div>
      </div>
  );

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateGame);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [updateGame]);

  
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (isShopOpen) { setIsShopOpen(false); return; } 
      const svg = e.currentTarget.querySelector('svg');
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      if (isSettingRally && gameState.selectedTowerId) {
          const tower = gameState.activeTowers.find(t => t.id === gameState.selectedTowerId);
          if (tower) {
              const range = getTowerStats(tower).range;
              const dist = Math.sqrt((clickX - tower.x)**2 + (clickY - tower.y)**2);
              if (dist <= range + 100) { 
                   setGameState(p => ({ ...p, activeTowers: p.activeTowers.map(t => t.id === tower.id ? {...t, rallyPoint: {x: clickX, y: clickY}} : t) }));
              }
              setIsSettingRally(false);
              return;
          }
      }

      // --- HERO MOVEMENT LOGIC ---
      if (isMovingHero && !gameState.heroEntity?.isDead) {
          setGameState(p => ({
              ...p, selectedTowerId: null, buildMenuOpen: null,
              heroEntity: { ...p.heroEntity!, state: 'MOVING', targetX: clickX, targetY: clickY, fightingEnemyId: null }
          }));
          setGameState(p => ({...p, particles: [...p.particles, {id: Math.random().toString(), x: clickX, y: clickY, life: 10, maxLife: 10, radius: 5, color: '#60a5fa'}]}));
          setIsMovingHero(false); // Turn off mode after click
          return;
      }
      
      const clickedSlot = levelConfig.buildSlots.find(slot => Math.sqrt((slot.x - clickX)**2 + (slot.y - clickY)**2) < 25);
      if (clickedSlot) {
          const existingTower = gameState.activeTowers.find(t => t.x === clickedSlot.x && t.y === clickedSlot.y);
          if (existingTower) {
              setGameState(p => ({...p, selectedTowerId: existingTower.id}));
              setBuildMenuOpen(null);
              setShowBottomPanel(true);
          } else {
              setGameState(p => ({...p, selectedTowerId: null}));
              setBuildMenuOpen({x: clickedSlot.x, y: clickedSlot.y});
              setShowBottomPanel(true);
          }
          setIsSettingRally(false);
          return;
      }
      
      setBuildMenuOpen(null);
      setIsSettingRally(false);
      setShowBottomPanel(false);
      setIsMovingHero(false);
  };
  
  const buildTower = (type: TowerType) => {
    if (!buildMenuOpen) return;
    const def = TOWER_DEFS[type];
    if (gameState.money >= def.t1.cost || gameState.isAdmin) {
        let initialSoldiers: Soldier[] = [];
        if (type === TowerType.BARRACKS) {
            initialSoldiers = [1,2,3].map(i => ({
                id: `s_${Math.random()}_${i}`, x: buildMenuOpen.x + (Math.random()*20 - 10), y: buildMenuOpen.y + 30,
                hp: def.t1.soldierHp || 100, maxHp: def.t1.soldierHp || 100, damage: def.t1.damage, respawnTime: 0, isDead: false, targetEnemyId: null
            }));
        }
        setGameState(prev => ({
            ...prev, money: prev.isAdmin ? 999999 : prev.money - def.t1.cost,
            activeTowers: [...prev.activeTowers, { 
                id: Math.random().toString(), x: buildMenuOpen.x, y: buildMenuOpen.y, defId: def.id, tier: 1, lastAttackTime: 0, level: 1, soldiers: initialSoldiers,
                skillLevels: {}, totalInvestment: def.t1.cost, totalDamage: 0, killCount: 0
            }]
        }));
        setBuildMenuOpen(null);
        setShowBottomPanel(false);
    }
  };
  
  const renderEnemy = (enemy: Enemy) => {
      const def = ENEMIES[enemy.defId];
      const color = enemy.poisonTime > 0 ? '#10b981' : def.visualColor; 
      const scale = enemy.isBoss ? 2 : 1;
      return (
          <g transform={`scale(${scale})`}>
              <rect x="-6" y="-8" width="12" height="16" fill={color} />
              <rect x="-4" y="-6" width="4" height="4" fill="white" opacity="0.5" />
              <rect x="-6" y="8" width="4" height="4" fill="black" />
              <rect x="2" y="8" width="4" height="4" fill="black" />
              {def.isFlying && <path d="M-10,-5 L-6,-2 M10,-5 L6,-2" stroke="white" strokeWidth="2" />}
              {enemy.stunTime > 0 && <path d="M-8,-15 L-4,-18 L0,-15 L4,-18 L8,-15" stroke="yellow" fill="none" strokeWidth="2" className="animate-spin origin-center" />}
              {enemy.isBoss && <circle r="15" fill="none" stroke="red" strokeWidth="2" strokeDasharray="4,2" className="animate-spin-slow" />}
              {enemy.poisonTime > 0 && <circle cy="-15" r="3" fill="#10b981" />}
          </g>
      );
  };
  
  const renderTowerVisual = (tower: ActiveTower) => {
      const def = TOWER_DEFS[Object.values(TOWER_DEFS).find(d => d.id === tower.defId)!.type];
      const tier = tower.tier;
      const t3Idx = tower.t3Index ?? 0;

      if (def.type === TowerType.BARRACKS) {
          if (tier === 1) return <g><path d="M-12,10 L0,-12 L12,10 Z" fill="#475569" stroke="#1e293b" strokeWidth="2"/><rect x="-4" y="2" width="8" height="8" fill="#1e1b4b"/></g>;
          if (tier === 2) return <g><rect x="-14" y="-12" width="28" height="24" fill="#334155" stroke="#0f172a" strokeWidth="2"/><path d="M-14,-12 L-14,-16 L-10,-12 L-6,-16 L-2,-12 L2,-16 L6,-12 L10,-16 L14,-12" fill="#334155" stroke="#0f172a" strokeWidth="2"/><rect x="-6" y="2" width="12" height="10" fill="#451a03"/></g>;
          if (tier === 3) {
             if (t3Idx === 0) return <g><rect x="-16" y="-14" width="32" height="28" fill="#fcd34d" stroke="#b45309" strokeWidth="2"/><path d="M0,-14 L0,-24 M-5,-20 L5,-20" stroke="#fef08a" strokeWidth="3"/><rect x="-8" y="0" width="16" height="14" fill="#b45309"/></g>;
             if (t3Idx === 1) return <g><path d="M-15,10 L-10,-15 L10,-15 L15,10 Z" fill="#b91c1c" stroke="#450a0a" strokeWidth="2"/><path d="M-18,-5 L-10,5 M18,-5 L10,5" stroke="#fca5a5" strokeWidth="3"/><rect x="-6" y="0" width="12" height="10" fill="#2a0a0a"/></g>;
             return <g><rect x="-14" y="-14" width="28" height="28" rx="4" fill="#312e81" stroke="#3b0764" strokeWidth="2"/><path d="M-14,-14 L14,14 M-14,14 L14,-14" stroke="#818cf8" strokeWidth="2"/><rect x="-6" y="2" width="12" height="12" fill="#020617"/></g>;
          }
      } else if (def.type === TowerType.ARCHER) {
          if (tier === 1) return <g><rect x="-6" y="-20" width="12" height="30" fill="#a16207" stroke="#451a03" strokeWidth="2"/><rect x="-8" y="-22" width="16" height="8" fill="#78350f"/></g>;
          if (tier === 2) return <g><rect x="-8" y="-25" width="16" height="40" fill="#78350f" stroke="#2a0a0a" strokeWidth="2"/><rect x="-10" y="-28" width="20" height="10" fill="#57534e"/><path d="M-5,-10 L-5,0 M5,-10 L5,0" stroke="#2a0a0a"/></g>;
          if (tier === 3) {
             if (t3Idx === 0) return <g><rect x="-8" y="-25" width="16" height="35" fill="#1e293b" stroke="#0f172a"/><circle cx="0" cy="-25" r="8" fill="#94a3b8"/><rect x="4" y="-28" width="20" height="6" fill="#000000"/></g>;
             if (t3Idx === 1) return <g><rect x="-6" y="-25" width="12" height="35" fill="#166534"/><path d="M-10,10 L-10,-20 L-6,-25 L6,-25 L10,-20 L10,10" fill="none" stroke="#22c55e" strokeWidth="2"/><circle cx="0" cy="-25" r="4" fill="#dcfce7"/></g>;
             return <g><rect x="-6" y="-25" width="12" height="35" fill="#3f6212"/><path d="M-10,10 Q-15,0 -5,-10 Q5,-20 10,-30" fill="none" stroke="#a3e635" strokeWidth="2"/><circle cx="0" cy="-25" r="5" fill="#bef264"/></g>;
          }
      } else if (def.type === TowerType.MAGE) {
          if (tier === 1) return <g><path d="M-8,10 L0,-20 L8,10 Z" fill="#6b21a8"/><circle cx="0" cy="-25" r="5" fill="#d8b4fe" className="animate-pulse"/></g>;
          if (tier === 2) return <g><rect x="-8" y="-10" width="16" height="20" fill="#581c87"/><path d="M-8,-10 L0,-30 L8,-10" fill="#7e22ce"/><circle cx="0" cy="-35" r="6" fill="#c084fc" className="animate-pulse"/></g>;
          if (tier === 3) {
              if (t3Idx === 0) return <g><path d="M-8,10 L0,-20 L8,10 Z" fill="#be185d"/><circle cx="0" cy="-25" r="8" fill="#f472b6" className="animate-pulse"/><path d="M0,-25 L0,-40" stroke="#fbcfe8" strokeWidth="2"/></g>;
              if (t3Idx === 1) return <g><rect x="-8" y="-15" width="16" height="25" fill="#172554"/><circle cx="0" cy="-25" r="7" fill="#60a5fa" opacity="0.5"/><path d="M-4,-25 L4,-25 M0,-29 L0,-21" stroke="#93c5fd"/></g>;
              return <g><rect x="-10" y="-10" width="20" height="20" fill="#a855f7"/><rect x="-6" y="-20" width="12" height="10" fill="#d8b4fe"/><circle cx="0" cy="-25" r="5" fill="white" className="animate-pulse"/></g>;
          }
      } else if (def.type === TowerType.CANNON) {
          if (tier === 1) return <g><rect x="-10" y="-5" width="20" height="15" fill="#1f2937"/><circle cx="0" cy="0" r="8" fill="#4b5563"/><rect x="0" y="-4" width="14" height="8" fill="#111827" transform="rotate(-30)"/></g>;
          if (tier === 2) return <g><rect x="-12" y="-8" width="24" height="18" fill="#111827"/><circle cx="0" cy="-2" r="10" fill="#374155"/><rect x="0" y="-6" width="18" height="12" fill="#020617" transform="rotate(-30)"/></g>;
          if (tier === 3) {
              if (t3Idx === 0) return <g><rect x="-10" y="-10" width="20" height="20" fill="#0e7490"/><path d="M-5,-10 L0,-25 L5,-10" fill="none" stroke="#67e8f9" strokeWidth="2"/><circle cx="0" cy="-25" r="4" fill="#a5f3fc" className="animate-pulse"/></g>;
              if (t3Idx === 1) return <g><rect x="-14" y="-8" width="28" height="18" fill="#1e1b4b"/><circle cx="0" cy="-2" r="12" fill="#0f172a"/><rect x="0" y="-8" width="24" height="16" fill="black" transform="rotate(-30)"/></g>;
              return <g><rect x="-10" y="-10" width="20" height="20" fill="#991b1b"/><rect x="-14" y="-5" width="4" height="12" fill="#450a0a"/><rect x="10" y="-5" width="4" height="12" fill="#450a0a"/><circle cx="0" cy="-5" r="6" fill="#fca5a5"/></g>;
          }
      } else if (def.type === TowerType.GOLD_MINE) {
          return <g><path d="M-15,10 Q0,-5 15,10" fill="none" stroke="#713f12" strokeWidth="4"/><circle cx="0" cy="5" r="3" fill="#fbbf24"/><circle cx="-6" cy="8" r="3" fill="#fbbf24"/><circle cx="6" cy="8" r="3" fill="#fbbf24"/></g>;
      } else {
          return <g><rect x="-6" y="-15" width="12" height="30" fill="#57534e"/><path d="M-10,-5 L10,-5 M-8,5 L8,5" stroke="#a8a29e" strokeWidth="2"/><circle cx="0" cy="-15" r="6" fill="#ef4444" opacity="0.5"/></g>;
      }
      return <circle r="10" fill="gray" />;
  };
  
  const getSoldierColor = (tower: ActiveTower): {fill: string, stroke: string} => {
    if (tower.tier === 1) return { fill: '#60a5fa', stroke: '#1e3a8a' }; 
    if (tower.tier === 2) return { fill: '#94a3b8', stroke: '#0f172a' }; 
    if (tower.t3Index === 0) return { fill: '#facc15', stroke: '#854d0e' }; 
    if (tower.t3Index === 1) return { fill: '#f87171', stroke: '#7f1d1d' }; 
    return { fill: '#a78bfa', stroke: '#4c1d95' }; 
  };

  const selectedTower = gameState.selectedTowerId 
    ? gameState.activeTowers.find(t => t.id === gameState.selectedTowerId) 
    : null;
  const selectedTowerDef = selectedTower 
    ? TOWER_DEFS[Object.values(TOWER_DEFS).find(d => d.id === selectedTower.defId)!.type]
    : null;
    
  const currentT3Skills = selectedTower && selectedTower.tier === 3 && selectedTowerDef?.t3Options[selectedTower.t3Index!]?.skills;

  // --- Calculate Global Buffs for UI Display ---
  let uiGlobalRangeBuff = 1.0;
  let uiGlobalDamageBuff = 1.0;
  let uiGlobalSpeedBuff = 1.0;

  if (selectedTower) {
      const uiTotemContribs: number[] = [];
      gameState.activeTowers.forEach(t => {
          const def = TOWER_DEFS[Object.values(TOWER_DEFS).find(d => d.id === t.defId)!.type];
          if (def.type === TowerType.SUPPORT) {
              if (t.tier >= 1) uiGlobalDamageBuff += 0.1;
              if (t.tier >= 2) uiGlobalRangeBuff += 0.1;
              if (t.tier === 3 && t.t3Index === 0) {
                  const contrib = TOTEM_BASE_SPEED + (t.skillLevels['totem_speed'] || 0) * TOTEM_SPEED_PER_LEVEL;
                  uiTotemContribs.push(contrib);
              }
          }
      });
      if (uiTotemContribs.length > 0) {
          uiTotemContribs.sort((a,b) => b - a);
          const applied = uiTotemContribs.slice(0, MAX_TOTEM_STACKS).reduce((s, v) => s + v, 0);
          uiGlobalSpeedBuff += Math.min(applied, MAX_TOTEM_TOTAL);
      }
      if (gameState.skillEffect?.type === 'LYRA_LIGHT') uiGlobalSpeedBuff += 1.0;
  }

  let effectiveDamage = 0;
  let effectiveRange = 0;
  let effectiveRate = 0;
  let effectiveGold = 0;

  if (selectedTower) {
      const stats = getTowerStats(selectedTower);
      const rangeBonus = (selectedTower.skillLevels['sniper_range'] || 0) * 50;
    effectiveRange = stats.range * uiGlobalRangeBuff + rangeBonus;
    if (gameState.activeEvent?.type === 'SANDSTORM') effectiveRange *= 0.75;

      const damageBonus = (selectedTower.skillLevels['gem_laser'] || 0) * 50 + (selectedTower.skillLevels['bertha_nuke'] || 0) * 300;
    effectiveDamage = stats.damage * uiGlobalDamageBuff + damageBonus;
    if (gameState.activeEvent?.type === 'NULL_FIELD') effectiveDamage *= 0.75;

      const rateBonus = (selectedTower.skillLevels['bank_speed'] || 0) * 0.1;
    // clamp UI display of global speed buff to match gameplay cap
    uiGlobalSpeedBuff = Math.min(uiGlobalSpeedBuff, MAX_GLOBAL_SPEED_BUFF);
    effectiveRate = stats.rate / uiGlobalSpeedBuff;
      if (rateBonus > 0) effectiveRate /= (1 + rateBonus);

      if (selectedTowerDef?.type === TowerType.GOLD_MINE) {
          const baseAmount = selectedTower.tier === 1 ? 15 : selectedTower.tier === 2 ? 30 : 45;
          let bonus = 0;
             if (selectedTower.tier === 3 && selectedTower.t3Index === 0) {
                 const interestLv = selectedTower.skillLevels['bank_interest'] || 0;
                 if (interestLv > 0) bonus += Math.min(Math.floor(baseAmount * (0.01 * interestLv)), BANK_INTEREST_CAP);
             }
          effectiveGold = baseAmount + bonus;
          if (gameState.goldBuffTimer > 0) effectiveGold *= 2;
      }
  }

  const gameDurationSeconds = Math.floor((Date.now() - gameState.gameStartTime) / 1000);
  const minutes = Math.floor(gameDurationSeconds / 60);
  const seconds = gameDurationSeconds % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  const mvpTower = gameState.activeTowers.reduce((prev, current) => (prev.totalDamage > current.totalDamage) ? prev : current, gameState.activeTowers[0]);
  const mvpDef = mvpTower ? TOWER_DEFS[Object.values(TOWER_DEFS).find(d => d.id === mvpTower.defId)!.type] : null;

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden flex flex-col">
       {showBestiary && <Bestiary onClose={() => setShowBestiary(false)} renderHero={(t, s) => <HeroPortrait theme={t} size={s} />} />}
       
       {/* Tutorial Modal */}
       {showTutorial && (
           <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
               <div className="bg-slate-900 border-2 border-amber-500 rounded-xl max-w-2xl w-full p-8 shadow-2xl relative">
                   <button onClick={() => setShowTutorial(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={24}/></button>
                   <h2 className="text-3xl font-bold text-amber-500 mb-6 flex items-center gap-3 border-b border-slate-700 pb-4">
                       <HelpCircle size={32}/> 新兵教官的指引
                   </h2>
                   
                   <div className="space-y-6 text-slate-300 text-lg">
                       <div className="flex gap-4">
                           <div className="bg-slate-800 p-3 rounded shrink-0 h-fit"><MousePointer className="text-blue-400"/></div>
                           <div>
                               <h3 className="text-blue-400 font-bold mb-1">基本操作</h3>
                               <p className="text-sm">點擊地圖上的圓點 <span className="text-white bg-slate-700 px-1 rounded">●</span> 來建造防禦塔。不同的防禦塔針對不同的敵人（如法師塔破甲、箭塔對空）。</p>
                           </div>
                       </div>
                       
                       <div className="flex gap-4">
                           <div className="bg-slate-800 p-3 rounded shrink-0 h-fit"><Swords className="text-red-400"/></div>
                           <div>
                               <h3 className="text-red-400 font-bold mb-1">英雄與移動</h3>
                               <p className="text-sm">英雄是強大的戰力。點擊左下角的 <span className="text-green-400 font-bold">集結 (Move)</span> 按鈕，然後點擊地圖任意位置來移動英雄。英雄會自動攻擊範圍內的敵人。</p>
                           </div>
                       </div>
                       
                       <div className="flex gap-4">
                           <div className="bg-slate-800 p-3 rounded shrink-0 h-fit"><Zap className="text-yellow-400"/></div>
                           <div>
                               <h3 className="text-yellow-400 font-bold mb-1">技能與大招</h3>
                               <p className="text-sm">當英雄頭像旁的黃色能量條集滿時，點擊 <span className="text-yellow-400 font-bold">ULTIMATE</span> 釋放毀滅性大招。善用大招扭轉戰局！</p>
                           </div>
                       </div>
                       
                       <div className="bg-amber-900/30 p-4 rounded border border-amber-800 text-center">
                           <p className="text-amber-200 font-bold">本關卡為教學關，僅有 5 波敵人。祝你好運，指揮官！</p>
                       </div>
                   </div>
                   
                   <button onClick={() => setShowTutorial(false)} className="w-full mt-8 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded shadow-lg transition-transform active:scale-95">
                       我準備好了！ (Start)
                   </button>
               </div>
           </div>
       )}
       
       {(gameState.view === GameView.GAME_OVER || gameState.view === GameView.VICTORY) && (
           <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in pointer-events-auto">
             <div className="bg-slate-900 border-2 border-slate-600 rounded-xl p-8 max-w-4xl w-full shadow-2xl relative overflow-hidden pointer-events-auto flex flex-col items-center">
                 <div className="text-center mb-8 relative z-10 w-full border-b border-slate-700 pb-6">
                     <h2 className={`text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${gameState.view === GameView.VICTORY ? 'from-amber-300 to-yellow-600' : 'from-red-500 to-red-900'} fantasy-font mb-4`}>
                         {gameState.view === GameView.VICTORY ? 'VICTORY' : 'DEFEAT'}
                     </h2>
                     <p className="text-slate-400 text-lg uppercase tracking-widest">{gameState.view === GameView.VICTORY ? 'Mission Accomplished' : 'The Line Has Fallen'}</p>
                 </div>

                 {/* Statistics Grid */}
                 <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                     <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex flex-col items-center">
                         <Clock className="text-blue-400 mb-2" size={24} />
                         <span className="text-xs text-slate-500 uppercase tracking-wide">存活時間</span>
                         <span className="text-2xl font-mono text-white font-bold">{formattedTime}</span>
                     </div>
                     <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex flex-col items-center">
                         <TrendingUp className="text-amber-400 mb-2" size={24} />
                         <span className="text-xs text-slate-500 uppercase tracking-wide">總收益</span>
                         <span className="text-2xl font-mono text-amber-400 font-bold">{Math.floor(gameState.totalGoldEarned)}g</span>
                     </div>
                     <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex flex-col items-center">
                         <Swords className="text-red-400 mb-2" size={24} />
                         <span className="text-xs text-slate-500 uppercase tracking-wide">總傷害</span>
                         <span className="text-2xl font-mono text-white font-bold">{(gameState.totalDamageDealt / 1000).toFixed(1)}k</span>
                     </div>
                     <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex flex-col items-center">
                         <Skull className="text-slate-400 mb-2" size={24} />
                         <span className="text-xs text-slate-500 uppercase tracking-wide">擊殺數</span>
                         <span className="text-2xl font-mono text-white font-bold">{gameState.enemiesKilled}</span>
                     </div>
                 </div>

                 <div className="flex gap-4 relative z-10 pointer-events-auto w-full max-w-md">
                     <button onClick={onRetry} className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg z-50">
                         <RotateCcw size={20} /> 重新挑戰
                     </button>
                     <button onClick={onExit} className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg z-50">
                         <Home size={20} /> 返回主選單
                     </button>
                 </div>
             </div>
        </div>
       )}

       {gameState.activeEvent && (
           <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 border-2 border-amber-500 px-6 py-3 rounded-lg shadow-xl flex items-center gap-4 animate-bounce-in pointer-events-none">
               <AlertTriangle size={24} className="text-amber-500 animate-pulse" />
               <div>
                   <div className="text-amber-400 font-bold uppercase tracking-wider text-sm">特殊事件 Triggered!</div>
                   <div className="text-white font-bold text-lg">{gameState.activeEvent.name}</div>
                   <div className="text-slate-400 text-xs">{gameState.activeEvent.description}</div>
               </div>
           </div>
       )}
       
       {/* Admin Mode Panel */}
       {isAdminMode && (
          <>
            <button 
                onClick={() => setShowAdminPanel(!showAdminPanel)} 
                className="absolute top-20 right-4 z-50 p-2 bg-red-900/80 border border-red-500 text-red-300 rounded hover:bg-red-800 transition-colors pointer-events-auto"
                title="Admin Panel"
            >
                <ShieldAlert size={20} />
            </button>
            
            {showAdminPanel && (
                <div className="absolute top-32 right-4 z-50 bg-slate-900/95 border border-red-500 rounded-lg p-4 w-64 shadow-2xl pointer-events-auto max-h-[70vh] flex flex-col">
                    <div className="flex justify-between items-center mb-4 border-b border-red-900/50 pb-2">
                        <h3 className="text-red-400 font-bold flex items-center gap-2"><Bug size={16}/> ADMIN TOOLS</h3>
                        <button onClick={() => setShowAdminPanel(false)} className="text-slate-500 hover:text-white"><X size={16}/></button>
                    </div>
                    
                    <button 
                        onClick={() => {
                            onLogoutAdmin();
                            setGameState(prev => ({...prev, isAdmin: false}));
                        }}
                        className="w-full bg-slate-800 hover:bg-red-900 text-slate-300 hover:text-white font-bold py-2 rounded mb-4 flex items-center justify-center gap-2 border border-slate-600 hover:border-red-500 transition-all"
                    >
                        <LogOut size={16}/> 退出管理員模式
                    </button>
                    
                    <button 
                        onClick={adminKillAll}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded mb-4 flex items-center justify-center gap-2"
                    >
                        <Skull size={16}/> KILL ALL ENEMIES
                    </button>
                    
                    <div className="text-xs text-slate-400 uppercase font-bold mb-2">Spawn Specific Enemy</div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                        {Object.values(ENEMIES).map(e => (
                            <button 
                                key={e.type}
                                onClick={() => adminSpawnEnemy(e.type)}
                                className="w-full text-left px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex justify-between items-center"
                            >
                                <span>{e.name.split(' ')[0]}</span>
                                <span className="text-[10px] text-slate-500">{e.type.replace('BOSS_', '')}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
          </>
       )}

       <div className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6 pl-20 z-50 shadow-md relative">
           <div className="flex gap-6 items-center">
               <span className={`font-bold text-xl drop-shadow-md ${gameState.isAdmin ? 'text-green-400' : 'text-amber-400'}`}>💰 {Math.floor(gameState.money)}</span>
               <span className={`text-xl font-bold drop-shadow-md ${gameState.lives < 5 ? 'text-red-500 animate-pulse' : 'text-red-400'}`}>❤️ {gameState.lives}</span>
               
               <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1 rounded-lg border border-slate-700">
                   <span className="text-blue-300 font-bold text-xl">Wave {gameState.wave}</span>
                   {/* Wave Timer Display */}
                   <span className={`text-sm font-mono flex items-center gap-1 min-w-[60px] ${gameState.waveTimer < 600 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
                       {gameState.wave < levelConfig.waves && (
                          <><Hourglass size={14} /> {Math.ceil(gameState.waveTimer / 60)}s</>
                       )}
                   </span>
               </div>

                {/* Speed Toggle */}
                <button 
                    onClick={() => setGameState(p => ({...p, gameSpeed: p.gameSpeed >= 4 ? 1 : p.gameSpeed * 2}))}
                    className="flex items-center gap-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-cyan-400 rounded border border-slate-600 font-bold font-mono transition-all active:scale-95 w-20 justify-center"
                    title="調整遊戲速度"
                >
                    <FastForward size={16} />
                    {gameState.gameSpeed}x
                </button>
               
               <button 
                onClick={callNextWave} 
                disabled={gameState.wave >= levelConfig.waves}
                className={`flex items-center gap-2 px-3 py-1 rounded border transition-all ${gameState.wave >= levelConfig.waves ? 'bg-slate-700 text-slate-500 border-slate-600 cursor-not-allowed' : 'bg-red-900/80 text-white border-red-500 hover:bg-red-700 active:scale-95'}`}
               >
                   <Skull size={18} /> NEXT WAVE
               </button>
           </div>
           <div className="flex gap-4">
              <div className="relative">
                 <button onClick={() => setIsShopOpen(!isShopOpen)} className={`p-2 rounded hover:bg-slate-600 ${isShopOpen ? 'bg-amber-600 text-white' : 'bg-slate-700 text-amber-300'} pointer-events-auto`} title="道具商店">
                    <ShoppingBag size={20}/>
                 </button>
                 {isShopOpen && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-slate-800 border border-slate-600 rounded shadow-xl p-2 z-[60] animate-in slide-in-from-top-2">
                        <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {SHOP_ITEMS.map(item => {
                                const cooldown = gameState.itemCooldowns[item.id] || 0;
                                const onCooldown = !isAdminMode && cooldown > 0;
                                return (
                                <button 
                                    key={item.id} 
                                    onClick={() => buyItem(item.id)}
                                    disabled={onCooldown || (gameState.money < item.cost && !gameState.isAdmin)}
                                    className={`relative flex items-center gap-3 p-2 rounded text-left transition-colors overflow-hidden ${!onCooldown && (gameState.money >= item.cost || gameState.isAdmin) ? 'hover:bg-slate-700' : 'opacity-50 cursor-not-allowed'}`}
                                >
                                    <div className="text-xl">{item.icon}</div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-white">{item.name}</div>
                                        <div className="text-[10px] text-slate-400">{item.description}</div>
                                    </div>
                                    <div className={`text-xs font-mono font-bold ${gameState.money >= item.cost || gameState.isAdmin ? 'text-amber-400' : 'text-red-500'}`}>{item.cost}g</div>
                                    
                                    {/* Cooldown Overlay */}
                                    {onCooldown && (
                                        <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center font-bold text-white">
                                            {Math.ceil(cooldown / 60)}s
                                        </div>
                                    )}
                                </button>
                            )})}
                        </div>
                    </div>
                 )}
              </div>
              <button onClick={() => setShowBestiary(true)} className="p-2 bg-slate-700 rounded hover:bg-slate-600 text-amber-300 pointer-events-auto" title="圖鑑">
                  <BookOpen size={20}/>
              </button>
              <button onClick={onExit} className="p-2 bg-slate-700 rounded hover:bg-slate-600 text-white pointer-events-auto flex items-center gap-1 border border-slate-600 hover:border-red-400 hover:text-red-400 transition-all" title="撤退">
                  <LogOut size={20}/> <span className="text-xs font-bold hidden md:inline">撤退</span>
              </button>
           </div>
       </div>

       <div 
         className={`flex-1 relative overflow-auto flex justify-center items-center z-0 ${isMovingHero ? 'cursor-crosshair' : 'cursor-default'}`}
         style={{ backgroundColor: levelConfig.theme.background }}
         onClick={handleMapClick}
       >
           <svg width="800" height="400" 
                className="shadow-2xl border border-slate-600 rounded-lg relative overflow-hidden transition-all"
                style={{ 
                    cursor: isSettingRally ? 'crosshair' : (isMovingHero ? 'crosshair' : 'default'), 
                    backgroundColor: levelConfig.theme.background,
                    boxShadow: isMovingHero ? '0 0 0 2px #4ade80' : ''
                }}
            >
               {renderMapDecorations()}
               {renderSkillEffect()}
               
               {levelConfig.paths.map((path, idx) => (
                   <polyline key={idx} points={path.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke={levelConfig.theme.pathColor} strokeWidth="40" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none" />
               ))}
               <g transform={`translate(${pathEnd.x}, ${pathEnd.y})`}>
                  <line x1="0" y1="0" x2="0" y2="-30" stroke="white" strokeWidth="2" />
                  <path d="M0,-30 L20,-20 L0,-10 Z" fill="#ef4444" stroke="white" />
               </g>

               {levelConfig.buildSlots.map((slot, idx) => (
                   <circle key={idx} cx={slot.x} cy={slot.y} r="22" fill="rgba(30, 41, 59, 0.5)" stroke="#475569" strokeWidth="1" className="hover:stroke-amber-500 hover:fill-slate-700 transition-colors pointer-events-none" />
               ))}

               {gameState.activeTowers.map(tower => (
                   <g key={tower.id} transform={`translate(${tower.x}, ${tower.y})`}>
                       {renderTowerVisual(tower)}
                       {gameState.selectedTowerId === tower.id && <circle cx="0" cy="0" r={getTowerStats(tower).range + (tower.skillLevels['sniper_range']||0)*50} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" pointerEvents="none" />}
                       {gameState.selectedTowerId === tower.id && tower.rallyPoint && (
                           <line x1="0" y1="0" x2={tower.rallyPoint.x - tower.x} y2={tower.rallyPoint.y - tower.y} stroke="#3b82f6" strokeWidth="2" strokeDasharray="4,2" opacity="0.6"/>
                       )}
                   </g>
               ))}
               
               {gameState.activeTowers.map(tower => {
                   if ((tower.defId === 'barracks' || tower.defId === 'mage') && (gameState.selectedTowerId === tower.id || tower.rallyPoint)) {
                       const count = tower.soldiers?.filter(s => !s.isDead).length || 0;
                       if (count > 0 && (gameState.selectedTowerId === tower.id || tower.rallyPoint)) {
                           const rally = getRallyPoint(tower, 0); 
                           return (
                               <g key={`rally-${tower.id}`} transform={`translate(${rally.x}, ${rally.y})`}>
                                   <path d="M0,0 L0,-20 L10,-15 L0,-10" stroke="#3b82f6" strokeWidth="2" fill="#60a5fa" />
                                   <circle r="3" fill="#3b82f6" />
                               </g>
                           )
                       }
                   }
                   return null;
               })}
               
               {gameState.activeTowers.map(tower => {
                   const { fill, stroke } = getSoldierColor(tower);
                   return tower.soldiers?.map(s => !s.isDead && (
                       <g key={s.id} transform={`translate(${s.x}, ${s.y})`}>
                           {s.isSummon ? (
                               <g>
                                   <circle r="6" fill={tower.t3Index===2 ? '#a16207' : '#1e1b4b'} stroke="white"/>
                               </g>
                           ) : (
                               <circle r="5" fill={fill} stroke={stroke} strokeWidth="1.5"/>
                           )}
                           <rect x="-6" y="-10" width="12" height="2" fill="red" />
                           <rect x="-6" y="-10" width={(s.hp / s.maxHp) * 12} height="2" fill="lime" />
                       </g>
                   ))
               })}

               {gameState.enemies.map(enemy => (
                   <g key={enemy.id} transform={`translate(${enemy.x}, ${enemy.y})`}>
                       {renderEnemy(enemy)}
                       <rect x="-8" y="-12" width="16" height="3" fill="#991b1b" />
                       <rect x="-8" y="-12" width={Math.max(0, (enemy.hp/enemy.maxHp)*16)} height="3" fill="#22c55e" />
                       {enemy.poisonTime > 0 && (
                            <text x="0" y="-16" fill="#10b981" fontSize="8" textAnchor="middle">☠</text>
                       )}
                   </g>
               ))}

               {gameState.heroEntity && !gameState.heroEntity.isDead && (
                 <g transform={`translate(${gameState.heroEntity.x - 15}, ${gameState.heroEntity.y - 15})`}>
                     <HeroPortrait theme={hero.visualTheme} size={30} />
                     <rect x="3" y="-8" width="24" height="4" fill="red" stroke="black" strokeWidth="0.5"/>
                     <rect x="3" y="-8" width={(gameState.heroEntity.hp / gameState.heroEntity.maxHp) * 24} height="4" fill="#3b82f6" />
                 </g>
               )}

               {gameState.projectiles.map(p => (
                   <circle key={p.id} cx={p.x} cy={p.y} r={p.isHeroProjectile ? 4 : 3} fill={p.isHeroProjectile ? hero.visualTheme.primaryColor : (p.type===ProjectileType.MAGIC?'purple':'yellow')} />
               ))}
               
               {gameState.particles.map(p => {
                    if (p.text) {
                         return <text key={p.id} x={p.x} y={p.y - (40-p.life)} fill={p.color || "#fbbf24"} fontSize="12" fontWeight="bold" textAnchor="middle" opacity={p.life/40}>{p.text}</text>
                    }
                   return <circle key={p.id} cx={p.x} cy={p.y} r={p.radius} fill={p.color} opacity={p.life/p.maxLife} />
               })}

               {/* Move Mode Indicator */}
               {isMovingHero && (
                   <g className="animate-pulse pointer-events-none">
                       <circle cx="400" cy="200" r="300" fill="none" stroke="#4ade80" strokeWidth="2" opacity="0.2" strokeDasharray="10,10"/>
                       <text x="400" y="300" textAnchor="middle" fill="#4ade80" fontSize="20" fontWeight="bold">SELECT DESTINATION</text>
                   </g>
               )}
           </svg>
       </div>

       {/* Floating Hero HUD */}
       <div className="absolute bottom-6 left-6 z-40 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-xl p-3 flex gap-3 shadow-xl pointer-events-auto">
            <div className="shrink-0 rounded-lg overflow-hidden border border-slate-600 bg-slate-800">
                <HeroPortrait theme={hero.visualTheme} size={64} />
            </div>
            <div className="flex flex-col justify-between w-32">
                <div>
                    <h3 className="text-blue-300 font-bold text-xs truncate">{hero.name}</h3>
                    <div className="w-full bg-slate-800 h-2 rounded mt-1 overflow-hidden">
                        <div className="h-full bg-green-500 transition-all" style={{width: `${gameState.heroEntity ? (gameState.heroEntity.hp / gameState.heroEntity.maxHp)*100 : 0}%`}} />
                    </div>
                </div>
                
                {/* ULTIMATE BUTTON */}
                <button 
                    onClick={activateHeroSkill}
                    disabled={(!isAdminMode && gameState.heroEntity?.isDead) || (!isAdminMode && gameState.heroEntity!.skillCooldownTimer > 0)}
                    className={`relative w-full h-8 rounded border flex items-center justify-center gap-1 text-[10px] font-bold transition-all active:scale-95 mb-1 ${
                        (isAdminMode || gameState.heroEntity?.skillCooldownTimer === 0) 
                        ? 'bg-gradient-to-r from-amber-600 to-amber-500 border-amber-400 text-white hover:from-amber-500 hover:to-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse' 
                        : 'bg-slate-800 border-slate-600 text-slate-500 cursor-not-allowed'
                    } ${gameState.activeEvent?.type === 'HERO_CD' ? 'ring-2 ring-purple-500 shadow-[0_0_15px_#a855f7] border-purple-400' : ''}`}
                >
                    <Zap size={14} className={gameState.activeEvent?.type === 'HERO_CD' ? 'text-purple-200 animate-bounce' : ''} /> 
                    {gameState.heroEntity && gameState.heroEntity.skillCooldownTimer > 0 && !isAdminMode
                        ? <span className={gameState.activeEvent?.type === 'HERO_CD' ? 'text-purple-300' : ''}>{gameState.activeEvent?.type === 'HERO_CD' && '>> '}{Math.ceil(gameState.heroEntity.skillCooldownTimer/60)}s</span>
                        : 'ULTIMATE'}
                </button>

                {/* MOVE BUTTON */}
                <button 
                    onClick={() => {
                        if (gameState.heroEntity?.isDead) return;
                        setIsMovingHero(true);
                        setIsSettingRally(false);
                        setGameState(p => ({...p, selectedTowerId: null}));
                    }}
                    disabled={gameState.heroEntity?.isDead}
                    className={`relative w-full h-6 rounded border flex items-center justify-center gap-1 text-[10px] font-bold transition-all active:scale-95 ${
                        isMovingHero
                        ? 'bg-green-600 text-white border-green-400 animate-pulse'
                        : 'bg-slate-700 hover:bg-slate-600 text-green-300 border-slate-600'
                    } ${gameState.heroEntity?.isDead ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <MousePointer size={12}/> 集結 (Move)
                </button>
            </div>
       </div>

       {/* Sliding Bottom Panel */}
       <div className={`absolute bottom-0 left-0 right-0 bg-slate-900/95 border-t border-slate-700 p-4 z-50 transition-transform duration-300 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] ${showBottomPanel ? 'translate-y-0' : 'translate-y-full'}`}>
           <button onClick={() => setShowBottomPanel(false)} className="absolute top-2 right-2 text-slate-500 hover:text-white bg-slate-800 p-1 rounded-full"><X size={16}/></button>
           
           <div className="flex justify-center h-full">
               {buildMenuOpen ? (
                   <div className="flex gap-4">
                       {Object.values(TOWER_DEFS).map(def => (
                           <button key={def.id} onClick={() => {
                                if (gameState.money >= def.t1.cost || gameState.isAdmin) {
                                  buildTower(def.type);
                                }
                           }} className="flex flex-col items-center p-3 bg-slate-800 border border-slate-600 hover:bg-slate-700 active:bg-slate-600 rounded-lg min-w-[90px] transition-colors" disabled={gameState.money < def.t1.cost && !gameState.isAdmin}>
                               <div className="text-3xl mb-2">{def.icon}</div>
                               <div className="text-xs text-slate-300 font-bold mb-1">{def.name}</div>
                               <div className={`text-xs font-mono font-bold ${gameState.money < def.t1.cost && !gameState.isAdmin ? 'text-red-500' : 'text-amber-400'}`}>{def.t1.cost}g</div>
                           </button>
                       ))}
                   </div>
               ) : selectedTower && selectedTowerDef ? (
                   <div className="flex items-center gap-6 w-full max-w-5xl px-4">
                        <div className="flex flex-col min-w-[160px] border-r border-slate-700 pr-6">
                             <h3 className="font-bold text-amber-400 text-xl mb-1">{selectedTowerDef.name}</h3>
                             <div className="text-xs text-slate-500 mb-3">Lv {selectedTower.level} • Tier {selectedTower.tier}</div>
                             
                             <div className="bg-slate-950 p-3 rounded text-xs border border-slate-700 w-full">
                                  {(selectedTowerDef.type !== TowerType.GOLD_MINE || effectiveDamage > 0) && (
                                    <>
                                      <StatRow 
                                        label="攻擊" 
                                        value={`${Math.floor(effectiveDamage)}`} 
                                        highlight={effectiveDamage > getTowerStats(selectedTower).damage}
                                      />
                                      <StatRow 
                                        label="射程" 
                                        value={`${Math.floor(effectiveRange)}`} 
                                        highlight={effectiveRange > getTowerStats(selectedTower).range}
                                      />
                                      <StatRow 
                                        label="攻速" 
                                        value={`${(effectiveRate/1000).toFixed(1)}s`} 
                                        highlight={effectiveRate < getTowerStats(selectedTower).rate}
                                      />
                                    </>
                                  )}
                                  
                                  {selectedTowerDef.type === TowerType.GOLD_MINE && effectiveDamage === 0 && (
                                      <StatRow 
                                        label="產量" 
                                        value={`${Math.floor(effectiveGold)}g / ${(effectiveRate/1000).toFixed(1)}s`} 
                                        highlight={effectiveGold > (selectedTower.tier === 1 ? 15 : selectedTower.tier === 2 ? 30 : 45)}
                                      />
                                  )}
                             </div>
                        </div>

                        <div className="flex-1 flex gap-4 items-center justify-center">
                            {selectedTower.tier === 1 && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); upgradeTower(selectedTower.id); }}
                                    className={`px-6 py-4 rounded-lg border-2 font-bold flex flex-col items-center gap-1 min-w-[160px] transition-all hover:scale-105 ${gameState.money >= selectedTowerDef.t2.cost || gameState.isAdmin ? 'bg-slate-700 hover:bg-slate-600 text-white border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'}`}
                                >
                                    <div className="flex items-center gap-2 text-base"><ArrowUp size={20}/> 升級至 T2</div>
                                    <span className={gameState.money >= selectedTowerDef.t2.cost || gameState.isAdmin ? 'text-amber-400 font-mono text-lg' : 'text-red-500 font-mono text-lg'}>{selectedTowerDef.t2.cost}g</span>
                                </button>
                            )}

                            {selectedTower.tier === 2 && (
                                <div className="flex gap-4">
                                    {selectedTowerDef.t3Options.map((opt, idx) => (
                                        <div key={idx} className="group relative">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); upgradeTower(selectedTower.id, idx); }}
                                                className={`p-3 rounded-lg border-2 font-bold flex flex-col items-center w-36 h-28 justify-center transition-all hover:scale-105 ${gameState.money >= opt.cost || gameState.isAdmin ? 'bg-slate-700 hover:bg-slate-600 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'}`}
                                            >
                                                <div className="text-sm text-center mb-1 leading-tight">{opt.name}</div>
                                                <span className={`text-sm font-mono ${gameState.money >= opt.cost || gameState.isAdmin ? 'text-amber-400' : 'text-red-500'}`}>{opt.cost}g</span>
                                            </button>
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 bg-black/90 border border-slate-500 p-3 rounded shadow-xl text-xs text-slate-300 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-[60]">
                                                <div className="font-bold text-amber-400 mb-1 text-sm">{opt.name}</div>
                                                {opt.description}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {selectedTower.tier === 3 && currentT3Skills && (
                                <div className="flex gap-4 bg-slate-800/50 p-3 rounded border border-slate-700">
                                    {currentT3Skills.map(skill => {
                                        const level = selectedTower.skillLevels[skill.id] || 0;
                                        const cost = skill.baseCost * (level + 1);
                                        const isMax = level >= skill.maxLevel;
                                        return (
                                            <div key={skill.id} className="flex flex-col items-center">
                                                <div className="text-xs font-bold text-slate-300 mb-1">{skill.name} (Lv{level})</div>
                                                <button
                                                    onClick={() => upgradeSkill(selectedTower.id, skill.id, cost)}
                                                    disabled={isMax || (gameState.money < cost && !gameState.isAdmin)}
                                                    className={`w-32 py-2 rounded border text-xs flex flex-col items-center justify-center transition-all ${
                                                        isMax ? 'bg-slate-700 border-slate-600 text-slate-400 cursor-default' :
                                                        gameState.money >= cost || gameState.isAdmin ? 'bg-blue-900/50 border-blue-500 text-blue-200 hover:bg-blue-800' :
                                                        'bg-slate-800 border-slate-700 text-red-500 cursor-not-allowed'
                                                    }`}
                                                >
                                                    {isMax ? 'MAX LEVEL' : `${skill.getEffectDesc(level + 1)}`}
                                                    {!isMax && <span className="font-mono mt-1">{cost}g</span>}
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-3 ml-auto">
                            {(selectedTowerDef.type === TowerType.BARRACKS || (selectedTowerDef.type === TowerType.MAGE && (selectedTower.t3Index === 1 || selectedTower.t3Index === 2))) && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setIsSettingRally(true); }}
                                    className={`px-4 py-2 rounded border text-sm font-bold flex items-center gap-2 transition-colors ${isSettingRally ? 'bg-green-600 text-white border-green-400 animate-pulse' : 'bg-slate-700 text-slate-300 border-slate-500 hover:bg-slate-600 hover:text-white'}`}
                                >
                                    <Crosshair size={16}/> {isSettingRally ? '點擊地圖...' : '設定集結點'}
                                </button>
                            )}
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const tId = gameState.selectedTowerId;
                                    if(tId) {
                                        const tower = gameState.activeTowers.find(t => t.id === tId);
                                        const refund = Math.floor(tower ? tower.totalInvestment * 0.7 : 50);
                                        setGameState(p => ({...p, activeTowers: p.activeTowers.filter(t => t.id !== tId), money: p.money + refund, selectedTowerId: null}));
                                        setShowBottomPanel(false);
                                    }
                                }}
                                className="px-4 py-2 bg-red-900/30 border border-red-800 text-red-400 rounded hover:bg-red-900 hover:text-red-200 text-sm transition-colors"
                            >
                                出售 (Sell)
                            </button>
                        </div>
                   </div>
               ) : null}
           </div>
       </div>
    </div>
  );
};

export default GameLevel;
