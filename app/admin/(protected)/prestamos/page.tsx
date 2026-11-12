import { createClient } from "@/lib/supabase/server";
import { RegistroPrestamo } from "@/components/admin/RegistroPrestamo";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Préstamos · Admin" };

export default async function PrestamosPage() {
  const supabase = await createClient();
  const hoy = new Date().toISOString().split("T")[0];

  // Préstamos activos con join a materiales
  const { data: activos } = await supabase
    .from("prestamos")
    .select(`
      *,
      material:materiales(codigo, nombre, foto_completa_url)
    `)
    .is("fecha_devolucion", null)
    .order("fecha_regreso_esperada", { ascending: true });

  // Historial reciente (últimos 20 devueltos)
  const { data: historial } = await supabase
    .from("prestamos")
    .select(`
      *,
      material:materiales(codigo, nombre)
    `)
    .not("fecha_devolucion", "is", null)
    .order("fecha_devolucion", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-semibold text-ink">
        Préstamos
      </h1>

      {/* Préstamos activos */}
      <section>
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-cedar-500">
          Activos ({activos?.length ?? 0})
        </h2>

        {!activos || activos.length === 0 ? (
          <p className="text-sm text-cedar-500">No hay préstamos activos.</p>
        ) : (
          <div className="space-y-3">
            {activos.map((p) => {
              const vencido = p.fecha_regreso_esperada < hoy;
              return (
                <div
                  key={p.id}
                  className={`rounded-sm border p-4 ${
                    vencido ? "border-red-300 bg-red-50" : "border-cedar-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-ink text-sm">
                        {p.material?.codigo} · {p.material?.nombre}
                      </p>
                      <p className="text-sm text-cedar-700 mt-0.5">
                        {p.nombre_prestatario} — {p.correo_prestatario}
                      </p>
                      {p.carrera_semestre && (
                        <p className="text-xs text-cedar-500">{p.carrera_semestre}</p>
                      )}
                      <div className="mt-2 flex gap-4 text-xs text-cedar-500">
                        <span>Salida: {p.fecha_salida}</span>
                        <span
                          className={
                            vencido ? "font-semibold text-red-700" : ""
                          }
                        >
                          Regreso esperado: {p.fecha_regreso_esperada}
                          {vencido && " ⚠ VENCIDO"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-cedar-500">
                        Dejó identificación: {p.dejo_identificacion ? "Sí" : "No registrado"}
                      </p>
                    </div>
                    <RegistroPrestamo prestamoId={p.id} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Historial */}
      {historial && historial.length > 0 && (
        <section>
          <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-cedar-500">
            Historial reciente
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-cedar-200 text-left text-xs uppercase tracking-wide text-cedar-500">
                  <th className="pb-2 pr-4">Material</th>
                  <th className="pb-2 pr-4">Prestatario</th>
                  <th className="pb-2 pr-4">Salida</th>
                  <th className="pb-2 pr-4">Devolución</th>
                  <th className="pb-2">Estado muestra</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((p) => (
                  <tr key={p.id} className="border-b border-cedar-100">
                    <td className="py-2 pr-4 font-mono text-xs">{p.material?.codigo}</td>
                    <td className="py-2 pr-4">{p.nombre_prestatario}</td>
                    <td className="py-2 pr-4 text-cedar-500">{p.fecha_salida}</td>
                    <td className="py-2 pr-4 text-cedar-500">{p.fecha_devolucion}</td>
                    <td className="py-2 text-cedar-600">{p.estado_muestra || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
