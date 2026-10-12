import type { SiteContent } from "@/lib/types";
import { L, cta } from "./helpers";

export const site: SiteContent = {
  meta: {
    description: L(
      "Community water, education and livelihoods in the North West Region of Cameroon.",
      "Eau, éducation et moyens de subsistance dans la région du Nord-Ouest du Cameroun.",
    ),
  },
  organization: { areaServed: "North West Region, Cameroon", addressLocality: "Bamenda", addressCountry: "CM" },
  routeMeta: {
    "/about": { title: L("About us", "À propos"), description: L("Our mission, history, governance and safeguarding commitments.", "Notre mission, notre histoire, notre gouvernance et nos engagements de protection.") },
    "/programmes": { title: L("Programmes", "Programmes"), description: L("Water, education and livelihoods programmes you can fund today.", "Les programmes d'eau, d'éducation et de moyens de subsistance que vous pouvez financer.") },
    "/stories": { title: L("Stories", "Histoires"), description: L("Stories from the families and villages we work alongside.", "Des histoires des familles et des villages avec lesquels nous travaillons.") },
    "/news": { title: L("News", "Actualités"), description: L("Project updates, reports and announcements.", "Actualités des projets, rapports et annonces.") },
    "/events": { title: L("Events", "Événements"), description: L("Upcoming events, trainings and community days.", "Événements, formations et journées communautaires à venir.") },
    "/reports": { title: L("Reports", "Rapports"), description: L("Annual and project reports, free to download.", "Rapports annuels et rapports de projet, à télécharger librement.") },
    "/team": { title: L("Our team", "Notre équipe"), description: L("Meet the people who run our programmes.", "Rencontrez les personnes qui dirigent nos programmes.") },
    "/donate": { title: L("Donate", "Faire un don"), description: L("Give by MTN or Orange Mobile Money, once or monthly.", "Donnez par MTN ou Orange Mobile Money, une fois ou chaque mois.") },
    "/get-involved": { title: L("Get involved", "Nous rejoindre"), description: L("Volunteer, partner with us or spread the word.", "Devenez bénévole, devenez partenaire ou faites connaître notre action.") },
    "/contact": { title: L("Contact", "Contact"), description: L("Write to us, call us or visit our office in Bamenda.", "Écrivez-nous, appelez-nous ou rendez-nous visite à Bamenda.") },
  },
  header: {
    nav: [
      cta(L("About", "À propos"), "/about"),
      cta(L("Programmes", "Programmes"), "/programmes"),
      cta(L("Stories", "Histoires"), "/stories"),
      cta(L("News", "Actualités"), "/news"),
      cta(L("Get involved", "Nous rejoindre"), "/get-involved"),
      cta(L("Contact", "Contact"), "/contact"),
    ],
    cta: cta(L("Donate", "Faire un don"), "/donate"),
  },
  footer: {
    about: L(
      "A fictional demonstration NGO built on the Traitz Tech boilerplate. Bamenda, Cameroon.",
      "Une ONG fictive de démonstration, construite sur le modèle Traitz Tech. Bamenda, Cameroun.",
    ),
    columns: [
      { title: L("Organisation", "Organisation"), links: [cta(L("About", "À propos"), "/about"), cta(L("Programmes", "Programmes"), "/programmes"), cta(L("Reports", "Rapports"), "/reports")] },
      { title: L("Support", "Nous soutenir"), links: [cta(L("Donate", "Faire un don"), "/donate"), cta(L("Volunteer", "Devenir bénévole"), "/get-involved"), cta(L("Contact", "Contact"), "/contact")] },
    ],
    copy: L("© 2026 Traitz Foundation. Demo content.", "© 2026 Traitz Foundation. Contenu de démonstration."),
  },
};
