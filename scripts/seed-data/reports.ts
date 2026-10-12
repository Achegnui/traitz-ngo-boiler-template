import type { Report } from "@/lib/types";
import { L } from "./helpers";

// The PDFs are real files in /public/reports, so downloads work out of the box.
export const reports: Report[] = [
  { id: "annual-2025", status: "published", year: 2025, title: L("Annual report 2025", "Rapport annuel 2025"), fileUrl: "/reports/annual-report-2025.pdf", fileSizeBytes: 3441 },
  { id: "wum-impact-2025", status: "published", year: 2025, title: L("Wum Water Project: 2025 impact", "Projet d'eau de Wum : impact 2025"), fileUrl: "/reports/wum-water-impact-2025.pdf", fileSizeBytes: 2305 },
  { id: "financial-2024", status: "published", year: 2024, title: L("Financial statement 2024", "États financiers 2024"), fileUrl: "/reports/financial-statement-2024.pdf", fileSizeBytes: 2211 },
];
