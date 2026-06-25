// ============================================================
// Elenco da família — fonte única de verdade (ADR-005).
// Antes, o mesmo elenco vivia espelhado em 4 estruturas (NPCS/SPEAKERS em main.js,
// WORLD_NPCS/NPC_DRAW em world3d.js). Aqui ele é declarado UMA vez; cada estrutura
// vira uma projeção derivada via Characters.npcs()/speakers()/worldNpcs()/npcDraw().
//
// Ordem de carga (index.html): este arquivo entra DEPOIS de sprites.js — que define
// drawMaju/drawJonatha/… e os mapas de rosto MAJU_FACE/VOVO_FACE/FACE_PAL — e ANTES
// de world3d.js e main.js, que consomem as projeções.
//
// Cada personagem declara o canônico (name, color, draw, d, lesson?, kid?, ending?,
// portrait?) e o por-view só quando existe ou diverge:
//   free:  { dx, dy }              → entra no mundo livre (NPCS)
//   world: { col, row, label?, color? } → entra no passeio final (WORLD_NPCS)
// label cai em `name` e color cai no `color` canônico quando omitidos.
// ============================================================

const LESSONS = {
  primos:  'Primo é parceiro pra toda aventura, chuva ou sol.',
  fe:      'Fé é o que nos carrega quando as pernas cansam.',
  uniao:   'A família só soa bonito quando tá toda unida.',
  amorCeu: 'O amor que vai pro céu não desaparece.',
};

const CHARACTERS = {
  // Protagonista — só fala (não é NPC do mundo nem do passeio): retrato por mapa de rosto.
  maju:    { name: 'MAJU',          color: '#f2c038', draw: drawMaju,
             portrait: { face: MAJU_FACE, pal: FACE_PAL } },

  jona:    { name: 'JONATHA',       color: '#3fae7a', draw: drawJonatha, d: 0, kid: true,
             free: { dx: -52, dy: -176 }, world: { col: 5, row: 6 } },
  mica:    { name: 'MICAELE',       color: '#e87ab0', draw: drawMicaele, d: 0, kid: true,
             free: { dx:  52, dy: -176 }, world: { col: 4, row: 6 } },
  // Titio Jeff — Manguezal (d3): o titio da pedalada, que guia a Maju até a igreja das Marias.
  jeff:    { name: 'TITIO JEFF',    color: '#f2a83a', draw: drawJeff, d: 3,
             free: { dx: 0, dy: -176 }, world: { col: 6, row: 13 } },

  ravi:    { name: 'PRIMO RAVI',    color: '#e07020', draw: drawRavi, d: 2, kid: true, lesson: LESSONS.primos,
             free: { dx: -52, dy: -176 }, world: { col: 18, row: 5, label: 'RAVI' } },
  nicolas: { name: 'PRIMO NICOLAS', color: '#2a8a3a', draw: drawNico, d: 2, kid: true, lesson: LESSONS.primos,
             free: { dx:  52, dy: -176 }, world: { col: 20, row: 5, label: 'NICOLAS' } },

  // Titio Renato — Boa Viagem (d1): Padre Cícero e as promessas nordestinas (lição de fé).
  renato:  { name: 'TITIO RENATO',  color: '#1e3a6e', draw: drawRenato, d: 1, lesson: LESSONS.fe,
             free: { dx: 0, dy: -176 }, world: { col: 13, row: 6, label: 'RENATO', color: '#8b5e2a' } },
  bruno:   { name: 'TITIO BRUNO',   color: '#8b5e2a', draw: drawBruno, d: 5, lesson: LESSONS.uniao,
             free: { dx: 0, dy: -176 }, world: { col: 18, row: 13, label: 'T. BRUNO', color: '#5a4030' } },
  // As duas Marias. A Vó Maria José (paterna, VIVA) é conhecida no frevo (d6). A Vó Maria Rita
  // (materna, do CÉU) NÃO fica no mundo — é uma aparição: surge só DENTRO da igreja, na cena do
  // reencontro (asMarias). Por isso ela não tem `world` nem `free` (não é NPC andável); segue
  // como SPEAKER (drawVovoMae) pra aparecer na cena. A lição do amor eterno entra ali.
  vova:    { name: 'VÓ MARIA JOSÉ',  color: '#c79bd0', draw: drawVova, d: 6,
             free: { dx: 0, dy: -176 }, world: { col: 4, row: 19 } },
  vovoMae: { name: 'VÓ MARIA RITA',  color: '#f0d878', draw: drawVovoMae, d: 7, lesson: LESSONS.amorCeu },
  // Igreja N. S. da Piedade — reencontro das duas Marias à beira-mar, no litoral de d7
  // (Beira do Mangue), de frente pro mar aberto do SE. Gate met.vova (a Vó Maria Rita,
  // do céu, aparece DENTRO da igreja; ver main.js/talkNpc); alcançável quando d7 abre.
  // Só `world` (sem `free`): aparece no passeio, não no mundo livre. NÃO é concha —
  // fora de PHASE_NODES (FF-DOM-2, TOTAL_PHASES=31).
  asMarias: { name: 'IGREJA',       color: '#d9b25c', draw: drawIgrejaMarias, d: 7, scene: true,
             world: { col: 15, row: 21, label: 'IGREJA' } },
  // Pais juntos no Cais da Alfândega (d8) — reencontro afetivo, sem ending, sem concha.
  osPais:  { name: 'PAINHO E MAINHA', color: '#3fae7a', draw: drawPais, d: 8,
             lesson: 'Coragem do painho e fé da mainha caminham com você.',
             free: { dx: -80, dy: -176 }, world: { col: 17, row: 18, label: 'PAINHO E MAINHA', color: '#e87ab0' } },
  vovo:    { name: 'VOVÔ MARO',     color: '#caa15a', draw: drawVovo, d: 8, ending: true,
             portrait: { face: VOVO_FACE, pal: VOVO_FACE_PAL },
             free: { dx: 0, dy: -214 }, world: { col: 19, row: 18, color: '#f2c038' } },
};

