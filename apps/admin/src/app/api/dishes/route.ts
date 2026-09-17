import { NextRequest, NextResponse } from "next/server";
import { prisma, getPlanLimits } from "@cardapio/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const categoryId = request.nextUrl.searchParams.get("categoryId") ?? undefined;

  const dishes = await prisma.dish.findMany({
    where: {
      category: { restaurantId: session.user.restaurantId },
      ...(categoryId ? { categoryId } : {}),
    },
    orderBy: [{ categoryId: "asc" }, { order: "asc" }],
    include: { category: true },
  });

  return NextResponse.json(dishes);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await request.json();
  if (!body?.name || !body?.categoryId || body?.price === undefined) {
    return NextResponse.json({ error: "name, categoryId e price são obrigatórios" }, { status: 400 });
  }

  // Never trust categoryId blindly: confirm it belongs to this restaurant.
  const category = await prisma.category.findFirst({
    where: { id: body.categoryId, restaurantId: session.user.restaurantId },
  });
  if (!category) return NextResponse.json({ error: "Categoria inválida" }, { status: 400 });

  const restaurant = await prisma.restaurant.findUniqueOrThrow({
    where: { id: session.user.restaurantId },
  });
  const limits = getPlanLimits(restaurant.plan);
  const wants3d = Boolean(body.model3dUrl || body.usdzUrl);

  const dishCount = await prisma.dish.count({
    where: { category: { restaurantId: session.user.restaurantId } },
  });
  if (limits.maxDishes !== null && dishCount >= limits.maxDishes) {
    return NextResponse.json(
      { error: `Seu plano permite no máximo ${limits.maxDishes} pratos. Faça upgrade para adicionar mais.` },
      { status: 403 },
    );
  }

  if (wants3d) {
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

  const dish = await prisma.dish.create({
    data: {
      name: body.name,
      description: body.description || null,
      price: body.price,
      imageUrl: body.imageUrl || null,
      model3dUrl: body.model3dUrl || null,
      usdzUrl: body.usdzUrl || null,
      available: body.available ?? true,
      categoryId: body.categoryId,
    },
  });

  return NextResponse.json(dish, { status: 201 });
}
