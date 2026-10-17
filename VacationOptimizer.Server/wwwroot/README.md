# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## site-shell.css cache busting

`public/site-shell.css` is served outside the Vite bundle (it has no content hash), so browsers/CDNs would otherwise keep serving a stale copy for up to 5 minutes. To avoid that, every reference to it in HTML carries a version postfix:

```html
<link rel="stylesheet" href="/site-shell.css?v=a1b2c3d4" />
```

The postfix is an 8-character hash of the CSS file content, so the URL changes whenever the stylesheet actually changes.

Run `npm run bump:shell-css` after editing `public/site-shell.css`. It recalculates the hash and rewrites all references (`index.html` plus generated files under `public/blog/`). It is idempotent — running it again without CSS changes does nothing.

The script also runs automatically at the start of `npm run build` / `npm run build_prod`, so production deployments always get a fresh postfix.

## Blog posts and translations

Add English posts to `content/blog/` as Markdown with YAML frontmatter. The `language` field is optional and defaults to `en`. For an optional translated edition, add another Markdown file with a unique `slug`, set `language` to its BCP 47 tag (for example, `es`), and set `translationOf` to the English edition's slug:

```yaml
slug: "aprovechar-vacaciones-espana-2027"
language: es
translationOf: "maximize-your-pto-in-spain-in-2027"
```

Repeat this for as many languages as the post needs. Posts do not need translations. The build creates a static page for every edition, links available editions on each page, and adds reciprocal `hreflang` metadata. `/blog/`, `/blog/index.json`, and the agent-facing blog index list English editions only; every edition is included in the sitemap. The generator checks that translation references point to an English post and that each edition has a unique slug and language.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
