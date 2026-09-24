// COMPONENTE DE SERVIDOR — sem `"use client"`, e é o ponto.
import type {ReactNode} from "react";
import "@aurea-uds/core/css";

export const metadata = {title: "Aurea — prova da fronteira servidor/cliente"};

export default function RootLayout({children}: {children: ReactNode}) {
  return <html lang="en" data-theme="dark"><body>{children}</body></html>;
}
