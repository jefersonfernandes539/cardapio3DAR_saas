"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Visão geral" },
  { href: "/dashboard/categories", label: "Categorias" },
  { href: "/dashboard/dishes", label: "Pratos" },
  { href: "/dashboard/preview", label: "Preview do cardápio" },
  { href: "/dashboard/plano", label: "Plano" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {LINKS.map((link) => {
        const active = link.href === "/dashboard" ? pathname === link.href : pathname?.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
              (active ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-gray-100")
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
