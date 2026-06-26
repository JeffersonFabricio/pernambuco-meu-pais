// ============================================================
// Marés do Recife — núcleo do jogo (MUNDO LIVRE / open world)
// Maju explora um Recife que se abre conforme avança: completa as 9
// contas de um bairro e a ponte pro próximo se libera. Pelo caminho
// reencontra a família (Jonatha, Micaele, titio Jeff, vovó) e, no fim,
// o Vovô a leva pelo céu do Recife.
// ============================================================
(() => {
  const cv = document.getElementById('game');
  const ctx = cv.getContext('2d');
  const W = 360, H = 640;

  // ---------- escala para a tela do celular ----------
  function fit() {
    const s = Math.min(window.innerWidth / W, window.innerHeight / H);
    cv.style.width = `${Math.floor(W * s)}px`;
    cv.style.height = `${Math.floor(H * s)}px`;
  }
  window.addEventListener('resize', fit);
  fit();

  // ============================================================
  //  MAPA DO MUNDO — 9 distritos numa grade 3x3 em "cobra",
  //  cada um com 9 contas. Gutters de 12px viram rios; pontes
  //  ligam distritos vizinhos. Bairros se liberam em ordem.
  // ============================================================
  const WX = { cols: 3, rows: 3, cw: 420, ch: 620, gut: 12 };

  function districtCell(d) {
    const row = Math.floor(d / 3);
    const col = (row % 2 === 0) ? (d % 3) : (2 - (d % 3));
    return { col, row, x: col * WX.cw, y: row * WX.ch };
  }
  function districtCenter(d) {
    const c = districtCell(d);
    return { x: c.x + WX.cw / 2, y: c.y + WX.ch / 2 };
  }
  const ZONE = [
    { g: '#d8c8a8', g2: '#c2b088', name: 'Recife Antigo' },   // 1 Sol
    { g: '#e6d29a', g2: '#d2b87c', name: 'Boa Viagem' },      // 2 Mar
    { g: '#7a8a94', g2: '#697a84', name: 'Recife na Chuva' }, // 3 Chuva
    { g: '#4f5a3a', g2: '#3e4a2c', name: 'Manguezal' },       // 4 Lama
    { g: '#b89060', g2: '#a07a4a', name: 'Mercado S. José' }, // 5 Memória
    { g: '#2c2740', g2: '#221d33', name: 'Pátio do Terço' },  // 6 Tambor
    { g: '#e0cf9c', g2: '#cbb486', name: 'Rua da Moeda' },    // 7 Passo
    { g: '#3f4a3a', g2: '#33402f', name: 'Beira do Mangue' }, // 8 Antena
    { g: '#7a5a6a', g2: '#634455', name: 'Cais — Maré 81' },  // 9 Poente
  ];

  // malha de ruas de cada bairro: grade 3x3 de cruzamentos (onde ficam as contas)
  const COLDX = 120, ROWDY = 150;
  function gridCols(d) { const c = districtCenter(d); return [c.x - COLDX, c.x, c.x + COLDX]; }
  function gridRows(d) { const c = districtCenter(d); return [c.y - ROWDY, c.y, c.y + ROWDY]; }

  // contas-spot: cada fase fica num cruzamento (pracinha) da malha de ruas
  // posições espalhadas no grid 3×3 para 3 ou 4 fases por bairro
  const SPOT_GRID = {
    3: [[1,0],[0,2],[2,2]],
    4: [[0,0],[2,0],[0,2],[2,1]],
  };
  const SPOTS = [];
  function buildSpots() {
    for (let d = 0; d < 9; d++) {
      const n = DISTRICT_SIZES[d];
      const layout = SPOT_GRID[n] || SPOT_GRID[3];
      const cols = gridCols(d), rows = gridRows(d);
      for (let k = 0; k < n; k++) {
        const g = DISTRICT_STARTS[d] + k;
        const [sc, sr] = layout[k];
        const L = getLevel(g);
        SPOTS.push({
          g, d, k, x: cols[sc], y: rows[sr],
          title: L.title, color: CHAPTERS[d].color,
          anchor: !!CHAPTERS[d].fases[k].anchor,
        });
      }
    }
  }

  // personagens-guia da família — derivados do registro único (ADR-005, js/characters.js).
  // x/y vêm do districtCenter logo abaixo (campo por-mundo, não pertence ao registro).
  const NPCS = Characters.npcs();
  NPCS.forEach(n => { const c = districtCenter(n.d); n.x = c.x + n.dx; n.y = c.y + n.dy; });

  // quem fala nos diálogos (retrato + nome + cor) — derivado do registro único (ADR-005)
  const SPEAKERS = Characters.speakers();

  // ---------- save (v3: done = fases concluídas; met = quem já conheci) ----------
  // Chave namespeada por deploy: GitHub Pages de usuário compartilha UMA origem
  // (jeffersonfabricio.github.io) entre todos os repos; localStorage particiona por origem,
  // não por caminho. A chave genérica antiga colidia com saves de outros builds/projetos.
  const SAVE_KEY = 'maresRecife:pernambuco-meu-pais';
  const LEGACY_SAVE_KEY = 'maresRecife';
  // Fábrica (não constante): cada chamada retorna objetos `done`/`met` próprios, para que o
  // fallback de load() nunca compartilhe referência mutável entre saves.
  function emptySave() { return { v: 3, done: {}, opened: false, fin: false, maju: null, met: {}, briefed: false }; }

  // Parseia um save cru (string do localStorage) aplicando a migração v2→v3.
  // Defensivo: JSON inválido / ausente → save vazio. Reusado por load() e pela adoção do legado.
  function parseSave(raw) {
    try {
      const s = JSON.parse(raw) || {};
      if (s.v === 3) {
        // briefed: missão já explicada → libera a seta dourada.
        // Migração: quem já conheceu os dois pais (tutorial antigo) ou já tem progresso.
        const briefed = !!s.briefed
          || !!(s.met && s.met.jona && s.met.mica)
          || Object.keys(s.done || {}).length > 0;
        // Migração: os primos viraram dois NPCs (ravi + nicolas). Quem já tinha conhecido
        // "OS PRIMOS" (met.primos) não revê as introduções — herda os dois como conhecidos.
        const met = (s.met && typeof s.met === 'object') ? s.met : {};
        if (met.primos) { met.ravi = true; met.nicolas = true; }
        // Migração feat/010: quem já viu o desfecho (fin=true) num build anterior mantém o fim
        // destravado — o gate met.vovoMae (ADR-008) não pode regredir quem já terminou.
        if (s.fin) met.vovoMae = true;
        return { v: 3, done: s.done || {}, opened: !!s.opened, fin: !!s.fin, maju: s.maju || null, met, briefed };
      }
      const prog = s.v === 2 ? Math.min(TOTAL_PHASES, s.prog || 0) : 0;
      const done = {};
      for (let i = 1; i <= Math.min(prog, TOTAL_PHASES); i++) done[i] = true;
      const finV2 = prog >= TOTAL_PHASES;
      return { v: 3, done, opened: !!s.opened, fin: finV2, maju: null, met: finV2 ? { vovoMae: true } : {}, briefed: !!s.opened };
    } catch { return emptySave(); }
  }
  function load() {
    try { return parseSave(localStorage.getItem(SAVE_KEY)); }
    catch { return emptySave(); }
  }
  function hasNamespacedSave() { try { return localStorage.getItem(SAVE_KEY) != null; } catch { return false; } }
  // Save legado da origem (chave antiga). Pode ser de um build deste jogo OU de outro projeto
  // na mesma origem github.io — por isso nunca é adotado sem o jogador confirmar (card de legado).
  function readLegacy() {
    try {
      const raw = localStorage.getItem(LEGACY_SAVE_KEY);
      if (raw == null) return null;
      const parsed = parseSave(raw);
      return { save: parsed, count: Object.keys(parsed.done).length };
    } catch { return null; }
  }
  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S.save)); } catch {} }
  function isDone(g) { return !!S.save.done[g]; }
  function doneCount() { return Object.keys(S.save.done).length; }
  function districtDone(d) {
    for (let k = 0; k < DISTRICT_SIZES[d]; k++) if (!isDone(DISTRICT_STARTS[d] + k)) return false;
    return true;
  }
  function districtUnlocked(d) { return d === 0 || districtDone(d - 1); }

  // próxima conta não feita num distrito (sequencial)
  function nextSpotInDistrict(d) {
    for (let k = 0; k < DISTRICT_SIZES[d]; k++) {
      const g = DISTRICT_STARTS[d] + k;
      if (!isDone(g)) return SPOTS.find(s => s.g === g) || null;
    }
    return null;
  }
  // spot "ativo" = é o próximo a ser feito no seu distrito
  function spotIsActive(sp) {
    const ns = nextSpotInDistrict(sp.d);
    return !!(ns && ns.g === sp.g);
  }
  // próxima conta não feita em qualquer distrito desbloqueado
  function nextUndoneAnywhere() {
    for (let d = 0; d < 9; d++) {
      if (!districtUnlocked(d)) continue;
      const ns = nextSpotInDistrict(d);
      if (ns) return ns;
    }
    return null;
  }

  // ---------- estado ----------
  const S = {
    mode: 'title',   // legacy | title | dialogue | world | puzzle | bead | ceu
    save: load(),
    legacy: null,    // { save, count } quando há legado a recuperar (card de decisão)
    level: 1,
    cur: null,
    puzzle: null,
    dlg: null,
    sceneN: 10,
    winT: 0,
    t: 0,
    fadeT: 0.4,
    _lastMode: null,
    maju: { x: 0, y: 0, face: 'D', moving: false, phase: 0 },
    near: null,       // conta-spot mais próxima
    nearNpc: null,    // personagem mais próximo
    helpT: 7,
    toast: null,      // { text, t }
  };
  const TRANS = 0.34;

  // posiciona a Maju a partir do save (posição salva ou início do distrito 0)
  function placeMaju() {
    const c = districtCenter(0);
    const sv = S.save.maju;
    S.maju.x = sv ? sv.x : c.x;
    S.maju.y = sv ? sv.y : c.y + 70;
  }

  buildSpots();
  placeMaju();

  // Recuperação de legado: sem save namespeado mas há um save antigo com progresso na origem
  // → pergunta ao jogador (card) em vez de adotar silenciosamente (evita o "save fantasma").
  if (!hasNamespacedSave()) {
    const legacy = readLegacy();
    if (legacy && legacy.count > 0) { S.legacy = legacy; S.mode = 'legacy'; }
  }

  // ---------- texto ----------
  function wrap(text, maxW, size) {
    ctx.font = `bold ${size}px "Courier New", monospace`;
    const words = text.split(' ');
    const lines = [];
    let cur = '';
    for (const w of words) {
      const tryS = cur ? cur + ' ' + w : w;
      if (ctx.measureText(tryS).width > maxW && cur) { lines.push(cur); cur = w; }
      else cur = tryS;
    }
    if (cur) lines.push(cur);
    return lines;
  }

  // ---------- diálogo ----------
  function firstSpeaker(lines) {
    if (!Array.isArray(lines)) return null;
    const l = lines.find(x => x.who !== 'maju' && x.who !== 'nar');
    return l ? l.who : null;   // null = cena só com Maju (sonho/recomendação)
  }
  function startDialogue(lines, sceneN, after) {
    // diálogo ausente/inválido (dado faltando ou cache desatualizado): não trava — segue o fluxo
    if (!Array.isArray(lines) || lines.length === 0) { if (typeof after === 'function') after(); return; }
    S.mode = 'dialogue';
    S.sceneN = sceneN;
    S.dlg = { lines, i: 0, chars: 0, after, right: firstSpeaker(lines) };
  }
  function dlgTap() {
    const d = S.dlg;
    const full = d.lines[d.i].text.length;
    if (d.chars < full) { d.chars = full; return; }
    d.i++;
    d.chars = 0;
    AudioFX.tap();
    if (d.i >= d.lines.length) {
      const fn = d.after;
      S.dlg = null;
      fn();
    }
  }
  function drawDialogue(t) {
    const d = S.dlg;
    const line = d.lines[d.i];
    const isNar = line.who === 'nar';
    const sp = SPEAKERS[line.who];
    const bx = 10, bw = W - 20, bh = 150, by = H - bh - 10;
    panel(ctx, bx, by, bw, bh, 'rgba(8,14,26,0.92)', isNar ? '#9fb4d0' : (sp ? sp.color : '#f2c038'));
    let tx = bx + 16, tw = bw - 32;
    if (!isNar && sp) {
      PR(ctx, bx + 10, by + 12, 64, 64, '#0f1d30');
      if (sp.face) {
        const blink = (t % 3.2) < 0.12;
        const fpal = blink ? { ...sp.pal, k: sp.pal.f } : sp.pal;
        drawMap(ctx, sp.face, fpal, bx + 14, by + 16, 4.6);
      } else {
        sp.body(ctx, bx + 23, by + 16, 3.2); // corpo inteiro como retrato
      }
      pTxt(ctx, sp.name, bx + 42, by + 90, sp.name.length > 9 ? 9 : 11, sp.color);
      tx = bx + 88; tw = bw - 104;
    }
    const shown = line.text.slice(0, Math.floor(d.chars));
    const lines = wrap(shown, tw, 14);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = isNar ? '#cdd8e8' : '#fff';
    ctx.font = `${isNar ? 'italic ' : ''}bold 14px "Courier New", monospace`;
    lines.slice(0, 6).forEach((ln, i) => ctx.fillText(ln, tx, by + 16 + i * 20));
    if (Math.floor(d.chars) >= line.text.length && Math.sin(t * 5) > 0) {
      pTxt(ctx, '▼ toque', bx + bw - 50, by + bh - 14, 11, '#f2c038');
    }
    pTxt(ctx, `${d.i + 1}/${d.lines.length}`, bx + 30, by + bh - 14, 10, '#5a6b7a');
  }

  function drawSpeaker(bodyFn, x, y, active, t, phase) {
    ctx.save();
    const bob = active ? Math.sin(t * 3 + phase) * 2.5 : Math.sin(t * 1.4 + phase) * 1;
    ctx.globalAlpha = active ? 0.22 : 0.12;
    PR(ctx, x + 6, y + 90, 50, 7, '#000');
    if (active) {
      ctx.globalAlpha = 0.18;
      PR(ctx, x + 8, y + 36, 44, 8, '#f2c038');
    }
    ctx.globalAlpha = active ? 1 : 0.5;
    bodyFn(ctx, x, y + bob, 5);
    ctx.restore();
  }

  // ---------- HUD do puzzle ----------
  function drawPuzzleHud() {
    const L = S.cur;
    panel(ctx, 10, 8, W - 20, 58, 'rgba(8,14,26,0.9)', L.color);
    const titulo = `Fase ${L.g} — ${L.title}`;
    ctx.font = 'bold 15px "Courier New", monospace';
    const tSize = ctx.measureText(titulo).width > 250 ? 12 : 15;
    pTxt(ctx, titulo, W / 2 + 14, 26, tSize, '#fff');
    pTxt(ctx, L.place, W / 2, 46, 11, '#9fb4d0', 'center', false);
    PR(ctx, 14, 14, 30, 26, '#1a2a3f');
    pTxt(ctx, '‹', 29, 26, 20, '#bfe6f2');
    const hint = PUZZLE_HINTS[L.engine];
    const lines = wrap(hint, W - 40, 12);
    panel(ctx, 10, 72, W - 20, 16 + lines.length * 16, 'rgba(8,14,26,0.82)', '#3a4a5f');
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillStyle = '#cdd8e8'; ctx.font = '12px "Courier New", monospace';
    lines.forEach((ln, i) => ctx.fillText(ln, 22, 80 + i * 16));
  }

  // ---------- fluxo de fases ----------
  function openLevel(g) {
    const L = getLevel(g);
    S.level = g;
    S.cur = L;
    startDialogue(L.intro, L.scene, () => {
      S.mode = 'puzzle';
      S.puzzle = new PUZZLES[L.engine](L.cfg);
      S.winT = 0;
    });
  }
  function onPuzzleSolved() {
    S.mode = 'bead';
    S.winT = 0;
    AudioFX.bead();
  }
  function afterBead() {
    const L = S.cur;
    startDialogue(L.outro, L.scene, () => {
      const wasNew = !isDone(L.g);
      if (wasNew) { S.save.done[L.g] = true; save(); }
      // liberou o próximo bairro?
      const d = L.c - 1;
      if (wasNew && d < 8 && districtDone(d)) {
        S.toast = { text: `Ponte liberada → ${d + 2}. ${ZONE[d + 1].name}`, t: 4 };
        AudioFX.win();
      }
      if (doneCount() >= TOTAL_PHASES && S.save.met.vovoMae && !S.save.fin) {
        startEnding();   // gated por met.vovoMae — igreja das Marias obrigatória (ADR-008)
      } else {
        enterWorld();
      }
    });
  }

  // ---------- card de recuperação de legado ----------
  // Caixas dos botões compartilhadas por draw e tap (evita drift de coordenadas).
  const LEGACY_BTN_CONT  = { x: 40, y: 360, w: W - 80, h: 56 };
  const LEGACY_BTN_FRESH = { x: 40, y: 432, w: W - 80, h: 56 };

  function drawLegacyCard(t) {
    drawScene(10, ctx, t);
    PR(ctx, 0, 0, W, H, 'rgba(5,8,16,0.78)');
    panel(ctx, 24, 200, W - 48, 312, 'rgba(8,14,26,0.92)');
    const n = S.legacy ? S.legacy.count : 0;
    pTxt(ctx, 'PROGRESSO ENCONTRADO', W / 2, 238, 18, '#f2c038');
    pTxt(ctx, 'Achamos um jogo salvo', W / 2, 282, 13, '#bfe6f2', 'center', false);
    pTxt(ctx, 'neste navegador.', W / 2, 302, 13, '#bfe6f2', 'center', false);
    pTxt(ctx, `${n}/${TOTAL_PHASES} conchas`, W / 2, 332, 16, '#bfe6f2');   // --azul-mar
    // botão Continuar (dourado) — fundo de painel + borda --ouro (default do panel)
    const b1 = LEGACY_BTN_CONT;
    panel(ctx, b1.x, b1.y, b1.w, b1.h, 'rgba(8,14,26,0.92)', '#f2c038');
    pTxt(ctx, 'CONTINUAR DE ONDE PAREI', b1.x + b1.w / 2, b1.y + b1.h / 2, 13, '#fff8d0');   // --creme-claro
    // botão Começar do zero (discreto) — borda/texto --cinza-nevoa
    const b2 = LEGACY_BTN_FRESH;
    panel(ctx, b2.x, b2.y, b2.w, b2.h, 'rgba(8,14,26,0.92)', '#5a6b7a');
    pTxt(ctx, 'COMEÇAR DO ZERO', b2.x + b2.w / 2, b2.y + b2.h / 2, 13, '#9fb4d0');   // --cinza-nevoa
  }

  // Adota o save legado: valida (já parseado em readLegacy) e grava na chave namespeada.
  function legacyContinue() {
    if (S.legacy) S.save = S.legacy.save;
    S.legacy = null;
    save();
    placeMaju();
    S.mode = 'title';
  }
  // Descarta o legado: remove a chave antiga (não pergunta de novo) e começa limpo.
  function legacyFresh() {
    try { localStorage.removeItem(LEGACY_SAVE_KEY); } catch {}
    S.legacy = null;
    S.save = load();          // origem agora limpa → save vazio
    save();                   // persiste o save namespeado vazio (card não reaparece)
    S.mode = 'title';
  }

  // ---------- título ----------
  function drawTitle(t) {
    drawScene(10, ctx, t);
    jangadaSil(ctx, 180 + Math.sin(t * 0.5) * 8, 480 + Math.sin(t * 1.2) * 3, 1.3, '#1a1020');
    // dedicatória — surge suavemente
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, t * 0.35 - 0.1)) * (0.75 + 0.18 * Math.sin(t * 0.7));
    ctx.restore();
    // painel principal
    panel(ctx, 24, 148, W - 48, 156, 'rgba(8,14,26,0.88)');
    pTxt(ctx, 'UM SONHO', W / 2, 184, 40, '#f2c038');
    pTxt(ctx, 'Andando pela cidade', W / 2, 230, 18, '#f2904a', 'center', false);
    pTxt(ctx, '✦  mundo livre  ·  pixel art  ✦', W / 2, 256, 11, '#bfe6f2', 'center', false);
    if (Math.sin(t * 3) > -0.3) pTxt(ctx, '— toque para começar —', W / 2, 556, 15, '#fff8d0');
    pTxt(ctx, `explore o Recife · ${TOTAL_PHASES} conchas`, W / 2, 588, 11, '#d8b8a0', 'center', false);
    if (doneCount() > 0) pTxt(ctx, `progresso salvo: ${doneCount()}/${TOTAL_PHASES} conchas`, W / 2, 610, 11, '#9fd8f0', 'center', false);
  }

  // ---------- conta conquistada ----------
  function drawBeadGet(t) {
    drawScene(S.cur.scene, ctx, S.t);
    PR(ctx, 0, 0, W, H, 'rgba(5,8,16,0.72)');
    const L = S.cur;
    const pulse = 26 + Math.sin(t * 4) * 4;
    ctx.save();
    ctx.globalAlpha = 0.16 + Math.sin(t * 4) * 0.05;
    drawBead(ctx, W / 2, 260, pulse * 1.9, L.color, true);
    ctx.restore();
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + t;
      const rad = 70 + Math.sin(t * 3 + i) * 6;
      PR(ctx, W / 2 + Math.cos(a) * rad - 3, 260 + Math.sin(a) * rad - 3, 6, 6, L.color);
    }
    drawBead(ctx, W / 2, 260, pulse, L.color, true);
    pTxt(ctx, '✦ concha recuperada! ✦', W / 2, 350, 15, '#fff8d0');
    pTxt(ctx, `${L.k}ª concha do ${L.cord}`, W / 2, 380, 18, L.color);
    pTxt(ctx, `${doneCount() + (isDone(L.g) ? 0 : 1)} de ${TOTAL_PHASES}`, W / 2, 410, 13, '#9fb4d0');
    if (t > 0.8 && Math.sin(t * 4) > 0) pTxt(ctx, '— toque —', W / 2, 470, 13, '#f2c038');
  }

  // ---------- final: o Vovô leva a Maju pelo céu ----------
  function startEnding() {
    S.save.fin = true; save();   // marca o fim (idempotente; nunca regride o progresso)
    startDialogue(STORY.skyEnding, 10, () => { S.mode = 'ceu'; S.winT = 0; });
  }
  // Porto do céu (spec 010): posição FOCAL da Vó Maria Rita — central, a jangada sobe até ela.
  const CEU_RITA = { x: Math.round(W / 2), y: Math.round(H * 0.20) };
  function drawCeu(t) {
    skyGrad(ctx, ['#f2c038', '#f2904a', '#d95a4a', '#8a3a5a', '#3a2a55', '#161232', '#0a0a1e'], 0, H);
    stars(ctx, Math.min(90, 18 + Math.floor(t * 10)), H, S.t);
    moon(ctx, 300, 92, 16);

    // ---- Recife lá embaixo — some enquanto sobem ----
    const cityAlpha = Math.max(0, 1 - t / 3.5);
    if (cityAlpha > 0.02) {
      ctx.save();
      ctx.globalAlpha = cityAlpha;
      PR(ctx, 0, H - 55, W, 55, '#1a6593');
      casaFar(ctx, H - 55, 2);
      casa(ctx, H - 28, 0);
      ctx.restore();
    }

    // ---- Nuvens passando no percurso ----
    const cloudT = Math.min(1, Math.max(0, (t - 1.5) / 2)) * Math.max(0, 1 - (t - 6) / 1.5);
    if (cloudT > 0.01) {
      ctx.save();
      ctx.globalAlpha = cloudT * 0.65;
      cloudLayer(ctx, S.t * 28, [
        { x: 30,  y: Math.round(H * 0.45), w: 100, sp: 18 },
        { x: 190, y: Math.round(H * 0.36), w:  80, sp: 24 },
        { x: 265, y: Math.round(H * 0.52), w:  90, sp: 14 },
      ]);
      ctx.restore();
    }

    // ---- Pássaros voando junto no início ----
    if (t > 0.5 && t < 4.5) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, (t - 0.5) * 1.2) * Math.max(0, 1 - (t - 3.5) * 1.5);
      birds(ctx, S.t, 5, Math.round(H * 0.54), 14);
      ctx.restore();
    }

    // ---- Jangada subindo ----
    const jy = H * 0.82 - Math.min(1, t / 6) * H * 0.52;

    // rastro dourado abaixo da jangada
    if (t > 0.5) {
      ctx.save();
      const trail = Math.min(0.45, (t - 0.5) * 0.09);
      for (let i = 0; i < 7; i++) {
        ctx.globalAlpha = trail * (1 - i / 7);
        PR(ctx, 161 + i * 2, jy + 4 + i * 8, 32 - i * 3, 3, '#f2c038');
      }
      ctx.restore();
    }

    // contas em órbita ao redor da jangada
    for (let i = 0; i < 14; i++) {
      const a = S.t * 1.2 + (i / 14) * Math.PI * 2;
      const rad = 46 + Math.sin(S.t * 2 + i) * 8;
      drawBead(ctx, 180 + Math.cos(a) * rad, jy - 24 + Math.sin(a) * rad, 4, CHAPTERS[i % 9].color, true);
    }
    jangadaSil(ctx, 180, jy, 1.2, '#241433');
    drawVovo(ctx, 180 - 34, jy - 66, 3);
    drawMaju(ctx, 180 + 4, jy - 58, 3);
    PR(ctx, 165, jy - 30, 6, 6, 'rgba(255,248,208,0.8)'); // mãos dadas

    // ---- Família = anel de luzes ao redor da Vó Maria Rita (spec 010) ----
    // Entram em leque acima da jangada, escalonadas; a Vó Maria Rita fica no centro.
    const FAMILY = [
      { draw: drawJonatha, name: 'Painho',        a: Math.PI * 1.18, t0: 3.0 },
      { draw: drawMicaele, name: 'Mainha',         a: Math.PI * 1.82, t0: 3.3 },
      { draw: drawJeff,    name: 'Titio Jeff',     a: Math.PI * 1.32, t0: 3.6 },
      { draw: drawRenato,  name: 'Titio Renato',   a: Math.PI * 1.68, t0: 3.9 },
      { draw: drawBruno,   name: 'Titio Bruno',    a: Math.PI * 1.46, t0: 4.2 },
      { draw: drawPrimos,  name: 'Ravi & Nico',    a: Math.PI * 1.54, t0: 4.5 },
      { draw: drawVova,    name: 'Vó Maria José',  a: Math.PI * 1.00, t0: 4.8 },
    ];
    const RX = 120, RY = 84;
    for (const m of FAMILY) {
      if (t < m.t0) continue;
      const ft = Math.min(1, (t - m.t0) * 2);
      const sx = Math.round(CEU_RITA.x + Math.cos(m.a) * RX);
      const sy = Math.round(CEU_RITA.y + 14 + Math.sin(m.a) * RY);
      ctx.save();
      ctx.globalAlpha = ft * 0.26;
      PR(ctx, sx - 4, sy - 4, 26, 26, '#fff8d0');
      ctx.globalAlpha = ft * 0.92;
      m.draw(ctx, sx, sy, 2);
      ctx.globalAlpha = ft * 0.82;
      pTxt(ctx, m.name, sx + 8, sy + 20, 7, '#f0d878', 'center', false);
      ctx.restore();
    }

    // ---- A Vó Maria Rita: FOCAL e central, o reencontro do porto do céu (só aparição) ----
    if (t > 3.6) {
      const ft = Math.min(1, (t - 3.6) * 1.6);
      const glow = 0.5 + Math.sin(S.t * 1.6) * 0.12;
      ctx.save();
      ctx.globalAlpha = ft * glow;
      PR(ctx, CEU_RITA.x - 24, CEU_RITA.y - 24, 64, 68, '#fff2c0');
      ctx.globalAlpha = ft;
      drawVovoMae(ctx, CEU_RITA.x - 6, CEU_RITA.y, 3);
      ctx.globalAlpha = ft * 0.95;
      pTxt(ctx, 'Vó Maria Rita', CEU_RITA.x + 6, CEU_RITA.y + 40, 9, '#fff2c0', 'center', false);
      ctx.restore();
    }

    // ---- Textos narrativos ----
    if (t > 2) pTxt(ctx, 'O colar brilhou inteiro no peito do Recife.', W / 2, 128, 12, '#fff8d0');
    if (t > 7.4) pTxt(ctx, 'E o Vovô levou a Maju', W / 2, H - 152, 16, '#fff8d0');
    if (t > 8.0) pTxt(ctx, 'pro lugar onde o amor não tem fim.', W / 2, H - 128, 16, '#fff8d0');
    if (t > 8.8) {
      ctx.save(); ctx.globalAlpha = Math.min(1, (t - 8.8) * 0.7);
      pTxt(ctx, 'Jonatha · Micaele · Jeff · Bruno', W / 2, H - 100, 10, '#f0d878', 'center', false);
      pTxt(ctx, 'Renato · Ravi · Nicolas · Vó Maria José · Vó Maria Rita', W / 2, H - 84, 10, '#f0d878', 'center', false);
      ctx.restore();
    }
    if (t > 10) {
      pTxt(ctx, '✦ FIM ✦', W / 2, H - 58, 20, '#f2c038');
      ctx.save(); ctx.globalAlpha = Math.min(1, (t - 10) * 0.5);
      pTxt(ctx, 'Para Maria Júlia', W / 2, H - 34, 12, '#f0d878', 'center', false);
      ctx.restore();
    }
    if (t > 11 && Math.sin(t * 3) > 0) pTxt(ctx, '— toque para voltar ao Recife —', W / 2, H - 14, 11, '#bfe6f2');
  }

  // ---------- joystick + interação ----------
  const JOY = { active: false, baseX: 70, baseY: H - 78, R: 46, kx: 0, ky: 0 };
  const ENTER = { x: W - 152, y: H - 66, w: 142, h: 48 };
  const MUTE  = { x: W - 42, y: 12, w: 30, h: 28 };
  const BTN3D = { x: W - 152, y: 8, w: 50, h: 44 };
  const keys = {};

  function updateJoy(x, y) {
    let dx = x - JOY.baseX, dy = y - JOY.baseY;
    const m = Math.hypot(dx, dy);
    if (m > JOY.R) { dx = dx / m * JOY.R; dy = dy / m * JOY.R; }
    JOY.kx = dx; JOY.ky = dy;
  }

  function enterNear() {
    if (S.mode !== 'world') return;   // guard: ignora toques/teclas duplicados durante a transição
    if (S.nearNpc) { AudioFX.ok(); talkNpc(S.nearNpc); return; }
    if (S.near) {
      // Gate da Fase 2: a cidade (entrar nas conchas) só abre depois de falar com o Jonatha.
      if (!S.save.briefed) {
        AudioFX.tap();
        S.toast = { text: 'Fale com a mainha e o painho primeiro, filha.', t: 4.5 };
        return;
      }
      AudioFX.ok(); saveMaju(); openLevel(S.near.g);
    }
  }
  function saveMaju() {
    S.save.maju = { x: Math.round(S.maju.x), y: Math.round(S.maju.y) };
    save();
  }
  function talkNpc(npc) {
    // Desfecho gated por met.vovoMae: só sobe ao céu quem reencontrou a Vó Maria Rita
    // na igrejinha da Piedade (ADR-003 abre a cena; ADR-008 a torna obrigatória pro fim).
    if (npc.ending && doneCount() >= TOTAL_PHASES && S.save.met.vovoMae) { startEnding(); return; }

    // Igreja N. S. da Piedade — a Vó Maria Rita (do céu) aparece só aqui DENTRO. A cena abre
    // depois de conhecer a Vó Maria José viva (met.vova); ENTRAR na igreja revela a Maria Rita,
    // reúne as duas Marias e ensina a lição do amor eterno. Antes disso, dica genérica que não
    // revela quem falta (ADR-003). Não incrementa fase — é cena, não concha.
    if (npc.key === 'asMarias') {
      const jaViu = !!S.save.met.asMarias;
      if (!S.save.met.vova) {
        S.toast = { text: 'A porta da Piedade vai abrir quando o coração estiver pronto.', t: 4.5, color: '#f2c038', bg: 'rgba(20,14,4,0.92)', textColor: '#f2c038' };
        return;
      }
      const lines = STORY.meet[jaViu ? 'asMariasAgain' : 'asMarias'] || STORY.meet.asMarias;
      if (!lines?.length) return;
      startDialogue(lines, 11, () => {   // SCENES[11] = interior da igreja (spec 007)
        enterWorld();
        S.save.met.vovoMae = true;   // a Maju viu a Vó Maria Rita dentro da igreja
        S.save.met.asMarias = true;
        save();
        if (!jaViu) {
          S.toast = { text: '✦ Lição aprendida', sub: 'O amor que vai pro céu não desaparece.', t: 5.5, color: '#f2c038', bg: 'rgba(20,12,4,0.94)', textColor: '#f2c038' };
        }
      });
      S.dlg.duo = ['vova', 'vovoMae']; // reencontro: as duas Marias aparecem juntas na cena
      return;
    }

    // Vovô Maro: progresso dinâmico no cais (caso especial).
    if (npc.key === 'vovo') {
      S.save.met.vovo = true; save();
      // Colar inteiro mas sem ter entrado na igrejinha → dica que aponta a Piedade (ADR-008).
      if (doneCount() >= TOTAL_PHASES && !S.save.met.vovoMae) {
        startDialogue(STORY.meet.vovoNeedsChurch, CHAPTERS[npc.d].scene, () => enterWorld());
        return;
      }
      startDialogue([
        { who: 'vovo', text: `Já são ${doneCount()} de ${TOTAL_PHASES} contas, minha neta. Falta pouco pro colar voltar inteiro.` },
        { who: 'maju', text: 'Tô quase lá, vovô! Não vou deixar o sol se pôr antes.' },
      ], CHAPTERS[npc.d].scene, () => enterWorld());
      return;
    }

    // Onboarding gated (Fase 2): a Micaele recebe → o Jonatha explica a missão → cidade liberada.
    // Ordem obrigatória: falar com o pai antes da mãe só rende um desvio (não marca met nem briefed).
    if (npc.key === 'jona' && !S.save.briefed && !S.save.met.mica) {
      startDialogue(STORY.meet.jonaBlocked, CHAPTERS[npc.d].scene, () => enterWorld());
      return;
    }

    // 1ª conversa "de conteúdo": Micaele usa met.mica; Jonatha usa briefed; demais usam met[key].
    const first = npc.key === 'mica' ? !S.save.met.mica
                : npc.key === 'jona' ? !S.save.briefed
                : !S.save.met[npc.key];
    const key = first ? npc.key : npc.key + 'Again';
    // fallback robusto: se a chave não existir, nunca passa undefined pro diálogo.
    const lines = STORY.meet[key] || STORY.meet[npc.key + 'Again'] || STORY.meet[npc.key] || STORY.meet.start;
    if (!lines?.length) return; // segurança extra: sem falas, não trava a tela

    startDialogue(lines, CHAPTERS[npc.d].scene, () => {
      enterWorld();
      // marca "já conheci" só ao concluir o diálogo correto (nunca no desvio).
      S.save.met[npc.key] = true;
      if (first && npc.lesson) {
        S.toast = { text: '✦ Lição aprendida', sub: npc.lesson, t: 5.5, color: '#f2c038', bg: 'rgba(20,12,4,0.94)', textColor: '#f2c038' };
      }
      // Jonatha (depois da Micaele) explica a missão: libera a entrada nas conchas + seta dourada.
      if (first && npc.key === 'jona') {
        S.save.briefed = true;
        S.toast = { text: 'Siga a seta dourada até a primeira concha', t: 4.5 };
      }
      save();
    });
  }

  function worldPointerDown(x, y) {
    if (inBox(x, y, MUTE.x, MUTE.y, MUTE.w, MUTE.h)) { AudioFX.toggleMute(); AudioFX.tap(); return; }
    if ((S.near || S.nearNpc) && inBox(x, y, ENTER.x, ENTER.y, ENTER.w, ENTER.h)) { enterNear(); return; }
    if (x < 210 && y > H - 210) { JOY.active = true; updateJoy(x, y); }
  }

  function drawWorldHud(t) {
    panel(ctx, 10, 8, W - 20, 44, 'rgba(8,14,26,0.9)', '#f2c038');
    pTxt(ctx, 'UM SONHO', 18, 30, 14, '#f2c038', 'left');
    pTxt(ctx, `♦ ${doneCount()}/${TOTAL_PHASES}`, W / 2 + 14, 30, 14, '#bfe6f2');
    PR(ctx, MUTE.x, MUTE.y, MUTE.w, MUTE.h, '#1a2a3f');
    pTxt(ctx, AudioFX.muted ? '♪✕' : '♪', MUTE.x + MUTE.w / 2, MUTE.y + 15, 13, AudioFX.muted ? '#5a6b7a' : '#bfe6f2');
    // bairro atual + progresso (canto superior esquerdo, abaixo de UM SONHO)
    drawDistrictTag();
    // direcional
    ctx.save();
    ctx.beginPath(); ctx.arc(JOY.baseX, JOY.baseY, JOY.R, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(10,20,38,0.42)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(191,230,242,0.5)'; ctx.stroke();
    const kx = JOY.baseX + (JOY.active ? JOY.kx : 0), ky = JOY.baseY + (JOY.active ? JOY.ky : 0);
    ctx.beginPath(); ctx.arc(kx, ky, 20, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(242,192,56,0.85)'; ctx.fill();
    ctx.restore();
    // botão entrar/falar + alvo
    if (S.near || S.nearNpc) {
      let label, btn, col;
      if (S.nearNpc) {
        label = SPEAKERS[S.nearNpc.key].name;
        btn = S.nearNpc.ending && doneCount() >= TOTAL_PHASES && S.save.met.vovoMae ? '★ SUBIR' : '★ FALAR';
        col = '#c98a3a';
      } else {
        label = S.near.title.length > 16 ? S.near.title.slice(0, 15) + '…' : S.near.title;
        if (isDone(S.near.g)) label += ' ✓';
        btn = isDone(S.near.g) ? '↻ REJOGAR' : '▶ ENTRAR';
        col = '#3f9b52';
      }
      pTxt(ctx, label, ENTER.x + ENTER.w / 2, ENTER.y - 12, 12, '#fff8d0');
      PR(ctx, ENTER.x, ENTER.y + 4, ENTER.w, ENTER.h, '#13241a');
      PR(ctx, ENTER.x, ENTER.y, ENTER.w, ENTER.h - 4, col);
      pTxt(ctx, btn, ENTER.x + ENTER.w / 2, ENTER.y + ENTER.h / 2 - 2, 15, '#fff');
    }
    // toast (bairro liberado ou lição aprendida)
    if (S.toast) {
      const tk = S.toast;
      ctx.save(); ctx.globalAlpha = Math.min(1, tk.t);
      const th = tk.sub ? 48 : 32;
      panel(ctx, 30, 70, W - 60, th, tk.bg || 'rgba(8,30,18,0.92)', tk.color || '#67b06b');
      pTxt(ctx, tk.text, W / 2, 86, 11, tk.textColor || '#bfe6a0');
      if (tk.sub) pTxt(ctx, tk.sub, W / 2, 104, 10, '#fff8d0', 'center', false);
      ctx.restore();
    }
    if (!S.save.briefed && !S.toast) {
      ctx.save(); ctx.globalAlpha = 0.6 + 0.4 * Math.abs(Math.sin(t * 2));
      pTxt(ctx, !S.save.met.mica ? 'Vá falar com a mainha primeiro' : 'Agora vá falar com o painho',
        W / 2, H - 150, 12, '#fff8d0');
      pTxt(ctx, 'Chegue perto e toque em ★ FALAR.', W / 2, H - 132, 11, '#fff8d0');
      ctx.restore();
    } else if (S.helpT > 0 && !S.toast) {
      ctx.save(); ctx.globalAlpha = Math.min(1, S.helpT);
      pTxt(ctx, 'Arraste no canto p/ andar.', W / 2, H - 150, 12, '#fff8d0');
      pTxt(ctx, 'Chegue numa concha ou pessoa e toque o botão.', W / 2, H - 132, 11, '#fff8d0');
      ctx.restore();
    }
    drawBeacon(S.t);
    drawOnboardingGuide(S.t);
  }

  // etiqueta do bairro atual + progresso, fixa no canto superior esquerdo
  function drawDistrictTag() {
    let cd = World3D.currentDistrict();
    if (cd < 0) { const tgt = nextUndoneAnywhere(); cd = tgt ? tgt.d : 0; }
    const total = DISTRICT_SIZES[cd];
    let done = 0;
    for (let k = 0; k < total; k++) if (isDone(DISTRICT_STARTS[cd] + k)) done++;
    const name = World3D.districtName(cd) || ZONE[cd].name;
    const color = CHAPTERS[cd].color;
    const complete = done >= total;
    const prog = complete ? 'COMPLETO' : `${done}/${total}`;
    ctx.font = 'bold 11px "Courier New", monospace';
    const nameW = ctx.measureText(name).width;
    const progW = ctx.measureText(prog).width;
    panel(ctx, 10, 56, nameW + progW + 24, 20, 'rgba(8,14,26,0.82)', color);
    pTxt(ctx, name, 18, 66, 11, color, 'left');
    pTxt(ctx, prog, 18 + nameW + 8, 66, 11, complete ? '#88ee88' : '#bfe6f2', 'left');
  }

  // seta dourada genérica: pulsa acima do alvo se visível, ou aponta da borda se fora da tela
  function drawGuideArrow(tx, ty, t, label) {
    const alpha = 0.72 + 0.22 * Math.sin(t * 4);
    ctx.save();
    ctx.globalAlpha = alpha;
    if (tx >= 24 && tx <= W - 24 && ty >= 60 && ty <= H - 120) {
      const ay = ty - 50 - Math.abs(Math.sin(t * 3.5)) * 10;
      pTxt(ctx, '▼', tx, ay, 22, '#f2c038');
      if (label) pTxt(ctx, label, tx, ay - 20, 9, '#f2c038', 'center', false);
    } else {
      const angle = Math.atan2(ty - H / 2, tx - W / 2);
      const ex = Math.max(28, Math.min(W - 28, W / 2 + Math.cos(angle) * 148));
      const ey = Math.max(64, Math.min(H - 108, H / 2 + Math.sin(angle) * 240));
      ctx.translate(ex, ey);
      ctx.rotate(angle + Math.PI / 2);
      pTxt(ctx, '▲', 0, 0, 20, '#f2c038');
    }
    ctx.restore();
  }

  // seta dourada — guia persistente apontando para o portal do bairro da próxima conta
  function drawBeacon(t) {
    if (!S.save.briefed) return;                 // missão ainda não explicada: sem seta
    const target = nextUndoneAnywhere();
    if (!target) return;                         // tudo concluído: sem guia
    const pos = World3D.nodeScreen(target.g);    // posição de tela do nó da próxima concha (iso)
    if (!pos) return;
    drawGuideArrow(pos.x, pos.y, t, 'vá aqui');
  }

  // guia de onboarding (Fase 2) — aponta pra Micaele e, depois dela, pro Jonatha (até briefed)
  function drawOnboardingGuide(t) {
    if (S.save.briefed) return;
    const key = !S.save.met.mica ? 'mica' : 'jona';
    const npc = NPCS.find(n => n.key === key);
    if (!npc || !districtUnlocked(npc.d)) return;
    const pos = World3D.npcScreen(key);          // posição iso real no passeio (não o layout 2D legado)
    if (!pos) return;
    drawGuideArrow(pos.x, pos.y, t, !S.save.met.mica ? 'a mainha' : 'o painho');
  }

  function enterWorld(d) {
    S.mode = 'world';
    JOY.active = false; JOY.kx = 0; JOY.ky = 0;
    if (d !== undefined) World3D.reset(d);
  }

  // ---------- entrada ----------
  let ptr = { down: false, sx: 0, sy: 0, x: 0, y: 0 };
  function toGame(e) {
    const r = cv.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H];
  }
  cv.addEventListener('pointerdown', e => {
    e.preventDefault();
    AudioFX.unlock();
    const [x, y] = toGame(e);
    ptr = { down: true, sx: x, sy: y, x, y };
    if (S.mode === 'world') { worldPointerDown(x, y); return; }
    if (S.mode === 'puzzle' && S.puzzle && S.puzzle.dragStart) S.puzzle.dragStart(x, y);
  });
  cv.addEventListener('pointermove', e => {
    if (!ptr.down) return;
    const [x, y] = toGame(e);
    ptr.x = x; ptr.y = y;
    if (S.mode === 'world') { if (JOY.active) updateJoy(x, y); return; }
    if (S.mode === 'puzzle' && S.puzzle && S.puzzle.dragMove) S.puzzle.dragMove(x, y);
  });
  cv.addEventListener('pointerup', e => {
    if (!ptr.down) return;
    ptr.down = false;
    const [x, y] = toGame(e);
    if (S.mode === 'world') { if (JOY.active) { JOY.active = false; JOY.kx = 0; JOY.ky = 0; } return; }
    let consumed = false;
    if (S.mode === 'puzzle' && S.puzzle && S.puzzle.dragEnd) {
      consumed = S.puzzle.dragEnd(x, y) === true;
    }
    if (!consumed) handleTap(x, y);
  });
  cv.addEventListener('pointercancel', () => { ptr.down = false; if (JOY.active) { JOY.active = false; JOY.kx = 0; JOY.ky = 0; } });

  window.addEventListener('keydown', e => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    keys[k] = true;
    if (S.mode === 'world' && (e.key === 'Enter' || e.key === ' ' || k === 'e')) { e.preventDefault(); enterNear(); }
  });
  window.addEventListener('keyup', e => { keys[e.key.length === 1 ? e.key.toLowerCase() : e.key] = false; });
  // inclinação do celular → motores que a aceitam (ex.: Pipa). Inócuo sem giroscópio (fallback no tap).
  window.addEventListener('deviceorientation', e => {
    if (S.mode === 'puzzle' && S.puzzle && S.puzzle.tilt && e.gamma != null) S.puzzle.tilt(e.gamma);
  });

  function startTutorial() {
    // Fase 2: o mundo nasce já em modo livre; a guia dourada aponta pra Micaele, que dá as
    // boas-vindas ao Recife quando a Maju chega perto e toca ★ FALAR.
    enterWorld();
  }
  function handleTap(x, y) {
    switch (S.mode) {
      case 'legacy': {
        const b1 = LEGACY_BTN_CONT, b2 = LEGACY_BTN_FRESH;
        if (inBox(x, y, b1.x, b1.y, b1.w, b1.h)) { AudioFX.ok(); legacyContinue(); }
        else if (inBox(x, y, b2.x, b2.y, b2.w, b2.h)) { AudioFX.tap(); legacyFresh(); }
        break;
      }
      case 'title':
        AudioFX.ok();
        if (!S.save.opened) {
          S.save.opened = true; save();
          startDialogue(STORY.opening, 7, () => startTutorial());
        } else {
          startDialogue(STORY.opening, 7, () => enterWorld());
        }
        break;
      case 'dialogue': dlgTap(); break;
      case 'puzzle':
        if (inBox(x, y, 10, 8, 60, 40)) { enterWorld(); S.puzzle = null; AudioFX.tap(); return; }
        if (S.puzzle && !S.puzzle.solved) S.puzzle.tap(x, y);
        break;
      case 'bead': if (S.winT > 0.8) { AudioFX.tap(); afterBead(); } break;
      case 'ceu': if (S.winT > 11) { enterWorld(); AudioFX.tap(); } break;
    }
  }

  // ---------- loop ----------
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    S.t += dt;
    const t = S.t;

    ctx.clearRect(0, 0, W, H);

    if (S.mode !== S._lastMode) { S.fadeT = TRANS; S._lastMode = S.mode; }

    switch (S.mode) {
      case 'legacy':
        drawLegacyCard(t);
        break;
      case 'title':
        drawTitle(t);
        break;
      case 'dialogue':
        drawScene(S.sceneN, ctx, t);
        S.dlg.chars += dt * 42;
        {
          const cur = S.dlg.lines[S.dlg.i];
          if (S.dlg.duo) {
            // Reencontro das duas Marias (spec 004): as duas avós juntas na cena, Maju ao lado
            const [ma, mb] = S.dlg.duo;
            if (SPEAKERS[ma]) drawSpeaker(SPEAKERS[ma].body, 175, H - 230, cur.who === ma, t, 0);
            if (SPEAKERS[mb]) drawSpeaker(SPEAKERS[mb].body, 255, H - 230, cur.who === mb, t, 1.0);
            drawSpeaker(drawMaju, 50, H - 226, cur.who === 'maju', t, 1.2);
          } else if (cur.who !== 'nar') {
            if (cur.who !== 'maju') S.dlg.right = cur.who;
            if (S.dlg.right && SPEAKERS[S.dlg.right]) {
              drawSpeaker(SPEAKERS[S.dlg.right].body, 250, H - 230, cur.who === S.dlg.right, t, 0);
            }
            // sem NPC na cena (sonho/recomendação): Maju aparece sozinha, centralizada
            drawSpeaker(drawMaju, S.dlg.right ? 70 : 150, H - 226, cur.who === 'maju', t, 1.2);
          } else if (cur.text?.includes('acenam')) {
            // Jonatha e Micaele acenam enquanto Maju parte
            drawSpeaker(drawJonatha, 54,  H - 230, true, t, 0);
            drawSpeaker(drawMicaele, 128, H - 230, true, t, 1.4);
            const wb   = Math.sin(t * 5);
            const jBob = Math.round(Math.sin(t * 3)       * 2.5);
            const mBob = Math.round(Math.sin(t * 3 + 1.4) * 2.5);
            PR(ctx, 88,  H - 248 + jBob - Math.round(wb * 8), 5, 5, '#3fae7a');  // mão Jonatha
            PR(ctx, 162, H - 248 + mBob - Math.round(wb * 8), 5, 5, '#e87ab0');  // mão Micaele
          }
        }
        drawDialogue(t);
        break;
      case 'world': {
        let vx = 0, vy = 0;
        if (JOY.active) { vx = JOY.kx / JOY.R; vy = JOY.ky / JOY.R; }
        else {
          if (keys.ArrowLeft  || keys.a) vx -= 1;
          if (keys.ArrowRight || keys.d) vx += 1;
          if (keys.ArrowUp    || keys.w) vy -= 1;
          if (keys.ArrowDown  || keys.s) vy += 1;
          const m = Math.hypot(vx, vy); if (m > 1) { vx /= m; vy /= m; }
        }
        World3D.update(dt, vx, vy, W, H, districtUnlocked);
        World3D.draw(ctx, W, H, t, districtUnlocked, isDone);
        // proximidade (nós de fase e NPCs)
        const sp3d  = World3D.nearSpot(districtUnlocked);
        const npc3d = World3D.nearNpc(districtUnlocked);
        S.nearNpc = npc3d || null;
        S.near = (!npc3d && sp3d)
          ? { g: sp3d.g, d: sp3d.d, title: getLevel(sp3d.g).title, color: CHAPTERS[sp3d.d].color }
          : null;
        drawWorldHud(t);
        if (S.helpT > 0) S.helpT -= dt;
        if (S.toast) { S.toast.t -= dt; if (S.toast.t <= 0) S.toast = null; }
        break;
      }
      case 'puzzle':
        drawScene(S.cur.scene, ctx, t);
        PR(ctx, PA.x - 6, PA.y - 6, PA.w + 12, PA.h + 12, 'rgba(8,14,26,0.78)');
        S.puzzle.update(dt, t);
        S.puzzle.draw(ctx, t);
        drawPuzzleHud();
        if (S.puzzle.solved) {
          S.winT += dt;
          if (S.winT > 1.0) onPuzzleSolved();
        }
        break;
      case 'bead':
        S.winT += dt;
        drawBeadGet(S.winT);
        break;
      case 'ceu':
        S.winT += dt;
        drawCeu(S.winT);
        break;
    }

    if (S.fadeT > 0) {
      const a = (S.fadeT / TRANS) ** 1.4;
      PR(ctx, 0, 0, W, H, `rgba(9,14,26,${a})`);
      S.fadeT -= dt;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // ---------- depuração / testes ----------
  window.__game = S;
  window.__story = STORY;   // expõe os diálogos para validação headless (spec 004)
  window.__openLevel = openLevel;
  window.__tap = (x, y) => handleTap(x, y);
  window.__world = {
    spots: SPOTS, npcs: NPCS,
    warp: g => { const s = SPOTS.find(z => z.g === g); if (s) { S.maju.x = s.x; S.maju.y = s.y; } return s; },
    toNpc: key => { const n = NPCS.find(z => z.key === key); if (n) { S.maju.x = n.x; S.maju.y = n.y + 30; } return n; },
    move: (dx, dy) => { S.maju.x += dx; S.maju.y += dy; },
    near: () => S.near && S.near.g,
    nearNpc: () => S.nearNpc && S.nearNpc.key,
    unlocked: d => districtUnlocked(d),
    // tubarão ambiente (spec 006): snapshot + passo determinístico (delega ao World3D)
    shark: () => World3D.shark(),
    stepShark: dt => World3D.stepShark(dt, districtUnlocked),
    completeDistrict: d => { for (let k = 0; k < DISTRICT_SIZES[d]; k++) { S.save.done[DISTRICT_STARTS[d] + k] = true; } save(); },
    completeAll: () => { for (let g = 1; g <= TOTAL_PHASES; g++) { S.save.done[g] = true; } save(); },
    // testes de onboarding: zera o save inteiro e recarrega (fluxo de jogador novo).
    // Remove a chave namespeada E a legada — limpeza completa da origem para este jogo.
    reset: () => { try { localStorage.removeItem(SAVE_KEY); localStorage.removeItem(LEGACY_SAVE_KEY); } catch {} location.reload(); },
    // card de legado (spec 002): caixas dos botões + toque, para teste headless
    legacyBtns: () => ({ cont: LEGACY_BTN_CONT, fresh: LEGACY_BTN_FRESH }),
    tapAt: (x, y) => handleTap(x, y),
    // re-testar as intros dos pais sem perder progresso: faz a missão voltar a ser "não explicada"
    rebrief: () => { S.save.briefed = false; S.save.met.jona = false; S.save.met.mica = false; save(); return 'briefed=false; fale com a Micaele e o Jonatha de novo'; },
    // hooks de teste do onboarding (Fase 2): dispara ação como se a Maju estivesse perto do alvo.
    // Busca em NPCS; se não achar, em World3D.worldNpcs (cenas especiais como asMarias — spec 004).
    talk: key => {
      const n = NPCS.find(z => z.key === key) || World3D.worldNpcs.find(z => z.key === key) || null;
      if (!n) return null;
      S.nearNpc = n; S.near = null; enterNear(); return S.mode;
    },
    tryEnter: g => { const s = SPOTS.find(z => z.g === g); if (!s) return null; S.near = s; S.nearNpc = null; enterNear(); return S.mode; },
    finish: () => { let n = 0; while (S.mode === 'dialogue' && n++ < 300) dlgTap(); return S.mode; },
    // desfecho no céu (spec 010): render testável headless + posição focal da Vó Maria Rita
    drawCeu: t => drawCeu(t),
    ceuFocal: () => ({ x: CEU_RITA.x, y: CEU_RITA.y, who: 'vovoMae' }),
  };
})();
