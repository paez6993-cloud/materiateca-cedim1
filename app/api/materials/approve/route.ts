import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { asignarCodigo } from "@/lib/utils/codes";
import type { FamiliaFibra } from "@/types/database";

export async function POST(req: NextRequest) {
  // Verificar que el usuario esté autenticado
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { propuesta_id } = await req.json();
  if (!propuesta_id) {
    return NextResponse.json({ error: "propuesta_id requerido" }, { status: 400 });
  }

  const service = createServiceClient();

  // Obtener la propuesta
  const { data: propuesta, error: propErr } = await service
    .from("propuestas_publicas")
    .select("*")
    .eq("id", propuesta_id)
    .eq("estado", "nueva")
    .single();

  if (propErr || !propuesta) {
    return NextResponse.json(
      { error: "Propuesta no encontrada" },
      { status: 404 }
    );
  }

  // Crear el material a partir de la propuesta
  const { data: material, error: matErr } = await service
    .from("materiales")
    .insert({
      nombre: propuesta.nombre_material,
      familia_fibra: (propuesta.familia_fibra as FamiliaFibra) || "mezcla",
      composicion: propuesta.composicion,
      construccion: propuesta.construccion,
      origen: propuesta.origen,
      proveedor_nombre: propuesta.proveedor_nombre,
      notas: propuesta.notas,
      propuesto_por_nombre: propuesta.nombre_proponente,
      propuesto_por_correo: propuesta.correo_proponente,
      estado_revision: "aprobado",
      aprobado_por: user.id,
      aprobado_at: new Date().toISOString(),
    })
    .select("id, familia_fibra")
    .single();

  if (matErr || !material) {
    return NextResponse.json(
      { error: "Error al crear material: " + matErr?.message },
      { status: 500 }
    );
  }

  // Asignar código automático
  try {
    await asignarCodigo(material.id, material.familia_fibra as FamiliaFibra);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Material creado pero error al asignar código: " + err.message },
      { status: 500 }
    );
  }

  // Marcar propuesta como convertida
  await service
    .from("propuestas_publicas")
    .update({ estado: "convertida", material_id: material.id })
    .eq("id", propuesta_id);

  return NextResponse.json({ ok: true, material_id: material.id });
}
