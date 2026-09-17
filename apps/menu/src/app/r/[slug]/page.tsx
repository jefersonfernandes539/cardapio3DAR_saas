import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRestaurantMenu } from "@/lib/getRestaurantMenu";
import { RestaurantMenuView } from "@/components/RestaurantMenuView";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const menu = await getRestaurantMenu(params.slug);
  return { title: menu ? `${menu.name} · Cardápio` : "Cardápio não encontrado" };
}

// Public, unauthenticated route: this is what the table's QR code points to.
export default async function RestaurantMenuPage({ params }: PageProps) {
  const menu = await getRestaurantMenu(params.slug);

  if (!menu) {
    notFound();
  }

  return <RestaurantMenuView menu={menu} />;
}
