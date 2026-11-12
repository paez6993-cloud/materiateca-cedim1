"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";

const ESTADOS_DISPONIBILIDAD = [
  { value: "disponible", label: "Disponible" },
  { value: "prestada", label: "Prestada" },
  { value: "solo_consulta", label: "Solo consulta" },
  { value: "agotada", label: "Agotada" },
];

const ESTADOS_REVISION = [
  { value: "aprobado", label: "Aprobado (visible en catálogo)" },
  { value: "pendiente", label: "Pendiente de revisar" },
  { value: "rechazado", label: "Rechazado" },
];

export default function EditarMaterialPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [material, setMaterial] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const [estadoDisp, setEstadoDisp] = useState("");
  const [estadoRev, setEstadoRev] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [notas, setNotas] = useState("");

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("materiales")
        .select("*")
        .eq("id", id)
        .single();
      if (data) {
        setMaterial(data);
        setEstadoDisp(data.estado_disponibilidad);
        setEstadoRev(data.estado_revision);
        setUbicacion(data.ubicacion_taller ?? "");
        setNotas(data.notas ?? "");
      }
      setLoading(false);
    }
    fetch();
  }, [id]);

  async function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg(null);

    const ext = file.name.split(".").pop();
    const path = `${material.codigo || id}/completa.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("materiales-fotos")
      .upload(path, file, { upsert: true });

    if (upErr) {
      setMsg({ type: "error", text: "Error subiendo la foto: " + upErr.message });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("materiales-fotos")
      .getPublicUrl(path);

    const { error: dbErr } = await supabase
      .from("materiales")
      .update({ foto_completa_url: urlData.publicUrl })
      .eq("id", id);

    if (dbErr) {
      setMsg({ type: "error", text: "Foto subida pero error al guardar URL." });
    } else {
      setMaterial((m: any) => ({ ...m, foto_completa_url: urlData.publicUrl }));
      setMsg({ type: "ok", text: "Foto actualizada." });
    }
    setUploading(false);
  }

  async function handleGuardar() {
    setSaving(true);
    setMsg(null);
    const { error } = await supabase
      .from("materiales")
      .update({
        estado_disponibilidad: estadoDisp,
        estado_revision: estadoRev,
        ubicacion_taller: ubicacion || null,
        notas: notas || null,
      })
      .eq("id", id);

    setMsg(error
      ? { type: "error", text: "Error al guardar: " + error.message }
      : { type: "ok", text: "Cambios guardados." }
    );
    setSaving(false);
  }

  async function handleEliminar() {
    setDeleting(true);
    // Borrar propuestas vinculadas primero (FK constraint)
    const { error: propErr } = await supabase
      .from("propuestas_publicas")
      .delete()
      .eq("material_id", id);
    if (propErr) {
      setMsg({ type: "error", text: "Error al limpiar propuestas: " + propErr.message });
      setDeleting(false);
      return;
    }
    const { data: deleted, error } = await supabase
      .from("materiales")
      .delete()
      .eq("id", id)
      .select();
    if (error) {
      setMsg({ type: "error", text: "Error: " + error.message });
      setDeleting(false);
    } else if (!deleted || deleted.length === 0) {
      setMsg({ type: "error", text: "No se pudo eliminar. Verifica permisos en Supabase." });
      setDeleting(false);
    } else {
      router.push("/admin/materiales");
    }
  }

  if (loading) return <p className="text-cedar-500 text-sm">Cargando…</p>;
  if (!material) return <p className="text-red-600 text-sm">Material no encontrado.</p>;

  return (
    <div className="max-w-2xl space-y-8">
      {/* Encabezado */}
      <div>
        <Link href="/admin/materiales" className="text-xs text-cedar-500 hover:text-ink">
          ← Materiales
        </Link>
        <h1 className="font-display text-2xl font-semibold text-ink mt-2">
          {material.nombre}
        </h1>
        {material.codigo && (
          <p className="font-mono text-sm text-cedar-400 mt-0.5">{material.codigo}</p>
        )}
      </div>

      {/* Mensaje */}
      {msg && (
        <div className={`px-4 py-3 text-sm border ${msg.type === "ok"
          ? "border-green-200 bg-green-50 text-green-800"
          : "border-red-200 bg-red-50 text-red-700"}`}>
          {msg.text}
        </div>
      )}

      {/* Foto */}
      <section className="border border-cedar-200 p-5 space-y-4">
        <h2 className="text-xs font-medium uppercase tracking-widest text-cedar-500">Fotografía</h2>
        {material.foto_completa_url ? (
          <div className="relative aspect-square w-40 overflow-hidden bg-cedar-100">
            <Image src={material.foto_completa_url} alt={material.nombre} fill className="object-cover" />
          </div>
        ) : (
          <div className="w-40 h-40 bg-cedar-100 flex items-center justify-center text-cedar-400 text-xs">
            Sin foto
          </div>
        )}
        <label className="block">
          <span className="btn-secondary text-sm cursor-pointer">
            {uploading ? "Subiendo…" : material.foto_completa_url ? "Cambiar foto" : "Subir foto"}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFoto}
            disabled={uploading}
          />
        </label>
        <p className="text-xs text-cedar-400">JPG, PNG o WebP · máx 5 MB</p>
      </section>

      {/* Estado y datos */}
      <section className="border border-cedar-200 p-5 space-y-5">
        <h2 className="text-xs font-medium uppercase tracking-widest text-cedar-500">Estado</h2>

        <div>
          <label className="field-label">Disponibilidad</label>
          <select
            value={estadoDisp}
            onChange={(e) => setEstadoDisp(e.target.value)}
            className="field-input"
          >
            {ESTADOS_DISPONIBILIDAD.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label">Estado en el catálogo</label>
          <select
            value={estadoRev}
            onChange={(e) => setEstadoRev(e.target.value)}
            className="field-input"
          >
            {ESTADOS_REVISION.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label">Ubicación en taller</label>
          <input
            type="text"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            placeholder="Ej. Estante A, cajón 3"
            className="field-input"
          />
        </div>

        <div>
          <label className="field-label">Notas internas</label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={3}
            className="field-input resize-none"
          />
        </div>

        <button
          onClick={handleGuardar}
          disabled={saving}
          className="btn-primary w-full"
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </section>

      {/* Ver en catálogo */}
      {material.codigo && material.estado_revision === "aprobado" && (
        <Link
          href={`/material/${material.codigo}`}
          target="_blank"
          className="block text-center text-sm text-cedar-600 hover:text-ink border border-cedar-200 py-2"
        >
          Ver en el catálogo →
        </Link>
      )}

      {/* Eliminar */}
      <section className="border border-red-200 p-5 space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-widest text-red-500">Zona de peligro</h2>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-sm text-red-600 border border-red-300 px-4 py-2 hover:bg-red-50"
          >
            Eliminar este material
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-red-700">
              ¿Segura? Esto eliminará permanentemente <strong>{material.nombre}</strong> y no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleEliminar}
                disabled={deleting}
                className="text-sm bg-red-600 text-white px-4 py-2 hover:bg-red-700"
              >
                {deleting ? "Eliminando…" : "Sí, eliminar"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-sm text-cedar-600 border border-cedar-300 px-4 py-2 hover:bg-cedar-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
