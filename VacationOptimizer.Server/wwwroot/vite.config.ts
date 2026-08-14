import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command }) => {
  const apiProxyTarget = process.env.VITE_API_PROXY_TARGET ?? "https://localhost:8080";

  return {
    base: "/",
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
    test: {
      environment: "jsdom",
      clearMocks: true,
    },
    plugins: [
      injectStaticFooter(),
      react(),
      serveStaticBlogPages(),
      tailwindcss(),
    ],
  };
});

function injectStaticFooter() {
  return {
    name: "inject-static-footer",
    transformIndexHtml(html: string) {
      const footerPath = path.resolve(process.cwd(), "src", "content", "footer.html");
      const footerHtml = fs.readFileSync(footerPath, "utf8");
      return html.replace("<!-- static-footer -->", footerHtml);
    },
  };
}

function serveStaticBlogPages() {
  return {
    name: "serve-static-blog-pages",
    configureServer(server: {
      middlewares: {
        use: (handler: (
          req: { url?: string },
          res: {
            setHeader: (name: string, value: string) => void;
            end: (body: string) => void;
            statusCode: number;
          },
          next: () => void
        ) => void) => void;
      };
    }) {
      server.middlewares.use((req, res, next) => {
        const requestUrl = req.url ? new URL(req.url, "http://localhost") : null;
        const pathname = requestUrl?.pathname;

        if (!pathname || !pathname.startsWith("/blog")) {
          next();
          return;
        }

        const relativePath = pathname === "/blog" || pathname === "/blog/"
          ? path.join("blog", "index.html")
          : path.join("blog", pathname.replace(/^\/blog\/?/, ""), "index.html");
        const filePath = path.resolve(process.cwd(), "public", relativePath);

        if (!fs.existsSync(filePath)) {
          next();
          return;
        }

        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(fs.readFileSync(filePath, "utf8"));
      });
    },
  };
}
