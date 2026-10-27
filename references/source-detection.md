# Source detection

Tailwind scans source files as text. First establish whether the missing candidate is a valid utility for the configured theme, and whether the compiled stylesheet reaches the page. Use [troubleshooting](troubleshooting.md) when the cause is uncertain.

## Follow the actual scan boundary

Automatic detection starts at the build's working directory. Gitignored files, `node_modules`, binary files, CSS files, and common lockfiles are excluded by default.

- `@source "path"` explicitly adds source paths relative to the stylesheet.
- `@import "tailwindcss" source("path")` sets the automatic scanning base relative to the stylesheet.
- `source(none)` disables automatic scanning when each source should be explicit.

For this layout:

```text
apps/web/src/app.css
packages/ui/src/Button.tsx
```

use paths calculated from the actual CSS entry:

```css
/* apps/web/src/app.css */
@import "tailwindcss" source(".");
@source "../../../packages/ui/src";
```

An installed dependency that ships utility class strings can require an explicit source. A library that already ships the required CSS does not automatically need to be scanned.

## Complete classes before safelisting

Incorrect for a finite application option:

```js
const className = `text-${statusColor}-700`;
```

Correct:

```js
const statusClasses = {
  success: "text-green-700",
  failure: "text-red-700",
};
```

Fix class construction or an omitted source path before expanding a safelist.

For a bounded external content contract that supplies known classes absent from local source, CSS safelisting is available:

```css
@source inline("{hover:,focus:,}underline");
```

`@source not "path"` excludes paths; `@source not inline("...")` excludes candidates. Keep exclusions and generated candidate sets targeted. Unbounded runtime data belongs in styles/custom properties rather than an ever-growing palette of candidates.

After changing detection, run the real production build and verify representative classes from both local and shared source in the resulting CSS. A development page alone may conceal an incomplete production pipeline.

Source: [detecting classes](https://tailwindcss.com/docs/detecting-classes-in-source-files).
