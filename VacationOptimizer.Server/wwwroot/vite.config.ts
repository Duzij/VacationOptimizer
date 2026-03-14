import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command }) => {
  const apiProxyTarget = process.env.VITE_API_PROXY_TARGET ?? "https://localhost:8080";

  return {
    base: command === "serve" ? "/" : "/app",
    server: command === "serve" ? {
      host: "0.0.0.0",
      port: 3001,
      strictPort: true,
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: apiProxyTarget.startsWith("https://"),
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
