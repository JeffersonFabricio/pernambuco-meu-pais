// ============================================================
// Marés do Recife — história e diálogos
// ============================================================
// who: 'maju' | 'vovo' | 'nar' (narrador)
const STORY = {
  opening: [
    { who: 'maju', text: 'Isto é um sonho?' },
    { who: 'maju', text: 'Tô ouvindo um batuque ao longe...' },
    { who: 'maju', text: 'Um mangue, a praia, gente dançando frevo!' },
    { who: 'maju', text: '... Onde eu tô?' },
  ],

  ending: [
    { who: 'nar',  text: 'O sol se deita devagar atrás do Capibaribe. O colar brilha inteiro no peito do vovô.' },
    { who: 'vovo', text: 'Trinta e uma conchas, trinta e uma marés... e todas passaram por suas mãos, Maju.' },
    { who: 'maju', text: 'Aprendi que o Recife é sol e chuva, mangue e mar, tambor e silêncio.' },
    { who: 'vovo', text: 'O colar agora é seu. Quem guarda as histórias de um lugar, guarda o lugar.' },
    { who: 'maju', text: 'Boa viagem, vovô. Quando a jangada voltar, eu conto as histórias novas!' },
    { who: 'nar',  text: 'A jangada vira um ponto no horizonte dourado. E a maré, como sempre, promete voltar.' },
  ],

  levels: {
    1: {
      title: 'Dias de Sol', place: 'Marco Zero',
      beadName: 'Concha do Sol', beadColor: '#f2c038',
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
      beadName: 'Concha da Areia', beadColor: '#e8d49a',
      intro: [
        { who: 'nar',  text: 'Boa Viagem: coqueiros, calçadão e o mar verde batendo nos arrecifes.' },
        { who: 'maju', text: 'A maré escondeu a concha entre as conchas da praia!' },
        { who: 'vovo', text: 'Os arrecifes deram nome à cidade, sabia? Recife vem deles, das pedras do mar.' },
        { who: 'maju', text: 'Cada concha tem uma irmã gêmea. Achando todos os pares, a areia me entrega a concha!' },
      ],
      outro: [
        { who: 'maju', text: 'Achei todos os pares! E no último... a Concha da Areia!' },
        { who: 'vovo', text: 'A praia guarda o que a gente perde e devolve quando a gente procura com calma.' },
      ],
    },
    3: {
      title: 'Águas do Tubarão', place: 'Mar aberto',
      beadName: 'Concha do Mar', beadColor: '#1d6fa3',
      intro: [
        { who: 'nar',  text: 'Bandeira vermelha na areia. Além dos arrecifes, o mar é dos tubarões.' },
        { who: 'maju', text: 'Tem um banhista lá fora! Ele precisa voltar pra areia sem cruzar com o tubarão!' },
        { who: 'vovo', text: 'O tubarão não é vilão, Maju. O mar fundo é a casa dele. Nós é que somos visita.' },
        { who: 'maju', text: 'Vou guiar o banhista passo a passo. A cada passo dele, o tubarão também nada!' },
      ],
      outro: [
        { who: 'nar',  text: 'O banhista pisa na areia, aliviado. O tubarão segue seu caminho, tranquilo.' },
        { who: 'maju', text: 'A Concha do Mar! Azul como as águas além dos arrecifes.' },
        { who: 'vovo', text: 'Respeitar o mar é a primeira lição de quem nasce aqui.' },
      ],
    },
    4: {
      title: 'Dias de Chuva', place: 'Recife Antigo',
      beadName: 'Concha da Chuva', beadColor: '#7d9fb4',
      intro: [
        { who: 'nar',  text: 'O céu fechou. Chuva de inverno recifense: a cidade vira aquarela cinzenta.' },
        { who: 'maju', text: 'A concha desceu pelas calhas da casa junto com a água da chuva!' },
        { who: 'vovo', text: 'Junho no Recife é assim: chove sem pedir licença. A cidade aprendeu a dançar na chuva.' },
        { who: 'maju', text: 'Vou girar os canos pra levar a água da calha até a cisterna. A concha vem junto!' },
      ],
      outro: [
        { who: 'nar',  text: 'A água corre certinha pelos canos e... PLIM! A concha cai na cisterna.' },
        { who: 'maju', text: 'A Concha da Chuva! Cinza-azulada feito tarde de junho.' },
        { who: 'vovo', text: 'Chuva no Recife não atrapalha a história. Ela faz parte dela.' },
      ],
    },
    5: {
      title: 'Mangue', place: 'Manguezal do Capibaribe',
      beadName: 'Concha da Lama', beadColor: '#8a5a3a',
      intro: [
        { who: 'nar',  text: 'Entre o rio e o mar, o manguezal respira. Raízes tortas seguram a cidade.' },
        { who: 'maju', text: 'Um caranguejo uçá escondeu a concha entre os bichos do mangue e embaralhou tudo!' },
        { who: 'vovo', text: 'O mangue é berçário da vida, Maju. Do mangue vem o caranguejo, o peixe, o sustento.' },
        { who: 'maju', text: 'Cada bicho tem um par idêntico escondido na lama. Vou virar as pedras e encontrar todos os pares!' },
      ],
      outro: [
        { who: 'nar',  text: 'O uçá, satisfeito, deixa a concha sobre a lama macia e acena com a pata.' },
        { who: 'maju', text: 'A Concha da Lama! Marrom e viva como o mangue.' },
        { who: 'vovo', text: 'Quem cuida do mangue, cuida do Recife inteiro. Nunca esqueça.' },
      ],
    },
    6: {
      title: 'Cultura Viva', place: 'Mercado de São José',
      beadName: 'Concha da Memória', beadColor: '#c97bb6',
      intro: [
        { who: 'nar',  text: 'No mercado, cheiro de bolo de rolo, renda na bancada, cordel pendurado no barbante.' },
        { who: 'maju', text: 'A concha se escondeu entre os tesouros de Pernambuco!' },
        { who: 'vovo', text: 'Bolo de rolo, renda renascença, literatura de cordel, boneco de barro... cada um é uma história.' },
        { who: 'maju', text: 'A luz caiu e só vejo as sombras! Vou ligar cada tesouro à sua sombra certa.' },
      ],
      outro: [
        { who: 'nar',  text: 'A luz volta e os tesouros brilham nas bancadas. Entre eles, a concha cor-de-rosa.' },
        { who: 'maju', text: 'A Concha da Memória! Cada coisa daqui carrega um pedaço da gente.' },
        { who: 'vovo', text: 'Cultura não se guarda em vitrine, Maju. Se guarda no uso, na festa e na mesa.' },
      ],
    },
    7: {
      title: 'Noite de Maracatu', place: 'Pátio do Terço',
      beadName: 'Concha do Tambor', beadColor: '#d92f2f',
      intro: [
        { who: 'nar',  text: 'A noite cai e o chão treme: é o baque virado do maracatu nação.' },
        { who: 'maju', text: 'A concha tá no meio dos tambores! A rainha disse que só entrega pra quem souber o baque.' },
        { who: 'vovo', text: 'Escuta com o corpo: a alfaia é o trovão, a caixa é a chuva, o gonguê corta o ar, o agbê chia.' },
        { who: 'maju', text: 'Vou ouvir o baque e repetir, tambor por tambor!' },
      ],
      outro: [
        { who: 'nar',  text: 'O terreiro inteiro vibra. A rainha do maracatu sorri e entrega a concha vermelha.' },
        { who: 'maju', text: 'A Concha do Tambor! Meu coração ainda tá batendo no ritmo da alfaia!' },
        { who: 'vovo', text: 'O maracatu é coroa e tambor: memória dos reis do Congo batendo no peito do Recife.' },
      ],
    },
    8: {
      title: 'Frevo no Ar', place: 'Rua da Moeda',
      beadName: 'Concha do Passo', beadColor: '#e8855b',
      intro: [
        { who: 'nar',  text: 'Confete no ar, orquestra afinando: o frevo ferve na rua!' },
        { who: 'maju', text: 'A concha tá girando no meio das sombrinhas coloridas!' },
        { who: 'vovo', text: 'O frevo nasceu aqui, Maju. Vem de "ferver". O passista dança com a sombrinha aberta.' },
        { who: 'maju', text: 'As sombrinhas dançam em sequência. Se eu adivinhar a próxima, entro na roda e pego a concha!' },
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
        { who: 'vovo', text: '"Caranguejos com cérebro": o mangue antenado com o planeta. A concha tá no som certo.' },
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
        { who: 'vovo', text: 'Chegou a hora, Maju. A última concha tá na boia do canal, no caminho da jangada.' },
        { who: 'maju', text: 'Os pescadores leem o vento e as correntes... agora é minha vez!' },
        { who: 'vovo', text: 'Trace a rota com cuidado: pedra de arrecife não perdoa casco de jangada.' },
        { who: 'maju', text: 'Vou marcar o caminho todo antes de soltar a vela. Confia, vovô!' },
      ],
      outro: [
        { who: 'nar',  text: 'A jangada desliza pelo canal e Maju apanha a última concha na luz do poente.' },
        { who: 'maju', text: 'A Conta do Poente! O colar... tá completo, vovô!' },
        { who: 'vovo', text: 'Dez conchas, dez marés. Agora vem cá, que o sol não espera ninguém pra se despedir.' },
      ],
    },
  },
};

