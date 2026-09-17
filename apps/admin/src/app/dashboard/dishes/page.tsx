import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@cardapio/db";
import { requireSession } from "@/lib/session";
import { Button } from "@cardapio/ui";
import { DishList } from "@/components/DishList";

export default async function DishesPage() {
  const session = await requireSession();

  const dishes = await prisma.dish.findMany({
    where: { category: { restaurantId: session.user.restaurantId } },
    orderBy: [{ categoryId: "asc" }, { order: "asc" }],
    include: { category: true },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pratos</h1>
          <p className="text-sm text-gray-500">{dishes.length} prato{dishes.length === 1 ? "" : "s"} cadastrado{dishes.length === 1 ? "" : "s"}</p>
        </div>
        <Link href="/dashboard/dishes/new">
          <Button>
            <Plus className="h-4 w-4" strokeWidth={2.25} />
            Novo prato
          </Button>
        </Link>
      </div>

      <DishList
        dishes={dishes.map((d) => ({
          id: d.id,
          name: d.name,
          price: Number(d.price),
          imageUrl: d.imageUrl,
          model3dUrl: d.model3dUrl,
          available: d.available,
          categoryName: d.category.name,
        }))}
      />
    </div>
  );
}
