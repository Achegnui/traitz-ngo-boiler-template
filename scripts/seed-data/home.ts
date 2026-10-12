import type { PageDoc } from "@/lib/types";
import { L, cta } from "./helpers";

/** One ordered block array per page, the same shape as a /pages/{slug} document. */
export const home: PageDoc = {
  slug: "home",
  status: "published",
  title: L("Home", "Accueil"),
  seo: {
    title: L("Clean water, schools and livelihoods", "Eau, écoles et moyens de subsistance"),
    description: L(
      "We build community water points, keep girls in school and fund women's cooperatives across Cameroon's North West Region. Give by mobile money.",
      "Points d'eau communautaires, scolarité des filles et coopératives de femmes dans le Nord-Ouest du Cameroun. Donnez par Mobile Money.",
    ),
  },
  blocks: [
    {
      id: "hero", type: "hero",
      headline: L("Clean water for\nevery household\nin the North West.", "De l'eau potable\npour chaque foyer\ndu Nord-Ouest."),
      accentWord: L("every household", "chaque foyer"),
      sub: L(
        "We are building 40 community water points across the North West Region, powered by your mobile money donation.",
        "Nous construisons 40 points d'eau communautaires dans toute la région du Nord-Ouest, grâce à vos dons par Mobile Money.",
      ),
      image: { alt: L("") }, // no url: falls back to the CSS golden-hour gradient
      liveTag: L("Live: Wum Water Project", "En cours : Projet d'eau de Wum"),
      ctaPrimary: cta(L("Donate via Mobile Money", "Donner par Mobile Money"), "/donate"),
      ctaSecondary: cta(L("See the project", "Voir le projet"), "/programmes/wum-water-project"),
      card: {
        text: L("Every 5,000 XAF connects one family to a safe, local water source.", "Chaque tranche de 5 000 XAF relie une famille à une source d'eau sûre et locale."),
        stats: [
          { value: 12400, label: L("people reached", "personnes touchées") },
          { value: 38, label: L("villages served", "villages desservis") },
        ],
      },
    },
    {
      id: "stats", type: "statStrip",
      stats: [
        { value: 12400, label: L("People with safe water", "Personnes ayant accès à l'eau potable") },
        { value: 38, label: L("Villages served", "Villages desservis") },
        { value: 210, label: L("Volunteers trained", "Bénévoles formés") },
        { value: 9, label: L("Years on the ground", "Années sur le terrain") },
      ],
    },
    {
      id: "pillars", type: "pillarCards",
      heading: L("Four ways we work", "Quatre façons d'agir"),
      cards: [
        { icon: "droplets", title: L("Water and sanitation", "Eau et assainissement"), body: L("Wells, taps and latrines built with village committees who keep them running.", "Puits, robinets et latrines construits avec des comités villageois qui en assurent le fonctionnement.") },
        { icon: "book-open", title: L("Education", "Éducation"), body: L("School kits, teacher training and safe classrooms for girls and boys.", "Kits scolaires, formation des enseignants et salles de classe sûres pour les filles et les garçons.") },
        { icon: "sprout", title: L("Livelihoods", "Moyens de subsistance"), body: L("Seed funds and farm training for women's cooperatives.", "Fonds de démarrage et formation agricole pour les coopératives de femmes.") },
        { icon: "stethoscope", title: L("Community health", "Santé communautaire"), body: L("Mobile clinics and health volunteers in hard to reach hamlets.", "Cliniques mobiles et agents de santé bénévoles dans les hameaux difficiles d'accès.") },
      ],
    },
    {
      id: "mission", type: "missionSplit",
      kicker: L("Our mission", "Notre mission"),
      heading: L("Local people lead. We make it last.", "Les habitants mènent. Nous faisons durer."),
      body: L(
        "Every project starts with a village meeting and ends with a community that owns what was built. We train, we fund, then we step back.",
        "Chaque projet commence par une réunion de village et s'achève avec une communauté propriétaire de ce qui a été construit. Nous formons, nous finançons, puis nous nous retirons.",
      ),
      image: { art: { motif: "community", seed: 3 }, alt: L("Illustration of a village gathering", "Illustration d'un rassemblement villageois"), caption: L("Village meeting (illustration)", "Réunion de village (illustration)") },
      ctaPrimary: cta(L("Read our story", "Lire notre histoire"), "/about"),
      ctaSecondary: cta(L("Meet the team", "Rencontrer l'équipe"), "/team"),
    },
    {
      id: "programmes", type: "programmeGrid",
      heading: L("Programmes you can fund today", "Des programmes que vous pouvez financer dès aujourd'hui"),
      fundLabel: L("Fund this", "Financer"),
      programmeRefs: ["wum-water", "girls-school", "womens-seed"],
      showProgress: true,
    },
    { id: "partners", type: "partnerWall", heading: L("Working alongside", "Nos partenaires") },
    { id: "story", type: "storyFeature", kicker: L("Story", "Histoire"), storyRef: "njinikom-tap", ctaLabel: L("Read the full story", "Lire l'histoire complète") },
    {
      id: "testimonials", type: "testimonials",
      items: [
        { quote: L("The committee collects fees and fixes leaks. The tap has not failed once in two years.", "Le comité collecte les cotisations et répare les fuites. Le point d'eau n'est pas tombé en panne une seule fois en deux ans."), name: "Pa Julius", role: L("Village head, Njinikom", "Chef de village, Njinikom") },
        { quote: L("I volunteered for one weekend. Three years later I lead a team of twelve.", "Je me suis portée volontaire pour un week-end. Trois ans plus tard, je dirige une équipe de douze personnes."), name: "Aïcha Bello", role: L("Volunteer, Bamenda", "Bénévole, Bamenda") },
        { quote: L("They asked us what we needed first. That is rare, and it shows in the results.", "Ils nous ont d'abord demandé de quoi nous avions besoin. C'est rare, et cela se voit dans les résultats."), name: "Dr. Tabe", role: L("Bui Health District", "District de santé de Bui") },
      ],
    },
    { id: "news", type: "newsGrid", heading: L("Latest news", "Dernières actualités"), limit: 3 },
    {
      id: "newsletter", type: "newsletterBand",
      heading: L("One short update, once a month.", "Un court message, une fois par mois."),
      body: L("Where your money went, in plain words.", "Où est allé votre argent, en termes simples."),
      placeholder: L("Your email", "Votre e-mail"),
      button: L("Subscribe", "S'abonner"),
    },
  ],
};
