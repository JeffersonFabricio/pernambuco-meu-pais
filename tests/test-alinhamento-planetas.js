#!/usr/bin/env node
// Teste de regressão headless da spec 005-alinhamento-planetas.
// Carrega os scripts reais num contexto vm com stubs de browser.
//   Rodar:  node tests/test-alinhamento-planetas.js
// Saída: PASS/FAIL por asserção + exit code (0 = todos verdes).
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const NEW_KEY = 'maresRecife:pernambuco-meu-pais';
// Ordem: audio, sprites, characters, story, levels, puzzles, world3d, main
const FILES = ['audio.js', 'sprites.js', 'characters.js', 'story.js', 'levels.js', 'puzzles.js', 'world3d.js', 'main.js'];
const code = FILES.map(f => fs.readFileSync(path.join(ROOT, 'js', f), 'utf8')).join('\n;\n');

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
  // Acessos via window.__ (hooks de teste) e via sandbox (funções declaradas com function)
  const PUZZLES   = win.__puzzles;
  const LEVELS    = win.__levels;
  const drawRosa  = sandbox.drawRosaDosVentos;
  const HINTS     = sandbox.PUZZLE_HINTS;  // const — não vai no sandbox
  // PUZZLE_HINTS é const, usa o hook do levels ou acessa via comportamento
  return {
    S: win.__game, W: win.__world, tap: win.__tap, openLevel: win.__openLevel,
    PUZZLES, drawRosaDosVentos: drawRosa,
    TOTAL_PHASES: LEVELS && LEVELS.TOTAL_PHASES,
    DISTRICT_SIZES: LEVELS && LEVELS.DISTRICT_SIZES,
    getLevel: LEVELS && LEVELS.getLevel,
    PUZZLE_HINTS: win.__puzzleHints,  // precisamos expor de outro lado
    store, loadError, sandbox,
  };
}

