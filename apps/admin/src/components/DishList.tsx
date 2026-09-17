"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Box, ImageOff, Pencil, Trash2, UtensilsCrossed } from "lucide-react";
import { Badge, EmptyState, formatPrice } from "@cardapio/ui";

export interface DishRow {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  model3dUrl: string | null;
  available: boolean;
  categoryName: string;
}

export function DishList({ dishes }: { dishes: DishRow[] }) {
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm("Excluir este prato?")) return;
    await fetch(`/api/dishes/${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (dishes.length === 0) {
    return (
      <EmptyState
        icon={<UtensilsCrossed className="h-6 w-6" strokeWidth={1.75} />}
        title="Nenhum prato cadastrado"
        description="Crie uma categoria e depois adicione o primeiro prato."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
      <table className="w-full text-sm">
        <thead className="bg-gray-50/80 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
          <tr>
            <th className="px-4 py-3">Prato</th>
            <th className="px-4 py-3">Categoria</th>
            <th className="px-4 py-3">Preço</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {dishes.map((dish) => (
            <tr key={dish.id} className="border-t border-gray-100 transition-colors hover:bg-gray-50/60">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {dish.imageUrl ? (
                      <Image src={dish.imageUrl} alt={dish.name} fill sizes="40px" className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-300">
                        <ImageOff className="h-4 w-4" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  <span className="font-semibold text-gray-800">{dish.name}</span>
                  {dish.model3dUrl && (
                    <Badge>
                      <Box className="h-3 w-3" strokeWidth={2} />
                      3D/AR
                    </Badge>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-gray-500">{dish.categoryName}</td>
              <td className="px-4 py-3 font-medium text-gray-700">{formatPrice(dish.price)}</td>
              <td className="px-4 py-3">
                {dish.available ? (
                  <Badge variant="success">Disponível</Badge>
                ) : (
                  <Badge variant="neutral">Oculto</Badge>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/dashboard/dishes/${dish.id}`}
                    aria-label="Editar"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
                  >
                    <Pencil className="h-4 w-4" strokeWidth={1.75} />
                  </Link>
                  <button
                    onClick={() => handleDelete(dish.id)}
                    aria-label="Excluir"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
