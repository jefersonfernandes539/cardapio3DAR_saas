import { notFound } from "next/navigation";
import { prisma } from "@cardapio/db";
import { requireSession } from "@/lib/session";
import { DishForm } from "@/components/DishForm";

export default async function EditDishPage({ params }: { params: { id: string } }) {
  const session = await requireSession();

  const [dish, categories] = await Promise.all([
    prisma.dish.findFirst({
      where: { id: params.id, category: { restaurantId: session.user.restaurantId } },
    }),
    prisma.category.findMany({
      where: { restaurantId: session.user.restaurantId },
      orderBy: { order: "asc" },
    }),
  ]);

  if (!dish) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Editar prato</h1>
      <DishForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        initial={{
          id: dish.id,
          name: dish.name,
          description: dish.description,
          price: Number(dish.price),
          imageUrl: dish.imageUrl,
          model3dUrl: dish.model3dUrl,
          usdzUrl: dish.usdzUrl,
          available: dish.available,
          categoryId: dish.categoryId,
        }}
      />
    </div>
  );
}
