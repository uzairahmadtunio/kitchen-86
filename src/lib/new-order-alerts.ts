// Web Audio "ding" + tab title flash for new orders.
// Browsers require a user gesture before audio plays; we lazy-init on first call.

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (Ctor) audioCtx = new Ctor();
    } catch {
      return null;
    }
  }
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  return audioCtx;
}

/** Call once from a click handler to unlock audio in browsers like Safari/iOS. */
export function unlockAlertSound() {
  const ctx = getCtx();
  if (!ctx) return;
  // play a near-silent blip to unlock
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  g.gain.value = 0.0001;
  o.connect(g).connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.05);
}

export function playDing() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const notes = [880, 1320, 1760]; // A5, E6, A6
  notes.forEach((freq, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    const start = now + i * 0.12;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(0.45, start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.55);
    o.connect(g).connect(ctx.destination);
    o.start(start);
    o.stop(start + 0.6);
  });
}

let flashTimer: ReturnType<typeof setInterval> | null = null;
let originalTitle = "";
export function flashTitle(message = "🔔 NEW ORDER!") {
  if (typeof document === "undefined") return;
  if (flashTimer) return; // already flashing
  originalTitle = document.title;
  let on = false;
  flashTimer = setInterval(() => {
    on = !on;
    document.title = on ? message : originalTitle;
  }, 900);
  const stop = () => {
    if (!flashTimer) return;
    clearInterval(flashTimer);
    flashTimer = null;
    document.title = originalTitle;
    window.removeEventListener("focus", stop);
    document.removeEventListener("visibilitychange", onVis);
  };
  const onVis = () => { if (!document.hidden) stop(); };
  window.addEventListener("focus", stop);
  document.addEventListener("visibilitychange", onVis);
}
