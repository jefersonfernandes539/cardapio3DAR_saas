import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import path from "path";
import { authOptions } from "@/lib/auth";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_MODEL_EXTENSIONS,
  MAX_UPLOAD_BYTES,
  createUploadTarget,
} from "@/lib/storage";

// Step 1 of the direct-to-bucket upload flow: validates the file metadata
// the same way /api/upload does, then hands back either a presigned PUT URL
// (STORAGE_DRIVER=s3 — the browser uploads directly to the bucket next) or
// `{ direct: false }` (STORAGE_DRIVER=local — DishForm falls back to
// posting the file to /api/upload instead). No file bytes pass through
// here; only the filename/content-type are needed to sign the URL.
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const filename = typeof body?.filename === "string" ? body.filename : null;
  const contentType = typeof body?.contentType === "string" ? body.contentType : null;
  const size = typeof body?.size === "number" ? body.size : null;
  const kind = body?.kind; // "image" | "model"

  if (!filename || !contentType) {
    return NextResponse.json({ error: "filename e contentType são obrigatórios" }, { status: 400 });
  }
  if (size !== null && size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Arquivo maior que 25MB" }, { status: 400 });
  }

  if (kind === "image") {
    if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
      return NextResponse.json({ error: "Formato de imagem inválido (use JPG/PNG/WEBP)" }, { status: 400 });
    }
    const target = await createUploadTarget("images", filename, contentType);
    return NextResponse.json(target);
  }

  if (kind === "model") {
    const ext = path.extname(filename).toLowerCase();
    if (!ALLOWED_MODEL_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ error: "Formato de modelo inválido (use .glb, .gltf ou .usdz)" }, { status: 400 });
    }
    const target = await createUploadTarget("models", filename, contentType);
    return NextResponse.json(target);
  }

  return NextResponse.json({ error: "kind deve ser 'image' ou 'model'" }, { status: 400 });
}
