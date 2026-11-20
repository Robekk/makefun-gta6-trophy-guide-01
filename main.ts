// Entry program for the Leonida Trophy Guide (gta6-trophy-guide-01).
//
// The guide itself is the static web app in app/ — plain HTML, CSS and ES
// modules with no build step, which a browser opens at app/index.html and
// which loads nothing over the network. This program's only job is the
// handover: copy app/ and screenshots/ from beside this file into the output
// directory, then write dossier.json there with the vendored make.fun
// library (vendor/makefun-frontend.ts — leave it untouched; the scorer
// requires dossier.json to be byte for byte what its own copy produces).
//
// Node 22, standard library only. Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// (MAKEFUN_OUTPUT_DIR stands in for the grader's /output.)
// Serve the app itself with `node serve.ts`, then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The limits passed to buildDossier are the scorer's own caps: dossier text
// is cut at 160 KiB, screenshots are capped at 4 files of 256 KiB, and app/
// at 993 files totalling 48 MiB.
const DOSSIER_LIMITS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

function copyTree(from, to) {
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

mkdirSync(outputDir, { recursive: true });
copyTree(join(repoDir, 'app'), join(outputDir, 'app'));
if (existsSync(join(repoDir, 'screenshots'))) {
  copyTree(join(repoDir, 'screenshots'), join(outputDir, 'screenshots'));
} else {
  mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
}

function countFiles(dir) {
  let count = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    count += entry.isDirectory() ? countFiles(join(dir, entry.name)) : 1;
  }
  return count;
}

const dossier = buildDossier(outputDir, DOSSIER_LIMITS);
writeFileSync(join(outputDir, 'dossier.json'), dossier);

// Report what was handed over, and fail loudly rather than hand in a
// dossier the scorer would refuse: dossier.json is capped at 1.5 MiB.
const dossierBytes = Buffer.byteLength(dossier);
const DOSSIER_MAX_BYTES = 1572864; // 1.5 MiB
if (dossierBytes > DOSSIER_MAX_BYTES) {
  console.error(`dossier.json is ${dossierBytes} bytes — over the 1.5 MiB cap`);
  process.exit(1);
}
const copiedFiles = countFiles(join(outputDir, 'app')) + countFiles(join(outputDir, 'screenshots'));
console.log(`Leonida Trophy Guide: copied ${copiedFiles} files; dossier.json is ${dossierBytes} bytes.`);
