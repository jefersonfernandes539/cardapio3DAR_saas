import { ExternalLink } from "lucide-react";
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
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Preview do cardápio</h1>
        <a
          href={publicUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          Abrir em nova aba
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
        </a>
      </div>
      <p className="mb-6 text-sm text-gray-500">
        É exatamente isto que o cliente vê ao escanear o QR code da mesa: {publicUrl}
      </p>
      <div className="mx-auto w-fit rounded-[2.5rem] border-[10px] border-gray-900 bg-gray-900 shadow-elevated">
        <div className="h-[780px] w-[390px] overflow-hidden rounded-[1.75rem] bg-white">
          <iframe src={publicUrl} className="h-full w-full" title="Preview do cardápio" />
        </div>
      </div>
    </div>
  );
}
