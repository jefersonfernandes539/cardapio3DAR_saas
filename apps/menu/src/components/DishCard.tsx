"use client";

import Image from "next/image";
import { Box, ImageOff } from "lucide-react";
import { formatPrice } from "@cardapio/ui";
import type { MenuDish } from "@/lib/getRestaurantMenu";

export function DishCard({ dish, onSelect }: { dish: MenuDish; onSelect: (id: string) => void }) {
  return (
    <button
      onClick={() => onSelect(dish.id)}
      className="group flex w-full items-center gap-3.5 rounded-2xl border border-gray-100 bg-white p-3 text-left shadow-card transition-all duration-150 active:scale-[0.98] hover:shadow-elevated hover:border-gray-200"
    >
      <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {dish.imageUrl ? (
          <Image
            src={dish.imageUrl}
            alt={dish.name}
            fill
            sizes="72px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <ImageOff className="h-5 w-5" strokeWidth={1.5} />
          </div>
        )}
        {dish.model3dUrl && (
          <span className="absolute bottom-1 right-1 inline-flex items-center gap-0.5 rounded-full bg-brand-600/95 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
            <Box className="h-2.5 w-2.5" strokeWidth={2} />
            3D
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-display font-semibold text-gray-900">{dish.name}</p>
        {dish.description && (
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-gray-500">{dish.description}</p>
        )}
        <p className="mt-1.5 text-sm font-bold text-brand-700">{formatPrice(dish.price)}</p>
      </div>
    </button>
  );
}
