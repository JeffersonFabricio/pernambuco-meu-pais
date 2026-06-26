#!/usr/bin/env node
// Teste de regressão headless — spec 011-mangue-fundo-vivo.
// Garante o "fundo vivo" da cena 5 (Mangue): uma antena de silhueta diurna enfiada na
// lama (parte estática .s) + caranguejos andando (parte animada .d), sem regredir os
// detritos boiando nem vazar para outras cenas.
// Carrega os scripts reais num contexto vm com stubs de browser e ESPIA os globais
// antena/drawCrab/PR (reatribuição no contexto global) antes de invocar SCENES[5].s/.d
// — SCENES e drawScene vêm do hook window.__scenes / window.__drawScene.
//   Rodar:  node tests/test-mangue-fundo-vivo.js
// Saída: PASS/FAIL por asserção + exit code (0 = todos verdes).
'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const FILES = ['audio.js', 'sprites.js', 'characters.js', 'story.js', 'levels.js', 'puzzles.js', 'world3d.js', 'main.js'];
const code = FILES.map(f => fs.readFileSync(path.join(ROOT, 'js', f), 'utf8')).join('\n;\n');

// Mapa cenário→teste (nomes idênticos aos Cenário: de spec.bdd.md — lido pelo coverage-gate):
//   Scenario: A antena aparece na parte estática do mangue
//   Scenario: A antena usa cor de silhueta diurna, distinta da cena 9
//   Scenario: Caranguejos são desenhados na parte animada em escala de fundo
//   Scenario: Os caranguejos se mexem ao longo do tempo
//   Scenario: Os caranguejos ficam na faixa de lama em qualquer instante
//   Scenario: As coordenadas dos caranguejos são finitas em t = 0
//   Scenario: Os detritos boiando continuam sendo desenhados (sem regressão)
//   Scenario: A cena renderiza via drawScene no primeiro frame sem erro
//   Scenario: O escopo não vaza para outras cenas

const LAMA_Y = 440;     // a lama da cena 5 começa em y=440 (SCENES[5].s)
const DETRITO_COR = '#6a5a42';
const COR_DIURNA = '#2a4a30';
const COR_CREPUSCULO_9 = '#1a2f26';

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

