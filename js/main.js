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
  const WORLD_W = WX.cols * WX.cw;   // 1260
  const WORLD_H = WX.rows * WX.ch;   // 1860

  function districtCell(d) {
    const row = Math.floor(d / 3);
    const col = (row % 2 === 0) ? (d % 3) : (2 - (d % 3));
    return { col, row, x: col * WX.cw, y: row * WX.ch };
  }
  function districtCenter(d) {
    const c = districtCell(d);
    return { x: c.x + WX.cw / 2, y: c.y + WX.ch / 2 };
  }
  function landRect(d) {
    const c = districtCell(d);
    return { x: c.x + WX.gut, y: c.y + WX.gut, w: WX.cw - WX.gut * 2, h: WX.ch - WX.gut * 2 };
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
  const SPOTS = [];
  function buildSpots() {
    for (let g = 1; g <= 81; g++) {
      const d = Math.floor((g - 1) / 9), k = (g - 1) % 9;
      const sc = k % 3, sr = Math.floor(k / 3);
      const cols = gridCols(d), rows = gridRows(d);
      const L = getLevel(g);
      SPOTS.push({
        g, d, k, x: cols[sc], y: rows[sr],
        title: L.title, color: CHAPTERS[d].color,
        anchor: !!CHAPTERS[d].fases[k].anchor,
      });
    }
  }

  // personagens-guia da família — posicionados na faixa de cima do bairro
  const NPCS = [
    { key: 'jona', d: 0, dx: -52, dy: -176, draw: drawJonatha, kid: true },
    { key: 'mica', d: 0, dx: 52, dy: -176, draw: drawMicaele, kid: true },
    { key: 'jeff', d: 1, dx: 0, dy: -176, draw: drawJeff },
    { key: 'vova', d: 6, dx: 0, dy: -176, draw: drawVova },
    { key: 'vovo', d: 8, dx: 0, dy: -214, draw: drawVovo, ending: true },
  ];
  NPCS.forEach(n => { const c = districtCenter(n.d); n.x = c.x + n.dx; n.y = c.y + n.dy; });

  // quem fala nos diálogos (retrato + nome + cor)
  const SPEAKERS = {
    maju: { name: 'MAJU', color: '#f2c038', face: MAJU_FACE, pal: FACE_PAL, body: drawMaju },
    vovo: { name: 'VOVÔ CHICO', color: '#caa15a', face: VOVO_FACE, pal: VOVO_FACE_PAL, body: drawVovo },
    jona: { name: 'JONATHA', color: '#3fae7a', body: drawJonatha },
    mica: { name: 'MICAELE', color: '#e87ab0', body: drawMicaele },
    jeff: { name: 'TITIO JEFF', color: '#f2a83a', body: drawJeff },
    vova: { name: 'VOVÓ', color: '#c79bd0', body: drawVova },
  };

  // ---------- save (v3: done = fases concluídas; met = quem já conheci) ----------
  const SAVE_KEY = 'maresRecife';
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(SAVE_KEY)) || {};
      if (s.v === 3) {
        return { v: 3, done: s.done || {}, opened: !!s.opened, fin: !!s.fin, maju: s.maju || null, met: s.met || {} };
      }
      const prog = s.v === 2 ? Math.min(81, s.prog || 0) : 0;
      const done = {};
      for (let i = 1; i <= prog; i++) done[i] = true;
      return { v: 3, done, opened: !!s.opened, fin: prog >= 81, maju: null, met: {} };
    } catch { return { v: 3, done: {}, opened: false, fin: false, maju: null, met: {} }; }
  }
  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S.save)); } catch {} }
  function isDone(g) { return !!S.save.done[g]; }
  function doneCount() { return Object.keys(S.save.done).length; }
  function districtDone(d) { for (let k = 0; k < 9; k++) if (!isDone(d * 9 + k + 1)) return false; return true; }
  function districtUnlocked(d) { return d === 0 || districtDone(d - 1); }

  // ---------- estado ----------
  const S = {
    mode: 'title',   // title | dialogue | world | puzzle | bead | ceu
    save: load(),
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
    cam: { x: 0, y: 0 },
    near: null,       // conta-spot mais próxima
    nearNpc: null,    // personagem mais próximo
    helpT: 7,
    toast: null,      // { text, t }
  };
  const TRANS = 0.34;

  buildSpots();
  {
    const c = districtCenter(0);
    const sv = S.save.maju;
    S.maju.x = sv ? sv.x : c.x;
    S.maju.y = sv ? sv.y : c.y + 70;
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
    const l = lines.find(x => x.who !== 'maju' && x.who !== 'nar');
    return l ? l.who : 'vovo';
  }
  function startDialogue(lines, sceneN, after) {
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
      if (doneCount() >= 81 && !S.save.fin) {
        S.save.fin = true; save();
        startEnding();
      } else {
        enterWorld();
      }
    });
  }

  // ---------- título ----------
  function drawTitle(t) {
    drawScene(10, ctx, t);
    jangadaSil(ctx, 180 + Math.sin(t * 0.5) * 8, 480 + Math.sin(t * 1.2) * 3, 1.3, '#1a1020');
    panel(ctx, 24, 150, W - 48, 138, 'rgba(8,14,26,0.85)');
    pTxt(ctx, 'MARÉS', W / 2, 188, 40, '#f2c038');
    pTxt(ctx, 'DO RECIFE', W / 2, 228, 28, '#f2904a');
    pTxt(ctx, 'mundo livre · pixel art', W / 2, 260, 12, '#bfe6f2', 'center', false);
    if (Math.sin(t * 3) > -0.3) pTxt(ctx, '— toque para começar —', W / 2, 560, 15, '#fff8d0');
    pTxt(ctx, 'explore o Recife · 81 contas · DDD 81', W / 2, 590, 11, '#d8b8a0', 'center', false);
    if (doneCount() > 0) pTxt(ctx, `progresso salvo: ${doneCount()}/81 contas`, W / 2, 614, 11, '#9fd8f0', 'center', false);
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
    pTxt(ctx, '✦ conta recuperada! ✦', W / 2, 350, 15, '#fff8d0');
    pTxt(ctx, `${L.k}ª conta do ${L.cord}`, W / 2, 380, 18, L.color);
    pTxt(ctx, `${doneCount() + (isDone(L.g) ? 0 : 1)} de 81`, W / 2, 410, 13, '#9fb4d0');
    if (t > 0.8 && Math.sin(t * 4) > 0) pTxt(ctx, '— toque —', W / 2, 470, 13, '#f2c038');
  }

  // ---------- final: o Vovô leva a Maju pelo céu ----------
  function startEnding() {
    startDialogue(STORY.skyEnding, 10, () => { S.mode = 'ceu'; S.winT = 0; });
  }
  function drawCeu(t) {
    skyGrad(ctx, ['#f2c038', '#f2904a', '#d95a4a', '#8a3a5a', '#3a2a55', '#161232', '#0a0a1e'], 0, H);
    stars(ctx, Math.min(90, 18 + Math.floor(t * 12)), H, S.t);
    moon(ctx, 300, 92, 16);
    const jy = H * 0.82 - Math.min(1, t / 6) * H * 0.52; // jangada sobe devagar
    // contas em órbita ao redor da jangada
    for (let i = 0; i < 14; i++) {
      const a = S.t * 1.2 + (i / 14) * Math.PI * 2;
      const rad = 46 + Math.sin(S.t * 2 + i) * 8;
      drawBead(ctx, 180 + Math.cos(a) * rad, jy - 24 + Math.sin(a) * rad, 4, CHAPTERS[i % 9].color, true);
    }
    jangadaSil(ctx, 180, jy, 1.2, '#241433');
    drawVovo(ctx, 180 - 34, jy - 66, 3);
    drawMaju(ctx, 180 + 4, jy - 58, 3);
    PR(ctx, 165, jy - 30, 6, 6, 'rgba(255,248,208,0.8)'); // mãos dadas (brilho)
    if (t > 2) pTxt(ctx, 'O colar brilhou inteiro no peito do Recife.', W / 2, 130, 12, '#fff8d0');
    if (t > 4) pTxt(ctx, 'E o Vovô levou a Maju', W / 2, H - 128, 16, '#fff8d0');
    if (t > 4.6) pTxt(ctx, 'passear pelo céu do Recife.', W / 2, H - 104, 16, '#fff8d0');
    if (t > 6) {
      pTxt(ctx, '✦ FIM ✦', W / 2, H - 64, 20, '#f2c038');
      if (Math.sin(t * 3) > 0) pTxt(ctx, '— toque para voltar ao Recife —', W / 2, H - 36, 11, '#bfe6f2');
    }
  }

  // ============================================================
  //  MUNDO — fundo estático offscreen + camada animada
  // ============================================================
  let _worldBg = null;
  function ensureWorldBg() {
    if (_worldBg) return;
    _worldBg = document.createElement('canvas');
    _worldBg.width = WORLD_W; _worldBg.height = WORLD_H;
    const b = _worldBg.getContext('2d');
    PR(b, 0, 0, WORLD_W, WORLD_H, '#1a6593');
    for (let i = 0; i < 240; i++) {
      const x = (i * 137) % WORLD_W, y = (i * 271) % WORLD_H;
      PR(b, x, y, 10, 2, 'rgba(120,190,225,0.10)');
    }
    for (let d = 0; d < 9; d++) {
      const r = landRect(d);
      const x = r.x, y = r.y, w = r.w, h = r.h;
      PR(b, x, y, w, h, ZONE[d].g);
      PR(b, x, y, w, 5, 'rgba(255,255,255,0.12)');
      PR(b, x, y + h - 5, w, 5, 'rgba(0,0,0,0.14)');
      for (let i = 0; i < 60; i++) {
        const px = x + (i * 97) % w, py = y + (i * 131) % h;
        PR(b, px, py, 3, 3, ZONE[d].g2);
      }
      decorate(b, d, x, y, w, h);
      drawStreets(b, d);
      const cc = districtCenter(d);
      const c = districtCell(d);
      const py = c.y + WX.ch - 30;
      PR(b, cc.x - 86, py - 12, 172, 24, 'rgba(8,14,26,0.78)');
      PR(b, cc.x - 86, py - 12, 172, 3, '#caa15a');
      pTxt(b, `${d + 1}. ${ZONE[d].name}`, cc.x, py, 12, '#fff8d0');
    }
    for (let d = 0; d < 8; d++) drawPath(b, districtCenter(d), districtCenter(d + 1));
  }

  // ---------- malha de ruas do Recife (paralelepípedo + calçada) ----------
  const RW = 24; // largura da rua
  function roadH(b, x, yc, len, wave) {
    const y = yc - RW / 2;
    sidewalkStrip(b, x, y - 6, len, 6, wave);
    sidewalkStrip(b, x, y + RW, len, 6, wave);
    cobble(b, x, y, len, RW);
    for (let i = 0; i * 18 < len; i++) PR(b, x + i * 18 + 5, yc - 1, 9, 2, 'rgba(240,230,180,0.45)');
  }
  function roadV(b, xc, y, len, wave) {
    const x = xc - RW / 2;
    sidewalkStrip(b, x - 6, y, 6, len, wave);
    sidewalkStrip(b, x + RW, y, 6, len, wave);
    cobble(b, x, y, RW, len);
    for (let i = 0; i * 18 < len; i++) PR(b, xc - 1, y + i * 18 + 5, 2, 9, 'rgba(240,230,180,0.45)');
  }
  function praca(b, cx, cy, wave) {
    const r = 22;
    b.save(); b.beginPath(); b.arc(cx, cy, r, 0, Math.PI * 2); b.clip();
    if (wave) calcadaPortuguesa(b, cx - r, cy - r, 2 * r, 2 * r);
    else cobble(b, cx - r, cy - r, 2 * r, 2 * r, '#b4ac98', '#9a9080', '#c2b8a0');
    b.restore();
    b.beginPath(); b.arc(cx, cy, r, 0, Math.PI * 2); b.lineWidth = 3; b.strokeStyle = '#d8cba0'; b.stroke();
  }
  function drawStreets(b, d) {
    const center = districtCenter(d);
    const cols = gridCols(d), rows = gridRows(d);
    const lr = landRect(d);
    const wave = (d === 0 || d === 1); // calçada portuguesa nos cartões-postais
    // avenidas centrais (cruzam o bairro até as bordas, p/ encontrar as pontes)
    roadH(b, lr.x, center.y, lr.w, wave);
    roadV(b, center.x, lr.y, lr.h, wave);
    // ruas da grelha ligando as 9 contas
    for (const ry of rows) roadH(b, cols[0], ry, cols[2] - cols[0], wave);
    for (const cx of cols) roadV(b, cx, rows[0], rows[2] - rows[0], wave);
    // faixa de pedestre nos 4 braços do cruzamento central
    crosswalk(b, center.x - RW / 2, center.y - 40, RW, 12, false);
    crosswalk(b, center.x - RW / 2, center.y + 28, RW, 12, false);
    crosswalk(b, center.x - 40, center.y - RW / 2, 12, RW, true);
    crosswalk(b, center.x + 28, center.y - RW / 2, 12, RW, true);
    // uma pracinha em cada cruzamento (onde fica a conta)
    for (const cx of cols) for (const ry of rows) praca(b, cx, ry, wave);
    // postes e bueiros
    lampPost(b, cols[0] - 30, rows[0] - 28); lampPost(b, cols[2] + 30, rows[2] - 28);
    manhole(b, center.x + 40, center.y); manhole(b, cols[0], rows[2] + 30);
  }

  // ponte de madeira sobre o rio entre dois bairros (a avenida já cobre a terra)
  function drawPath(b, a, c) {
    const mx = (a.x + c.x) / 2, my = (a.y + c.y) / 2;
    const half = 30; // cobre o rio (gutter 24) + as duas margens
    if (a.y === c.y) {
      PR(b, mx - half, my - 16, half * 2, 32, '#7a5230');               // deck
      for (let i = 0; i * 7 < half * 2; i++) PR(b, mx - half + i * 7, my - 16, 2, 32, '#5a3a22');
      PR(b, mx - half, my - 18, half * 2, 3, '#9c7a4c');                // corrimãos
      PR(b, mx - half, my + 15, half * 2, 3, '#9c7a4c');
      lampPost(b, mx - half + 4, my - 16); lampPost(b, mx + half - 4, my - 16);
    } else {
      PR(b, mx - 16, my - half, 32, half * 2, '#7a5230');
      for (let i = 0; i * 7 < half * 2; i++) PR(b, mx - 16, my - half + i * 7, 32, 2, '#5a3a22');
      PR(b, mx - 18, my - half, 3, half * 2, '#9c7a4c');
      PR(b, mx + 15, my - half, 3, half * 2, '#9c7a4c');
      lampPost(b, mx - 16, my - half + 8); lampPost(b, mx + 16, my - half + 8);
    }
  }

  function decorate(b, d, x, y, w, h) {
    switch (d) {
      case 0: {
        const cores = ['#d94f4f', '#e8b94a', '#5b8bd9', '#67b06b'];
        for (let i = 0; i < 4; i++) {
          const hw = 44, hy = y + 56, hx = x + 18 + i * ((w - 40 - hw) / 3);
          PR(b, hx, hy, hw, 60, cores[i]);
          PR(b, hx, hy, hw, 6, '#f5efe0');
          PR(b, hx + 14, hy + 22, 16, 26, '#2a3a4f');
        }
        PR(b, x + w - 52, y + 28, 26, 88, '#f5efe0');
        PR(b, x + w - 48, y + 14, 18, 16, '#caa15a');
        break;
      }
      case 1: {
        PR(b, x, y, w, 42, '#1d6fa3');
        for (let k = 0; k < 6; k++) PR(b, x + 12 + k * 64, y + 18 + (k % 2) * 8, 26, 3, '#bfe6f2');
        PR(b, x, y + 42, w, 8, '#efe0b0');
        coqueiro(b, x + 44, y + 132, 64);
        coqueiro(b, x + w - 46, y + 120, 52);
        break;
      }
      case 2: {
        cloud(b, x + 30, y + 26, 70, '#9aa8b2');
        cloud(b, x + w - 110, y + 40, 84, '#8f9da7');
        for (let i = 0; i < 3; i++) {
          const hx = x + 24 + i * ((w - 80) / 2);
          PR(b, hx, y + 70, 56, 56, '#6a7a86');
          PR(b, hx, y + 70, 56, 5, '#8fa0ac');
        }
        PR(b, x + 30, y + 134, 70, 8, '#7d9fb4');
        PR(b, x + w - 110, y + 128, 90, 8, '#7d9fb4');
        break;
      }
      case 3: {
        const p = { wood: '#5a3f28', woodD: '#3a2818', leaf: '#3a7042', leafD: '#2f5a35', leafL: '#54a25e' };
        mangueTree(b, x + 54, y + 130, 60, p);
        mangueTree(b, x + w / 2, y + 116, 52, p);
        mangueTree(b, x + w - 56, y + 134, 66, p);
        PR(b, x + 24, y + 150, 64, 10, '#3a5a45');
        break;
      }
      case 4: {
        const fc = ['#d94f4f', '#f2c038', '#5b8bd9', '#67b06b', '#c97bb6'];
        PR(b, x + 10, y + 16, w - 20, 2, '#3a2a1a');
        for (let i = 0; i * 24 < w - 20; i++) PR(b, x + 12 + i * 24, y + 18, 12, 10, fc[i % fc.length]);
        for (let j = 0; j < 2; j++) {
          const sx = x + 40 + j * (w - 160);
          PR(b, sx, y + 50, 90, 40, '#8a5a3a');
          for (let s = 0; s < 6; s++) PR(b, sx + s * 15, y + 42, 8, 12, s % 2 ? '#d94f4f' : '#f5efe0');
        }
        break;
      }
      case 5: {
        for (let i = 0; i < 40; i++) PR(b, x + (i * 73) % w, y + (i * 53) % h, 1, 1, 'rgba(255,248,208,0.6)');
        alfaiaDrum(b, x + 44, y + 70, 40, 56);
        alfaiaDrum(b, x + w - 84, y + 84, 44, 60);
        [x + 22, x + w - 26].forEach(tx => {
          PR(b, tx, y + 44, 5, 50, '#4a3320');
          PR(b, tx - 3, y + 32, 11, 14, '#e8762a');
          PR(b, tx - 1, y + 28, 7, 9, '#f2c038');
        });
        break;
      }
      case 6: {
        const cc = ['#d94f4f', '#f2c038', '#5b8bd9', '#67b06b', '#c97bb6'];
        for (let i = 0; i < 44; i++) PR(b, x + (i * 61) % w, y + (i * 97) % h, 4, 4, cc[i % cc.length]);
        sombrinha(b, x + 60, y + 72, 26, 0.3);
        sombrinha(b, x + w / 2, y + 58, 24, 2.0);
        sombrinha(b, x + w - 60, y + 90, 22, 1.1);
        break;
      }
      case 7: {
        const p = { wood: '#3a2818', woodD: '#241a10', leaf: '#2f5a35', leafD: '#244a2a', leafL: '#3f7042' };
        antena(b, x + 52, y + 122, 1.2, '#1a2f26');
        antena(b, x + w - 52, y + 132, 1, '#1a2f26');
        mangueTree(b, x + w / 2, y + 120, 56, p);
        break;
      }
      case 8: {
        PR(b, x, y, w, 60, '#3a6a8a');
        for (let k = 0; k < 6; k++) PR(b, x + 12 + k * 64, y + 26 + (k % 2) * 8, 24, 3, 'rgba(242,224,150,0.5)');
        PR(b, x + w / 2 - 54, y + 50, 108, 22, '#6e4a2c');
        for (let s = 0; s < 7; s++) PR(b, x + w / 2 - 50 + s * 15, y + 50, 2, 22, '#4a3320');
        jangadaSil(b, x + 46, y + 128, 0.8, '#5a3a22');
        jangadaSil(b, x + w - 50, y + 138, 0.7, '#5a3a22');
        break;
      }
    }
  }

  // ---------- desenho de conta-spot e personagens no mundo ----------
  function drawSpot(sp, sx, sy, near, t) {
    const done = isDone(sp.g);
    const bob = Math.sin(t * 2 + sp.g) * 1.6;
    PR(ctx, sx - 8, sy + 10, 16, 4, 'rgba(0,0,0,0.20)');
    PR(ctx, sx - 2, sy - 6, 4, 16, '#6e4a2c');
    const by = sy - 20 + bob;
    if (near) {
      ctx.save();
      ctx.globalAlpha = 0.30 + 0.22 * Math.sin(t * 6);
      drawBead(ctx, sx, by, 20, sp.color, true);
      ctx.restore();
    }
    if (sp.anchor) { PR(ctx, sx + 3, by - 16, 12, 8, '#f2c038'); PR(ctx, sx + 3, by - 16, 2, 14, '#6e4a2c'); }
    drawBead(ctx, sx, by, done ? 9 : 8, sp.color, done);
    pTxt(ctx, done ? '✓' : '?', sx, by, done ? 11 : 12, done ? '#fff' : '#fff8d0');
  }

  function drawNpc(npc, sx, sy, near, t) {
    if (near) {
      ctx.save(); ctx.globalAlpha = 0.25 + 0.2 * Math.sin(t * 6);
      PR(ctx, sx - 24, sy - 30, 48, 56, SPEAKERS[npc.key].color); ctx.restore();
    }
    PR(ctx, sx - 13, sy + 14, 26, 6, 'rgba(0,0,0,0.22)');
    const bob = Math.sin(t * 1.6 + npc.x) * 1.2;
    npc.draw(ctx, sx - 18, sy - (npc.kid ? 40 : 42) + bob, 3);
    pTxt(ctx, SPEAKERS[npc.key].name, sx, sy + 26, 9, '#fff8d0');
  }

  // ---------- colisão: andável = bairros liberados + pontes abertas ----------
  function inRect(x, y, r, m) { return x >= r.x - m && x <= r.x + r.w + m && y >= r.y - m && y <= r.y + r.h + m; }
  function bridgeOpen(d) { return districtUnlocked(d + 1); }
  function onBridge(x, y) {
    for (let d = 0; d < 8; d++) {
      if (!bridgeOpen(d)) continue;
      const a = districtCenter(d), c = districtCenter(d + 1);
      if (a.y === c.y) {
        if (Math.abs(x - (a.x + c.x) / 2) <= 26 && Math.abs(y - a.y) <= 16) return true;
      } else if (Math.abs(y - (a.y + c.y) / 2) <= 26 && Math.abs(x - a.x) <= 16) return true;
    }
    return false;
  }
  function walkable(x, y) {
    for (let d = 0; d < 9; d++) if (districtUnlocked(d) && inRect(x, y, landRect(d), 2)) return true;
    return onBridge(x, y);
  }

  // ---------- joystick + interação ----------
  const JOY = { active: false, baseX: 70, baseY: H - 78, R: 46, kx: 0, ky: 0 };
  const ENTER = { x: W - 152, y: H - 66, w: 142, h: 48 };
  const MUTE = { x: W - 42, y: 12, w: 30, h: 28 };
  const keys = {};

  function updateJoy(x, y) {
    let dx = x - JOY.baseX, dy = y - JOY.baseY;
    const m = Math.hypot(dx, dy);
    if (m > JOY.R) { dx = dx / m * JOY.R; dy = dy / m * JOY.R; }
    JOY.kx = dx; JOY.ky = dy;
  }

  function enterNear() {
    if (S.nearNpc) { AudioFX.ok(); talkNpc(S.nearNpc); return; }
    if (S.near) { AudioFX.ok(); saveMaju(); openLevel(S.near.g); }
  }
  function saveMaju() {
    S.save.maju = { x: Math.round(S.maju.x), y: Math.round(S.maju.y) };
    save();
  }
  function talkNpc(npc) {
    if (npc.ending && doneCount() >= 81) { startEnding(); return; }
    const first = !S.save.met[npc.key];
    S.save.met[npc.key] = true; save();
    let lines;
    if (npc.key === 'vovo') {
      lines = [
        { who: 'vovo', text: `Já são ${doneCount()} de 81 contas, minha neta. Falta pouco pro colar voltar inteiro.` },
        { who: 'maju', text: 'Tô quase lá, vovô! Não vou deixar o sol se pôr antes.' },
      ];
    } else {
      const key = first ? npc.key : npc.key + 'Again';
      // fallback robusto: jona/mica só têm 1ª fala via tutorial (STORY.meet.start);
      // se a chave não existir (ex.: save migrado sem tutorial), nunca passa undefined.
      lines = STORY.meet[key] || STORY.meet[npc.key + 'Again'] || STORY.meet[npc.key] || STORY.meet.start;
    }
    if (!lines?.length) return; // segurança extra: sem falas, não trava a tela
    startDialogue(lines, CHAPTERS[npc.d].scene, () => enterWorld());
  }

  function worldPointerDown(x, y) {
    if (inBox(x, y, MUTE.x, MUTE.y, MUTE.w, MUTE.h)) { AudioFX.toggleMute(); AudioFX.tap(); return; }
    if ((S.near || S.nearNpc) && inBox(x, y, ENTER.x, ENTER.y, ENTER.w, ENTER.h)) { enterNear(); return; }
    if (x < 210 && y > H - 210) { JOY.active = true; updateJoy(x, y); }
  }

  function updateWorld(dt) {
    let vx = 0, vy = 0;
    if (JOY.active) { vx = JOY.kx / JOY.R; vy = JOY.ky / JOY.R; }
    else {
      if (keys.ArrowLeft || keys.a) vx -= 1;
      if (keys.ArrowRight || keys.d) vx += 1;
      if (keys.ArrowUp || keys.w) vy -= 1;
      if (keys.ArrowDown || keys.s) vy += 1;
      const m = Math.hypot(vx, vy);
      if (m > 1) { vx /= m; vy /= m; }
    }
    const SPD = 158;
    const px = S.maju.x, py = S.maju.y;
    const nx = px + vx * SPD * dt, ny = py + vy * SPD * dt;
    if (walkable(nx, S.maju.y)) S.maju.x = nx;
    if (walkable(S.maju.x, ny)) S.maju.y = ny;
    const moved = Math.hypot(S.maju.x - px, S.maju.y - py);
    S.maju.phase += moved * 0.1;   // cadência dos passos ligada à distância andada
    S.maju.moving = Math.hypot(vx, vy) > 0.08 && moved > 0.01;
    if (S.maju.moving) {
      if (Math.abs(vx) > Math.abs(vy)) S.maju.face = vx > 0 ? 'R' : 'L';
      else S.maju.face = vy > 0 ? 'D' : 'U';
    }
    // personagem mais próximo (em bairro liberado)
    let bn = null, bnd = 1e9;
    for (const n of NPCS) {
      if (!districtUnlocked(n.d)) continue;
      const dd = Math.hypot(n.x - S.maju.x, n.y - S.maju.y);
      if (dd < bnd) { bnd = dd; bn = n; }
    }
    S.nearNpc = (bn && bnd < 52) ? bn : null;
    // conta mais próxima (em bairro liberado)
    let bs = null, bsd = 1e9;
    for (const s of SPOTS) {
      if (!districtUnlocked(s.d)) continue;
      const dd = Math.hypot(s.x - S.maju.x, s.y - S.maju.y);
      if (dd < bsd) { bsd = dd; bs = s; }
    }
    S.near = (!S.nearNpc && bs && bsd < 46) ? bs : null;
    if (S.helpT > 0) S.helpT -= dt;
    if (S.toast) { S.toast.t -= dt; if (S.toast.t <= 0) S.toast = null; }
  }

  function drawWorld(t) {
    ensureWorldBg();
    const camX = Math.max(0, Math.min(WORLD_W - W, S.maju.x - W / 2));
    const camY = Math.max(0, Math.min(WORLD_H - H, S.maju.y - H / 2));
    S.cam.x = camX; S.cam.y = camY;
    ctx.drawImage(_worldBg, camX, camY, W, H, 0, 0, W, H);
    drawRiverFoam(camX, camY, t);
    for (const s of SPOTS) {
      if (!districtUnlocked(s.d)) continue;
      const sx = s.x - camX, sy = s.y - camY;
      if (sx < -30 || sx > W + 30 || sy < -40 || sy > H + 40) continue;
      drawSpot(s, sx, sy, S.near === s, t);
    }
    for (const n of NPCS) {
      if (!districtUnlocked(n.d)) continue;
      const sx = n.x - camX, sy = n.y - camY;
      if (sx < -40 || sx > W + 40 || sy < -60 || sy > H + 50) continue;
      drawNpc(n, sx, sy, S.nearNpc === n, t);
    }
    drawMajuWalk(ctx, S.maju.x - camX, S.maju.y - camY, S.maju.face, S.maju.moving, S.maju.phase, t);
    drawFog(camX, camY, t);
    drawWorldHud(t);
  }

  // névoa sobre bairros bloqueados + barreira nas pontes fechadas
  function drawFog(camX, camY, t) {
    for (let d = 0; d < 9; d++) {
      if (districtUnlocked(d)) continue;
      const r = landRect(d);
      const sx = r.x - camX, sy = r.y - camY;
      if (sx > W || sy > H || sx + r.w < 0 || sy + r.h < 0) continue;
      PR(ctx, sx, sy, r.w, r.h, 'rgba(10,14,24,0.82)');
      const cc = districtCenter(d);
      const cx = cc.x - camX, cy = cc.y - camY;
      PR(ctx, cx - 11, cy - 6, 22, 18, '#3a4656'); // cadeado
      PR(ctx, cx - 7, cy - 16, 14, 12, 'rgba(0,0,0,0)');
      PR(ctx, cx - 7, cy - 16, 3, 10, '#3a4656');
      PR(ctx, cx + 4, cy - 16, 3, 10, '#3a4656');
      PR(ctx, cx - 7, cy - 16, 14, 3, '#3a4656');
      pTxt(ctx, 'complete o bairro anterior', cx, cy + 28, 10, '#7a8a98');
    }
    for (let d = 0; d < 8; d++) {
      if (bridgeOpen(d) || !districtUnlocked(d)) continue;
      const a = districtCenter(d), c = districtCenter(d + 1);
      const mx = (a.x + c.x) / 2 - camX, my = (a.y + c.y) / 2 - camY;
      if (mx < -20 || mx > W + 20 || my < -20 || my > H + 20) continue;
      ctx.fillStyle = '#caa15a';
      pTxt(ctx, '⛓', mx, my, 18, '#e8d4b0');
    }
  }

  function drawRiverFoam(camX, camY, t) {
    const cols = [WX.cw, 2 * WX.cw], rows = [WX.ch, 2 * WX.ch];
    for (const rx of cols) {
      const sx = rx - camX;
      if (sx < -14 || sx > W + 14) continue;
      for (let wy = Math.floor(camY / 22) * 22; wy < camY + H; wy += 22) {
        const off = Math.sin(t * 1.6 + wy * 0.06) * 5;
        PR(ctx, sx - 7 + off, wy - camY, 9, 2, 'rgba(191,230,242,0.55)');
      }
    }
    for (const ry of rows) {
      const sy = ry - camY;
      if (sy < -14 || sy > H + 14) continue;
      for (let wx = Math.floor(camX / 22) * 22; wx < camX + W; wx += 22) {
        const off = Math.sin(t * 1.6 + wx * 0.06) * 5;
        PR(ctx, wx - camX, sy - 7 + off, 2, 9, 'rgba(191,230,242,0.55)');
      }
    }
  }

  function drawWorldHud(t) {
    panel(ctx, 10, 8, W - 20, 44, 'rgba(8,14,26,0.9)', '#f2c038');
    pTxt(ctx, 'RECIFE LIVRE', 18, 30, 14, '#f2c038', 'left');
    pTxt(ctx, `♦ ${doneCount()}/81`, W / 2 + 30, 30, 14, '#bfe6f2');
    PR(ctx, MUTE.x, MUTE.y, MUTE.w, MUTE.h, '#1a2a3f');
    pTxt(ctx, AudioFX.muted ? '♪✕' : '♪', MUTE.x + MUTE.w / 2, MUTE.y + 15, 13, AudioFX.muted ? '#5a6b7a' : '#bfe6f2');
    drawMinimap();
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
        btn = S.nearNpc.ending && doneCount() >= 81 ? '★ SUBIR' : '★ FALAR';
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
    // toast de bairro liberado
    if (S.toast) {
      ctx.save(); ctx.globalAlpha = Math.min(1, S.toast.t);
      panel(ctx, 30, 70, W - 60, 32, 'rgba(8,30,18,0.92)', '#67b06b');
      pTxt(ctx, S.toast.text, W / 2, 86, 11, '#bfe6a0');
      ctx.restore();
    }
    if (S.helpT > 0 && !S.toast) {
      ctx.save(); ctx.globalAlpha = Math.min(1, S.helpT);
      pTxt(ctx, 'Arraste no canto p/ andar.', W / 2, H - 150, 12, '#fff8d0');
      pTxt(ctx, 'Chegue numa conta ou pessoa e toque o botão.', W / 2, H - 132, 11, '#fff8d0');
      ctx.restore();
    }
  }

  function drawMinimap() {
    const mw = 82, mh = 120, mx = W - mw - 12, my = 60;
    panel(ctx, mx - 2, my - 2, mw + 4, mh + 4, 'rgba(8,14,26,0.82)', '#3a4a5f');
    const sk = mw / WORLD_W, syk = mh / WORLD_H;
    for (let d = 0; d < 9; d++) {
      const c = districtCell(d);
      const bx = mx + (c.x + WX.gut) * sk, byy = my + (c.y + WX.gut) * syk;
      const bw = (WX.cw - WX.gut * 2) * sk, bh = (WX.ch - WX.gut * 2) * syk;
      PR(ctx, bx, byy, bw, bh, districtUnlocked(d) ? ZONE[d].g : '#20262f');
      if (!districtUnlocked(d)) PR(ctx, bx + bw / 2 - 1, byy + bh / 2 - 1, 3, 3, '#4a5663');
    }
    for (const s of SPOTS) if (isDone(s.g)) PR(ctx, mx + s.x * sk - 1, my + s.y * syk - 1, 2, 2, s.color);
    for (const n of NPCS) if (districtUnlocked(n.d)) PR(ctx, mx + n.x * sk - 1, my + n.y * syk - 1, 3, 3, SPEAKERS[n.key].color);
    PR(ctx, mx + S.maju.x * sk - 2, my + S.maju.y * syk - 2, 4, 4, '#fff');
    PR(ctx, mx + S.maju.x * sk - 2, my + S.maju.y * syk - 2, 4, 1, '#f2c038');
  }

  function enterWorld() {
    S.mode = 'world';
    JOY.active = false; JOY.kx = 0; JOY.ky = 0;
    if (!walkable(S.maju.x, S.maju.y)) { const c = districtCenter(0); S.maju.x = c.x; S.maju.y = c.y + 70; }
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

  function startTutorial() {
    S.save.met.jona = true; S.save.met.mica = true; save();
    startDialogue(STORY.meet.start, CHAPTERS[0].scene, () => enterWorld());
  }
  function handleTap(x, y) {
    switch (S.mode) {
      case 'title':
        AudioFX.ok();
        if (!S.save.opened) {
          S.save.opened = true; save();
          startDialogue(STORY.opening, 7, () => startTutorial());
        } else enterWorld();
        break;
      case 'dialogue': dlgTap(); break;
      case 'puzzle':
        if (inBox(x, y, 10, 8, 60, 40)) { enterWorld(); S.puzzle = null; AudioFX.tap(); return; }
        if (S.puzzle && !S.puzzle.solved) S.puzzle.tap(x, y);
        break;
      case 'bead': if (S.winT > 0.8) { AudioFX.tap(); afterBead(); } break;
      case 'ceu': if (S.winT > 6) { enterWorld(); AudioFX.tap(); } break;
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
      case 'title':
        drawTitle(t);
        break;
      case 'dialogue':
        drawScene(S.sceneN, ctx, t);
        S.dlg.chars += dt * 42;
        {
          const cur = S.dlg.lines[S.dlg.i];
          if (cur.who !== 'maju' && cur.who !== 'nar') S.dlg.right = cur.who;
          const rightFn = (SPEAKERS[S.dlg.right] || SPEAKERS.vovo).body;
          drawSpeaker(rightFn, 250, H - 230, cur.who === S.dlg.right, t, 0);
          drawSpeaker(drawMaju, 70, H - 226, cur.who === 'maju', t, 1.2);
        }
        drawDialogue(t);
        break;
      case 'world':
        updateWorld(dt);
        drawWorld(t);
        break;
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
    completeDistrict: d => { for (let k = 0; k < 9; k++) S.save.done[d * 9 + k + 1] = true; save(); },
    completeAll: () => { for (let g = 1; g <= 81; g++) S.save.done[g] = true; save(); },
  };
})();
