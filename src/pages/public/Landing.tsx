import { Link } from "react-router-dom";
import { enterDemo } from "@/lib";
import { LEVELS } from "@/content";
import { ArtImg, Icon, Lumi } from "@/ui/kit";
import { PubShell } from "./PubShell";

export function Landing() {
  return (
    <PubShell>
      <section className="hero">
        <div className="hero-in">
          <div>
            <h1>Des histoires de la Bible que les enfants ont <em>envie de continuer</em></h1>
            <p>Une page du Grand Livre s'est effacée. Pour la retrouver, l'enfant devine qui s'y cache, reconstitue l'image, écoute l'histoire et répond à quelques questions. Une nouvelle aventure chaque dimanche, pour les 6-8 ans.</p>
            <div className="row">
              <Link className="a-btn gold lg" to="/inscription">Créer un compte gratuit</Link>
              <button type="button" className="a-btn lg" onClick={enterDemo}><Icon name="play" size={18} />Essayer sans compte</button>
            </div>
            <p className="small" style={{ fontSize: ".95rem" }}>Un code de séance donné par votre animateur ? <Link to="/rejoindre" style={{ color: "var(--gold)", fontWeight: 700 }}>Rejoindre la séance</Link></p>
          </div>
          <div className="hero-art">
            <div className="hcard">
              <ArtImg art="noe/card" alt="Carte de Noé : l'arche et l'arc-en-ciel" />
              <div className="hcard-b"><span className="hcard-name">Noé</span><span className="hcard-ref">Genèse 6 à 9</span></div>
            </div>
            <Lumi />
          </div>
        </div>
      </section>

      <section className="pub-sec">
        <h2>Une page, cinq étapes</h2>
        <p>Chaque aventure dure de 10 à 15 minutes. L'enfant n'est jamais bloqué : Lumi, la petite lampe, l'encourage et donne des indices quand il en a besoin.</p>
        <ol className="steps5">
          <li><b>Le mystère</b>Trois indices pour deviner le personnage. On peut répondre dès le premier.</li>
          <li><b>Le puzzle</b>Remettre les morceaux de l'image en place.</li>
          <li><b>L'histoire</b>Racontée en quelques pages, avec la référence biblique. Lumi peut la lire à voix haute.</li>
          <li><b>Le quiz</b>Cinq questions, sans piège ni chrono. Une erreur, c'est un conseil, pas une punition.</li>
          <li><b>La récompense</b>Une carte à collectionner et un aperçu de la prochaine aventure.</li>
        </ol>
      </section>

      <section className="pub-sec" style={{ paddingTop: 0 }}>
        <h2>Pour qui ?</h2>
        <div className="who3">
          <div><Icon name="heart" /><h3>Les parents</h3><p>Créez un profil par enfant avec un prénom ou un surnom, choisissez un temps de jeu par jour et suivez ce qu'il a découvert.</p></div>
          <div><Icon name="users" /><h3>Les animateurs</h3><p>École du dimanche, club biblique : préparez une séance, jouez sur un seul écran avec tout le groupe ou chacun sur son appareil, puis voyez le bilan.</p></div>
          <div><Icon name="star" /><h3>Les enfants</h3><p>Ils jouent, collectionnent les cartes et attendent la page suivante. Pas de score qui compare, pas de classement.</p></div>
        </div>
      </section>

      <section className="pub-sec" style={{ paddingTop: 0 }}>
        <h2>Le Grand Livre</h2>
        <p>Huit premières aventures, de Noé au bon Samaritain. Les textes s'appuient sur la Bible Louis Segond et sont relus avant publication.</p>
        <div className="worlds-strip">
          {LEVELS.map(l => <figure key={l.id}><ArtImg art={l.content.card.art} alt="" />{l.content.title}</figure>)}
        </div>
      </section>

      <section className="promise">
        <div className="pub-sec">
          <h2>Pensé pour protéger les enfants</h2>
          <ul>
            <li><Icon name="shield" /><span><b>Aucune publicité</b>, aucun achat dans l'application.</span></li>
            <li><Icon name="shield" /><span><b>Aucune messagerie</b> : les enfants ne peuvent parler à personne.</span></li>
            <li><Icon name="shield" /><span><b>Un prénom ou un surnom suffit.</b> Ni photo, ni date de naissance, ni adresse.</span></li>
            <li><Icon name="shield" /><span><b>Temps de jeu</b> limité par le parent, avec une pause douce.</span></li>
            <li><Icon name="shield" /><span><b>Espace parent protégé</b> par un appui long que les petits ne font pas par hasard.</span></li>
            <li><Icon name="shield" /><span><b>Vos données vous appartiennent</b> : téléchargement et suppression en un clic.</span></li>
          </ul>
        </div>
      </section>

      <section className="pub-sec" style={{ textAlign: "center" }}>
        <h2>Prêt pour la première page ?</h2>
        <p style={{ margin: "0 auto 20px" }}>C'est gratuit. Il faut une connexion internet pour jouer.</p>
        <div className="row" style={{ justifyContent: "center" }}>
          <Link className="a-btn primary lg" to="/inscription">Créer un compte</Link>
          <Link className="a-btn lg" to="/connexion">J'ai déjà un compte</Link>
        </div>
      </section>
    </PubShell>
  );
}
