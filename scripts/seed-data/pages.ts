import type { PageDoc } from "@/lib/types";
import { L, cta } from "./helpers";

const header = (id: string, kicker: [string, string], heading: [string, string], intro: [string, string]) =>
  ({ id, type: "pageHeader" as const, kicker: L(...kicker), heading: L(...heading), intro: L(...intro) });
const donate = (id: string) => ({
  id, type: "donateCallout" as const,
  heading: L("Help us reach the next village.", "Aidez-nous à atteindre le prochain village."),
  body: L("Every 5,000 XAF connects one family to safe water. Give once or every month.", "Chaque tranche de 5 000 XAF relie une famille à l'eau potable. Donnez une fois ou chaque mois."),
  cta: cta(L("Donate via Mobile Money", "Donner par Mobile Money"), "/donate"),
});
const stats = {
  id: "stats", type: "statStrip" as const,
  stats: [
    { value: 12400, label: L("People with safe water", "Personnes ayant accès à l'eau potable") },
    { value: 38, label: L("Villages served", "Villages desservis") },
    { value: 210, label: L("Volunteers trained", "Bénévoles formés") },
    { value: 9, label: L("Years on the ground", "Années sur le terrain") },
  ],
};

export const extraPages: PageDoc[] = [
  {
    slug: "about", status: "published", title: L("About", "À propos"),
    seo: {
      title: L("About Traitz Foundation", "À propos de Traitz Foundation"),
      description: L("A village-led charity bringing water, schooling and income to the North West Region of Cameroon since 2017.", "Une association portée par les villages qui apporte eau, école et revenus dans la région du Nord-Ouest du Cameroun depuis 2017."),
    },
    blocks: [
      header("about-h", ["About us", "À propos"], ["Built by villages. Backed by you.", "Construit par les villages. Soutenu par vous."],
        ["Since 2017 we have worked with villages in the North West Region to bring water, schooling and income closer to home.", "Depuis 2017, nous travaillons avec les villages de la région du Nord-Ouest pour rapprocher l'eau, l'école et les revenus des foyers."]),
      { id: "about-m", type: "missionSplit", kicker: L("How we work", "Notre méthode"),
        heading: L("Every project starts with a village meeting.", "Chaque projet commence par une réunion de village."),
        body: L("People decide where a tap goes and who runs it. We pay for the work, train the committee, then step back. A project is finished only when the village no longer needs us.", "Les habitants décident où va le point d'eau et qui le gère. Nous finançons les travaux, formons le comité, puis nous nous retirons. Un projet est terminé quand le village n'a plus besoin de nous."),
        image: { art: { motif: "community", seed: 3 }, alt: L("Illustration of a village gathering", "Illustration d'un rassemblement villageois"), caption: L("Village meeting (illustration)", "Réunion de village (illustration)") },
        ctaPrimary: cta(L("See our programmes", "Voir nos programmes"), "/programmes"), ctaSecondary: cta(L("Support our work", "Soutenir notre action"), "/donate") },
      stats,
      { id: "about-t", type: "timeline", heading: L("Our story", "Notre histoire"), items: [
        { year: "2017", title: L("Four friends, one borehole", "Quatre amis, un forage"), body: L("A group of friends from Bamenda pay for a borehole in Njinikom and learn that the hard part is keeping it running.", "Un groupe d'amis de Bamenda finance un forage à Njinikom et découvre que le plus difficile est de le faire durer.") },
        { year: "2019", title: L("The first ten taps", "Les dix premiers points d'eau"), body: L("The village committee model is born: elected, accountable and funded by small fees.", "Le modèle du comité villageois naît : élu, responsable et financé par de petites cotisations.") },
        { year: "2021", title: L("Girls Back to School", "Retour des filles à l'école"), body: L("We link every new tap to the school nearest it and begin paying fees for girls at risk of leaving.", "Nous relions chaque nouveau point d'eau à l'école la plus proche et finançons les frais des filles menacées d'abandon.") },
        { year: "2023", title: L("The Women's Seed Fund", "Le fonds de démarrage des femmes"), body: L("The first twelve cooperatives receive start-up grants and farm training.", "Les douze premières coopératives reçoivent des subventions de démarrage et une formation agricole.") },
        { year: "2025", title: L("Thirty-eight villages", "Trente-huit villages"), body: L("More than 12,000 people now have safe water close to home, and a clinic reaches the hamlets that were furthest away.", "Plus de 12 000 personnes ont désormais de l'eau potable près de chez elles, et une clinique atteint les hameaux les plus éloignés.") },
      ] },
      { id: "about-f", type: "faq", heading: L("Governance and safeguarding", "Gouvernance et protection"), items: [
        { q: L("Who oversees the foundation?", "Qui supervise la fondation ?"), a: L("A volunteer board of seven meets every quarter, approves the budget and reviews every audit. Two seats are held by village committee members.", "Un conseil bénévole de sept personnes se réunit chaque trimestre, approuve le budget et examine chaque audit. Deux sièges sont occupés par des membres de comités villageois.") },
        { q: L("How do you protect children and families?", "Comment protégez-vous les enfants et les familles ?"), a: L("Every staff member and volunteer signs our safeguarding policy and is trained before working in a village. Photographs are taken only with consent, which is recorded.", "Chaque membre du personnel et bénévole signe notre politique de protection et est formé avant d'intervenir dans un village. Les photographies ne sont prises qu'avec consentement, enregistré.") },
        { q: L("Where does the money go?", "Où va l'argent ?"), a: L("In 2025, 78% went to programmes, 9% to fundraising and 13% to running costs. The full report is on our Reports page.", "En 2025, 78 % sont allés aux programmes, 9 % à la collecte de fonds et 13 % aux frais de fonctionnement. Le rapport complet est sur notre page Rapports.") },
      ] },
      { id: "about-team", type: "teamGrid", heading: L("The team", "L'équipe"), intro: L("Six people run the programmes. Most grew up within a day's walk of the villages we serve.", "Six personnes dirigent les programmes. La plupart ont grandi à moins d'une journée de marche des villages que nous servons.") },
      { id: "about-p", type: "partnerWall", heading: L("Working alongside", "Nos partenaires") },
      donate("about-d"),
    ],
  },
  {
    slug: "get-involved", status: "published", title: L("Get involved", "Nous rejoindre"),
    seo: {
      title: L("Get involved with Traitz Foundation", "Rejoindre Traitz Foundation"),
      description: L("Volunteer, partner with us, give or spread the word. There is a place for you here.", "Devenez bénévole, partenaire, donateur ou ambassadeur. Il y a une place pour vous."),
    },
    blocks: [
      header("gi-h", ["Get involved", "Nous rejoindre"], ["There is a place for you here.", "Il y a une place pour vous ici."],
        ["Whether you have an afternoon, a skill or a budget, we can put it to work.", "Que vous ayez un après-midi, une compétence ou un budget, nous saurons les mettre à profit."]),
      { id: "gi-w", type: "pillarCards", heading: L("Four ways to help", "Quatre façons d'aider"), cards: [
        { icon: "users", title: L("Volunteer", "Devenir bénévole"), body: L("Join a village committee support team or help at events. Training is free.", "Rejoignez une équipe d'appui aux comités villageois ou aidez lors des événements. La formation est gratuite.") },
        { icon: "handshake", title: L("Partner with us", "Devenir partenaire"), body: L("Businesses, schools and councils can fund a tap, sponsor a class or share expertise.", "Entreprises, écoles et communes peuvent financer un point d'eau, parrainer une classe ou partager leur expertise.") },
        { icon: "heart-handshake", title: L("Give", "Donner"), body: L("Give once or every month by mobile money. Every franc is reported on.", "Donnez une fois ou chaque mois par Mobile Money. Chaque franc fait l'objet d'un rapport.") },
        { icon: "megaphone", title: L("Spread the word", "Faire connaître"), body: L("Tell a friend, share our stories, or invite us to speak at your school or church.", "Parlez-en à un ami, partagez nos histoires ou invitez-nous à intervenir dans votre école ou votre église.") },
      ] },
      { id: "gi-f", type: "faq", heading: L("Volunteering questions", "Questions sur le bénévolat"), items: [
        { q: L("Do I need experience?", "Faut-il de l'expérience ?"), a: L("No. We train every volunteer, and we match you to work that suits your time and skills.", "Non. Nous formons chaque bénévole et vous proposons des missions adaptées à votre temps et à vos compétences.") },
        { q: L("How much time does it take?", "Combien de temps cela demande-t-il ?"), a: L("Most volunteers give one weekend a month. Some give a few hours online.", "La plupart des bénévoles donnent un week-end par mois. Certains donnent quelques heures en ligne.") },
        { q: L("Can I volunteer from outside Cameroon?", "Puis-je être bénévole depuis l'étranger ?"), a: L("Yes. We need help with translation, design, fundraising and accounts.", "Oui. Nous avons besoin d'aide pour la traduction, le graphisme, la collecte de fonds et la comptabilité.") },
      ] },
      { id: "gi-c", type: "contactInfo", heading: L("Start a conversation", "Engageons la conversation"), items: [
        { icon: "mail", label: L("Volunteer coordinator", "Coordinatrice des bénévoles"), value: L("volunteers@traitz-foundation.example"), href: "mailto:volunteers@traitz-foundation.example" },
        { icon: "handshake", label: L("Partnerships", "Partenariats"), value: L("partners@traitz-foundation.example"), href: "mailto:partners@traitz-foundation.example" },
      ] },
      donate("gi-d"),
    ],
  },
  {
    slug: "contact", status: "published", title: L("Contact", "Contact"),
    seo: { title: L("Contact Traitz Foundation", "Contacter Traitz Foundation"), description: L("Write to us, call us or visit our office in Bamenda.", "Écrivez-nous, appelez-nous ou rendez-nous visite à Bamenda.") },
    blocks: [
      header("c-h", ["Contact", "Contact"], ["Talk to us.", "Parlez-nous."], ["We answer every message, usually within two working days.", "Nous répondons à chaque message, en général sous deux jours ouvrés."]),
      { id: "c-i", type: "contactInfo", heading: L("How to reach us", "Comment nous joindre"), items: [
        { icon: "mail", label: L("Email", "E-mail"), value: L("hello@traitz-foundation.example"), href: "mailto:hello@traitz-foundation.example" },
        { icon: "phone", label: L("Phone and WhatsApp", "Téléphone et WhatsApp"), value: L("+237 6 00 00 00 00"), href: "tel:+237600000000" },
        { icon: "map-pin", label: L("Office", "Bureau"), value: L("Commercial Avenue, Bamenda, North West Region, Cameroon", "Avenue Commerciale, Bamenda, région du Nord-Ouest, Cameroun") },
        { icon: "clock", label: L("Opening hours", "Horaires"), value: L("Monday to Friday, 8:00 to 17:00", "Du lundi au vendredi, de 8 h à 17 h") },
      ] },
    ],
  },
  {
    slug: "team", status: "published", title: L("Team", "Équipe"),
    seo: { title: L("Our team", "Notre équipe"), description: L("Meet the people who run our programmes.", "Rencontrez les personnes qui dirigent nos programmes.") },
    blocks: [
      header("t-h", ["Team", "Équipe"], ["The people behind the work.", "Les personnes derrière l'action."], ["Six people run the programmes, supported by more than two hundred trained volunteers.", "Six personnes dirigent les programmes, soutenues par plus de deux cents bénévoles formés."]),
      { id: "t-g", type: "teamGrid" },
    ],
  },
  {
    slug: "events", status: "published", title: L("Events", "Événements"),
    seo: { title: L("Events", "Événements"), description: L("Upcoming events, trainings and community days.", "Événements, formations et journées communautaires à venir.") },
    blocks: [
      header("e-h", ["Events", "Événements"], ["Come and see the work.", "Venez voir l'action de près."], ["Trainings, handovers and community days. Everyone is welcome.", "Formations, remises d'ouvrages et journées communautaires. Tout le monde est le bienvenu."]),
      { id: "e-l", type: "eventList", emptyText: L("No events are planned right now.", "Aucun événement n'est prévu pour le moment.") },
    ],
  },
  {
    slug: "reports", status: "published", title: L("Reports", "Rapports"),
    seo: { title: L("Reports", "Rapports"), description: L("Annual and project reports, free to download.", "Rapports annuels et rapports de projet, à télécharger librement.") },
    blocks: [
      header("r-h", ["Reports", "Rapports"], ["Where every franc went.", "Où est allé chaque franc."], ["We publish an annual report and an impact report for each major project.", "Nous publions un rapport annuel et un rapport d'impact pour chaque grand projet."]),
      { id: "r-l", type: "reportsLibrary", emptyText: L("Reports will appear here.", "Les rapports apparaîtront ici.") },
    ],
  },
];
