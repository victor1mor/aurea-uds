import React, { type ButtonHTMLAttributes, type HTMLAttributes, type ReactElement, type RefAttributes } from "react";
import { type Orientation, type Responsive } from "./pure.js";
import { type IconName, type AureaIcon } from "./system.js";
export type ButtonVariant = "primary" | "secondary" | "tertiary" | "outline" | "ghost" | "primary-outline" | "primary-ghost" | "danger" | "danger-outline" | "danger-ghost" | "link" | "link-primary" | "link-danger" | "nav" | "danger-soft";
export type ButtonAppearance = "solid" | "outline" | "ghost" | "link" | "nav" | "soft";
export type ButtonTone = "neutral" | "brand" | "danger" | "success" | "warning" | "info";
export type ComponentSize = "xs" | "sm" | "md" | "lg" | "xl";
/** Resolve os dois eixos (ou o atalho) na classe que o core pinta. Exportada porque o teste
 *  cobra a matriz inteira, e porque quem monta um botão à mão precisa da mesma conta.
 *
 *  Não há degradação: toda célula dos dois eixos tem regra própria no core. A versão de
 *  21/08 rebaixava `solid` de success/info para `outline` porque faltava o par de token — o
 *  Victor recusou a degradação silenciosa e mandou consertar a infraestrutura, que é o que
 *  `--success`/`--success-foreground` e os irmãos são. `outline` voltou a ser só uma aparência
 *  que se pede, nunca o que sobra quando a nossa paleta não dá conta. */