const PUZZLE_HINTS = {
  1: 'Toque numa janela: ela e as vizinhas trocam de estado. Acenda todas!',
  2: 'Toque nas conchas para virar. Encontre os 6 pares!',
  3: 'Toque numa casa vizinha para nadar. A cada passo seu, o tubarão nada também!',
  4: 'Toque nos canos para girar. Leve a água da calha até a cisterna!',
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
    { who: 'jona', text: 'Maju! Que bom que chegou! Bem-vinda ao Recife Antigo, filha!' },
    { who: 'mica', text: 'Por aqui tudo começou... A cidade, as histórias, a nossa família.' },
    { who: 'jona', text: 'Mas aconteceu algo hoje. O vovô Maro perdeu o colar das marés.' },
    { who: 'maju', text: 'O colar do vovô? O que guarda as histórias do Recife?' },
    { who: 'mica', text: 'Esse mesmo. Trinta e uma conchas espalhadas pela cidade inteira!' },
    { who: 'jona', text: 'Hoje ele parte com os jangadeiros. Precisa do colar inteiro antes do pôr do sol.' },
    { who: 'maju', text: 'Então eu vou atrás delas! Por onde começo?' },
    { who: 'jona', text: 'Por aqui mesmo! Usa o direcional pra caminhar. Vai, experimenta!' },
    { who: 'mica', text: 'As conchas brilham douradas pelo mapa. Chega perto de uma e toca em ENTRAR.' },
    { who: 'jona', text: 'Cada bairro tem suas conchas. Completa todas e a ponte pro próximo bairro se abre pra ti.' },
    { who: 'mica', text: 'A família toda tá espalhada pela cidade — teu titio, tua vó, tua vovó Maria...' },
    { who: 'jona', text: 'E o vovô Maro te espera lá no cais, contando os minutos.' },
    { who: 'maju', text: 'Esse colar volta inteirinho. Eu prometo!' },
    { who: 'nar',  text: 'Jonatha e Micaele acenam até Maju virar a esquina. O Recife começa a se abrir diante dela.' },
  ],
  // Boas-vindas ao Recife — primeira conversa com a Micaele (recebe a Maju e encaminha pro painho)
  mica: [
    { who: 'mica', text: 'Maju! Que bom que chegou, minha filha! Bem-vinda ao Recife!' },
    { who: 'maju', text: 'Mainha! Que cidade linda é essa toda?' },
    { who: 'mica', text: 'É o Recife do teu sonho mais bonito. Foi aqui que a nossa história começou.' },
    { who: 'mica', text: 'E hoje ele precisa de ti, meu amor — aconteceu uma coisa com o colar do vovô.' },
    { who: 'maju', text: 'O colar do vovô Maro? O que foi que aconteceu?' },
    { who: 'mica', text: 'Vai falar com o teu painho ali, que ele te explica tudo direitinho.' },
    { who: 'maju', text: 'Tô indo, mainha!' },
  ],
  // Reencontro com a mãe — mensagem motivadora curta
  micaAgain: [
    { who: 'mica', text: 'Eu sei que tu consegue, minha filha. Vai com o coração que as conchas voltam!' },
    { who: 'maju', text: 'Vou sim, mainha! Já já volto pra te dar um abraço.' },
  ],
  // Desvio: tentar falar com o pai antes da mãe — não explica a missão
  jonaBlocked: [
    { who: 'jona', text: 'Opa, minha menina! Antes de tudo, vai dar um alô na tua mãe ali, viu?' },
    { who: 'maju', text: 'Tá bom, painho! Já volto.' },
  ],
  // Primeira conversa com o pai (após a Micaele) — explica a missão do colar (libera a seta)
  jona: [
    { who: 'jona', text: 'Maju! Que orgulho ver minha menina aqui!' },
    { who: 'jona', text: 'Aconteceu uma coisa hoje: o vovô Maro perdeu o colar das marés.' },
    { who: 'maju', text: 'O colar do vovô? O que guarda as histórias do Recife?' },
    { who: 'jona', text: 'Esse mesmo. As conchas se espalharam pela cidade inteira!' },
    { who: 'jona', text: 'O vovô parte com os jangadeiros ao pôr do sol. Precisa do colar inteiro antes.' },
    { who: 'maju', text: 'Então eu vou atrás delas! Por onde começo?' },
    { who: 'jona', text: 'As conchas brilham douradas pelo mapa. Chega perto de uma e toca em ENTRAR.' },
    { who: 'jona', text: 'Cada bairro tem as suas. Completa todas e a ponte pro próximo se abre pra ti.' },
    { who: 'jona', text: 'Segue a seta dourada, filha — e volta logo pro abraço do painho.' },
    { who: 'maju', text: 'Esse colar volta inteirinho. Eu prometo!' },
  ],
  // Reencontro com o pai — mensagem motivadora curta
  jonaAgain: [
    { who: 'jona', text: 'Tá indo lindo, filha. Eu sei que tu consegue — vai lá e volta logo!' },
    { who: 'maju', text: 'Pode deixar, painho!' },
  ],
  // Titio Jeff — praia de Boa Viagem
  jeff: [
    { who: 'jeff', text: 'Maju?! Sou eu, teu titio Jeff!' },
    { who: 'maju', text: 'Titio Jeff! Não sabia que você tava aqui em Boa Viagem!' },
    { who: 'jeff', text: 'Moro pertinho da praia. Vim te dar uma força com as conchas do mar.' },
    { who: 'jeff', text: 'Repara nos arrecifes: o segredo daqui é ter paciência com a maré.' },
    { who: 'maju', text: 'Valeu, titio! Com você por perto fica bem mais fácil!' },
  ],
  jeffAgain: [
    { who: 'jeff', text: 'Bora, sobrinha! O mar do Recife é teu parceiro. Vai com calma nas conchas.' },
    { who: 'maju', text: 'Tô indo, titio! Já já volto pra te mostrar o colar.' },
  ],
  // Vovó — Pátio do Frevo (Rua da Moeda)
  vova: [
    { who: 'vova', text: 'Maju, minha netinha! Chegou bem na hora do frevo!' },
    { who: 'maju', text: 'Vovó! Você aqui no pátio do frevo?' },
    { who: 'vova', text: 'Cresci dançando frevo nesta rua, viu? A sombrinha é quase parte de mim.' },
    { who: 'vova', text: 'Pra pegar as conchas daqui, sente o passo: o frevo é ritmo e alegria.' },
    { who: 'maju', text: 'Vou rodar a sombrinha que nem você me ensinou, vovó!' },
  ],
  vovaAgain: [
    { who: 'vova', text: 'Dança, minha neta! Quem tem frevo no pé não perde o compasso da vida.' },
    { who: 'maju', text: 'Tô no ritmo, vovó! Já volto.' },
  ],

  // Primos Ravi e Nicolas — Recife na Chuva (d2)
  primos: [
    { who: 'ravi', text: 'Prima Maju chegou! Nicolas, ela tá aqui, olha!' },
    { who: 'nico', text: 'Ê, prima! Pensamos que ia perder a chuva do Recife!' },
    { who: 'maju', text: 'Ravi! Nicolas! Que saudade de vocês dois!' },
    { who: 'ravi', text: 'A chuva aqui não é pra correr, prima. É pra dançar na calçada.' },
    { who: 'nico', text: 'A gente sempre vai tá junto, Maju. Primo é isso: parceiro pra toda aventura, chuva ou sol.' },
    { who: 'maju', text: 'Com vocês dois do meu lado, nada parece difícil!' },
    { who: 'ravi', text: 'Vai lá, prima! Cada concha que tu achar, a gente tá aqui torcendo.' },
    { who: 'nico', text: 'E quando tu voltar a gente conta história de chuva. Combinado?' },
    { who: 'maju', text: 'Combinado, primos! Já já tô de volta com o colar quase cheio!' },
  ],
  primosAgain: [
    { who: 'ravi', text: 'Tá arrasando, prima! Já perdemos a conta de quantas conchas tu achou.' },
    { who: 'nico', text: 'A gente não vai a lugar nenhum, Maju. Tô aqui na chuva com o Ravi, sempre.' },
    { who: 'maju', text: 'Adoro vocês dois! Já já volto!' },
  ],

  // Titio Renato — Manguezal (d3) — Padre Cícero e as promessas nordestinas
  renato: [
    { who: 'renato', text: 'Maju! É o titio Renato, aqui no meio do manguezal!' },
    { who: 'maju',   text: 'Titio! Que alegria te ver por aqui!' },
    { who: 'renato', text: 'Vim te contar de uma devoção muito especial do nosso povo nordestino.' },
    { who: 'maju',   text: 'Me conta, titio! Adoro quando você conta histórias.' },
    { who: 'renato', text: 'Você sabe quem é o Padrinho Padre Cícero? Um padre do Juazeiro do Norte, no Ceará.' },
    { who: 'renato', text: 'O povo nordestino ama ele como a um santo. Quando a gente tem um desejo no coração, faz uma promessa: "Padrinho, se acontecer, eu cumpro tal penitência."' },
    { who: 'maju',   text: 'É uma promessa de amor e fé, titio?' },
    { who: 'renato', text: 'Exatamente. É o amor transformado em compromisso com Deus. A nossa família fez promessa por você, Maju.' },
    { who: 'maju',   text: 'Por mim?' },
    { who: 'renato', text: 'Por ti. Porque o amor da família não tem distância — nem a do céu separa.' },
    { who: 'maju',   text: 'Vou guardar isso no coração pra sempre, titio Renato.' },
    { who: 'renato', text: 'A lição de hoje: fé é o que nos carrega quando as pernas cansam. Vai com Deus, sobrinha.' },
  ],
  renatoAgain: [
    { who: 'renato', text: 'Lembra, Maju: fé não é ausência de medo. É seguir em frente mesmo com ele.' },
    { who: 'maju',   text: 'Eu lembro, titio! Cada concha que acho é uma promessa cumprida.' },
    { who: 'renato', text: 'Isso mesmo, sobrinha. O Padrinho Padre Cícero estaria orgulhoso de ti.' },
  ],

  // Titio Bruno — Pátio do Terço (d5, maracatu e comunidade)
  bruno: [
    { who: 'bruno', text: 'Maju! Titio Bruno aqui, no pátio do maracatu!' },
    { who: 'maju',  text: 'Titio Bruno! Que barulho bonito é esse?' },
    { who: 'bruno', text: 'É a alfaia, sobrinha. O tambor do maracatu. Sente como o chão treme?' },
    { who: 'maju',  text: 'Parece que o coração da cidade tá batendo, titio!' },
    { who: 'bruno', text: 'Exatamente. E sabe por que o tambor soa assim de forte?' },
    { who: 'maju',  text: 'Por quê?' },
    { who: 'bruno', text: 'Porque ninguém bate sozinho. Cada mão no couro, cada voz no canto — só funciona porque é junto.' },
    { who: 'bruno', text: 'A família é igual, Maju. A gente só soa bonito quando tá unido.' },
    { who: 'maju',  text: 'Então a nossa família é um maracatu, titio!' },
    { who: 'bruno', text: 'Do melhor! Vai lá, sobrinha. O titio Bruno tá no seu ritmo, sempre.' },
  ],
  brunoAgain: [
    { who: 'bruno', text: 'Ouve o tambor, Maju. Quando tiver com saudade da família, ele toca aqui dentro.' },
    { who: 'maju',  text: 'Tô ouvindo, titio. Tô sempre ouvindo.' },
    { who: 'bruno', text: 'Vai, sobrinha. O maracatu te acompanha em cada passo.' },
  ],

  // Vovó materna (Vovó Maria, no céu) — Beira do Mangue (d7)
  vovoMae: [
    { who: 'nar',     text: 'A brisa do mangue traz um perfume de saudade. Uma figura luminosa surge entre as raízes.' },
    { who: 'vovoMae', text: 'Maju... minha menina linda...' },
    { who: 'maju',    text: 'Vovó?! Mas como... você tá aqui?' },
    { who: 'vovoMae', text: 'Vim do céu só pra te ver, meu amor. Não podia perder.' },
    { who: 'maju',    text: 'Então o céu é real, vovó?' },
    { who: 'vovoMae', text: 'Real como o amor que sinto por ti. E esse amor não tem distância, não tem fim.' },
    { who: 'vovoMae', text: 'Na nossa família, as meninas levam o nome de Maria no coração. Você também, minha Maju.' },
    { who: 'maju',    text: 'Maria... como a mãe de Jesus?' },
    { who: 'vovoMae', text: 'E como todas as avós, mães e filhas que vieram antes de ti. Maria é força, é ternura, é amor que não acaba.' },
    { who: 'maju',    text: 'Então não preciso ter medo de nada.' },
    { who: 'vovoMae', text: 'Nunca, minha flor. O amor que vai pro céu não desaparece — fica guardado no coração de quem fica.' },
    { who: 'nar',     text: 'A figura luminosa sorri e some devagar entre as raízes do mangue, deixando um calor no ar.' },
  ],
  vovoMaeAgain: [
    { who: 'vovoMae', text: 'Estou sempre por perto, minha Maju. Nunca estás sozinha.' },
    { who: 'maju',    text: 'Sinto isso, vovó. Sinto mesmo.' },
    { who: 'vovoMae', text: 'Vai, meu amor. O colar vai ficar lindo.' },
  ],
};

