/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@cardapio/ui", "@cardapio/db"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "modelviewer.dev" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "http", hostname: "localhost", port: "3001" },
    ],
  },
  async headers() {
    return [
      {
        // apps/menu (a different origin/port in dev, and typically a
        // different subdomain in production) fetches these files directly
        // from the browser — <model-viewer>'s GLTFLoader uses fetch(), which
        // enforces CORS even though a plain <img>/<Image> wouldn't. Without
        // this header the 3D model silently fails to load cross-origin.
        // A real S3/R2 bucket needs the equivalent CORS config when
        // apps/admin/src/lib/storage.ts is swapped over (see README).
        source: "/uploads/:path*",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
      },
    ];
  },
};

module.exports = nextConfig;
