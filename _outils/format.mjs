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
