// main.ts — hands in the Vice Palms GTA VI trophy guide (gta6-trophy-guide-01).
// Node 22, standard library only. Copies this repository's app/ (the static
// offline tracker: index.html, styles, ES modules and the data files) and
// screenshots/ into the output directory, then writes dossier.json there
// with the kit's vendored buildDossier, byte for byte as the scorer builds
// it. MAKEFUN_OUTPUT_DIR stands in for /output outside the grader.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const DOSSIER_CAP_BYTES = 1572864; // 1.5 MiB, the scorer's dossier.json limit

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function deliverTree(name: string): void {
  const from = join(repoDir, name);
  const to = join(outputDir, name);
  mkdirSync(to, { recursive: true });
  if (existsSync(from)) cpSync(from, to, { recursive: true });
}

mkdirSync(outputDir, { recursive: true });
deliverTree('app');
deliverTree('screenshots');

const dossierBytes = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossierBytes);

// Report what was actually delivered, and refuse loudly rather than hand in
// an entry the scorer would reject for an oversized dossier.
function treeStats(dir: string): { files: number; bytes: number } {
  let files = 0;
  let bytes = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = treeStats(path);
      files += sub.files;
      bytes += sub.bytes;
    } else if (entry.isFile()) {
      files += 1;
      bytes += statSync(path).size;
    }
  }
  return { files, bytes };
}

const appStats = treeStats(join(outputDir, 'app'));
const shotStats = treeStats(join(outputDir, 'screenshots'));
const dossierSize = statSync(join(outputDir, 'dossier.json')).size;
console.log(`delivered app/: ${appStats.files} files, ${appStats.bytes} bytes`);
console.log(`delivered screenshots/: ${shotStats.files} files, ${shotStats.bytes} bytes`);
console.log(`dossier.json: ${dossierSize} bytes (cap ${DOSSIER_CAP_BYTES})`);
if (dossierSize > DOSSIER_CAP_BYTES) {
  console.error('ERROR: dossier.json exceeds the 1.5 MiB cap; the entry would be refused.');
  process.exit(1);
}
