// Tipo mínimo do jest-axe (não traz .d.ts próprio; @types/jest-axe arrastaria
// @types/jest e poluiria os globals do vitest). Só o que usamos: axe() e o
// formato de violations. Auditoria 18/07, M8.
declare module "jest-axe" {
  interface AxeNode {
    html: string;
    target: string[];
  }
  interface AxeViolation {
    id: string;
    help: string;
    impact?: string;
    nodes: AxeNode[];
  }
  interface AxeResults {
    violations: AxeViolation[];
  }
  interface AxeOptions {
    rules?: Record<string, {enabled: boolean}>;
  }
  export function axe(html: Element | string, options?: AxeOptions): Promise<AxeResults>;
}
