"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail, UtensilsCrossed } from "lucide-react";
import { Button } from "@cardapio/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("dono@saborbrasil.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (result?.error) {
      setError("E-mail ou senha inválidos.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 bg-brand-radial from-brand-100 via-gray-50 to-gray-50" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-300/25 blur-3xl" />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-elevated"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-brand-400 via-brand-600 to-brand-500" />

        <div className="p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-glow">
              <UtensilsCrossed className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Entrar no painel</h1>
            <p className="mt-1 text-sm text-gray-500">Gerencie o cardápio digital do seu restaurante.</p>
          </div>

          <label className="mb-1.5 block text-sm font-medium text-gray-700">E-mail</label>
          <div className="relative mb-4">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" strokeWidth={1.75} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/60 py-2.5 pl-9 pr-3 text-sm transition-colors focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <label className="mb-1.5 block text-sm font-medium text-gray-700">Senha</label>
          <div className="relative mb-5">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" strokeWidth={1.75} />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/60 py-2.5 pl-9 pr-3 text-sm transition-colors focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                Entrando…
              </>
            ) : (
              "Entrar"
            )}
          </Button>

          <p className="mt-5 text-center text-xs text-gray-400">
            Demo: dono@saborbrasil.com / admin123 (após rodar o seed)
          </p>
        </div>
      </form>
    </main>
  );
}
