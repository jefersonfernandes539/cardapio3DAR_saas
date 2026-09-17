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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
        <p className="text-sm text-gray-500">Organize as seções do seu cardápio e a ordem de exibição.</p>
      </div>
      <CategoryManager
        initialCategories={categories.map((c) => ({ id: c.id, name: c.name, order: c.order, dishCount: c._count.dishes }))}
      />
    </div>
  );
}
