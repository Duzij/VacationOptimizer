# Feature: Optional multilingual blog posts

Status: completed

## Goal

Let selected blog posts have English and one or more translated editions. Posts without translations remain unchanged, and English stays the default language.

## Requirements

- Keep Markdown files in `wwwroot/content/blog/`; each language edition is an individual file with its own unique slug.
- `language` is optional and defaults to `en`. A translated edition declares its language and references its English edition, allowing any number of translations without requiring every post to be translated.
- Build one static HTML page per Markdown file, with a visible link to available language editions and reciprocal `hreflang` metadata.
- Keep the blog landing page, generated JSON index, and agent-facing index in English. Each English-language article appears once; translated pages remain directly accessible and are included in the sitemap.
- Preserve a self-referencing canonical URL for each edition. Set the rendered document language to the edition's language.
- Reject duplicate slugs, missing English source posts, and multiple editions in the same language for one post during generation.

## Author workflow

Add the English Markdown post as usual. For each translation, add another Markdown file with its own slug, set `language` to its BCP 47 language tag (for example, `es`), and set `translationOf` to the English post's slug. Build generation creates all pages and language links; translations do not need to be added to the English index by hand.

## Non-goals

- No translation service or automatic translation.
- No requirement to translate every post or the blog index.
- No language-specific blog index in this feature.
