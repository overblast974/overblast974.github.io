// Contrôle « témoin » de l'étape 1 (lot D).
// Les pages ne lisent pas encore _data/entreprise.yaml. Ce contrôle vérifie, sur le site
// fabriqué (_site/), que chaque valeur du fichier est bien celle que les pages affichent.
// Il sert à deux choses :
//   1. prouver que le fichier de données décrit fidèlement le site en ligne ;
//   2. signaler toute modification faite sur main (lots C, Reprise…) qui n'aurait pas été
//      reportée dans le fichier de données avant le branchement des pages (étape 3).
// À l'étape 3, chaque page branchée sur les données rend ce contrôle évident pour elle :
// il restera utile pour les montants, les CGV et les FAQ.
//
// Usage : node _outils/controler.mjs [--sortie _site] [--date AAAA-MM-JJ]
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import yaml from "js-yaml";
import { erreursEntreprise } from "./donnees.mjs";
import {
  NBSP, euros, prixParSeance, remise, horairesPied, horairesPhrase, dateLongue,
  absenceActive, texteBrut, listeDe,
} from "./format.mjs";

const arg = (nom, defaut) => { const i = process.argv.indexOf(nom); return i > 0 ? process.argv[i + 1] : defaut; };
const SORTIE = arg("--sortie", "_site");
const AUJOURDHUI = arg("--date") ? new Date(arg("--date") + "T12:00:00Z") : new Date();

const d = yaml.load(readFileSync("_data/entreprise.yaml", "utf8"), { schema: yaml.CORE_SCHEMA });
const ecarts = erreursEntreprise(d).map((e) => `DONNÉES : ${e}`);
if (ecarts.length) { console.log(ecarts.join("\n")); process.exit(1); }

const lire = (f) => readFileSync(join(SORTIE, f), "utf8");
const pages = (function lister(dossier) {
  return readdirSync(dossier).flatMap((n) => {
    const p = join(dossier, n);
    return statSync(p).isDirectory() ? lister(p) : p.endsWith(".html") ? [relative(SORTIE, p).split("\\").join("/")] : [];
  });
})(SORTIE).sort();

let verifs = 0;
const attendu = (page, html, morceau, quoi) => {
  verifs++;
  if (!html.includes(morceau)) ecarts.push(`${page} : ${quoi} introuvable — attendu « ${morceau.slice(0, 140)} »`);
};
const absent = (page, html, morceau, quoi) => {
  verifs++;
  if (html.includes(morceau)) ecarts.push(`${page} : ${quoi} encore présent(e) alors que les données disent le contraire`);
};

const { contact, zone, horaires, absence, offre, mentions, identite } = d;
const tel = contact.telephone;
const pied = horairesPied(horaires.plages);
const absenceAffichee = absenceActive(absence, AUJOURDHUI);

// 1. En-tête et pied de page : les 13 pages (gabarit commun).
for (const p of pages) {
  const h = lire(p);
  attendu(p, h, `<span class="brand__sub">${identite.sous_titre_en_tete}</span>`, "sous-titre de l'en-tête");
  attendu(p, h, `<span class="visually-hidden">Appeler le ${tel.affiche}</span>`, "téléphone de l'en-tête");
  attendu(p, h, `<li><a href="tel:${tel.international}">`, "lien d'appel du pied");
  attendu(p, h, `${tel.affiche}</a></li>`, "téléphone du pied");
  attendu(p, h, `<a href="mailto:${contact.email}">`, "e-mail du pied");
  attendu(p, h, `${zone.libelle_court}</span></li>`, "zone du pied");
  attendu(p, h, `${pied}</span></li>`, "horaires du pied (format calculé)");
  (absenceAffichee ? attendu : absent)(p, h, `${absence.phrase}</span></li>`, "phrase d'absence du pied");
}

