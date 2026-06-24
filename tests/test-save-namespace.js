#!/usr/bin/env node
// Teste de regressão headless do save namespace + card de legado — spec 002-save-namespace.
// Zero-dep: só builtins do node. Recarrega os scripts reais do jogo num contexto vm com
// stubs de browser, pré-semeando o localStorage por cenário (comportamento de INIT depende do
// estado salvo na carga). Dirige os toques do card via window.__tap nas coords dos botões.
//   Rodar:  node tests/test-save-namespace.js
// Saída: PASS/FAIL por cenário BDD + exit code (0 = todos verdes).
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const NEW_KEY = 'maresRecife:pernambuco-meu-pais';
const LEGACY_KEY = 'maresRecife';
const FILES = ['audio.js', 'sprites.js', 'characters.js', 'story.js', 'levels.js', 'puzzles.js', 'world3d.js', 'main.js'];
const code = FILES.map(f => fs.readFileSync(path.join(ROOT, 'js', f), 'utf8')).join('\n;\n');

// ---- stubs de browser (iguais ao harness do onboarding) ----
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

// Carrega o bundle do jogo com um localStorage pré-semeado. Opcionalmente bloqueia o storage
// (simula modo privado/quota) lançando no acesso. Retorna { S, W, store, reloaded, loadError }.
function loadGame({ seed = {}, blockStorage = false } = {}) {
  const store = new Map(Object.entries(seed));
  let reloaded = false;
  const win = {
    innerWidth: 360, innerHeight: 640, addEventListener() {},
    AudioContext: FakeAudioContext, webkitAudioContext: FakeAudioContext,
  };
  win.location = { reload() { reloaded = true; } };
  const localStorage = blockStorage
    ? new Proxy({}, { get() { throw new Error('blocked'); }, set() { throw new Error('blocked'); } })
    : {
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
  try {
    vm.runInContext(code, sandbox, { filename: 'game-bundle.js' });
  } catch (e) { loadError = e; }
  return { S: win.__game, W: win.__world, store, get reloaded() { return reloaded; }, loadError };
}

// Mapa cenário→teste (nomes idênticos aos Cenário: de spec.bdd.md — lido pelo coverage-gate):
//   Cenário: Origem limpa começa em 0/31 sem card
//   Cenário: Legado presente exibe o card de decisão
//   Cenário: Continuar restaura o progresso na chave namespeada
//   Cenário: Zero descarta o legado e não pergunta de novo
//   Cenário: Persiste progresso novo na chave namespeada
//   Cenário: reset limpa save namespeado e legado
//   Cenário: Legado corrompido ou vazio é tratado como origem limpa
//   Cenário: localStorage bloqueado não quebra o carregamento
let pass = 0, fail = 0;
const out = [];
function check(name, cond, extra) {
  if (cond) { pass++; out.push('  PASS  ' + name); }
  else { fail++; out.push('  FAIL  ' + name + (extra ? '  → ' + extra : '')); }
}
const sv11 = JSON.stringify({ v: 3, done: { 1:1,2:1,3:1,4:1,5:1,6:1,7:1,8:1,9:1,10:1,11:1 } });

// --- Cenário: Primeira sessão numa origem limpa começa em 0/31 ---
{
  const g = loadGame({ seed: {} });
  check('Origem limpa: sem loadError', !g.loadError, g.loadError && g.loadError.message);
  check('Origem limpa: mode=title (sem card)', g.S.mode === 'title', g.S.mode);
  check('Origem limpa: 0 conchas', Object.keys(g.S.save.done).length === 0);
}

// --- Cenário: Save legado presente exibe o card de decisão ---
{
  const g = loadGame({ seed: { [LEGACY_KEY]: sv11 } });
  check('Legado presente: mode=legacy', g.S.mode === 'legacy', g.S.mode);
  check('Legado presente: nada adotado ainda (chave nova ausente)', !g.store.has(NEW_KEY));
  check('Legado presente: legado intacto', g.store.get(LEGACY_KEY) === sv11);
  check('Legado presente: card sabe a contagem (11)', g.S.legacy && g.S.legacy.count === 11, g.S.legacy && g.S.legacy.count);
}

// --- Cenário: "Continuar de onde parei" restaura o progresso ---
{
  const g = loadGame({ seed: { [LEGACY_KEY]: sv11 } });
  const B = g.W.legacyBtns();   // { cont:{x,y,w,h}, fresh:{x,y,w,h} }
  g.W.tapAt(B.cont.x + 4, B.cont.y + 4);   // toca "Continuar"
  check('Continuar: 11 conchas no save', Object.keys(g.S.save.done).length === 11, Object.keys(g.S.save.done).length);
  check('Continuar: grava na chave namespeada', g.store.has(NEW_KEY) && JSON.parse(g.store.get(NEW_KEY)).done && Object.keys(JSON.parse(g.store.get(NEW_KEY)).done).length === 11);
  check('Continuar: vai para o título', g.S.mode === 'title', g.S.mode);
  // recarregar não reexibe o card (agora há save namespeado)
  const g2 = loadGame({ seed: { [LEGACY_KEY]: sv11, [NEW_KEY]: g.store.get(NEW_KEY) } });
  check('Continuar: reload não reexibe card', g2.S.mode === 'title', g2.S.mode);
}

// --- Cenário: "Começar do zero" descarta o legado ---
{
  const g = loadGame({ seed: { [LEGACY_KEY]: sv11 } });
  const B = g.W.legacyBtns();
  g.W.tapAt(B.fresh.x + 4, B.fresh.y + 4);   // toca "Começar do zero"
  check('Zero: legado removido', !g.store.has(LEGACY_KEY));
  check('Zero: 0 conchas', Object.keys(g.S.save.done).length === 0);
  check('Zero: save namespeado gravado', g.store.has(NEW_KEY));
  check('Zero: vai para o título', g.S.mode === 'title', g.S.mode);
  const g2 = loadGame({ seed: { [NEW_KEY]: g.store.get(NEW_KEY) } });
  check('Zero: reload não reexibe card', g2.S.mode === 'title', g2.S.mode);
}

// --- Cenário: Progresso novo persiste na chave namespeada ---
{
  const g = loadGame({ seed: {} });
  g.W.completeDistrict(0);   // marca g=1..4 e salva
  check('Persiste: 4 conchas (distrito 0)', Object.keys(g.S.save.done).length === 4, Object.keys(g.S.save.done).length);
  check('Persiste: gravado só na chave namespeada', g.store.has(NEW_KEY) && !g.store.has(LEGACY_KEY));
}

// --- Cenário: reset() limpa save namespeado E legado ---
{
  const g = loadGame({ seed: { [LEGACY_KEY]: '{"v":3,"done":{"1":1}}' } });
  // estamos em mode=legacy; força um save namespeado e então reseta
  g.W.completeDistrict(0);
  check('reset prep: ambas as chaves existem', g.store.has(NEW_KEY) && g.store.has(LEGACY_KEY));
  g.W.reset();
  check('reset: chave namespeada removida', !g.store.has(NEW_KEY));
  check('reset: chave legada removida', !g.store.has(LEGACY_KEY));
}

// --- Edge: legado ilegível ou vazio é tratado como origem limpa ---
{
  const corrupt = loadGame({ seed: { [LEGACY_KEY]: '{{CORROMPIDO}}' } });
  check('Legado corrompido: mode=title (sem card)', corrupt.S.mode === 'title', corrupt.S.mode);
  check('Legado corrompido: sem loadError', !corrupt.loadError, corrupt.loadError && corrupt.loadError.message);
  const empty = loadGame({ seed: { [LEGACY_KEY]: '{"v":3,"done":{}}' } });
  check('Legado vazio (0 conchas): mode=title', empty.S.mode === 'title', empty.S.mode);
}

// --- Regressão (code-review): fallback de load() não compartilha referência mutável ---
{
  // dois carregamentos com storage bloqueado caem no emptySave(); mutar um não vaza no outro
  const a = loadGame({ blockStorage: true });
  a.S.save.done[7] = true;
  const b = loadGame({ blockStorage: true });
  check('Fallback: saves independentes (sem referência compartilhada)', Object.keys(b.S.save.done).length === 0, Object.keys(b.S.save.done).length);
}

// --- Edge: localStorage indisponível não quebra o carregamento ---
{
  const g = loadGame({ blockStorage: true });
  check('localStorage bloqueado: sem loadError', !g.loadError, g.loadError && g.loadError.message);
  check('localStorage bloqueado: mode=title', g.S.mode === 'title', g.S.mode);
  check('localStorage bloqueado: 0 conchas (default defensivo)', Object.keys(g.S.save.done).length === 0);
}

out.push('');
out.push('RESULT: ' + pass + ' passed, ' + fail + ' failed');
console.log(out.join('\n'));
process.exit(fail > 0 ? 1 : 0);
