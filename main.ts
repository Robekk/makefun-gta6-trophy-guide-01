// main.ts — entrypoint for the Leonida Trophy Guide (make.fun program/v1).
//
// What it does, in order:
//   1. finds the directory this file lives in (the repository root inside
//      the grader's read-only /bot mount),
//   2. copies app/ and screenshots/ from beside itself into the output
//      directory (MAKEFUN_OUTPUT_DIR when set, /output otherwise),
//   3. builds the dossier from that output directory with the kit's
//      buildDossier and writes it to <output>/dossier.json.
//
// Node 22, standard library only. It never touches the network, and two
// runs over the same repository produce the same bytes.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoDir = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// The dossier's own ceiling: dossier_matches refuses anything larger.
const DOSSIER_MAX_BYTES = 1572864;

// The two payload trees the entry hands in. Everything else in the
// repository (this file included) stays behind.
const payloadTrees = ["app", "screenshots"];

function stagePayloadTrees(): void {
  mkdirSync(outputDir, { recursive: true });
  for (const tree of payloadTrees) {
    const source = join(repoDir, tree);
    if (!existsSync(source)) {
      throw new Error(`main.ts: expected ${tree}/ beside main.ts, not found`);
    }
    cpSync(source, join(outputDir, tree), { recursive: true });
  }
}

/** Counts the files and bytes of a staged tree, for the run summary. */
function measureTree(dir: string): { files: number; bytes: number } {
  let files = 0;
  let bytes = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = measureTree(path);
      files += sub.files;
      bytes += sub.bytes;
    } else if (entry.isFile()) {
      files += 1;
      bytes += statSync(path).size;
    }
  }
  return { files, bytes };
}

function writeDossier(): void {
  const dossierBytes = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  });
  if (dossierBytes.byteLength > DOSSIER_MAX_BYTES) {
    console.error(
      `main.ts: dossier.json would be ${dossierBytes.byteLength} bytes, ` +
      `over the ${DOSSIER_MAX_BYTES}-byte cap — refusing to hand in`,
    );
    process.exit(1);
  }
  writeFileSync(join(outputDir, "dossier.json"), dossierBytes);

  const app = measureTree(join(outputDir, "app"));
  const shots = measureTree(join(outputDir, "screenshots"));
  console.log(
    `main.ts: delivered app/ (${app.files} files, ${app.bytes} bytes), ` +
    `screenshots/ (${shots.files} files, ${shots.bytes} bytes), ` +
    `dossier.json (${dossierBytes.byteLength} bytes) to ${outputDir}`,
  );
}

stagePayloadTrees();
writeDossier();
