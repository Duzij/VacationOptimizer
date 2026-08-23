import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const cssPath = path.join(projectRoot, "public", "site-shell.css");
const blogDir = path.join(projectRoot, "public", "blog");
const referencePattern = /\/site-shell\.css(?:\?v=[A-Za-z0-9_-]+)?(?=")/g;

const cssContent = await fs.readFile(cssPath);
const version = crypto.createHash("sha256").update(cssContent).digest("hex").slice(0, 8);
const replacement = `/site-shell.css?v=${version}`;

let updated = 0;
let alreadyCurrent = 0;
let skipped = 0;

for (const htmlPath of await collectHtmlFiles()) {
  const html = await fs.readFile(htmlPath, "utf8");
  if (!html.match(referencePattern)) {
    skipped++;
    continue;
  }

  if (html.includes(replacement)) {
    alreadyCurrent++;
    continue;
  }

  await fs.writeFile(htmlPath, html.replace(referencePattern, replacement), "utf8");
  console.log(`Updated ${path.relative(projectRoot, htmlPath)} -> ${replacement}`);
  updated++;
}

console.log(
  `site-shell.css cache buster: v=${version} (${updated} updated, ${alreadyCurrent} up to date, ${skipped} without reference)`,
);

async function collectHtmlFiles() {
  return [path.join(projectRoot, "index.html"), ...(await walk(blogDir))];

  async function walk(dir) {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return [];
    }

    const files = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          return walk(fullPath);
        }
        return entry.isFile() && entry.name.endsWith(".html") ? [fullPath] : [];
      }),
    );

    return files.flat();
  }
}
