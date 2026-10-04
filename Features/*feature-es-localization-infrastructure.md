# TODO: Feature: URL-Based Spanish Localization Infrastructure

## Overview

Implement URL-based localization for a React/Vite SPA hosted by ASP.NET Core behind Nginx.

Spanish is the sample additional language. The application supports:

- English: `en`
- Spanish: `es`

Every localized application URL carries its language prefix:

```text
/en
/en/about
/es
/es/about
```

The URL is the authoritative language source for page routing and i18next initialization.

The infrastructure provides:

- Vite-built, hashed locale JSON assets.
- `i18next-http-backend` for loading locale resources.
- Path-based i18next language detection.
- React Router language parameters.
- ASP.NET Core HTML-shell delivery with per-request SEO metadata.
- Canonical URLs and reciprocal `hreflang` links.
- Correct `<html lang>` and `dir` attributes.
- Real HTTP `404` responses for unsupported language prefixes and invalid application routes.
- Nginx HTTPS/host canonicalization.
- Nginx immutable caching for Vite assets.
- Protection against routing missing JSON/JS/CSS requests into `index.html`.
- `/` language negotiation using a language cookie and `Accept-Language`.
- Language switching that preserves the current route.
- API `Accept-Language` propagation from the resolved i18next language.

---

## 1. Target architecture

```text
Browser
  |
  | HTTPS
  v
Nginx
  |
  +-- /assets/* --------------------> Vite static assets
  |                                    Cache-Control: immutable
  |
  +-- /robots.txt, /sitemap.xml ----> static files
  |
  +-- all application URLs ---------> ASP.NET Core :5000
                                         |
                                         +-- /             -> 302 /en or /es
                                         |
                                         +-- /en/...       -> HTML 200
                                         |
                                         +-- /es/...       -> HTML 200
                                         |
                                         +-- /xx/...       -> HTML 404
                                         |
                                         +-- invalid route -> HTML 404
```

The Vite build is a single build shared by every locale. The language prefix is part of the application URL, not the Vite asset base path.

---

## 2. Repository structure

```text
.
├── src/
│   ├── app/
│   │   └── router.tsx
│   ├── components/
│   │   └── LanguageSwitcher.tsx
│   ├── locales/
│   │   ├── en/
│   │   │   └── common.json
│   │   └── es/
│   │       └── common.json
│   ├── i18n.ts
│   ├── main.tsx
│   └── vite-env.d.ts
├── public/
│   ├── robots.txt
│   └── sitemap.xml
├── wwwroot/
│   └── index.html
├── Program.cs
├── nginx/
│   └── site.conf
├── vite.config.ts
├── package.json
└── tsconfig.json
```

The Vite output directory is:

```text
dist/
```

ASP.NET Core serves the generated HTML shell from its deployed web root.

---

# 3. Supported languages

Create one authoritative language list.

For the sample implementation:

```csharp
// Program.cs
var supportedLanguages = new[] { "en", "es" };
const string defaultLanguage = "en";
```

The corresponding frontend list is generated from the actual locale assets:

```text
src/locales/en/common.json
src/locales/es/common.json
```

Language codes are lower-case BCP 47 primary language tags.

---

# 4. Vite implementation

## 4.1 `vite.config.ts`

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',

  plugins: [
    react(),
  ],

  build: {
    outDir: 'dist',
    manifest: true,
    sourcemap: false,

    assetsInlineLimit: (filePath) => {
      if (filePath.endsWith('.json')) {
        return false;
      }

      return undefined;
    },
  },

  server: {
    port: 5173,
  },
});
```

### Configuration rules

`base` remains `/`.

The language prefix is a router concern:

```text
/es/about
```

while the built assets remain under:

```text
/assets/...
```

Locale JSON is explicitly prevented from becoming an inline `data:` URI by both:

- the `assetsInlineLimit` JSON exception, and
- the `?no-inline` import used by `i18next`.

---

# 5. Package dependencies

Install:

```bash
npm install i18next i18next-http-backend i18next-browser-languagedetector react-i18next react-router-dom
npm install -D vite @vitejs/plugin-react typescript
```

`i18next-http-backend` is the backend used by the application.

---

# 6. Locale resources

## 6.1 `src/locales/en/common.json`

```json
{
  "app": {
    "title": "Example application"
  },
  "navigation": {
    "home": "Home",
    "about": "About",
    "language": "Language"
  },
  "home": {
    "heading": "Welcome",
    "description": "This is the English home page."
  },
  "about": {
    "heading": "About",
    "description": "This page describes the application."
  },
  "errors": {
    "notFoundTitle": "Page not found",
    "notFoundDescription": "The requested page does not exist."
  }
}
```

## 6.2 `src/locales/es/common.json`

```json
{
  "app": {
    "title": "Aplicación de ejemplo"
  },
  "navigation": {
    "home": "Inicio",
    "about": "Acerca de",
    "language": "Idioma"
  },
  "home": {
    "heading": "Bienvenido",
    "description": "Esta es la página de inicio en español."
  },
  "about": {
    "heading": "Acerca de",
    "description": "Esta página describe la aplicación."
  },
  "errors": {
    "notFoundTitle": "Página no encontrada",
    "notFoundDescription": "La página solicitada no existe."
  }
}
```

---

# 7. i18next implementation

## 7.1 `src/i18n.ts`

```ts
import i18n from 'i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

const localeUrls = import.meta.glob(
  './locales/*/*.json',
  {
    query: '?url&no-inline',
    import: 'default',
    eager: true,
  }
) as Record<string, string>;

