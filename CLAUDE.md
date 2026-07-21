# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Writing conventions

**Never use em dashes (—) in any generated text.** This covers slide copy, prose, comments, and commit messages. Use a colon, comma, parentheses, or two short sentences instead. It applies to all on-slide content under `slides/**` and every Markdown/qmd file in the repo.

## What this repo is

A Quarto **website** hosting the landing surface for a three-part workshop, with each part embedding a Quarto **revealjs** slide deck via `<iframe>`. The parent website and the per-deck slide projects are nested but separate Quarto projects, glued together by a post-render hook.

- Three workshop parts: **Agentic Basics**, **Skill Usage and Design**, **Data Safety with AI**
- Four top-level content pages: `installation.qmd` (pre-workshop setup) plus three slide pages (`basics.qmd`, `skills.qmd`, `safety.qmd`)
- Deployed to GitHub Pages via `.github/workflows/quarto-publish.yml` on push to `main`

## Build / preview

```bash
quarto render                                # full build (parent + all decks via post-render hook)
quarto preview                               # live website; post-render hook re-runs each render to keep _site/slides/* fresh
quarto preview slides/basics                 # live preview of a single deck (hot reload as you edit it)
```

The deployed `_site/` is built end-to-end by the parent `quarto render` — CI does nothing extra.

## Architecture: nested Quarto projects

The only non-obvious part of the repo. Read this before touching any `_quarto.yml` or the build flow.

**Parent project** (`/_quarto.yml`) — `type: website`, builds the landing pages. It explicitly excludes `slides/**` from its render list (`!slides/**`) so the website doesn't try to render the decks as website pages (which would fight revealjs format and apply the navbar/footer to slides). It also excludes `**/resources/*.qmd` so partials don't become standalone pages.

**Per-deck projects** (`slides/<deck>/_quarto.yml`) — each deck is its own `type: website` Quarto project so its `_site/` output dir, theme, and revealjs format stay isolated from the parent.

**Glue** — the parent declares `post-render: [scripts/render-slides.sh]`. After every parent render (including in `quarto preview`), the script renders each `slides/*/` subproject and copies its `_site/` into the parent's `_site/slides/<deck>/` so the iframes resolve. Without the hook the parent re-render would wipe `_site/slides/` and the iframes would 404.

**Quarto's `_metadata.yml` cascade does NOT cross nested project boundaries.** Shared deck config lives in `slides/_shared.yml` and is pulled in via `metadata-files: [../_shared.yml]` in each deck's `_quarto.yml` — the documented way to share metadata across nested projects.

## Top-level pages

Navbar order is the source of truth (`_quarto.yml` → `website.navbar.left`):

| Page | File | Role |
|---|---|---|
| Home | `index.qmd` | Landing — author cards (`resources/authors.qmd`), GW affiliation, four Part-N section grids (`resources/part-{0,1,2,3}-overview.qmd`; Part 0 links to the installation page) |
| 0. Installation | `installation.qmd` | Pre-workshop setup — three sections (Essentials, Agents, Software) pulled in from `resources/essentials.qmd`, `resources/agents.qmd`, and `resources/software.qmd` |
| 1. Agentic Basics | `basics.qmd` | iframes `slides/basics/` |
| 2. Skill Usage and Design | `skills.qmd` | iframes `slides/skills/` |
| 3. Data Safety with AI | `safety.qmd` | iframes `slides/safety/` |

Slide page filenames and their deck directories under `slides/` share the same short names (`basics`, `skills`, `safety`). The iframe `src` attribute inside each slide page is the source of truth — if you rename a deck directory, update the iframe `src`/`href` in the corresponding qmd to match.

### Body-width override on slide pages

`basics.qmd`, `skills.qmd`, `safety.qmd` each set `grid: { sidebar-width: 0px, body-width: 1200px, margin-width: 0px }` so the iframe stretches past Quarto's 800px default. `index.qmd` and `installation.qmd` use the same override without `body-width` (default 800px is fine for them).

## Shared assets

