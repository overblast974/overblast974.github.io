// Réduction du script du site, sans dépendance : retire commentaires et blancs.
// Ne gère que ce que _js/site.js utilise (chaînes entre ' ou ", pas d'expression régulière
// littérale ni de gabarit `…`) : la fabrication s'arrête si l'un d'eux apparaît.
// Toutes les instructions finissent par « ; » dans la source : aucun retour à la ligne n'est utile.
export function reduireJs(source) {
  let sortie = "", i = 0, blanc = false;
  const mot = (c) => /[\w$]/.test(c ?? "");
  while (i < source.length) {
    const c = source[i], s = source[i + 1];
    if (c === "/" && s === "/") { i = source.indexOf("\n", i); if (i < 0) break; blanc = true; continue; }
    if (c === "/" && s === "*") { i = source.indexOf("*/", i) + 2; blanc = true; continue; }
    if (c === "`") throw new Error("reduire-js : gabarit `…` non pris en charge");
    if (c === "/" && !/[\w)\]$]/.test(sortie.at(-1) ?? "")) throw new Error("reduire-js : expression régulière littérale non prise en charge");
    if (c === "'" || c === '"') {
      let j = i + 1;
      while (source[j] !== c) { if (source[j] === "\\") j++; if (j >= source.length || source[j] === "\n") throw new Error("reduire-js : chaîne non fermée"); j++; }
      if (blanc && mot(sortie.at(-1))) sortie += " ";
      sortie += source.slice(i, j + 1); i = j + 1; blanc = false; continue;
    }
    if (/\s/.test(c)) { blanc = true; i++; continue; }
    if (blanc && mot(sortie.at(-1)) && mot(c)) sortie += " ";
    sortie += c; blanc = false; i++;
  }
  return sortie + "\n";
}
