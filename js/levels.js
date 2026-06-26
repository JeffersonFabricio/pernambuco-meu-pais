// ============================================================
// Marés do Recife — 31 fases (9 capítulos, 3–4 conchas cada)
// 16 motores; nenhum aparece mais que 3x; engine 5 (labirinto) desativado.
// e: motor do puzzle (1..4, 6..16) | anchor: id em STORY.levels
// ============================================================

// Quantas conchas por bairro (soma = 31)
const DISTRICT_SIZES  = [4, 4, 4, 4, 3, 3, 3, 3, 3];
const DISTRICT_STARTS = (() => {
  const s = []; let g = 1;
  for (let d = 0; d < 9; d++) { s.push(g); g += DISTRICT_SIZES[d]; }
  return s;
})();
const TOTAL_PHASES = DISTRICT_STARTS[8] + DISTRICT_SIZES[8] - 1; // 31

const CHAPTERS = [
  // ── 1. Recife Antigo ── 4 fases: engines 1 16(pipa) 11 10
  {
    id: 1, title: 'Dias de Sol', short: 'Sol', place: 'Recife Antigo',
    scene: 1, color: '#f2c038', cord: 'Cordão do Sol',
    fases: [
      { anchor: 1, e: 1 },
      { t: 'Torre Malakoff',        e: 16, fact: 'A Torre Malakoff era a porta do antigo Arsenal da Marinha. Hoje é mirante e observatório do céu.' },
      { t: 'Rosa dos Ventos',       e: 11, fact: 'A rosa dos ventos do Marco Zero foi desenhada pelo pintor pernambucano Cícero Dias.' },
      { t: 'Praça do Arsenal',      e: 10, fact: 'A Praça do Arsenal reúne feirinhas, livros e poesia de rua no coração do Bairro do Recife.' },
    ],
  },
  // ── 2. Boa Viagem ── 4 fases: engines 2 3 6 12(jangada)
  {
    id: 2, title: 'Beira-Mar', short: 'Beira-Mar', place: 'Boa Viagem & Piedade',
    scene: 2, color: '#1d6fa3', cord: 'Cordão do Mar',
    fases: [
      { anchor: 2, e: 2 },
      { anchor: 3, e: 3 },
      { t: 'Igrejinha de Boa Viagem', e: 6, fact: 'A igrejinha de Boa Viagem, do século XVII, deu nome à praia mais famosa do Recife.' },
      { t: 'Parque Dona Lindu',       e: 12, fact: 'O Parque Dona Lindu, à beira-mar de Boa Viagem, foi desenhado pelo arquiteto Oscar Niemeyer.' },
    ],
  },
  // ── 3. Recife na Chuva ── 4 fases: engines 4 1 16(pipa) 13(pontes)
  {
    id: 3, title: 'Dias de Chuva', short: 'Chuva', place: 'Recife no inverno',
    scene: 4, color: '#7d9fb4', cord: 'Cordão da Chuva',
    fases: [
      { anchor: 4, e: 4 },
      { t: 'Inverno Recifense', e: 1, fact: 'No Recife, "inverno" não é frio: é chuva. E junho costuma ser o mês mais molhado do ano.' },
      { t: 'Arco-Íris no Rio', e: 16, fact: 'Depois do pé d\'água, o sol volta e o Capibaribe vira um espelho de arco-íris.' },
      { t: 'Capibaribe Cheio', e: 13, fact: 'Quando chove forte, o Capibaribe enche e a cidade conversa com ele por meio de suas pontes.' },
    ],
  },
  // ── 4. Manguezal ── 4 fases: engines 2 9 14(caranguejo) 6  (anchor 5 = e:2)
  {
    id: 4, title: 'Coração de Mangue', short: 'Mangue', place: 'Manguezal do Capibaribe',
    scene: 5, color: '#8a5a3a', cord: 'Cordão da Lama',
    fases: [
      { anchor: 5, e: 2 },
      { t: 'Maré de Sizígia',  e: 9, fact: 'Na lua cheia e na lua nova, a maré sobe mais alto: os pescadores chamam de maré de sizígia.' },
      { t: 'Rio das Capivaras', e: 14, fact: 'Capibaribe, em tupi, quer dizer "rio das capivaras". As capivaras ainda vivem nas margens.' },
      { t: 'Garças Brancas',   e: 6, fact: 'No fim da tarde, as garças brancas pontuam o verde do mangue como flores que pousam.' },
    ],
  },
  // ── 5. Mercado de São José ── 3 fases: engines 6 15(renda) 7
  {
    id: 5, title: 'Cultura Viva', short: 'Cultura', place: 'Mercado de São José',
    scene: 6, color: '#c97bb6', cord: 'Cordão da Memória',
    fases: [
      { anchor: 6, e: 6 },
      { t: 'Casa da Cultura', e: 15, fact: 'A Casa da Cultura já foi uma prisão. Hoje, cada antiga cela é uma lojinha de artesanato.' },
      { t: 'Bonecos Gigantes', e: 7, fact: 'Os bonecos gigantes, de papel e cola, são os colossos mansos do carnaval pernambucano.' },
    ],
  },
  // ── 6. Pátio do Terço ── 3 fases: engines 7 1 9
  {
    id: 6, title: 'Noite dos Tambores', short: 'Tambores', place: 'Pátio do Terço',
    scene: 7, color: '#d92f2f', cord: 'Cordão do Tambor',
    fases: [
      { anchor: 7, e: 7 },
      { t: 'Caboclinho', e: 1, fact: 'No caboclinho, as preacas estalam como flechas no compasso agudo do pífano.' },
      { t: 'Rainha Coroada', e: 9, fact: 'Sob o pálio, a rainha do maracatu desfila coroada, herdeira dos reis do Congo.' },
    ],
  },
  // ── 7. Frevo ── 3 fases: engines 8 4 10
  {
    id: 7, title: 'Fervo do Frevo', short: 'Frevo', place: 'Rua da Moeda',
    scene: 8, color: '#e8855b', cord: 'Cordão do Passo',
    fases: [
      { anchor: 8, e: 8 },
      { t: 'Paço do Frevo',       e: 4,  fact: 'O Paço do Frevo guarda e ensina a dança que ferve no Recife desde 1907.' },
      { t: 'Galo da Madrugada',   e: 10, fact: 'O Galo da Madrugada, que sai no sábado de carnaval, é considerado o maior bloco do mundo.' },
    ],
  },
  // ── 8. Manguebeat ── 3 fases: engines 9 2 14(caranguejo)
  {
    id: 8, title: 'Antenas do Mangue', short: 'Manguebeat', place: 'Beira do mangue',
    scene: 9, color: '#3f9b52', cord: 'Cordão da Antena',
    fases: [
      { anchor: 9, e: 9 },
      { t: 'Chico Science',   e: 2, fact: 'Chico Science misturou maracatu com rock e mudou a música brasileira nos anos 90.' },
      { t: 'Da Lama ao Caos', e: 14, fact: '"Da Lama ao Caos", de 1994, é o disco-manifesto que apresentou o manguebeat ao mundo.' },
    ],
  },
  // ── 9. Maré Final ── 3 fases: engines 13(pontes) 12(jangada) 10(anchor)
  {
    id: 9, title: 'Última Maré', short: 'Maré', place: 'Estuário do Capibaribe',
    scene: 10, color: '#8a3a8a', cord: 'Cordão do Poente',
    fases: [
      { t: 'Veneza Brasileira',   e: 13, fact: 'Com rios, ilhas e dezenas de pontes, o Recife é chamado de Veneza Brasileira.' },
      { t: 'Pescadores da Noite', e: 12, fact: 'Há quem pesque de noite no estuário, guiado só pela lua e pela memória.' },
      { anchor: 10, e: 10 },
    ],
  },
];

