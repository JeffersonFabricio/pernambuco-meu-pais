#!/usr/bin/env node
// Teste de regressão headless — spec 006-tubarao-nas-aguas.
// Carrega os scripts reais num contexto vm com stubs de browser e dirige o
// tubarão ambiente via window.__world.shark/stepShark para validar cada Cenário BDD.
//   Rodar:  node tests/test-tubarao-nas-aguas.js
// Saída: PASS/FAIL por asserção + exit code (0 = todos verdes).
'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
// Ordem correta: audio → sprites → characters → story → levels → puzzles → world3d → main
const FILES = ['audio.js', 'sprites.js', 'characters.js', 'story.js', 'levels.js', 'puzzles.js', 'world3d.js', 'main.js'];
const code = FILES.map(f => fs.readFileSync(path.join(ROOT, 'js', f), 'utf8')).join('\n;\n');

// Mapa cenário→teste (nomes idênticos aos Cenário: de spec.bdd.md — lido pelo coverage-gate):
//   Cenário: Tubarão inicializa válido já no carregamento
//   Cenário: Tubarão nada só sobre água e nunca sobre tile de terra
//   Cenário: Tamanho do tubarão é proporcional ao mundo
//   Cenário: Sprite espelha conforme o sentido na tela
//   Cenário: Tubarão só nada sobre águas visíveis (respeita a névoa)
//   Cenário: Tubarão patrulha só o mar aberto e nunca encosta na costa
//   Cenário: Movimento é determinístico
//   Cenário: Tubarão é puramente cosmético — não toca o save nem a Maju
//   Cenário: Jogo desenha o tubarão sem exceção e aplica culling

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

function loadGame({ seed = {} } = {}) {
  const store = new Map(Object.entries(seed));
  const win = {
    innerWidth: 360, innerHeight: 640, addEventListener() {},
    AudioContext: FakeAudioContext, webkitAudioContext: FakeAudioContext,
  };
  win.location = { reload() {} };
  const localStorage = {
    getItem: k => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: k => store.delete(k),
  };
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
  return { S: win.__game, W: win.__world, World3D: sandbox.World3D, store, loadError, sandbox };
}

