// ============================================================
// Marés do Recife — história e diálogos
// ============================================================
// who: 'maju' | 'vovo' | 'nar' (narrador)
const STORY = {
  opening: [
    { who: 'nar',  text: 'Recife, Pernambuco. O dia ainda nem nasceu e a maré já conversa com a cidade.' },
    { who: 'vovo', text: 'Maju, minha neta... o vento da madrugada levou as contas do meu colar de marés.' },
    { who: 'maju', text: 'O colar que conta as histórias do Recife, vovô?' },
    { who: 'vovo', text: 'Esse mesmo. Oitenta e uma contas, uma pra cada maré. Caíram por todos os cantos da cidade.' },
    { who: 'maju', text: 'Oitenta e uma?! É o DDD do Recife, vovô! 81! Até o colar sabe de onde é.' },
    { who: 'vovo', text: 'Pois é. Nove cordões, nove cantos da cidade, nove contas em cada um.' },
    { who: 'vovo', text: 'Hoje, no pôr do sol, saio com os jangadeiros. Queria partir com o colar inteiro...' },
    { who: 'maju', text: 'Então eu vou atrás delas! Antes do sol se deitar, o colar tá completo!' },
    { who: 'nar',  text: 'E assim começa a jornada de Maju pelas marés do Recife.' },
  ],

  ending: [
    { who: 'nar',  text: 'O sol se deita devagar atrás do Capibaribe. O colar brilha inteiro no peito do vovô.' },
    { who: 'vovo', text: 'Oitenta e uma contas, oitenta e uma marés... e todas passaram por suas mãos, Maju.' },
    { who: 'maju', text: 'Aprendi que o Recife é sol e chuva, mangue e mar, tambor e silêncio.' },
    { who: 'vovo', text: 'O colar agora é seu. Quem guarda as histórias de um lugar, guarda o lugar.' },
    { who: 'maju', text: 'Boa viagem, vovô. Quando a jangada voltar, eu conto as histórias novas!' },
    { who: 'nar',  text: 'A jangada vira um ponto no horizonte dourado. E a maré, como sempre, promete voltar.' },
    { who: 'nar',  text: 'FIM — Obrigado por jogar Marés do Recife!' },
  ],

  levels: {
    1: {
      title: 'Dias de Sol', place: 'Marco Zero',
      beadName: 'Conta do Sol', beadColor: '#f2c038',
      intro: [
        { who: 'nar',  text: 'Marco Zero, coração do Recife Antigo. O sol nasce dourando o Recife antigo colorido.' },
        { who: 'maju', text: 'O dia nasceu, onde a cidade começou!' },
        { who: 'vovo', text: 'O Marco Zero é o quilômetro zero de Pernambuco. Tudo parte daqui, como você agora.' },
        { who: 'maju', text: 'As janelas da casa ainda estão escuras... Se eu abrir todas, o sol devolve entrar!' },
      ],
      outro: [
        { who: 'nar',  text: 'O sol entrou e a casa inteira sorri dourado.' },
        { who: 'maju', text: 'Manhã do Sol! Quentinha como manhã de janeiro!' },
        { who: 'vovo', text: 'Dia de sol no Recife é convite. E a cidade nunca recusa um convite.' },
      ],
    },
    2: {
      title: 'Praia de Boa Viagem', place: 'Boa Viagem',
      beadName: 'Conta da Areia', beadColor: '#e8d49a',
      intro: [
        { who: 'nar',  text: 'Boa Viagem: coqueiros, calçadão e o mar verde batendo nos arrecifes.' },
        { who: 'maju', text: 'A maré escondeu a conta entre as conchas da praia!' },
        { who: 'vovo', text: 'Os arrecifes deram nome à cidade, sabia? Recife vem deles, das pedras do mar.' },
        { who: 'maju', text: 'Cada concha tem uma irmã gêmea. Achando todos os pares, a areia me entrega a conta!' },
      ],
      outro: [
        { who: 'maju', text: 'Achei todos os pares! E no último... a Conta da Areia!' },
        { who: 'vovo', text: 'A praia guarda o que a gente perde e devolve quando a gente procura com calma.' },
      ],
    },
    3: {
      title: 'Águas do Tubarão', place: 'Mar aberto',
      beadName: 'Conta do Mar', beadColor: '#1d6fa3',
      intro: [
        { who: 'nar',  text: 'Bandeira vermelha na areia. Além dos arrecifes, o mar é dos tubarões.' },
        { who: 'maju', text: 'Tem um banhista lá fora! Ele precisa voltar pra areia sem cruzar com o tubarão!' },
        { who: 'vovo', text: 'O tubarão não é vilão, Maju. O mar fundo é a casa dele. Nós é que somos visita.' },
        { who: 'maju', text: 'Vou guiar o banhista passo a passo. A cada passo dele, o tubarão também nada!' },
      ],
      outro: [
        { who: 'nar',  text: 'O banhista pisa na areia, aliviado. O tubarão segue seu caminho, tranquilo.' },
        { who: 'maju', text: 'A Conta do Mar! Azul como as águas além dos arrecifes.' },
        { who: 'vovo', text: 'Respeitar o mar é a primeira lição de quem nasce aqui.' },
      ],
    },
    4: {
      title: 'Dias de Chuva', place: 'Recife Antigo',
      beadName: 'Conta da Chuva', beadColor: '#7d9fb4',
      intro: [
        { who: 'nar',  text: 'O céu fechou. Chuva de inverno recifense: a cidade vira aquarela cinzenta.' },
        { who: 'maju', text: 'A conta desceu pelas calhas da casa junto com a água da chuva!' },
        { who: 'vovo', text: 'Junho no Recife é assim: chove sem pedir licença. A cidade aprendeu a dançar na chuva.' },
        { who: 'maju', text: 'Vou girar os canos pra levar a água da calha até a cisterna. A conta vem junto!' },
      ],
      outro: [
        { who: 'nar',  text: 'A água corre certinha pelos canos e... PLIM! A conta cai na cisterna.' },
        { who: 'maju', text: 'A Conta da Chuva! Cinza-azulada feito tarde de junho.' },
        { who: 'vovo', text: 'Chuva no Recife não atrapalha a história. Ela faz parte dela.' },
      ],
    },
    5: {
      title: 'Mangue', place: 'Manguezal do Capibaribe',
      beadName: 'Conta da Lama', beadColor: '#8a5a3a',
      intro: [
        { who: 'nar',  text: 'Entre o rio e o mar, o manguezal respira. Raízes tortas seguram a cidade.' },
        { who: 'maju', text: 'Um caranguejo uçá pegou a conta e entrou no labirinto de raízes!' },
        { who: 'vovo', text: 'O mangue é berçário da vida, Maju. Do mangue vem o caranguejo, o peixe, o sustento.' },
        { who: 'maju', text: 'Vou guiar o uçá pelo labirinto. Se ele comer as três folhinhas, solta a conta na saída!' },
      ],
      outro: [
        { who: 'nar',  text: 'O uçá, satisfeito, deixa a conta sobre a lama macia e acena com a pata.' },
        { who: 'maju', text: 'A Conta da Lama! Marrom e viva como o mangue.' },
        { who: 'vovo', text: 'Quem cuida do mangue, cuida do Recife inteiro. Nunca esqueça.' },
      ],
    },
    6: {
      title: 'Cultura Viva', place: 'Mercado de São José',
      beadName: 'Conta da Memória', beadColor: '#c97bb6',
      intro: [
        { who: 'nar',  text: 'No mercado, cheiro de bolo de rolo, renda na bancada, cordel pendurado no barbante.' },
        { who: 'maju', text: 'A conta se escondeu entre os tesouros de Pernambuco!' },
        { who: 'vovo', text: 'Bolo de rolo, renda renascença, literatura de cordel, boneco de barro... cada um é uma história.' },
        { who: 'maju', text: 'A luz caiu e só vejo as sombras! Vou ligar cada tesouro à sua sombra certa.' },
      ],
      outro: [
        { who: 'nar',  text: 'A luz volta e os tesouros brilham nas bancadas. Entre eles, a conta cor-de-rosa.' },
        { who: 'maju', text: 'A Conta da Memória! Cada coisa daqui carrega um pedaço da gente.' },
        { who: 'vovo', text: 'Cultura não se guarda em vitrine, Maju. Se guarda no uso, na festa e na mesa.' },
      ],
    },
    7: {
      title: 'Noite de Maracatu', place: 'Pátio do Terço',
      beadName: 'Conta do Tambor', beadColor: '#d92f2f',
      intro: [
        { who: 'nar',  text: 'A noite cai e o chão treme: é o baque virado do maracatu nação.' },
        { who: 'maju', text: 'A conta tá no meio dos tambores! A rainha disse que só entrega pra quem souber o baque.' },
        { who: 'vovo', text: 'Escuta com o corpo: a alfaia é o trovão, a caixa é a chuva, o gonguê corta o ar, o agbê chia.' },
        { who: 'maju', text: 'Vou ouvir o baque e repetir, tambor por tambor!' },
      ],
      outro: [
        { who: 'nar',  text: 'O terreiro inteiro vibra. A rainha do maracatu sorri e entrega a conta vermelha.' },
        { who: 'maju', text: 'A Conta do Tambor! Meu coração ainda tá batendo no ritmo da alfaia!' },
        { who: 'vovo', text: 'O maracatu é coroa e tambor: memória dos reis do Congo batendo no peito do Recife.' },
      ],
    },
    8: {
      title: 'Frevo no Ar', place: 'Rua da Moeda',
      beadName: 'Conta do Passo', beadColor: '#e8855b',
      intro: [
        { who: 'nar',  text: 'Confete no ar, orquestra afinando: o frevo ferve na rua!' },
        { who: 'maju', text: 'A conta tá girando no meio das sombrinhas coloridas!' },
        { who: 'vovo', text: 'O frevo nasceu aqui, Maju. Vem de "ferver". O passista dança com a sombrinha aberta.' },
        { who: 'maju', text: 'As sombrinhas dançam em sequência. Se eu adivinhar a próxima, entro na roda e pego a conta!' },
      ],
      outro: [
        { who: 'nar',  text: 'Maju acerta o passo, abre a sombrinha e a roda inteira aplaude.' },
        { who: 'maju', text: 'A Conta do Passo! Laranja como sombrinha rodando no ar!' },
        { who: 'vovo', text: 'O frevo é patrimônio do mundo, mas o endereço dele é Recife, Pernambuco.' },
      ],
    },
    9: {
      title: 'Manguebeat', place: 'Beira do mangue',
      beadName: 'Conta da Antena', beadColor: '#3f9b52',
      intro: [
        { who: 'nar',  text: 'No crepúsculo, uma antena parabólica enfiada na lama capta o som da cidade.' },
        { who: 'maju', text: 'Que símbolo é esse, vovô? Uma antena... no mangue?' },
        { who: 'vovo', text: 'É o manguebeat! Chico Science misturou o tambor do maracatu com a guitarra do mundo.' },
        { who: 'vovo', text: '"Caranguejos com cérebro": o mangue antenado com o planeta. A conta tá no som certo.' },
        { who: 'maju', text: 'Vou equalizar a antena até a cidade e o mangue tocarem juntos!' },
      ],
      outro: [
        { who: 'nar',  text: 'A antena vibra: alfaia e guitarra, lama e satélite, tudo na mesma batida.' },
        { who: 'maju', text: 'A Conta da Antena! Verde mangue com som de cidade!' },
        { who: 'vovo', text: 'O Recife olha pro mundo com os pés na lama. É disso que o manguebeat fala.' },
      ],
    },
    10: {
      title: 'Jangadeiros ao Pôr do Sol', place: 'Cais da Alfândega',
      beadName: 'Conta do Poente', beadColor: '#8a3a8a',
      intro: [
        { who: 'nar',  text: 'O céu pega fogo laranja e roxo. As jangadas esperam a última maré do dia.' },
        { who: 'vovo', text: 'Chegou a hora, Maju. A última conta tá na boia do canal, no caminho da jangada.' },
        { who: 'maju', text: 'Os pescadores leem o vento e as correntes... agora é minha vez!' },
        { who: 'vovo', text: 'Trace a rota com cuidado: pedra de arrecife não perdoa casco de jangada.' },
        { who: 'maju', text: 'Vou marcar o caminho todo antes de soltar a vela. Confia, vovô!' },
      ],
      outro: [
        { who: 'nar',  text: 'A jangada desliza pelo canal e Maju apanha a última conta na luz do poente.' },
        { who: 'maju', text: 'A Conta do Poente! O colar... tá completo, vovô!' },
        { who: 'vovo', text: 'Dez contas, dez marés. Agora vem cá, que o sol não espera ninguém pra se despedir.' },
      ],
    },
  },
};

