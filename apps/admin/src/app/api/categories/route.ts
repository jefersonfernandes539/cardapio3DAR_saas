import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@cardapio/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const categories = await prisma.category.findMany({
    where: { restaurantId: session.user.restaurantId },
    orderBy: { order: "asc" },
    include: { _count: { select: { dishes: true } } },
  });
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await request.json();
  if (!body?.name || typeof body.name !== "string") {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  const lastCategory = await prisma.category.findFirst({
    where: { restaurantId: session.user.restaurantId },
    orderBy: { order: "desc" },
  });

  const category = await prisma.category.create({
    data: {
      name: body.name,
      order: (lastCategory?.order ?? -1) + 1,
      restaurantId: session.user.restaurantId,
    },
  });

  return NextResponse.json(category, { status: 201 });
}
