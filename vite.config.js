import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

export default defineConfig({
  // All app code, including index.html, lives in src/.
  root: "src",
  publicDir: "../public",
  // Relative asset paths so the build works both locally and under
  // https://<user>.github.io/Algorithm-Visualizer/ on GitHub Pages.
  base: "./",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  plugins: [react()],
  // Tailwind + PostCSS configured inline instead of separate config files.
  css: {
    postcss: {
      plugins: [
        tailwindcss({
          content: ["./src/**/*.{html,js,jsx}"],
          theme: { extend: {} },
          plugins: [],
        }),
        autoprefixer(),
      ],
    },
  },
});
