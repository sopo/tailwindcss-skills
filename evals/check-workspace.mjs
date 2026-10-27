import { access, cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createServer } from 'node:http';
import { join, extname, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { fixtureFiles } from './cases.mjs';

const exec = promisify(execFile);
const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ignored = new Set(['node_modules', 'dist', '.agents', '.git']);
const editable = (scenario, file) => scenario === 'actions' || scenario === 'label'
  ? file === `src/${scenario}/App.vue`
  : file.startsWith(`src/${scenario}/`);

async function filesIn(dir, prefix = '') {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const name = prefix + entry.name;
    if (entry.isDirectory()) files.push(...await filesIn(join(dir, entry.name), name + '/'));
    else files.push(name);
  }
  return files;
}

export async function scopeChanges(dir, scenario) {
  const actual = new Set(await filesIn(dir));
  const changed = [];
  const unexpected = [];
  for (const file of new Set([...Object.keys(fixtureFiles), ...actual])) {
    let content;
    try { content = await readFile(join(dir, file), 'utf8'); } catch { content = undefined; }
    if (content !== fixtureFiles[file]) {
      changed.push(file);
      if (!editable(scenario, file)) unexpected.push(file);
    }
  }
  return { changed, unexpected };
}

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

async function serve(dir) {
  const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
  const server = createServer(async (req, res) => {
    try {
      const file = resolve(dir, '.' + new URL(req.url, 'http://localhost').pathname);
      invariant(file === resolve(dir) || file.startsWith(resolve(dir) + '/'), 'Invalid request path');
      const target = extname(file) ? file : join(file, 'index.html');
      const body = await readFile(target);
      res.writeHead(200, { 'Content-Type': mime[extname(target)] || 'application/octet-stream' });
      res.end(body);
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return { url: `http://127.0.0.1:${server.address().port}`, close: () => new Promise((resolve) => server.close(resolve)) };
}

const style = (page, selector, property) => page.locator(selector).evaluate((el, prop) => getComputedStyle(el)[prop], property);
const rgb = (hex) => 'rgb(' + [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ') + ')';

export async function verifyPage(page, scenario) {
  const checks = [];
  async function check(name, run) {
    try { await run(); checks.push({ name, pass: true }); }
    catch (error) { checks.push({ name, pass: false, reason: error.message }); }
  }
  if (scenario === 'status') {
    await check('primary tone', async () => invariant(await style(page, '#local', 'backgroundColor') === rgb('#164e63'), 'Primary badge background does not use its team palette'));
    await check('danger tone after toggle', async () => {
      await page.getByRole('button', { name: 'Toggle tone' }).click();
      invariant(await style(page, '#local', 'backgroundColor') === rgb('#a11937'), 'Danger tone did not update');
    });
    await check('shared package background', async () => invariant(await style(page, '#partner', 'backgroundColor') === rgb('#14532d'), 'Shared package style is absent'));
  }
  if (scenario === 'progress') {
    for (const [percentage, hex] of [[17.5, '#315b87'], [63, '#a73d51'], [91.25, '#147b6e'], [0, '#674193'], [100, '#b46e27']]) {
      await check(`runtime ${percentage}% ${hex}`, async () => {
        await page.getByLabel('Progress', { exact: true }).fill(String(percentage));
        await page.getByLabel('Color', { exact: true }).fill(hex);
        await page.waitForTimeout(30);
        const ratio = await page.locator('#fill').evaluate((el) => el.getBoundingClientRect().width / el.parentElement.getBoundingClientRect().width * 100);
        invariant(Math.abs(ratio - percentage) < 0.15, `Expected ${percentage}%, got ${ratio}%`);
        invariant(await style(page, '#fill', 'backgroundColor') === rgb(hex), `Runtime color ${hex} did not render`);
      });
    }
  }
  if (scenario === 'theme') {
    await check('light role', async () => {
      invariant(await style(page, '#light', 'backgroundColor') === rgb('#f8fafc'), 'Light surface changed');
      invariant(await style(page, '#light', 'color') === rgb('#172554'), 'Light content changed');
    });
    await check('nested dark roles', async () => {
      invariant(await style(page, '#themed', 'backgroundColor') === rgb('#0f172a'), 'Nested surface resolved at the wrong scope');
      invariant(await style(page, '#themed', 'color') === rgb('#e2e8f0'), 'Nested content resolved at the wrong scope');
      invariant(await page.locator('#themed').evaluate((el) => el.classList.contains('bg-surface') && el.classList.contains('text-content')), 'Semantic utility names were replaced');
    });
    await check('local theme toggle', async () => {
      await page.getByRole('button', { name: 'Toggle second theme' }).click();
      invariant(await style(page, '#themed', 'backgroundColor') === rgb('#f8fafc'), 'Second section did not toggle');
      invariant(await style(page, '#light', 'backgroundColor') === rgb('#f8fafc'), 'Local toggle changed the first section');
    });
  }
  if (scenario === 'label') {
    await check('caption color and weight', async () => {
      const caption = page.getByText('Account details', { exact: true });
      const actual = await caption.evaluate((el) => ({ color: getComputedStyle(el).color, weight: getComputedStyle(el).fontWeight }));
      invariant(actual.color === rgb('#6d28d9') && actual.weight === '600', `Caption has ${JSON.stringify(actual)}`);
    });
  }
  if (scenario === 'card') {
    await check('same viewport, independent slot layouts', async () => {
      invariant(await style(page, '.slot:first-child .card', 'flexDirection') === 'column', 'Narrow slot does not stack');
      invariant(await style(page, '.slot:last-child .card', 'flexDirection') === 'row', 'Wide slot does not use a row');
      invariant(await style(page, '.card >> nth=0', 'gap') === '16px', 'The card gap changed');
    });
    await check('container threshold follows slot changes', async () => {
      await page.locator('.slot').nth(0).evaluate((el) => el.style.width = '480px');
      await page.locator('.slot').nth(1).evaluate((el) => el.style.width = '400px');
      invariant(await style(page, '.slot:first-child .card', 'flexDirection') === 'row', 'Expanded slot did not switch to a row');
      invariant(await style(page, '.slot:last-child .card', 'flexDirection') === 'column', 'Shrunk slot did not stack');
    });
    await check('keyboard focus visible', async () => {
      await page.keyboard.press('Tab');
      const visible = await page.locator('button').first().evaluate((el) => {
        const s = getComputedStyle(el);
        return el === document.activeElement && ((s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 1) || s.boxShadow !== 'none');
      });
      invariant(visible, 'The action has no visible keyboard focus indicator');
    });
  }
  if (scenario === 'actions') {
    const button = page.getByRole('button', { name: 'Delete', exact: true });
    await check('existing destructive variant', async () => {
      invariant(await button.getAttribute('data-variant') === 'destructive', 'Existing destructive variant was not selected');
      invariant(await button.evaluate((el) => getComputedStyle(el).backgroundColor) === rgb('#b91c1c'), 'Light destructive background differs');
    });
    await check('theme behavior', async () => {
      await page.getByLabel('Dark theme', { exact: true }).check();
      invariant(await button.evaluate((el) => getComputedStyle(el).backgroundColor) === rgb('#fca5a5'), 'Dark destructive background differs');
      invariant(await button.evaluate((el) => getComputedStyle(el).color) === rgb('#450a0a'), 'Dark foreground differs');
    });
    await check('keyboard activation and focus', async () => {
      await page.getByLabel('Dark theme', { exact: true }).focus();
      await page.keyboard.press('Tab');
      invariant(await button.evaluate((el) => el === document.activeElement && getComputedStyle(el).outlineStyle !== 'none'), 'Button keyboard focus is lost');
      await page.keyboard.press('Enter');
      invariant(await page.locator('output').textContent() === '1', 'Keyboard activation failed');
    });
    await check('disabled behavior', async () => {
      await page.getByLabel('Disable action', { exact: true }).check();
      invariant(await button.isDisabled(), 'Native disabled state was lost');
      const before = await page.locator('output').textContent();
      await button.evaluate((el) => el.click());
      invariant(await page.locator('output').textContent() === before, 'Disabled action still activates');
    });
  }
  return checks;
}

export async function checkWorkspace(dir, scenario, artifactDir) {
  invariant(['status','progress','theme','label','card','actions'].includes(scenario), 'Unknown scenario');
  const scope = await scopeChanges(dir, scenario);
  const checks = [{ name: 'scope', pass: scope.unexpected.length === 0, reason: scope.unexpected.join(', ') }];
  let buildLog = '';
  try {
    const result = await exec(process.execPath, [join(dir, 'node_modules', 'vite', 'bin', 'vite.js'), 'build'], {
      cwd: dir, env: { ...process.env, SCENARIO: scenario }, timeout: 60000, maxBuffer: 2_000_000,
    });
    buildLog = result.stdout + result.stderr;
    checks.push({ name: 'production build', pass: true });
  } catch (error) {
    buildLog = String(error.stdout || '') + String(error.stderr || error.message);
    checks.push({ name: 'production build', pass: false, reason: buildLog.slice(-1500) });
  }
  if (checks.at(-1).pass) {
    const server = await serve(join(dir, 'dist'));
    let browser;
    try {
      browser = await chromium.launch();
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
      const pageErrors = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));
      await page.goto(server.url, { waitUntil: 'networkidle' });
      checks.push(...await verifyPage(page, scenario));
      checks.push({ name: 'browser runtime', pass: pageErrors.length === 0, reason: pageErrors.join('; ') });
      if (artifactDir) {
        await mkdir(artifactDir, { recursive: true });
        await page.screenshot({ path: join(artifactDir, 'page.png'), fullPage: true });
        const assets = await readdir(join(dir, 'dist', 'assets'));
        for (const file of assets.filter((f) => f.endsWith('.css'))) await cp(join(dir, 'dist', 'assets', file), join(artifactDir, file));
      }
    } catch (error) { checks.push({ name: 'browser check', pass: false, reason: error.message }); }
    finally { await browser?.close(); await server.close(); }
  }
  const result = { pass: checks.every((c) => c.pass), score: checks.filter((c) => c.pass).length / checks.length, checks, changed: scope.changed };
  if (artifactDir) {
    await mkdir(artifactDir, { recursive: true });
    await writeFile(join(artifactDir, 'checks.json'), JSON.stringify(result, null, 2));
    await writeFile(join(artifactDir, 'build.log'), buildLog);
    for (const file of scope.changed) {
      try {
        await mkdir(dirname(join(artifactDir, 'changed', file)), { recursive: true });
        await cp(join(dir, file), join(artifactDir, 'changed', file));
      } catch { /* Deletions remain recorded in checks.json. */ }
    }
  }
  return result;
}
