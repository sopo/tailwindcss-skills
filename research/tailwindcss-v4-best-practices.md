# Tailwind CSS v4: research for future agent skills

Verified: **2026-10-27**. Scope: authoring, configuring, integrating, and reviewing Tailwind CSS v4 projects. This is research and a proposed skill outline; it does not implement the skills.

## 1. Findings and evidence boundaries

**Recommended direction:** teach Tailwind v4 as a CSS-first design system and build tool. The highest-value rules are to inspect the installed version and integration, use complete detectable class names, model reusable design decisions with theme variables, keep responsive and state behavior explicit, and validate the generated result. Avoid turning preferences such as “never use arbitrary values” or “always extract classes” into rules: the official documentation supports arbitrary values, custom CSS, components, and limited `@apply` usage. [Theme][theme] · [Detection][detection] · [Utility workflow][workflow] · [Custom styles][custom]

### Sources and version provenance

- The latest published GitHub release returned during this research was **v4.3.3**, published **2026-07-16T11:55:08Z**. This is a research snapshot, not a requirement that every v4 project upgrade. [Release][latest-release]
- The official documentation source was inspected at `tailwindlabs/tailwindcss.com` main, commit **`7f92c2213315c195dae583d68752da4042da3ade`**, dated **2026-09-09T13:46:52Z**. The public documentation describes current v4, not a frozen v4.0 contract. [Pinned docs source][docs-snapshot]
- Release-specific behavior was checked against the official changelog and, for baseline theme/source syntax, the tagged v4.0.0 compiler. The main development changelog contains an **Unreleased** section; it must not be treated as published functionality. [Released changelog][changelog] · [v4.0.0 compiler][compiler-v4]
- Factual statements below cite first-party Tailwind documentation/source or W3C specifications and guidance. **Recommendations** are our proposed authoring policy inferred from that evidence; they are not all upstream mandates.

### Important version gates

| Capability | Earliest release established here | Implication for skills |
| --- | --- | --- |
| CSS-first `@theme`, `@theme inline`, `@utility`, explicit `@source`, `source(path)`, and `source(none)` | v4.0 baseline | Prefer these over copying v3 setup. [v4.0.0 compiler][compiler-v4] · [Upgrade guide][upgrade] |
| `@theme static` | **v4.0.5** | Do not assume it works in v4.0.0–v4.0.4. [v4.0.5 release][release-405] |
| `@source inline()`, `@source not inline()`, `@source not "…"`; text-shadow, mask, pointer, and user-valid/user-invalid additions | **v4.1.0** | Gate safelisting/exclusion recipes and newer utility suggestions on the installed version. [v4.1 release][release-41] · [Changelog][changelog] |
| `@container-size`, built-in `tab-*`/`zoom-*`, stacked/comma-separated `@variant` syntax, `--default()` in functional utility definitions | **v4.3.0** | Current docs contain these features; keep them out of a generic v4.0 recipe. [Changelog][changelog] |

**Accepted product direction:** document the supported Tailwind version range and scope in the README as an installation contract. The usage skill should not perform routine unsupported-version triage or make the user reconfirm compatibility. Inspect the CSS entry, theme, source boundaries, and existing integration when relevant to the task; preserve working conventions. Keep later-release requirements visible beside the affected reference recipes rather than treating every current-docs feature as available in every v4 release.

## 2. Integration: choose the existing build system

### Verified behavior

| Integration | Official v4 setup | Practical consequence |
| --- | --- | --- |
| Vite | Install `tailwindcss` and `@tailwindcss/vite`; add `tailwindcss()` to the Vite plugins; import `tailwindcss` in CSS. | The official upgrade guide recommends the dedicated Vite plugin for improved performance and developer experience. [Vite][vite] · [Upgrade][upgrade] |
| PostCSS | Install `tailwindcss`, `@tailwindcss/postcss`, and `postcss`; register `@tailwindcss/postcss`. | `tailwindcss` itself is no longer the PostCSS plugin. [PostCSS][postcss] · [Upgrade][upgrade] |
| CLI | Use the separate `@tailwindcss/cli` package and compile an input CSS file into an output stylesheet. | Do not copy a v3 CLI command that assumes the CLI lives in `tailwindcss`. [CLI][cli] · [Upgrade][upgrade] |
| Play CDN | Browser package available for trying Tailwind. | Officially for development, not production. [Play CDN][cdn] |

The shared CSS entry starts with:

```css
@import "tailwindcss";
```

This replaces the old `@tailwind base`, `@tailwind components`, and `@tailwind utilities` entry directives. Tailwind v4 handles CSS imports and vendor prefixing, so the migration guide says standalone `postcss-import` and `autoprefixer` can be removed from a Tailwind pipeline when no other requirements need them. [Upgrade][upgrade]

### Browser and existing-site constraints

Core v4 functionality targets **Safari 16.4+, Chrome 111+, and Firefox 128+**. Individual newer CSS features exposed by utilities can require newer browsers; meeting the core baseline does not make every utility universally supported. The v4.1 announcement's improved fallbacks do not replace the documented support baseline. [Compatibility][compatibility] · [v4.1 announcement][release-41]

Tailwind v4 is not designed to be processed through Sass, Less, or Stylus. It provides its own import handling and supports modern CSS capabilities instead. This is a constraint on Tailwind stylesheets and component style blocks, not evidence that every unrelated legacy Sass file in a repository must be rewritten. [Compatibility][compatibility] · [Upgrade][upgrade]

Importing `tailwindcss` includes **Preflight** in the `base` layer. It resets margins, heading typography, list markers, borders, and some replaced-element behavior. In an existing site, these global effects need deliberate review. The official approach to omitting Preflight is to import only theme and utilities while preserving layer order: [Preflight][preflight]

```css
@layer theme, base, components, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);
```

**Recommendation:** confirm the framework actually imports the CSS entry and loads the generated output. Use the existing package manager and one appropriate integration. Review reset effects before adding Tailwind to a page with third-party widgets or established global CSS. Do not introduce a new JavaScript config or `init -p` workflow for a fresh v4 setup.

## 3. Design tokens: `@theme`, runtime variables, and arbitrary values

### What belongs where

