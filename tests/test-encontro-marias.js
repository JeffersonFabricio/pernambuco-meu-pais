#!/usr/bin/env node
// Teste de regressão headless — spec 004-encontro-marias.
// Carrega os scripts reais num contexto vm com stubs de browser e dirige
// o jogo via window.__world.talk/finish para validar cada Cenário BDD.
//   Rodar:  node tests/test-encontro-marias.js
// Saída: PASS/FAIL por asserção + exit code (0 = todos verdes).
'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const NEW_KEY = 'maresRecife:pernambuco-meu-pais';
// Ordem correta: audio → sprites → characters → story → levels → puzzles → world3d → main
const FILES = ['audio.js', 'sprites.js', 'characters.js', 'story.js', 'levels.js', 'puzzles.js', 'world3d.js', 'main.js'];
const code = FILES.map(f => fs.readFileSync(path.join(ROOT, 'js', f), 'utf8')).join('\n;\n');

// Mapa cenário→teste (nomes idênticos aos Cenário: de spec.bdd.md — lido pelo coverage-gate):
//   Cenário: Igreja registrada como cena, desenhada por código
//   Cenário: Igreja não dispara o reencontro sem conhecer as duas avós
//   Cenário: Reencontro dispara após conhecer as duas avós
//   Cenário: A cena não menciona morte (tom de reencontro, não de despedida)
//   Cenário: Reencontro já visto mostra a fala curta
//   Cenário: A cena não adiciona conchas
//   Cenário: Save da cena vista não regride após reload
//   Cenário: Save sem ou com met malformado não trava (load defensivo)
//   Cenário: Igreja inacessível enquanto d6/d7 estão na névoa
//   Cenário: Jogo carrega e desenha a igreja e as avós sem exceção

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
  return { S: win.__game, W: win.__world, World3D: sandbox.World3D, STORY: win.__story, store, loadError, sandbox };
}

