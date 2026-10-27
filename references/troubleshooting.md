# Troubleshooting styles

Follow the failing behavior from the page to its cause; stop once the requested result is verified.

| Observation | Next evidence to inspect |
| --- | --- |
| No Tailwind styles reach the page | The actual CSS entry import, existing integration, build errors, and loaded output |
| One class is absent from generated CSS | Whether it exists as a complete source string, whether its source is scanned, and whether the theme/API defines it |
| Class exists but loses | Computed styles: declarations, variants, layers, inline styles, and importance |
| Semantic color changes at the root but not in a nested theme | Custom-property definition scope and `@theme inline` alias resolution |
| Scoped CSS cannot expand a custom utility | Its `@reference` context, not another full Tailwind import |
| Responsive class works in one placement only | The actual ancestor query container, its width, and whether a viewport or container variant was intended |
| Hover behavior disappears on touch | Essential activation/state behavior independent of hover |

For source problems, read [source detection](source-detection.md); for aliases, read [themes](themes.md); for overrides/scoped CSS, read [composition](composition.md).

Distinguish source facts from application behavior. A production build proving a utility exists does not prove that it wins the cascade or that the interaction works. Conversely, one development page looking correct does not establish production detection for a shared package or alternate runtime option.

Make the smallest correction that addresses the observed cause. Preserve the working integration, use targeted source declarations, and verify the affected case without unrelated refactors.
