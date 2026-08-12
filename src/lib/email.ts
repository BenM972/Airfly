import { Resend } from "resend";

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY manquant.");

  if (mailFrom().includes("resend.dev")) {
    console.warn(
      "[email] Expediteur sur le domaine bac a sable de Resend : les notifications " +
        "ne seront delivrees qu'a l'adresse proprietaire du compte. Verifiez airfly972.com " +
        "dans Resend puis definissez RESEND_FROM."
    );
  }

  _resend = new Resend(key);
  return _resend;
}

/**
 * Expediteur des notifications.
 *
 * Le repli `onboarding@resend.dev` est le domaine bac a sable de Resend : il
 * ne delivre qu'a l'adresse proprietaire du compte. Pour recevoir reellement
 * les demandes, verifier airfly972.com dans Resend (SPF + DKIM chez le
 * registrar) puis definir RESEND_FROM, par exemple :
 *   RESEND_FROM="AIRFLY <reservation@airfly972.com>"
 */
export function mailFrom(): string {
  return process.env.RESEND_FROM ?? "AIRFLY <onboarding@resend.dev>";
}

/** Destinataire des notifications internes. */
export function mailTo(): string {
  return process.env.NOTIFY_EMAIL ?? "contact@bmconsultingfwi.fr";
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
