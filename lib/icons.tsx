import {
  BookOpen, Building2, Clock, Droplets, GraduationCap, Hammer, Handshake, HeartHandshake, Home, Leaf, Mail, MapPin, Megaphone, Phone,
  School, ShieldCheck, Sprout, Stethoscope, Sun, Target, Users, Wheat, type LucideIcon,
} from "lucide-react";

/** The icons staff can choose in the admin. Add one here and it appears in the picker. */
export const ICONS: Record<string, { Icon: LucideIcon; label: string }> = {
  droplets: { Icon: Droplets, label: "Water drops" },
  "book-open": { Icon: BookOpen, label: "Open book" },
  "graduation-cap": { Icon: GraduationCap, label: "Graduation cap" },
  school: { Icon: School, label: "School" },
  sprout: { Icon: Sprout, label: "Seedling" },
  wheat: { Icon: Wheat, label: "Wheat" },
  leaf: { Icon: Leaf, label: "Leaf" },
  stethoscope: { Icon: Stethoscope, label: "Stethoscope" },
  "heart-handshake": { Icon: HeartHandshake, label: "Heart and handshake" },
  handshake: { Icon: Handshake, label: "Handshake" },
  users: { Icon: Users, label: "People" },
  home: { Icon: Home, label: "Home" },
  building: { Icon: Building2, label: "Building" },
  hammer: { Icon: Hammer, label: "Hammer" },
  sun: { Icon: Sun, label: "Sun" },
  target: { Icon: Target, label: "Target" },
  shield: { Icon: ShieldCheck, label: "Shield" },
  megaphone: { Icon: Megaphone, label: "Megaphone" },
  "map-pin": { Icon: MapPin, label: "Map pin" },
  phone: { Icon: Phone, label: "Phone" },
  mail: { Icon: Mail, label: "Envelope" },
  clock: { Icon: Clock, label: "Clock" },
};
export const ICON_OPTIONS = Object.entries(ICONS).map(([value, { label }]) => ({ value, label }));

/** A Lucide icon by name. Anything else (an old emoji) is shown as text so existing content keeps working. */
export function Icon({ name, size = 26 }: { name: string; size?: number }) {
  const hit = ICONS[name];
  if (!hit) return <span aria-hidden="true" style={{ fontSize: size * 0.9, lineHeight: 1 }}>{name}</span>;
  const { Icon: I } = hit;
  return <I size={size} strokeWidth={1.6} aria-hidden="true" />;
}
