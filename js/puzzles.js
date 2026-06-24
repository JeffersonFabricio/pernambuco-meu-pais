// ============================================================
// Marés do Recife — 10 motores de puzzle parametrizáveis
// Interface: update(dt,t), draw(ctx,t), tap(x,y),
//            dragStart/dragMove/dragEnd opcionais, solved:bool
// Cada construtor recebe cfg (de engineCfg) com defaults.
// Área útil: x 20..340, y 130..520
// ============================================================
const PA = { x: 20, y: 130, w: 320, h: 390 };

function pTxt(ctx, str, x, y, size = 14, color = '#fff', align = 'center', bold = true) {
  ctx.fillStyle = color;
  ctx.font = `${bold ? 'bold ' : ''}${size}px "Courier New", monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}
function panel(ctx, x, y, w, h, fill = 'rgba(10,20,38,0.82)', stroke = '#f2c038') {
  PR(ctx, x, y, w, h, fill);
  PR(ctx, x, y, w, 3, stroke);
  PR(ctx, x, y + h - 3, w, 3, stroke);
  PR(ctx, x, y, 3, h, stroke);
  PR(ctx, x + w - 3, y, 3, h, stroke);
}
function inBox(px, py, x, y, w, h) { return px >= x && px < x + w && py >= y && py < y + h; }
function rnd(n) { return Math.floor(Math.random() * n); }
function shuffle(a) { return a.sort(() => Math.random() - 0.5); }
// suavização exponencial (independente de framerate, com dt limitado): tween de movimento
function approach(cur, target, dt, speed = 16) {
  const d = target - cur;
  if (Math.abs(d) < 0.002) return target;
  return cur + d * Math.min(1, dt * speed);
}

const ICON_NAMES = {
  concha: 'concha', estrela: 'estrela', siri: 'siri', coco: 'coco', peixe: 'peixe',
  sombrinha: 'sombrinha', bolo: 'bolo de rolo', renda: 'renda', cordel: 'cordel', barro: 'barro',
};

// ---------- 1: Acenda o casa (lights-out NxN) ----------
class LightsPuzzle {
  constructor(cfg = {}) {
    this.n = cfg.n || 3;
    this.s = [84, 62, 50][this.n - 3] || 50;
    this.gap = 8;
    this.g = Array(this.n * this.n).fill(false);
    do {
      this.g.fill(false);
      const taps = this.n + 2 + rnd(this.n * 2);
      for (let i = 0; i < taps; i++) this.toggle(rnd(this.n * this.n));
    } while (this.g.every(v => v));
    this.solved = false;
  }
  toggle(i) {
    const n = this.n, r = Math.floor(i / n), c = i % n;
    [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n) this.g[nr * n + nc] = !this.g[nr * n + nc];
    });
  }
  cellRect(i) {
    const n = this.n, s = this.s, gap = this.gap;
    const x0 = PA.x + (PA.w - n * s - (n - 1) * gap) / 2;
    const y0 = PA.y + 64;
    return [x0 + (i % n) * (s + gap), y0 + Math.floor(i / n) * (s + gap), s, s];
  }
  tap(x, y) {
    if (this.solved) return;
    for (let i = 0; i < this.n * this.n; i++) {
      const [cx, cy, s] = this.cellRect(i);
      if (inBox(x, y, cx, cy, s, s)) {
        this.toggle(i);
        AudioFX.flip();
        if (this.g.every(v => v)) { this.solved = true; AudioFX.win(); }
        return;
      }
    }
  }
  update() {}
  draw(ctx, t) {
    const n = this.n;
    const [fx, fy] = this.cellRect(0);
    const [lx, ly, ls] = this.cellRect(n * n - 1);
    PR(ctx, fx - 18, fy - 34, (lx + ls) - fx + 36, (ly + ls) - fy + 52, '#d94f4f');
    PR(ctx, fx - 18, fy - 34, (lx + ls) - fx + 36, 9, '#f5efe0');
    PR(ctx, fx - 18, ly + ls + 6, (lx + ls) - fx + 36, 12, '#f5efe0');
    for (let i = 0; i < n * n; i++) {
      const [cx, cy, s] = this.cellRect(i);
      const on = this.g[i];
      PR(ctx, cx - 5, cy - 5, s + 10, s + 10, '#f5efe0');
      PR(ctx, cx, cy, s, s, on ? '#ffd94a' : '#1a2a3f');
      if (on) {
        PR(ctx, cx + 6, cy + 6, s - 12, 8, '#fff0a0');
      } else {
        PR(ctx, cx + s / 2 - 2, cy, 4, s, '#0e1a2a');
        PR(ctx, cx, cy + s / 2 - 2, s, 4, '#0e1a2a');
      }
    }
    const acesas = this.g.filter(v => v).length;
    pTxt(ctx, `${acesas}/${n * n} janelas acesas`, 180, ly + ls + 36, 14, '#fff8d0');
  }
}

// ---------- 2: Pares de Conchas (memória) ----------
class MemoryPuzzle {
  constructor(cfg = {}) {
    const pairs = cfg.pairs || 6;
    const kinds = shuffle(Object.keys(ICONS).slice()).slice(0, pairs);
    this.cols = pairs <= 6 ? 3 : 4;
    this.rows = Math.ceil((pairs * 2) / this.cols);
    this.cw = this.cols === 3 ? 96 : 74;
    this.ch = this.rows <= 4 ? 84 : 66;
    this.cards = shuffle([...kinds, ...kinds].map(k => ({ k, up: false, done: false })));
    this.open = [];
    this.lock = 0;
    this.solved = false;
  }
  cellRect(i) {
    const gap = 8;
    const x0 = PA.x + (PA.w - this.cols * this.cw - (this.cols - 1) * gap) / 2;
    const y0 = PA.y + 24;
    return [x0 + (i % this.cols) * (this.cw + gap), y0 + Math.floor(i / this.cols) * (this.ch + gap), this.cw, this.ch];
  }
  tap(x, y) {
    if (this.solved || this.lock > 0) return;
    for (let i = 0; i < this.cards.length; i++) {
      const c = this.cards[i];
      if (c.done || c.up) continue;
      const [cx, cy, w, h] = this.cellRect(i);
      if (!inBox(x, y, cx, cy, w, h)) continue;
      c.up = true;
      AudioFX.flip();
      this.open.push(i);
      if (this.open.length === 2) {
        const [a, b] = this.open;
        if (this.cards[a].k === this.cards[b].k) {
          this.cards[a].done = this.cards[b].done = true;
          this.open = [];
          AudioFX.ok();
          if (this.cards.every(cc => cc.done)) { this.solved = true; AudioFX.win(); }
        } else this.lock = 0.8;
      }
      return;
    }
  }
  update(dt) {
    if (this.lock > 0) {
      this.lock -= dt;
      if (this.lock <= 0) {
        this.open.forEach(i => this.cards[i].up = false);
        this.open = [];
        AudioFX.bad();
      }
    }
  }
  draw(ctx, t) {
    const isc = Math.min(this.cw, this.ch) / 26;
    for (let i = 0; i < this.cards.length; i++) {
      const c = this.cards[i];
      const [cx, cy, w, h] = this.cellRect(i);
      if (c.done) {
        PR(ctx, cx, cy, w, h, 'rgba(255,255,255,0.12)');
        ICONS[c.k](ctx, cx + w / 2 - 8 * isc, cy + h / 2 - 7.5 * isc, isc);
        continue;
      }
      if (c.up) {
        PR(ctx, cx, cy, w, h, '#f5efe0');
        PR(ctx, cx + 3, cy + 3, w - 6, h - 6, '#e8dcc0');
        ICONS[c.k](ctx, cx + w / 2 - 8 * isc, cy + h / 2 - 7.5 * isc, isc);
      } else {
        PR(ctx, cx, cy, w, h, '#1d6fa3');
        PR(ctx, cx + 3, cy + 3, w - 6, h - 6, '#2a85bd');
        const wv = Math.sin(t * 2 + i) * 2;
        PR(ctx, cx + 12, cy + h / 2 - 4 + wv, w - 24, 3, '#bfe6f2');
        PR(ctx, cx + 18, cy + h / 2 + 5 - wv, w - 36, 3, '#9fd8f0');
      }
    }
  }
}

// ---------- 3: Águas do Tubarão (grade por turnos) ----------
class SharkPuzzle {
  constructor(cfg = {}) {
    this.cols = 7; this.rows = 8;
    this.cs = 42;
    this.x0 = PA.x + (PA.w - this.cols * this.cs) / 2;
    this.y0 = PA.y + 30;
    this.fast = !!cfg.fast;
    this.p = { r: 0, c: 3 };
    this.pd = { r: 0, c: 3 }; // posição animada do banhista
    const nS = Math.min(cfg.sharks || 3, 5);
    const rows = shuffle([1, 2, 3, 4, 5, 6]).slice(0, nS);
    this.sharks = rows.map(r => ({ r, c: rnd(this.cols), d: Math.random() < 0.5 ? 1 : -1 }));
    // nenhum tubarão começa colado no banhista
    this.sharks.forEach(s => { if (s.r <= 1 && Math.abs(s.c - 3) < 2) s.c = (s.c + 3) % this.cols; });
    this.sharks.forEach(s => { s.cd = s.c; }); // coluna animada de cada tubarão
    this.solved = false;
    this.flash = 0;
  }
  stepSharks() {
    const sub = this.fast ? 2 : 1;
    for (let k = 0; k < sub; k++) {
      for (const s of this.sharks) {
        s.c += s.d;
        if (s.c <= 0 || s.c >= this.cols - 1) s.d *= -1;
        s.c = Math.max(0, Math.min(this.cols - 1, s.c));
      }
      if (this.sharks.some(s => s.r === this.p.r && s.c === this.p.c)) return true;
    }
    return false;
  }
  tap(x, y) {
    if (this.solved) return;
    const c = Math.floor((x - this.x0) / this.cs);
    const r = Math.floor((y - this.y0) / this.cs);
    if (c < 0 || c >= this.cols || r < 0 || r >= this.rows) return;
    if (Math.abs(r - this.p.r) + Math.abs(c - this.p.c) !== 1) return;
    this.p = { r, c };
    AudioFX.step();
    const hit = this.stepSharks() || this.sharks.some(s => s.r === this.p.r && s.c === this.p.c);
    if (hit) {
      AudioFX.splash();
      this.flash = 0.6;
      this.p = { r: 0, c: 3 };
      this.pd = { r: 0, c: 3 }; // volta ao início sem deslizar pela tela toda
      return;
    }
    if (this.p.r === this.rows - 1) { this.solved = true; AudioFX.win(); }
  }
  update(dt) {
    if (this.flash > 0) this.flash -= dt;
    this.pd.r = approach(this.pd.r, this.p.r, dt, 20);
    this.pd.c = approach(this.pd.c, this.p.c, dt, 20);
    for (const s of this.sharks) s.cd = approach(s.cd, s.c, dt, 14);
  }
  draw(ctx, t) {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const x = this.x0 + c * this.cs, y = this.y0 + r * this.cs;
        const shore = r === this.rows - 1;
        PR(ctx, x, y, this.cs - 2, this.cs - 2,
          shore ? '#e8d49a' : (r + c) % 2 ? '#1d6fa3' : '#2a85bd');
        if (!shore && (r * 7 + c) % 5 === 0) {
          PR(ctx, x + 6, y + 10 + Math.sin(t * 2 + r + c) * 2, 14, 2, '#bfe6f2');
        }
      }
    }
    for (const s of this.sharks) {
      const x = this.x0 + s.cd * this.cs, y = this.y0 + s.r * this.cs;
      const wob = Math.sin(t * 3 + s.r) * 1.5; // nado ondulante
      drawShark(ctx, x + 4, y + 8 + wob, 2, s.d < 0);
      const sym = s.d > 0 ? (this.fast ? '»' : '›') : (this.fast ? '«' : '‹');
      const ax = s.d > 0 ? x + this.cs - 2 : x - 4;
      pTxt(ctx, sym, ax + 2, y + this.cs / 2, 15, '#fff8d0');
    }
    const px = this.x0 + this.pd.c * this.cs, py = this.y0 + this.pd.r * this.cs;
    const bob = Math.sin(t * 4) * 2;
    PR(ctx, px + 14, py + 8 + bob, 12, 12, '#a9683f');
    PR(ctx, px + 16, py + 11 + bob, 3, 3, '#1c0f08');
    PR(ctx, px + 22, py + 11 + bob, 3, 3, '#1c0f08');
    PR(ctx, px + 8, py + 20 + bob, 26, 6, '#d94f4f');
    PR(ctx, px + 4, py + 22 + bob, 6, 4, '#a9683f');
    PR(ctx, px + 32, py + 22 + bob, 6, 4, '#a9683f');
    if (this.flash > 0) {
      PR(ctx, PA.x, PA.y, PA.w, PA.h, `rgba(217,47,47,${this.flash * 0.4})`);
      pTxt(ctx, 'Quase! Volte ao início.', 180, PA.y + 14, 14, '#ffd0d0');
    }
    pTxt(ctx, 'fundo do mar', this.x0 + 70, this.y0 - 12, 11, '#bfe6f2', 'center', false);
    pTxt(ctx, 'AREIA — chegue aqui!', 180, this.y0 + this.rows * this.cs + 14, 13, '#f2c038');
  }
}

// ---------- 4: Canos da Chuva (girar tubos NxN) ----------
class PipePuzzle {
  constructor(cfg = {}) {
    const n = this.n = cfg.n || 4;
    this.cs = n === 4 ? 72 : 58;
    this.x0 = PA.x + (PA.w - n * this.cs) / 2;
    this.y0 = PA.y + 46;
    // caminho-solução: escada aleatória de (0,0) a (n-1,n-1)
    const moves = shuffle([...Array(n - 1).fill('S'), ...Array(n - 1).fill('E')]);
    const sol = {};
    let r = 0, c = 0, inDir = 'N';
    const OPP = { N: 'S', S: 'N', E: 'W', W: 'E' };
    for (const mv of moves) {
      sol[`${r},${c}`] = [inDir, mv];
      if (mv === 'S') r++; else c++;
      inDir = OPP[mv];
    }
    sol[`${r},${c}`] = [inDir, 'S']; // última cai na cisterna
    this.grid = [];
    for (let rr = 0; rr < n; rr++) {
      for (let cc = 0; cc < n; cc++) {
        let dirs = sol[`${rr},${cc}`];
        if (!dirs) dirs = Math.random() < 0.5 ? ['N', 'S'] : ['N', 'E'];
        this.grid.push({ dirs, rot: rnd(4) });
      }
    }
    if (this.connected().won) this.grid[0].rot = (this.grid[0].rot + 1) % 4;
    this.solved = false;
    this.flow = this.connected();
  }
  rotDirs(cell) {
    const order = ['N', 'E', 'S', 'W'];
    return cell.dirs.map(d => order[(order.indexOf(d) + cell.rot) % 4]);
  }
  connected() {
    const n = this.n;
    const OPP = { N: 'S', S: 'N', E: 'W', W: 'E' };
    const DELTA = { N: [-1, 0], S: [1, 0], E: [0, 1], W: [0, -1] };
    const wet = new Set();
    if (!this.rotDirs(this.grid[0]).includes('N')) return { wet, won: false };
    const q = [[0, 0]];
    wet.add('0,0');
    while (q.length) {
      const [r, c] = q.shift();
      for (const d of this.rotDirs(this.grid[r * n + c])) {
        const [dr, dc] = DELTA[d];
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
        const key = `${nr},${nc}`;
        if (wet.has(key)) continue;
        if (this.rotDirs(this.grid[nr * n + nc]).includes(OPP[d])) {
          wet.add(key);
          q.push([nr, nc]);
        }
      }
    }
    const won = wet.has(`${n - 1},${n - 1}`) && this.rotDirs(this.grid[n * n - 1]).includes('S');
    return { wet, won };
  }
  tap(x, y) {
    if (this.solved) return;
    const n = this.n;
    const c = Math.floor((x - this.x0) / this.cs);
    const r = Math.floor((y - this.y0) / this.cs);
    if (c < 0 || c >= n || r < 0 || r >= n) return;
    this.grid[r * n + c].rot = (this.grid[r * n + c].rot + 1) % 4;
    AudioFX.tap();
    this.flow = this.connected();
    if (this.flow.won) { this.solved = true; AudioFX.win(); }
  }
  update() {}
  draw(ctx, t) {
    const n = this.n;
    PR(ctx, this.x0 + 8, this.y0 - 24, this.cs - 16, 18, '#5a6b7a');
    pTxt(ctx, 'calha', this.x0 + this.cs / 2, this.y0 - 34, 11, '#bfe6f2', 'center', false);
    const gx = this.x0 + (n - 1) * this.cs, gy = this.y0 + n * this.cs;
    PR(ctx, gx + 6, gy + 4, this.cs - 12, 24, '#4a5a68');
    PR(ctx, gx + 10, gy + 8, this.cs - 20, 16, this.solved ? '#5b8bd9' : '#1a2a3f');
    pTxt(ctx, 'cisterna', gx + this.cs / 2, gy + 40, 11, '#bfe6f2', 'center', false);
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const cell = this.grid[r * n + c];
        const x = this.x0 + c * this.cs, y = this.y0 + r * this.cs;
        const isWet = this.flow.wet.has(`${r},${c}`);
        PR(ctx, x + 1, y + 1, this.cs - 2, this.cs - 2, '#2a3340');
        PR(ctx, x + 3, y + 3, this.cs - 6, this.cs - 6, '#39434f');
        const pc = isWet ? '#5b9fd9' : '#6e7a86';
        const m = this.cs / 2, w = Math.max(10, this.cs / 5);
        PR(ctx, x + m - w / 2, y + m - w / 2, w, w, pc);
        for (const d of this.rotDirs(cell)) {
          if (d === 'N') PR(ctx, x + m - w / 2, y, w, m, pc);
          if (d === 'S') PR(ctx, x + m - w / 2, y + m, w, m, pc);
          if (d === 'E') PR(ctx, x + m, y + m - w / 2, m, w, pc);
          if (d === 'W') PR(ctx, x, y + m - w / 2, m, w, pc);
        }
        if (isWet) PR(ctx, x + m - 2, y + m - 5 + ((t * 30) % 10) * 0.5, 4, 4, '#8fc4ec');
      }
    }
  }
}

// ---------- 5: Labirinto do Uçá (gerado proceduralmente) ----------
class MazePuzzle {
  constructor(cfg = {}) {
    const cols = this.cols = cfg.cols || 9;
    const rows = this.rows = cfg.rows || 11;
    this.totalLeaves = cfg.leaves || 3;
    // gerador: backtracker recursivo (labirinto perfeito = tudo alcançável)
    const m = Array.from({ length: rows }, () => Array(cols).fill('#'));
    const carve = (r, c) => {
      m[r][c] = '.';
      for (const [dr, dc] of shuffle([[-2, 0], [2, 0], [0, -2], [0, 2]])) {
        const nr = r + dr, nc = c + dc;
        if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && m[nr][nc] === '#') {
          m[r + dr / 2][c + dc / 2] = '.';
          carve(nr, nc);
        }
      }
    };
    carve(1, 1);
    m[rows - 2][cols - 2] = 'E';
    const opens = [];
    for (let r = 1; r < rows - 1; r++) {
      for (let c = 1; c < cols - 1; c++) {
        if (m[r][c] === '.' && (r + c > 5) && !(r === 1 && c === 1)) opens.push([r, c]);
      }
    }
    shuffle(opens).slice(0, this.totalLeaves).forEach(([r, c]) => m[r][c] = 'L');
    this.map = m;
    this.cs = Math.min(34, Math.floor(PA.w / cols), Math.floor((PA.h - 50) / rows));
    this.x0 = PA.x + (PA.w - cols * this.cs) / 2;
    this.y0 = PA.y + 10;
    this.p = { r: 1, c: 1 };
    this.disp = { r: 1, c: 1 }; // posição animada (tween)
    this.pop = 0;              // mini "salto" ao pegar folha
    this.leaves = 0;
    this.solved = false;
  }
  move(dr, dc) {
    if (this.solved) return;
    const nr = this.p.r + dr, nc = this.p.c + dc;
    const cell = this.map[nr] && this.map[nr][nc];
    if (!cell || cell === '#') { AudioFX.tap(); return; }
    this.p = { r: nr, c: nc };
    AudioFX.step();
    if (cell === 'L') {
      this.map[nr][nc] = '.';
      this.leaves++;
      this.pop = 0.3;
      AudioFX.ok();
    }
    if (cell === 'E' && this.leaves >= this.totalLeaves) {
      this.solved = true;
      AudioFX.win();
    }
  }
  dragStart(x, y) { this.sx = x; this.sy = y; }
  dragEnd(x, y) {
    const dx = x - this.sx, dy = y - this.sy;
    if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return false;
    if (Math.abs(dx) > Math.abs(dy)) this.move(0, dx > 0 ? 1 : -1);
    else this.move(dy > 0 ? 1 : -1, 0);
    return true;
  }
  tap(x, y) {
    const px = this.x0 + this.p.c * this.cs + this.cs / 2;
    const py = this.y0 + this.p.r * this.cs + this.cs / 2;
    const dx = x - px, dy = y - py;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
    if (Math.abs(dx) > Math.abs(dy)) this.move(0, dx > 0 ? 1 : -1);
    else this.move(dy > 0 ? 1 : -1, 0);
  }
  update(dt) {
    this.disp.r = approach(this.disp.r, this.p.r, dt, 18);
    this.disp.c = approach(this.disp.c, this.p.c, dt, 18);
    if (this.pop > 0) this.pop -= dt;
  }
  draw(ctx, t) {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const x = this.x0 + c * this.cs, y = this.y0 + r * this.cs;
        const cell = this.map[r][c];
        if (cell === '#') {
          PR(ctx, x, y, this.cs, this.cs, '#3a2818');
          PR(ctx, x + 3, y + 2, 5, this.cs - 4, '#4a3320');
          PR(ctx, x + this.cs - 9, y + 4, 4, this.cs - 8, '#4a3320');
        } else {
          PR(ctx, x, y, this.cs, this.cs, '#5a4630');
          if ((r * this.cols + c) % 4 === 0) PR(ctx, x + 6, y + 8, 4, 2, '#4a3a26');
          if (cell === 'L') {
            const f = Math.sin(t * 3 + r + c) * 2;
            PR(ctx, x + this.cs * 0.25, y + this.cs * 0.35 + f, this.cs * 0.5, this.cs * 0.25, '#3f9b52');
            PR(ctx, x + this.cs * 0.4, y + this.cs * 0.22 + f, this.cs * 0.22, this.cs * 0.46, '#3f9b52');
          }
          if (cell === 'E') {
            const open = this.leaves >= this.totalLeaves;
            PR(ctx, x + 3, y + 3, this.cs - 6, this.cs - 6, open ? '#f2c038' : '#2a2418');
            pTxt(ctx, open ? '★' : '✕', x + this.cs / 2, y + this.cs / 2, this.cs * 0.5, open ? '#7c3a2d' : '#5a4630');
          }
        }
      }
    }
    const px = this.x0 + this.disp.c * this.cs, py = this.y0 + this.disp.r * this.cs;
    const hop = this.pop > 0 ? -Math.sin(this.pop / 0.3 * Math.PI) * this.cs * 0.18 : 0;
    // sombrinha de sombra sob o uçá (dá apoio ao chão)
    PR(ctx, px + this.cs * 0.25, py + this.cs * 0.78, this.cs * 0.5, this.cs * 0.12, 'rgba(0,0,0,0.22)');
    drawCrab(ctx, px + 1, py + this.cs * 0.15 + hop, this.cs / 14);
    pTxt(ctx, `Folhas: ${this.leaves}/${this.totalLeaves}`, 180, this.y0 + this.rows * this.cs + 16, 13, '#bfe6a0');
  }
}

// ---------- 6: Sombras da Cultura ----------
class ShadowPuzzle {
  constructor(cfg = {}) {
    const n = this.n = Math.min(cfg.items || 4, 6);
    const kinds = shuffle(Object.keys(ICONS).slice()).slice(0, n);
    this.items = shuffle(kinds.slice());
    this.shadows = shuffle(kinds.slice());
    this.s = Math.min(70, Math.floor((PA.w - 16 - (n - 1) * 8) / n));
    this.matched = new Set();
    this.sel = -1;
    this.shake = 0;
    this.solved = false;
  }
  itemRect(i) {
    const s = this.s, gap = 8;
    const x0 = PA.x + (PA.w - this.n * s - (this.n - 1) * gap) / 2;
    return [x0 + i * (s + gap), PA.y + 56, s, s];
  }
  shadowRect(i) {
    const s = this.s, gap = 8;
    const x0 = PA.x + (PA.w - this.n * s - (this.n - 1) * gap) / 2;
    return [x0 + i * (s + gap), PA.y + 236, s, s];
  }
  tap(x, y) {
    if (this.solved) return;
    for (let i = 0; i < this.n; i++) {
      const [ix, iy, s] = this.itemRect(i);
      if (inBox(x, y, ix, iy, s, s) && !this.matched.has(this.items[i])) {
        this.sel = i;
        AudioFX.tap();
        return;
      }
    }
    if (this.sel < 0) return;
    for (let i = 0; i < this.n; i++) {
      const [sx, sy, s] = this.shadowRect(i);
      if (inBox(x, y, sx, sy, s, s) && !this.matched.has(this.shadows[i])) {
        if (this.shadows[i] === this.items[this.sel]) {
          this.matched.add(this.shadows[i]);
          AudioFX.ok();
          this.sel = -1;
          if (this.matched.size === this.n) { this.solved = true; AudioFX.win(); }
        } else {
          this.shake = 0.4;
          this.sel = -1;
          AudioFX.bad();
        }
        return;
      }
    }
  }
  update(dt) { if (this.shake > 0) this.shake -= dt; }
  draw(ctx, t) {
    const isc = (this.s - 12) / 16;
    pTxt(ctx, 'TESOUROS', 180, PA.y + 38, 13, '#f2c038');
    for (let i = 0; i < this.n; i++) {
      const k = this.items[i];
      const [x, y, s] = this.itemRect(i);
      const done = this.matched.has(k);
      PR(ctx, x, y, s, s, done ? 'rgba(103,176,107,0.25)' : '#e8dcc0');
      if (this.sel === i) {
        PR(ctx, x - 3, y - 3, s + 6, 3, '#f2c038');
        PR(ctx, x - 3, y + s, s + 6, 3, '#f2c038');
        PR(ctx, x - 3, y, 3, s, '#f2c038');
        PR(ctx, x + s, y, 3, s, '#f2c038');
      }
      if (!done) {
        ICONS[k](ctx, x + s / 2 - 8 * isc, y + s / 2 - 8 * isc, isc);
        pTxt(ctx, ICON_NAMES[k], x + s / 2, y + s + 11, this.n > 4 ? 8 : 9, '#e8dcc0', 'center', false);
      } else {
        pTxt(ctx, '✓', x + s / 2, y + s / 2, s * 0.4, '#67b06b');
      }
    }
    pTxt(ctx, 'SOMBRAS', 180, PA.y + 220, 13, '#9fb4d0');
    const shk = this.shake > 0 ? Math.sin(this.shake * 40) * 4 : 0;
    for (let i = 0; i < this.n; i++) {
      const k = this.shadows[i];
      const [x, y, s] = this.shadowRect(i);
      const done = this.matched.has(k);
      PR(ctx, x + shk, y, s, s, '#141c2a');
      if (done) {
        ICONS[k](ctx, x + s / 2 - 8 * isc, y + s / 2 - 8 * isc, isc);
        pTxt(ctx, '✓', x + s - 10, y + 10, 13, '#67b06b');
      } else {
        ICONS[k](ctx, x + shk + s / 2 - 8 * isc, y + s / 2 - 8 * isc, isc, '#060a12');
      }
    }
  }
}

// ---------- 7: Baque do Maracatu (sequência rítmica) ----------
class RhythmPuzzle {
  constructor(cfg = {}) {
    this.pads = [
      { name: 'ALFAIA', c: '#d92f2f', cd: '#8a1f1f' },
      { name: 'CAIXA', c: '#f2c038', cd: '#b08a20' },
      { name: 'GONGUÊ', c: '#5b8bd9', cd: '#3a5a96' },
      { name: 'AGBÊ', c: '#67b06b', cd: '#3f7042' },
    ];
    this.rounds = cfg.rounds || [3, 4, 5];
    this.gap = cfg.gap || 0.55;
    this.round = 0;
    this.seq = [];
    this.idx = 0;
    this.mode = 'intro';
    this.timer = 1.2;
    this.flashPad = -1;
    this.flashT = 0;
    this.solved = false;
    this.newSeq();
  }
  newSeq() {
    this.seq = [];
    for (let i = 0; i < this.rounds[this.round]; i++) this.seq.push(rnd(4));
  }
  padRect(i) {
    const s = 130, gap = 14;
    const x0 = PA.x + (PA.w - 2 * s - gap) / 2;
    const y0 = PA.y + 90;
    return [x0 + (i % 2) * (s + gap), y0 + Math.floor(i / 2) * (s + gap), s, s];
  }
  tap(x, y) {
    if (this.mode !== 'input' || this.solved) return;
    for (let i = 0; i < 4; i++) {
      const [px, py, s] = this.padRect(i);
      if (!inBox(x, y, px, py, s, s)) continue;
      AudioFX.drum(i);
      this.flashPad = i;
      this.flashT = 0.18;
      if (i === this.seq[this.idx]) {
        this.idx++;
        if (this.idx >= this.seq.length) {
          this.round++;
          if (this.round >= this.rounds.length) {
            this.solved = true;
            this.mode = 'done';
            AudioFX.win();
          } else {
            AudioFX.ok();
            this.newSeq();
            this.mode = 'pause';
            this.timer = 1.0;
          }
        }
      } else {
        AudioFX.bad();
        this.mode = 'pause';
        this.timer = 1.0;
        this.errorFlag = true;
      }
      return;
    }
  }
  update(dt) {
    if (this.flashT > 0) { this.flashT -= dt; if (this.flashT <= 0) this.flashPad = -1; }
    if (this.mode === 'intro' || this.mode === 'pause') {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.mode = 'show';
        this.showIdx = 0;
        this.timer = 0.25;
        this.errorFlag = false;
      }
    } else if (this.mode === 'show') {
      this.timer -= dt;
      if (this.timer <= 0) {
        if (this.showIdx < this.seq.length) {
          const p = this.seq[this.showIdx];
          AudioFX.drum(p);
          this.flashPad = p;
          this.flashT = Math.min(0.3, this.gap * 0.6);
          this.showIdx++;
          this.timer = this.gap;
        } else {
          this.mode = 'input';
          this.idx = 0;
        }
      }
    }
  }
  draw(ctx, t) {
    const msgs = {
      intro: 'Escute o baque...',
      pause: this.errorFlag ? 'Errou o baque! Escute de novo...' : 'Boa! Próximo baque...',
      show: '♪ Escute... ♪',
      input: 'Sua vez! Repita o baque!',
      done: 'O terreiro é seu!',
    };
    const nR = this.rounds.length;
    pTxt(ctx, `Rodada ${Math.min(this.round + 1, nR)}/${nR}`, 180, PA.y + 30, 14, '#f2c038');
    pTxt(ctx, msgs[this.mode], 180, PA.y + 56, 14, '#fff');
    if (this.mode === 'input') {
      pTxt(ctx, `${this.idx}/${this.seq.length}`, 180, PA.y + 76, 12, '#9fb4d0');
    }
    for (let i = 0; i < 4; i++) {
      const [x, y, s] = this.padRect(i);
      const p = this.pads[i];
      const lit = this.flashPad === i;
      PR(ctx, x, y + 4, s, s, p.cd);
      PR(ctx, x, y, s, s - 6, lit ? '#fff8d0' : p.c);
      PR(ctx, x + 10, y + 10, s - 20, 14, lit ? '#fff' : 'rgba(255,255,255,0.35)');
      pTxt(ctx, p.name, x + s / 2, y + s / 2 + 14, 14, lit ? p.cd : '#0e141a');
    }
  }
}

// ---------- 8: Sequência das Sombrinhas ----------
class SequencePuzzle {
  constructor(cfg = {}) {
    this.cores = ['#d94f4f', '#f2c038', '#5b8bd9', '#67b06b'];
    const POOL = [
      { seq: [0, 1, 2, 0, 1], ans: 2 },
      { seq: [0, 0, 1, 1, 0, 0], ans: 1 },
      { seq: [0, 1, 1, 0, 1, 1], ans: 0 },
      { seq: [0, 1, 0, 2, 0, 3], ans: 0 },
      { seq: [0, 0, 0, 1, 1, 1, 2, 2], ans: 2 },
      { seq: [2, 1, 0, 2, 1, 0, 2], ans: 1 },
      { seq: [0, 1, 2, 3, 0, 1, 2], ans: 3 },
      { seq: [0, 0, 1, 0, 0, 1, 0], ans: 0 },
    ];
    this.nOpts = cfg.opts || 3;
    this.patterns = shuffle(POOL.slice()).slice(0, cfg.rounds || 3);
    this.round = 0;
    this.flash = 0;
    this.solved = false;
    this.setupRound();
  }
  setupRound() {
    const map = shuffle([0, 1, 2, 3]);
    const p = this.patterns[this.round];
    this.seq = p.seq.map(i => map[i]);
    this.answer = map[p.ans];
    const opts = new Set([this.answer]);
    while (opts.size < this.nOpts) opts.add(rnd(4));
    this.options = shuffle([...opts]);
  }
  optRect(i) {
    const n = this.options.length;
    const s = n === 3 ? 84 : 70, gap = n === 3 ? 18 : 10;
    const x0 = PA.x + (PA.w - n * s - (n - 1) * gap) / 2;
    return [x0 + i * (s + gap), PA.y + 250, s, s];
  }
  tap(x, y) {
    if (this.solved || this.flash > 0) return;
    for (let i = 0; i < this.options.length; i++) {
      const [ox, oy, s] = this.optRect(i);
      if (!inBox(x, y, ox, oy, s, s)) continue;
      if (this.options[i] === this.answer) {
        AudioFX.ok();
        this.flash = 0.8;
        this.advance = true;
      } else {
        AudioFX.bad();
        this.flash = 0.6;
        this.advance = false;
      }
      return;
    }
  }
  update(dt) {
    if (this.flash > 0) {
      this.flash -= dt;
      if (this.flash <= 0 && this.advance) {
        this.round++;
        if (this.round >= this.patterns.length) {
          this.solved = true;
          AudioFX.win();
        } else this.setupRound();
        this.advance = false;
      }
    }
  }
  draw(ctx, t) {
    const nR = this.patterns.length;
    pTxt(ctx, `Rodada ${Math.min(this.round + 1, nR)}/${nR}`, 180, PA.y + 26, 14, '#f2c038');
    pTxt(ctx, 'Qual sombrinha entra na roda?', 180, PA.y + 50, 13, '#fff');
    const n = this.seq.length + 1;
    const s = Math.min(46, (PA.w - 20) / n);
    const x0 = 180 - (n * s) / 2;
    const y0 = PA.y + 120;
    for (let i = 0; i < this.seq.length; i++) {
      const c = this.cores[this.seq[i]];
      sombrinha(ctx, x0 + i * s + s / 2, y0 + Math.sin(t * 3 + i) * 4, s * 0.42, t * 1.5 + i, [c, '#f5efe0']);
    }
    const qx = x0 + this.seq.length * s + s / 2;
    PR(ctx, qx - s * 0.42, y0 - s * 0.42, s * 0.84, s * 0.84, 'rgba(255,255,255,0.12)');
    pTxt(ctx, '?', qx, y0, 26, '#f2c038');
    for (let i = 0; i < this.options.length; i++) {
      const [x, y, sz] = this.optRect(i);
      PR(ctx, x, y, sz, sz, 'rgba(10,20,38,0.5)');
      sombrinha(ctx, x + sz / 2, y + sz / 2, sz * 0.36, t, [this.cores[this.options[i]], '#f5efe0']);
    }
    if (this.flash > 0) {
      const ok = this.advance;
      pTxt(ctx, ok ? 'É esse o passo!' : 'Esse não é o passo...', 180, PA.y + 220, 14, ok ? '#a0e8a0' : '#ffd0d0');
    }
  }
}

// ---------- 9: Equalizando o Manguebeat ----------
class MixerPuzzle {
  constructor(cfg = {}) {
    const n = this.n = Math.min(cfg.sliders || 4, 5);
    this.labels = ['GRAVE', 'MÉDIO', 'AGUDO', 'MANGUE', 'CIDADE'].slice(0, n);
    this.w = n === 4 ? 56 : 44;
    this.gap = n === 4 ? 18 : 14;
    this.vals = Array(n).fill(4);
    do { this.target = this.vals.map(() => rnd(8)); }
    while (this.target.every((v, i) => v === this.vals[i]));
    this.fb = null;
    this.solved = false;
    this.dragging = -1;
  }
  sliderRect(i) {
    const x0 = PA.x + (PA.w - this.n * this.w - (this.n - 1) * this.gap) / 2;
    return [x0 + i * (this.w + this.gap), PA.y + 60, this.w, 220];
  }
  btnRect() { return [180 - 70, PA.y + 318, 140, 46]; }
  valFromY(y, sy, sh) {
    return Math.max(0, Math.min(7, Math.round((1 - (y - sy) / sh) * 7)));
  }
  dragStart(x, y) {
    for (let i = 0; i < this.n; i++) {
      const [sx, sy, w, h] = this.sliderRect(i);
      if (inBox(x, y, sx - 6, sy - 14, w + 12, h + 28)) {
        this.dragging = i;
        this.vals[i] = this.valFromY(y, sy, h);
        this.fb = null;
        return true;
      }
    }
    return false;
  }
  dragMove(x, y) {
    if (this.dragging < 0) return;
    const [, sy, , h] = this.sliderRect(this.dragging);
    const v = this.valFromY(y, sy, h);
    if (v !== this.vals[this.dragging]) {
      this.vals[this.dragging] = v;
      AudioFX.blip();
    }
  }
  dragEnd() { const was = this.dragging >= 0; this.dragging = -1; return was; }
  tap(x, y) {
    if (this.solved) return;
    const [bx, by, bw, bh] = this.btnRect();
    if (inBox(x, y, bx, by, bw, bh)) {
      this.vals.forEach((v, i) => setTimeout(() => AudioFX.drum(i % 4), i * 130));
      this.fb = this.vals.map((v, i) => Math.sign(this.target[i] - v));
      if (this.fb.every(d => d === 0)) {
        this.solved = true;
        setTimeout(() => AudioFX.win(), 600);
      }
      return;
    }
    for (let i = 0; i < this.n; i++) {
      const [sx, sy, w, h] = this.sliderRect(i);
      if (inBox(x, y, sx - 6, sy - 14, w + 12, h + 28)) {
        this.vals[i] = this.valFromY(y, sy, h);
        this.fb = null;
        AudioFX.blip();
        return;
      }
    }
  }
  update() {}
  draw(ctx, t) {
    pTxt(ctx, 'Ache o som da cidade + mangue', 180, PA.y + 28, 13, '#bfe6a0');
    for (let i = 0; i < this.n; i++) {
      const [x, y, w, h] = this.sliderRect(i);
      PR(ctx, x + w / 2 - 4, y, 8, h, '#1a2418');
      for (let v = 0; v < 8; v++) {
        PR(ctx, x + w / 2 - 10, y + h - (v / 7) * h - 1, 20, 2, '#2f3a2c');
      }
      const vy = y + h - (this.vals[i] / 7) * h;
      PR(ctx, x + 3, vy - 9, w - 6, 18, '#3f9b52');
      PR(ctx, x + 3, vy - 9, w - 6, 5, '#67c478');
      pTxt(ctx, this.labels[i], x + w / 2, y + h + 18, this.n === 5 ? 8 : 10, '#bfe6a0', 'center', false);
      if (this.fb && !this.solved) {
        const d = this.fb[i];
        if (d !== 0) {
          const ay = d > 0 ? y - 8 + Math.sin(t * 5) * 3 : y + h + 34 - Math.sin(t * 5) * 3;
          pTxt(ctx, d > 0 ? '▲' : '▼', x + w / 2, ay, 16, '#f2c038');
        } else {
          pTxt(ctx, '●', x + w / 2, y - 8, 14, '#67b06b');
        }
      }
    }
    const [bx, by, bw, bh] = this.btnRect();
    PR(ctx, bx, by + 4, bw, bh, '#1f3a28');
    PR(ctx, bx, by, bw, bh - 4, this.solved ? '#67b06b' : '#3f9b52');
    pTxt(ctx, this.solved ? '♪ NA BATIDA! ♪' : '▶ TOCAR', 180, by + bh / 2 - 2, 16, '#0e141a');
  }
}

// ---------- 10: Rota da Jangada (rota programada, gerada) ----------
class RoutePuzzle {
  constructor(cfg = {}) {
    const n = this.n = cfg.n || 6;
    this.maxProg = n === 6 ? 12 : 14;
    this.map = this.gen(n, cfg.rocks || 8);
    this.cs = Math.floor(264 / n);
    this.x0 = PA.x + (PA.w - n * this.cs) / 2;
    this.y0 = PA.y + 4;
    this.start = { r: n - 1, c: 0 };
    this.boat = { ...this.start };
    this.bd = { ...this.start }; // posição animada da jangada (glide)
    this.prog = [];
    this.running = false;
    this.runIdx = 0;
    this.runT = 0;
    this.solved = false;
    this.crashFlash = 0;
  }
  gen(n, rocks) {
    const bfs = (m) => {
      const dist = Array.from({ length: n }, () => Array(n).fill(-1));
      dist[n - 1][0] = 0;
      const q = [[n - 1, 0]];
      while (q.length) {
        const [r, c] = q.shift();
        for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const nr = r + dr, nc = c + dc;
          if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
          if (m[nr][nc] === 'R' || dist[nr][nc] >= 0) continue;
          dist[nr][nc] = dist[r][c] + 1;
          q.push([nr, nc]);
        }
      }
      return dist[0][n - 1];
    };
    for (let att = 0; att < 300; att++) {
      const m = Array.from({ length: n }, () => Array(n).fill('.'));
      let placed = 0, guard = 0;
      while (placed < rocks && guard++ < 300) {
        const r = rnd(n), c = rnd(n);
        if (m[r][c] === '.' && !(r === n - 1 && c === 0) && !(r === 0 && c === n - 1)) {
          m[r][c] = 'R';
          placed++;
        }
      }
      const d = bfs(m);
      if (d > 0 && d <= this.maxProg && d >= n) {
        m[n - 1][0] = 'S';
        m[0][n - 1] = 'G';
        return m;
      }
    }
    // reserva: mapa fixo conhecido-solúvel
    const m = Array.from({ length: n }, () => Array(n).fill('.'));
    for (let i = 1; i < n - 1; i += 2) m[i][i] = 'R';
    m[n - 1][0] = 'S';
    m[0][n - 1] = 'G';
    return m;
  }
  dirBtns() {
    const s = 44, y = PA.y + 298;
    const x0 = PA.x + 10;
    return [
      { d: 'U', sym: '▲', x: x0 + s + 6, y },
      { d: 'L', sym: '◀', x: x0, y: y + s + 6 },
      { d: 'D', sym: '▼', x: x0 + s + 6, y: y + s + 6 },
      { d: 'R', sym: '▶', x: x0 + 2 * (s + 6), y: y + s + 6 },
    ].map(b => ({ ...b, s }));
  }
  actBtns() {
    return [
      { id: 'go', label: '⛵ ZARPAR', x: 196, y: PA.y + 300, w: 134, h: 42, c: '#3f9b52' },
      { id: 'clr', label: '✕ LIMPAR', x: 196, y: PA.y + 350, w: 134, h: 34, c: '#8a4b2a' },
    ];
  }
  tap(x, y) {
    if (this.solved || this.running) return;
    for (const b of this.dirBtns()) {
      if (inBox(x, y, b.x, b.y, b.s, b.s)) {
        if (this.prog.length < this.maxProg) {
          this.prog.push(b.d);
          AudioFX.tap();
        } else AudioFX.bad();
        return;
      }
    }
    for (const b of this.actBtns()) {
      if (inBox(x, y, b.x, b.y, b.w, b.h)) {
        if (b.id === 'clr') {
          this.prog = [];
          this.boat = { ...this.start };
          this.bd = { ...this.start };
          AudioFX.tap();
        } else if (b.id === 'go' && this.prog.length) {
          this.running = true;
          this.runIdx = 0;
          this.runT = 0.2;
          this.boat = { ...this.start };
          this.bd = { ...this.start };
          AudioFX.ok();
        }
        return;
      }
    }
  }
  update(dt) {
    if (this.crashFlash > 0) this.crashFlash -= dt;
    // glide contínuo da jangada rumo à célula lógica
    this.bd.r = approach(this.bd.r, this.boat.r, dt, 11);
    this.bd.c = approach(this.bd.c, this.boat.c, dt, 11);
    if (!this.running) return;
    this.runT -= dt;
    if (this.runT > 0) return;
    this.runT = 0.34;
    const n = this.n;
    if (this.runIdx >= this.prog.length) {
      this.running = false;
      if (!this.solved) {
        AudioFX.splash();
        this.crashFlash = 0.9;
        this.crashMsg = 'A rota acabou longe da boia...';
        this.boat = { ...this.start };
        this.bd = { ...this.start };
        this.prog = [];
      }
      return;
    }
    const d = this.prog[this.runIdx++];
    const D = { U: [-1, 0], D: [1, 0], L: [0, -1], R: [0, 1] };
    const [dr, dc] = D[d];
    const nr = this.boat.r + dr, nc = this.boat.c + dc;
    if (nr < 0 || nr >= n || nc < 0 || nc >= n || this.map[nr][nc] === 'R') {
      this.running = false;
      AudioFX.splash();
      this.crashFlash = 0.9;
      this.crashMsg = (nr < 0 || nr >= n || nc < 0 || nc >= n) ? 'Saiu do canal! De novo...' : 'Bateu no arrecife! De novo...';
      this.boat = { ...this.start };
      this.bd = { ...this.start };
      this.prog = [];
      return;
    }
    this.boat = { r: nr, c: nc };
    AudioFX.step();
    if (this.map[nr][nc] === 'G') {
      this.solved = true;
      this.running = false;
      AudioFX.win();
    }
  }
  draw(ctx, t) {
    const n = this.n;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const x = this.x0 + c * this.cs, y = this.y0 + r * this.cs;
        PR(ctx, x, y, this.cs - 2, this.cs - 2, (r + c) % 2 ? '#8a4a55' : '#9a5a60');
        const cell = this.map[r][c];
        if (cell === 'R') {
          PR(ctx, x + 5, y + this.cs * 0.3, this.cs - 12, this.cs * 0.5, '#3a2d2a');
          PR(ctx, x + 10, y + this.cs * 0.16, this.cs - 22, this.cs * 0.3, '#4a3a35');
          PR(ctx, x + 3, y + this.cs - 9, this.cs - 8, 3, '#c8a0a0');
        }
        if (cell === 'G') {
          const f = Math.sin(t * 3) * 3;
          PR(ctx, x + this.cs / 2 - 5, y + this.cs * 0.2 + f, 10, this.cs * 0.35, '#f2c038');
          PR(ctx, x + this.cs / 2 - 2, y + this.cs * 0.08 + f, 4, 7, '#d92f2f');
          pTxt(ctx, 'boia', x + this.cs / 2, y + this.cs - 7, 8, '#fff0a0', 'center', false);
        }
      }
    }
    const bx = this.x0 + this.bd.c * this.cs, by = this.y0 + this.bd.r * this.cs;
    const wake = this.running ? Math.sin(t * 8) * 1.5 : 0; // balanço ao navegar
    jangadaSil(ctx, bx + this.cs / 2, by + this.cs - 12 + wake, this.cs / 84);
    const py = PA.y + 284;
    pTxt(ctx, 'Rota:', PA.x + 8, py - 6, 12, '#f2c038', 'left');
    const sw = Math.floor((PA.w - 56) / this.maxProg);
    for (let i = 0; i < this.maxProg; i++) {
      const sx = PA.x + 48 + i * sw;
      PR(ctx, sx, py - 14, sw - 3, 18, i < this.prog.length ? '#f2c038' : 'rgba(255,255,255,0.12)');
      if (i < this.prog.length) {
        const sym = { U: '▲', D: '▼', L: '◀', R: '▶' }[this.prog[i]];
        pTxt(ctx, sym, sx + sw / 2 - 1, py - 5, 11, '#0e141a');
      }
    }
    for (const b of this.dirBtns()) {
      PR(ctx, b.x, b.y + 3, b.s, b.s, '#1a2a3f');
      PR(ctx, b.x, b.y, b.s, b.s - 3, '#2a4a6f');
      pTxt(ctx, b.sym, b.x + b.s / 2, b.y + b.s / 2 - 2, 18, '#bfe6f2');
    }
    for (const b of this.actBtns()) {
      PR(ctx, b.x, b.y + 3, b.w, b.h, '#13241a');
      PR(ctx, b.x, b.y, b.w, b.h - 3, b.c);
      pTxt(ctx, b.label, b.x + b.w / 2, b.y + b.h / 2 - 2, 14, '#fff');
    }
    if (this.crashFlash > 0) {
      PR(ctx, this.x0, this.y0 + 4, n * this.cs, 24, 'rgba(8,14,26,0.85)');
      pTxt(ctx, this.crashMsg, 180, this.y0 + 16, 13, '#ffd0d0');
    }
  }
}

// ---------- 11: Alinhamento dos Planetas (girar anéis da rosa dos ventos) ----------
// Tabuleiro = drawRosaDosVentos (definido em sprites.js, carrega antes).
// N anéis concêntricos; cada anel tem um planeta em uma de 8 posições (pontos da rosa).
// Tocar a faixa de um anel o gira um passo no horário: pos = (pos+1) % 8.
// Quando todos os planetas estiverem no Norte (pos === 0), o puzzle é resolvido.
// Solubilidade por construção: cada anel é cíclico de 8 posições independentes;
// nenhum anel começa no Norte (pos ∈ [1,7]) → nunca abre já resolvido.
class OrbitPuzzle {
  constructor(cfg = {}) {
    const n = cfg.rings || 3;
    // Centro e raio base do tabuleiro (área útil do puzzle)
    this.cx = 180;
    this.cy = 330;
    const rBase = 100;
    // Cores dos planetas (paleta semântica)
    const PLANET_CORES = ['#d94f4f', '#f2c038', '#5b8bd9', '#67b06b', '#c97bb6', '#e8855b'];
    this.rings = [];
    for (let i = 0; i < n; i++) {
      this.rings.push({
        r: rBase - i * Math.round(rBase / (n + 0.5)), // raios decrescentes
        pos: 1 + rnd(7), // 1..7 — nunca Norte (0), garante anti-trivial
        cor: PLANET_CORES[i % PLANET_CORES.length],
      });
    }
    this.solved = false;
  }

  // Retorna {x,y} do ponto Norte da faixa do anel i (contrato de teste).
  topPointOf(i) {
    const ring = this.rings[i];
    if (!ring) return { x: this.cx, y: this.cy };
    const NUCLEO = 16;
    const r0 = ring.r;
    const r1 = this.rings[i + 1] ? this.rings[i + 1].r : NUCLEO;
    // Ponto médio da faixa, garantindo estar acima do núcleo
    const rMid = Math.round((r0 + Math.max(NUCLEO, r1)) / 2);
    // Norte = ângulo -Math.PI/2 (topo do círculo)
    return { x: this.cx, y: this.cy - rMid };
  }

  tap(x, y) {
    if (this.solved) return;
    const dx = x - this.cx, dy = y - this.cy;
    const dist = Math.hypot(dx, dy);
    // Raio mínimo: exclui o núcleo central do tabuleiro
    const NUCLEO = 16;
    // Raio máximo: exclui toques além do anel externo
    const rMax = this.rings[0] ? this.rings[0].r + 12 : 112;
    if (dist < NUCLEO || dist > rMax) return; // toque no centro ou fora do disco
    // Acha o anel pela faixa de distância ao centro
    for (let i = 0; i < this.rings.length; i++) {
      const r0 = this.rings[i].r;
      const r1 = this.rings[i + 1] ? this.rings[i + 1].r : NUCLEO;
      // faixa do anel: de r1 (raio interno) até r0 (raio externo), com 6px de tolerância
      const rOuter = r0 + 6, rInner = Math.max(NUCLEO, r1 - 6);
      if (dist >= rInner && dist <= rOuter) {
        this.rings[i].pos = (this.rings[i].pos + 1) % 8;
        AudioFX.blip();
        // Verifica vitória apenas na transição !solved → solved
        if (this.rings.every(r => r.pos === 0)) {
          this.solved = true;
          AudioFX.win();
        }
        return;
      }
    }
    // Toque fora de qualquer anel (lacuna entre anéis): no-op
  }

  update() {}

  draw(ctx, t) {
    // Tabuleiro: disco da rosa dos ventos como fundo
    drawRosaDosVentos(ctx, this.cx, this.cy, this.rings[0] ? this.rings[0].r + 16 : 116);
    // Anéis concêntricos (órbitas) + planetas
    for (let i = 0; i < this.rings.length; i++) {
      const ring = this.rings[i];
      const r1 = this.rings[i + 1] ? this.rings[i + 1].r : 0;
      // Faixa de anel: círculo vazado entre r e r_next
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.cx, this.cy, ring.r + 8, 0, Math.PI * 2);
      ctx.arc(this.cx, this.cy, Math.max(0, r1 - 8), 0, Math.PI * 2, true);
      ctx.fillStyle = `rgba(10,26,47,0.30)`;
      ctx.fill();
      ctx.restore();
      // Borda do anel (destaque quando quase no Norte)
      const nearNorth = ring.pos === 1 || ring.pos === 7;
      ctx.beginPath();
      ctx.arc(this.cx, this.cy, ring.r, 0, Math.PI * 2);
      ctx.strokeStyle = nearNorth ? '#f2c038' : 'rgba(255,255,255,0.18)';
      ctx.lineWidth = nearNorth ? 2 : 1;
      ctx.stroke();
      // Planeta na posição correta (ângulo = pos * 45° - 90°)
      const angle = (ring.pos / 8) * Math.PI * 2 - Math.PI / 2;
      const rMid = Math.round((ring.r + r1) / 2);
      const px = Math.round(this.cx + Math.cos(angle) * rMid);
      const py = Math.round(this.cy + Math.sin(angle) * rMid);
      const ps = 10 + Math.round(Math.sin(t * 2 + i) * 1.5); // pulsação suave
      PR(ctx, px - ps / 2, py - ps / 2, ps, ps, ring.cor);
      PR(ctx, px - ps / 2 + 2, py - ps / 2 + 2, Math.round(ps * 0.4), Math.round(ps * 0.4), 'rgba(255,255,255,0.4)'); // brilho
    }
    // Eixo Norte destacado
    const nY = this.cy - (this.rings[0] ? this.rings[0].r + 20 : 136);
    PR(ctx, this.cx - 1, nY, 2, 24, '#f2c038');
    pTxt(ctx, '★ NORTE', 180, nY - 14, 11, '#f2c038');
    // Instrução
    if (!this.solved) {
      pTxt(ctx, 'Toque para girar cada anel', 180, PA.y + 14, 13, '#bfe6f2');
      const aligned = this.rings.filter(r => r.pos === 0).length;
      pTxt(ctx, `${aligned}/${this.rings.length} planetas no Norte`, 180, PA.y + 34, 12, '#9fb4d0', 'center', false);
    } else {
      pTxt(ctx, '✦ ALINHAMENTO PERFEITO! ✦', 180, PA.y + 14, 14, '#f2c038');
    }
  }
}

const PUZZLES = {
  1: LightsPuzzle, 2: MemoryPuzzle, 3: SharkPuzzle, 4: PipePuzzle, 5: MazePuzzle,
  6: ShadowPuzzle, 7: RhythmPuzzle, 8: SequencePuzzle, 9: MixerPuzzle, 10: RoutePuzzle,
  11: OrbitPuzzle,
};
// Hook de teste: expõe PUZZLES para o harness headless (window.__puzzles).
// Não interfere com main.js, que usa PUZZLES diretamente (variável de escopo global).
if (typeof window !== 'undefined') window.__puzzles = PUZZLES;
