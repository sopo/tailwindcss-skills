# Themes and runtime tokens

## Choose the correct token mechanism

| Need | Mechanism |
| --- | --- |
| Register a token-driven utility/variant | Top-level `@theme` |
| Ordinary runtime/scoped custom property | `:root`, a selector, or an inline property |
| Register a utility whose token aliases another property | `@theme inline` |
| Emit declared theme properties even when otherwise unused | `@theme static` |

Namespaces carry meaning: `--color-*` creates color utilities, `--font-*` font families, `--text-*` font sizes, `--breakpoint-*` viewport variants, and `--container-*` container variants and related sizes. A property declared only in `:root` does not itself register named utilities.

Incorrect when `bg-brand` is expected to exist:

```css
:root {
  --color-brand: #1d4ed8;
}
```

Correct:

```css
@theme {
  --color-brand: #1d4ed8;
}
```

Alternatively, keep an ordinary property and use a static utility such as `bg-(--brand)`.

## Alias runtime theme roles with inline values

Use existing semantic roles when the design system has them. `inline` makes generated utilities consume the referenced property directly, so aliases can resolve in the scope of the element using the utility.

```css
@import "tailwindcss";

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
<section class="bg-surface text-on-surface">...</section>
```

Without `inline`, an alias can resolve where its theme property is defined, rather than where a nested theme supplies its referenced property. Test nested scopes when fixing this problem.

`static` concerns variable emission, not alias resolution or class detection. It does not generate every possible utility. Use it for declared tokens that must be available independently of detected utility usage; ordinary scoped properties can also express runtime values.

## Extend the intended design vocabulary

Redefining a token overrides its value. `--color-*: initial` removes the default color namespace before replacements; `--*: initial` removes all default theme tokens. Those resets can invalidate existing markup, so use them only when replacing the design system is part of the request.

Share theme declarations through imported CSS when needed. Custom CSS can consume tokens directly, for example `color: var(--color-brand)`, without expanding a utility through `@apply`.

## Preserve dark-mode ownership

By default, `dark:` follows `prefers-color-scheme`. A manual class strategy uses:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

An existing attribute strategy can instead use:

```css
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```

Preserve the application's preference storage, early initialization, and server rendering conventions. Semantic roles can change via runtime properties; explicit `dark:` utilities remain useful for differences outside those roles. Inspect both initial rendering and toggles after a theme change.

Sources: [theme variables](https://tailwindcss.com/docs/theme), [dark mode](https://tailwindcss.com/docs/dark-mode).
