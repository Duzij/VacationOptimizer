import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const blogDir = path.join(projectRoot, "public", "blog");
const stylesheets = ["site-shell.css", "site-shell-colors.css"];
const versions = new Map();

for (const stylesheet of stylesheets) {
  const stylesheetPath = path.join(projectRoot, "public", stylesheet);
  const content = await fs.readFile(stylesheetPath);
  versions.set(
    stylesheet,
    crypto.createHash("sha256").update(content).digest("hex").slice(0, 8),
  );
}

let updated = 0;
for (const htmlPath of await collectHtmlFiles()) {
  let html = await fs.readFile(htmlPath, "utf8");
  let changed = false;

  for (const stylesheet of stylesheets) {
    const version = versions.get(stylesheet);
    const pattern = new RegExp(`/${stylesheet.replace(".", "\\.")}(?:\\?v=[A-Za-z0-9_-]+)?(?=")`, "g");
    const replacement = `/${stylesheet}?v=${version}`;
    if (pattern.test(html) && !html.includes(replacement)) {
      html = html.replace(pattern, replacement);
      changed = true;
    }
    pattern.lastIndex = 0;
  }

  if (changed) {
    await fs.writeFile(htmlPath, html, "utf8");
    updated++;
  }
}

console.log(`Updated stylesheet cache versions in ${updated} HTML files.`);

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