`@theme` variables are a compiler-facing API: namespaces determine which utilities or variants exist. Examples include `--color-*` for color utilities, `--font-*` for font families, `--text-*` for type sizes, `--breakpoint-*` for viewport variants, and `--container-*` for container-query variants and related sizes. Theme declarations must be top-level rather than nested inside selectors or media queries. Ordinary `:root` variables do not by themselves register utility names. [Theme][theme]

| Need | Mechanism | Why |
| --- | --- | --- |
| Reusable token exposed as utilities | `@theme` | A token such as `--color-brand-600` enables utility names such as `bg-brand-600`. [Theme][theme] |
| Runtime value with no new named utility API | `:root`, scoped custom properties, or inline styles | These are ordinary CSS values; use a static utility referencing them when useful. [Theme][theme] · [Inline styles][workflow] |
| Theme token aliases another CSS variable | `@theme inline` | Generated utilities use the alias value directly, avoiding unexpected variable resolution at the definition scope. [Theme: references][theme] |
| Export every declared theme variable even when otherwise unused | `@theme static` on v4.0.5+ | Default emission is usage-based; `static` changes variable emission. [Theme][theme] · [v4.0.5][release-405] |
| Replace a namespace rather than extend it | `--color-*: initial`, then define replacements | Removes that namespace's default token-driven utilities. [Theme][theme] |
| Replace all default theme tokens | `--*: initial`, then define a complete intended theme | Removes default theme-driven choices; static utilities such as `flex` still exist. [Theme][theme] |

**Recommendation:** prefer existing tokens for recurring design decisions. Add tokens when a value has a meaningful reusable role, not merely because a one-off number appears twice. Reset namespaces only when the task intentionally restricts the design system; a global reset can remove the utilities existing markup relies on.

### Semantic theming example

This combines ordinary runtime properties with named semantic utilities. It follows the documented `@theme inline` alias pattern and CSS variable scoping behavior: [Theme][theme]

```css
@import "tailwindcss";

@theme {
  --font-display: "Inter", sans-serif;
  --color-brand-600: oklch(0.55 0.19 260);
}

:root {
  --surface: #ffffff;
  --on-surface: #111827;
}

[data-theme="dark"] {
  --surface: #111827;
  --on-surface: #f9fafb;
}

@theme inline {
  --color-surface: var(--surface);
  --color-on-surface: var(--on-surface);
}
```

```html
<section class="bg-surface text-on-surface">…</section>
```

**Important distinction:** `inline` controls how a token's value is used in utilities; `static` controls whether theme variables are emitted even when unused. Neither is a replacement for source detection or a directive to generate every possible utility. The latter conclusion follows from combining theme emission behavior with Tailwind's candidate-based generation model. [Theme][theme] · [Detection][detection]

Shared theme CSS can be imported across projects or distributed as a package; no JavaScript config is needed solely to share tokens. [Theme: sharing][theme]

### Arbitrary values are a supported escape hatch

Tailwind v4 also supports dynamic **built-in utility values**: a grid can use `grid-cols-15` without extending a configuration scale, and numeric spacing/sizing utilities such as `w-17` derive their value from the `--spacing` multiplier (by default `0.25rem`). This is compiler-supported numeric syntax, not runtime class interpolation, and it does not mean every utility accepts every value. **Recommendation:** check whether a built-in v4 numeric utility already expresses the exact design before adding an arbitrary value or extending a v3-style scale. Boolean data attributes also have shorthand variants such as `data-current:*`; value comparisons still use forms such as `data-[state=open]:*`. [v4 announcement: dynamic utility values][release-40]

One-off values such as `top-[117px]`, a grid like `grid-cols-[16rem_minmax(0,1fr)]`, arbitrary properties such as `[mask-type:luminance]`, and arbitrary variants are documented features. They are not automatically code smells. When class syntax becomes hard to read, the official workflow also supports plain CSS and inline styles. [Custom styles][custom] · [Utility workflow][workflow]

For custom properties, v4 shorthand is `bg-(--brand-color)`, equivalent to `bg-[var(--brand-color)]`. Ambiguous namespaces may need type hints such as `text-(length:--label-size)` versus `text-(color:--label-color)`. Spaces inside arbitrary values are generally encoded as underscores; literal underscores sometimes need escaping, including preserving escapes in JSX strings. [Custom styles][custom]

**Recommendation:** avoid repeated unexplained magic values when a project token already expresses the intent. Do not impose “zero arbitrary values” or force unreadable CSS expressions into a class name.

## 4. Class detection, runtime data, and monorepos

### Complete class names are essential

Tailwind scans source as text rather than evaluating application code. It cannot infer an interpolated name such as `bg-${color}-600`. It can detect complete strings inside lookup maps, conditional expressions, and class-composition calls. [Detection][detection]

```jsx
// Bad: the resulting class names never appear in full in source.
const classes = `bg-${tone}-600 hover:bg-${tone}-700`;

// Good: each possible class name is complete and detectable.
const toneClasses = {
  primary: "bg-blue-700 text-white hover:bg-blue-800",
  danger: "bg-red-700 text-white hover:bg-red-800",
};
const classes = toneClasses[tone];
```

The same restriction applies to `w-[${width}px]`: arbitrary-value syntax does not turn Tailwind into a runtime compiler. For genuinely runtime values, use inline styles or a CSS variable with a static class. Both patterns are explicitly supported. [Detection][detection] · [Inline styles][workflow]

```html
<!-- The server renders a value; the class name stays static. -->
<div style="--progress: 63%" class="w-(--progress)">…</div>
```

**Recommendation:** use finite maps for semantic options such as size or intent; use CSS variables or inline styles for unbounded values from users, APIs, measurements, or a CMS. Validate those values using the application's existing data rules.

### Know the scan boundary

By default, Tailwind ignores gitignored files, `node_modules`, binary files, CSS files, and common package-manager lockfiles. Automatic detection starts from the build's working directory. `@source` explicitly adds paths relative to the stylesheet; `source(path)` sets the automatic-detection base. `source(none)` disables automatic detection so sources can be listed explicitly. [Detection][detection]

For example, given this hypothetical layout:

```text
apps/web/src/app.css
packages/ui/src/Button.tsx
```

```css
/* apps/web/src/app.css */
@import "tailwindcss" source(".");
@source "../../../packages/ui/src";
```

