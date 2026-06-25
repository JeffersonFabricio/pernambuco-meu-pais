// ============================================================
// Marés do Recife — pixel art procedural (sem imagens externas)
// Canvas lógico 360x640, unidade de "pixel" U=4 (grade 90x160)
// ============================================================
const U = 4;

function PR(ctx, x, y, w, h, c) {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}
// círculo cheio
function fillCircle(ctx, cx, cy, r, c) {
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}
// retângulo em unidades de pixel-art
function PU(ctx, x, y, w, h, c) { PR(ctx, x * U, y * U, w * U, h * U, c); }

// desenha sprite a partir de mapa de strings
function drawMap(ctx, map, pal, x, y, s = U) {
  for (let r = 0; r < map.length; r++) {
    const row = map[r];
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      if (ch === '.') continue;
      const col = pal[ch];
      if (!col) continue;
      PR(ctx, x + c * s, y + r * s, s, s, col);
    }
  }
}

// desenha só um trecho do mapa (linhas r0..r1, colunas c0..c1) — usado p/
// animar partes do corpo (ex.: cada perna sobe/desce de forma independente).
// As linhas são reposicionadas a partir de y (origem = linha r0).
function drawMapPart(ctx, map, pal, x, y, s, r0, r1, c0 = 0, c1 = 99) {
  for (let r = r0; r < r1 && r < map.length; r++) {
    const row = map[r];
    const cMax = Math.min(c1, row.length);
    for (let c = c0; c < cMax; c++) {
      const ch = row[c];
      if (ch === '.') continue;
      const col = pal[ch];
      if (!col) continue;
      PR(ctx, x + c * s, y + (r - r0) * s, s, s, col);
    }
  }
}

// ---------- personagens ----------
// (grade 12 de largura; sombreamento embutido p/ dar volume)
const MAJU_MAP = [
  '...hhhh.....',
  '.hhhhhhhh.o.',
  '.hHhhhhhheoe',
  '.hhffffffhe.',
  '.hffffffffh.',
  '.hfkffffkfh.',
  '.hffffffffh.',
  '.hfffmmfffh.',
  '..hffffffh..',
  '...ffffff...',
  '..yyWWWWyy..',
  '.fyyyyyyyyf.',
  '.dyyyyyyyyd.',
  '..yyyyyyyy..',
  '..yYYYYYYy..',
  '..ff....ff..',
  '..df....fd..',
  '.bbb....bbb.',
];
const MAJU_PAL = {
  h: '#2a1a12', H: '#3d2719', f: '#e8c09a', d: '#c8986e', k: '#140a05',
  w: '#f5d8b8', m: '#9a4e3a', y: '#f2c038', Y: '#d49a2a', b: '#7a3f22',
  e: '#e8556a', o: '#f7d23a', W: '#f5efe0',
};

const VOVO_MAP = [
  '...pppppp...',
  '.PppppppppP.',
  'pppppppppppp',
  '...ffffff...',
  '..ffffffff..',
  '..fkffffkf..',
  '..fffddfff..',
  '..fWwwwwWf..',
  '..wwwwwwww..',
  '...wwwwww...',
  '..cccccccc..',
  '.cccccccccc.',
  '.CccccccccC.',
  '.fccccccccf.',
  '..nnnnnnnn..',
  '..nnn..nnn..',
  '..ndn..ndn..',
  '.bbbb..bbbb.',
];
const VOVO_PAL = {
  p: '#d9b25c', P: '#bf983f', f: '#8a5a3a', d: '#6e4730', k: '#140a05',
  w: '#ece8de', W: '#c9c4b8', c: '#3a6ea5', C: '#2c578a', n: '#6b4a2f', b: '#3d2a18',
};

const MAJU_FACE = [
  '.hhhhhhhh.o.',
  'hhhhhhhheoeh',
  'hhhffffffheh',
  'hhffffffffhh',
  'hffffffffffh',
  'hffkffffkffh',
  'hffffffffffh',
  'hffffddffffh',
  'hhfffmmfffhh',
  'hhffffffffhh',
  '.hhffffffhh.',
  '..hhhhhhhh..',
];
const VOVO_FACE = [
  '...pppppp...',
  '.PppppppppP.',
  'pppppppppppp',
  '.hffffffffh.',
  '.fffffffffd.',
  '.ffkffffkfd.',
  '.ffffddfffd.',
  '.fWwwffwwWf.',
  '.wwwwwwwwww.',
  '.WwwwwwwwwW.',
  '..wwwwwwww..',
  '...WwwwwW...',
];
const FACE_PAL = {
  h: '#2a1a12', H: '#3d2719', f: '#e8c09a', d: '#c8986e', k: '#140a05',
  w: '#f5d8b8', m: '#9a4e3a', p: '#d9b25c', P: '#bf983f', W: '#c9c4b8',
  e: '#e8556a', o: '#f7d23a',
};
const VOVO_FACE_PAL = { ...FACE_PAL, f: '#8a5a3a', d: '#6e4730', w: '#ece8de', W: '#c9c4b8' };

const CRAB_MAP = [
  'c..........c',
  '.c...cc...c.',
  '.cc.rrrr.cc.',
  '..rrrrrrrr..',
  '.rrkrrrrkrr.',
  '..rrrrrrrr..',
  '.c..c..c..c.',
  'c..c....c..c',
];
const CRAB_PAL = { c: '#c2552f', r: '#e06a3a', k: '#ffffff' };

const SHARK_MAP = [
  '......ss........',
  '.....ssss.....s.',
  '.ssssssssssssss.',
  'sskssssssssssss.',
  'swwwwwwwsssss...',
  '.swwwwwsss......',
  '...ssss.........',
];
const SHARK_PAL = { s: '#5a6b7a', w: '#c8d4dc', k: '#0e141a' };

function drawMaju(ctx, x, y, s = U) { drawMap(ctx, MAJU_MAP, MAJU_PAL, x, y, s); }
function drawVovo(ctx, x, y, s = U) { drawMap(ctx, VOVO_MAP, VOVO_PAL, x, y, s); }

// Maju andando no mundo livre: centrada em (cx, cy=pés), espelha p/ esquerda.
// `phase` é a fase do passo (avança com a DISTÂNCIA andada — passos desaceleram
// quando ela anda devagar). Pernas alternam pisando, corpo balança, a sombra
// achata quando o pé planta e sai uma poeirinha a cada passada.
function drawMajuWalk(ctx, cx, cy, face, moving, phase, t) {
  const s = 3;
  const sn = Math.sin(phase);
  const bob = moving ? Math.abs(sn) * 2.4 : Math.sin(t * 2) * 0.5 + 0.5;
  const lean = moving ? Math.round(sn * 0.9) : 0;       // balanço do tronco
  // sombra: alarga quando o pé encosta no chão (sn ~ 0)
  const sw = 24 + (moving ? (1 - Math.abs(sn)) * 8 : 0);
  ctx.save();
  ctx.globalAlpha = 0.22;
  PR(ctx, cx - sw / 2, cy + 1, sw, 6, '#000');
  ctx.restore();

  ctx.save();
  ctx.translate(cx, 0);
  if (face === 'L') ctx.scale(-1, 1);
  const ox = -6 * s;
  const oy = Math.round(cy - 18 * s - bob);
  // poeirinha no pé que está plantado
  if (moving) {
    const da = (1 - Math.abs(sn)) * 0.3;
    if (da > 0.04) {
      ctx.globalAlpha = da;
      const fx = (sn > 0 ? 3 : -3) * s;
      PR(ctx, fx - 2, cy - 1, 4, 2, '#fff');
      PR(ctx, fx + 2, cy, 3, 2, '#fff');
      ctx.globalAlpha = 1;
    }
  }
  // tronco + cabeça (linhas 0..14) com leve balanço lateral
  drawMapPart(ctx, MAJU_MAP, MAJU_PAL, ox + lean, oy, s, 0, 15);
  // pernas (linhas 15..17): a da frente sobe enquanto a de trás planta
  const lift = moving ? 2.6 : 0;
  const lL = Math.round(Math.max(0, sn) * lift);
  const lR = Math.round(Math.max(0, -sn) * lift);
  const stepX = moving ? Math.round(sn * 1.3) : 0;       // passada p/ frente/trás
  const legY = oy + 15 * s;
  drawMapPart(ctx, MAJU_MAP, MAJU_PAL, ox + stepX, legY - lL, s, 15, 18, 0, 6);   // perna esquerda
  drawMapPart(ctx, MAJU_MAP, MAJU_PAL, ox - stepX, legY - lR, s, 15, 18, 6, 12);  // perna direita
  ctx.restore();
}

