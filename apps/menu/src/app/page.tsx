import Link from "next/link";

// Root route with no restaurant slug. In production this is never linked to
// directly — customers land on /r/[slug] via the QR code on their table —
// but it's useful as a human-friendly landing/fallback page.
export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold">Cardápio Digital</h1>
      <p className="max-w-sm text-gray-600">
        Escaneie o QR code na mesa do restaurante para acessar o cardápio. Este é o app de
        demonstração — experimente o cardápio de exemplo abaixo.
      </p>
      <Link
        href="/r/sabor-brasil"
        className="rounded-full bg-brand-600 px-5 py-3 font-medium text-white hover:bg-brand-700"
      >
        Ver cardápio de demonstração
      </Link>
    </main>
  );
}