This makes the application source base explicit and includes shared UI source. It is a recipe to adapt to real paths, not a universal monorepo path. An installed UI package that ships Tailwind class strings can likewise need an explicit `@source`; scanning a library is not necessary just because it exists if it already ships the CSS it needs. The explicit-source mechanism is documented; the package decision is our recommendation. [Detection][detection]

### Safelisting is bounded and version-sensitive

On **v4.1+**, `@source inline()` generates known candidates absent from source, including variants and brace-expanded ranges; `@source not` excludes paths, and `@source not inline()` excludes candidates. [Detection][detection] · [v4.1][release-41]

```css
/* v4.1+; finite classes supplied by an external content contract */
@source inline("{hover:,focus:,}underline");
```

**Recommendation:** fix a missing scan path before adding a safelist. Prefer a finite candidate set over a broad palette × breakpoint × state expansion. For unbounded runtime data, a larger safelist is not a substitute for CSS variables. Do not copy v3 `safelist` configuration: that JavaScript option is unsupported in v4, and `inline()` requires v4.1+. [Directives][directives] · [v4.1][release-41]

## 5. Composition, reuse, custom CSS, and conflict control

### Prefer structure-aware reuse

The official workflow recommends components or template partials when styles and markup are reused across files. A loop already authors repeated markup once, and localized duplication can be inexpensive to maintain without another abstraction. Custom CSS remains reasonable when a partial would be disproportionate or when styling markup controlled by another system. [Utility workflow: duplication][workflow]

**Recommendation:** keep utilities close to the structure they style. Extract a reusable component when it represents a stable UI concept with repeated structure or behavior. Do not replace every long class list with `@apply`, and do not demand a component for every single styled element.

### Do not rely on class-string order to resolve conflicts

For conflicting utilities with the same effective cascade conditions, generated stylesheet order determines the winner, not the order in an HTML `class` attribute. The official example shows `grid flex` still resolving to `display: grid`. Upstream recommends supplying only the intended conflicting utility, often through explicit component options. [Utility workflow: conflicts][workflow]

```jsx
// Bad: appending a class does not establish an override contract.
<div className={`grid ${useFlex ? "flex" : ""}`} />

// Good: select the intended display mode.
<div className={useFlex ? "flex" : "grid"} />
```

This is not a ban on intentional combinations such as `p-4 px-6` or `flex md:grid`: their declarations or conditions differ. **Recommendation:** treat “base classes plus arbitrary consumer classes” as an API decision. Follow an existing merge/variant convention if the project has one; `clsx`, CVA, or a merge library is not an upstream requirement and should not be installed automatically.

### Cascade layers are part of the API

Tailwind imports the `theme`, `base`, `components`, and `utilities` layers. Put element defaults in `@layer base`, reusable custom component classes in `@layer components` when utility overrides should work, and register custom variant-compatible utilities with `@utility`. [Theme][theme] · [Custom styles][custom]

For normal declarations at the same origin and importance, **unlayered CSS outranks layered CSS**, independently of selector specificity. This matters when custom or third-party CSS unexpectedly beats a utility; merely reordering class names cannot fix it. `!important` has different layer precedence rules, so inspect the cascade rather than applying the normal-declaration rule indiscriminately. [W3C cascade layers][cascade]

```css
@layer components {
  .card {
    background-color: var(--color-white);
    border-radius: var(--radius-lg);
  }
}

/* A registered Tailwind utility can receive responsive/state variants. */
@utility content-auto {
  content-visibility: auto;
}
```

```html
<article class="card rounded-none lg:content-auto">…</article>
```

`@utility` supports functional utilities through `--value()` and `--modifier()` for theme values, typed bare values, arbitrary values, and modifiers. This is an advanced extension API; begin with built-in utilities or a simple custom utility, and gate newer helpers such as `--default()` on their release. In v4, simply placing a selector inside native `@layer utilities` does not register it as a Tailwind utility with variants. [Custom styles][custom] · [Upgrade][upgrade] · [Changelog][changelog]

### `@apply` and `@reference`: supported, with boundaries

`@apply` inlines existing utilities into custom CSS. The official example use case includes styling third-party components. It is supported; a blanket “never use `@apply`” claim would misstate the documentation. [Directives][directives]

CSS modules and Vue/Svelte/Astro component style blocks are processed separately and do not automatically know the application's theme, custom utilities, and custom variants. `@reference` makes that context available without duplicating the referenced stylesheet's emitted CSS. Reference the actual application stylesheet when customizations exist; `@reference "tailwindcss"` is sufficient only when the default context is all that is needed. [Directives][directives] · [Compatibility][compatibility]

```css
/* An independently processed component stylesheet. */
@reference "../app.css";

.third-party-label {
  @apply text-sm font-medium text-brand-600;
}
```

For plain declarations, referencing a global variable directly can avoid Tailwind processing in that file:

```css
.third-party-label {
  color: var(--color-brand-600);
}
```

The official compatibility guide recommends avoiding unnecessary CSS modules/style blocks because each is processed separately, multiplying work; using ordinary CSS variables instead of `@apply` can improve build performance. **Recommendation:** preserve existing architecture, use markup utilities by default, and use `@reference` deliberately when a separately processed file truly needs Tailwind expansion. Do not import the full Tailwind output into every component. [Compatibility][compatibility]

The v4 important modifier goes at the end (`bg-red-500!`), and a global `important` import option exists for integration with high-specificity CSS. Prefixes also exist (`@import "tailwindcss" prefix(tw)`, then `tw:bg-red-500`); the prefix behaves like a leading variant. **Recommendation:** use these only for a demonstrated integration or specificity problem, not as a default conflict strategy. [Utility workflow][workflow] · [Upgrade][upgrade]

## 6. Responsive layout and container queries

Unprefixed utilities apply at every viewport size. A prefixed utility such as `md:flex` starts at the `md` breakpoint and continues above it. `sm:` therefore does **not** mean “small/mobile devices.” The defaults are `sm: 40rem`, `md: 48rem`, `lg: 64rem`, `xl: 80rem`, and `2xl: 96rem`; project theme overrides can change them. [Responsive design][responsive]

