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

// User-interaction pre-warming of AudioContext for absolute 0ms response latency
if (typeof window !== "undefined") {
  const warmUp = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().then(cleanup);
    } else if (ctx) {
      cleanup();
    }
  };
  const cleanup = () => {
    window.removeEventListener("pointerdown", warmUp);
    window.removeEventListener("keydown", warmUp);
    window.removeEventListener("touchstart", warmUp);
  };
  window.addEventListener("pointerdown", warmUp, { passive: true });
  window.addEventListener("keydown", warmUp, { passive: true });
  window.addEventListener("touchstart", warmUp, { passive: true });
}


/**
 * Tactile soft click (tick) for scroll actions or cylinder wheel rolls
 */
export function triggerLightClick() {
  // Physical hardware vibration trigger (supported on Android devices/Chrome)
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate(10); // Short mechanical tick (10ms)
    } catch (e) {}
  }
}

/**
 * Tactile deep click for primary page transitions or form submissions
 */
export function triggerActionClick() {
  // Physical hardware vibration trigger (supported on Android devices/Chrome)
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate(22); // Slightly deeper tactile pop (22ms)
    } catch (e) {}
  }
}
