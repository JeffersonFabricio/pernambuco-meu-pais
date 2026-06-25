#!/usr/bin/env node
// Teste de regressão headless — spec 009-igreja-coerencia.
// Garante a coerência temática da igreja: fé/reencontro das Marias, sem vazamento
// do tema mangue (que pertence ao Jeff em d3 e ao puzzle Manguebeat em d7).
// Carrega os scripts reais num contexto vm com stubs de browser e inspeciona
// STORY/estado via window.__story / window.__game / window.__world / window.__levels.
//   Rodar:  node tests/test-igreja-coerencia.js
// Saída: PASS/FAIL por asserção + exit code (0 = todos verdes).
'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const NEW_KEY = 'maresRecife:pernambuco-meu-pais';
const FILES = ['audio.js', 'sprites.js', 'characters.js', 'story.js', 'levels.js', 'puzzles.js', 'world3d.js', 'main.js'];
const code = FILES.map(f => fs.readFileSync(path.join(ROOT, 'js', f), 'utf8')).join('\n;\n');

// Mapa cenário→teste (nomes idênticos aos Cenário: de spec.bdd.md — lido pelo coverage-gate):
//   Cenário: A cena de reencontro não menciona o tema do mangue
//   Cenário: A fala curta de reentrada também não menciona mangue
//   Cenário: Tocar a igreja antes de conhecer as duas avós mostra um toast de fé/beira-mar
//   Cenário: Entrar na igreja após conhecer as duas avós revela a Vó Maria Rita
//   Cenário: O titio Jeff continua sendo o portador do tema mangue
//   Cenário: A igreja continua não sendo uma concha e o total de fases não muda
//   Cenário: A igreja segue gated por met.vova e o jogo carrega sem exceção

const MANGUE_TOKENS = ['mangue', 'manguezal', 'manguebeat', 'lama'];
const hasMangue = s => MANGUE_TOKENS.some(t => s.toLowerCase().includes(t));

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
  return { S: win.__game, W: win.__world, World3D: sandbox.World3D, STORY: win.__story, levels: win.__levels, store, loadError, sandbox };
}

