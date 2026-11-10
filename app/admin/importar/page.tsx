import type { Metadata } from "next";
import { ImportadorCSV } from "@/components/admin/ImportadorCSV";
import Link from "next/link";

export const metadata: Metadata = { title: "Importar / Exportar · Admin" };

export default function ImportarPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="font-display text-2xl font-semibold text-ink">
        Importar / Exportar
      </h1>

      {/* Exportar */}
      <section>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-cedar-500">
          Exportar catálogo
        </h2>
        <p className="mb-4 text-sm text-cedar-600">
          Descarga todos los materiales publicados en formato Excel o CSV.
        </p>
        <div className="flex gap-3">
          <a href="/api/materials/export?format=xlsx" className="btn-primary py-2 text-sm">
            Descargar Excel (.xlsx)
          </a>
          <a href="/api/materials/export?format=csv" className="btn-secondary py-2 text-sm">
            Descargar CSV
          </a>
        </div>
      </section>

      <div className="divider" />

      {/* Importar */}
      <section>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-cedar-500">
          Importar desde Excel / CSV
        </h2>

        <div className="mb-4 rounded-sm border border-cedar-200 bg-cedar-50 p-4 text-sm text-cedar-600 space-y-2">
          <p className="font-semibold text-ink">Instrucciones:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Descarga la plantilla de importación.</li>
            <li>Llena las filas con los materiales (una fila por material).</li>
            <li>Los campos que no conozcas déjalos vacíos; no inventes datos.</li>
            <li>Sube el archivo aquí. Los materiales quedarán como "pendiente" para tu revisión antes de publicarse.</li>
          </ol>
        </div>

        <div className="mb-4">
          <a href="/api/materials/template" className="btn-secondary py-2 text-sm">
            Descargar plantilla
          </a>
        </div>

        <ImportadorCSV />
      </section>
    </div>
  );
}
