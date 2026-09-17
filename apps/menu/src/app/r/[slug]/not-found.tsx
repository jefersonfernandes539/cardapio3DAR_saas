import Link from "next/link";
import { SearchX } from "lucide-react";

export default function RestaurantNotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-gray-50 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-gray-400 shadow-card">
        <SearchX className="h-7 w-7" strokeWidth={1.75} />
      </div>
      <h1 className="font-display text-xl font-semibold text-gray-900">Cardápio não encontrado</h1>
      <p className="max-w-xs text-sm text-gray-500">
        Confira o QR code da mesa e tente novamente.
      </p>
      <Link href="/" className="mt-2 text-sm font-semibold text-brand-600 hover:text-brand-700">
        Voltar ao início
      </Link>
    </main>
  );
}
