const fs = require('fs');
const path = require('path');

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      walk(full, out);
    } else if (entry.isFile()) {
      if (full.endsWith('.ts') || full.endsWith('.tsx')) out.push(full);
    }
  }
  return out;
}

const srcRoot = path.join(process.cwd(), 'src');
const files = walk(srcRoot);

const tCall = /\bt\(\s*(['"])(.*?)\1\s*(?:,|\))/gs;
const phrases = new Set();

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = tCall.exec(text))) {
    const phrase = match[2].replace(/\s+/g, ' ').trim();
    if (phrase) phrases.add(phrase);
  }
}

const i18nPath = path.join(process.cwd(), 'src/lib/i18n.tsx');
const i18n = fs.readFileSync(i18nPath, 'utf8');
const esIdx = i18n.indexOf('es: {');
if (esIdx === -1) {
  console.error('Could not locate `es: {` in src/lib/i18n.tsx');
  process.exit(1);
}

let idx = esIdx + 'es: {'.length;
let depth = 1;
while (idx < i18n.length && depth > 0) {
  const c = i18n[idx++];
  if (c === '{') depth++;
  else if (c === '}') depth--;
}

const esBlock = i18n.slice(esIdx, idx);
const keyPat = /(['"])(.*?)\1\s*:\s*/g;
const keys = new Set();
let keyMatch;
while ((keyMatch = keyPat.exec(esBlock))) keys.add(keyMatch[2]);

const missing = [...phrases].filter((p) => !keys.has(p)).sort();

console.log(`Total t() phrases: ${phrases.size}`);
console.log(`Spanish keys present: ${keys.size}`);
console.log(`Missing Spanish translations: ${missing.length}`);
console.log('');
missing.forEach((m) => console.log(m));
