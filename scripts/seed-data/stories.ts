import type { Story } from "@/lib/types";
import { L } from "./helpers";

const ph = (en: string, fr: string) => L(en, fr);
const alt = ph("Illustration standing in for a story photo", "Illustration provisoire d'une photo du récit");

export const stories: Story[] = [
  {
    id: "njinikom-tap", slug: "ngwa-walks-four-minutes", status: "published", publishedAt: "2026-01-20",
    title: L("Ngwa walks 4 minutes now, not 90.", "Ngwa marche 4 minutes aujourd'hui, au lieu de 90."),
    excerpt: L(
      "Before the Njinikom tap opened, Ngwa's mornings began at a distant stream. Today her daughters are in class before the bell.",
      "Avant l'ouverture du point d'eau de Njinikom, les matins de Ngwa commençaient à un ruisseau lointain. Aujourd'hui, ses filles sont en classe avant la sonnerie.",
    ),
    body: L(
      "Every morning for eleven years, Ngwa left before dawn with two jerrycans. The stream was ninety minutes there and back, and her daughters often missed the first lesson because they went with her.\n\nSince the Njinikom tap opened the walk takes four minutes. Ngwa now sits on the village water committee and keeps the fee book. Her daughters are in class before the bell.",
      "Pendant onze ans, Ngwa partait chaque matin avant l'aube avec deux bidons. Le ruisseau était à quatre-vingt-dix minutes aller-retour, et ses filles manquaient souvent le premier cours parce qu'elles l'accompagnaient.\n\nDepuis l'ouverture du point d'eau de Njinikom, le trajet dure quatre minutes. Ngwa siège maintenant au comité de l'eau du village et tient le carnet des cotisations. Ses filles sont en classe avant la sonnerie.",
    ),
    coverImage: { art: { motif: "water", seed: 9 }, alt, caption: L("Njinikom (illustration)", "Njinikom (illustration)") },
  },
  {
    id: "seed-fund-stall", slug: "from-seed-fund-to-market-stall", status: "published", publishedAt: "2025-11-18",
    title: L("From seed fund to market stall", "Du fonds de démarrage à l'étal du marché"),
    excerpt: L(
      "Mami Rose's cooperative turned a 200,000 XAF seed grant into a market stall that now feeds eleven families.",
      "La coopérative de Mami Rose a transformé une subvention de 200 000 XAF en un étal de marché qui fait vivre onze familles.",
    ),
    body: L(
      "Mami Rose and ten neighbours had grown vegetables for years but sold them cheaply at the farm gate. The seed grant bought a stall in the Wum market and a handcart.\n\nA year on, the cooperative sells directly, keeps its own accounts and has paid back nothing it did not choose to: the grant was a gift, and the group now saves a share of every sale.",
      "Mami Rose et dix voisines cultivaient des légumes depuis des années mais les vendaient à bas prix au bord du champ. La subvention a permis d'acheter un étal au marché de Wum et une charrette.\n\nUn an plus tard, la coopérative vend directement, tient ses propres comptes et épargne une part de chaque vente : la subvention était un don, et le groupe a choisi d'en faire une réserve.",
    ),
    coverImage: { art: { motif: "seed", seed: 7 }, alt, caption: L("Wum market (illustration)", "Marché de Wum (illustration)") },
  },
  {
    id: "school-with-a-tap", slug: "the-school-that-opened-with-a-tap", status: "published", publishedAt: "2025-09-30",
    title: L("The school that opened with a tap", "L'école qui a ouvert avec un point d'eau"),
    excerpt: L(
      "Girls' attendance at Mbingo primary school rose from 62% to 91% in a year after the water point opened.",
      "La présence des filles à l'école primaire de Mbingo est passée de 62 % à 91 % en un an après l'ouverture du point d'eau.",
    ),
    body: L(
      "Mbingo primary school had a toilet block but no water, so girls stayed home during their periods and many drifted out of school for good.\n\nWhen the school tap opened, attendance among girls rose from 62% to 91% in twelve months. The head teacher says the change cost less than one term of school fees.",
      "L'école primaire de Mbingo avait des latrines mais pas d'eau : les filles restaient à la maison pendant leurs règles et beaucoup quittaient l'école pour de bon.\n\nQuand le point d'eau de l'école a ouvert, la présence des filles est passée de 62 % à 91 % en douze mois. Le directeur affirme que ce changement a coûté moins qu'un trimestre de frais de scolarité.",
    ),
    coverImage: { art: { motif: "school", seed: 6 }, alt, caption: L("Mbingo (illustration)", "Mbingo (illustration)") },
  },
  {
    id: "clinic-comes-to-ako", slug: "a-clinic-that-comes-to-the-hamlet", status: "published", publishedAt: "2025-08-14",
    title: L("A clinic that comes to the hamlet", "Une clinique qui vient au hameau"),
    excerpt: L(
      "Ako is two hours from the nearest health centre. Once a month the mobile clinic now stops under the mango tree.",
      "Ako est à deux heures du centre de santé le plus proche. Chaque mois, la clinique mobile s'arrête désormais sous le manguier.",
    ),
    body: L(
      "Until this year, a sick child in Ako meant a two-hour walk or a motorbike the family could not afford. Now the clinic arrives on the second Tuesday of every month.\n\nThe nurse vaccinates, checks expectant mothers and leaves medicines with the hamlet's health volunteer, who is trained to recognise when someone must go to hospital at once.",
      "Jusqu'à cette année, un enfant malade à Ako signifiait deux heures de marche ou une moto que la famille ne pouvait pas payer. Désormais, la clinique arrive le deuxième mardi de chaque mois.\n\nL'infirmière vaccine, examine les futures mères et confie des médicaments à l'agent de santé du hameau, formé à reconnaître quand il faut aller à l'hôpital sans attendre.",
    ),
    coverImage: { art: { motif: "health", seed: 8 }, alt, caption: L("Ako (illustration)", "Ako (illustration)") },
  },
  {
    id: "treasurer-of-the-tap", slug: "the-treasurer-of-the-tap", status: "published", publishedAt: "2025-07-02",
    title: L("The treasurer of the tap", "La trésorière du point d'eau"),
    excerpt: L(
      "Pa Tanyi never expected to run a budget. Three years in, his committee has never missed a repair.",
      "Pa Tanyi n'aurait jamais cru gérer un budget. Trois ans plus tard, son comité n'a jamais manqué une réparation.",
    ),
    body: L(
      "Pa Tanyi is a retired carpenter. When his village was asked who should keep the water committee's money, nobody else wanted the notebook.\n\nThree years on, the committee has collected every fee, repaired two leaks within a day and trained a younger treasurer to take over. The notebook is on a nail by his door where anyone can read it.",
      "Pa Tanyi est menuisier à la retraite. Quand on a demandé au village qui devait garder l'argent du comité de l'eau, personne d'autre ne voulait du carnet.\n\nTrois ans plus tard, le comité a collecté chaque cotisation, réparé deux fuites en une journée et formé un jeune trésorier pour prendre la relève. Le carnet est accroché à un clou près de sa porte, où chacun peut le lire.",
    ),
    coverImage: { art: { motif: "community", seed: 5 }, alt, caption: L("Village committee (illustration)", "Comité villageois (illustration)") },
  },
];
