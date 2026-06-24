# Spec BDD 002 — Save isolado + recuperação de legado in-game

> Spec: `specs/002-save-namespace/` · ADR: `docs/adr/ADR-002-save-namespace.md`
> Stack: vanilla JS / Canvas — validação manual via `window.__*` no console do navegador.
> Chave nova: `maresRecife:pernambuco-meu-pais` · Chave legada: `maresRecife`
> Novo modo de tela: `legacy` (card de decisão antes do título)
>
> ⚠️ Os roteiros de validação descrevem o comportamento-alvo **após** implementar as tasks 1-6.
> Com o código atual (`SAVE_KEY = 'maresRecife'`) os resultados serão diferentes.

---

## Feature: Persistência namespeada e recuperação de progresso pelo jogo

Como jogador numa origem `github.io` compartilhada, quero que o progresso seja isolado deste jogo e que,
se houver um save antigo neste navegador, o **próprio jogo** me pergunte se quero continuar — sem digitar
comandos no console.

---

```gherkin
Cenário: Origem limpa começa em 0/31 sem card
Given que não existe nenhuma chave de save no localStorage da origem
  (nem "maresRecife" nem "maresRecife:pernambuco-meu-pais")
When o jogo carrega
Then o jogo vai direto para a tela de título (não exibe o card de legado)
  And window.__game.save.done está vazio ({})  →  0/31
  And após a primeira ação que salva, existe a chave "maresRecife:pernambuco-meu-pais"
```

**Validação manual:**
```js
localStorage.clear(); location.reload();
window.__game.mode                                  // → 'title' (não 'legacy')
Object.keys(window.__game.save.done).length         // → 0
```

---

```gherkin
Cenário: Legado presente exibe o card de decisão
Given que existe "maresRecife" legada com done de 11 conchas (11/31)
  And NÃO existe "maresRecife:pernambuco-meu-pais"
When o jogo carrega
Then o jogo entra no modo "legacy" e exibe o card "Achamos um progresso salvo neste navegador (11/31). É o seu?"
  And o card mostra os botões "Continuar de onde parei" e "Começar do zero"
  And nenhum progresso foi adotado ainda (a chave namespeada ainda não existe)
  And a chave legada "maresRecife" permanece intacta
```

**Validação manual (reproduz o sintoma original):**
```js
localStorage.setItem('maresRecife', JSON.stringify({v:3, done:{1:1,2:1,3:1,4:1,5:1,6:1,7:1,8:1,9:1,10:1,11:1}}));
localStorage.removeItem('maresRecife:pernambuco-meu-pais');
location.reload();
window.__game.mode                                  // → 'legacy'  (antes do fix: ia direto pro mundo com 11/31)
localStorage.getItem('maresRecife:pernambuco-meu-pais')  // → null (nada adotado ainda)
```

---

```gherkin
Cenário: Continuar restaura o progresso na chave namespeada
Given que o card de legado está visível com 11/31
When o jogador toca em "Continuar de onde parei"
Then o save legado é validado e gravado em "maresRecife:pernambuco-meu-pais"
  And window.__game.save.done contém as 11 conchas (11/31)
  And o jogo segue para a tela de título mostrando "progresso salvo: 11/31"
  And recarregar a página NÃO exibe o card novamente (vai direto ao título com 11/31)
```

**Validação manual:**
```js
// com o card visível (mode === 'legacy'), toque no botão Continuar:
window.__tap(/* coords do botão Continuar */);
Object.keys(window.__game.save.done).length              // → 11
JSON.parse(localStorage.getItem('maresRecife:pernambuco-meu-pais')).done  // 11 conchas
location.reload(); window.__game.mode                    // → 'title' (card não reaparece)
```

---

```gherkin
Cenário: Zero descarta o legado e não pergunta de novo
Given que o card de legado está visível com 11/31
When o jogador toca em "Começar do zero"
Then a chave legada "maresRecife" é removida do localStorage
  And um save namespeado novo (0/31) é gravado
  And o jogo segue para a tela de título em 0/31
  And recarregar a página NÃO exibe o card novamente
```

**Validação manual:**
```js
window.__tap(/* coords do botão Começar do zero */);
localStorage.getItem('maresRecife')                      // → null (legado removido)
Object.keys(window.__game.save.done).length              // → 0
location.reload(); window.__game.mode                    // → 'title' (card não reaparece)
```

---

```gherkin
Cenário: Persiste progresso novo na chave namespeada
Given uma origem limpa e o jogo em 0/31 na tela de título
When o jogador completa o distrito 0 (done de 4 conchas) e o jogo salva
  And a página é recarregada
Then window.__game.save.done contém 4 conchas
  And o valor lido veio de "maresRecife:pernambuco-meu-pais"
  And a chave legada "maresRecife" NÃO foi criada nem escrita
```

**Validação manual:**
```js
localStorage.clear();
window.__world.completeDistrict(0);   // marca g=1..4 (DISTRICT_SIZES[0]=4) e salva
location.reload();
Object.keys(window.__game.save.done).length         // → 4
localStorage.getItem('maresRecife')                 // → null (nada escrito no legado)
JSON.parse(localStorage.getItem('maresRecife:pernambuco-meu-pais')).done  // 4 conchas
```

---

```gherkin
Cenário: reset limpa save namespeado e legado
Given que existem ambas as chaves no localStorage (namespeada com progresso E "maresRecife" legada)
When o jogador executa window.__world.reset()
Then a chave "maresRecife:pernambuco-meu-pais" é removida
  And a chave legada "maresRecife" é removida
  And o jogo recarrega em 0/31
```

**Validação manual:**
```js
localStorage.setItem('maresRecife', '{"v":3,"done":{"1":1}}');
window.__world.completeDistrict(0);    // cria a namespeada
window.__world.reset();                // recarrega
localStorage.getItem('maresRecife')                          // → null
localStorage.getItem('maresRecife:pernambuco-meu-pais')      // → null
Object.keys(window.__game.save.done).length                  // → 0
```

---

```gherkin
Cenário: Legado corrompido ou vazio é tratado como origem limpa
Given que existe "maresRecife" com conteúdo "{{CORROMPIDO}}" (JSON inválido)
  OU "maresRecife" com done vazio (0 conchas)
  And NÃO existe a chave namespeada
When o jogo carrega
Then o card de legado NÃO é exibido (não há progresso real a recuperar)
  And o jogo vai direto ao título em 0/31
  And nenhum erro de console é lançado
```

**Validação manual:**
```js
localStorage.setItem('maresRecife', '{{CORROMPIDO}}');
localStorage.removeItem('maresRecife:pernambuco-meu-pais');
location.reload();
window.__game.mode            // → 'title'  (não 'legacy')
```

---

```gherkin
Cenário: localStorage bloqueado não quebra o carregamento
Given que localStorage lança ao ser acessado (modo privado restrito / quota)
When o jogo carrega
Then o load cai no default defensivo (0/31), modo "title", sem card
  And o save subsequente falha silenciosamente (try/catch existente preservado)
  And nenhum erro de console é lançado
```

**Validação manual:**
```js
// antes do reload, bloquear o acesso:
Object.defineProperty(window, 'localStorage', { get(){ throw new Error('blocked'); } });
location.reload();
// jogo carrega no título em 0/31, sem erro no console
```

> Cobre o Mandato Inviolável "o jogo carrega sem erro de console" (FF-002) e o débito aceito de `try/catch`
> defensivo silencioso em load/save (§0.1).