```html
<!-- Bad if the intent is centered text on the narrowest screens. -->
<p class="sm:text-center">…</p>

<!-- Good: narrow layout first, then override. -->
<p class="text-center sm:text-left">…</p>
```

Stack minimum and maximum variants for a range, for example `md:max-xl:flex`. Define project breakpoints through `--breakpoint-*`; keep units consistent with each other because mixed units can lead to unexpected sorting. The default unit is `rem`. Arbitrary min/max breakpoints remain supported for genuine one-off conditions. [Responsive design][responsive]

Container queries respond to available **ancestor-container width** rather than viewport width. Mark an ancestor with `@container`, and apply variants such as `@md:flex-row` to descendants. Named containers (`@container/card`, `@md/card:*`) identify the intended ancestor when containers are nested. Container and viewport breakpoint scales are separate: default container `@md` is `28rem`, whereas viewport `md` is `48rem`. [Responsive design][responsive]

```html
<section class="@container/card">
  <article class="flex flex-col gap-4 @md/card:flex-row">
    …
  </article>
</section>
```

**Recommendation:** use viewport variants for page-level changes and container queries when a reusable component must adapt to its actual slot. A container variant on an element does not make that same element its own queried container. Test real narrow and wide slots; resizing only the viewport can miss component-specific failures. Prefer `gap` for flex/grid spacing where it describes the layout; the migration guide specifically recommends it when v4's changed `space-*` selectors cause problems. [Responsive design][responsive] · [Upgrade][upgrade]

## 7. States, accessible interaction, and dark mode

### Style real state rather than duplicating it

Tailwind includes variants for focus/hover/active, native form states, ARIA attributes, data attributes, parent `group-*` state, sibling `peer-*` state, and relational selectors such as `has-*`. A peer marker must be on a **previous sibling** of the styled element; CSS's subsequent-sibling relationship does not look backward. Named groups/peers can disambiguate nested interactions. [States][states]

**Recommendation:** bind styling to the component's existing semantic state, for example `aria-expanded:*` or `data-[state=open]:*`, rather than maintaining a second styling-only boolean. Setting ARIA or data attributes and providing behavior remain application responsibilities; matching a selector does not implement a widget. A button needs button behavior, including keyboard activation, as described by W3C's button pattern. [States][states] · [W3C button pattern][button-pattern]

```html
<button
  type="button"
  aria-expanded="false"
  class="rounded-md bg-blue-700 px-4 py-2 text-white enabled:hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-50 motion-safe:transition-colors"
>
  Show details
</button>
```

The application must update `aria-expanded` and implement the associated disclosure. The classes only illustrate state styling; they are not a complete disclosure implementation.

### Accessibility checks that matter

- **Visible focus:** WCAG requires a visible keyboard focus indicator. Preserve the browser outline or provide an intentional visible replacement; `focus-visible:*` targets `:focus-visible`, whose matching is determined by the browser. Do not treat `outline-none` as an accessibility solution. [WCAG focus visible][focus-visible] · [States][states] · [Upgrade: outlines][upgrade]
- **Hover is an enhancement:** v4's `hover:` styles are wrapped in `(hover: hover)`. Essential functionality must work without hover, especially on touch devices. The official guide explicitly recommends this. [Upgrade: mobile hover][upgrade]
- **Motion preferences:** `motion-reduce:` applies when reduced motion is requested; `motion-safe:` applies when it is not requested. Prefer opt-in nonessential motion where that keeps the rule simpler. [States: reduced motion][states]
- **Contrast and forced colors:** `contrast-more:` and `forced-colors:` expose user environment preferences. Replacing native control appearance may need an `appearance-auto` fallback in forced-colors mode. These variants do not establish that a palette passes a measured contrast requirement. [States][states]
- **Semantic content after resets:** Preflight removes heading/list presentation. Tailwind documents adding `role="list"` for intentionally unstyled lists because of VoiceOver behavior; keep meaningful heading and list structure while choosing presentation explicitly. [Preflight][preflight]

**Recommendation:** validate keyboard operation, actual disabled behavior, focus visibility, contrast in the chosen theme, reduced motion, and forced colors where controls are customized. A `disabled:*` visual style requires the corresponding state; muted color alone does not disable a control. Do not claim accessibility compliance merely because these classes exist.

### Choose and preserve a dark-mode strategy

By default `dark:` follows `prefers-color-scheme`. A manual class or attribute strategy is configured with `@custom-variant`; the official class-based recipe includes both the selected root and descendants: [Dark mode][dark]

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

An attribute-based equivalent is:

```css
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```

For light/dark/system preferences, the official guide combines a custom selector with `matchMedia`, persistence, and early initialization to avoid a flash of the wrong theme; rendering a preference from the server is also supported. **Recommendation:** follow the application's existing theme ownership and SSR/hydration conventions. Choose semantic runtime tokens for shared surface/text roles when appropriate, while keeping `dark:` for differences that genuinely need separate utilities. Test initial load as well as toggling. [Dark mode][dark] · [Theme aliases][theme]

## 8. Tooling and performance

The official Tailwind CSS IntelliSense extension supplies completions, linting, hover previews, and a language mode that understands Tailwind-specific CSS syntax. Generic CSS diagnostics can otherwise flag valid directives such as `@theme` and `@source`. **Recommendation:** prefer the Tailwind language mode and scoped tooling configuration over globally disabling useful CSS validation. [Editor setup][editor]

The official Prettier plugin sorts classes into upstream's recommended order. For **v4**, set `tailwindStylesheet` to the CSS entry so it can read the actual theme and custom utilities; the path is relative to the Prettier config. The current plugin requires Prettier 3+, is ESM-only, and must come last when combined with supported other Prettier plugins. [Prettier plugin][prettier]

```json
{
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindStylesheet": "./src/app.css"
}
```

**Recommendation:** use the repository's formatter rather than hand-maintaining an independent class-order convention. Formatting improves consistency; it is not a conflict resolver. Keep content boundaries intentional, avoid oversized safelists, avoid repeating the whole Tailwind build in component styles, and verify optimized production output after build-related changes. Those recommendations follow from candidate-based CSS generation, separate stylesheet processing, and the Vite integration guidance. [Detection][detection] · [Compatibility][compatibility] · [Vite][vite]

