import { escapeHtml } from "@/lib/email";
import { bouton, details, encadre, enveloppe, ligne, mentionDiscrete, paragraphe } from "./gabarit";

/**
 * Les six courriels du site.
 *
 * Deux destinataires, deux tons. Ce qui part vers la boutique est un bordereau :
 * tout y figure, y compris l'identifiant, et rien n'y est enjolive. Ce qui part
 * vers le client est une reponse : on lui dit ou il en est et ce qui va se
 * passer, jamais ce qu'il vient de saisir en entier.
 *
 * Aucun de ces messages ne promet de disponibilite. Une demande n'est pas une
 * commande : la boutique confirme ensuite, et c'est cette confirmation qui
 * engage.
 */

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://airfly972.com";

/** Date ISO vers "lundi 6 octobre 2026". Renvoie la valeur brute si illisible. */
export function dateEnClair(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── Ecole ───────────────────────────────────────────────────────────────────

type DemandeEcole = {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string | null;
  discipline: string;
  prestation: string;
  niveau?: string | null;
  date_souhaitee?: string | null;
  creneau?: string | null;
  message?: string | null;
};

/** Vers la boutique, a la reception d'une demande de cours. */
export function ecoleInterne(d: DemandeEcole, recuLe: string): string {
  return enveloppe({
    titre: "Nouvelle demande de cours",
    preheader: `${d.prenom} ${d.nom} — ${d.discipline}, ${d.prestation}`,
    corps:
      paragraphe(`Recue le ${escapeHtml(recuLe)}.`) +
      details(
        ligne("Prenom et nom", `${d.prenom} ${d.nom}`) +
          ligne("Courriel", d.email) +
          ligne("Telephone", d.telephone || "—") +
          ligne("Discipline", d.discipline) +
          ligne("Prestation", d.prestation) +
          ligne("Niveau", d.niveau || "—") +
          ligne("Date souhaitee", dateEnClair(d.date_souhaitee) || "—") +
          ligne("Creneau souhaite", d.creneau || "—") +
          ligne("Message", d.message || "—")
      ) +
      bouton("Traiter dans le back office", `${SITE}/admin/demandes`) +
      mentionDiscrete(
        `Repondre a ce message ecrit directement a ${escapeHtml(d.email)}. Reference ${escapeHtml(d.id)}.`
      ),
  });
}

/** Vers le client, a la reception de sa demande. Accuse de reception, rien de plus. */
export function ecoleAccuse(d: DemandeEcole): string {
  return enveloppe({
    titre: `Bien recu, ${d.prenom}`,
    preheader: "Votre demande de cours nous est parvenue, on revient vers vous sous 24 h.",
    corps:
      paragraphe("Votre demande de cours nous est bien parvenue. On la regarde et on revient vers vous sous 24 heures pour confirmer la date et le creneau.") +
      encadre(
        `<strong>${escapeHtml(d.discipline)} — ${escapeHtml(d.prestation)}</strong>` +
          (d.date_souhaitee
            ? `<br><span style="color:#6b7280">Souhait : ${escapeHtml(dateEnClair(d.date_souhaitee))}${d.creneau ? `, ${escapeHtml(d.creneau).toLowerCase()}` : ""}</span>`
            : "")
      ) +
      paragraphe("Rien n'est encore reserve a ce stade : nous verifions la disponibilite du moniteur et les conditions de vent, puis nous vous envoyons la confirmation.") +
      paragraphe("Une question d'ici la ? Repondez simplement a ce message.") +
      mentionDiscrete("Vous recevez ce courriel parce qu'une demande de cours a ete faite avec votre adresse sur airfly972.com."),
  });
}

/** Vers le client, quand la boutique confirme le cours. */
export function ecoleConfirmee(
  d: DemandeEcole,
  dateConfirmee: string,
  creneauConfirme: string,
  reprogrammation: boolean
): string {
  const titre = reprogrammation ? `Votre cours est reprogramme` : `C'est confirme, ${d.prenom} !`;
  return enveloppe({
    titre,
    preheader: `${dateEnClair(dateConfirmee)}${creneauConfirme ? `, ${creneauConfirme.toLowerCase()}` : ""}`,
    rappelHoraires: true,
    corps:
      paragraphe(
        reprogrammation
          ? "Votre cours a ete deplace. Voici la nouvelle date retenue :"
          : "Votre cours est confirme. Voici les details :"
      ) +
      encadre(
        `<strong>${escapeHtml(d.discipline)} — ${escapeHtml(d.prestation)}</strong><br>` +
          `${escapeHtml(dateEnClair(dateConfirmee))}` +
          (creneauConfirme ? `<br>${escapeHtml(creneauConfirme)}` : "")
      ) +
      paragraphe("Rendez-vous a l'ecole, sur la plage de Pointe Faula. Prevoyez maillot, serviette et creme solaire — on fournit tout le materiel.") +
      paragraphe("Le vent decide parfois autrement : en cas de conditions impraticables, on vous appelle pour decaler.") +
      mentionDiscrete("Un empechement ? Repondez a ce message ou appelez-nous, on trouvera une autre date."),
  });
}

/** Vers le client, quand la boutique annule. */
export function ecoleAnnulee(d: DemandeEcole): string {
  return enveloppe({
    titre: "Votre demande de cours",
    preheader: "Nous ne pouvons malheureusement pas donner suite.",
    corps:
      paragraphe(`Bonjour ${escapeHtml(d.prenom)},`) +
      paragraphe(`Nous ne pouvons malheureusement pas donner suite a votre demande de ${escapeHtml(d.discipline)} — ${escapeHtml(d.prestation)}.`) +
      paragraphe("Cela tient le plus souvent a la disponibilite des moniteurs sur la periode demandee. N'hesitez pas a nous rappeler pour trouver un autre creneau, souvent une autre semaine suffit.") +
      bouton("Faire une nouvelle demande", `${SITE}/ecole#reservation`) +
      mentionDiscrete("Rien ne vous a ete facture : aucune demande faite sur le site n'entraine de paiement."),
  });
}

// ─── Click & collect ─────────────────────────────────────────────────────────

type DemandeBoutique = {
  id?: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string | null;
  /** Une ligne par article, "2× T-shirt — M". */
  articles: string;
  date_retrait?: string | null;
  creneau?: string | null;
};

function articlesEnListe(articles: string): string {
  const lignes = articles.split("\n").map((l) => l.trim()).filter(Boolean);
  if (!lignes.length) return "";
  return `<ul style="margin:0;padding-left:20px">${lignes
    .map(
      (l) =>
        `<li style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.5;color:#111111">${escapeHtml(l)}</li>`
    )
    .join("")}</ul>`;
}

/** Vers la boutique, a la reception d'une reservation click & collect. */
export function boutiqueInterne(d: DemandeBoutique, recuLe: string): string {
  return enveloppe({
    titre: "Nouvelle reservation click & collect",
    preheader: `${d.prenom} ${d.nom} — ${d.articles.split("\n").filter(Boolean).length} article(s)`,
    corps:
      paragraphe(`Recue le ${escapeHtml(recuLe)}.`) +
      encadre(articlesEnListe(d.articles)) +
      details(
        ligne("Prenom et nom", `${d.prenom} ${d.nom}`) +
          ligne("Courriel", d.email) +
          ligne("Telephone", d.telephone || "—") +
          ligne("Retrait souhaite", dateEnClair(d.date_retrait) || "—") +
          ligne("Creneau souhaite", d.creneau || "—")
      ) +
      bouton("Traiter dans le back office", `${SITE}/admin/demandes`) +
      mentionDiscrete(`Repondre a ce message ecrit directement a ${escapeHtml(d.email)}.`),
  });
}

/** Vers le client, a la reception de sa reservation. */
export function boutiqueAccuse(d: DemandeBoutique): string {
  return enveloppe({
    titre: `Bien recu, ${d.prenom}`,
    preheader: "Votre reservation nous est parvenue, on verifie la disponibilite.",
    corps:
      paragraphe("Votre reservation nous est bien parvenue. On verifie la disponibilite en boutique et on vous previent des que c'est pret.") +
      encadre(articlesEnListe(d.articles)) +
      paragraphe("Rien n'est encore reserve ni facture : la mise de cote se fait apres notre verification, et vous reglez au retrait.") +
      mentionDiscrete("Vous recevez ce courriel parce qu'une reservation a ete faite avec votre adresse sur airfly972.com."),
  });
}

/** Vers le client, quand la commande est prete. */
export function boutiquePrete(d: DemandeBoutique): string {
  return enveloppe({
    titre: `Votre commande vous attend, ${d.prenom}`,
    preheader: "Elle est mise de cote a la boutique, passez quand vous voulez.",
    rappelHoraires: true,
    corps:
      paragraphe("Votre commande est prete et mise de cote a la boutique.") +
      encadre(articlesEnListe(d.articles)) +
      paragraphe("Passez la recuperer quand vous voulez, pendant nos horaires d'ouverture — pas besoin de prendre rendez-vous. Le reglement se fait sur place.") +
      paragraphe("On se trouve sur la plage de Pointe Faula, au Vauclin.") +
      mentionDiscrete("Un empechement, ou vous ne pouvez pas passer avant longtemps ? Repondez a ce message, on s'arrange."),
  });
}

/** Vers le client, quand la boutique annule. */
export function boutiqueAnnulee(d: DemandeBoutique): string {
  return enveloppe({
    titre: "Votre reservation",
    preheader: "Nous ne pouvons malheureusement pas honorer cette reservation.",
    corps:
      paragraphe(`Bonjour ${escapeHtml(d.prenom)},`) +
      paragraphe("Nous ne pouvons malheureusement pas honorer votre reservation :") +
      encadre(articlesEnListe(d.articles)) +
      paragraphe("C'est en general une question de stock. Appelez-nous ou passez a la boutique : nous avons souvent l'equivalent dans une autre taille ou un autre coloris, et bien plus de references en rayon que sur le site.") +
      bouton("Voir la boutique", `${SITE}/shop`) +
      mentionDiscrete("Rien ne vous a ete facture : aucune reservation faite sur le site n'entraine de paiement."),
  });
}
