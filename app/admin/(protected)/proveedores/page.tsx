"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Proveedor = {
  id: string;
  nombre: string;
  contacto: string | null;
  correo: string | null;
  telefono: string | null;
  sitio_web: string | null;
  direccion: string | null;
  ciudad: string | null;
  notas: string | null;
};

const VACIO: Omit<Proveedor, "id"> = {
  nombre: "",
  contacto: null,
  correo: null,
  telefono: null,
  sitio_web: null,
  direccion: null,
  ciudad: null,
  notas: null,
};

export default function ProveedoresPage() {
  const supabase = createClient();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<string | null>(null); // id o "nuevo"
  const [form, setForm] = useState<Omit<Proveedor, "id">>(VACIO);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  async function cargar() {
    const { data } = await supabase
      .from("proveedores")
      .select("*")
      .order("nombre");
    setProveedores(data ?? []);
    setLoading(false);
  }

  useEffect(() => { cargar(); }, []);

  function abrirNuevo() {
    setForm(VACIO);
    setEditando("nuevo");
    setMsg(null);
  }

  function abrirEditar(p: Proveedor) {
    setForm({
      nombre: p.nombre,
      contacto: p.contacto,
      correo: p.correo,
      telefono: p.telefono,
      sitio_web: p.sitio_web,
      direccion: p.direccion,
      ciudad: p.ciudad,
      notas: p.notas,
    });
    setEditando(p.id);
    setMsg(null);
  }

  function cancelar() {
    setEditando(null);
    setForm(VACIO);
    setMsg(null);
  }

  function campo(key: keyof typeof form, label: string, placeholder?: string) {
    return (
      <div>
        <label className="field-label">{label}</label>
        <input
          type="text"
          value={form[key] ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value || null }))}
          placeholder={placeholder}
          className="field-input"
        />
      </div>
    );
  }

  async function guardar() {
    if (!form.nombre.trim()) {
      setMsg({ type: "error", text: "El nombre es obligatorio." });
      return;
    }
    setSaving(true);
    setMsg(null);

    if (editando === "nuevo") {
      const { error } = await supabase.from("proveedores").insert(form);
      if (error) {
        setMsg({ type: "error", text: "Error al guardar: " + error.message });
      } else {
        setMsg({ type: "ok", text: "Proveedor agregado." });
        cancelar();
        cargar();
      }
    } else {
      const { error } = await supabase
        .from("proveedores")
        .update(form)
        .eq("id", editando!);
      if (error) {
        setMsg({ type: "error", text: "Error al guardar: " + error.message });
      } else {
        setMsg({ type: "ok", text: "Cambios guardados." });
        cancelar();
        cargar();
      }
    }
    setSaving(false);
  }

  async function eliminar(id: string) {
    const { error } = await supabase.from("proveedores").delete().eq("id", id);
    if (error) {
      setMsg({ type: "error", text: "Error al eliminar: " + error.message });
    } else {
      setConfirmDelete(null);
      cargar();
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Proveedores</h1>
        {editando === null && (
          <button onClick={abrirNuevo} className="btn-primary py-2 text-sm">
            + Agregar proveedor
          </button>
        )}
      </div>

      {/* Mensaje global */}
      {msg && editando === null && (
        <div className={`px-4 py-3 text-sm border ${msg.type === "ok"
          ? "border-green-200 bg-green-50 text-green-800"
          : "border-red-200 bg-red-50 text-red-700"}`}>
          {msg.text}
        </div>
      )}

      {/* Formulario nuevo / editar */}
      {editando !== null && (
        <div className="border border-cedar-300 bg-cedar-50 p-5 space-y-4">
          <h2 className="text-sm font-medium text-ink">
            {editando === "nuevo" ? "Nuevo proveedor" : "Editar proveedor"}
          </h2>

          {msg && (
            <div className={`px-4 py-3 text-sm border ${msg.type === "ok"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-700"}`}>
              {msg.text}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {campo("nombre", "Nombre *", "Ej. Distribuidora Textil SA")}
            {campo("contacto", "Persona de contacto", "Nombre de quien atiende")}
            {campo("correo", "Correo", "ventas@ejemplo.com")}
            {campo("telefono", "Teléfono", "+52 55 1234 5678")}
            {campo("sitio_web", "Sitio web", "https://ejemplo.com")}
            {campo("ciudad", "Ciudad", "CDMX, Guadalajara…")}
          </div>
          <div>
            <label className="field-label">Dirección</label>
            <input
              type="text"
              value={form.direccion ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, direccion: e.target.value || null }))}
              placeholder="Calle, colonia, CP"
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label">Notas</label>
            <textarea
              value={form.notas ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value || null }))}
              rows={2}
              className="field-input resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button onClick={guardar} disabled={saving} className="btn-primary">
              {saving ? "Guardando…" : "Guardar"}
            </button>
            <button onClick={cancelar} className="text-sm text-cedar-600 border border-cedar-300 px-4 py-2 hover:bg-cedar-100">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <p className="text-sm text-cedar-500">Cargando…</p>
      ) : proveedores.length === 0 ? (
        <div className="rounded-sm border border-cedar-200 bg-cedar-50 px-6 py-12 text-center text-cedar-500 text-sm">
          Todavía no hay proveedores registrados.
        </div>
      ) : (
        <div className="space-y-2">
          {proveedores.map((p) => (
            <div key={p.id} className="border border-cedar-200 bg-white p-4 space-y-2">
              {confirmDelete === p.id ? (
                <div className="space-y-2">
                  <p className="text-sm text-red-700">
                    ¿Eliminar <strong>{p.nombre}</strong>?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => eliminar(p.id)}
                      className="text-sm bg-red-600 text-white px-3 py-1 hover:bg-red-700"
                    >
                      Eliminar
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="text-sm text-cedar-600"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-sm text-ink">{p.nombre}</p>
                      {p.ciudad && <p className="text-xs text-cedar-500">{p.ciudad}</p>}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => abrirEditar(p)}
                        className="text-xs text-cedar-600 border border-cedar-200 px-3 py-1 hover:bg-cedar-50"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setConfirmDelete(p.id)}
                        className="text-xs text-red-500 border border-red-200 px-3 py-1 hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-cedar-500">
                    {p.contacto && <span>{p.contacto}</span>}
                    {p.correo && <a href={`mailto:${p.correo}`} className="hover:text-ink">{p.correo}</a>}
                    {p.telefono && <a href={`tel:${p.telefono}`} className="hover:text-ink">{p.telefono}</a>}
                    {p.sitio_web && (
                      <a href={p.sitio_web} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
                        {p.sitio_web.replace(/^https?:\/\//, "")}
                      </a>
                    )}
                  </div>
                  {p.direccion && <p className="text-xs text-cedar-400">{p.direccion}</p>}
                  {p.notas && <p className="text-xs text-cedar-400 italic">{p.notas}</p>}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
