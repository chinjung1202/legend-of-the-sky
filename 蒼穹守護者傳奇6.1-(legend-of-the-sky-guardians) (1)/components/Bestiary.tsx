

import React, { useState } from 'react';
import { HEROES, TOWER_DEFS, ENEMIES } from '../constants';
import { TowerType, EnemyType, HeroVisualTheme, EnemyDef, TowerDef } from '../types';
import { X, Sword, Shield, Heart, Zap, Wind, Footprints, Coins, Activity, BookOpen, Clock, Target, Crosshair } from 'lucide-react';

interface BestiaryProps {
  onClose: () => void;
  renderHero: (theme: HeroVisualTheme, size: number) => React.ReactNode;
}

const Bestiary: React.FC<BestiaryProps> = ({ onClose, renderHero }) => {
  const [tab, setTab] = useState<'HEROES' | 'TOWERS' | 'ENEMIES'>('ENEMIES');
  const [selectedEnemyType, setSelectedEnemyType] = useState<EnemyType>(EnemyType.SLIME);

  const renderEnemyPreview = (enemy: EnemyDef, scale: number = 2.5) => {
      const color = enemy.visualColor;
      const size = 24 * scale;
      const offset = size / 2;
      
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-2xl">
            <g transform={`translate(${offset}, ${offset}) scale(${scale})`}>
                <rect x="-6" y="-8" width="12" height="16" fill={color} />
                <rect x="-4" y="-6" width="4" height="4" fill="white" opacity="0.5" />
                <rect x="0" y="-6" width="4" height="4" fill="white" opacity="0.5" />
                <rect x="-6" y="8" width="4" height="4" fill="black" />
                <rect x="2" y="8" width="4" height="4" fill="black" />
                
                {enemy.isFlying && (
                    <path d="M-10,-5 L-6,-2 M10,-5 L6,-2" stroke="white" strokeWidth="2" />
                )}
                {(enemy.type === EnemyType.ORC || enemy.type === EnemyType.GOLEM) && (
                    <rect x="-7" y="-2" width="14" height="8" fill="none" stroke="black" strokeWidth="1" />
                )}
                {enemy.type === EnemyType.DEMON && (
                     <path d="M-4,-10 L-6,-14 M4,-10 L6,-14" stroke={color} strokeWidth="2" />
                )}
                 {enemy.type === EnemyType.ARMORED_KNIGHT && (
                     <rect x="-5" y="-7" width="10" height="14" fill="silver" opacity="0.5" />
                )}
                {enemy.type === EnemyType.ASSASSIN && (
                    <path d="M-8,0 L8,0 L0,10 Z" fill="black" opacity="0.3" /> 
                )}
                {enemy.type === EnemyType.NECROMANCER && (
                    <circle r="12" fill="none" stroke="green" strokeWidth="0.5" className="animate-pulse" />
                )}
                {enemy.type === EnemyType.BEHEMOTH && (
                    <g transform="scale(1.2)">
                        <rect x="-9" y="-4" width="18" height="6" fill="none" stroke="black" strokeWidth="1" />
                        <path d="M-5,-10 L-7,-14 M5,-10 L7,-14" stroke="white" strokeWidth="2" />
                    </g>
                )}
                {enemy.type === EnemyType.TITAN && (
                    <g transform="scale(1.3)">
                        <rect x="-8" y="-12" width="16" height="20" fill="none" stroke="orange" strokeWidth="1" />
                        <circle r="4" fill="orange" className="animate-pulse" />
                    </g>
                )}
                {enemy.type === EnemyType.SPIDER && (
                    <g transform="scale(0.8)">
                        <circle r="8" fill={color} />
                        <path d="M-8,0 L-12,-8 M-8,4 L-12,8 M8,0 L12,-8 M8,4 L12,8" stroke={color} strokeWidth="2" />
                    </g>
                )}
                {enemy.type === EnemyType.GHOST && (
                    <path d="M-6,-10 Q0,-15 6,-10 L6,10 Q3,8 0,10 Q-3,8 -6,10 Z" fill={color} opacity="0.6" />
                )}
                {enemy.type === EnemyType.VAMPIRE && (
                    <path d="M-8,-10 L8,-10 L0,10 Z" fill="#7f1d1d" />
                )}
                {enemy.type === EnemyType.VOID_LORD && (
                    <g transform="scale(1.5)">
                        <circle r="15" fill="none" stroke="purple" strokeWidth="1" strokeDasharray="2,2" className="animate-spin-slow" />
                        <path d="M-10,-15 L0,-25 L10,-15" stroke="purple" fill="none" />
                    </g>
                )}
            </g>
        </svg>
      );
  };

  const renderTowerStats = (tower: TowerDef) => {
      const t1 = tower.t1;
      return (
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-400 mt-2 bg-black/20 p-2 rounded">
              {t1.damage > 0 && <span>攻擊: <b className="text-slate-200">{t1.damage}</b></span>}
              {t1.range > 0 && <span>射程: <b className="text-slate-200">{t1.range}</b></span>}
              {t1.rate > 0 && <span>攻速: <b className="text-slate-200">{(1000/t1.rate).toFixed(1)}/s</b></span>}
              {t1.soldierHp && <span>士兵血量: <b className="text-green-400">{t1.soldierHp}</b></span>}
              {t1.soldierArmor && <span>士兵護甲: <b className="text-yellow-400">{t1.soldierArmor*100}%</b></span>}
              {t1.splashRadius && <span>爆炸範圍: <b className="text-orange-400">{t1.splashRadius}</b></span>}
              {t1.armorIgnoreChance && <span>無視護甲: <b className="text-purple-400">{(t1.armorIgnoreChance*100)}%</b></span>}
          </div>
      );
  }

  const renderContent = () => {
    switch (tab) {
      case 'HEROES':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 h-full overflow-y-auto p-6 custom-scrollbar pb-20">
            {HEROES.map(hero => (
              <div key={hero.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-6 hover:border-amber-500 transition-colors shadow-lg">
                <div className="flex gap-4">
                    <div className="w-20 h-20 bg-slate-900 rounded-full border-4 border-slate-600 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
                        <div className="transform scale-75 origin-center">
                            {renderHero(hero.visualTheme, 80)}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-amber-400 mb-1 truncate">{hero.name}</h3>
                        <div className="text-xs text-blue-300 mb-2 uppercase tracking-wider font-bold truncate">{hero.role}</div>
                        
                        <div className="grid grid-cols-3 gap-1 text-[10px] bg-black/20 p-1 rounded">
                            <span className="flex items-center gap-1 text-green-400 font-mono"><Heart size={10}/> {hero.baseStats.hp}</span>
                            <span className="flex items-center gap-1 text-red-400 font-mono"><Sword size={10}/> {hero.baseStats.atk}</span>
                            <span className="flex items-center gap-1 text-yellow-400 font-mono"><Shield size={10}/> {hero.baseStats.armor*100}%</span>
                        </div>
                    </div>
                </div>

                <div className="text-xs text-slate-400 leading-relaxed italic border-l-2 border-slate-600 pl-3 line-clamp-3">
                    "{hero.description}"
                </div>

                <div className="bg-slate-900/50 p-3 rounded border border-slate-700 flex-1">
                    <h4 className="text-[10px] font-bold text-amber-500 uppercase mb-2 flex items-center gap-1"><Zap size={10}/> 天賦樹 (Talent Tree)</h4>
                    <div className="space-y-2">
                        <div>
                            <div className="text-[9px] text-slate-500 font-bold">TIER 1</div>
                            <div className="grid grid-cols-2 gap-1">
                                {hero.talentTree?.t1.map(t => (
                                    <div key={t.id} className="bg-slate-800 p-1 rounded border border-slate-700 text-[9px] truncate" title={t.description}>
                                        <span className="text-slate-300">{t.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div className="text-[9px] text-slate-500 font-bold">TIER 2</div>
                            <div className="grid grid-cols-2 gap-1">
                                {hero.talentTree?.t2.map(t => (
                                    <div key={t.id} className="bg-slate-800 p-1 rounded border border-slate-700 text-[9px] truncate" title={t.description}>
                                        <span className="text-slate-300">{t.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div className="text-[9px] text-slate-500 font-bold">TIER 3</div>
                            <div className="bg-amber-900/20 p-1 rounded border border-amber-800/50 text-[9px] truncate" title={hero.talentTree?.t3[0].description}>
                                <span className="text-amber-400 font-bold">{hero.talentTree?.t3[0].name}</span>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'TOWERS':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-y-auto p-6 custom-scrollbar pb-20">
            {Object.values(TOWER_DEFS).map(tower => (
              <div key={tower.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col h-full">
                <div className="flex items-center gap-4 mb-4 border-b border-slate-700 pb-4">
                   <div className="text-5xl bg-slate-900 w-16 h-16 flex items-center justify-center rounded-lg border border-slate-600 shadow-inner">{tower.icon}</div>
                   <div>
                     <h3 className="text-2xl font-bold text-blue-300 mb-1">{tower.name}</h3>
                     <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-700 uppercase tracking-widest">{tower.type}</span>
                   </div>
                </div>
                
                {renderTowerStats(tower)}

                <div className="space-y-3 mt-4 flex-1">
                   {/* T1 */}
                   <div className="bg-slate-900/50 p-3 rounded flex justify-between items-start border-l-2 border-blue-500">
                      <div>
                          <div className="font-bold text-slate-200 text-sm">Lv1. {tower.t1.name}</div>
                          <div className="text-xs text-slate-500">{tower.t1.description}</div>
                      </div>
                      <div className="text-amber-500 font-mono font-bold text-xs">{tower.t1.cost}g</div>
                   </div>
                   {/* T2 */}
                   <div className="bg-slate-900/50 p-3 rounded flex justify-between items-start border-l-2 border-purple-500">
                      <div>
                          <div className="font-bold text-slate-200 text-sm">Lv2. {tower.t2.name}</div>
                          <div className="text-xs text-slate-500">{tower.t2.description}</div>
                      </div>
                      <div className="text-amber-500 font-mono font-bold text-xs">{tower.t2.cost}g</div>
                   </div>
                   {/* T3 */}
                   <div className="bg-slate-900/30 p-3 rounded border border-amber-900/30">
                      <div className="font-bold text-amber-500 mb-2 text-xs uppercase tracking-wider border-b border-slate-700 pb-1">Lv3 專精分支 (Specializations)</div>
                      <div className="grid grid-cols-1 gap-2">
                        {tower.t3Options.map(t3 => (
                            <div key={t3.name} className="flex flex-col text-xs pl-2 bg-slate-950/50 p-2 rounded mb-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-slate-200 font-bold">{t3.name}</span>
                                    <span className="text-amber-500 font-mono">{t3.cost}g</span>
                                </div>
                                <div className="text-[10px] text-slate-500 mb-2">{t3.description}</div>
                                
                                {t3.skills && (
                                    <div className="grid grid-cols-2 gap-2 mt-1 border-t border-slate-800 pt-1">
                                        {t3.skills.map(s => (
                                            <div key={s.id} className="text-[9px]">
                                                <div className="text-blue-300 font-bold">◆ {s.name}</div>
                                                <div className="text-slate-500">{s.description}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'ENEMIES':
        const activeEnemy = ENEMIES[selectedEnemyType];
        return (
          <div className="flex h-full overflow-hidden bg-slate-950">
            {/* Left Sidebar: List */}
            <div className="w-1/3 min-w-[250px] bg-slate-900 border-r border-slate-700 flex flex-col h-full z-10">
                <div className="p-4 border-b border-slate-800 bg-slate-900">
                    <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider">魔物列表</h3>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1 pb-20">
                    {Object.values(ENEMIES).map(enemy => (
                        <button
                            key={enemy.type}
                            onClick={() => setSelectedEnemyType(enemy.type)}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left group ${selectedEnemyType === enemy.type ? 'bg-amber-900/20 border border-amber-600/50' : 'hover:bg-slate-800 border border-transparent'}`}
                        >
                            <div className={`w-10 h-10 rounded flex items-center justify-center bg-slate-950 border ${selectedEnemyType === enemy.type ? 'border-amber-500' : 'border-slate-700'}`}>
                                {renderEnemyPreview(enemy, 1.5)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className={`font-bold text-sm truncate ${selectedEnemyType === enemy.type ? 'text-amber-400' : 'text-slate-300'}`}>{enemy.name.split(' ')[0]}</div>
                                <div className="text-[10px] text-slate-500 uppercase">{enemy.type === EnemyType.VOID_LORD ? 'BOSS' : enemy.type}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Right Content: Detail View */}
            <div className="flex-1 h-full overflow-y-auto bg-slate-950 relative custom-scrollbar">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                
                <div className="p-8 md:p-12 flex flex-col items-center min-h-full pb-24">
                    <div className="w-full max-w-2xl mb-8 flex flex-col items-center relative">
                         <div className="absolute top-0 right-0">
                            {activeEnemy.type === EnemyType.VOID_LORD && (
                                <span className="px-3 py-1 rounded text-xs font-bold bg-red-900/50 border border-red-500 text-red-400 flex items-center gap-1 mb-2">
                                    <Target size={14} /> WORLD BOSS
                                </span>
                            )}
                            <span className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1 border ${activeEnemy.isFlying ? 'bg-sky-900/30 border-sky-500 text-sky-400' : 'bg-stone-800/30 border-stone-500 text-stone-400'}`}>
                                {activeEnemy.isFlying ? <><Wind size={14} /> 飛行</> : <><Footprints size={14} /> 地面</>}
                            </span>
                         </div>

                         <div className="w-48 h-48 mb-6 flex items-center justify-center relative">
                             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent rounded-full opacity-50 blur-xl"></div>
                             {renderEnemyPreview(activeEnemy, 6)}
                         </div>

                         <h2 className="text-4xl md:text-5xl font-bold text-white mb-2 text-center text-shadow">{activeEnemy.name}</h2>
                         <div className="h-1 w-24 bg-gradient-to-r from-transparent via-amber-500 to-transparent mb-6"></div>
                    </div>

                    <div className="w-full max-w-3xl grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                         <div className="bg-slate-900/50 border border-slate-700 p-4 rounded-lg flex flex-col items-center justify-center gap-1">
                             <Heart className="text-green-500 mb-1" />
                             <span className="text-slate-400 text-xs uppercase">生命值</span>
                             <span className="text-2xl font-mono font-bold text-white">{activeEnemy.baseHp}</span>
                         </div>
                         <div className="bg-slate-900/50 border border-slate-700 p-4 rounded-lg flex flex-col items-center justify-center gap-1">
                             <Activity className="text-blue-500 mb-1" />
                             <span className="text-slate-400 text-xs uppercase">速度</span>
                             <span className="text-2xl font-mono font-bold text-white">{activeEnemy.baseSpeed}</span>
                         </div>
                         <div className="bg-slate-900/50 border border-slate-700 p-4 rounded-lg flex flex-col items-center justify-center gap-1">
                             <Shield className="text-yellow-500 mb-1" />
                             <span className="text-slate-400 text-xs uppercase">物理護甲</span>
                             <span className="text-2xl font-mono font-bold text-white">{(activeEnemy.armor * 100).toFixed(0)}%</span>
                         </div>
                         <div className="bg-slate-900/50 border border-slate-700 p-4 rounded-lg flex flex-col items-center justify-center gap-1">
                             <Coins className="text-amber-500 mb-1" />
                             <span className="text-slate-400 text-xs uppercase">賞金</span>
                             <span className="text-2xl font-mono font-bold text-white">{activeEnemy.reward}g</span>
                         </div>
                    </div>

                    <div className="w-full max-w-3xl bg-slate-900/60 border border-slate-700 p-8 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-600"></div>
                        <h4 className="text-amber-500 font-bold mb-4 flex items-center gap-2"><BookOpen size={18}/> 生態紀錄</h4>
                        <p className="text-slate-300 leading-relaxed text-lg text-justify font-serif tracking-wide">
                            {activeEnemy.description}
                        </p>
                    </div>
                </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[90vh] bg-slate-950 rounded-xl border border-slate-700 flex flex-col shadow-2xl relative overflow-hidden">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white z-50 p-2 hover:bg-slate-800 rounded-full transition-colors">
          <X size={28} />
        </button>
        
        <div className="px-6 pt-6 pb-0 border-b border-slate-800 bg-slate-950 z-20 shadow-md flex flex-col md:flex-row justify-between items-end gap-4">
          <div className="mb-2">
            <h2 className="text-3xl fantasy-font text-amber-500 flex items-center gap-3">
               <span className="text-4xl drop-shadow-md">📜</span> 艾特拉大圖鑑
            </h2>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-0 scrollbar-hide">
             {(['ENEMIES', 'HEROES', 'TOWERS'] as const).map(t => (
               <button 
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-3 rounded-t-lg text-sm font-bold transition-all shrink-0 border-t border-x relative top-[1px] ${
                    tab === t 
                    ? 'bg-slate-900 text-amber-400 border-slate-700 border-b-slate-900 z-10' 
                    : 'bg-slate-950 text-slate-500 border-transparent hover:bg-slate-900 hover:text-slate-300'
                }`}
               >
                 {t === 'ENEMIES' ? '魔物 (Bestiary)' : t === 'HEROES' ? '英靈 (Heroes)' : '建築 (Towers)'}
               </button>
             ))}
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-slate-900 relative z-10">
           {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Bestiary;
