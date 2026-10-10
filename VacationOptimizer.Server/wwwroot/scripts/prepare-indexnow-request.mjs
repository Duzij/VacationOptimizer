import { readFileSync } from "node:fs";

const host = "longvacation.eu";
const key = "5d2b211542e04e0693b6f60033c208d4";
const sitemapPath = new URL("../public/sitemap.xml", import.meta.url);
const sitemap = readFileSync(sitemapPath, "utf8");

if (!/<urlset(?:\s|>)/.test(sitemap)) {
  throw new Error(`Expected a sitemap urlset in ${sitemapPath.pathname}`);
}

const urls = [
  ...sitemap.matchAll(/<loc>([\s\S]*?)<\/loc>/g),
].map(([, value]) => value.trim());

if (urls.length === 0) {
  throw new Error(`No URLs found in ${sitemapPath.pathname}`);
}

const uniqueUrls = [...new Set(urls)];
for (const url of uniqueUrls) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || parsed.hostname !== host) {
    throw new Error(`Unexpected URL in sitemap: ${url}`);
  }
}

const payload = {
  host,
  key,
  keyLocation: `https://${host}/${key}.txt`,
  urlList: uniqueUrls,
};

process.stdout.write(`${JSON.stringify(payload)}\n`);