let pass = 0, fail = 0;
const out = [];
function check(name, cond, extra) {
  if (cond) { pass++; out.push('  PASS  ' + name); }
  else { fail++; out.push('  FAIL  ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}
const txt = lines => (lines || []).map(l => l.text).join(' | ');

// --- Cenário: A cena de reencontro não menciona o tema do mangue ---
{
  const g = loadGame();
  const cheia = (g.STORY && g.STORY.meet && g.STORY.meet.asMarias) || [];
  const blob = txt(cheia);
  check('asMarias: existe', cheia.length > 0, cheia.length);
  check('asMarias: sem tokens de mangue', !hasMangue(blob),
    MANGUE_TOKENS.filter(t => blob.toLowerCase().includes(t)).join(','));
  const FE_ANCHORS = ['igreja', 'beira-mar', 'piedade', 'céu', 'amor'];
  check('asMarias: tem âncora de fé/beira-mar', FE_ANCHORS.some(a => blob.toLowerCase().includes(a)),
    blob.slice(0, 80));
}

// --- Cenário: A fala curta de reentrada também não menciona mangue ---
{
  const g = loadGame();
  const curta = (g.STORY && g.STORY.meet && g.STORY.meet.asMariasAgain) || [];
  const blob = txt(curta);
  check('asMariasAgain: existe', curta.length > 0, curta.length);
  check('asMariasAgain: sem tokens de mangue', !hasMangue(blob),
    MANGUE_TOKENS.filter(t => blob.toLowerCase().includes(t)).join(','));
  check('asMariasAgain: mantém tom de reencontro das Marias',
    /maria|amor|aqui|juntas/i.test(blob), blob.slice(0, 80));
}

// --- Cenário: Tocar a igreja antes de conhecer as duas avós mostra um toast de fé/beira-mar ---
{
  const g = loadGame(); g.S.mode = 'world';
  g.S.save.met.vova = false; g.S.save.met.vovoMae = false;
  const mode = g.W.talk('asMarias');
  check('Toast: cena de reencontro NÃO dispara', mode !== 'dialogue', mode);
  check('Toast: exibido', !!g.S.toast, g.S.toast);
  const tt = (g.S.toast && g.S.toast.text) || '';
  const ANCHORS = ['igrejinha', 'piedade', 'porta', 'mar'];
  check('Toast: âncora de fé/lugar', ANCHORS.some(a => tt.toLowerCase().includes(a)), tt);
  check('Toast: sem tokens de mangue', !hasMangue(tt), tt);
  check('Toast: não revela qual avó falta (ADR-003)', !/vova|vovoMae|josé|rita/i.test(tt), tt);
}

// --- Cenário: Entrar na igreja após conhecer as duas avós revela a Vó Maria Rita ---
{
  const g = loadGame(); g.S.mode = 'world';
  g.S.save.met.vova = true; g.S.save.met.vovoMae = false; g.S.save.met.asMarias = false;
  const mode = g.W.talk('asMarias');
  check('Reencontro: entra em diálogo', mode === 'dialogue', mode);
  const lines = g.S.dlg && g.S.dlg.lines;
  check('Reencontro: falas de vova', !!(lines || []).some(l => l.who === 'vova'), txt(lines).slice(0, 60));
  check('Reencontro: falas de vovoMae', !!(lines || []).some(l => l.who === 'vovoMae'), txt(lines).slice(0, 60));
  check('Reencontro: S.dlg.duo = [vova, vovoMae]',
    !!g.S.dlg && Array.isArray(g.S.dlg.duo) && g.S.dlg.duo[0] === 'vova' && g.S.dlg.duo[1] === 'vovoMae',
    g.S.dlg && JSON.stringify(g.S.dlg.duo));
  g.W.finish();
  check('Reencontro: met.vovoMae vira true', g.S.save.met.vovoMae === true, g.S.save.met.vovoMae);
  check('Reencontro: met.asMarias vira true', g.S.save.met.asMarias === true, g.S.save.met.asMarias);
  check('Reencontro: toast "Lição aprendida"', !!g.S.toast && /lição aprendida/i.test(g.S.toast.text || ''),
    g.S.toast && g.S.toast.text);
}

// --- Cenário: O titio Jeff continua sendo o portador do tema mangue ---
{
  const g = loadGame();
  const jeff = (g.STORY && g.STORY.meet && g.STORY.meet.jeff) || [];
  const jeffAgain = (g.STORY && g.STORY.meet && g.STORY.meet.jeffAgain) || [];
  check('Jeff: STORY.meet.jeff contém "mangue"', /mangue/i.test(txt(jeff)), txt(jeff).slice(0, 80));
  const ambos = (txt(jeff) + ' | ' + txt(jeffAgain)).toLowerCase();
  check('Jeff: encaminha à igrejinha à beira-mar', /igrejinha|piedade/.test(ambos), ambos.slice(0, 120));
}

// --- Cenário: A igreja continua não sendo uma concha e o total de fases não muda ---
{
  const g = loadGame();
  check('Estrutura: __levels.TOTAL_PHASES === 31', g.levels && g.levels.TOTAL_PHASES === 31, g.levels && g.levels.TOTAL_PHASES);
  g.W.completeAll();
  const done = Object.keys(g.S.save.done);
  check('Estrutura: completeAll → 31 fases em done', done.length === 31, done.length);
  check('Estrutura: asMarias não está em save.done (não é concha)', !('asMarias' in g.S.save.done), done.join(','));
}

// --- Cenário: A igreja segue gated por met.vova e o jogo carrega sem exceção ---
{
  const g = loadGame(); g.S.mode = 'world';
  check('Gate: jogo carrega sem loadError', !g.loadError, g.loadError && g.loadError.message);
  g.S.save.met.vova = false;
  const mode = g.W.talk('asMarias');
  check('Gate: sem met.vova não entra na cena', mode !== 'dialogue', mode);
  check('Gate: NPC asMarias gated (toast em vez de cena)', !!g.S.toast, g.S.toast);
  let drawErr = null;
  try { g.World3D.npcDraw.asMarias(fakeCtx(), 0, 0, 2); } catch (e) { drawErr = e; }
  check('Gate: desenho da igreja não lança', !drawErr, drawErr && drawErr.message);
}

out.push('');
out.push('RESULT: ' + pass + ' passed, ' + fail + ' failed');
console.log(out.join('\n'));
process.exit(fail > 0 ? 1 : 0);
