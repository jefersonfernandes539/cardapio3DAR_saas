import { NextRequest, NextResponse } from "next/server";
import { Plan, prisma } from "@cardapio/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const VALID_PLANS = Object.values(Plan);

// Stand-in for what a Stripe checkout webhook would do (update
// Restaurant.plan on successful payment). No billing provider is wired up
// yet, so this lets a restaurant switch plans directly — replace with a
// webhook handler once Stripe is integrated.
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await request.json();
  if (!VALID_PLANS.includes(body?.plan)) {
    return NextResponse.json({ error: `plan deve ser um de: ${VALID_PLANS.join(", ")}` }, { status: 400 });
  }

  const restaurant = await prisma.restaurant.update({
    where: { id: session.user.restaurantId },
    data: { plan: body.plan as Plan },
  });

  return NextResponse.json({ plan: restaurant.plan });
}
