import type { NewsItem } from "@/lib/types";
import { L } from "./helpers";

const noAlt = L("");

export const news: NewsItem[] = [
  {
    id: "taps-wum", slug: "fifteen-new-taps-open-in-wum", status: "published", publishedAt: "2026-03-12",
    title: L("Fifteen new taps open in Wum", "Quinze nouveaux points d'eau ouverts à Wum"),
    category: L("Water", "Eau"), coverImage: { art: { motif: "water", seed: 12 }, alt: noAlt },
    excerpt: L("Fifteen community taps are now handed over to village water committees in the Wum area.", "Quinze points d'eau communautaires sont remis aux comités villageois de la zone de Wum."),
    body: L(
      "Fifteen community taps were handed over to village water committees in the Wum area this month. That brings the Wum Water Project to 15 of its 40 planned water points.\n\nEach tap is run by a local committee that collects small fees to cover repairs. The next water points are funded and scheduled for the dry season.",
      "Quinze points d'eau communautaires ont été remis ce mois-ci aux comités villageois de la zone de Wum. Le Projet d'eau de Wum compte ainsi 15 de ses 40 points d'eau prévus.\n\nChaque point d'eau est géré par un comité local qui collecte de petites cotisations pour financer les réparations. Les prochains points d'eau sont financés et programmés pour la saison sèche.",
    ),
  },
  {
    id: "report-2025", slug: "annual-report-2025", status: "published", publishedAt: "2026-02-27",
    title: L("Annual report 2025 is out", "Le rapport annuel 2025 est publié"),
    category: L("Reports", "Rapports"), coverImage: { art: { motif: "report", seed: 3 }, alt: noAlt },
    excerpt: L("Our 2025 annual report shows where every franc went and what we learned.", "Notre rapport annuel 2025 montre où est allé chaque franc et ce que nous avons appris."),
    body: L(
      "Our 2025 annual report is now available. It sets out where each franc went across water, education and livelihoods, and what we learned along the way.\n\nWe publish it every year so that donors, partners and the villages we serve can hold us to account. You can download it from the Reports page.",
      "Notre rapport annuel 2025 est disponible. Il détaille où est allé chaque franc entre l'eau, l'éducation et les moyens de subsistance, et ce que nous avons appris en chemin.\n\nNous le publions chaque année pour que les donateurs, les partenaires et les villages que nous servons puissent nous demander des comptes. Vous pouvez le télécharger sur la page Rapports.",
    ),
  },
  {
    id: "volunteer-training", slug: "volunteer-training-returns-in-april", status: "published", publishedAt: "2026-02-03",
    title: L("Volunteer training returns in April", "La formation des bénévoles reprend en avril"),
    category: L("Volunteers", "Bénévolat"), coverImage: { art: { motif: "community", seed: 7 }, alt: noAlt },
    excerpt: L("Our next volunteer training takes place in April.", "Notre prochaine formation de bénévoles aura lieu en avril."),
    body: L(
      "Our next volunteer training takes place in April. Sessions cover community mobilisation, basic water point maintenance and safeguarding.\n\nVolunteers who complete the training join the village committees that keep our projects running.",
      "Notre prochaine formation de bénévoles aura lieu en avril. Les séances portent sur la mobilisation communautaire, l'entretien de base des points d'eau et la protection.\n\nLes bénévoles qui terminent la formation rejoignent les comités villageois qui font vivre nos projets.",
    ),
  },
  {
    id: "school-kits", slug: "school-kits-reach-300-pupils-in-bui", status: "published", publishedAt: "2026-01-15",
    title: L("School kits reach 300 pupils in Bui", "Des kits scolaires pour 300 élèves à Bui"),
    category: L("Education", "Éducation"), coverImage: { art: { motif: "school", seed: 11 }, alt: noAlt },
    excerpt: L("Three hundred pupils in Bui started the term with a full set of school supplies.", "Trois cents élèves de Bui ont commencé le trimestre avec un kit scolaire complet."),
    body: L(
      "Three hundred pupils in Bui started the term with a full set of school supplies, paid for by donors to the Girls Back to School programme.\n\nTeachers report that fewer children miss the first weeks of term when the kits arrive on time.",
      "Trois cents élèves de Bui ont commencé le trimestre avec un kit scolaire complet, financé par les donateurs du programme Retour des filles à l'école.\n\nLes enseignants constatent que moins d'enfants manquent les premières semaines lorsque les kits arrivent à temps.",
    ),
  },
  {
    id: "committee-njinikom", slug: "water-committee-trained-in-njinikom", status: "published", publishedAt: "2025-12-10",
    title: L("New water committee trained in Njinikom", "Un nouveau comité de l'eau formé à Njinikom"),
    category: L("Water", "Eau"), coverImage: { art: { motif: "community", seed: 9 }, alt: noAlt },
    excerpt: L("Nine villagers finished a three-day course in keeping a tap running.", "Neuf villageois ont terminé une formation de trois jours pour entretenir un point d'eau."),
    body: L(
      "Nine villagers in Njinikom finished a three-day course in repairing taps, keeping accounts and settling disputes over water.\n\nThe committee is now responsible for the village's water point and will report to the foundation twice a year.",
      "Neuf villageois de Njinikom ont terminé une formation de trois jours sur la réparation des robinets, la tenue des comptes et le règlement des différends autour de l'eau.\n\nLe comité est désormais responsable du point d'eau du village et rendra compte à la fondation deux fois par an.",
    ),
  },
  {
    id: "seed-grants", slug: "seed-fund-grants-awarded-to-12-cooperatives", status: "published", publishedAt: "2025-11-05",
    title: L("Seed Fund grants awarded to 12 cooperatives", "Subventions du fonds de démarrage pour 12 coopératives"),
    category: L("Livelihoods", "Moyens de subsistance"), coverImage: { art: { motif: "seed", seed: 10 }, alt: noAlt },
    excerpt: L("Twelve women's cooperatives received their first grants this month.", "Douze coopératives de femmes ont reçu leur première subvention ce mois-ci."),
    body: L(
      "Twelve women's cooperatives across the North West received their first start-up grants this month, chosen by a panel that included two cooperative members.\n\nEach group also receives six months of farm and bookkeeping training.",
      "Douze coopératives de femmes du Nord-Ouest ont reçu leur première subvention de démarrage ce mois-ci, choisies par un jury comptant deux membres de coopératives.\n\nChaque groupe bénéficie aussi de six mois de formation agricole et comptable.",
    ),
  },
  {
    id: "clinic-ako", slug: "mobile-clinic-reaches-ako", status: "published", publishedAt: "2025-10-12",
    title: L("Mobile clinic reaches Ako for the first time", "La clinique mobile atteint Ako pour la première fois"),
    category: L("Health", "Santé"), coverImage: { art: { motif: "health", seed: 12 }, alt: noAlt },
    excerpt: L("Forty children were vaccinated on the clinic's first visit.", "Quarante enfants ont été vaccinés lors de la première visite de la clinique."),
    body: L(
      "The mobile clinic reached Ako for the first time this month. A nurse vaccinated forty children and checked eleven expectant mothers.\n\nThe clinic will return on the second Tuesday of every month.",
      "La clinique mobile a atteint Ako pour la première fois ce mois-ci. Une infirmière a vacciné quarante enfants et examiné onze futures mères.\n\nLa clinique reviendra le deuxième mardi de chaque mois.",
    ),
  },
];
