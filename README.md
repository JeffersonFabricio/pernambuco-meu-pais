# Um sonho 🌊⛵

Jogo mobile em **pixel art**, estilo **mundo livre** (open world), todo ambientado no
**Recife, Pernambuco**. Maju percorre ruas de **paralelepípedo** e **calçada portuguesa** (as
ondas preto-e-creme de Boa Viagem e do Marco Zero), atravessa **pontes de madeira** sobre os
rios ("a Veneza Brasileira") e recupera as **31 conchas** do colar de marés
do avô jangadeiro. São **9 distritos** (3 a 4 conchas cada), e cada concha é um puzzle — são **10
motores** diferentes. O mapa **se abre conforme ela avança**: complete as conchas de um
bairro e a ponte para o próximo se libera (os bloqueados ficam na névoa).

Pelo caminho, Maju reencontra a **família**, que a guia: **Jonatha e Micaele** ensinam o mundo
no início, o **titio Jeff** a recebe na praia, a **vovó** dança o frevo na Rua da Moeda, e o
**Vovô Maro** a espera no cais — para, no fim, levá-la a passear pelo céu do Recife.

Feito em HTML5 + Canvas puro — sem dependências, sem imagens externas (toda a arte é
desenhada por código) e sem servidor de backend. Roda em qualquer navegador de celular.

## Como se joga

- **Direcional** no canto inferior esquerdo (ou WASD/setas no teclado) move a Maju pelo mapa.
- Chegue perto de uma **concha** (dourada, brilhando no mapa) e toque **ENTRAR** para jogar aquele puzzle.
- Concha conquistada brilha dourada no mapa; volte quando quiser para rejogar.
- Dentro de um bairro liberado, faça as conchas **na ordem que quiser**. Complete o bairro
  para abrir a ponte e revelar o próximo (o nome do bairro e o progresso aparecem no topo).
- Chegue perto de um **familiar** e toque **FALAR** para conversar e receber dicas.
- Junte as 31 conchas e fale com o **Vovô Maro** no cais para o desfecho no céu.

## Os 9 cordões (31 conchas)

| # | Cordão | Tema | Fase-âncora |
|---|--------|------|-------------|
| 1 | Dias de Sol | Marco Zero, Rua do Bom Jesus, Torre Malakoff... | Acender a casa |
| 2 | Beira-Mar | Boa Viagem, Piedade, arrecifes, Candeias | Memória + tubarão |
| 3 | Dias de Chuva | Inverno recifense, São João, Cais do Sertão | Canos da chuva |
| 4 | Coração de Mangue | Uçá, guaiamum, garças, maré de sizígia | Labirinto do uçá |
| 5 | Cultura Viva | Mercado de São José, tapioca, cordel, Vitalino | Tesouros & sombras |
| 6 | Noite dos Tambores | Maracatu, calunga, caboclinho, ciranda | Ritmo do baque |
| 7 | Fervo do Frevo | Galo da Madrugada, Paço do Frevo, o passo | Sequência de sombrinhas |
| 8 | Antenas do Mangue | Chico Science, Nação Zumbi, manguebeat | Equalizador |
| 9 | Maré 81 | Boi Voador, Perna Cabeluda, DDD 81, poente | Rota da jangada (fase final) |

Cada cordão mistura os 10 motores de puzzle com dificuldade crescente e geração
procedural (labirintos, canos e rotas sempre solúveis — validados por BFS). Cada fase nova
traz uma curiosidade real do Recife; as fases-âncora têm diálogos completos com Maju e
Vovô Maro. O progresso fica salvo no aparelho (localStorage).

## Como jogar no celular

1. Sirva a pasta em um servidor local:
   ```bash
   npx http-server -p 8765 .
   ```
2. No celular (mesma rede Wi-Fi), abra `http://SEU_IP:8765`.
3. Ou publique a pasta em qualquer hospedagem estática (GitHub Pages, Netlify, Vercel) —
   o `manifest.json` permite "Adicionar à tela inicial" como app (PWA).

## Estrutura

```
index.html        casca do jogo (canvas 360x640)
css/style.css     escala pixelada para a tela
js/audio.js       sons chiptune via WebAudio (tambores do maracatu inclusos)
js/sprites.js     pixel art procedural: personagens (Maju andando), ícones e cenários
js/story.js       roteiro principal (diálogos PT-BR) e dicas dos puzzles
js/levels.js      os 9 cordões e suas conchas (31 no total), curiosidades e dificuldade
js/puzzles.js     os 10 motores de puzzle parametrizáveis
js/main.js        mundo livre (mapa, câmera, direcional, distritos) + fluxo de fases e save
```