No general claim such as “v4 makes every app X times faster” is warranted by this research. Build integration, source volume, CSS modules, and application behavior vary; measure a concrete project's build time or output before claiming an improvement.

## 9. Migration traps to encode explicitly

These are review triggers rather than a complete migration procedure. The official upgrade tool requires Node.js 20+; upstream recommends running it on a new branch, reviewing the diff, and testing in a browser. [Upgrade][upgrade]

| v3 assumption or pattern | v4 implication and review action |
| --- | --- |
| `@tailwind` entry directives, `tailwindcss` PostCSS plugin, CLI bundled in core | Use CSS `@import`, the dedicated integration package, and the separate CLI. [Upgrade][upgrade] |
| `tailwind.config.js` is auto-detected | Load a legacy config explicitly with `@config` if preserving it. CSS-driven configuration is the new default. `corePlugins`, `safelist`, and `separator` are unsupported; do not recreate them blindly. [Directives][directives] · [Upgrade][upgrade] |
| `theme()` is the preferred CSS token interface; `resolveConfig()` supplies JS tokens | Prefer CSS theme variables; `theme()` is deprecated and the old `resolveConfig` export was removed. JavaScript can use CSS variable values or resolve them through `getComputedStyle` when needed. [Directives][directives] · [Upgrade][upgrade] |
| Default `border`/`divide` color is gray; `ring` means 3px blue | Defaults become `currentColor`; bare `ring` is 1px. Specify intended widths/colors explicitly and visually review focus treatments. [Upgrade][upgrade] |
| v3 shadow/radius/blur names preserve their exact appearance | Scale names changed; for example v3 `shadow-sm` becomes v4 `shadow-xs`, and v3 `shadow` becomes v4 `shadow-sm`. Audit against the official mapping rather than renaming by guesswork. [Upgrade][upgrade] |
| `outline-none` preserves the old invisible forced-color outline | v4 `outline-hidden` preserves that old behavior; `outline-none` now actually removes outline styling. Preserve or replace visible focus intentionally. [Upgrade][upgrade] |
| `space-*` and `divide-*` keep old sibling selectors | Their selectors changed. Review hidden/inline children and margin overrides; prefer flex/grid `gap` where appropriate. [Upgrade][upgrade] |
| `container` configuration supplies `center` and `padding` | Those configuration options no longer exist; extend `container` using `@utility` when required. `container` and `@container` serve different purposes. [Upgrade][upgrade] · [Responsive][responsive] |
| `@layer utilities { .foo { … } }` registers variant-aware utilities | v4 uses native layers; use `@utility` to register a real utility. [Upgrade][upgrade] |
| Right-to-left stacked variants | v4 applies variants left-to-right. Review order-sensitive combinations, especially child/typography variants. [Upgrade][upgrade] |
| `!bg-red-500`, `bg-[--brand]`, comma-for-space grid values, `tw-bg-red-500` | Prefer `bg-red-500!`, `bg-(--brand)`/explicit `var()`, underscore-for-space values, and variant-style `tw:bg-red-500` prefixes. [Upgrade][upgrade] |
| Tapping a touch screen reliably triggers `hover:*` | Default hover is restricted to hover-capable primary input devices. Keep necessary actions available without hover. [Upgrade][upgrade] |
| `transform-none` resets translation/rotation/scale | v4 uses individual transform properties; reset relevant properties explicitly and review transitions using `transition-[…]`. [Upgrade][upgrade] |
| Preflight defaults and `[hidden]` behave exactly as before | Placeholder colors, button cursor defaults, dialog margins, and hidden-attribute precedence changed. Review affected UI; v4's hidden attribute takes precedence over display classes. [Upgrade][upgrade] |
| A component CSS file can `@apply` the application's customized utilities without context | Use `@reference` to the application entry, or ordinary CSS variables if expansion is unnecessary. [Directives][directives] · [Compatibility][compatibility] |

**Recommendation:** keep migration guidance separate from everyday authoring. A new component should not trigger a wholesale migration; a migration must include visual checks, not only successful compilation.

## 10. Proposed future skill structure

This section is a proposal, not a statement that Tailwind prescribes an agent-skill architecture. The accepted scope and entry-plus-references structure from the refinement interview are recorded in section 12; the detailed reference organization below remains proposed.

Start with one **Tailwind CSS v4 usage** entry skill with concise decision rules and linked reference material. Split installation and migration into separate skills if their triggers and workflows become substantial. This avoids loading migration-only information for routine styling while retaining one clear default entry point.

| Proposed section or later split | What the agent must decide/do | Evidence for inclusion |
| --- | --- | --- |
| Version and project discovery | Identify resolved v4 version, integration, entry stylesheet, theme, prefixes, and source boundaries before editing. | Current docs include minor-specific features and integration packages. [Changelog][changelog] · [Installation][vite] |
| Everyday utility authoring | Choose existing tokens, complete static classes, appropriate arbitrary values, and runtime variables. | These are core documented authoring/detection rules. [Workflow][workflow] · [Detection][detection] |
| Theme and design-system work | Distinguish `@theme`/`:root`, inline/static, namespace resets, semantic roles, and shared theme CSS. | Each has different compiler/runtime behavior. [Theme][theme] |
| Layout and interaction | Choose viewport/container scope; style semantic state; preserve focus, motion preferences, and theme behavior. | These are independent variant mechanisms, not generic class decoration. [Responsive][responsive] · [States][states] · [Dark][dark] |
| Extension and reuse | Choose components, layered CSS, `@utility`, `@apply`, or `@reference` based on actual ownership and processing boundaries. | Official docs support each with different tradeoffs. [Custom styles][custom] · [Compatibility][compatibility] |
| Installation/integration, deferred beyond the first release | Configure the existing bundler, load CSS, assess Preflight/browser constraints, and prove output is present. | Setup differs by integration and global resets matter. [Vite][vite] · [PostCSS][postcss] · [Preflight][preflight] |
| v3-to-v4 migration, deferred beyond the first release | Run/review upgrade changes, preserve intended visuals, identify renamed defaults and selector changes. | Official migration has a distinct tool and review workflow. [Upgrade][upgrade] |
| Review/troubleshooting reference | Trace missing styles through source detection, validity/version, theme availability, CSS loading, and cascade. | These documented mechanisms explain different failure classes. [Detection][detection] · [Theme][theme] · [Cascade][cascade] |

