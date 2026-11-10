import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const format = req.nextUrl.searchParams.get("format") ?? "xlsx";

  const { data: materiales } = await supabase
    .from("materiales")
    .select("*")
    .eq("estado_revision", "aprobado")
    .order("codigo");

  if (!materiales) return NextResponse.json({ error: "Sin datos" }, { status: 500 });

  // Transformar a filas legibles
  const rows = materiales.map((m) => ({
    Código: m.codigo ?? "",
    Nombre: m.nombre,
    "Familia de fibra": m.familia_fibra ?? "",
    Composición: m.composicion ?? "",
    "Fuente composición": m.composicion_fuente ?? "",
    Construcción: m.construccion ?? "",
    Peso: m.peso_categoria ?? "",
    "Gramaje (g/m²)": m.gramaje ?? "",
    Origen: m.origen ?? "",
    Proveedor: m.proveedor_nombre ?? "",
    Fabricante: m.fabricante ?? "",
    "Productor materia prima": m.productor_materia_prima ?? "",
    "Lugar de producción": m.lugar_produccion ?? "",
    Reciclado: m.es_reciclado ? "Sí" : "No",
    Certificación: m.certificacion ?? "",
    "Textil tradicional": m.es_textil_tradicional ? "Sí" : "No",
    "Desarrollado CEDIM": m.desarrollado_en_cedim ? "Sí" : "No",
    "Usos sugeridos": m.usos_sugeridos ?? "",
    "Dónde comprar": m.donde_comprar ?? "",
    "Ubicación taller": m.ubicacion_taller ?? "",
    Estado: m.estado_disponibilidad,
    Notas: m.notas ?? "",
    "Fecha aprobación": m.aprobado_at ? m.aprobado_at.split("T")[0] : "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Materiales");

  if (format === "csv") {
    const csv = XLSX.utils.sheet_to_csv(ws);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=materiateca-cedim.csv",
      },
    });
  }

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=materiateca-cedim.xlsx",
    },
  });
}
