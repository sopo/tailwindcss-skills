import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, rm, writeFile, readdir, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { cases } from '../cases.mjs';
import { evalRoot } from '../prepare.mjs';
import { checkWorkspace, scopeChanges } from '../check-workspace.mjs';
import { repair } from '../oracles.mjs';

test('prepared dependency links stay inside each fixture', async () => {
  for (const condition of ['baseline', 'skill']) {
    const base = join(evalRoot, 'fixtures', condition);
    async function walk(dir) {
      for (const entry of await readdir(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isSymbolicLink()) assert.ok((await realpath(path)).startsWith(base + '/'), `External fixture link: ${path}`);
        else if (entry.isDirectory()) await walk(path);
      }
    }
    await walk(join(base, 'node_modules'));
  }
});

test('checkers reject every broken fixture and accept equivalent repaired behavior', { timeout: 240000 }, async (t) => {
  for (const item of cases) {
    await t.test(item.id, async () => {
      const dir = await mkdtemp(join(tmpdir(), 'tailwind-checker-'));
      try {
        await cp(join(evalRoot, 'fixtures', 'baseline'), dir, { recursive: true, verbatimSymlinks: true });
        const broken = await checkWorkspace(dir, item.id);
        assert.equal(broken.pass, false, `Broken ${item.id} should fail`);
        assert.equal(broken.checks[0].pass, true, 'An unchanged fixture should pass scope checks');
        await repair(dir, item.id);
        const fixed = await checkWorkspace(dir, item.id);
        assert.equal(fixed.pass, true, JSON.stringify(fixed.checks, null, 2));
        await writeFile(join(dir, 'src', 'main.js'), '// Unrelated gallery functionality removed\n');
        const scope = await scopeChanges(dir, item.id);
        assert.ok(scope.unexpected.includes('src/main.js'), 'Unrelated changes must be rejected');
      } finally { await rm(dir, { recursive: true, force: true }); }
    });
  }
});