### Candidate high-priority rules

1. Follow the README's supported-version contract and inspect the existing setup relevant to the task; omit routine unsupported-version triage.
2. Never construct class-name fragments; map finite options to complete candidates.
3. Use CSS variables/inline styles for unbounded runtime values.
4. Use `@theme` for utility-generating tokens and ordinary properties for runtime state; understand `inline` versus `static`.
5. Make monorepo/package source boundaries explicit when automatic detection misses them.
6. Resolve class conflicts by choosing intended styles or a documented component API; class-string order is not an override guarantee.
7. Start with narrow layouts; choose container queries for slot-dependent components.
8. Preserve semantic state, visible focus, touch usability, reduced motion, and the established dark-mode strategy.
9. Extract stable UI concepts; use custom CSS and `@apply` selectively with the right layer/context.
10. Verify generated CSS and browser behavior, especially after integration, theme, source, or migration changes.

These priorities are our synthesis of the cited findings. They should be tested against real tasks before becoming rigid agent instructions.

### Validation checklist for future implementation tasks

This is a menu of relevant checks derived from the mechanisms above, not a checklist mandated by upstream or required in full for every edit. The accepted verification policy is proportional: select checks that provide evidence for the behavior changed, reuse existing checks, and report anything that could not be verified.

- [ ] For version-sensitive recipes, respect their documented minimum release; the usage skill does not require routine unsupported-version triage.
- [ ] Use the existing build command and integration; confirm the application loads the resulting CSS entry/output.
- [ ] Verify representative classes from local templates, shared packages, and runtime option maps appear in production output.
- [ ] Check that a missing class is a valid utility for the installed version and configured theme before changing scan paths.
- [ ] Check theme aliases where consumed; verify variables needed outside detected utilities are emitted when required.
- [ ] Inspect computed styles/cascade for conflicting classes, layers, inline styles, and important declarations.
- [ ] Test the narrowest intended layout and relevant breakpoint edges; test container widths independently when using container queries.
- [ ] Exercise keyboard focus and activation, disabled states, pointer/touch behavior, and non-hover access to essential actions.
- [ ] Check light/dark initial rendering and toggles, actual contrast, reduced motion, and forced colors for customized controls.
- [ ] Review Preflight/third-party interactions and changed defaults during installation or migration.
- [ ] Run the repository's formatter and relevant existing checks; compare optimized CSS/build output when the change concerns performance.
- [ ] For migration, compare representative screens and interactions before/after rather than treating a successful build as proof of equivalence.

### Suggested future skill evaluations

Use small scenario fixtures with observable outcomes rather than checking whether the agent repeats the rules:

| Scenario | Successful outcome |
| --- | --- |
| Color prop builds `bg-${color}-600` and styles disappear in production | Agent replaces fragments with a finite full-class map and verifies production CSS. |
| A CMS supplies arbitrary colors or widths | Agent keeps the class static and uses a runtime property/style, without an unbounded safelist. |
| Shared monorepo package styles are absent | Agent identifies the real scan boundary and adds the minimal correct source path. |
| Scoped CSS cannot apply a custom token utility | Agent references the application's theme context without duplicating the whole stylesheet. |
| A component changes layout based on sidebar/main placement | Agent uses an actual ancestor container and verifies both available widths. |
| A recipe requires a release newer than the supported baseline | Its reference states the later requirement; baseline recipes do not accidentally depend on that feature. Unsupported-project diagnosis is outside the chosen skill workflow. |
| A semantic color resolves incorrectly under a nested theme | Agent diagnoses variable scope and selects an appropriate `@theme inline` alias. |
| Appended consumer classes fail to override a component | Agent inspects cascade/API behavior instead of merely reordering strings. |
| Migrated focus rings and shadows look wrong despite a passing build | Agent catches changed v4 defaults and restores the intended visual behavior explicitly. |

## 11. Limitations and implementation boundary

The original research reviewed documentation and source contracts, without compiling all illustrative snippets against every v4 release. Implementation has since added selected two-version compilation/browser checks and a Vue/Vite coding-agent fixture suite; see the [evaluation guide](../evals/README.md) for the precise coverage. This does not establish execution coverage for every snippet or every frontend framework.

Framework-specific integration details, third-party plugin compatibility, merge-library behavior, a particular team's token naming scheme, and a complete accessibility audit are outside the verified scope. Do not present a proposed React helper, token vocabulary, or abstraction style as a Tailwind requirement.

The refinement interview settled **v4.1 as the supported minimum**, documented in the README rather than enforced through routine unsupported-version checks. Later-feature requirements remain documented beside relevant recipes, and dependency upgrades are outside the routine workflow. The skill is named **tailwindcss**. Its entry-plus-references structure, authoring defaults, component-library boundaries, proportional verification, and promptfoo-based evaluation are also settled. Initial evaluations use Codex with a configurable model, repeated paired comparisons, and executable readiness checks. The earlier-version findings remain research evidence. The user confirmed shared understanding of all thirteen decisions and authorized implementation.

## 12. Proposal refinement: accepted decisions

The following thirteen decisions were settled across four interview rounds on 2026-10-27. Third-round answers refine the earlier version-check proposal. These are product decisions for the proposed skills, rather than additional claims about Tailwind itself.

