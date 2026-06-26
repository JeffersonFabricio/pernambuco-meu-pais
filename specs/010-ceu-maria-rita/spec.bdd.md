# Spec BDD — 010 · Encontro no céu com a Vó Maria Rita

> Story: [story.md](story.md) · Blueprint: [blueprint.mermaid](blueprint.mermaid)
> Stack: vanilla JS + Canvas 2D, sem framework de teste — validação headless via
> `node tests/test-ceu-maria-rita.js` (vm + stubs, dirige por
> `window.__story`/`__game`/`__world`/`__levels`; modelo `test-igreja-coerencia.js`)
> + validação **visual manual** no navegador para o que é puramente render (`[MANUAL]`).
>
> Decisões de design (alinhadas com o cliente):
> - **Porto do céu** — a jangada atraca; a Vó Maria Rita é figura focal/central.
> - **Só aparição + narração** — ela **não** ganha novas falas no céu.
> - **Os três juntos** — Vovô Maro + Maju + Vó Maria Rita reunidos.
> - **Igreja obrigatória (ADR-008)** — desfecho gated por `met.vovoMae`.
>
> Render testável: `window.__world.drawCeu(t)` (sem exceção em t∈[0..12]) e
> `window.__world.ceuFocal()` (posição focal da Vó Maria Rita, verificável por dados).

## Happy path

```gherkin
Cenário: Completar as 31 conchas e falar com o Vovô Maro inicia o desfecho
  Dado um save com as 31 conchas coletadas (window.__world.completeAll)
  E met.vovoMae = true (a Maju já entrou na igreja das Marias)
  Quando window.__world.talk('vovo') aproxima do Vovô Maro (npc.ending)
  Então S.save.fin torna-se true
  E o desfecho é disparado (startEnding) entrando em diálogo do skyEnding
```

```gherkin
Cenário: O desfecho narra o reencontro com a Vó Maria Rita, evocando o amor eterno
  Dado o jogo com as 31 conchas coletadas
  Quando inspeciono window.__story.skyEnding
  Então existe ao menos uma linha de narração (who: 'nar') que cita a Vó Maria Rita no céu
  E o roteiro evoca a lição do amor que não tem fim (amorCeu)
  E todo o texto está em PT-BR
```

```gherkin
Cenário: O roteiro do desfecho reúne os três — Vovô Maro, Maju e a Vó Maria Rita
  Dado o jogo com as 31 conchas coletadas
  Quando inspeciono window.__story.skyEnding e window.__world.ceuFocal()
  Então o roteiro referencia Vovô Maro, Maju e a Vó Maria Rita reunidos
  E a posição focal da Vó Maria Rita (drawVovoMae) é central (x ~160..200), não no canto
```

```gherkin
Cenário: A cena do céu é alcançada e o jogo volta ao Recife ao tocar
  Dado que o desfecho foi disparado (fin = true)
  Quando avanço o diálogo do skyEnding até o fim (window.__world.finish)
  Então S.mode torna-se 'ceu' e S.winT reinicia em 0
  Quando forço S.winT = 12 e toco a tela (window.__world.tapAt)
  Então o jogo retorna ao mundo (S.mode === 'world')
```

```gherkin
Cenário: A cena ceu renderiza sem exceção do início ao fim
  Dado o hook window.__world.drawCeu(t)
  Quando chamo drawCeu(t) para t em [0, 1.5, 3, 4.5, 6, 9, 12]
  Então nenhuma exceção é lançada em qualquer instante da animação
```

## Continuidade / coerência

```gherkin
Cenário: A narração do céu trata o momento como reencontro (continuidade com a igreja)
  Dado que a Maju já reencontrou a Vó Maria Rita dentro da igreja (cena asMarias)
  Quando inspeciono a narração do skyEnding
  Então ela trata o momento como reencontro, sem afirmar que é a primeira vez que se veem
  E referencia a igrejinha/Piedade ou o reencontro prometido
```

```gherkin
Cenário: A Vó Maria Rita não ganha novas falas no céu
  Dado o roteiro STORY.skyEnding após a feature
  Quando filtro as linhas por who === 'vovoMae'
  Então o número de falas dela permanece zero (o encontro é só aparição + narração)
```

## Invariantes do domínio (sem regressão)

```gherkin
Cenário: O desfecho só dispara com exatamente as 31 conchas (FF-DOM-2)
  Dado TOTAL_PHASES derivado de DISTRICT_SIZES (= 31) e met.vovoMae = true
  Quando há 30 conchas coletadas e falo com o Vovô Maro
  Então S.save.fin permanece false e o desfecho não dispara
  Quando a 31ª também é coletada e falo com o Vovô Maro
  Então S.save.fin torna-se true e o desfecho dispara
```

```gherkin
Cenário: Com as 31 conchas mas sem ter visitado a igreja, o desfecho não dispara (ADR-008)
  Dado um save com as 31 conchas coletadas mas met.vovoMae = false
  Quando window.__world.talk('vovo') aproxima do Vovô Maro
  Então S.save.fin permanece false e o desfecho NÃO dispara
  E o Vovô Maro dá uma dica apontando a igreja das Marias (diálogo, não cena ceu)
```

```gherkin
Cenário: O desfecho não regride o progresso salvo
  Dado um save com as 31 conchas coletadas
  Quando o desfecho roda e marca S.save.fin = true
  Então nenhuma concha em S.save.done é apagada (progresso nunca regride)
```

```gherkin
Cenário: Re-disparar o desfecho não entra em loop nem corrompe estado
  Dado que o jogador já viu o desfecho e voltou ao mundo
  Quando window.__world.talk('vovo') é chamado de novo
  Então o fluxo de diálogo/cena ceu conclui normalmente (sem loop infinito)
  E S.save permanece íntegro
```

```gherkin
Cenário: Save já finalizado num build anterior não é regredido pelo gate (migração ADR-008)
  Dado um save v3 com fin=true mas sem met.vovoMae (terminou antes do feat/010)
  Quando o save é carregado (parseSave)
  Então met.vovoMae é herdado como true (quem já terminou não regride)
  E falar com o Vovô Maro revê o desfecho, não a dica da igreja
```

## Edge / error

```gherkin
Cenário: Falar com o Vovô Maro sem as 31 conchas não dispara o céu
  Dado um save com menos de 31 conchas coletadas
  Quando window.__world.talk('vovo') aproxima do Vovô Maro
  Então o desfecho NÃO é disparado (S.mode não vira 'ceu' nem diálogo de skyEnding)
```

```gherkin
Cenário: O desfecho não introduz asset externo nem nova dependência
  Dado o código da cena ceu (drawCeu) após a feature
  Quando inspeciono o source do desenho da Vó Maria Rita e da jangada
  Então usa apenas helpers existentes (drawVovoMae, jangadaSil, drawBead, skyGrad, pTxt)
  E não há nova imagem, fonte ou dependência de runtime
```

```gherkin
Cenário [MANUAL]: o desfecho na tela mostra a Vó focal, os três e o crédito
  Dado o jogo completado no navegador
  Quando assisto à cena ceu até o fim
  Então vejo a Vó Maria Rita como figura central que a jangada alcança
  E vejo Vovô Maro, Maju e a Vó Maria Rita no quadro, com a família como anel de luzes
  E o crédito "Para Maria Júlia" e o "✦ FIM ✦" continuam presentes
  E o botão de ação do Vovô Maro aparece como "★ SUBIR" quando o fim está disponível
```
