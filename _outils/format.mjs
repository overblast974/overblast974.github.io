// Mises en forme calculées à partir de _data/entreprise.yaml.
// Une seule règle par format : les pages (étape 3) et le contrôle témoin (étape 1)
// passent par les mêmes fonctions, donc ne peuvent pas diverger.

export const NBSP = "&nbsp;";

const JOURS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const ABREGE = { lundi: "lun", mardi: "mar", mercredi: "mer", jeudi: "jeu", vendredi: "ven", samedi: "sam", dimanche: "dim" };
const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

/** 50 -> "50&nbsp;€" ; 42.5 -> "42,50&nbsp;€" ; espace simple si insecable = false (texte des CGV). */
export function euros(montant, { insecable = true } = {}) {
  const txt = Number.isInteger(montant) ? String(montant) : montant.toFixed(2).replace(".", ",");
  return txt + (insecable ? NBSP : " ") + "€";
}

/** Prix d'une séance dans un forfait (240 € / 5 = 48). */
export const prixParSeance = (forfait) => forfait.prix / forfait.seances;

/** Remise d'un forfait en %, arrondie à l'unité (règle validée au cahier des charges). */
export const remise = (forfait, prixSeance) =>
  Math.round((1 - forfait.prix / (forfait.seances * prixSeance)) * 100);

/** "17:30" -> "17 h 30" ; "08:00" -> "8 h" (sep = espace insécable ou espace simple). */
export function heure(hhmm, sep = NBSP) {
  const [h, m] = hhmm.split(":").map(Number);
  return m === 0 ? `${h}${sep}h` : `${h}${sep}h${sep}${String(m).padStart(2, "0")}`;
}

/** ["lundi", …, "vendredi"] -> "lun-ven" ; ["samedi"] -> "sam". Jours consécutifs attendus. */
function plageJoursAbregee(jours) {
  return jours.length === 1 ? ABREGE[jours[0]] : `${ABREGE[jours[0]]}-${ABREGE[jours.at(-1)]}`;
}
function plageJoursLongue(jours) {
  return jours.length === 1 ? `le ${jours[0]}` : `du ${jours[0]} au ${jours.at(-1)}`;
}

/** Format « pied de page » : "Lun-ven 17&nbsp;h&nbsp;30 – 21&nbsp;h&nbsp;30, sam 8&nbsp;h – 16&nbsp;h". */
export function horairesPied(plages) {
  const txt = plages.map((p) => `${plageJoursAbregee(p.jours)} ${heure(p.de)} – ${heure(p.a)}`).join(", ");
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}

/** Format « phrase » : "du lundi au vendredi de 17 h 30 à 21 h 30 et le samedi de 8 h à 16 h". */
export function horairesPhrase(plages, { sep = " ", liaison = " et " } = {}) {
  const parts = plages.map((p) => `${plageJoursLongue(p.jours)} de ${heure(p.de, sep)} à ${heure(p.a, sep)}`);
  return parts.length === 1 ? parts[0] : parts.slice(0, -1).join(", ") + liaison + parts.at(-1);
}

/** "2026-11-25" -> "25 novembre 2026". */
export function dateLongue(iso) {
  const [a, m, j] = iso.split("-").map(Number);
  return `${j === 1 ? "1er" : j} ${MOIS[m - 1]} ${a}`;
}

/** La phrase d'absence est-elle à afficher à cette date ? (avant la date de reprise) */
export const absenceActive = (absence, aujourdhui = new Date()) =>
  absence?.reprise_le ? aujourdhui.toISOString().slice(0, 10) < absence.reprise_le : false;

/** Texte brut d'une réponse HTML, pour la copie FAQPage du JSON-LD. */
export const texteBrut = (html) =>
  html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/ /g, " ")
    .replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

/** "de coaching sportif, d'activité physique adaptée, de Pilates ou de préparation physique" */
export function listeDe(elements) {
  const de = (s) => (/^[aeiouyéèêàâîïôû]/i.test(s) ? `d'${s}` : `de ${s}`);
  const t = elements.map(de);
  return t.length === 1 ? t[0] : t.slice(0, -1).join(", ") + " ou " + t.at(-1);
}

