"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface AdminSidebarProps {
  counts: { pendientes: number; prestamos: number; solicitudes: number };
  userEmail: string;
}

const NAV = [
  { href: "/admin", label: "Inicio", exact: true },
  { href: "/admin/pendientes", label: "Propuestas pendientes", badge: "pendientes" as const },
  { href: "/admin/materiales", label: "Materiales publicados" },
  { href: "/admin/prestamos", label: "Préstamos activos", badge: "prestamos" as const },
  { href: "/admin/solicitudes", label: "Solicitudes de préstamo", badge: "solicitudes" as const },
  { href: "/admin/datos-curiosos", label: "¿Sabías que…?" },
  { href: "/admin/proveedores", label: "Proveedores" },
  { href: "/admin/importar", label: "Importar / Exportar" },
];

export function AdminSidebar({ counts, userEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="hidden w-56 flex-shrink-0 flex-col border-r border-cedar-200 bg-white lg:flex">
      <div className="border-b border-cedar-200 px-4 py-4">
        <p className="font-display text-sm font-semibold text-ink">
          Materiateca
        </p>
        <p className="text-xs text-cedar-500 truncate">{userEmail}</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {NAV.map(({ href, label, badge, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href) && href !== "/admin";
          const count = badge ? counts[badge] : 0;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-cedar-100 font-medium text-ink"
                  : "text-cedar-700 hover:bg-cedar-50 hover:text-ink"
              }`}
            >
              {label}
              {count > 0 && (
                <span className="ml-2 rounded-full bg-ink px-2 py-0.5 text-xs text-cedar-50">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-cedar-200 p-4">
        <button
          onClick={handleLogout}
          className="w-full text-left text-xs text-cedar-500 hover:text-ink"
        >
          Cerrar sesión →
        </button>
      </div>
    </aside>
  );
}
