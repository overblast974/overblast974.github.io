// Contrôle « données → pages » du site fabriqué (lot F).
// Les pages lisent _data/entreprise.yaml ; ce contrôle vérifie sur _site/ que le résultat dit bien
// ce que disent les données, aux endroits où une erreur coûterait cher : prix (Tarifs, CGV 3.1,
// catalogue), FAQ et leur copie pour Google, coordonnées, phrase d'absence, adresse du registre.
// Usage : node _outils/controler.mjs [--sortie _site] [--date AAAA-MM-JJ]
//   --date : date de référence pour la phrase d'absence (par défaut aujourd'hui ;
//            à rejouer avec la même date que DATE_FABRICATION si on simule une fabrication).
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import yaml from "js-yaml";
import { erreursEntreprise } from "./donnees.mjs";
import { euros, prixParSeance, absenceActive, texteBrut, remplir, zonePhrase } from "./format.mjs";
import { lignesTarifs } from "./schema.mjs";

const arg = (nom, defaut) => { const i = process.argv.indexOf(nom); return i > 0 ? process.argv[i + 1] : defaut; };
const SORTIE = arg("--sortie", "_site");
const AUJOURDHUI = arg("--date") ? new Date(arg("--date") + "T12:00:00Z") : new Date();

const d = yaml.load(readFileSync("_data/entreprise.yaml", "utf8"), { schema: yaml.CORE_SCHEMA });
const ecarts = erreursEntreprise(d).map((e) => `DONNÉES : ${e}`);
if (ecarts.length) { console.log(ecarts.join("\n")); process.exit(1); }

// Le HTML fabriqué utilise l'espace insécable ; on compare sur un texte normalisé.
const norm = (s) => s.replace(/&nbsp;|\u00a0/g, " ").replace(/<span class="sans-coupure">(.*?)<\/span>/g, "$1").replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ");
const texte = (html) => norm(html.replace(/<script[\s\S]*?<\/script>/g, " ")
  .replace(/<\/?(p|li|td|th|tr|div|h\d|dt|dd|ul|ol|summary|details|section|br)\b[^>]*>/g, " ").replace(/<[^>]+>/g, ""));
const lire = (f) => readFileSync(join(SORTIE, f), "utf8");
const pages = (function lister(dossier) {
  return readdirSync(dossier).flatMap((n) => {
    const p = join(dossier, n);
    return statSync(p).isDirectory() ? lister(p) : p.endsWith(".html") ? [relative(SORTIE, p).split("\\").join("/")] : [];
  });
})(SORTIE).sort();
const jsonld = (h) => [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));

let verifs = 0;
const ok = (cond, msg) => { verifs++; if (!cond) ecarts.push(msg); };
const { contact, absence, offre, mentions } = d;
const absenceAffichee = absenceActive(absence, AUJOURDHUI);
const lignes = lignesTarifs(d);
const ligneCgv = (l) => `${l.nom} : ${l.prix === 0 ? "offert" : euros(l.prix, { insecable: false }) + (l.parSeance ? `, soit ${euros(l.parSeance, { insecable: false })} la séance` : "") + (l.unite ? " " + l.unite : "")}`;

// 1. Pied de page et en-tête : toutes les pages.
for (const p of pages) {
  const h = lire(p), t = texte(h);
  ok(h.includes(`href="tel:${contact.telephone.international}"`), `${p} : lien d'appel absent`);
  ok(t.includes(contact.telephone.affiche), `${p} : téléphone affiché absent`);
  ok(h.includes(`href="mailto:${contact.email}"`), `${p} : e-mail du pied absent`);
  ok(t.includes(norm(zonePhrase(d.zone))), `${p} : zone du pied absente`);
  ok(t.includes(absence.phrase) === absenceAffichee, `${p} : phrase d'absence ${absenceAffichee ? "absente" : "encore présente"}`);
  for (const pg of ["mentions-legales", "cgv", "politique-confidentialite"]) ok(h.includes(`href="/pages/${pg}.html"`), `${p} : lien vers ${pg} absent`);
}

