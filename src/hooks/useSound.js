import { useCallback, useRef, useEffect } from 'react';

export default function useSound(isMuted = false) {
  const audioCtx = useRef(null);
  const droneOscs = useRef([]); 
  const isDronePlaying = useRef(false);

  const initAudioCtx = () => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.current.state === 'suspended') {
      audioCtx.current.resume();
    }
  };

  // GOTHIC CATHEDRAL ORGAN SYNTHESIS
  // Layers multiple oscillators to simulate pipe organ harmonics
  const startBackgroundDrone = useCallback(() => {
    if (isMuted || isDronePlaying.current) return;
    initAudioCtx();

    isDronePlaying.current = true;
    const t = audioCtx.current.currentTime;

    const createPipe = (freq, type = 'triangle', vol = 0.1) => {
      const osc = audioCtx.current.createOscillator();
      const gain = audioCtx.current.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      // Ominous slow vibrato
      const lfo = audioCtx.current.createOscillator();
      const lfoGain = audioCtx.current.createGain();
      lfo.frequency.setValueAtTime(3, t);
      lfoGain.gain.setValueAtTime(2, t);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(vol, t + 4);
      
      osc.connect(gain);
      gain.connect(audioCtx.current.destination);
      osc.start(t);
      return { osc, gain, lfo };
    };

    // Cathedral Chord: C1, C2, G2, E3 (Ominous Major-ish but detuned)
    const pipes = [
      createPipe(32.7, 'sawtooth', 0.15), // Deep rumble
      createPipe(65.4, 'triangle', 0.12), // Fundamental
      createPipe(98, 'sine', 0.1),     // Perfect fifth
      createPipe(164.8, 'triangle', 0.08) // Major third (tension)
    ];

    droneOscs.current = pipes;

  }, [isMuted]);

  const stopBackgroundDrone = useCallback(() => {
    if (!isDronePlaying.current) return;
    const t = audioCtx.current.currentTime;
    
    droneOscs.current.forEach(pipe => {
      pipe.gain.gain.cancelScheduledValues(t);
      pipe.gain.gain.linearRampToValueAtTime(0, t + 2);
      setTimeout(() => {
        pipe.osc.stop();
        pipe.lfo.stop();
      }, 2100);
    });
    
    droneOscs.current = [];
    isDronePlaying.current = false;
  }, []);

  const playClick = useCallback(() => {
    if (isMuted) return;
    initAudioCtx();
    const t = audioCtx.current.currentTime;
    
    // Low Cathedral Bell / Heavy Thud
    const osc = audioCtx.current.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(40, t);
    osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.4);
    
    const gain = audioCtx.current.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    
    osc.connect(gain);
    gain.connect(audioCtx.current.destination);
    osc.start();
    osc.stop(t + 0.4);
  }, [isMuted]);

  const playThunderCrash = useCallback(() => {
    if (isMuted) return;
    initAudioCtx();
    const t = audioCtx.current.currentTime;
    const bufferSize = audioCtx.current.sampleRate * 4; 
    const buffer = audioCtx.current.createBuffer(1, bufferSize, audioCtx.current.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = audioCtx.current.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.current.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, t);
    const gain = audioCtx.current.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(1.5, t + 0.1); 
    gain.gain.exponentialRampToValueAtTime(0.01, t + 4);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.current.destination);
    noise.start(t);
  }, [isMuted]);

  const playGothicGong = useCallback(() => {
    if (isMuted) return;
    initAudioCtx();
    const t = audioCtx.current.currentTime;
    const osc1 = audioCtx.current.createOscillator();
    osc1.frequency.setValueAtTime(45, t); 
    const osc2 = audioCtx.current.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(90, t); 
    const gain = audioCtx.current.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(1.8, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 8);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.current.destination);
    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 8);
    osc2.stop(t + 8);
  }, [isMuted]);

  useEffect(() => {
    return () => {
      if (isDronePlaying.current) {
        stopBackgroundDrone();
      }
    };
  }, [stopBackgroundDrone]);

  return { playClick, playThunderCrash, playGothicGong, startBackgroundDrone, stopBackgroundDrone };
}
