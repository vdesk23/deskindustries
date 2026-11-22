// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import path from "node:path";

export default defineConfig({
  vite: {
    resolve: {
      alias: [
        { find: "entities/lib/decode.js", replacement: path.resolve(__dirname, "node_modules/entities/lib/decode.js") },
        { find: "entities/lib/encode.js", replacement: path.resolve(__dirname, "node_modules/entities/lib/encode.js") },
        { find: /^entities$/, replacement: path.resolve(__dirname, "node_modules/entities") },
      ],
    },
  },
});