// ---------- personagens-guia da família ----------
// Jonatha (menino): boné e camisa verdes
const JONA_MAP = [
  '...gggg.....',
  '..gggggggg..',
  '.gggggggggg.',
  '..hffffffh..',
  '..ffffffff..',
  '..fkffffkf..',
  '..ffffffff..',
  '..fffmmfff..',
  '...ffffff...',
  '...ffffff...',
  '..tttttttt..',
  '.fttttttttf.',
  '.dttttttttd.',
  '..tttttttt..',
  '..TTTTTTTT..',
  '..pp....pp..',
  '..pp....pp..',
  '.bbb....bbb.',
];
const JONA_PAL = {
  g: '#2f8a5a', h: '#241a12', f: '#e8c09a', k: '#140a05', m: '#8a4a38',
  t: '#cc2222', T: '#9a1010', d: '#c8986e', p: '#33405a', b: '#2a2a2a',
};
// Micaele (menina): maria-chiquinha e vestido rosa
const MICA_MAP = [
  '...hhhh.....',
  '.hhhhhhhhhh.',
  'hhhhhhhhhhhh',
  'h.hffffffh.h',
  '..ffffffff..',
  '..fkffffkf..',
  '..ffffffff..',
  '..fffmmfff..',
  '...ffffff...',
  '...ffffff...',
  '..rrWWWWrr..',
  '.frrrrrrrrf.',
  '.drrrrrrrrd.',
  '..rrrrrrrr..',
  '..rRRRRRRr..',
  '..ff....ff..',
  '..df....fd..',
  '.bbb....bbb.',
];
const MICA_PAL = {
  h: '#3a2418', f: '#e8c09a', k: '#140a05', m: '#9a4e3a',
  r: '#e87ab0', R: '#c95e96', W: '#f7e4ee', d: '#c8986e', b: '#7a3f22',
};
// Titio Jeff (adulto): mesmo corpo do Vovô, boné azul, barba curta, camisa roxa
const JEFF_PAL = {
  p: '#1f6f9e', P: '#155680', f: '#cf9a68', d: '#a86f44', k: '#140a05',
  w: '#3a2a1a', W: '#4a3526', c: '#8a2ac8', C: '#6a1e9e', n: '#caa15a', b: '#5a3a22',
};
// Vovó (adulta): cabelo grisalho, sem barba, blusa lilás e saia roxa
const VOVA_PAL = {
  p: '#dcd6cf', P: '#c2bbb2', f: '#e6b48c', d: '#c89068', k: '#140a05',
  w: '#e6b48c', W: '#e6b48c', c: '#c79bd0', C: '#a87ab8', n: '#9a6aa8', b: '#6a4a8a',
};
function drawJonatha(ctx, x, y, s = U) { drawMap(ctx, JONA_MAP, JONA_PAL, x, y, s); }
function drawMicaele(ctx, x, y, s = U) { drawMap(ctx, MICA_MAP, MICA_PAL, x, y, s); }
function drawJeff(ctx, x, y, s = U) { drawMap(ctx, VOVO_MAP, JEFF_PAL, x, y, s); }
function drawVova(ctx, x, y, s = U) { drawMap(ctx, VOVO_MAP, VOVA_PAL, x, y, s); }

// Primos Ravi (boné laranja, camisa azul) e Nicolas (boné verde, camisa vermelha)
const RAVI_PAL = {
  g: '#e07020', h: '#241a12', f: '#cf9a68', k: '#140a05', m: '#8a4a38',
  t: '#3a7ab0', T: '#2a5a88', d: '#b07a4a', p: '#7a4a2c', b: '#2a2a2a',
};
const NICO_PAL = {
  g: '#2a8a3a', h: '#241a12', f: '#cf9a68', k: '#140a05', m: '#8a4a38',
  t: '#c84040', T: '#a83030', d: '#b07a4a', p: '#4a5a6a', b: '#2a2a2a',
};
// Titio Bruno: chapéu de couro nordestino, barba fechada, camisa bege
const BRUNO_PAL = {
  p: '#8b5e2a', P: '#6e4820', f: '#c8886a', d: '#a86a48', k: '#140a05',
  w: '#4a2a12', W: '#3a1e0a', c: '#d4b888', C: '#b89a66', n: '#7a5a3a', b: '#4a3020',
};
// Titio Renato: cabelo escuro, camisa azul-marinho
const RENATO_PAL = {
  p: '#2a1a12', P: '#1a0e08', f: '#c89a72', d: '#a87a52', k: '#140a05',
  w: '#c89a72', W: '#a87a52', c: '#1e3a6e', C: '#152b52', n: '#4a4a5a', b: '#2a2a32',
};
// Vovó materna (no céu): tons etéreos, dourado-branco celestial
const VOVO_MAE_PAL = {
  p: '#f0eada', P: '#d9d0c0', f: '#f5ddc8', d: '#d4b898', k: '#3a3040',
  w: '#f7f0e0', W: '#e8dfc8', c: '#e8d8a0', C: '#c8b878', n: '#d4c090', b: '#c0a860',
};

function drawRavi(ctx, x, y, s = U) { drawMap(ctx, JONA_MAP, RAVI_PAL, x, y, s); }
function drawNico(ctx, x, y, s = U) { drawMap(ctx, JONA_MAP, NICO_PAL, x, y, s); }
function drawBruno(ctx, x, y, s = U) { drawMap(ctx, VOVO_MAP, BRUNO_PAL, x, y, s); }
function drawRenato(ctx, x, y, s = U) { drawMap(ctx, VOVO_MAP, RENATO_PAL, x, y, s); }
function drawVovoMae(ctx, x, y, s = U) {
  // halo etéreo suave — ela veio do céu
  ctx.save();
  ctx.globalAlpha = 0.18;
  PR(ctx, x - s, y - s, 12 * s + 2 * s, 18 * s + 2 * s, '#f0d878');
  ctx.restore();
  drawMap(ctx, VOVO_MAP, VOVO_MAE_PAL, x, y, s);
}
// Dois primos lado a lado, centrados no ponto de origem
function drawPrimos(ctx, x, y, s = U) {
  drawMap(ctx, JONA_MAP, RAVI_PAL, x - Math.round(s * 4), y + Math.round(s * 0.5), s);
  drawMap(ctx, JONA_MAP, NICO_PAL, x + Math.round(s * 4), y, s);
}
// Jonatha e Micaele lado a lado — ponto interativo do Cais (d8) e da abertura (d0)
function drawPais(ctx, x, y, s = U) {
  drawMap(ctx, JONA_MAP, JONA_PAL, x - Math.round(s * 4), y + Math.round(s * 0.5), s);
  drawMap(ctx, MICA_MAP, MICA_PAL, x + Math.round(s * 4), y, s);
}

// Igreja N. S. da Piedade: só o prédio (torre branca com sino dourado) — as Marias aparecem
// na CENA do reencontro, não coladas na torre. Gate da cena: met.vova. Sem asset externo (Lei §5).
function drawIgrejaMarias(ctx, x, y, s = 2) {
  // --- fachada da igreja ---
  const W = Math.round(22 * s);
  const H = Math.round(28 * s);
  // corpo principal (branco colonial)
  PR(ctx, x, y + Math.round(10 * s), W, H, '#f5efe0');
  // platibanda/cornija dourada
  PR(ctx, x - Math.round(s), y + Math.round(9 * s), W + Math.round(2 * s), Math.round(2 * s), '#d9b25c');
  // janelas laterais
  PR(ctx, x + Math.round(2 * s), y + Math.round(14 * s), Math.round(5 * s), Math.round(7 * s), '#2a3a4f');
  PR(ctx, x + Math.round(2 * s), y + Math.round(14 * s), Math.round(2 * s), Math.round(3 * s), '#4a6a8f'); // brilho
  PR(ctx, x + Math.round(15 * s), y + Math.round(14 * s), Math.round(5 * s), Math.round(7 * s), '#2a3a4f');
  PR(ctx, x + Math.round(15 * s), y + Math.round(14 * s), Math.round(2 * s), Math.round(3 * s), '#4a6a8f');
  // porta central
  PR(ctx, x + Math.round(8 * s), y + Math.round(27 * s), Math.round(6 * s), Math.round(11 * s), '#5a3a22');
  PR(ctx, x + Math.round(9 * s), y + Math.round(28 * s), Math.round(4 * s), Math.round(9 * s), '#37261a');
  // --- torre (acima do corpo, centrada) ---
  const tx = x + Math.round(7 * s);
  const tw = Math.round(8 * s);
  PR(ctx, tx, y - Math.round(16 * s), tw, Math.round(26 * s), '#f5efe0');
  // cornija da torre
  PR(ctx, tx - Math.round(s), y - Math.round(17 * s), tw + Math.round(2 * s), Math.round(2 * s), '#d9b25c');
  // janela do sino (abertura escura + arco)
  PR(ctx, tx + Math.round(2 * s), y - Math.round(10 * s), Math.round(4 * s), Math.round(5 * s), '#2a3a4f');
  // sino dourado
  PR(ctx, tx + Math.round(2.5 * s), y - Math.round(7 * s), Math.round(3 * s), Math.round(3 * s), '#d9b25c');
  // espadana/agulha
  PR(ctx, tx + Math.round(3 * s), y - Math.round(24 * s), Math.round(2 * s), Math.round(9 * s), '#f5efe0');
  PR(ctx, tx + Math.round(3.5 * s), y - Math.round(27 * s), Math.round(s), Math.round(4 * s), '#d9b25c');
  // No mundo, a igreja é só o prédio (Nossa Senhora da Piedade, à beira-mar). As duas avós —
  // as Marias — aparecem JUNTAS na cena do reencontro (asMarias), não coladas na torre.
}

