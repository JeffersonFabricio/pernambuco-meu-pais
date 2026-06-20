// ============================================================
// Marés do Recife — 81 fases (9 capítulos × 9 contas)
// 81 = DDD do Recife. Fases-âncora usam os diálogos completos
// de STORY.levels; as demais trazem uma curiosidade da cidade.
// e: motor do puzzle (1..10) | anchor: id em STORY.levels
// ============================================================
const CHAPTERS = [
  {
    id: 1, title: 'Dias de Sol', short: 'Sol', place: 'Recife Antigo',
    scene: 1, color: '#f2c038', cord: 'Cordão do Sol',
    fases: [
      { anchor: 1, e: 1 },
      { t: 'Rua do Bom Jesus', e: 2, fact: 'A Rua do Bom Jesus, com sua estrutura colonial, já foi eleita uma das ruas mais bonitas do mundo.' },
      { t: 'Kahal Zur Israel', e: 4, fact: 'Na Rua do Bom Jesus fica a Kahal Zur Israel, a primeira sinagoga das Américas, fundada em 1636.' },
      { t: 'Torre Malakoff', e: 7, fact: 'A Torre Malakoff era a porta do antigo Arsenal da Marinha. Hoje é mirante e observatório do céu.' },
      { t: 'Ponte Maurício de Nassau', e: 5, fact: 'A Ponte Maurício de Nassau, de 1644, é tida como a primeira grande ponte do Brasil.' },
      { t: 'Rua da Aurora', e: 8, fact: 'Na Rua da Aurora, o casa cor de pastel se espelha nas águas do Capibaribe desde o século XIX.' },
      { t: 'Forte do Brum', e: 6, fact: 'O Forte do Brum vigia a entrada do porto do Recife desde 1629.' },
      { t: 'Praça do Arsenal', e: 10, fact: 'A Praça do Arsenal reúne feirinhas, livros e poesia de rua no coração do Bairro do Recife.' },
      { t: 'Rosa dos Ventos', e: 9, fact: 'A rosa dos ventos do Marco Zero foi desenhada pelo pintor pernambucano Cícero Dias.' },
    ],
  },
  {
    id: 2, title: 'Beira-Mar', short: 'Beira-Mar', place: 'Boa Viagem & Piedade',
    scene: 2, color: '#1d6fa3', cord: 'Cordão do Mar',
    fases: [
      { anchor: 2, e: 2 },
      { anchor: 3, e: 3 },
      { t: 'Piscinas Naturais', e: 5, fact: 'Na maré baixa, os arrecifes formam piscinas naturais mornas ao longo de Boa Viagem.' },
      { t: 'Piedade', e: 1, fact: 'Piedade é o bairro que conecta Boa Viagem ao centro, famoso pelas igrejas centenárias e pelo comércio animado à beira da orla.' },
      { t: 'Candeias', e: 10, fact: 'Candeias tem uma das praias mais tranquilas da Região Metropolitana do Recife, com águas calmas e pescadores de toda vida.' },
      { t: 'Coco Gelado', e: 7, fact: 'No calçadão, o coco gelado é quase uma instituição: refresca o Recife inteiro nos dias de sol.' },
      { t: 'Águas de Arrebentação', e: 3, fact: 'Entre os arrecifes e a areia, a água é rasa e segura. Além deles, o mar é dos grandes peixes.' },
      { t: 'Parque Dona Lindu', e: 9, fact: 'O Parque Dona Lindu, à beira-mar de Boa Viagem, foi desenhado pelo arquiteto Oscar Niemeyer.' },
      { t: 'Igrejinha de Boa Viagem', e: 6, fact: 'A igreja de Nossa Senhora de Boa Viagem, do século XVII, deu nome à praia mais famosa do Recife.' },
    ],
  },
  {
    id: 3, title: 'Dias de Chuva', short: 'Chuva', place: 'Recife no inverno',
    scene: 4, color: '#7d9fb4', cord: 'Cordão da Chuva',
    fases: [
      { anchor: 4, e: 4 },
      { t: 'Inverno Recifense', e: 1, fact: 'No Recife, "inverno" não é frio: é chuva. E junho costuma ser o mês mais molhado do ano.' },
      { t: 'Cais do Sertão', e: 9, fact: 'O Museu Cais do Sertão celebra Luiz Gonzaga, o Rei do Baião, bem à beira do porto.' },
      { t: 'São João', e: 6, fact: 'Sanfona, zabumba e triângulo: o trio que faz o São João de Pernambuco ferver mesmo na chuva.' },
      { t: 'Quadrilha Jumaju', e: 2, fact: 'Na quadrilha jumaju, o grito de "olha a chuva!" faz todo mundo correr... dançando.' },
      { t: 'Milho & Canjica', e: 10, fact: 'São João sem milho assado, pamonha e canjica simplesmente não é São João.' },
      { t: 'Capibaribe Cheio', e: 8, fact: 'Quando chove forte, o Capibaribe incha e a cidade conversa com ele por meio de suas pontes.' },
      { t: "Pé d'Água", e: 5, fact: "Pé d'água é como o recifense chama a chuva repentina que alaga tudo — e logo passa." },
      { t: 'Arco-Íris no Rio', e: 7, fact: 'Depois do pé d\'água, o sol volta e o Capibaribe vira um espelho de arco-íris.' },
    ],
  },
  {
    id: 4, title: 'Coração de Mangue', short: 'Mangue', place: 'Manguezal do Capibaribe',
    scene: 5, color: '#8a5a3a', cord: 'Cordão da Lama',
    fases: [
      { anchor: 5, e: 5 },
      { t: 'Troca de Casca', e: 1, fact: 'O uçá troca de casca para crescer: fica uns dias escondido, molinho, esperando endurecer de novo.' },
      { t: 'Guaiamum', e: 10, fact: 'O guaiamum, azulado, é o primo do uçá que prefere as partes mais secas do mangue.' },
      { t: 'Garças Brancas', e: 6, fact: 'No fim da tarde, as garças brancas pontuam o verde do mangue como flores que pousam.' },
      { t: 'Berçário do Mar', e: 8, fact: 'Peixes e camarões nascem protegidos entre as raízes: o mangue é o berçário do mar.' },
      { t: 'Raízes que Respiram', e: 2, fact: 'As raízes do mangue saem da lama para respirar quando a maré baixa. Engenharia da natureza.' },
      { t: 'Maré de Sizígia', e: 7, fact: 'Na lua cheia e na lua nova, a maré sobe mais alto: os pescadores chamam de maré de sizígia.' },
      { t: 'Catadoras de Marisco', e: 4, fact: 'As catadoras de marisco conhecem cada canto do mangue como a palma da própria mão.' },
      { t: 'Rio das Capivaras', e: 9, fact: 'Capibaribe, em tupi, quer dizer "rio das capivaras".' },
    ],
  },
  {
    id: 5, title: 'Cultura Viva', short: 'Cultura', place: 'Mercado de São José',
    scene: 6, color: '#c97bb6', cord: 'Cordão da Memória',
    fases: [
      { anchor: 6, e: 6 },
      { t: 'Mercado de São José', e: 2, fact: 'O Mercado de São José, de 1875, foi o primeiro mercado público em estrutura de ferro do Brasil.' },
      { t: 'Casa da Cultura', e: 8, fact: 'A Casa da Cultura já foi uma prisão. Hoje, cada antiga cela é uma lojinha de artesanato.' },
      { t: 'Tapioca', e: 5, fact: 'Quentinha, com coco ou queijo: a tapioca atravessou séculos, das mãos indígenas até as nossas.' },
      { t: 'Bolo Souza Leão', e: 1, fact: 'O bolo Souza Leão, de massa de mandioca, nasceu em engenho pernambucano e virou patrimônio do estado.' },
      { t: 'Bonecos Gigantes', e: 7, fact: 'Os bonecos gigantes, de papel e cola, são os colossos mansos do carnaval pernambucano.' },
      { t: 'Literatura de Cordel', e: 4, fact: 'No cordel, as histórias chegam penduradas num barbante, contadas em versos rimados.' },
      { t: 'Renda Renascença', e: 9, fact: 'A renda renascença transforma linha em filigrana: paciência virada arte.' },
      { t: 'Mestre Vitalino', e: 10, fact: 'Os bonecos de barro do mestre Vitalino nasceram no interior de Pernambuco e encantaram o mundo.' },
    ],
  },
  {
    id: 6, title: 'Noite dos Tambores', short: 'Tambores', place: 'Pátio do Terço',
    scene: 7, color: '#d92f2f', cord: 'Cordão do Tambor',
    fases: [
      { anchor: 7, e: 7 },
      { t: 'Baque Virado', e: 8, fact: 'Cada nação de maracatu tem seu baque: um jeito próprio de fazer o chão tremer.' },
      { t: 'Calunga', e: 2, fact: 'A calunga é a boneca sagrada que vai à frente do maracatu, guardiã da memória da nação.' },
      { t: 'Rainha Coroada', e: 5, fact: 'Sob o pálio, a rainha do maracatu desfila coroada, herdeira dos reis do Congo.' },
      { t: 'Tambores Silenciosos', e: 10, fact: 'Na segunda-feira de carnaval, o Pátio do Terço silencia: é a Noite dos Tambores Silenciosos.' },
      { t: 'Caboclinho', e: 1, fact: 'No caboclinho, as preacas estalam como flechas no compasso agudo do pífano.' },
      { t: 'Coco de Roda', e: 9, fact: 'No coco de roda, o sapateado e as palmas são o próprio instrumento.' },
      { t: 'Ciranda', e: 6, fact: 'Na ciranda, a roda gira de mãos dadas, sem pressa — o mar é quem dita o balanço.' },
      { t: 'Afoxé', e: 4, fact: 'O afoxé leva o axé às ruas do Recife no compasso suave do ijexá.' },
    ],
  },
  {
    id: 7, title: 'Fervo do Frevo', short: 'Frevo', place: 'Rua da Moeda',
    scene: 8, color: '#e8855b', cord: 'Cordão do Passo',
    fases: [
      { anchor: 8, e: 8 },
      { t: 'Galo da Madrugada', e: 7, fact: 'O Galo da Madrugada, que sai no sábado de carnaval, é considerado o maior bloco do mundo.' },
      { t: 'Paço do Frevo', e: 1, fact: 'O Paço do Frevo guarda e ensina a dança que ferve no Recife desde 1907.' },
      { t: 'A Sombrinha', e: 9, fact: 'A sombrinha do frevo nasceu de guarda-chuvas velhos — e virou o símbolo colorido da dança.' },
      { t: 'O Passo', e: 5, fact: 'Tesoura, parafuso, dobradiça: cada passo do frevo tem nome e personalidade próprios.' },
      { t: 'Orquestra de Metais', e: 2, fact: 'Trombone, trompete e clarinete: a orquestra de frevo é uma locomotiva de metais.' },
      { t: 'Patrimônio do Mundo', e: 6, fact: 'Em 2012, o frevo foi reconhecido pela UNESCO como patrimônio imaterial da humanidade.' },
      { t: 'Três Jeitos de Ferver', e: 10, fact: 'Há frevo de rua, frevo-canção e frevo de bloco: três jeitos de ferver a mesma fervura.' },
      { t: 'Mar de Gente', e: 4, fact: 'No carnaval do Marco Zero, um mar de gente dança entre o palco e o rio.' },
    ],
  },
  {
    id: 8, title: 'Antenas do Mangue', short: 'Manguebeat', place: 'Beira do mangue',
    scene: 9, color: '#3f9b52', cord: 'Cordão da Antena',
    fases: [
      { anchor: 9, e: 9 },
      { t: 'Chico Science', e: 4, fact: 'Chico Science misturou maracatu com rock e mudou a música brasileira nos anos 90.' },
      { t: 'Da Lama ao Caos', e: 10, fact: '"Da Lama ao Caos", de 1994, é o disco-manifesto que apresentou o manguebeat ao mundo.' },
      { t: 'Nação Zumbi', e: 8, fact: 'A Nação Zumbi segue espalhando o baque eletrificado do mangue pelos palcos do planeta.' },
      { t: 'Caranguejos com Cérebro', e: 1, fact: 'O manifesto "Caranguejos com Cérebro" imaginou uma antena parabólica enfiada na lama.' },
      { t: 'Mundo Livre S/A', e: 5, fact: 'O Mundo Livre S/A, de Fred 04, é o outro pilar fundador da cena manguebeat.' },
      { t: 'Abril Pro Rock', e: 2, fact: 'O festival Abril Pro Rock projetou a cena musical do Recife para todo o Brasil.' },
      { t: 'Maracatu Atômico', e: 7, fact: 'Na voz da Nação Zumbi, "Maracatu Atômico" uniu tambor de nação e guitarra elétrica.' },
      { t: 'Cidade Antenada', e: 6, fact: 'Do mangue saem ritmos novos a cada década: o Recife não para de inventar som.' },
    ],
  },
  {
    id: 9, title: 'Maré 81', short: 'Maré 81', place: 'Estuário do Capibaribe',
    scene: 10, color: '#8a3a8a', cord: 'Cordão do Poente',
    fases: [
      { t: 'Boi Voador', e: 2, fact: 'Em 1644, Maurício de Nassau anunciou um boi voador no Recife — e fez um boi de couro "voar" preso a cordas.' },
      { t: 'Perna Cabeluda', e: 3, fact: 'Lenda urbana recifense: a Perna Cabeluda, uma perna solta que sai correndo pelas ruas à noite. Cuidado!' },
      { t: 'Encontro das Águas', e: 5, fact: 'No estuário, Capibaribe e Beberibe se abraçam antes de encontrar o mar.' },
      { t: 'Veneza Brasileira', e: 7, fact: 'Com rios, ilhas e dezenas de pontes, o Recife é chamado de Veneza Brasileira.' },
      { t: 'DDD 81', e: 9, fact: 'Para ligar pro Recife, disca-se 81. O número desta maré — e deste colar.' },
      { t: 'Cidade Refletida', e: 1, fact: 'À noite, as pontes se acendem e o rio guarda uma cidade de luz de cabeça para baixo.' },
      { t: 'Pescadores da Noite', e: 8, fact: 'Há quem pesque de noite no estuário, guiado só pela lua e pela memória.' },
      { t: 'Última Maré', e: 4, fact: 'Dizem os jangadeiros: a maré não se apressa — e mesmo assim nunca se atrasa.' },
      { anchor: 10, e: 10 },
    ],
  },
];

