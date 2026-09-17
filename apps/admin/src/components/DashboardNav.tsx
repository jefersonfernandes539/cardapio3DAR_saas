"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Eye, LayoutGrid, Tags, UtensilsCrossed } from "lucide-react";

const LINKS = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutGrid },
  { href: "/dashboard/categories", label: "Categorias", icon: Tags },
  { href: "/dashboard/dishes", label: "Pratos", icon: UtensilsCrossed },
  { href: "/dashboard/preview", label: "Preview do cardápio", icon: Eye },
  { href: "/dashboard/plano", label: "Plano", icon: CreditCard },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = href === "/dashboard" ? pathname === href : pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={
              "group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors " +
              (active ? "bg-brand-600 text-white shadow-glow" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900")
            }
          >
            <Icon
              className={active ? "h-4 w-4" : "h-4 w-4 text-gray-400 group-hover:text-gray-600"}
              strokeWidth={1.75}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
