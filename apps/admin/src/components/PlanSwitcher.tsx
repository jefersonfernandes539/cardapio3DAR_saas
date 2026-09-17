"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Plan, PLAN_LIMITS, PLAN_LABELS } from "@cardapio/db";
import { Badge, cx } from "@cardapio/ui";

const PLAN_ORDER: Plan[] = ["FREE", "PRO", "PREMIUM"];

export function PlanSwitcher({ currentPlan }: { currentPlan: Plan }) {
  const router = useRouter();
  const [pending, setPending] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function selectPlan(plan: Plan) {
    setPending(plan);
    setError(null);
    const res = await fetch("/api/plan", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    setPending(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Não foi possível trocar de plano.");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        {PLAN_ORDER.map((plan) => {
          const limits = PLAN_LIMITS[plan];
          const active = plan === currentPlan;
          const featured = plan === "PRO";
          const items = [
            limits.maxDishes === null ? "Pratos ilimitados" : `Até ${limits.maxDishes} pratos`,
            limits.max3dDishes === 0
              ? "Sem 3D/AR"
              : limits.max3dDishes === null
                ? "3D/AR ilimitado"
                : `Até ${limits.max3dDishes} pratos com 3D/AR`,
            limits.maxStaff === null ? "Usuários ilimitados" : `Até ${limits.maxStaff} usuário(s)`,
          ];

          return (
            <div
              key={plan}
              className={cx(
                "relative rounded-2xl border p-5 transition-all",
                active
                  ? "border-brand-600 bg-white shadow-elevated ring-2 ring-brand-100"
                  : "border-gray-100 bg-white shadow-card hover:border-gray-200",
              )}
            >
              {featured && !active && (
                <span className="absolute -top-2.5 left-5 rounded-full bg-brand-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-glow">
                  Popular
                </span>
              )}
              <div className="flex items-center justify-between">
                <p className="font-bold text-gray-900">{PLAN_LABELS[plan]}</p>
                {active && <Badge>Atual</Badge>}
              </div>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                {items.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-brand-600" strokeWidth={2.5} />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => selectPlan(plan)}
                disabled={active || pending !== null}
                className={cx(
                  "mt-5 w-full rounded-full px-3 py-2.5 text-sm font-semibold transition-colors",
                  active
                    ? "cursor-default bg-gray-100 text-gray-400"
                    : "bg-brand-600 text-white shadow-glow hover:bg-brand-700 disabled:opacity-50",
                )}
              >
                {active ? "Plano atual" : pending === plan ? "Trocando…" : "Selecionar"}
              </button>
            </div>
          );
        })}
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
