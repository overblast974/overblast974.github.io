// Fabrication du site coachapar.fr avec Eleventy 3.1.8 (version épinglée dans package.json).
// Lot F (refonte, 25/11/2026) : les pages lisent _data/entreprise.yaml par les filtres ci-dessous,
// partagent un gabarit (_includes/base.liquid) et leurs données structurées sont calculées.
// Rien de ce fichier ni de node_modules n'est envoyé au visiteur.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import yaml from "js-yaml";
import { validerEntreprise } from "./_outils/donnees.mjs";
import {
  NBSP, euros, prixParSeance, remise, heure, horairesPied, horairesPhrase, horairesCourts, dateLongue,
  absenceActive, texteBrut, listeDe, zonePhrase, dureeTexte, capitale, remplir, forfaitsSeances,
} from "./_outils/format.mjs";
import { blocsSchema, lignesTarifs } from "./_outils/schema.mjs";
import { typographie } from "./_outils/typo.mjs";
import { reduireJs } from "./_outils/reduire-js.mjs";

// Seuls ces fichiers et dossiers sont copiés tels quels dans le site publié.
// Tout le reste (docs/, _outils/, _data/, _js/, _images-source/, node_modules/, package.json…) ne l'est pas.
const COPIES = ["css", "images", "fonts", "CNAME", "favicon.ico", "manifest.json", "robots.txt"];

// Date de fabrication : décide de l'affichage de la phrase d'absence. Une variable
// d'environnement permet de simuler une date (contrôle du 11 janvier 2027).
const AUJOURDHUI = process.env.DATE_FABRICATION ? new Date(process.env.DATE_FABRICATION + "T12:00:00Z") : new Date();

export default function (config) {
  // Données en YAML, lues en schéma « core » : une date reste un texte, pas une surprise.
  // _data/entreprise.yaml est contrôlé à la lecture : une erreur de saisie arrête tout.
  config.addDataExtension("yaml", (contenu, chemin) => {
    const donnees = yaml.load(contenu, { schema: yaml.CORE_SCHEMA });
    return String(chemin).endsWith("entreprise.yaml") ? validerEntreprise(donnees, chemin) : donnees;
  });

  // Pages en .html ; le plan du site est un gabarit .liquid. Le Markdown (LISEZ-MOI.md) n'est pas publié.
  config.setTemplateFormats(["html", "liquid"]);

  // Adresses conservées : /pages/contact.html reste /pages/contact.html
  // (sans ce réglage, Eleventy produirait /pages/contact/ et changerait 12 adresses).
  config.addGlobalData("permalink", "{{ page.filePathStem }}.html");
  // Date de dernière modification réelle de chaque page (plan du site) : celle de son dernier commit.
  config.addGlobalData("date", "git Last Modified");

  for (const chemin of COPIES) config.addPassthroughCopy(chemin);

  // Ceinture et bretelles : ces dossiers ne doivent jamais être lus comme des pages.
  for (const motif of ["docs/**", "_outils/**", "_site/**", "node_modules/**", ".github/**", "LISEZ-MOI.md", "_js/**", "_images-source/**"]) {
    config.ignores.add(motif);
  }

  // ---- Filtres : une seule règle de mise en forme pour tout le site (_outils/format.mjs) ----
  const d = () => validerEntreprise(yaml.load(readFileSync("_data/entreprise.yaml", "utf8"), { schema: yaml.CORE_SCHEMA }));
  // La phrase d'absence s'affiche-t-elle à la date de fabrication ? (un seul calcul pour tout le site)
  config.addGlobalData("absence_affichee", () => absenceActive(d().absence, AUJOURDHUI));
  config.addFilter("euros", (n) => euros(Number(n)));
  config.addFilter("euros_cgv", (n) => euros(Number(n), { insecable: false }));
  config.addFilter("prix_par_seance", (f) => prixParSeance(f));
  config.addFilter("remise", (f, prixSeance) => remise(f, prixSeance));
  config.addFilter("heure", (h) => heure(h));
  config.addFilter("horaires_pied", (p) => horairesPied(p));
  config.addFilter("horaires_courts", (p) => horairesCourts(p));
  config.addFilter("horaires_phrase", (p) => horairesPhrase(p, { sep: NBSP, liaison: ", " }));
  config.addFilter("date_longue", (iso) => dateLongue(String(iso)));
  config.addFilter("texte_brut", (h) => texteBrut(h));
  config.addFilter("liste_de", (l) => listeDe(l));
  config.addFilter("zone_phrase", (z) => zonePhrase(z));
  config.addFilter("duree", (m) => dureeTexte(Number(m)));
  config.addFilter("capitale", (s) => capitale(s));
  config.addFilter("insecable", (s) => String(s).replace(/ /g, NBSP));
  config.addFilter("remplir", (texte) => remplir(texte, d(), AUJOURDHUI));
  config.addFilter("forfaits_seances", (l) => forfaitsSeances(l));
  config.addFilter("pourcentage_barre", (f, max) => Math.round((f.de_preference_sous_mois / max) * 100));
  config.addFilter("lignes_tarifs", () => lignesTarifs(d()));
  // Données structurées de la page : {{ page.url | schema: schema, fil, faq, service, diplomes, article }}
  config.addFilter("schema", (url, schema, fil, faq, service, diplomes, article) => {
    const adresse = String(url).replace(/\/index\.html$/, "/");
    return blocsSchema(d(), { url: adresse, schema, fil, faq, service, diplomes, article }, AUJOURDHUI);
  });
  config.addFilter("date_iso", (date) => new Date(date).toISOString().slice(0, 10));

  // Règle des espaces (DESIGN.md 4.2) sur tout le HTML fabriqué.
  config.addTransform("typographie", function (contenu) {
    return (this.page.outputPath || "").endsWith(".html") ? typographie(contenu) : contenu;
  });

  // Le seul script du site, réduit (budget : 3 Ko).
  config.on("eleventy.after", ({ dir }) => {
    const js = reduireJs(readFileSync("_js/site.js", "utf8"));
    if (Buffer.byteLength(js) > 3072) throw new Error(`js/site.js fait ${Buffer.byteLength(js)} octets, au-delà du budget de 3 Ko`);
    mkdirSync(`${dir.output}/js`, { recursive: true });
    writeFileSync(`${dir.output}/js/site.js`, js);
  });
  config.addWatchTarget("_js/");

  return {
    dir: { input: ".", output: "_site", data: "_data", includes: "_includes" },
    htmlTemplateEngine: "liquid",
  };
}
