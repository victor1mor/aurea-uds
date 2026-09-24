# Como contribuir com a Aurea

A Aurea é mantida pelo Victor, e é ele quem decide. Contribuição é bem-vinda, com uma ressalva:
**a identidade visual não está em discussão** (a seção 5 do [`CLAUDE.md`](CLAUDE.md) diz o que ela
é). Pedido para trocar o amarelo, os raios, a letra ou a densidade vai ser fechado.

O projeto é escrito em **português**: problemas, pedidos de junção, comentários e documentos.

## Antes de começar

- **Problema ou ideia:** abra um problema antes de escrever código. Diga o que você tentou, o que
  esperava e o que aconteceu, e se é na **web** ou no **nativo** — as duas bibliotecas são
  diferentes.
- **Componente novo:** leia o [`docs/BUILDING.md`](docs/BUILDING.md) primeiro. Componente não
  começa sem ele.
- **Decisão já tomada** mora em [`decisions/`](decisions/README.md) e não se reabre sem evidência
  nova.

## Preparar a máquina

- Node 24, pnpm 11 e Python 3.

```bash
pnpm install
pnpm build
```

## Verificar antes de abrir o pedido

Rode, um por linha:

```bash
python scripts/validate.py
pnpm build
npx vitest run
node scripts/check-pack.mjs
```

O `validate.py` confere, entre outras coisas, que nenhum nome privado do mantenedor entrou no
código. A lista desses nomes **não é pública**: sem ela o validador reprova, avisando. Para rodar
sem a lista na sua máquina, declare `AUREA_SEM_LISTA=1`. No pedido de junção vindo de um fork, a
verificação automática também roda sem a lista; a conferência com ela fica com o mantenedor.

## As regras que um pedido de junção precisa cumprir

- **Todo número de geometria sai de um token.** Pixel cru no CSS reprova na verificação.
- **Conserto vem com o teste que falha no defeito antigo**, no mesmo commit. Teste que passa com o
  defeito dentro não prova nada.
- **Mudou a API de um componente? Mude a ficha** em `packages/contracts/registry/`. O validador
  confere uma contra a outra.
- **Mudou a aparência? Mostre antes e depois**, nos dois temas.
- **Nada de marca registrada de terceiro** (logos de empresas) dentro da biblioteca.
- Código copiado de outro projeto só entra se a licença permitir (Apache-2.0 aceita MIT, BSD e
  Apache; **não** aceita AGPL nem licença não-comercial), com crédito no
  [`docs/REFERENCES.md`](docs/REFERENCES.md).

## Licença

Ao contribuir, você concorda que a sua contribuição sai sob a [Apache 2.0](LICENSE).