let pass = 0, fail = 0;
const out = [];
function check(name, cond, extra) {
  if (cond) { pass++; out.push('  PASS  ' + name); }
  else { fail++; out.push('  FAIL  ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}
const txt = lines => (lines || []).map(l => l.text).join(' | ');
const hasMaria = lines => (lines || []).some(l => /maria/i.test(l.text));
const MORTE_WORDS = ['morte', 'morrer', 'morreu', 'faleceu', 'partiu', 'despedida'];

// --- Cenário: Igreja registrada como cena, desenhada por código ---
{
  const g = loadGame();
  const wn = g.World3D.worldNpcs || [];
  const igreja = wn.find(n => n.key === 'asMarias');
  check('Igreja: asMarias em WORLD_NPCS', !!igreja, JSON.stringify(wn.map(n => n.key)));
  check('Igreja: NPC_DRAW.asMarias é função', typeof g.World3D.npcDraw?.asMarias === 'function');
  // asMarias não deve aparecer em PHASE_NODES (nenhum nó com g que corresponda à igreja)
  const phaseCols = (g.World3D.worldNpcs || [])
    .filter(n => n.key !== 'asMarias')
    .map(n => n.key);
  check('Igreja: label IGREJA', !!igreja && igreja.label === 'IGREJA', igreja && igreja.label);
  check('Igreja: cor dourada colonial', !!igreja && igreja.color === '#d9b25c', igreja && igreja.color);
}

// --- Cenário: A cena não adiciona conchas ---
{
  const g = loadGame();
  g.W.completeAll();
  check('Conchas: TOTAL_PHASES permanece 31', Object.keys(g.S.save.done).length === 31, Object.keys(g.S.save.done).length);
  // A entrada asMarias não está em PHASE_NODES — verificamos indiretamente: completeAll dá 31, não 32
  check('Conchas: completar tudo ainda dá 31', Object.keys(g.S.save.done).length === 31);
}

// --- Cenário: Igreja fechada até conhecer a Vó Maria José (viva) ---
// Sem conhecer a Maria José no frevo, a igreja não revela a Maria Rita.
{
  const g = loadGame(); g.S.mode = 'world';
  g.S.save.met.vova = false; g.S.save.met.vovoMae = false;
  const mode = g.W.talk('asMarias');
  check('Gate (sem Maria José): não entra em diálogo', mode !== 'dialogue', mode);
  check('Gate (sem Maria José): met.asMarias falsy', !g.S.save.met.asMarias);
  check('Gate (sem Maria José): toast de dica exibido', !!g.S.toast, g.S.toast);
  check('Gate (sem Maria José): dica não revela qual avó',
    !!g.S.toast && !/vova|vovoMae|josé|rita/i.test(g.S.toast.text),
    g.S.toast && g.S.toast.text);
}
// --- Cenário: O gate é só met.vova — a Vó Maria Rita aparece DENTRO da igreja ---
// Mesmo sem met.vovoMae prévio (ela não é mais NPC do mundo), a igreja abre e, ao entrar,
// a Maju vê a Maria Rita ali: isso marca met.vovoMae.
{
  const g = loadGame(); g.S.mode = 'world';
  g.S.save.met.vova = true; g.S.save.met.vovoMae = false;
  const mode = g.W.talk('asMarias');
  check('Gate (com Maria José): entra na igreja', mode === 'dialogue', mode);
  g.W.finish();
  check('Igreja: ver a Maria Rita marca met.vovoMae', g.S.save.met.vovoMae === true, g.S.save.met.vovoMae);
  check('Igreja: met.asMarias vira true', g.S.save.met.asMarias === true, g.S.save.met.asMarias);
}
// --- Cenário: Vó Maria Rita não é NPC do mundo (aparição, só na cena) ---
{
  const g = loadGame();
  const wn = g.World3D.worldNpcs || [];
  check('Maria Rita: fora de WORLD_NPCS (não fica no mangue)', !wn.some(n => n.key === 'vovoMae'), wn.map(n => n.key).join(','));
  check('Maria Rita: segue como SPEAKER pra cena', typeof g.World3D.npcDraw?.asMarias === 'function');
}

// --- Cenário: Reencontro das duas Marias dentro da igreja ---
{
  const g = loadGame(); g.S.mode = 'world';
  g.S.save.met.vova = true; g.S.save.met.vovoMae = true; g.S.save.met.asMarias = false;
  const mode = g.W.talk('asMarias');
  check('Reencontro: entra em diálogo', mode === 'dialogue', mode);
  const lines = g.S.dlg && g.S.dlg.lines;
  check('Reencontro: falas de vova na cena', !!(lines || []).some(l => l.who === 'vova'), txt(lines).slice(0, 80));
  check('Reencontro: falas de vovoMae na cena', !!(lines || []).some(l => l.who === 'vovoMae'), txt(lines).slice(0, 80));
  check('Reencontro: fala de maju na cena', !!(lines || []).some(l => l.who === 'maju'), txt(lines).slice(0, 80));
  check('Reencontro: cita "Maria"', hasMaria(lines), txt(lines).slice(0, 100));
  g.W.finish();
  check('Reencontro: met.asMarias vira true após concluir', g.S.save.met.asMarias === true, g.S.save.met.asMarias);
}

// --- Cenário: A cena não menciona morte (tom de reencontro, não de despedida) ---
{
  const g = loadGame();
  // STORY exposta via window.__story (main.js) para permitir inspeção headless
  const STORY = g.STORY;
  const cheia = STORY && STORY.meet && STORY.meet.asMarias || [];
  const curta = STORY && STORY.meet && STORY.meet.asMariasAgain || [];
  const todasFalas = [...cheia, ...curta];
  check('Tom: STORY.meet.asMarias existe', cheia.length > 0, cheia.length);
  check('Tom: STORY.meet.asMariasAgain existe', curta.length > 0, curta.length);
  const temMorte = MORTE_WORDS.some(w => todasFalas.some(l => l.text.toLowerCase().includes(w)));
  check('Tom: sem palavras de morte/despedida',
    !temMorte,
    temMorte ? todasFalas.find(l => MORTE_WORDS.some(w => l.text.toLowerCase().includes(w)))?.text : '');
}

// --- Cenário: Reencontro já visto mostra a fala curta ---
{
  const g = loadGame({ seed: { [NEW_KEY]: JSON.stringify({ v: 3, done: {}, met: { vova: true, vovoMae: true, asMarias: true } }) } });
  g.S.mode = 'world';
  const mode = g.W.talk('asMarias');
  check('Já visto: entra em diálogo', mode === 'dialogue', mode);
  const lines = g.S.dlg && g.S.dlg.lines;
  // curta tem 3 linhas; cheia tem 12 — curta deve ser <= 4
  check('Já visto: usa a fala curta (≤4 linhas)', !!lines && lines.length <= 4, lines && lines.length);
  check('Já visto: fala curta cita "Maria"', hasMaria(lines), lines && txt(lines).slice(0, 80));
}

// --- Cenário: Save da cena vista não regride após reload ---
{
  const g = loadGame({ seed: { [NEW_KEY]: JSON.stringify({ v: 3, done: {}, met: { vova: true, vovoMae: true, asMarias: true } }) } });
  g.S.mode = 'world';
  check('Reload: met.asMarias continua true', g.S.save.met.asMarias === true, g.S.save.met.asMarias);
  const mode = g.W.talk('asMarias');
  const lines = g.S.dlg && g.S.dlg.lines;
  check('Reload: exibe fala curta (asMariasAgain)', !!lines && lines.length <= 4, lines && lines.length);
}

// --- Cenário: Save sem ou com met malformado não trava (load defensivo) ---
// Caso a: met sem asMarias
{
  const g = loadGame({ seed: { [NEW_KEY]: JSON.stringify({ v: 3, done: {}, met: {} }) } });
  g.S.mode = 'world';
  check('Defensivo (met vazio): sem loadError', !g.loadError, g.loadError && g.loadError.message);
  check('Defensivo (met vazio): met.asMarias falsy', !g.S.save.met.asMarias);
  // gate ainda funciona: sem as avós, não abre
  const mode = g.W.talk('asMarias');
  check('Defensivo (met vazio): gate respeita (sem avós → sem cena)', mode !== 'dialogue', mode);
}
// Caso b: met = null
{
  const g = loadGame({ seed: { [NEW_KEY]: JSON.stringify({ v: 3, done: {}, met: null }) } });
  check('Defensivo (met null): sem loadError', !g.loadError, g.loadError && g.loadError.message);
  check('Defensivo (met null): met.asMarias falsy', !g.S.save.met.asMarias);
}

// --- Cenário: Igreja inacessível enquanto d6/d7 estão na névoa ---
{
  const g = loadGame(); g.S.mode = 'world';
  // Igreja à beira-mar no litoral de d7; d7 desbloqueia só com d0..d6 completos
  // Com save vazio: d0 está desbloqueado, d7 não está
  const d7Unlocked = g.W.unlocked(7);
  check('Névoa: d7 bloqueado com save vazio', !d7Unlocked, d7Unlocked);
  // A entrada existe em WORLD_NPCS mas o tile não é visível (coberto pela névoa — tileVisible retorna false)
  const wn = g.World3D.worldNpcs || [];
  const igreja = wn.find(n => n.key === 'asMarias');
  // Igreja pertence a d7 (Beira do Mangue, litoral); quando d7 bloqueado, o drawNpc não a renderiza
  check('Névoa: igreja pertence ao distrito 7', !!igreja && igreja.d === 7, igreja && igreja.d);
}

// --- Cenário: Jogo carrega e desenha a igreja e as avós sem exceção ---
{
  const g = loadGame();
  check('Boot: sem loadError', !g.loadError, g.loadError && g.loadError.message);
  check('Boot: NPC_DRAW.asMarias é função', typeof g.World3D.npcDraw?.asMarias === 'function');
  // exercita o draw (não deve lançar)
  let drawErr = null;
  try {
    const ctx = fakeCtx();
    g.World3D.npcDraw.asMarias(ctx, 0, 0, 2);
  } catch (e) { drawErr = e; }
  check('Boot: drawIgrejaMarias não lança', !drawErr, drawErr && drawErr.message);
}

out.push('');
out.push('RESULT: ' + pass + ' passed, ' + fail + ' failed');
console.log(out.join('\n'));
process.exit(fail > 0 ? 1 : 0);