// reações curtas pós-puzzle (rotacionam dentro do capítulo)
const OUTRO_POOL = {
  1: [
    { who: 'maju', text: 'Mais uma conta dourada no Cordão do Sol!' },
    { who: 'vovo', text: 'O sol do Recife não esquece quem anda com ele.' },
    { who: 'nar', text: 'E o Cordão do Sol ganha mais um brilho.' },
  ],
  2: [
    { who: 'maju', text: 'O mar devolveu mais uma conta!' },
    { who: 'vovo', text: 'Maré que leva, maré que traz, minha neta.' },
    { who: 'nar', text: 'A espuma se desfaz e deixa uma conta na areia.' },
  ],
  3: [
    { who: 'maju', text: 'Achei! Essa estava escondida na chuva!' },
    { who: 'vovo', text: 'Chuva boa é a que rega história.' },
    { who: 'nar', text: 'Pinga a pinga, o Cordão da Chuva se enche.' },
  ],
  4: [
    { who: 'maju', text: 'O mangue soltou mais uma conta!' },
    { who: 'vovo', text: 'O mangue dá tudo a quem respeita o tempo dele.' },
    { who: 'nar', text: 'A lama brilha: mais uma conta no cordão.' },
  ],
  5: [
    { who: 'maju', text: 'Mais um tesouro pro Cordão da Memória!' },
    { who: 'vovo', text: 'Cultura é isso: passa de mão em mão e não se gasta.' },
    { who: 'nar', text: 'E a memória da cidade ganha mais uma pérola.' },
  ],
  6: [
    { who: 'maju', text: 'Essa conta veio quentinha do couro do tambor!' },
    { who: 'vovo', text: 'O baque mora no peito; a conta é só lembrança.' },
    { who: 'nar', text: 'O tambor ecoa e o cordão responde.' },
  ],
  7: [
    { who: 'maju', text: 'Peguei essa no rodopio da sombrinha!' },
    { who: 'vovo', text: 'Frevo é assim: ferve, gira e entrega.' },
    { who: 'nar', text: 'No passo certo, mais uma conta cai na roda.' },
  ],
  8: [
    { who: 'maju', text: 'A antena captou mais uma conta!' },
    { who: 'vovo', text: 'Lama e satélite, tudo na mesma batida.' },
    { who: 'nar', text: 'O mangue transmite: Cordão da Antena atualizado.' },
  ],
  9: [
    { who: 'maju', text: 'Tá quase, vovô! O poente espera a gente!' },
    { who: 'vovo', text: 'A última maré é a mais bonita, repare.' },
    { who: 'nar', text: 'O céu se pinta e o Cordão do Poente cintila.' },
  ],
};

