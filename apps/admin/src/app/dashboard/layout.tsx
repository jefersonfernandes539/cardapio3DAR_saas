import { UtensilsCrossed } from "lucide-react";
import { prisma } from "@cardapio/db";
import { requireSession } from "@/lib/session";
import { DashboardNav } from "@/components/DashboardNav";
import { SignOutButton } from "@/components/SignOutButton";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const restaurant = await prisma.restaurant.findUniqueOrThrow({
    where: { id: session.user.restaurantId },
  });

  const initials = session.user.email?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 shrink-0 flex-col gap-6 border-r border-gray-100 bg-white p-5">
        <div className="flex items-center gap-2.5 px-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-glow">
            <UtensilsCrossed className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <span className="text-sm font-bold tracking-tight text-gray-900">Cardápio Admin</span>
        </div>

        <div className="rounded-xl bg-gray-50 px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Restaurante</p>
          <p className="truncate font-semibold text-gray-900">{restaurant.name}</p>
          <p className="truncate text-xs text-gray-400">/r/{restaurant.slug}</p>
        </div>

        <DashboardNav />

        <div className="mt-auto flex items-center gap-2.5 border-t border-gray-100 pt-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
            {initials}
          </div>
          <span className="min-w-0 flex-1 truncate text-sm text-gray-500">{session.user.email}</span>
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
