import { prisma } from "@cardapio/db";
import { requireSession } from "@/lib/session";
import { CategoryManager } from "@/components/CategoryManager";

export default async function CategoriesPage() {
  const session = await requireSession();

  const categories = await prisma.category.findMany({
    where: { restaurantId: session.user.restaurantId },
    orderBy: { order: "asc" },
    include: { _count: { select: { dishes: true } } },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Categorias</h1>
      <CategoryManager
        initialCategories={categories.map((c) => ({ id: c.id, name: c.name, order: c.order, dishCount: c._count.dishes }))}
      />
    </div>
  );
}