// dificuldade global: 3 patamares ao longo das 81 fases
function engineCfg(e, g) {
  const tier = g <= 27 ? 0 : g <= 58 ? 1 : 2;
  switch (e) {
    case 1: return { n: 3 + tier };
    case 2: return { pairs: [6, 8, 10][tier] };
    case 3: return { sharks: 2 + tier, fast: tier === 2 };
    case 4: return { n: tier === 0 ? 4 : 5 };
    case 5: return { cols: [9, 11, 11][tier], rows: [11, 11, 13][tier], leaves: 3 + (tier > 0 ? 1 : 0) };
    case 6: return { items: 4 + tier };
    case 7: return { rounds: [[3, 4, 5], [4, 5, 6], [5, 6, 7]][tier], gap: [0.55, 0.48, 0.4][tier] };
    case 8: return { rounds: [3, 3, 4][tier], opts: [3, 3, 4][tier] };
    case 9: return { sliders: tier === 2 ? 5 : 4 };
    case 10: return { n: tier === 2 ? 7 : 6, rocks: [8, 10, 12][tier] };
  }
  return {};
}

// resolve a fase global g (1..81) em um objeto pronto pro jogo
function getLevel(g) {
  const c = Math.floor((g - 1) / 9) + 1;
  const k = ((g - 1) % 9) + 1;
  const ch = CHAPTERS[c - 1];
  const f = ch.fases[k - 1];
  const base = {
    g, c, k, engine: f.e, cfg: engineCfg(f.e, g),
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
    outro: [OUTRO_POOL[c][(k - 1) % 3]],
  };
}
