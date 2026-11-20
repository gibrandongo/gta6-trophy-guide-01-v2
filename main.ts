// Leonida Platinum Route — the gta6-trophy-guide-01 v2 entry program.
//
// What it hands in: this directory's app/ folder, a plain offline static web app
// (index.html, app.js, style.css and data/trophies.json — ES modules and CSS, no
// build step, nothing loaded over the network), plus screenshots/ with four real
// headless-Chrome renders of the built app. The app is a story-ordered journey
// map across Leonida's districts: 9 chapters, 55 stops, one per official trophy,
// each with its own-words guide, difficulty and time estimate, missable flag and
// named sources; a district map with trophy pins is the home view, and the
// checklist tracker with export/import and a spoiler setting sits behind it.
//
// The program copies app/ and screenshots/ from beside this file into the output
// directory and writes dossier.json with the vendored make.fun library, the
// summary the judge reads. vendor/makefun-frontend.ts must stay untouched: the
// scorer rebuilds the dossier with its own identical copy and compares the two
// byte for byte.
//
// Plain JavaScript syntax only, standard library only, Node 22 target.
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Outside the grader MAKEFUN_OUTPUT_DIR stands in for /output; inside the
// grader the output directory is /output.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(source, target) {
  mkdirSync(target, { recursive: true });
  cpSync(source, target, { recursive: true });
}

// Fail loudly before copying anything if the guide is incomplete: a missing
// index.html or trophy list must never hand in as a partial entry.
for (const needed of ['app/index.html', 'app/data/trophies.json', 'app/app.js', 'app/style.css']) {
  if (!existsSync(join(here, needed))) throw new Error(`missing required file: ${needed}`);
}

// The guide itself: every file under app/ goes to the output as-is.
copyTree(join(here, 'app'), join(out, 'app'));

// The four screenshots: the district map home view, a chapter route view, a
// trophy detail view and the tracker view. Only real renders of this app.
if (existsSync(join(here, 'screenshots'))) {
  copyTree(join(here, 'screenshots'), join(out, 'screenshots'));
}

// The scorer's caps: text_max_bytes is the dossier text cap (163,840 bytes);
// the screenshot and app caps refuse an entry the sealed scorer would refuse
// (at most 4 screenshots, each at most 256 KiB; app/ at most 993 files and
// directories and 48 MiB — app/ shares /output's own 1000-entry cap with
// screenshots/ and dossier.json, so the totals leave room).
const dossier = buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 });
writeFileSync(join(out, 'dossier.json'), dossier);
console.log(`Leonida Platinum Route written to ${out} (${dossier.length} byte dossier).`);
