import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { devServerBridgePlugin } from "@lovable.dev/vite-plugin-dev-server-bridge";
import { hmrGatePlugin } from "@lovable.dev/vite-plugin-hmr-gate";
import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";

const isSandbox =
  process.env.LOVABLE_SANDBOX === "1" || !!process.env.DEV_SERVER__PROJECT_PATH;

function spaFallbackPlugin(): Plugin {
  return {
    name: "spa-fallback-html",
    closeBundle() {
      const outDir = resolve(process.cwd(), "dist");
      const indexPath = resolve(outDir, "index.html");
      if (!existsSync(indexPath)) return;
      for (const name of ["404.html", "200.html"]) {
        copyFileSync(indexPath, resolve(outDir, name));
      }
    },
  };
}

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? "./",
  plugins: [
    devServerBridgePlugin(),
    hmrGatePlugin(),
    react(),
    tailwindcss(),
    tsconfigPaths(),
    spaFallbackPlugin(),
  ],
  server: {
    host: isSandbox ? "0.0.0.0" : true,
    port: 8080,
    strictPort: isSandbox,
  },
  build: {
    outDir: "dist",
  },
});