function drawCrab(ctx, x, y, s = U) { drawMap(ctx, CRAB_MAP, CRAB_PAL, x, y, s); }
function drawShark(ctx, x, y, s = U, flip = false) {
  if (flip) {
    ctx.save();
    ctx.translate(x + 16 * s, y);
    ctx.scale(-1, 1);
    drawMap(ctx, SHARK_MAP, SHARK_PAL, 0, 0, s);
    ctx.restore();
  } else drawMap(ctx, SHARK_MAP, SHARK_PAL, x, y, s);
}

// ---------- elementos de cena ----------
const CASA_CORES = ['#d94f4f', '#e8b94a', '#5b8bd9', '#67b06b', '#c97bb6', '#e8855b'];

function skyBands(ctx, colors, y0 = 0, y1 = 640) {
  const h = (y1 - y0) / colors.length;
  colors.forEach((c, i) => PR(ctx, 0, y0 + i * h, 360, h + 1, c));
}

function sun(ctx, cx, cy, r, t, core = '#ffd94a', glow = '#ffb24a') {
  const n = 8;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + t * 0.3;
    const rx = cx + Math.cos(a) * (r + 10 + Math.sin(t * 2 + i) * 3);
    const ry = cy + Math.sin(a) * (r + 10 + Math.sin(t * 2 + i) * 3);
    PR(ctx, rx - 3, ry - 3, 6, 6, glow);
  }
  PR(ctx, cx - r, cy - r / 2, r * 2, r, core);
  PR(ctx, cx - r / 2, cy - r, r, r * 2, core);
  PR(ctx, cx - r * 0.8, cy - r * 0.8, r * 1.6, r * 1.6, core);
}

function moon(ctx, cx, cy, r, c = '#f0ead0') {
  PR(ctx, cx - r, cy - r / 2, r * 2, r, c);
  PR(ctx, cx - r / 2, cy - r, r, r * 2, c);
  PR(ctx, cx - r * 0.8, cy - r * 0.8, r * 1.6, r * 1.6, c);
  PR(ctx, cx - 4, cy - 5, 5, 5, 'rgba(80,70,90,0.18)'); // crateras
  PR(ctx, cx + 3, cy + 3, 4, 4, 'rgba(80,70,90,0.15)');
  PR(ctx, cx - 6, cy + 4, 3, 3, 'rgba(80,70,90,0.12)');
}

function cloud(ctx, x, y, w, c = '#ffffff') {
  // nuvem fofa em 3 níveis + base sombreada (volume)
  PR(ctx, x, y + 4, w, 7, c);
  PR(ctx, x + w * 0.12, y, w * 0.72, 8, c);
  PR(ctx, x + w * 0.34, y - 5, w * 0.36, 8, c);
  PR(ctx, x + w * 0.05, y + 9, w * 0.9, 2, 'rgba(0,0,0,0.07)');
}

// camadas de nuvens com deriva (parallax): defs = [{x,y,w,sp,c}]
function cloudLayer(ctx, t, defs) {
  for (const d of defs) {
    const period = 360 + d.w * 2;
    const x = ((d.x + t * d.sp) % period + period) % period - d.w;
    cloud(ctx, x, d.y, d.w, d.c || '#ffffff');
  }
}

// bando de pássaros/gaivotas atravessando (deriva = profundidade)
function birds(ctx, t, n, y0, sp, c = '#2a3a4f') {
  const span = 400;
  for (let i = 0; i < n; i++) {
    const x = ((i * 113 + t * sp) % span + span) % span - 20;
    const y = y0 + (i * 53) % 46 + Math.sin(t * 1.5 + i) * 4;
    const up = Math.sin(t * 7 + i * 2) > 0; // bater de asa
    const dy = up ? -2 : 0;
    PR(ctx, x - 4, y + (up ? 0 : 1), 3, 2, c);
    PR(ctx, x - 1, y + dy, 2, 2, c);
    PR(ctx, x + 1, y + dy, 2, 2, c);
    PR(ctx, x + 3, y + (up ? 0 : 1), 3, 2, c);
  }
}

// casario distante, azulado e esmaecido (perspectiva atmosférica)
function casaFar(ctx, yBase, seed = 3, haze = 'rgba(150,178,205,0.5)') {
  let x = -10, i = seed;
  while (x < 360) {
    const w = 28 + ((i * 7) % 3) * 6;
    const h = 36 + ((i * 11) % 4) * 11;
    PR(ctx, x, yBase - h, w, h, haze);
    PR(ctx, x, yBase - h, w, 3, 'rgba(255,255,255,0.18)');
    x += w + 7; i++;
  }
}

// reflexo cintilante do sol/lua no mar — cone de glints espalhados
function seaGlow(ctx, cx, y0, y1, t, c = 'rgba(255,228,120,0.5)') {
  let row = 0;
  for (let y = y0; y < y1; y += 5, row++) {
    const k = (y - y0) / (y1 - y0);          // 0 perto do astro → 1 fundo
    if (k > 0.2 && (row % 2) && Math.sin(t * 4 + y) < 0.1) continue; // gaps tremulando
    const spread = 4 + k * 34;
    const n = 1 + Math.floor(k * 2.5);
    for (let b = 0; b < n; b++) {
      const jit = Math.sin(t * 3.5 + y * 0.4 + b * 2.3) * spread;
      const w = 5 + Math.abs(Math.sin(t * 3 + y * 0.2 + b)) * 7;
      PR(ctx, cx + jit - w / 2, y, w, 2, c);
    }
  }
}

function casa(ctx, yBase, seed = 0) {
  // casa colorido do Recife Antigo
  let x = -8;
  let i = seed;
  while (x < 360) {
    const w = 44 + ((i * 13) % 3) * 8;
    const h = 70 + ((i * 7) % 4) * 14;
    const c = CASA_CORES[i % CASA_CORES.length];
    PR(ctx, x, yBase - h, w, h, c);
    PR(ctx, x + w - 5, yBase - h, 5, h, 'rgba(0,0,0,0.15)'); // sombra lateral (volume)
    PR(ctx, x, yBase - h, w, 6, '#f5efe0'); // platibanda
    PR(ctx, x, yBase - h + 6, w, 2, 'rgba(0,0,0,0.12)'); // sombra sob a platibanda
    // janelas coloniais
    for (let wy = yBase - h + 14; wy < yBase - 26; wy += 22) {
      for (let wx = x + 6; wx < x + w - 10; wx += 16) {
        PR(ctx, wx, wy, 8, 12, '#f5efe0');
        PR(ctx, wx + 1, wy + 2, 6, 9, '#2a3a4f');
        PR(ctx, wx + 1, wy + 2, 3, 4, '#4a6a8f'); // brilho de vidro
      }
    }
    // porta
    PR(ctx, x + w / 2 - 6, yBase - 22, 12, 22, '#5a3a22');
    PR(ctx, x + w / 2 - 4, yBase - 19, 8, 19, '#37261a');
    PR(ctx, x + w / 2 + 1, yBase - 12, 2, 2, '#d9b25c'); // maçaneta
    x += w + 4;
    i++;
  }
  // torre da igreja
  PR(ctx, 296, yBase - 130, 30, 130, '#f5efe0');
  PR(ctx, 292, yBase - 138, 38, 10, '#d9b25c');
  PR(ctx, 304, yBase - 158, 14, 22, '#f5efe0');
  PR(ctx, 308, yBase - 168, 6, 12, '#d9b25c');
  PR(ctx, 306, yBase - 124, 10, 14, '#2a3a4f');
}

