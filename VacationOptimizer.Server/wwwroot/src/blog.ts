import matter from "gray-matter";
import MarkdownIt from "markdown-it";

export interface BlogPost {
  title: string;
  date: string;
  author: string;
  slug: string;
  language: string;
  translationOf?: string;
  summary: string;
  tags: string[];
  html: string;
}

const blogMarkdownFiles = import.meta.glob("../content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
});

const blogPosts = Object.entries(blogMarkdownFiles)
  .map(([filePath, source]) => parseBlogPost(filePath, source))
  .sort((a, b) => b.date.localeCompare(a.date));

export function getAllBlogPosts() {
  return blogPosts;
}

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug) ?? null;
}

function parseBlogPost(filePath: string, source: string): BlogPost {
  const { data } = matter(source);
  const fileName = filePath.split("/").pop() ?? filePath;
  const content = normalizeStringField(data.content, "content", fileName);

  return {
    title: normalizeStringField(data.title, "title", fileName),
    date: normalizeDateField(data.date, fileName),
    author: normalizeStringField(data.author, "author", fileName),
    slug: normalizeStringField(data.slug, "slug", fileName),
    language: normalizeLanguage(data.language, fileName),
    translationOf: normalizeOptionalStringField(data.translationOf, "translationOf", fileName),
    summary: normalizeStringField(data.summary, "summary", fileName),
    tags: normalizeTags(data.tags, fileName),
    html: markdown.render(content),
  };
}

function normalizeLanguage(value: unknown, fileName: string) {
  if (value === undefined || value === null || value === "") {
    return "en";
  }

  const language = normalizeStringField(value, "language", fileName);
  try {
    return Intl.getCanonicalLocales(language)[0] ?? "en";
  } catch {
    throw new Error(`Blog post ${fileName} must provide a valid BCP 47 language tag.`);
  }
}

function normalizeOptionalStringField(value: unknown, fieldName: string, fileName: string) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return normalizeStringField(value, fieldName, fileName);
}

function normalizeStringField(value: unknown, fieldName: string, fileName: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Blog post ${fileName} is missing required string field "${fieldName}".`);
  }

  return value.trim();
}

function normalizeDateField(value: unknown, fileName: string) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return normalizeStringField(value, "date", fileName);
}

function normalizeTags(value: unknown, fileName: string) {
  if (!Array.isArray(value) || value.some((tag) => typeof tag !== "string" || !tag.trim())) {
    throw new Error(`Blog post ${fileName} must provide a non-empty string array for "tags".`);
  }

  return value.map((tag) => tag.trim());
}
