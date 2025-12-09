
import React, { useState, useEffect } from 'react';
import { Hero, HeroVisualTheme, SelectedTalents, Talent } from '../types';
import { HEROES } from '../constants';
import { ChevronRight, Shield, Sword, Heart, Zap, CheckCircle } from 'lucide-react';

interface HeroSelectProps {
  onSelectHero: (hero: Hero, talents: SelectedTalents) => void;
  onBack: () => void;
}

// Pixel Art Rendering Logic
export const HeroPortrait: React.FC<{ theme: HeroVisualTheme, size: number }> = ({ theme, size }) => {
  const { primaryColor, secondaryColor, accentColor, eyeColor, hairStyle, feature } = theme;
  
  // Define a 12x12 pixel grid for the face/bust
  const pixelSize = size / 12;
  
  // Helper to render a pixel rect
  const renderPixel = (x: number, y: number, color: string, key: string) => (
    <rect key={key} x={x * pixelSize} y={y * pixelSize} width={pixelSize + 0.5} height={pixelSize + 0.5} fill={color} />
  );

  // Dynamic Pixel Generation based on traits
  const renderPixels = () => {
    const pixels = [];
    
    // Background Aura (Glow)
    pixels.push(<rect key="bg" x={0} y={0} width={size} height={size} fill={primaryColor} opacity={0.2} />);
    
    // --- 1. Back Hair ---
    const hairColor = secondaryColor;
    if (hairStyle === 'LONG') {
       for(let y=3; y<12; y++) for(let x=2; x<10; x++) pixels.push(renderPixel(x, y, hairColor, `bh-${x}-${y}`));
    } else if (hairStyle === 'TWINTAILS') {
       for(let y=3; y<10; y++) {
           pixels.push(renderPixel(1, y, hairColor, `ltt-${y}`));
           pixels.push(renderPixel(10, y, hairColor, `rtt-${y}`));
       }
    }

    // --- 2. Body / Armor ---
    // Shoulders
    for(let x=3; x<=8; x++) pixels.push(renderPixel(x, 10, primaryColor, `body-${x}`));
    for(let x=2; x<=9; x++) pixels.push(renderPixel(x, 11, primaryColor, `body-low-${x}`));
    // Chest detail
    pixels.push(renderPixel(5, 11, accentColor, "chest"));
    pixels.push(renderPixel(6, 11, accentColor, "chest2"));

    // --- 3. Head (Skin) ---
    const skinColor = "#ffe4c4"; // Bisque
    for(let y=4; y<=9; y++) for(let x=3; x<=8; x++) pixels.push(renderPixel(x, y, skinColor, `head-${x}-${y}`));
    
    // Chin shape refinement
    pixels.push(renderPixel(5, 9, skinColor, "chin"));
    pixels.push(renderPixel(6, 9, skinColor, "chin2"));

    // --- 4. Face Features ---
    // Eyes
    pixels.push(renderPixel(4, 6, eyeColor, "leye"));
    pixels.push(renderPixel(7, 6, eyeColor, "reye"));
    // Blush
    pixels.push(renderPixel(3, 7, "#fca5a5", "lblush")); // light pink
    pixels.push(renderPixel(8, 7, "#fca5a5", "rblush"));

    // --- 5. Front Hair ---
    // Bangs
    for(let x=3; x<=8; x++) pixels.push(renderPixel(x, 3, hairColor, `bangs-${x}`));
    pixels.push(renderPixel(3, 4, hairColor, "bang1"));
    pixels.push(renderPixel(8, 4, hairColor, "bang2"));
    if (hairStyle === 'PONYTAIL') {
        pixels.push(renderPixel(9, 3, hairColor, "pt1"));
        pixels.push(renderPixel(10, 4, hairColor, "pt2"));
    }

    // --- 6. Special Features ---
    if (feature === 'HORNS') {
        pixels.push(renderPixel(3, 2, accentColor, "horn1"));
        pixels.push(renderPixel(8, 2, accentColor, "horn2"));
        pixels.push(renderPixel(2, 1, accentColor, "horn1t"));
        pixels.push(renderPixel(9, 1, accentColor, "horn2t"));
    }
    if (feature === 'FOX_EARS') {
        pixels.push(renderPixel(3, 2, hairColor, "ear1"));
        pixels.push(renderPixel(8, 2, hairColor, "ear2"));
        pixels.push(renderPixel(3, 1, "white", "ear1t"));
        pixels.push(renderPixel(8, 1, "white", "ear2t"));
    }
    if (feature === 'HAT') {
        for(let x=2; x<=9; x++) pixels.push(renderPixel(x, 2, primaryColor, `hat-${x}`));
        for(let x=3; x<=8; x++) pixels.push(renderPixel(x, 1, primaryColor, `hat-top-${x}`));
    }

    return pixels;
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-hidden shadow-lg bg-slate-900 border-2 border-slate-700 rounded-md">
      {renderPixels()}
      {/* Scanline effect for retro feel */}
      <line x1="0" y1="0" x2={size} y2={size} stroke="white" strokeOpacity="0.1" strokeWidth="1" />
    </svg>
  );
};

