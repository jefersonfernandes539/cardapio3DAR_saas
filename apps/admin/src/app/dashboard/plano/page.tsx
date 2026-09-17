import { prisma, getPlanLimits } from "@cardapio/db";
import { requireSession } from "@/lib/session";
import { PlanSwitcher } from "@/components/PlanSwitcher";

export default async function PlanoPage() {
  const session = await requireSession();

  const [restaurant, dishCount, dishes3dCount, staffCount] = await Promise.all([
    prisma.restaurant.findUniqueOrThrow({ where: { id: session.user.restaurantId } }),
    prisma.dish.count({ where: { category: { restaurantId: session.user.restaurantId } } }),
    prisma.dish.count({
      where: {
        category: { restaurantId: session.user.restaurantId },
        OR: [{ model3dUrl: { not: null } }, { usdzUrl: { not: null } }],
      },
    }),
    prisma.user.count({ where: { restaurantId: session.user.restaurantId } }),
  ]);

  const limits = getPlanLimits(restaurant.plan);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Plano</h1>
      <p className="mb-6 text-sm text-gray-500">
        Nenhum meio de pagamento está integrado ainda — trocar de plano aqui é só para testar os limites
        localmente antes do Stripe entrar.
      </p>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <UsageCard label="Pratos" used={dishCount} max={limits.maxDishes} />
        <UsageCard label="Pratos com 3D/AR" used={dishes3dCount} max={limits.max3dDishes} />
        <UsageCard label="Usuários" used={staffCount} max={limits.maxStaff} />
      </div>

      <PlanSwitcher currentPlan={restaurant.plan} />
    </div>
  );
}

function UsageCard({ label, used, max }: { label: string; used: number; max: number | null }) {
  const overLimit = max !== null && used > max;
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={"mt-1 text-3xl font-bold " + (overLimit ? "text-red-600" : "text-gray-900")}>
        {used}
        <span className="text-base font-medium text-gray-400"> / {max === null ? "∞" : max}</span>
      </p>
    </div>
  );
}
