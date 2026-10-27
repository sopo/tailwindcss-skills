import { join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';
import { checkWorkspace } from './check-workspace.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));

export default async function assertWorkspace(output, context) {
  const metadata = context.providerResponse?.metadata;
  if (!metadata?.workingDir) return { pass: false, score: 0, reason: 'Agent returned no isolated workspace; behavior was not evaluated.' };
  const condition = context.provider?.label || context.provider?.id || 'unknown';
  const scenario = context.vars.scenario;
  const artifacts = join(root, '.eval', 'results', 'artifacts', `${scenario}-${String(condition).replace(/[^a-zA-Z0-9_-]/g, '_')}-${randomUUID()}`);
  try {
    const result = await checkWorkspace(metadata.workingDir, scenario, artifacts);
    const skills = metadata.skillCalls || [];
    await mkdir(artifacts, { recursive: true });
    await writeFile(join(artifacts, 'agent.json'), JSON.stringify({ condition, scenario, model: process.env.CODEX_MODEL || 'gpt-6-sol', skillCalls: skills, output }, null, 2));
    const failed = result.checks.filter((item) => !item.pass);
    return {
      pass: result.pass, score: result.score,
      reason: result.pass ? `Executable checks passed. Evidence: ${artifacts}` : failed.map((c) => `${c.name}: ${c.reason}`).join('\n'),
      namedScores: { correctness: result.pass ? 1 : 0, scope: result.checks[0].pass ? 1 : 0, skillRead: skills.some((s) => s.name === 'tailwindcss') ? 1 : 0 },
    };
  } catch (error) { return { pass: false, score: 0, reason: `Checker failed: ${error.message}` }; }
}
