import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const [major, minor] = process.versions.node.split('.').map(Number);
if (major !== 24 || minor < 12) throw new Error('Use Node 24.12 or later in the Node 24 line');
const all = [];
function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (['node_modules','.git','dist','build','coverage','artifacts','.cache','.toolchains','.gradle'].includes(entry)) continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path); else all.push(path);
  }
}
walk(root);
for (const path of all.filter(p => p.endsWith('.json'))) JSON.parse(readFileSync(path, 'utf8'));
for (const path of all.filter(p => /\.(ts|mjs)$/.test(p))) {
  const result = spawnSync(process.execPath, ['--check', path], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`Syntax check failed: ${relative(root, path)}\n${result.stderr}`);
}
for (const name of ['README.md','docs/status.md','docs/validation.md','docs/architecture.md',
  'docs/roadmap.md','docs/requirements.md','packages/contracts/openapi.json',
  'database/migrations/0001_initial.sql','.env.example']) readFileSync(join(root,name));
const forbidden = ['Quick', 'Nook'].join('');
for (const path of all.filter(p => /\.(md|ts|mjs|json|sql|svg)$/.test(p))) {
  const text = readFileSync(path, 'utf8');
  if (text.includes(forbidden)) throw new Error(`Forbidden former brand in ${relative(root,path)}`);
  if (/-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/.test(text)) throw new Error('Unexpected private key material');
}
console.log(`PASS: Node version, JSON parsing, TS/JS syntax, required files and basic source-content checks (${all.length} files).`);
console.log('This command checks source structure/syntax only. Run pnpm typecheck, test, build and check:android; see reports for actual browser/Android evidence.');
