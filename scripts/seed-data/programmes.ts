import type { Programme } from "@/lib/types";
import { L } from "./helpers";

const noAlt = L(""); // decorative until a real photo is uploaded

export const programmes: Programme[] = [
  {
    id: "wum-water", slug: "wum-water-project", status: "published", order: 1,
    title: L("Wum Water Project", "Projet d'eau de Wum"),
    summary: L("Forty community taps for 6,000 people.", "Quarante points d'eau pour 6 000 personnes."),
    body: L(
      "In the Wum area most households walk more than an hour to a stream. We are building forty taps, each placed where the village chooses and run by a committee the village elects.\n\nEvery committee collects small fees that pay for repairs, so a tap that breaks is fixed in days, not abandoned. Fifteen taps are open and the rest are funded as donations arrive.",
      "Dans la zone de Wum, la plupart des foyers marchent plus d'une heure jusqu'à un ruisseau. Nous construisons quarante points d'eau, chacun placé là où le village le décide et géré par un comité élu par le village.\n\nChaque comité collecte de petites cotisations qui financent les réparations : un robinet en panne est réparé en quelques jours, pas abandonné. Quinze points d'eau sont ouverts et les autres sont financés au fil des dons.",
    ),
    coverImage: { art: { motif: "water", seed: 4 }, alt: noAlt },
    fundingGoal: 30_000_000, fundingRaised: 21_600_000,
  },
  {
    id: "girls-school", slug: "girls-back-to-school", status: "published", order: 2,
    title: L("Girls Back to School", "Retour des filles à l'école"),
    summary: L("Kits and fees for 300 pupils in Bui.", "Kits et frais de scolarité pour 300 élèves à Bui."),
    body: L(
      "When money is short, girls are the first to leave school. This programme pays fees and supplies for 300 pupils in Bui and trains teachers to keep classrooms safe.\n\nEvery family signs an agreement with the school, and our team visits each term to check that every child is in class.",
      "Quand l'argent manque, les filles sont les premières à quitter l'école. Ce programme finance les frais et les fournitures de 300 élèves à Bui et forme les enseignants à garder des salles de classe sûres.\n\nChaque famille signe un accord avec l'école, et notre équipe passe chaque trimestre vérifier que tous les enfants sont en classe.",
    ),
    coverImage: { art: { motif: "school", seed: 2 }, alt: noAlt },
    fundingGoal: 12_000_000, fundingRaised: 5_400_000,
  },
  {
    id: "womens-seed", slug: "womens-seed-fund", status: "published", order: 3,
    title: L("Women's Seed Fund", "Fonds de démarrage des femmes"),
    summary: L("Start-up grants for 25 cooperatives.", "Subventions de démarrage pour 25 coopératives."),
    body: L(
      "Women's cooperatives know what their market needs. We give start-up grants and farm training so a good idea can become a steady income.\n\nTwelve cooperatives have already received grants and none has stopped trading.",
      "Les coopératives de femmes savent ce dont leur marché a besoin. Nous offrons des subventions de démarrage et une formation agricole pour qu'une bonne idée devienne un revenu stable.\n\nDouze coopératives ont déjà reçu une subvention et aucune n'a cessé son activité.",
    ),
    coverImage: { art: { motif: "seed", seed: 5 }, alt: noAlt },
    fundingGoal: 8_000_000, fundingRaised: 7_040_000,
  },
  {
    id: "health-clinics", slug: "mobile-health-clinics", status: "published", order: 4,
    title: L("Mobile Health Clinics", "Cliniques mobiles"),
    summary: L("Monthly clinics reaching 12 hard to reach hamlets.", "Des cliniques mensuelles dans 12 hameaux difficiles d'accès."),
    body: L(
      "Some hamlets are two hours from the nearest health centre. A nurse and two health volunteers now visit each one every month with vaccines, antenatal checks and basic medicines.\n\nWe train a health volunteer in every hamlet so help is there between visits.",
      "Certains hameaux sont à deux heures du centre de santé le plus proche. Une infirmière et deux agents de santé bénévoles visitent désormais chacun d'eux chaque mois avec des vaccins, des consultations prénatales et des médicaments de base.\n\nNous formons un agent de santé dans chaque hameau pour que l'aide soit présente entre les visites.",
    ),
    coverImage: { art: { motif: "health", seed: 3 }, alt: noAlt },
    fundingGoal: 9_500_000, fundingRaised: 3_800_000,
  },
];
