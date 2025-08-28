import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  // Set base for GitHub Pages project sites. Can be overridden in CI with BASE_PATH
  base: process.env.BASE_PATH ?? '/',
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    open: true,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
