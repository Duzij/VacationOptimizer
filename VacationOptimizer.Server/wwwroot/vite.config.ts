import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
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
      inlineBundledCss(),
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
      const siteShellPath = path.resolve(process.cwd(), "public", "site-shell.css");
      const siteShellCss = fs.readFileSync(siteShellPath, "utf8");
      const siteShellLink = /<link\s+rel="stylesheet"\s+href="\/site-shell\.css\?v=[^"]+"\s*\/>/;

      return html
        .replace(siteShellLink, `<style data-site-shell>${siteShellCss}</style>`)
        .replace("<!-- static-footer -->", footerHtml);
    },
  };
}

function inlineBundledCss(): Plugin {
  return {
    name: "inline-bundled-css",
    apply: "build",
    enforce: "post",
    generateBundle(_options, bundle) {
      const htmlAsset = bundle["index.html"];
      if (htmlAsset?.type !== "asset") {
        return;
      }

      htmlAsset.source = String(htmlAsset.source).replace(/<link\b[^>]*rel="stylesheet"[^>]*>/g, (link) => {
        const href = link.match(/\bhref="([^"]+)"/)?.[1];
        const fileName = href?.replace(/^\//, "");
        const cssAsset = fileName ? bundle[fileName] : undefined;

        if (!fileName || cssAsset?.type !== "asset" || !fileName.endsWith(".css")) {
          return link;
        }

        delete bundle[fileName];
        return `<style data-inline-css="${fileName}">${String(cssAsset.source)}</style>`;
      });
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
