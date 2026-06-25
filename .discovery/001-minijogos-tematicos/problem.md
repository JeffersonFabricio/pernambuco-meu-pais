# Problema — 001-minijogos-tematicos: Repetição e desconexão dos motores de puzzle

> Criado em: 2026-06-25
> Facilitado por: Produto & Design (sessão /discover com o autor do jogo)

---

## Contexto de Mercado

- **Indústria/Setor**: jogo / entretenimento — game pixel art autoral ("Um Sonho — Marés do Recife")
- **Natureza**: B2C (na prática, presente afetivo para a Maju; jogo client-side público no GitHub Pages)
- **Escala**: consumer / projeto pessoal
- **Regulação aplicável**: nenhuma (offline-first, sem backend, sem PII coletada)
- **Concorrentes/Referências**: _(não pesquisado)_

---

## Persona

A **Maju** (jogadora-criança) percorrendo o mundo livre do Recife para recuperar as 31 conchas.
Secundariamente, o **autor do jogo** (engenheiro), que sente que partes da aventura encantam mais que outras.

---

## Situação atual

As 31 conchas reusam apenas **10 motores de puzzle** (`js/levels.js`, campo `e:`). Distribuição real:

| Motor | Vezes usado |
|-------|-------------|
| Memory, Lights, Rhythm(7), Passo(8), Praça(10) | 5× cada |
| Shark, Pipe, Maze, Rota(9) | 4× cada |
| Shadow(3), Sequence(2) | 3× / 2× |
| Rosa especial (11) | 1× |

O jogador vê o **mesmo motor até 5 vezes** ao longo da jornada.

---

## Problema

Duas camadas de dor:

1. **Repetição** — o mesmo motor reaparece até 5× nas 31 conchas; a aventura perde frescor.
2. **Desconexão** — quando um motor é só reciclado numa concha qualquer, ele não "fala" do lugar. Os momentos que o autor considera **"perfeitos"** são exatamente aqueles em que **a mecânica do jogo É a metáfora do lugar**:
   - Maracatu → ritmo + sons (motor Rhythm) batendo no compasso.
   - Amanhecer da Maju → ligar as luzes da cidade (motor Lights).
   - Tubarão na praia → salvar a criança (motor Shark).

A solução não é "mais puzzle genérico decorado", é **mais cena-vira-mecânica**.

---

## Impacto

| Dimensão | Impacto |
|----------|---------|
| Frequência | Sentido em toda partida — a jornada inteira tem 31 paradas |
| Afetados | A jogadora principal (Maju) e qualquer pessoa que jogue |
| Custo | Encantamento/imersão: conchas "recicladas" valem menos que as conchas-assinatura |

---

## Alternativas atuais

| Alternativa | Limitação |
|-------------|-----------|
| Variar o *tier* (dificuldade) do mesmo motor por concha | Muda o desafio, não a sensação — segue sendo o mesmo jogo |
| Variar curiosidade/`fact` e diálogo | Enriquece a narrativa, mas a mecânica continua repetida |

---

## Evidências

- Contagem de motores por concha em `js/levels.js` (acima): repetição de até 5×.
- Depoimento direto do autor: maracatu, amanhecer-luzes e tubarão "ficaram perfeitos" — são justamente os casos cena=mecânica.

---

## Perguntas em aberto

- [ ] Quais cenas do Recife ainda não viraram mecânica e pedem um motor próprio? (mapa cena→mecânica)
- [ ] Quantos motores novos cabem no orçamento de esforço antes de virar manutenção pesada?
- [ ] Reatribuir conchas existentes aos motores novos, ou só usá-los em conchas/cenas novas?
