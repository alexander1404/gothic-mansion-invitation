type NoiseNodes = {
  src: AudioBufferSourceNode;
  filter: BiquadFilterNode;
  gain: GainNode;
};

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let ambientGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let enabled = false;
let ambientOn = false;
let noiseBuffer: AudioBuffer | null = null;
const ambientNodes: AudioNode[] = [];
let clockTimer: number | null = null;

function ensureCtx() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.7;
    master.connect(ctx.destination);
    ambientGain = ctx.createGain();
    ambientGain.gain.value = 0;
    ambientGain.connect(master);
    sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.9;
    sfxGain.connect(master);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function makeNoise(duration = 2) {
  const c = ensureCtx();
  if (noiseBuffer && noiseBuffer.duration >= duration) return noiseBuffer;
  const length = Math.floor(c.sampleRate * duration);
  const buffer = c.createBuffer(1, length, c.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    last = last * 0.96 + white * 0.04;
    data[i] = white * 0.55 + last * 0.45;
  }
  noiseBuffer = buffer;
  return buffer;
}

function noiseBurst(opts: {
  t?: number;
  duration?: number;
  freq?: number;
  type?: BiquadFilterType;
  gain?: number;
  dest?: AudioNode;
}): NoiseNodes {
  const c = ensureCtx();
  const t = opts.t ?? c.currentTime;
  const src = c.createBufferSource();
  src.buffer = makeNoise(2);
  const filter = c.createBiquadFilter();
  filter.type = opts.type ?? "lowpass";
  filter.frequency.value = opts.freq ?? 800;
  const gain = c.createGain();
  gain.gain.setValueAtTime(opts.gain ?? 0.4, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + (opts.duration ?? 0.3));
  src.connect(filter);
  filter.connect(gain);
  gain.connect(opts.dest ?? sfxGain!);
  src.start(t);
  src.stop(t + (opts.duration ?? 0.3) + 0.05);
  return { src, filter, gain };
}

function oscBurst(opts: {
  t?: number;
  freq: number;
  endFreq?: number;
  type?: OscillatorType;
  duration?: number;
  gain?: number;
  dest?: AudioNode;
}) {
  const c = ensureCtx();
  const t = opts.t ?? c.currentTime;
  const osc = c.createOscillator();
  osc.type = opts.type ?? "sine";
  osc.frequency.setValueAtTime(opts.freq, t);
  if (opts.endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(opts.endFreq, 20), t + (opts.duration ?? 0.3));
  const gain = c.createGain();
  gain.gain.setValueAtTime(opts.gain ?? 0.4, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + (opts.duration ?? 0.3));
  osc.connect(gain);
  gain.connect(opts.dest ?? sfxGain!);
  osc.start(t);
  osc.stop(t + (opts.duration ?? 0.3) + 0.05);
}

function startWind() {
  const c = ensureCtx();
  const src = c.createBufferSource();
  src.buffer = makeNoise(3);
  src.loop = true;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 380;
  filter.Q.value = 0.7;
  const gain = c.createGain();
  gain.gain.value = 0.07;
  const lfo = c.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoGain = c.createGain();
  lfoGain.gain.value = 0.04;
  lfo.connect(lfoGain);
  lfoGain.connect(gain.gain);
  const freqLfo = c.createOscillator();
  freqLfo.frequency.value = 0.05;
  const freqGain = c.createGain();
  freqGain.gain.value = 120;
  freqLfo.connect(freqGain);
  freqGain.connect(filter.frequency);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ambientGain!);
  src.start();
  lfo.start();
  freqLfo.start();
  ambientNodes.push(src, lfo, freqLfo, gain, filter);
}

function startCrackle() {
  const c = ensureCtx();
  const tick = () => {
    if (!ambientOn || !enabled || !ctx) return;
    const t = c.currentTime;
    noiseBurst({
      t,
      duration: 0.04 + Math.random() * 0.05,
      freq: 1800 + Math.random() * 2200,
      type: "highpass",
      gain: 0.015 + Math.random() * 0.03,
      dest: ambientGain!,
    });
    window.setTimeout(tick, 180 + Math.random() * 420);
  };
  tick();
}

function startClock() {
  const chime = () => {
    if (!ambientOn || !enabled || !ctx) return;
    const t = ctx.currentTime;
    oscBurst({ t, freq: 220, duration: 1.6, gain: 0.05, type: "sine", dest: ambientGain! });
    oscBurst({ t, freq: 440, duration: 1.2, gain: 0.03, type: "sine", dest: ambientGain! });
    oscBurst({ t: t + 1.1, freq: 196, duration: 1.8, gain: 0.04, type: "sine", dest: ambientGain! });
  };
  chime();
  clockTimer = window.setInterval(chime, 22000);
}