function sea(ctx, y0, y1, t, base = '#1d6fa3', deep = '#15578a', foam = '#bfe6f2') {
  PR(ctx, 0, y0, 360, y1 - y0, base);
  PR(ctx, 0, y0 + (y1 - y0) * 0.5, 360, (y1 - y0) * 0.5, deep);
  for (let r = 0; r < 6; r++) {
    const y = y0 + 8 + r * ((y1 - y0 - 16) / 6);
    for (let k = 0; k < 5; k++) {
      const x = ((k * 90 + Math.sin(t * 1.2 + r * 1.7 + k) * 22) % 400) - 20;
      PR(ctx, x, y, 26, 3, foam);
    }
  }
}

function sand(ctx, y0, y1, c = '#e8d49a', dot = '#d4ba7e') {
  PR(ctx, 0, y0, 360, y1 - y0, c);
  for (let i = 0; i < 40; i++) {
    const x = (i * 53) % 360;
    const y = y0 + ((i * 37) % (y1 - y0));
    PR(ctx, x, y, 3, 3, dot);
  }
}

function rainFx(ctx, t, c = '#9fc4e0') {
  for (let i = 0; i < 36; i++) {
    const x = (i * 67 + 40) % 380 - 10;
    const y = ((i * 131 + t * 420) % 700) - 30;
    PR(ctx, x, y, 2, 12, c);
  }
}

// ---------- pavimentação das ruas do Recife ----------
// paralelepípedo (pedra portuguesa de tráfego): pedras em fiada deslocada
function cobble(ctx, x, y, w, h, base = '#8c857a', dark = '#6f685f', light = '#9c958a') {
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  PR(ctx, x, y, w, h, base);
  const u = 8;
  for (let r = 0; r * u < h + u; r++) {
    const off = (r % 2) ? 4 : 0;
    for (let c = -1; c * u < w + u; c++) {
      const px = x + c * u + off, py = y + r * u;
      const v = (r * 7 + c * 13) % 3;
      PR(ctx, px + 1, py + 1, u - 2, u - 2, v === 0 ? dark : (v === 1 ? light : base));
    }
  }
  ctx.restore();
}
// calçada portuguesa: mosaico de ondas preto-e-creme (Boa Viagem / Marco Zero)
function calcadaPortuguesa(ctx, x, y, w, h, cell = 4) {
  for (let yy = 0; yy < h; yy += cell) {
    for (let xx = 0; xx < w; xx += cell) {
      const phase = yy + Math.sin((x + xx) * 0.1) * 12; // onda do mar
      const black = ((phase / 18) | 0) % 2 === 0;
      PR(ctx, x + xx, y + yy, cell, cell, black ? '#23252b' : '#ece4d0');
    }
  }
}
// calçada (passeio): ondas portuguesas nos cartões-postais ou ladrilho simples
function sidewalkStrip(ctx, x, y, w, h, wave) {
  if (w <= 0 || h <= 0) return;
  if (wave) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    calcadaPortuguesa(ctx, x, y, w, h);
    ctx.restore();
  } else {
    PR(ctx, x, y, w, h, '#cdbf9c');
    if (w > h) for (let i = 0; i * 14 < w; i++) PR(ctx, x + i * 14, y, 1, h, '#b8aa86');
    else for (let i = 0; i * 14 < h; i++) PR(ctx, x, y + i * 14, w, 1, '#b8aa86');
  }
}
// faixa de pedestre (zebra)
function crosswalk(ctx, x, y, w, h, horizontal) {
  if (horizontal) for (let i = 0; i * 9 < w; i++) PR(ctx, x + i * 9, y, 5, h, '#e6e0d2');
  else for (let i = 0; i * 9 < h; i++) PR(ctx, x, y + i * 9, w, 5, '#e6e0d2');
}
// poste de luz
function lampPost(ctx, x, yBase) {
  PR(ctx, x - 9, yBase, 18, 4, 'rgba(0,0,0,0.18)');
  PR(ctx, x - 1, yBase - 30, 3, 30, '#37414a');
  PR(ctx, x - 5, yBase - 34, 12, 6, '#2a323a');
  PR(ctx, x - 4, yBase - 33, 10, 4, '#ffe9a8');
  PR(ctx, x - 6, yBase - 30, 14, 2, 'rgba(255,233,168,0.35)');
}
// bueiro
function manhole(ctx, x, y) {
  PR(ctx, x - 5, y - 4, 10, 8, '#4a4a46');
  PR(ctx, x - 4, y - 3, 8, 6, '#5c5c56');
  PR(ctx, x - 3, y, 6, 1, '#42423e');
}

function bandeirinhas(ctx, y, t) {
  PR(ctx, 0, y, 360, 2, '#3a2a1a');
  const cores = ['#d94f4f', '#f2c038', '#5b8bd9', '#67b06b', '#c97bb6'];
  for (let i = 0; i < 12; i++) {
    const x = i * 30 + 6;
    const sway = Math.sin(t * 2 + i) * 2;
    ctx.fillStyle = cores[i % cores.length];
    ctx.beginPath();
    ctx.moveTo(x, y + 2);
    ctx.lineTo(x + 16, y + 2);
    ctx.lineTo(x + 8 + sway, y + 16);
    ctx.closePath();
    ctx.fill();
  }
}

function coqueiro(ctx, x, yBase, h = 80) {
  for (let i = 0; i < h; i += 7) {
    const tx0 = x + Math.sin(i * 0.05) * 6;
    PR(ctx, tx0, yBase - i, 9, 8, '#8a5a3a');
    PR(ctx, tx0, yBase - i, 3, 8, '#9c6a46');     // luz no tronco
    PR(ctx, tx0 + 7, yBase - i, 2, 8, '#6b4630');  // sombra
  }
  const tx = x + Math.sin(h * 0.05) * 6 + 4;
  const ty = yBase - h;
  // copa densa: folhas pendentes com base escura e brilho central
  [[-30, -4], [-22, -13], [-9, -20], [0, -23], [9, -20], [22, -13], [30, -4]].forEach(([dx, dy]) => {
    PR(ctx, tx + dx - 7, ty + dy, 16, 6, '#2f7d3f');
    PR(ctx, tx + dx - 4, ty + dy + 4, 10, 5, '#2a6e38');                 // queda da folha
    PR(ctx, tx + Math.round(dx * 0.5) - 5, ty + Math.round(dy * 0.5) - 2, 12, 5, '#46a85c');
  });
  PR(ctx, tx - 5, ty - 1, 5, 5, '#6b4a2f'); // cocos
  PR(ctx, tx + 2, ty + 1, 5, 5, '#5a3f28');
}

function jangadaSil(ctx, x, y, s = 1, sil = null) {
  const hull = sil || '#6b4a2f';
  const sail = sil || '#f5efe0';
  ctx.fillStyle = hull;
  ctx.beginPath();
  ctx.moveTo(x - 30 * s, y);
  ctx.lineTo(x + 30 * s, y);
  ctx.lineTo(x + 22 * s, y + 8 * s);
  ctx.lineTo(x - 22 * s, y + 8 * s);
  ctx.closePath();
  ctx.fill();
  PR(ctx, x - 2 * s, y - 38 * s, 3 * s, 38 * s, hull);
  ctx.fillStyle = sail;
  ctx.beginPath();
  ctx.moveTo(x + 1 * s, y - 38 * s);
  ctx.lineTo(x + 24 * s, y - 4 * s);
  ctx.lineTo(x + 1 * s, y - 4 * s);
  ctx.closePath();
  ctx.fill();
}

function antena(ctx, x, y, s = 1, c = '#1a2f26') {
  // parabólica enfiada na lama (símbolo do manguebeat)
  PR(ctx, x - 2 * s, y - 40 * s, 4 * s, 40 * s, c);
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.ellipse(x, y - 46 * s, 20 * s, 8 * s, -0.5, 0, Math.PI * 2);
  ctx.fill();
  PR(ctx, x - 1, y - 52 * s, 2, 8 * s, c);
}

