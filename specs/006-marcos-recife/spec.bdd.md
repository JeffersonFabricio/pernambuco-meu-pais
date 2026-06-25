# Spec BDD — Marcos e ambiente do mundo de Recife

> Feature: `006-marcos-recife` · Story: [story.md](story.md) · Sem ADR/blueprint (3 ajustes de render dentro do `World3D`; ver story §arquitetura).
> Validação: manual no navegador via `window.__*` + checagens headless de estrutura/estado (baseline brownfield — sem render headless). Roteiros no fim.
> Marcadores: **[H]** = verificável headless (estado/estrutura) · **[V]** = verificação visual manual.

```gherkin
Funcionalidade: Marcos e ambiente do mundo de Recife
  Para que o mundo leia como o Recife real e o jogador saiba onde está,
  o Marco Zero (rosa dos ventos) aparece no chão de Recife Antigo, a igreja
  se apoia no terreno como um prédio, e o mar fica visível na orla — sem
  quebrar a contagem de conchas, a caminhabilidade nem a névoa dos distritos.

  Contexto:
    Dado que o mapa-mundo isométrico (World3D) está sendo exibido
    E que o distrito 0 (Recife Antigo) está sempre desbloqueado

  # ---------- 1. Marco Zero (praça + rosa dos ventos) ----------

  Cenário: A rosa dos ventos é desenhada no chão de Recife Antigo  [V]
    Quando o mundo é desenhado com a câmera em Recife Antigo (d0)
    Então uma praça circular com a rosa dos ventos aparece no centro de d0
    E a rosa usa a mesma arte do puzzle/cena (drawRosaDosVentos)
    E ela é projetada no chão (decal), acompanhando a perspectiva isométrica

  Cenário: A praça do Marco Zero é caminhável  [H]
    Quando a Maju anda sobre os tiles da praça do Marco Zero
    Então walkable() retorna verdadeiro para esses tiles (a Maju pisa na praça)

  Cenário: A rosa fica ATRÁS de conchas, NPCs e da Maju (é chão)  [V]
    Dado que d0 tem NPCs (jona, mica) e conchas
    Quando o mundo é desenhado
    Então a rosa é desenhada como chão, na ordem de profundidade antes de nós/NPCs/player
    E os NPCs e conchas de d0 continuam visíveis e interagíveis por cima da praça

  Cenário: A praça não altera a contagem de fases  [H]
    Quando o Marco Zero é adicionado ao mundo
    Então TOTAL_PHASES permanece 31
    E a quantidade de PHASE_NODES de d0 permanece 4
    E as 31 conchas continuam em tiles distintos

  # ---------- 2. Igreja como prédio (não afunda) ----------

  Cenário: A igreja se apoia no tile como um prédio  [V]
    Quando a igreja (asMarias) é desenhada no mundo
    Então a base da igreja fica no chão do seu tile, crescendo para cima
    E nenhuma parte do prédio desce abaixo da linha do terreno do seu tile
    E ela não invade visualmente os tiles à frente como se estivesse enterrada

  Cenário: A igreja ordena por profundidade pelo seu tile  [V]
    Dado objetos (NPCs, Maju) em tiles à frente da igreja
    Quando o mundo é desenhado
    Então esses objetos ocluem a igreja corretamente (ela respeita a fila isométrica)

  Cenário: A igreja no mundo continua só o prédio (mantém 004)  [H]
    Quando o mundo é desenhado
    Então a entrada "asMarias" desenha apenas a igreja-prédio
    E as duas Marias NÃO são desenhadas coladas na igreja no mundo (só na cena do reencontro)

  Cenário: A igreja não aparece enquanto d7 está travado  [H]
    Dado que o distrito 7 ainda não está desbloqueado
    Quando o mundo é desenhado
    Então a entrada "asMarias" (d7) não é renderizada (o gate de distrito é respeitado)

  # ---------- 3. Mar na Beira-Mar / orla ----------

  Cenário: O mar fica visível na orla norte  [V]
    Quando o mundo é desenhado com a câmera na Beira-Mar (d1)
    Então tiles de oceano aparecem ao norte, além da praia (a orla lê como beira-mar)

  Cenário: O mar fura a névoa, mas a terra travada não  [H]
    Dado um save vazio (d1..d8 travados)
    Quando o mundo é desenhado
    Então um tile de oceano INTERIOR (ex.: row=0, col=5, tipo '~') é visível mesmo sem zona desbloqueada
    E um tile de TERRA de distrito travado (ex.: row=7, col=13 em d1, tipo 'g') continua oculto pela névoa
    E a visibilidade do oceano é por TIPO ('~'), não pela exceção de borda col<=1 que já existia (que pega mangue também)

  Cenário: A Maju vê o mar, mas não anda nele  [H]
    Quando a Maju tenta andar sobre um tile de oceano
    Então walkable() retorna falso (a água é cenário ao fundo, não chão)

  # ---------- 4. Ambiente dos distritos (mangue + coqueiros) ----------

  Cenário: O Manguezal (d3) lê como mangue  [V]
    Quando o mundo é desenhado com a câmera no Manguezal (d3)
    Então o chão de d3 aparece terroso (lamacento), distinto da grama dos demais
    E há árvores de mangue e um braço de rio marcando a área

  Cenário: O mangue e o rio do Manguezal não são caminháveis  [H]
    Quando a Maju tenta andar sobre um tile de mangue ('m') ou de rio ('w') de d3
    Então walkable() retorna falso (são cenário, não chão)

  Cenário: Coqueiros pontuam a orla  [V/H]
    Quando o mundo é desenhado
    Então há coqueiros plantados em tiles de areia da orla (norte e costa SE)
    E o conjunto de coqueiros está registrado (World3D.coqueiros não-vazio)

  # ---------- 5. Invariantes (Lei do Domínio) ----------

  Cenário: Mundo carrega e desenha sem exceção  [H]
    Quando o mundo é desenhado com todos os distritos abertos
    Então World3D.draw não lança
    E nodeScreen cobre todas as 31 conchas em posições distintas

  Cenário: Marco Zero não mexe nas conchas de d0  [H]
    Quando o mundo é carregado
    Então d0 continua com 4 nós de fase (PHASE_NODES)
    E os nós de d0 caem em tiles caminháveis
    E as posições (col,row) das 4 conchas de d0 não mudam vs baseline

  Cenário: Todos os distritos seguem alcançáveis  [H]
    Quando reset(d) é chamado para cada distrito d em 0..8
    Então o tile de spawn de cada distrito é caminhável

  Cenário: Console limpo com tudo desbloqueado (FF-002)  [V]
    Quando o index.html é aberto e todos os distritos estão desbloqueados
    Então não há nenhum erro no console do navegador
```

