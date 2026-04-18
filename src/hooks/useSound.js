import { useCallback, useRef } from 'react';

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

    oscillator.start(t);
    oscillator.stop(t + 0.08);
  }, [isMuted]);

  const playThunderCrash = useCallback(() => {
    if (isMuted) return;
    initAudioCtx();
    
    const t = audioCtx.current.currentTime;
    const bufferSize = audioCtx.current.sampleRate * 2.5; // 2.5 seconds of thunder noise
    const buffer = audioCtx.current.createBuffer(1, bufferSize, audioCtx.current.sampleRate);
    const data = buffer.getChannelData(0);

    // Pink noise approximation for thunder
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
    
    // Lowpass filter to make it sound like distant rolling thunder
    const filter = audioCtx.current.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.linearRampToValueAtTime(100, t + 2);

    const gain = audioCtx.current.createGain();
    
    // Thunder envelope: sudden strike, rumble decay
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

    // Deep Hum (Stronger)
    const osc1 = audioCtx.current.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(65, t); // Better audibility

    // Metallic chime
    const osc2 = audioCtx.current.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(130, t); 

    // Harmonic Overtones
    const osc3 = audioCtx.current.createOscillator();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(260, t);

    const gainNode1 = audioCtx.current.createGain();
    const gainNode2 = audioCtx.current.createGain();
    const gainNode3 = audioCtx.current.createGain();
    const masterGain = audioCtx.current.createGain();

    // Sharp attack, long decay
    gainNode1.gain.setValueAtTime(0, t);
    gainNode1.gain.linearRampToValueAtTime(1.0, t + 0.05);
    gainNode1.gain.exponentialRampToValueAtTime(0.001, t + 6);

    gainNode2.gain.setValueAtTime(0, t);
    gainNode2.gain.linearRampToValueAtTime(0.6, t + 0.03);
    gainNode2.gain.exponentialRampToValueAtTime(0.001, t + 4);

    gainNode3.gain.setValueAtTime(0, t);
    gainNode3.gain.linearRampToValueAtTime(0.3, t + 0.01);
    gainNode3.gain.exponentialRampToValueAtTime(0.001, t + 3);
    
    // Increased master gain and minor compression using hard ceiling
    masterGain.gain.setValueAtTime(1.5, t);

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

  return { playClick, playThunderCrash, playGothicGong };
}
