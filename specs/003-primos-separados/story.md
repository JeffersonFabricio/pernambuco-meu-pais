# Story — Os primos como dois personagens

> Modo: solo (sem `.discovery/` prévio) · Projeto: brownfield

## História

**Como** Maju explorando o Recife na Chuva (distrito 2),
**quero** encontrar o Ravi e o Nicolas como dois personagens distintos no mapa,
**para que** os meus dois primos sejam de fato duas pessoas — e não uma figura só rotulada "OS PRIMOS".

## Contexto

No mapa-mundo isométrico ([world3d.js:432](../../js/world3d.js#L432)), o NPC `primos` desenha **apenas o Ravi** (`NPC_DRAW.primos = drawRavi`). O label "OS PRIMOS" cobre um único sprite — o Nicolas não aparece. A função `drawPrimos()` ([sprites.js:308](../../js/sprites.js#L308)) que desenha os dois lado a lado só é usada no modo fase antigo (`main.js`), não no mundo navegável.

O cliente pediu: "os primos estão ocupando o mesmo lugar. São dois primos, devem ser dois personagens." A decisão de produto (confirmada) é **dois NPCs separados**, cada um em seu ponto, com label e conversa próprios — preservando o sentido de dupla (um referencia o outro).

> ⚠️ Projeto afetivo (homenagem familiar). A lição da companhia — "primo é parceiro pra toda aventura, chuva ou sol" — **não pode se perder** na divisão (Lei do Domínio: não remover referências familiares).

## Critérios de Aceite

1. No mapa-mundo, o distrito 2 mostra **dois sprites distintos** — Ravi e Nicolas — em **tiles diferentes**, cada um com seu próprio label ("RAVI" e "NICOLAS") e sem sobreposição.
2. Tocar o Ravi abre a conversa dele; tocar o Nicolas abre a conversa dele — **conversas independentes**, cada uma referenciando o outro primo (mantêm o sentido de dupla).
3. A **lição da companhia** ("primo é parceiro pra toda aventura, chuva ou sol") continua presente em pelo menos uma das duas conversas — nenhum conteúdo afetivo é removido.
4. Jogador que **já conheceu os primos** num save anterior (`met.primos`) não vê a conversa de introdução de novo: ao migrar, Ravi e Nicolas são tratados como já conhecidos (sem regressão de progresso).
5. O jogo carrega sem erro de console e a contagem de fases/conchas do distrito 2 **não muda** (a divisão é de NPCs-guia, não de fases).

## Decisão sobre arquitetura

_Sem ADR — feature dentro dos padrões da stack (edição de `WORLD_NPCS`, `NPC_DRAW`, diálogos em `story.js` e migração defensiva de save já estabelecida)._ Blueprint dispensado: fluxo de ≤ 2 passos por interação.