export const SUPPORTED_LANGS = [
  ...new Set(
    Object.keys(localeUrls).map(
      (key) => key.split('/')[2] as string
    )
  ),
].sort();

export const DEFAULT_LANGUAGE = 'en';

export function localeAssetUrl(
  language: string,
  namespace: string
): string {
  const key = `./locales/${language}/${namespace}.json`;
  const url = localeUrls[key];

  if (!url) {
    throw new Error(`Missing locale asset: ${key}`);
  }

  return url;
}

void i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: SUPPORTED_LANGS,

    fallbackLng: DEFAULT_LANGUAGE,

    load: 'languageOnly',

    ns: ['common'],
    defaultNS: 'common',

    returnEmptyString: false,

    maxRetries: 1,
    retryTimeout: 350,

    detection: {
      order: ['path'],
      lookupFromPathIndex: 0,
      caches: [],
    },

    backend: {
      loadPath: (languages: string[], namespaces: string[]) =>
        localeAssetUrl(
          languages[0],
          namespaces[0]
        ),
    },

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

### Important behavior

Only the URL path is used for language detection:

```ts
order: ['path']
```

The detector must not prioritize:

- cookies,
- `localStorage`,
- browser language,
- arbitrary navigator state.

Those inputs can still be used for `/` negotiation at the server boundary, but an already localized URL controls its own language.

For example:

```text
/es/about -> i18next language = es
```

---

# 8. React Router implementation

## 8.1 `src/app/router.tsx`

