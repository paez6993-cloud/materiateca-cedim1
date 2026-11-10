import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

const HEADERS = [
  "Nombre",
  "Familia de fibra (natural_vegetal|natural_animal|artificial_regenerada|sintetica|mezcla)",
  "Composición",
  "Fuente composición",
  "Construcción (tejido_plano|punto|no_tejido)",
  "Peso (ligero|medio|pesado)",
  "Gramaje g/m²",
  "Origen (nacional|importado)",
  "Proveedor",
  "Fabricante",
  "Productor materia prima",
  "Lugar de producción",
  "Reciclado (Sí|No)",
  "Certificación",
  "Textil tradicional (Sí|No)",
  "Desarrollado CEDIM (Sí|No)",
  "Usos sugeridos",
  "Dónde comprar",
  "Ubicación en taller",
  "Notas",
];

export async function GET() {
  const ws = XLSX.utils.aoa_to_sheet([HEADERS, []]);
  // Ajustar anchos de columna
  ws["!cols"] = HEADERS.map(() => ({ wch: 20 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Plantilla");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        "attachment; filename=plantilla-importacion-materiateca.xlsx",
    },
  });
}
