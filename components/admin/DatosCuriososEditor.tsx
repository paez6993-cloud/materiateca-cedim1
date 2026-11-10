"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { DatoCurioso } from "@/types/database";

export function DatosCuriososEditor({ datos }: { datos: DatoCurioso[] }) {
  const [nuevoTexto, setNuevoTexto] = useState("");
  const [nuevaFuente, setNuevaFuente] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function agregar() {
    if (!nuevoTexto.trim()) return;
    setSaving(true);
    await supabase.from("datos_curiosos").insert({
      texto: nuevoTexto.trim(),
      fuente: nuevaFuente.trim() || null,
      activo: true,
      orden: datos.length,
    });
    setNuevoTexto("");
    setNuevaFuente("");
    setSaving(false);
    router.refresh();
  }

  async function toggleActivo(id: string, activo: boolean) {
    await supabase.from("datos_curiosos").update({ activo: !activo }).eq("id", id);
    router.refresh();
  }

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar este dato curioso?")) return;
    await supabase.from("datos_curiosos").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Lista existente */}
      {datos.length === 0 ? (
        <p className="text-sm text-cedar-500">No hay datos curiosos todavía.</p>
      ) : (
        <div className="space-y-3">
          {datos.map((d) => (
            <div
              key={d.id}
              className={`flex items-start gap-3 rounded-sm border p-4 ${
                d.activo ? "border-cedar-200 bg-white" : "border-cedar-200 bg-cedar-50 opacity-60"
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink">{d.texto}</p>
                {d.fuente && (
                  <p className="mt-1 text-xs text-cedar-500">Fuente: {d.fuente}</p>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleActivo(d.id, d.activo)}
                  className={`text-xs px-2 py-1 border ${
                    d.activo
                      ? "border-cedar-300 text-cedar-600 hover:bg-cedar-100"
                      : "border-green-300 text-green-700 hover:bg-green-50"
                  }`}
                >
                  {d.activo ? "Desactivar" : "Activar"}
                </button>
                <button
                  onClick={() => eliminar(d.id)}
                  className="text-xs px-2 py-1 border border-red-200 text-red-600 hover:bg-red-50"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulario nuevo */}
      <div className="rounded-sm border border-cedar-200 bg-cedar-50 p-4 space-y-3">
        <p className="text-xs font-medium uppercase tracking-widest text-cedar-500">
          Agregar nuevo dato curioso
        </p>
        <textarea
          value={nuevoTexto}
          onChange={(e) => setNuevoTexto(e.target.value)}
          rows={3}
          placeholder="Escribe el dato curioso…"
          className="field-input resize-none"
        />
        <input
          value={nuevaFuente}
          onChange={(e) => setNuevaFuente(e.target.value)}
          placeholder="Fuente (opcional)"
          className="field-input"
        />
        <button
          onClick={agregar}
          disabled={saving || !nuevoTexto.trim()}
          className="btn-primary py-2 text-sm"
        >
          {saving ? "Guardando…" : "Agregar"}
        </button>
      </div>
    </div>
  );
}
