import type { Metadata } from "next";
import PageLegale from "@/components/legal/PageLegale";

const title = "Politique de confidentialité";
const description =
  "Comment AIRFLY collecte, utilise et protège vos données personnelles : finalités, durées de conservation, destinataires et vos droits.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/politique-de-confidentialite" },
  robots: { index: false, follow: true },
};

export default function PolitiqueConfidentialite() {
  return (
    <PageLegale titre="Confidentialite" maj="18 août 2026">
      <p>
        Cette page décrit ce que le site airfly972.com fait réellement de vos données. Elle ne décrit
        que les traitements effectivement en place.
      </p>

      <h2>Responsable du traitement</h2>
      <p>
        AIRFLY (SARL), Pointe Faula, 97280 Le Vauclin, Martinique. Pour toute question relative à vos
        données : <a href="mailto:info@airfly972.com">info@airfly972.com</a> ou +596 596 76 25 31.
      </p>

      <h2>Ce que nous collectons, et pourquoi</h2>
      <p>
        <strong>Demande de cours (page École).</strong> Prénom, nom, adresse électronique, téléphone,
        discipline, prestation, niveau, date et créneau souhaités, message libre. Ces informations
        nous permettent de vous recontacter et d&apos;organiser la séance. Votre adresse IP est
        enregistrée avec la demande, à seule fin de limiter les envois automatisés.
      </p>
      <p>
        <strong>Réservation en boutique (retrait sur place).</strong> Prénom, nom, adresse
        électronique, téléphone, articles réservés, date et créneau de retrait souhaités. Ces
        informations nous permettent de préparer votre commande et de confirmer sa disponibilité.
      </p>
      <p>
        <strong>Aucun paiement en ligne.</strong> Le site n&apos;accepte aucun règlement : nous ne
        collectons donc aucune donnée bancaire. Le règlement se fait sur place.
      </p>
      <p>
        <strong>Aucune mesure d&apos;audience.</strong> Le site n&apos;utilise ni Google Analytics, ni
        aucun outil de statistiques ou de publicité. Votre navigation n&apos;est pas suivie.
      </p>

      <h2>Base légale</h2>
      <p>
        Les données de réservation sont traitées pour répondre à votre demande et exécuter la
        prestation qui en découle — mesures précontractuelles et exécution du contrat au sens de
        l&apos;article 6.1.b du RGPD. L&apos;enregistrement de l&apos;adresse IP repose sur notre
        intérêt légitime à protéger le site contre les envois automatisés (article 6.1.f).
      </p>

      <h2>Durées de conservation</h2>
      <ul>
        <li>
          <span>◆</span>Demandes non abouties : trois ans à compter du dernier contact.
        </li>
        <li>
          <span>◆</span>Clients ayant suivi une prestation : trois ans à compter de la dernière
          prestation, hors obligations comptables qui imposent une conservation plus longue des
          pièces justificatives.
        </li>
        <li>
          <span>◆</span>Adresse IP associée à une demande : supprimée avec la demande.
        </li>
      </ul>

      <h2>Qui a accès à vos données</h2>
      <p>
        Vos données ne sont ni vendues, ni louées, ni transmises à des fins commerciales. Seuls
        interviennent les prestataires techniques nécessaires au fonctionnement du site :
      </p>
      <ul>
        <li>
          <span>◆</span>Supabase — hébergement de la base de données qui conserve les demandes.
        </li>
        <li>
          <span>◆</span>Resend — acheminement des courriels de notification qui nous préviennent
          d&apos;une nouvelle demande.
        </li>
        <li>
          <span>◆</span>Hostinger — hébergement du site.
        </li>
      </ul>
      <p>
        Certains de ces prestataires peuvent héberger ou traiter des données hors de l&apos;Union
        européenne. Ces transferts sont encadrés par les clauses contractuelles types de la
        Commission européenne.
      </p>

      <h2>Cookies et stockage sur votre appareil</h2>
      <p>
        Le site ne dépose aucun cookie publicitaire ni de mesure d&apos;audience. Trois éléments
        seulement sont enregistrés sur votre appareil :
      </p>
      <ul>
        <li>
          <span>◆</span>
          <span>
            <strong>Votre panier</strong> — conservé dans la mémoire locale de votre navigateur
            (<em>localStorage</em>), afin de le retrouver d&apos;une visite à l&apos;autre. Il ne
            quitte jamais votre appareil tant que vous ne validez pas de réservation, et vous pouvez
            l&apos;effacer en vidant les données du site dans votre navigateur.
          </span>
        </li>
        <li>
          <span>◆</span>
          <span>
            <strong>Un cookie du service météo Windguru</strong> — la section Météo affiche les
            relevés de vent du spot au moyen d&apos;un module fourni par windguru.cz. Ce service
            dépose un cookie nommé <em>langc</em>, d&apos;une durée d&apos;un an, qui mémorise une
            préférence de langue. Il ne sert pas à vous identifier ni à suivre votre navigation.
          </span>
        </li>
        <li>
          <span>◆</span>
          <span>
            <strong>Un cookie de session d&apos;administration</strong> — déposé uniquement lors
            d&apos;une connexion à l&apos;espace de gestion réservé à AIRFLY. Il ne concerne pas les
            visiteurs du site.
          </span>
        </li>
      </ul>

      <h2>Vos droits</h2>
      <p>
        Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de limitation
        et d&apos;opposition, ainsi que d&apos;un droit à la portabilité de vos données. Pour les
        exercer, écrivez à <a href="mailto:info@airfly972.com">info@airfly972.com</a> en précisant
        votre demande. Nous y répondons dans un délai d&apos;un mois.
      </p>
      <p>
        Si notre réponse ne vous satisfait pas, vous pouvez saisir la Commission nationale de
        l&apos;informatique et des libertés :{" "}
        <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer">
          cnil.fr/fr/plaintes
        </a>
        .
      </p>

      <h2>Modification de cette politique</h2>
      <p>
        Toute évolution des traitements décrits ici sera reportée sur cette page, avec mise à jour de
        la date figurant en tête.
      </p>
    </PageLegale>
  );
}