function stars(ctx, n = 40, yMax = 300, t = 0) {
  for (let i = 0; i < n; i++) {
    const x = (i * 89 + 23) % 360;
    const y = (i * 53 + 11) % yMax;
    const tw = Math.sin(t * 3 + i * 1.7); // cintilação
    if (tw < -0.6) continue; // pisca: some por instantes
    const big = i % 4 === 0;
    PR(ctx, x, y, big ? 2 : 1, big ? 2 : 1, big ? '#fff8d0' : '#9fb4d0');
    if (big && tw > 0.7) { // brilho em cruz nas mais fortes
      PR(ctx, x - 1, y, 4, 1, 'rgba(255,248,208,0.5)');
      PR(ctx, x + 0.5, y - 1, 1, 4, 'rgba(255,248,208,0.5)');
    }
  }
}

function confete(ctx, t) {
  const cores = ['#d94f4f', '#f2c038', '#5b8bd9', '#67b06b', '#c97bb6', '#e8855b'];
  for (let i = 0; i < 30; i++) {
    const x = (i * 73 + Math.sin(t * 2 + i) * 30 + 360) % 360;
    const y = ((i * 113 + t * 90) % 700) - 30;
    PR(ctx, x, y, 5, 5, cores[i % cores.length]);
  }
}

function sombrinha(ctx, cx, cy, r, rot, cores = ['#d94f4f', '#f2c038', '#5b8bd9', '#67b06b']) {
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = cores[i % cores.length];
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, rot + (i / 8) * Math.PI * 2, rot + ((i + 1) / 8) * Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }
  PR(ctx, cx - 1, cy - 1, 3, 3, '#3a2a1a');
}

function alfaiaDrum(ctx, x, y, w, h) {
  PR(ctx, x, y, w, h, '#8a5a3a');
  PR(ctx, x, y, w, 6, '#e8d4b0');
  PR(ctx, x, y + h - 5, w, 5, '#5a3a22');
  ctx.strokeStyle = '#e8d4b0';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    const x0 = x + (i / 4) * w;
    ctx.beginPath();
    ctx.moveTo(x0, y + 6);
    ctx.lineTo(x0 + w / 4, y + h - 5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x0 + w / 4, y + 6);
    ctx.lineTo(x0, y + h - 5);
    ctx.stroke();
  }
}

// perna de raiz: escada diagonal de (x0,y0) até (x1,y1)
function rootLeg(ctx, x0, y0, x1, y1, c, th = 3) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
  for (let i = 0; i <= steps; i += 2) {
    const k = i / steps;
    PR(ctx, x0 + (x1 - x0) * k - th / 2, y0 + (y1 - y0) * k, th, th + 1, c);
  }
}
// tufo de folha arredondado (cruz de 2 retângulos)
function leafBlob(ctx, cx, cy, r, c) {
  PR(ctx, cx - r, cy - r * 0.6, r * 2, r * 1.2, c);
  PR(ctx, cx - r * 0.6, cy - r, r * 1.2, r * 2, c);
}
// árvore de mangue (rizófora): raízes-escora arqueadas + copa densa
function mangueTree(ctx, x, yBase, h, p) {
  const topY = yBase - h;
  const rootY = yBase - h * 0.5;
  [24, 15, 7].forEach((dx, i) => { // raízes splaiando até a lama
    rootLeg(ctx, x, rootY + i * 4, x - dx, yBase, p.woodD, 3);
    rootLeg(ctx, x, rootY + i * 4, x + dx, yBase, p.woodD, 3);
  });
  PR(ctx, x - 3, topY, 6, rootY - topY + 6, p.wood); // tronco
  PR(ctx, x + 1, topY, 2, rootY - topY + 6, p.woodD);
  leafBlob(ctx, x - 12, topY + 5, 11, p.leafD); // copa em camadas
  leafBlob(ctx, x + 12, topY + 5, 11, p.leafD);
  leafBlob(ctx, x, topY - 2, 16, p.leafD);
  leafBlob(ctx, x - 9, topY + 1, 8, p.leaf);
  leafBlob(ctx, x + 9, topY + 1, 8, p.leaf);
  leafBlob(ctx, x, topY - 5, 11, p.leaf);
  leafBlob(ctx, x - 3, topY - 7, 6, p.leafL); // brilho
}

function mangueRoots(ctx, yBase) {
  const back = { wood: '#41513f', woodD: '#3a4836', leaf: '#46604a', leafD: '#3e5642', leafL: '#506a52' };
  for (let i = 0; i < 5; i++) mangueTree(ctx, 36 + i * 76, yBase - 30, 38 + (i * 17 % 16), back);
  const front = { wood: '#5a3f28', woodD: '#3a2818', leaf: '#3a7042', leafD: '#2f5a35', leafL: '#54a25e' };
  for (let i = 0; i < 4; i++) mangueTree(ctx, 12 + i * 100, yBase, 66 + (i * 23 % 26), front);
}

// ---------- ícones (puzzles de memória e sombras) ----------
// cada ícone: (ctx, x, y, s, mono) — mono = cor única p/ silhueta
function iconConcha(ctx, x, y, s, m) {
  const c1 = m || '#f2b8a0', c2 = m || '#e08a6a';
  PR(ctx, x + 2 * s, y + 2 * s, 12 * s, 8 * s, c1);
  PR(ctx, x + 4 * s, y + 1 * s, 8 * s, 2 * s, c1);
  for (let i = 0; i < 3; i++) PR(ctx, x + (4 + i * 4) * s, y + 3 * s, 2 * s, 6 * s, c2);
  PR(ctx, x + 6 * s, y + 10 * s, 4 * s, 3 * s, c2);
}
function iconEstrela(ctx, x, y, s, m) {
  const c = m || '#f2a038';
  PR(ctx, x + 7 * s, y + 1 * s, 2 * s, 14 * s, c);
  PR(ctx, x + 1 * s, y + 6 * s, 14 * s, 3 * s, c);
  PR(ctx, x + 4 * s, y + 3 * s, 8 * s, 9 * s, c);
  if (!m) PR(ctx, x + 7 * s, y + 6 * s, 2 * s, 2 * s, '#d97a2a');
}
function iconSiri(ctx, x, y, s, m) {
  drawMapMono(ctx, CRAB_MAP, CRAB_PAL, x + s, y + 3 * s, s, m);
}
function iconCoco(ctx, x, y, s, m) {
  PR(ctx, x + 3 * s, y + 4 * s, 10 * s, 9 * s, m || '#6b4a2f');
  PR(ctx, x + 4 * s, y + 3 * s, 8 * s, 2 * s, m || '#6b4a2f');
  if (!m) {
    PR(ctx, x + 6 * s, y + 6 * s, 2 * s, 2 * s, '#3a2818');
    PR(ctx, x + 9 * s, y + 6 * s, 2 * s, 2 * s, '#3a2818');
    PR(ctx, x + 7 * s, y + 9 * s, 3 * s, 2 * s, '#3a2818');
  }
  PR(ctx, x + 6 * s, y + 1 * s, 4 * s, 3 * s, m || '#3f9b52');
}
function iconPeixe(ctx, x, y, s, m) {
  const c = m || '#5b8bd9';
  PR(ctx, x + 2 * s, y + 5 * s, 9 * s, 6 * s, c);
  PR(ctx, x + 4 * s, y + 3 * s, 5 * s, 10 * s, c);
  PR(ctx, x + 11 * s, y + 4 * s, 3 * s, 3 * s, c);
  PR(ctx, x + 11 * s, y + 9 * s, 3 * s, 3 * s, c);
  if (!m) PR(ctx, x + 4 * s, y + 6 * s, 2 * s, 2 * s, '#0e141a');
}
function iconSombrinha(ctx, x, y, s, m) {
  if (m) {
    ctx.fillStyle = m;
    ctx.beginPath();
    ctx.arc(x + 8 * s, y + 7 * s, 7 * s, Math.PI, 0);
    ctx.fill();
    PR(ctx, x + 7 * s, y + 7 * s, 2 * s, 8 * s, m);
  } else {
    sombrinha(ctx, x + 8 * s, y + 7 * s, 7 * s, 0);
    PR(ctx, x + 7 * s, y + 7 * s, 2 * s, 8 * s, '#3a2a1a');
  }
}
function iconBolo(ctx, x, y, s, m) {
  // bolo de rolo (espiral)
  PR(ctx, x + 2 * s, y + 4 * s, 12 * s, 9 * s, m || '#c97a4a');
  if (!m) {
    PR(ctx, x + 3 * s, y + 6 * s, 10 * s, s, '#8a4b2a');
    PR(ctx, x + 3 * s, y + 8 * s, 10 * s, s, '#8a4b2a');
    PR(ctx, x + 3 * s, y + 10 * s, 10 * s, s, '#8a4b2a');
    PR(ctx, x + 4 * s, y + 2 * s, 3 * s, 2 * s, '#e8d4b0');
  }
}
function iconRenda(ctx, x, y, s, m) {
  // renda renascença (roseta)
  const c = m || '#f5efe0';
  PR(ctx, x + 4 * s, y + 4 * s, 8 * s, 8 * s, c);
  PR(ctx, x + 6 * s, y + 2 * s, 4 * s, 12 * s, c);
  PR(ctx, x + 2 * s, y + 6 * s, 12 * s, 4 * s, c);
  if (!m) {
    PR(ctx, x + 7 * s, y + 7 * s, 2 * s, 2 * s, '#c97bb6');
    PR(ctx, x + 4 * s, y + 7 * s, s, 2 * s, '#9fb4d0');
    PR(ctx, x + 11 * s, y + 7 * s, s, 2 * s, '#9fb4d0');
    PR(ctx, x + 7 * s, y + 4 * s, 2 * s, s, '#9fb4d0');
    PR(ctx, x + 7 * s, y + 11 * s, 2 * s, s, '#9fb4d0');
  }
}
function iconCordel(ctx, x, y, s, m) {
  // folheto de cordel pendurado
  PR(ctx, x + 1 * s, y + 2 * s, 14 * s, s, m || '#8a5a3a');
  PR(ctx, x + 4 * s, y + 3 * s, 8 * s, 11 * s, m || '#e8dcc0');
  if (!m) {
    PR(ctx, x + 5 * s, y + 5 * s, 6 * s, 3 * s, '#3a2a1a');
    PR(ctx, x + 5 * s, y + 9 * s, 6 * s, s, '#6a5a4a');
    PR(ctx, x + 5 * s, y + 11 * s, 4 * s, s, '#6a5a4a');
  }
}
function iconBarro(ctx, x, y, s, m) {
  // boneco de barro (Alto do Moura / Mestre Vitalino)
  const c = m || '#b06a3a';
  PR(ctx, x + 5 * s, y + 1 * s, 6 * s, 5 * s, c);
  PR(ctx, x + 4 * s, y + 6 * s, 8 * s, 6 * s, c);
  PR(ctx, x + 3 * s, y + 12 * s, 10 * s, 2 * s, c);
  PR(ctx, x + 2 * s, y + 7 * s, 2 * s, 4 * s, c);
  PR(ctx, x + 12 * s, y + 7 * s, 2 * s, 4 * s, c);
  if (!m) {
    PR(ctx, x + 6 * s, y + 3 * s, s, s, '#3a2818');
    PR(ctx, x + 9 * s, y + 3 * s, s, s, '#3a2818');
    PR(ctx, x + 4 * s, y, 8 * s, s, '#8a5a3a');
  }
}
function drawMapMono(ctx, map, pal, x, y, s, mono) {
  if (!mono) { drawMap(ctx, map, pal, x, y, s); return; }
  const p2 = {};
  for (const k in pal) p2[k] = mono;
  drawMap(ctx, map, p2, x, y, s);
}

