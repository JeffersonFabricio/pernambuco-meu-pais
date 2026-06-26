# Spec BDD — 010 · Encontro no céu com a Vó Maria Rita

> Story: [story.md](story.md) · Blueprint: [blueprint.mermaid](blueprint.mermaid)
> Stack: vanilla JS + Canvas 2D, sem framework de teste — validação headless via
> harness `node tests/test-ceu-maria-rita.js` (contexto `vm` + stubs de browser,
> dirige por `window.__story` / `window.__game` / `window.__world`; modelo:
> `tests/test-igreja-coerencia.js`) + validação **visual manual** no navegador
> para o que é puramente render (marcado `[MANUAL]`).
>
> Decisões de design (alinhadas com o cliente):
> - **Porto do céu** — a jangada atraca; a Vó Maria Rita é figura focal/central.
> - **Só aparição + narração** — ela **não** ganha novas falas no céu.
> - **Os três juntos** — Vovô Maro + Maju + Vó Maria Rita reunidos.
> - **Igreja obrigatória (ADR-008)** — desfecho gated por `met.vovoMae`.
>
> **Pré-requisito de implementação:** expor `window.__world.drawCeu(ctx, t)`
> delegando à `drawCeu` interna (mesmo padrão de `World3D.npcDraw.asMarias` na
> spec 009) — sem isso os cenários de render viram falso-positivo. A composição
> focal deve ser verificável por **dados** (estrutura `SOULS` / coords de
> `drawVovoMae`), não só por pixels.

---

## Happy path

### Cenário: Completar as 31 conchas e falar com o Vovô Maro inicia o desfecho
```gherkin
Dado um save com as 31 conchas coletadas (window.__world.completeAll)
E met.vovoMae = true (a Maju já entrou na igreja das Marias)
Quando window.__world.talk('vovo') aproxima do Vovô Maro (npc.ending)
Então S.save.fin torna-se true
E o desfecho é disparado (startEnding) entrando em diálogo do skyEnding
# nota: completeAll() só preenche save.done; o gatilho real do fim é talk('vovo')
# com doneCount() >= TOTAL_PHASES E met.vovoMae (main.js:859 + ADR-008), ou afterPuzzle
```

### Cenário: O desfecho narra o reencontro com a Vó Maria Rita, evocando o amor eterno
```gherkin
Dado o jogo com as 31 conchas coletadas
Quando inspeciono window.__story.skyEnding
Então existe ao menos uma linha de narração (who: 'nar') que cita a Vó Maria Rita no céu
E o roteiro evoca a lição do amor que não tem fim (amorCeu)
E todo o texto está em PT-BR
```

### Cenário: O roteiro do desfecho reúne os três — Vovô Maro, Maju e a Vó Maria Rita
```gherkin
Dado o jogo com as 31 conchas coletadas
Quando inspeciono window.__story.skyEnding
Então o roteiro referencia Vovô Maro, Maju e a Vó Maria Rita reunidos
E na estrutura de composição da cena ceu a entrada da Vó Maria Rita (drawVovoMae)
  está posicionada como figura central/focal (x próximo de W/2, ~160..200), não no canto superior
```

### Cenário: A cena do céu é alcançada e o jogo volta ao Recife ao tocar
```gherkin
Dado que o desfecho foi disparado (fin = true)
Quando avanço o diálogo do skyEnding até o fim (window.__world.finish)
Então S.mode torna-se 'ceu' e S.winT reinicia em 0
Quando forço S.winT = 12 e toco a tela (window.__world.tapAt(180, 300))
Então o jogo retorna ao mundo (S.mode === 'world')
```

### Cenário: A cena ceu renderiza sem exceção do início ao fim
```gherkin
Dado o hook window.__world.drawCeu(ctx, t) e um contexto de canvas stub
Quando chamo drawCeu(fakeCtx, t) para t em [0, 3, 6, 9, 12]
Então nenhuma exceção é lançada em qualquer instante da animação
```

---

## Continuidade / coerência

