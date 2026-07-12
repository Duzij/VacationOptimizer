import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";

const projectRoot = process.cwd();
const isDev = process.env.npm_lifecycle_event === "predev" || process.env.NODE_ENV === "development";
let mainCssAsset = null;

try {
  const manifestPath = path.join(projectRoot, "dist", ".vite", "manifest.json");
  const manifestExists = await fs.access(manifestPath).then(() => true).catch(() => false);

  if (manifestExists && !isDev) {
    const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
    const values = Object.values(manifest);
    const mainEntry = values.find((entry) => entry?.isEntry) ?? values[0];
    mainCssAsset = mainEntry?.css?.[0] ?? null;
  }
} catch (error) {
  if (!isDev) {
    console.warn("Vite manifest not available; skipping generated stylesheet link.", error.message);
  }
}

const sourceDir = path.join(projectRoot, "content", "blog");
const outputDir = path.join(projectRoot, "public", "blog");
const indexHtmlPath = path.join(projectRoot, "index.html");
const siteDataPath = path.join(projectRoot, "src", "site-shell-data.json");
const siteUrl = "https://longvacation.eu";
const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
});

await generateStaticBlog();

async function generateStaticBlog() {
  const siteData = JSON.parse(await fs.readFile(siteDataPath, "utf8"));
  const posts = await loadBlogPosts();
  const appIndexHtml = await fs.readFile(indexHtmlPath, "utf8");

  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  await fs.writeFile(
    path.join(outputDir, "index.html"),
    renderBlogIndexPage(posts, appIndexHtml, siteData),
    "utf8",
  );
  await fs.writeFile(
    path.join(outputDir, "index.json"),
    JSON.stringify({
      posts: posts.map(({ html, ...post }) => post),
    }, null, 2),
    "utf8",
  );

  await Promise.all(
    posts.map(async (post) => {
      const postDir = path.join(outputDir, post.slug);
      await fs.mkdir(postDir, { recursive: true });
      await fs.writeFile(
        path.join(postDir, "index.html"),
        renderBlogPostPage(post, appIndexHtml, siteData),
        "utf8",
      );
    }),
  );

  // Generate sitemap
  const publicDir = path.join(projectRoot, "public");
  await generateSitemap(posts, publicDir);
}

