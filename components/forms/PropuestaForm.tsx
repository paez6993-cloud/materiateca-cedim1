"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FAMILIA_LABELS, CONSTRUCCION_LABELS } from "@/types/database";

const schema = z.object({
  nombre_material: z.string().min(2, "El nombre del material es requerido"),
  familia_fibra: z.string().optional(),
  composicion: z.string().optional(),
  construccion: z.string().optional(),
  origen: z.string().optional(),
  nombre_proponente: z.string().optional(),
  correo_proponente: z.string().email("Correo inválido").optional().or(z.literal("")),
  carrera: z.string().optional(),
  semestre: z.string().optional(),
  proveedor_nombre: z.string().optional(),
  proveedor_contacto: z.string().optional(),
  notas: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function PropuestaForm() {
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setError(null);
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Error al enviar la propuesta");
      }
      setEnviado(true);
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (enviado) {
    return (
      <div className="rounded-sm border border-green-200 bg-green-50 px-6 py-8 text-center">
        <p className="text-2xl mb-2">✓</p>
        <h2 className="font-display text-xl font-semibold text-green-900 mb-2">
          Propuesta enviada
        </h2>
        <p className="text-sm text-green-700">
          Recuerda llevar la muestra física (mínimo 15 × 15 cm) al taller y
          avisarle a Ivette. Cuando la revise, la muestra aparecerá en el
          catálogo.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* Nombre */}
      <div>
        <label className="field-label">
          Nombre del material <span className="text-cedar-400">(requerido)</span>
        </label>
        <input
          {...register("nombre_material")}
          className="field-input"
          placeholder="ej. Lino crudo sin blanquear"
        />
        {errors.nombre_material && (
          <p className="mt-1 text-xs text-red-600">{errors.nombre_material.message}</p>
        )}
      </div>

      {/* Familia */}
      <div>
        <label className="field-label">Familia de fibra</label>
        <select {...register("familia_fibra")} className="field-input">
          <option value="">— No sé / No identificado —</option>
          {Object.entries(FAMILIA_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Composición */}
      <div>
        <label className="field-label">Composición</label>
        <input
          {...register("composicion")}
          className="field-input"
          placeholder="ej. 100% lino, 60% algodón 40% poliéster…"
        />
      </div>

      {/* Construcción */}
      <div>
        <label className="field-label">Construcción</label>
        <select {...register("construccion")} className="field-input">
          <option value="">— No sé / No identificado —</option>
          {Object.entries(CONSTRUCCION_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Origen */}
      <div>
        <label className="field-label">Origen</label>
        <select {...register("origen")} className="field-input">
          <option value="">— No sé / No identificado —</option>
          <option value="nacional">Nacional</option>
          <option value="importado">Importado</option>
        </select>
      </div>

      {/* Proveedor */}
      <div className="space-y-3 rounded-sm border border-cedar-200 p-4">
        <p className="text-xs font-medium uppercase tracking-widest text-cedar-500">
          Proveedor (si lo conoces)
        </p>
        <input
          {...register("proveedor_nombre")}
          className="field-input"
          placeholder="Nombre del proveedor o tienda"
        />
        <input
          {...register("proveedor_contacto")}
          className="field-input"
          placeholder="Correo, teléfono o URL"
        />
      </div>

      {/* Notas */}
      <div>
        <label className="field-label">Notas adicionales</label>
        <textarea
          {...register("notas")}
          rows={3}
          className="field-input resize-none"
          placeholder="Cualquier información adicional sobre el material…"
        />
      </div>

      <div className="divider" />

      {/* Datos del proponente */}
      <p className="text-xs font-medium uppercase tracking-widest text-cedar-500">
        Tus datos (opcionales, para que Ivette te contacte)
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label">Nombre</label>
          <input {...register("nombre_proponente")} className="field-input" />
        </div>
        <div>
          <label className="field-label">Correo</label>
          <input
            {...register("correo_proponente")}
            type="email"
            className="field-input"
          />
          {errors.correo_proponente && (
            <p className="mt-1 text-xs text-red-600">{errors.correo_proponente.message}</p>
          )}
        </div>
        <div>
          <label className="field-label">Carrera</label>
          <input {...register("carrera")} className="field-input" />
        </div>
        <div>
          <label className="field-label">Semestre</label>
          <input {...register("semestre")} className="field-input" />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3">
          {error}
        </p>
      )}

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? "Enviando…" : "Enviar propuesta"}
      </button>
    </form>
  );
}
