/**
 * Remise en ordre des options de variation.
 *
 * WooCommerce renvoie les options dans l'ordre ou elles ont ete saisies, qui
 * n'est pas toujours croissant : neuf produits Salty Crew arrivent en
 * ["S","M","XS","L"], avec le XS en troisieme position.
 *
 * Le tri ne s'applique que si TOUTES les options d'un attribut relevent d'une
 * meme famille reconnue. Sinon l'ordre d'origine est rendu tel quel : une
 * liste qu'on ne sait pas interpreter — des couleurs, des references — doit
 * rester telle que la boutique l'a voulue, et non etre brassee par un tri
 * alphabetique qui aurait l'air d'un bug.
 */

// Du plus petit au plus grand. Les equivalents numeriques courants (2XL pour
// XXL) sont ramenes a la meme entree.
const ECHELLE_LETTRES = ["XXXS", "XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

function rangLettre(option: string): number {
  const brut = option.trim().toUpperCase().replace(/\s+/g, "");
  const direct = ECHELLE_LETTRES.indexOf(brut);
  if (direct !== -1) return direct;

  // "2XL" vaut "XXL", "3XL" vaut "XXXL".
  const multiple = brut.match(/^([2-9])X([SL])$/);
  if (multiple) {
    const [, nombre, sens] = multiple;
    return ECHELLE_LETTRES.indexOf("X".repeat(Number(nombre)) + sens);
  }
  return -1;
}

/**
 * Valeur numerique en tete de chaine : "38", "4 ans", "9m", "133x40", "5'4"".
 * La virgule decimale est acceptee, "6,5M" valant "6.5M".
 */
function valeurNumerique(option: string): number | null {
  const trouve = option.trim().match(/^(\d+(?:[.,]\d+)?)/);
  return trouve ? Number(trouve[1].replace(",", ".")) : null;
}

export function trierOptions(options: string[]): string[] {
  if (options.length < 2) return options;

  const rangs = options.map(rangLettre);
  if (rangs.every((r) => r !== -1)) {
    return options
      .map((option, i) => ({ option, rang: rangs[i] }))
      .sort((a, b) => a.rang - b.rang)
      .map((x) => x.option);
  }

  const valeurs = options.map(valeurNumerique);
  if (valeurs.every((v) => v !== null)) {
    return options
      .map((option, i) => ({ option, valeur: valeurs[i] as number }))
      .sort((a, b) => a.valeur - b.valeur)
      .map((x) => x.option);
  }

  return options;
}
