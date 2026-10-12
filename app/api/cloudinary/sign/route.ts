import { cloudinarySignature } from "@/lib/server/cloudinary";
import { verifyStaff } from "@/lib/server/staff";

export const dynamic = "force-dynamic";
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

/** Gives a signed-in staff member a short-lived signature for ONE upload. The API secret never leaves the server. */
export async function POST(req: Request) {
  const staff = await verifyStaff(req);
  if (!staff) return json({ error: "Please sign in again." }, 401);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !secret) return json({ error: "Uploads are not set up yet: the Cloudinary keys are missing in .env.local." }, 503);

  const { kind } = (await req.json().catch(() => ({}))) as { kind?: string };
  if (kind !== "image" && kind !== "file") return json({ error: "Unknown upload type." }, 400);

  // Signed parameters are enforced by Cloudinary: the browser cannot change the folder or the allowed formats.
  const folder = kind === "image" ? "traitz/images" : "traitz/files";
  const allowedFormats = kind === "image" ? "jpg,jpeg,png,webp,avif,gif" : "pdf";
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = cloudinarySignature({ allowed_formats: allowedFormats, folder, timestamp }, secret);
  return json({ cloudName, apiKey, timestamp, folder, allowedFormats, signature, resourceType: kind === "image" ? "image" : "auto" });
}
