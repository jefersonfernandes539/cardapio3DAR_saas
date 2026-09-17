import Link from "next/link";
import { QrCode, Sparkles, UtensilsCrossed } from "lucide-react";

// Root route with no restaurant slug. In production this is never linked to
// directly — customers land on /r/[slug] via the QR code on their table —
// but it's useful as a human-friendly landing/fallback page.
export default function HomePage() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
      {/* Ambient brand glow — purely decorative background. */}
      <div className="pointer-events-none absolute inset-0 bg-brand-radial from-brand-100 via-gray-50 to-gray-50" />
      <div className="pointer-events-none absolute -top-24 right-[-4rem] h-64 w-64 rounded-full bg-brand-300/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-6rem] left-[-4rem] h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />

      <div className="relative flex flex-col items-center gap-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-glow">
          <UtensilsCrossed className="h-8 w-8" strokeWidth={1.75} />
        </div>

        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700 shadow-card">
            <Sparkles className="h-3.5 w-3.5" />
            Cardápio digital com 3D/AR
          </span>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            Veja o prato antes
            <br />
            de pedir.
          </h1>
          <p className="mx-auto max-w-sm text-balance text-gray-500">
            Escaneie o QR code na mesa do restaurante para abrir o cardápio. Este é o app de
            demonstração — experimente o cardápio de exemplo abaixo.
          </p>
        </div>

        <Link
          href="/r/sabor-brasil"
          className="group inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 font-semibold text-white shadow-glow transition-all hover:bg-brand-700 active:scale-[0.97]"
        >
          <QrCode className="h-5 w-5" strokeWidth={1.75} />
          Ver cardápio de demonstração
        </Link>
      </div>
    </main>
  );
}
