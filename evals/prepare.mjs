import { cp, mkdir, rm, readFile, writeFile, access, symlink, realpath } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { fixtureFiles } from './cases.mjs';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const evalRoot = join(root, '.eval');

export async function prepare() {
  const fixtureRoot = join(evalRoot, 'fixtures');
  const deps = join(evalRoot, 'dependencies');
  await mkdir(deps, { recursive: true });
  await writeFile(join(deps, 'package.json'), fixtureFiles['package.json']);
  const lock = await readFile(join(root, 'evals', 'fixture-package-lock.json'));
  const digest = createHash('sha256').update(lock).digest('hex');
  try {
    await access(join(deps, 'node_modules', '.bin', 'vite'));
    if ((await readFile(join(deps, 'installed-lock.sha256'), 'utf8')) !== digest) throw new Error('Dependency lock changed');
  }
  catch {
    await writeFile(join(deps, 'package-lock.json'), lock);
    execFileSync('npm', ['ci', '--ignore-scripts', '--no-audit', '--no-fund'], { cwd: deps, stdio: 'inherit' });
    await writeFile(join(deps, 'installed-lock.sha256'), digest);
  }
  for (const condition of ['baseline', 'skill']) {
    const dir = join(fixtureRoot, condition);
    await rm(dir, { recursive: true, force: true });
    await mkdir(dir, { recursive: true });
    for (const [name, content] of Object.entries(fixtureFiles)) {
      await mkdir(dirname(join(dir, name)), { recursive: true });
      await writeFile(join(dir, name), content);
    }
    // npm materializes dependencies here; copies contain no external pnpm links.
    await cp(join(deps, 'node_modules'), join(dir, 'node_modules'), { recursive: true, force: true, verbatimSymlinks: true });
    if (condition === 'skill') {
      const skill = join(dir, '.agents', 'skills', 'tailwindcss');
      await mkdir(skill, { recursive: true });
      await cp(join(root, 'SKILL.md'), join(skill, 'SKILL.md'));
      await cp(join(root, 'references'), join(skill, 'references'), { recursive: true });
    }
  }
  // An isolated Codex home avoids inheriting personal Codex instructions/plugins.
  // Reuse login through a link rather than copying credentials into the project.
  const codexHome = join(evalRoot, 'codex-home');
  await mkdir(codexHome, { recursive: true, mode: 0o700 });
  if (process.env.CODEX_AUTH_MODE !== 'api') {
    const loginHome = process.env.CODEX_LOGIN_HOME || join(homedir(), '.codex');
    const auth = await realpath(join(loginHome, 'auth.json'));
    try { await access(join(codexHome, 'auth.json')); }
    catch { await symlink(auth, join(codexHome, 'auth.json')); }
  }
  await mkdir(join(evalRoot, 'results'), { recursive: true });
  console.log('Prepared baseline and skill fixtures; original sources are untouched by evaluation runs.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await prepare();