```tsx
import {
  Link,
  Outlet,
  useParams,
} from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n, {
  SUPPORTED_LANGS,
} from '../i18n';

function isSupportedLanguage(value: string | undefined): value is string {
  return !!value && SUPPORTED_LANGS.includes(value);
}

export function LanguageLayout() {
  const { lang } = useParams();
  const { t } = useTranslation();

  useEffect(() => {
    if (!lang || !isSupportedLanguage(lang)) {
      return;
    }

    if (i18n.resolvedLanguage !== lang) {
      void i18n.changeLanguage(lang);
    }

    document.documentElement.lang = lang;
    document.documentElement.dir =
      ['ar', 'he', 'fa', 'ur'].includes(lang) ? 'rtl' : 'ltr';
  }, [lang]);

  if (!isSupportedLanguage(lang)) {
    return <NotFound />;
  }

  return (
    <Suspense fallback={<div>Loading…</div>}>
      <nav aria-label={t('navigation.language')}>
        <Link to={`/${lang}`}>
          {t('navigation.home')}
        </Link>{' '}
        <Link to={`/${lang}/about`}>
          {t('navigation.about')}
        </Link>
      </nav>

      <Outlet />
    </Suspense>
  );
}

export function Home() {
  const { t } = useTranslation();

  return (
    <main>
      <h1>{t('home.heading')}</h1>
      <p>{t('home.description')}</p>
    </main>
  );
}

export function About() {
  const { t } = useTranslation();

  return (
    <main>
      <h1>{t('about.heading')}</h1>
      <p>{t('about.description')}</p>
    </main>
  );
}

export function NotFound() {
  const { t } = useTranslation();

  return (
    <main>
      <h1>{t('errors.notFoundTitle')}</h1>
      <p>{t('errors.notFoundDescription')}</p>
    </main>
  );
}
```

For a production React Router configuration, define routes explicitly:

```tsx
import {
  BrowserRouter,
  Route,
  Routes,
} from 'react-router-dom';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/:lang" element={<LanguageLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

This keeps the browser router aligned with the server URL contract.

---

# 9. Application entry point

## `src/main.tsx`

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  BrowserRouter,
  Route,
  Routes,
} from 'react-router-dom';

import './i18n';

import {
  LanguageLayout,
  Home,
  About,
  NotFound,
} from './app/router';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/:lang"
          element={<LanguageLayout />}
        >
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(
  document.getElementById('root')!
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

For an existing application, merge the language layout into the existing router rather than maintaining two independent routers.

---

# 10. Language switcher

The language switcher preserves the current non-language path.

## `src/components/LanguageSwitcher.tsx`

```tsx
import {
  Link,
  useLocation,
  useParams,
} from 'react-router-dom';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
];

export function LanguageSwitcher() {
  const location = useLocation();
  const { lang } = useParams();

  const pathname = location.pathname;

  const withoutLanguage =
    pathname === `/${lang}`
      ? ''
      : pathname.replace(
          new RegExp(`^/${lang}(?=/|$)`),
          ''
        );

  return (
    <nav aria-label="Language">
      {languages.map((language) => (
        <Link
          key={language.code}
          to={`/${language.code}${withoutLanguage}`}
          hrefLang={language.code}
          lang={language.code}
        >
          {language.label}
        </Link>
      ))}
    </nav>
  );
}
```

Examples:

```text
/en              -> /es
/en/about        -> /es/about
/en/products/42  -> /es/products/42
```

When a user explicitly switches language, persist the selection for the bare-root negotiation endpoint.

---

# 11. Language cookie

The server uses a cookie only for `/` language negotiation.

The cookie name:

```text
lang
```

The value is:

```text
en
```

or:

```text
es
```

The browser can set it on language-switcher interaction:

```ts
document.cookie = [
  `lang=${language}`,
  'Path=/',
  'Max-Age=31536000',
  'SameSite=Lax',
].join('; ');
```

The application URL remains authoritative once the localized route has been reached.

---

# 12. ASP.NET Core implementation

## 12.1 `Program.cs`

```csharp
using System.Net;
using System.Text;
using System.Text.Encodings.Web;

var supportedLanguages = new[] { "en", "es" };
var supportedLanguageSet =
    supportedLanguages.ToHashSet(StringComparer.Ordinal);

const string defaultLanguage = "en";
const string siteOrigin = "https://example.com";

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(
    _ => { }
);

var app = builder.Build();

app.UseForwardedHeaders();

app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = context =>
    {
        var path = context.Context.Request.Path;

        if (path.StartsWithSegments("/assets"))
        {
            context.Context.Response.Headers.CacheControl =
                "public, max-age=31536000, immutable";
        }
        else
        {
            context.Context.Response.Headers.CacheControl =
                "public, max-age=3600";
        }
    }
});

var indexPath = Path.Combine(
    app.Environment.WebRootPath!,
    "index.html"
);

