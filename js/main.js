// ============================================================
// Marés do Recife — núcleo do jogo (81 fases / DDD 81)
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

  // ---------- save (v2: prog = fases concluídas, 0..81) ----------
  const SAVE_KEY = 'maresRecife';
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(SAVE_KEY)) || {};
      if (s.v !== 2) return { v: 2, prog: 0, opened: !!s.opened };
      return { v: 2, prog: Math.min(81, s.prog || 0), opened: !!s.opened };
    } catch { return { v: 2, prog: 0, opened: false }; }
  }
  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S.save)); } catch {} }

  // ---------- estado ----------
  const S = {
    mode: 'title',   // title | dialogue | chapters | map | puzzle | bead | fim
    save: load(),
    level: 1,        // fase global 1..81
    cur: null,       // objeto de getLevel()
    chapter: 1,      // capítulo aberto na tela de fases
    puzzle: null,
    dlg: null,
    sceneN: 10,
    winT: 0,
    t: 0,
    fadeT: 0.4,        // fade-in inicial
    _lastMode: null,   // detecção de troca de tela p/ transição
  };
  const TRANS = 0.34;  // duração do fade entre telas (s)

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
  function startDialogue(lines, sceneN, after) {
    S.mode = 'dialogue';
    S.sceneN = sceneN;
    S.dlg = { lines, i: 0, chars: 0, after };
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
    const bx = 10, bw = W - 20, bh = 150, by = H - bh - 10;
    panel(ctx, bx, by, bw, bh, 'rgba(8,14,26,0.92)', isNar ? '#9fb4d0' : '#f2c038');
    let tx = bx + 16, tw = bw - 32;
    if (!isNar) {
      const face = line.who === 'maju' ? MAJU_FACE : VOVO_FACE;
      const pal = line.who === 'maju' ? FACE_PAL : VOVO_FACE_PAL;
      // piscar: a cada ~3.2s os olhos (k) viram pele por um instante
      const blink = (t % 3.2) < 0.12;
      const fpal = blink ? { ...pal, k: pal.f } : pal;
      PR(ctx, bx + 10, by + 12, 64, 64, '#0f1d30');
      drawMap(ctx, face, fpal, bx + 14, by + 16, 4.6);
      pTxt(ctx, line.who === 'maju' ? 'MAJU' : 'VOVÔ CHICO', bx + 42, by + 90, 11, '#f2c038');
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

  // quem fala: balança mais e fica em destaque; o outro recua e escurece
  function drawSpeaker(fn, x, y, active, t, phase) {
    ctx.save();
    const bob = active ? Math.sin(t * 3 + phase) * 2.5 : Math.sin(t * 1.4 + phase) * 1;
    // sombra no chão (fixa, dá apoio ao personagem)
    ctx.globalAlpha = active ? 0.22 : 0.12;
    PR(ctx, x + 6, y + 90, 50, 7, '#000');
    if (active) {
      // leve halo de atenção
      ctx.globalAlpha = 0.18;
      PR(ctx, x + 8, y + 36, 44, 8, '#f2c038');
    }
    ctx.globalAlpha = active ? 1 : 0.5;
    fn(ctx, x, y + bob, 5);
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
    S.chapter = L.c;
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
      if (L.g > S.save.prog) { S.save.prog = L.g; save(); }
      if (L.g === 81) {
        startDialogue(STORY.ending, 10, () => { S.mode = 'fim'; S.winT = 0; });
      } else {
        S.mode = L.k === 9 ? 'chapters' : 'map';
      }
    });
  }

  // ---------- tela de capítulos ----------
  const NODE_POS = [
    [60, 545], [150, 565], [245, 545], [295, 470], [205, 432],
    [110, 448], [62, 372], [150, 330], [245, 345],
  ];
  function chapterState(c) {
    const done = S.save.prog >= c * 9;
    const avail = S.save.prog >= (c - 1) * 9;
    return { done, avail };
  }
  function drawChaptersScreen(t) {
    PR(ctx, 0, 0, W, H, '#e3d6b4');
    for (let i = 0; i < 60; i++) PR(ctx, (i * 83) % W, (i * 47) % H, 3, 3, '#d4c49a');
    ctx.fillStyle = '#7db4d0';
    for (let y = 120; y < H; y += 6) {
      const x = 180 + Math.sin(y * 0.014) * 110 - 35;
      PR(ctx, x, y, 70 + Math.sin(y * 0.05) * 8, 7, '#7db4d0');
    }
    [240, 420].forEach(y => {
      const x = 180 + Math.sin(y * 0.014) * 110 - 45;
      PR(ctx, x, y, 90, 10, '#b08a5a');
      PR(ctx, x, y - 4, 6, 8, '#8a6a3a');
      PR(ctx, x + 84, y - 4, 6, 8, '#8a6a3a');
    });
    panel(ctx, 10, 8, W - 20, 96, 'rgba(8,14,26,0.92)');
    pTxt(ctx, 'MARÉS DO RECIFE', W / 2, 30, 19, '#f2c038');
    pTxt(ctx, `${S.save.prog}/81 contas · 9 cordões`, W / 2, 50, 11, '#9fb4d0', 'center', false);
    PR(ctx, W - 52, 16, 34, 26, '#1a2a3f');
    pTxt(ctx, AudioFX.muted ? '♪✕' : '♪', W - 35, 29, 14, AudioFX.muted ? '#5a6b7a' : '#bfe6f2');
    // cordões (capítulos completos)
    for (let i = 0; i < 9; i++) {
      const a = (i / 8) * Math.PI;
      const x = W / 2 - 116 + i * 29;
      const y = 76 + Math.sin(a) * 10;
      drawBead(ctx, x, y, 7, CHAPTERS[i].color, S.save.prog >= (i + 1) * 9);
    }
    ctx.fillStyle = '#a08a5a';
    for (let i = 0; i < 8; i++) {
      const [x1, y1] = NODE_POS[i], [x2, y2] = NODE_POS[i + 1];
      for (let k = 1; k < 6; k++) {
        PR(ctx, x1 + (x2 - x1) * k / 6 - 2, y1 + (y2 - y1) * k / 6 - 2, 4, 4, '#a08a5a');
      }
    }
    for (let i = 0; i < 9; i++) {
      const [x, y] = NODE_POS[i];
      const c = i + 1;
      const ch = CHAPTERS[i];
      const { done, avail } = chapterState(c);
      const cur = avail && !done;
      const r = 18;
      const base = done ? ch.color : avail ? '#d9a420' : '#7a7468';
      const face = done ? ch.color : avail ? '#ffe98a' : '#9a9080';
      drawNode(ctx, x, y, r, base, face, cur ? 0.5 + 0.5 * Math.sin(t * 4) : 0);
      pTxt(ctx, done ? '✓' : `${c}`, x, y, 17, done ? '#fff' : avail ? '#5a3a10' : '#6a6358');
      pTxt(ctx, ch.short, x, y + r + 12, 10, avail ? '#3a2a10' : '#8a8070');
      if (cur) {
        const f = avail ? Math.min(9, S.save.prog - (c - 1) * 9) : 0;
        pTxt(ctx, `${f}/9`, x, y - r - 10, 10, '#5a3a10');
      }
    }
    pTxt(ctx, S.save.prog >= 81 ? 'Colar completo! Rejogue à vontade.' : 'Toque num cordão para entrar!', W / 2, H - 18, 12, '#5a4a30');
    const curC = Math.min(Math.floor(S.save.prog / 9), 8);
    const pos = NODE_POS[curC];
    const nx = pos[0] < 180 ? pos[0] + 26 : pos[0] - 54;
    drawMaju(ctx, nx, pos[1] - 24, 3.5);
  }
  function chaptersTap(x, y) {
    if (inBox(x, y, W - 56, 12, 42, 34)) { AudioFX.toggleMute(); AudioFX.tap(); return; }
    for (let i = 0; i < 9; i++) {
      const [nx, ny] = NODE_POS[i];
      if (Math.abs(x - nx) < 26 && Math.abs(y - ny) < 26) {
        if (chapterState(i + 1).avail) {
          S.chapter = i + 1;
          S.mode = 'map';
          AudioFX.ok();
        } else AudioFX.bad();
        return;
      }
    }
  }

  // ---------- tela de fases do capítulo ----------
  function faseNodePos(k) { // k 0..8
    return [90 + (k % 3) * 90, 225 + Math.floor(k / 3) * 105];
  }
  function drawMapScreen(t) {
    const ch = CHAPTERS[S.chapter - 1];
    drawScene(ch.scene, ctx, t);
    PR(ctx, 0, 0, W, H, 'rgba(8,14,26,0.45)');
    panel(ctx, 10, 8, W - 20, 86, 'rgba(8,14,26,0.92)', ch.color);
    pTxt(ctx, `Cordão ${S.chapter} — ${ch.title}`, W / 2 + 10, 30, 15, '#fff');
    pTxt(ctx, ch.place, W / 2, 50, 11, '#9fb4d0', 'center', false);
    PR(ctx, 14, 14, 30, 26, '#1a2a3f');
    pTxt(ctx, '‹', 29, 26, 20, '#bfe6f2');
    // contas do cordão
    for (let i = 0; i < 9; i++) {
      const g = (S.chapter - 1) * 9 + i + 1;
      drawBead(ctx, W / 2 - 96 + i * 24, 72, 6, ch.color, g <= S.save.prog);
    }
    let availTitle = null;
    for (let k = 0; k < 9; k++) {
      const g = (S.chapter - 1) * 9 + k + 1;
      const [x, y] = faseNodePos(k);
      const done = g <= S.save.prog;
      const avail = g === S.save.prog + 1;
      const r = 28;
      const base = done ? ch.color : avail ? '#d9a420' : 'rgba(86,82,74,0.85)';
      const face = done ? ch.color : avail ? '#ffe98a' : 'rgba(120,115,105,0.85)';
      drawNode(ctx, x, y, r, base, face, avail ? 0.5 + 0.5 * Math.sin(t * 4) : 0);
      pTxt(ctx, done ? '✓' : `${k + 1}`, x, y - 4, 20, done ? '#fff' : avail ? '#5a3a10' : '#55504a');
      const L = getLevel(g);
      const short = L.title.length > 14 ? L.title.slice(0, 13) + '…' : L.title;
      if (done || avail) pTxt(ctx, short, x, y + r + 11, 9, done ? '#e8dcc0' : '#fff0a0', 'center', false);
      else pTxt(ctx, '?', x, y + r + 11, 10, '#8a8070');
      if (avail) availTitle = L.title;
    }
    pTxt(ctx, availTitle ? `Próxima: ${availTitle}` : 'Cordão completo!', W / 2, H - 70, 12, '#fff8d0');
    pTxt(ctx, availTitle ? 'Toque na fase amarela!' : 'Volte ao mapa dos cordões.', W / 2, H - 50, 11, '#9fb4d0', 'center', false);
  }
  function mapTap(x, y) {
    if (inBox(x, y, 10, 8, 60, 40)) { S.mode = 'chapters'; AudioFX.tap(); return; }
    for (let k = 0; k < 9; k++) {
      const g = (S.chapter - 1) * 9 + k + 1;
      const [nx, ny] = faseNodePos(k);
      if (Math.abs(x - nx) < 34 && Math.abs(y - ny) < 34) {
        if (g <= S.save.prog + 1) { AudioFX.ok(); openLevel(g); }
        else AudioFX.bad();
        return;
      }
    }
  }

  // ---------- título ----------
  function drawTitle(t) {
    drawScene(10, ctx, t);
    jangadaSil(ctx, 180 + Math.sin(t * 0.5) * 8, 480 + Math.sin(t * 1.2) * 3, 1.3, '#1a1020');
    panel(ctx, 24, 150, W - 48, 130, 'rgba(8,14,26,0.85)');
    pTxt(ctx, 'MARÉS', W / 2, 190, 40, '#f2c038');
    pTxt(ctx, 'DO RECIFE', W / 2, 232, 28, '#f2904a');
    pTxt(ctx, 'uma jornada em pixel art', W / 2, 262, 12, '#bfe6f2', 'center', false);
    if (Math.sin(t * 3) > -0.3) pTxt(ctx, '— toque para começar —', W / 2, 560, 15, '#fff8d0');
    pTxt(ctx, '81 fases · história · puzzles · DDD 81', W / 2, 590, 11, '#d8b8a0', 'center', false);
    if (S.save.prog > 0) pTxt(ctx, `progresso salvo: ${S.save.prog}/81 contas`, W / 2, 614, 11, '#9fd8f0', 'center', false);
  }

  // ---------- conta conquistada ----------
  function drawBeadGet(t) {
    drawScene(S.cur.scene, ctx, S.t);
    PR(ctx, 0, 0, W, H, 'rgba(5,8,16,0.72)');
    const L = S.cur;
    const pulse = 26 + Math.sin(t * 4) * 4;
    // halo suave atrás da conta (mesma forma, ampliada e translúcida)
    ctx.save();
    ctx.globalAlpha = 0.16 + Math.sin(t * 4) * 0.05;
    drawBead(ctx, W / 2, 260, pulse * 1.9, L.color, true);
    ctx.restore();
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + t;
      const rad = 70 + Math.sin(t * 3 + i) * 6; // raio pulsante
      PR(ctx, W / 2 + Math.cos(a) * rad - 3, 260 + Math.sin(a) * rad - 3, 6, 6, L.color);
    }
    drawBead(ctx, W / 2, 260, pulse, L.color, true);
    pTxt(ctx, '✦ conta recuperada! ✦', W / 2, 350, 15, '#fff8d0');
    pTxt(ctx, `${L.k}ª conta do ${L.cord}`, W / 2, 380, 18, L.color);
    pTxt(ctx, `${L.g} de 81`, W / 2, 410, 13, '#9fb4d0');
    if (t > 0.8 && Math.sin(t * 4) > 0) pTxt(ctx, '— toque —', W / 2, 470, 13, '#f2c038');
  }

  // ---------- tela final ----------
  function drawFim(t) {
    drawScene(10, ctx, S.t);
    PR(ctx, 0, 0, W, H, 'rgba(10,8,20,0.65)');
    panel(ctx, 16, 96, W - 32, 380, 'rgba(8,14,26,0.92)');
    pTxt(ctx, '✦ COLAR COMPLETO ✦', W / 2, 126, 18, '#f2c038');
    pTxt(ctx, '81 contas, 81 marés', W / 2, 148, 12, '#cdd8e8', 'center', false);
    // 81 contas: 9 fileiras (uma por cordão)
    for (let c = 0; c < 9; c++) {
      for (let k = 0; k < 9; k++) {
        const x = W / 2 - 104 + k * 26;
        const y = 178 + c * 24 + Math.sin(t * 3 + c + k) * 1.5;
        drawBead(ctx, x, y, 6, CHAPTERS[c].color, true);
      }
    }
    pTxt(ctx, 'Sol · Mar · Chuva · Lama · Memória', W / 2, 408, 11, '#cdd8e8', 'center', false);
    pTxt(ctx, 'Tambor · Passo · Antena · Poente', W / 2, 424, 11, '#cdd8e8', 'center', false);
    pTxt(ctx, 'O número do Recife: 81.', W / 2, 446, 13, '#f2c038');
    pTxt(ctx, 'FIM', W / 2, 464, 20, '#fff');
    if (Math.sin(t * 3) > 0) pTxt(ctx, '— toque para voltar ao mapa —', W / 2, 560, 13, '#fff8d0');
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
    if (S.mode === 'puzzle' && S.puzzle && S.puzzle.dragStart) S.puzzle.dragStart(x, y);
  });
  cv.addEventListener('pointermove', e => {
    if (!ptr.down) return;
    const [x, y] = toGame(e);
    ptr.x = x; ptr.y = y;
    if (S.mode === 'puzzle' && S.puzzle && S.puzzle.dragMove) S.puzzle.dragMove(x, y);
  });
  cv.addEventListener('pointerup', e => {
    if (!ptr.down) return;
    ptr.down = false;
    const [x, y] = toGame(e);
    let consumed = false;
    if (S.mode === 'puzzle' && S.puzzle && S.puzzle.dragEnd) {
      consumed = S.puzzle.dragEnd(x, y) === true;
    }
    if (!consumed) handleTap(x, y);
  });
  cv.addEventListener('pointercancel', () => { ptr.down = false; });

  function handleTap(x, y) {
    switch (S.mode) {
      case 'title':
        AudioFX.ok();
        if (!S.save.opened) {
          S.save.opened = true; save();
          startDialogue(STORY.opening, 7, () => { S.mode = 'chapters'; });
        } else S.mode = 'chapters';
        break;
      case 'dialogue': dlgTap(); break;
      case 'chapters': chaptersTap(x, y); break;
      case 'map': mapTap(x, y); break;
      case 'puzzle':
        if (inBox(x, y, 10, 8, 60, 40)) { S.mode = 'map'; S.puzzle = null; AudioFX.tap(); return; }
        if (S.puzzle && !S.puzzle.solved) S.puzzle.tap(x, y);
        break;
      case 'bead': if (S.winT > 0.8) { AudioFX.tap(); afterBead(); } break;
      case 'fim': S.mode = 'chapters'; AudioFX.tap(); break;
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

    // troca de tela → dispara fade-in suave
    if (S.mode !== S._lastMode) { S.fadeT = TRANS; S._lastMode = S.mode; }

    switch (S.mode) {
      case 'title':
        drawTitle(t);
        break;
      case 'dialogue':
        drawScene(S.sceneN, ctx, t);
        S.dlg.chars += dt * 42;
        {
          const who = S.dlg.lines[S.dlg.i].who;
          drawSpeaker(drawVovo, 250, H - 230, who === 'vovo', t, 0);
          drawSpeaker(drawMaju, 70, H - 226, who === 'maju', t, 1.2);
        }
        drawDialogue(t);
        break;
      case 'chapters':
        drawChaptersScreen(t);
        break;
      case 'map':
        drawMapScreen(t);
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
      case 'fim':
        S.winT += dt;
        drawFim(S.winT);
        break;
    }

    // overlay da transição (fade a partir do escuro)
    if (S.fadeT > 0) {
      const a = (S.fadeT / TRANS) ** 1.4; // ease-out
      PR(ctx, 0, 0, W, H, `rgba(9,14,26,${a})`);
      S.fadeT -= dt;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.__game = S; // depuração
  window.__openLevel = openLevel;
})();
