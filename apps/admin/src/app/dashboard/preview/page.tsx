import { prisma } from "@cardapio/db";
import { requireSession } from "@/lib/session";

export default async function PreviewPage() {
  const session = await requireSession();
  const restaurant = await prisma.restaurant.findUniqueOrThrow({
    where: { id: session.user.restaurantId },
  });

  const menuUrl = process.env.NEXT_PUBLIC_MENU_URL ?? "http://localhost:3000";
  const publicUrl = `${menuUrl}/r/${restaurant.slug}`;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Preview do cardápio</h1>
        <a href={publicUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-brand-600 hover:underline">
          Abrir em nova aba ↗
        </a>
      </div>
      <p className="mb-4 text-sm text-gray-500">
        É exatamente isto que o cliente vê ao escanear o QR code da mesa: {publicUrl}
      </p>
      <div className="mx-auto h-[780px] w-[390px] overflow-hidden rounded-[2rem] border-8 border-gray-900 shadow-xl">
        <iframe src={publicUrl} className="h-full w-full" title="Preview do cardápio" />
      </div>
    </div>
  );
}