var indexTemplate = await File.ReadAllTextAsync(indexPath);

static string NormalizePath(string? value)
{
    if (string.IsNullOrEmpty(value))
        return string.Empty;

    var segments = value
        .Split('/', StringSplitOptions.RemoveEmptyEntries)
        .Select(Uri.EscapeDataString);

    var result = string.Join('/', segments);

    return result.Length == 0
        ? string.Empty
        : "/" + result;
}

string BuildCanonicalUrl(
    string language,
    string? path)
{
    return $"{siteOrigin}/{language}{NormalizePath(path)}";
}

string BuildHtml(
    string language,
    string? path)
{
    var encodedLanguage =
        HtmlEncoder.Default.Encode(language);

    var direction =
        language is "ar" or "he" or "fa" or "ur"
            ? "rtl"
            : "ltr";

    var encodedDirection =
        HtmlEncoder.Default.Encode(direction);

    var normalizedPath = NormalizePath(path);

    var head = new StringBuilder();

    foreach (var locale in supportedLanguages)
    {
        var url =
            $"{siteOrigin}/{locale}{normalizedPath}";

        head.AppendLine(
            $"<link rel=\"alternate\" hreflang=\"{locale}\" href=\"{HtmlEncoder.Default.Encode(url)}\">"
        );
    }

    var xDefault =
        $"{siteOrigin}/{defaultLanguage}{normalizedPath}";

    head.AppendLine(
        $"<link rel=\"alternate\" hreflang=\"x-default\" href=\"{HtmlEncoder.Default.Encode(xDefault)}\">"
    );

    var canonical =
        BuildCanonicalUrl(language, path);

    head.AppendLine(
        $"<link rel=\"canonical\" href=\"{HtmlEncoder.Default.Encode(canonical)}\">"
    );

    return indexTemplate
        .Replace("__LANG__", encodedLanguage)
        .Replace("__DIR__", encodedDirection)
        .Replace(
            "<!--__SEO_HEAD__-->",
            head.ToString()
        );
}

bool IsSupportedLanguage(string? language)
{
    return language is not null
        && supportedLanguageSet.Contains(language);
}

string? ResolveRootLanguage(
    HttpContext context)
{
    if (context.Request.Cookies.TryGetValue(
        "lang",
        out var cookieLanguage)
        && IsSupportedLanguage(cookieLanguage))
    {
        return cookieLanguage;
    }

    var acceptLanguage =
        context.Request.GetTypedHeaders()
            .AcceptLanguage;

    if (acceptLanguage is not null)
    {
        foreach (var item in acceptLanguage
                     .OrderByDescending(
                         x => x.Quality ?? 1))
        {
            var value = item.Value.Value;

            if (string.IsNullOrWhiteSpace(value))
                continue;

            var primary =
                value.Split(
                    '-',
                    StringSplitOptions.RemoveEmptyEntries
                )[0]
                .ToLowerInvariant();

            if (IsSupportedLanguage(primary))
                return primary;
        }
    }

    return defaultLanguage;
}

IResult RenderLocalizedPage(
    HttpContext context,
    string language,
    string? path)
{
    if (language != language.ToLowerInvariant())
    {
        var normalizedPath =
            NormalizePath(path);

        return Results.Redirect(
            $"/{language.ToLowerInvariant()}{normalizedPath}",
            permanent: true
        );
    }

    var html =
        BuildHtml(language, path);

    context.Response.Headers.ContentLanguage =
        language;

    context.Response.Headers.CacheControl =
        "no-cache";

    return Results.Content(
        html,
        "text/html; charset=utf-8"
    );
}

app.MapMethods(
    "/",
    new[] { "GET", "HEAD" },
    (HttpContext context) =>
    {
        var language =
            ResolveRootLanguage(context);

        context.Response.Headers.Vary =
            "Accept-Language, Cookie";

        context.Response.Headers.CacheControl =
            "private, no-store";

        return Results.Redirect(
            $"/{language}",
            permanent: false
        );
    }
);

