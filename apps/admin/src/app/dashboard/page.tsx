import Link from "next/link";
import { ArrowRight, Box, Eye, LucideIcon, Tags, UtensilsCrossed } from "lucide-react";
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
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Visão geral</h1>
      <p className="mb-6 text-sm text-gray-500">O status atual do seu cardápio digital.</p>

      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={Tags} label="Categorias" value={categoryCount} />
        <StatCard icon={UtensilsCrossed} label="Pratos" value={dishCount} />
        <StatCard icon={Box} label="Pratos com modelo 3D/AR" value={dishesWith3D} accent />
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <QuickLink href="/dashboard/categories" icon={Tags} label="Gerenciar categorias" />
        <QuickLink href="/dashboard/dishes" icon={UtensilsCrossed} label="Gerenciar pratos" />
        <QuickLink href="/dashboard/preview" icon={Eye} label="Ver preview do cardápio" />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
      <div
        className={
          "mb-3 flex h-9 w-9 items-center justify-center rounded-xl " +
          (accent ? "bg-brand-600 text-white shadow-glow" : "bg-gray-100 text-gray-500")
        }
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-gray-900">{value}</p>
    </div>
  );
}

function QuickLink({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-card transition-all duration-150 hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-elevated"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <span className="flex-1 text-sm font-semibold text-gray-800">{label}</span>
      <ArrowRight className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600" strokeWidth={2} />
    </Link>
  );
}
