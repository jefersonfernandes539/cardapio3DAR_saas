import { prisma } from "@cardapio/db";
import { requireSession } from "@/lib/session";
import { DishForm } from "@/components/DishForm";

export default async function NewDishPage() {
  const session = await requireSession();

  const categories = await prisma.category.findMany({
    where: { restaurantId: session.user.restaurantId },
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Novo prato</h1>
      {categories.length === 0 ? (
        <p className="text-sm text-gray-500">
          Crie ao menos uma categoria antes de cadastrar pratos.
        </p>
      ) : (
        <DishForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
      )}
    </div>
  );
}