app.MapMethods(
    "/{lang}",
    new[] { "GET", "HEAD" },
    (HttpContext context, string lang) =>
    {
        if (!IsSupportedLanguage(lang))
        {
            return Results.NotFound();
        }

        return RenderLocalizedPage(
            context,
            lang,
            null
        );
    }
);

app.MapMethods(
    "/{lang}/{*path}",
    new[] { "GET", "HEAD" },
    (HttpContext context,
        string lang,
        string? path) =>
    {
        if (!IsSupportedLanguage(lang))
        {
            context.Response.StatusCode = StatusCodes.Status404NotFound;

            return Results.Content(
                BuildHtml(defaultLanguage, null),
                "text/html; charset=utf-8"
            );
        }

        return RenderLocalizedPage(
            context,
            lang,
            path
        );
    }
);

app.MapFallback(async context =>
{
    context.Response.StatusCode =
        StatusCodes.Status404NotFound;

    if (Path.HasExtension(
        context.Request.Path.Value))
    {
        return;
    }

    context.Response.ContentType =
        "text/html; charset=utf-8";

    await context.Response.WriteAsync(
        BuildHtml(defaultLanguage, null)
    );
});

app.Run();
```

---

# 13. ASP.NET Core forwarded headers

Because Nginx is the TLS terminator, ASP.NET Core needs forwarded-header processing when generating absolute URLs or relying on the original scheme/host.

Configure it explicitly:

```csharp
using Microsoft.AspNetCore.HttpOverrides;

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders =
        ForwardedHeaders.XForwardedFor |
        ForwardedHeaders.XForwardedProto;

    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

app.UseForwardedHeaders();
```

Place `UseForwardedHeaders()` before middleware that depends on the original request scheme or host.

For a locked-down production environment, configure the actual Nginx proxy IP instead of clearing the trusted proxy lists.

---

# 14. HTML shell

## `wwwroot/index.html`

The Vite-built shell contains two infrastructure markers:

```html
<!doctype html>
<html lang="__LANG__" dir="__DIR__">
  <head>
    <meta charset="UTF-8" />

    <!--__SEO_HEAD__-->

    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />

    <title>Example application</title>
  </head>

  <body>
    <div id="root"></div>

    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

After Vite builds the application, the script reference is rewritten to the generated hashed asset.

ASP.NET Core replaces:

```text
__LANG__
__DIR__
<!--__SEO_HEAD__-->
```

for each localized request.

---

# 15. Example generated Spanish HTML metadata

For:

```text
/es/about
```

the HTML shell contains:

```html
<html lang="es" dir="ltr">
<head>
  <link
    rel="canonical"
    href="https://example.com/es/about"
  >

  <link
    rel="alternate"
    hreflang="en"
    href="https://example.com/en/about"
  >

  <link
    rel="alternate"
    hreflang="es"
    href="https://example.com/es/about"
  >

  <link
    rel="alternate"
    hreflang="x-default"
    href="https://example.com/en/about"
  >
</head>
```

The Spanish page therefore advertises both localized variants and identifies itself as canonical.

---

# 16. Nginx configuration

## `nginx/site.conf`

```nginx
server {
    listen 80;
    listen [::]:80;

    server_name example.com www.example.com;

    return 301 https://example.com$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    server_name www.example.com;

    return 301 https://example.com$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    server_name example.com;

    root /var/www/example/dist;

    # ---------------------------------------------------------
    # Hashed Vite assets
    # ---------------------------------------------------------

    location ^~ /assets/ {
        try_files $uri =404;

        add_header
            Cache-Control
            "public, max-age=31536000, immutable";
    }

    # ---------------------------------------------------------
    # Robots and sitemap
    # ---------------------------------------------------------

    location = /robots.txt {
        try_files $uri =404;

        add_header
            Cache-Control
            "public, max-age=3600";
    }

    location = /sitemap.xml {
        try_files $uri =404;

        add_header
            Cache-Control
            "public, max-age=3600";
    }

    # ---------------------------------------------------------
    # Application
    # ---------------------------------------------------------

    location / {
        proxy_pass http://127.0.0.1:5000;

        proxy_http_version 1.1;

        proxy_set_header Host $host;

        proxy_set_header X-Real-IP $remote_addr;

        proxy_set_header
            X-Forwarded-For
            $proxy_add_x_forwarded_for;

        proxy_set_header
            X-Forwarded-Proto
            $scheme;

        proxy_set_header
            X-Forwarded-Host
            $host;
    }
}
```

