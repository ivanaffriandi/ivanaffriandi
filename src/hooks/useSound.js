import { useCallback, useRef, useEffect } from 'react';

export default function useSound(isMuted = false) {
  const audioCtx = useRef(null);
  const droneOscs = useRef([]); // Hold drone oscillators to stop them later
  const isDronePlaying = useRef(false);

  const initAudioCtx = () => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.current.state === 'suspended') {
      audioCtx.current.resume();
    }
  };

  // Start continuous background drone (Gothic Pad)
  const startBackgroundDrone = useCallback(() => {
    if (isMuted || isDronePlaying.current) return;
    initAudioCtx();

    isDronePlaying.current = true;
    const t = audioCtx.current.currentTime;

    // Dark sweeping drone base
    const drone1 = audioCtx.current.createOscillator();
    drone1.type = 'triangle';
    drone1.frequency.setValueAtTime(32.7, t); // C1

    const drone2 = audioCtx.current.createOscillator();
    drone2.type = 'sine';
    drone2.frequency.setValueAtTime(65.4, t); // C2

    // Eerie high harmony
    const drone3 = audioCtx.current.createOscillator();
    drone3.type = 'sine';
    drone3.frequency.setValueAtTime(196, t); // G3

    const gainNode = audioCtx.current.createGain();
    
    // Smooth slow fade in for the drone
    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(0.08, t + 4);

    drone1.connect(gainNode);
    drone2.connect(gainNode);
    drone3.connect(gainNode);
    gainNode.connect(audioCtx.current.destination);

    drone1.start(t);
    drone2.start(t);
    drone3.start(t);

    droneOscs.current = [drone1, drone2, drone3, gainNode];

    // Gothic Gamelan random hits loop inside the drone
    const loopGong = () => {
      if (!isDronePlaying.current || isMuted) return;
      playGothicGong();
      setTimeout(loopGong, Math.random() * 15000 + 10000); // Hit randomly every 10-25s
    };
    
    setTimeout(loopGong, 3000);

  }, [isMuted]);

  const stopBackgroundDrone = useCallback(() => {
    if (!isDronePlaying.current) return;
    const t = audioCtx.current.currentTime;
    // Fade out drone
    if (droneOscs.current.length > 0) {
      const gainNode = droneOscs.current[3];
      gainNode.gain.cancelScheduledValues(t);
      gainNode.gain.linearRampToValueAtTime(0, t + 2);
      
      setTimeout(() => {
        droneOscs.current[0].stop();
        droneOscs.current[1].stop();
        droneOscs.current[2].stop();
        droneOscs.current = [];
        isDronePlaying.current = false;
      }, 2100);
    }
  }, []);

  const playClick = useCallback(() => {
    if (isMuted) return;
    initAudioCtx();

    const t = audioCtx.current.currentTime;
    const oscillator = audioCtx.current.createOscillator();
    const gainNode = audioCtx.current.createGain();

    oscillator.type = Math.random() > 0.5 ? 'square' : 'sawtooth';
    oscillator.frequency.setValueAtTime(Math.random() * 80 + 30, t);
    oscillator.frequency.exponentialRampToValueAtTime(0.01, t + 0.08);

    gainNode.gain.setValueAtTime(0.08, t);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.current.destination);

    oscillator.start(t);
    oscillator.stop(t + 0.08);
  }, [isMuted]);

  const playThunderCrash = useCallback(() => {
    if (isMuted) return;
    initAudioCtx();
    
    const t = audioCtx.current.currentTime;
    const bufferSize = audioCtx.current.sampleRate * 2.5; 
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
        data[i] *= 0.11; 
        b6 = white * 0.115926;
    }

    const noise = audioCtx.current.createBufferSource();
    noise.buffer = buffer;
    
    const filter = audioCtx.current.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.linearRampToValueAtTime(100, t + 2);

    const gain = audioCtx.current.createGain();
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(1.5, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 2.5);

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
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(65, t); 

    const osc2 = audioCtx.current.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(130, t); 

    const osc3 = audioCtx.current.createOscillator();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(260, t);

    const gainNode1 = audioCtx.current.createGain();
    const gainNode2 = audioCtx.current.createGain();
    const gainNode3 = audioCtx.current.createGain();
    const masterGain = audioCtx.current.createGain();

    gainNode1.gain.setValueAtTime(0, t);
    gainNode1.gain.linearRampToValueAtTime(1.0, t + 0.05);
    gainNode1.gain.exponentialRampToValueAtTime(0.001, t + 6);

    gainNode2.gain.setValueAtTime(0, t);
    gainNode2.gain.linearRampToValueAtTime(0.6, t + 0.03);
    gainNode2.gain.exponentialRampToValueAtTime(0.001, t + 4);

    gainNode3.gain.setValueAtTime(0, t);
    gainNode3.gain.linearRampToValueAtTime(0.3, t + 0.01);
    gainNode3.gain.exponentialRampToValueAtTime(0.001, t + 3);
    
    masterGain.gain.setValueAtTime(1.8, t); // Boost volume significantly for mobile visibility

    osc1.connect(gainNode1);
    osc2.connect(gainNode2);
    osc3.connect(gainNode3);

    gainNode1.connect(masterGain);
    gainNode2.connect(masterGain);
    gainNode3.connect(masterGain);
    
    masterGain.connect(audioCtx.current.destination);

    osc1.start(t);
    osc2.start(t);
    osc3.start(t);

    osc1.stop(t + 6.5);
    osc2.stop(t + 6.5);
    osc3.stop(t + 6.5);
  }, [isMuted]);

  // Clean up sounds on unmount
  useEffect(() => {
    return () => {
      if (isDronePlaying.current) {
        stopBackgroundDrone();
      }
    };
  }, [stopBackgroundDrone]);

  return { playClick, playThunderCrash, playGothicGong, startBackgroundDrone, stopBackgroundDrone };
}