## Roteiro de validação manual (via `window.__*`)

```js
// Liberar tudo e visitar cada marco:
window.__world.completeAll()

// 1. Marco Zero — a rosa dos ventos no chão de Recife Antigo
World3D.reset(0)   // [V] praça circular com a rosa, caminhável; NPCs/conchas por cima

// 2. Igreja como prédio (não afunda)
window.__game.save.met.vova = true
World3D.reset(7)   // [V] a igreja se apoia no tile como um prédio; nada abaixo do chão

// 3. Mar na Beira-Mar
World3D.reset(1)   // [V] mar visível ao norte, além da praia (Beira-Mar)

// 4. Névoa preservada (save novo):
window.__world.reset()  // zera o save e recarrega
// [V] com save vazio: o mar da borda (ex.: MAP[0][5]='~') aparece,
//     mas a TERRA de d1 (ex.: MAP[7][13]='g') segue encoberta pela névoa
```

## Checagens headless (estrutura/estado — sem render real)

> **Pré-condição (T1/T4):** `walkable` e `tileVisible` hoje são **closures internas** do IIFE do `World3D` — **expor ambas na API pública** (`return {...}`). Sem isso, os bullets que as usam não rodam. São funções puras de consulta — expor é seguro.

Carregando o bundle (`audio→sprites→characters→story→levels→puzzles→world3d→main`) com stubs de browser (molde: `tests/test-encontro-marias.js`):

- `[H]` `World3D.draw(fakeCtx, 360, 640, t, () => true, () => false)` não lança
- `[H]` `World3D.nodeScreen(g)` retorna posição para g = 1..31, todas distintas
- `[H]` `TOTAL_PHASES === 31` e `DISTRICT_SIZES[0] === 4`
- `[H]` d0 tem exatamente **4 nós de fase** e suas posições não mudaram vs baseline (via `nodeScreen(1..4)`)
- `[H]` `World3D.walkable(c,r,()=>true)` é **false** num tile de oceano e **true** num tile da praça do Marco Zero
- `[H]` `World3D.tileVisible(5,0,()=>false)` é **true** (oceano interior fura a névoa); `World3D.tileVisible(13,7,()=>false)` é **false** (terra 'g' de d1 travado segue na névoa)
- `[H]` para cada d em 0..8: após `reset(d)`, `World3D.player` cai num tile caminhável
- `[H]` `World3D.worldNpcs` tem `asMarias` com `d === 7` (gate de distrito: só aparece com d7 aberto)
```
