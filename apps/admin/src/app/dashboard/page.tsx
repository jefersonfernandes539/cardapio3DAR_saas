import Link from "next/link";
import { prisma } from "@cardapio/db";
import { requireSession } from "@/lib/session";

export default async function DashboardOverviewPage() {
  const session = await requireSession();

  const [categoryCount, dishCount, dishesWith3D] = await Promise.all([
    prisma.category.count({ where: { restaurantId: session.user.restaurantId } }),
    prisma.dish.count({ where: { category: { restaurantId: session.user.restaurantId } } }),
    prisma.dish.count({
      where: { category: { restaurantId: session.user.restaurantId }, model3dUrl: { not: null } },
    }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Visão geral</h1>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Categorias" value={categoryCount} />
        <StatCard label="Pratos" value={dishCount} />
        <StatCard label="Pratos com modelo 3D/AR" value={dishesWith3D} />
      </div>

      <div className="mt-8 flex gap-3">
        <Link href="/dashboard/categories" className="text-sm font-medium text-brand-600 hover:underline">
          Gerenciar categorias →
        </Link>
        <Link href="/dashboard/dishes" className="text-sm font-medium text-brand-600 hover:underline">
          Gerenciar pratos →
        </Link>
        <Link href="/dashboard/preview" className="text-sm font-medium text-brand-600 hover:underline">
          Ver preview do cardápio →
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
