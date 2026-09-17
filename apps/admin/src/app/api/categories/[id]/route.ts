import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@cardapio/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function assertOwnership(categoryId: string, restaurantId: string) {
  const category = await prisma.category.findFirst({ where: { id: categoryId, restaurantId } });
  return category;
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const existing = await assertOwnership(params.id, session.user.restaurantId);
  if (!existing) return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });

  const body = await request.json();
  const category = await prisma.category.update({
    where: { id: params.id },
    data: {
      name: typeof body.name === "string" ? body.name : undefined,
      order: typeof body.order === "number" ? body.order : undefined,
    },
  });

  return NextResponse.json(category);
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const existing = await assertOwnership(params.id, session.user.restaurantId);
  if (!existing) return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });

  // onDelete: Cascade on Dish.categoryId removes the category's dishes too.
  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