| Decision | Accepted direction | Reason |
| --- | --- | --- |
| Primary job | Write, improve, and fix UI in existing Tailwind v4 projects. Defer installation and v3 migration beyond the first release. | Gives everyday authoring a clear purpose and limits unrelated workflows. |
| Framework scope | Framework-neutral core, with framework-specific references where processing or syntax differs. | Supports React, Vue, Svelte, Astro, and server-rendered templates without requiring one framework's helpers. |
| Version support | Tailwind v4.1+ as a README installation constraint. Document later-feature requirements in references; omit routine unsupported-version triage and automatic dependency upgrades. | The user installs the skill with knowledge of its constraints, so ordinary tasks should not repeat compatibility warnings or questions. |
| Policy strength | Enforce correctness; express maintainability choices as defaults that established project conventions can override unless they cause a concrete problem. | Separates broken behavior from context-dependent authoring choices. |
| Skill structure | One concise entry skill directing the agent to focused references for themes, class detection, layout/states, and custom CSS. Keep explanations and Incorrect/Correct examples in references. | Keeps core decisions accessible without loading all background material for every task. |
| Authoring defaults | Prefer equivalent `size-*` and `truncate` shorthands, `gap-*` for intended flex/grid layouts, and built-in v4 numeric utilities before unnecessary arbitrary values. Apply these to code being written or changed, preserve intentional differences, and avoid unrelated cleanup. | Encourages concise code without changing behavior merely to satisfy a style preference. |
| Design-system boundaries | Inspect existing tokens and component APIs; prefer existing semantic roles, variants, theme behavior, and composition helpers. Keep shadcn-specific requirements conditional on actual project conventions. | Respects component ownership without turning a particular design system into a universal Tailwind policy. |
| Verification effort | Scale verification to the change, reuse existing checks, and identify anything that could not be verified. Layout edits need affected-layout checks; source-detection fixes need production-output evidence; interactive-control changes need keyboard/state checks. | Verifies the changed behavior without imposing the full research checklist on every edit. |
| Name and activation | Name the skill `tailwindcss`. Use it for authoring, reviewing, and debugging Tailwind UI in existing projects; explain scope and support constraints in the README. | A simple public name works when the installation documentation makes the constraints clear. |
| Unsupported-project workflow | Do not add an older/unknown-version diagnosis, warning, or clarification branch to routine skill use. | The user explicitly chose an installation contract rather than defensive compatibility handling. |
| Evaluation framework | Use promptfoo. Validate version-sensitive examples and run behavior-based agent evaluations, comparing identical tasks with and without the skill. State exactly which framework examples and runtime behavior were checked. | Readiness requires evidence from generated code and behavior, not only a plausible document or prose-only grading. |
| Initial evaluation runtime | Use promptfoo's built-in Codex provider with a configurable model. Hold model, tools, permissions, task, and starting files constant between baseline and skill-enabled runs. Additional runtimes can follow later; the skill remains portable. | Provides a concrete initial runtime without making multi-runtime coverage a first-release requirement. |
| Readiness criteria | Start with three runs per task in each condition. Require critical executable checks to pass consistently; check builds, emitted CSS, relevant browser behavior, and unrelated edits. Prose grading is supplementary. Compile version-sensitive examples against the supported minimum and a current v4 release, and report comparisons honestly, including ties. | Repeated behavioral evidence supports readiness without assuming the skill must improve every already-successful baseline. |

The decision frontier is empty. The user confirmed the consolidated plan below; it now governs the skill and evaluation implementation.

### Consolidated implementation plan

1. Replace the placeholder entry skill with **tailwindcss**, focused on authoring, reviewing, and debugging UI in existing projects. Keep it concise, framework-neutral, and limited to task-relevant project inspection.
2. Add focused references for utility authoring/runtime values, theme tokens and dark mode, source detection, responsive layout and states, composition/custom CSS, and troubleshooting. Use concrete Incorrect/Correct examples and distinguish correctness requirements from contextual defaults.
3. Add a README describing installation, Tailwind v4.1+ support, scope exclusions, and the references. Keep fresh Tailwind installation, migration, routine unsupported-version triage, and automatic dependency upgrades outside this release.
4. Carry over shadcn's transferable shorthand and layout preferences while preserving behavior. Respect existing component variants, semantic roles, composition helpers, and theme ownership; apply shadcn-specific requirements only where the project uses them.
5. Build promptfoo baseline and skill-enabled evaluations using identical fresh fixture copies and the same configurable Codex model/settings. Install the skill and references only in the skill-enabled condition; isolate authoritative checkers from agent-editable files.
6. Cover the six initial task areas: missing classes, runtime values, theme aliases, separately processed CSS, responsive layout, and component overrides. Include relevant focus/state behavior, project conventions, and unrelated-edit checks within those scenarios. Evaluate activation separately from correctness.
7. Run three repetitions per task per condition, check actual artifacts and behavior, and retain evidence. Separately compile version-sensitive recipes at the minimum and a current supported v4 release. Iterate on failures and report measured outcomes and remaining limitations without claiming unobserved improvement.

### Promptfoo evaluation: implementation evidence

Promptfoo documents evaluating agent skills through equivalent tasks with different installed skill files while holding the model, permissions, and task environment constant. It distinguishes skill routing from task correctness: observing a skill-file read is evidence of activation, not evidence that the skill improved the result. [Agent-skills guide][promptfoo-skills]

Its built-in `openai:codex-sdk` provider supplies a coding-agent runtime. With `copy_working_dir: true`, evaluation steps get fresh workspace copies, and assertions can access the result directory through provider metadata before cleanup. Promptfoo supplies the evaluation orchestration; the provider supplies agent execution. [Codex provider][promptfoo-codex] · [Coding-agent guide][promptfoo-agents]

**Accepted evaluation design:** compare baseline and skill-enabled runs on identical fixtures, with the skill and references installed only in the latter. Use executable JavaScript assertions to inspect changed files, run production builds, check emitted CSS, and perform scenario-specific browser checks. Keep authoritative checkers outside the agent-editable fixture, preserve evidence before workspace cleanup, and repeat comparisons rather than treating one run as sufficient. Calling project build/browser checks from custom assertions is our chosen use of the documented assertion API; promptfoo does not automatically supply Tailwind-specific checks. [JavaScript assertions][promptfoo-assertions] · [Coding-agent guide][promptfoo-agents] · [Agent-skills guide][promptfoo-skills]

Use Codex initially, with the exact model configurable and recorded in results. Three repetitions per task in each condition are the initial comparison plan. Critical executable checks determine readiness; additional runtimes can follow later. Supporting multiple UI frameworks in the skill does not by itself establish evaluation coverage across multiple coding-agent runtimes.

### Additional reference: shadcn's skill

The user supplied the [shadcn skill][shadcn-skill] for comparison. Its [styling rules][shadcn-styling] and [customization guidance][shadcn-customization] were also reviewed. These are first-party guidance for shadcn projects, not universal Tailwind requirements. The latest commit touching the main skill observed here was [4233ed1][shadcn-skill-revision], dated 2026-10-14; this does not pin the revision of every linked rule file.

