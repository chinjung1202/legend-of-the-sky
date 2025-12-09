import React, { useState, useEffect } from 'react';
import { GameView, Hero, SelectedTalents } from './types';
import MainMenu from './components/MainMenu';
import HeroSelect from './components/HeroSelect';
import GameLevel from './components/GameLevel';
import Bestiary from './components/Bestiary';
import LevelSelect from './components/LevelSelect';
import { HeroPortrait } from './components/HeroSelect';
import { audioService } from './services/audioService';
import { Volume2, VolumeX, Settings, X, PlayCircle } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<GameView>(GameView.MENU);
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [selectedTalents, setSelectedTalents] = useState<SelectedTalents>({ t1: null, t2: null, t3: null });
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [gameSessionId, setGameSessionId] = useState(0);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Audio Logic
  useEffect(() => {
    // Attempt to start audio context on first user interaction implicitly
    const handleInteraction = () => {
        audioService.init();
        updateMusic(currentView);
        window.removeEventListener('click', handleInteraction);
    };
    window.addEventListener('click', handleInteraction);
    return () => window.removeEventListener('click', handleInteraction);
  }, []);

  useEffect(() => {
    updateMusic(currentView);
  }, [currentView]);

  const updateMusic = (view: GameView) => {
      switch (view) {
          case GameView.MENU:
          case GameView.LEVEL_SELECT:
          case GameView.HERO_SELECT:
          case GameView.BESTIARY:
          case GameView.VICTORY:
          case GameView.GAME_OVER: 
              audioService.playMusic('THEME');
              break;
          case GameView.PLAYING:
              audioService.playMusic('BATTLE');
              break;
      }
  };

  const toggleMute = () => {
      const muted = audioService.toggleMute();
      setIsMuted(muted);
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      setVolume(val);
      audioService.setVolume(val);
  };

  const forceStartAudio = () => {
      audioService.playMusic(currentView === GameView.PLAYING ? 'BATTLE' : 'THEME');
  };

  const renderView = () => {
    switch (currentView) {
      case GameView.MENU:
        return (
          <MainMenu 
            onStart={() => {}} 
            onChangeView={setCurrentView} 
            onLoginAdmin={() => setIsAdminMode(true)}
            onLogoutAdmin={() => setIsAdminMode(false)}
            isAdminMode={isAdminMode}
          />
        );
      
      case GameView.LEVEL_SELECT:
        return (
          <LevelSelect 
             onBack={() => setCurrentView(GameView.MENU)}
             onSelectLevel={(id) => {
                setCurrentLevelId(id);
                setCurrentView(GameView.HERO_SELECT);
             }}
          />
        );
      
      case GameView.HERO_SELECT:
        return (
          <HeroSelect
            onBack={() => setCurrentView(GameView.LEVEL_SELECT)}
            onSelectHero={(hero, talents) => {
              setSelectedHero(hero);
              setSelectedTalents(talents);
              setCurrentView(GameView.PLAYING);
              setGameSessionId(prev => prev + 1);
            }}
          />
        );

      case GameView.BESTIARY:
        return (
           <Bestiary 
             onClose={() => setCurrentView(GameView.MENU)} 
             renderHero={(t, s) => <HeroPortrait theme={t} size={s} />}
           />
        );

      case GameView.PLAYING:
      case GameView.GAME_OVER:
      case GameView.VICTORY:
        if (!selectedHero) return <div>Error: No Hero Selected</div>;
        return (
          <GameLevel 
            key={gameSessionId}
            levelId={currentLevelId}
            hero={selectedHero}
            selectedTalents={selectedTalents}
            isAdminMode={isAdminMode}
            onLogoutAdmin={() => setIsAdminMode(false)}
            onExit={() => setCurrentView(GameView.MENU)}
            onRetry={() => {
                setGameSessionId(prev => prev + 1);
                setCurrentView(GameView.PLAYING);
            }}
          />
        );
        
      default:
        return <div className="text-white">View not implemented</div>;
    }
  };

  return (
    <div className="w-screen h-screen bg-slate-950 text-slate-100 font-sans relative">
      {/* Settings Button - Moved to Top Left */}
      <button 
        onClick={() => setIsSettingsOpen(true)}
        className="absolute top-4 left-4 z-[100] p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full border border-slate-600 backdrop-blur-md shadow-lg transition-all active:scale-95 group"
        title="Settings"
      >
        <Settings size={24} className="group-hover:rotate-90 transition-transform duration-500" />
      </button>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-600 p-6 rounded-2xl shadow-2xl w-full max-w-sm relative">
            <button 
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <Settings className="text-amber-500" size={28}/> 系統設定
            </h2>
            
            <div className="space-y-6">
              {/* Mute Toggle */}
              <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${isMuted ? 'bg-slate-700 text-slate-400' : 'bg-green-900/30 text-green-400'}`}>
                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-200">背景音樂</div>
                    <div className="text-xs text-slate-500">{isMuted ? '已靜音' : '播放中'}</div>
                  </div>
                </div>
                
                <button 
                  onClick={toggleMute}
                  className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 ${!isMuted ? 'bg-green-600' : 'bg-slate-600'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${!isMuted ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Volume Slider */}
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 space-y-2">
                 <div className="flex justify-between text-sm text-slate-300">
                     <span>音量</span>
                     <span>{Math.round(volume * 100)}%</span>
                 </div>
                 <input 
                    type="range" 
                    min="0" max="1" step="0.05"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                 />
              </div>

              {/* Force Start Audio Button (useful if browser blocked autoplay) */}
              <button 
                onClick={forceStartAudio}
                className="w-full py-3 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/50 rounded-xl flex items-center justify-center gap-2 transition-colors group"
              >
                  <PlayCircle size={20} className="group-hover:scale-110 transition-transform"/>
                  <span>啟動音效引擎 (如無聲請點擊)</span>
              </button>
              
              <div className="text-center text-xs text-slate-600 pt-4 border-t border-slate-800">
                Legend of the Sky Guardians<br/>Ver 0.7.4
              </div>
            </div>
          </div>
        </div>
      )}

      {renderView()}
    </div>
  );
};

export default App;