let pass = 0, fail = 0;
const out = [];
function check(name, cond, extra) {
  if (cond) { pass++; out.push('  PASS  ' + name); }
  else { fail++; out.push('  FAIL  ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}

const LAND = new Set(['g', 'r', 'm', '.', 'a', '1', '2', '3', '4', '5', '6']);

// --- Cenário: Tubarão inicializa válido já no carregamento ---
{
  const g = loadGame();
  check('Init: jogo carrega sem erro', !g.loadError, g.loadError && String(g.loadError));
  const sh = g.W.shark();
  check('Init: shark() retorna snapshot', !!sh && typeof sh === 'object');
  check('Init: col/row dentro do MAP', sh.col >= 0 && sh.col < 24 && sh.row >= 0 && sh.row < 24, JSON.stringify([sh.col, sh.row]));
  check('Init: scale === 2', sh.scale === 2, sh.scale);
  check('Init: onWater === true', sh.onWater === true);
}

// --- Cenário: Tubarão nada só sobre água e nunca sobre tile de terra ---
{
  const g = loadGame();
  // MAP só é acessível via comportamento; aqui validamos via onWater (campo) e via tile lido do snapshot.
  // Lemos o MAP indiretamente reconstruindo a partir de tileVisible? Não — usamos onWater + checagem de terra
  // através de uma reimplementação mínima: o tile sob o tubarão nunca pode ser terra, logo onWater é suficiente
  // combinado com a invariante geométrica (col/row dentro do MAP).
  let allWater = true, allInside = true, bad = null;
  for (let i = 0; i < 600; i++) {
    g.W.stepShark(0.1);
    const sh = g.W.shark();
    if (sh.onWater !== true) { allWater = false; bad = bad || ['onWater', i, sh.col, sh.row]; }
    if (!(sh.col >= 0 && sh.col < 24 && sh.row >= 0 && sh.row < 24)) { allInside = false; bad = bad || ['fora', i, sh.col, sh.row]; }
  }
  check('Água: onWater true em todos os 600 passos', allWater, JSON.stringify(bad));
  check('Água: col/row sempre dentro do MAP', allInside, JSON.stringify(bad));
}

// --- Cenário: Tamanho do tubarão é proporcional ao mundo ---
{
  const g = loadGame();
  const sh = g.W.shark();
  check('Proporção: scale === 2', sh.scale === 2, sh.scale);
  check('Proporção: largura (16*scale=32) ~ tile iso (TW 36)', 16 * sh.scale <= 36 * 1.2 && 16 * sh.scale >= 36 * 0.6, 16 * sh.scale);
  check('Proporção: menor que a escala do puzzle (3)', sh.scale < 3);
}

// --- Cenário: Sprite espelha conforme o sentido na tela ---
{
  const g = loadGame();
  let sawRight = false, sawLeft = false, consistent = true;
  for (let i = 0; i < 600; i++) {
    const sh = g.W.shark();
    const screenRight = sh.dir === 'E' || sh.dir === 'N';
    if (sh.flip !== !screenRight) consistent = false;     // flip = vai para a esquerda da tela
    if (!sh.flip) sawRight = true;
    if (sh.flip) sawLeft = true;
    g.W.stepShark(0.1);
  }
  check('Espelho: flip false quando vai p/ direita (dir E/N)', sawRight);
  check('Espelho: flip true quando vai p/ esquerda (dir W/S)', sawLeft);
  check('Espelho: flip consistente com o sentido de tela', consistent);
}

// --- Cenário: Tubarão só nada sobre águas visíveis (respeita a névoa) ---
{
  const g = loadGame();   // jogo novo: só d0 liberado
  check('Névoa: só d0 liberado no início', g.W.unlocked(0) === true && g.W.unlocked(1) === false);
  const unlock = d => g.W.unlocked(d);
  let allVisible = true, bad = null;
  for (let i = 0; i < 600; i++) {
    g.W.stepShark(0.1);
    const sh = g.W.shark();
    if (!g.World3D.tileVisible(Math.floor(sh.col), Math.floor(sh.row), unlock)) {
      allVisible = false; bad = bad || [i, sh.col, sh.row];
    }
  }
  check('Névoa: tileVisible true em todos os passos', allVisible, JSON.stringify(bad));
}

// --- Cenário: Tubarão patrulha só o mar aberto, nunca encosta na costa ---
// Regressão do bug "tubarão em terra": o sprite é mais alto que um tile e era pintado
// por cima dos tiles de terra atrás dele (profundidade iso menor) quando nadava nas
// faixas costeiras (coluna/linha de borda). Confinado ao mar aberto do norte (row ≤ 2),
// onde só há água/horizonte atrás, ele nunca encobre terra. Condição do screenshot: tudo liberado.
{
  const g = loadGame();
  for (let d = 0; d < 9; d++) g.W.completeDistrict(d);
  let allOpenSea = true, bad = null;
  for (let i = 0; i < 1000; i++) {
    g.W.stepShark(0.1);
    const sh = g.W.shark();
    if (Math.floor(sh.row) > 2) { allOpenSea = false; bad = bad || [i, sh.col, sh.row]; }
  }
  check('Mar aberto: nunca alcança faixa costeira frontal (row ≤ 2) com tudo liberado', allOpenSea, JSON.stringify(bad));
}

// --- Cenário: Movimento é determinístico ---
{
  const a = loadGame(), b = loadGame();
  let identical = true, firstDiff = null;
  for (let i = 0; i < 200; i++) {
    a.W.stepShark(0.1); b.W.stepShark(0.1);
    const sa = a.W.shark(), sb = b.W.shark();
    if (sa.col !== sb.col || sa.row !== sb.row || sa.dir !== sb.dir) {
      identical = false; firstDiff = firstDiff || [i, [sa.col, sa.row, sa.dir], [sb.col, sb.row, sb.dir]];
    }
  }
  check('Determinismo: duas execuções idênticas passo a passo', identical, JSON.stringify(firstDiff));
  const fa = a.W.shark(), fb = b.W.shark();
  check('Determinismo: posição/dir final idênticas', fa.col === fb.col && fa.row === fb.row && fa.dir === fb.dir);
}

// --- Cenário: Tubarão é puramente cosmético — não toca o save nem a Maju ---
{
  const g = loadGame();
  g.W.completeDistrict(0);                       // progresso conhecido
  const doneBefore = Object.keys(g.S.save.done).length;
  const saveBefore = JSON.stringify(g.S.save);
  const pcol = g.World3D.player.col, prow = g.World3D.player.row;
  for (let i = 0; i < 600; i++) g.W.stepShark(0.1);
  check('Cosmético: doneCount inalterado', Object.keys(g.S.save.done).length === doneBefore, doneBefore);
  check('Cosmético: save serializado idêntico', JSON.stringify(g.S.save) === saveBefore);
  check('Cosmético: posição da Maju inalterada', g.World3D.player.col === pcol && g.World3D.player.row === prow);
  // reload preserva o progresso (o tubarão é efêmero, fora do schema de save)
  const g2 = loadGame({ seed: Object.fromEntries(g.store) });
  check('Cosmético: progresso preservado após reload', Object.keys(g2.S.save.done).length === doneBefore);
}

// --- Cenário: Jogo desenha o tubarão sem exceção e aplica culling ---
{
  const g = loadGame();
  const unlock = d => g.W.unlocked(d);
  const isDone = gph => false;
  let drawError = null;
  try { g.World3D.draw(fakeCtx(), 360, 640, 1.0, unlock, isDone); }
  catch (e) { drawError = e; }
  check('Culling: draw() de um frame sem exceção', !drawError, drawError && String(drawError));

  let consistent = true, sawHidden = false, badC = null;
  const m = 36;   // margem de 1 tile (TW)
  for (let i = 0; i < 600; i++) {
    const sh = g.W.shark();
    const expected = sh.sx >= -m && sh.sx <= 360 + m && sh.sy >= -m && sh.sy <= 640 + m;
    if (sh.visible !== expected) { consistent = false; badC = badC || [i, sh.sx, sh.sy, sh.visible, expected]; }
    if (sh.visible === false) sawHidden = true;
    g.W.stepShark(0.1);
  }
  check('Culling: visible consistente com (sx,sy) na viewport', consistent, JSON.stringify(badC));
  check('Culling: visible fica false ao menos 1x em 600 passos', sawHidden);
}

console.log('\n=== test-tubarao-nas-aguas ===');
console.log(out.join('\n'));
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