const ICONS = {
  concha: iconConcha, estrela: iconEstrela, siri: iconSiri, coco: iconCoco,
  peixe: iconPeixe, sombrinha: iconSombrinha,
  bolo: iconBolo, renda: iconRenda, cordel: iconCordel, barro: iconBarro,
};

// medalhão de fase/capítulo: sombra projetada + corpo + bisel + brilho opcional
function drawNode(ctx, x, y, r, base, face, glow = 0) {
  PR(ctx, x - r + 3, y - r + 6, r * 2, r * 2, 'rgba(0,0,0,0.28)'); // sombra
  if (glow > 0) {
    const g = 0.18 + glow * 0.22;
    PR(ctx, x - r - 4, y - r - 4, r * 2 + 8, r * 2 + 8, `rgba(255,240,160,${g})`);
  }
  PR(ctx, x - r, y - r, r * 2, r * 2, base);                              // borda
  PR(ctx, x - r + 4, y - r + 4, r * 2 - 8, r * 2 - 8, face);             // face
  PR(ctx, x - r + 4, y - r + 4, r * 2 - 8, 5, 'rgba(255,255,255,0.35)'); // luz no topo
  PR(ctx, x - r + 4, y + r - 9, r * 2 - 8, 5, 'rgba(0,0,0,0.18)');       // sombra na base
}

// conta do colar
function drawBead(ctx, x, y, r, color, filled = true) {
  if (filled) {
    PR(ctx, x - r, y - r / 2, r * 2, r, color);
    PR(ctx, x - r / 2, y - r, r, r * 2, color);
    PR(ctx, x - r / 2, y - r / 2, r, r / 2, 'rgba(255,255,255,0.5)');
  } else {
    PR(ctx, x - r, y - r / 2, r * 2, r, '#2a3a4f');
    PR(ctx, x - r / 2, y - r, r, r * 2, '#2a3a4f');
    PR(ctx, x - r + 2, y - r / 2 + 2, r * 2 - 4, r - 4, '#0f1d30');
    PR(ctx, x - r / 2 + 2, y - r + 2, r - 4, r * 2 - 4, '#0f1d30');
  }
}

// ---------- céu e mar (gradientes com dithering ordenado) ----------
// matriz de Bayer 4x4: transição suave entre cores mantendo o look de pixel
const BAYER4 = [
  [0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5],
];
// gradiente vertical dithered entre uma lista de cores (faixas suaves)
function skyGrad(ctx, stops, y0, y1, cell = 4) {
  const H = y1 - y0, segs = stops.length - 1;
  if (segs <= 0) { PR(ctx, 0, y0, 360, H, stops[0]); return; }
  for (let yy = 0; yy < H; yy += cell) {
    const k = (yy / H) * segs;
    const i = Math.min(segs - 1, Math.floor(k));
    const f = k - i;
    const ca = stops[i], cb = stops[i + 1];
    const brow = BAYER4[(yy / cell) & 3];
    for (let xx = 0; xx < 360; xx += cell) {
      const th = (brow[(xx / cell) & 3] + 0.5) / 16;
      PR(ctx, xx, y0 + yy, cell, cell, f > th ? cb : ca);
    }
  }
}
// base do mar: degradê de profundidade (estático)
function seaBase(ctx, y0, y1, base = '#1d6fa3', deep = '#15578a') {
  skyGrad(ctx, [base, base, deep], y0, y1, 4);
}
// espuma do mar em movimento (dinâmico)
function seaWaves(ctx, y0, y1, t, foam = '#bfe6f2') {
  for (let r = 0; r < 6; r++) {
    const y = y0 + 8 + r * ((y1 - y0 - 16) / 6);
    for (let k = 0; k < 5; k++) {
      const x = ((k * 90 + Math.sin(t * 1.2 + r * 1.7 + k) * 22) % 400) - 20;
      PR(ctx, x, y, 26, 3, foam);
    }
  }
}