The important property is:

```nginx
location ^~ /assets/ {
    try_files $uri =404;
}
```

A missing asset never becomes the SPA shell.

Examples:

```text
/assets/main-ABC123.js
    -> 200

/assets/common-es-ABC123.json
    -> 200

/assets/does-not-exist.json
    -> 404
```

---

# 17. Nginx route behavior

The application owns localized routes.

Requests:

```text
GET /en
GET /en/about
GET /es
GET /es/about
```

are proxied to ASP.NET Core.

Requests:

```text
GET /assets/...
GET /robots.txt
GET /sitemap.xml
```

are handled directly by Nginx.

Infrastructure canonicalization is handled before proxying:

```text
http://example.com/es/about
    -> 301 https://example.com/es/about

https://www.example.com/es/about
    -> 301 https://example.com/es/about
```

The application receives:

```text
https://example.com/es/about
```

as its canonical request.

---

# 18. API localization

For API calls made by the browser, send the language resolved by i18next.

Example:

```ts
import i18n from './i18n';

export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
) {
  const headers = new Headers(init.headers);

  if (i18n.resolvedLanguage) {
    headers.set(
      'Accept-Language',
      i18n.resolvedLanguage
    );
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
```

A Spanish page therefore sends:

```http
Accept-Language: es
```

to application APIs.

ASP.NET Core can also expose the response language:

```csharp
app.UseRequestLocalization();
```

with supported cultures:

```csharp
var localizationOptions =
    new RequestLocalizationOptions
    {
        SupportedCultures = new[]
        {
            new CultureInfo("en"),
            new CultureInfo("es"),
        },
        SupportedUICultures = new[]
        {
            new CultureInfo("en"),
            new CultureInfo("es"),
        },
        DefaultRequestCulture =
            new RequestCulture("en"),
    };
```

Then:

```csharp
app.UseRequestLocalization(localizationOptions);
```

Place request localization after forwarded headers and before endpoints that depend on the current culture.

---

# 19. Spanish URL examples

## Home

```text
https://example.com/es
```

## About

```text
https://example.com/es/about
```

## Nested route

```text
https://example.com/es/products/42
```

For:

```text
/es/products/42
```

the alternate URLs are:

```text
/en/products/42
/es/products/42
```

and `x-default` is:

```text
/en/products/42
```

---

# 20. Root language negotiation

Request:

```text
GET /
```

The server checks:

1. valid `lang` cookie;
2. `Accept-Language`;
3. default language.

Examples:

```text
Cookie: lang=es
Accept-Language: en-US,en;q=0.9
    -> 302 /es
```

```text
Cookie: none
Accept-Language: es-ES,es;q=0.9,en;q=0.8
    -> 302 /es
```

```text
Cookie: none
Accept-Language: de,de-DE;q=0.9
    -> 302 /en
```

```text
Cookie: none
Accept-Language: absent
    -> 302 /en
```

The root response varies by:

```http
Vary: Accept-Language, Cookie
```

and is not publicly cached.

---

# 21. HTTP status contract

The infrastructure must preserve these status codes:

| Request | Status |
|---|---:|
| `/` | `302` |
| `/en` | `200` |
| `/en/about` | `200` |
| `/es` | `200` |
| `/es/about` | `200` |
| `/xx/about` | `404` |
| `/EN/about` | `301` -> `/en/about` |
| `/assets/existing.js` | `200` |
| `/assets/missing.js` | `404` |
| `/assets/missing.json` | `404` |
| `/robots.txt` | `200` |
| `/sitemap.xml` | `200` |

