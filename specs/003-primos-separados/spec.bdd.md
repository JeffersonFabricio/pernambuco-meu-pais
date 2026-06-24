# Spec BDD — Os primos como dois personagens

> Feature: `003-primos-separados` · Story: [story.md](story.md)
> Validação: manual no navegador via `window.__*` (sem framework de teste — baseline brownfield). Roteiros concretos no fim do arquivo.

> **Decisão de produto (revisão dos specialists):** a `lesson` da companhia fica em **ambos** os primos — assim a lição aparece independentemente de qual primo a Maju tocar primeiro.
> **Arrays distintos:** `WORLD_NPCS` (em `world3d.js`) controla os sprites/labels no mapa-mundo; `NPCS` (em `main.js`, exposto em `window.__world.npcs`) controla a interação. Os cenários abaixo indicam qual array cada asserção inspeciona.

```gherkin
Funcionalidade: Ravi e Nicolas como dois NPCs distintos no Recife na Chuva (d2)
  Para que os dois primos da Maju sejam de fato duas pessoas no mundo,
  o mapa-mundo deve desenhar Ravi e Nicolas em pontos separados,
  cada um com sua conversa, preservando a lição da companhia.

  Contexto:
    Dado que o distrito 2 (Recife na Chuva) está desbloqueado
    E que o mapa-mundo isométrico está sendo exibido

  Cenário: Dois sprites distintos em tiles diferentes
    Quando o distrito 2 é renderizado
    Então WORLD_NPCS contém uma entrada "ravi" e uma entrada "nicolas"
    E os pares (col,row) de "ravi" e "nicolas" são diferentes
    E não existe entrada "primos" em WORLD_NPCS
    E cada um exibe seu próprio label ("RAVI" e "NICOLAS")

  Cenário: Conversa de introdução do Ravi menciona o Nicolas
    Dado que "met.ravi" é falso
    Quando a Maju toca o Ravi
    Então é exibido STORY.meet.ravi (introdução, não reencontro)
    E ao menos uma fala do Ravi cita "Nicolas"
    E ao concluir, "met.ravi" passa a ser verdadeiro

  Cenário: Conversa de introdução do Nicolas menciona o Ravi
    Dado que "met.nicolas" é falso
    Quando a Maju toca o Nicolas
    Então é exibido STORY.meet.nicolas (introdução, não reencontro)
    E ao menos uma fala do Nicolas cita "Ravi"
    E ao concluir, "met.nicolas" passa a ser verdadeiro

  Cenário: A lição da companhia aparece ao conhecer qualquer um dos primos
    Dado que "met.ravi" e "met.nicolas" são falsos
    Quando a Maju conclui a conversa de introdução de Ravi OU de Nicolas
    Então o toast de lição é exibido com a substring "parceiro pra toda aventura"

  Cenário: Reencontro do Ravi após já ter conhecido
    Dado que "met.ravi" já é verdadeiro
    Quando a Maju toca o Ravi de novo
    Então é exibido STORY.meet.raviAgain (reencontro), não a introdução

  Cenário: Conhecer Nicolas antes de Ravi não interfere na intro do Ravi
    Dado que "met.ravi" e "met.nicolas" são falsos
    Quando a Maju toca o Nicolas primeiro e conclui a conversa
    Então "met.nicolas" vira verdadeiro e "met.ravi" continua falso
    Quando a Maju toca o Ravi em seguida
    Então é exibido STORY.meet.ravi (introdução do Ravi)

  # --- migração de save (Lei do Domínio §4: progresso nunca regride) ---

  Cenário: Save antigo com met.primos é migrado para met.ravi e met.nicolas
    Dado um save v3 cujo "met" contém { primos: true }
    Quando o jogo carrega esse save (parseSave)
    Então "met.ravi" e "met.nicolas" passam a ser verdadeiros
    E a Maju vê as conversas de reencontro (raviAgain / nicolasAgain), não as introduções

  Cenário: Save sem met.primos mantém os primos como não conhecidos
    Dado um save v3 cujo "met" não tem a chave "primos" (ausente ou false — equivalentes)
    Quando o jogo carrega esse save
    Então "met.ravi" e "met.nicolas" são falsy
    E a Maju vê as conversas de introdução ao tocar cada primo

  Cenário: Save malformado não trava o carregamento (load defensivo)
    Dado um save v3 cujo "met" é null ou um valor não-objeto
    Quando o jogo carrega esse save
    Então o jogo carrega sem erro de console
    E "met.ravi" e "met.nicolas" são falsy

  # --- invariantes do domínio ---

  Cenário: Contagem de conchas do distrito 2 não muda
    Quando o distrito 2 é carregado após a divisão dos primos
    Então PHASE_NODES continua com a mesma quantidade de nós em d2
    E TOTAL_PHASES permanece 31

  Cenário: Jogo carrega e desenha os dois primos sem exceção
    Quando o index.html é aberto no navegador
    Então não há erro no console
    E NPC_DRAW["ravi"] e NPC_DRAW["nicolas"] são funções
    E os sprites de Ravi e Nicolas são desenhados sem lançar
```

## Roteiro de validação manual (via `window.__*`)

```js
// desbloquear até d2 e inspecionar sprites
window.__world.completeDistrict?.(0); window.__world.completeDistrict?.(1);
const npcs = window.__game.S?.... // WORLD_NPCS é closure de world3d.js — inspecionar via DevTools (Sources)
// migração de save:
const k = 'maresRecife:pernambuco-meu-pais';
localStorage.setItem(k, JSON.stringify({ v:3, done:{}, met:{ primos:true } }));
location.reload();
// pós-reload: window.__game.save.met.ravi === true && window.__game.save.met.nicolas === true
// save malformado:
localStorage.setItem(k, JSON.stringify({ v:3, done:{}, met:null })); location.reload(); // não deve lançar
// lição: após fechar o diálogo de intro, checar window.__game.toast.sub.includes('parceiro pra toda aventura')
```

> Os hooks exatos (`window.__world.talk`, `completeDistrict`, exposição de `WORLD_NPCS`) devem ser confirmados/ajustados no `/implement`; onde não houver hook, validar pela aba Sources do DevTools.

## Notas de implementação (não-normativas)

- `js/world3d.js`: substituir a entrada `primos` em `WORLD_NPCS` por `ravi` e `nicolas` em tiles próximos mas distintos no d2; em `NPC_DRAW`, trocar `primos: drawRavi` por `ravi: drawRavi, nicolas: drawNico` (ambas já existem em `sprites.js:295-296`).
- `js/main.js`: dividir a entrada `primos` de `NPCS`; `lesson` da companhia em **ambos**; migração em `parseSave` — `if (s.met?.primos) { met.ravi = true; met.nicolas = true; }` (dentro do try/catch já existente).
- `js/story.js`: derivar `ravi`/`raviAgain` e `nicolas`/`nicolasAgain` a partir do diálogo `primos` atual (story.js:275-290), cada um cross-referenciando o outro e preservando a linha da lição. Os `SPEAKERS` `ravi` e `nico` já existem em `main.js:111-112`.
- **Revisão editorial (Roda de Spec / humano):** nenhuma linha afetiva do diálogo `primos` original pode sumir sem equivalente nos novos diálogos — critério de revisão humana, não cenário automatizável.