const HeroSelect: React.FC<HeroSelectProps> = ({ onSelectHero, onBack }) => {
  const [selectedId, setSelectedId] = useState<string>(HEROES[0].id);
  const [talents, setTalents] = useState<SelectedTalents>({ t1: null, t2: null, t3: null });

  const activeHero = HEROES.find(h => h.id === selectedId) || HEROES[0];

  // Reset talents when hero changes
  useEffect(() => {
    if (activeHero.talentTree) {
      setTalents({
        t1: activeHero.talentTree.t1[0].id,
        t2: activeHero.talentTree.t2[0].id,
        t3: activeHero.talentTree.t3[0].id
      });
    }
  }, [selectedId]);

  const toggleTalent = (tier: keyof SelectedTalents, id: string) => {
    setTalents(prev => ({ ...prev, [tier]: id }));
  };

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col md:flex-row text-white overflow-hidden">
      {/* Left: Hero List */}
      <div className="w-full md:w-80 bg-slate-900 border-r border-slate-800 flex flex-col z-30 shadow-2xl shrink-0 h-1/3 md:h-full">
        {/* Added pl-20 to accommodate the global settings button in top-left */}
        <div className="p-4 border-b border-slate-800 bg-slate-900 z-10 sticky top-0 pl-20">
            <h2 className="text-xl fantasy-font text-amber-500 tracking-wider">英雄選擇</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
          {HEROES.map(hero => (
            <div 
              key={hero.id}
              onClick={() => setSelectedId(hero.id)}
              className={`p-2 rounded-md cursor-pointer transition-all border flex items-center gap-3 group ${
                selectedId === hero.id 
                  ? 'bg-slate-800 border-amber-500/50 shadow-md' 
                  : 'bg-transparent border-transparent hover:bg-slate-800/50'
              }`}
            >
               <div className="shrink-0">
                  <HeroPortrait theme={hero.visualTheme} size={48} />
               </div>
               <div className="flex-1 min-w-0">
                  <div className={`font-bold text-sm truncate ${selectedId === hero.id ? 'text-amber-400' : 'text-slate-300'}`}>
                      {hero.name}
                  </div>
                  <div className="text-xs text-slate-500 truncate">{hero.role}</div>
               </div>
               {selectedId === hero.id && <ChevronRight size={16} className="text-amber-500 animate-pulse" />}
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-slate-800 bg-slate-900">
             <button onClick={onBack} className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-sm transition-colors">
              返回主選單
            </button>
        </div>
      </div>

      {/* Right: Hero Details - Flex Column with Scrolling Content and Fixed Footer */}
      <div className="flex-1 flex flex-col h-2/3 md:h-full bg-slate-950 relative overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>

        {/* Scrolling Content Area */}
        <div className="flex-1 overflow-y-auto p-6 z-10">
            <div className="flex flex-col items-center justify-center min-h-min pb-24">
                {/* Large Portrait */}
                <div className="animate-fade-in-up mb-6 relative">
                    <div className="absolute -inset-4 bg-amber-500/20 rounded-full blur-xl animate-pulse"></div>
                    <HeroPortrait theme={activeHero.visualTheme} size={200} />
                </div>

                <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Hero Info Card */}
                    <div className="bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg shadow-2xl p-6 relative">
                        <div className="text-center mb-6">
                            <h1 className="text-3xl font-bold text-white fantasy-font mb-1 tracking-widest">{activeHero.name}</h1>
                            <span className="text-blue-400 text-xs tracking-[0.2em] uppercase bg-blue-900/30 px-3 py-1 rounded-full border border-blue-500/20">{activeHero.role}</span>
                        </div>
                        
                        <p className="text-sm text-slate-300 mb-6 leading-relaxed text-center italic border-b border-slate-800 pb-4">
                            "{activeHero.description}"
                        </p>

                        <div className="grid grid-cols-3 gap-3 mb-6">
                            <div className="bg-slate-800 p-2 rounded border border-slate-700 text-center">
                            <div className="text-green-400 mb-1 flex justify-center"><Heart size={16}/></div>
                            <span className="text-xs text-slate-400 block">生命</span>
                            <span className="font-mono font-bold">{activeHero.baseStats.hp}</span>
                            </div>
                            <div className="bg-slate-800 p-2 rounded border border-slate-700 text-center">
                            <div className="text-red-400 mb-1 flex justify-center"><Sword size={16}/></div>
                            <span className="text-xs text-slate-400 block">攻擊</span>
                            <span className="font-mono font-bold">{activeHero.baseStats.atk}</span>
                            </div>
                            <div className="bg-slate-800 p-2 rounded border border-slate-700 text-center">
                            <div className="text-yellow-400 mb-1 flex justify-center"><Shield size={16}/></div>
                            <span className="text-xs text-slate-400 block">護甲</span>
                            <span className="font-mono font-bold">{activeHero.baseStats.armor * 100}%</span>
                            </div>
                        </div>

                        <div className="bg-slate-800/50 rounded p-3 border border-slate-700">
                            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
                                <Zap size={14} /> {activeHero.ultimateName}
                            </div>
                            <p className="text-xs text-slate-400">{activeHero.ultimateDesc}</p>
                        </div>
                    </div>

                    {/* Talent Tree Card */}
                    <div className="bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg shadow-2xl p-6 relative flex flex-col">
                        <h3 className="text-xl font-bold text-amber-500 mb-4 flex items-center gap-2">
                             <Shield size={20}/> 戰鬥天賦 (Talents)
                        </h3>
                        
                        {activeHero.talentTree && (
                            <div className="space-y-4 flex-1">
                                {/* Tier 1 */}
                                <div className="space-y-2">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tier 1: 基礎強化</div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {activeHero.talentTree.t1.map(t => (
                                            <button 
                                                key={t.id}
                                                onClick={() => toggleTalent('t1', t.id)}
                                                className={`p-3 rounded border text-left transition-all relative ${talents.t1 === t.id ? 'bg-blue-900/40 border-blue-500' : 'bg-slate-800 border-slate-700 hover:bg-slate-750'}`}
                                            >
                                                <div className="font-bold text-slate-200 text-sm mb-1">{t.name}</div>
                                                <div className="text-[10px] text-slate-400 leading-tight">{t.description}</div>
                                                {talents.t1 === t.id && <CheckCircle size={16} className="absolute top-2 right-2 text-blue-400" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tier 2 */}
                                <div className="space-y-2">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tier 2: 戰術精通</div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {activeHero.talentTree.t2.map(t => (
                                            <button 
                                                key={t.id}
                                                onClick={() => toggleTalent('t2', t.id)}
                                                className={`p-3 rounded border text-left transition-all relative ${talents.t2 === t.id ? 'bg-purple-900/40 border-purple-500' : 'bg-slate-800 border-slate-700 hover:bg-slate-750'}`}
                                            >
                                                <div className="font-bold text-slate-200 text-sm mb-1">{t.name}</div>
                                                <div className="text-[10px] text-slate-400 leading-tight">{t.description}</div>
                                                {talents.t2 === t.id && <CheckCircle size={16} className="absolute top-2 right-2 text-purple-400" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tier 3 */}
                                <div className="space-y-2">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tier 3: 終極覺醒</div>
                                    <div className="grid grid-cols-1 gap-3">
                                        {activeHero.talentTree.t3.map(t => (
                                            <button 
                                                key={t.id}
                                                onClick={() => toggleTalent('t3', t.id)}
                                                className={`p-3 rounded border text-left transition-all relative ${talents.t3 === t.id ? 'bg-amber-900/40 border-amber-500' : 'bg-slate-800 border-slate-700 hover:bg-slate-750'}`}
                                            >
                                                <div className="font-bold text-amber-200 text-sm mb-1">{t.name}</div>
                                                <div className="text-[10px] text-slate-400 leading-tight">{t.description}</div>
                                                {talents.t3 === t.id && <CheckCircle size={16} className="absolute top-2 right-2 text-amber-400" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Fixed Footer for Button - High Z-Index to prevent overlap */}
        <div className="p-6 bg-slate-950 border-t border-slate-800 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
            <button 
                onClick={() => onSelectHero(activeHero, talents)}
                className="w-full max-w-lg mx-auto block bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold py-4 rounded shadow-[0_0_15px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 transition-transform active:scale-95 text-lg tracking-widest"
            >
                <Sword size={20} className="animate-pulse" /> 確認出擊 (Start)
            </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSelect;
