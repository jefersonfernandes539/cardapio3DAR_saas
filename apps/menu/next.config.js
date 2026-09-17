// When STORAGE_DRIVER=s3, apps/admin's presign flow returns absolute
// bucket/CDN URLs (S3_PUBLIC_BASE_URL) for dish photos instead of relative
// "/uploads" URLs — next/image only optimizes external hosts it's
// explicitly told about, so that host needs to be allow-listed here too.
const bucketPattern = (() => {
  if (!process.env.S3_PUBLIC_BASE_URL) return null;
  try {
    const url = new URL(process.env.S3_PUBLIC_BASE_URL);
    return { protocol: url.protocol.replace(":", ""), hostname: url.hostname };
  } catch {
    return null;
  }
})();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Let Next.js transpile our internal workspace packages instead of
  // requiring them to be pre-built.
  transpilePackages: ["@cardapio/ui", "@cardapio/db"],
  images: {
    // Next's image optimizer resizes images *server-side*, so it fetches the
    // source URL from wherever this dev server happens to be running. This
    // machine's network blocks outbound requests to several image/CDN hosts
    // used here (picsum.photos, *.ngrok-free.app) even though a phone on a
    // different network reaches them fine — so the optimizer 500s regardless
    // of the viewer. Skipping optimization in dev makes the browser fetch
    // images directly instead, which works from any network. Production
    // (Vercel et al.) keeps optimization on.
    unoptimized: process.env.NODE_ENV !== "production",
    remotePatterns: [
      // Seed data placeholders (dish photos).
      { protocol: "https", hostname: "picsum.photos" },
      // Sample glTF poster/thumbnails used by the seeded "3D demo" dish.
      { protocol: "https", hostname: "modelviewer.dev" },
      // Real photo for the seeded "Picanha na Brasa" dish (Wikimedia Commons).
      { protocol: "https", hostname: "upload.wikimedia.org" },
      // Restaurant-uploaded photos/models: served via the "/uploads" rewrite
      // below (relative URLs, same origin) when STORAGE_DRIVER=local, or
      // directly from the bucket/CDN (allow-listed here) when
      // STORAGE_DRIVER=s3.
      ...(bucketPattern ? [bucketPattern] : []),
    ],
  },
  async rewrites() {
    // apps/admin's mock local storage (apps/admin/src/lib/storage.ts) saves
    // uploads under its own /uploads and returns a relative URL for them.
    // Proxying that path here means the browser only ever talks to *this*
    // app's origin for a dish's photo/3D model — same as apps/menu's own
    // pages — instead of a second cross-origin host. That matters most when
    // this app is reached through a tunnel (ngrok, etc.) for phone testing:
    // a second tunnel domain needs its own separate click-through and, on
    // iOS Safari/WebKit, cross-site subresource requests don't reliably
    // carry that consent — so images/models on a different tunnel host can
    // silently fail to load even though the URL works standalone. A real
    // S3 driver returns an absolute bucket URL instead (see .env.example's
    // STORAGE_DRIVER/S3_* vars) and bypasses this rewrite entirely, so
    // nothing here needs to change when that swap happens.
    const adminInternalUrl = process.env.ADMIN_INTERNAL_URL ?? "http://localhost:3001";
    return [{ source: "/uploads/:path*", destination: `${adminInternalUrl}/uploads/:path*` }];
  },
  async headers() {
    return [
      {
        // Service worker must be served from the root scope with no caching
        // so updates are picked up promptly.
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }],
      },
    ];
  },
};

module.exports = nextConfig;