// Final: o Vovô leva a Maju pelo céu do Recife
STORY.skyEnding = [
  { who: 'vovo', text: 'Trinta e uma conchas, Maju. O colar voltou a brilhar inteiro.' },
  { who: 'maju', text: 'Conheci o Recife todinho, vovô. E reencontrei a família pelo caminho.' },
  { who: 'maju', text: 'Painho, mainha, titio Jeff, titio Bruno, titio Renato, os primos, vovó... e até a vovó Maria que veio do céu me ver.' },
  { who: 'vovo', text: 'Esse é o maior tesouro, minha neta: a cidade e a gente que faz ela.' },
  { who: 'vovo', text: 'Aprendeu muito nessa jornada: coragem, fé, promessa do Padrinho, o ritmo do tambor, amor que não tem fim.' },
  { who: 'maju', text: 'Aprendi com cada um. E cada lição vai ficar aqui no peito pra sempre.' },
  { who: 'vovo', text: 'Agora segura firme na minha mão. Vou te mostrar o Recife lá de cima.' },
  { who: 'maju', text: 'Lá de cima, vovô?' },
  { who: 'vovo', text: 'Sim. De onde a maré, o mangue, o frevo e o amor da família viram um só brilho.' },
  { who: 'nar',  text: 'A jangada se solta da água e sobe devagar, levando os dois pelo céu do Recife.' },
  { who: 'nar',  text: 'E em cada estrela que passa, um rosto familiar sorri.' },
];
