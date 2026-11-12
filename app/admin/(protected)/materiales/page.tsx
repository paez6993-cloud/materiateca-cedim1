import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Materiales · Admin" };

export default async function MaterialesAdminPage() {
  const supabase = await createClient();

  const { data: materiales } = await supabase
    .from("materiales")
    .select("id, codigo, nombre, familia_fibra, estado_disponibilidad, estado_revision, foto_completa_url, created_at")
    .order("created_at", { ascending: false });

  const aprobados = materiales?.filter((m) => m.estado_revision === "aprobado") ?? [];
  const pendientes = materiales?.filter((m) => m.estado_revision === "pendiente") ?? [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Materiales
        </h1>
        <Link href="/admin/materiales/nuevo" className="btn-primary py-2 text-sm">
          + Agregar material
        </Link>
      </div>

      {/* Pendientes sin código (recién importados) */}
      {pendientes.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-cedar-500">
            Pendientes de revisar ({pendientes.length})
          </h2>
          <div className="space-y-2">
            {pendientes.map((m) => (
              <Link
                key={m.id}
                href={`/admin/materiales/${m.id}`}
                className="flex items-center gap-4 rounded-sm border border-cedar-200 bg-cedar-50 p-3 hover:bg-cedar-100"
              >
                <span className="font-mono text-xs text-cedar-500 w-28 flex-shrink-0">
                  —
                </span>
                <span className="text-sm text-ink flex-1">{m.nombre}</span>
                <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5">
                  Pendiente
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Aprobados */}
      <section>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-cedar-500">
          Publicados ({aprobados.length})
        </h2>
        {aprobados.length === 0 ? (
          <p className="text-sm text-cedar-500">
            Todavía no hay materiales publicados.
          </p>
        ) : (
          <div className="space-y-1">
            {aprobados.map((m) => (
              <Link
                key={m.id}
                href={`/admin/materiales/${m.id}`}
                className="flex items-center gap-4 rounded-sm border border-cedar-200 bg-white p-3 hover:bg-cedar-50"
              >
                <span className="font-mono text-xs text-cedar-500 w-28 flex-shrink-0">
                  {m.codigo}
                </span>
                <span className="text-sm text-ink flex-1">{m.nombre}</span>
                <StatusBadge estado={m.estado_disponibilidad} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