const PUZZLE_HINTS = {
  1: 'Toque numa janela: ela e as vizinhas trocam de estado. Acenda todas!',
  2: 'Toque nas conchas para virar. Encontre os 6 pares!',
  3: 'Toque numa casa vizinha para nadar. A cada passo seu, o tubarão nada também!',
  4: 'Toque nos canos para girar. Leve a água da calha até a cisterna!',
  5: 'Deslize o dedo para mover o uçá. Coma as 3 folhas e chegue à saída!',
  6: 'Toque num tesouro e depois na sombra dele. Ligue os 4!',
  7: 'Ouça o baque e repita tocando os tambores na ordem certa. 3 rodadas!',
  8: 'Observe a sequência de sombrinhas e escolha a próxima. 3 rodadas!',
  9: 'Arraste os cursores e toque em TOCAR. As setas mostram se sobe ou desce!',
  10: 'Toque nas setas para montar a rota e depois em ZARPAR. Desvie das pedras!',
};

// ============================================================
// Encontros com a família (guias do mundo aberto) + final no céu
// who: maju | vovo | jona | mica | jeff | vova | nar
// ============================================================
STORY.meet = {
  // Tutorial: Jonatha (pai) e Micaele (mãe) se despedem da filha (Recife Antigo)
  start: [
    { who: 'jona', text: 'Maju! Vem cá, minha filha. Eu e tua mãe a gente tava te esperando.' },
    { who: 'mica', text: 'Ô coisa linda da mainha... cada dia mais a cara do teu pai. Vem cá, deixa eu te abraçar.' },
    { who: 'maju', text: 'Painho! Mainha! O vovô perdeu as contas do colar das marés... eu prometi que ia achar todas antes do pôr do sol!' },
    { who: 'jona', text: 'A gente sabe, filha. E sabe que tu dá conta de tudo. Mas a cidade é grande — deixa o painho te ensinar primeiro.' },
    { who: 'jona', text: 'Usa o direcional no canto da tela pra caminhar. Vai, experimenta, que eu tô bem aqui de olho em ti.' },
    { who: 'maju', text: 'Assim, painho? Ô, que massa! Dá pra ir pra qualquer canto!' },
    { who: 'mica', text: 'Isso, meu amor. As contas do colar do vovô se espalharam — são aquelas plaquinhas com "?".' },
    { who: 'mica', text: 'Chega pertinho de uma e toca em ENTRAR. Confia em ti, que a gente confia.' },
    { who: 'jona', text: 'Cada bairro tem nove contas. Junta as nove e a ponte pro próximo bairro se abre, viu, filha?' },
    { who: 'mica', text: 'E tu não vai sozinha não. A família toda tá espalhada pela cidade só pra te ver passar.' },
    { who: 'jona', text: 'Teu titio te espera na praia, tua vó no frevo... e o vovô, lá no cais, contando os minutos.' },
    { who: 'maju', text: 'Então bora! Esse colar volta inteirinho — por vocês e pelo vovô. Eu prometo!' },
    { who: 'mica', text: 'Vai com Deus, minha filha. A mainha fica com o coração apertado e cheio de orgulho.' },
    { who: 'nar', text: 'Jonatha e Micaele acenam, lado a lado, até Maju virar a esquina. O Recife inteiro se abre diante dela.' },
  ],
  // Primeira conversa a sós com o pai (rede de segurança / saves antigos)
  jona: [
    { who: 'jona', text: 'Tudo bem por aí, minha filha? O painho fica aqui no Recife Antigo, pode ir tranquila.' },
    { who: 'maju', text: 'Tô bem, painho! Só passei pra te ver um cadinho.' },
    { who: 'jona', text: 'Vem cá então. Sabe o que mais me enche de orgulho? Não são as contas, não. É a coragem que tu tem.' },
    { who: 'maju', text: 'Aprendi com o senhor, painho.' },
    { who: 'jona', text: 'Aprendeu nada, já nasceu valente. Vai, que o painho tá com o coração contigo a cada passo.' },
  ],
  jonaAgain: [
    { who: 'jona', text: 'Tá indo lindo, filha. Completa as nove contas do bairro que a ponte se abre pra ti.' },
    { who: 'maju', text: 'Pode deixar, painho! Faço por você e pela mainha.' },
    { who: 'jona', text: 'Esse é o jeito da minha menina. Vai com cuidado — e volta logo pro abraço do painho.' },
  ],
  // Primeira conversa a sós com a mãe (rede de segurança / saves antigos)
  mica: [
    { who: 'mica', text: 'Minha menina... deixa a mainha te olhar direito. Tá te cuidando nessa correria toda?' },
    { who: 'maju', text: 'Tô sim, mainha! Tô só atrás das contas do vovô.' },
    { who: 'mica', text: 'Eu sei, meu amor. Olha o minimapa ali em cima: as contas douradas são as que tu já pegou.' },
    { who: 'maju', text: 'Boa, mainha! Já tô achando o caminho.' },
    { who: 'mica', text: 'Tô vendo, filha. Vai com fé — a mainha fica aqui rezando baixinho por ti.' },
  ],
  micaAgain: [
    { who: 'mica', text: 'Devagar com o coração, filha, que a maré não tem pressa. Se te perder, olha o minimapa.' },
    { who: 'maju', text: 'Tô de olho, mainha! Já já volto pra te dar um abraço.' },
    { who: 'mica', text: 'Vai, meu amor. Cada conta que tu acha é um pedacinho de orgulho aqui no peito da mainha.' },
  ],
  // Titio Jeff — praia de Boa Viagem
  jeff: [
    { who: 'jeff', text: 'Maju?! Minha sobrinha favorita! Sou eu, teu titio Jeff!' },
    { who: 'maju', text: 'Titio Jeff! Não sabia que você tava aqui em Boa Viagem!' },
    { who: 'jeff', text: 'Moro pertinho da praia. Vim te dar uma força com as contas do mar.' },
    { who: 'jeff', text: 'Repara nos arrecifes: o segredo daqui é ter paciência com a maré.' },
    { who: 'maju', text: 'Valeu, titio! Com você por perto fica bem mais fácil!' },
  ],
  jeffAgain: [
    { who: 'jeff', text: 'Bora, sobrinha! O mar do Recife é teu parceiro. Vai com calma nas contas.' },
    { who: 'maju', text: 'Tô indo, titio! Já já volto pra te mostrar o colar.' },
  ],
  // Vovó — Pátio do Frevo (Rua da Moeda)
  vova: [
    { who: 'vova', text: 'Maju, minha netinha! Chegou bem na hora do frevo!' },
    { who: 'maju', text: 'Vovó! Você aqui no pátio do frevo?' },
    { who: 'vova', text: 'Cresci dançando frevo nesta rua, viu? A sombrinha é quase parte de mim.' },
    { who: 'vova', text: 'Pra pegar as contas daqui, sente o passo: o frevo é ritmo e alegria.' },
    { who: 'maju', text: 'Vou rodar a sombrinha que nem você me ensinou, vovó!' },
  ],
  vovaAgain: [
    { who: 'vova', text: 'Dança, minha neta! Quem tem frevo no pé não perde o compasso da vida.' },
    { who: 'maju', text: 'Tô no ritmo, vovó! Já volto.' },
  ],
};

// Final: o Vovô leva a Maju pelo céu do Recife
STORY.skyEnding = [
  { who: 'vovo', text: 'Oitenta e uma contas, Maju. O colar voltou a brilhar inteiro.' },
  { who: 'maju', text: 'Conheci o Recife todinho, vovô. E reencontrei a nossa família pelo caminho.' },
  { who: 'vovo', text: 'Esse é o maior tesouro, minha neta: a cidade e a gente que faz ela.' },
  { who: 'vovo', text: 'Agora segura firme na minha mão. Vou te mostrar o Recife lá de cima.' },
  { who: 'maju', text: 'Lá de cima, vovô?' },
  { who: 'vovo', text: 'Do céu, Maju. De onde a maré, o mangue e o frevo viram um só brilho.' },
  { who: 'nar', text: 'A jangada se solta da água e sobe devagar, levando os dois pelo céu do Recife.' },
];