// 2. Grille de tarifs de l'accueil (sert de page Tarifs tant qu'elle n'existe pas).
{
  const p = "index.html", h = lire(p);
  attendu(p, h, `Séance à l'unité : ${euros(offre.seance.prix)}.`, "prix de la séance");
  for (const f of offre.forfaits) {
    const pps = prixParSeance(f), r = remise(f, offre.seance.prix);
    attendu(p, h, `Forfait ${f.seances} séances</h3>`, `titre du forfait ${f.seances}`);
    attendu(p, h, `<span class="price__amount">${euros(f.prix)}</span>`, `prix du forfait ${f.seances}`);
    attendu(p, h, `Soit ${euros(pps)} la séance (−${r}${NBSP}%)`, `prix par séance et remise du forfait ${f.seances}`);
    attendu(p, h, `sous ${f.de_preference_sous_mois}${NBSP}mois`, `durée conseillée du forfait ${f.seances}`);
    for (const a of f.avantages ?? []) attendu(p, h, `</svg>${a}</li>`, `avantage « ${a} » du forfait ${f.seances}`);
  }
  attendu(p, h, `Déplacement compris ${zone.deplacement_compris}`, "déplacement compris");
  attendu(p, h, offre.mention_prix, "mention TVA");
  attendu(p, h, `href="${contact.reservation.appel.lien}"`, "lien de réservation de l'appel");
  attendu(p, h, `href="${contact.reservation.domicile.lien}"`, "lien de réservation à domicile");
  attendu(p, h, `${contact.reservation.domicile.duree} chez vous`, "durée du rendez-vous à domicile");
  attendu(p, h, `${contact.reservation.appel.duree} pour faire connaissance`, "durée de l'appel");
}

// 3. Article 3.1 des CGV : mêmes prix, mot pour mot, depuis la même source (OBLIGATIONS.md 1.10).
{
  const p = "pages/cgv.html", h = lire(p);
  const e = (n) => euros(n, { insecable: false });
  const lignes = [
    `Premier rendez-vous (appel de ${contact.reservation.appel.duree} ou rendez-vous à domicile) : ${offre.premier_rendez_vous.prix === 0 ? "offert" : e(offre.premier_rendez_vous.prix)}`,
    `Séance individuelle ${listeDe(offre.seance.pour)} : ${e(offre.seance.prix)}`,
    ...offre.forfaits.map((f) => `Forfait ${f.seances} séances : ${e(f.prix)}, soit ${e(prixParSeance(f))} la séance`),
    ...offre.alimentation.map((a) => `${a.nom} : ${e(a.prix)}${a.unite ? " " + a.unite : ""}`),
    `${offre.bilan_seul.nom} : ${e(offre.bilan_seul.prix)}`,
  ];
  const liste = h.match(/<h3>3\.1 Tarifs<\/h3>[\s\S]*?<ul>([\s\S]*?)<\/ul>/);
  const publiees = liste ? [...liste[1].matchAll(/<li>(.*?)<\/li>/g)].map((m) => m[1]) : [];
  verifs++;
  if (JSON.stringify(publiees) !== JSON.stringify(lignes)) {
    ecarts.push(`${p} : la liste de l'article 3.1 ne correspond pas aux données.\n    publiée : ${JSON.stringify(publiees)}\n    calculée : ${JSON.stringify(lignes)}`);
  }
  attendu(p, h, `déplacement du Prestataire ${zone.deplacement_compris_cgv}`, "déplacement compris (CGV)");
}

// 4. Mentions légales.
{
  const p = "pages/mentions-legales.html", h = lire(p);
  attendu(p, h, `SIRET ${mentions.siret}`, "SIRET");
  attendu(p, h, `n° ${mentions.carte_professionnelle}`, "carte professionnelle");
  attendu(p, h, `${mentions.adresse_registre.rue}, ${mentions.adresse_registre.code_postal} ${mentions.adresse_registre.ville}`, "adresse du registre");
  for (const q of ["pages/mentions-legales.html", "pages/cgv.html", "pages/politique-confidentialite.html"]) {
    attendu(q, lire(q), `Date de dernière mise à jour : ${dateLongue(mentions.mise_a_jour_pages_legales)}`, "date de mise à jour");
  }
  // L'adresse du registre ne doit jamais apparaître dans les données structurées.
  for (const q of pages) {
    for (const b of lire(q).matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      verifs++;
      if (b[1].includes(mentions.adresse_registre.rue)) ecarts.push(`${q} : adresse du registre publiée dans les données structurées`);
    }
  }
}

