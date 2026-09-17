import { Tags } from "lucide-react";
import { prisma } from "@cardapio/db";
import { requireSession } from "@/lib/session";
import { EmptyState } from "@cardapio/ui";
import { DishForm } from "@/components/DishForm";

export default async function NewDishPage() {
  const session = await requireSession();

  const categories = await prisma.category.findMany({
    where: { restaurantId: session.user.restaurantId },
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Novo prato</h1>
      {categories.length === 0 ? (
        <EmptyState
          icon={<Tags className="h-6 w-6" strokeWidth={1.75} />}
          title="Nenhuma categoria ainda"
          description="Crie ao menos uma categoria antes de cadastrar pratos."
        />
      ) : (
        <DishForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
      )}
    </div>
  );
}
