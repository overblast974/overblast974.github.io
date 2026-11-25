// Données structurées (schema.org) produites depuis _data/entreprise.yaml et l'en-tête des pages.
// Jamais écrites à la main : un prix, un horaire ou une question changés dans les données
// changent aussi ce que lit Google. Jamais d'adresse postale (décision du client, D11).
import { prixParSeance, remise, texteBrut, remplir, zonePhrase, listeDe, absenceActive } from "./format.mjs";

export const SITE = "https://coachapar.fr";
const JOURS_EN = { lundi: "Monday", mardi: "Tuesday", mercredi: "Wednesday", jeudi: "Thursday", vendredi: "Friday", samedi: "Saturday", dimanche: "Sunday" };
const centimes = (n) => n.toFixed(2);

const zoneServie = (d) => [
  ...d.zone.communes.map((name) => ({ "@type": "City", name })),
  { "@type": "AdministrativeArea", name: "Montpellier Méditerranée Métropole" },
];

const fournisseur = (d) => ({ "@type": "LocalBusiness", "@id": SITE, name: d.identite.nom });

/** Lignes de la grille des tarifs : la même liste sert à la page Tarifs, à l'article 3.1 des CGV et au catalogue. */
export function lignesTarifs(d) {
  const o = d.offre, r = d.contact.reservation;
  return [
    { nom: `Premier rendez-vous (appel de ${r.appel.duree} ou rendez-vous d'${r.domicile.duree_lettres} à domicile)`, prix: o.premier_rendez_vous.prix },
    { nom: `Séance individuelle ${listeDe(o.seance.pour)}`, prix: o.seance.prix },
    ...o.forfaits.map((f) => ({ nom: `Forfait ${f.seances} séances`, prix: f.prix, parSeance: prixParSeance(f), remise: remise(f, o.seance.prix), forfait: f })),
    ...o.alimentation.map((a) => ({ nom: a.nom, prix: a.prix, unite: a.unite })),
    { nom: o.bilan_seul.nom, prix: o.bilan_seul.prix },
  ];
}

function fil(page) {
  if (!page.fil) return null;
  return {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: page.fil.map((e, i) => ({ "@type": "ListItem", position: i + 1, name: e.nom, item: SITE + e.url })),
  };
}

function faq(d, cle, aujourdhui) {
  const liste = d.faq?.[cle];
  if (!liste?.length) return null;
  return {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: liste.map((q) => ({
      "@type": "Question", name: q.question,
      acceptedAnswer: { "@type": "Answer", text: texteBrut(remplir(q.reponse, d, aujourdhui)) },
    })),
  };
}

function entreprise(d, aujourdhui) {
  const reprise = absenceActive(d.absence, aujourdhui) ? d.absence.reprise_le : null;
  return {
    "@context": "https://schema.org", "@type": "LocalBusiness", "@id": SITE,
    name: d.identite.nom,
    description: `Des séances individuelles, chez vous ou en extérieur, à ${zonePhrase(d.zone)}. Pour bouger avec une maladie chronique, un handicap ou l'âge qui avance, ou pour reprendre le sport.`,
    url: SITE + "/",
    telephone: d.contact.telephone.international,
    email: d.contact.email,
    logo: `${SITE}/images/logo.png`,
    image: `${SITE}/images/logo.png`,
    address: { "@type": "PostalAddress", addressLocality: d.mentions.adresse_registre.ville, addressRegion: "Hérault", addressCountry: "FR" },
    areaServed: zoneServie(d),
    openingHoursSpecification: d.horaires.plages.map((p) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: p.jours.map((j) => JOURS_EN[j]),
      opens: p.de, closes: p.a,
      ...(reprise ? { validFrom: reprise } : {}),
    })),
    founder: { "@type": "Person", "@id": `${SITE}/pages/a-propos.html#loic-boyer`, name: d.identite.responsable },
  };
}

