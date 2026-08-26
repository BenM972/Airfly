import { escapeHtml } from "@/lib/email";
import { fermeture } from "@/data/fermeture";

/**
 * Gabarit commun a tous les courriels du site.
 *
 * Les contraintes du courriel ne sont pas celles du web : pas de flexbox, pas
 * de grille, pas de variables CSS, et les feuilles de style externes sont
 * ignorees par la plupart des clients. Tout passe donc par des tableaux
 * imbriques et des styles en ligne, comme il y a vingt ans.
 *
 * Les polices du site ne peuvent pas etre chargees non plus : Mirloanne et
 * Cormorant sont remplacees par des piles systeme. On garde en revanche la
 * palette, qui elle passe partout.
 */

const ROSE = "#FF0080";
const CREME = "#f5f0e8";
const ENCRE = "#111111";
const GRIS = "#6b7280";

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://airfly972.com";

/** Coordonnees reprises en pied de chaque message. */
const CONTACT = {
  telephone: "+596 596 76 25 31",
  telephoneLien: "+596596762531",
  email: "info@airfly972.com",
  adresse: "Plage de Pointe Faula, 97280 Le Vauclin, Martinique",
};

const HORAIRES = [
  ["Mercredi & Dimanche", "9h — 13h"],
  ["Jeudi — Samedi", "9h — 12h30 / 13h45 — 18h"],
];

/**
 * Ligne d'un tableau de details.
 * `valeur` est echappee ici : les appelants passent des donnees brutes venues
 * du formulaire, et un `<a href>` saisi dans le champ message arriverait sinon
 * tel quel dans la boite de reception.
 */
export function ligne(intitule: string, valeur: unknown): string {
  const v = escapeHtml(valeur);
  if (!v) return "";
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #eeeeee;color:${GRIS};font-family:${SANS};font-size:13px;width:42%;vertical-align:top">${escapeHtml(intitule)}</td>
      <td style="padding:10px 0;border-bottom:1px solid #eeeeee;color:${ENCRE};font-family:${SANS};font-size:14px;vertical-align:top">${v}</td>
    </tr>`;
}

/** Encadre d'appui, pour l'information que le lecteur doit retenir. */
export function encadre(contenu: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0">
      <tr>
        <td style="border-left:3px solid ${ROSE};background:${CREME};padding:16px 20px;font-family:${SERIF};font-size:16px;line-height:1.5;color:${ENCRE}">
          ${contenu}
        </td>
      </tr>
    </table>`;
}

/** Bouton d'action. Un tableau, faute de quoi Outlook ignore le remplissage. */
export function bouton(libelle: string, href: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0">
      <tr>
        <td style="background:${ENCRE}">
          <a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 28px;color:#ffffff;text-decoration:none;font-family:${SANS};font-size:13px;letter-spacing:1.5px;text-transform:uppercase">${escapeHtml(libelle)}</a>
        </td>
      </tr>
    </table>`;
}

/**
 * Enveloppe complete : en-tete, corps, pied.
 *
 * `preheader` est la ligne que les boites affichent apres l'objet. Sans elle,
 * elles y mettent le debut du HTML, souvent le texte du lien d'en-tete.
 */
export function enveloppe({
  titre,
  preheader,
  corps,
  rappelHoraires = false,
}: {
  titre: string;
  preheader: string;
  corps: string;
  /** Ajoute les horaires au pied : utile quand le client doit se deplacer. */
  rappelHoraires?: boolean;
}): string {
  const banniereFermeture =
    rappelHoraires && fermeture
      ? `<p style="margin:12px 0 0;font-family:${SANS};font-size:13px;color:${ROSE}">
           ${escapeHtml(fermeture.libelle)}
         </p>`
      : "";

  const horaires = rappelHoraires
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:16px">
         ${HORAIRES.map(
           ([jours, heures]) => `
           <tr>
             <td style="padding:2px 16px 2px 0;font-family:${SANS};font-size:13px;color:${GRIS}">${jours}</td>
             <td style="padding:2px 0;font-family:${SANS};font-size:13px;color:#d1d5db">${heures}</td>
           </tr>`
         ).join("")}
       </table>
       ${banniereFermeture}`
    : "";

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${escapeHtml(titre)}</title>
  </head>
  <body style="margin:0;padding:0;background:${CREME}">
    <!-- Repris par les boites en apercu, juste apres l'objet. -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREME};padding:32px 16px">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff">

            <tr>
              <td style="background:${ENCRE};padding:28px 32px">
                <a href="${SITE}" style="color:#ffffff;text-decoration:none;font-family:${SANS};font-size:18px;letter-spacing:4px;text-transform:uppercase">Airfly</a>
                <p style="margin:6px 0 0;font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${ROSE}">
                  Ecole de glisse &amp; surf shop
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:32px">
                <h1 style="margin:0 0 20px;font-family:${SERIF};font-size:24px;font-weight:normal;line-height:1.3;color:${ENCRE}">
                  ${escapeHtml(titre)}
                </h1>
                ${corps}
              </td>
            </tr>

            <tr>
              <td style="background:${ENCRE};padding:28px 32px">
                <p style="margin:0 0 10px;font-family:${SANS};font-size:13px;line-height:1.6;color:#d1d5db">
                  ${CONTACT.adresse}
                </p>
                <p style="margin:0;font-family:${SANS};font-size:13px;line-height:1.6">
                  <a href="tel:${CONTACT.telephoneLien}" style="color:#ffffff;text-decoration:none">${CONTACT.telephone}</a>
                  <span style="color:${GRIS}"> &nbsp;·&nbsp; </span>
                  <a href="mailto:${CONTACT.email}" style="color:#ffffff;text-decoration:none">${CONTACT.email}</a>
                </p>
                ${horaires}
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** Paragraphe courant du corps. */
export function paragraphe(texte: string): string {
  return `<p style="margin:0 0 16px;font-family:${SERIF};font-size:16px;line-height:1.6;color:${ENCRE}">${texte}</p>`;
}

/** Tableau de details, compose de `ligne()`. */
export function details(lignes: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 4px">${lignes}</table>`;
}

/** Mention discrete de fin de message. */
export function mentionDiscrete(texte: string): string {
  return `<p style="margin:24px 0 0;font-family:${SANS};font-size:12px;line-height:1.5;color:${GRIS}">${texte}</p>`;
}
