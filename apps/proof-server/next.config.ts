import type {NextConfig} from "next";

// `output: "export"` de propósito, e não é economia: o item A3 exige que a página RENDERIZE na
// CI, e a exportação estática renderiza os componentes de SERVIDOR em tempo de build e grava o
// HTML em `out/`. Um arquivo é conferível sem subir servidor nem navegador — e se a fronteira
// estiver quebrada, o build morre antes de escrever qualquer coisa, que é o gate.
const nextConfig: NextConfig = {output: "export"};

export default nextConfig;
