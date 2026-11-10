import type { FamiliaFibra } from "@/types/database";
import { FAMILIA_ABBR } from "@/types/database";
import { createServiceClient } from "@/lib/supabase/server";

export async function asignarCodigo(materialId: string, familia: FamiliaFibra): Promise<string> {
  const supabase = createServiceClient();
  const abbr = FAMILIA_ABBR[familia];

  // Llama a la función SQL que incrementa el contador y devuelve el código
  const { data, error } = await supabase.rpc("generar_codigo_material", {
    familia_abbr: abbr,
  });

  if (error) throw new Error(`Error al generar código: ${error.message}`);

  const codigo = data as string;

  // Actualizar el material con el código asignado
  const { error: updateError } = await supabase
    .from("materiales")
    .update({ codigo })
    .eq("id", materialId);

  if (updateError) throw new Error(`Error al guardar código: ${updateError.message}`);

  return codigo;
}
