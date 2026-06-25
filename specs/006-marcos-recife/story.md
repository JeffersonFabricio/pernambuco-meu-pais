# Story — Marcos e ambiente do mundo de Recife

> Feature: `006-marcos-recife` · Modo: solo (sem discovery prévio) · Brownfield (jogo Canvas existente)

## Story

**Como** jogador percorrendo o Recife do sonho da Maju,
**quero** que os marcos icônicos (o Marco Zero com sua rosa dos ventos, a igreja à beira-mar, o mar da Beira-Mar) e as áreas dos distritos leiam com clareza no mundo isométrico,
**para que** o mundo pareça o Recife de verdade e eu saiba onde estou.

> Contexto emocional (ver memória `familia-maju`): jogo-homenagem altamente pessoal. Cada marco deve ser tratado com cuidado — o Marco Zero (rosa dos ventos de Cícero Dias), a Igreja de N. S. da Piedade (reencontro das Marias) e a orla são âncoras afetivas, não só cenário.

## Problema (mini-discovery)

Depois que o Manguezal ganhou chão terroso + rio + árvores, ficou **claro qual é a área** do distrito — e ficou bonito. Os demais marcos não têm esse cuidado:

- O **Marco Zero** (coração do Recife Antigo) não aparece no mundo: a rosa dos ventos só existe no puzzle e na cena, nunca no overworld. Recife Antigo (d0) é grama genérica.
- A **Igreja** está **afundada no chão** (desenhada com âncora de NPC de 36px, não de prédio) — o corpo desce abaixo do tile.
- A **Beira-Mar não tem mar**: os tiles de oceano ao norte são cortados pela névoa; só sobra o backdrop, e a orla fica dominada por prédios.

## Persona

O jogador-família (e a própria homenagem): reconhece o Recife real. Marco Zero, a calçada portuguesa, a praia, a igrejinha à beira-mar — esses lugares precisam ser reconhecíveis à primeira vista, em pixel art, na vista isométrica.

## Critérios de aceite

1. **Marco Zero no mundo** — Recife Antigo (d0) exibe uma **praça circular caminhável** no centro, com a rosa dos ventos (`drawRosaDosVentos` — estrela de 8 pontas) **projetada no chão**, delimitando a área (como o chão terroso marca o Manguezal). A rosa é **maior que o sprite de uma concha** e tem forma de bússola (não disco sólido), pra não ser confundida com concha. As 4 conchas de d0 **mantêm suas posições** (col,row) em relação ao baseline.
2. **Igreja como prédio** — a igreja (`asMarias`) é **ancorada na base do seu tile** (base ≈ `tileY + TH/2`, crescendo pra cima como prédio); **nenhum pixel desce abaixo da linha do terreno** do seu tile, e ela ordena por profundidade pelo `col+row` (objetos à frente ocluem). Continua só o prédio (sem avós coladas — mantém 004).
3. **Mar na Beira-Mar** — com a câmera em d1, **≥1 faixa de tiles de oceano** aparece ao norte/beiras, além da praia (a orla mostra mar). A regra é por **tipo de tile** (`'~'`), não por distrito.
4. **Névoa preservada** — terra de distritos **travados** (`g/r/m/.`/prédios) continua oculta; só o oceano (`'~'`) fura a névoa. O spawn de cada distrito (0..8) continua caminhável.
5. **Ambiente dos distritos** (consolidação do trabalho de mundo) — o **Manguezal (d3)** lê como mangue: chão terroso + árvores de mangue (`'m'`) + braço de rio (`'w'`), marcando a área; e **coqueiros** pontuam a orla (areia ao norte e na costa SE). São cenário (não bloqueiam conchas/NPCs além dos tiles `'m'`/`'w'` próprios).
6. **Sem regressão** — `TOTAL_PHASES===31`, `DISTRICT_SIZES[0]===4`, 31 conchas em tiles distintos, **console limpo (0 erros — FF-002)** com tudo desbloqueado, e cores do oceano vindas da paleta de `DESIGN.md` (sem hex avulso).

> **Escopo / consolidação:** esta feature consolida o trabalho de **ambiente do mundo** feito de forma iterativa (mangue terroso, coqueiros) junto com os marcos novos (Marco Zero, igreja-prédio, mar). A **reorganização do elenco** (troca Titio Jeff ↔ Titio Renato, Vó Maria Rita como aparição na igreja) pertence à feature **004-encontro-marias** (spec + teste atualizados lá), não a esta.

> **Validação** (não é AC — é como verificamos): roteiro manual via `window.__*` / `World3D.reset(d)` + checagens headless de estrutura/estado. Baseline brownfield, sem render headless. **Pré-condição headless:** expor `walkable` e `tileVisible` na API pública do `World3D` (hoje são closures internas — sem isso, 4 checagens não rodam).

> **Arquitetura:** sem blueprint (não é fluxo multi-passo). **Sem ADR** se a implementação ficar contida em `js/world3d.js` (MAP + render do World3D moram lá; `levels.js` não é tocado). A regra de domínio "oceano fura a névoa" fica rastreável no cenário BDD dedicado. Se a praça exigir mexer em `levels.js`, aí sobe a decisão (vira ADR) — ver PARE.

> **Perf (Desejável):** a rosa é decal de chão renderizado no loop — gerar **uma vez** (cache offscreen / path) e reusar, não recalcular por frame.
