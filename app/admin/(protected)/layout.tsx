import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  // Conteos para badges en la barra lateral
  const [pendientesRes, prestamosRes, solicitudesRes] = await Promise.all([
    supabase
      .from("propuestas_publicas")
      .select("id", { count: "exact", head: true })
      .eq("estado", "nueva"),
    supabase
      .from("prestamos")
      .select("id", { count: "exact", head: true })
      .is("fecha_devolucion", null),
    supabase
      .from("solicitudes_prestamo")
      .select("id", { count: "exact", head: true })
      .eq("estado", "pendiente"),
  ]);

  const counts = {
    pendientes: pendientesRes.count ?? 0,
    prestamos: prestamosRes.count ?? 0,
    solicitudes: solicitudesRes.count ?? 0,
  };

  return (
    <div className="flex min-h-screen bg-cedar-50">
      <AdminSidebar counts={counts} userEmail={user.email ?? ""} />
      <main className="flex-1 min-w-0 p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
