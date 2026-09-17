import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getS3Bucket, getS3Client, getS3PublicBaseUrl } from "./s3";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_MODEL_EXTENSIONS = [".glb", ".gltf", ".usdz"];
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25MB, generous for a glTF/USDZ dish model

export type UploadSubdir = "images" | "models";

export type UploadTarget =
  | { direct: false }
  | { direct: true; uploadUrl: string; publicUrl: string };

/**
 * Decides how a file gets from the browser into storage, based on
 * STORAGE_DRIVER:
 *
 * - "local" (default, dev): the browser posts the file to this app
 *   (/api/upload), which writes it to apps/admin/public/uploads. Simple,
 *   but every byte burns this server's compute + bandwidth — fine for a
 *   laptop, not for production.
 * - "s3": the browser PUTs the file straight to the configured
 *   S3-compatible bucket (Cloudflare R2, Supabase Storage, ...) using a
 *   short-lived presigned URL from this function. This server never sees
 *   the file's bytes, so upload size/volume costs nothing here.
 *
 * Exception: .glb models never use this path (see /api/upload) — they need
 * Draco compression first, which requires the bytes server-side regardless
 * of driver.
 */
export async function createUploadTarget(
  subdir: UploadSubdir,
  filename: string,
  contentType: string,
): Promise<UploadTarget> {
  const driver = process.env.STORAGE_DRIVER ?? "local";
  if (driver !== "s3") return { direct: false };

  const ext = path.extname(filename) || "";
  const key = `${subdir}/${randomUUID()}${ext}`;

  const client = getS3Client();
  const bucket = getS3Bucket();
  const uploadUrl = await getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }),
    { expiresIn: 300 },
  );

  return { direct: true, uploadUrl, publicUrl: `${getS3PublicBaseUrl()}/${key}` };
}

/**
 * Local-only fallback: writes a buffer to disk and returns a URL served by
 * Next's static file handler. Used by /api/upload when STORAGE_DRIVER=local
 * (dev). Never called when STORAGE_DRIVER=s3 — that path uploads straight
 * to the bucket and skips this server entirely (see createUploadTarget).
 */
export async function saveBufferLocally(
  buffer: Buffer,
  originalFilename: string,
  subdir: UploadSubdir,
): Promise<string> {
  const uploadsDir = path.join(process.cwd(), "public", "uploads", subdir);
  await mkdir(uploadsDir, { recursive: true });

  const ext = path.extname(originalFilename) || "";
  const filename = `${randomUUID()}${ext}`;

  await writeFile(path.join(uploadsDir, filename), buffer);

  // Relative URL on purpose: apps/menu runs on a different origin/port than
  // apps/admin, but it proxies "/uploads/*" through to this app (see the
  // `rewrites()` in apps/menu/next.config.js) so that both the browser and
  // apps/menu's own server always reach these files through whatever single
  // public origin the customer is on — no second domain, no CORS, no
  // cross-site cookies to worry about. The S3 driver returns an absolute
  // bucket/CDN URL instead, and that rewrite simply won't match it.
  return `/uploads/${subdir}/${filename}`;
}

export async function saveUploadedFileLocally(file: File, subdir: UploadSubdir): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return saveBufferLocally(buffer, file.name, subdir);
}

/**
 * Server-side direct upload to the bucket (as opposed to createUploadTarget's
 * browser-presigned flow) — used only for .glb models, which need Draco
 * compression before storage and so must pass through this server's memory
 * once regardless of driver. Everything else (images, .gltf, .usdz) skips
 * the server entirely via createUploadTarget.
 */
export async function saveBufferToS3(
  buffer: Buffer,
  originalFilename: string,
  subdir: UploadSubdir,
  contentType: string,
): Promise<string> {
  const ext = path.extname(originalFilename) || "";
  const key = `${subdir}/${randomUUID()}${ext}`;

  const client = getS3Client();
  await client.send(
    new PutObjectCommand({ Bucket: getS3Bucket(), Key: key, Body: buffer, ContentType: contentType }),
  );

  return `${getS3PublicBaseUrl()}/${key}`;
}
