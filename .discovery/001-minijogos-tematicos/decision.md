# Decisão — 001-minijogos-tematicos

> Referência: `problem.md` · `hypothesis.md`
> Data: 2026-06-25

---

## Decisão

**🟢 CONSTRUIR**

---

## Justificativa

- Dor confirmada com número: 31 conchas reusam 10 motores, com reuso de até **5×** do mesmo jogo.
- A solução é aditiva e barata em risco arquitetural (suposição #2 = Alta): motor novo = 1 classe `*Puzzle` + reatribuição do campo `e:` em `js/levels.js`, sem refator estrutural.
- O autor já reconhece o padrão de sucesso (cena=mecânica) nos casos maracatu / amanhecer-luzes / tubarão — há referência concreta de "como é bom quando acerta".

---

## Escopo aprovado

- **Construir 5 motores novos** (default recomendado), seleção final no `/spec`:
  1. 🛶 **Jangada na maré** — navegar lendo a corrente (motor-âncora, liga ao colar do avô)
  2. 🌉 **Pontes do Recife** — conectar ilhas erguendo pontes (**voto explícito do autor**, motor-âncora)
  3. 🦀 **Caranguejo no mangue** — captura por timing
  4. 🧵 **Renda de bilro** — traçar a linha pelos alfinetes
  5. 🪁 **Pipa no vento** — planar nas correntes de ar
- **Reatribuir `e:`** nas conchas para que nenhum motor passe de ~2-3×.
- Stretch (fora do escopo inicial, reavaliar): ☂️ Frevo da sombrinha, 🪗 Forró da sanfona.

---

## Próximo passo

`/spec 008-minijogos-tematicos` — escrever story + cenários BDD por motor + plano de reatribuição das conchas.

---

## Condições / riscos a vigiar

- **Filtro cena=mecânica** é inegociável: cada motor precisa "contar o lugar". Se na spec algum candidato virar puzzle genérico pintado de recifense, corta ou redesenha.
- Reatribuir `e:` em conchas existentes muda a experiência de quem já jogou — validar contra o save versionado (não deve quebrar `done{}`).