// 2. Prix : page Tarifs (tableau), CGV 3.1 (liste), catalogue de données structurées : une seule liste.
{
  const t = texte(lire("pages/tarifs.html"));
  for (const l of lignes) ok(t.includes(norm(ligneCgv(l).replace(" : ", " "))), `pages/tarifs.html : ligne de grille « ${ligneCgv(l)} » introuvable`);
  const cgv = lire("pages/cgv.html");
  const liste = cgv.match(/<h3>3\.1 Tarifs<\/h3>[\s\S]*?<ul>([\s\S]*?)<\/ul>/);
  const publiees = liste ? [...liste[1].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => norm(m[1]).trim()) : [];
  ok(JSON.stringify(publiees) === JSON.stringify(lignes.map((l) => norm(ligneCgv(l)))), `pages/cgv.html : l'article 3.1 ne correspond pas aux données\n    publié : ${JSON.stringify(publiees)}`);
  const cat = jsonld(lire("pages/tarifs.html")).find((o) => o.hasOfferCatalog)?.hasOfferCatalog;
  ok(cat && JSON.stringify(cat.itemListElement.map((o) => [o.name, o.price])) === JSON.stringify(lignes.map((l) => [l.nom, l.prix.toFixed(2)])), "pages/tarifs.html : le catalogue de données structurées ne correspond pas à la grille");
}

// 3. FAQ : texte visible = données ; copie FAQPage = même texte, sans balise.
const FAQ = { accueil: "index.html", apa: "pages/activite-physique-adaptee.html", coaching: "pages/coaching-sportif.html", alimentation: "pages/conseils-nutritionnels.html" };
for (const [cle, p] of Object.entries(FAQ)) {
  const h = lire(p), liste = d.faq[cle];
  const vues = [...h.matchAll(/<summary>([\s\S]*?)<svg[\s\S]*?<div class="faq__reponse">([\s\S]*?)<\/div>/g)];
  ok(vues.length === liste.length, `${p} : ${vues.length} questions affichées, ${liste.length} dans les données`);
  const faqLd = jsonld(h).find((o) => o["@type"] === "FAQPage");
  ok(Boolean(faqLd), `${p} : copie FAQPage absente`);
  liste.forEach((q, i) => {
    const attendu = texteBrut(remplir(q.reponse, d, AUJOURDHUI));
    ok(vues[i] && norm(vues[i][1]).trim() === norm(q.question), `${p} : question ${i + 1} différente`);
    ok(vues[i] && texte(vues[i][2]).trim().startsWith(norm(attendu)), `${p} : réponse ${i + 1} différente des données`);
    ok(faqLd && faqLd.mainEntity[i]?.name === q.question && faqLd.mainEntity[i]?.acceptedAnswer.text === attendu, `${p} : copie FAQPage ${i + 1} différente du texte visible`);
  });
}

// 4. Mentions légales et adresse du registre (pages légales seulement, jamais dans les données structurées).
{
  const ml = texte(lire("pages/mentions-legales.html"));
  ok(ml.includes(mentions.siret), "mentions légales : SIRET absent");
  ok(ml.includes(mentions.carte_professionnelle), "mentions légales : carte professionnelle absente");
  const rue = mentions.adresse_registre.rue;
  ok(ml.includes(rue), "mentions légales : adresse du registre absente");
  for (const p of pages) {
    const h = lire(p);
    if (!/^pages\/(mentions-legales|cgv|politique-confidentialite)\.html$/.test(p)) ok(!texte(h).includes(rue), `${p} : adresse du registre publiée hors des pages légales`);
    for (const o of jsonld(h)) ok(!JSON.stringify(o).includes(rue) && !JSON.stringify(o).includes(mentions.adresse_registre.code_postal), `${p} : adresse dans les données structurées`);
  }
}

// 5. Aucun montant en euros qui n'existe pas dans « offre » (toutes les pages, données structurées comprises).
{
  const connus = new Set([offre.seance.prix, offre.bilan_seul.prix, ...offre.alimentation.map((a) => a.prix),
    ...offre.forfaits.flatMap((f) => [f.prix, prixParSeance(f)])].map((n) => euros(n, { insecable: false })));
  for (const p of pages) for (const m of norm(lire(p)).matchAll(/(\d+(?:,\d{2})?) €/g)) {
    ok(connus.has(`${m[1]} €`), `${p} : montant « ${m[1]} € » absent de « offre »`);
  }
}

console.log(`Contrôle des données : ${pages.length} pages, ${verifs} vérifications, date de référence ${AUJOURDHUI.toISOString().slice(0, 10)} (phrase d'absence ${absenceAffichee ? "attendue" : "non attendue"}).`);
if (ecarts.length) { console.log(`${ecarts.length} écart(s) :\n  ${ecarts.join("\n  ")}`); process.exit(1); }
console.log("Aucun écart : les pages disent ce que disent les données.");
