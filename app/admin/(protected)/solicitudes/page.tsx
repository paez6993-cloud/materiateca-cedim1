import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Solicitudes de préstamo · Admin" };

export default async function SolicitudesPage() {
  const supabase = await createClient();

  const { data: solicitudes } = await supabase
    .from("solicitudes_prestamo")
    .select(`*, material:materiales(codigo, nombre)`)
    .eq("estado", "pendiente")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">
        Solicitudes de préstamo
      </h1>
      <p className="text-sm text-cedar-600 mb-6">
        Estas solicitudes llegan cuando alguien hace clic en "Solicitar préstamo"
        desde la ficha de un material. El préstamo se confirma en persona: la
        persona debe pasar al taller y dejar una identificación.
      </p>

      {!solicitudes || solicitudes.length === 0 ? (
        <div className="rounded-sm border border-cedar-200 bg-cedar-50 px-6 py-10 text-center text-cedar-500">
          No hay solicitudes pendientes.
        </div>
      ) : (
        <div className="space-y-3">
          {solicitudes.map((s) => (
            <div
              key={s.id}
              className="rounded-sm border border-cedar-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-medium text-ink text-sm">
                    {s.material?.codigo} · {s.material?.nombre}
                  </p>
                  <p className="text-sm text-cedar-700">
                    {s.nombre} — {s.correo}
                  </p>
                  {s.carrera_semestre && (
                    <p className="text-xs text-cedar-500">{s.carrera_semestre}</p>
                  )}
                  {s.motivo && (
                    <p className="text-xs text-cedar-600">Motivo: {s.motivo}</p>
                  )}
                  <p className="text-xs text-cedar-400">
                    {new Date(s.created_at).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <SolicitudAcciones solicitudId={s.id} materialId={s.material_id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SolicitudAcciones({
  solicitudId,
  materialId,
}: {
  solicitudId: string;
  materialId: string;
}) {
  return (
    <div className="flex gap-2 flex-shrink-0">
      {/* Acción de registrar préstamo — se hace desde /admin/prestamos */}
      <a
        href="/admin/prestamos?nuevo=1"
        className="btn-primary py-1.5 text-xs"
      >
        Registrar préstamo
      </a>
      <form
        action={async () => {
          "use server";
          const { createClient: createServer } = await import(
            "@/lib/supabase/server"
          );
          const supabase = await createServer();
          await supabase
            .from("solicitudes_prestamo")
            .update({ estado: "rechazada" })
            .eq("id", solicitudId);
        }}
      >
        <button type="submit" className="btn-secondary py-1.5 text-xs">
          Descartar
        </button>
      </form>
    </div>
  );
}