// Mapa cenário→teste (nomes idênticos aos Cenário: de spec.bdd.md — lido pelo coverage-gate):
//   Cenário: O helper de desenho do disco está exposto em runtime
//   Cenário: O piso do Marco Zero é o grande disco circular da rosa dos ventos
//   Cenário: OrbitPuzzle registrado e com a interface esperada
//   Cenário: O tabuleiro do puzzle é o mesmo disco da cena
//   Cenário: A fase nunca abre já resolvida e é sempre solúvel
//   Cenário: Tocar um anel gira só aquele anel um passo
//   Cenário: Tocar fora de qualquer anel não faz nada
//   Cenário: Alinhar todos os planetas no Norte resolve a fase
//   Cenário: Toques após resolver não desalinham (puzzle travado quando solved)
//   Cenário: A troca de engine não muda a contagem de conchas
//   Cenário: Progresso não regride após reload
//   Cenário: Save sem ou com done malformado não trava (load defensivo)
//   Cenário: Reload com o puzzle não resolvido recomeça do zero
//   Cenário: Jogo carrega e desenha cena + puzzle sem exceção
let pass = 0, fail = 0;
const out = [];
function check(name, cond, extra) {
  if (cond) { pass++; out.push('  PASS  ' + name); }
  else { fail++; out.push('  FAIL  ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}

// --- Cenário: O helper de desenho do disco está exposto em runtime ---
{
  const g = loadGame();
  check('Helper: drawRosaDosVentos é função', typeof g.drawRosaDosVentos === 'function', typeof g.drawRosaDosVentos);
  // Garantir que o helper não lança com um ctx stub
  let helperErr = null;
  try { g.drawRosaDosVentos && g.drawRosaDosVentos(fakeCtx(), 180, 330, 100); }
  catch (e) { helperErr = e; }
  check('Helper: drawRosaDosVentos não lança com ctx stub', !helperErr, helperErr && helperErr.message);
}

// --- Cenário: O piso do Marco Zero é o grande disco circular da rosa dos ventos ---
{
  const g = loadGame();
  check('Cena Marco Zero: sprites carregaram sem erro', !g.loadError, g.loadError && g.loadError.message);
  // Verifica no source que SCENES[1].s chama drawRosaDosVentos com raio ≥ 120
  const spritesCode = fs.readFileSync(path.join(ROOT, 'js', 'sprites.js'), 'utf8');
  check('Cena Marco Zero: chama drawRosaDosVentos na cena 1', /drawRosaDosVentos\(ctx/.test(spritesCode));
  // Extrai o raio usado em SCENES[1] (busca na seção SCENES)
  const scenesIdx = spritesCode.indexOf("1: {");
  const scenesSlice = scenesIdx > -1 ? spritesCode.slice(scenesIdx, scenesIdx + 800) : '';
  const m = scenesSlice.match(/drawRosaDosVentos\(ctx,\s*\d+,\s*\d+,\s*(\d+)\)/);
  const raio = m ? parseInt(m[1], 10) : 0;
  check('Cena Marco Zero: raio do disco ≥ 120px', raio >= 120, `raio=${raio}`);
}

// --- Cenário: OrbitPuzzle registrado e com a interface esperada ---
{
  const g = loadGame();
  check('OrbitPuzzle: PUZZLES[11] definido', !!g.PUZZLES && !!g.PUZZLES[11], typeof (g.PUZZLES && g.PUZZLES[11]));
  let puzzle = null, puzzleErr = null;
  try { puzzle = new g.PUZZLES[11]({ rings: 3 }); } catch (e) { puzzleErr = e; }
  check('OrbitPuzzle: new PUZZLES[11]({rings:3}) não lança', !puzzleErr, puzzleErr && puzzleErr.message);
  check('OrbitPuzzle: expõe método tap', puzzle && typeof puzzle.tap === 'function');
  check('OrbitPuzzle: expõe método update', puzzle && typeof puzzle.update === 'function');
  check('OrbitPuzzle: expõe método draw', puzzle && typeof puzzle.draw === 'function');
  check('OrbitPuzzle: expõe flag solved', puzzle && typeof puzzle.solved === 'boolean', puzzle && typeof puzzle.solved);
  // PUZZLE_HINTS[11] — verifica no source pois é const (não exposta via window)
  const storyCode = fs.readFileSync(path.join(ROOT, 'js', 'story.js'), 'utf8');
  const hasHint11 = /11:\s*'[^']{10,}'/.test(storyCode) || /11:\s*"[^"]{10,}"/.test(storyCode);
  check('OrbitPuzzle: PUZZLE_HINTS[11] existe no story.js', hasHint11);
  const hintMatch = storyCode.match(/11:\s*'([^']+)'/) || storyCode.match(/11:\s*"([^"]+)"/);
  const hint = hintMatch ? hintMatch[1] : '';
  check('OrbitPuzzle: hint descreve girar e Norte', /gir/i.test(hint) && /norte/i.test(hint), hint.slice(0, 80));
}

// --- Cenário: O tabuleiro do puzzle é o mesmo disco da cena ---
{
  const g = loadGame();
  const puzzle = g.PUZZLES && new g.PUZZLES[11]({ rings: 3 });
  check('Tabuleiro: cfg.rings === 3 para tier 0', !!puzzle && puzzle.rings.length === 3, puzzle && puzzle.rings.length);
  check('Tabuleiro: cx exposto', !!puzzle && typeof puzzle.cx === 'number', typeof (puzzle && puzzle.cx));
  check('Tabuleiro: cy exposto', !!puzzle && typeof puzzle.cy === 'number', typeof (puzzle && puzzle.cy));
  check('Tabuleiro: rings[0].r exposto', !!puzzle && puzzle.rings[0] && typeof puzzle.rings[0].r === 'number', puzzle && puzzle.rings[0] && puzzle.rings[0].r);
  check('Tabuleiro: topPointOf(0) retorna {x,y}', !!puzzle && typeof puzzle.topPointOf === 'function' && typeof puzzle.topPointOf(0).x === 'number' && typeof puzzle.topPointOf(0).y === 'number');
  // g=3 → engine 11
  const lvl3 = g.getLevel && g.getLevel(3);
  check('Tabuleiro: getLevel(3).engine === 11', !!lvl3 && lvl3.engine === 11, lvl3 && lvl3.engine);
  check('Tabuleiro: getLevel(3) tier 0 → cfg.rings === 3', !!lvl3 && lvl3.cfg && lvl3.cfg.rings === 3, lvl3 && lvl3.cfg && lvl3.cfg.rings);
}

// --- Cenário: A fase nunca abre já resolvida e é sempre solúvel ---
{
  let algumaJaResolvida = false, algumaNorte = false, algumaInvalida = false;
  for (let trial = 0; trial < 20; trial++) {
    const g = loadGame();
    const p = g.PUZZLES && new g.PUZZLES[11]({ rings: 3 });
    if (!p) { algumaInvalida = true; break; }
    if (p.solved) algumaJaResolvida = true;
    for (const r of p.rings) {
      if (r.pos === 0) algumaNorte = true;
      if (r.pos < 0 || r.pos > 7) algumaInvalida = true;
    }
  }
  check('Fase: nenhuma instância abre já resolvida (20 trials)', !algumaJaResolvida);
  check('Fase: nenhum anel começa no Norte (pos=0) (20 trials)', !algumaNorte);
  check('Fase: pos ∈ [1,7] em todos os anéis (20 trials)', !algumaInvalida);
  // Ciclo: 7→0 em 1 toque
  const g = loadGame();
  const p = g.PUZZLES && new g.PUZZLES[11]({ rings: 3 });
  if (p) {
    p.rings[0].pos = 7;
    const tp = p.topPointOf(0);
    p.tap(tp.x, tp.y);
    check('Fase: (pos+1)%8 fecha o ciclo (7→0)', p.rings[0].pos === 0, p.rings[0].pos);
  }
}

// --- Cenário: Tocar um anel gira só aquele anel um passo ---
{
  const g = loadGame();
  const p = g.PUZZLES && new g.PUZZLES[11]({ rings: 3 });
  if (p) {
    p.rings.forEach(r => { r.pos = 3; });
    const pos0 = p.rings[0].pos;
    const tp = p.topPointOf(0);
    p.tap(tp.x, tp.y);
    check('Tap anel: anel 0 avança 1 passo', p.rings[0].pos === (pos0 + 1) % 8, `${pos0} → ${p.rings[0].pos}`);
    check('Tap anel: anel 1 não muda', p.rings[1].pos === 3, p.rings[1].pos);
    check('Tap anel: anel 2 não muda', p.rings[2].pos === 3, p.rings[2].pos);
  }
}

// --- Cenário: Tocar fora de qualquer anel não faz nada ---
{
  const g = loadGame();
  const p = g.PUZZLES && new g.PUZZLES[11]({ rings: 3 });
  if (p) {
    const antes = p.rings.map(r => r.pos).join(',');
    let tapErr = null;
    try {
      p.tap(p.cx, p.cy);         // centro (dentro do núcleo)
      p.tap(p.cx + 300, p.cy + 300); // bem fora
    } catch (e) { tapErr = e; }
    const depois = p.rings.map(r => r.pos).join(',');
    check('Tap fora: não lança erro', !tapErr, tapErr && tapErr.message);
    check('Tap fora: nenhum anel girou', antes === depois, `${antes} → ${depois}`);
  }
}

// --- Cenário: Alinhar todos os planetas no Norte resolve a fase ---
{
  const g = loadGame();
  const p = g.PUZZLES && new g.PUZZLES[11]({ rings: 3 });
  if (p) {
    // Força pos=1 em todos; 7 toques por anel levam a 0
    p.rings.forEach(r => { r.pos = 1; });
    for (let i = 0; i < p.rings.length; i++) {
      check(`Alinhamento: solved false antes de alinhar anel ${i}`, !p.solved);
      const tp = p.topPointOf(i);
      // pos=1 → 7 toques = 2,3,4,5,6,7,0
      for (let t2 = 0; t2 < 7; t2++) p.tap(tp.x, tp.y);
    }
    check('Alinhamento: solved true após alinhar todos', p.solved === true, p.solved);
    check('Alinhamento: todos os pos === 0', p.rings.every(r => r.pos === 0), p.rings.map(r => r.pos).join(','));
  }
}

// --- Cenário: Toques após resolver não desalinham (puzzle travado quando solved) ---
{
  const g = loadGame();
  const p = g.PUZZLES && new g.PUZZLES[11]({ rings: 3 });
  if (p) {
    p.rings.forEach(r => { r.pos = 0; });
    p.solved = true;
    const tp = p.topPointOf(0);
    p.tap(tp.x, tp.y);
    check('Travado: anel não gira após solved', p.rings[0].pos === 0, p.rings[0].pos);
    check('Travado: solved permanece true', p.solved === true, p.solved);
  }
}

// --- Cenário: A troca de engine não muda a contagem de conchas ---
{
  const g = loadGame();
  check('Invariantes: TOTAL_PHASES === 31', g.TOTAL_PHASES === 31, g.TOTAL_PHASES);
  check('Invariantes: DISTRICT_SIZES == [4,4,4,4,3,3,3,3,3]',
    g.DISTRICT_SIZES && g.DISTRICT_SIZES.join(',') === '4,4,4,4,3,3,3,3,3',
    g.DISTRICT_SIZES && g.DISTRICT_SIZES.join(','));
  const lvl3 = g.getLevel && g.getLevel(3);
  check('Invariantes: g=3 usa engine 11', !!lvl3 && lvl3.engine === 11, lvl3 && lvl3.engine);
  check('Invariantes: PUZZLES[9] ainda existe (engine 9 não removido)', !!g.PUZZLES && !!g.PUZZLES[9]);
}

// --- Cenário: Progresso não regride após reload ---
{
  const saveComDone3 = JSON.stringify({ v: 3, done: { '3': true }, met: {}, briefed: true });
  const g = loadGame({ seed: { [NEW_KEY]: saveComDone3 } });
  check('Progresso: done[3] true após reload', g.S && g.S.save.done['3'] === true, g.S && g.S.save.done['3']);
  check('Progresso: sem loadError', !g.loadError, g.loadError && g.loadError.message);
}

// --- Cenário: Save sem ou com done malformado não trava (load defensivo) ---
{
  const g1 = loadGame({ seed: { [NEW_KEY]: JSON.stringify({ v: 3, met: {} }) } });
  check('Defensivo: done ausente → sem loadError', !g1.loadError, g1.loadError && g1.loadError.message);
  const g2 = loadGame({ seed: { [NEW_KEY]: JSON.stringify({ v: 3, done: null, met: {} }) } });
  check('Defensivo: done null → sem loadError', !g2.loadError, g2.loadError && g2.loadError.message);
  const lvl3b = g2.getLevel && g2.getLevel(3);
  const p2 = g2.PUZZLES && lvl3b && new g2.PUZZLES[11](lvl3b.cfg);
  check('Defensivo: puzzle g=3 cria normalmente', !!p2 && p2.solved === false, p2 && p2.solved);
}

// --- Cenário: Reload com o puzzle não resolvido recomeça do zero ---
{
  const g = loadGame();
  const p1 = g.PUZZLES && new g.PUZZLES[11]({ rings: 3 });
  const p2 = g.PUZZLES && new g.PUZZLES[11]({ rings: 3 });
  check('Reload: nova instância começa com solved false', !!p2 && p2.solved === false, p2 && p2.solved);
  check('Reload: nova instância tem pos ∈ [1,7]', !!p2 && p2.rings.every(r => r.pos >= 1 && r.pos <= 7), p2 && p2.rings.map(r => r.pos).join(','));
}

// --- Cenário: Jogo carrega e desenha cena + puzzle sem exceção ---
{
  const g = loadGame();
  check('Boot: sem loadError', !g.loadError, g.loadError && g.loadError.message);
  let drawErr = null;
  try {
    const p = g.PUZZLES && new g.PUZZLES[11]({ rings: 3 });
    if (p) p.draw(fakeCtx(), 0);
  } catch (e) { drawErr = e; }
  check('Boot: OrbitPuzzle.draw não lança', !drawErr, drawErr && drawErr.message);
}

out.push('');
out.push('RESULT: ' + pass + ' passed, ' + fail + ' failed');
console.log(out.join('\n'));
process.exit(fail > 0 ? 1 : 0);
