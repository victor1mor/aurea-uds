# ADR-0004 — Motor headless: Base UI

- **Data:** 16/07/2026 (decisão) · registrada como ADR em 30/07/2026 (Fase 10, achado M19)
- **Estado:** aceita, em vigor
- **Decidiu:** Victor

## Contexto

Overlay acessível — foco preso, `Escape`, restauração de foco, `inert` no resto da página,
posicionamento — é a parte do sistema em que errar é invisível e caro: nada quebra na tela, e
quem usa teclado ou leitor de tela fica de fora. Escrever isso à mão é assumir manutenção de
comportamento que times inteiros mantêm.

## Alternativas

**A. Escrever os overlays à mão.** Rejeitada: é onde mais se erra, e o erro não aparece em
screenshot. A Fase 5 confirmou o risco por outro caminho — os quatro overlays estavam sem teste
nenhum e havia um defeito real na Tooltip (achado A11).

**B. Radix UI.** Considerada. Padrão de mercado por anos, mas em 2026 o desenvolvimento havia
desacelerado enquanto o Base UI (do mesmo grupo do MUI, com gente do Radix) tomou o lugar de
opção mantida e mais nova.

**C. Base UI (`@base-ui/react`).** Escolhida.

## Decisão

`@base-ui/react` é o motor headless a partir da Fase 2. Ele entrega comportamento; a **pele é
100% Aurea** — nenhum estilo do motor entra no core.

## Consequências

**Boas:** Dialog, Drawer, Popover, Tooltip, DropdownMenu, ContextMenu, Combobox, Tabs, Toolbar e
Toast saem prontos no comportamento; a Fase 5 pôde testar contrato de a11y em vez de reimplementar.

**Custos, declarados:**
- É a única dependência de runtime do pacote React (Fase 9). Atualização dele é evento de
  atenção: a Fase 5 mediu que o Base UI 1.6 **não** usa `aria-modal` (esconde o irmão com
  `aria-hidden`), ou seja o comportamento real muda entre versões e nossos testes é que pegam.
- Componente que o Base UI não tem (TreeView) é headless próprio, e isso está escrito no código.

**Revisão:** se o Base UI parar de ser mantido, a saída não é trocar por outro motor às pressas —
é medir, componente a componente, quais dependem dele de fato (hoje: 10 dos 65).
