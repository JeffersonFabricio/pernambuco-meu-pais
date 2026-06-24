# Story: Save isolado por jogo (namespace de chave)

> Spec 002 · modo solo · brownfield · 2026-06-24

## História

**Como** jogador que abre o jogo pela primeira vez no meu navegador,
**quero** começar com 0/31 conchas (progresso zerado),
**para que** eu não herde o progresso de um build antigo ou de outro projeto publicado na mesma origem `github.io`.

## Contexto / causa raiz

O jogo é publicado em **GitHub Pages de usuário**: `jeffersonfabricio.github.io/pernambuco-meu-pais/`.
Sites de usuário do GitHub Pages compartilham **uma única origem** (`https://jeffersonfabricio.github.io`)
entre **todos** os repositórios/caminhos. `localStorage` é particionado **por origem, não por caminho** —
então a chave fixa `'maresRecife'` ([main.js:118](../../js/main.js#L118)) colide com qualquer save de:

- um build/deploy anterior deste mesmo jogo,
- outro projeto publicado em `jeffersonfabricio.github.io/<outro-repo>/`,

que tenha gravado a mesma chave nessa origem. Foi por isso que o jogo abriu em **11/31 "de outra pessoa"**
sem o jogador ter jogado — era um save herdado da origem compartilhada, não um backend guardando save de todos
(não há backend; o GitHub Pages só serve arquivos estáticos).

A correção é **namespacear a chave** para algo único deste deploy, preservando um save legítimo já existente
**desta versão** via migração defensiva.

## Critérios de aceite

1. A chave de `localStorage` usada para persistir o save é **`'maresRecife:pernambuco-meu-pais'`** — nenhuma escrita nova ocorre na chave genérica `'maresRecife'`.
2. Abrir o jogo numa origem **sem save namespeado** resulta em **0/31** — mesmo que exista uma chave legada `'maresRecife'` na mesma origem, ela **não** é adotada automaticamente como progresso herdado, e **não** é apagada (permanece intacta).
3. Um jogador que tinha progresso na chave legada pode recuperá-lo **sem perda e por ação deliberada, dentro do jogo** (auto-suficiente — sem console): ao detectar um save legado numa origem sem save namespeado, o jogo exibe **uma vez** um card "Achamos um progresso salvo (N/31). É seu?" com **[Continuar de onde parei]** e **[Começar do zero]**. "Continuar" valida e adota o legado; "Começar do zero" descarta e parte de 0/31.
4. `save()` passa a gravar **somente** na chave namespeada; nenhuma escrita nova ocorre na chave legada.
5. `window.__world.reset()` limpa o save namespeado **e** o legado (se ainda existir) e recarrega em 0/31.
6. **O progresso nunca regride** (Lei do Domínio §4): o card só aparece quando não há save namespeado (`hasNamespacedSave()` falso); "Continuar" só adiciona; o legado não é apagado na inicialização.

## Decisão de escopo

- **Sem blueprint** — fluxo de 1 módulo (camada de save em [main.js](../../js/main.js)), ≤ 2 passos.
- **Com ADR** — a estratégia de migração da chave legada é uma decisão arquitetural não-trivial
  (qual chave adotar, se migra o legado, como evitar readotar lixo de outra origem). Ver `docs/adr/ADR-002-save-namespace.md`.

## Itens fora de escopo (decididos em /spec)

- Múltiplos perfis/slots no mesmo dispositivo — não pedido.
- Esconder hooks de debug (`__world.completeAll`) em produção — não selecionado neste escopo.
- Botão "Recomeçar do zero" na UI — não selecionado neste escopo.
