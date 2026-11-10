import { createClient } from "@/lib/supabase/server";
import { DatosCuriososEditor } from "@/components/admin/DatosCuriososEditor";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "¿Sabías que...? · Admin" };

export default async function DatosCuriososPage() {
  const supabase = await createClient();
  const { data: datos } = await supabase
    .from("datos_curiosos")
    .select("*")
    .order("orden", { ascending: true });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-2">
        ¿Sabías que…?
      </h1>
      <p className="text-sm text-cedar-500 mb-6">
        Estos datos rotan en la página de inicio. Aparece uno diferente cada día.
      </p>
      <DatosCuriososEditor datos={datos || []} />
    </div>
  );
}