function startAmbient() {
  if (ambientOn || !enabled) return;
  ensureCtx();
  ambientOn = true;
  startWind();
  startCrackle();
  startClock();
  const now = ctx!.currentTime;
  ambientGain!.gain.cancelScheduledValues(now);
  ambientGain!.gain.setValueAtTime(ambientGain!.gain.value, now);
  ambientGain!.gain.linearRampToValueAtTime(1, now + 1.6);
}

function stopAmbient() {
  ambientOn = false;
  if (clockTimer) {
    clearInterval(clockTimer);
    clockTimer = null;
  }
  if (ambientGain && ctx) {
    const now = ctx.currentTime;
    ambientGain.gain.cancelScheduledValues(now);
    ambientGain.gain.setValueAtTime(ambientGain.gain.value, now);
    ambientGain.gain.linearRampToValueAtTime(0, now + 0.4);
  }
}

export const sound = {
  async unlock() {
    ensureCtx();
    if (ctx && ctx.state === "suspended") await ctx.resume();
  },
  setEnabled(on: boolean) {
    enabled = on;
    if (on) {
      void this.unlock();
      startAmbient();
    } else {
      stopAmbient();
    }
  },
  isEnabled() {
    return enabled;
  },
  knock(n: number) {
    if (!enabled) return;
    const c = ensureCtx();
    const t = c.currentTime;
    const vol = 0.35 + n * 0.18;
    oscBurst({ t, freq: 70 + n * 12, endFreq: 38, duration: 0.32, gain: vol, type: "sine" });
    oscBurst({ t, freq: 110 + n * 8, endFreq: 50, duration: 0.22, gain: vol * 0.5, type: "triangle" });
    noiseBurst({ t, duration: 0.18, freq: 280 + n * 40, type: "lowpass", gain: vol * 0.7 });
  },
  thunder() {
    if (!enabled) return;
    const c = ensureCtx();
    const t = c.currentTime;
    noiseBurst({ t, duration: 1.8, freq: 180, type: "lowpass", gain: 0.7 });
    noiseBurst({ t: t + 0.12, duration: 2.2, freq: 90, type: "lowpass", gain: 0.55 });
    oscBurst({ t, freq: 45, endFreq: 22, duration: 2.4, gain: 0.5, type: "sine" });
    noiseBurst({ t: t + 0.45, duration: 0.9, freq: 400, type: "lowpass", gain: 0.3 });
  },
  creak() {
    if (!enabled) return;
    const c = ensureCtx();
    const t = c.currentTime;
    const osc = c.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.linearRampToValueAtTime(160, t + 0.7);
    osc.frequency.linearRampToValueAtTime(210, t + 1.4);
    osc.frequency.linearRampToValueAtTime(90, t + 2.2);
    const filter = c.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 700;
    filter.Q.value = 4;
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.12, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.08, t + 1.2);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.3);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(sfxGain!);
    osc.start(t);
    osc.stop(t + 2.4);
  },
  tarot() {
    if (!enabled) return;
    const c = ensureCtx();
    const t = c.currentTime;
    noiseBurst({ t, duration: 0.18, freq: 2400, type: "highpass", gain: 0.12 });
    noiseBurst({ t: t + 0.08, duration: 0.22, freq: 1800, type: "bandpass", gain: 0.1 });
    oscBurst({ t, freq: 920, endFreq: 240, duration: 0.25, gain: 0.05, type: "triangle" });
  },
  blow() {
    if (!enabled) return;
    const c = ensureCtx();
    const t = c.currentTime;
    noiseBurst({ t, duration: 0.45, freq: 1400, type: "bandpass", gain: 0.22 });
    noiseBurst({ t, duration: 0.5, freq: 600, type: "highpass", gain: 0.12 });
  },
  ignite() {
    if (!enabled) return;
    const c = ensureCtx();
    const t = c.currentTime;
    noiseBurst({ t, duration: 0.2, freq: 3000, type: "highpass", gain: 0.16 });
    oscBurst({ t, freq: 180, endFreq: 90, duration: 0.3, gain: 0.08, type: "sine" });
  },
  page() {
    if (!enabled) return;
    noiseBurst({ duration: 0.22, freq: 1600, type: "bandpass", gain: 0.1 });
  },
  seal() {
    if (!enabled) return;
    const c = ensureCtx();
    const t = c.currentTime;
    oscBurst({ t, freq: 90, duration: 0.18, gain: 0.3, type: "sine" });
    noiseBurst({ t, duration: 0.12, freq: 500, type: "lowpass", gain: 0.25 });
  },
  hover() {
    if (!enabled) return;
    oscBurst({ freq: 520, endFreq: 280, duration: 0.12, gain: 0.03, type: "sine" });
  },
};