// 5. Horaires en phrase : FAQ de l'accueil (format « phrase » calculé).
attendu("index.html", lire("index.html"), `<strong>${horairesPhrase(horaires.plages)}</strong>`, "horaires en phrase (FAQ)");

// 6. FAQ : texte visible identique aux données ; copie FAQPage identique au texte brut.
const FAQ_PAGES = { accueil: "index.html", apa: "pages/activite-physique-adaptee.html", coaching: "pages/coaching-sportif.html", alimentation: "pages/conseils-nutritionnels.html" };
for (const [cle, p] of Object.entries(FAQ_PAGES)) {
  const h = lire(p), liste = d.faq?.[cle] ?? [];
  const bloc = h.match(/<div class="faq">\n([\s\S]*?)\n {8}<\/div>/);
  const publiees = bloc ? [...bloc[1].matchAll(/<details( open)?>\s*<summary>([\s\S]*?)<svg[\s\S]*?<\/summary>\s*<div class="faq__answer">([\s\S]*?)<\/div>\s*<\/details>/g)] : [];
  verifs++;
  if (publiees.length !== liste.length) ecarts.push(`${p} : ${publiees.length} questions affichées, ${liste.length} dans les données`);
  liste.forEach((q, i) => {
    const m = publiees[i]; verifs++;
    if (!m) return;
    if (m[2] !== q.question) ecarts.push(`${p} : question ${i + 1} différente`);
    if (m[3] !== q.reponse + (q.complement ?? "")) ecarts.push(`${p} : réponse ${i + 1} différente (« ${q.question} »)`);
    if (Boolean(m[1]) !== Boolean(q.ouverte)) ecarts.push(`${p} : question ${i + 1}, état ouvert différent`);
  });
  for (const b of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    const o = JSON.parse(b[1]);
    if (o["@type"] !== "FAQPage") continue;
    verifs++;
    const attendue = liste.map((q) => [q.question, texteBrut(q.reponse)]);
    const lue = o.mainEntity.map((x) => [x.name, x.acceptedAnswer.text]);
    if (JSON.stringify(attendue) !== JSON.stringify(lue)) ecarts.push(`${p} : la copie FAQPage ne correspond pas au texte visible des données`);
  }
}

// 7. Aucun montant en euros qui n'existe pas dans « offre » (toutes les pages, JSON-LD compris).
{
  const connus = new Set([
    offre.seance.prix, offre.bilan_seul.prix, ...offre.alimentation.map((a) => a.prix),
    ...offre.forfaits.flatMap((f) => [f.prix, prixParSeance(f)]),
  ].map((n) => euros(n, { insecable: false })));
  for (const p of pages) {
    for (const m of lire(p).matchAll(/(\d+(?:,\d{2})?)(?:&nbsp;|\u00a0| )€/g)) {
      verifs++;
      const lu = `${m[1]} €`;
      if (!connus.has(lu)) ecarts.push(`${p} : montant « ${lu} » absent de « offre » dans les données`);
    }
  }
}

console.log(`Contrôle témoin : ${pages.length} pages, ${verifs} vérifications, date de référence ${AUJOURDHUI.toISOString().slice(0, 10)} (phrase d'absence ${absenceAffichee ? "attendue" : "non attendue"}).`);
if (ecarts.length) { console.log(`${ecarts.length} écart(s) :\n  ${ecarts.join("\n  ")}`); process.exit(1); }
console.log("Aucun écart : _data/entreprise.yaml décrit exactement ce que les pages affichent.");
