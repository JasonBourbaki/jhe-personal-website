# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project purpose

Personal portfolio website for Jiaxin (Jason) He, an economic researcher at the Economic Innovation Group and public policy pundit. Built on the **Astro Cactus** theme (v8.x) — Astro 7, Tailwind CSS v4, pnpm — restructured from a blog into a portfolio of externally published work. Deploys to GitHub Pages behind the domain **jxhe.xyz** (not yet deployed — do NOT deploy without the owner's approval).

**Deployment** is `.github/workflows/deploy.yml`, deliberately **`workflow_dispatch` only** so nothing publishes on push. Do not add a `push:` trigger without the owner's explicit say-so. `public/CNAME` carries the custom domain.

## Commands

Uses **pnpm** (Node 22, see `.nvmrc`). On this machine `pnpm` is not on PATH — run it through corepack, e.g. `corepack pnpm install`, `corepack pnpm dev`.

| Command          | Action                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| `pnpm install`   | Install dependencies (postinstall rebuilds sharp)                                               |
| `pnpm dev`       | Dev server at `localhost:4321`                                                                  |
| `pnpm build`     | Production build to `./dist/`                                                                   |
| `pnpm postbuild` | Pagefind search indexing — run after `build`; search only works on a built site, never in `dev` |
| `pnpm preview`   | Preview the built site locally                                                                  |
| `pnpm check`     | Type-check (`astro check`) + lint (`biome check`)                                               |
| `pnpm lint`      | Biome check with auto-fix (`--write`)                                                           |
| `pnpm format`    | Prettier (with astro + tailwind plugins)                                                        |

There are no tests. Verify changes with `pnpm check` and by viewing the dev server. `.claude/launch.json` defines `dev` (4321) and `preview` (4322, requires a prior build) servers.

## Site structure

Four pages: Home (`src/pages/index.astro`: bio hero → Featured cards → recent writings → recent mentions), `/resume/` (content hand-written in `resume.astro` — street address/phone deliberately omitted from the public site), `/writings/` (all items grouped Papers → Writings → Data Projects, then by year), `/media/` (mentions by year). Nav lives in `menuLinks` in [src/site.config.ts](src/site.config.ts).

## Content model — this is the part to understand first

Almost all content links out to externally published work; there are **no hosted articles**. Content is data-driven from two YAML files (collections defined with `file()` loaders in [src/content.config.ts](src/content.config.ts)):

- [content/writings.yaml](content/writings.yaml) → `writing` collection: id, type (`paper` | `writing` | `data-project`), title, authors[], venue, date, optional displayDate (shown verbatim when the exact day is unknown), url, optional github. **Adding a publication = appending one YAML block.**
- [content/mentions.yaml](content/mentions.yaml) → `mention` collection: id, outlet, title, date, optional displayDate, url, optional context line.
- [src/data/featured.ts](src/data/featured.ts) → the two Featured cards on the home page. **They default to the two most recent articles** (types `paper`/`writing`; data projects excluded), so adding a writings.yaml entry promotes it automatically — the owner asked for this explicitly. `featuredOverride` pins specific ids instead when non-empty. `featuredImages` maps a writing id to a cover image (the article's own og:image, downloaded into `src/assets/featured/`); it's optional by design — an article with no image still features, its card just renders text-only, so a new article can never break the home page. Resolve via `getFeaturedWritings()`, not by reading the config directly.

Fetch these through the helpers in [src/data/writings.ts](src/data/writings.ts) (`getAllWritings`, `getAllMentions`, `groupByYear`, type labels/order). Rendering components: `Citation.astro` (authors with "Jiaxin He" bolded, venue deduped for org-authored items, GitHub icon when `github` set), `MentionItem.astro`, `FeaturedCard.astro`.

**Date gotcha**: YAML dates parse as UTC midnight; always format with `dateTimeOptions={{ timeZone: "UTC" }}` (via `FormattedDate.astro`) or dates render one day early in US timezones. Also: Astro collapses whitespace around expressions — the citation components use explicit `{" "}` separators; preserve them.

The theme's blog **routes were deleted** (`src/pages/posts/`, `src/pages/tags/`) because with no posts they published empty "Posts"/"Tags" pages into the sitemap. The rest of the blog machinery is still here and unreferenced: the `post`/`tag` collections, `src/data/post.ts`, `src/layouts/BlogPost.astro`, `src/components/blog/**`, and the `og-image/[...slug].png.ts` endpoint (which currently generates zero images). To start a blog: add `.md` files under `content/posts/`, restore the route files from git history (`git show 11fe895 -- src/pages/posts`), and add a nav link. The `note` collection and routes were removed entirely.

The empty `content/posts/` and `content/tags/` dirs still produce "collection does not exist or is empty" build warnings — expected, harmless. `/rss.xml` serves the writings feed with external links.

**OG images**: since there are no posts, every page currently uses `public/social-card.png`. The Satori per-page generator (`src/pages/og-image/`) only produces images for blog posts.

## Branding

- **Palette**: black/white/blue. Colors are CSS custom properties in [src/styles/global.css](src/styles/global.css) — light values in `@theme`, dark overrides under `html[data-theme="dark"]` (selector-based dark mode). Accent blue ≈ `#2563eb` light / `#60a5fa` dark.
- **Logo**: isometric voxel "HE" at `public/icon.svg` (also the favicon/manifest source; must stay square). Header displays it via `<img>` in `src/components/layout/Header.astro`. It and `public/social-card.png` are generated by scripts (kept in the session scratchpad; regenerate by editing the SVG directly or asking Claude to rebuild the generator).
- **OG images**: `social-card.png` is the og:image for every page today; the Satori generator (`src/pages/og-image/`, design in `_ogMarkup.ts`) only kicks in for blog posts.
- Body font is `font-mono` (set on `<body>` in `Base.astro`) — a deliberate choice.

## Search

Pagefind, indexing only elements with `data-pagefind-body` — currently the writings, media, and resume pages (home is excluded as duplicate content). The search button **only renders on a built site** (`Search.astro` bails in dev). Test via `pnpm build && pnpm postbuild` then the `preview` server.

## Tooling notes

- Biome lints; Prettier formats. Both run in `pnpm check`. `src/styles/components/github-card.css` is prettier-ignored (the two formatters disagree on one declaration; Biome owns it).
- **Dependency overrides live in `pnpm-workspace.yaml`** (pnpm's location — it ignores npm's top-level `overrides` field in package.json, so don't re-add one there). They pin patched versions of build-time transitive deps (`axios`, `tar`, `undici`, `form-data`, `follow-redirects`, `svgo` at both majors) plus `sharp` and `postcss`. This takes `pnpm audit --prod` to zero. Re-run `pnpm audit --prod && pnpm build` after touching them. Note `sharp` must stay **≥ 0.35.3**: 0.35.0–0.35.2 break TypeScript resolution of its own types under this tsconfig (`astro check` fails in `og-image/[...slug].png.ts`).
- `packageManager` in package.json pins pnpm for corepack and CI; the workflows intentionally omit a `version:` input so they inherit it.
- Line endings are LF; if `pnpm check` suddenly reports hundreds of format diffs with `␍`, git checked files out with CRLF — run `pnpm lint && pnpm format` to normalize.
- Webmentions are optional (`WEBMENTION_*` env vars, `.example.env`); everything degrades gracefully when unset.