---

# 22. Case normalization

Language codes are normalized to lower-case.

Example:

```text
/ES/about
```

becomes:

```text
301 /es/about
```

The canonical URL emitted after the redirect is:

```text
https://example.com/es/about
```

The supported-language list is therefore always:

```text
en
es
```

and never:

```text
EN
Es
ES
```

---

# 23. URL normalization

Application paths are normalized before insertion into canonical and alternate URLs.

Use:

```csharp
string NormalizePath(string? value)
{
    if (string.IsNullOrEmpty(value))
        return string.Empty;

    var segments = value
        .Split(
            '/',
            StringSplitOptions.RemoveEmptyEntries
        )
        .Select(Uri.EscapeDataString);

    var result = string.Join('/', segments);

    return result.Length == 0
        ? string.Empty
        : "/" + result;
}
```

This ensures duplicated separators do not generate malformed canonical paths:

```text
/en//about
```

normalizes to:

```text
/en/about
```

---

# 24. SEO metadata contract

Every localized HTML response contains:

```text
<html lang="...">
```

one:

```text
<link rel="canonical">
```

one `hreflang` link for every supported language:

```text
hreflang="en"
hreflang="es"
```

and:

```text
hreflang="x-default"
```

For `/es/about`:

```text
canonical = https://example.com/es/about

en       = https://example.com/en/about
es       = https://example.com/es/about
x-default = https://example.com/en/about
```

All URLs are absolute.

---

# 25. `robots.txt`

## `public/robots.txt`

```text
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap.xml
```

---

# 26. `sitemap.xml`

Include language-specific URLs as separate URLs.

## `public/sitemap.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>
  <url>
    <loc>https://example.com/en</loc>
  </url>

  <url>
    <loc>https://example.com/es</loc>
  </url>

  <url>
    <loc>https://example.com/en/about</loc>
  </url>

  <url>
    <loc>https://example.com/es/about</loc>
  </url>
</urlset>
```

For a real application, generate this from the server-side route/content catalog rather than maintaining it manually.

---

# 27. Build process

Build the frontend:

```bash
npm ci
npm run build
```

Expected Vite output:

```text
dist/
├── assets/
│   ├── index-XXXXXXXX.js
│   ├── index-XXXXXXXX.css
│   ├── common-en-XXXXXXXX.json
│   └── common-es-XXXXXXXX.json
└── index.html
```

The exact hashes are generated by Vite.

Copy the generated web assets into the ASP.NET Core deployment root.

A deployment can therefore contain:

```text
/var/www/example/dist/index.html
/var/www/example/dist/assets/index-XXXXXXXX.js
/var/www/example/dist/assets/common-en-XXXXXXXX.json
/var/www/example/dist/assets/common-es-XXXXXXXX.json
```

---

# 28. Production cache behavior

Use immutable caching for hashed assets:

```http
Cache-Control: public, max-age=31536000, immutable
```

Examples:

```text
/assets/index-ABC123.js
/assets/common-es-DEF456.json
/assets/index-GHI789.css
```

HTML is revalidated:

```http
Cache-Control: no-cache
```

The root language negotiation response is private:

```http
Cache-Control: private, no-store
Vary: Accept-Language, Cookie
```

This prevents a cached user's language redirect from being reused for other users.

---

# 29. Deployment configuration

Example systemd service:

```ini
[Unit]
Description=Example ASP.NET Core application
After=network.target

[Service]
WorkingDirectory=/var/www/example
ExecStart=/usr/bin/dotnet /var/www/example/Example.dll
Restart=always
RestartSec=5

Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=ASPNETCORE_URLS=http://127.0.0.1:5000

User=www-data
Group=www-data

