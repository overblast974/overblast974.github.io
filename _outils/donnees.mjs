// Contrôle de _data/entreprise.yaml, appelé à chaque fabrication (eleventy.config.js)
// et par le contrôle témoin. Une seule erreur suffit à refuser la fabrication :
// rien n'est alors publié et le site en ligne reste tel qu'il était.
import { JOURS, remise } from "./format.mjs";

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const HEURE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function erreursEntreprise(d) {
  const e = [];
  const champ = (chemin) => chemin.split(".").reduce((o, k) => (o == null ? undefined : o[k]), d);
  const texte = (chemin) => {
    const v = champ(chemin);
    if (typeof v !== "string" || v.trim() === "") e.push(`${chemin} : texte obligatoire manquant`);
    return v;
  };
  const prix = (chemin, { zero = false, libelle = chemin } = {}) => {
    const v = champ(chemin);
    if (!Number.isInteger(v) || v < 0 || (!zero && v === 0))
      e.push(`${libelle} : un prix est un nombre entier d'euros${zero ? "" : " supérieur à 0"}, sans « € » (lu : ${JSON.stringify(v)})`);
    return v;
  };
  const date = (chemin) => {
    const v = champ(chemin);
    if (typeof v !== "string" || !DATE.test(v) || Number.isNaN(Date.parse(v)) || new Date(v).toISOString().slice(0, 10) !== v)
      e.push(`${chemin} : date attendue au format "AAAA-MM-JJ" entre guillemets (lu : ${JSON.stringify(v)})`);
    return v;
  };

  if (!d || typeof d !== "object") return ["le fichier est vide ou illisible"];

  texte("identite.nom");
  texte("identite.responsable");

  // Téléphone : 10 chiffres affichés, et le même numéro au format international.
  const aff = texte("contact.telephone.affiche");
  const intl = texte("contact.telephone.international");
  if (typeof aff === "string") {
    const chiffres = aff.replace(/\s/g, "");
    if (!/^0\d{9}$/.test(chiffres)) e.push(`contact.telephone.affiche : 10 chiffres attendus, commençant par 0 (lu : "${aff}")`);
    else if (intl !== "+33" + chiffres.slice(1))
      e.push(`contact.telephone.international : doit être "+33${chiffres.slice(1)}" pour correspondre au numéro affiché`);
  }
  const mail = texte("contact.email");
  if (typeof mail === "string" && !/^[^\s@<>"]+@[^\s@<>"]+\.[a-z]{2,}$/i.test(mail))
    e.push(`contact.email : adresse invalide (lu : "${mail}")`);
  for (const k of ["appel", "domicile"]) {
    const l = texte(`contact.reservation.${k}.lien`);
    if (typeof l === "string" && !l.startsWith("https://")) e.push(`contact.reservation.${k}.lien : doit commencer par https://`);
  }

  texte("zone.libelle_court");
  texte("zone.deplacement_compris");

  // Horaires
  const plages = champ("horaires.plages");
  if (!Array.isArray(plages) || plages.length === 0) e.push("horaires.plages : au moins une plage attendue");
  else plages.forEach((p, i) => {
    const ici = `horaires.plages[${i + 1}]`;
    if (!Array.isArray(p.jours) || p.jours.length === 0 || p.jours.some((j) => !JOURS.includes(j)))
      e.push(`${ici}.jours : jours attendus en toutes lettres, en minuscules (lundi … dimanche)`);
    else {
      const idx = p.jours.map((j) => JOURS.indexOf(j));
      if (idx.some((v, k) => k > 0 && v !== idx[k - 1] + 1)) e.push(`${ici}.jours : jours consécutifs attendus (sinon, faire deux plages)`);
    }
    for (const h of ["de", "a"]) if (typeof p[h] !== "string" || !HEURE.test(p[h])) e.push(`${ici}.${h} : heure attendue au format "HH:MM" entre guillemets`);
    if (HEURE.test(p.de ?? "") && HEURE.test(p.a ?? "") && p.de >= p.a) e.push(`${ici} : l'heure de fin doit suivre l'heure de début`);
  });

  // Absence : facultative, mais complète si présente.
  if (d.absence) { date("absence.reprise_le"); texte("absence.phrase"); }

  // Offre
  prix("offre.premier_rendez_vous.prix", { zero: true });
  const seance = prix("offre.seance.prix");
  const duree = champ("offre.seance.duree_minutes");
  if (duree != null && (!Number.isInteger(duree) || duree <= 0)) e.push("offre.seance.duree_minutes : nombre entier de minutes attendu");
  const forfaits = champ("offre.forfaits");
  if (!Array.isArray(forfaits) || forfaits.length === 0) e.push("offre.forfaits : au moins un forfait attendu");
  else forfaits.forEach((f, i) => {
    const ici = `offre.forfaits[${i + 1}]`;
    if (!Number.isInteger(f.seances) || f.seances <= 0) e.push(`${ici}.seances : nombre entier de séances attendu`);
    prix(`offre.forfaits.${i}.prix`, { libelle: `${ici}.prix` });
    if (!Number.isInteger(f.de_preference_sous_mois) || f.de_preference_sous_mois <= 0) e.push(`${ici}.de_preference_sous_mois : nombre entier de mois attendu`);
    // Les barres des forfaits ont une échelle de 8 mois (une graduation par mois) : au-delà, la barre mentirait.
    else if (f.de_preference_sous_mois > 8) e.push(`${ici}.de_preference_sous_mois : 8 mois au plus (échelle des barres des forfaits) ; pour une durée plus longue, demandez à l'agence d'allonger l'échelle`);
    if (Number.isInteger(seance) && Number.isInteger(f.prix) && Number.isInteger(f.seances) && remise(f, seance) <= 0)
      e.push(`${ici} : le forfait (${f.prix} €) n'est pas moins cher que ${f.seances} séances à l'unité (${f.seances * seance} €)`);
  });
  prix("offre.bilan_seul.prix");
  const alim = champ("offre.alimentation");
  if (!Array.isArray(alim)) e.push("offre.alimentation : liste attendue");
  else alim.forEach((a, i) => { texte(`offre.alimentation.${i}.nom`); prix(`offre.alimentation.${i}.prix`, { libelle: `offre.alimentation[${i + 1}].prix` }); });
  texte("offre.mention_prix");

  // Mentions
  const siret = texte("mentions.siret");
  if (typeof siret === "string" && !/^\d{14}$/.test(siret)) e.push("mentions.siret : 14 chiffres attendus");
  date("mentions.mise_a_jour_pages_legales");

  // FAQ : HTML court, sans script ni style en ligne (CONFORMITE.md E-50, E-51).
  for (const [page, liste] of Object.entries(d.faq ?? {})) {
    if (!Array.isArray(liste)) { e.push(`faq.${page} : liste attendue`); continue; }
    liste.forEach((q, i) => {
      const ici = `faq.${page}[${i + 1}]`;
      if (typeof q.question !== "string" || !q.question.trim()) e.push(`${ici}.question : manquante`);
      if (typeof q.reponse !== "string" || !q.reponse.trim()) e.push(`${ici}.reponse : manquante`);
      for (const t of [q.reponse, q.complement]) {
        if (typeof t === "string" && /<script|<style|\sstyle=|\son[a-z]+=|javascript:/i.test(t))
          e.push(`${ici} : script, style ou gestionnaire en ligne interdit dans une réponse`);
      }
    });
  }
  return e;
}

/** Lève une erreur lisible si le fichier n'est pas valable. */
export function validerEntreprise(d, fichier = "_data/entreprise.yaml") {
  const e = erreursEntreprise(d);
  if (e.length) {
    throw new Error(`${fichier} : ${e.length} erreur(s) de saisie, rien n'est publié.\n  - ${e.join("\n  - ")}`);
  }
  return d;
}
