# Spec BDD — 001 Onboarding guiado: Micaele → Jonatha → cidade

> ADR: `docs/adr/ADR-001-onboarding-gated.md`.
> Validação: manual no navegador via `window.__*` (sem framework — Baseline §0.1).
> **Convenção de assert manual:** inspecionar estado com `window.__game.save`
> (`{met:{mica,jona}, briefed}`) e `window.__game.mode`. Resetar onboarding com
> `window.__world.rebrief()` (zera `met.mica/met.jona/briefed`) e save inteiro com `window.__world.reset()`.
> **Toast:** auto-expira pelo contador `S.toast.t` (~4–5 s), sem precisar de toque — o assert é
> "toast visível logo após a ação", não exige fechar.
> **Mandato FF-002 (inviolável):** não reordenar os `<script>` de `index.html`; qualquer cenário só
> conta como verde com **zero erros de console** ao carregar.

> **Estado atual do código (gaps a implementar — confirmado pelos specialists):**
> hoje `talkNpc` usa `first = !briefed` para ambos os pais, então (a) falar com Jonatha sem Micaele
> já explica a missão e seta `briefed`; (b) `S.save.met[npc.key]=true` é gravado **antes** de qualquer
> checagem (linha ~796); (c) `enterNear` não tem gate de `briefed` e é chamado também pelo teclado
> (Enter/Espaço, linha ~1129). A spec abaixo é o comportamento-alvo.

Funcionalidade: Onboarding gated da Fase 2
  Para que a Maju entenda a missão antes de explorar
  Como jogadora recém-saída do sonho (Fase 1)
  Quero ser guiada a falar com a Micaele e depois com o Jonatha antes de entrar nas conchas

  Contexto:
    Dado que a intro (sonho) foi concluída e a Maju está no mundo livre
    E o save está em estado de jogador novo (met.mica=false, met.jona=false, briefed=false)

  # ---------- Happy path: roteiro na ordem ----------

  Cenário: Mundo nasce apontando para a Micaele
    Dado que a Maju acabou de entrar no mundo (!met.mica)
    Quando a tela do mundo é desenhada
    Então uma guia visual aponta para a Micaele
    E o painel de ajuda instrui a falar com a mainha primeiro
    E a seta dourada para conchas não aparece (briefed=false)

  Cenário: Boas-vindas da Micaele ao chegar perto e tocar FALAR
    Dado que a Maju está perto da Micaele (S.nearNpc = mica) e !met.mica
    Quando a Maju toca em "★ FALAR"
    Então o diálogo de boas-vindas ao Recife da Micaele é exibido
    E ao fim do diálogo met.mica passa a true e o save é gravado
    E a guia visual passa a apontar para o Jonatha

  Cenário: Jonatha explica a missão e libera a cidade
    Dado que met.mica=true e briefed=false
    E a Maju está perto do Jonatha (S.nearNpc = jona)
    Quando a Maju toca em "★ FALAR"
    Então o diálogo da missão do colar é exibido
    E ao fim briefed passa a true, met.jona=true e o save é gravado
    E a seta dourada para a primeira concha é ativada
    E a partir daí tocar "▶ ENTRAR" numa concha (mesma sessão) abre o nível

  # ---------- Edge: ordem obrigatória ----------

  Cenário: Falar com o Jonatha antes da Micaele é desviado
    Dado que met.mica=false e briefed=false
    E a Maju está perto do Jonatha
    Quando a Maju toca em "★ FALAR"
    Então o Jonatha exibe a fala de desvio pedindo pra falar com a mãe primeiro
    E met.jona continua false (o marcador só grava após o diálogo correto)
    E briefed continua false
    E a guia visual continua apontando para a Micaele

  # ---------- Error/gate: entrar na concha cedo ----------

  Cenário: Tocar ENTRAR numa concha antes de estar briefed é bloqueado
    Dado que briefed=false
    E a Maju chegou perto de uma concha ativa (S.near aponta para um spot — confirmar com window.__game.near)
    Quando a Maju toca em "▶ ENTRAR"
    Então o nível não é aberto (window.__game.mode continua "world")
    E um toast pede pra falar com os pais primeiro

  Cenário: Pressionar Enter/Espaço perto de concha antes de briefed também é bloqueado
    Dado que briefed=false e a Maju está perto de uma concha ativa
    Quando o jogador pressiona Enter ou Espaço (atalho de enterNear)
    Então o nível não é aberto (window.__game.mode continua "world")
    E um toast pede pra falar com os pais primeiro

  Cenário: Depois de briefed, ENTRAR na concha funciona
    Dado que briefed=true
    E a Maju está perto de uma concha ativa
    Quando a Maju toca em "▶ ENTRAR"
    Então o nível da concha é aberto (window.__game.mode = "puzzle")

  # ---------- Reencontros motivadores ----------

  Cenário: Reencontro com a Micaele (já conhecida) dá mensagem motivadora curta
    Dado que met.mica=true (já tocou a boas-vindas) — valendo mesmo com briefed ainda false
    E a Maju está perto da Micaele
    Quando a Maju toca em "★ FALAR"
    Então uma mensagem motivadora curta da Micaele é exibida (espírito "Eu sei que tu consegue, Maju. Vai lá!")
    E a explicação completa de boas-vindas NÃO é repetida
    # nota: a condição da motivadora da Micaele é met.mica, não briefed

  Cenário: Reencontro com o Jonatha (já briefado) dá mensagem motivadora curta
    Dado que briefed=true
    E a Maju está perto do Jonatha
    Quando a Maju toca em "★ FALAR"
    Então uma mensagem motivadora curta do Jonatha é exibida
    E a explicação completa da missão NÃO é repetida

  # ---------- Robustez de input ----------

  Cenário: Toques repetidos em FALAR não empilham diálogos
    Dado que a Maju está perto da Micaele e !met.mica
    Quando "★ FALAR" é tocado duas vezes em sequência rápida
    Então apenas um diálogo de boas-vindas está ativo
    E o estado de onboarding não avança em dobro (met.mica grava uma vez, sem glitch da seta/pan)

  Cenário: NPC e concha sobrepostos priorizam o NPC
    Dado que a Maju está na zona de colisão de um NPC e de uma concha ao mesmo tempo
    Quando a Maju toca no botão de ação
    Então o diálogo do NPC abre (talkNpc) e o nível não é aberto

  # ---------- Persistência / migração ----------

  Cenário: Onboarding sobrevive ao recarregar a página
    Dado que met.mica=true e briefed=true em uma sessão
    Quando a página é recarregada (load do save v3)
    Então window.__game.save mostra met.mica=true e briefed=true
    E o estado volta como Briefed (sem seta de NPC, ENTRAR liberado)

  Cenário: Save antigo com progresso não força refazer o onboarding
    Dado um save com pelo menos 1 concha concluída (done com ≥1 entrada) OU briefed=true explícito
    Quando o save é carregado/migrado para v3
    Então briefed permanece/passa a true (progresso implica onboarding feito — Lei do Domínio §4)
    E a Maju não é forçada a refazer Micaele/Jonatha

  Cenário: Save corrompido inicia o onboarding do zero com segurança
    Dado um localStorage com JSON inválido em "maresRecife"
    Quando a página carrega
    Então o load defensivo (try/catch) retorna estado novo (briefed=false)
    E o jogo carrega sem erro de console e a Maju entra no onboarding da Micaele

  Cenário: Jogo carrega sem erro de console em qualquer estado de save
    Dado um save em estado novo, em estado Briefed, ou migrado de versão anterior
    Quando a página carrega
    Então não há erro no console (FF-002)
    E a guia/seta correta para o estado é exibida