### Cenário: A narração do céu trata o momento como reencontro (continuidade com a igreja)
```gherkin
Dado que a Maju já reencontrou a Vó Maria Rita dentro da igreja (cena asMarias)
Quando inspeciono a narração do skyEnding
Então ela trata o momento como reencontro, sem afirmar que é a primeira vez que se veem
E não contém termos que contradigam a cena asMarias
```

### Cenário: A Vó Maria Rita não ganha novas falas no céu
```gherkin
Dado o roteiro STORY.skyEnding após a feature
Quando filtro as linhas por who === 'vovoMae'
Então o número de falas dela permanece zero (o encontro é só aparição + narração)
```

### Cenário (caracterização — RED baseline): o skyEnding atual não cita a Vó Maria Rita como encontro focal
```gherkin
Dado o STORY.skyEnding ANTES desta feature
Quando inspeciono suas linhas
Então a narração ainda não conduz um reencontro focal com a Vó Maria Rita
# trava o RED do TDD: o teste de T3 deve falhar antes da implementação
```

---

## Invariantes do domínio (sem regressão)

### Cenário: O desfecho só dispara com exatamente as 31 conchas (FF-DOM-2)
```gherkin
Dado TOTAL_PHASES derivado de DISTRICT_SIZES (= 31) e met.vovoMae = true
Quando há 30 conchas coletadas e falo com o Vovô Maro
Então S.save.fin permanece false e o desfecho não dispara
Quando a 31ª também é coletada e falo com o Vovô Maro
Então S.save.fin torna-se true e o desfecho dispara
```

### Cenário: Com as 31 conchas mas sem ter visitado a igreja, o desfecho não dispara (ADR-008)
```gherkin
Dado um save com as 31 conchas coletadas mas met.vovoMae = false
Quando window.__world.talk('vovo') aproxima do Vovô Maro
Então S.save.fin permanece false e o desfecho NÃO dispara
E o Vovô Maro dá uma dica apontando a igreja das Marias (diálogo, não cena ceu)
E [MANUAL] o botão de ação aparece como "★ FALAR", não "★ SUBIR"
```

### Cenário: O desfecho não regride o progresso salvo
```gherkin
Dado um save com as 31 conchas coletadas
Quando o desfecho roda e marca S.save.fin = true
Então nenhuma concha em S.save.done é apagada (progresso nunca regride)
```

### Cenário: Re-disparar o desfecho não entra em loop nem corrompe estado
```gherkin
Dado que o jogador já viu o desfecho e voltou ao mundo
Quando window.__world.talk('vovo') é chamado de novo
Então o fluxo de diálogo/cena ceu conclui normalmente (sem loop infinito)
E S.save permanece íntegro
```

### Cenário: O desfecho não introduz asset externo nem nova dependência
```gherkin
Dado o código da cena ceu (drawCeu) após a feature
Quando inspeciono o source do desenho da Vó Maria Rita e da jangada
Então usa apenas helpers existentes (drawVovoMae, jangadaSil, drawBead, skyGrad, pTxt)
E as cores ficam dentro da paleta de DESIGN.md (sem hex fora da paleta)
E não há nova imagem, fonte ou dependência de runtime
```

---

## Edge / error

### Cenário: Falar com o Vovô Maro sem as 31 conchas não dispara o céu
```gherkin
Dado um save com menos de 31 conchas coletadas
Quando window.__world.talk('vovo') aproxima do Vovô Maro
Então o desfecho NÃO é disparado (S.mode não vira 'ceu' nem diálogo de skyEnding)
```

### Cenário [MANUAL]: o desfecho na tela mostra a Vó focal, os três e o crédito
```gherkin
Dado o jogo completado no navegador
Quando assisto à cena ceu até o fim
Então vejo a Vó Maria Rita como figura central que a jangada alcança
E vejo Vovô Maro, Maju e a Vó Maria Rita no quadro, com a família como anel de luzes
E o crédito "Para Maria Júlia" e o "✦ FIM ✦" continuam presentes
E o botão de ação do Vovô Maro aparece como "★ SUBIR" (não "★ FALAR") quando o fim está disponível
```
