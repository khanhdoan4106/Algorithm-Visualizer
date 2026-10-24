import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Relative asset paths so the build works both locally and under
  // https://<user>.github.io/Algorithm-Visualizer/ on GitHub Pages.
  base: "./",
});
