// Tiny synthesized sound effects — no audio files, works offline.
// Every call happens inside a tap handler, which satisfies mobile autoplay rules.

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null; // no audio support — the game just plays silently
  }
}

function tone(freq: number, startInMs: number, durationMs: number, volume = 0.12, type: OscillatorType = "triangle") {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + startInMs / 1000;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durationMs / 1000);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + durationMs / 1000 + 0.05);
}

export const sfx = {
  correct() {
    tone(660, 0, 120);
    tone(880, 110, 180);
  },
  wrong() {
    tone(220, 0, 250, 0.08, "sine");
  },
  hit() {
    tone(160, 0, 120, 0.1, "square");
  },
  victory() {
    tone(523, 0, 150);
    tone(659, 140, 150);
    tone(784, 280, 300);
  },
  capture() {
    tone(523, 0, 120);
    tone(784, 120, 120);
    tone(1047, 240, 350);
  },
  build() {
    tone(392, 0, 150, 0.1, "square");
    tone(523, 160, 250);
  },
};
