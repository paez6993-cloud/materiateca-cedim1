import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Panel · Admin" };

export default async function AdminHomePage() {
  const supabase = await createClient();

  const [matRes, prestRes, pendRes] = await Promise.all([
    supabase
      .from("materiales")
      .select("id", { count: "exact", head: true })
      .eq("estado_revision", "aprobado"),
    supabase
      .from("prestamos")
      .select("id", { count: "exact", head: true })
      .is("fecha_devolucion", null),
    supabase
      .from("propuestas_publicas")
      .select("id", { count: "exact", head: true })
      .eq("estado", "nueva"),
  ]);

  // Préstamos vencidos (fecha_regreso_esperada < hoy, sin devolver)
  const hoy = new Date().toISOString().split("T")[0];
  const { count: vencidos } = await supabase
    .from("prestamos")
    .select("id", { count: "exact", head: true })
    .is("fecha_devolucion", null)
    .lt("fecha_regreso_esperada", hoy);

  const stats = [
    {
      label: "Materiales publicados",
      value: matRes.count ?? 0,
      href: "/admin/materiales",
      color: "bg-cedar-100",
    },
    {
      label: "Préstamos activos",
      value: prestRes.count ?? 0,
      href: "/admin/prestamos",
      color: "bg-amber-50",
    },
    {
      label: "Préstamos vencidos",
      value: vencidos ?? 0,
      href: "/admin/prestamos",
      color: vencidos ? "bg-red-50 border border-red-200" : "bg-cedar-50",
    },
    {
      label: "Propuestas por revisar",
      value: pendRes.count ?? 0,
      href: "/admin/pendientes",
      color: pendRes.count ? "bg-blue-50 border border-blue-200" : "bg-cedar-50",
    },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">
        Panel de administración
      </h1>

      <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={`flex flex-col gap-1 rounded-sm p-4 transition-opacity hover:opacity-80 ${s.color}`}
          >
            <span className="text-3xl font-semibold text-ink">{s.value}</span>
            <span className="text-xs text-cedar-600">{s.label}</span>
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-widest text-cedar-500">
          Acciones rápidas
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/materiales?nuevo=1" className="btn-primary text-sm py-2">
            + Agregar material
          </Link>
          <Link href="/admin/pendientes" className="btn-secondary text-sm py-2">
            Revisar propuestas
          </Link>
          <Link href="/admin/prestamos?nuevo=1" className="btn-secondary text-sm py-2">
            Registrar préstamo
          </Link>
        </div>
      </div>
    </div>
  );
}
