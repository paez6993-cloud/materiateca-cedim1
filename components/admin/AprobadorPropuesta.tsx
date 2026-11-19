"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FAMILIA_LABELS, CONSTRUCCION_LABELS } from "@/types/database";
import type { PropuestaPublica } from "@/types/database";

export function AprobadorPropuesta({ propuesta }: { propuesta: PropuestaPublica }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const router = useRouter();

  function onFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setFotoFile(file);
    if (file) {
      setFotoPreview(URL.createObjectURL(file));
    } else {
      setFotoPreview(null);
    }
  }

  async function aprobar() {
    setLoading(true);
    let foto_url: string | null = null;

    if (fotoFile) {
      const fd = new FormData();
      fd.append("file", fotoFile);
      const upRes = await fetch("/api/upload-foto", { method: "POST", body: fd });
      if (!upRes.ok) {
        const err = await upRes.json();
        alert("Error al subir la foto: " + (err.error || "intenta de nuevo"));
        setLoading(false);
        return;
      }
      const { url } = await upRes.json();
      foto_url = url;
    }

    const res = await fetch("/api/materials/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propuesta_id: propuesta.id, foto_url }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      alert("Error al aprobar. Intenta de nuevo.");
      setLoading(false);
    }
  }

  async function rechazar() {
    if (!motivo.trim()) {
      alert("Escribe un motivo de rechazo.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("propuestas_publicas")
      .update({ estado: "descartada" })
      .eq("id", propuesta.id);
    router.refresh();
  }

  return (
    <div className="rounded-sm border border-cedar-200 bg-white">
      {/* Cabecera */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start justify-between gap-4 p-4 text-left"
      >
        <div>
          <p className="font-medium text-ink">{propuesta.nombre_material}</p>
          <p className="mt-0.5 text-xs text-cedar-500">
            {propuesta.nombre_proponente || "Anónimo"} ·{" "}
            {new Date(propuesta.created_at).toLocaleDateString("es-MX", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <span className="text-cedar-400 text-sm mt-0.5">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="border-t border-cedar-200 p-4 space-y-4">
          {/* Datos de la propuesta */}
          <div className="grid gap-2 text-sm">
            {[
              {
                label: "Familia",
                value: propuesta.familia_fibra
                  ? FAMILIA_LABELS[propuesta.familia_fibra as keyof typeof FAMILIA_LABELS] ?? propuesta.familia_fibra
                  : null,
              },
              { label: "Composición", value: propuesta.composicion },
              {
                label: "Construcción",
                value: propuesta.construccion
                  ? CONSTRUCCION_LABELS[propuesta.construccion as keyof typeof CONSTRUCCION_LABELS] ?? propuesta.construccion
                  : null,
              },
              { label: "Origen", value: propuesta.origen },
              { label: "Proveedor", value: propuesta.proveedor_nombre },
              { label: "Contacto proveedor", value: propuesta.proveedor_contacto },
              { label: "Notas", value: propuesta.notas },
              { label: "Carrera / semestre", value: [propuesta.carrera, propuesta.semestre].filter(Boolean).join(" · ") },
              { label: "Correo proponente", value: propuesta.correo_proponente },
            ]
              .filter((row) => row.value)
              .map(({ label, value }) => (
                <div key={label} className="flex gap-3">
                  <span className="w-36 flex-shrink-0 text-cedar-500">{label}:</span>
                  <span className="text-ink">{value}</span>
                </div>
              ))}
          </div>

          {/* Foto para aprobar */}
          <div className="pt-2 border-t border-cedar-200 space-y-2">
            <p className="text-xs font-medium uppercase tracking-widest text-cedar-500">
              Foto del material (opcional)
            </p>
            {fotoPreview && (
              <img src={fotoPreview} alt="Vista previa" className="max-h-40 w-auto border border-cedar-200" />
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 border border-cedar-300 bg-white px-3 py-2 text-xs text-cedar-700 hover:bg-cedar-50">
              {fotoFile ? `✓ ${fotoFile.name}` : "Seleccionar foto"}
              <input type="file" accept="image/*" className="hidden" onChange={onFotoChange} />
            </label>
            {fotoFile && (
              <button type="button" onClick={() => { setFotoFile(null); setFotoPreview(null); }} className="ml-2 text-xs text-cedar-500 hover:text-red-600">
                × Quitar
              </button>
            )}
          </div>

          {/* Acciones */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={aprobar}
              disabled={loading}
              className="btn-primary py-2 text-sm"
            >
              {loading ? "Aprobando…" : "✓ Aprobar y publicar"}
            </button>

            <div className="flex flex-1 gap-2 items-center">
              <input
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Motivo de rechazo…"
                className="field-input flex-1 py-2 text-sm"
              />
              <button
                onClick={rechazar}
                disabled={loading}
                className="btn-danger py-2 text-sm"
              >
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