| Guidance in the reference | Adaptation consistent with the accepted second-round decisions |
| --- | --- |
| Prefer `size-*` for equal dimensions; `truncate` for single-line ellipsis. | Prefer equivalent shorthand when width/height conditions and overflow behavior really match; preserve intentional differences. |
| Use flex with `gap-*` rather than `space-*`. | Prefer `gap` when flex/grid expresses the intended layout. Do not add flex merely to replace margins: that can change layout behavior. |
| Use semantic colors and avoid manual dark color overrides. | Reuse existing semantic roles and theme behavior. Keep palette utilities and explicit `dark:` styling available when the project's design calls for them; do not invent semantic tokens for every one-off value. |
| Use built-in variants; reserve component instance classes for layout. | Prefer a component's public variants and documented customization points. Extend its appearance centrally when reuse warrants it; avoid bypassing its state/theme behavior through conflicting instance overrides. |
| Use `cn()` for conditional classes. | Follow an existing composition helper; do not require a React-specific helper or install one in a framework-neutral skill. |
| Let overlays own stacking and components own icon sizing. | Respect the detected component API and existing ownership. Do not globally prohibit z-index or icon sizing for custom components. |
| Keep critical rules concise and link focused Incorrect/Correct examples. | Use a short entry skill plus topic references with concrete examples, separating correctness requirements from contextual defaults. |

The shadcn references express different degrees of flexibility around `className`: the styling rules are strict while customization guidance documents extending components and using wrappers. The proposed general skill should inspect the actual component API and local conventions rather than turn one source sentence into a blanket prohibition. [Styling rules][shadcn-styling] · [Customization][shadcn-customization]

## Primary source index

All sources were checked for this report on 2026-10-27. Public documentation links are convenient reading targets; the pinned source tree records the docs snapshot. Version claims use release/tagged source links rather than assuming live docs describe v4.0.

- [Official Tailwind documentation source snapshot][docs-snapshot]
- [Latest release observed: v4.3.3][latest-release]
- [Released changelog at v4.3.3][changelog]
- [v4.0.0 compiler source][compiler-v4]
- [v4.0.5 release][release-405]
- [v4.0 announcement: dynamic utility values][release-40]
- [v4.1 announcement][release-41]
- [Installing with Vite][vite], [PostCSS][postcss], [CLI][cli], [Play CDN][cdn]
- [Theme variables][theme]
- [Detecting classes in source files][detection]
- [Styling with utility classes][workflow]
- [Adding custom styles][custom]
- [Functions and directives][directives]
- [Responsive design and container queries][responsive]
- [Hover, focus, and other states][states]
- [Dark mode][dark]
- [Compatibility][compatibility]
- [Preflight][preflight]
- [Upgrade guide][upgrade]
- [Editor setup][editor]
- [Official Prettier plugin README][prettier]
- [W3C CSS Cascading and Inheritance Level 5: layer ordering][cascade]
- [W3C WCAG 2.2 Understanding: Focus Visible][focus-visible]
- [W3C ARIA Authoring Practices: Button Pattern][button-pattern]
- [shadcn skill][shadcn-skill], [styling rules][shadcn-styling], and [customization guidance][shadcn-customization]
- [Promptfoo agent-skills guide][promptfoo-skills], [coding-agent guide][promptfoo-agents], [Codex provider][promptfoo-codex], and [JavaScript assertions][promptfoo-assertions]

[docs-snapshot]: https://github.com/tailwindlabs/tailwindcss.com/tree/7f92c2213315c195dae583d68752da4042da3ade/src/docs
[latest-release]: https://github.com/tailwindlabs/tailwindcss/releases/tag/v4.3.3
[changelog]: https://github.com/tailwindlabs/tailwindcss/blob/v4.3.3/CHANGELOG.md
[compiler-v4]: https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/index.ts
[release-405]: https://github.com/tailwindlabs/tailwindcss/releases/tag/v4.0.5
[release-40]: https://tailwindcss.com/blog/tailwindcss-v4#dynamic-utility-values-and-variants
[release-41]: https://tailwindcss.com/blog/tailwindcss-v4-1
[vite]: https://tailwindcss.com/docs/installation/using-vite
[postcss]: https://tailwindcss.com/docs/installation/using-postcss
[cli]: https://tailwindcss.com/docs/installation/tailwind-cli
[cdn]: https://tailwindcss.com/docs/installation/play-cdn
[theme]: https://tailwindcss.com/docs/theme
[detection]: https://tailwindcss.com/docs/detecting-classes-in-source-files
[workflow]: https://tailwindcss.com/docs/styling-with-utility-classes
[custom]: https://tailwindcss.com/docs/adding-custom-styles
[directives]: https://tailwindcss.com/docs/functions-and-directives
[responsive]: https://tailwindcss.com/docs/responsive-design
[states]: https://tailwindcss.com/docs/hover-focus-and-other-states
[dark]: https://tailwindcss.com/docs/dark-mode
[compatibility]: https://tailwindcss.com/docs/compatibility
[preflight]: https://tailwindcss.com/docs/preflight
[upgrade]: https://tailwindcss.com/docs/upgrade-guide
[editor]: https://tailwindcss.com/docs/editor-setup
[prettier]: https://github.com/tailwindlabs/prettier-plugin-tailwindcss#readme
[cascade]: https://www.w3.org/TR/css-cascade-5/#layer-order
[focus-visible]: https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html
[button-pattern]: https://www.w3.org/WAI/ARIA/apg/patterns/button/
[shadcn-skill]: https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/SKILL.md
[shadcn-styling]: https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/rules/styling.md
[shadcn-customization]: https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/customization.md
[shadcn-skill-revision]: https://github.com/shadcn-ui/ui/commit/4233ed1caded8c38f4bc14b14afe1f93ebcaf966
[promptfoo-skills]: https://www.promptfoo.dev/docs/guides/test-agent-skills/
[promptfoo-agents]: https://www.promptfoo.dev/docs/guides/evaluate-coding-agents/
[promptfoo-codex]: https://www.promptfoo.dev/docs/providers/openai-codex-sdk/
[promptfoo-assertions]: https://www.promptfoo.dev/docs/configuration/expected-outputs/javascript/