- `slides/_shared.yml` — every revealjs format option, footer, author, default `title-slide-attributes`, execute settings. Edit here to change all three decks at once.
- `slides/styles/slides.scss` — single shared SCSS for all decks (TsangerJinKai font, color utility classes like `.amber` `.teal`, slide-variant classes like `.dark-centered` `.light-centered`). Decks reference it as `../styles/slides.scss`.
- `slides/<deck>/_quarto.yml` — `project:` + `resources: figs/` + `metadata-files: [../_shared.yml]`. ~6 lines.
- `slides/<deck>/index.qmd` — front matter (`pagetitle`, `title`, **per-deck** `title-slide-attributes` for the banner image), then slide content.
- `slides/<deck>/figs/banner.png` — round PNG (transparent corners) used as the title slide's `data-background-image`. See "Title slide & banner mechanics".
- `slides/<deck>/SCRIPTS.md` — speaker script for the deck, organized into the same three sections as `resources/part-N-overview.qmd`. Source for slide content. Present for the `skills` and `safety` decks; the `basics` deck currently has none.
- `styles/styles.scss` — parent **website** styles. All component CSS lives here (see "Component CSS conventions") — never inline `<style>` blocks in qmd files.
- `styles/styles.js` — parent-website JS entry, loaded via `include-after-body` in `_quarto.yml` alongside the Lucide icons CDN. Touch this for landing-page behavior or icon rendering changes.
- `images/` — parent website static assets, registered as a Quarto resource in `_quarto.yml` so it's copied into `_site/` as-is. `images/software/` holds the app icons used by `resources/software.qmd`; `images/{pingfan-hu,john-helveston}.png` are the author headshots.
- `resources/*.qmd` — partials included into top-level pages via `{{< include >}}`. Excluded from the parent render list so they never render as standalone pages.

## Component CSS conventions

For tables, card grids, author cards, etc.:

- HTML lives in a `resources/<name>.qmd` partial, wrapped in a `{=html}` fence.
- CSS lives in `styles/styles.scss` under a topic header comment like `// ---- Authors ----` or `// ---- Software Table ----`.
- **Never inline `<style>` or `<link>` blocks in the qmd file** — Maple Mono is `@import`-ed at the top of `styles.scss` and Lucide icons are loaded globally via `_quarto.yml`'s `include-after-body`.
- Dark-mode overrides live inside the single `body.quarto-dark { ... }` block in `styles.scss`.
- Mobile breakpoint is `@media (max-width: 640px)` (used consistently across all components).

Current component families in `styles/styles.scss`:
- `.swtbl-*` — two-column tables in `resources/agents.qmd` and `resources/software.qmd` (icon + name on left, description on right, with a head/body layout that flips on mobile)
- `.auth-*` — author headshot cards in `resources/authors.qmd`
- `.section-*` — colored Part-N section grids in `resources/part-{0,1,2,3}-overview.qmd`
- `.slide-embed*` — iframe wrapper used by the three slide pages
- `.affiliation*` — GW affiliation row at the top of `index.qmd`

## Hover effects on slide elements — avoid the shake

Hover effects on cards or in-card links must not visibly shift the surrounding card. Two failure modes seen in this repo:

1. **`transform: translateY(-Npx)` on hover.** On retina displays the transform promotes the hovered element to a new GPU compositor layer, which forces a subpixel repaint of its siblings inside the same card. The whole card appears to "shake" for a frame. Fix: drop the hover transform — use only `box-shadow` and/or `background-color` changes to signal hover. A press transform on `:active` is fine (momentary).
2. **First-time layer promotion on `opacity` transition.** Same root cause: when the opacity transition starts, the browser creates the layer on the fly. Pre-promote with `will-change: opacity, transform;` (and optionally `backface-visibility: hidden;`) so the layer exists before hover.

Both `.instructor-link` (about slide) and `.tool-link` (s1-three-tools slide) in `slides/styles/slides.scss` follow this pattern. When adding a new hoverable element, default to: no hover transform, `box-shadow`/`background`/`color` changes only, `will-change` pre-set, `:active` for the click press.

## Quarto theme overrides

Quarto's bundled theme CSS uses high-specificity selectors with the `.quarto-title-block.default` chain. Naïve `#title-block-header .description` rules **lose** to Quarto's `#title-block-header.quarto-title-block.default .description { margin-top: 0 }`. Match the full chain to compete on equal specificity (later-source rules then win); reach for `!important` only as a last resort. The page-description block styling under `// ---- Page description block ----` in `styles.scss` is the working example.

