import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Zona horaria fija con cambio de horario, para que los tests de fechas
// den lo mismo en cualquier ordenador y comprueben el paso de verano a invierno.
process.env.TZ = "Europe/Madrid";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
