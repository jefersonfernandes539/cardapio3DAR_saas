"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EmptyState } from "@cardapio/ui";
import type { RestaurantMenu } from "@/lib/getRestaurantMenu";
import { DishCard } from "@/components/DishCard";
import { DishDetailSheet } from "@/components/DishDetailSheet";

export function RestaurantMenuView({ menu }: { menu: RestaurantMenu }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedDishId, setSelectedDishId] = useState<string | null>(null);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);

  const selectedDish = useMemo(
    () => menu.categories.flatMap((c) => c.dishes).find((d) => d.id === selectedDishId) ?? null,
    [menu.categories, selectedDishId],
  );

  // Keep the active tab in sync while the user swipes horizontally between
  // category panels (rather than only reacting to explicit tab taps).
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const index = panelRefs.current.findIndex((el) => el === entry.target);
            if (index !== -1) setActiveIndex(index);
          }
        }
      },
      { root: scroller, threshold: [0.6] },
    );

    panelRefs.current.forEach((panel) => panel && observer.observe(panel));
    return () => observer.disconnect();
  }, [menu.categories.length]);

  function goToCategory(index: number) {
    panelRefs.current[index]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }

  if (menu.categories.length === 0) {
    return (
      <main className="flex min-h-dvh flex-col">
        <Header menu={menu} />
        <EmptyState
          title="Cardápio em preparação"
          description="Este restaurante ainda não publicou nenhum prato."
        />
      </main>
    );
  }

  return (
    <main className="flex h-dvh flex-col overflow-hidden" style={{ ["--brand" as string]: menu.themeColor }}>
      <Header menu={menu} />

      {/* Category tabs */}
      <nav className="no-scrollbar flex shrink-0 gap-2 overflow-x-auto border-b border-gray-100 bg-white px-4 py-3">
        {menu.categories.map((category, index) => (
          <button
            key={category.id}
            onClick={() => goToCategory(index)}
            className={
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors " +
              (index === activeIndex
                ? "bg-brand-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200")
            }
          >
            {category.name}
          </button>
        ))}
      </nav>

      {/* Swipeable category panels */}
      <div ref={scrollerRef} className="no-scrollbar flex flex-1 snap-x snap-mandatory overflow-x-auto">
        {menu.categories.map((category, index) => (
          <div
            key={category.id}
            ref={(el) => {
              panelRefs.current[index] = el;
            }}
            className="h-full w-full shrink-0 snap-start overflow-y-auto px-4 py-4"
          >
            <ul className="flex flex-col gap-3">
              {category.dishes.map((dish) => (
                <li key={dish.id}>
                  <DishCard dish={dish} onSelect={setSelectedDishId} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <DishDetailSheet dish={selectedDish} open={Boolean(selectedDish)} onClose={() => setSelectedDishId(null)} />
    </main>
  );
}

function Header({ menu }: { menu: RestaurantMenu }) {
  return (
    <header className="flex shrink-0 items-center gap-3 bg-white px-4 py-4 shadow-sm">
      {menu.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={menu.logoUrl} alt={menu.name} className="h-10 w-10 rounded-full object-cover" />
      ) : (
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: menu.themeColor }}
        >
          {menu.name.slice(0, 1)}
        </div>
      )}
      <h1 className="text-lg font-bold text-gray-900">{menu.name}</h1>
    </header>
  );
}
