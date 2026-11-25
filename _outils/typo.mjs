// Règle des espaces de DESIGN.md (section 4.2), appliquée à tout le HTML fabriqué.
// La police n'a ni U+202F ni U+2011 : on n'utilise que l'espace insécable ordinaire U+00A0.
// Seul le texte entre les balises est touché : jamais les attributs, les scripts, les styles.
const NB = " ";

function corriger(texte) {
  return texte
    .replace(/([^\s>( ]) ([?!:;»])/g, `$1${NB}$2`)        // avant ? ! : ; »
    .replace(/« /g, `«${NB}`)                                  // après «
    .replace(/(\d) (€|%|h\b|min\b|mois\b|ans\b|heures\b|minutes\b|séances?\b)/g, `$1${NB}$2`)
    .replace(/(\d) (\d{2}) (\d{2}) (\d{2}) (\d{2})/g, `$1${NB}$2${NB}$3${NB}$4${NB}$5`) // téléphone
    .replace(/\bn° (\d)/g, `n°${NB}$1`)
    .replace(/(h) (\d{2})\b/g, `$1${NB}$2`)                    // « 17 h 30 »
    .replace(/(art\.) (\d)/g, `$1${NB}$2`);
}

export function typographie(html) {
  let dans = null; // script | style | pre
  return html.split(/(<[^>]+>)/).map((morceau) => {
    if (morceau.startsWith("<")) {
      const m = morceau.match(/^<(\/?)(script|style|pre|textarea)\b/i);
      if (m) dans = m[1] ? null : m[2].toLowerCase();
      return morceau;
    }
    // « e-mail » ne se coupe pas au trait d'union (la police n'a pas de trait d'union insécable U+2011).
    return dans ? morceau : corriger(morceau).replace(/\b(e-mails?)\b/g, '<span class="sans-coupure">$1</span>');
  }).join("");
}