const Characters = {
  all: CHARACTERS,
  lessons: LESSONS,

  // NPCS (mundo livre, main.js): personagens com posição `free`. Sem x/y — main.js os
  // calcula a partir do districtCenter logo após derivar.
  npcs() {
    return Object.entries(CHARACTERS)
      .filter(([, c]) => c.free)
      .map(([key, c]) => ({
        key, d: c.d, dx: c.free.dx, dy: c.free.dy, draw: c.draw,
        kid: c.kid, lesson: c.lesson, ending: c.ending,
      }));
  },

  // SPEAKERS (diálogo, main.js): TODOS os personagens, inclusive a Maju (que não é NPC
  // do mundo). face/pal só existem em quem tem retrato por mapa de rosto.
  speakers() {
    const out = {};
    for (const [key, c] of Object.entries(CHARACTERS)) {
      out[key] = { name: c.name, color: c.color, body: c.draw,
                   face: c.portrait && c.portrait.face, pal: c.portrait && c.portrait.pal };
    }
    return out;
  },

  // WORLD_NPCS (passeio final, world3d.js): personagens com posição `world`. label cai
  // em name e color cai no color canônico quando o por-view não diverge.
  worldNpcs() {
    return Object.entries(CHARACTERS)
      .filter(([, c]) => c.world)
      .map(([key, c]) => ({
        key, d: c.d, col: c.world.col, row: c.world.row,
        color: c.world.color || c.color,
        label: c.world.label || c.name,
        lesson: c.lesson, ending: c.ending,
      }));
  },

  // NPC_DRAW (world3d.js): key → função de desenho, mesmo conjunto do WORLD_NPCS.
  npcDraw() {
    const out = {};
    for (const [key, c] of Object.entries(CHARACTERS)) {
      if (c.world) out[key] = c.draw;
    }
    return out;
  },
};