export declare function buttonSkin(variant?: ButtonVariant, appearance?: ButtonAppearance, tone?: ButtonTone): string;
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, RefAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    appearance?: ButtonAppearance;
    tone?: ButtonTone;
    size?: Responsive<ComponentSize>;
    loading?: boolean;
    leadingIcon?: AureaIcon;
    trailingIcon?: AureaIcon;
    href?: string;
    fullWidth?: boolean;
    /** Menos peso (15/10/2026): a letra apagada e um degrau menor (12 no `sm`) — o botão de ferramenta de um topo de
     *  site, como o "Theme" da referência. A caixa e o fundo são os da aparência escolhida. */
    quiet?: boolean;
    /** C-03 (24/09/2026): numa fila (`Cluster`), divide o espaço em partes iguais com os outros botões
     *  que também têm `grow`. O `fullWidth` não serve ali: ele pede a linha inteira. */
    grow?: boolean;
    /** M-01 (25/09/2026): o elemento que o botão desenha no lugar do `<button>`/`<a>` — o link do
     *  roteador do app, por exemplo: `render={<Link href="/relatorios" />}`. O elemento recebe a pele,
     *  o conteúdo (ícones, texto, atalho) e os atributos do botão; o destino é dele. Desativado ou
     *  carregando, o clique é BARRADO também nele, como no link desativado (AUD-0004). */
    render?: ReactElement;
    /** C-13 (24/09/2026): atributos de LINK, que só valem com `href` — sem ele são ignorados. Antes
     *  chegavam ao `<a>` em tempo de execução, mas o tipo não os aceitava, e `target="_blank"` não
     *  compilava. */
    target?: React.HTMLAttributeAnchorTarget;
    rel?: string;
    download?: boolean | string;
    /**
     * @deprecated Use `<Toggle>` instead. Pesquisado em 18/08/2026 nas doze referências (entre
     * elas o motor Base UI e o APG): **nenhuma** põe o estado de pressionado no botão comum — todas têm um
     * componente separado, e o nosso é o `Toggle`. Manter os dois é dois caminhos para a mesma
     * coisa, que é o "qual eu uso?" que denuncia recurso duplicado.
     * A diferença de verdade: aqui VOCÊ guarda o estado e isto só pinta e anuncia; o `Toggle`
     * guarda o estado (motor Base UI), devolve `onPressedChange` e cobra nome acessível quando
     * é só ícone.
     * @deprecatedSince 0.4.0 — sai na `1.0`. A Aurea está em `0.x`, onde o semver permite
     * quebrar, e por isso este é o momento mais barato que vai existir.
     */
    pressed?: boolean;
    /** O atalho, à mostra e anunciado. Texto: uma caixinha só ("⌘K"). LISTA (15/10/2026): uma caixinha por tecla, como
     *  a busca da referência (`["Ctrl", "K"]`), e o leitor de tela recebe a combinação (`Control+K`). */
    kbd?: string | readonly string[];
    /**
     * GAR-14 (0.28.0): o botão COMPARTILHA. Ele pergunta ao navegador se sabe compartilhar este link
     * (`navigator.canShare`) — detectar o recurso, e não adivinhar o aparelho, é o padrão da web. Sabe
     * (celular; Chrome, Edge e Safari no computador): abre a janela do aparelho, e cancelar não é erro.
     * Não sabe: copia o link e mostra "Link copiado" preso ao botão, com a medida dele. A cópia falhou:
     * avisa e mostra o link selecionado. O aviso fala com o leitor de tela nos dois casos.
     * Sem `url`, é o endereço da página. O aviso precisa do `AureaProvider` (ou do `aurea.js` na página).
     * Só vale no `<button>`: com `href` ou `render`, é ignorado.
     */
    share?: ButtonShareData;
    /** O brilho (ADR-0086, 28/10/2026): no botão principal (`primary`), uma sombra difusa embaixo, na cor dele a 40%. É
     *  acabamento que o app escolhe; o foco continua o anel. Escreve `data-glow` — o mesmo atributo num contêiner vale para
     *  os botões de dentro, e `glow={false}` tira um deles. Nos outros botões, não desenha nada. */
    glow?: boolean;
    /** O fio (ADR-0086): em volta do botão de fundo suave (`soft` e de contorno), o tom a 30%, por dentro. É linha — a
     *  exceção nomeada à ADR-0072, só quando o app escolhe. Escreve `data-ring`, com a mesma regra do contêiner. */
    ring?: boolean;
}
/** O que o `Button share` compartilha (GAR-14). Os nomes são os do `navigator.share` da web. */
export interface ButtonShareData {
    url?: string;
    title?: string;
    text?: string;
}
export declare const Button: React.ForwardRefExoticComponent<Omit<ButtonProps, "ref"> & RefAttributes<HTMLButtonElement>>;
interface ToggleBase {
    pressed?: boolean;
    defaultPressed?: boolean;
    onPressedChange?: (pressed: boolean) => void; /** O que identifica este toggle DENTRO de um ToggleGroup — sem ele o grupo não sabe qual botão
     *  mudou, e a composição fica bonita e morta. Solto, não faz diferença nenhuma. */
    value?: string;
    icon?: IconName;
    size?: Responsive<Extract<ComponentSize, "sm" | "md" | "lg">>;
    disabled?: boolean;
    id?: string;
    className?: string;
    /** 0.32.0, o `ToggleButton` da referência: `default` com o fundo neutro (o padrão), `ghost` sem fundo
     *  (o desenho de até a 0.31.0). O ligado é o idioma "selecionado" da Aurea nos dois. */
    variant?: ToggleVariant;
    /** A cor do LIGADO (ADR-0084, 27/10/2026): `brand` — o amarelo do botão primário, o padrão —, `neutral` (o cinza) ou
     *  `contrast` (o grafite, invertido). Dentro de um `ToggleGroup` ou de um `Toolbar` com `pressedStyle`, o do botão vale. */
    pressedStyle?: TogglePressedStyle;
}
export type ToggleVariant = "default" | "ghost";
/** As três cores do ligado aprovadas pelo Victor em 26/10/2026 (A cinza, B grafite, C amarelo — o padrão). */
export type TogglePressedStyle = "neutral" | "contrast" | "brand";
type ToggleChildren = Exclude<React.ReactNode, boolean | null | undefined>;
export type ToggleProps = ToggleBase & ({
    children: ToggleChildren;
    label?: string;
} | {
    children?: never;
    label: string;
});
export declare function Toggle({ pressed, defaultPressed, onPressedChange, value, icon, label, size: sizePedido, disabled, id, className, children, variant, pressedStyle }: ToggleProps): React.JSX.Element;
export interface IconButtonProps extends Omit<ButtonProps, "children"> {
    label: string;
    icon: AureaIcon;
}
export declare const IconButton: React.ForwardRefExoticComponent<Omit<IconButtonProps, "ref"> & RefAttributes<HTMLButtonElement>>;
export interface CloseButtonProps extends Omit<ButtonProps, "quiet" | "variant" | "appearance" | "tone" | "size" | "loading" | "leadingIcon" | "trailingIcon" | "href" | "target" | "rel" | "download" | "render" | "kbd" | "fullWidth" | "grow" | "pressed" | "share" | "glow" | "ring"> {
    /** O nome que o leitor de tela anuncia. Padrão: a frase `close` ("Close"/"Fechar"). */
    label?: string;
}
export declare const CloseButton: React.ForwardRefExoticComponent<Omit<CloseButtonProps, "ref"> & RefAttributes<HTMLButtonElement>>;
export interface ThemeToggleProps extends Omit<IconButtonProps, "quiet" | "icon" | "label" | "onClick" | "variant" | "appearance" | "tone" | "href" | "target" | "rel" | "download" | "render" | "kbd" | "loading" | "leadingIcon" | "trailingIcon" | "fullWidth" | "share" | "glow" | "ring"> {
    /** `"light-dark"` (o padrão): o botão que alterna. `"light-dark-system"` (15/10/2026): a chave de três posições do
     *  topo da referência — claro, escuro e sistema (seguir o do computador, e mudar junto). */
    mode?: "light-dark" | "light-dark-system";
}
export declare const ThemeToggle: React.ForwardRefExoticComponent<Omit<ThemeToggleProps, "ref"> & RefAttributes<HTMLButtonElement>>;
export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement>, RefAttributes<HTMLDivElement> {
    label?: string;
    orientation?: Responsive<Orientation>;
    /** O desenho de todos os botões de dentro; cada um pode trocar o seu. */
    variant?: ButtonVariant;
    /** O tamanho de todos os botões de dentro; cada um pode trocar o seu. */
    size?: Responsive<ComponentSize>;
    /** Ocupa a largura do pai, e os botões repartem em partes iguais. */
    fullWidth?: boolean;
    /** Desliga todos os botões de dentro. */
    disabled?: boolean;
    /** Botões soltos (cápsulas com vão de 4), em vez de colados. */
    detached?: boolean;
}
export declare function ButtonGroup({ label, orientation, variant, size, fullWidth, disabled, detached, className, ...props }: ButtonGroupProps): React.JSX.Element;
export declare function Toolbar({ orientation, label, className, pressedStyle, ...props }: HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement> & {
    orientation?: Responsive<Orientation>;
    label?: string;
    pressedStyle?: TogglePressedStyle;
}): React.JSX.Element;
export declare function ToolbarGroup({ label, className, ...props }: HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement> & {
    label?: string;
}): React.JSX.Element;
export declare function ToolbarSeparator({ className, ...props }: HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement>): React.JSX.Element;
export interface ToolbarButtonProps extends Omit<ButtonProps, "share"> {
    /** A cor do ligado (ADR-0084): `brand` (o padrão), `neutral` ou `contrast`. Vale quando o botão está ligado (`aria-pressed`). */
    pressedStyle?: TogglePressedStyle;
}
export declare const ToolbarButton: React.ForwardRefExoticComponent<Omit<ToolbarButtonProps, "ref"> & RefAttributes<HTMLButtonElement>>;
export interface ToggleGroupProps {
    value?: string[];
    defaultValue?: string[];
    onValueChange?: (value: string[]) => void;
    multiple?: boolean;
    orientation?: Responsive<Orientation>;
    disabled?: boolean;
    label?: string;
    className?: string;
    children: React.ReactNode;
    /** O tamanho de todos os botões de dentro; cada um pode trocar o seu (valor simples, como o dela). */
    size?: Extract<ComponentSize, "sm" | "md" | "lg">;
    /** Ocupa a largura do pai, e os botões repartem em partes iguais. */
    fullWidth?: boolean;
    /** Botões soltos (vão de 4), em vez de colados. */
    detached?: boolean;
    /** A cor do ligado de todos os botões de dentro (ADR-0084): `brand` (o padrão), `neutral` ou `contrast`; cada um pode
     *  trocar a sua. */
    pressedStyle?: TogglePressedStyle;
}
export declare function ToggleGroup({ value, defaultValue, onValueChange, multiple, orientation, disabled, label, className, children, size, fullWidth, detached, pressedStyle }: ToggleGroupProps): React.JSX.Element;
export {};
