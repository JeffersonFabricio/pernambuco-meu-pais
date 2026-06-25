#!/usr/bin/env node
// Teste de regressão headless da feature 006-marcos-recife.
// Cobre os cenários [H] da spec: Marco Zero (praça caminhável + 4 nós de d0 intactos),
// igreja como prédio (draw não lança, asMarias d7), mar fura a névoa (tileVisible por tipo),
// e invariantes (31 conchas distintas, spawns caminháveis).
//   Rodar:  node tests/test-marcos-recife.js
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const FILES = ['audio.js', 'sprites.js', 'characters.js', 'story.js', 'levels.js', 'puzzles.js', 'world3d.js', 'main.js'];
const code = FILES.map(f => fs.readFileSync(path.join(ROOT, 'js', f), 'utf8')).join('\n;\n');

function fakeCtx() {
  return new Proxy({}, { get(_t, p) {
    if (p === 'measureText') return () => ({ width: 10 });
    if (p === 'createLinearGradient' || p === 'createRadialGradient') return () => ({ addColorStop() {} });
    if (p === 'getImageData') return () => ({ data: new Uint8ClampedArray(4) });
    if (p === 'canvas') return { width: 360, height: 640 };
    return () => {};
  }, set() { return true; } });
}
function fakeCanvas() {
  return { width: 360, height: 640, style: {}, getContext: () => fakeCtx(), addEventListener() {}, getBoundingClientRect: () => ({ left: 0, top: 0, width: 360, height: 640 }) };
}
const win = { innerWidth: 360, innerHeight: 640, addEventListener() {}, AudioContext: function () { return new Proxy({}, { get() { return () => ({}); } }); }, webkitAudioContext: function () {} };
win.location = { reload() {} };
const store = new Map();
const sandbox = {
  window: win,
  document: { getElementById: () => fakeCanvas(), createElement: () => fakeCanvas(), addEventListener() {} },
  localStorage: { getItem: k => store.has(k) ? store.get(k) : null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) },
  performance: { now: () => 0 }, requestAnimationFrame: () => 0, navigator: { userAgent: 'node' },
  console, location: win.location,
  Math, JSON, Date, Object, Array, Number, String, Boolean, Set, Map, Symbol, Uint8ClampedArray, Float32Array,
};
sandbox.globalThis = sandbox; sandbox.self = sandbox;
vm.createContext(sandbox);
let loadError = null;
try { vm.runInContext(code, sandbox, { filename: 'bundle.js' }); } catch (e) { loadError = e; }

const W3 = sandbox.World3D;
const LEVELS = win.__levels || {};   // TOTAL_PHASES/DISTRICT_SIZES são const → expostos via window.__levels
let pass = 0, fail = 0;
const out = [];
function check(name, cond, extra) {
  if (cond) { pass++; out.push('  PASS  ' + name); }
  else { fail++; out.push('  FAIL  ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}

check('Boot: sem loadError', !loadError, loadError && loadError.message);
check('API: walkable exposta', typeof W3.walkable === 'function');
check('API: tileVisible exposta', typeof W3.tileVisible === 'function');

// ---------- Marco Zero ----------
// Cenário: praça é caminhável
const mz = W3.marcoZero || { col: 6, row: 7 };
check('Marco Zero: praça caminhável (tile central)', W3.walkable(mz.col, mz.row, () => true) === true);
// Cenário: praça não altera contagem de fases (d0 mantém 4 nós)
const d0nodes = (W3.phaseNodes || []).filter(n => n.d === 0);
check('Marco Zero: d0 mantém 4 nós de fase', d0nodes.length === 4, d0nodes.length);
check('Invariantes: TOTAL_PHASES === 31', LEVELS.TOTAL_PHASES === 31, LEVELS.TOTAL_PHASES);
check('Invariantes: DISTRICT_SIZES[0] === 4', LEVELS.DISTRICT_SIZES && LEVELS.DISTRICT_SIZES[0] === 4, LEVELS.DISTRICT_SIZES && LEVELS.DISTRICT_SIZES[0]);

// ---------- Mar fura a névoa ----------
// oceano interior visível mesmo com tudo travado; terra travada oculta
check('Mar: oceano interior fura a névoa (5,0)', W3.tileVisible(5, 0, () => false) === true);
check('Mar: terra travada de d1 segue oculta (13,7)', W3.tileVisible(13, 7, () => false) === false);
// a Maju vê o mar mas não anda nele
check('Mar: walkable(oceano) é false', W3.walkable(5, 0, () => true) === false);

// ---------- Ambiente: mangue + coqueiros ----------
check('Manguezal: tile de mangue (3,12) não caminhável', W3.walkable(3, 12, () => true) === false);
check('Manguezal: tile de rio (4,13) não caminhável', W3.walkable(4, 13, () => true) === false);
check('Orla: coqueiros registrados (não-vazio)', Array.isArray(W3.coqueiros) && W3.coqueiros.length > 0, W3.coqueiros && W3.coqueiros.length);

// ---------- Igreja como prédio ----------
const igreja = (W3.worldNpcs || []).find(n => n.key === 'asMarias');
check('Igreja: asMarias em WORLD_NPCS com d === 7', !!igreja && igreja.d === 7, igreja && igreja.d);
check('Igreja: NPC_DRAW.asMarias é função', typeof W3.npcDraw?.asMarias === 'function');

// ---------- Render não lança ----------
let drawErr = null;
try { W3.draw(fakeCtx(), 360, 640, 1.0, () => true, () => false); } catch (e) { drawErr = e; }
check('Render: World3D.draw não lança (tudo aberto)', !drawErr, drawErr && drawErr.message);
let drawErr2 = null;
try { W3.draw(fakeCtx(), 360, 640, 1.0, () => false, () => false); } catch (e) { drawErr2 = e; }
check('Render: World3D.draw não lança (tudo travado — só mar + d0)', !drawErr2, drawErr2 && drawErr2.message);

// nodeScreen cobre 31 conchas distintas
const TOTAL = LEVELS.TOTAL_PHASES;
const pos = [];
let missing = 0;
for (let g = 1; g <= TOTAL; g++) {
  const p = W3.nodeScreen(g);
  if (!p) { missing++; continue; }
  pos.push(Math.round(p.x) + ',' + Math.round(p.y));
}
check('Conchas: nodeScreen cobre todos os ' + TOTAL + ' g', missing === 0, missing + ' faltando');
check('Conchas: 31 em posições distintas', pos.length === new Set(pos).size, (pos.length - new Set(pos).size) + ' duplicadas');

// ---------- Spawns caminháveis em 0..8 ----------
let spawnsBad = [];
for (let d = 0; d < 9; d++) {
  W3.reset(d);
  const c = Math.floor(W3.player.col), r = Math.floor(W3.player.row);
  if (!W3.walkable(c, r, () => true)) spawnsBad.push('d' + d + '(' + c + ',' + r + ')');
}
check('Spawns: todos os distritos 0..8 caem em tile caminhável', spawnsBad.length === 0, spawnsBad.join(' '));

out.push('');
out.push('RESULT: ' + pass + ' passed, ' + fail + ' failed');
console.log(out.join('\n'));
process.exit(fail === 0 ? 0 : 1);