async function loadBlogPosts() {
  const fileNames = (await fs.readdir(sourceDir))
    .filter((fileName) => fileName.endsWith(".md"))
    .sort();

  const posts = await Promise.all(fileNames.map(loadBlogPostFromFile));
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

async function loadBlogPostFromFile(fileName) {
  const fullPath = path.join(sourceDir, fileName);
  const source = await fs.readFile(fullPath, "utf8");
  const { data } = matter(source);
  const content = requireString(data.content, "content", fileName);

  return {
    title: requireString(data.title, "title", fileName),
    date: normalizeDate(data.date, fileName),
    author: requireString(data.author, "author", fileName),
    slug: requireString(data.slug, "slug", fileName),
    summary: requireString(data.summary, "summary", fileName),
    tags: requireStringArray(data.tags, "tags", fileName),
    html: markdown.render(content),
  };
}

function requireString(value, fieldName, fileName) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Blog post ${fileName} is missing required string field "${fieldName}".`);
  }

  return value.trim();
}

function normalizeDate(value, fileName) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return requireString(value, "date", fileName);
}

function requireStringArray(value, fieldName, fileName) {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string" || !entry.trim())) {
    throw new Error(`Blog post ${fileName} must provide a non-empty string array for "${fieldName}".`);
  }

  return value.map((entry) => entry.trim());
}

function renderBlogIndexPage(posts, appIndexHtml, siteData) {
  const cards = posts.map((post) => `
    <article class="blog-card">
      <div class="blog-meta">
        <time datetime="${escapeHtml(post.date)}">${escapeHtml(formatDate(post.date))}</time>
        <span aria-hidden="true">•</span>
        <span>${escapeHtml(post.author)}</span>
      </div>
      <div class="stack-sm">
        <h2 class="blog-card-title">
          <a href="/blog/${encodeURIComponent(post.slug)}/">${escapeHtml(post.title)}</a>
        </h2>
        <p class="blog-summary">${escapeHtml(post.summary)}</p>
      </div>
      <div class="blog-tags">${post.tags.map(renderTag).join("")}</div>
      <div class="blog-toolbar">
        <a class="action-btn action-btn-primary" href="/blog/${encodeURIComponent(post.slug)}/">
          Read more
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  `).join("");

  return renderDocument({
    appIndexHtml,
    title: "Blog | Vacation Optimizer",
    description: "Read planning tips, product notes, and country-aware vacation guidance from Vacation Optimizer.",
    canonicalPath: "/blog/",
    body: `
      <div class="blog-shell">
        ${renderSiteHeader(siteData)}
        <main class="blog-page">
          <section class="stack-lg">
            <div class="blog-hero stack-sm">
              <h1>Blog</h1>
              <p>Product notes, planning tips, and country-aware vacation guidance published as static HTML for fast delivery and search-friendly indexing.</p>
            </div>
            <div class="blog-post-grid">${cards}</div>
          </section>
        </main>
        ${renderSiteFooter(siteData)}
      </div>
      <script>
        // Theme toggle
        document.querySelectorAll(".site-theme-toggle").forEach(btn => {
          btn.addEventListener("click", () => {
            const isDark = document.documentElement.classList.toggle("dark");
            document.documentElement.classList.toggle("light", !isDark);
            try { localStorage.setItem("theme", isDark ? "dark" : "light"); } catch(e) {}
          });
        });

        // Mobile menu toggle
        const hamburger = document.querySelector(".site-hamburger");
        const mobileMenu = document.querySelector(".site-mobile-menu");
        hamburger?.addEventListener("click", () => {
          const isExpanded = mobileMenu.getAttribute("aria-hidden") === "false";
          mobileMenu.setAttribute("aria-hidden", isExpanded ? "true" : "false");
          hamburger.setAttribute("aria-expanded", isExpanded ? "false" : "true");
        });
      </script>
    `,
  });
}

function renderBlogPostPage(post, appIndexHtml, siteData) {
  return renderDocument({
    appIndexHtml,
    title: `${post.title} | Vacation Optimizer`,
    description: post.summary,
    canonicalPath: `/blog/${post.slug}/`,
    body: `
      <div class="blog-shell">
        ${renderSiteHeader(siteData)}
        <main class="blog-page blog-page--post">
          <section class="stack-lg">
            <div class="blog-post-actions">
              <a class="action-btn action-btn-secondary" href="/blog/">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left" aria-hidden="true"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                Back to all posts
              </a>
              <button class="action-btn action-btn-secondary" type="button" data-share-button>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-share" aria-hidden="true"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
                Share
              </button>
            </div>
            <header class="stack-sm">
              <div class="blog-meta">
                <time datetime="${escapeHtml(post.date)}">${escapeHtml(formatDate(post.date))}</time>
                <span aria-hidden="true">•</span>
                <span>${escapeHtml(post.author)}</span>
              </div>
              <h1>${escapeHtml(post.title)}</h1>
              <p class="blog-summary blog-summary--large">${escapeHtml(post.summary)}</p>
              <div class="blog-tags">${post.tags.map(renderTag).join("")}</div>
            </header>
            <article class="blog-post-content">
              ${post.html}
            </article>
          </section>
        </main>
        ${renderSiteFooter(siteData)}
      </div>
      <script>
        // Theme toggle
        document.querySelectorAll(".site-theme-toggle").forEach(btn => {
          btn.addEventListener("click", () => {
            const isDark = document.documentElement.classList.toggle("dark");
            document.documentElement.classList.toggle("light", !isDark);
            try { localStorage.setItem("theme", isDark ? "dark" : "light"); } catch(e) {}
          });
        });

        const button = document.querySelector("[data-share-button]");
        button?.addEventListener("click", async () => {
          try {
            if (navigator.share) {
              await navigator.share({
                title: ${JSON.stringify(post.title)},
                text: ${JSON.stringify(post.summary)},
                url: window.location.href
              });
              return;
            }
            await navigator.clipboard.writeText(window.location.href);
            button.textContent = "Link copied";
          } catch {}
        });
        
        // Mobile menu toggle
        const hamburger = document.querySelector(".site-hamburger");
        const mobileMenu = document.querySelector(".site-mobile-menu");
        hamburger?.addEventListener("click", () => {
          const isExpanded = mobileMenu.getAttribute("aria-hidden") === "false";
          mobileMenu.setAttribute("aria-hidden", isExpanded ? "true" : "false");
          hamburger.setAttribute("aria-expanded", isExpanded ? "false" : "true");
        });
      </script>
    `,
  });
}

function renderSiteHeader(siteData) {
  const desktopLinks = siteData.navLinks.map((link) => {
    const isActive = link.href === "/blog/" ? " site-nav-pill--active" : "";
    return `<a class="site-nav-pill${isActive}" href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`;
  }).join("\n          ");

  const mobileLinks = siteData.navLinks.map((link) => {
    const isActive = link.href === "/blog/" ? " site-nav-pill--active" : "";
    return `<a class="site-nav-pill site-nav-pill--mobile${isActive}" href="${escapeHtml(link.href)}"><span>${escapeHtml(link.label)}</span></a>`;
  }).join("\n          ");

  return `
    <header class="site-header-shell blog-site-header">
      <div class="site-header-shell__inner">
        <div class="site-header__row">
          <a class="site-brand" href="/">
            <svg class="site-brand__mark" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8h2l1-1 1 1h4"></path><path d="M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5h-3l-1-1-1 1h-3"></path><path d="M5.89 9.71c-2.15 2.15-2.3 5.47-.35 7.43l4.24-4.25.7-.7.71-.71 2.12-2.12c-1.95-1.96-5.27-1.8-7.42.35"></path><path d="M11 15.5c.5 2.5-.17 4.5-1 6.5h4c2-5.5-.5-12-1-14"></path></svg>
            <span class="site-brand__label">${escapeHtml(siteData.brandName)}</span>
          </a>
          
          <nav class="site-nav-shell site-nav-shell--desktop" aria-label="Primary">
            ${desktopLinks}
          </nav>

          <button class="site-theme-toggle site-theme-toggle--desktop" type="button" aria-label="Toggle dark mode">
            <svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            <svg class="icon-moon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          </button>
          
          <button class="site-hamburger" aria-expanded="false" aria-controls="mobile-site-menu" aria-label="Toggle navigation menu">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
        </div>
        
        <nav id="mobile-site-menu" class="site-mobile-menu" aria-hidden="true" aria-label="Mobile">
          ${mobileLinks}
          <div style="display: flex; align-items: center; justify-content: space-between; border: 1px solid var(--color-border); border-radius: 1rem; padding: 0.75rem 1rem;">
            <span style="font-size: 0.875rem; font-weight: 500; color: var(--color-text-muted);">Theme</span>
            <button class="site-theme-toggle site-theme-toggle--mobile" type="button" aria-label="Toggle dark mode" style="margin: 0;">
              <svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              <svg class="icon-moon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </button>
          </div>
        </nav>
      </div>
    </header>
  `;
}

function renderSiteFooter(siteData) {
  const links = siteData.footerLinks.map((link) => {
    return `<a class="site-nav-pill text-text-muted" href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`;
  }).join("\n          ");

  return `
    <footer class="site-footer-shell">
      <div class="site-footer-shell__inner">
        <span>${escapeHtml(siteData.brandName)} · ${new Date().getFullYear()}</span>
        <nav class="site-footer-nav-shell" aria-label="Footer">
          ${links}
        </nav>
      </div>
    </footer>
  `;
}

function renderTag(tag) {
  return `<span class="blog-tag">${escapeHtml(tag)}</span>`;
}

function renderDocument({ appIndexHtml, title, description, canonicalPath, body }) {
  const canonicalUrl = `${siteUrl}${canonicalPath}`;
  const head = buildHeadFromAppIndex(appIndexHtml, { title, description, canonicalUrl });

  return `<!DOCTYPE html>
<html lang="en">
  <head>
${head}
    <script>
      (function() {
        try {
          var isDark = localStorage.theme === "dark" || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
          if (isDark) document.documentElement.classList.add("dark");
        } catch (e) {}
      })();
    </script>
  </head>
  <body>
    <div id="root">
${body}
    </div>
  </body>
</html>`;
}

function buildHeadFromAppIndex(appIndexHtml, { title, description, canonicalUrl }) {
  const headMatch = appIndexHtml.match(/<head>([\s\S]*?)<\/head>/i);
  if (!headMatch) {
    throw new Error("Could not locate <head> in index.html.");
  }

  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    name: title,
    description,
    url: canonicalUrl,
    publisher: {
      "@type": "Organization",
      name: "Vacation Optimizer",
      url: siteUrl,
    },
    image: "https://longvacation.eu/icons/icon-512.png",
  }, null, 2);

  var allHeadContent = headMatch[1]
      .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
      .replace(/<meta name="description"[\s\S]*?\/>/i, `<meta name="description" content="${escapeHtml(description)}" />`)
      .replace(/<link rel="canonical"[\s\S]*?\/>/i, `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`)
      .replace(/<meta property="og:url"[\s\S]*?\/>/i, `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`)
      .replace(/<meta property="og:title"[\s\S]*?\/>/i, `<meta property="og:title" content="${escapeHtml(title)}" />`)
      .replace(/<meta property="og:description"[\s\S]*?\/>/i, `<meta property="og:description" content="${escapeHtml(description)}" />`)
      .replace(/<meta name="twitter:title"[\s\S]*?\/>/i, `<meta name="twitter:title" content="${escapeHtml(title)}" />`)
      .replace(/<meta name="twitter:description"[\s\S]*?\/>/i, `<meta name="twitter:description" content="${escapeHtml(description)}" />`)
      .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, `<script type="application/ld+json">\n${structuredData}\n  </script>`)
      .replace(/\s*<script type="module" src="\/src\/main\.tsx" defer><\/script>/i, "") + (mainCssAsset ? `\n  <link rel="stylesheet" href="/${mainCssAsset}">` : "")
      .trim()
      .split("\n")
      .map((line) => `  ${line}`)
      .join("\n");

  return allHeadContent;
}

function formatDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function generateSitemap(posts, publicDir) {
  const BASE_URL = "https://longvacation.eu";
  const today = new Date().toISOString().split("T")[0];

  const staticPages = [
    { loc: "/", changefreq: "weekly", priority: "1.0", lastmod: today },
    { loc: "/about/", changefreq: "monthly", priority: "0.8", lastmod: today },
    { loc: "/contact/", changefreq: "monthly", priority: "0.7", lastmod: today },
    { loc: "/privacy/", changefreq: "monthly", priority: "0.6", lastmod: today },
    { loc: "/terms/", changefreq: "monthly", priority: "0.6", lastmod: today },
    { loc: "/app/", changefreq: "weekly", priority: "0.9", lastmod: today },
  ];

  function urlEntry(loc, lastmod, changefreq, priority) {
    return `<url>
<loc>${BASE_URL}${loc}</loc>
<lastmod>${lastmod}</lastmod>
<changefreq>${changefreq}</changefreq>
<priority>${priority}</priority>
</url>`;
  }

  const staticEntries = staticPages.map(p => urlEntry(p.loc, p.lastmod, p.changefreq, p.priority));
  const blogIndexEntry = urlEntry("/blog/", today, "weekly", "0.8");
  const postEntries = posts.map(p => urlEntry(`/blog/${p.slug}/`, p.date, "monthly", "0.6"));

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, blogIndexEntry, ...postEntries].join("\n")}
</urlset>`;

  await fs.mkdir(publicDir, { recursive: true });
  await fs.writeFile(path.join(publicDir, "sitemap.xml"), sitemap, "utf8");
}
