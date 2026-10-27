import { compile as currentCompile } from '@tailwindcss/node';
import { compile as minimumCompile } from 'tailwind-node-minimum';
import { chromium } from 'playwright';
import { createRequire } from 'node:module';
import { mkdtemp, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { skillRoot, evalRoot } from './prepare.mjs';

const require = createRequire(import.meta.url);
const blocks = (text, lang) => [...text.matchAll(new RegExp('```' + lang + '\\n([\\s\\S]*?)```', 'g'))].map((m) => m[1]);
const utilities = await readFile(join(skillRoot, 'references/utilities.md'), 'utf8');
const themes = await readFile(join(skillRoot, 'references/themes.md'), 'utf8');
const layout = await readFile(join(skillRoot, 'references/layout-and-states.md'), 'utf8');
const composition = await readFile(join(skillRoot, 'references/composition.md'), 'utf8');
const sourceDoc = await readFile(join(skillRoot, 'references/source-detection.md'), 'utf8');
const semantic = blocks(themes, 'css').find((b) => b.includes('@import'));
const container = blocks(layout, 'html').find((b) => b.includes('@container/card'));
const html = blocks(utilities, 'html').join('\n') + container + `
<div id="semantic" class="bg-surface text-on-surface">Theme</div>
<div id="numeric" class="size-10 truncate">Numeric</div>
<div id="dynamic-width" class="w-17">Width</div>
<div id="custom" class="lg:content-auto">Custom</div>
<p class="label">Brand</p>`;
const candidates = [...html.matchAll(/class="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/));
const results = [];
const browser = await chromium.launch();
try {
  for (const [version, moduleName, compiler] of [
    ['4.1.0', 'tailwindcss-minimum', minimumCompile],
    ['4.3.3', 'tailwindcss', currentCompile],
  ]) {
    const dir = await mkdtemp(join(tmpdir(), 'tailwind-recipes-'));
    try {
      const cssPath = require.resolve(moduleName + '/index.css');
      const css = semantic.replace('@import "tailwindcss";', `@import "${cssPath}";`) + '\n' +
        blocks(composition, 'css').find((b) => b.startsWith('@utility')) + '\n' +
        '@theme static { --color-export-only: #123456; --color-brand: #6d28d9; }\n';
      await writeFile(join(dir, 'app.css'), css);
      await mkdir(join(dir, 'component'));
      const component = blocks(composition, 'css').find((b) => b.startsWith('@reference'));
      const app = await compiler(css, { base: dir, onDependency() {} });
      const scoped = await compiler(component, { base: join(dir, 'component'), onDependency() {} });
      // Real source scanning also sees complete utility strings in a component's @apply.
      const applied = [...component.matchAll(/@apply ([^;]+);/g)].flatMap((m) => m[1].split(/\s+/));
      const output = app.build([...candidates, ...applied]) + '\n' + scoped.build([]);
      if (!output.includes('--color-export-only')) throw new Error('Static token emission failed');
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
      await page.setContent(`<main style="--brand:#123456;--label-size:19px">${html}</main>`);
      await page.addStyleTag({ content: output });
      const actual = await page.evaluate(() => {
        const styles = (selector) => getComputedStyle(document.querySelector(selector));
        const numeric = styles('#numeric');
        const semantic = styles('#semantic');
        const label = styles('.label');
        return {
          size: [numeric.width, numeric.height], width: styles('#dynamic-width').width, ellipsis: numeric.textOverflow,
          semantic: [semantic.backgroundColor, semantic.color],
          scoped: [label.color, label.fontSize],
          custom: styles('#custom').contentVisibility,
        };
      });
      if (JSON.stringify(actual.size) !== JSON.stringify(['40px','40px'])) throw new Error('size utility behavior differs');
      if (actual.width !== '68px') throw new Error('Numeric width utility behavior differs');
      if (actual.ellipsis !== 'ellipsis') throw new Error('truncate behavior differs');
      if (JSON.stringify(actual.semantic) !== JSON.stringify(['rgb(255, 255, 255)', 'rgb(17, 24, 39)'])) throw new Error('Semantic aliases differ');
      if (JSON.stringify(actual.scoped) !== JSON.stringify(['rgb(109, 40, 217)', '14px'])) throw new Error('Referenced utility expansion differs: ' + JSON.stringify(actual.scoped));
      if (actual.custom !== 'auto') throw new Error('Variant-aware custom utility is absent');
      await page.locator('#semantic').evaluate((el) => el.parentElement.setAttribute('data-theme', 'dark'));
      const nested = await page.locator('#semantic').evaluate((el) => getComputedStyle(el).backgroundColor);
      if (nested !== 'rgb(17, 24, 39)') throw new Error('Nested semantic theme did not resolve');
      for (const value of blocks(sourceDoc, 'css').filter((b) => b.includes('@source inline'))) {
        const built = await compiler(`@import "${cssPath}";\n${value}`, { base: dir, onDependency() {} });
        if (!built.build([]).includes('.underline')) throw new Error('Inline source recipe did not generate its candidates');
      }
      results.push({ version, pass: true, actual, nested, coverage: ['published HTML candidates','numeric/shorthand utilities','semantic aliases','static tokens','@reference/@apply','custom utility variants','CSS safelisting'] });
      await page.close();
    } finally { await rm(dir, { recursive: true, force: true }); }
  }
} finally { await browser.close(); }
await mkdir(join(evalRoot, 'results'), { recursive: true });
await writeFile(join(evalRoot, 'results', 'recipes.json'), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
