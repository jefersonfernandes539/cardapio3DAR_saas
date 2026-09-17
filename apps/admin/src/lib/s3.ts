import { S3Client } from "@aws-sdk/client-s3";

/**
 * Works against any S3-compatible bucket (Cloudflare R2, Supabase Storage,
 * AWS S3, Backblaze B2, ...) — only the endpoint/region/credentials differ
 * per provider, all read from env (see .env.example for provider-specific
 * values). `forcePathStyle` is required by some providers (e.g. Supabase,
 * whose endpoint already includes a fixed path) and harmless for the rest.
 * Only constructed when STORAGE_DRIVER=s3; the local dev driver never
 * touches this module.
 */
let client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (client) return client;

  const endpoint = requireEnv("S3_ENDPOINT");
  const accessKeyId = requireEnv("S3_ACCESS_KEY_ID");
  const secretAccessKey = requireEnv("S3_SECRET_ACCESS_KEY");
  // "auto" works for R2 (it ignores region); other providers (Supabase,
  // AWS) validate it as part of the request signature, so it must match
  // the bucket's actual region there.
  const region = process.env.S3_REGION || "auto";

  client = new S3Client({
    region,
    endpoint,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  });
  return client;
}

export function getS3Bucket(): string {
  return requireEnv("S3_BUCKET");
}

export function getS3PublicBaseUrl(): string {
  // Must serve objects directly (never proxied back through this app) —
  // a custom/CDN domain, R2's r2.dev URL, or Supabase's
  // ".../storage/v1/object/public/<bucket>" URL.
  return requireEnv("S3_PUBLIC_BASE_URL").replace(/\/$/, "");
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} env var (required when STORAGE_DRIVER=s3)`);
  }
  return value;
}
