#!/usr/bin/env node
// Teste de regressão headless — spec 010-ceu-maria-rita.
// Desfecho no céu: a Vó Maria Rita vira ENCONTRO focal (porto do céu), só aparição
// + narração; Vovô Maro + Maju + Vó Maria Rita reunidos; desfecho GATED por met.vovoMae
// (igreja obrigatória — ADR-008). Carrega os scripts reais num contexto vm com stubs
// de browser e inspeciona STORY/estado via window.__story/__game/__world/__levels.
//   Rodar:  node tests/test-ceu-maria-rita.js
// Saída: PASS/FAIL por asserção + exit code (0 = todos verdes).
'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const FILES = ['audio.js', 'sprites.js', 'characters.js', 'story.js', 'levels.js', 'puzzles.js', 'world3d.js', 'main.js'];
const code = FILES.map(f => fs.readFileSync(path.join(ROOT, 'js', f), 'utf8')).join('\n;\n');

// Mapa cenário→teste (nomes idênticos aos Cenário: de spec.bdd.md — lido pelo coverage-gate):
//   Cenário: Completar as 31 conchas e falar com o Vovô Maro inicia o desfecho
//   Cenário: O desfecho narra o reencontro com a Vó Maria Rita, evocando o amor eterno
//   Cenário: O roteiro do desfecho reúne os três — Vovô Maro, Maju e a Vó Maria Rita
//   Cenário: A cena do céu é alcançada e o jogo volta ao Recife ao tocar
//   Cenário: A cena ceu renderiza sem exceção do início ao fim
//   Cenário: A narração do céu trata o momento como reencontro (continuidade com a igreja)
//   Cenário: A Vó Maria Rita não ganha novas falas no céu
//   Cenário: O desfecho só dispara com exatamente as 31 conchas (FF-DOM-2)
//   Cenário: Com as 31 conchas mas sem ter visitado a igreja, o desfecho não dispara (ADR-008)
//   Cenário: O desfecho não regride o progresso salvo
//   Cenário: Re-disparar o desfecho não entra em loop nem corrompe estado
//   Cenário: Falar com o Vovô Maro sem as 31 conchas não dispara o céu

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
  return { S: win.__game, W: win.__world, World3D: sandbox.World3D, STORY: win.__story, levels: win.__levels, store, loadError };
}

let pass = 0, fail = 0;
const out = [];
function check(name, cond, extra) {
  if (cond) { pass++; out.push('  PASS  ' + name); }
  else { fail++; out.push('  FAIL  ' + name + (extra !== undefined ? '  → ' + extra : '')); }
}
const txt = lines => (lines || []).map(l => l.text).join(' | ');
// prepara um save "pronto pro fim": 31 conchas + igreja visitada
function readyForEnding(g) {
  g.S.mode = 'world';
  g.W.completeAll();
  g.S.save.met.vovoMae = true;
  g.S.save.met.vova = true;
}

// --- Cenário: Completar as 31 conchas e falar com o Vovô Maro inicia o desfecho ---
{
  const g = loadGame();
  readyForEnding(g);
  const mode = g.W.talk('vovo');
  check('Desfecho: talk(vovo) com 31 + igreja entra em diálogo', mode === 'dialogue', mode);
  check('Desfecho: S.save.fin vira true', g.S.save.fin === true, g.S.save.fin);
  const lines = g.S.dlg && g.S.dlg.lines;
  check('Desfecho: o diálogo é o skyEnding', lines === g.STORY.skyEnding, !!lines);
}

// --- Cenário: O desfecho narra o reencontro com a Vó Maria Rita, evocando o amor eterno ---
{
  const g = loadGame();
  const blob = txt(g.STORY.skyEnding);
  const low = blob.toLowerCase();
  const nar = (g.STORY.skyEnding || []).filter(l => l.who === 'nar');
  check('Narração: skyEnding tem linhas de narração (nar)', nar.length > 0, nar.length);
  check('Narração: cita a Vó Maria Rita', /maria rita/i.test(blob), low.slice(0, 60));
  check('Narração: evoca o amor que não tem fim', /amor/.test(low) && /(não tem fim|não desaparece|pra sempre|eterno)/.test(low), low.slice(-80));
  // PT-BR: presença de caracteres acentuados típicos, sem palavras em inglês comuns
  check('Narração: texto em PT-BR (sem inglesismo óbvio)', !/\b(the|love|sky|forever)\b/i.test(blob), blob.slice(0, 40));
}

