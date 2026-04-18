import { useCallback, useRef, useEffect } from 'react';

export default function useSound(isMuted = false) {
  const audioCtx = useRef(null);
  const droneOscs = useRef([]); 
  const isDronePlaying = useRef(false);
  const gamelanIntervals = useRef([]);

  const initAudioCtx = () => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.current.state === 'suspended') {
      audioCtx.current.resume();
    }
  };

  // SCARY GAMELAN ORCHESTRA SYNTHESIS
  // Simulating multiple metallophones (Saron/Gender) in a dissonant Slendro scale
  const playGamelanNote = useCallback((freq, vol = 0.5, decay = 4) => {
    if (isMuted || !audioCtx.current) return;
    const t = audioCtx.current.currentTime;

    const osc = audioCtx.current.createOscillator();
    const gain = audioCtx.current.createGain();
    
    // Complex tone: sine + triangle for metallic resonance
    osc.type = Math.random() > 0.5 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, t);
    
    // Detuning for that "haunted" feel
    osc.detune.setValueAtTime(Math.random() * 20 - 10, t);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + decay);

    osc.connect(gain);
    gain.connect(audioCtx.current.destination);

    osc.start(t);
    osc.stop(t + decay + 0.5);
  }, [isMuted]);

  const startBackgroundDrone = useCallback(() => {
    if (isMuted || isDronePlaying.current) return;
    initAudioCtx();

    isDronePlaying.current = true;
    const t = audioCtx.current.currentTime;

    // The Foundation Drone
    const drone1 = audioCtx.current.createOscillator();
    drone1.type = 'sine';
    drone1.frequency.setValueAtTime(32.7, t); 
    const drone2 = audioCtx.current.createOscillator();
    drone2.type = 'triangle';
    drone2.frequency.setValueAtTime(48.9, t); 
    
    const gainNode = audioCtx.current.createGain();
    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(0.3, t + 4);

    drone1.connect(gainNode);
    drone2.connect(gainNode);
    gainNode.connect(audioCtx.current.destination);
    drone1.start(t);
    drone2.start(t);

    droneOscs.current = [drone1, drone2, gainNode];

    // THE ORCHESTRA SCHEDULER
    const slendro = [130.8, 146.8, 164.8, 196, 220, 261.6, 293.7]; // C3 to D4 Slendro-ish
    
    const runOrchestra = () => {
        if (!isDronePlaying.current || isMuted) return;
        
        // Randomly pick a note and volume
        const freq = slendro[Math.floor(Math.random() * slendro.length)];
        const vol = Math.random() * 0.4 + 0.1;
        playGamelanNote(freq, vol, 3);

        // Schedule next random hit (fast bersahutan)
        const nextHit = Math.random() * 800 + 200; 
        const timeout = setTimeout(runOrchestra, nextHit);
        gamelanIntervals.current.push(timeout);
    };

    // Periodically hit the big Gong
    const runGong = () => {
        if (!isDronePlaying.current || isMuted) return;
        playGothicGong();
        const timeout = setTimeout(runGong, Math.random() * 10000 + 5000);
        gamelanIntervals.current.push(timeout);
    }
    
    runOrchestra();
    runGong();

  }, [isMuted, playGamelanNote]);

  const stopBackgroundDrone = useCallback(() => {
    if (!isDronePlaying.current) return;
    const t = audioCtx.current.currentTime;
    
    gamelanIntervals.current.forEach(clearTimeout);
    gamelanIntervals.current = [];

    if (droneOscs.current.length > 0) {
      const g = droneOscs.current[2];
      g.gain.cancelScheduledValues(t);
      g.gain.linearRampToValueAtTime(0, t + 2);
      setTimeout(() => {
        droneOscs.current[0].stop();
        droneOscs.current[1].stop();
        droneOscs.current = [];
        isDronePlaying.current = false;
      }, 2100);
    }
  }, []);

  const playClick = useCallback(() => {
    if (isMuted) return;
    initAudioCtx();
    const t = audioCtx.current.currentTime;
    
    // Brutal Horrific Click
    const osc = audioCtx.current.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(50, t);
    osc.frequency.linearRampToValueAtTime(5, t + 0.2);
    
    const noise = audioCtx.current.createGain();
    noise.gain.setValueAtTime(0.4, t);
    noise.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    
    osc.connect(noise);
    noise.connect(audioCtx.current.destination);
    osc.start();
    osc.stop(t + 0.2);
  }, [isMuted]);

  const playThunderCrash = useCallback(() => {
    if (isMuted) return;
    initAudioCtx();
    const t = audioCtx.current.currentTime;
    const bufferSize = audioCtx.current.sampleRate * 3; 
    const buffer = audioCtx.current.createBuffer(1, bufferSize, audioCtx.current.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = audioCtx.current.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.current.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);
    const gain = audioCtx.current.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(2.0, t + 0.05); 
    gain.gain.exponentialRampToValueAtTime(0.01, t + 3);
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
    osc1.frequency.setValueAtTime(55, t); 
    const osc2 = audioCtx.current.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(110, t); 
    const gain = audioCtx.current.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(2.5, t + 0.05); // LOUDER
    gain.gain.exponentialRampToValueAtTime(0.001, t + 10);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.current.destination);
    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 10.5);
    osc2.stop(t + 10.5);
  }, [isMuted]);

  return { playClick, playThunderCrash, playGothicGong, startBackgroundDrone, stopBackgroundDrone };
}
