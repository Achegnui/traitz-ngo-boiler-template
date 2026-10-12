import type { TeamMember } from "@/lib/types";
import { L } from "./helpers";

let n = 0;
const photo = (_g: unknown, name: string) => ({ art: { motif: "portrait" as const, seed: ++n }, alt: L(`Illustration standing in for a portrait of ${name}`, `Illustration provisoire du portrait de ${name}`) });

export const team: TeamMember[] = [
  { id: "emmanuel-ngwa", name: "Emmanuel Ngwa", status: "published", order: 1, photo: photo(["#c98a3b", "#3d2a18"], "Emmanuel Ngwa"),
    role: L("Executive Director", "Directeur exécutif"),
    bio: L("Founded the foundation in 2017 after ten years in community development across the North West.", "A fondé la fondation en 2017 après dix ans de développement communautaire dans le Nord-Ouest.") },
  { id: "lydia-fonyuy", name: "Lydia Fonyuy", status: "published", order: 2, photo: photo(["#7aa6c2", "#1d3a52"], "Lydia Fonyuy"),
    role: L("Water Programme Lead", "Responsable du programme eau"),
    bio: L("Civil engineer who has overseen the construction of 38 village water points.", "Ingénieure civile, elle a supervisé la construction de 38 points d'eau villageois.") },
  { id: "clarisse-mbah", name: "Clarisse Mbah", status: "published", order: 3, photo: photo(["#8fb36b", "#2b4a22"], "Clarisse Mbah"),
    role: L("Education Programme Officer", "Chargée du programme éducation"),
    bio: L("Former primary school head teacher who runs the Girls Back to School programme.", "Ancienne directrice d'école primaire, elle dirige le programme Retour des filles à l'école.") },
  { id: "samuel-chi", name: "Samuel Chi", status: "published", order: 4, photo: photo(["#d9a066", "#4a2f1a"], "Samuel Chi"),
    role: L("Finance and Operations Manager", "Responsable finances et opérations"),
    bio: L("Keeps the books open to donors and publishes the annual report every year.", "Tient les comptes à la disposition des donateurs et publie le rapport annuel chaque année.") },
  { id: "aicha-bello", name: "Aïcha Bello", status: "published", order: 5, photo: photo(["#d88a8a", "#4a1f2a"], "Aïcha Bello"),
    role: L("Volunteer Coordinator", "Coordinatrice des bénévoles"),
    bio: L("Joined as a weekend volunteer and now leads a team of twelve.", "Arrivée comme bénévole le week-end, elle dirige aujourd'hui une équipe de douze personnes.") },
  { id: "peter-tanyi", name: "Peter Tanyi", status: "published", order: 6, photo: photo(["#a9c48a", "#2e4a24"], "Peter Tanyi"),
    role: L("Community Engagement Officer", "Chargé de la mobilisation communautaire"),
    bio: L("Runs the village meetings that start every project and the committees that keep them going.", "Anime les réunions de village qui lancent chaque projet et les comités qui les font durer.") },
];
