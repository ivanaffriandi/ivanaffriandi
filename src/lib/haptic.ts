/**
 * Tactile Sound Synthesizer using Web Audio API
 * Generates organic, ultra-low-latency iOS-style physical click sounds
 * without downloading any audio assets.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

/**
 * Tactile soft click (tick) for scroll actions or cylinder wheel rolls
 */
export function triggerLightClick() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    // Resume audio context if suspended (browser security)
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    // High-pitched short mechanical tick
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.03);

    // Very soft volume to mimic subtle physical response
    gain.gain.setValueAtTime(0.02, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  } catch (err) {
    // Silently catch audio block errors
  }
}

/**
 * Tactile deep click for primary page transitions or form submissions
 */
export function triggerActionClick() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle"; // Slightly warmer timbre
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);

    // Medium volume tactile pop
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (err) {
    // Silently catch audio block errors
  }
}
