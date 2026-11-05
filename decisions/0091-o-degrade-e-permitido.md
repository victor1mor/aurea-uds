# ADR-0091 — O degradê é permitido

- **Data:** 05/11/2026
- **Estado:** aceita · na `0.57.0` (branch `claude/lote-paralelo`).
- **Substitui:** a [ADR-0007](0007-sem-gradientes.md) ("sem gradientes, nem os funcionais"). As três exceções que ela
  ganhou deixam de ser exceção: a escolha de cor ([ADR-0069](0069-escolher-cor-a-excecao-ao-gradiente-e-o-motor-nosso.md)),
  o `brand-gradient` da barra de baixo ([ADR-0084](0084-os-estilos-novos-e-as-duas-excecoes.md)) e o código recolhido da
  caixa empilhada ([ADR-0089](0089-a-caixa-de-exemplo-empilhada.md)) — continuam valendo como peças, sem o rótulo.
- **Origem:** o Victor, ao ver o inventário dos componentes desenhados no minipc marcar degradês como "conflito":
  *"essa regra do degradê, achei ela, busque ela em todos os lugares, vamos revogar, faça como se ela nem existisse, assim
  não se confunde, pois eu já tinha pedido pra revogar; como vamos virar UDS se não aceitamos?"*

## A regra

1. **O degradê é um recurso como qualquer outro.** Uma peça, um estilo ou um desenho não se recusa por ter degradê.
2. **Ele continua passando pelas outras regras:** as cores saem dos tokens de cada marca e tema; o texto sobre ele mede o
   contraste como sobre qualquer fundo; o alto contraste do sistema (`forced-colors`) e o da Aurea (`data-contrast="high"`,
   ADR-0090) continuam sendo cobrados onde a peça for medida.
3. **"Como se nunca tivesse existido":** a regra saiu do `CLAUDE.md` (§5 e §10), do contrato, do guia para assistentes
   (`skills/aurea-uds/SKILL.md`), das páginas do site (a Introduction, a Styling, a Agent skills e a Design principles,
   que passou de dez a nove regras), dos comentários de código e dos testes. A trava que a cobrava (o check 4 do
   `validate.py`) saiu inteira; o número 4 fica vago para os outros não mudarem.
4. **O histórico fica:** as notas de versão antigas, `docs/historia/` e as ADRs antigas contam o que valia na época.

## Quem cobra

Nada: a regra deixou de existir. O que a substituía na prática — o contraste e o alto contraste — continua cobrado pela
varredura do axe e pelos testes do alto contraste.
