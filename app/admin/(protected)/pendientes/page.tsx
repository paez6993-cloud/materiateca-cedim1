import { createClient } from "@/lib/supabase/server";
import { AprobadorPropuesta } from "@/components/admin/AprobadorPropuesta";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Propuestas pendientes · Admin" };

export default async function PendientesPage() {
  const supabase = await createClient();

  const { data: propuestas } = await supabase
    .from("propuestas_publicas")
    .select("*")
    .eq("estado", "nueva")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">
        Propuestas pendientes
      </h1>

      {!propuestas || propuestas.length === 0 ? (
        <div className="rounded-sm border border-cedar-200 bg-cedar-50 px-6 py-12 text-center text-cedar-500">
          No hay propuestas pendientes de revisar.
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-cedar-500">
            {propuestas.length} propuesta{propuestas.length !== 1 ? "s" : ""} en espera
          </p>
          {propuestas.map((p) => (
            <AprobadorPropuesta key={p.id} propuesta={p} />
          ))}
        </div>
      )}
    </div>
  );
}