// ---------- cenários por fase ----------
// Cada cena = { s(ctx): camada estática (céu, prédios, chão) | d(ctx,t): camada animada }
// A estática é renderizada uma vez num canvas offscreen e reaproveitada todo frame.
const SCENES = {
  1: {
    s(ctx) { // Dias de Sol — Marco Zero
      skyGrad(ctx, ['#5ab4e0', '#7ec8e8', '#9fd8f0', '#bfe6f2', '#d8f0f8'], 0, 420);
      casa(ctx, 420, 0);
      PR(ctx, 0, 420, 360, 220, '#d8c8a8'); // praça
      PR(ctx, 0, 420, 360, 4, 'rgba(255,255,255,0.18)');
      // disco circular da rosa dos ventos (piso fiel ao Marco Zero de Cícero Dias)
      drawRosaDosVentos(ctx, 180, 510, 128);
    },
    d(ctx, t) {
      sun(ctx, 290, 80, 26, t);
      cloudLayer(ctx, t, [
        { x: 20, y: 50, w: 58, sp: 4, c: '#ffffff' },
        { x: 210, y: 88, w: 42, sp: 7, c: '#f0f8fc' },
        { x: 120, y: 130, w: 30, sp: 11, c: '#eaf4fb' },
      ]);
      birds(ctx, t, 5, 150, 24, '#3a4a5f');
    },
  },
  2: {
    s(ctx) { // Praia de Boa Viagem
      skyGrad(ctx, ['#5ab4e0', '#7ec8e8', '#9fd8f0', '#bfe6f2'], 0, 280);
      seaBase(ctx, 280, 420, '#1d6fa3', '#15578a');
      sand(ctx, 420, 640);
      coqueiro(ctx, 30, 470, 90);
      coqueiro(ctx, 320, 500, 70);
    },
    d(ctx, t) {
      sun(ctx, 60, 70, 22, t);
      cloudLayer(ctx, t, [
        { x: 180, y: 60, w: 56, sp: 5, c: '#ffffff' },
        { x: 40, y: 120, w: 36, sp: 9, c: '#eaf4fb' },
        { x: 280, y: 150, w: 28, sp: 13, c: '#eaf4fb' },
      ]);
      birds(ctx, t, 6, 170, 30, '#3a4a5f');
      seaWaves(ctx, 280, 420, t);
      seaGlow(ctx, 60, 282, 416, t);
    },
  },
  3: {
    s(ctx) { // Águas do Tubarão
      skyGrad(ctx, ['#7ec8e8', '#9fd8f0', '#bfe6f2'], 0, 160);
      seaBase(ctx, 160, 560, '#1d6fa3', '#123f66');
      sand(ctx, 560, 640);
      PR(ctx, 30, 480, 4, 90, '#5a3a22'); // bandeira de alerta
      PR(ctx, 34, 480, 36, 24, '#d92f2f');
    },
    d(ctx, t) {
      cloudLayer(ctx, t, [
        { x: 40, y: 40, w: 50, sp: 6, c: '#ffffff' },
        { x: 230, y: 80, w: 34, sp: 10, c: '#eaf4fb' },
      ]);
      birds(ctx, t, 5, 90, 28, '#3a4a5f');
      seaWaves(ctx, 160, 560, t);
      drawShark(ctx, 200 + Math.sin(t * 0.7) * 60, 240, 3, Math.cos(t * 0.7) < 0);
    },
  },
  4: {
    s(ctx) { // Dias de Chuva
      skyGrad(ctx, ['#4a5b6a', '#5a6b7a', '#6b7d8c', '#7d8f9e'], 0, 420);
      casa(ctx, 420, 2);
      PR(ctx, 0, 420, 360, 220, '#5a6b7a');
      PR(ctx, 40, 460, 80, 8, '#7d9fb4'); // poças
      PR(ctx, 220, 520, 100, 8, '#7d9fb4');
    },
    d(ctx, t) {
      cloudLayer(ctx, t, [
        { x: 20, y: 36, w: 78, sp: 9, c: '#43525f' },
        { x: 180, y: 70, w: 96, sp: 14, c: '#3a4651' },
        { x: 300, y: 30, w: 60, sp: 20, c: '#4a5a68' },
      ]);
      // reflexo trêmulo nas poças
      PR(ctx, 40, 460, 80, 2, `rgba(200,224,240,${0.2 + Math.sin(t * 4) * 0.1})`);
      rainFx(ctx, t);
    },
  },
  5: {
    s(ctx) { // Mangue
      skyGrad(ctx, ['#7fae9e', '#8fb8a8', '#a8c8b8'], 0, 240);
      seaBase(ctx, 240, 440, '#3a5a45', '#2f4a39');
      mangueRoots(ctx, 440);
      PR(ctx, 0, 440, 360, 200, '#4a3a28'); // lama
      PR(ctx, 0, 440, 360, 3, 'rgba(120,150,120,0.2)');
      for (let i = 0; i < 14; i++) {
        const x = (i * 61) % 360;
        const y = 460 + (i * 43) % 160;
        PR(ctx, x, y, 6, 3, '#3a2d1e');
      }
    },
    d(ctx, t) {
      const bx = (t * 20) % 360;
      PR(ctx, bx, 500 + Math.sin(t * 3) * 4, 4, 4, '#6a5a42');
      PR(ctx, (bx + 180) % 360, 540 + Math.sin(t * 2.3) * 4, 3, 3, '#6a5a42');
    },
  },
  6: {
    s(ctx) { // Cultura Viva — mercado
      skyGrad(ctx, ['#e8c47a', '#e8b96a', '#e8a05a'], 0, 300);
      casa(ctx, 380, 4);
      PR(ctx, 0, 380, 360, 260, '#b08a5a');
      PR(ctx, 0, 380, 360, 3, 'rgba(255,240,200,0.18)');
    },
    d(ctx, t) {
      bandeirinhas(ctx, 40, t);
      bandeirinhas(ctx, 80, t + 2);
    },
  },
  7: {
    s(ctx) { // Noite de Maracatu
      skyGrad(ctx, ['#070d1e', '#0a1228', '#101a35', '#1a2545'], 0, 440);
      moon(ctx, 300, 74, 18);
      casaFar(ctx, 412, 6, 'rgba(58,74,108,0.6)');
      casaSilhueta(ctx, 440);
      PR(ctx, 0, 440, 360, 200, '#1a1525');
    },
    d(ctx, t) {
      stars(ctx, 50, 350, t);
      [40, 320].forEach(x => {
        PR(ctx, x, 380, 6, 60, '#4a3320');
        const f = Math.sin(t * 8 + x) * 3;
        PR(ctx, x - 4, 366 + f, 14, 4, 'rgba(242,150,60,0.25)'); // halo
        PR(ctx, x - 3, 364 + f, 12, 16, '#e8762a');
        PR(ctx, x - 1, 360 + f, 8, 10, '#f2c038');
      });
    },
  },
  8: {
    s(ctx) { // Frevo no Ar
      skyGrad(ctx, ['#5ab4e0', '#7ec8e8', '#9fd8f0', '#bfe6f2'], 0, 400);
      casa(ctx, 400, 1);
      PR(ctx, 0, 400, 360, 240, '#c8b490');
      PR(ctx, 0, 400, 360, 4, 'rgba(255,255,255,0.18)');
    },
    d(ctx, t) {
      sun(ctx, 310, 60, 20, t);
      bandeirinhas(ctx, 100, t);
      confete(ctx, t);
    },
  },
  9: {
    s(ctx) { // Manguebeat — crepúsculo
      skyGrad(ctx, ['#1f3a44', '#2a4a55', '#3a6a6a', '#5a8a78', '#8aa888'], 0, 420);
      casaSilhueta(ctx, 380, '#13242a');
      PR(ctx, 0, 380, 360, 260, '#2a2418'); // lama
      mangueRootsSil(ctx, 440);
      antena(ctx, 80, 560, 1.4);
      antena(ctx, 290, 580, 1);
    },
    d(ctx, t) {
      stars(ctx, 20, 160, t);
      const bx = (t * 14) % 360;
      PR(ctx, bx, 530, 4, 4, '#5a5242');
    },
  },
  10: {
    s(ctx) { // Jangadeiros ao Pôr do Sol
      skyGrad(ctx, ['#2a1f4a', '#3a2a55', '#8a3a5a', '#d95a4a', '#f2904a', '#f2c038'], 0, 380);
      seaBase(ctx, 380, 580, '#8a4a55', '#5a2a45');
      sand(ctx, 580, 640, '#c8a878', '#b09060');
      jangadaSil(ctx, 80, 470, 1, '#1a1020');
      jangadaSil(ctx, 280, 430, 0.7, '#1a1020');
    },
    d(ctx, t) {
      sun(ctx, 180, 350, 30, t, '#fff0a0', '#ffd94a');
      birds(ctx, t, 6, 110, 22, '#3a2238');
      seaWaves(ctx, 380, 580, t, '#f2b080');
      seaGlow(ctx, 180, 382, 576, t, 'rgba(255,224,150,0.45)');
    },
  },
  11: {
    s(ctx) { // Interior da Igreja N. S. da Piedade — nave dourada, o "silêncio dourado lá dentro"
      // parede de fundo em âmbar, escurecendo do alto (penumbra da abóbada) ao piso
      skyGrad(ctx, ['#2a1c0e', '#3d2912', '#54381a', '#6e4d26'], 0, 470);
      PR(ctx, 0, 470, 360, 170, '#3a2812'); // piso de pedra
      PR(ctx, 0, 470, 360, 4, 'rgba(242,192,90,0.18)'); // brilho na linha do piso

      // arco da nave ao fundo (moldura dourada em torno do altar)
      PR(ctx, 96, 150, 168, 320, '#1c1208'); // recesso escuro do altar-mor
      PR(ctx, 96, 150, 168, 6, '#d9b25c');
      PR(ctx, 96, 150, 6, 320, '#d9b25c');
      PR(ctx, 258, 150, 6, 320, '#d9b25c');
      // topo em arco pleno (degraus de pixel formando a curva)
      for (let i = 0; i < 6; i++) {
        const inset = [0, 10, 22, 36, 54, 80][i];
        PR(ctx, 96 + inset, 150 - (i + 1) * 8, 168 - inset * 2, 8, '#d9b25c');
        PR(ctx, 96 + inset + 6, 150 - (i + 1) * 8, 156 - inset * 2, 8, '#2a1c0e');
      }

      // vitral colorido atrás do altar — rosácea de losangos
      const vit = ['#c0392b', '#2e6da4', '#f2c038', '#3f9b52', '#8a4a9e'];
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 4; c++) {
          const col = vit[(r + c) % vit.length];
          PR(ctx, 116 + c * 32, 172 + r * 30, 28, 26, col);
          PR(ctx, 116 + c * 32, 172 + r * 30, 28, 2, 'rgba(255,255,255,0.12)'); // chumbo do vitral
        }
      }
      PR(ctx, 112, 168, 136, 4, '#3a2812'); // moldura do vitral
      PR(ctx, 112, 320, 136, 4, '#3a2812');

      // altar central diante do vitral
      PR(ctx, 150, 360, 60, 50, '#caa15a'); // mesa do altar
      PR(ctx, 150, 360, 60, 6, '#f2c038');
      PR(ctx, 168, 410, 24, 60, '#9c7a3e'); // base
      PR(ctx, 174, 332, 12, 28, '#d9b25c'); // cruz — haste
      PR(ctx, 168, 340, 24, 8, '#d9b25c');  // cruz — travessa

      // colunas laterais da nave (perspectiva: estreitam pro fundo)
      [[20, 60], [300, 60], [44, 40], [284, 40]].forEach(([x, w]) => {
        PR(ctx, x, 200, w, 270, '#4a341a');
        PR(ctx, x, 200, 4, 270, 'rgba(242,192,90,0.22)'); // luz na quina
      });

      // bancos da nave (duas fileiras)
      [430, 452].forEach(y => {
        PR(ctx, 70, y, 90, 12, '#5a3f20');
        PR(ctx, 200, y, 90, 12, '#5a3f20');
        PR(ctx, 70, y, 90, 2, '#7a5a30');
        PR(ctx, 200, y, 90, 2, '#7a5a30');
      });
    },
    d(ctx, t) {
      // velas tremeluzentes nos candelabros — chama oscila por sin(t)
      const velas = [[120, 360], [240, 360], [60, 430], [300, 430]];
      velas.forEach(([x, y], i) => {
        const f = Math.sin(t * 6 + i * 1.7) * 2;
        PR(ctx, x - 2, y, 4, 16, '#e8e0c8');               // corpo da vela
        PR(ctx, x - 4, y - 8 + f, 8, 6, 'rgba(242,192,90,0.28)'); // halo
        PR(ctx, x - 2, y - 10 + f, 4, 12, '#f2904a');      // chama externa
        PR(ctx, x - 1, y - 12 + f, 2, 8, '#f2c038');       // núcleo dourado
      });
      // feixe dourado descendo sobre o altar (respiração lenta)
      const beam = 0.10 + Math.sin(t * 1.2) * 0.05;
      PR(ctx, 150, 156, 60, 210, `rgba(242,200,120,${beam})`);
    },
  },
};

