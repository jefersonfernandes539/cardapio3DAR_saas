"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { EmptyState, Badge, formatPrice } from "@cardapio/ui";

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
        title="Nenhum prato cadastrado"
        description="Crie uma categoria e depois adicione o primeiro prato."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
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
            <tr key={dish.id} className="border-t border-gray-100">
              <td className="flex items-center gap-3 px-4 py-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {dish.imageUrl && (
                    <Image src={dish.imageUrl} alt={dish.name} fill sizes="40px" className="object-cover" />
                  )}
                </div>
                <span className="font-medium">{dish.name}</span>
                {dish.model3dUrl && <Badge>3D/AR</Badge>}
              </td>
              <td className="px-4 py-3 text-gray-500">{dish.categoryName}</td>
              <td className="px-4 py-3">{formatPrice(dish.price)}</td>
              <td className="px-4 py-3">
                <span className={dish.available ? "text-green-600" : "text-gray-400"}>
                  {dish.available ? "Disponível" : "Oculto"}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <Link href={`/dashboard/dishes/${dish.id}`} className="mr-3 font-medium text-brand-600 hover:underline">
                  Editar
                </Link>
                <button onClick={() => handleDelete(dish.id)} className="font-medium text-red-500 hover:text-red-700">
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
