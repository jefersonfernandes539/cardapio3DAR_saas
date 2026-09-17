import { Plan } from "@prisma/client";

/// Draft tiers (see README pricing discussion) — no payment provider wired
/// up yet, so these are enforced directly against `Restaurant.plan`.
/// `null` means unlimited.
export interface PlanLimits {
  maxDishes: number | null;
  max3dDishes: number | null;
  maxStaff: number | null;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  FREE: { maxDishes: 15, max3dDishes: 0, maxStaff: 1 },
  PRO: { maxDishes: 50, max3dDishes: 5, maxStaff: 2 },
  PREMIUM: { maxDishes: null, max3dDishes: null, maxStaff: null },
};

export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan];
}

export const PLAN_LABELS: Record<Plan, string> = {
  FREE: "Grátis",
  PRO: "Pro",
  PREMIUM: "Premium",
};