// reações curtas pós-puzzle (rotacionam dentro do capítulo)
const OUTRO_POOL = {
  1: [
    { who: 'maju', text: 'Mais uma concha dourada no Cordão do Sol!' },
    { who: 'vovo', text: 'O sol do Recife não esquece quem anda com ele.' },
    { who: 'nar', text: 'E o Cordão do Sol ganha mais um brilho.' },
  ],
  2: [
    { who: 'maju', text: 'O mar devolveu mais uma concha!' },
    { who: 'vovo', text: 'Maré que leva, maré que traz, minha neta.' },
    { who: 'nar', text: 'A espuma se desfaz e deixa uma concha na areia.' },
  ],
  3: [
    { who: 'maju', text: 'Achei! Essa estava escondida na chuva!' },
    { who: 'vovo', text: 'Chuva boa é a que rega história.' },
    { who: 'nar', text: 'Pinga a pinga, o Cordão da Chuva se enche.' },
  ],
  4: [
    { who: 'maju', text: 'O mangue soltou mais uma concha!' },
    { who: 'vovo', text: 'O mangue dá tudo a quem respeita o tempo dele.' },
    { who: 'nar', text: 'A lama brilha: mais uma concha no cordão.' },
  ],
  5: [
    { who: 'maju', text: 'Mais um tesouro pro Cordão da Memória!' },
    { who: 'vovo', text: 'Cultura é isso: passa de mão em mão e não se gasta.' },
    { who: 'nar', text: 'E a memória da cidade ganha mais uma pérola.' },
  ],
  6: [
    { who: 'maju', text: 'Essa concha veio quentinha do couro do tambor!' },
    { who: 'vovo', text: 'O baque mora no peito; a concha é só lembrança.' },
    { who: 'nar', text: 'O tambor ecoa e o cordão responde.' },
  ],
  7: [
    { who: 'maju', text: 'Peguei essa no rodopio da sombrinha!' },
    { who: 'vovo', text: 'Frevo é assim: ferve, gira e entrega.' },
    { who: 'nar', text: 'No passo certo, mais uma concha cai na roda.' },
  ],
  8: [
    { who: 'maju', text: 'A antena captou mais uma concha!' },
    { who: 'vovo', text: 'Lama e satélite, tudo na mesma batida.' },
    { who: 'nar', text: 'O mangue transmite: Cordão da Antena atualizado.' },
  ],
  9: [
    { who: 'maju', text: 'Tá quase, vovô! O poente espera a gente!' },
    { who: 'vovo', text: 'A última maré é a mais bonita, repare.' },
    { who: 'nar', text: 'O céu se pinta e o Cordão do Poente cintila.' },
  ],
};

