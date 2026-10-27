import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepare, root } from './prepare.mjs';

await prepare();
const smoke = process.argv.includes('--smoke');
const args = ['exec', 'promptfoo', 'eval', '-c', 'evals/promptfooconfig.mjs', '--no-cache', '--no-table', '--no-progress-bar', '--repeat', smoke ? '1' : '3', '--max-concurrency', '2', '-o', smoke ? '.eval/results/smoke.json' : '.eval/results/full.json'];
if (smoke) args.push('--filter-first-n', '1');
const env = { ...process.env, PROMPTFOO_DISABLE_TELEMETRY: '1', PROMPTFOO_CONFIG_DIR: join(root, '.eval', 'promptfoo') };
// Ambient API variables can override an otherwise valid ChatGPT login.
if (process.env.CODEX_AUTH_MODE !== 'api') {
  delete env.OPENAI_API_KEY;
  delete env.CODEX_API_KEY;
}
const child = spawn('pnpm', args, {
  cwd: root, stdio: 'inherit',
  env,
});
process.exitCode = await new Promise((resolve) => {
  child.once('error', (error) => { console.error(error); resolve(1); });
  child.once('exit', (code) => resolve(code ?? 1));
});
