# ADR-002: Namespace da chave de save e recuperação de legado in-game

> Status: Proposto · 2026-06-24 · Spec: `specs/002-save-namespace/`

## Contexto

O save persiste em `localStorage` sob a chave literal `'maresRecife'` ([main.js:118](../../js/main.js#L118)).
O jogo é servido em **GitHub Pages de usuário**, cuja origem (`https://jeffersonfabricio.github.io`) é
**compartilhada por todos os repositórios/caminhos** do usuário. `localStorage` particiona por **origem**,
não por caminho — logo a chave colide entre deploys/projetos da mesma origem.

Sintoma observado: o jogo abriu em **11/31** numa primeira sessão, sem o jogador ter jogado. Causa: save herdado
gravado na origem por um build anterior (ou outro projeto) sob a mesma chave `'maresRecife'`.

**Restrição de produto:** o público é a Maju (criança) e a família. **O jogo tem que ser auto-suficiente** —
não é aceitável pedir que o jogador digite comandos no console (`window.__world.*`). Qualquer recuperação de
progresso tem que acontecer **dentro do jogo**, pela UI.

## Tensão central

- Começar sempre limpo elimina o save fantasma, mas descarta progresso legítimo.
- Adotar o legado automaticamente preserva progresso, mas **reintroduz o bug fantasma** (foi o comportamento atual).
- Não há como, dentro do `localStorage` da origem, distinguir com certeza um save legítimo *deste jogo* de lixo
  herdado de *outro* contexto que usou a mesma chave.

Como a distinção é impossível automaticamente **e** o jogo precisa ser auto-suficiente, a decisão é **delegar a
escolha ao jogador, uma única vez, por uma tela do próprio jogo** — nunca silenciosamente, nunca via console.

## Decisão

### 1. Namespacear a chave

Nova chave: **`maresRecife:pernambuco-meu-pais`** (constante `SAVE_KEY`). O sufixo é o nome do deploy/repo —
único o suficiente nesta origem para não colidir com builds antigos nem com outros projetos.

> Por que não derivar de `location.pathname`: o caminho pode mudar (raiz, subpasta, domínio custom futuro) e
> quebraria a continuidade do save. Constante explícita é estável e previsível (KISS/YAGNI).

### 2. `load()` lê apenas a chave namespeada

A inicialização normal lê **somente** `SAVE_KEY`. A chave legada **nunca** é adotada automaticamente como
progresso. Sem save namespeado → o jogo começa em **0/31** (a menos que o passo 3 resolva em "continuar").

### 3. Recuperação in-game via card de decisão (uma vez)

Quando, na inicialização, **existe** `'maresRecife'` legada com progresso **e não existe** save namespeado,
o jogo entra num modo `legacy` **antes da tela de título**, exibindo um card:

> "Achamos um progresso salvo neste navegador (**N/31**). É o seu?"
> **[Continuar de onde parei]**   **[Começar do zero]**

- **Continuar** → o conteúdo legado é **validado por `load()`** e gravado na chave namespeada; segue para o título
  com o progresso restaurado.
- **Começar do zero** → o legado é **removido** (`removeItem('maresRecife')`) para não voltar a perguntar;
  o jogo começa em 0/31.

A escolha é **persistida** (gravar o save namespeado em qualquer dos dois ramos) — o card aparece **no máximo uma
vez por navegador**. Se o legado tiver progresso 0 ou for ilegível, o card é pulado (trata como origem limpa).

### 4. `save()` e `reset()`

- `save()` grava **somente** na chave namespeada.
- `reset()` remove a chave namespeada **e** a legada (`'maresRecife'`) — limpeza completa da origem para este jogo.

### 5. Hooks de console (debug, não-jogador)

Os hooks existentes (`completeAll`, `completeDistrict`, `reset`, `rebrief`) permanecem como ferramenta de
desenvolvimento. **Não** se adiciona `importLegacy()` ao fluxo do jogador — a recuperação é a tela do passo 3.
(Um hook de debug pode existir para teste, mas não é o caminho do usuário.)

## Consequências

**Positivas**
- O save fantasma herdado nunca mais é adotado sem o jogador confirmar.
- Progresso legítimo é recuperável **sem console** — auto-suficiente.
- Sem colisão entre deploys/projetos da mesma origem `github.io`.
- **Princípio 4 (progresso nunca regride) preservado:** o legado não é destruído na inicialização (só após escolha
  explícita); "continuar" só adiciona progresso; o card aparece uma única vez.

**Negativas / trade-offs**
- Introduz **UI nova** (modo `legacy` + um card com 2 botões) — antes era só camada de save. Justifica `/prototype`.
- Um jogador sem legado nunca vê o card (correto), mas o caminho extra adiciona um estado a manter/testar.

## Alternativas descartadas

- **Recuperação via `window.__world.importLegacy()` no console** — viola a restrição de auto-suficiência
  (jogador-criança não digita comandos). Descartada.
- **Adotar legado automaticamente** — reintroduz o bug fantasma. Descartada.
- **Sempre começar do zero, sem perguntar** — descarta progresso legítimo sem dar opção; o card custa pouco e
  preserva o afeto do projeto. Descartada em favor do card.
- **Chave derivada de `location.pathname`** — frágil a mudança de caminho/domínio. Descartada.
