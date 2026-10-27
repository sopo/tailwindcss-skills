// Known repairs validate checker sensitivity. Never copied into an agent fixture.
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function repair(dir, scenario) {
  const app = join(dir, 'src', scenario, 'App.vue');
  const css = join(dir, 'src', scenario, 'app.css');
  let source = await readFile(app, 'utf8');
  if (scenario === 'status') {
    source = source.replace("'bg-team-' + tone.value + ' text-white px-3 py-2'", "({ primary: 'bg-team-primary text-white px-3 py-2', danger: 'bg-team-danger text-white px-3 py-2' })[tone.value]");
    await writeFile(css, await readFile(css, 'utf8') + '@source "../../packages/ui";\n');
  }
  if (scenario === 'progress') {
    source = source.replace("'h-8 w-[' + progress.value + '%] bg-[' + color.value + ']'", "'h-8'");
    source = source.replace(':class="fillClass"', ':class="fillClass" :style="{ width: progress + \'%\', backgroundColor: color }"');
  }
  if (scenario === 'theme') await writeFile(css, (await readFile(css, 'utf8')).replace('@theme {', '@theme inline {'));
  if (scenario === 'label') source = source.replace('<style scoped>', '<style scoped>\n@reference "./app.css";');
  if (scenario === 'card') source = source.replace('class="slot"', 'class="slot @container/card"').replace('md:flex-row', '@md/card:flex-row').replace('outline-none', 'focus-visible:outline-2 focus-visible:outline-blue-700');
  if (scenario === 'actions') source = source.replace('variant="primary"', 'variant="destructive"');
  await writeFile(app, source);
}
