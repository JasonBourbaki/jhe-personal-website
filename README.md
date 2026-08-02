# jxhe.xyz

Personal website of Jiaxin (Jason) He — a portfolio of published economic research, writing, and
data projects. Built with [Astro](https://astro.build) on the
[Astro Cactus](https://github.com/chrismwilliams/astro-theme-cactus) theme, deployed to GitHub Pages.

## Local development

Requires Node 22 (see `.nvmrc`) and pnpm 11 (via `corepack`).

```bash
corepack pnpm install
```

| Command          | Action                                                        |
| ---------------- | ------------------------------------------------------------- |
| `pnpm dev`       | Dev server at `localhost:4321`                                |
| `pnpm build`     | Production build to `./dist/`                                 |
| `pnpm postbuild` | Build the Pagefind search index (required for search to work) |
| `pnpm preview`   | Serve the built site locally                                  |
| `pnpm check`     | Type-check (`astro check`) and lint (`biome check`)           |
| `pnpm lint`      | Lint with auto-fix                                            |
| `pnpm format`    | Format with Prettier                                          |

Search only works on a built site — run `pnpm build && pnpm postbuild`, then `pnpm preview`.

## Adding content

Nearly everything on the site links out to externally published work, so adding content means
editing a data file rather than writing a page.

**A new article, paper, or data project** — append a block to
[`content/writings.yaml`](content/writings.yaml):

```yaml
- id: short-unique-slug
  type: writing # paper | writing | data-project
  title: Title of the piece
  authors: [Jiaxin He, Co Author]
  venue: Where it was published
  date: 2026-07-24
  url: https://example.com/article
  github: https://github.com/... # optional
```

It appears automatically on the home page, the writings page (grouped by type, then year), and in
the RSS feed. Use `displayDate: "2026"` when only the year is known. Adding the first `type: paper`
entry makes the Papers section appear.

**A press mention** — append a block to [`content/mentions.yaml`](content/mentions.yaml) with
`outlet`, `title`, `date`, `url`, and an optional `context` line.

**The two featured cards** — these update themselves: they always show your two most recent articles
(data projects don't count). To make a new article's card show a cover image, save the image into
`src/assets/featured/` and add it to `featuredImages` in
[`src/data/featured.ts`](src/data/featured.ts), keyed by the article's `id`. Skipping that step is
fine — the card just renders without an image.

To feature something other than the two most recent, list those ids in `featuredOverride` in the
same file; empty the array to go back to automatic.

**The resume** — content is written directly in [`src/pages/resume.astro`](src/pages/resume.astro).

## Deploying

Deployment is a **manually triggered** GitHub Actions workflow: Actions → "Deploy to GitHub Pages" →
"Run workflow". Nothing deploys on push unless the `push` trigger in
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) is uncommented.

First-time setup: set repository Settings → Pages → Source to "GitHub Actions", and point the
`jxhe.xyz` DNS at GitHub Pages (four `A` records for the apex domain, plus a `CNAME` record for
`www`). The custom domain is committed as [`public/CNAME`](public/CNAME).

## License

The site's source code inherits the MIT license of the Astro Cactus theme (see [LICENSE](LICENSE)).
Site content — writing, resume text, and images — is © Jiaxin He and not covered by that license.
