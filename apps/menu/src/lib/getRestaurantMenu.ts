import { prisma } from "@cardapio/db";

/** Plain-serializable shape safe to pass from a Server Component to a Client Component. */
export interface MenuDish {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  model3dUrl: string | null;
  usdzUrl: string | null;
}

export interface MenuCategory {
  id: string;
  name: string;
  dishes: MenuDish[];
}

export interface RestaurantMenu {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  themeColor: string;
  categories: MenuCategory[];
}

/**
 * Loads a restaurant's public menu by slug, ready to render on /r/[slug].
 * Only `available` dishes are returned; empty categories are dropped.
 */
export async function getRestaurantMenu(slug: string): Promise<RestaurantMenu | null> {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: {
      categories: {
        orderBy: { order: "asc" },
        include: {
          dishes: {
            where: { available: true },
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!restaurant) return null;

  return {
    id: restaurant.id,
    name: restaurant.name,
    slug: restaurant.slug,
    logoUrl: restaurant.logoUrl,
    themeColor: restaurant.themeColor,
    categories: restaurant.categories
      .filter((category) => category.dishes.length > 0)
      .map((category) => ({
        id: category.id,
        name: category.name,
        dishes: category.dishes.map((dish) => ({
          id: dish.id,
          name: dish.name,
          description: dish.description,
          price: Number(dish.price),
          imageUrl: dish.imageUrl,
          model3dUrl: dish.model3dUrl,
          usdzUrl: dish.usdzUrl,
        })),
      })),
  };
}
