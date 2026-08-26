/**
 * Fichier iCalendar joint aux confirmations de cours.
 *
 * Une piece jointe `.ics` plutot qu'un lien : les liens "Ajouter a Google
 * Agenda" ne fonctionnent que chez Google et echouent dans l'application Mail
 * d'iOS. Le fichier, lui, est reconnu par les deux, et par Outlook.
 *
 * L'identifiant `UID` est derive de celui de la demande, donc stable : quand un
 * cours est reprogramme, le meme UID accompagne d'un `SEQUENCE` plus eleve
 * demande aux agendas de METTRE A JOUR l'evenement existant au lieu d'en creer
 * un second. Sans cela le client se retrouverait avec deux rendez-vous, dont
 * un faux.
 */

/** Martinique : UTC−4 toute l'annee, aucun changement d'heure. */
const DECALAGE_HEURES = 4;

/**
 * Plages horaires des creneaux, en heure locale.
 * Trois heures : la duree la plus courante des prestations. L'heure exacte est
 * calee avec la boutique, ce que la description du rendez-vous precise.
 */
const PLAGES: Record<string, [number, number]> = {
  matin: [9, 12],
  "apres-midi": [14, 17],
  "après-midi": [14, 17],
};

/**
 * Echappement des valeurs texte iCalendar (RFC 5545 §3.3.11).
 * Sans lui, une virgule dans un nom de prestation couperait la valeur en deux
 * et l'evenement serait rejete.
 */
function echapper(v: string): string {
  return v
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Repliage des lignes a 75 octets (RFC 5545 §3.1).
 * Les lignes trop longues sont refusees par certains agendas. Le comptage se
 * fait en OCTETS et non en caracteres : un "é" en pese deux, et replier au
 * mauvais endroit couperait le caractere en deux.
 */
function replier(ligne: string): string {
  const octets = Buffer.from(ligne, "utf8");
  if (octets.length <= 75) return ligne;

  const morceaux: string[] = [];
  let debut = 0;
  let limite = 75;
  while (debut < octets.length) {
    let fin = Math.min(debut + limite, octets.length);
    // Ne pas couper au milieu d'un caractere multi-octets : les octets de
    // continuation valent 0b10xxxxxx.
    while (fin < octets.length && (octets[fin] & 0xc0) === 0x80) fin--;
    morceaux.push(octets.subarray(debut, fin).toString("utf8"));
    debut = fin;
    limite = 74; // les lignes suivantes portent une espace en tete
  }
  return morceaux.join("\r\n ");
}

/** Instant UTC au format iCalendar : 20261106T130000Z */
function horodatage(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Journee entiere : 20261106 */
function jour(iso: string): string {
  return iso.replace(/-/g, "");
}

export function evenementCours({
  id,
  date,
  creneau,
  discipline,
  prestation,
  organisateur,
  sequence,
}: {
  /** Identifiant de la demande : rend l'UID stable d'une confirmation a l'autre. */
  id: string;
  /** Date retenue, au format ISO court. */
  date: string;
  /** "Matin" ou "Apres-midi". Vide : l'evenement occupe la journee. */
  creneau: string | null;
  discipline: string;
  prestation: string;
  organisateur: string;
  /**
   * Numero de revision. Doit croitre a chaque reprogrammation, sinon les
   * agendas ignorent la mise a jour et gardent l'ancienne date.
   */
  sequence: number;
}): string {
  const plage = creneau ? PLAGES[creneau.toLowerCase()] : undefined;

  let debut: string;
  let fin: string;
  if (plage) {
    const [h1, h2] = plage;
    // L'heure locale est convertie en UTC : 9 h en Martinique = 13 h UTC.
    debut = `DTSTART:${horodatage(new Date(`${date}T${String(h1 + DECALAGE_HEURES).padStart(2, "0")}:00:00Z`))}`;
    fin = `DTEND:${horodatage(new Date(`${date}T${String(h2 + DECALAGE_HEURES).padStart(2, "0")}:00:00Z`))}`;
  } else {
    // Sans creneau, une journee entiere : annoncer une heure qu'on ne connait
    // pas ferait manquer le cours.
    const lendemain = new Date(`${date}T12:00:00Z`);
    lendemain.setUTCDate(lendemain.getUTCDate() + 1);
    debut = `DTSTART;VALUE=DATE:${jour(date)}`;
    fin = `DTEND;VALUE=DATE:${jour(lendemain.toISOString().slice(0, 10))}`;
  }

  const description = plage
    ? `Rendez-vous a l'ecole Airfly, plage de Pointe Faula. Prevoyez maillot, serviette et creme solaire, le materiel est fourni. L'heure exacte est calee avec la boutique.`
    : `Rendez-vous a l'ecole Airfly, plage de Pointe Faula. L'heure sera calee avec la boutique.`;

  const lignes = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Airfly//Reservation//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:cours-${echapper(id)}@airfly972.com`,
    `SEQUENCE:${Math.max(0, Math.floor(sequence))}`,
    `DTSTAMP:${horodatage(new Date())}`,
    debut,
    fin,
    `SUMMARY:${echapper(`${discipline} — ${prestation} | Airfly`)}`,
    `DESCRIPTION:${echapper(description)}`,
    "LOCATION:Plage de Pointe Faula\\, 97280 Le Vauclin\\, Martinique",
    `ORGANIZER;CN=Airfly:mailto:${echapper(organisateur)}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Cours Airfly dans 2 heures",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  // CRLF impose par la norme : un simple \n suffit a faire rejeter le fichier
  // par certains agendas.
  return lignes.map(replier).join("\r\n") + "\r\n";
}
