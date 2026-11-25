// WOK HEI — sound, synthesized in code with WebAudio. No audio files:
// a filtered-noise sizzle loop while a wok cooks, a whoosh on a toss,
// a bell ding when a dish is ready, a chime when it is served.
// The context starts on the first user gesture, as browsers require.

let ctx = null;
let noiseBuf = null;
let sizzleGain = null;
let muted = false;

export function initAudio() {
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume();
    return;
  }
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    const len = ctx.sampleRate * 1;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    // Sizzle: looping noise through a bandpass, quiet until a wok cooks.
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 5200;
    bp.Q.value = 0.6;
    sizzleGain = ctx.createGain();
    sizzleGain.gain.value = 0;
    src.connect(bp);
    bp.connect(sizzleGain);
    sizzleGain.connect(ctx.destination);
    src.start();
  } catch {
    ctx = null;
  }
}

export function setSizzle(level) {
  if (!ctx || !sizzleGain) return;
  const target = muted ? 0 : Math.min(0.09, level * 0.09);
  sizzleGain.gain.setTargetAtTime(target, ctx.currentTime, 0.15);
}

export function setMuted(m) {
  muted = m;
  if (sizzleGain) sizzleGain.gain.value = 0;
}

export function isMuted() {
  return muted;
}

function blip(freq, dur, type, vol, slideTo) {
  if (!ctx || muted) return;
  try {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    gain.gain.setValueAtTime(vol || 0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  } catch {
    // audio is garnish: never let it break the game
  }
}

function noiseBurst(dur, vol, freq) {
  if (!ctx || muted || !noiseBuf) return;
  try {
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = freq || 900;
    bp.Q.value = 0.8;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol || 0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(bp);
    bp.connect(gain);
    gain.connect(ctx.destination);
    src.start(t);
    src.stop(t + dur + 0.02);
  } catch {
    // ignore
  }
}

export const sfx = {
  toss() {
    noiseBurst(0.25, 0.22, 1100);
  },
  perfect() {
    blip(660, 0.12, 'triangle', 0.14);
    setTimeout(() => blip(990, 0.18, 'triangle', 0.14), 70);
  },
  ding() {
    blip(1180, 0.5, 'sine', 0.14);
    blip(1760, 0.35, 'sine', 0.07);
  },
  serve() {
    blip(523, 0.12, 'triangle', 0.12);
    setTimeout(() => blip(784, 0.2, 'triangle', 0.12), 90);
  },
  burn() {
    blip(220, 0.3, 'sawtooth', 0.08, 110);
  },
  click() {
    blip(880, 0.05, 'square', 0.05);
  },
  star() {
    blip(1046, 0.15, 'triangle', 0.12);
    setTimeout(() => blip(1318, 0.25, 'triangle', 0.12), 100);
  },
};