// --- Cenário: O roteiro do desfecho reúne os três — Vovô Maro, Maju e a Vó Maria Rita ---
{
  const g = loadGame();
  const blob = txt(g.STORY.skyEnding).toLowerCase();
  check('Três: cita o vovô Maro', /vov[oô]/.test(blob), blob.slice(0, 40));
  check('Três: cita a Maju (personagem fala)', (g.STORY.skyEnding || []).some(l => l.who === 'maju'), '');
  check('Três: cita a Vó Maria Rita', /maria rita/.test(blob), '');
  const f = g.W.ceuFocal && g.W.ceuFocal();
  check('Focal: ceuFocal() existe', !!f, JSON.stringify(f));
  check('Focal: Vó Maria Rita centralizada (x ~160..200)', !!f && f.x >= 160 && f.x <= 200, f && f.x);
  check('Focal: aponta a aparição da vovoMae', !!f && f.who === 'vovoMae', f && f.who);
}

// --- Cenário: A cena do céu é alcançada e o jogo volta ao Recife ao tocar ---
{
  const g = loadGame();
  readyForEnding(g);
  g.W.talk('vovo');
  g.W.finish();   // avança o skyEnding até o onEnd → S.mode = 'ceu'
  check('Céu: S.mode vira ceu após o diálogo', g.S.mode === 'ceu', g.S.mode);
  check('Céu: S.winT reinicia em 0', g.S.winT === 0, g.S.winT);
  g.S.winT = 12;
  g.W.tapAt(180, 300);
  check('Céu: tocar com winT>11 volta ao mundo', g.S.mode === 'world', g.S.mode);
}

// --- Cenário: A cena ceu renderiza sem exceção do início ao fim ---
{
  const g = loadGame();
  readyForEnding(g);
  g.W.talk('vovo'); g.W.finish();
  let err = null;
  try { for (const t of [0, 1.5, 3, 4.5, 6, 9, 12]) { g.S.winT = t; g.S.t = t; g.W.drawCeu(t); } }
  catch (e) { err = e; }
  check('Render: drawCeu não lança em t∈[0..12]', !err, err && err.message);
}

// --- Cenário: A narração do céu trata o momento como reencontro (continuidade com a igreja) ---
{
  const g = loadGame();
  const low = txt(g.STORY.skyEnding).toLowerCase();
  check('Continuidade: não afirma "primeira vez"', !/primeira vez/.test(low), low.slice(0, 60));
  check('Continuidade: referencia a igreja/igrejinha/Piedade ou reencontro',
    /(igrej|piedade|reencontr|promete|prometid|de novo|outra vez)/.test(low), low.slice(0, 80));
}

// --- Cenário: A Vó Maria Rita não ganha novas falas no céu ---
{
  const g = loadGame();
  const falas = (g.STORY.skyEnding || []).filter(l => l.who === 'vovoMae');
  check('Aparição: vovoMae não fala no skyEnding (só aparição + narração)', falas.length === 0, falas.length);
}

// --- Cenário: O desfecho só dispara com exatamente as 31 conchas (FF-DOM-2) ---
{
  const g = loadGame();
  g.S.mode = 'world';
  g.S.save.met.vovoMae = true; g.S.save.met.vova = true;
  // 30 conchas
  for (let gg = 1; gg <= 30; gg++) g.S.save.done[gg] = true;
  g.W.talk('vovo');
  check('FF-DOM-2: com 30 conchas o desfecho não dispara', g.S.save.fin !== true && g.S.mode !== 'ceu', g.S.save.fin);
  // 31ª
  const g2 = loadGame();
  g2.S.mode = 'world'; g2.S.save.met.vovoMae = true; g2.S.save.met.vova = true;
  g2.W.completeAll();
  g2.W.talk('vovo');
  check('FF-DOM-2: TOTAL_PHASES = 31', g2.levels && g2.levels.TOTAL_PHASES === 31, g2.levels && g2.levels.TOTAL_PHASES);
  check('FF-DOM-2: com 31 conchas o desfecho dispara', g2.S.save.fin === true, g2.S.save.fin);
}

