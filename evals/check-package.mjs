import { readFile, readdir, stat } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const entry = await readFile(join(root, 'SKILL.md'), 'utf8');
if (!/^---\nname: tailwindcss\ndescription: .+\n---/m.test(entry)) throw new Error('Skill needs its agreed name and a meaningful frontmatter description');
const files = ['SKILL.md', 'README.md', ...(await readdir(join(root, 'references'))).map((name) => 'references/' + name)];
for (const name of files) {
  const text = await readFile(join(root, name), 'utf8');
  if ((text.match(/^```/gm) || []).length % 2) throw new Error(`Unbalanced fences: ${name}`);
  if (/TODO|FIXME|A brief description|First step|Describe when/.test(text)) throw new Error(`Unfinished scaffold: ${name}`);
  for (const match of text.matchAll(/\[[^\]]+\]\(([^)#]+)(?:#[^)]*)?\)/g)) {
    if (/^https?:/.test(match[1])) continue;
    await stat(resolve(root, dirname(name), match[1]));
  }
}
console.log(`Skill package checks passed (${files.length} documents, all local pointers resolve).`);