export { JOURS };

// ---------------------------------------------------------------------------
// Ajouts du lot F (intégration de la refonte, 25/11/2026).
// ---------------------------------------------------------------------------

/** Format court de la refonte : "Lun.–ven. 17&nbsp;h&nbsp;30 – 21&nbsp;h&nbsp;30 · sam. 8&nbsp;h – 16&nbsp;h". */
export function horairesCourts(plages) {
  const jours = (j) => (j.length === 1 ? `${ABREGE[j[0]]}.` : `${ABREGE[j[0]]}.–${ABREGE[j.at(-1)]}.`);
  const txt = plages.map((p) => `${jours(p.jours)} ${heure(p.de)} – ${heure(p.a)}`).join(" · ");
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}

/** "Montpellier, Lattes, Castelnau-le-Lez, Mauguio et la métropole" (zone.communes + zone.suite). */
export function zonePhrase(zone) {
  const c = zone.communes;
  return zone.suite ? `${c.join(", ")} et ${zone.suite}` : c.length === 1 ? c[0] : `${c.slice(0, -1).join(", ")} et ${c.at(-1)}`;
}

/** 60 -> "une heure" ; 90 -> "1 h 30" ; 45 -> "45 minutes". */
export function dureeTexte(minutes) {
  if (minutes === 60) return "une heure";
  if (minutes % 60 === 0) return `${minutes / 60}${NBSP}heures`;
  if (minutes > 60) return `${Math.floor(minutes / 60)}${NBSP}h${NBSP}${String(minutes % 60).padStart(2, "0")}`;
  return `${minutes}${NBSP}minutes`;
}

/** Première lettre en capitale (après d'éventuelles balises). */
export const capitale = (s) => String(s).replace(/^(<[^>]+>)*(\S)/, (m, b = "", c) => (b ?? "") + c.toUpperCase());

/**
 * Remplace les renvois {zone}, {communes}, {zone_suite}, {horaires}, {horaires_courts}, {telephone}, {email}, {seance},
 * {duree_seance}, {duree_appel}, {forfaits_seances} et {absence} d'un texte des données (réponses de FAQ,
 * descriptions des pages en front matter) par leur valeur.
 * {absence} devient une chaîne vide après la date de reprise : la phrase disparaît du texte visible
 * comme de sa copie FAQPage, sans retoucher la réponse.
 */
/** Tailles des forfaits : « 5, 10 ou 20 ». */
export function forfaitsSeances(forfaits) {
  const n = forfaits.map((f) => String(f.seances));
  return n.length === 1 ? n[0] : n.slice(0, -1).join(", ") + " ou " + n.at(-1);
}

export function remplir(texte, d, aujourdhui = new Date()) {
  const tel = d.contact.telephone;
  const valeurs = {
    zone: zonePhrase(d.zone),
    communes: d.zone.communes.join(", "),
    zone_suite: d.zone.suite ?? "",
    horaires: horairesPhrase(d.horaires.plages, { sep: NBSP, liaison: ", " }),
    horaires_courts: horairesCourts(d.horaires.plages),
    telephone: `<a href="tel:${tel.international}">${tel.affiche.replace(/ /g, NBSP)}</a>`,
    email: `<a href="mailto:${d.contact.email}">${d.contact.email}</a>`,
    seance: euros(d.offre.seance.prix),
    duree_seance: dureeTexte(d.offre.seance.duree_minutes),
    duree_appel: d.contact.reservation.appel.duree,
    forfaits_seances: forfaitsSeances(d.offre.forfaits),
    absence: absenceActive(d.absence, aujourdhui) ? d.absence.phrase : "",
  };
  return String(texte)
    .replace(/\{([a-z_]+)\}/g, (m, cle, pos, tout) => {
      if (!(cle in valeurs)) return m;
      // En début de phrase, la valeur prend une capitale (« {horaires}. » -> « Du lundi… »).
      const avant = tout.slice(0, pos);
      return /(^|<p>|[.!?]\s)$/.test(avant) ? capitale(valeurs[cle]) : valeurs[cle];
    })
    .replace(/ +(<\/p>)/g, "$1").replace(/ {2,}/g, " ");
}
