/**
 * Retire les accents d'une chaine.
 * La police Mirloanne n'a pas de glyphes accentues : tout texte rendu avec
 * elle doit passer par cette fonction, sinon le repli serif affiche un
 * caractere isole au milieu du mot.
 * Plage \u0300-\u036f : marques diacritiques combinantes, en echappements
 * plutot qu'en caracteres litteraux, invisibles dans un editeur.
 */
export function stripAccents(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
