import { NextRequest, NextResponse } from "next/server";
import { prisma, getPlanLimits } from "@cardapio/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function findOwnedDish(dishId: string, restaurantId: string) {
  return prisma.dish.findFirst({
    where: { id: dishId, category: { restaurantId } },
    include: { category: true },
  });
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const dish = await findOwnedDish(params.id, session.user.restaurantId);
  if (!dish) return NextResponse.json({ error: "Prato não encontrado" }, { status: 404 });

  return NextResponse.json(dish);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const existing = await findOwnedDish(params.id, session.user.restaurantId);
  if (!existing) return NextResponse.json({ error: "Prato não encontrado" }, { status: 404 });

  const body = await request.json();

  if (body.categoryId && body.categoryId !== existing.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: body.categoryId, restaurantId: session.user.restaurantId },
    });
    if (!category) return NextResponse.json({ error: "Categoria inválida" }, { status: 400 });
  }

  const hadModel = Boolean(existing.model3dUrl || existing.usdzUrl);
  const willHaveModel = Boolean(
    ("model3dUrl" in body ? body.model3dUrl : existing.model3dUrl) ||
      ("usdzUrl" in body ? body.usdzUrl : existing.usdzUrl),
  );

  if (willHaveModel && !hadModel) {
    const restaurant = await prisma.restaurant.findUniqueOrThrow({
      where: { id: session.user.restaurantId },
    });
    const limits = getPlanLimits(restaurant.plan);

    if (limits.max3dDishes === 0) {
      return NextResponse.json(
        { error: "Seu plano não inclui pratos com modelo 3D/AR. Faça upgrade para desbloquear." },
        { status: 403 },
      );
    }
    if (limits.max3dDishes !== null) {
      const dishes3dCount = await prisma.dish.count({
        where: {
          category: { restaurantId: session.user.restaurantId },
          OR: [{ model3dUrl: { not: null } }, { usdzUrl: { not: null } }],
        },
      });
      if (dishes3dCount >= limits.max3dDishes) {
        return NextResponse.json(
          { error: `Seu plano permite no máximo ${limits.max3dDishes} pratos com modelo 3D/AR.` },
          { status: 403 },
        );
      }
    }
  }

  const dish = await prisma.dish.update({
    where: { id: params.id },
    data: {
      name: body.name ?? undefined,
      description: body.description ?? undefined,
      price: body.price ?? undefined,
      imageUrl: body.imageUrl ?? undefined,
      model3dUrl: "model3dUrl" in body ? body.model3dUrl : undefined,
      usdzUrl: "usdzUrl" in body ? body.usdzUrl : undefined,
      available: typeof body.available === "boolean" ? body.available : undefined,
      categoryId: body.categoryId ?? undefined,
    },
  });

  return NextResponse.json(dish);
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const existing = await findOwnedDish(params.id, session.user.restaurantId);
  if (!existing) return NextResponse.json({ error: "Prato não encontrado" }, { status: 404 });

  await prisma.dish.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
