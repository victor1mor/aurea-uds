import {defineConfig} from "vitest/config";
import react from "@vitejs/plugin-react";
import {fileURLToPath} from "node:url";

// Só tests/unit — tests/visual é do Playwright e tem `test` de outro pacote.
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Os dois módulos de plataforma do alvo nativo, trocados por dublês na RESOLUÇÃO.
    // `react-native` é escrito em Flow e nenhum transform do vitest o lê (medido em 02/09/2026:
    // `Parse failed: Flow is not supported`), e `react-native-svg` depende dele. `vi.mock` não
    // resolve: ele age em runtime, e o Vite já tentou transformar o módulo real antes disso.
    //
    // O alias vale para a suíte inteira, e não há colisão: nenhum teste da web importa estes
    // dois. O que ele NÃO faz é substituir medição em aparelho — ver `tests/unit/native-stubs/`.
    alias: {
      // A ordem NÃO importa aqui, e é bom dizer por quê: o alias de string do Rollup casa por
      // igualdade ou por `find + "/"`, então `react-native` NÃO engole `react-native-svg` nem
      // `react-native-safe-area-context`. Medido, não presumido — a suíte passa com os três.
      // Os dois módulos NATIVOS do Lote 4. Eles não têm implementação JavaScript nenhuma — o
      // que abre o diálogo e a câmera é código Kotlin/ObjC —, então sem dublê o teste nem
      // resolveria o import.
      "@react-native-community/datetimepicker": fileURLToPath(new URL("./tests/unit/native-stubs/datetimepicker.ts", import.meta.url)),
      "expo-image-picker": fileURLToPath(new URL("./tests/unit/native-stubs/expo-image-picker.ts", import.meta.url)),
      "react-native-safe-area-context": fileURLToPath(new URL("./tests/unit/native-stubs/react-native-safe-area-context.ts", import.meta.url)),
      "react-native-svg": fileURLToPath(new URL("./tests/unit/native-stubs/react-native-svg.ts", import.meta.url)),
      "react-native": fileURLToPath(new URL("./tests/unit/native-stubs/react-native.ts", import.meta.url)),
    },
  },
  test: {
    include: ["tests/unit/**/*.test.tsx"],
    environment: "jsdom",
    setupFiles: ["tests/unit/setup.ts"],
    globals: true,
  },
});
