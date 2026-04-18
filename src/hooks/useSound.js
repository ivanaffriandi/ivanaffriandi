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

  const startBackgroundDrone = useCallback(() => {
    if (isMuted || isDronePlaying.current) return;
    initAudioCtx();

    isDronePlaying.current = true;
    const t = audioCtx.current.currentTime;

    // Deep Dark Drone frequencies
    const drone1 = audioCtx.current.createOscillator();
    drone1.type = 'triangle';
    drone1.frequency.setValueAtTime(32.7, t); 

    const drone2 = audioCtx.current.createOscillator();
    drone2.type = 'sine';
    drone2.frequency.setValueAtTime(48.9, t); // G1 (lower harmony)

    const drone3 = audioCtx.current.createOscillator();
    drone3.type = 'sine';
    drone3.frequency.setValueAtTime(65.4, t); 

    const gainNode = audioCtx.current.createGain();
    
    // BOOSTED VOLUME: 0.08 -> 0.25 for better mobile presence
    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(0.25, t + 3);

    drone1.connect(gainNode);
    drone2.connect(gainNode);
    drone3.connect(gainNode);
    gainNode.connect(audioCtx.current.destination);

    drone1.start(t);
    drone2.start(t);
    drone3.start(t);

    droneOscs.current = [drone1, drone2, drone3, gainNode];

    // Gothic Gamelan hits faster and louder
    const loopGong = () => {
      if (!isDronePlaying.current || isMuted) return;
      playGothicGong();
      setTimeout(loopGong, Math.random() * 12000 + 8000); 
    };
    
    setTimeout(loopGong, 1000);

  }, [isMuted]);

  const stopBackgroundDrone = useCallback(() => {
    if (!isDronePlaying.current) return;
    const t = audioCtx.current.currentTime;
    if (droneOscs.current.length > 0) {
      const gainNode = droneOscs.current[3];
      gainNode.gain.cancelScheduledValues(t);
      gainNode.gain.linearRampToValueAtTime(0, t + 1.5);
      
      setTimeout(() => {
        droneOscs.current[0].stop();
        droneOscs.current[1].stop();
        droneOscs.current[2].stop();
        droneOscs.current = [];
        isDronePlaying.current = false;
      }, 1600);
    }
  }, []);

  const playClick = useCallback(() => {
    if (isMuted) return;
    initAudioCtx();

    const t = audioCtx.current.currentTime;
    const oscillator = audioCtx.current.createOscillator();
    const gainNode = audioCtx.current.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(40, t);
    oscillator.frequency.exponentialRampToValueAtTime(0.01, t + 0.1);

    gainNode.gain.setValueAtTime(0.1, t);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.current.destination);

    oscillator.start(t);
    oscillator.stop(t + 0.1);
  }, [isMuted]);

  const playThunderCrash = useCallback(() => {
    if (isMuted) return;
    initAudioCtx();
    
    const t = audioCtx.current.currentTime;
    const bufferSize = audioCtx.current.sampleRate * 3; 
    const buffer = audioCtx.current.createBuffer(1, bufferSize, audioCtx.current.sampleRate);
    const data = buffer.getChannelData(0);

    let b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
    
    for (let i = 0; i < bufferSize; i++) {
        let white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        data[i] *= 0.15; 
        b6 = white * 0.115926;
    }

    const noise = audioCtx.current.createBufferSource();
    noise.buffer = buffer;
    
    const filter = audioCtx.current.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, t);

    const gain = audioCtx.current.createGain();
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(2.0, t + 0.05); // Brighter strike
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
    osc1.frequency.setValueAtTime(60, t); 
    const osc2 = audioCtx.current.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(120, t); 
    
    const gainNode1 = audioCtx.current.createGain();
    const masterGain = audioCtx.current.createGain();

    gainNode1.gain.setValueAtTime(0, t);
    gainNode1.gain.linearRampToValueAtTime(1.5, t + 0.05);
    gainNode1.gain.exponentialRampToValueAtTime(0.001, t + 8);
    
    masterGain.gain.setValueAtTime(2.0, t); 

    osc1.connect(gainNode1);
    osc2.connect(gainNode1);
    gainNode1.connect(masterGain);
    masterGain.connect(audioCtx.current.destination);

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
