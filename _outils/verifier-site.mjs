// Contrôles du site fabriqué (lot F) : adresses, liens, sécurité, règles de contenu, budgets.
// Usage : node _outils/verifier-site.mjs [--sortie _site]
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname, posix } from "node:path";

const arg = (nom, defaut) => { const i = process.argv.indexOf(nom); return i > 0 ? process.argv[i + 1] : defaut; };
const SORTIE = arg("--sortie", "_site");
const ecarts = []; let verifs = 0;
const ok = (cond, msg) => { verifs++; if (!cond) ecarts.push(msg); };
const lister = (dossier) => readdirSync(dossier).flatMap((n) => {
  const p = join(dossier, n);
  return statSync(p).isDirectory() ? lister(p) : [relative(SORTIE, p).split("\\").join("/")];
});
const fichiers = lister(SORTIE);
const pages = fichiers.filter((f) => f.endsWith(".html")).sort();
const lire = (f) => readFileSync(join(SORTIE, f), "utf8");
const texte = (h) => h.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, "").replace(/\u00a0|&nbsp;/g, " ");
const LEGALES = /^pages\/(mentions-legales|cgv|politique-confidentialite)\.html$/;

// 1. Chaque adresse publiée avant la refonte a toujours sa page (CDC 2.1 : aucune adresse ne change).
const ANCIENNES = ["index.html", "404.html", "publics-accompagnes.html", "pages/a-propos.html", "pages/activite-physique-adaptee.html",
  "pages/blog.html", "pages/blog/activite-physique-sante-cardiovasculaire.html", "pages/cgv.html", "pages/coaching-sportif.html",
  "pages/conseils-nutritionnels.html", "pages/contact.html", "pages/mentions-legales.html", "pages/politique-confidentialite.html",
  "sitemap.xml", "robots.txt", "favicon.ico", "manifest.json", "CNAME"];
for (const a of ANCIENNES) ok(fichiers.includes(a), `adresse perdue : /${a}`);
ok(fichiers.includes("pages/tarifs.html"), "page Tarifs absente");

// 2. Fichiers internes jamais publiés.
const INTERDITS = /^(docs|_outils|_data|_includes|_js|_images-source|node_modules|\.github)\/|^(package(-lock)?\.json|eleventy\.config\.js|LISEZ-MOI\.md|_config\.yml|\.nvmrc|\.gitignore)$/;
for (const f of fichiers) ok(!INTERDITS.test(f), `fichier interne publié : ${f}`);

// 3. Liens internes, ancres, images, icônes : tous résolus.
const ids = new Map(pages.map((p) => [p, new Set([...lire(p).matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))]));
const cible = (depuis, url) => {
  let [chemin, ancre] = url.split("#");
  chemin = chemin.split("?")[0];
  let f = chemin === "" ? depuis : chemin.startsWith("/") ? chemin.slice(1) : posix.join(dirname(depuis), chemin);
  if (f === "" || f.endsWith("/")) f += "index.html";
  return { f, ancre };
};
let liens = 0;
for (const p of pages) {
  const h = lire(p);
  const urls = [...h.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1])
    .concat([...h.matchAll(/\ssrcset="([^"]+)"/g)].flatMap((m) => m[1].split(",").map((s) => s.trim().split(/\s+/)[0])));
  for (const u of urls) {
    if (/^(https?:|mailto:|tel:)/.test(u)) continue;
    liens++;
    const { f, ancre } = cible(p, u);
    ok(fichiers.includes(f), `${p} : lien cassé « ${u} »`);
    if (ancre && f.endsWith(".html") && ids.has(f) && !f.startsWith("images")) ok(ids.get(f).has(ancre), `${p} : ancre absente « ${u} »`);
    if (ancre && f.endsWith(".svg")) ok(readFileSync(join(SORTIE, f), "utf8").includes(`id="${ancre}"`), `${p} : symbole absent « ${u} »`);
  }
}

