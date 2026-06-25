# Spec BDD — 007 Interior da Igreja

> Validação: manual via `window.__*` (projeto Canvas, sem framework — ADR-000).
> Resolução de cena: 360×640, contrato `SCENES[n] = { s(ctx), d(ctx, t) }`.
> Hooks reais: `window.__game` (= estado `S`, expõe `sceneN`, `mode`, `save.met`), `window.__tap(x, y)`, `window.__openLevel(g)`.
> FFs aplicáveis: FF-002 (sem erro de console ao carregar/usar `SCENES[11]`). FF-DOM-1 N/A (sem puzzle procedural). FF-DOM-2 N/A (`TOTAL_PHASES` inalterado).

Funcionalidade: Fundo de interior de igreja na cena das duas Marias
  Como Maju, quero ver o interior da igreja durante o reencontro das Marias,
  para que a cena combine com o "silêncio dourado lá dentro" do roteiro.

  Contexto:
    Dado que a Maju já conheceu a Vó Maria José viva (window.__game.save.met.vova = true)
    E que o reencontro das duas Marias acontece DENTRO da igreja
    E que a chamada que dispara a cena é startDialogue(lines, 7, ...) em main.js:873

  Cenário: S.sceneN recebe 11 ao abrir o diálogo das Marias (1ª vez)
    Dado que window.__game.save.met.vova = true e window.__game.save.met.asMarias = false
    Quando a Maju toca a porta da igreja e talkNpc('asMarias') dispara o diálogo
    Então window.__game.sceneN === 11
    E window.__game.mode indica diálogo ativo
    E o fundo renderizado é o interior da igreja, não a Noite de Maracatu (SCENES[7])

  Cenário: Reencontro repetido também usa o interior
    Dado que window.__game.save.met.vova = true e window.__game.save.met.asMarias = true
    Quando a Maju entra na igreja de novo e o diálogo asMariasAgain abre
    Então window.__game.sceneN === 11

  Cenário: A tela de abertura NÃO é afetada
    Dado que STORY.opening é disparado em main.js:1268 e 1270 com sceneN = 7
    Quando o jogo abre na tela inicial
    Então window.__game.sceneN === 7 (continua Noite de Maracatu)
    E somente as chamadas asMarias/asMariasAgain (main.js:873) usam sceneN = 11

  Cenário: O interior da igreja desenha os elementos esperados
    Dado que SCENES[11].s(ctx) é executado num canvas 360×640
      (validação: copiar SCENES[11].s para um canvas isolado no DevTools e inspecionar)
    Quando a camada estática termina
    Então a nave aparece em tons âmbar/dourado
    E há um vitral colorido na parede ao fundo, atrás do altar
    E há um altar central
    E há candelabros/velas posicionados na nave

  Cenário: As velas tremeluzem (camada animada)
    Dado que SCENES[11].d(ctx, t) é chamada com dois valores de t distintos
      (validação: loop SCENES[11].d(ctx, t+=0.016) num canvas isolado no DevTools)
    Quando o tempo t avança
    Então a chama das velas oscila em função de t
    E nenhum erro é lançado no console (FF-002)

  Cenário: A cena estática é determinística (verificação de código)
    Dado SCENES[11].s(ctx)
    Quando o código de s é inspecionado
    Então s não contém Math.random, Date.now nem performance.now
    E toda dependência de tempo vive em d(ctx, t)
    E drawScene(11, ...) reaproveita o canvas cacheado entre frames (sem recálculo visível)

  Cenário: A Noite de Maracatu (distrito 7) permanece intacta
    Dado que SCENES[7] segue sendo a cena de Noite de Maracatu
    Quando window.__openLevel abre uma fase do distrito 7
    Então o fundo continua sendo a rua à noite com lua, tambores e estrelas
    E o source de SCENES[7] em sprites.js permanece inalterado

  Cenário: SCENES[11] ausente não trava o diálogo (fallback do drawScene)
    Dado o guard SCENES[n] || SCENES[1] em drawScene (sprites.js:1173)
    Quando startDialogue é chamado com sceneN = 11 antes de SCENES[11] existir
    Então o diálogo abre normalmente (window.__game.mode indica diálogo)
    E o fundo cai no fallback SCENES[1] sem lançar erro no console

  Cenário: O efeito de save do reencontro continua intacto
    Dado que met.vova = true e met.asMarias = false
    Quando o diálogo das Marias é concluído (callback do startDialogue roda)
    Então window.__game.save.met.vovoMae === true
    E window.__game.save.met.asMarias === true
    (a troca de sceneN não pode quebrar o callback que persiste esses flags — main.js:875-876)
