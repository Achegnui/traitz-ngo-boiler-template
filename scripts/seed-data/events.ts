import type { EventItem } from "@/lib/types";
import { L } from "./helpers";

export const events: EventItem[] = [
  { id: "training-nov", status: "published", startsAt: "2026-11-14T09:00", endsAt: "2026-11-14T16:00",
    title: L("Volunteer training day", "Journée de formation des bénévoles"),
    description: L("A full day on community mobilisation, tap maintenance and safeguarding. Lunch is provided.", "Une journée complète sur la mobilisation communautaire, l'entretien des points d'eau et la protection. Le déjeuner est offert."),
    location: L("Foundation office, Bamenda", "Bureau de la fondation, Bamenda") },
  { id: "handover-dec", status: "published", startsAt: "2026-12-05T10:00", endsAt: "2026-12-05T13:00",
    title: L("Wum water points handover", "Remise des points d'eau de Wum"),
    description: L("Ten new taps are handed over to their village committees. Donors and families are welcome.", "Dix nouveaux points d'eau sont remis à leurs comités villageois. Donateurs et familles sont les bienvenus."),
    location: L("Wum town square", "Place centrale de Wum") },
  { id: "donors-jan", status: "published", startsAt: "2027-01-22T18:00", endsAt: "2027-01-22T20:30",
    title: L("Annual donors' evening", "Soirée annuelle des donateurs"),
    description: L("An evening to hear from village committee members and see where this year's gifts went.", "Une soirée pour écouter des membres de comités villageois et voir où sont allés les dons de l'année."),
    location: L("Mountain Hotel, Bamenda", "Mountain Hotel, Bamenda") },
  { id: "health-day-jun", status: "published", startsAt: "2026-06-20T08:30", endsAt: "2026-06-20T15:00",
    title: L("Community health day, Bui", "Journée de santé communautaire, Bui"),
    description: L("Free vaccinations and health checks for families across eight hamlets.", "Vaccinations et bilans de santé gratuits pour les familles de huit hameaux."),
    location: L("Bui District", "District de Bui") },
];
