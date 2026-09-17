import { prisma } from "@cardapio/db";
import { requireSession } from "@/lib/session";
import { DashboardNav } from "@/components/DashboardNav";
import { SignOutButton } from "@/components/SignOutButton";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const restaurant = await prisma.restaurant.findUniqueOrThrow({
    where: { id: session.user.restaurantId },
  });

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 shrink-0 flex-col gap-6 border-r border-gray-100 bg-white p-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">Restaurante</p>
          <p className="font-bold text-gray-900">{restaurant.name}</p>
          <p className="text-xs text-gray-400">/r/{restaurant.slug}</p>
        </div>
        <DashboardNav />
        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-sm text-gray-500">{session.user.email}</span>
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
