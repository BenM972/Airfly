import { Resend } from "resend";

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY manquant.");

  if (mailFrom().includes("resend.dev")) {
    console.warn(
      "[email] Expediteur sur le domaine bac a sable de Resend : les notifications " +
        "ne seront delivrees qu'a l'adresse proprietaire du compte. Verifiez " +
        "send.airfly972.com dans Resend puis retirez RESEND_FROM."
    );
  }

  _resend = new Resend(key);
  return _resend;
}

/**
 * Expediteur des notifications.
 *
 * Le sous-domaine et non l'apex, parce que Resend REFUSE d'envoyer depuis un
 * domaine qu'il n'a pas verifie. Avec info@airfly972.com, il repondait :
 *   403 "The airfly972.com domain is not verified."
 * La demande etait enregistree en base, mais la notification mourait la.
 * Seul send.airfly972.com est verifie, d'ou cette adresse.
 *
 * L'expediteur visible importe peu ici : ces messages ne quittent pas
 * l'entreprise, ils vont de la boutique a sa propre boite. Et `replyTo` porte
 * l'adresse du client, donc repondre fonctionne normalement.
 *
 * Pour revenir a info@airfly972.com : ajouter airfly972.com comme domaine dans
 * Resend, avec "receiving" DESACTIVE — il ne demande alors que des CNAME,
 * aucun MX, donc aucun risque pour les MX de Google Workspace. Une fois
 * verifie, remplacer la valeur ci-dessous.
 */
export function mailFrom(): string {
  return process.env.RESEND_FROM ?? "AIRFLY <notifications@send.airfly972.com>";
}

/** Destinataire principal des notifications internes. */
export function mailTo(): string {
  return process.env.NOTIFY_EMAIL ?? "info@airfly972.com";
}

/**
 * Destinataires en copie cachee. Plusieurs adresses possibles, separees par
 * des virgules dans NOTIFY_BCC. Renvoie un tableau vide si la variable est
 * definie mais vide : l'appelant omet alors le champ, Resend refusant une
 * liste vide.
 *
 * Copie CACHEE et non visible : ces notifications portent le nom, le telephone
 * et le courriel d'un client. Une copie visible exposerait l'adresse de
 * surveillance a quiconque recoit ou fait suivre le message, et la ferait
 * apparaitre dans un "repondre a tous".
 */
export function mailBcc(): string[] {
  // contact@bmconsultingfwi.fr et non hello@airfly972.com : un domaine n'a
  // qu'un seul jeu de MX, ceux d'airfly972.com pointent vers Google Workspace,
  // et la boite hello@ avait ete creee chez Hostinger — elle n'aurait donc
  // jamais rien recu. A rebasculer sur hello@airfly972.com le jour ou l'adresse
  // existera dans Google Workspace, en alias ou en groupe.
  const brut = process.env.NOTIFY_BCC ?? "contact@bmconsultingfwi.fr";
  return brut
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);
}

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * Echappe une valeur avant insertion dans le HTML d'un email.
 * Sans ca, un `<a href>` saisi dans le champ message arrive tel quel
 * dans la boite de reception.
 */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}
