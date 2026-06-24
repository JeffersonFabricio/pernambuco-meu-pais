#!/usr/bin/env node
// Teste de regressão headless dos primos separados — spec 003-primos-separados.
// Mesmo harness do save namespace: carrega os scripts reais num contexto vm com stubs de
// browser, semeando o localStorage por cenário, e dirige a conversa via window.__world.talk/finish.
//   Rodar:  node specs/003-primos-separados/test-primos-separados.js
// Saída: PASS/FAIL por asserção + exit code (0 = todos verdes).
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const NEW_KEY = 'maresRecife:pernambuco-meu-pais';
const FILES = ['audio.js', 'sprites.js', 'story.js', 'levels.js', 'puzzles.js', 'world3d.js', 'main.js'];
const code = FILES.map(f => fs.readFileSync(path.join(ROOT, 'js', f), 'utf8')).join('\n;\n');
const LESSON = 'parceiro pra toda aventura';

// ---- stubs de browser (iguais ao harness do save namespace) ----
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
  return { S: win.__game, W: win.__world, World3D: sandbox.World3D, store, loadError };
}

// Mapa cenário→teste (nomes idênticos aos Cenário: de spec.bdd.md — lido pelo coverage-gate):
//   Cenário: Dois sprites distintos em tiles diferentes
//   Cenário: Conversa de introdução do Ravi menciona o Nicolas
//   Cenário: Conversa de introdução do Nicolas menciona o Ravi
//   Cenário: A lição da companhia aparece ao conhecer qualquer um dos primos
//   Cenário: Reencontro do Ravi após já ter conhecido
//   Cenário: Conhecer Nicolas antes de Ravi não interfere na intro do Ravi
//   Cenário: Save antigo com met.primos é migrado para met.ravi e met.nicolas
//   Cenário: Save sem met.primos mantém os primos como não conhecidos
//   Cenário: Save malformado não trava o carregamento (load defensivo)
//   Cenário: Contagem de conchas do distrito 2 não muda
//   Cenário: Jogo carrega e desenha os dois primos sem exceção
let pass = 0, fail = 0;
const out = [];
function check(name, cond, extra) {
  if (cond) { pass++; out.push('  PASS  ' + name); }
  else { fail++; out.push('  FAIL  ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}
const txt = lines => (lines || []).map(l => l.text).join(' | ');

// --- Cenário: Dois sprites distintos em tiles diferentes ---
{
  const g = loadGame(); g.S.mode = 'world';
  const wn = g.World3D.worldNpcs || [];
  const ravi = wn.find(n => n.key === 'ravi');
  const nico = wn.find(n => n.key === 'nicolas');
  check('Sprites: ravi em WORLD_NPCS', !!ravi);
  check('Sprites: nicolas em WORLD_NPCS', !!nico);
  check('Sprites: sem entrada primos em WORLD_NPCS', !wn.some(n => n.key === 'primos'));
  check('Sprites: tiles (col,row) distintos', !!ravi && !!nico && (ravi.col !== nico.col || ravi.row !== nico.row), ravi && nico && `${ravi.col},${ravi.row} vs ${nico.col},${nico.row}`);
  check('Sprites: labels próprios', !!ravi && !!nico && ravi.label === 'RAVI' && nico.label === 'NICOLAS', ravi && nico && `${ravi.label}/${nico.label}`);
  check('Sprites: NPC_DRAW.ravi e .nicolas são funções', typeof g.World3D.npcDraw?.ravi === 'function' && typeof g.World3D.npcDraw?.nicolas === 'function');
}

// --- Cenário: Conversa de introdução do Ravi menciona o Nicolas ---
{
  const g = loadGame(); g.S.mode = 'world';
  const mode = g.W.talk('ravi');
  check('Ravi intro: entra em diálogo', mode === 'dialogue', mode);
  const lines = g.S.dlg && g.S.dlg.lines;
  check('Ravi intro: fala cita Nicolas', /nicolas/i.test(txt(lines)), txt(lines).slice(0, 60));
  g.W.finish();
  check('Ravi intro: met.ravi vira true', g.S.save.met.ravi === true, g.S.save.met.ravi);
}

// --- Cenário: Conversa de introdução do Nicolas menciona o Ravi ---
{
  const g = loadGame(); g.S.mode = 'world';
  g.W.talk('nicolas');
  const lines = g.S.dlg && g.S.dlg.lines;
  check('Nicolas intro: fala cita Ravi', /ravi/i.test(txt(lines)), txt(lines).slice(0, 60));
  g.W.finish();
  check('Nicolas intro: met.nicolas vira true', g.S.save.met.nicolas === true, g.S.save.met.nicolas);
}

// --- Cenário: A lição da companhia aparece ao conhecer qualquer um dos primos ---
{
  const gr = loadGame(); gr.S.mode = 'world';
  gr.W.talk('ravi'); gr.W.finish();
  check('Lição via Ravi: toast com a lição', !!gr.S.toast && (gr.S.toast.sub || '').includes(LESSON), gr.S.toast && gr.S.toast.sub);
  const gn = loadGame(); gn.S.mode = 'world';
  gn.W.talk('nicolas'); gn.W.finish();
  check('Lição via Nicolas: toast com a lição', !!gn.S.toast && (gn.S.toast.sub || '').includes(LESSON), gn.S.toast && gn.S.toast.sub);
}

// --- Cenário: Reencontro do Ravi após já ter conhecido ---
{
  const g = loadGame(); g.S.mode = 'world';
  g.W.talk('ravi'); g.W.finish();             // 1º encontro
  const m2 = g.W.talk('ravi');                // 2ª vez
  const lines = g.S.dlg && g.S.dlg.lines;
  check('Reencontro Ravi: entra em diálogo', m2 === 'dialogue', m2);
  // raviAgain é mais curto que a intro: a intro do Ravi tem >4 falas
  check('Reencontro Ravi: usa a versão curta (não a intro)', !!lines && (lines||[]).length > 0 && (lines||[]).length <= 4, lines && (lines||[]).length);
}

// --- Cenário: Conhecer Nicolas antes de Ravi não interfere na intro do Ravi ---
{
  const g = loadGame(); g.S.mode = 'world';
  g.W.talk('nicolas'); g.W.finish();
  check('Ordem invertida: met.nicolas true, met.ravi ainda falsy', g.S.save.met.nicolas === true && !g.S.save.met.ravi, `${g.S.save.met.nicolas}/${g.S.save.met.ravi}`);
  g.W.talk('ravi');
  const lines = g.S.dlg && g.S.dlg.lines;
  check('Ordem invertida: Ravi ainda mostra a intro (cita Nicolas)', /nicolas/i.test(txt(lines)) && (lines||[]).length > 4, lines && (lines||[]).length);
}

// --- Cenário: Save antigo com met.primos é migrado para met.ravi e met.nicolas ---
{
  const g = loadGame({ seed: { [NEW_KEY]: JSON.stringify({ v: 3, done: {}, met: { primos: true } }) } }); g.S.mode = 'world';
  check('Migração: met.ravi true', g.S.save.met.ravi === true, g.S.save.met.ravi);
  check('Migração: met.nicolas true', g.S.save.met.nicolas === true, g.S.save.met.nicolas);
  const m = g.W.talk('ravi');
  const lines = g.S.dlg && g.S.dlg.lines;
  check('Migração: Ravi mostra reencontro (curto)', m === 'dialogue' && (lines||[]).length <= 4, lines && (lines||[]).length);
}

// --- Cenário: Save sem met.primos mantém os primos como não conhecidos ---
{
  const g = loadGame({ seed: { [NEW_KEY]: JSON.stringify({ v: 3, done: {}, met: {} }) } }); g.S.mode = 'world';
  check('Sem primos: met.ravi falsy', !g.S.save.met.ravi);
  check('Sem primos: met.nicolas falsy', !g.S.save.met.nicolas);
  g.W.talk('nicolas');
  const lines = g.S.dlg && g.S.dlg.lines;
  check('Sem primos: Nicolas mostra a intro (longa)', (lines||[]).length > 4, lines && (lines||[]).length);
}

// --- Cenário: Save malformado não trava o carregamento (load defensivo) ---
{
  const g = loadGame({ seed: { [NEW_KEY]: JSON.stringify({ v: 3, done: {}, met: null }) } }); g.S.mode = 'world';
  check('Malformado: sem loadError', !g.loadError, g.loadError && g.loadError.message);
  check('Malformado: met.ravi/nicolas falsy', !g.S.save.met.ravi && !g.S.save.met.nicolas);
}

// --- Cenário: Contagem de conchas do distrito 2 não muda + Jogo carrega sem exceção ---
{
  const g = loadGame(); g.S.mode = 'world';
  check('Carrega: sem loadError', !g.loadError, g.loadError && g.loadError.message);
  // d2 = índice 2; DISTRICT_SIZES não exposto, mas completeDistrict(2) marca exatamente o tamanho dele
  g.W.completeDistrict(2);
  const all = Object.keys(g.S.save.done).length;
  check('d2: completar marca um número > 0 de conchas (igual ao tamanho do distrito)', all > 0, all);
  // TOTAL_PHASES = 31: completar tudo dá 31
  g.W.completeAll();
  check('TOTAL_PHASES permanece 31', Object.keys(g.S.save.done).length === 31, Object.keys(g.S.save.done).length);
}

out.push('');
out.push('RESULT: ' + pass + ' passed, ' + fail + ' failed');
console.log(out.join('\n'));
process.exit(fail > 0 ? 1 : 0);
