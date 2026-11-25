// Comparaison octet pour octet entre le site fabriqué (_site/) et ce que GitHub Pages
// publie depuis la branche en mode « Deploy from a branch » (Jekyll, fichiers sans en-tête
// recopiés tels quels).
//
// Référence = fichiers suivis par git dans une révision (HEAD par défaut, ou --ref <révision>),
// moins ce que Jekyll ne publie jamais : tout chemin dont un élément commence par « _ », « . »
// ou « # », finit par « ~ », est dans node_modules/ ou vendor/, ou figure dans « exclude » du
// _config.yml de cette révision.
//
// Valable pour l'étape 1 de la migration : tant que les pages ne contiennent pas de Liquid,
// la sortie doit être identique à la source. Après l'étape 3, ce contrôle sera remplacé par
// une comparaison « avant / après » entre deux fabrications.
//
// Usage : node _outils/comparer-sortie.mjs [--ref main] [--sortie _site]
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const arg = (nom, defaut) => { const i = process.argv.indexOf(nom); return i > 0 ? process.argv[i + 1] : defaut; };
const REF = arg("--ref", "HEAD");
const SORTIE = arg("--sortie", "_site");
const git = (...a) => execFileSync("git", a, { maxBuffer: 64 << 20 });

// Liste « exclude » du _config.yml de la révision (forme simple : « - motif » sous « exclude: »).
function exclusionsJekyll() {
  let cfg = "";
  try { cfg = git("show", `${REF}:_config.yml`).toString(); } catch { return []; }
  const out = []; let dedans = false;
  for (const ligne of cfg.split("\n")) {
    if (/^exclude:\s*$/.test(ligne)) { dedans = true; continue; }
    if (dedans) {
      const m = ligne.match(/^\s+-\s+["']?([^"'#]+?)["']?\s*(#.*)?$/);
      if (m) out.push(m[1].replace(/\/$/, ""));
      else if (/^\S/.test(ligne)) dedans = false;
    }
  }
  return out;
}

const EXCLUS = exclusionsJekyll();
const publieParJekyll = (chemin) => {
  const morceaux = chemin.split("/");
  if (morceaux.some((m) => /^[_.#]/.test(m) || m.endsWith("~"))) return false;
  if (morceaux.some((m) => m === "node_modules" || m === "vendor")) return false;
  return !EXCLUS.some((x) => chemin === x || chemin.startsWith(x + "/"));
};

const reference = git("ls-tree", "-r", "-z", "--name-only", REF).toString().split("\0").filter(Boolean).filter(publieParJekyll);

function lister(dossier) {
  const out = [];
  for (const nom of readdirSync(dossier)) {
    const p = join(dossier, nom);
    if (statSync(p).isDirectory()) out.push(...lister(p)); else out.push(relative(SORTIE, p).split("\\").join("/"));
  }
  return out;
}
const fabrique = lister(SORTIE);

const empreinte = (buf) => createHash("sha256").update(buf).digest("hex");
const ecarts = [];
const setRef = new Set(reference), setFab = new Set(fabrique);
for (const f of reference) if (!setFab.has(f)) ecarts.push(`MANQUE dans ${SORTIE}/ : ${f}`);
for (const f of fabrique) if (!setRef.has(f)) ecarts.push(`EN TROP dans ${SORTIE}/ (non publié aujourd'hui) : ${f}`);
let identiques = 0;
for (const f of reference) {
  if (!setFab.has(f)) continue;
  const a = git("show", `${REF}:${f}`);
  const b = readFileSync(join(SORTIE, f));
  if (empreinte(a) === empreinte(b)) identiques++;
  else ecarts.push(`DIFFÉRENT : ${f} (${a.length} octets publiés aujourd'hui, ${b.length} fabriqués)`);
}

// Fichiers internes qui ne doivent jamais être publiés, quel que soit l'hébergeur.
const INTERDITS = /^(docs|_outils|_data|_includes|_layouts|node_modules|\.github)\/|^(package(-lock)?\.json|eleventy\.config\.js|LISEZ-MOI\.md|_config\.yml|\.nvmrc|\.gitignore)$/;
for (const f of fabrique) if (INTERDITS.test(f)) ecarts.push(`INTERNE PUBLIÉ : ${f}`);

console.log(`Référence ${REF} (règles Jekyll, exclusions : ${EXCLUS.join(", ") || "aucune"}) : ${reference.length} fichiers publiés.`);
console.log(`${SORTIE}/ : ${fabrique.length} fichiers ; identiques octet pour octet : ${identiques}.`);
if (ecarts.length) {
  console.log(`${ecarts.length} écart(s) :\n  ${ecarts.join("\n  ")}`);
  process.exit(1);
}
console.log("Aucun écart : la sortie est identique au site publié depuis la branche, et aucun fichier interne n'est publié.");