## Title slide & banner mechanics

Each deck has a navy title slide with a circular banner image on the right. Three things must stay in sync:

1. **Per-deck `title-slide-attributes` in `index.qmd` front matter** override the shared default in `_shared.yml` to add `data-background-image: figs/banner.png` (with `data-background-size`, `data-background-position`). The override is a full replacement — the index.qmd block must include `data-background-color`, `class: dark-centered`, and `style:` too.
2. **The banner PNGs are circularly masked** (transparent outside the circle). Generated by `/ph-image` skill, then post-processed with PIL ellipse mask. If you regenerate a banner, re-apply the mask or it'll show as a square.
3. **`#title-slide.dark-centered { background-color: transparent !important; }`** in `slides/styles/slides.scss` lets Reveal's `data-background` layer (where the banner lives) show through. Without this override, `.dark-centered`'s opaque navy fill on the section element covers the banner. The override is scoped to `#title-slide` so other `.dark-centered` slides (section dividers, dark quote slides) keep their solid navy fill.

If you change banner position or size, edit each deck's `index.qmd` front matter — `slides/_shared.yml`'s `title-slide-attributes` is only the fallback.

## Speaker scripts → slide content

A deck's `SCRIPTS.md` (speaker script) and its `index.qmd` (slide content) evolve together (the `skills` and `safety` decks have a `SCRIPTS.md`; `basics` does not):

- `SCRIPTS.md` is the source of truth for what to *say*; structured into the three sections defined in `resources/part-N-overview.qmd`
- `index.qmd` is the slide deck; bullets/short paragraphs that match the script
- Pacing target: ~25 minutes per part, ~25–29 slides each. Section dividers use `.dark-centered`, content slides use `.light-centered` or default
- Visual punctuation: dramatic quote slides also use `.dark-centered` for contrast

## Project hooks

`.claude/settings.local.json` defines a **`Stop`** hook that runs `scripts/refresh-preview.sh` after every Claude turn. The script:

1. Stops any running `quarto preview` processes
2. Removes `_site/` from the parent + each `slides/*/` subproject
3. Cleans accumulating `quarto-session-temp*` cruft inside each `.quarto/` (preserves `xref/`, `idx/`, `project-cache/` for fast incremental rebuilds)

It does **not** auto-restart `quarto preview` — restart manually when you want to view changes. Output is logged to `/tmp/quarto-refresh.log`.

## Stale `.quarto/idx` after editing `slides/_shared.yml`

Changes to **format-level** options in `slides/_shared.yml` (the shared revealjs config) may not take effect on the next render, because Quarto bakes those values into each deck's `.quarto/idx` cache, and the `Stop` hook above deliberately **preserves `idx/`** for fast rebuilds. The compiled `_site/index.html` then keeps re-emitting the old value no matter how many times you restart `quarto preview` — the source config looks right but the behavior doesn't change.

Symptom seen once: flipping `preview-links: auto` → `false` correctly set reveal's `previewLinks: false`, but Quarto's separate `previewLinksAuto` (the fullscreen link-preview handler that produces the "Unable to load iframe … x-frame-options" overlay when a slide links to an external site like GitHub) stayed `true` from cache, so external links kept opening in a failing iframe instead of a new tab.

Fix: force a clean render of the affected deck(s) — `rm -rf slides/<deck>/.quarto slides/<deck>/_site && (cd slides/<deck> && quarto render)`. If the option lives in `_shared.yml`, it affects all three decks, so clear and re-render **all** of `slides/*/`. Verify with `grep -o "previewLinksAuto': [a-z]*" slides/<deck>/_site/index.html`. Content-only edits (qmd/scss) don't hit this — only shared **format metadata** does.

## Gitignore behavior

`.gitignore` has a bare `_site` entry, which matches `_site/` anywhere in the tree (parent's `_site/` and each deck's `slides/<deck>/_site/`). Don't change this to `/_site` — the nested build outputs would start getting committed.

## Settings file

`.claude/settings.local.json` is intentionally minimal — only the `Stop` hook lives there. The user runs in auto mode, so accumulated permission allowlists aren't kept around. Don't add a `permissions.allow` block back unless explicitly asked.
