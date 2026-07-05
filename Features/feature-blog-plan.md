# Feature: Static Blog Section

## Overview
Add a lightweight, static Blog section to the public site to publish product updates, tips, and country-specific notes. No admin UI — posts are static files managed in the repo.

## Goals
- Provide a discoverable Blog landing page listing posts.
- Render individual posts with consistent styling and metadata.
- Keep content as repo-managed Markdown files with simple YAML frontmatter.
- Integrate build-time processing (or client-side static rendering) into existing frontend pipeline.

## Non-Goals
- No admin/editor UI or CMS integration in v1.
- No dynamic user comments or authentication for posts.

## Requirements
- Content location: `wwwroot/content/blog/` inside the frontend project.
- File format: Markdown (`.md`) with required frontmatter fields: `title`, `date` (ISO), `author`, `slug`, `summary`, `tags`.
- Filename convention: `YYYY-MM-DD-canonical-slug.md` where canonical slug is lowercase, alphanumeric with hyphens, non-alphanumerics removed.
- Routing: `/blog` (list) and `/blog/<slug>` (post view). Slug matches frontmatter `slug` or filename-derived canonical slug.
- No admin: authors add `.md` files and open PRs for content.

## Content format (YAML frontmatter example)
```
---
title: "My Post Title"
date: 2026-07-05
author: "Team"
slug: "my-post-title"
summary: "Short summary"
tags: [announcement, tips]
---
```

## Frontend components
- `BlogList` — reads post index (generated at build or fetched from static JSON), shows title, date, summary, tags, link to post.
- `BlogPost` — renders single post (HTML generated from Markdown). Shows metadata (title, date, author), content, and canonical link/meta tags.
- Small CSS/utility for readable post layout (typography, code blocks, images).

## Build / Integration
Options (choose based on current frontend stack):
- Preferred: Build-time MD → HTML conversion using existing Vite/tsc pipeline producing a small JSON index and pre-rendered HTML/MD content files under `wwwroot/`.
- Alternative: Client-side fetch + markdown-it renderer reading raw `.md` files from `content/blog/` at runtime (simpler, but may expose raw sources and cost runtime parsing).
- Generate a `content/blog/index.json` at build containing metadata and path to rendered HTML or raw markdown.

## SEO & Meta
- Each `BlogPost` page must include `title`, `description` (from `summary`), `canonical` URL, and Open Graph tags (og:title, og:description, og:url, og:image optional).
- Sitemap: update or provide instructions for adding `/blog` entries to the sitemap during deployment.

## Accessibility & Responsiveness
- Ensure headings use semantic HTML and images include `alt` text.
- Support keyboard navigation and readable contrast for code blocks and content.
- Mobile-friendly layout consistent with site styles.

## Tests
- Unit tests for `BlogList` and `BlogPost` components (rendering metadata and content).
- Integration test for routing: landing at `/blog` and navigating to a post.

## Acceptance Criteria
- Visiting `/blog` lists available posts with title, date, and summary.
- Clicking a post opens `/blog/<slug>` and displays the rendered post with metadata and at least minimal styling.
- Content authors can add a new `.md` file following the conventions and see it listed after a build.

## Implementation plan & milestones
1. Finalize requirements and choose build vs runtime rendering (decision point).
2. Implement content parsing and `index.json` generator (or runtime loader).
3. Implement `BlogList` and `BlogPost` components and routes.
4. Add SEO/meta tag rendering and sitemap instructions.
5. Add tests and accessibility checks.
6. Document contributor guidelines for adding posts.

## Notes
- Keep content behind the existing static asset pipeline so deployment remains simple.
- If later desired, add a CI step to validate frontmatter and slug formatting on PRs.


---
Created: 2026-07-05
Author: Vacation Optimizer Team