// dificuldade global: 3 patamares ao longo das 31 fases
function engineCfg(e, g) {
  let tier = 0;
  if (g > 21) tier = 2;
  else if (g > 10) tier = 1;
  switch (e) {
    case 1:  return { n: 3 + tier };
    case 2:  return { pairs: [6, 8, 10][tier] };
    case 3:  return { sharks: 2 + tier, fast: tier === 2 };
    case 4:  return { n: tier === 0 ? 4 : 5 };
    case 6:  return { items: 4 + tier };
    case 7:  return { rounds: [[3, 4, 5], [4, 5, 6], [5, 6, 7]][tier], gap: [0.55, 0.48, 0.4][tier] };
    case 8:  return { rounds: [3, 3, 4][tier], opts: [3, 3, 4][tier] };
    case 9:  return { sliders: tier === 2 ? 5 : 4 };
    case 10: return { n: tier === 2 ? 7 : 6, rocks: [8, 10, 12][tier] };
    case 11: return { rings: 3 + tier };
    case 12: return { cols: 6, rows: 6 + tier, sand: 3 + tier };
    case 13: return { grid: 3 + Math.min(1, tier), extra: 1 + tier };
    case 14: return { holes: 6, target: 4 + tier, interval: [0.7, 0.6, 0.5][tier] };
    case 15: return { pins: 4 + tier };
    case 16: return { lanes: 3, targetH: 8 + tier * 2, ascRate: 2 + tier * 0.5 };
  }
  return {};
}

// converte g global (1..31) → {d: districtIndex, k: 0-based index within district}
function gToPos(g) {
  for (let d = 0; d < 9; d++) {
    const end = DISTRICT_STARTS[d] + DISTRICT_SIZES[d];
    if (g < end) return { d, k: g - DISTRICT_STARTS[d] };
  }
  return { d: 8, k: DISTRICT_SIZES[8] - 1 };
}

// resolve a fase global g (1..31) em um objeto pronto pro jogo
function getLevel(g) {
  const { d, k } = gToPos(g);
  const ch = CHAPTERS[d];
  const f  = ch.fases[k];
  const base = {
    g, c: d + 1, k: k + 1, engine: f.e, cfg: engineCfg(f.e, g),
    color: ch.color, cord: ch.cord, chapter: ch,
  };
  if (f.anchor) {
    const L = STORY.levels[f.anchor];
    return { ...base, title: L.title, place: L.place, scene: f.anchor, intro: L.intro, outro: L.outro };
  }
  return {
    ...base,
    title: f.t, place: ch.place, scene: ch.scene,
    intro: [{ who: 'nar', text: f.fact }],
    outro: [OUTRO_POOL[d + 1][(k) % 3]],
  };
}
// Hooks de teste: expõe constantes para o harness headless.
if (typeof window !== 'undefined') {
  window.__levels = { TOTAL_PHASES, DISTRICT_SIZES, DISTRICT_STARTS, getLevel, engineCfg };
}
