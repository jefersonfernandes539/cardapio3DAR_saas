"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useState } from "react";
import { BottomSheet, Badge, Button, formatPrice } from "@cardapio/ui";
import type { MenuDish } from "@/lib/getRestaurantMenu";

// Lazy-loaded: pulls in @google/model-viewer (Three.js runtime) only once
// the customer opens a dish that has a 3D model *and* taps to view it, and
// only in the browser (the custom element needs `window`/`customElements`).
const Model3DViewer = dynamic(
  () => import("@/components/Model3DViewer").then((mod) => mod.Model3DViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[320px] w-full animate-pulse items-center justify-center rounded-2xl bg-gray-100 text-sm text-gray-400">
        Carregando visualização 3D…
      </div>
    ),
  },
);

export function DishDetailSheet({
  dish,
  open,
  onClose,
}: {
  dish: MenuDish | null;
  open: boolean;
  onClose: () => void;
}) {
  const [show3D, setShow3D] = useState(false);

  // Reset the 3D view each time a different dish is opened.
  function handleClose() {
    setShow3D(false);
    onClose();
  }

  if (!dish) return null;
  const has3D = Boolean(dish.model3dUrl);

  return (
    <BottomSheet open={open} onClose={handleClose}>
      <div className="p-5 pb-8">
        <div className="relative mb-4 h-[320px] w-full overflow-hidden rounded-2xl bg-gray-100">
          {show3D && has3D ? (
            <Model3DViewer
              src={dish.model3dUrl as string}
              iosSrc={dish.usdzUrl}
              poster={dish.imageUrl}
              alt={dish.name}
            />
          ) : dish.imageUrl ? (
            <Image
              src={dish.imageUrl}
              alt={dish.name}
              fill
              sizes="(max-width: 512px) 100vw, 512px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">Sem foto</div>
          )}
        </div>

        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-900">{dish.name}</h2>
          <Badge className="shrink-0">{formatPrice(dish.price)}</Badge>
        </div>

        {dish.description && <p className="mt-2 text-sm text-gray-600">{dish.description}</p>}

        {has3D && (
          <Button
            className="mt-5 w-full"
            variant={show3D ? "secondary" : "primary"}
            onClick={() => setShow3D((v) => !v)}
          >
            {show3D ? "Voltar para foto" : "Ver em tamanho real (3D/AR)"}
          </Button>
        )}
      </div>
    </BottomSheet>
  );
}
