
import React, { useState } from 'react';
import { LEVELS } from '../constants';
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Coins, Skull } from 'lucide-react';

interface LevelSelectProps {
  onSelectLevel: (levelId: number) => void;
  onBack: () => void;
}

const LevelSelect: React.FC<LevelSelectProps> = ({ onSelectLevel, onBack }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < LEVELS.length - 1 ? prev + 1 : prev));
  };

  const activeLevel = LEVELS[activeIndex];

  const getDifficultyLabel = (level: typeof LEVELS[0]) => {
      if (level.id === 0) return '教學模式';
      if (level.waves >= 999) return '無盡模式';
      return '戰役模式';
  };

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Ambience */}
      <div 
        className="absolute inset-0 opacity-80 pointer-events-none transition-colors duration-500"
        style={{ background: `radial-gradient(ellipse at center, ${activeLevel.theme.background}, #000000)` }}
      />
      
      <div className="z-10 w-full max-w-6xl px-4 flex flex-col items-center h-full justify-center">
        <h2 className="text-4xl md:text-5xl fantasy-font text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-600 mb-8 tracking-widest drop-shadow-2xl">
          選擇戰役地圖
        </h2>

        {/* Carousel Container */}
        <div className="relative w-full flex items-center justify-center gap-4 md:gap-8">
          
          {/* Prev Button */}
          <button 
            onClick={handlePrev}
            disabled={activeIndex === 0}
            className={`p-4 rounded-full bg-slate-800/80 border border-slate-600 text-amber-500 hover:bg-slate-700 hover:scale-110 transition-all z-20 shadow-lg backdrop-blur-sm ${activeIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
          >
            <ChevronLeft size={32} />
          </button>

          {/* Sliding Window */}
          <div className="w-full max-w-4xl overflow-hidden rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-slate-700 bg-slate-900/50 backdrop-blur-md relative aspect-[16/9] md:aspect-[2/1]">
             
             {/* Slider Track */}
             <div 
                className="flex transition-transform duration-500 ease-out h-full"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
             >
                {LEVELS.map((level) => (
                  <div key={level.id} className="min-w-full h-full flex flex-col relative group">
                      
                      {/* Map Visuals */}
                      <div className="absolute inset-0 z-0" style={{ backgroundColor: level.theme.background }}>
                          {/* Grid Background */}
                          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                          
                          {/* SVG Map Path */}
                          <svg viewBox="0 0 800 400" className="w-full h-full preserve-3d">
                              {/* Decorations would go here if rendered in preview, using simpler rect for now */}
                              <rect width="800" height="400" fill="transparent" />
                              
                              {level.paths.map((path, idx) => (
                                  <g key={idx}>
                                    {/* Path Shadow/Outline */}
                                    <polyline 
                                        points={path.map(p => `${p.x},${p.y}`).join(' ')} 
                                        fill="none" 
                                        stroke="#1e293b" 
                                        strokeWidth="45" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                    />
                                    {/* Path Inner */}
                                    <polyline 
                                        points={path.map(p => `${p.x},${p.y}`).join(' ')} 
                                        fill="none" 
                                        stroke={level.theme.pathColor} 
                                        strokeWidth="35" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                    />
                                    {/* Path Highlight */}
                                    <polyline 
                                        points={path.map(p => `${p.x},${p.y}`).join(' ')} 
                                        fill="none" 
                                        stroke="rgba(255,255,255,0.2)" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeDasharray="10,10"
                                        className="animate-[dash_60s_linear_infinite]"
                                    />
                                  </g>
                              ))}

                              {/* Build Slots */}
                              {level.buildSlots.map((slot, idx) => (
                                  <circle key={idx} cx={slot.x} cy={slot.y} r="12" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
                              ))}

                              {/* Start/End Markers */}
                              <circle cx={level.paths[0][0].x} cy={level.paths[0][0].y} r="15" fill="#ef4444" opacity="0.8" />
                              <circle cx={level.paths[0][level.paths[0].length-1].x} cy={level.paths[0][level.paths[0].length-1].y} r="15" fill="#3b82f6" opacity="0.8" />
                          </svg>
                      </div>

                      {/* Content Overlay */}
                      <div className="relative z-10 mt-auto bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent p-8 pt-24 border-t border-slate-700/50">
                          <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                              <div>
                                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-2 text-shadow-lg flex items-center gap-3">
                                    <span className="text-amber-500">#{level.id}</span> {level.name.split('：')[1] || level.name}
                                  </h3>
                                  <div className="flex gap-6 text-slate-300 font-mono text-sm md:text-base">
                                      <span className="flex items-center gap-2"><Coins size={18} className="text-yellow-400" /> 初始資金: <b className="text-white">{level.startMoney}g</b></span>
                                      <span className="flex items-center gap-2"><MapPin size={18} className="text-green-400" /> 建造點: <b className="text-white">{level.buildSlots.length}</b></span>
                                      <span className="flex items-center gap-2"><Skull size={18} className="text-red-400" /> 難度: <b className="text-white">{getDifficultyLabel(level)}</b></span>
                                  </div>
                              </div>

                              <button 
                                onClick={() => onSelectLevel(level.id)}
                                className="px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
                              >
                                  出擊 <ArrowRight size={24} />
                              </button>
                          </div>
                      </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Next Button */}
          <button 
            onClick={handleNext}
            disabled={activeIndex === LEVELS.length - 1}
            className={`p-4 rounded-full bg-slate-800/80 border border-slate-600 text-amber-500 hover:bg-slate-700 hover:scale-110 transition-all z-20 shadow-lg backdrop-blur-sm ${activeIndex === LEVELS.length - 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
          >
            <ChevronRight size={32} />
          </button>

        </div>

        {/* Pagination Dots */}
        <div className="flex gap-3 mt-8">
            {LEVELS.map((_, idx) => (
                <button 
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`w-3 h-3 rounded-full transition-all ${idx === activeIndex ? 'bg-amber-500 w-8' : 'bg-slate-600 hover:bg-slate-500'}`}
                />
            ))}
        </div>

        <button 
            onClick={onBack}
            className="mt-8 text-slate-500 hover:text-white transition-colors underline underline-offset-4"
        >
            返回主選單
        </button>
      </div>
    </div>
  );
};

export default LevelSelect;
