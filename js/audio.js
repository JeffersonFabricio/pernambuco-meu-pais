// ============================================================
// Marés do Recife — áudio chiptune (WebAudio, sem assets)
// ============================================================
const AudioFX = (() => {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type = 'square', vol = 0.15, when = 0, slide = 0) {
    const c = ensure();
    if (!c || muted) return;
    const t0 = c.currentTime + when;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g).connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }

  function noise(dur, vol = 0.2, when = 0, low = false) {
    const c = ensure();
    if (!c || muted) return;
    const t0 = c.currentTime + when;
    const len = Math.max(1, Math.floor(c.sampleRate * dur));
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    let node = src;
    if (low) {
      const f = c.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 700;
      src.connect(f);
      node = f;
    }
    node.connect(g).connect(c.destination);
    src.start(t0);
  }

  return {
    unlock() { ensure(); },
    toggleMute() { muted = !muted; return muted; },
    get muted() { return muted; },

    tap()     { tone(660, 0.06, 'square', 0.08); },
    blip()    { tone(880, 0.05, 'square', 0.07); },
    ok()      { tone(523, 0.09, 'square', 0.12); tone(659, 0.09, 'square', 0.12, 0.09); tone(784, 0.14, 'square', 0.12, 0.18); },
    bad()     { tone(220, 0.15, 'sawtooth', 0.12, 0, -80); },
    splash()  { noise(0.25, 0.18, 0, true); tone(300, 0.2, 'sine', 0.1, 0, -150); },
    step()    { tone(440, 0.04, 'triangle', 0.08); },
    flip()    { tone(700, 0.05, 'triangle', 0.09, 0, 200); },
    bead()    { [659, 784, 988, 1319].forEach((f, i) => tone(f, 0.12, 'square', 0.11, i * 0.1)); },
    win()     { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, 0.13, 'square', 0.12, i * 0.11)); },

    // tambores do maracatu
    alfaia()  { tone(70, 0.28, 'sine', 0.5, 0, -25); noise(0.06, 0.1, 0, true); },
    caixa()   { noise(0.09, 0.25); tone(240, 0.05, 'triangle', 0.1); },
    gongue()  { tone(1245, 0.22, 'square', 0.12, 0, -200); tone(1865, 0.12, 'square', 0.07); },
    agbe()    { noise(0.07, 0.22); noise(0.05, 0.12, 0.06); },

    drum(i)   { [this.alfaia, this.caixa, this.gongue, this.agbe][i].call(this); },
  };
})();
// Hook de teste: expõe AudioFX para o harness headless (window.__audio) — permite espiar win()/ok()/etc.
if (typeof window !== 'undefined') window.__audio = AudioFX;
