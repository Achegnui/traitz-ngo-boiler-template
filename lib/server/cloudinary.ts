import { createHash } from "node:crypto";

/** Cloudinary signed uploads: SHA-1 of the sorted "key=value" pairs joined by "&", followed by the API secret. */
export function cloudinarySignature(params: Record<string, string | number>, secret: string): string {
  const toSign = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("&");
  return createHash("sha1").update(toSign + secret).digest("hex");
}
