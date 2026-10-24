import { Link } from "react-router-dom";
import { CONTACT, PubShell } from "./PubShell";

const UPDATED = "24 octobre 2026";
const Contact = () => CONTACT ? <a href={`mailto:${CONTACT}`}>{CONTACT}</a> : <b>l'adresse de contact indiquée par l'organisateur du test</b>;

export function Privacy() {
  return (
    <PubShell>
      <article className="legal">
        <h1>Politique de confidentialité</h1>
        <p className="muted">Mise à jour le {UPDATED}. Version du test pilote.</p>
        <p>ABIQ est une application gratuite de découverte de la Bible pour les enfants. Nous avons choisi de collecter le moins de données possible, et en particulier presque rien sur les enfants.</p>

        <h2>Ce que nous enregistrons</h2>
        <ul>
          <li><b>Pour l'adulte (parent ou animateur)</b> : l'adresse e-mail, le mot de passe (chiffré, nous ne le voyons jamais) et le nom choisi.</li>
          <li><b>Pour l'enfant</b> : un prénom ou un surnom, l'avatar choisi (un animal), les réglages décidés par le parent (son, voix, temps de jeu) et la progression dans les aventures (étapes faites, réponses du quiz, cartes gagnées).</li>
          <li><b>Pour les séances de groupe</b> : le nom du groupe, les séances préparées et leurs résultats.</li>
        </ul>
        <p>Nous ne demandons <b>jamais</b> la date de naissance, la photo, l'adresse, l'école ou le téléphone d'un enfant. Il n'y a ni publicité, ni outil de pistage publicitaire, ni messagerie.</p>

        <h2>À quoi servent ces données</h2>
        <p>Uniquement à faire fonctionner l'application : retrouver la progression de l'enfant, débloquer la page suivante, montrer au parent ou à l'animateur ce qui a été fait. Des statistiques globales et anonymes (nombre de pages terminées, par exemple) aident à améliorer les contenus. Les données ne sont ni vendues, ni louées, ni partagées à des fins commerciales.</p>

        <h2>Qui y a accès</h2>
        <ul>
          <li>Le parent voit uniquement les profils de ses enfants.</li>
          <li>L'animateur voit uniquement les enfants de ses propres groupes.</li>
          <li>Un appareil qui rejoint une séance avec un code ne voit que la progression de l'enfant choisi, et seulement pendant la séance.</li>
          <li>Les administrateurs d'ABIQ gèrent les contenus et voient la liste des comptes adultes, pas le détail des enfants.</li>
        </ul>
        <p>Ces règles sont appliquées directement par la base de données, pas seulement par l'affichage.</p>

        <h2>Où sont-elles stockées</h2>
        <p>Les données sont hébergées par notre prestataire technique Supabase, et l'application est servie par Vercel. Les échanges sont chiffrés (HTTPS). Sur l'appareil, l'application garde temporairement la progression non encore envoyée, pour ne rien perdre en cas de coupure de réseau.</p>

        <h2>Combien de temps</h2>
        <p>Tant que le compte existe. Un profil d'enfant supprimé efface aussi sa progression. Un compte supprimé efface tout : profils, progression, groupes et séances.</p>

        <h2>Vos droits</h2>
        <p>Depuis <Link to="/famille/compte">Mon compte</Link>, vous pouvez à tout moment télécharger vos données, corriger les informations, ou supprimer votre compte. Pour toute question, ou pour exercer vos droits d'accès, de rectification, d'opposition et de suppression, écrivez à <Contact />.</p>
        <p>En Côte d'Ivoire, la protection des données personnelles est encadrée par la loi n° 2013-450 du 19 juin 2013, sous le contrôle de l'ARTCI, auprès de qui vous pouvez aussi déposer une réclamation.</p>

        <h2>Le mot des enfants</h2>
        <p>Les enfants n'ont pas de compte et n'écrivent rien de personnel dans l'application. C'est l'adulte qui crée leur profil, avec un prénom ou un surnom, et qui reste responsable de son utilisation.</p>
      </article>
    </PubShell>
  );
}

export function Terms() {
  return (
    <PubShell>
      <article className="legal">
        <h1>Conditions d'utilisation</h1>
        <p className="muted">Mise à jour le {UPDATED}. Version du test pilote.</p>

        <h2>Le service</h2>
        <p>ABIQ propose gratuitement des aventures pour faire découvrir la Bible aux enfants de 6 à 8 ans, à la maison ou en groupe (école du dimanche, club biblique). Pendant le test pilote, des fonctions peuvent évoluer, et des interruptions sont possibles.</p>

        <h2>Les comptes</h2>
        <ul>
          <li>Les comptes sont réservés aux adultes. Un enfant joue toujours depuis le profil créé par un parent ou un animateur.</li>
          <li>Vous gardez votre mot de passe pour vous et vous nous prévenez si quelqu'un d'autre utilise votre compte.</li>
          <li>Un animateur s'engage à n'enregistrer que des prénoms ou surnoms, et à informer les parents des enfants de son groupe de l'utilisation d'ABIQ.</li>
        </ul>

        <h2>Les contenus</h2>
        <p>Les histoires sont adaptées pour les enfants à partir de la Bible Louis Segond 1910 : les phrases sont simplifiées, et chaque page indique la référence pour lire le texte complet. Elles sont relues avant publication, mais elles ne remplacent ni la lecture de la Bible ni l'accompagnement d'un adulte. Si vous repérez une erreur, signalez-la à <Contact />.</p>
        <p>Les textes, illustrations et le code d'ABIQ sont protégés. Vous pouvez les utiliser librement dans l'application, à la maison ou en séance, mais pas les revendre.</p>

        <h2>Bon usage</h2>
        <p>Il est interdit de tenter d'accéder aux données d'autres utilisateurs, de perturber le service ou d'y enregistrer des informations qui ne concernent pas son usage (adresse, téléphone ou photo d'un enfant, par exemple). Un compte qui ne respecte pas ces règles peut être suspendu.</p>

        <h2>Responsabilité</h2>
        <p>Nous faisons notre possible pour que l'application soit disponible et sûre, sans pouvoir le garantir à 100 %. Le temps passé sur les écrans reste sous la responsabilité de l'adulte : l'espace parent permet de fixer une limite quotidienne.</p>

        <h2>Arrêter</h2>
        <p>Vous pouvez supprimer votre compte à tout moment depuis <Link to="/famille/compte">Mon compte</Link>. Toutes les données associées sont alors effacées.</p>

        <h2>Questions</h2>
        <p>Écrivez à <Contact />. Voir aussi la <Link to="/confidentialite">politique de confidentialité</Link>.</p>
      </article>
    </PubShell>
  );
}
