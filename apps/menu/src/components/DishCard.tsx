"use client";

import Image from "next/image";
import { Badge, formatPrice } from "@cardapio/ui";
import type { MenuDish } from "@/lib/getRestaurantMenu";

export function DishCard({ dish, onSelect }: { dish: MenuDish; onSelect: (id: string) => void }) {
  return (
    <button
      onClick={() => onSelect(dish.id)}
      className="flex w-full items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 text-left shadow-card transition-transform active:scale-[0.99]"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {dish.imageUrl ? (
          <Image src={dish.imageUrl} alt={dish.name} fill sizes="80px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">Sem foto</div>
        )}
        {dish.model3dUrl && (
          <span className="absolute bottom-1 right-1 rounded-full bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            3D
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-gray-900">{dish.name}</p>
        {dish.description && (
          <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{dish.description}</p>
        )}
        <Badge className="mt-1.5">{formatPrice(dish.price)}</Badge>
      </div>
    </button>
  );
}
