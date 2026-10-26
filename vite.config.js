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
          theme: {
            extend: {
              // Palette taken from algorithm textbooks: ink on white graph paper,
              // CLRS vertex colours (white / gray / black), a highlighter for the
              // current step and a red pen for the final answer.
              colors: {
                paper: "#ffffff",
                ink: "#1b1d22",
                graphite: "#b8bec6",
                muted: "#5c636d",
                rule: "#e3e6ea",
                grid: "#dde6f0",
                sheet: "#f7f9fc",
                highlight: "#ffd84d",
                redpen: "#c8312b",
              },
              fontFamily: {
                sans: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
                math: ['"Source Serif 4"', "Georgia", "serif"],
              },
            },
          },
          plugins: [],
        }),
        autoprefixer(),
      ],
    },
  },
});
