// Fabrication du site coachapar.fr avec Eleventy 3.1.8 (version épinglée dans package.json).
// Étape 1 de la migration (lot D) : la sortie _site/ est identique, octet pour octet,
// à ce que GitHub Pages publie aujourd'hui depuis la branche main.
// Rien de ce fichier ni de node_modules n'est envoyé au visiteur.
import yaml from "js-yaml";
import { validerEntreprise } from "./_outils/donnees.mjs";

// Seuls ces fichiers et dossiers sont copiés tels quels dans le site publié.
// Tout le reste (docs/, _outils/, _data/, node_modules/, package.json…) ne l'est pas.
const COPIES = ["css", "js", "images", "fonts", "CNAME", "favicon.ico", "manifest.json", "robots.txt", "sitemap.xml"];

export default function (config) {
  // Données en YAML, lues en schéma « core » : une date reste un texte, pas une surprise.
  // _data/entreprise.yaml est contrôlé à la lecture : une erreur de saisie arrête tout.
  config.addDataExtension("yaml", (contenu, chemin) => {
    const donnees = yaml.load(contenu, { schema: yaml.CORE_SCHEMA });
    return String(chemin).endsWith("entreprise.yaml") ? validerEntreprise(donnees, chemin) : donnees;
  });

  // Seules les pages .html sont des modèles. Le Markdown (LISEZ-MOI.md) n'est pas publié.
  config.setTemplateFormats(["html"]);

  // Adresses conservées : /pages/contact.html reste /pages/contact.html
  // (sans ce réglage, Eleventy produirait /pages/contact/ et changerait 12 adresses).
  config.addGlobalData("permalink", "{{ page.filePathStem }}.html");

  for (const chemin of COPIES) config.addPassthroughCopy(chemin);

  // Ceinture et bretelles : ces dossiers ne doivent jamais être lus comme des pages.
  for (const motif of ["docs/**", "_outils/**", "_site/**", "node_modules/**", ".github/**", "LISEZ-MOI.md"]) {
    config.ignores.add(motif);
  }

  return {
    dir: { input: ".", output: "_site", data: "_data", includes: "_includes" },
    htmlTemplateEngine: "liquid",
  };
}
