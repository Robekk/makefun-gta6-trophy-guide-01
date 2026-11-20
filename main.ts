// Leonida Nights — hand-in program for the gta6-trophy-guide-01 entry (Node 22, standard library only).
//
// The guide itself is the static web app in app/ (open app/index.html in a browser; it works fully
// offline). This program delivers it: it copies app/ and screenshots/ from beside this file into the
// output directory and writes dossier.json there with the vendored make.fun library, byte for byte the
// dossier the scorer rebuilds and compares. vendor/makefun-frontend.ts stays untouched on purpose.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The gate refuses a dossier.json over 1.5 MiB; better to fail loudly here than hand in a dud.
const DOSSIER_MAX_BYTES = 1572864;

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's caps for this bounty: the dossier text is cut at 160 KiB, at most 4 screenshots of
// 256 KiB each ride along, and app/ may hold at most 993 entries and 48 MiB.
const DOSSIER_OPTIONS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

function copyTree(fromDir: string, toDir: string): void {
  mkdirSync(toDir, { recursive: true });
  cpSync(fromDir, toDir, { recursive: true });
}

interface TreeSummary {
  files: number;
  bytes: number;
}

// Walk a delivered tree and total it, so the run reports exactly what was handed in.
function summarizeTree(dir: string): TreeSummary {
  const summary: TreeSummary = { files: 0, bytes: 0 };
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      const inner = summarizeTree(full);
      summary.files += inner.files;
      summary.bytes += inner.bytes;
    } else if (entry.isFile()) {
      summary.files += 1;
      summary.bytes += statSync(full).size;
    }
  }
  return summary;
}

function deliverGuide(): void {
  const appSource = join(repoDir, 'app');
  if (!existsSync(appSource)) {
    throw new Error(`no app/ directory beside main.ts (looked in ${repoDir})`);
  }
  mkdirSync(outputDir, { recursive: true });
  copyTree(appSource, join(outputDir, 'app'));

  const shotsSource = join(repoDir, 'screenshots');
  const shotsTarget = join(outputDir, 'screenshots');
  mkdirSync(shotsTarget, { recursive: true });
  if (existsSync(shotsSource)) copyTree(shotsSource, shotsTarget);

  const dossier = buildDossier(outputDir, DOSSIER_OPTIONS);
  const dossierBytes = Buffer.byteLength(dossier);
  if (dossierBytes > DOSSIER_MAX_BYTES) {
    throw new Error(
      `dossier.json would be ${dossierBytes} bytes, over the 1.5 MiB gate cap (${DOSSIER_MAX_BYTES}): ` +
        'trim the app or the screenshots and run again',
    );
  }
  writeFileSync(join(outputDir, 'dossier.json'), dossier);

  const appSummary = summarizeTree(join(outputDir, 'app'));
  const shotsSummary = summarizeTree(join(outputDir, 'screenshots'));
  console.log(
    `delivered to ${outputDir}: app ${appSummary.files} files / ${appSummary.bytes} bytes, ` +
      `screenshots ${shotsSummary.files} files / ${shotsSummary.bytes} bytes, dossier.json ${dossierBytes} bytes`,
  );
}

deliverGuide();
