"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@cardapio/ui";

export interface DishFormCategory {
  id: string;
  name: string;
}

export interface DishFormInitial {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  model3dUrl: string | null;
  usdzUrl: string | null;
  available: boolean;
  categoryId: string;
}

export function DishForm({ categories, initial }: { categories: DishFormCategory[]; initial?: DishFormInitial }) {
  const router = useRouter();
  const isEdit = Boolean(initial);

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [available, setAvailable] = useState(initial?.available ?? true);
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [model3dUrl, setModel3dUrl] = useState(initial?.model3dUrl ?? "");
  const [usdzUrl, setUsdzUrl] = useState(initial?.usdzUrl ?? "");

  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // .glb models always go through this server (proxyUpload) so it can run
  // Draco compression before storage — everything else (images, .gltf,
  // .usdz) prefers a direct-to-bucket upload that skips the server entirely
  // when STORAGE_DRIVER=s3.
  async function uploadFile(file: File, kind: "image" | "model"): Promise<string | null> {
    if (kind === "model" && file.name.toLowerCase().endsWith(".glb")) {
      return proxyUpload(file, kind);
    }

    const presignRes = await fetch("/api/upload/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size, kind }),
    });
    const presignData = await presignRes.json();
    if (!presignRes.ok) {
      setError(presignData.error ?? "Falha ao preparar upload");
      return null;
    }

    if (!presignData.direct) {
      // STORAGE_DRIVER=local (dev): no bucket to presign against, proxy
      // the bytes through this app instead.
      return proxyUpload(file, kind);
    }

    // STORAGE_DRIVER=s3 (production): PUT straight to the bucket — the
    // file's bytes never touch this server, so uploads don't burn compute
    // or bandwidth here regardless of file size.
    const putRes = await fetch(presignData.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!putRes.ok) {
      setError("Falha ao enviar arquivo para o storage");
      return null;
    }
    return presignData.publicUrl as string;
  }

  async function proxyUpload(file: File, kind: "image" | "model"): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Falha no upload");
      return null;
    }
    return data.url as string;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name,
      description: description || null,
      price: Number(price),
      categoryId,
      available,
      imageUrl: imageUrl || null,
      model3dUrl: model3dUrl || null,
      usdzUrl: usdzUrl || null,
    };

    const res = await fetch(isEdit ? `/api/dishes/${initial!.id}` : "/api/dishes", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Não foi possível salvar o prato");
      return;
    }

    router.push("/dashboard/dishes");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      <Field label="Nome">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
        />
      </Field>

      <Field label="Descrição">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="input"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Preço (R$)">
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Categoria">
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input" required>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} />
        Disponível no cardápio
      </label>

      <Field label="Foto 2D">
        <UploadRow
          currentUrl={imageUrl}
          accept="image/jpeg,image/png,image/webp"
          uploading={uploading === "image"}
          onUpload={async (file) => {
            setUploading("image");
            const url = await uploadFile(file, "image");
            setUploading(null);
            if (url) setImageUrl(url);
          }}
          onClear={() => setImageUrl("")}
          preview={imageUrl ? <Image src={imageUrl} alt="Foto do prato" width={64} height={64} className="rounded-lg object-cover" /> : null}
        />
      </Field>

      <Field label="Modelo 3D (.glb ou .gltf) — opcional">
        <UploadRow
          currentUrl={model3dUrl}
          accept=".glb,.gltf"
          uploading={uploading === "model3d"}
          onUpload={async (file) => {
            setUploading("model3d");
            const url = await uploadFile(file, "model");
            setUploading(null);
            if (url) setModel3dUrl(url);
          }}
          onClear={() => setModel3dUrl("")}
        />
      </Field>

      <Field label="Modelo USDZ para AR no iOS — opcional (recomendado se enviar .glb)">
        <UploadRow
          currentUrl={usdzUrl}
          accept=".usdz"
          uploading={uploading === "usdz"}
          onUpload={async (file) => {
            setUploading("usdz");
            const url = await uploadFile(file, "model");
            setUploading(null);
            if (url) setUsdzUrl(url);
          }}
          onClear={() => setUsdzUrl("")}
        />
      </Field>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={saving || Boolean(uploading)}>
          {saving ? "Salvando…" : "Salvar prato"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/dishes")}>
          Cancelar
        </Button>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #d1d5db;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
        }
        .input:focus {
          outline: none;
          border-color: #f97316;
          box-shadow: 0 0 0 1px #f97316;
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function UploadRow({
  currentUrl,
  accept,
  uploading,
  onUpload,
  onClear,
  preview,
}: {
  currentUrl: string;
  accept: string;
  uploading: boolean;
  onUpload: (file: File) => void;
  onClear: () => void;
  preview?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      {preview}
      <input
        type="file"
        accept={accept}
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
        }}
        className="text-sm"
      />
      {uploading && <span className="text-xs text-gray-400">Enviando…</span>}
      {currentUrl && !uploading && (
        <button type="button" onClick={onClear} className="text-xs font-medium text-red-500 hover:text-red-700">
          remover
        </button>
      )}
    </div>
  );
}
