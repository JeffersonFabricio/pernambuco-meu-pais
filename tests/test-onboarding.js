#!/usr/bin/env node
// Teste de regressão headless do onboarding (Fase 2) — spec 001-onboarding-recife.
// Zero-dep: usa só builtins do node. Carrega os scripts reais do jogo num contexto vm com
// stubs de browser (canvas/audio/localStorage) e dirige o fluxo via os hooks window.__world.
//   Rodar:  node tests/test-onboarding.js
// Saída: lista PASS/FAIL por cenário BDD + exit code (0 = todos verdes).
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

// ---- stubs de browser ----
function fakeCtx() {
  return new Proxy({}, {
    get(_t, prop) {
      if (prop === 'measureText') return () => ({ width: 10 });
      if (prop === 'createLinearGradient' || prop === 'createRadialGradient') return () => ({ addColorStop() {} });
      if (prop === 'getImageData') return () => ({ data: new Uint8ClampedArray(4) });
      if (prop === 'canvas') return { width: 360, height: 640 };
      return () => {};
    },
    set() { return true; },
  });
}
function fakeCanvas() {
  return {
    width: 360, height: 640, style: {},
    getContext: () => fakeCtx(),
    addEventListener() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 360, height: 640 }),
  };
}
function fakeAudioNode() {
  return new Proxy(function () {}, {
    get(_t, prop) {
      if (prop === 'currentTime') return 0;
      if (prop === 'destination') return fakeAudioNode();
      if (prop === 'gain' || prop === 'frequency') return { value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} };
      if (prop === 'state') return 'running';
      return () => fakeAudioNode();
    },
    set() { return true; },
    apply() { return fakeAudioNode(); },
  });
}
const FakeAudioContext = function () { return fakeAudioNode(); };
const store = new Map();
const win = {
  innerWidth: 360, innerHeight: 640, addEventListener() {},
  AudioContext: FakeAudioContext, webkitAudioContext: FakeAudioContext,
};
win.location = { reload() {} };
const sandbox = {
  window: win,
  document: { getElementById: () => fakeCanvas(), createElement: () => fakeCanvas(), addEventListener() {} },
  localStorage: {
    getItem: k => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: k => store.delete(k),
  },
  performance: { now: () => 0 },
  requestAnimationFrame: () => 0,
  navigator: { userAgent: 'node' },
  console, location: win.location,
  Math, JSON, Date, Object, Array, Number, String, Boolean, Set, Map, Symbol,
  Uint8ClampedArray, Float32Array,
};
sandbox.globalThis = sandbox;
sandbox.self = sandbox;

const FILES = ['audio.js', 'sprites.js', 'characters.js', 'story.js', 'levels.js', 'puzzles.js', 'world3d.js', 'main.js'];
const code = FILES.map(f => fs.readFileSync(path.join(ROOT, 'js', f), 'utf8')).join('\n;\n');
vm.createContext(sandbox);
try {
  vm.runInContext(code, sandbox, { filename: 'game-bundle.js' });
} catch (e) {
  console.error('LOAD ERROR:', e.message);
  process.exit(2);
}

// ---- cenários (BDD do spec.bdd.md) ----
const S = win.__game;
const W = win.__world;
let pass = 0, fail = 0;
const out = [];
function check(name, cond, extra) {
  if (cond) { pass++; out.push('  PASS  ' + name); }
  else { fail++; out.push('  FAIL  ' + name + (extra ? '  → ' + extra : '')); }
}
function fresh() {
  S.save.done = {}; S.save.met = {}; S.save.briefed = false; S.save.fin = false;
  S.mode = 'world'; S.near = null; S.nearNpc = null; S.toast = null;
}
const snap = () => JSON.stringify({ mica: !!S.save.met.mica, jona: !!S.save.met.jona, briefed: !!S.save.briefed, mode: S.mode });
function talkCapture(key) {
  W.talk(key);
  const dlg = S.dlg
    ? { len: S.dlg.lines.length, first: (S.dlg.lines.find(l => l.who !== 'maju' && l.who !== 'nar') || S.dlg.lines[0]).text }
    : { len: -1, first: '' };
  W.finish();
  return dlg;
}

fresh();
check('Mundo nasce !briefed', S.save.briefed === false, snap());

fresh();
const dev = talkCapture('jona');
check('Jonatha antes da Micaele → desvio', /tua mãe|alô/i.test(dev.first), dev.first);
check('Desvio não marca met.jona', !S.save.met.jona, snap());
check('Desvio não seta briefed', S.save.briefed === false, snap());
check('Desvio não marca met.mica', !S.save.met.mica, snap());

fresh();
W.talk('mica');
check('Micaele: abre diálogo', S.mode === 'dialogue', snap());
const welcomeLen = S.dlg.lines.length;
check('Micaele: boas-vindas ao Recife', /bem-vinda|recife/i.test(S.dlg.lines.find(l => l.who === 'mica').text));
W.finish();
check('Micaele: met.mica=true após diálogo', S.save.met.mica === true, snap());
check('Micaele: ainda não briefed', S.save.briefed === false, snap());
check('Micaele: volta pro mundo', S.mode === 'world', snap());

const micaAgain = talkCapture('mica');
check('Reencontro Micaele (met.mica, !briefed): motivadora, não repete welcome',
  micaAgain.len < welcomeLen && /consegue|vai/i.test(micaAgain.first), 'len=' + micaAgain.len + ' welcome=' + welcomeLen);

S.save.briefed = false; S.save.met.jona = false; S.mode = 'world';
W.talk('jona');
const missionLen = S.dlg.lines.length;
check('Jonatha após Micaele: diálogo da missão', /orgulho|colar/i.test(S.dlg.lines.find(l => l.who === 'jona').text));
W.finish();
check('Jonatha: briefed=true', S.save.briefed === true, snap());
check('Jonatha: met.jona=true', S.save.met.jona === true, snap());

S.mode = 'world';
const jonaAgain = talkCapture('jona');
check('Reencontro Jonatha (briefed): motivadora curta',
  jonaAgain.len < missionLen && /consegue|vai lá|lindo/i.test(jonaAgain.first), 'len=' + jonaAgain.len);

fresh();
W.tryEnter(1);
check('Gate: concha não abre sem briefed (mode=world)', S.mode === 'world', snap());
check('Gate: toast pede falar com os pais', !!S.toast && /mainha|painho|pais/i.test(S.toast.text), S.toast ? S.toast.text : 'sem toast');

fresh();
S.save.met.mica = true; S.save.briefed = true; S.mode = 'world';
W.tryEnter(1);
check('Gate liberado: ENTRAR sai do mundo (intro/puzzle)', S.mode === 'dialogue' || S.mode === 'puzzle', snap());

S.mode = 'dialogue';
check('Guard: enterNear/tryEnter ignorado fora do mundo', W.tryEnter(2) === 'dialogue', 'mode=' + S.mode);

fresh();
S.save.done = { 1: true }; S.save.briefed = false;
const migrated = !!S.save.briefed || !!(S.save.met.jona && S.save.met.mica) || Object.keys(S.save.done).length > 0;
check('Migração: save com ≥1 concha → briefed', migrated === true);

out.push('');
out.push('RESULT: ' + pass + ' passed, ' + fail + ' failed');
console.log(out.join('\n'));
process.exit(fail > 0 ? 1 : 0);
