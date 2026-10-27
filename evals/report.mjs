import { readFile, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { evalRoot, root } from './prepare.mjs';
import { cases } from './cases.mjs';
import { summarize } from './summarize.mjs';

const input = process.argv.slice(2).find((arg) => !arg.startsWith('--')) || join(evalRoot, 'results', 'full.json');
const data = JSON.parse(await readFile(input, 'utf8'));
const rows = data.results?.results;
if (!Array.isArray(rows) || rows.length === 0) throw new Error('No promptfoo rows found; no behavior result can be reported.');
const summary = summarize(rows, cases.map((item) => item.id));
const toolchain = JSON.parse(await readFile(join(root, 'package.json'), 'utf8')).devDependencies;
const requestedModel = data.config?.providers?.[0]?.config?.model || 'not recorded';
const effort = data.config?.providers?.[0]?.config?.model_reasoning_effort || 'not recorded';
const lines = ['# Promptfoo evaluation results', '', `Evaluation: ${data.evalId}. Requested model: **${requestedModel}**, reasoning: **${effort}**.`, '', `Complete 36-run comparison: **${summary.complete ? 'yes' : 'no'}**. Skill-enabled critical checks consistently pass: **${summary.skillPasses ? 'yes' : 'not established'}**. Skill-read evidence in every task area: **${summary.routingObserved ? 'yes' : 'not established'}**.`, '', '| Scenario / condition | Passes | Provider errors | Skill reads (heuristic) | Mean provider seconds | Total tokens |', '| --- | --- | --- | --- | --- | --- |'];
for (const value of summary.groups) lines.push(`| ${value.scenario} / ${value.condition} | ${value.passes}/${value.runs} | ${value.errors} | ${value.reads}/${value.runs} | ${(value.latencyMs / value.runs / 1000).toFixed(1)} | ${value.tokens} |`);
const total = (condition) => summary.groups.filter((g) => g.condition === condition).reduce((sum, g) => sum + g.passes, 0);
lines.push('', `Observed passing runs: baseline **${total('baseline')}**, skill-enabled **${total('skill')}**.`, '');
if (total('baseline') === total('skill')) lines.push('The conditions tied on task pass count. This comparison does not establish a correctness advantage for the skill on these tasks.', '');
const usage = (condition) => {
  const groups = summary.groups.filter((g) => g.condition === condition);
  const runs = groups.reduce((sum, g) => sum + g.runs, 0);
  return { tokens: groups.reduce((sum, g) => sum + g.tokens, 0), seconds: groups.reduce((sum, g) => sum + g.latencyMs, 0) / runs / 1000 };
};
const baseline = usage('baseline');
const skill = usage('skill');
lines.push(`Reported total tokens (including cached input): baseline **${baseline.tokens.toLocaleString('en-US')}**, skill-enabled **${skill.tokens.toLocaleString('en-US')}**. Mean provider latency: baseline **${baseline.seconds.toFixed(1)}s**, skill-enabled **${skill.seconds.toFixed(1)}s**. Token totals are usage measurements, not a bill.`, '');
let recipes;
try { recipes = JSON.parse(await readFile(join(evalRoot, 'results', 'recipes.json'), 'utf8')); } catch { recipes = []; }
lines.push('Recipe compilation/browser checks: ' + (recipes.length ? recipes.map((r) => `Tailwind ${r.version}: **${r.pass ? 'passed' : 'failed'}**`).join('; ') : '**not recorded**') + '.', '', 'Passes require executable artifact checks. Skill reads indicate routing only. Three repetitions are a small local regression sample, not statistical proof of general improvement. Vue/Vite is the executable agent fixture; this does not demonstrate execution coverage of every supported frontend framework or agent runtime.', '', `Toolchain: Node ${process.version}; promptfoo ${toolchain.promptfoo}; Codex SDK ${toolchain['@openai/codex-sdk']}. Raw JSON: \`${relative(root, resolve(root, input))}\`; evidence and screenshots remain under \`.eval/results/artifacts/\` (ignored local output).`, '', 'See the [evaluation guide](README.md) for assertions, authentication, isolation, environment limits, and reproduction commands.', '');
const output = join(evalRoot, 'results', 'summary.md');
await writeFile(output, lines.join('\n'));
if (process.argv.includes('--save')) {
  if (!summary.complete) throw new Error('Refusing to save an incomplete comparison as the package result.');
  await writeFile(join(root, 'evals', 'RESULTS.md'), lines.join('\n'));
}
console.log(lines.join('\n'));
