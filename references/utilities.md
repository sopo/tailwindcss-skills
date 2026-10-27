# Utility authoring

## Finite options and runtime values

Tailwind scans text for complete candidate classes. Select whole class strings for known options; it cannot infer fragments assembled by application code.

Incorrect:

```js
const classes = `bg-${tone}-700 hover:bg-${tone}-800`;
```

Correct:

```js
const tones = {
  primary: "bg-blue-700 text-white hover:bg-blue-800",
  danger: "bg-red-700 text-white hover:bg-red-800",
};
const classes = tones[tone];
```

Conditional expressions and existing helpers such as `clsx`, `cn`, or a framework's class binding work when their strings contain complete classes. Use the project's convention.

For a measured width, API color, or other unbounded runtime value, keep the utility static and supply the value as a style/custom property. Arbitrary-value brackets do not turn Tailwind into a runtime compiler.

Incorrect:

```js
const classes = `w-[${progress}%]`;
```

Correct HTML after the application supplies the value:

```html
<div style="--progress: 63%" class="w-(--progress)">Progress</div>
```

Inline `width: 63%` is also appropriate. Preserve the application's validation rules for values supplied by users or external data.

## Built-in numeric utilities and arbitrary syntax

Numeric spacing utilities derive from `--spacing`. With its default `0.25rem`, `w-17` is `4.25rem`; it needs no scale extension. Grids such as `grid-cols-15` are built in as well. Use these when they express the actual design; a changed spacing token changes the derived value.

Use arbitrary syntax for values that genuinely need it:

```html
<div class="grid grid-cols-[16rem_minmax(0,1fr)] gap-4">...</div>
<div class="top-[117px]">...</div>
<div class="bg-(--brand) text-(length:--label-size)">...</div>
```

`bg-(--brand)` is shorthand for `bg-[var(--brand)]`. Add a type hint when a namespace is ambiguous: `text-(color:--label-color)` versus `text-(length:--label-size)`. Encode spaces within class values with underscores; preserve escaping for literal underscores in the host language.

Prefer a meaningful existing token to repeated unexplained values. Keep one-off values local; creating a global token merely to avoid brackets adds an API the design may not need.

## Equivalent shorthand

| Equivalent existing intent | Preferred shorthand |
| --- | --- |
| `w-10 h-10` under the same conditions | `size-10` |
| `overflow-hidden text-ellipsis whitespace-nowrap` | `truncate` |
| Spacing between intended flex/grid children | `gap-*` |

Preserve different width/height conditions, multiline text behavior, wrapping, and intentional margins. Converting a block stack to flex solely to replace `space-y-*` changes its formatting context.

For conflicting classes, choose the intended candidate rather than reorder strings:

```jsx
// Incorrect: both display utilities can be present.
<div className={`grid ${useFlex ? "flex" : ""}`} />

// Correct: exactly the selected display utility.
<div className={useFlex ? "flex" : "grid"} />
```

Combinations such as `p-4 px-6` or `flex md:grid` can express intentional differences. Inspect their declarations and conditions before treating them as conflicts.

Sources: [class detection](https://tailwindcss.com/docs/detecting-classes-in-source-files), [utility workflow](https://tailwindcss.com/docs/styling-with-utility-classes), [custom styles](https://tailwindcss.com/docs/adding-custom-styles), [v4 dynamic values](https://tailwindcss.com/blog/tailwindcss-v4#dynamic-utility-values-and-variants).
