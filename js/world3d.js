// ============================================================
// world3d.js — Mundo isométrico 3D (motor principal do jogo)
// Mapa 20×20; câmera dinâmica segue a Maju; TW=36 TH=18
// ============================================================

globalThis.World3D = (() => {
  const TW = 36, TH = 18, FH = 18;
  const COLS = 20, ROWS = 20;

  // ---------- câmera dinâmica ----------
  // Valor inicial centrado na posição de start (col=5, row=3) para W=360 H=640
  let camX = 144, camY = 184;

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
    { r1: 2,  c1: 2,  r2: 9,  c2: 8  },  // D0: Recife Antigo
    { r1: 2,  c1: 9,  r2: 9,  c2: 16 },  // D1: Beira-Mar
    { r1: 2,  c1: 16, r2: 9,  c2: 19 },  // D2: Dias de Chuva
    { r1: 10, c1: 2,  r2: 14, c2: 8  },  // D3: Manguezal
    { r1: 10, c1: 9,  r2: 14, c2: 11 },  // D4: Mercado S. José
    { r1: 10, c1: 11, r2: 14, c2: 16 },  // D5: Pátio do Terço
    { r1: 15, c1: 2,  r2: 19, c2: 8  },  // D6: Rua da Moeda
    { r1: 15, c1: 9,  r2: 19, c2: 13 },  // D7: Beira do Mangue
    { r1: 17, c1: 3,  r2: 19, c2: 9  },  // D8: Cais — Maré 81
  ];

  function tileVisible(col, row, districtUnlockedFn) {
    if (col <= 1) return true;  // borda oceano sempre visível
    const ci = Math.floor(col), ri = Math.floor(row);
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

  // ---------- mapa 20×20 ----------
  // ~=oceano  w=rio  .=praia  g=terra  r=rua  m=mangue  a=arrecife  1-6=prédio
  const MAP = [
  // col: 0    1    2    3    4    5    6    7    8    9   10   11   12   13   14   15   16   17   18   19
  /* 0*/['~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~'],
  /* 1*/['~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~'],
  /* 2*/['m', 'm', 'w', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~'],
  /* 3*/['m', 'g', 'r', 'g', 'g', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'g', '~', '~'],
  /* 4*/['m', 'g', 'r', 'g', '1', 'g', 'g', 'g', 'g', 'r', 'g', '1', 'g', 'g', 'g', 'g', 'r', '3', '4', '~'],
  /* 5*/['g', 'g', 'r', 'g', '1', 'g', 'g', 'g', 'g', 'r', 'g', '2', 'g', 'g', 'g', 'g', 'r', '4', '5', '~'],
  /* 6*/['g', 'g', 'r', 'g', 'g', 'g', 'g', 'g', 'g', 'r', 'g', 'g', 'g', 'g', 'g', 'g', 'r', '4', '5', '~'],
  /* 7*/['g', 'g', 'r', 'g', '2', 'g', 'g', 'g', 'g', 'r', 'g', '2', 'g', 'g', 'g', 'g', 'r', '3', '4', '~'],
  /* 8*/['g', 'g', 'r', 'g', '2', 'g', 'g', 'g', 'g', 'r', 'g', '2', 'g', 'g', 'g', 'g', 'r', '.', '3', '~'],
  /* 9*/['m', 'g', 'r', 'g', 'g', 'g', 'g', 'g', 'g', 'r', 'g', 'g', 'g', 'g', 'g', 'g', 'r', '.', '.', '~'],
  /*10*/['m', 'g', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', '.', '~', '~'],
  /*11*/['m', 'g', 'r', 'g', '1', 'g', 'g', 'g', 'g', 'r', 'g', '1', 'g', 'g', 'g', 'g', '.', '.', '~', '~'],
  /*12*/['m', 'g', 'r', 'g', '2', 'g', 'g', 'g', 'g', 'r', 'g', '2', 'g', 'g', 'g', '.', '.', '~', '~', '~'],
  /*13*/['m', 'g', 'r', 'g', '2', 'g', 'g', 'g', 'g', 'r', 'g', 'g', 'g', 'g', '.', '.', '~', '~', '~', '~'],
  /*14*/['m', 'm', 'r', 'g', 'g', 'g', 'g', 'g', 'g', 'r', 'g', 'g', 'g', '.', '.', '~', '~', '~', '~', '~'],
  /*15*/['m', 'm', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', '.', '.', '~', '~', '~', '~', '~', '~'],
  /*16*/['m', 'm', 'r', 'g', '1', 'g', 'g', 'g', 'g', 'r', 'g', '.', '.', '~', '~', '~', '~', '~', '~', '~'],
  /*17*/['m', 'm', 'r', 'g', 'g', 'g', 'g', 'g', 'g', 'r', '.', '.', '~', '~', '~', '~', '~', '~', '~', '~'],
  /*18*/['m', 'm', 'm', 'g', 'g', 'g', 'g', 'g', 'g', '.', '.', '~', '~', '~', '~', '~', '~', '~', '~', '~'],
  /*19*/['m', 'm', 'm', 'm', 'g', 'g', 'g', 'g', '.', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~'],
  ];

  // ---------- portais de bairro ----------
  const DISTRICT_SPOTS = [
    { d: 0, col: 6,  row: 6,  name: 'Recife Antigo',   color: '#f2c038' },
    { d: 1, col: 9,  row: 6,  name: 'Beira-Mar',       color: '#1d9fd0' },
    { d: 2, col: 16, row: 6,  name: 'Dias de Chuva',   color: '#7d9fb4' },
    { d: 3, col: 3,  row: 10, name: 'Manguezal',       color: '#8a5a3a' },
    { d: 4, col: 9,  row: 12, name: 'Mercado S. José', color: '#d48020' },
    { d: 5, col: 12, row: 11, name: 'Pátio do Terço',  color: '#b040b0' },
    { d: 6, col: 4,  row: 15, name: 'Rua da Moeda',    color: '#c0a020' },
    { d: 7, col: 9,  row: 15, name: 'Beira do Mangue', color: '#4a8a50' },
    { d: 8, col: 7,  row: 17, name: 'Cais — Maré 81',  color: '#a07898' },
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
    const isBoaViagem = col >= 14;
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

  // ---------- NPC no mundo (sprites reais de sprites.js) ----------
  function drawNpc(ctx, t, npc) {
    const { x, y } = iso(npc.col, npc.row);
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

  // ---------- render principal ----------
  function draw(ctx, W, H, t, districtUnlockedFn, isDoneFn) {
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
    for (const npc of WORLD_NPCS) {
      queue.push({ kind: 'npc', npc, depth: npc.col + npc.row + 0.5 });
    }
    queue.push({ kind: 'player', depth: player.col + player.row + 0.6 });
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
          case 'g': diamond(ctx, x, y, '#5a7838', '#3a5020'); break;
          case 'r':
            diamond(ctx, x, y, '#545454', '#3a3a3a');
            ctx.strokeStyle = '#7a7a7a'; ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x - 4, y + TH / 2); ctx.lineTo(x + 4, y + TH / 2);
            ctx.stroke();
            break;
          case 'm':
            diamond(ctx, x, y, '#2a4018', '#1a2e10');
            mangrove(ctx, x, y, t);
            break;
          default: {
            const fl = parseInt(tile);
            if (fl >= 1 && fl <= 6) {
              diamond(ctx, x, y, col >= 14 ? '#787060' : '#5a7838', '#303020');
              building(ctx, x, y, fl, col, row);
            }
          }
        }
      } else if (item.kind === 'node') {
        drawNode(ctx, t, item.node, item.done);
      } else if (item.kind === 'npc') {
        if (districtUnlockedFn(item.npc.d)) drawNpc(ctx, t, item.npc);
      } else if (item.kind === 'player') {
        drawPlayer(ctx, t);
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
  }

  function reset(d) {
    const sp = DISTRICT_SPOTS[Math.min(d || 0, DISTRICT_SPOTS.length - 1)];
    player.col = sp.col + 1.5;
    player.row = sp.row;
    camX = 0; camY = 0; // força re-centrar
  }

  return { draw, update, nearSpot, nearNpc, spotScreen, nodeScreen, currentDistrict, districtName, reset, player,
           worldNpcs: WORLD_NPCS, npcDraw: NPC_DRAW };
})();
