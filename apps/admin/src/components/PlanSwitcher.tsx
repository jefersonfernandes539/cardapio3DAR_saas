"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plan, PLAN_LIMITS, PLAN_LABELS } from "@cardapio/db";

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
          return (
            <div
              key={plan}
              className={
                "rounded-2xl border p-5 shadow-card " +
                (active ? "border-brand-600 ring-2 ring-brand-100" : "border-gray-100 bg-white")
              }
            >
              <p className="font-bold text-gray-900">{PLAN_LABELS[plan]}</p>
              <ul className="mt-2 space-y-1 text-sm text-gray-500">
                <li>{limits.maxDishes === null ? "Pratos ilimitados" : `Até ${limits.maxDishes} pratos`}</li>
                <li>
                  {limits.max3dDishes === 0
                    ? "Sem 3D/AR"
                    : limits.max3dDishes === null
                      ? "3D/AR ilimitado"
                      : `Até ${limits.max3dDishes} pratos com 3D/AR`}
                </li>
                <li>{limits.maxStaff === null ? "Usuários ilimitados" : `Até ${limits.maxStaff} usuário(s)`}</li>
              </ul>
              <button
                onClick={() => selectPlan(plan)}
                disabled={active || pending !== null}
                className={
                  "mt-4 w-full rounded-lg px-3 py-2 text-sm font-medium " +
                  (active
                    ? "cursor-default bg-gray-100 text-gray-400"
                    : "bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50")
                }
              >
                {active ? "Plano atual" : pending === plan ? "Trocando..." : "Selecionar"}
              </button>
            </div>
          );
        })}
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
