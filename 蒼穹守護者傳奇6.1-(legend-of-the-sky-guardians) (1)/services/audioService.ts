

// A hybrid audio engine: Supports custom Audio Files with a Procedural Fallback.

// 🎵 LOCAL MUSIC FILES 🎵
const MENU_MUSIC_URL: string = "/legend-of-the-sky/music/Dreamer_s Reverie.mp3"; 
const BATTLE_MUSIC_URL: string = "/legend-of-the-sky/music/戰鬥之魂.mp3"; 

type MusicType = 'THEME' | 'BATTLE' | 'NONE';

class AudioController {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.5;
  private currentType: MusicType = 'NONE';
  
  // Procedural Nodes
  private nodes: AudioNode[] = [];
  private battleInterval: any = null;

  // File Audio
  private fileAudio: HTMLAudioElement | null = null;

  private isInitialized: boolean = false;

  constructor() {
    // Browser autoplay policy prevents context from starting immediately
  }

  public init() {
    if (this.isInitialized && this.ctx) {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return;
    }
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
      this.masterGain.connect(this.ctx.destination);
      this.isInitialized = true;
    } catch (e) {
      console.error("Web Audio API not supported", e);
    }
  }

  public setVolume(val: number) {
      this.volume = Math.max(0, Math.min(1, val));
      if (!this.isMuted) {
          if (this.masterGain) {
              const now = this.ctx?.currentTime || 0;
              this.masterGain.gain.setValueAtTime(this.volume, now);
          }
          if (this.fileAudio) {
              this.fileAudio.volume = this.volume;
          }
      }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    
    // Handle WebAudio Mute
    if (this.ctx && this.masterGain) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : this.volume, now + 0.1);
    }

    // Handle File Audio Mute
    if (this.fileAudio) {
        this.fileAudio.muted = this.isMuted;
    }

    return this.isMuted;
  }

  public stop() {
    // Stop Procedural
    if (this.battleInterval) {
        clearInterval(this.battleInterval);
        this.battleInterval = null;
    }
    this.nodes.forEach(node => {
        try { 
            (node as any).stop(); 
            node.disconnect();
        } catch(e) {}
    });
    this.nodes = [];

    // Stop File Audio
    if (this.fileAudio) {
        this.fileAudio.pause();
        this.fileAudio.currentTime = 0;
        this.fileAudio.src = ""; // Clear src to stop download
        this.fileAudio = null;
    }

    this.currentType = 'NONE';
  }

  public playMusic(type: MusicType) {
    this.init();
    
    // Always try to resume if suspended (needed for Chrome/Safari autoplay policy)
    if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().then(() => {
            this.startMusicLogic(type);
        });
    } else {
        this.startMusicLogic(type);
    }
  }

  private startMusicLogic(type: MusicType) {
    if (this.currentType === type && this.fileAudio && !this.fileAudio.paused) return;

    this.stop();
    this.currentType = type;

    const url = type === 'THEME' ? MENU_MUSIC_URL : BATTLE_MUSIC_URL;

    // Try to play file if URL exists
    if (url && url.trim() !== "") {
        this.playFileAudio(url);
    } else {
        // Fallback to Procedural
        if (!this.ctx || !this.masterGain) return;
        if (type === 'THEME') {
            this.playEtherealTheme();
        } else if (type === 'BATTLE') {
            this.playBattleMarch();
        }
    }
  }

  private playFileAudio(url: string) {
      try {
          // Create new audio element
          this.fileAudio = new Audio();
          this.fileAudio.crossOrigin = "anonymous"; // Try to handle CORS if server supports it
          this.fileAudio.src = url;
          this.fileAudio.loop = true;
          this.fileAudio.volume = this.volume; 
          this.fileAudio.muted = this.isMuted;
          
          const playPromise = this.fileAudio.play();
          
          if (playPromise !== undefined) {
              playPromise.catch(error => {
                  console.warn("Audio file playback failed (using fallback):", error);
                  // If file fails (e.g. 404 or format), fallback to procedural
                  this.fileAudio = null;
                  if (this.currentType === 'THEME') this.playEtherealTheme();
                  else if (this.currentType === 'BATTLE') this.playBattleMarch();
              });
          }
      } catch (e) {
          console.error("Error initializing audio object", e);
          // Fallback immediately
          if (this.currentType === 'THEME') this.playEtherealTheme();
          else if (this.currentType === 'BATTLE') this.playBattleMarch();
      }
  }

  // --- Procedural Fallback 1: Ethereal (Menu/Story) ---
  private playEtherealTheme() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const freqs = [220, 261.63, 329.63, 392.00, 493.88]; 
    
    freqs.forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = f;
      
      const lfo = this.ctx!.createOscillator();
      lfo.frequency.value = 0.1 + (Math.random() * 0.2); 
      const lfoGain = this.ctx!.createGain();
      lfoGain.gain.value = 5;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.1 * this.volume, now + 0.5 + (i * 0.2)); 
      
      const panner = this.ctx!.createStereoPanner();
      panner.pan.value = (i / freqs.length) * 2 - 1;

      osc.connect(gain);
      gain.connect(panner);
      panner.connect(this.masterGain!);
      
      osc.start();
      this.nodes.push(osc, gain, lfo, lfoGain, panner);
    });
  }

  // --- Procedural Fallback 2: Battle March (Game) ---
  private playBattleMarch() {
    if (!this.ctx || !this.masterGain) return;
    
    const bassOsc = this.ctx.createOscillator();
    bassOsc.type = 'sawtooth';
    bassOsc.frequency.value = 55; 
    const bassGain = this.ctx.createGain();
    bassGain.gain.value = 0.15 * this.volume;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    bassOsc.connect(filter);
    filter.connect(bassGain);
    bassGain.connect(this.masterGain);
    bassOsc.start();
    this.nodes.push(bassOsc, bassGain, filter);

    const arpOsc = this.ctx.createOscillator();
    arpOsc.type = 'square';
    const arpGain = this.ctx.createGain();
    arpGain.gain.value = 0.05 * this.volume;
    
    const notes = [220, 261.63, 329.63, 440, 329.63, 261.63];
    let noteIdx = 0;
    
    this.battleInterval = setInterval(() => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        arpOsc.frequency.setValueAtTime(notes[noteIdx], now);
        noteIdx = (noteIdx + 1) % notes.length;
    }, 150); 

    arpOsc.connect(arpGain);
    arpGain.connect(this.masterGain);
    arpOsc.start();
    this.nodes.push(arpOsc, arpGain);
  }
}

export const audioService = new AudioController();