import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command }) => {
  return {
    base: "/app",
    server: command === "serve" ? {
      port: 3001,
      proxy: {
        "/api": {
          target: "http://localhost:8080",
          changeOrigin: true,
          secure: false,
        },
      },
    } : {},
    build: {
      outDir: "dist",
      emptyOutDir: true,
      manifest: true,
    },
    plugins: [
      react(),
      tailwindcss(),
    ],
  };
});