function loadGame() {
  const win = { innerWidth: 360, innerHeight: 640, addEventListener() {}, AudioContext: FakeAudioContext, webkitAudioContext: FakeAudioContext };
  win.location = { reload() {} };
  const store = new Map();
  const localStorage = { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
  const sandbox = {
    window: win,
    document: { getElementById: () => fakeCanvas(), createElement: () => fakeCanvas(), addEventListener() {} },
    localStorage,
    performance: { now: () => 0 },
    requestAnimationFrame: () => 0,
    navigator: { userAgent: 'node' },
    console, location: win.location,
    Math, JSON, Date, Object, Array, Number, String, Boolean, Set, Map, Symbol,
    Uint8ClampedArray, Float32Array,
  };
  sandbox.globalThis = sandbox;
  sandbox.self = sandbox;
  vm.createContext(sandbox);
  let loadError = null;
  try { vm.runInContext(code, sandbox, { filename: 'game-bundle.js' }); }
  catch (e) { loadError = e; }
  return { sandbox, win, levels: win.__levels, loadError };
}

// Instala espiões nos globais de desenho. Cada espião registra os argumentos e chama o
// original (drawScene executa de verdade → cobre "não lança exceção"). Resetável por cenário.
function spy(g) {
  const sb = g.sandbox;
  const calls = { antena: [], drawCrab: [], PR: [] };
  const wrap = (name) => {
    const orig = sb[name];
    sb[name] = function (...a) { calls[name].push(a); return orig.apply(this, a); };
  };
  wrap('antena'); wrap('drawCrab'); wrap('PR');
  return {
    calls,
    reset() { calls.antena.length = 0; calls.drawCrab.length = 0; calls.PR.length = 0; },
  };
}

let pass = 0, fail = 0;
const out = [];
function check(name, cond, extra) {
  if (cond) { pass++; out.push('  PASS  ' + name); }
  else { fail++; out.push('  FAIL  ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}
const isFinite0 = n => typeof n === 'number' && Number.isFinite(n);

const game = loadGame();
check('Bundle carrega sem exceção', !game.loadError, game.loadError && game.loadError.message);
const SC = game.win.__scenes;
const drawScene = game.win.__drawScene;
check('Hook window.__scenes exposto', !!SC && !!SC[5], typeof SC);
const sp = spy(game);

// --- Scenario: A antena aparece na parte estática do mangue ---
{
  sp.reset();
  SC[5].s(fakeCtx());
  check('Antena: SCENES[5].s chama antena ≥1x', sp.calls.antena.length >= 1, sp.calls.antena.length);
  check('Antena: base (arg y) na faixa de lama (y≥440)',
    sp.calls.antena.some(a => a[2] >= LAMA_Y), sp.calls.antena.map(a => a[2]).join(','));
}

// --- Scenario: A antena usa cor de silhueta diurna, distinta da cena 9 ---
{
  sp.reset();
  SC[5].s(fakeCtx());
  const cores = sp.calls.antena.map(a => a[4]);
  check('Antena: usa cor diurna explícita #2a4a30', cores.includes(COR_DIURNA), cores.join(','));
  check('Antena: cor diferente do crepúsculo da cena 9 (#1a2f26)',
    COR_DIURNA !== COR_CREPUSCULO_9 && cores.some(c => c === COR_DIURNA), cores.join(','));
}

// --- Scenario: Caranguejos são desenhados na parte animada em escala de fundo ---
{
  sp.reset();
  SC[5].d(fakeCtx(), 0.5);
  check('Caranguejos: SCENES[5].d chama drawCrab ≥2x', sp.calls.drawCrab.length >= 2, sp.calls.drawCrab.length);
  check('Caranguejos: escala (arg s) = 2 em todas',
    sp.calls.drawCrab.length > 0 && sp.calls.drawCrab.every(a => a[3] === 2),
    sp.calls.drawCrab.map(a => a[3]).join(','));
}

// --- Scenario: Os caranguejos se mexem ao longo do tempo ---
{
  sp.reset();
  SC[5].d(fakeCtx(), 0.5);
  const xsA = sp.calls.drawCrab.map(a => a[1]);
  sp.reset();
  SC[5].d(fakeCtx(), 1.7);
  const xsB = sp.calls.drawCrab.map(a => a[1]);
  const mexeu = xsA.length === xsB.length && xsA.some((x, i) => x !== xsB[i]);
  check('Caranguejos: ao menos um x difere entre t=0.5 e t=1.7', mexeu, `A=[${xsA}] B=[${xsB}]`);
}

// --- Scenario: Os caranguejos ficam na faixa de lama em qualquer instante ---
{
  sp.reset();
  for (const t of [0, 0.5, 1.7, 3.0, 5.0]) SC[5].d(fakeCtx(), t);
  const ys = sp.calls.drawCrab.map(a => a[2]);
  const xs = sp.calls.drawCrab.map(a => a[1]);
  check('Caranguejos: todo y ≥ 440', sp.calls.drawCrab.length > 0 && ys.every(y => y >= LAMA_Y), ys.join(','));
  check('Caranguejos: todo x em 0 ≤ x < 360', xs.every(x => x >= 0 && x < 360), xs.join(','));
}

// --- Scenario: As coordenadas dos caranguejos são finitas em t = 0 ---
{
  sp.reset();
  SC[5].d(fakeCtx(), 0);
  const finitos = sp.calls.drawCrab.length > 0 && sp.calls.drawCrab.every(a => isFinite0(a[1]) && isFinite0(a[2]));
  check('Caranguejos: x e y finitos em t=0 (sem NaN/Infinity)', finitos,
    sp.calls.drawCrab.map(a => `(${a[1]},${a[2]})`).join(' '));
}

// --- Scenario: Os detritos boiando continuam sendo desenhados (sem regressão) ---
{
  let threw = false;
  const detritosPorInvocacao = [];
  for (const t of [0.5, 1.7]) {
    sp.reset();
    try { SC[5].d(fakeCtx(), t); } catch { threw = true; }
    detritosPorInvocacao.push(sp.calls.PR.filter(a => a[5] === DETRITO_COR).length);
  }
  check('Detritos: ≥2 retângulos cor #6a5a42 por invocação',
    detritosPorInvocacao.every(n => n >= 2), detritosPorInvocacao.join(','));
  check('Detritos: SCENES[5].d não lança exceção', !threw);
}

// --- Scenario: A cena renderiza via drawScene no primeiro frame sem erro ---
{
  sp.reset();
  let threw = null;
  try { drawScene(5, fakeCtx(), 0); } catch (e) { threw = e; }
  check('drawScene(5,…,0): não lança exceção', !threw, threw && threw.message);
  check('drawScene(5,…,0): drawCrab chamado pela parte .d', sp.calls.drawCrab.length >= 1, sp.calls.drawCrab.length);
}

// --- Scenario: O escopo não vaza para outras cenas ---
{
  sp.reset();
  SC[9].s(fakeCtx());
  check('Escopo: cena 9 mantém exatamente 2 antenas', sp.calls.antena.length === 2, sp.calls.antena.length);
  check('Escopo: TOTAL_PHASES permanece 31', game.levels && game.levels.TOTAL_PHASES === 31, game.levels && game.levels.TOTAL_PHASES);
}

console.log('\n=== test-mangue-fundo-vivo ===');
console.log(out.join('\n'));
console.log(`\n${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