// 4. Sécurité (CONFORMITE E-50, E-51, E-55) et aucune ressource tierce.
for (const p of pages) {
  const h = lire(p);
  ok(h.indexOf('http-equiv="Content-Security-Policy"') > 0 && h.indexOf('http-equiv="Content-Security-Policy"') < h.indexOf("<meta charset"), `${p} : politique de sécurité absente ou pas en tête`);
  ok(!/<style[\s>]/i.test(h.replace(/<noscript>[\s\S]*?<\/noscript>/g, "")), `${p} : <style> en ligne`);
  ok(!/\sstyle="/i.test(h), `${p} : attribut style`);
  ok(!/\son[a-z]+="/i.test(h) && !/javascript:/i.test(h), `${p} : gestionnaire ou adresse javascript: en ligne`);
  for (const m of h.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) ok(/src="\/[^"]+"/.test(m[1]) || /application\/ld\+json/.test(m[1]), `${p} : script en ligne exécutable`);
  for (const m of h.matchAll(/<(?:img|script|link|source|iframe|video|audio)\b[^>]*\s(?:src|href)="(https?:[^"]+)"/g)) ok(m[0].startsWith("<link rel=\"canonical\""), `${p} : ressource tierce ${m[1]}`);
  ok(!/(?:src|href)="data:|blob:/.test(h), `${p} : ressource en data: ou blob:`);
}

// 5. Règles de contenu (CONTENU.md, CDC, juriste).
for (const p of pages) {
  const h = lire(p), t = texte(h);
  ok(!/[\u202f\u2011]/.test(h), `${p} : espace fine ou trait d'union insécable (absents de la police)`);
  ok(!/en salle|espace partenaire/i.test(t), `${p} : « en salle » ou « espace partenaire »`);
  ok(!/objectifs suivis et mesurés/i.test(t), `${p} : « objectifs suivis et mesurés »`);
  ok(!/<form|<textarea|<input/i.test(h), `${p} : formulaire ou champ`);
  // Le formulaire est supprimé (CDC 2.2, recette 4.8 : 0 « formspree »). Les pages légales reprises telles
  // quelles le décrivent encore : à adapter par le juriste (OBLIGATIONS 2.1) avant toute mise en ligne.
  ok(!/formspree|formulaire de contact/i.test(t), `${p} : décrit encore le formulaire de contact supprimé (texte à adapter par le juriste, OBLIGATIONS 2.1 ; bloque la mise en ligne)`);
  ok(!/Aucune donnée de santé/.test(t), `${p} : ancien titre « Aucune donnée de santé »`);
  ok(!/whatsapp/i.test(h), `${p} : WhatsApp`);
  // « réadaptation » : jamais dans un titre, une description, les données structurées (juriste, a).
  const tetes = [...h.matchAll(/<(title|h1|h2|h3)\b[^>]*>([\s\S]*?)<\/\1>/g)].map((m) => m[2]).join(" ")
    + [...h.matchAll(/<meta [^>]*content="([^"]*)"/g)].map((m) => m[1]).join(" ")
    + [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]).join(" ");
  ok(!/réadaptation/i.test(tetes), `${p} : « réadaptation » dans un titre, une description ou les données structurées`);
  // Chaque page : un seul h1, titre, description, canonique, image de partage existante.
  ok((h.match(/<h1\b/g) || []).length === 1, `${p} : nombre de h1 différent de 1`);
  ok(/<title>[^<]{5,}<\/title>/.test(h) && /<meta name="description" content="[^"]{20,}"/.test(h), `${p} : titre ou description manquant`);
  const img = h.match(/property="og:image" content="https:\/\/coachapar\.fr\/([^"]+)"/);
  ok(img && fichiers.includes(img[1]), `${p} : image de partage absente`);
  // Libellé « Prendre mon premier rendez-vous » : toujours vers la réservation.
  for (const m of h.matchAll(/<a [^>]*href="([^"]+)"[^>]*>Prendre mon premier rendez-vous<\/a>/g)) ok(/^(\/)?#reservation$/.test(m[1]), `${p} : « Prendre mon premier rendez-vous » vers ${m[1]}`);
  if (!LEGALES.test(p)) ok(!/Albert Schweitzer/.test(h), `${p} : adresse postale hors pages légales`);
}
{
  const t = texte(lire("pages/tarifs.html"));
  for (const mot of ["à partir de ", "devis personnalisé", "gratuit", "commander", "réserver ce forfait", "Meilleur choix"]) ok(!t.includes(mot), `pages/tarifs.html : « ${mot} »`);
}

// 6. Plan du site : pages indexables seulement, toutes existantes.
{
  const sm = lire("sitemap.xml");
  const locs = [...sm.matchAll(/<loc>https:\/\/coachapar\.fr\/([^<]*)<\/loc>/g)].map((m) => m[1] || "index.html");
  for (const l of locs) ok(fichiers.includes(l) && !/noindex/.test(lire(l)), `plan du site : ${l} absente ou en noindex`);
  for (const p of pages) if (!/noindex/.test(lire(p))) ok(locs.includes(p), `plan du site : ${p} manquante`);
}

// 7. Budgets : script, polices.
const taille = (f) => statSync(join(SORTIE, f)).size;
ok(taille("js/site.js") <= 3072, `js/site.js : ${taille("js/site.js")} octets, budget 3 Ko`);

console.log(`Vérification du site : ${pages.length} pages, ${liens} liens et ressources internes, ${verifs} vérifications.`);
if (ecarts.length) { console.log(`${ecarts.length} écart(s) :\n  ${ecarts.join("\n  ")}`); process.exit(1); }
console.log("Aucun écart.");
