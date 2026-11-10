import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import * as XLSX from "xlsx";

function parseBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v.toLowerCase() === "sí" || v.toLowerCase() === "si";
  return false;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 });

  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

  let imported = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const nombre = String(row["Nombre"] ?? "").trim();
    if (!nombre) {
      errors.push(`Fila ${i + 2}: sin nombre, omitida`);
      continue;
    }

    const rawFamilia = String(row["Familia de fibra (natural_vegetal|natural_animal|artificial_regenerada|sintetica|mezcla)"] ?? "").trim();
    const familiasValidas = ["natural_vegetal", "natural_animal", "artificial_regenerada", "sintetica", "mezcla"];
    const familia = familiasValidas.includes(rawFamilia) ? rawFamilia : "mezcla";

    const { error } = await supabase.from("materiales").insert({
      nombre,
      familia_fibra: familia,
      composicion: String(row["Composición"] ?? "").trim() || null,
      composicion_fuente: String(row["Fuente composición"] ?? "").trim() || null,
      construccion: String(row["Construcción (tejido_plano|punto|no_tejido)"] ?? "").trim() || null,
      peso_categoria: String(row["Peso (ligero|medio|pesado)"] ?? "").trim() || null,
      gramaje: Number(row["Gramaje g/m²"]) || null,
      origen: String(row["Origen (nacional|importado)"] ?? "").trim() || null,
      proveedor_nombre: String(row["Proveedor"] ?? "").trim() || null,
      fabricante: String(row["Fabricante"] ?? "").trim() || null,
      productor_materia_prima: String(row["Productor materia prima"] ?? "").trim() || null,
      lugar_produccion: String(row["Lugar de producción"] ?? "").trim() || null,
      es_reciclado: parseBool(row["Reciclado (Sí|No)"]),
      certificacion: String(row["Certificación"] ?? "").trim() || null,
      es_textil_tradicional: parseBool(row["Textil tradicional (Sí|No)"]),
      desarrollado_en_cedim: parseBool(row["Desarrollado CEDIM (Sí|No)"]),
      usos_sugeridos: String(row["Usos sugeridos"] ?? "").trim() || null,
      donde_comprar: String(row["Dónde comprar"] ?? "").trim() || null,
      ubicacion_taller: String(row["Ubicación en taller"] ?? "").trim() || null,
      notas: String(row["Notas"] ?? "").trim() || null,
      estado_revision: "pendiente",
    });

    if (error) {
      errors.push(`Fila ${i + 2} (${nombre}): ${error.message}`);
    } else {
      imported++;
    }
  }

  return NextResponse.json({ imported, errors });
}
