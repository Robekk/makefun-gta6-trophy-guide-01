// Leonida Nights — GTA VI trophy guide & tracker: the hand-in program.
//
// What this program does, in order:
//   1. Finds the output directory (MAKEFUN_OUTPUT_DIR, or /output when the
//      grader runs it) and makes sure it exists.
//   2. Copies this repository's app/ folder (the whole static guide: HTML,
//      CSS, ES modules and the trophy/roadmap JSON) into the output.
//   3. Copies screenshots/ (the maker's own renders of the guide) alongside.
//   4. Asks the vendored make.fun library to build the dossier — the summary
//      the judge reads — from the copied files, and writes it as
//      /output/dossier.json.
//
// The dossier has to come from the kit's own buildDossier, byte for byte:
// the scorer rebuilds it with its own copy of vendor/makefun-frontend.ts and
// compares. So this file only does the copying and the caps, and never tries
// to shape the dossier itself.
//
// Node 22, standard library only. It reads nothing over the network and its
// output depends only on the files beside it, so two runs write the same
// bytes.

import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

// The caps the scorer holds an entry to (the bounty's gate): the text block
// is capped at 160 KiB, at most 4 screenshots of at most 256 KiB each, and
// app/ at most 993 files and directories and 48 MiB in all.
const GATE_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

const repoDir = fileURLToPath(new URL(".", import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

function copyIntoOutput(name) {
  const from = join(repoDir, name);
  if (!existsSync(from)) return false;
  cpSync(from, join(outputDir, name), { recursive: true });
  return true;
}

mkdirSync(outputDir, { recursive: true });
copyIntoOutput("app");
mkdirSync(join(outputDir, "screenshots"), { recursive: true });
copyIntoOutput("screenshots");

const dossierBytes = buildDossier(outputDir, GATE_CAPS);

// The gate refuses a dossier over 1.5 MiB. buildDossier's own caps keep this
// entry far under that, but if a future edit ever pushed it over, failing
// loudly here — before anything is written — beats handing in an entry the
// scorer rejects on size alone.
const DOSSIER_MAX_BYTES = 1_572_864;
if (dossierBytes.byteLength > DOSSIER_MAX_BYTES) {
  console.error(
    `main.ts: dossier.json would be ${dossierBytes.byteLength} bytes, over the 1.5 MiB gate limit (${DOSSIER_MAX_BYTES}); refusing to write it`,
  );
  process.exit(1);
}
writeFileSync(join(outputDir, "dossier.json"), dossierBytes);

// A one-line summary of what was handed in, so a human running this outside
// the grader can see the entry is whole without opening the dossier.
function measureTree(dir) {
  let files = 0;
  let bytes = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = measureTree(path);
      files += sub.files;
      bytes += sub.bytes;
    } else {
      files += 1;
      bytes += statSync(path).size;
    }
  }
  return { files, bytes };
}

const appTree = measureTree(join(outputDir, "app"));
const shotTree = measureTree(join(outputDir, "screenshots"));
console.log(
  `main.ts: handed in app/ (${appTree.files} files, ${appTree.bytes} bytes), ` +
    `screenshots/ (${shotTree.files} files, ${shotTree.bytes} bytes), ` +
    `dossier.json (${dossierBytes.byteLength} bytes)`,
);
