// ============================================================
// world3d.js — Mundo isométrico 3D (motor principal do jogo)
// Mapa 20×20; câmera dinâmica segue a Maju; TW=36 TH=18
// ============================================================

globalThis.World3D = (() => {
  const TW = 36, TH = 18, FH = 18;
  const COLS = 24, ROWS = 24;

  // ---------- câmera dinâmica ----------
  // Valor inicial centrado na posição de start (col=5, row=3) para W=360 H=640
  let camX = 144, camY = 184;
  let lastW = 360, lastH = 640;   // viewport do último draw/update (culling do tubarão)

  function isoBase(col, row) {
    return { x: (col - row) * TW / 2, y: (col + row) * TH / 2 };
  }
  function iso(col, row) {
    const b = isoBase(col, row);
    return { x: b.x + camX, y: b.y + camY };
  }
  function updateCamera(W, H, dt) {
    const b = isoBase(player.col, player.row);
    const tx = W / 2 - b.x;
    const ty = H * 0.40 - b.y;
    const spd = Math.min(1, dt * 8);
    camX += (tx - camX) * spd;
    camY += (ty - camY) * spd;
  }

  // ---------- jogador ----------
  const player = { col: 5.0, row: 3.0, face: 'R', moving: false, phase: 0 };

  // ---------- zonas por distrito (tiles visíveis apenas quando o distrito está desbloqueado) ----------
  const ZONE_BOUNDS = [
    { r1: 3,  c1: 2,  r2: 10, c2: 9  },  // D0: Recife Antigo
    { r1: 3,  c1: 10, r2: 10, c2: 16 },  // D1: Beira-Mar
    { r1: 3,  c1: 17, r2: 10, c2: 22 },  // D2: Dias de Chuva
    { r1: 11, c1: 2,  r2: 16, c2: 9  },  // D3: Manguezal
    { r1: 11, c1: 10, r2: 16, c2: 16 },  // D4: Mercado S. José
    { r1: 11, c1: 17, r2: 16, c2: 22 },  // D5: Pátio do Terço
    { r1: 17, c1: 2,  r2: 22, c2: 9  },  // D6: Rua da Moeda
    { r1: 17, c1: 10, r2: 22, c2: 16 },  // D7: Beira do Mangue
    { r1: 17, c1: 17, r2: 22, c2: 22 },  // D8: Cais — Maré 81
  ];

  function tileVisible(col, row, districtUnlockedFn) {
    if (col <= 1) return true;  // borda oeste (mangue/oceano) sempre visível
    const ci = Math.floor(col), ri = Math.floor(row);
    // o MAR fura a névoa: oceano é cenário geográfico (sem concha/NPC/lição), então
    // aparece mesmo fora de zona desbloqueada. A TERRA travada segue oculta.
    if (MAP[ri] && MAP[ri][ci] === '~') return true;
    for (let d = 0; d < ZONE_BOUNDS.length; d++) {
      const z = ZONE_BOUNDS[d];
      if (ri >= z.r1 && ri <= z.r2 && ci >= z.c1 && ci <= z.c2) {
        if (districtUnlockedFn(d)) return true;
      }
    }
    return false;
  }

  function walkable(col, row, districtUnlockedFn) {
    const ci = Math.floor(col), ri = Math.floor(row);
    if (ci < 0 || ci >= COLS || ri < 0 || ri >= ROWS) return false;
    if (districtUnlockedFn && !tileVisible(ci, ri, districtUnlockedFn)) return false;
    const t = MAP[ri][ci];
    return t === 'g' || t === 'r' || t === '.';
  }

  function movePlayer(vx, vy, dt, districtUnlockedFn) {
    const isMoving = Math.hypot(vx, vy) > 0.05;
    player.moving = isMoving;
    if (!isMoving) return;
    const speed = 3.2;
    const dc =  (vx + vy) * speed * dt;
    const dr = (-vx + vy) * speed * dt;
    const prev = { col: player.col, row: player.row };
    if (walkable(player.col + dc, player.row, districtUnlockedFn)) player.col += dc;
    if (walkable(player.col, player.row + dr, districtUnlockedFn)) player.row += dr;
    player.phase += Math.hypot(player.col - prev.col, player.row - prev.row) * 10;
    if (vx > 0.1) player.face = 'R'; else if (vx < -0.1) player.face = 'L';
  }

  // ---------- mapa 24×24 ----------
  // ~=oceano  w=rio  .=praia  g=terra  r=rua  m=mangue  a=arrecife  1-6=prédio
  // 3 colunas × 3 bandas de distritos; mar ao norte e no SE (Cais), mangue a oeste.
  const MAP = [
  // col: 0    1    2    3    4    5    6    7    8    9   10   11   12   13   14   15   16   17   18   19   20   21   22   23
  /* 0*/['~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~'],
  /* 1*/['~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~'],
  /* 2*/['~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~'],
  /* 3*/['m', 'm', 'r', 'g', 'g', 'g', 'g', 'g', 'g', 'r', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '~'],
  /* 4*/['m', 'm', 'r', '2', 'g', 'g', '1', 'g', 'g', 'r', 'g', 'g', '3', 'g', 'g', 'g', 'r', '3', 'g', 'g', 'g', '4', 'g', '~'],
  /* 5*/['m', 'm', 'r', 'g', 'g', 'g', 'g', 'g', '2', 'r', '4', 'g', 'g', 'g', 'g', '5', 'r', 'g', 'g', 'g', 'g', 'g', 'g', '~'],
  /* 6*/['m', 'm', 'r', 'g', 'g', 'g', 'g', 'g', 'g', 'r', 'g', 'g', 'g', 'g', 'g', 'g', 'r', 'g', 'g', 'g', 'g', 'g', 'g', '~'],
  /* 7*/['m', 'm', 'r', 'g', 'g', 'g', 'g', 'g', 'g', 'r', 'g', 'g', 'g', 'g', 'g', 'g', 'r', 'g', 'g', 'g', 'g', 'g', 'g', '~'],
  /* 8*/['m', 'm', 'r', 'g', 'g', 'g', 'g', 'g', 'g', 'r', 'g', 'g', 'g', 'g', 'g', 'g', 'r', 'g', 'g', 'g', 'g', 'g', 'g', '~'],
  /* 9*/['m', 'm', 'r', '1', 'g', 'g', '2', 'g', 'g', 'r', 'g', '4', 'g', 'g', 'g', '3', 'r', 'g', '3', 'g', 'g', '4', 'g', '~'],
  /*10*/['m', 'm', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', '~'],
  /*11*/['m', 'm', 'r', 'm', 'g', 'g', 'g', 'g', 'g', 'r', 'g', 'g', 'g', 'g', 'g', 'g', 'r', 'g', 'g', 'g', 'g', 'g', 'g', '~'],
  /*12*/['m', 'm', 'r', 'm', 'm', 'g', 'g', 'g', 'm', 'r', 'g', '2', 'g', 'g', 'g', '2', 'r', '3', 'g', 'g', 'g', '3', 'g', '~'],
  /*13*/['m', 'm', 'r', 'm', 'w', 'g', 'g', 'g', 'g', 'r', 'g', 'g', 'g', 'g', 'g', 'g', 'r', 'g', 'g', 'g', 'g', 'g', 'g', '~'],
  /*14*/['m', 'm', 'r', 'g', 'w', 'w', 'g', 'g', 'm', 'r', 'g', 'g', 'g', 'g', 'g', 'g', 'r', 'g', 'g', 'g', 'g', 'g', 'g', '~'],
  /*15*/['m', 'm', 'r', 'm', 'm', 'w', 'g', 'g', 'g', 'r', 'g', 'g', '2', 'g', 'g', 'g', 'r', 'g', '2', 'g', 'g', 'g', 'g', '~'],
  /*16*/['m', 'm', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', '.', '~'],
  /*17*/['m', 'm', 'r', '1', 'g', 'g', 'g', 'g', 'g', 'r', 'g', '2', 'g', 'g', 'g', 'g', 'r', 'g', 'g', 'g', 'g', '.', '.', '~'],
  /*18*/['m', 'm', 'r', 'g', 'g', 'g', 'g', 'g', '2', 'r', 'g', 'g', 'g', 'g', 'g', '2', 'r', 'g', 'g', 'g', '.', '.', '~', '~'],
  /*19*/['m', 'm', 'r', 'g', 'g', 'g', 'g', 'g', 'g', 'r', 'g', 'g', 'g', 'g', 'g', 'g', 'r', 'g', 'g', '.', '.', '~', '~', '~'],
  /*20*/['m', 'm', 'r', 'g', 'g', 'g', 'g', 'g', 'g', 'r', 'g', 'g', 'g', 'g', 'g', 'g', 'r', 'g', '.', '.', '~', '~', '~', '~'],
  /*21*/['m', 'm', 'r', 'g', 'g', 'g', 'g', 'g', 'g', 'r', 'g', 'g', 'g', 'g', 'g', 'g', 'r', '.', '.', '~', '~', '~', '~', '~'],
  /*22*/['m', 'm', 'r', 'g', 'g', 'g', 'g', 'g', 'g', 'r', 'g', 'g', 'g', 'g', 'g', 'g', '.', '.', '~', '~', '~', '~', '~', '~'],
  /*23*/['m', 'm', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~'],
  ];

  // ---------- portais de bairro ----------
  const DISTRICT_SPOTS = [
    { d: 0, col: 7,  row: 7,  name: 'Recife Antigo',   color: '#f2c038' },
    { d: 1, col: 13, row: 7,  name: 'Beira-Mar',       color: '#1d9fd0' },
    { d: 2, col: 19, row: 7,  name: 'Dias de Chuva',   color: '#7d9fb4' },
    { d: 3, col: 7,  row: 13, name: 'Manguezal',       color: '#8a5a3a' },
    { d: 4, col: 13, row: 13, name: 'Mercado S. José', color: '#d48020' },
    { d: 5, col: 19, row: 14, name: 'Pátio do Terço',  color: '#b040b0' },
    { d: 6, col: 7,  row: 20, name: 'Rua da Moeda',    color: '#c0a020' },
    { d: 7, col: 13, row: 20, name: 'Beira do Mangue', color: '#4a8a50' },
    { d: 8, col: 18, row: 17, name: 'Cais — Maré 81',  color: '#a07898' },
  ];

  // ---------- personagens no mundo ----------
  // Derivados do registro único (ADR-005, js/characters.js): col/row/label são o por-view
  // do passeio; cor e label caem no canônico quando não divergem.
  const WORLD_NPCS = Characters.worldNpcs();

  // ---------- nós de fase (estilo Super Mario: cada concha é um ponto no mapa) ----------
  // Gerados dos tiles caminháveis de cada zona: espalhados (farthest-point) e longe
  // dos NPCs (pra não bloquear o ENTRAR). Determinístico — layout estável entre sessões.
  const PHASE_NODES = (() => {
    const npcNear = (c, r) => WORLD_NPCS.some(n => Math.abs(c - n.col) < 1.3 && Math.abs(r - n.row) < 1.3);
    const used = new Set();
    const out = [];
    for (let d = 0; d < DISTRICT_SIZES.length; d++) {
      const N = DISTRICT_SIZES[d], z = ZONE_BOUNDS[d];
      const tiles = [];
      for (let r = z.r1; r <= z.r2; r++) for (let c = z.c1; c <= z.c2; c++) {
        const t = MAP[r] && MAP[r][c];
        if ((t === 'g' || t === '.') && !used.has(c + ',' + r)) tiles.push({ col: c, row: r });
      }
      let free = tiles.filter(p => !npcNear(p.col, p.row));
      if (free.length < N) free = tiles;                 // relaxa NPC se faltar chão
      if (free.length === 0) continue;                   // zona sem chão (não deve ocorrer)
      const sp = DISTRICT_SPOTS[d];
      free.sort((a, b) => (Math.abs(a.col - sp.col) + Math.abs(a.row - sp.row)) - (Math.abs(b.col - sp.col) + Math.abs(b.row - sp.row)));
      const pick = [free[0]];
      while (pick.length < N && pick.length < free.length) {
        let best = null, bestDist = -1;
        for (const p of free) {
          if (pick.some(q => q.col === p.col && q.row === p.row)) continue;
          let md = Infinity;
          for (const q of pick) { const dd = Math.hypot(p.col - q.col, p.row - q.row); if (dd < md) md = dd; }
          if (md > bestDist) { bestDist = md; best = p; }
        }
        if (!best) break;
        pick.push(best);
      }
      for (let i = 0; i < N; i++) {
        const p = pick[i] || pick[pick.length - 1];
        used.add(p.col + ',' + p.row);
        out.push({ g: DISTRICT_STARTS[d] + i, d, col: p.col, row: p.row });
      }
    }
    return out;
  })();

  // ---------- arte: random determinístico ----------
  function rnd(a, b) {
    const x = Math.sin(a * 127.1 + b * 311.7 + 1.0) * 43758.5453;
    return x - Math.floor(x);
  }

  function buildColors(col, row) {
    const isBoaViagem = col >= 10;  // histórico (D0, cols 2-9) × moderno (Beira-Mar+, cols 10+)
    const idx = (col * 7 + row * 13) % 6;
    const hist = [
      { top: '#d4a870', left: '#7a4a1a', right: '#b07840' },
      { top: '#e8d86a', left: '#887010', right: '#caa030' },
      { top: '#e0a07a', left: '#904828', right: '#c07850' },
      { top: '#8ab0d0', left: '#3a6898', right: '#5a88b8' },
      { top: '#a8d880', left: '#487830', right: '#78b050' },
      { top: '#e09898', left: '#903838', right: '#c06060' },
    ];
    const mod = [
      { top: '#7ab8e8', left: '#2a5888', right: '#4a80c0' },
      { top: '#90c8e0', left: '#306888', right: '#5090b0' },
      { top: '#b0d0e8', left: '#4878a0', right: '#68a0c8' },
      { top: '#7898c8', left: '#284878', right: '#4870b0' },
      { top: '#a0bcd8', left: '#385888', right: '#5880b0' },
      { top: '#c8d8f0', left: '#4870a0', right: '#6898c8' },
    ];
    return isBoaViagem ? mod[idx] : hist[idx];
  }

  function diamond(ctx, x, y, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x,           y          );
    ctx.lineTo(x + TW / 2,  y + TH / 2);
    ctx.lineTo(x,           y + TH     );
    ctx.lineTo(x - TW / 2,  y + TH / 2);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }

  function drawWindows(ctx, x, y, floors, col, row) {
    for (let f = 0; f < floors; f++) {
      const floorBase = y + TH - (f + 1) * FH;
      for (let wc = 0; wc < 2; wc++) {
        const lit = rnd(col * 3 + f, row * 5 + wc) > 0.38;
        const t = (wc + 0.6) / 2.5;
        const wx = x + t * TW / 2 - 2;
        const wy = floorBase + t * TH / 4 + 3;
        ctx.fillStyle = lit ? 'rgba(255,238,160,0.75)' : 'rgba(20,40,80,0.45)';
        ctx.fillRect(wx, wy, 4, Math.floor(FH * 0.45));
      }
      const lit2 = rnd(col * 9 + f + 1, row * 7 + 20) > 0.45;
      ctx.fillStyle = lit2 ? 'rgba(200,220,255,0.55)' : 'rgba(10,20,50,0.35)';
      ctx.fillRect(x - TW / 4 - 2, floorBase - TH / 8 + 3, 4, Math.floor(FH * 0.45));
    }
  }

  function building(ctx, x, y, floors, col, row) {
    const h = floors * FH;
    const c = buildColors(col, row);
    ctx.beginPath();
    ctx.moveTo(x - TW / 2, y + TH / 2);
    ctx.lineTo(x,           y + TH    );
    ctx.lineTo(x,           y + TH - h);
    ctx.lineTo(x - TW / 2,  y + TH / 2 - h);
    ctx.closePath();
    ctx.fillStyle = c.left; ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x,           y + TH        );
    ctx.lineTo(x + TW / 2,  y + TH / 2    );
    ctx.lineTo(x + TW / 2,  y + TH / 2 - h);
    ctx.lineTo(x,           y + TH - h    );
    ctx.closePath();
    ctx.fillStyle = c.right; ctx.fill();
    diamond(ctx, x, y - h, c.top, null);
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(x,           y - h          );
    ctx.lineTo(x + TW / 2,  y - h + TH / 2);
    ctx.lineTo(x,           y - h + TH     );
    ctx.lineTo(x - TW / 2,  y - h + TH / 2);
    ctx.closePath();
    ctx.stroke();
    drawWindows(ctx, x, y, floors, col, row);
  }

  function mangrove(ctx, x, y, t) {
    const sway = Math.sin(t * 0.7 + x * 0.05) * 2;
    ctx.strokeStyle = '#3a2410'; ctx.lineWidth = 1.0;
    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(x + sway * 0.3, y + TH / 2);
      ctx.lineTo(x + Math.cos(ang) * 7 + sway * 0.2, y + TH / 2 + 7);
      ctx.stroke();
    }
    ctx.strokeStyle = '#241808'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + sway * 0.5, y + TH / 2);
    ctx.lineTo(x + sway,       y - 15     );
    ctx.stroke();
    [[0, -15, 10, '#1a5520'], [-5, -11, 7, '#244a1a'], [5, -11, 7, '#2a7030']].forEach(([dx, dy, r, col]) => {
      ctx.beginPath();
      ctx.arc(x + dx + sway, y + dy, r, 0, Math.PI * 2);
      ctx.fillStyle = col; ctx.fill();
    });
  }

  function water(ctx, x, y, t, ocean) {
    diamond(ctx, x, y, ocean ? '#0b2548' : '#14406a', null);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x,           y         );
    ctx.lineTo(x + TW / 2,  y + TH / 2);
    ctx.lineTo(x,           y + TH    );
    ctx.lineTo(x - TW / 2,  y + TH / 2);
    ctx.closePath();
    ctx.clip();
    const phase = (t * 28 + x * 0.3) % TW;
    ctx.strokeStyle = ocean ? 'rgba(70,150,255,0.18)' : 'rgba(50,130,220,0.22)';
    ctx.lineWidth = 1.5;
    for (let i = -1; i <= 2; i++) {
      const lx = x - TW / 2 + ((phase + i * TW / 2.5) % TW);
      ctx.beginPath();
      ctx.moveTo(lx - 4, y + TH / 2 - 1);
      ctx.quadraticCurveTo(lx, y + TH / 2 - 3, lx + 4, y + TH / 2 - 1);
      ctx.stroke();
    }
    ctx.restore();
  }

  function reef(ctx, x, y) {
    diamond(ctx, x, y, '#7aaa98', '#4a8a78');
    ctx.fillStyle = '#e87a60';
    ctx.beginPath(); ctx.arc(x - 4, y + TH / 2, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#60d8a8';
    ctx.beginPath(); ctx.arc(x + 6, y + TH / 2 - 2, 2.0, 0, Math.PI * 2); ctx.fill();
  }

  // ---------- céu e ambiente ----------
  const HORIZON = 0.52;   // fração da altura onde o céu encontra o mar
  const SUN_X = 290, SUN_Y = 95;

  function drawSky(ctx, W, H) {
    const hz = H * HORIZON;
    const g = ctx.createLinearGradient(0, 0, 0, hz);
    g.addColorStop(0,    '#0a1e4a');
    g.addColorStop(0.34, '#21417f');
    g.addColorStop(0.60, '#4274b4');
    g.addColorStop(0.78, '#e8964c');
    g.addColorStop(0.90, '#ef7a2e');
    g.addColorStop(1,    '#f06a22');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, hz);
  }

  function drawSun(ctx) {
    const sx = SUN_X, sy = SUN_Y;
    const halo = ctx.createRadialGradient(sx, sy, 14, sx, sy, 55);
    halo.addColorStop(0, 'rgba(255,200,80,0.38)');
    halo.addColorStop(1, 'rgba(255,100,20,0)');
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(sx, sy, 55, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(sx, sy, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd040'; ctx.fill();
  }

  function drawClouds(ctx, t) {
    ctx.save(); ctx.globalAlpha = 0.55; ctx.fillStyle = '#ffe8d0';
    [{bx:60,y:45,sx:55,spd:8},{bx:200,y:30,sx:70,spd:5},{bx:310,y:58,sx:45,spd:11},{bx:140,y:68,sx:40,spd:7}].forEach(c => {
      const cx = ((c.bx + t * c.spd) % 420) - 30;
      ctx.beginPath();
      ctx.arc(cx,               c.y,     c.sx * 0.28, 0, Math.PI * 2);
      ctx.arc(cx + c.sx * 0.22, c.y - 6, c.sx * 0.32, 0, Math.PI * 2);
      ctx.arc(cx + c.sx * 0.50, c.y,     c.sx * 0.22, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function drawBirds(ctx, t) {
    ctx.save(); ctx.strokeStyle = '#0a1838'; ctx.lineWidth = 1.2;
    [{bx:80,y:85,ph:0},{bx:195,y:68,ph:1.8},{bx:265,y:92,ph:0.9}].forEach(b => {
      const cx = ((b.bx + t * 22) % 430) - 20;
      const cy = b.y + Math.sin(t * 2.2 + b.ph) * 6;
      const flap = Math.sin(t * 5 + b.ph) * 5;
      ctx.beginPath();
      ctx.moveTo(cx - 7, cy + flap); ctx.lineTo(cx, cy); ctx.lineTo(cx + 7, cy + flap);
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawSeaBg(ctx, W, H, t) {
    const hz = H * HORIZON;
    // água: mais clara perto do horizonte (espelha o céu), escurece ao fundo
    const g = ctx.createLinearGradient(0, hz, 0, H);
    g.addColorStop(0,    '#16466f');
    g.addColorStop(0.16, '#0d2d5a');
    g.addColorStop(1,    '#061322');
    ctx.fillStyle = g;
    ctx.fillRect(0, hz, W, H - hz);

    // brilho quente do poente derramado na água logo abaixo do horizonte
    const warm = ctx.createLinearGradient(0, hz, 0, hz + 72);
    warm.addColorStop(0, 'rgba(240,120,40,0.30)');
    warm.addColorStop(1, 'rgba(240,120,40,0)');
    ctx.fillStyle = warm; ctx.fillRect(0, hz, W, 72);

    // coluna de reflexo do sol (cone que alarga com a distância)
    const refl = ctx.createLinearGradient(0, hz, 0, hz + 130);
    refl.addColorStop(0, 'rgba(255,202,96,0.40)');
    refl.addColorStop(1, 'rgba(255,168,56,0)');
    ctx.fillStyle = refl;
    ctx.beginPath();
    ctx.moveTo(SUN_X - 9,  hz);
    ctx.lineTo(SUN_X + 9,  hz);
    ctx.lineTo(SUN_X + 36, hz + 130);
    ctx.lineTo(SUN_X - 36, hz + 130);
    ctx.closePath();
    ctx.fill();

    // glints horizontais que cintilam descendo o reflexo
    ctx.fillStyle = 'rgba(255,224,150,0.45)';
    for (let i = 0; i < 5; i++) {
      const p = (i + 0.5) / 5;
      const gy = hz + 8 + p * 110;
      const gw = 6 + p * 26 + Math.sin(t * 2.4 + i * 1.7) * 4;
      ctx.fillRect(SUN_X - gw / 2, gy, gw, 1.4);
    }

    // linha do horizonte: fininha e luminosa
    const hl = ctx.createLinearGradient(0, hz - 2, 0, hz + 2);
    hl.addColorStop(0,   'rgba(255,222,160,0)');
    hl.addColorStop(0.5, 'rgba(255,228,176,0.6)');
    hl.addColorStop(1,   'rgba(255,222,160,0)');
    ctx.fillStyle = hl; ctx.fillRect(0, hz - 2, W, 4);
  }

  // ---------- sprite da Maju (usa drawMajuWalk de sprites.js, reduzida para s≈2) ----------
  function drawPlayer(ctx, t) {
    const { x, y } = iso(player.col, player.row);
    const cy = y + TH / 2;
    ctx.save();
    ctx.translate(x, cy);
    ctx.scale(0.67, 0.67);   // drawMajuWalk usa s=3; 3×0.67≈2 — igual aos NPCs
    ctx.translate(-x, -cy);
    drawMajuWalk(ctx, x, cy, player.face, player.moving, player.phase, t);
    ctx.restore();
  }

  // ---------- lookup de sprites dos NPCs (funções globais de sprites.js) ----------
  const NPC_DRAW = Characters.npcDraw();

  // ---------- nó de fase (concha coletável no mapa, estilo Mario) ----------
  function drawNode(ctx, t, node, done) {
    const { x, y } = iso(node.col, node.row);
    const cy = y + TH / 2;
    const sp = DISTRICT_SPOTS[node.d];
    const color = sp?.color || '#f2c038';

    if (done) {
      // concha já coletada: marcador discreto com check verde
      ctx.save(); ctx.globalAlpha = 0.55;
      ctx.fillStyle = '#88ee88';
      ctx.beginPath(); ctx.arc(x, cy - 8, 4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#44cc44'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(x, cy - 8, 7.5, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      return;
    }

    const pulse = Math.sin(t * 3 + node.g) * 0.3 + 0.7;
    const rise = Math.sin(t * 2.5 + node.g * 1.1) * 3;
    // halo no chão
    ctx.save(); ctx.globalAlpha = 0.28 * pulse;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, cy - 5, 13, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // poste até a concha flutuante
    ctx.strokeStyle = color; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(x, cy - 6 + rise); ctx.lineTo(x, cy); ctx.stroke();
    const by = cy - 26 + rise;
    ctx.save(); ctx.globalAlpha = 0.5 * pulse;
    ctx.fillStyle = '#ffe8a8';
    ctx.beginPath(); ctx.arc(x, by, 11, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    drawBead(ctx, x, by, 6, color, true);
  }

  // ---------- igreja como PRÉDIO (âncora de base no tile, cresce pra cima) ----------
  // Não usa o quadro fixo de NPC (36px) — por isso a igreja não afunda mais. A porta
  // (base de drawIgrejaMarias, em y+38*s) é ancorada na linha do chão do tile. Ver spec 006.
  function drawChurchBuilding(ctx, npc, x, y) {
    const s = 2;
    const groundY = y + TH / 2;          // linha do chão (mesma dos pés dos NPCs)
    const W = Math.round(22 * s);        // largura do corpo em drawIgrejaMarias
    ctx.save(); ctx.globalAlpha = 0.20;  // sombra no chão
    PR(ctx, x - W / 2, groundY - 1, W, 6, '#000');
    ctx.restore();
    drawIgrejaMarias(ctx, Math.round(x - W / 2), Math.round(groundY - 38 * s), s);
    // label "IGREJA" acima da torre
    const topY = Math.round(groundY - 38 * s - 27 * s);
    const lw = npc.label.length * 4.5 + 6;
    ctx.fillStyle = 'rgba(8,14,26,0.8)';
    ctx.fillRect(x - lw / 2, topY - 12, lw, 11);
    ctx.fillStyle = npc.color;
    ctx.font = 'bold 7px "Courier New", monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(npc.label, x, topY - 7);
  }

  // ---------- NPC no mundo (sprites reais de sprites.js) ----------
  function drawNpc(ctx, t, npc) {
    const { x, y } = iso(npc.col, npc.row);
    if (npc.key === 'asMarias') { drawChurchBuilding(ctx, npc, x, y); return; }
    const bob = Math.sin(t * 2.5 + npc.col * 0.8) * 1.2;
    const s = 2;
    const sw = 12 * s, sh = 18 * s;  // 24×36 px
    const fx = x - sw / 2;
    const fy = Math.round(y + TH / 2 - sh + bob);
    // sombra
    ctx.save(); ctx.globalAlpha = 0.18;
    PR(ctx, x - sw / 2, y + TH / 2, sw, 5, '#000');
    ctx.restore();
    // sprite do personagem
    const drawFn = NPC_DRAW[npc.key];
    if (drawFn) {
      drawFn(ctx, fx, fy, s);
    } else {
      ctx.fillStyle = npc.color;
      ctx.beginPath(); ctx.arc(x, y + TH / 2 - 8 + bob, 7, 0, Math.PI * 2); ctx.fill();
    }
    // label com fundo
    const lw = npc.label.length * 4.5 + 6;
    ctx.fillStyle = 'rgba(8,14,26,0.8)';
    ctx.fillRect(x - lw / 2, fy - 12, lw, 11);
    ctx.fillStyle = npc.color;
    ctx.font = 'bold 7px "Courier New", monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(npc.label, x, fy - 7);
  }

  // ---------- coqueiros (cenário da orla; props decorativos, não bloqueiam o passo) ----------
  // Plantados em tiles de areia: orla norte (Beira-Mar / Dias de Chuva, de frente pro mar
  // ao fundo) e costa SE (litoral do Cais, perto da igreja). Reusa o sprite coqueiro()
  // de sprites.js, reduzido pra escala do mundo iso.
  const COQUEIROS = [
    { col: 11, row: 3,  d: 1 }, { col: 13, row: 3,  d: 1 }, { col: 16, row: 3,  d: 1 },
    { col: 20, row: 3,  d: 2 }, { col: 22, row: 3,  d: 2 },
    { col: 16, row: 22, d: 7 }, { col: 18, row: 20, d: 8 }, { col: 19, row: 19, d: 8 },
  ];
  function drawCoqueiro(ctx, col, row) {
    const { x, y } = iso(col, row);
    const baseY = y + TH / 2 + 1;
    ctx.save(); ctx.globalAlpha = 0.16; PR(ctx, x - 7, baseY, 14, 4, '#000'); ctx.restore(); // sombra
    ctx.save();
    ctx.translate(x, baseY);
    ctx.scale(0.5, 0.5);             // coqueiro() desenha ~64px; reduz pra ~32px de tronco + copa
    ctx.translate(-x, -baseY);
    coqueiro(ctx, x - 4, baseY, 64);
    ctx.restore();
  }

  // ---------- Marco Zero: praça pavimentada + rosa dos ventos no chão (Recife Antigo, d0) ----------
  // Marca a área central de Recife Antigo. Os tiles da praça são pavimentados (calçadão), mas
  // continuam 'g' no MAP → caminháveis e SEM mexer em PHASE_NODES. A rosa é um decal de chão
  // CACHEADO (gerado uma vez) e projetado no plano iso 2:1. Ver spec 006.
  const MARCO_ZERO = { col: 6, row: 7, r: 38, raio: 2 };
  function isMarcoZeroPlaza(col, row) {
    return Math.abs(col - MARCO_ZERO.col) + Math.abs(row - MARCO_ZERO.row) <= MARCO_ZERO.raio;
  }
  let _rosaCache = null;
  function rosaDecal() {
    if (_rosaCache) return _rosaCache;
    const sz = Math.ceil(MARCO_ZERO.r * 2) + 6;
    const cv = document.createElement('canvas');
    cv.width = sz; cv.height = sz;
    drawRosaDosVentos(cv.getContext('2d'), sz / 2, sz / 2, MARCO_ZERO.r);
    _rosaCache = cv;
    return _rosaCache;
  }
  // Desenha a FATIA da rosa que cai NESTE tile (recorta ao losango), projetada no chão iso 2:1.
  // Cada tile da praça desenha sua fatia na PRÓPRIA profundidade → a rosa fica completa (nenhum
  // tile da frente pinta por cima) e objetos (NPCs/Maju) sempre ficam por cima. Ver spec 006.
  function drawRosaSliceOnTile(ctx, col, row) {
    const t = iso(col, row);
    const c = iso(MARCO_ZERO.col, MARCO_ZERO.row);
    const img = rosaDecal();
    ctx.save();
    ctx.beginPath();                       // clip ao losango do tile (em coords de tela)
    ctx.moveTo(t.x, t.y);
    ctx.lineTo(t.x + TW / 2, t.y + TH / 2);
    ctx.lineTo(t.x, t.y + TH);
    ctx.lineTo(t.x - TW / 2, t.y + TH / 2);
    ctx.closePath();
    ctx.clip();
    ctx.translate(c.x, c.y + TH / 2);      // centro da rosa = centro da praça
    ctx.scale(1, 0.5);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();
  }

  // ---------- render principal ----------
  function draw(ctx, W, H, t, districtUnlockedFn, isDoneFn) {
    lastW = W; lastH = H;
    drawSky(ctx, W, H);
    drawSun(ctx);
    drawClouds(ctx, t);
    drawBirds(ctx, t);
    drawSeaBg(ctx, W, H, t);

    // ordena tudo por profundidade isométrica (col+row crescente = mais perto)
    const queue = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const { x, y } = iso(col, row);
        if (x + TW * 2 < 0 || x - TW * 2 > W || y + FH * 7 < 0 || y - TH > H) continue;
        if (!tileVisible(col, row, districtUnlockedFn)) continue;
        queue.push({ kind: 'tile', col, row, depth: col + row });
      }
    }
    for (const node of PHASE_NODES) {
      if (!districtUnlockedFn(node.d)) continue;
      queue.push({ kind: 'node', node, depth: node.col + node.row + 0.4, done: isDoneFn ? isDoneFn(node.g) : false });
    }
    for (const cq of COQUEIROS) {
      if (!districtUnlockedFn(cq.d)) continue;
      queue.push({ kind: 'coqueiro', col: cq.col, row: cq.row, depth: cq.col + cq.row + 0.45 });
    }
    for (const npc of WORLD_NPCS) {
      queue.push({ kind: 'npc', npc, depth: npc.col + npc.row + 0.5 });
    }
    queue.push({ kind: 'player', depth: player.col + player.row + 0.6 });
    queue.push({ kind: 'shark', depth: shark.col + shark.row + 0.45 });   // ordenado na água
    queue.sort((a, b) => a.depth - b.depth);

    for (const item of queue) {
      if (item.kind === 'tile') {
        const { col, row } = item;
        const { x, y } = iso(col, row);
        const tile = MAP[row][col];
        switch (tile) {
          case '~': water(ctx, x, y, t, true);  break;
          case 'w': water(ctx, x, y, t, false); break;
          case '.': diamond(ctx, x, y, '#e0d098', '#c0a868'); break;
          case 'a': reef(ctx, x, y); break;
          case 'g':
            // chão lamacento no Manguezal (D3); calçadão na praça do Marco Zero (d0); grama nos demais
            if (districtAt(col, row) === 3) diamond(ctx, x, y, '#5b5230', '#3e3820');
            else if (isMarcoZeroPlaza(col, row)) { diamond(ctx, x, y, '#d8c8a8', '#b8a888'); drawRosaSliceOnTile(ctx, col, row); }
            else diamond(ctx, x, y, '#5a7838', '#3a5020');
            break;
          case 'r':
            diamond(ctx, x, y, '#545454', '#3a3a3a');
            ctx.strokeStyle = '#7a7a7a'; ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x - 4, y + TH / 2); ctx.lineTo(x + 4, y + TH / 2);
            ctx.stroke();
            break;
          case 'm':
            diamond(ctx, x, y, '#473b22', '#2c2410');  // lama do mangue (terroso)
            mangrove(ctx, x, y, t);
            break;
          default: {
            const fl = parseInt(tile);
            if (fl >= 1 && fl <= 6) {
              diamond(ctx, x, y, col >= 10 ? '#787060' : '#5a7838', '#303020');
              building(ctx, x, y, fl, col, row);
            }
          }
        }
      } else if (item.kind === 'coqueiro') {
        drawCoqueiro(ctx, item.col, item.row);
      } else if (item.kind === 'node') {
        drawNode(ctx, t, item.node, item.done);
      } else if (item.kind === 'npc') {
        if (districtUnlockedFn(item.npc.d)) drawNpc(ctx, t, item.npc);
      } else if (item.kind === 'player') {
        drawPlayer(ctx, t);
      } else if (item.kind === 'shark') {
        drawSharkWorld(ctx);
      }
    }
  }

  // posição de tela (px) do portal de um distrito — usada pela seta-guia
  function spotScreen(d) {
    const sp = DISTRICT_SPOTS.find(s => s.d === d);
    if (!sp) return null;
    const { x, y } = iso(sp.col, sp.row);
    return { x, y: y + TH / 2 };
  }

  // distrito que contém o tile (col,row), ou -1 fora de qualquer zona
  function districtAt(col, row) {
    const ci = Math.floor(col), ri = Math.floor(row);
    for (let d = 0; d < ZONE_BOUNDS.length; d++) {
      const z = ZONE_BOUNDS[d];
      if (ri >= z.r1 && ri <= z.r2 && ci >= z.c1 && ci <= z.c2) return d;
    }
    return -1;
  }
  function currentDistrict() { return districtAt(player.col, player.row); }
  function districtName(d) {
    const sp = DISTRICT_SPOTS.find(s => s.d === d);
    return sp ? sp.name : '';
  }

  // ---------- proximidade ----------
  // nó de fase mais próximo (em distrito desbloqueado), dentro do raio de interação
  function nearSpot(districtUnlockedFn) {
    let best = null, bestDist = Infinity;
    for (const node of PHASE_NODES) {
      if (!districtUnlockedFn(node.d)) continue;
      if (Math.abs(player.col - node.col) < 1.3 && Math.abs(player.row - node.row) < 1.3) {
        const dist = Math.hypot(player.col - node.col, player.row - node.row);
        if (dist < bestDist) { bestDist = dist; best = node; }
      }
    }
    return best;
  }
  // posição de tela (px) do nó da fase g — usada pela seta-guia
  function nodeScreen(g) {
    const node = PHASE_NODES.find(n => n.g === g);
    if (!node) return null;
    const { x, y } = iso(node.col, node.row);
    return { x, y: y + TH / 2 };
  }

  // posição de tela (px) do NPC do passeio (por key) — usada pela seta-guia de onboarding
  function npcScreen(key) {
    const npc = WORLD_NPCS.find(n => n.key === key);
    if (!npc) return null;
    const { x, y } = iso(npc.col, npc.row);
    return { x, y: y + TH / 2 };
  }

  function nearNpc(districtUnlockedFn) {
    for (const npc of WORLD_NPCS) {
      if (!districtUnlockedFn(npc.d)) continue;
      if (Math.abs(player.col - npc.col) < 1.3 && Math.abs(player.row - npc.row) < 1.3) return npc;
    }
    return null;
  }

  // ---------- API pública ----------
  function update(dt, vx, vy, W, H, districtUnlockedFn) {
    movePlayer(vx, vy, dt, districtUnlockedFn);
    updateCamera(W, H, dt);
    lastW = W; lastH = H;
    stepShark(dt, districtUnlockedFn);
  }

  function reset(d) {
    const sp = DISTRICT_SPOTS[Math.min(d || 0, DISTRICT_SPOTS.length - 1)];
    player.col = sp.col + 1.5;
    player.row = sp.row;
    camX = 0; camY = 0; // força re-centrar
  }

  // ============================================================
  // Tubarão ambiente (spec 006) — nada pelo MAR, cosmético.
  // Vive sobre tiles d'água VISÍVEIS ('~' oceano sempre visível; 'w' rio quando
  // o distrito abre). Movimento determinístico (sem Math.random) p/ ser testável
  // via window.__world.stepShark / .shark. Estado efêmero (fora do save).
  // ============================================================
  const SHARK_SCALE = 2;     // proporção ao mundo: ~1 tile iso (≠ escala 3 do puzzle)
  const SHARK_SPD = 1.1;     // tiles por segundo (ambiente, lento)
  // direção no grid (col,row); screenDX = lado na tela (define o flip do sprite)
  const SHARK_DIRS = {
    E: { dc:  1, dr:  0, screenDX:  1 },
    W: { dc: -1, dr:  0, screenDX: -1 },
    S: { dc:  0, dr:  1, screenDX: -1 },
    N: { dc:  0, dr: -1, screenDX:  1 },
  };
  const SHARK_CW = ['E', 'S', 'W', 'N'];   // ordem horária para virar
  const sharkTurn = (d, k) => SHARK_CW[(SHARK_CW.indexOf(d) + k + 4) % 4];

  const shark = { col: 12.5, row: 1.5, dir: 'S', bob: 0, tcol: undefined, trow: undefined };

  function isSharkWater(col, row, unlockFn) {
    const ci = Math.floor(col), ri = Math.floor(row);
    if (ci < 0 || ci >= COLS || ri < 0 || ri >= ROWS) return false;
    const tile = MAP[ri][ci];
    if (tile !== '~' && tile !== 'w') return false;
    return unlockFn ? tileVisible(ci, ri, unlockFn) : true;
  }

  // mar ABERTO: o sprite do tubarão é mais alto que um tile e, na ordem de profundidade
  // iso, é pintado por CIMA dos tiles "atrás" dele na tela (N, W, NW — col+row menor).
  // Se algum desses for terra, o tubarão *parece* estar em terra (bug 006: "tubarão em
  // terra"). Então ele só patrulha tiles d'água cujos vizinhos de cima-tela também são
  // água — ou estão acima do horizonte (ri-1 < 0). Isso o mantém no mar do norte, sempre
  // claramente sobre o mar e atrás da terra, nunca encobrindo-a.
  function isSharkOpenSea(col, row, unlockFn) {
    if (!isSharkWater(col, row, unlockFn)) return false;
    const ci = Math.floor(col), ri = Math.floor(row);
    for (const [dc, dr] of [[0, -1], [-1, 0], [-1, -1]]) {   // N, W, NW (tiles que o sprite encobre)
      const nc = ci + dc, nr = ri + dr;
      if (nr < 0) continue;          // acima do mapa = céu/horizonte, ok
      if (nc < 0) return false;      // fora a oeste = borda de terra/mangue
      const t = MAP[nr][nc];
      if (t !== '~' && t !== 'w') return false;
    }
    return true;
  }

  // próxima direção: reto → direita → esquerda → ré; 1ª cujo próximo tile é mar aberto
  // visível. null = encurralado (nenhuma direção é mar aberto) — o tubarão fica parado
  // no trecho em vez de avançar para terra.
  function sharkNextDir(unlockFn) {
    for (const k of [0, 1, 3, 2]) {
      const d = sharkTurn(shark.dir, k);
      const v = SHARK_DIRS[d];
      if (isSharkOpenSea(Math.floor(shark.col) + v.dc, Math.floor(shark.row) + v.dr, unlockFn)) return d;
    }
    return null;
  }

  // mira o centro do próximo tile de mar aberto (alvo FIXO por trecho — não recalcular a
  // cada passo, senão o alvo "foge" ao cruzar a fronteira e o tubarão atravessa para a terra)
  function sharkRetarget(unlockFn) {
    const d = sharkNextDir(unlockFn);
    if (d === null) { shark.tcol = shark.col; shark.trow = shark.row; return; }  // encurralado: parado
    shark.dir = d;
    const v = SHARK_DIRS[d];
    shark.tcol = Math.floor(shark.col) + 0.5 + v.dc;
    shark.trow = Math.floor(shark.row) + 0.5 + v.dr;
  }

  function stepShark(dt, unlockFn) {
    if (!(dt > 0)) return;
    dt = Math.min(dt, 1);              // clamp defensivo
    shark.bob += dt;
    if (shark.tcol === undefined) sharkRetarget(unlockFn);   // init lazy (precisa do unlockFn)
    const len = SHARK_SPD * dt;
    const dx = shark.tcol - shark.col, dy = shark.trow - shark.row;
    const dist = Math.abs(dx) + Math.abs(dy);   // trecho é axis-aligned: L1 = distância real
    if (dist <= len || dist === 0) {
      shark.col = shark.tcol; shark.row = shark.trow;   // snap ao centro do tile (determinístico)
      sharkRetarget(unlockFn);
    } else {
      shark.col += Math.sign(dx) * len;
      shark.row += Math.sign(dy) * len;
    }
  }

  function sharkScreen() {
    const p = iso(shark.col, shark.row);
    return { sx: p.x, sy: p.y + TH / 2 };
  }

  function sharkSnapshot() {
    const { sx, sy } = sharkScreen();
    const v = SHARK_DIRS[shark.dir];
    const m = TW;   // margem de ~1 tile para o culling
    return {
      col: shark.col, row: shark.row, sx, sy,
      dir: shark.dir, vx: v.dc, vy: v.dr,
      scale: SHARK_SCALE,
      lane: (shark.dir === 'E' || shark.dir === 'W') ? 'col' : 'row',
      flip: v.screenDX < 0,
      onWater: isSharkWater(shark.col, shark.row, null),
      visible: sx >= -m && sx <= lastW + m && sy >= -m && sy <= lastH + m,
    };
  }

  function drawSharkWorld(ctx) {
    const { sx, sy } = sharkScreen();
    const s = SHARK_SCALE;
    const flip = SHARK_DIRS[shark.dir].screenDX < 0;
    const cy = sy + Math.sin(shark.bob * 1.6) * 1.5;   // bob suave
    ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = '#0b2548';   // sombra na água
    ctx.beginPath(); ctx.ellipse(sx, cy + 3.5 * s, 8 * s, 2.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    drawShark(ctx, sx - 8 * s, cy - 3.5 * s, s, flip);
  }

  return { draw, update, nearSpot, nearNpc, spotScreen, nodeScreen, npcScreen, currentDistrict, districtName, reset, player,
           worldNpcs: WORLD_NPCS, npcDraw: NPC_DRAW,
           walkable, tileVisible, phaseNodes: PHASE_NODES, marcoZero: MARCO_ZERO, coqueiros: COQUEIROS,
           shark: sharkSnapshot, stepShark };
})();
