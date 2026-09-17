import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Public, CC0 sample glTF model (grilled skewer) hosted by Google's
// <model-viewer> project. Used here to validate the 3D pipeline (store ->
// <model-viewer> -> interactive 3D) with a dish-appropriate model without
// shipping real restaurant assets. Swap for an actual dish scan before going
// live. Note: this asset has no matching .usdz, so the AR Quick Look handoff
// on iOS isn't available for it (interactive 3D still works everywhere) —
// see README "Como funciona o fluxo 3D/AR" for what a real per-dish
// glb+usdz pair enables.
const SAMPLE_GLB = "https://modelviewer.dev/shared-assets/models/shishkebab.glb";

// Real photo (not a placeholder), CC BY-SA 4.0 by Darubrub via Wikimedia
// Commons: https://commons.wikimedia.org/wiki/File:GrilledPicanha.jpg
const PICANHA_PHOTO = "https://upload.wikimedia.org/wikipedia/commons/e/ef/GrilledPicanha.jpg";

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  const restaurant = await prisma.restaurant.upsert({
    where: { slug: "sabor-brasil" },
    update: { plan: "PRO" },
    create: {
      name: "Sabor Brasil",
      slug: "sabor-brasil",
      themeColor: "#EA580C",
      logoUrl: null,
      // PRO so the seeded 3D dish (below) is within plan limits — FREE caps
      // 3D dishes at 0. See packages/db/src/plans.ts.
      plan: "PRO",
    },
  });

  await prisma.user.upsert({
    where: { email: "dono@saborbrasil.com" },
    update: {},
    create: {
      email: "dono@saborbrasil.com",
      passwordHash,
      name: "Dono do Sabor Brasil",
      role: "OWNER",
      restaurantId: restaurant.id,
    },
  });

  const categories = [
    { key: "entradas", name: "Entradas", order: 0 },
    { key: "principais", name: "Pratos Principais", order: 1 },
    { key: "sobremesas", name: "Sobremesas", order: 2 },
    { key: "bebidas", name: "Bebidas", order: 3 },
  ] as const;

  const categoryIds: Record<string, string> = {};
  for (const c of categories) {
    const existing = await prisma.category.findFirst({
      where: { restaurantId: restaurant.id, name: c.name },
    });
    const category =
      existing ??
      (await prisma.category.create({
        data: { name: c.name, order: c.order, restaurantId: restaurant.id },
      }));
    categoryIds[c.key] = category.id;
  }

  const dishes = [
    {
      name: "Bolinho de Bacalhau",
      description: "Bolinhos crocantes de bacalhau desfiado com batata e ervas frescas.",
      price: 32.9,
      imageUrl: "https://picsum.photos/seed/bolinho-bacalhau/800/600",
      categoryId: categoryIds.entradas,
      order: 0,
    },
    {
      name: "Bruschetta Caprese",
      description: "Pão italiano tostado, tomate, muçarela de búfala, manjericão e azeite.",
      price: 24.5,
      imageUrl: "https://picsum.photos/seed/bruschetta-caprese/800/600",
      categoryId: categoryIds.entradas,
      order: 1,
    },
    {
      name: "Picanha na Brasa",
      description:
        "Picanha grelhada no ponto, acompanhada de farofa, vinagrete e arroz branco. Visualize em 3D/AR antes de pedir!",
      price: 89.9,
      imageUrl: PICANHA_PHOTO,
      model3dUrl: SAMPLE_GLB,
      usdzUrl: null,
      categoryId: categoryIds.principais,
      order: 0,
    },
    {
      name: "Risoto de Funghi",
      description: "Arroz arbóreo cremoso com mix de cogumelos frescos e parmesão.",
      price: 54.9,
      imageUrl: "https://picsum.photos/seed/risoto-funghi/800/600",
      categoryId: categoryIds.principais,
      order: 1,
    },
    {
      name: "Petit Gateau",
      description: "Bolo de chocolate quente com recheio cremoso e sorvete de creme.",
      price: 28.0,
      imageUrl: "https://picsum.photos/seed/petit-gateau/800/600",
      categoryId: categoryIds.sobremesas,
      order: 0,
    },
    {
      name: "Caipirinha",
      description: "Cachaça, limão, açúcar e gelo — o clássico brasileiro.",
      price: 22.0,
      imageUrl: "https://picsum.photos/seed/caipirinha/800/600",
      categoryId: categoryIds.bebidas,
      order: 0,
    },
  ];

  for (const dish of dishes) {
    const existing = await prisma.dish.findFirst({
      where: { categoryId: dish.categoryId, name: dish.name },
    });
    if (existing) {
      await prisma.dish.update({ where: { id: existing.id }, data: dish });
    } else {
      await prisma.dish.create({ data: dish });
    }
  }

  console.log("Seed concluído.");
  console.log(`  Restaurante: /r/${restaurant.slug}`);
  console.log("  Login admin: dono@saborbrasil.com / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
