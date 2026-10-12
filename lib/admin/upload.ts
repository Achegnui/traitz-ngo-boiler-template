import type { UploadKind } from "./types";

const LIMITS: Record<UploadKind, { bytes: number; label: string; types: RegExp }> = {
  image: { bytes: 10 * 1024 * 1024, label: "10 MB", types: /^image\/(jpeg|png|webp|avif|gif)$/ },
  file: { bytes: 20 * 1024 * 1024, label: "20 MB", types: /^application\/pdf$/ },
};

/** Gets a one-time signature from our server (which checks the user is staff), then uploads straight to Cloudinary. */
export async function uploadToCloudinary(file: File, kind: UploadKind, idToken: string): Promise<{ url: string; bytes: number }> {
  const limit = LIMITS[kind];
  if (!limit.types.test(file.type)) throw new Error(kind === "image" ? "Choose a JPG, PNG, WebP, AVIF or GIF image." : "Choose a PDF file.");
  if (file.size > limit.bytes) throw new Error(`That file is too large. The limit is ${limit.label}.`);

  const signRes = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ kind }),
  });
  const sign = await signRes.json().catch(() => ({}));
  if (!signRes.ok) throw new Error(sign.error ?? "Could not start the upload.");

  const body = new FormData();
  body.append("file", file);
  body.append("api_key", sign.apiKey);
  body.append("timestamp", String(sign.timestamp));
  body.append("signature", sign.signature);
  body.append("folder", sign.folder);
  body.append("allowed_formats", sign.allowedFormats);
  const up = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/${sign.resourceType}/upload`, { method: "POST", body });
  const out = await up.json().catch(() => ({}));
  if (!up.ok) throw new Error(out?.error?.message ?? "The upload failed.");
  return { url: out.secure_url as string, bytes: out.bytes as number };
}
