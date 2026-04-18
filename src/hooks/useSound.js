import { useCallback, useRef } from 'react';

export default function useSound(isMuted = false) {
  const audioCtx = useRef(null);

  const playClick = useCallback(() => {
    if (isMuted) return;
    
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    if (audioCtx.current.state === 'suspended') {
      audioCtx.current.resume();
    }

    const oscillator = audioCtx.current.createOscillator();
    const gainNode = audioCtx.current.createGain();

    oscillator.type = Math.random() > 0.5 ? 'square' : 'sawtooth';
    oscillator.frequency.setValueAtTime(Math.random() * 80 + 30, audioCtx.current.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(0.01, audioCtx.current.currentTime + 0.08);

    gainNode.gain.setValueAtTime(0.08, audioCtx.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.current.currentTime + 0.08);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.current.destination);

    oscillator.start();
    oscillator.stop(audioCtx.current.currentTime + 0.08);
  }, [isMuted]);

  const playStatic = useCallback(() => {
    if (isMuted || !audioCtx.current) return;
    
    const bufferSize = audioCtx.current.sampleRate * 0.12;
    const buffer = audioCtx.current.createBuffer(1, bufferSize, audioCtx.current.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 1.5 - 0.75;
    }

    const noise = audioCtx.current.createBufferSource();
    noise.buffer = buffer;
    const gain = audioCtx.current.createGain();
    gain.gain.setValueAtTime(0.04, audioCtx.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.current.currentTime + 0.12);
    noise.connect(gain);
    gain.connect(audioCtx.current.destination);
    noise.start();
  }, [isMuted]);

  return { playClick, playStatic };
}
