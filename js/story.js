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