// --- Cenário: Com as 31 conchas mas sem ter visitado a igreja, o desfecho não dispara (ADR-008) ---
{
  const g = loadGame();
  g.S.mode = 'world';
  g.W.completeAll();
  g.S.save.met.vovoMae = false;   // não entrou na igreja
  const mode = g.W.talk('vovo');
  check('Gate: sem met.vovoMae, fin NÃO vira true', g.S.save.fin !== true, g.S.save.fin);
  check('Gate: sem met.vovoMae, não entra na cena ceu', g.S.mode !== 'ceu', g.S.mode);
  check('Gate: Vovô Maro entra em diálogo de dica', mode === 'dialogue', mode);
  const blob = txt(g.S.dlg && g.S.dlg.lines).toLowerCase();
  check('Gate: a dica aponta a igreja das Marias', /(igrej|piedade)/.test(blob), blob.slice(0, 80));
}

// --- Cenário: O desfecho não regride o progresso salvo ---
{
  const g = loadGame();
  readyForEnding(g);
  const antes = Object.keys(g.S.save.done).length;
  g.W.talk('vovo');
  const depois = Object.keys(g.S.save.done).length;
  check('Save: 31 conchas preservadas após o desfecho', depois === antes && depois === 31, depois);
  check('Save: nenhuma concha apagada (sem regressão)', Object.values(g.S.save.done).every(v => v === true), '');
}

// --- Cenário: Re-disparar o desfecho não entra em loop nem corrompe estado ---
{
  const g = loadGame();
  readyForEnding(g);
  g.W.talk('vovo'); g.W.finish();      // 1º desfecho → ceu
  g.S.winT = 12; g.W.tapAt(180, 300);  // volta ao mundo
  g.W.talk('vovo');      // fala de novo
  g.W.finish();
  check('Re-disparo: 2ª vez conclui sem travar (volta a ceu)', g.S.mode === 'ceu', g.S.mode);
  check('Re-disparo: save íntegro (31 conchas + fin)', Object.keys(g.S.save.done).length === 31 && g.S.save.fin === true, '');
}

// --- Cenário: Falar com o Vovô Maro sem as 31 conchas não dispara o céu ---
{
  const g = loadGame();
  g.S.mode = 'world';
  g.S.save.met.vovoMae = true;   // igreja visitada, mas faltam conchas
  for (let gg = 1; gg <= 10; gg++) g.S.save.done[gg] = true;
  const mode = g.W.talk('vovo');
  check('Sem conchas: não vira ceu', g.S.mode !== 'ceu', g.S.mode);
  check('Sem conchas: fin permanece false', g.S.save.fin !== true, g.S.save.fin);
  check('Sem conchas: Vovô dá fala de progresso (diálogo)', mode === 'dialogue', mode);
}

// --- Cenário: Save já finalizado num build anterior não é regredido pelo gate (migração ADR-008) ---
{
  const SAVE_KEY = 'maresRecife:pernambuco-meu-pais';
  const done = {}; for (let gg = 1; gg <= 31; gg++) done[gg] = true;
  // save v3 antigo: terminou o jogo (fin=true) mas nunca entrou na igreja (sem met.vovoMae)
  const old = { v: 3, done, opened: true, fin: true, maju: null, met: { jona: true, mica: true }, briefed: true };
  const g = loadGame({ seed: { [SAVE_KEY]: JSON.stringify(old) } });
  check('Migração: fin=true preservado', g.S.save.fin === true, g.S.save.fin);
  check('Migração: met.vovoMae herdado de quem já terminou', g.S.save.met.vovoMae === true, g.S.save.met.vovoMae);
  g.S.mode = 'world';
  g.W.talk('vovo');
  check('Migração: jogador que já terminou revê o desfecho (não a dica)',
    g.S.dlg && g.S.dlg.lines === g.STORY.skyEnding, !!(g.S.dlg && g.S.dlg.lines));
}

// --- Regressão: jogo carrega sem exceção ---
{
  const g = loadGame();
  check('Regressão: jogo carrega sem loadError', !g.loadError, g.loadError && g.loadError.message);
}

out.push('');
out.push('RESULT: ' + pass + ' passed, ' + fail + ' failed');
console.log(out.join('\n'));
process.exit(fail > 0 ? 1 : 0);