function catalogue(d) {
  return {
    "@context": "https://schema.org", "@type": "LocalBusiness", "@id": SITE, name: d.identite.nom,
    hasOfferCatalog: {
      "@type": "OfferCatalog", name: `Tarifs ${d.identite.nom}`,
      itemListElement: lignesTarifs(d).map((l) => ({ "@type": "Offer", name: l.nom, price: centimes(l.prix), priceCurrency: "EUR" })),
    },
  };
}

function service(d, page) {
  const s = page.service;
  const o = {
    "@context": "https://schema.org", "@type": "Service",
    name: s.nom, serviceType: s.nom, url: SITE + page.url,
    provider: fournisseur(d), areaServed: zoneServie(d),
  };
  if (s.prix_seance) o.offers = { "@type": "Offer", name: "Séance individuelle", price: centimes(d.offre.seance.prix), priceCurrency: "EUR" };
  return o;
}

function personne(d, page) {
  return {
    "@context": "https://schema.org", "@type": "ProfilePage", url: SITE + page.url,
    name: `À propos de ${d.identite.responsable}, enseignant en activité physique adaptée et coach sportif à Montpellier`,
    mainEntity: {
      "@type": "Person", "@id": `${SITE}/pages/a-propos.html#loic-boyer`,
      name: d.identite.responsable, givenName: "Loïc", familyName: "Boyer",
      url: SITE + page.url, jobTitle: d.identite.metier,
      image: `${SITE}/images/portrait-buste-480.webp`,
      worksFor: { "@type": "LocalBusiness", "@id": SITE, name: d.identite.nom },
      areaServed: zoneServie(d),
      knowsAbout: ["Activité physique adaptée", "Coaching sportif", "Préparation physique", "Pilates", "Reprise d'activité physique", "Activité physique et maladies chroniques"],
      alumniOf: { "@type": "CollegeOrUniversity", name: "Université de La Réunion" },
      hasCredential: (page.diplomes ?? []).map((q) => {
        const c = { "@type": "EducationalOccupationalCredential", name: q.titre, credentialCategory: q.categorie };
        if (q.annee) c.dateCreated = String(q.annee);
        if (q.identifiant) c.identifier = q.identifiant;
        if (q.organisme) c.recognizedBy = { "@type": q.universite ? "CollegeOrUniversity" : "Organization", name: q.organisme };
        return c;
      }),
    },
  };
}

function article(d, page) {
  const a = page.article;
  return {
    "@context": "https://schema.org", "@type": "Article",
    headline: a.titre, url: SITE + page.url,
    author: { "@type": "Person", "@id": `${SITE}/pages/a-propos.html#loic-boyer`, name: d.identite.responsable },
    publisher: { "@type": "LocalBusiness", "@id": SITE, name: d.identite.nom },
    datePublished: a.publie_le, dateModified: a.mis_a_jour_le,
    inLanguage: "fr-FR",
  };
}

/** Tous les blocs d'une page, déjà sérialisés. « < » est échappé : un texte ne peut pas fermer la balise. */
export function blocsSchema(d, page, aujourdhui = new Date()) {
  const blocs = [];
  for (const type of page.schema ?? []) {
    if (type === "entreprise") blocs.push(entreprise(d, aujourdhui));
    else if (type === "site") blocs.push({ "@context": "https://schema.org", "@type": "WebSite", name: d.identite.nom, url: SITE + "/", inLanguage: "fr-FR", publisher: { "@id": SITE } });
    else if (type === "faq") blocs.push(faq(d, page.faq, aujourdhui));
    else if (type === "catalogue") blocs.push(catalogue(d));
    else if (type === "service") blocs.push(service(d, page));
    else if (type === "personne") blocs.push(personne(d, page));
    else if (type === "article") blocs.push(article(d, page));
    else throw new Error(`Type de données structurées inconnu : ${type} (${page.url})`);
  }
  const f = fil(page);
  if (f) blocs.push(f);
  return blocs.filter(Boolean).map((o) => JSON.stringify(o, null, 1).replace(/</g, "\\u003c"));
}
