import { useCallback, useRef, useEffect } from 'react';

export default function useSound(isMuted = false) {
  const audioCtx = useRef(null);

  const initAudioCtx = () => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.current.state === 'suspended') {
      audioCtx.current.resume();
    }
  };

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

    oscillator.start();
    oscillator.stop(t + 0.08);
  }, [isMuted]);

  const playStatic = useCallback(() => {
    if (isMuted) return;
    initAudioCtx();
    
    const t = audioCtx.current.currentTime;
    const bufferSize = audioCtx.current.sampleRate * 0.12;
    const buffer = audioCtx.current.createBuffer(1, bufferSize, audioCtx.current.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 1.5 - 0.75;
    }

    const noise = audioCtx.current.createBufferSource();
    noise.buffer = buffer;
    const gain = audioCtx.current.createGain();
    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    noise.connect(gain);
    gain.connect(audioCtx.current.destination);
    noise.start();
  }, [isMuted]);

  const playGothicGong = useCallback(() => {
    if (isMuted) return;
    initAudioCtx();

    const t = audioCtx.current.currentTime;

    // Deep Hum 
    const osc1 = audioCtx.current.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(55, t);

    // Metallic chime
    const osc2 = audioCtx.current.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(110, t); 

    // Grit
    const osc3 = audioCtx.current.createOscillator();
    osc3.type = 'sawtooth';
    osc3.frequency.setValueAtTime(220, t);

    const gainNode1 = audioCtx.current.createGain();
    const gainNode2 = audioCtx.current.createGain();
    const gainNode3 = audioCtx.current.createGain();
    const masterGain = audioCtx.current.createGain();

    // Sharp attack, long decay
    gainNode1.gain.setValueAtTime(0, t);
    gainNode1.gain.linearRampToValueAtTime(1.0, t + 0.05);
    gainNode1.gain.exponentialRampToValueAtTime(0.001, t + 6);

    gainNode2.gain.setValueAtTime(0, t);
    gainNode2.gain.linearRampToValueAtTime(0.5, t + 0.02);
    gainNode2.gain.exponentialRampToValueAtTime(0.001, t + 4);

    gainNode3.gain.setValueAtTime(0, t);
    gainNode3.gain.linearRampToValueAtTime(0.1, t + 0.01);
    gainNode3.gain.exponentialRampToValueAtTime(0.001, t + 2);
    
    masterGain.gain.setValueAtTime(0.6, t);

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

  return { playClick, playStatic, playGothicGong };
}