function casaSilhueta(ctx, yBase, c = '#0d1525') {
  let x = -8, i = 0;
  while (x < 360) {
    const w = 44 + ((i * 13) % 3) * 8;
    const h = 70 + ((i * 7) % 4) * 14;
    PR(ctx, x, yBase - h, w, h, c);
    x += w + 4;
    i++;
  }
  PR(ctx, 296, yBase - 140, 30, 140, c);
  PR(ctx, 304, yBase - 162, 14, 24, c);
}
function mangueRootsSil(ctx, yBase) {
  const far = { wood: '#1d2817', woodD: '#1d2817', leaf: '#22301a', leafD: '#22301a', leafL: '#22301a' };
  for (let i = 0; i < 5; i++) mangueTree(ctx, 30 + i * 78, yBase - 14, 40 + (i * 17 % 16), far);
  const near = { wood: '#0e140a', woodD: '#0e140a', leaf: '#13110a', leafD: '#13110a', leafL: '#13110a' };
  for (let i = 0; i < 4; i++) mangueTree(ctx, 6 + i * 104, yBase, 58 + (i * 23 % 24), near);
}

// ---------- Rosa dos Ventos do Marco Zero (piso circular de Cícero Dias) ----------
// Mosaico real: disco no calçadão terracota, anel azul, campo creme e uma rosa dos
// ventos de pontas facetadas em PASTÉIS suaves (não cores primárias) — 8 pontas longas
// alternando verde-sálvia/rosa-velho e 8 curtas intercaladas azul-claro/dourado-pálido,
// com medalhão central. Compartilhado entre SCENES[1].s e OrbitPuzzle (tabuleiro).
function drawRosaDosVentos(ctx, cx, cy, r) {
  ctx.save();
  // disco circular: borda terracota do calçadão → aro teal → faixa azul-clara → campo creme
  fillCircle(ctx, cx, cy, r,        '#c08456'); // calçada portuguesa avermelhada (entorno)
  fillCircle(ctx, cx, cy, r * 0.97, '#3f86a8'); // aro teal (borda do mosaico)
  fillCircle(ctx, cx, cy, r * 0.91, '#9cc0db'); // faixa azul-clara
  fillCircle(ctx, cx, cy, r * 0.80, '#f1e8d0'); // campo creme/marfim
  ctx.strokeStyle = 'rgba(63,134,168,0.55)';
  ctx.lineWidth = Math.max(1, r * 0.012);
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.80, 0, Math.PI * 2); ctx.stroke();

  // ponta facetada da rosa: kite dividido no eixo (metade clara + metade sombra)
  const pt = (a, len, halfW, light, dark) => {
    const tx = cx + Math.cos(a) * len,            ty = cy + Math.sin(a) * len;
    const lx = cx + Math.cos(a - Math.PI / 2) * halfW, ly = cy + Math.sin(a - Math.PI / 2) * halfW;
    const rx = cx + Math.cos(a + Math.PI / 2) * halfW, ry = cy + Math.sin(a + Math.PI / 2) * halfW;
    ctx.fillStyle = light;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(lx, ly); ctx.lineTo(tx, ty); ctx.closePath(); ctx.fill();
    ctx.fillStyle = dark;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(rx, ry); ctx.lineTo(tx, ty); ctx.closePath(); ctx.fill();
  };

  // 8 pontas curtas intercaladas (diagonais secundárias), defasadas 22,5° — desenhadas
  // primeiro pra ficarem ATRÁS das longas. Azul-claro e dourado-pálido alternados.
  const SHORT = [['#aecbe4', '#84a9cc'], ['#ecd79a', '#d4ba70']];
  for (let i = 0; i < 8; i++) {
    const a = ((i + 0.5) / 8) * Math.PI * 2 - Math.PI / 2;
    pt(a, r * 0.42, r * 0.085, SHORT[i % 2][0], SHORT[i % 2][1]);
  }
  // 8 pontas longas (N/L/S/O + diagonais) — verde-sálvia e rosa-velho alternados
  const LONG = [['#a9c690', '#86a96e'], ['#e1b3aa', '#c78f86']];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    pt(a, r * 0.68, r * 0.135, LONG[i % 2][0], LONG[i % 2][1]);
  }

  // medalhão central: anel creme com aro fino e miolo dourado (acento --ouro)
  const rc = r * 0.17;
  fillCircle(ctx, cx, cy, rc,        '#f1e8d0');
  ctx.strokeStyle = '#3f86a8'; ctx.lineWidth = Math.max(1, r * 0.012);
  ctx.beginPath(); ctx.arc(cx, cy, rc, 0, Math.PI * 2); ctx.stroke();
  fillCircle(ctx, cx, cy, rc * 0.5, '#f2c038');

  // marcação sutil do Norte (orienta o OrbitPuzzle, sem competir com a rosa)
  const nSize = Math.max(7, Math.round(r * 0.12));
  ctx.fillStyle = 'rgba(20,46,72,0.85)';
  ctx.font = `bold ${nSize}px "Courier New", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('N', cx, cy - r * 0.74);
  ctx.restore();
}

// cache de camadas estáticas das cenas (renderizadas uma vez por cena)
const _sceneCache = {};
function drawScene(n, ctx, t) {
  const sc = SCENES[n] || SCENES[1];
  let cv = _sceneCache[n];
  if (!cv) {
    cv = document.createElement('canvas');
    cv.width = 360; cv.height = 640;
    sc.s(cv.getContext('2d'));
    _sceneCache[n] = cv;
  }
  ctx.drawImage(cv, 0, 0);
  sc.d(ctx, t);
}
