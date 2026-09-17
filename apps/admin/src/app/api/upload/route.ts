import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import path from "path";
import { authOptions } from "@/lib/auth";
import { compressGlb } from "@/lib/draco";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_MODEL_EXTENSIONS,
  MAX_UPLOAD_BYTES,
  saveBufferLocally,
  saveBufferToS3,
  saveUploadedFileLocally,
} from "@/lib/storage";

// This route is hit in two cases:
// 1. STORAGE_DRIVER=local (dev): every upload (images and models) proxies
//    through here and gets written to apps/admin/public/uploads.
// 2. .glb models, on ANY driver: Draco compression needs the file's bytes
//    server-side, so DishForm always posts .glb files here instead of
//    using the direct-to-bucket presigned flow — the compressed result is
//    then pushed to the bucket itself (STORAGE_DRIVER=s3) or written to
//    disk (=local).
// Everything else (images, .gltf, .usdz) on STORAGE_DRIVER=s3 skips this
// route entirely via /api/upload/presign — the bytes never touch this
// server.
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");
  const kind = formData.get("kind"); // "image" | "model"

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo ausente" }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Arquivo maior que 25MB" }, { status: 400 });
  }

  const driver = process.env.STORAGE_DRIVER ?? "local";

  if (kind === "image") {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Formato de imagem inválido (use JPG/PNG/WEBP)" }, { status: 400 });
    }
    const url =
      driver === "s3"
        ? await saveBufferToS3(Buffer.from(await file.arrayBuffer()), file.name, "images", file.type)
        : await saveUploadedFileLocally(file, "images");
    return NextResponse.json({ url });
  }

  if (kind === "model") {
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_MODEL_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ error: "Formato de modelo inválido (use .glb, .gltf ou .usdz)" }, { status: 400 });
    }

    if (ext === ".glb") {
      const original = Buffer.from(await file.arrayBuffer());
      const compressed = await compressGlb(original);

      const url =
        driver === "s3"
          ? await saveBufferToS3(compressed, file.name, "models", "model/gltf-binary")
          : await saveBufferLocally(compressed, file.name, "models");

      return NextResponse.json({ url, originalBytes: original.length, compressedBytes: compressed.length });
    }

    // .gltf / .usdz: not Draco-compressible, just store as-is. (DishForm
    // normally reaches these via the direct-to-bucket presigned flow
    // instead — this branch only runs on STORAGE_DRIVER=local, or as a
    // defensive fallback.)
    const url =
      driver === "s3"
        ? await saveBufferToS3(Buffer.from(await file.arrayBuffer()), file.name, "models", file.type)
        : await saveUploadedFileLocally(file, "models");
    return NextResponse.json({ url });
  }

  return NextResponse.json({ error: "kind deve ser 'image' ou 'model'" }, { status: 400 });
}