[Install]
WantedBy=multi-user.target
```

Enable:

```bash
sudo systemctl daemon-reload
sudo systemctl enable example
sudo systemctl restart example
sudo systemctl status example
```

---

# 30. Nginx deployment

Install the site:

```bash
sudo cp nginx/site.conf /etc/nginx/sites-available/example
sudo ln -s /etc/nginx/sites-available/example \
  /etc/nginx/sites-enabled/example
```

Validate:

```bash
sudo nginx -t
```

Reload:

```bash
sudo systemctl reload nginx
```

---

# 31. End-to-end verification

Run these checks after deployment.

## Root negotiation

```bash
curl -I https://example.com/
```

Expected:

```text
HTTP/2 302
location: /en
```

With Spanish:

```bash
curl -I \
  -H 'Accept-Language: es-ES,es;q=0.9' \
  https://example.com/
```

Expected:

```text
HTTP/2 302
location: /es
```

---

## Spanish page

```bash
curl -s https://example.com/es/about
```

Verify the HTML contains:

```html
<html lang="es" dir="ltr">
```

and:

```html
<link rel="canonical"
      href="https://example.com/es/about">
```

and:

```html
<link rel="alternate"
      hreflang="en"
      href="https://example.com/en/about">
```

and:

```html
<link rel="alternate"
      hreflang="es"
      href="https://example.com/es/about">
```

and:

```html
<link rel="alternate"
      hreflang="x-default"
      href="https://example.com/en/about">
```

---

## Unsupported locale

```bash
curl -i https://example.com/xx/about
```

Expected:

```text
HTTP/2 404
```

---

## Case normalization

```bash
curl -I https://example.com/ES/about
```

Expected:

```text
HTTP/2 301
location: /es/about
```

---

## Missing locale asset

```bash
curl -i \
  https://example.com/assets/common-es-does-not-exist.json
```

Expected:

```text
HTTP/2 404
```

The response body must not be `index.html`.

---

## Existing locale asset

After the Vite build, identify the generated JSON filename:

```bash
find dist/assets -name '*es*.json'
```

Then:

```bash
curl -I https://example.com/assets/common-es-XXXXXXXX.json
```

Expected:

```text
HTTP/2 200
Cache-Control: public, max-age=31536000, immutable
```

---

## Existing JS asset

```bash
curl -I https://example.com/assets/index-XXXXXXXX.js
```

Expected:

```text
HTTP/2 200
Cache-Control: public, max-age=31536000, immutable
```

---

## Missing application route

```bash
curl -i https://example.com/es/this-route-does-not-exist
```

Expected:

```text
HTTP/2 404
```

The response should contain the localized/error HTML shell, with the HTTP status remaining `404`.

---

# 32. Acceptance criteria

The feature is complete when all of the following are true:

- `/en` renders English.
- `/es` renders Spanish.
- `/en/about` and `/es/about` preserve language on direct navigation.
- Refreshing `/es/about` works through Nginx and ASP.NET Core.
- i18next detects language from the first URL segment.
- i18next does not override the URL language with cookies or browser language.
- Spanish translations load from a hashed Vite JSON asset.
- Locale JSON is not inlined into the JavaScript bundle.
- Missing locale JSON produces HTTP `404`.
- Missing JS/CSS assets produce HTTP `404`.
- Unsupported language prefixes produce HTTP `404`.
- Upper-case language prefixes redirect permanently to lower-case.
- `/` negotiates `en`/`es` using cookie and `Accept-Language`.
- `/` is not publicly cached.
- `/assets/*` uses immutable long-term caching.
- Localized HTML uses `Cache-Control: no-cache`.
- Localized HTML has the correct `<html lang>`.
- Localized HTML has the correct canonical URL.
- Localized HTML contains reciprocal `hreflang` links for `en` and `es`.
- Localized HTML contains `x-default`.
- Language switching preserves the current path.
- API requests send the current resolved language in `Accept-Language`.
- HTTP-to-HTTPS and `www`-to-apex redirects preserve the request URI.
- A missing application route remains a real `404` rather than a `200` SPA fallback.
